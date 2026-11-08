import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { HttpException } from '@nestjs/common';
import { hashSecret, type SessionPort } from '../../core/http';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { SubmissionController } from '../submissions/submission.controller';
import { SubmissionService } from '../submissions/submission.service';

const sessionPort: SessionPort = {
  async load(hash) {
    return hash === hashSecret('valid-session')
      ? { accountId: 'session-user', csrfHash: hashSecret('valid-csrf'), expiresAt: new Date(Date.now() + 60_000) }
      : null;
  },
  async revoke() {},
};

const authenticated = { headers: { cookie: 'snote_session=valid-session', 'x-csrf-token': 'valid-csrf', 'x-actor-id': 'spoofed-user' } };
const spoofed = { headers: { 'x-actor-id': 'spoofed-user' } };

async function expectHttpError(action: () => Promise<unknown>, status: number, code: string) {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof HttpException);
    assert.equal(error.getStatus(), status);
    assert.equal((error.getResponse() as { error: { code: string } }).error.code, code);
    return true;
  });
}

test('assignment controller requires session and CSRF and uses the session actor', async () => {
  const actors: string[] = [];
  const service = {
    async getAssignment(actorId: string) { actors.push(actorId); return { id: 'assignment-1' }; },
    async createAssignment(actorId: string) { actors.push(actorId); return { id: 'assignment-1' }; },
  } as unknown as AssignmentService;
  const controller = new AssignmentController(service, sessionPort);

  await expectHttpError(() => controller.getAssignment('assignment-1', spoofed), 401, 'UNAUTHENTICATED');
  await expectHttpError(() => controller.createAssignment('class-1', {} as never, { headers: { cookie: 'snote_session=valid-session' } }), 403, 'FORBIDDEN');
  assert.equal(actors.length, 0);

  await controller.getAssignment('assignment-1', authenticated);
  await controller.createAssignment('class-1', {} as never, authenticated);
  assert.deepEqual(actors, ['session-user', 'session-user']);
});

test('submission controller requires session and CSRF and uses the session actor', async () => {
  const actors: string[] = [];
  const service = {
    async getSubmission(actorId: string) { actors.push(actorId); return { id: 'submission-1' }; },
    async submit(actorId: string) { actors.push(actorId); return { id: 'submission-1' }; },
  } as unknown as SubmissionService;
  const controller = new SubmissionController(service, sessionPort);

  await expectHttpError(() => controller.getSubmission('submission-1', spoofed), 401, 'UNAUTHENTICATED');
  await expectHttpError(() => controller.submit('recipient-1', {} as never, 'key-1', undefined, { headers: { cookie: 'snote_session=valid-session' } }), 403, 'FORBIDDEN');
  assert.equal(actors.length, 0);

  await controller.getSubmission('submission-1', authenticated);
  await controller.submit('recipient-1', {} as never, 'key-1', undefined, authenticated);
  assert.deepEqual(actors, ['session-user', 'session-user']);
});
