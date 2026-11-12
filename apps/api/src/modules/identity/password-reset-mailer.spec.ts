import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { TestDb } from '../test-db';
import { InMemorySessionStore, PrismaSessionStore } from './session-store';
import { IdentityService } from './identity.service';
import type { PasswordResetMailer } from './password-reset-mailer';
import { DomainError } from '../../core/authorization';
import { hashSecret } from '../../core/http';

test('password reset sends a one-time token and updates the login password', async () => {
  const db = new TestDb();
  let delivered: { to: string; token: string } | undefined;
  const mailer: PasswordResetMailer = { async send(to, token) { delivered = { to, token }; } };
  const sessions = new PrismaSessionStore(db.client);
  const identity = new IdentityService(db.client, sessions, undefined, undefined, mailer);
  const registration = await identity.register({ email: 'reset@example.com', password: 'old-password-123', usages: ['personal'], timeZone: 'UTC' });
  assert.ok(await sessions.load(hashSecret(registration.session.token)));
  await identity.passwordResetRequest({ email: 'reset@example.com' });
  assert.equal(delivered?.to, 'reset@example.com');
  assert.ok(delivered?.token);
  await identity.passwordReset({ token: delivered!.token, newPassword: 'new-password-123' });
  assert.equal(await sessions.load(hashSecret(registration.session.token)), null);
  await identity.login({ email: 'reset@example.com', password: 'new-password-123' });
  await assert.rejects(() => identity.passwordReset({ token: delivered!.token, newPassword: 'another-password-123' }),
    (error: unknown) => error instanceof DomainError && error.code === 'INVALID_INPUT');
});

test('reset request does not reveal unknown email and refuses unconfigured delivery', async () => {
  const db = new TestDb();
  let called = false;
  const mailer: PasswordResetMailer = { async send() { called = true; } };
  const configured = new IdentityService(db.client, new InMemorySessionStore(), undefined, undefined, mailer);
  await configured.passwordResetRequest({ email: 'unknown@example.com' });
  assert.equal(called, false);
  const unconfigured = new IdentityService(db.client, new InMemorySessionStore());
  await assert.rejects(() => unconfigured.passwordResetRequest({ email: 'unknown@example.com' }),
    (error: unknown) => error instanceof DomainError && error.code === 'EMAIL_NOT_CONFIGURED');
});
