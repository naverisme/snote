import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import type { ExecutionContext } from '@nestjs/common';
import { DomainError } from '../../core/authorization';
import { createSession } from '../../core/http';
import { InMemorySessionStore } from '../identity/session-store';
import { LibrarySessionGuard, libraryPrincipal, type LibraryRequest } from './library-session.guard';

function context(req: LibraryRequest): ExecutionContext {
  return { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
}

test('library guard denies anonymous reads even with forged actor header', async () => {
  const guard = new LibrarySessionGuard(new InMemorySessionStore());
  const req: LibraryRequest = { method: 'GET', headers: { 'x-actor-id': 'victim' } };
  await assert.rejects(guard.canActivate(context(req)),
    (err: unknown) => err instanceof DomainError && err.status === 401);
  assert.equal(req.user, undefined);
});

test('library guard uses cookie identity and checks CSRF on mutations', async () => {
  const sessions = new InMemorySessionStore();
  const { token, csrfToken } = await createSession(sessions, 'owner', 60_000);
  const guard = new LibrarySessionGuard(sessions);
  const req: LibraryRequest = {
    method: 'POST',
    headers: { cookie: `snote_session=${token}`, 'x-actor-id': 'victim', 'x-csrf-token': 'wrong' },
  };
  await assert.rejects(guard.canActivate(context(req)),
    (err: unknown) => err instanceof DomainError && err.status === 403);
  assert.equal(req.user, undefined);

  req.headers['x-csrf-token'] = csrfToken;
  assert.equal(await guard.canActivate(context(req)), true);
  assert.deepEqual(libraryPrincipal(req), { accountId: 'owner' });
});
