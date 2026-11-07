import { Prisma, type PrismaClient } from '@prisma/client';
import type { components } from '@snote/contracts';
import { DomainError } from '../../core/authorization';

type ClassCreate = components['schemas']['ClassCreate'];

export class ClassService {
  constructor(private readonly db: PrismaClient) {}
  async create(actorId: string, input: ClassCreate) {
    if (typeof input.name !== 'string' || !input.name.trim() || typeof input.timeZone !== 'string' || !input.timeZone) throw new DomainError('INVALID_INPUT', 422);
    try { new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format(); }
    catch { throw new DomainError('INVALID_INPUT', 422); }
    return this.db.$transaction(async tx => {
      // Same lock as AccountService: turning Teacher off cannot race a new class.
      await tx.$queryRaw`SELECT "id" FROM "Account" WHERE "id" = ${actorId}::uuid FOR UPDATE`;
      if (!await tx.accountUsage.findUnique({ where: { accountId_usage: { accountId: actorId, usage: 'teacher' } } })) {
        throw new DomainError('FORBIDDEN', 403);
      }
      const cls = await tx.class.create({ data: { name: input.name.trim(), timeZone: input.timeZone, ownerId: actorId } });
      await tx.auditEvent.create({ data: { actorId, scopeType: 'class', scopeId: cls.id, action: 'class.create', targetId: cls.id } });
      return cls;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }

  async setArchived(actorId: string, classId: string, archived: boolean) {
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
      const cls = await tx.class.findUnique({ where: { id: classId } });
      if (!cls || cls.ownerId !== actorId) throw new DomainError('NOT_FOUND', 404);
      const status = archived ? 'archived' : 'active';
      if (cls.status === status) return cls;
      // Old invitations stay historical after restore. Pending requests remain
      // reviewable and only an explicit new approval can activate them (STR-08).
      if (archived) {
        const groups = await tx.workspace.findMany({ where: { classId }, select: { id: true } });
        const targets = [{ targetType: 'class', targetId: classId }, { targetType: 'workspace', targetId: { in: groups.map(g => g.id) } }];
        await tx.invitation.updateMany({ where: { status: 'pending', OR: targets }, data: { status: 'invalidated' } });
      }
      const result = await tx.class.update({ where: { id: classId }, data: { status, version: { increment: 1 } } });
      await tx.auditEvent.create({ data: { actorId, scopeType: 'class', scopeId: classId, action: archived ? 'class.archive' : 'class.restore', targetId: classId } });
      return result;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }
}
