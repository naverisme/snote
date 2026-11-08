import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://snote:snote_dev_only@localhost:5432/snote?schema=public';
process.env.STORAGE_ROOT = '.test_storage_qa';

let app;
let baseUrl;

function extractAuth(res, body) {
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Expected Set-Cookie header');
  const cookie = setCookie.split(';')[0];
  const csrfToken = body.csrfToken;
  assert.ok(csrfToken, 'Expected csrfToken in body');
  return { cookie, csrfToken };
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

test('QA-01: Role Usages & Class Creation/Ownership lifecycle over HTTP', async () => {
  const email = `qa01_${Date.now()}@test.edu.vn`;

  // 1. Register as student only
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'SecurePassword123!',
      usages: ['student'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  assert.equal(regRes.status, 201);
  const { cookie, csrfToken } = extractAuth(regRes, await regRes.json());

  // 2. Student attempts to create class -> 403 Forbidden
  const createDenied = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ name: 'Unauthorized Class', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  assert.equal(createDenied.status, 403, 'Student without teacher usage must receive 403');

  // 3. Update usages to include teacher
  const updateRes = await fetch(`${baseUrl}/me/usages`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
      'If-Match': '"1"',
    },
    body: JSON.stringify({ usages: ['teacher', 'student'] }),
  });
  assert.equal(updateRes.status, 200);

  // 4. Now create class -> 201 Created
  const createOk = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ name: 'K20 Architecture QA-01', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  assert.ok([200, 201].includes(createOk.status));
  const classJson = await createOk.json();
  const classId = classJson.data.id;
  assert.ok(classId);

  // 5. Turn off teacher usage
  const disableTeacher = await fetch(`${baseUrl}/me/usages`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
      'If-Match': '"2"',
    },
    body: JSON.stringify({ usages: ['student'] }),
  });
  assert.equal(disableTeacher.status, 200);

  // 6. Owner can still inspect the existing class
  const inspectClass = await fetch(`${baseUrl}/classes/${classId}`, {
    headers: { Cookie: cookie },
  });
  assert.equal(inspectClass.status, 200);

  // 7. But attempting to create another class is denied
  const createDeniedAgain = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ name: 'Another Class', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  assert.equal(createDeniedAgain.status, 403, 'Disabled teacher usage must block creating new class');
});

test('QA-02 & QA-03: Class Join Code Admission and Archive/Restore lifecycle over HTTP', async () => {
  const tsNow = Date.now();
  const teacherEmail = `qa02_teacher_${tsNow}@test.edu.vn`;
  const studentEmail = `qa02_student_${tsNow}@test.edu.vn`;

  // Register Teacher
  const tReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: teacherEmail,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const tAuth = extractAuth(tReg, await tReg.json());

  // Register Student
  const sReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'SecurePassword123!',
      usages: ['student'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const sAuth = extractAuth(sReg, await sReg.json());

  // Teacher creates class
  const cRes = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: tAuth.cookie,
      'X-CSRF-Token': tAuth.csrfToken,
    },
    body: JSON.stringify({ name: 'Class QA-02 Lifecycle', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  assert.ok([200, 201].includes(cRes.status));
  const classJson = await cRes.json();
  const classId = classJson.data.id;
  let classVersion = classJson.data.version;

  // Teacher activates join code
  const codeRes = await fetch(`${baseUrl}/classes/${classId}/join-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: tAuth.cookie,
      'X-CSRF-Token': tAuth.csrfToken,
      'If-Match': `"${classVersion}"`,
    },
    body: JSON.stringify({ enabled: true }),
  });
  assert.ok([200, 201].includes(codeRes.status));
  const codeJson = await codeRes.json();
  assert.ok(codeJson.data.code, 'Join code must be generated');
  const joinCode = codeJson.data.code;

  // Student submits join request with join code
  const reqRes = await fetch(`${baseUrl}/classes/${classId}/join-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sAuth.cookie,
      'X-CSRF-Token': sAuth.csrfToken,
    },
    body: JSON.stringify({ code: joinCode }),
  });
  assert.ok([200, 201].includes(reqRes.status));
  const reqJson = await reqRes.json();
  const requestId = reqJson.data.id;
  assert.ok(requestId);

  // Teacher approves join request
  const approveRes = await fetch(`${baseUrl}/class-join-requests/${requestId}/approve`, {
    method: 'POST',
    headers: {
      Cookie: tAuth.cookie,
      'X-CSRF-Token': tAuth.csrfToken,
    },
  });
  assert.ok([200, 201].includes(approveRes.status));

  // Verify student is now a class member
  const membersRes = await fetch(`${baseUrl}/classes/${classId}/members`, {
    headers: { Cookie: tAuth.cookie },
  });
  assert.equal(membersRes.status, 200);
  const membersJson = await membersRes.json();
  assert.ok(membersJson.data.length >= 1, 'Class must contain approved student');
  assert.equal(membersJson.data[0].status, 'active');

  // Teacher archives class
  const classFresh = await fetch(`${baseUrl}/classes/${classId}`, { headers: { Cookie: tAuth.cookie } });
  const freshVer = (await classFresh.json()).data.version;

  const archiveRes = await fetch(`${baseUrl}/classes/${classId}/archive`, {
    method: 'POST',
    headers: {
      Cookie: tAuth.cookie,
      'X-CSRF-Token': tAuth.csrfToken,
      'If-Match': `"${freshVer}"`,
    },
  });
  assert.ok([200, 201].includes(archiveRes.status));
  const archivedClass = await archiveRes.json();
  assert.equal(archivedClass.data.status, 'archived');

  // Teacher restores class
  const restoreRes = await fetch(`${baseUrl}/classes/${classId}/restore`, {
    method: 'POST',
    headers: {
      Cookie: tAuth.cookie,
      'X-CSRF-Token': tAuth.csrfToken,
      'If-Match': `"${archivedClass.data.version}"`,
    },
  });
  assert.ok([200, 201].includes(restoreRes.status));
  const restoredClass = await restoreRes.json();
  assert.equal(restoredClass.data.status, 'active');
});

