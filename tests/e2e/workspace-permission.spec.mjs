import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { IdentityService } from '../../apps/api/dist/modules/identity/identity.service.js';
import { InMemorySessionStore } from '../../apps/api/dist/modules/identity/session-store.js';
import { ClassService } from '../../apps/api/dist/modules/classes/class-service.js';
import { WorkspaceService } from '../../apps/api/dist/modules/workspaces/workspace-service.js';

test('workspace management checks current scope before inviting, removing or reviewing requests', async () => {
  const db = new PrismaClient();
  try {
    const identity = new IdentityService(db, new InMemorySessionStore());
    const workspaces = new WorkspaceService(db);
    const classes = new ClassService(db);
    const suffix = randomUUID().slice(0, 8);
    const register = async (name, usages) => (await identity.register({
      email: `${name}-${suffix}@example.invalid`, password: 'password-123456', usages, timeZone: 'UTC',
    })).account;
    const teacher = await register('teacher', ['teacher']);
    const learner = await register('learner', ['student']);
    const outsider = await register('outsider', ['personal']);
    const independent = await workspaces.createWorkspace(teacher.id, { name: 'Shared' });

    await assert.rejects(() => workspaces.createWorkspaceInvitation(outsider.id, independent.id, learner.id),
      { code: 'FORBIDDEN' });
    await assert.rejects(() => workspaces.removeGroupMember(outsider.id, independent.id, teacher.id),
      { code: 'FORBIDDEN' });
    const invitation = await workspaces.createWorkspaceInvitation(teacher.id, independent.id, learner.id);
    assert.equal(invitation.recipientId, learner.id);

    const cls = await classes.create(teacher.id, { name: 'Class', timeZone: 'UTC' });
    await db.classMembership.create({ data: { classId: cls.id, accountId: learner.id, status: 'active' } });
    await assert.rejects(() => workspaces.createClassGroup(learner.id, cls.id, { name: 'Unauthorized group' }),
      { code: 'FORBIDDEN' });
    const group = await workspaces.createClassGroup(teacher.id, cls.id, { name: 'Real group' });
    const request = await workspaces.createGroupJoinRequest(learner.id, group.id);
    await assert.rejects(() => workspaces.listGroupJoinRequests(learner.id, group.id),
      { code: 'FORBIDDEN' });
    await assert.rejects(() => workspaces.declineGroupJoinRequest(learner.id, request.id),
      { code: 'FORBIDDEN' });
    assert.equal((await workspaces.listGroupJoinRequests(teacher.id, group.id)).length, 1);
  } finally { await db.$disconnect(); }
});
