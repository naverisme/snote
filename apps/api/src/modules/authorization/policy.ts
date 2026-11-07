import type { components } from '@snote/contracts';
import type { AuthorizationPort, Decision, Principal, Scope } from '../../core/authorization';

export type Action = components['schemas']['Action'];
export interface PolicyFacts {
  scope: Scope;
  classId?: string;
  classOwner: boolean;
  classMember: boolean;
  monitor: boolean;
  workspaceMember: boolean;
  workspaceOwner: boolean;
  leader: boolean;
  manager: boolean;
  archived: boolean;
  defaultWorkspace: boolean;
  /** Loaded from the actual object by its owning module, never from a request body. */
  privateOwnerId?: string;
  creatorId?: string;
  assigneeId?: string;
  grants: ReadonlySet<Action>;
  roleActions?: { member?: readonly Action[]; monitor?: readonly Action[] };
}

const monitorDefaults: readonly Action[] = ['group.approve', 'task.edit_common', 'event.edit', 'library.edit_text'];
const memberDefaults: readonly Action[] = ['task.create', 'library.create'];
const management: readonly Action[] = ['workspace.manage', 'group.approve', 'member.invite', 'member.remove',
  'task.create', 'task.assign', 'task.edit_common', 'task.checklist', 'task.delete', 'event.create',
  'event.edit', 'event.cancel', 'library.create', 'library.edit_text', 'library.edit_file', 'library.delete', 'folder.manage'];

// Every generated action has an explicit domain. Unknown/new actions deny until reviewed.
const domains: Record<Action, readonly Scope['type'][]> = {
  'class.manage': ['class'], 'class.role_change': ['class'], 'group.create': ['class'],
  'group.approve': ['workspace'], 'member.invite': ['workspace'], 'member.remove': ['workspace'],
  'workspace.manage': ['workspace'], 'task.create': ['workspace'], 'task.assign': ['workspace'],
  'task.edit_common': ['workspace'], 'task.checklist': ['workspace'], 'task.delete': ['workspace'],
  'event.create': ['class', 'workspace'], 'event.edit': ['class', 'workspace'], 'event.cancel': ['class', 'workspace'],
  'library.create': ['workspace'], 'library.edit_text': ['workspace'], 'library.edit_file': ['workspace'],
  'library.delete': ['workspace'], 'folder.manage': ['workspace'], 'assignment.create': ['class'],
  'assignment.edit': ['assignment'], 'progress.update': ['assignment'], 'submission.send': ['assignment'],
  'submission.feedback': ['assignment'],
};

/** STR-11–14, PM-01–24: facts must be freshly loaded in the mutation transaction. */
export function allows(principal: Principal, action: string, f: PolicyFacts): boolean {
  if (!Object.hasOwn(domains, action)) return false;
  const a = action as Action;
  if (f.privateOwnerId !== undefined) return false; // private endpoints use owner checks, not shared actions
  if (f.archived) return false;
  if (f.classId && !f.classOwner && !f.classMember) return false;
  if (!f.classId && !f.workspaceOwner && !f.workspaceMember) return false;
  if (f.defaultWorkspace && a === 'workspace.manage') return false; // no sharing/archive/transfer
  if (!domains[a].includes(f.scope.type)) return false;
  if (a === 'class.manage' || a === 'class.role_change') return f.classOwner;
  if (f.classOwner && a !== 'submission.send' && a !== 'progress.update') return true;
  const manages = f.workspaceOwner || f.leader || f.manager;
  if (manages && management.includes(a)) return true;
  if (f.leader && (a === 'submission.send' || a === 'progress.update')) return true;
  if (f.monitor && (f.roleActions?.monitor ?? monitorDefaults).includes(a)) return true;
  // Member actions apply in their own group. Class-level defaults (e.g. group.create)
  // apply to a current class member without implying membership of every group.
  if ((f.workspaceMember || f.scope.type === 'class') && f.classMember &&
      (f.roleActions?.member ?? memberDefaults).includes(a)) return true;
  if (!f.classId && f.workspaceMember && memberDefaults.includes(a)) return true;
  if (f.workspaceMember && f.assigneeId === principal.accountId && a === 'task.checklist') return true;
  if (f.workspaceMember && f.creatorId === principal.accountId &&
      ['library.edit_text', 'library.edit_file', 'library.delete', 'event.edit', 'event.cancel'].includes(a)) return true;
  return f.grants.has(a);
}

export interface PolicyReader {
  load(principal: Principal, scope: Scope): Promise<PolicyFacts | null>;
}

export class ScopedAuthorization implements AuthorizationPort {
  constructor(private readonly reader: PolicyReader) {}
  async decide(principal: Principal, action: string, scope: Scope): Promise<Decision> {
    const facts = await this.reader.load(principal, scope);
    // A reader cannot substitute a different object/scope to broaden a request.
    return { allowed: facts !== null && facts.scope.type === scope.type && facts.scope.id === scope.id && allows(principal, action, facts) };
  }
}
