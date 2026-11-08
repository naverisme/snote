import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://snote:snote_dev_only@localhost:5432/snote?schema=public';
const { AppModule, ApiExceptionFilter } = await import('../../apps/api/dist/main.js');

async function start() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api/v2');
  const server = await app.listen(0, '127.0.0.1');
  return { app, url: `http://127.0.0.1:${server.address().port}/api/v2` };
}

async function request(url, path, options = {}) {
  const response = await fetch(`${url}${path}`, options);
  const body = await response.json();
  return { status: response.status, body, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}

const email = `restart-audit-${randomUUID()}@example.com`;
const password = 'StrongPassword123!';
let first;
let second;
try {
  first = await start();
  const registration = await request(first.url, '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, usages: ['student'], timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  const cookie = registration.cookie;
  const workspaces = await request(first.url, '/workspaces', { headers: { Cookie: cookie } });
  const workspaceId = workspaces.body.data.find(w => w.kind === 'default').id;
  const created = await request(first.url, `/workspaces/${workspaceId}/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': registration.body.csrfToken },
    body: JSON.stringify({ title: 'Restart audit task' }),
  });
  const taskId = created.body.data.id;
  const before = await request(first.url, `/tasks/${taskId}`, { headers: { Cookie: cookie } });
  await first.app.close();
  first = undefined;
  second = await start();
  const login = await request(second.url, '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  const after = await request(second.url, `/tasks/${taskId}`, { headers: { Cookie: login.cookie } });
  console.log(JSON.stringify({ registration: registration.status, create: created.status, beforeRestart: before.status, relogin: login.status, afterRestart: after.status, taskId }));
  assert.equal(before.status, 200, 'The task must be readable before restart');
  assert.equal(after.status, 200, 'The task must remain readable after restart');
} finally {
  await first?.app.close();
  await second?.app.close();
}
