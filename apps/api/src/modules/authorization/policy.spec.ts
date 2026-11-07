import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { allows, ScopedAuthorization, type PolicyFacts } from './policy';

const actor = { accountId: 'student' };
const scope = { type: 'workspace' as const, id: 'group' };
function facts(overrides: Partial<PolicyFacts> = {}): PolicyFacts {
  return { scope, classId: 'class', classOwner: false, classMember: true, monitor: false,
    workspaceMember: true, workspaceOwner: false, leader: false, manager: false,
    archived: false, defaultWorkspace: false, grants: new Set(), ...overrides };
}

test('Member can create an unassigned task, but cannot assign, delete or submit by default', () => {
  assert.equal(allows(actor, 'task.create', facts()), true);
  for (const action of ['task.assign', 'task.delete', 'task.edit_common', 'task.checklist', 'submission.send', 'new.unknown']) {
    assert.equal(allows(actor, action, facts()), false, action);
  }
});

test('monitor can edit common text across groups but file, create, cancel and checklist stay separate', () => {
  const monitor = facts({ monitor: true, workspaceMember: false });
  for (const a of ['task.edit_common', 'event.edit', 'library.edit_text', 'group.approve']) assert.equal(allows(actor, a, monitor), true, a);
  for (const a of ['library.edit_file', 'library.create', 'library.delete', 'event.create', 'event.cancel', 'task.checklist']) assert.equal(allows(actor, a, monitor), false, a);
});

test('removing monitor defaults preserves the independent group leader role', () => {
  const leader = facts({ leader: true, monitor: true, roleActions: { monitor: [] } });
  assert.equal(allows(actor, 'task.edit_common', leader), true);
  assert.equal(allows(actor, 'task.edit_common', { ...leader, leader: false }), false);
});

test('shared grants and ownership never open private data or archived scopes', () => {
  const owner = facts({ classOwner: true, grants: new Set(['task.delete']) });
  assert.equal(allows(actor, 'task.delete', owner), true);
  assert.equal(allows(actor, 'task.delete', { ...owner, archived: true }), false);
  assert.equal(allows(actor, 'task.delete', { ...owner, privateOwnerId: 'another' }), false);
  assert.equal(allows(actor, 'task.delete', { ...owner, privateOwnerId: actor.accountId }), false);
});

test('lost class membership cancels group and grant rights even if workspace membership remains', () => {
  assert.equal(allows(actor, 'task.delete', facts({ classMember: false, leader: true, grants: new Set(['task.delete']) })), false);
});

test('Teacher usage is not a global privilege; owner rights do not depend on usage', async () => {
  const port = new ScopedAuthorization({ load: async () => null });
  assert.deepEqual(await port.decide({ accountId: 'teacher-from-another-class' }, 'class.manage', { type: 'class', id: 'other' }), { allowed: false });
  assert.equal(allows(actor, 'class.manage', facts({ scope: { type: 'class', id: 'class' }, classOwner: true, classMember: false })), true);
});

test('class roles and policies cannot delegate class ownership or role changes', () => {
  const delegated = facts({ scope: { type: 'class', id: 'class' }, monitor: true, grants: new Set(['class.manage', 'class.role_change']), roleActions: { monitor: ['class.manage'] } });
  assert.equal(allows(actor, 'class.manage', delegated), false);
  assert.equal(allows(actor, 'class.role_change', delegated), false);
});

test('class owner can create class events without turning workspace actions into class permissions', () => {
  const cls = facts({ scope: { type: 'class', id: 'class' }, classOwner: true });
  assert.equal(allows(actor, 'event.create', cls), true);
  assert.equal(allows(actor, 'event.cancel', cls), true);
  assert.equal(allows(actor, 'task.assign', cls), false);
});

test('manager does not inherit submission rights; primary leader has its own recipient rights', () => {
  const recipient = facts({ scope: { type: 'assignment', id: 'assignment' }, manager: true });
  assert.equal(allows(actor, 'submission.send', recipient), false);
  assert.equal(allows(actor, 'submission.send', { ...recipient, leader: true }), true);
  assert.equal(allows(actor, 'submission.send', { ...recipient, grants: new Set(['submission.send']) }), true);
  assert.equal(allows(actor, 'submission.send', { ...recipient, classOwner: true }), false);
});

test('object responsibilities grant narrow actions only inside current membership', () => {
  assert.equal(allows(actor, 'task.checklist', facts({ assigneeId: actor.accountId })), true);
  assert.equal(allows(actor, 'task.edit_common', facts({ assigneeId: actor.accountId })), false);
  assert.equal(allows(actor, 'library.edit_file', facts({ creatorId: actor.accountId })), true);
  assert.equal(allows(actor, 'library.edit_file', facts({ creatorId: actor.accountId, workspaceMember: false })), false);
});

test('default workspace cannot be shared or archived via workspace.manage', () => {
  const personal = facts({ classId: undefined, workspaceOwner: true, defaultWorkspace: true });
  assert.equal(allows(actor, 'task.create', personal), true);
  assert.equal(allows(actor, 'workspace.manage', personal), false);
});

test('authorization reloads facts for every decision and refuses reader scope substitution', async () => {
  let current = facts({ grants: new Set(['task.delete']) });
  const port = new ScopedAuthorization({ load: async () => current });
  assert.equal((await port.decide(actor, 'task.delete', scope)).allowed, true);
  current = facts();
  assert.equal((await port.decide(actor, 'task.delete', scope)).allowed, false);
  current = facts({ classOwner: true, scope: { type: 'workspace', id: 'another' } });
  assert.equal((await port.decide(actor, 'task.delete', scope)).allowed, false);
});