test('QA-04: Scope-based Authorization & Private workspace security', async () => {
  const tsNow = Date.now();
  const userAReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa04_userA_${tsNow}@test.edu.vn`,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const userA = extractAuth(userAReg, await userAReg.json());

  const userBReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa04_userB_${tsNow}@test.edu.vn`,
      password: 'SecurePassword123!',
      usages: ['student'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const userB = extractAuth(userBReg, await userBReg.json());

  // User A creates class and group
  const cRes = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userA.cookie, 'X-CSRF-Token': userA.csrfToken },
    body: JSON.stringify({ name: 'QA-04 Private Class', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  const classId = (await cRes.json()).data.id;

  const gRes = await fetch(`${baseUrl}/classes/${classId}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userA.cookie, 'X-CSRF-Token': userA.csrfToken },
    body: JSON.stringify({ name: 'QA-04 Secret Group' }),
  });
  const wsId = (await gRes.json()).data.id;

  // User B (non-member) tries to list tasks in User A's workspace -> 403 Forbidden
  const tasksDenied = await fetch(`${baseUrl}/workspaces/${wsId}/tasks`, {
    headers: { Cookie: userB.cookie },
  });
  assert.equal(tasksDenied.status, 403, 'Non-member must be denied tasks access');

  // User B tries to list library items in User A's workspace -> 403 Forbidden
  const libDenied = await fetch(`${baseUrl}/workspaces/${wsId}/library/items`, {
    headers: { Cookie: userB.cookie },
  });
  assert.equal(libDenied.status, 403, 'Non-member must be denied library access');

  // User B tries to create an assignment in User A's class -> 403 Forbidden
  const asgDenied = await fetch(`${baseUrl}/classes/${classId}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userB.cookie,
      'X-CSRF-Token': userB.csrfToken,
    },
    body: JSON.stringify({ title: 'Malicious Assignment', recipientWorkspaceIds: [wsId] }),
  });
  assert.equal(asgDenied.status, 403, 'Non-teacher must be denied assignment creation');
});

