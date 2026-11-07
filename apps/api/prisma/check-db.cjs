const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');

const db = new PrismaClient();
async function expectConstraint(work, postgresCode) {
  await assert.rejects(work, (error) => {
    assert.equal(error.meta?.code, postgresCode, `expected PostgreSQL constraint ${postgresCode}`);
    return true;
  });
}

async function main() {
  const accountId = randomUUID();
  const classId = randomUUID();
  await db.$executeRaw`INSERT INTO "Account" ("id","email","passwordHash","timeZone","updatedAt") VALUES (${accountId}::uuid, ${`check-${accountId}@example.invalid`}, 'unusable', 'UTC', CURRENT_TIMESTAMP)`;
  const [account] = await db.$queryRaw`SELECT "timeZone" FROM "Account" WHERE "id" = ${accountId}::uuid`;
  assert.equal(account.timeZone, 'UTC');
  await db.$executeRaw`INSERT INTO "PasswordResetToken" ("id","accountId","tokenHash","expiresAt") VALUES (${randomUUID()}::uuid, ${accountId}::uuid, 'fixture-reset-hash', CURRENT_TIMESTAMP + INTERVAL '1 hour')`;
  await expectConstraint(() => db.$executeRaw`INSERT INTO "PasswordResetToken" ("id","accountId","tokenHash","expiresAt") VALUES (${randomUUID()}::uuid, ${accountId}::uuid, 'fixture-reset-hash', CURRENT_TIMESTAMP + INTERVAL '1 hour')`, '23505');
  await db.$executeRaw`INSERT INTO "Class" ("id","ownerId","name","timeZone","updatedAt") VALUES (${classId}::uuid, ${accountId}::uuid, 'Fixture class', 'UTC', CURRENT_TIMESTAMP)`;
  await db.$executeRaw`INSERT INTO "ClassJoinCode" ("classId","codeHash","enabled","updatedAt") VALUES (${classId}::uuid, 'fixture-hash', true, CURRENT_TIMESTAMP)`;
  const secondClassId = randomUUID();
  await db.$executeRaw`INSERT INTO "Class" ("id","ownerId","name","timeZone","updatedAt") VALUES (${secondClassId}::uuid, ${accountId}::uuid, 'Second fixture class', 'UTC', CURRENT_TIMESTAMP)`;
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassJoinCode" ("classId","enabled","updatedAt") VALUES (${secondClassId}::uuid, true, CURRENT_TIMESTAMP)`, '23514');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassJoinCode" ("classId","codeHash","enabled","updatedAt") VALUES (${secondClassId}::uuid, 'fixture-hash', true, CURRENT_TIMESTAMP)`, '23505');
  await db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${accountId}::uuid, 'active', CURRENT_TIMESTAMP)`;
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${accountId}::uuid, 'active', CURRENT_TIMESTAMP)`, '23505');
  const monitorId = randomUUID();
  const secondMonitorId = randomUUID();
  for (const id of [monitorId, secondMonitorId]) {
    await db.$executeRaw`INSERT INTO "Account" ("id","email","passwordHash","timeZone","updatedAt") VALUES (${id}::uuid, ${`check-${id}@example.invalid`}, 'unusable', 'UTC', CURRENT_TIMESTAMP)`;
  }
  await db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","role","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${monitorId}::uuid, 'monitor', 'active', CURRENT_TIMESTAMP)`;
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","role","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${secondMonitorId}::uuid, 'monitor', 'active', CURRENT_TIMESTAMP)`, '23505');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","role","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${secondMonitorId}::uuid, 'leader', 'pending', CURRENT_TIMESTAMP)`, '23514');
  const workspaceId = randomUUID();
  await db.$executeRaw`INSERT INTO "Workspace" ("id","name","kind","ownerId","timeZone","updatedAt") VALUES (${workspaceId}::uuid, 'Nhóm thử', 'independent', ${accountId}::uuid, 'UTC', CURRENT_TIMESTAMP)`;
  const [workspace] = await db.$queryRaw`SELECT "name" FROM "Workspace" WHERE "id" = ${workspaceId}::uuid`;
  assert.equal(workspace.name, 'Nhóm thử');
  const folderId = randomUUID();
  await db.$executeRaw`INSERT INTO "Folder" ("id","workspaceId","name","updatedAt") VALUES (${folderId}::uuid, ${workspaceId}::uuid, 'Nguồn', CURRENT_TIMESTAMP)`;
  const [folder] = await db.$queryRaw`SELECT "version" FROM "Folder" WHERE "id" = ${folderId}::uuid`;
  assert.equal(folder.version, 1);
  const taskId = randomUUID();
  await db.$executeRaw`INSERT INTO "Task" ("id","workspaceId","title","updatedAt") VALUES (${taskId}::uuid, ${workspaceId}::uuid, 'Việc thử', CURRENT_TIMESTAMP)`;
  const sessionId = randomUUID();
  await db.$executeRaw`INSERT INTO "PrivateWorkSession" ("id","taskId","ownerId","startAt","endAt","updatedAt") VALUES (${sessionId}::uuid, ${taskId}::uuid, ${accountId}::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 hour', CURRENT_TIMESTAMP)`;
  const [session] = await db.$queryRaw`SELECT "version" FROM "PrivateWorkSession" WHERE "id" = ${sessionId}::uuid`;
  assert.equal(session.version, 1);
  const assignmentId = randomUUID();
  await db.$executeRaw`INSERT INTO "Assignment" ("id","classId","title","updatedAt") VALUES (${assignmentId}::uuid, ${classId}::uuid, 'Bài thử', CURRENT_TIMESTAMP)`;
  const recipientId = randomUUID();
  await db.$executeRaw`INSERT INTO "AssignmentRecipient" ("id","assignmentId","workspaceId","updatedAt") VALUES (${recipientId}::uuid, ${assignmentId}::uuid, ${workspaceId}::uuid, CURRENT_TIMESTAMP)`;
  const [recipient] = await db.$queryRaw`SELECT "version" FROM "AssignmentRecipient" WHERE "id" = ${recipientId}::uuid`;
  assert.equal(recipient.version, 1);
  const grantId = randomUUID();
  await db.$executeRaw`INSERT INTO "Grant" ("id","principalId","scopeType","scopeId","action") VALUES (${grantId}::uuid, ${accountId}::uuid, 'workspace', ${workspaceId}::uuid, 'task.create')`;
  const [grant] = await db.$queryRaw`SELECT "version" FROM "Grant" WHERE "id" = ${grantId}::uuid`;
  assert.equal(grant.version, 1);
  const transferId = randomUUID();
  await db.$executeRaw`INSERT INTO "TransferRequest" ("id","targetType","targetId","initiatorId","recipientId","updatedAt") VALUES (${transferId}::uuid, 'class', ${classId}::uuid, ${accountId}::uuid, ${monitorId}::uuid, CURRENT_TIMESTAMP)`;
  const [transfer] = await db.$queryRaw`SELECT "version","targetType" FROM "TransferRequest" WHERE "id" = ${transferId}::uuid`;
  assert.equal(transfer.version, 1);
  assert.equal(transfer.targetType, 'class');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "TransferRequest" ("id","targetType","targetId","initiatorId","recipientId","updatedAt") VALUES (${randomUUID()}::uuid, 'other', ${workspaceId}::uuid, ${accountId}::uuid, ${monitorId}::uuid, CURRENT_TIMESTAMP)`, '23514');
  const invitationId = randomUUID();
  await db.$executeRaw`INSERT INTO "Invitation" ("id","targetType","targetId","initiatorId","recipientId","updatedAt") VALUES (${invitationId}::uuid, 'class', ${classId}::uuid, ${accountId}::uuid, ${secondMonitorId}::uuid, CURRENT_TIMESTAMP)`;
  const [invitation] = await db.$queryRaw`SELECT "version","status" FROM "Invitation" WHERE "id" = ${invitationId}::uuid`;
  assert.equal(invitation.version, 1);
  assert.equal(invitation.status, 'pending');
  const joinRequestId = randomUUID();
  await db.$executeRaw`INSERT INTO "JoinRequest" ("id","targetType","targetId","initiatorId","updatedAt") VALUES (${joinRequestId}::uuid, 'class', ${classId}::uuid, ${secondMonitorId}::uuid, CURRENT_TIMESTAMP)`;
  const [joinRequest] = await db.$queryRaw`SELECT "version","status" FROM "JoinRequest" WHERE "id" = ${joinRequestId}::uuid`;
  assert.equal(joinRequest.version, 1);
  assert.equal(joinRequest.status, 'pending');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Invitation" ("id","targetType","targetId","initiatorId","recipientId","updatedAt") VALUES (${randomUUID()}::uuid, 'other', ${classId}::uuid, ${accountId}::uuid, ${secondMonitorId}::uuid, CURRENT_TIMESTAMP)`, '23514');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "JoinRequest" ("id","targetType","targetId","initiatorId","updatedAt") VALUES (${randomUUID()}::uuid, 'other', ${classId}::uuid, ${secondMonitorId}::uuid, CURRENT_TIMESTAMP)`, '23514');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Workspace" ("id","kind","ownerId","timeZone","updatedAt") VALUES (${randomUUID()}::uuid, 'independent', ${accountId}::uuid, 'UTC', CURRENT_TIMESTAMP)`, '23502');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Workspace" ("id","name","kind","timeZone","updatedAt") VALUES (${randomUUID()}::uuid, 'Sai scope', 'class_group', 'UTC', CURRENT_TIMESTAMP)`, '23514');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Event" ("id","scopeType","scopeId","kind","title","updatedAt") VALUES (${randomUUID()}::uuid, 'class', ${classId}::uuid, 'all_day', 'Invalid', CURRENT_TIMESTAMP)`, '23514');
  console.log('PASS: account/reset, join code, memberships, versioned folder/session/recipient, workspace, grants/transfers, invitation/request, event');
}
main().finally(() => db.$disconnect());
