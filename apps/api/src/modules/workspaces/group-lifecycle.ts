import { Prisma, type PrismaClient } from '@prisma/client';
import { DomainError } from '../../core/authorization';

export interface RestoreMember { accountId: string; classMember: boolean; activeGroups: number; }
export function requireRestorable(members: readonly RestoreMember[], groupLimit: number): void {
  if (members.some(m => !m.classMember)) throw new DomainError('FORBIDDEN', 403);
  if (members.some(m => m.activeGroups >= groupLimit)) throw new DomainError('GROUP_LIMIT', 409);
}

export class GroupLifecycle {
  constructor(private readonly db: PrismaClient) {}
  setArchived(actorId: string, workspaceId: string, archived: boolean) {
    return this.db.$transaction(async tx => {
      let group = await tx.workspace.findUnique({ where: { id: workspaceId } });
      if (!group?.classId || group.kind !== 'class_group') throw new DomainError('NOT_FOUND', 404);
      const classId = group.classId;
      // Shared by admission, archive/restore and class policy mutations.
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('NOT_FOUND', 404);
      if (cls.status === 'archived') throw new DomainError('ARCHIVED', 409);
      group = await tx.workspace.findUnique({ where: { id: workspaceId } });
      if (!group) throw new DomainError('NOT_FOUND', 404);
      const status = archived ? 'archived' : 'active';
      if (group.status === status) return group;
      if (!archived) {
        const members = await tx.workspaceMembership.findMany({ where: { workspaceId, status: 'active' } });
        const activeGroups = await tx.workspace.findMany({ where: { classId, kind: 'class_group', status: 'active' }, select: { id: true } });
        const checks: RestoreMember[] = [];
        for (const m of members) {
          checks.push({ accountId: m.accountId,
            classMember: m.accountId === cls.ownerId || (await tx.classMembership.count({ where: { classId, accountId: m.accountId, status: 'active' } }) > 0),
            activeGroups: await tx.workspaceMembership.count({ where: { workspaceId: { in: activeGroups.map(g => g.id) }, accountId: m.accountId, status: 'active' } }),
          });
        }
        requireRestorable(checks, cls.groupLimit); // no row is changed until EVERY member passes
      } else {
        await tx.invitation.updateMany({ where: { targetType: 'workspace', targetId: workspaceId, status: 'pending' }, data: { status: 'invalidated' } });
      }
      const result = await tx.workspace.update({ where: { id: workspaceId }, data: { status, version: { increment: 1 } } });
      await tx.auditEvent.create({ data: { actorId, scopeType: 'workspace', scopeId: workspaceId,
        action: archived ? 'workspace.archive' : 'workspace.restore', targetId: workspaceId } });
      return result;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }
}
