import { Prisma, type PrismaClient } from '@prisma/client';
import type { components } from '@snote/contracts';
import { DomainError } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import type { GroupLifecycle } from './group-lifecycle';

type GroupCreate = components['schemas']['GroupCreate'];
type WorkspaceSchema = components['schemas']['Workspace'];
type MembershipSchema = components['schemas']['Membership'];
type InvitationSchema = components['schemas']['Invitation'];
type JoinRequestSchema = components['schemas']['JoinRequest'];
type OwnershipTransferSchema = components['schemas']['OwnershipTransfer'];

export class WorkspaceService {
  constructor(
    private readonly db: PrismaClient,
    private readonly groupLifecycle?: GroupLifecycle,
  ) {}

  async listWorkspaces(actorId: string): Promise<WorkspaceSchema[]> {
    const list = await this.db.workspace.findMany({
      where: {
        OR: [
          { ownerId: actorId },
          { id: { in: (await this.db.workspaceMembership.findMany({ where: { accountId: actorId, status: 'active' }, select: { workspaceId: true } })).map(m => m.workspaceId) } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(w => ({
      id: w.id,
      name: w.name,
      classId: w.classId ?? undefined,
      ownerId: w.ownerId ?? undefined,
      kind: w.kind as WorkspaceSchema['kind'],
      status: w.status as WorkspaceSchema['status'],
      timeZone: w.timeZone,
      version: w.version,
    }));
  }

  async getWorkspace(actorId: string, workspaceId: string): Promise<WorkspaceSchema> {
    const w = await this.db.workspace.findUnique({ where: { id: workspaceId } });
    if (!w) throw new DomainError('NOT_FOUND', 404);
    if (w.ownerId !== actorId) {
      const isMember = await this.db.workspaceMembership.findFirst({
        where: { workspaceId, accountId: actorId, status: 'active' },
      });
      if (!isMember) {
        if (w.classId) {
          const isClassMember = await this.db.classMembership.findFirst({
            where: { classId: w.classId, accountId: actorId, status: 'active' },
          });
          const isClassOwner = await this.db.class.findFirst({
            where: { id: w.classId, ownerId: actorId },
          });
          if (!isClassMember && !isClassOwner) throw new DomainError('NOT_FOUND', 404);
        } else {
          throw new DomainError('NOT_FOUND', 404);
        }
      }
    }
    return {
      id: w.id,
      name: w.name,
      classId: w.classId ?? undefined,
      ownerId: w.ownerId ?? undefined,
      kind: w.kind as WorkspaceSchema['kind'],
      status: w.status as WorkspaceSchema['status'],
      timeZone: w.timeZone,
      version: w.version,
    };
  }

  async createWorkspace(actorId: string, input: GroupCreate): Promise<WorkspaceSchema> {
    if (!input.name || !input.name.trim()) throw new DomainError('INVALID_INPUT', 422);

    const user = await this.db.account.findUnique({ where: { id: actorId } });
    const timeZone = user?.timeZone ?? 'UTC';

    return this.db.$transaction(async tx => {
      const ws = await tx.workspace.create({
        data: {
          name: input.name.trim(),
          kind: 'independent',
          ownerId: actorId,
          timeZone,
          status: 'active',
        },
      });

      await tx.workspaceMembership.create({
        data: {
          workspaceId: ws.id,
          accountId: actorId,
          role: 'leader',
          status: 'active',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: ws.id, action: 'workspace.create', targetId: ws.id },
      });

      return {
        id: ws.id,
        name: ws.name,
        kind: 'independent',
        ownerId: ws.ownerId ?? undefined,
        status: 'active',
        timeZone: ws.timeZone,
        version: ws.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async listClassGroups(actorId: string, classId: string): Promise<WorkspaceSchema[]> {
    const isOwner = await this.db.class.findFirst({ where: { id: classId, ownerId: actorId } });
    const isMember = await this.db.classMembership.findFirst({ where: { classId, accountId: actorId, status: 'active' } });
    if (!isOwner && !isMember) throw new DomainError('FORBIDDEN', 403);

    const groups = await this.db.workspace.findMany({
      where: { classId, kind: 'class_group' },
      orderBy: { createdAt: 'asc' },
    });
    return groups.map(w => ({
      id: w.id,
      name: w.name,
      classId: w.classId ?? undefined,
      ownerId: w.ownerId ?? undefined,
      kind: 'class_group',
      status: w.status as WorkspaceSchema['status'],
      timeZone: w.timeZone,
      version: w.version,
    }));
  }

  async createClassGroup(actorId: string, classId: string, input: GroupCreate): Promise<WorkspaceSchema> {
    if (!input.name || !input.name.trim()) throw new DomainError('INVALID_INPUT', 422);

    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls) throw new DomainError('NOT_FOUND', 404);
      if (cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const isClassMember = await tx.classMembership.findFirst({
        where: { classId, accountId: actorId, status: 'active' },
      });
      if (!isClassMember && cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);

      const leaderId = input.leaderId ?? actorId;
      if (leaderId !== cls.ownerId) {
        const leaderMember = await tx.classMembership.findFirst({
          where: { classId, accountId: leaderId, status: 'active' },
        });
        if (!leaderMember) throw new DomainError('FORBIDDEN', 403);

        const classGroups = await tx.workspace.findMany({
          where: { classId, kind: 'class_group', status: 'active' },
          select: { id: true },
        });
        const currentActiveGroups = await tx.workspaceMembership.count({
          where: {
            accountId: leaderId,
            status: 'active',
            workspaceId: { in: classGroups.map(g => g.id) },
          },
        });
        if (currentActiveGroups >= cls.groupLimit) throw new DomainError('GROUP_LIMIT', 409);
      }

      const ws = await tx.workspace.create({
        data: {
          name: input.name.trim(),
          kind: 'class_group',
          classId,
          timeZone: cls.timeZone,
          status: 'active',
        },
      });

      await tx.workspaceMembership.create({
        data: {
          workspaceId: ws.id,
          accountId: leaderId,
          role: 'leader',
          status: 'active',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: ws.id, action: 'group.create', targetId: ws.id },
      });

      return {
        id: ws.id,
        name: ws.name,
        classId: ws.classId ?? undefined,
        kind: 'class_group',
        status: 'active',
        timeZone: ws.timeZone,
        version: ws.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async listWorkspaceMembers(actorId: string, workspaceId: string): Promise<MembershipSchema[]> {
    await this.getWorkspace(actorId, workspaceId);
    const members = await this.db.workspaceMembership.findMany({
      where: { workspaceId, status: 'active' },
      orderBy: { createdAt: 'asc' },
    });
    return members.map(m => ({
      id: m.id,
      workspaceId: m.workspaceId,
      memberId: m.accountId,
      role: m.role as 'member' | 'leader',
      status: m.status as MembershipSchema['status'],
      version: m.version,
    }));
  }

  async changeGroupLeader(actorId: string, groupId: string, leaderId: string, ifMatch: string): Promise<MembershipSchema> {
    return this.db.$transaction(async tx => {
      const group = await tx.workspace.findUnique({ where: { id: groupId } });
      if (!group) throw new DomainError('NOT_FOUND', 404);
      if (group.status !== 'active') throw new DomainError('ARCHIVED', 409);

      if (group.classId) {
        await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${group.classId}::uuid FOR UPDATE`;
        const cls = await tx.class.findUnique({ where: { id: group.classId } });
        if (!cls) throw new DomainError('NOT_FOUND', 404);
        if (cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

        const isCurrentLeader = await tx.workspaceMembership.findFirst({
          where: { workspaceId: groupId, accountId: actorId, role: 'leader', status: 'active' },
        });
        if (!isCurrentLeader && cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      } else {
        if (group.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      }

      const target = await tx.workspaceMembership.findFirst({
        where: { workspaceId: groupId, accountId: leaderId, status: 'active' },
      });
      if (!target) throw new DomainError('NOT_FOUND', 404);
      requireVersion(target.version, ifMatch);

      // Downgrade existing leader(s)
      await tx.workspaceMembership.updateMany({
        where: { workspaceId: groupId, role: 'leader', status: 'active' },
        data: { role: 'member' },
      });

      const updated = await tx.workspaceMembership.update({
        where: { id: target.id },
        data: { role: 'leader', version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: groupId, action: 'group.leader_change', targetId: target.id },
      });

      return {
        id: updated.id,
        workspaceId: updated.workspaceId,
        memberId: updated.accountId,
        role: 'leader',
        status: updated.status as MembershipSchema['status'],
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async createGroupInvitation(actorId: string, groupId: string, inviteeId: string): Promise<InvitationSchema> {
    return this.db.$transaction(async tx => {
      const group = await tx.workspace.findUnique({ where: { id: groupId } });
      if (!group || !group.classId) throw new DomainError('NOT_FOUND', 404);
      if (group.status !== 'active') throw new DomainError('ARCHIVED', 409);

      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${group.classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: group.classId } });
      if (!cls || cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const inviteeMember = await tx.classMembership.findFirst({
        where: { classId: group.classId, accountId: inviteeId, status: 'active' },
      });
      if (!inviteeMember) throw new DomainError('FORBIDDEN', 403);

      const alreadyInGroup = await tx.workspaceMembership.findFirst({
        where: { workspaceId: groupId, accountId: inviteeId, status: 'active' },
      });
      if (alreadyInGroup) throw new DomainError('CONFLICT', 409);

      const inv = await tx.invitation.create({
        data: {
          targetType: 'workspace',
          targetId: groupId,
          initiatorId: actorId,
          recipientId: inviteeId,
          status: 'pending',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: groupId, action: 'group.invite', targetId: inv.id },
      });

      return {
        id: inv.id,
        targetType: 'workspace',
        targetId: groupId,
        initiatorId: actorId,
        recipientId: inviteeId,
        status: 'pending',
        version: inv.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async createGroupJoinRequest(actorId: string, groupId: string): Promise<JoinRequestSchema> {
    return this.db.$transaction(async tx => {
      const group = await tx.workspace.findUnique({ where: { id: groupId } });
      if (!group || !group.classId) throw new DomainError('NOT_FOUND', 404);
      if (group.status !== 'active') throw new DomainError('ARCHIVED', 409);

      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${group.classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: group.classId } });
      if (!cls || cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const isClassMember = await tx.classMembership.findFirst({
        where: { classId: group.classId, accountId: actorId, status: 'active' },
      });
      if (!isClassMember) throw new DomainError('FORBIDDEN', 403);

      const alreadyInGroup = await tx.workspaceMembership.findFirst({
        where: { workspaceId: groupId, accountId: actorId, status: 'active' },
      });
      if (alreadyInGroup) throw new DomainError('CONFLICT', 409);

      const req = await tx.joinRequest.create({
        data: {
          targetType: 'workspace',
          targetId: groupId,
          initiatorId: actorId,
          status: 'pending',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: groupId, action: 'group.join_request', targetId: req.id },
      });

      return {
        id: req.id,
        targetType: 'workspace',
        targetId: groupId,
        initiatorId: actorId,
        status: 'pending',
        version: req.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async listGroupJoinRequests(actorId: string, groupId: string): Promise<JoinRequestSchema[]> {
    const group = await this.db.workspace.findUnique({ where: { id: groupId } });
    if (!group) throw new DomainError('NOT_FOUND', 404);

    const requests = await this.db.joinRequest.findMany({
      where: { targetType: 'workspace', targetId: groupId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(r => ({
      id: r.id,
      targetType: 'workspace',
      targetId: r.targetId,
      initiatorId: r.initiatorId,
      status: r.status as JoinRequestSchema['status'],
      version: r.version,
    }));
  }

  async declineGroupInvitation(actorId: string, invitationId: string, ifMatch?: string): Promise<InvitationSchema> {
    return this.db.$transaction(async tx => {
      const inv = await tx.invitation.findUnique({ where: { id: invitationId } });
      if (!inv || inv.recipientId !== actorId) throw new DomainError('NOT_FOUND', 404);
      requireVersion(inv.version, ifMatch);

      const updated = await tx.invitation.update({
        where: { id: invitationId },
        data: { status: 'declined', version: { increment: 1 } },
      });
      return {
        id: updated.id,
        targetType: 'workspace',
        targetId: updated.targetId,
        initiatorId: updated.initiatorId,
        recipientId: updated.recipientId,
        status: 'declined',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async declineGroupJoinRequest(actorId: string, requestId: string, ifMatch?: string): Promise<JoinRequestSchema> {
    return this.db.$transaction(async tx => {
      const req = await tx.joinRequest.findUnique({ where: { id: requestId } });
      if (!req || req.targetType !== 'workspace') throw new DomainError('NOT_FOUND', 404);
      requireVersion(req.version, ifMatch);

      const updated = await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: 'declined', version: { increment: 1 } },
      });
      return {
        id: updated.id,
        targetType: 'workspace',
        targetId: updated.targetId,
        initiatorId: updated.initiatorId,
        status: 'declined',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async leaveGroup(actorId: string, groupId: string, handoverTo?: string, ifMatch?: string): Promise<MembershipSchema> {
    return this.db.$transaction(async tx => {
      const membership = await tx.workspaceMembership.findFirst({
        where: { workspaceId: groupId, accountId: actorId, status: 'active' },
      });
      if (!membership) throw new DomainError('NOT_FOUND', 404);
      requireVersion(membership.version, ifMatch);

      if (membership.role === 'leader') {
        if (!handoverTo) throw new DomainError('FORBIDDEN', 403);
        const nextLeader = await tx.workspaceMembership.findFirst({
          where: { workspaceId: groupId, accountId: handoverTo, status: 'active' },
        });
        if (!nextLeader) throw new DomainError('INVALID_INPUT', 422);

        await tx.workspaceMembership.update({
          where: { id: nextLeader.id },
          data: { role: 'leader', version: { increment: 1 } },
        });
      }

      const updated = await tx.workspaceMembership.update({
        where: { id: membership.id },
        data: { status: 'ended', version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: groupId, action: 'group.leave', targetId: groupId },
      });

      return {
        id: updated.id,
        workspaceId: updated.workspaceId,
        memberId: updated.accountId,
        role: updated.role as 'member' | 'leader',
        status: 'ended',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async removeGroupMember(actorId: string, groupId: string, memberId: string, handoverTo?: string, ifMatch?: string): Promise<MembershipSchema> {
    return this.db.$transaction(async tx => {
      const target = await tx.workspaceMembership.findFirst({
        where: { workspaceId: groupId, accountId: memberId, status: 'active' },
      });
      if (!target) throw new DomainError('NOT_FOUND', 404);
      requireVersion(target.version, ifMatch);

      if (target.role === 'leader') {
        if (!handoverTo) throw new DomainError('FORBIDDEN', 403);
        const nextLeader = await tx.workspaceMembership.findFirst({
          where: { workspaceId: groupId, accountId: handoverTo, status: 'active' },
        });
        if (!nextLeader) throw new DomainError('INVALID_INPUT', 422);

        await tx.workspaceMembership.update({
          where: { id: nextLeader.id },
          data: { role: 'leader', version: { increment: 1 } },
        });
      }

      const updated = await tx.workspaceMembership.update({
        where: { id: target.id },
        data: { status: 'ended', version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: groupId, action: 'group.remove_member', targetId: memberId },
      });

      return {
        id: updated.id,
        workspaceId: updated.workspaceId,
        memberId: updated.accountId,
        role: updated.role as 'member' | 'leader',
        status: 'ended',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async createWorkspaceInvitation(actorId: string, workspaceId: string, inviteeId: string): Promise<InvitationSchema> {
    return this.db.$transaction(async tx => {
      const ws = await tx.workspace.findUnique({ where: { id: workspaceId } });
      if (!ws) throw new DomainError('NOT_FOUND', 404);
      if (ws.kind === 'default') throw new DomainError('FORBIDDEN', 403); // default workspace cannot be shared (STR-01)
      if (ws.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const inv = await tx.invitation.create({
        data: {
          targetType: 'workspace',
          targetId: workspaceId,
          initiatorId: actorId,
          recipientId: inviteeId,
          status: 'pending',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'workspace', scopeId: workspaceId, action: 'workspace.invite', targetId: inv.id },
      });

      return {
        id: inv.id,
        targetType: 'workspace',
        targetId: workspaceId,
        initiatorId: actorId,
        recipientId: inviteeId,
        status: 'pending',
        version: inv.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async archiveWorkspace(actorId: string, workspaceId: string, ifMatch: string): Promise<WorkspaceSchema> {
    const ws = await this.db.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new DomainError('NOT_FOUND', 404);
    if (ws.kind === 'default') throw new DomainError('FORBIDDEN', 403);

    if (ws.kind === 'class_group' && this.groupLifecycle) {
      const res = await this.groupLifecycle.setArchived(actorId, workspaceId, true);
      return {
        id: res.id,
        name: res.name,
        classId: res.classId ?? undefined,
        ownerId: res.ownerId ?? undefined,
        kind: 'class_group',
        status: 'archived',
        timeZone: res.timeZone,
        version: res.version,
      };
    }

    return this.db.$transaction(async tx => {
      if (ws.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      requireVersion(ws.version, ifMatch);

      const res = await tx.workspace.update({
        where: { id: workspaceId },
        data: { status: 'archived', version: { increment: 1 } },
      });
      return {
        id: res.id,
        name: res.name,
        classId: res.classId ?? undefined,
        ownerId: res.ownerId ?? undefined,
        kind: res.kind as WorkspaceSchema['kind'],
        status: 'archived',
        timeZone: res.timeZone,
        version: res.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async restoreWorkspace(actorId: string, workspaceId: string, ifMatch: string): Promise<WorkspaceSchema> {
    const ws = await this.db.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new DomainError('NOT_FOUND', 404);
    if (ws.kind === 'default') throw new DomainError('FORBIDDEN', 403);

    if (ws.kind === 'class_group' && this.groupLifecycle) {
      const res = await this.groupLifecycle.setArchived(actorId, workspaceId, false);
      return {
        id: res.id,
        name: res.name,
        classId: res.classId ?? undefined,
        ownerId: res.ownerId ?? undefined,
        kind: 'class_group',
        status: 'active',
        timeZone: res.timeZone,
        version: res.version,
      };
    }

    return this.db.$transaction(async tx => {
      if (ws.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      requireVersion(ws.version, ifMatch);

      const res = await tx.workspace.update({
        where: { id: workspaceId },
        data: { status: 'active', version: { increment: 1 } },
      });
      return {
        id: res.id,
        name: res.name,
        classId: res.classId ?? undefined,
        ownerId: res.ownerId ?? undefined,
        kind: res.kind as WorkspaceSchema['kind'],
        status: 'active',
        timeZone: res.timeZone,
        version: res.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async createWorkspaceTransfer(actorId: string, workspaceId: string, recipientId: string): Promise<OwnershipTransferSchema> {
    return this.db.$transaction(async tx => {
      const ws = await tx.workspace.findUnique({ where: { id: workspaceId } });
      if (!ws) throw new DomainError('NOT_FOUND', 404);
      if (ws.kind === 'default') throw new DomainError('FORBIDDEN', 403);
      if (ws.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      if (ws.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const req = await tx.transferRequest.create({
        data: {
          targetType: 'workspace',
          targetId: workspaceId,
          initiatorId: actorId,
          recipientId,
          status: 'pending',
        },
      });

      return {
        id: req.id,
        targetType: 'workspace',
        targetId: workspaceId,
        initiatorId: actorId,
        recipientId,
        status: 'pending',
        version: req.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async acceptTransfer(actorId: string, transferId: string, ifMatch: string): Promise<OwnershipTransferSchema> {
    return this.db.$transaction(async tx => {
      const transfer = await tx.transferRequest.findUnique({ where: { id: transferId } });
      if (!transfer || transfer.recipientId !== actorId) throw new DomainError('NOT_FOUND', 404);
      if (transfer.status !== 'pending') throw new DomainError('INVALID_INPUT', 422);
      requireVersion(transfer.version, ifMatch);

      if (transfer.targetType === 'class') {
        await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${transfer.targetId}::uuid FOR UPDATE`;
        const cls = await tx.class.findUnique({ where: { id: transfer.targetId } });
        if (!cls || cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

        const hasTeacher = await tx.accountUsage.findUnique({
          where: { accountId_usage: { accountId: actorId, usage: 'teacher' } },
        });
        if (!hasTeacher) throw new DomainError('FORBIDDEN', 403);

        await tx.class.update({
          where: { id: transfer.targetId },
          data: { ownerId: actorId, version: { increment: 1 } },
        });
      } else {
        await tx.$queryRaw`SELECT "id" FROM "Workspace" WHERE "id" = ${transfer.targetId}::uuid FOR UPDATE`;
        const ws = await tx.workspace.findUnique({ where: { id: transfer.targetId } });
        if (!ws || ws.status !== 'active') throw new DomainError('ARCHIVED', 409);

        await tx.workspace.update({
          where: { id: transfer.targetId },
          data: { ownerId: actorId, version: { increment: 1 } },
        });
      }

      const updated = await tx.transferRequest.update({
        where: { id: transferId },
        data: { status: 'accepted', acceptedAt: new Date(), version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: transfer.targetType, scopeId: transfer.targetId, action: 'transfer.accept', targetId: transferId },
      });

      return {
        id: updated.id,
        targetType: updated.targetType as 'class' | 'workspace',
        targetId: updated.targetId,
        initiatorId: updated.initiatorId,
        recipientId: updated.recipientId,
        status: 'accepted',
        acceptedAt: updated.acceptedAt?.toISOString(),
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }
}
