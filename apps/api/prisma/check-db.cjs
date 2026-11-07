const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');

const db = new PrismaClient();
async function expectConstraint(work) {
  let rejected = false;
  try { await work(); } catch (error) { rejected = true; }
  assert.equal(rejected, true, 'database constraint should reject invalid row');
}

async function main() {
  const accountId = randomUUID();
  const classId = randomUUID();
  await db.$executeRaw`INSERT INTO "Account" ("id","email","passwordHash","updatedAt") VALUES (${accountId}::uuid, ${`check-${accountId}@example.invalid`}, 'unusable', CURRENT_TIMESTAMP)`;
  await db.$executeRaw`INSERT INTO "Class" ("id","ownerId","name","timeZone","updatedAt") VALUES (${classId}::uuid, ${accountId}::uuid, 'Fixture class', 'UTC', CURRENT_TIMESTAMP)`;
  await db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${accountId}::uuid, 'active', CURRENT_TIMESTAMP)`;
  await expectConstraint(() => db.$executeRaw`INSERT INTO "ClassMembership" ("id","classId","accountId","status","updatedAt") VALUES (${randomUUID()}::uuid, ${classId}::uuid, ${accountId}::uuid, 'active', CURRENT_TIMESTAMP)`);
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Workspace" ("id","kind","timeZone","updatedAt") VALUES (${randomUUID()}::uuid, 'class_group', 'UTC', CURRENT_TIMESTAMP)`);
  await expectConstraint(() => db.$executeRaw`INSERT INTO "Event" ("id","scopeType","scopeId","kind","title","updatedAt") VALUES (${randomUUID()}::uuid, 'class', ${classId}::uuid, 'all_day', 'Invalid', CURRENT_TIMESTAMP)`);
  console.log('PASS: active membership unique, workspace scope, event time shape');
}
main().finally(() => db.$disconnect());