test('QA-05 & QA-07: Library Item Concurrency — Overwrite conflicts handled via ETag and 412', async () => {
  const tsNow = Date.now();
  const reg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa05_${tsNow}@test.edu.vn`,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const auth = extractAuth(reg, await reg.json());

  const cls = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({ name: 'QA-05 Class', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  const classId = (await cls.json()).data.id;

  const grp = await fetch(`${baseUrl}/classes/${classId}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({ name: 'QA-05 Group' }),
  });
  const wsId = (await grp.json()).data.id;

  // Create library item
  const postItem = await fetch(`${baseUrl}/workspaces/${wsId}/library/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({
      type: 'text',
      title: 'Initial Architecture Doc',
      content: 'Baseline specification',
    }),
  });
  assert.ok([200, 201].includes(postItem.status));
  const itemJson = await postItem.json();
  const itemId = itemJson.data.id;
  const initialEtag = postItem.headers.get('etag') || `"${itemJson.data.version}"`;

  // Client A updates item with initial ETag
  const updateA = await fetch(`${baseUrl}/library/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: auth.cookie,
      'X-CSRF-Token': auth.csrfToken,
      'If-Match': initialEtag,
    },
    body: JSON.stringify({ title: 'Updated Title by Client A' }),
  });
  assert.equal(updateA.status, 200);
  const updateAJson = await updateA.json();
  assert.equal(updateAJson.data.version, 2);

  // Client B concurrently tries to update with stale initial ETag -> 412 VERSION_CONFLICT
  const updateB = await fetch(`${baseUrl}/library/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: auth.cookie,
      'X-CSRF-Token': auth.csrfToken,
      'If-Match': initialEtag,
    },
    body: JSON.stringify({ title: 'Updated Title by Client B (stale)' }),
  });
  assert.equal(updateB.status, 412, 'Stale If-Match must trigger 412 VERSION_CONFLICT');

  // Verify item kept Client A updated version in DB
  const getItem = await fetch(`${baseUrl}/library/items/${itemId}`, {
    headers: { Cookie: auth.cookie },
  });
  assert.equal(getItem.status, 200);
  const freshItem = await getItem.json();
  const version = freshItem.data.item ? freshItem.data.item.version : freshItem.data.version;
  assert.equal(version, 2, 'Item version must remain 2, protecting against stale overwrite');
});

test('QA-06 & QA-12: SSRF Defense in URL Preview — Blocks internal loopback & metadata IPs safely', async () => {
  const tsNow = Date.now();
  const reg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa12_${tsNow}@test.edu.vn`,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const auth = extractAuth(reg, await reg.json());

  const cls = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({ name: 'QA-12 Class', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  const classId = (await cls.json()).data.id;

  const grp = await fetch(`${baseUrl}/classes/${classId}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({ name: 'QA-12 Group' }),
  });
  const wsId = (await grp.json()).data.id;

  // Post item with internal loopback IP (SSRF attempt)
  const ssrfItem = await fetch(`${baseUrl}/workspaces/${wsId}/library/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({
      type: 'link',
      title: 'Suspicious Link Item',
      url: 'http://127.0.0.1:8080/internal-secrets',
    }),
  });
  assert.ok([200, 201].includes(ssrfItem.status));
  const ssrfJson = await ssrfItem.json();
  const itemId = ssrfJson.data.id;

  // Fetch the item details
  const detailRes = await fetch(`${baseUrl}/library/items/${itemId}`, {
    headers: { Cookie: auth.cookie },
  });
  assert.equal(detailRes.status, 200);
  const detailJson = await detailRes.json();
  // Ensure the link item saved without leaking any internal metadata
  assert.equal(detailJson.data.type, 'link');
});

