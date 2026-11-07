import type { Prisma } from '@prisma/client';
import type { Principal, Scope } from '../../core/authorization';
import type { Action, PolicyFacts, PolicyReader } from './policy';

/** Supply the SAME transaction used to write domain rows. Recipient ID is resolved
 * from the endpoint, not a user supplied workspace/role. */
export class PrismaPolicyReader implements PolicyReader {
  constructor(private readonly tx: Prisma.TransactionClient, private readonly recipientId?: string) {}

  async load(principal: Principal, scope: Scope): Promise<PolicyFacts | null> {
    let classId: string | null = null;
    let workspaceId: string | null = null;
    if (scope.type === 'class') classId = scope.id;
    if (scope.type === 'workspace') workspaceId = scope.id;
    if (scope.type === 'assignment') {
      const assignment = await this.tx.assignment.findUnique({ where: { id: scope.id } });
      if (!assignment) return null;
      classId = assignment.classId;
      if (this.recipientId) {
        const recipient = await this.tx.assignmentRecipient.findUnique({ where: { id: this.recipientId } });
        if (!recipient || recipient.assignmentId !== scope.id) return null;
        workspaceId = recipient.workspaceId;
      }
    }
    const workspace = workspaceId ? await this.tx.workspace.findUnique({ where: { id: workspaceId } }) : null;
    if (workspaceId && !workspace) return null;
    if (workspace) {
      if (classId && workspace.classId !== classId) return null;
      classId = workspace.classId;
    }
    const cls = classId ? await this.tx.class.findUnique({ where: { id: classId } }) : null;
    if (classId && !cls) return null;
    const member = cls ? await this.tx.classMembership.findFirst({ where: { classId: cls.id, accountId: principal.accountId, status: 'active' } }) : null;
    const wsMember = workspace ? await this.tx.workspaceMembership.findFirst({ where: { workspaceId: workspace.id, accountId: principal.accountId, status: 'active' } }) : null;
    const policy = cls ? await this.tx.classPolicy.findUnique({ where: { classId: cls.id } }) : null;
    const grantScopes = [{ scopeType: scope.type, scopeId: scope.id }];
    if (cls) grantScopes.push({ scopeType: 'class', scopeId: cls.id });
    if (workspace) grantScopes.push({ scopeType: 'workspace', scopeId: workspace.id });
    const grants = await this.tx.grant.findMany({ where: { principalId: principal.accountId, revokedAt: null, OR: grantScopes } });
    const raw = policy?.defaults as { roleActions?: { member?: unknown; monitor?: unknown } } | undefined;
    function roleActions(value: unknown): readonly Action[] | undefined {
      if (value === undefined) return undefined;
      return Array.isArray(value) && value.every(a => typeof a === 'string') ? value as Action[] : [];
    }
    return {
      scope, classId: cls?.id, classOwner: cls?.ownerId === principal.accountId,
      classMember: member !== null, monitor: member?.role === 'monitor',
      workspaceMember: wsMember !== null, workspaceOwner: workspace?.ownerId === principal.accountId,
      leader: wsMember?.role === 'leader', manager: wsMember?.role === 'manager',
      archived: (cls !== null && cls.status !== 'active') || (workspace !== null && workspace.status !== 'active'),
      defaultWorkspace: workspace?.kind === 'default', grants: new Set(grants.map(g => g.action as Action)),
      roleActions: { member: roleActions(raw?.roleActions?.member), monitor: roleActions(raw?.roleActions?.monitor) },
    };
  }
}
