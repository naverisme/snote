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
  await db.$executeRaw`INSERT INTO "Account" ("id","email","passwordHash","updatedAt") VALUES (${accountId}::uuid, ${`check-${accountId}@example.invalid`}, 'unusable', CURRENT_TIMESTAMP)`;
  await db.$executeRaw`INSERT INTO "Class" ("id","ownerId","name","timeZone","updatedAt") VALUES (${classId}::uuid, ${accountId}::uuid, 'Fixture class', 'UTC', CURRENT_TIMESTAMP)`;
  await db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${accountId}::uuid, 'active', CURRENT_TIMESTAMP)`;
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${accountId}::uuid, 'active', CURRENT_TIMESTAMP)`, '23505');
  const monitorId = randomUUID();
  const secondMonitorId = randomUUID();
  for (const id of [monitorId, secondMonitorId]) {
    await db.$executeRaw`INSERT INTO "Account" ("id","email","passwordHash","updatedAt") VALUES (${id}::uuid, ${`check-${id}@example.invalid`}, 'unusable', CURRENT_TIMESTAMP)`;
  }
  await db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","role","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${monitorId}::uuid, 'monitor', 'active', CURRENT_TIMESTAMP)`;
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","role","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${secondMonitorId}::uuid, 'monitor', 'active', CURRENT_TIMESTAMP)`, '23505');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","role","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${secondMonitorId}::uuid, 'leader', 'pending', CURRENT_TIMESTAMP)`, '23514');
  const workspaceId = randomUUID();
  await db.$executeRaw`INSERT INTO "Workspace" ("id","name","kind","ownerId","timeZone","updatedAt") VALUES (${workspaceId}::uuid, 'Nhóm thử', 'independent', ${accountId}::uuid, 'UTC', CURRENT_TIMESTAMP)`;
  const [workspace] = await db.$queryRaw`SELECT "name" FROM "Workspace" WHERE "id" = ${workspaceId}::uuid`;
  assert.equal(workspace.name, 'Nhóm thử');
  const grantId = randomUUID();
  await db.$executeRaw`INSERT INTO "Grant" ("id","principalId","scopeType","scopeId","action") VALUES (${grantId}::uuid, ${accountId}::uuid, 'workspace', ${workspaceId}::uuid, 'task.create')`;
  const [grant] = await db.$queryRaw`SELECT "version" FROM "Grant" WHERE "id" = ${grantId}::uuid`;
  assert.equal(grant.version, 1);
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Workspace" ("id","kind","ownerId","timeZone","updatedAt") VALUES (${randomUUID()}::uuid, 'independent', ${accountId}::uuid, 'UTC', CURRENT_TIMESTAMP)`, '23502');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Workspace" ("id","name","kind","timeZone","updatedAt") VALUES (${randomUUID()}::uuid, 'Sai scope', 'class_group', 'UTC', CURRENT_TIMESTAMP)`, '23514');
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Event" ("id","scopeType","scopeId","kind","title","updatedAt") VALUES (${randomUUID()}::uuid, 'class', ${classId}::uuid, 'all_day', 'Invalid', CURRENT_TIMESTAMP)`, '23514');
  console.log('PASS: active membership/monitor unique, role check, workspace name/scope, grant version, event time shape');
}
main().finally(() => db.$disconnect());
