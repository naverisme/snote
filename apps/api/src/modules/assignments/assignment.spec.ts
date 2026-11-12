import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { AssignmentService } from './assignment.service';
import { OutboxService } from '../notifications/outbox.service';
import { NotificationService } from '../notifications/notification.service';
import { DomainError } from '../../core/authorization';

function createMockPrisma() {
  const classes = new Map<string, any>([
    ['c_1', { id: 'c_1', ownerId: 'teacher_1', name: 'Class 1', status: 'active', timeZone: 'Asia/Ho_Chi_Minh', version: 1 }],
    ['c_archived', { id: 'c_archived', ownerId: 'teacher_1', name: 'Archived Class', status: 'archived', timeZone: 'UTC', version: 1 }],
  ]);

  const workspaces = new Map<string, any>([
    ['w_1', { id: 'w_1', classId: 'c_1', name: 'Group 1', status: 'active', version: 1 }],
    ['w_2', { id: 'w_2', classId: 'c_1', name: 'Group 2', status: 'active', version: 1 }],
    ['w_other', { id: 'w_other', classId: 'c_other', name: 'Other Group', status: 'active', version: 1 }],
  ]);

  const assignments = new Map<string, any>();
  const recipients = new Map<string, any>();
  const grants = new Map<string, any>();
  const classMemberships = new Map<string, any>();
  const workspaceMemberships = new Map<string, any>();
  const submissionRevisions = new Map<string, any>();
  const tasks = new Map<string, any>();
  const checklistItems = new Map<string, any>();
  const auditEvents: any[] = [];
  const outboxEvents: any[] = [];

  const mock: any = {
    class: {
      findUnique: async ({ where }: any) => classes.get(where.id) || null,
    },
    workspace: {
      findMany: async ({ where }: any) => {
        const ids: string[] = where.id.in;
        return ids
          .map(id => workspaces.get(id))
          .filter(w => w && (where.classId === undefined || w.classId === where.classId) && (where.status === undefined || w.status === where.status));
      },
    },
    assignment: {
      findUnique: async ({ where }: any) => assignments.get(where.id) || null,
      findMany: async ({ where }: any) => {
        return Array.from(assignments.values()).filter(a => a.classId === where.classId);
      },
      create: async ({ data }: any) => {
        const record = {
          id: `asg_${assignments.size + 1}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        assignments.set(record.id, record);
        return record;
      },
      update: async ({ where, data }: any) => {
        const item = assignments.get(where.id);
        if (!item) throw new Error('Not found');
        const updated = { ...item, ...data, updatedAt: new Date() };
        assignments.set(where.id, updated);
        return updated;
      },
    },
    assignmentRecipient: {
      findMany: async ({ where }: any) => {
        return Array.from(recipients.values()).filter(r => r.assignmentId === where.assignmentId);
      },
      findFirst: async ({ where }: any) => {
        return Array.from(recipients.values()).find(r => r.assignmentId === where.assignmentId) || null;
      },
      create: async ({ data }: any) => {
        const record = {
          id: `rec_${recipients.size + 1}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        recipients.set(record.id, record);
        return record;
      },
    },
    submissionRevision: {
      findFirst: async ({ where }: any) => {
        const revs = Array.from(submissionRevisions.values()).filter(s => s.recipientId === where.recipientId);
        revs.sort((a, b) => b.version - a.version);
        return revs[0] || null;
      },
    },
    grant: {
      findMany: async () => [],
      findFirst: async ({ where }: any) => {
        return Array.from(grants.values()).find(
          g => g.principalId === where.principalId && g.scopeType === where.scopeType && g.scopeId === where.scopeId && !g.revokedAt
        ) || null;
      },
    },
    classMembership: {
      findFirst: async ({ where }: any) => {
        return Array.from(classMemberships.values()).find(
          m => m.classId === where.classId && m.accountId === where.accountId && m.status === where.status
        ) || null;
      },
    },
    workspaceMembership: {
      findMany: async ({ where }: any) => Array.from(workspaceMemberships.values()).filter(
        member => member.accountId === where.accountId && member.status === where.status && where.workspaceId.in.includes(member.workspaceId)),
      findFirst: async ({ where }: any) => {
        return Array.from(workspaceMemberships.values()).find(
          m => m.workspaceId === where.workspaceId && m.accountId === where.accountId && m.status === where.status
        ) || null;
      },
    },
    task: { findMany: async ({ where }: any) => Array.from(tasks.values()).filter(task => where.workspaceId.in.includes(task.workspaceId)) },
    checklistItem: { findMany: async ({ where }: any) => Array.from(checklistItems.values()).filter(item => where.taskId.in.includes(item.taskId)) },
    auditEvent: {
      create: async ({ data }: any) => {
        auditEvents.push(data);
        return { id: `aud_${auditEvents.length}`, ...data };
      },
    },
    outboxEvent: {
      create: async ({ data }: any) => {
        outboxEvents.push(data);
        return { id: `evt_${outboxEvents.length}`, ...data, deliveredAt: null, createdAt: new Date() };
      },
    },
    $transaction: async (fn: any) => fn(mock),
  };

  return { mock, classes, workspaces, assignments, recipients, tasks, checklistItems,
    classMemberships, workspaceMemberships, outboxEvents, auditEvents };
}

test('Assignment creation enforces required title and recipient workspaces (ASG-13)', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new AssignmentService(mock, notif);

  // Missing title
  await assert.rejects(
    service.createAssignment('teacher_1', 'c_1', { title: '', recipientWorkspaceIds: ['w_1'] }),
    (err: any) => err instanceof DomainError && err.code === 'INVALID_INPUT' && err.status === 400
  );

  // Missing recipientWorkspaceIds
  await assert.rejects(
    service.createAssignment('teacher_1', 'c_1', { title: 'Bài 1', recipientWorkspaceIds: [] }),
    (err: any) => err instanceof DomainError && err.code === 'INVALID_INPUT' && err.status === 400
  );

  // Disallow both deadline and deadlineDate
  await assert.rejects(
    service.createAssignment('teacher_1', 'c_1', {
      title: 'Bài 1',
      recipientWorkspaceIds: ['w_1'],
      deadline: '2026-11-10T12:00:00Z',
      deadlineDate: { date: '2026-11-10', timeZone: 'Asia/Ho_Chi_Minh' },
    }),
    (err: any) => err instanceof DomainError && err.code === 'INVALID_INPUT' && err.status === 400
  );
});

