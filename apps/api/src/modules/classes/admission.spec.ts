import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { AdmissionService, type Admission, type AdmissionStore, type AdmissionTarget, type AdmissionTransaction, type Membership } from './admission';

/** Transactional test adapter. These tests exercise the service, not PostgreSQL locks. */
class Store implements AdmissionStore {
  state = { admissions: new Map<string, Admission>(), members: new Map<string, Membership>(),
    classMembers: new Set(['student']), archived: false, limit: 1, audit: [] as string[] };
  private tail: Promise<unknown> = Promise.resolve();
  failAudit = false;
  add(id: string, targetId: string, kind: Admission['kind'] = 'request', type: 'class' | 'workspace' = 'workspace') {
    this.state.admissions.set(id, { id, kind, target: { type, id: targetId }, accountId: 'student', status: 'pending', expiresAt: null });
  }
  transact<T>(work: (tx: AdmissionTransaction) => Promise<T>): Promise<T> {
    const run = this.tail.then(async () => {
      const draft = structuredClone(this.state);
      const tx: AdmissionTransaction = {
        loadAdmission: async (kind, id) => { const a = draft.admissions.get(id); return a?.kind === kind ? a : null; },
        loadTarget: async target => ({ target, classId: 'class', archived: draft.archived, groupLimit: draft.limit } as AdmissionTarget),
        canApprove: async actor => actor.accountId === 'teacher',
        hasClassMembership: async (_class, account) => draft.classMembers.has(account),
        countActiveGroups: async (_class, account) => [...draft.members].filter(([key, m]) => key.startsWith('workspace:') && m.accountId === account).length,
        findMembership: async (target, account) => draft.members.get(`${target.type}:${target.id}:${account}`) ?? null,
        activateMembership: async (target, account) => {
          const m = { id: `membership-${draft.members.size}`, accountId: account, status: 'active' };
          draft.members.set(`${target.type}:${target.id}:${account}`, m);
          if (target.type === 'class') draft.classMembers.add(account);
          return m;
        },
        finish: async a => { a.status = a.kind === 'request' ? 'approved' : 'accepted'; },
        invalidateOtherInvitations: async (_class, account, workspace) => {
          for (const a of draft.admissions.values()) if (a.kind === 'invitation' && a.accountId === account &&
            a.target.type === 'workspace' && a.target.id !== workspace && a.status === 'pending') a.status = 'invalidated';
        },
        audit: async (_actor, a) => { if (this.failAudit) throw new Error('audit unavailable'); draft.audit.push(a.id); },
      };
      const result = await work(tx);
      this.state = draft;
      return result;
    });
    this.tail = run.catch(() => undefined);
    return run;
  }
}
const teacher = { accountId: 'teacher' };
const student = { accountId: 'student' };

test('two approvals competing for the last group slot cannot both activate', async () => {
  const store = new Store(); store.add('a', 'group-a'); store.add('b', 'group-b');
  const service = new AdmissionService(store);
  const results = await Promise.allSettled([service.approveRequest(teacher, 'a'), service.approveRequest(teacher, 'b')]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const rejected = results.find(r => r.status === 'rejected');
  assert.equal(rejected?.status === 'rejected' && rejected.reason.code, 'GROUP_LIMIT');
  assert.equal(store.state.members.size, 1);
  assert.equal(store.state.audit.length, 1);
});

test('accepting an invitation invalidates other pending invitations without deleting history', async () => {
  const store = new Store(); store.add('a', 'group-a', 'invitation'); store.add('b', 'group-b', 'invitation');
  const service = new AdmissionService(store);
  await service.acceptInvitation(student, 'a');
  assert.equal(store.state.admissions.get('b')?.status, 'invalidated');
  store.state.members.clear(); // leaving the first group does not revive old invitations
  await assert.rejects(service.acceptInvitation(student, 'b'), { code: 'INVALID_INPUT' });
});

test('a higher configurable limit permits multiple groups; reducing it never revokes existing memberships', async () => {
  const store = new Store(); store.state.limit = 2; store.add('a', 'one'); store.add('b', 'two'); store.add('c', 'three');
  const service = new AdmissionService(store);
  await service.approveRequest(teacher, 'a'); await service.approveRequest(teacher, 'b');
  store.state.limit = 1;
  await assert.rejects(service.approveRequest(teacher, 'c'), { code: 'GROUP_LIMIT' });
  assert.equal(store.state.members.size, 2);
});

test('invitation requires its recipient, requests require an authorized approver', async () => {
  const store = new Store(); store.add('a', 'group', 'invitation'); store.add('b', 'group');
  const service = new AdmissionService(store);
  await assert.rejects(service.acceptInvitation(teacher, 'a'), { code: 'NOT_FOUND' });
  await assert.rejects(service.approveRequest(student, 'b'), { code: 'FORBIDDEN' });
  assert.equal(store.state.members.size, 0);
});

test('archive, lost class membership and expiry all block activation without side effects', async () => {
  const store = new Store(); store.add('a', 'group', 'invitation');
  const service = new AdmissionService(store, () => new Date('2026-11-07T06:00:00Z'));
  store.state.archived = true;
  await assert.rejects(service.acceptInvitation(student, 'a'), { code: 'ARCHIVED' });
  store.state.archived = false; store.state.classMembers.clear();
  await assert.rejects(service.acceptInvitation(student, 'a'), { code: 'FORBIDDEN' });
  store.state.classMembers.add('student');
  store.state.admissions.get('a')!.expiresAt = new Date('2026-11-07T06:00:00Z');
  await assert.rejects(service.acceptInvitation(student, 'a'), { code: 'INVALID_INPUT' });
  assert.equal(store.state.members.size, 0); assert.equal(store.state.audit.length, 0);
});

test('an audit write failure rolls back membership, invitation completion and invalidation', async () => {
  const store = new Store(); store.add('a', 'one', 'invitation'); store.add('b', 'two', 'invitation'); store.failAudit = true;
  await assert.rejects(new AdmissionService(store).acceptInvitation(student, 'a'), /audit unavailable/);
  assert.equal(store.state.members.size, 0);
  assert.equal(store.state.admissions.get('a')?.status, 'pending');
  assert.equal(store.state.admissions.get('b')?.status, 'pending');
});

test('class activation is distinct from group activation and cannot be repeated', async () => {
  const store = new Store(); store.state.classMembers.clear(); store.add('a', 'class', 'invitation', 'class');
  const service = new AdmissionService(store);
  await service.acceptInvitation(student, 'a');
  assert.equal(store.state.classMembers.has('student'), true);
  assert.equal([...store.state.members.keys()].some(k => k.startsWith('workspace:')), false);
  await assert.rejects(service.acceptInvitation(student, 'a'), { code: 'INVALID_INPUT' });
  assert.equal(store.state.members.size, 1);
});