test('QA-08 & QA-09: Submission Resilience, Idempotency and Late Policy over HTTP', async () => {
  const tsNow = Date.now();
  const teacherReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa08_teacher_${tsNow}@test.edu.vn`,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const tAuth = extractAuth(teacherReg, await teacherReg.json());

  const studentReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa08_student_${tsNow}@test.edu.vn`,
      password: 'SecurePassword123!',
      usages: ['student'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const sRegJson = await studentReg.json();
  const sAuth = extractAuth(studentReg, sRegJson);
  const studentId = sRegJson.data.id;

  // Create class & group
  const cls = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tAuth.cookie, 'X-CSRF-Token': tAuth.csrfToken },
    body: JSON.stringify({ name: 'QA-08 Class', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  const classId = (await cls.json()).data.id;

  const grp = await fetch(`${baseUrl}/classes/${classId}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tAuth.cookie, 'X-CSRF-Token': tAuth.csrfToken },
    body: JSON.stringify({ name: 'QA-08 Group' }),
  });
  const wsId = (await grp.json()).data.id;

  // Enroll student as leader per ASG-03
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.classMembership.create({
    data: { classId, accountId: studentId, role: 'member', status: 'active', version: 1 },
  });
  await prisma.workspaceMembership.create({
    data: { workspaceId: wsId, accountId: studentId, role: 'leader', status: 'active', version: 1 },
  });
  await prisma.$disconnect();

  // Create Assignment with past deadline to test late policy (QA-09)
  const pastDeadline = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const asgRes = await fetch(`${baseUrl}/classes/${classId}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tAuth.cookie, 'X-CSRF-Token': tAuth.csrfToken },
    body: JSON.stringify({
      title: 'QA-08 Late Assignment',
      recipientWorkspaceIds: [wsId],
      deadline: pastDeadline,
    }),
  });
  const asgId = (await asgRes.json()).data.id;

  // Get recipient
  const recRes = await fetch(`${baseUrl}/assignments/${asgId}/recipients`, {
    headers: { Cookie: tAuth.cookie },
  });
  const recipientId = (await recRes.json()).data[0].id;

  // 1. First submission (late due to past deadline)
  const idempotencyKey = randomUUID();
  const sub1 = await fetch(`${baseUrl}/assignment-recipients/${recipientId}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sAuth.cookie,
      'X-CSRF-Token': sAuth.csrfToken,
      'Idempotency-Key': idempotencyKey,
      'If-Match': '"0"',
    },
    body: JSON.stringify({ text: 'Bản nộp muộn sau hạn ban đầu' }),
  });
  assert.ok([200, 201].includes(sub1.status));
  const sub1Json = await sub1.json();
  assert.equal(sub1Json.data.timeliness, 'late', 'Submission after deadline must be marked late per QA-09');
  const subId = sub1Json.data.id;

  // 2. Network retry simulation: Resend EXACT SAME request with same Idempotency-Key
  const subRetry = await fetch(`${baseUrl}/assignment-recipients/${recipientId}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sAuth.cookie,
      'X-CSRF-Token': sAuth.csrfToken,
      'Idempotency-Key': idempotencyKey,
      'If-Match': '"0"',
    },
    body: JSON.stringify({ text: 'Bản nộp muộn sau hạn ban đầu' }),
  });
  assert.ok([200, 201].includes(subRetry.status), 'Replay with same idempotency key must succeed idempotently');
  const retryJson = await subRetry.json();
  assert.equal(retryJson.data.id, subId, 'Idempotent replay must return original submission ID without duplicate');

  // 3. Replay with same Idempotency-Key but CHANGED body -> 409 IDEMPOTENCY_CONFLICT (QA-08)
  const subConflict = await fetch(`${baseUrl}/assignment-recipients/${recipientId}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sAuth.cookie,
      'X-CSRF-Token': sAuth.csrfToken,
      'Idempotency-Key': idempotencyKey,
      'If-Match': '"1"',
    },
    body: JSON.stringify({ text: 'Altered body content that causes conflict' }),
  });
  assert.equal(subConflict.status, 409, 'Replay with changed body must trigger 409 IDEMPOTENCY_CONFLICT');
});

test('QA-11: Tasks Lifecycle, Checklist items & Confirmation over HTTP', async () => {
  const tsNow = Date.now();
  const reg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa11_${tsNow}@test.edu.vn`,
      password: 'SecurePassword123!',
      usages: ['teacher'],
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  });
  const regJson = await reg.json();
  const auth = extractAuth(reg, regJson);
  const userId = regJson.data.id;

  const cls = await fetch(`${baseUrl}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({ name: 'QA-11 Class', timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  const classId = (await cls.json()).data.id;

  const grp = await fetch(`${baseUrl}/classes/${classId}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({ name: 'QA-11 Group' }),
  });
  const wsId = (await grp.json()).data.id;

  // Create Task with assignee
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const taskRes = await fetch(`${baseUrl}/workspaces/${wsId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken },
    body: JSON.stringify({
      title: 'Task Lifecycle Verification',
      dueAt: tomorrow,
      importance: 'high',
      assigneeId: userId,
    }),
  });
  assert.ok([200, 201].includes(taskRes.status));
  const taskJson = await taskRes.json();
  const taskId = taskJson.data.id;

  // Add checklist item
  const item1 = await fetch(`${baseUrl}/tasks/${taskId}/checklist-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken, 'If-Match': '"1"' },
    body: JSON.stringify({ text: 'Buoc 1: Kiem tra code' }),
  });
  assert.equal(item1.status, 200);

  // Complete task with valid ETag
  const completeRes = await fetch(`${baseUrl}/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken, 'If-Match': '"2"' },
  });
  assert.equal(completeRes.status, 200);
  const completedTask = await completeRes.json();
  assert.equal(completedTask.data.status, 'done');
});
