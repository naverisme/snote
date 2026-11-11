import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { TestDb } from '../test-db';
import { InMemorySessionStore } from './session-store';
import { IdentityService } from './identity.service';
import type { GoogleTokenVerifier } from './google-token-verifier';
import { DomainError } from '../../core/authorization';

const verified: GoogleTokenVerifier = {
  async verify(credential) {
    if (credential !== 'valid') throw new DomainError('INVALID_GOOGLE_CREDENTIAL', 401);
    return { subject: 'google-sub-123', email: 'Person@Example.com' };
  },
};

test('Google registration creates one account and personal workspace; returning user keeps usages', async () => {
  const db = new TestDb();
  const identity = new IdentityService(db.client, new InMemorySessionStore(), undefined, verified);
  const first = await identity.googleSignIn({ credential: 'valid', usages: ['student', 'teacher'], timeZone: 'Asia/Ho_Chi_Minh' });
  assert.deepEqual(first.account.usages, ['student', 'teacher']);
  assert.equal(db.accounts.size, 1);
  assert.equal(db.workspaces.size, 1);
  assert.equal([...db.accounts.values()][0].email, 'person@example.com');
  assert.equal([...db.accounts.values()][0].passwordHash, null);
  const again = await identity.googleSignIn({ credential: 'valid', usages: ['personal'], timeZone: 'UTC' });
  assert.equal(again.account.id, first.account.id);
  assert.deepEqual(again.account.usages, ['student', 'teacher']);
  assert.equal(db.workspaces.size, 1);
  await assert.rejects(() => identity.login({ email: 'person@example.com', password: 'any-password' }),
    (error: unknown) => error instanceof DomainError && error.code === 'UNAUTHENTICATED');
});

test('Google cannot silently claim an existing password account or use an unverified credential', async () => {
  const db = new TestDb();
  const identity = new IdentityService(db.client, new InMemorySessionStore(), undefined, verified);
  await identity.register({ email: 'person@example.com', password: 'long-password-123', usages: ['personal'], timeZone: 'UTC' });
  await assert.rejects(() => identity.googleSignIn({ credential: 'valid', usages: ['personal'], timeZone: 'UTC' }),
    (error: unknown) => error instanceof DomainError && error.code === 'ACCOUNT_LINK_REQUIRED');
  await assert.rejects(() => identity.googleSignIn({ credential: 'invalid', usages: ['personal'], timeZone: 'UTC' }),
    (error: unknown) => error instanceof DomainError && error.code === 'INVALID_GOOGLE_CREDENTIAL');
  assert.equal(db.accounts.size, 1);
});
