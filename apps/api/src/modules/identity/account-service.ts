import { Prisma, type PrismaClient } from '@prisma/client';
import type { components } from '@snote/contracts';
import { DomainError } from '../../core/authorization';
import { requireVersion } from '../../core/http';

export type Usages = components['schemas']['UsageUpdate']['usages'];

export function validateUsages(input: unknown): Usages {
  if (!Array.isArray(input) || input.length === 0 || input.some(v => !['student', 'teacher', 'personal'].includes(v))) {
    throw new DomainError('INVALID_INPUT', 422);
  }
  return [...new Set(input)] as Usages;
}

export class AccountService {
  constructor(private readonly db: PrismaClient) {}
  async changeUsages(accountId: string, input: unknown, ifMatch: string | undefined) {
    const usages = validateUsages(input);
    return this.db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Account" WHERE "id" = ${accountId}::uuid FOR UPDATE`;
      const current = await tx.account.findUnique({ where: { id: accountId } });
      if (!current) throw new DomainError('NOT_FOUND', 404);
      requireVersion(current.version, ifMatch);
      await tx.accountUsage.deleteMany({ where: { accountId } });
      await tx.accountUsage.createMany({ data: usages.map(usage => ({ accountId, usage })) });
      const account = await tx.account.update({ where: { id: accountId }, data: { version: { increment: 1 } } });
      await tx.auditEvent.create({ data: { actorId: accountId, scopeType: 'account', scopeId: accountId, action: 'account.usages', targetId: accountId } });
      // Class.ownerId is deliberately untouched (STR-03).
      return { id: account.id, usages, version: account.version };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  }
}
