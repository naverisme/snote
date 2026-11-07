import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { DomainError, requireAction } from './authorization';
import { authenticate, hashSecret, requireCsrf, requireVersion } from './http';
import { replayOrCommit, type Receipt, type ReceiptPort } from './receipt';

test('authorization denies when no grant is returned', async () => {
  await assert.rejects(requireAction({ decide: async () => ({ allowed: false }) }, { accountId: 'a' }, 'task.create', { type: 'workspace', id: 'w' }), { code: 'FORBIDDEN', status: 403 });
});

test('session expiry, CSRF and version reject stale requests', async () => {
  await assert.rejects(authenticate({ load: async () => ({ accountId: 'a', csrfHash: hashSecret('secret'), expiresAt: new Date(0) }), revoke: async () => {} }, 'cookie'), { code: 'UNAUTHENTICATED' });
  assert.throws(() => requireCsrf({ accountId: 'a', csrfHash: hashSecret('secret'), expiresAt: new Date(Date.now() + 1000) }, 'wrong'), { code: 'FORBIDDEN' });
  assert.throws(() => requireVersion(3, '"2"'), { code: 'VERSION_CONFLICT', status: 412 });
});

test('receipt replays same body and rejects changed body', async () => {
  let saved: Receipt<number> | null = null;
  const port: ReceiptPort<number> = { transact: async (_key, hash, work) => work(saved, async result => { saved = { fingerprint: hash, result }; }) };
  let commits = 0;
  assert.equal(await replayOrCommit(port, 'k', { text: 'a' }, async () => ++commits), 1);
  assert.equal(await replayOrCommit(port, 'k', { text: 'a' }, async () => ++commits), 1);
  assert.equal(commits, 1);
  await assert.rejects(replayOrCommit(port, 'k', { text: 'b' }, async () => ++commits), (error: unknown) => error instanceof DomainError && error.status === 409);
});
