import { Prisma, type PrismaClient } from '@prisma/client';
import { DomainError, type Principal } from '../../core/authorization';
import { ScopedAuthorization } from '../authorization/policy';
import { PrismaPolicyReader } from '../authorization/prisma-policy-reader';
import type { Admission, AdmissionStore, AdmissionTarget, AdmissionTransaction, Membership, Target } from './admission';

class Transaction implements AdmissionTransaction {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  private async lockClass(classId: string): Promise<void> {
    // All admissions lock the same class row BEFORE counting groups. ReadCommitted
    // gives subsequent reads the state committed by a previous holder of the lock.
    await this.tx.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ${classId}::uuid FOR UPDATE`;
  }
  async loadAdmission(kind: Admission['kind'], id: string): Promise<Admission | null> {
    const read = async () => {
      if (kind === 'invitation') {
        const row = await this.tx.invitation.findUnique({ where: { id } });
        return row && { ...row, accountId: row.recipientId };
      }
      const row = await this.tx.joinRequest.findUnique({ where: { id } });
      return row && { ...row, accountId: row.initiatorId, expiresAt: null };
    };
    let row = await read();
    if (!row || !['class', 'workspace'].includes(row.targetType)) return null;
    const classId = row.targetType === 'class' ? row.targetId
      : (await this.tx.workspace.findUnique({ where: { id: row.targetId } }))?.classId;
    if (!classId) return null;
    await this.lockClass(classId);
    row = await read(); // another transaction may have accepted/invalidated it while waiting
    if (!row) return null;
    return { id, kind, target: { type: row.targetType as Target['type'], id: row.targetId },
      accountId: row.accountId, status: row.status, expiresAt: row.expiresAt };
  }
  async loadTarget(target: Target): Promise<AdmissionTarget | null> {
    const workspace = target.type === 'workspace' ? await this.tx.workspace.findUnique({ where: { id: target.id } }) : null;
    const classId = target.type === 'class' ? target.id : workspace?.classId;
    if (!classId || (workspace && workspace.kind !== 'class_group')) return null;
    const cls = await this.tx.class.findUnique({ where: { id: classId } });
    return cls ? { target, classId, groupLimit: cls.groupLimit, archived: cls.status !== 'active' || (workspace !== null && workspace.status !== 'active') } : null;
  }
  async canApprove(actor: Principal, target: Target): Promise<boolean> {
    return (await new ScopedAuthorization(new PrismaPolicyReader(this.tx)).decide(actor,
      target.type === 'class' ? 'class.manage' : 'group.approve', target)).allowed;
  }
  async hasClassMembership(classId: string, accountId: string): Promise<boolean> {
    return (await this.tx.classMembership.count({ where: { classId, accountId, status: 'active' } })) > 0;
  }
  async countActiveGroups(classId: string, accountId: string): Promise<number> {
    const groups = await this.tx.workspace.findMany({ where: { classId, kind: 'class_group', status: 'active' }, select: { id: true } });
    return this.tx.workspaceMembership.count({ where: { workspaceId: { in: groups.map(g => g.id) }, accountId, status: 'active' } });
  }
  async findMembership(target: Target, accountId: string): Promise<Membership | null> {
    return target.type === 'class'
      ? this.tx.classMembership.findFirst({ where: { classId: target.id, accountId, status: 'active' } })
      : this.tx.workspaceMembership.findFirst({ where: { workspaceId: target.id, accountId, status: 'active' } });
  }
  async activateMembership(target: Target, accountId: string): Promise<Membership> {
    return target.type === 'class'
      ? this.tx.classMembership.create({ data: { classId: target.id, accountId, role: 'member', status: 'active' } })
      : this.tx.workspaceMembership.create({ data: { workspaceId: target.id, accountId, role: 'member', status: 'active' } });
  }
  async finish(admission: Admission): Promise<void> {
    if (admission.kind === 'invitation') {
      await this.tx.invitation.update({ where: { id: admission.id }, data: { status: 'accepted', acceptedAt: new Date() } });
    } else {
      await this.tx.joinRequest.update({ where: { id: admission.id }, data: { status: 'approved', acceptedAt: new Date() } });
    }
  }
  async invalidateOtherInvitations(classId: string, accountId: string, workspaceId: string): Promise<void> {
    const groups = await this.tx.workspace.findMany({ where: { classId, id: { not: workspaceId } }, select: { id: true } });
    await this.tx.invitation.updateMany({ where: { targetType: 'workspace', targetId: { in: groups.map(g => g.id) },
      recipientId: accountId, status: 'pending' }, data: { status: 'invalidated' } });
  }
  async audit(actor: Principal, admission: Admission, membership: Membership): Promise<void> {
    await this.tx.auditEvent.create({ data: { actorId: actor.accountId, scopeType: admission.target.type,
      scopeId: admission.target.id, action: admission.kind === 'invitation' ? 'membership.accept' : 'membership.approve', targetId: membership.id } });
  }
}

export class PrismaAdmissionStore implements AdmissionStore {
  constructor(private readonly db: PrismaClient) {}
  async transact<T>(work: (tx: AdmissionTransaction) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.db.$transaction(tx => work(new Transaction(tx)), { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < 2) continue;
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new DomainError('INVALID_INPUT', 422);
        throw error;
      }
    }
  }
}
