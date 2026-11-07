import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { DomainError, type AuthorizationPort, type Principal } from '../../core/authorization';
import { TasksService } from './tasks.service';

test('QA-04 & TASK-14: member can create unassigned task; reassigning requires task.assign', async () => {
  const allowedActions = new Set<string>(['task.create', 'task.read']);
  const mockAuth: AuthorizationPort = {
    decide: async (_principal, action) => ({ allowed: allowedActions.has(action) }),
  };

  const service = new TasksService(mockAuth);
  const user1: Principal = { accountId: 'user-1' };

  // 1. Create unassigned task in workspace successfully
  const { task, etag } = await service.createTask(user1, 'ws-1', {
    title: 'Nhiem vu chung nhom',
    importance: 'medium',
  });
  assert.equal(task.title, 'Nhiem vu chung nhom');
  assert.equal(task.assigneeId, undefined);
  assert.equal(etag, '"1"');

  // 2. Assigning without task.assign permission fails with 403 FORBIDDEN
  await assert.rejects(
    service.createTask(user1, 'ws-1', {
      title: 'Viec co nguoi nhan',
      assigneeId: 'user-2',
    }),
    (err: unknown) => err instanceof DomainError && err.status === 403,
  );

  // 3. Grant task.assign and reassign successfully
  allowedActions.add('task.assign');
  const { task: reassigned } = await service.reassignTask(user1, task.id, { assigneeId: 'user-2' }, etag);
  assert.equal(reassigned.assigneeId, 'user-2');
  assert.equal(reassigned.version, 2);
});

test('QA-11 & EC-18: Reassigning task keeps private work sessions with previous owner (no leak or transfer)', async () => {
  const service = new TasksService();
  const teacher: Principal = { accountId: 'teacher-1' };
  const userA: Principal = { accountId: 'student-a' };
  const userB: Principal = { accountId: 'student-b' };

  // Create task assigned to userA
  const { task, etag } = await service.createTask(teacher, 'ws-class', {
    title: 'Bao cao giai doan 1',
    dueAt: '2026-11-15T17:00:00Z',
    assigneeId: userA.accountId,
  });

  // UserA books a private work session
  const { session: sessionA } = await service.createWorkSession(userA, {
    taskId: task.id,
    startAt: '2026-11-10T09:00:00Z',
    endAt: '2026-11-10T11:00:00Z',
  });

  // Reassign task to userB
  const { task: updatedTask } = await service.reassignTask(teacher, task.id, { assigneeId: userB.accountId }, etag);
  assert.equal(updatedTask.assigneeId, userB.accountId);

  // Verify: UserA still owns their private work session
  const { sessions: sessionsA } = await service.listWorkSessions(userA);
  assert.equal(sessionsA.length, 1);
  assert.equal(sessionsA[0].id, sessionA.id);

  // Verify: UserB does NOT inherit UserA's private work session
  const { sessions: sessionsB } = await service.listWorkSessions(userB);
  assert.equal(sessionsB.length, 0);

  // Audits show the reassignment event
  const audits = service.getAudits(task.id);
  const reassignAudit = audits.find(a => a.action === 'task.reassign');
  assert.ok(reassignAudit);
  assert.equal(reassignAudit.change.previousAssignee, userA.accountId);
  assert.equal(reassignAudit.change.newAssignee, userB.accountId);
});

test('QA-11 & EC-17: Checklist 0 items does not show 100%; completion requires explicit confirmation', async () => {
  const service = new TasksService();
  const user: Principal = { accountId: 'user-checklist' };

  const { task, etag } = await service.createTask(user, 'ws-1', {
    title: 'Kiem tra checklist',
    assigneeId: user.accountId,
  });

  // Initially 0 checklist items
  const items0 = await service.getChecklistItems(user, task.id);
  assert.equal(items0.length, 0);
  assert.equal(task.status, 'todo'); // Not done

  // Add 1 checklist item
  const { task: t2, checklistItem: item1 } = await service.addChecklistItem(user, task.id, { text: 'Muc 1' }, etag);
  assert.equal(t2.version, 2);

  // Mark item1 done
  const { task: t3 } = await service.updateChecklistItem(user, task.id, item1.id, { text: item1.text, done: true }, `"${t2.version}"`);
  assert.equal(t3.status, 'todo'); // Still 'todo', marking checklist done does NOT auto-complete task!

  // Complete task explicitly
  const { task: t4 } = await service.completeTask(user, task.id, `"${t3.version}"`);
  assert.equal(t4.status, 'done');

  // Add checklist item to already completed task: task remains 'done' (does not reopen without explicit action)
  const { task: t5 } = await service.addChecklistItem(user, task.id, { text: 'Muc 2 chua xong' }, `"${t4.version}"`);
  assert.equal(t5.status, 'done');

  // Reopen explicitly
  const { task: t6 } = await service.reopenTask(user, task.id, `"${t5.version}"`);
  assert.equal(t6.status, 'todo');
});

