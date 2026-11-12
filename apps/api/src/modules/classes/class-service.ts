import { randomBytes } from 'node:crypto';
import { Prisma, type PrismaClient } from '@prisma/client';
import type { components } from '@snote/contracts';
import { DomainError } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import type { AdmissionService } from './admission';

type ClassCreate = components['schemas']['ClassCreate'];
type ClassSchema = components['schemas']['Class'];
type MembershipSchema = components['schemas']['Membership'];
type InvitationSchema = components['schemas']['Invitation'];
type JoinRequestSchema = components['schemas']['JoinRequest'];
type PolicySchema = components['schemas']['Policy'];
type JoinCodeStateSchema = components['schemas']['JoinCodeState'];
type OwnershipTransferSchema = components['schemas']['OwnershipTransfer'];

export class ClassService {
  constructor(
    private readonly db: PrismaClient,
    private readonly admissionService?: AdmissionService,
  ) {}

  async create(actorId: string, input: ClassCreate): Promise<ClassSchema> {
    if (typeof input.name !== 'string' || !input.name.trim() || typeof input.timeZone !== 'string' || !input.timeZone) {
      throw new DomainError('INVALID_INPUT', 422);
    }
    try {
      new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format();
    } catch {
      throw new DomainError('INVALID_INPUT', 422);
    }
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Account" WHERE "id" = ${actorId}::uuid FOR UPDATE`;
      const teacherUsage = await tx.accountUsage.findUnique({
        where: { accountId_usage: { accountId: actorId, usage: 'teacher' } },
      });
      if (!teacherUsage) {
        throw new DomainError('FORBIDDEN', 403);
      }
      const cls = await tx.class.create({
        data: {
          name: input.name.trim(),
          timeZone: input.timeZone,
          ownerId: actorId,
          status: 'active',
        },
      });
      await tx.classPolicy.create({
        data: {
          classId: cls.id,
          defaults: { groupLimit: 1, roleActions: {}, lateFirst: 'allow', lateRevision: 'allow' },
        },
      });
      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: cls.id, action: 'class.create', targetId: cls.id },
      });
      return {
        id: cls.id,
        name: cls.name,
        ownerId: cls.ownerId,
        timeZone: cls.timeZone,
        status: cls.status as 'active' | 'archived',
        version: cls.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async list(actorId: string): Promise<ClassSchema[]> {
    const classes = await this.db.class.findMany({
      where: {
        OR: [
          { ownerId: actorId },
          { memberships: { some: { accountId: actorId, status: 'active' } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return classes.map(c => ({
      id: c.id,
      name: c.name,
      ownerId: c.ownerId,
      timeZone: c.timeZone,
      status: c.status as 'active' | 'archived',
      version: c.version,
    }));
  }

  async get(actorId: string, classId: string): Promise<ClassSchema> {
    const cls = await this.db.class.findUnique({
      where: { id: classId },
      include: { memberships: { where: { accountId: actorId, status: 'active' } } },
    });
    if (!cls || (cls.ownerId !== actorId && (!cls.memberships || cls.memberships.length === 0))) {
      throw new DomainError('NOT_FOUND', 404);
    }
    return {
      id: cls.id,
      name: cls.name,
      ownerId: cls.ownerId,
      timeZone: cls.timeZone,
      status: cls.status as 'active' | 'archived',
      version: cls.version,
    };
  }

  async setArchived(actorId: string, classId: string, archived: boolean, ifMatch?: string): Promise<ClassSchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('NOT_FOUND', 404);
      requireVersion(cls.version, ifMatch);
      const status = archived ? 'archived' : 'active';
      if (cls.status === status) {
        return {
          id: cls.id,
          name: cls.name,
          ownerId: cls.ownerId,
          timeZone: cls.timeZone,
          status: cls.status as 'active' | 'archived',
          version: cls.version,
        };
      }
      if (archived) {
        const groups = await tx.workspace.findMany({ where: { classId }, select: { id: true } });
        const targets = [{ targetType: 'class', targetId: classId }, { targetType: 'workspace', targetId: { in: groups.map(g => g.id) } }];
        await tx.invitation.updateMany({ where: { status: 'pending', OR: targets }, data: { status: 'invalidated' } });
      }
      const result = await tx.class.update({ where: { id: classId }, data: { status, version: { increment: 1 } } });
      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: classId, action: archived ? 'class.archive' : 'class.restore', targetId: classId },
      });
      return {
        id: result.id,
        name: result.name,
        ownerId: result.ownerId,
        timeZone: result.timeZone,
        status: result.status as 'active' | 'archived',
        version: result.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async listMembers(actorId: string, classId: string): Promise<MembershipSchema[]> {
    await this.get(actorId, classId);
    const members = await this.db.classMembership.findMany({
      where: { classId, status: 'active' },
      orderBy: { createdAt: 'asc' },
    });
    return members.map(m => ({
      id: m.id,
      classId: m.classId,
      memberId: m.accountId,
      role: m.role as 'member' | 'monitor',
      status: m.status as MembershipSchema['status'],
      version: m.version,
    }));
  }

  async changeMemberRole(
    actorId: string,
    classId: string,
    membershipId: string,
    newRole: 'member' | 'monitor',
    ifMatch: string,
  ): Promise<MembershipSchema> {
    if (!['member', 'monitor'].includes(newRole)) throw new DomainError('INVALID_INPUT', 422);

    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('NOT_FOUND', 404);
      if (cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const membership = await tx.classMembership.findFirst({
        where: { id: membershipId, classId, status: 'active' },
      });
      if (!membership) throw new DomainError('NOT_FOUND', 404);
      requireVersion(membership.version, ifMatch);

      if (newRole === 'monitor') {
        const existingMonitor = await tx.classMembership.findFirst({
          where: { classId, role: 'monitor', status: 'active', id: { not: membershipId } },
        });
        if (existingMonitor) {
          throw new DomainError('CONFLICT', 409);
        }
      }

      const updated = await tx.classMembership.update({
        where: { id: membershipId },
        data: { role: newRole, version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: {
          actorId,
          scopeType: 'class',
          scopeId: classId,
          action: 'class.role_change',
          targetId: membershipId,
        },
      });

      return {
        id: updated.id,
        classId: updated.classId,
        memberId: updated.accountId,
        role: updated.role as 'member' | 'monitor',
        status: updated.status as MembershipSchema['status'],
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async getJoinCode(actorId: string, classId: string): Promise<JoinCodeStateSchema> {
    const cls = await this.db.class.findUnique({ where: { id: classId } });
    if (!cls || cls.ownerId !== actorId) throw new DomainError('NOT_FOUND', 404);
    const state = await this.db.classJoinCode.findUnique({ where: { classId } });
    return state?.enabled && state.codeHash
      ? { classId, enabled: true, code: state.codeHash, version: cls.version }
      : { classId, enabled: false, version: cls.version };
  }

  async setJoinCode(actorId: string, classId: string, enabled: boolean, ifMatch: string): Promise<JoinCodeStateSchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('NOT_FOUND', 404);
      if (cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      requireVersion(cls.version, ifMatch);

      let code: string | null = null;
      if (enabled) {
        code = randomBytes(4).toString('hex').toUpperCase();
      }

      await tx.classJoinCode.upsert({
        where: { classId },
        create: { classId, enabled, codeHash: code },
        update: { enabled, codeHash: code },
      });

      const updatedClass = await tx.class.update({
        where: { id: classId },
        data: { version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: {
          actorId,
          scopeType: 'class',
          scopeId: classId,
          action: enabled ? 'class.join_code_enable' : 'class.join_code_disable',
          targetId: classId,
        },
      });

      if (enabled && code) {
        return {
          classId,
          enabled: true,
          code,
          version: updatedClass.version,
        };
      }
      return {
        classId,
        enabled: false,
        version: updatedClass.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async createJoinRequest(actorId: string, classId: string, code: string): Promise<JoinRequestSchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.status !== 'active') throw new DomainError('NOT_FOUND', 404);

      const joinCode = await tx.classJoinCode.findUnique({ where: { classId } });
      if (!joinCode || !joinCode.enabled || joinCode.codeHash !== code.trim().toUpperCase()) {
        throw new DomainError('INVALID_INPUT', 422);
      }

      if (cls.ownerId === actorId) throw new DomainError('INVALID_INPUT', 422);

      const isMember = await tx.classMembership.findFirst({
        where: { classId, accountId: actorId, status: 'active' },
      });
      if (isMember) throw new DomainError('CONFLICT', 409);

      const existingReq = await tx.joinRequest.findFirst({
        where: { targetType: 'class', targetId: classId, initiatorId: actorId, status: 'pending' },
      });
      if (existingReq) {
        return {
          id: existingReq.id,
          targetType: 'class',
          targetId: classId,
          initiatorId: actorId,
          status: 'pending',
          version: existingReq.version,
        };
      }

      const req = await tx.joinRequest.create({
        data: {
          targetType: 'class',
          targetId: classId,
          initiatorId: actorId,
          status: 'pending',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: classId, action: 'class.join_request', targetId: req.id },
      });

      return {
        id: req.id,
        targetType: 'class',
        targetId: classId,
        initiatorId: actorId,
        status: 'pending',
        version: req.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async listJoinRequests(actorId: string, classId: string): Promise<JoinRequestSchema[]> {
    const cls = await this.db.class.findUnique({ where: { id: classId } });
    if (!cls || cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);

    const requests = await this.db.joinRequest.findMany({
      where: { targetType: 'class', targetId: classId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(r => ({
      id: r.id,
      targetType: 'class',
      targetId: r.targetId,
      initiatorId: r.initiatorId,
      status: r.status as JoinRequestSchema['status'],
      version: r.version,
    }));
  }

  async createInvitation(actorId: string, classId: string, inviteeId: string): Promise<InvitationSchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      if (cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const targetAccount = await tx.account.findUnique({ where: { id: inviteeId } });
      if (!targetAccount) throw new DomainError('NOT_FOUND', 404);

      const isMember = await tx.classMembership.findFirst({
        where: { classId, accountId: inviteeId, status: 'active' },
      });
      if (isMember) throw new DomainError('CONFLICT', 409);

      const inv = await tx.invitation.create({
        data: {
          targetType: 'class',
          targetId: classId,
          initiatorId: actorId,
          recipientId: inviteeId,
          status: 'pending',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: classId, action: 'class.invite', targetId: inv.id },
      });

      return {
        id: inv.id,
        targetType: 'class',
        targetId: classId,
        initiatorId: actorId,
        recipientId: inviteeId,
        status: 'pending',
        version: inv.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async declineInvitation(actorId: string, invitationId: string, ifMatch?: string): Promise<InvitationSchema> {
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
        targetType: updated.targetType as 'class' | 'workspace',
        targetId: updated.targetId,
        initiatorId: updated.initiatorId,
        recipientId: updated.recipientId,
        status: 'declined',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async declineJoinRequest(actorId: string, requestId: string, ifMatch?: string): Promise<JoinRequestSchema> {
    return this.db.$transaction(async tx => {
      const req = await tx.joinRequest.findUnique({ where: { id: requestId } });
      if (!req || req.targetType !== 'class') throw new DomainError('NOT_FOUND', 404);
      const cls = await tx.class.findUnique({ where: { id: req.targetId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      requireVersion(req.version, ifMatch);

      const updated = await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: 'declined', version: { increment: 1 } },
      });
      return {
        id: updated.id,
        targetType: 'class',
        targetId: updated.targetId,
        initiatorId: updated.initiatorId,
        status: 'declined',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async leaveClass(actorId: string, classId: string, handoverTo?: string, ifMatch?: string): Promise<MembershipSchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls) throw new DomainError('NOT_FOUND', 404);

      if (cls.ownerId === actorId) {
        if (!handoverTo) throw new DomainError('FORBIDDEN', 403);
        const nextOwner = await tx.classMembership.findFirst({
          where: { classId, accountId: handoverTo, status: 'active' },
        });
        if (!nextOwner) throw new DomainError('INVALID_INPUT', 422);
        const hasTeacher = await tx.accountUsage.findUnique({
          where: { accountId_usage: { accountId: handoverTo, usage: 'teacher' } },
        });
        if (!hasTeacher) throw new DomainError('FORBIDDEN', 403);

        await tx.class.update({
          where: { id: classId },
          data: { ownerId: handoverTo, version: { increment: 1 } },
        });
      }

      const membership = await tx.classMembership.findFirst({
        where: { classId, accountId: actorId, status: 'active' },
      });
      if (!membership && cls.ownerId !== actorId) throw new DomainError('NOT_FOUND', 404);
      if (membership) requireVersion(membership.version, ifMatch);

      // End group memberships in this class as well
      const groups = await tx.workspace.findMany({ where: { classId }, select: { id: true } });
      await tx.workspaceMembership.updateMany({
        where: { workspaceId: { in: groups.map(g => g.id) }, accountId: actorId, status: 'active' },
        data: { status: 'ended' },
      });

      const updated = membership
        ? await tx.classMembership.update({ where: { id: membership.id }, data: { status: 'ended', version: { increment: 1 } } })
        : { id: classId, classId, accountId: actorId, role: 'member', status: 'ended', version: 1 };

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: classId, action: 'class.leave', targetId: classId },
      });

      return {
        id: updated.id,
        classId,
        memberId: actorId,
        role: (membership?.role ?? 'member') as 'member' | 'monitor',
        status: 'ended',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async removeMember(actorId: string, classId: string, memberId: string, ifMatch?: string): Promise<MembershipSchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      if (memberId === actorId) throw new DomainError('FORBIDDEN', 403);

      const membership = await tx.classMembership.findFirst({
        where: { classId, accountId: memberId, status: 'active' },
      });
      if (!membership) throw new DomainError('NOT_FOUND', 404);
      requireVersion(membership.version, ifMatch);

      // End groups
      const groups = await tx.workspace.findMany({ where: { classId }, select: { id: true } });
      await tx.workspaceMembership.updateMany({
        where: { workspaceId: { in: groups.map(g => g.id) }, accountId: memberId, status: 'active' },
        data: { status: 'ended' },
      });

      const updated = await tx.classMembership.update({
        where: { id: membership.id },
        data: { status: 'ended', version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: classId, action: 'class.remove_member', targetId: memberId },
      });

      return {
        id: updated.id,
        classId,
        memberId,
        role: updated.role as 'member' | 'monitor',
        status: 'ended',
        version: updated.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async getPolicy(actorId: string, classId: string): Promise<PolicySchema> {
    await this.get(actorId, classId);
    const policy = await this.db.classPolicy.findUnique({ where: { classId } });
    return (policy?.defaults as PolicySchema) ?? {
      groupLimit: 1,
      roleActions: {},
      lateFirst: 'allow',
      lateRevision: 'allow',
    };
  }

  async updatePolicy(actorId: string, classId: string, input: PolicySchema, ifMatch?: string): Promise<PolicySchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      if (cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const current = await tx.classPolicy.findUnique({ where: { classId } });
      if (current) requireVersion(current.version, ifMatch);

      const newDefaults = {
        groupLimit: input.groupLimit ?? cls.groupLimit,
        roleActions: input.roleActions ?? (current?.defaults as PolicySchema)?.roleActions ?? {},
        lateFirst: input.lateFirst ?? (current?.defaults as PolicySchema)?.lateFirst ?? 'allow',
        lateRevision: input.lateRevision ?? (current?.defaults as PolicySchema)?.lateRevision ?? 'allow',
      };

      if (input.groupLimit !== undefined && input.groupLimit >= 1) {
        await tx.class.update({
          where: { id: classId },
          data: { groupLimit: input.groupLimit, version: { increment: 1 } },
        });
      }

      const updated = await tx.classPolicy.upsert({
        where: { classId },
        create: { classId, defaults: newDefaults, version: 1 },
        update: { defaults: newDefaults, version: { increment: 1 } },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: classId, action: 'class.policy_update', targetId: classId },
      });

      return updated.defaults as PolicySchema;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async createOwnershipTransfer(actorId: string, classId: string, recipientId: string): Promise<OwnershipTransferSchema> {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('FORBIDDEN', 403);
      if (cls.status !== 'active') throw new DomainError('ARCHIVED', 409);

      const recipientMember = await tx.classMembership.findFirst({
        where: { classId, accountId: recipientId, status: 'active' },
      });
      if (!recipientMember) throw new DomainError('INVALID_INPUT', 422);

      const hasTeacher = await tx.accountUsage.findUnique({
        where: { accountId_usage: { accountId: recipientId, usage: 'teacher' } },
      });
      if (!hasTeacher) throw new DomainError('FORBIDDEN', 403);

      const req = await tx.transferRequest.create({
        data: {
          targetType: 'class',
          targetId: classId,
          initiatorId: actorId,
          recipientId,
          status: 'pending',
        },
      });

      await tx.auditEvent.create({
        data: { actorId, scopeType: 'class', scopeId: classId, action: 'class.transfer_initiate', targetId: req.id },
      });

      return {
        id: req.id,
        targetType: 'class',
        targetId: classId,
        initiatorId: actorId,
        recipientId,
        status: 'pending',
        version: req.version,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }
}
