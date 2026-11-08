import 'reflect-metadata';
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { NestFactory } from '@nestjs/core';
import { HttpException } from '@nestjs/common';
import { DomainError } from '../../core/authorization';
import { createSession } from '../../core/http';
import { InMemorySessionStore } from '../identity/session-store';
import { AssignmentsModule } from './assignments.module';
import { AssignmentController } from './assignment.controller';
import type { AssignmentService } from './assignment.service';
import { SubmissionsModule } from '../submissions/submissions.module';
import { SubmissionController } from '../submissions/submission.controller';
import type { SubmissionService } from '../submissions/submission.service';

const hasStatus = (error: unknown, status: number) =>
  (error instanceof DomainError && error.status === status) ||
  (error instanceof HttpException && error.getStatus() === status);

test('assignment and submission modules resolve their runtime dependencies', async () => {
  for (const moduleClass of [AssignmentsModule, SubmissionsModule]) {
    const app = await NestFactory.create(moduleClass, { logger: false });
    try {
      await app.init();
    } finally {
      await app.close();
    }
  }
});

test('assignment controller rejects forged actor and requires session CSRF', async () => {
  const store = new InMemorySessionStore();
  const session = await createSession(store, 'real-teacher', 60_000);
  const calls: string[] = [];
  const service = {
    listAssignments: async (actorId: string) => { calls.push(actorId); return { data: [] }; },
    createAssignment: async (actorId: string) => { calls.push(actorId); return { id: 'assignment-1' }; },
  } as unknown as AssignmentService;
  const controller = new AssignmentController(service, store);

  await assert.rejects(
    controller.listAssignments('class-1', undefined, undefined, { headers: { 'x-actor-id': 'real-teacher' } }),
    (error: unknown) => hasStatus(error, 401),
  );
  assert.deepEqual(calls, []);

  const req = { headers: { cookie: `snote_session=${session.token}`, 'x-actor-id': 'other-teacher' } };
  await controller.listAssignments('class-1', undefined, undefined, req);
  assert.deepEqual(calls, ['real-teacher']);

  await assert.rejects(
    controller.createAssignment('class-1', { title: 'A', recipientWorkspaceIds: ['workspace-1'] }, req),
    (error: unknown) => hasStatus(error, 403),
  );
  assert.deepEqual(calls, ['real-teacher']);

  await controller.createAssignment('class-1', { title: 'A', recipientWorkspaceIds: ['workspace-1'] }, {
    headers: { ...req.headers, 'x-csrf-token': session.csrfToken },
  });
  assert.deepEqual(calls, ['real-teacher', 'real-teacher']);
});

test('submission controller uses cookie identity and rejects forged CSRF', async () => {
  const store = new InMemorySessionStore();
  const session = await createSession(store, 'real-student', 60_000);
  const calls: string[] = [];
  const service = {
    getSubmissions: async (actorId: string) => { calls.push(actorId); return []; },
    submit: async (actorId: string) => { calls.push(actorId); return { id: 'revision-1' }; },
  } as unknown as SubmissionService;
  const controller = new SubmissionController(service, store);

  await assert.rejects(
    controller.getSubmissions('recipient-1', { headers: { 'x-actor-id': 'real-student' } }),
    (error: unknown) => hasStatus(error, 401),
  );
  const req = { headers: { cookie: `snote_session=${session.token}`, 'x-actor-id': 'other-student' } };
  await controller.getSubmissions('recipient-1', req);
  assert.deepEqual(calls, ['real-student']);

  await assert.rejects(
    controller.submit('recipient-1', { text: 'answer' }, 'same-key', undefined, {
      headers: { ...req.headers, 'x-csrf-token': 'wrong' },
    }),
    (error: unknown) => hasStatus(error, 403),
  );
  assert.deepEqual(calls, ['real-student']);

  await controller.submit('recipient-1', { text: 'answer' }, 'same-key', undefined, {
    headers: { ...req.headers, 'x-csrf-token': session.csrfToken },
  });
  assert.deepEqual(calls, ['real-student', 'real-student']);
});
