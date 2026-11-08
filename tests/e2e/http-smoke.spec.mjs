import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://snote:snote_dev_only@localhost:5432/snote?schema=public';
process.env.STORAGE_ROOT = '.test_storage_smoke';

let app;
let baseUrl;

// Helper to extract session cookie and csrfToken from register/login responses
function extractAuth(res, body) {
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Expected Set-Cookie header in auth response');
  const sessionCookie = setCookie.split(';')[0];
  const csrfToken = body.csrfToken;
  assert.ok(csrfToken, 'Expected csrfToken in auth response body');
  return { cookie: sessionCookie, csrfToken };
}

before(async () => {
  const { NestFactory } = await import('@nestjs/core');
  const { AppModule, ApiExceptionFilter } = await import('../../apps/api/dist/main.js');

  app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api/v2');
  const server = await app.listen(0, '127.0.0.1');
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}/api/v2`;
});

after(async () => {
  if (app) {
    await app.close();
  }
});

test('HTTP Smoke 1: Health and Readiness checks across real HTTP server', async () => {
  const healthRes = await fetch(`${baseUrl}/health`);
  assert.equal(healthRes.status, 200);
  const healthJson = await healthRes.json();
  assert.equal(healthJson.status, 'ok');

  const readyRes = await fetch(`${baseUrl}/ready`);
  assert.equal(readyRes.status, 200);
  const readyJson = await readyRes.json();
  assert.equal(readyJson.status, 'ready');
});

test('HTTP Smoke 2: Anonymous 401 Gate — All routes without session cookie return 401 UNAUTHENTICATED', async () => {
  const dummyUuid = '00000000-0000-0000-0000-000000000001';

  const routes = [
    { method: 'GET', path: '/me' },
    { method: 'GET', path: '/me/tasks' },
    { method: 'POST', path: `/workspaces/${dummyUuid}/tasks`, body: { title: 'Test' } },
    { method: 'GET', path: '/me/events' },
    { method: 'GET', path: `/workspaces/${dummyUuid}/library/items` },
    { method: 'POST', path: `/workspaces/${dummyUuid}/library/items`, body: { type: 'text', title: 'Note' } },
    { method: 'GET', path: `/classes/${dummyUuid}/assignments` },
    { method: 'POST', path: `/classes/${dummyUuid}/assignments`, body: { title: 'Asg', recipientWorkspaceIds: [dummyUuid] } },
    { method: 'POST', path: `/assignment-recipients/${dummyUuid}/submissions`, body: { text: 'Sub' } },
  ];

  for (const r of routes) {
    const res = await fetch(`${baseUrl}${r.path}`, {
      method: r.method,
      headers: r.body ? { 'Content-Type': 'application/json' } : {},
      body: r.body ? JSON.stringify(r.body) : undefined,
    });
    assert.equal(
      res.status,
      401,
      `Expected 401 for anonymous ${r.method} ${r.path}, received ${res.status}`
    );
    const json = await res.json();
    assert.ok(json.error, `Expected error object for anonymous ${r.path}`);
  }
});

test('HTTP Smoke 3: Fake Headers Spoofing Rejection — x-account-id / x-actor-id / x-workspace-ids cannot bypass 401', async () => {
  const dummyUuid = '00000000-0000-0000-0000-000000000001';

  // Attempt Tasks access with spoofed x-account-id
  const tasksSpoof = await fetch(`${baseUrl}/me/tasks`, {
    headers: { 'x-account-id': 'spoofed-admin-id' },
  });
  assert.equal(tasksSpoof.status, 401, 'Tasks endpoint must reject spoofed x-account-id with 401');

  // Attempt Calendar access with spoofed x-account-id and x-workspace-ids
  const calSpoof = await fetch(`${baseUrl}/me/events`, {
    headers: { 'x-account-id': 'spoofed-admin-id', 'x-workspace-ids': `${dummyUuid},ws-2` },
  });
  assert.equal(calSpoof.status, 401, 'Calendar endpoint must reject spoofed headers with 401');

  // Attempt Library access with spoofed x-actor-id
  const libSpoof = await fetch(`${baseUrl}/workspaces/${dummyUuid}/library/items`, {
    headers: { 'x-actor-id': 'spoofed-actor-id' },
  });
  assert.equal(libSpoof.status, 401, 'Library endpoint must reject spoofed x-actor-id with 401');

  // Attempt Assignments access with spoofed x-actor-id
  const asgSpoof = await fetch(`${baseUrl}/classes/${dummyUuid}/assignments`, {
    headers: { 'x-actor-id': 'teacher-default' },
  });
  assert.equal(asgSpoof.status, 401, 'Assignments endpoint must reject spoofed x-actor-id with 401');
});

test('HTTP Smoke 4: CSRF Token Enforcement — Mutating endpoints reject missing or invalid CSRF with 403', async () => {
  // Register a valid user to obtain legitimate session cookie
  const email = `smoke_csrf_${Date.now()}@test.edu.vn`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  assert.equal(regRes.status, 201);
  const regJson = await regRes.json();
  const { cookie, csrfToken } = extractAuth(regRes, regJson);

  // 1. Missing CSRF on PATCH /me/usages
  const noCsrfRes = await fetch(`${baseUrl}/me/usages`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'If-Match': '"1"',
    },
    body: JSON.stringify({ usages: ['teacher', 'student'] }),
  });
  assert.equal(noCsrfRes.status, 403, 'Expected 403 for missing CSRF on /me/usages');

  // 2. Invalid / Mismatched CSRF on PATCH /me/usages
  const badCsrfRes = await fetch(`${baseUrl}/me/usages`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': 'attacker-fake-csrf-token',
      'If-Match': '"1"',
    },
    body: JSON.stringify({ usages: ['teacher', 'student'] }),
  });
  assert.equal(badCsrfRes.status, 403, 'Expected 403 for mismatched CSRF on /me/usages');

  // 3. Valid CSRF succeeds
  const validCsrfRes = await fetch(`${baseUrl}/me/usages`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
      'If-Match': '"1"',
    },
    body: JSON.stringify({ usages: ['teacher', 'student'] }),
  });
  assert.equal(validCsrfRes.status, 200, 'Expected 200 for valid CSRF and valid If-Match');
});

test('HTTP Smoke 5: Concurrency Version Conflict (412) on stale ETag / If-Match', async () => {
  const email = `smoke_version_${Date.now()}@test.edu.vn`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const { cookie, csrfToken } = extractAuth(regRes, await regRes.json());

  // Mismatched version on PATCH /me/usages
  const staleRes = await fetch(`${baseUrl}/me/usages`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
      'If-Match': '"999"',
    },
    body: JSON.stringify({ usages: ['teacher'] }),
  });
  assert.equal(staleRes.status, 412, 'Expected 412 VERSION_CONFLICT for stale If-Match');
});

test('HTTP Smoke 6: Golden Path HTTP Flow across all 5 slices (Auth -> Class -> Group -> Tasks -> Calendar -> Library -> Assignments -> Submissions)', async () => {
  const timestamp = Date.now();

  // 1. Register Teacher & Student
  const teacherEmail = `smoke_teacher_${timestamp}@univ.edu.vn`;
  const studentEmail = `smoke_student_${timestamp}@univ.edu.vn`;

  const teacherReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: teacherEmail,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  assert.equal(teacherReg.status, 201);
  const teacherAuth = extractAuth(teacherReg, await teacherReg.json());

  const studentReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'SecurePassword123!',
      usages: ['student'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  assert.equal(studentReg.status, 201);
  const studentRegJson = await studentReg.json();
  const studentAuth = extractAuth(studentReg, studentRegJson);
  const studentId = studentRegJson.data.id;

  // 2. Teacher reads self via /me
  const meRes = await fetch(`${baseUrl}/me`, {
    headers: { Cookie: teacherAuth.cookie },
  });
  assert.equal(meRes.status, 200);
  const meJson = await meRes.json();
  assert.ok(meJson.data.id);
  assert.deepEqual(meJson.data.usages, ['teacher']);
  assert.equal(meJson.data.timeZone, 'Asia/Ho_Chi_Minh');
  const teacherId = meJson.data.id;

  // 3. Teacher creates Class
  const classRes = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: teacherAuth.cookie,
      'X-CSRF-Token': teacherAuth.csrfToken,
    },
    body: JSON.stringify({
      name: `K20 Software Engineering - Smoke ${timestamp}`,
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  assert.ok([200, 201].includes(classRes.status), `Expected 200 or 201, got ${classRes.status}`);
  const classJson = await classRes.json();
  const classId = classJson.data.id;
  assert.ok(classId);

  // 4. Teacher creates Class Group Workspace
  const groupRes = await fetch(`${baseUrl}/classes/${classId}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: teacherAuth.cookie,
      'X-CSRF-Token': teacherAuth.csrfToken,
    },
    body: JSON.stringify({
      name: 'Group 01 - Cloud Architecture',
    }),
  });
  assert.ok([200, 201].includes(groupRes.status), `Expected 200 or 201, got ${groupRes.status}`);
  const groupJson = await groupRes.json();
  const workspaceId = groupJson.data.id;
  assert.ok(workspaceId);

  // Enroll Student as class member and group leader per ASG-03
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.classMembership.create({
    data: { classId, accountId: studentId, role: 'member', status: 'active', version: 1 },
  });
  await prisma.workspaceMembership.create({
    data: { workspaceId, accountId: studentId, role: 'leader', status: 'active', version: 1 },
  });
  await prisma.$disconnect();

  // 5. Tasks Slice: Teacher creates Task in workspace
  const taskRes = await fetch(`${baseUrl}/workspaces/${workspaceId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: teacherAuth.cookie,
      'X-CSRF-Token': teacherAuth.csrfToken,
    },
    body: JSON.stringify({
      title: 'Hoan thanh mo hinh C4 cho he thong',
      importance: 'high',
    }),
  });
  assert.ok([200, 201].includes(taskRes.status), `Expected 200 or 201, got ${taskRes.status}`);
  const taskJson = await taskRes.json();
  const taskId = taskJson.data.id;
  assert.ok(taskId);

  // Teacher lists tasks via /me/tasks
  const tasksListRes = await fetch(`${baseUrl}/me/tasks`, {
    headers: { Cookie: teacherAuth.cookie },
  });
  assert.equal(tasksListRes.status, 200);
  const tasksListJson = await tasksListRes.json();
  assert.ok(Array.isArray(tasksListJson.data));

  // 6. Calendar Slice: Teacher lists events
  const calRes = await fetch(`${baseUrl}/me/events`, {
    headers: { Cookie: teacherAuth.cookie },
  });
  assert.equal(calRes.status, 200);
  const calJson = await calRes.json();
  assert.ok(Array.isArray(calJson.data));

  // 7. Library Slice: Teacher creates a library text item
  const libRes = await fetch(`${baseUrl}/workspaces/${workspaceId}/library/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: teacherAuth.cookie,
      'X-CSRF-Token': teacherAuth.csrfToken,
    },
    body: JSON.stringify({
      type: 'text',
      title: 'Tai lieu tham khao Clean Architecture',
      content: 'Noi dung chi tiet ve Clean Architecture va DDD',
    }),
  });
  assert.ok([200, 201].includes(libRes.status), `Expected 200 or 201, got ${libRes.status}`);
  const libJson = await libRes.json();
  assert.ok(libJson.data.id);

  // Teacher lists library items
  const libListRes = await fetch(`${baseUrl}/workspaces/${workspaceId}/library/items`, {
    headers: { Cookie: teacherAuth.cookie },
  });
  assert.equal(libListRes.status, 200);
  const libListJson = await libListRes.json();
  assert.ok(Array.isArray(libListJson.data));
  assert.ok(libListJson.data.some((i) => i.id === libJson.data.id));

  // 8. Assignments Slice: Teacher creates Assignment for the group workspace
  const asgRes = await fetch(`${baseUrl}/classes/${classId}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: teacherAuth.cookie,
      'X-CSRF-Token': teacherAuth.csrfToken,
    },
    body: JSON.stringify({
      title: 'Do an cuoi ky: Xay dung Microservices',
      recipientWorkspaceIds: [workspaceId],
      description: 'Nop ma nguon va tai lieu thiet ke he thong',
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    }),
  });
  assert.ok([200, 201].includes(asgRes.status), `Expected 200 or 201, got ${asgRes.status}`);
  const asgJson = await asgRes.json();
  const assignmentId = asgJson.data.id;
  assert.ok(assignmentId);

  // Retrieve recipients of assignment
  const recipientsRes = await fetch(`${baseUrl}/assignments/${assignmentId}/recipients`, {
    headers: { Cookie: teacherAuth.cookie },
  });
  assert.equal(recipientsRes.status, 200);
  const recipientsJson = await recipientsRes.json();
  assert.ok(Array.isArray(recipientsJson.data));
  assert.equal(recipientsJson.data.length, 1);
  const recipientId = recipientsJson.data[0].id;

  // 9. Submissions Slice: Student submits for the recipient
  const idempotencyKey = randomUUID();
  const subRes = await fetch(`${baseUrl}/assignment-recipients/${recipientId}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentAuth.cookie,
      'X-CSRF-Token': studentAuth.csrfToken,
      'Idempotency-Key': idempotencyKey,
      'If-Match': '"0"',
    },
    body: JSON.stringify({
      text: 'Bao cao giai doan 1: Thiet ke so do C4 va API spec',
      links: ['https://github.com/example/architecture-repo'],
    }),
  });
  assert.ok([200, 201].includes(subRes.status), `Expected 200 or 201, got ${subRes.status}`);
  const subJson = await subRes.json();
  assert.ok(subJson.data.id);
  assert.equal(subJson.data.recipientId, recipientId);

  // 10. Idempotency Conflict check: Replaying same key with changed body returns 409
  const subConflict = await fetch(`${baseUrl}/assignment-recipients/${recipientId}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentAuth.cookie,
      'X-CSRF-Token': studentAuth.csrfToken,
      'Idempotency-Key': idempotencyKey,
      'If-Match': '"1"',
    },
    body: JSON.stringify({
      text: 'Altered body content that triggers 409 conflict',
    }),
  });
  assert.equal(subConflict.status, 409, 'Expected 409 IDEMPOTENCY_CONFLICT for changed payload replay');
});

test('HTTP Smoke 7: Typed OpenAPI Client end-to-end integration across live HTTP socket', async () => {
  // Transpile generated client from apps/web/src/api/generated/client.ts
  const clientSource = await readFile(new URL('../../apps/web/src/api/generated/client.ts', import.meta.url), 'utf8');
  const clientJavaScript = ts.transpileModule(clientSource, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { register, ApiError } = await import(`data:text/javascript;base64,${Buffer.from(clientJavaScript).toString('base64')}`);

  // Route native fetch to our live test server baseUrl
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = (input, init = {}) => {
    const url = typeof input === 'string' && input.startsWith('/api/v2')
      ? `${baseUrl}${input.replace('/api/v2', '')}`
      : input;
    return nativeFetch(url, init);
  };

  try {
    const email = `client_typed_${Date.now()}@univ.edu.vn`;
    const regResult = await register({
      email,
      password: 'TypedClientPassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    assert.ok(regResult.data.id);
    assert.deepEqual(regResult.data.usages, ['teacher']);
    assert.equal(regResult.data.timeZone, 'Asia/Ho_Chi_Minh');
    assert.ok(regResult.csrfToken);
  } finally {
    globalThis.fetch = nativeFetch;
  }
});
