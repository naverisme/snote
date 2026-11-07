import { DomainError, type Principal } from '../../core/authorization';

export type Target = { type: 'class' | 'workspace'; id: string };
export interface Admission {
  id: string;
  kind: 'invitation' | 'request';
  target: Target;
  accountId: string;
  status: string;
  expiresAt: Date | null;
}
export interface Membership { id: string; accountId: string; status: string; }
export interface AdmissionTarget {
  target: Target;
  classId: string;
  archived: boolean;
  groupLimit: number;
}
export interface AdmissionTransaction {
  loadAdmission(kind: Admission['kind'], id: string): Promise<Admission | null>;
  loadTarget(target: Target): Promise<AdmissionTarget | null>;
  canApprove(actor: Principal, target: Target): Promise<boolean>;
  hasClassMembership(classId: string, accountId: string): Promise<boolean>;
  countActiveGroups(classId: string, accountId: string): Promise<number>;
  findMembership(target: Target, accountId: string): Promise<Membership | null>;
  activateMembership(target: Target, accountId: string): Promise<Membership>;
  finish(admission: Admission): Promise<void>;
  invalidateOtherInvitations(classId: string, accountId: string, workspaceId: string): Promise<void>;
  audit(actor: Principal, admission: Admission, membership: Membership): Promise<void>;
}
export interface AdmissionStore {
  /** Serialize ALL decisions for a class, including restore and policy changes.
   * Resolve untrusted invitation/request IDs again inside the transaction. */
  transact<T>(work: (tx: AdmissionTransaction) => Promise<T>): Promise<T>;
}

export class AdmissionService {
  constructor(private readonly store: AdmissionStore, private readonly now = () => new Date()) {}

  acceptInvitation(actor: Principal, id: string) { return this.complete(actor, 'invitation', id); }
  approveRequest(actor: Principal, id: string) { return this.complete(actor, 'request', id); }

  private complete(actor: Principal, kind: Admission['kind'], id: string): Promise<Membership> {
    return this.store.transact(async tx => {
      const admission = await tx.loadAdmission(kind, id);
      if (!admission) throw new DomainError('NOT_FOUND', 404);
      if (kind === 'invitation' && admission.accountId !== actor.accountId) throw new DomainError('NOT_FOUND', 404);
      const target = await tx.loadTarget(admission.target);
      if (!target) throw new DomainError('NOT_FOUND', 404);
      if (kind === 'request' && !await tx.canApprove(actor, admission.target)) throw new DomainError('FORBIDDEN', 403);
      if (target.archived) throw new DomainError('ARCHIVED', 409);
      // Never reactivate invalidated/past invitations, including after archive/restore.
      if (admission.status !== 'pending' || (admission.expiresAt && admission.expiresAt <= this.now())) {
        throw new DomainError('INVALID_INPUT', 422);
      }
      if (admission.target.type === 'workspace' && !await tx.hasClassMembership(target.classId, admission.accountId)) {
        throw new DomainError('FORBIDDEN', 403);
      }
      if (await tx.findMembership(admission.target, admission.accountId)) throw new DomainError('INVALID_INPUT', 422);
      if (admission.target.type === 'workspace' && await tx.countActiveGroups(target.classId, admission.accountId) >= target.groupLimit) {
        throw new DomainError('GROUP_LIMIT', 409);
      }
      const membership = await tx.activateMembership(admission.target, admission.accountId);
      await tx.finish(admission);
      if (admission.target.type === 'workspace' && target.groupLimit === 1) {
        await tx.invalidateOtherInvitations(target.classId, admission.accountId, admission.target.id);
      }
      await tx.audit(actor, admission, membership);
      return membership;
    });
  }
}