test('Assignment creation rejects non-existent or other-class workspaces', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new AssignmentService(mock, notif);

  await assert.rejects(
    service.createAssignment('teacher_1', 'c_1', { title: 'Bài 1', recipientWorkspaceIds: ['w_other'] }),
    (err: any) => err instanceof DomainError && err.code === 'INVALID_INPUT' && err.status === 400
  );
});

test('Assignment creation rejects unauthorized callers and archived classes', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new AssignmentService(mock, notif);

  // Unauthorized actor
  await assert.rejects(
    service.createAssignment('student_x', 'c_1', { title: 'Bài 1', recipientWorkspaceIds: ['w_1'] }),
    (err: any) => err instanceof DomainError && err.code === 'FORBIDDEN' && err.status === 403
  );

  // Archived class
  await assert.rejects(
    service.createAssignment('teacher_1', 'c_archived', { title: 'Bài 1', recipientWorkspaceIds: ['w_1'] }),
    (err: any) => err instanceof DomainError && err.code === 'ARCHIVED' && err.status === 409
  );
});

test('Teacher can create assignment with multiple recipient groups and late policy override', async () => {
  const { mock, tasks, checklistItems, outboxEvents } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new AssignmentService(mock, notif);

  const res = await service.createAssignment('teacher_1', 'c_1', {
    title: 'Bài tập lớn môn Hệ điều hành',
    recipientWorkspaceIds: ['w_1', 'w_2'],
    deadline: '2026-11-20T23:59:59Z',
    lateFirst: 'allow',
    lateRevision: 'lock',
  });

  assert.equal(res.title, 'Bài tập lớn môn Hệ điều hành');
  assert.deepEqual(res.recipientWorkspaceIds, ['w_1', 'w_2']);
  assert.equal(res.lateFirst, 'allow');
  assert.equal(res.lateRevision, 'lock');
  assert.equal(res.version, 1);

  // Verify notification was emitted
  assert.equal(outboxEvents.length, 1);
  assert.equal(outboxEvents[0].topic, 'assignment.created');

  // Verify recipients listing
  tasks.set('t_1', { id: 't_1', workspaceId: 'w_1', status: 'done' });
  tasks.set('t_2', { id: 't_2', workspaceId: 'w_1', status: 'todo' });
  checklistItems.set('i_1', { taskId: 't_1', done: true });
  checklistItems.set('i_2', { taskId: 't_2', done: false });
  const recipients = await service.listRecipients('teacher_1', res.id);
  assert.equal(recipients.data.length, 2);
  assert.equal(recipients.data[0].assignmentId, res.id);
  assert.deepEqual({ name: recipients.data[0].workspaceName, tasks: recipients.data[0].tasksTotal,
    done: recipients.data[0].tasksCompleted, checklist: recipients.data[0].checklistTotal,
    checklistDone: recipients.data[0].checklistCompleted },
  { name: 'Group 1', tasks: 2, done: 1, checklist: 2, checklistDone: 1 });
});