test('Bulk actions: version conflict rejects with 412 VERSION_CONFLICT', async () => {
  const service = new TasksService();
  const user: Principal = { accountId: 'user-bulk' };

  const { task: t1 } = await service.createTask(user, 'ws-1', { title: 'Viec 1' });
  const { task: t2 } = await service.createTask(user, 'ws-1', { title: 'Viec 2' });

  // Update t1 to advance its version from 1 to 2
  await service.updateTask(user, t1.id, { title: 'Viec 1 sua' }, `"${t1.version}"`);

  // Bulk action with stale version for t1 (provided version 1, current is 2)
  await assert.rejects(
    service.bulkActions(user, {
      items: [
        { id: t1.id, version: 1 }, // stale version!
        { id: t2.id, version: 1 },
      ],
      action: 'archive',
    }),
    (err: unknown) => err instanceof DomainError && err.status === 412,
  );

  // Bulk action with correct versions succeeds
  const { tasks: archived } = await service.bulkActions(user, {
    items: [
      { id: t1.id, version: 2 },
      { id: t2.id, version: 1 },
    ],
    action: 'archive',
  });
  assert.equal(archived.length, 2);
  assert.ok(archived.every(t => t.status === 'done'));
});

test('TASK-07: Private work session after due date receives isLate = true ("Làm muộn")', async () => {
  const service = new TasksService();
  const user: Principal = { accountId: 'user-session' };

  const { task } = await service.createTask(user, 'ws-1', {
    title: 'Bao cao',
    dueAt: '2026-11-10T12:00:00Z',
  });

  // Session before deadline -> isLate false
  const sEarly = await service.createWorkSession(user, {
    taskId: task.id,
    startAt: '2026-11-09T08:00:00Z',
    endAt: '2026-11-09T10:00:00Z',
  });
  assert.equal(sEarly.isLate, false);

  // Session after deadline -> isLate true
  const sLate = await service.createWorkSession(user, {
    taskId: task.id,
    startAt: '2026-11-11T08:00:00Z',
    endAt: '2026-11-11T10:00:00Z',
  });
  assert.equal(sLate.isLate, true);
});

test('TASK-11 & TASK-17: listMyTasks sorts correctly (Overdue -> Today -> Session Today -> Unscheduled by priority)', async () => {
  const service = new TasksService();
  const user: Principal = { accountId: 'user-sort' };
  const now = new Date('2026-11-10T10:00:00Z');

  // 1. Overdue incomplete
  const { task: tOverdue } = await service.createTask(user, 'ws-1', {
    title: 'Qua han',
    dueAt: '2026-11-08T10:00:00Z',
    assigneeId: user.accountId,
  });

  // 2. Due today
  const { task: tDueToday } = await service.createTask(user, 'ws-1', {
    title: 'Han hom nay',
    dueAt: '2026-11-10T18:00:00Z',
    assigneeId: user.accountId,
  });

  // 3. Due next week but has work session today
  const { task: tSessionToday } = await service.createTask(user, 'ws-1', {
    title: 'Buoi lam hom nay',
    dueAt: '2026-11-20T10:00:00Z',
    assigneeId: user.accountId,
  });
  await service.createWorkSession(user, {
    taskId: tSessionToday.id,
    startAt: '2026-11-10T14:00:00Z',
    endAt: '2026-11-10T16:00:00Z',
  });

  // 4. Unscheduled with High importance
  const { task: tUnscheduledHigh } = await service.createTask(user, 'ws-1', {
    title: 'Chua len lich Cao',
    importance: 'high',
    assigneeId: user.accountId,
  });

  // 5. Unscheduled with Low importance
  const { task: tUnscheduledLow } = await service.createTask(user, 'ws-1', {
    title: 'Chua len lich Thap',
    importance: 'low',
    assigneeId: user.accountId,
  });

  const { tasks } = await service.listMyTasks(user, { now, timeZone: 'UTC' });

  assert.equal(tasks[0].id, tOverdue.id);
  assert.equal(tasks[1].id, tDueToday.id);
  assert.equal(tasks[2].id, tSessionToday.id);
  assert.equal(tasks[3].id, tUnscheduledHigh.id);
  assert.equal(tasks[4].id, tUnscheduledLow.id);
});
