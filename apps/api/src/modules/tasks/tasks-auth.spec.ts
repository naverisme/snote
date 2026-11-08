import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { HttpException } from '@nestjs/common';
import type { Principal } from '../../core/authorization';
import { hashSecret, type SessionPort } from '../../core/http';
import type { Request } from '../identity/http-utils';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

test('PM-04: tasks require cookie session and ignore spoofed account header', async () => {
  let actor: string | undefined;
  const service = {
    listMyTasks: async (principal: Principal) => { actor = principal.accountId; return { tasks: [] }; },
    createTask: async (principal: Principal) => {
      actor = principal.accountId;
      return { task: { id: 'task-1', version: 1 }, etag: '"1"' };
    },
  } as unknown as TasksService;
  const sessions: SessionPort = {
    load: async tokenHash => tokenHash === hashSecret('valid-cookie')
      ? { accountId: 'real-account', csrfHash: hashSecret('valid-csrf'), expiresAt: new Date(Date.now() + 60_000) }
      : null,
    revoke: async () => {},
  };
  const controller = new TasksController(service, sessions);
  const anonymous: Request = { headers: { 'x-account-id': 'victim' } };
  await assert.rejects(controller.getMeTasks(anonymous), (err: unknown) =>
    err instanceof HttpException && err.getStatus() === 401);
  const authenticated: Request = { headers: { cookie: 'snote_session=valid-cookie', 'x-account-id': 'victim' } };
  await controller.getMeTasks(authenticated);
  assert.equal(actor, 'real-account');
  await assert.rejects(controller.createTask(authenticated, 'workspace', { title: 'Try' }, { setHeader: () => {} }),
    (err: unknown) => err instanceof HttpException && err.getStatus() === 403);
  await assert.rejects(controller.createTask({ headers: { ...authenticated.headers, 'x-csrf-token': 'wrong' } }, 'workspace', { title: 'Try' }, { setHeader: () => {} }),
    (err: unknown) => err instanceof HttpException && err.getStatus() === 403);
  await controller.createTask({ headers: { ...authenticated.headers, 'x-csrf-token': 'valid-csrf' } }, 'workspace', { title: 'Try' }, { setHeader: () => {} });
  assert.equal(actor, 'real-account');
});