test('recipient progress hides other groups from a class member without a progress grant', async () => {
  const { mock, classMemberships, workspaceMemberships, tasks } = createMockPrisma();
  const service = new AssignmentService(mock, new NotificationService(new OutboxService()));
  const assignment = await service.createAssignment('teacher_1', 'c_1', {
    title: 'Scoped progress', recipientWorkspaceIds: ['w_1', 'w_2'],
  });
  classMemberships.set('student_1', { classId: 'c_1', accountId: 'student_1', status: 'active' });
  workspaceMemberships.set('student_1', { workspaceId: 'w_1', accountId: 'student_1', status: 'active' });
  tasks.set('t_other', { id: 't_other', workspaceId: 'w_2', status: 'done' });
  const visible = await service.listRecipients('student_1', assignment.id);
  assert.deepEqual(visible.data.map(recipient => recipient.workspaceId), ['w_1']);
  assert.equal(visible.data[0].tasksTotal, 0);
});

test('Assignment update checks version (If-Match) and records deadline changes (ASG-08)', async () => {
  const { mock, auditEvents } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new AssignmentService(mock, notif);

  const asg = await service.createAssignment('teacher_1', 'c_1', {
    title: 'Bài 1',
    recipientWorkspaceIds: ['w_1'],
    deadline: '2026-11-20T23:59:59Z',
  });

  // Stale version rejected (412)
  await assert.rejects(
    service.updateAssignment('teacher_1', asg.id, { title: 'New', recipientWorkspaceIds: ['w_1'] }, '"99"'),
    (err: any) => err instanceof DomainError && err.code === 'VERSION_CONFLICT' && err.status === 412
  );

  // Successful update with correct version
  const updated = await service.updateAssignment(
    'teacher_1',
    asg.id,
    {
      title: 'Bài 1 - Cập nhật hạn',
      recipientWorkspaceIds: ['w_1'],
      deadline: '2026-11-25T23:59:59Z',
    },
    `"${asg.version}"`
  );

  assert.equal(updated.version, 2);
  assert.equal(updated.title, 'Bài 1 - Cập nhật hạn');

  // ASG-08: audit event for deadline change recorded
  const deadlineAudit = auditEvents.find(e => e.action === 'assignment.deadline_changed');
  assert.ok(deadlineAudit);
});

test('Archiving assignment preserves records and emits event (ASG-10)', async () => {
  const { mock, outboxEvents } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new AssignmentService(mock, notif);

  const asg = await service.createAssignment('teacher_1', 'c_1', {
    title: 'Bài cần lưu trữ',
    recipientWorkspaceIds: ['w_1'],
  });

  const res = await service.archiveAssignment('teacher_1', asg.id, `"${asg.version}"`);
  assert.equal(res.ok, true);

  const archiveEvent = outboxEvents.find(e => e.topic === 'assignment.archived');
  assert.ok(archiveEvent);
});
