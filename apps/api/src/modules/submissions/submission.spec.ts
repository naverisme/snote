import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { SubmissionService } from './submission.service';
import { OutboxService } from '../notifications/outbox.service';
import { NotificationService } from '../notifications/notification.service';
import { DomainError } from '../../core/authorization';

function createMockPrisma(initialData: {
  deadline?: Date | null;
  lateFirst?: string;
  lateRevision?: string;
  classPolicyDefaults?: any;
} = {}) {
  const classes = new Map<string, any>([
    ['c_1', { id: 'c_1', ownerId: 'teacher_1', name: 'Class 1', status: 'active', timeZone: 'Asia/Ho_Chi_Minh', version: 1 }],
  ]);

  const classPolicies = new Map<string, any>([
    ['c_1', { classId: 'c_1', defaults: initialData.classPolicyDefaults ?? { lateFirst: 'lock', lateRevision: 'lock' }, version: 1 }],
  ]);

  const workspaces = new Map<string, any>([
    ['w_1', { id: 'w_1', classId: 'c_1', ownerId: 'leader_1', name: 'Group 1', status: 'active', version: 1 }],
  ]);

  const workspaceMemberships = new Map<string, any>([
    ['m_leader', { id: 'm_leader', workspaceId: 'w_1', accountId: 'leader_1', role: 'leader', status: 'active', version: 1 }],
    ['m_member', { id: 'm_member', workspaceId: 'w_1', accountId: 'member_1', role: 'member', status: 'active', version: 1 }],
    ['m_delegate', { id: 'm_delegate', workspaceId: 'w_1', accountId: 'delegate_1', role: 'member', status: 'active', version: 1 }],
  ]);

  const assignments = new Map<string, any>([
    ['asg_1', {
      id: 'asg_1',
      classId: 'c_1',
      title: 'Lab 1',
      deadline: initialData.deadline !== undefined ? initialData.deadline : new Date(Date.now() + 86400000), // default tomorrow
      deadlineDate: null,
      deadlineZone: null,
      lateFirst: initialData.lateFirst ?? 'inherit',
      lateRevision: initialData.lateRevision ?? 'inherit',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }],
  ]);

  const recipients = new Map<string, any>([
    ['rec_1', { id: 'rec_1', assignmentId: 'asg_1', workspaceId: 'w_1', progressText: null, version: 1, createdAt: new Date() }],
  ]);

  const submissionRevisions = new Map<string, any>();
  const submissionAttachments = new Map<string, any>();
  const feedbacks = new Map<string, any>();
  const operationReceipts = new Map<string, any>();
  const grants = new Map<string, any>([
    ['g_delegate', { id: 'g_delegate', principalId: 'delegate_1', action: 'submission.send', scopeType: 'workspace', scopeId: 'w_1', version: 1, revokedAt: null }],
  ]);
  const outboxEvents: any[] = [];

  const mock: any = {
    class: {
      findUnique: async ({ where }: any) => classes.get(where.id) || null,
    },
    classPolicy: {
      findUnique: async ({ where }: any) => classPolicies.get(where.classId) || null,
    },
    workspace: {
      findUnique: async ({ where }: any) => workspaces.get(where.id) || null,
    },
    workspaceMembership: {
      findFirst: async ({ where }: any) => {
        return Array.from(workspaceMemberships.values()).find(
          m => m.workspaceId === where.workspaceId && m.accountId === where.accountId && m.status === where.status
        ) || null;
      },
    },
    assignment: {
      findUnique: async ({ where }: any) => assignments.get(where.id) || null,
    },
    assignmentRecipient: {
      findUnique: async ({ where }: any) => recipients.get(where.id) || null,
      update: async ({ where, data }: any) => {
        const item = recipients.get(where.id);
        const updated = { ...item, ...data, updatedAt: new Date() };
        recipients.set(where.id, updated);
        return updated;
      },
    },
    submissionRevision: {
      findFirst: async ({ where }: any) => {
        const revs = Array.from(submissionRevisions.values()).filter(r => r.recipientId === where.recipientId);
        revs.sort((a, b) => b.version - a.version);
        return revs[0] || null;
      },
      findUnique: async ({ where }: any) => submissionRevisions.get(where.id) || null,
      findMany: async ({ where }: any) => {
        return Array.from(submissionRevisions.values()).filter(r => r.recipientId === where.recipientId);
      },
      create: async ({ data }: any) => {
        const record = {
          id: `sub_${submissionRevisions.size + 1}`,
          ...data,
          createdAt: new Date(),
        };
        submissionRevisions.set(record.id, record);
        return record;
      },
    },
    submissionAttachment: {
      create: async ({ data }: any) => {
        const record = { id: `att_${submissionAttachments.size + 1}`, ...data };
        submissionAttachments.set(record.id, record);
        return record;
      },
      findMany: async ({ where }: any) => {
        return Array.from(submissionAttachments.values()).filter(a => a.submissionId === where.submissionId);
      },
    },
    feedback: {
      create: async ({ data }: any) => {
        const record = { id: `fb_${feedbacks.size + 1}`, ...data, createdAt: new Date() };
        feedbacks.set(record.id, record);
        return record;
      },
      findMany: async ({ where }: any) => {
        return Array.from(feedbacks.values()).filter(f => f.submissionId === where.submissionId);
      },
    },
    operationReceipt: {
      findUnique: async ({ where }: any) => {
        const key = `${where.actorId_scopeType_scopeId_action_key.actorId}:${where.actorId_scopeType_scopeId_action_key.scopeType}:${where.actorId_scopeType_scopeId_action_key.scopeId}:${where.actorId_scopeType_scopeId_action_key.action}:${where.actorId_scopeType_scopeId_action_key.key}`;
        return operationReceipts.get(key) || null;
      },
      create: async ({ data }: any) => {
        const key = `${data.actorId}:${data.scopeType}:${data.scopeId}:${data.action}:${data.key}`;
        const record = { id: `rcpt_${operationReceipts.size + 1}`, ...data, createdAt: new Date() };
        operationReceipts.set(key, record);
        return record;
      },
    },
    grant: {
      findFirst: async ({ where }: any) => {
        return Array.from(grants.values()).find(
          g => g.principalId === where.principalId && g.action === where.action && !g.revokedAt
        ) || null;
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

  return { mock, assignments, submissionRevisions, operationReceipts, outboxEvents };
}

test('QA-08: Idempotency-Key replays exact submission on network retry without duplicating revision (EC-05)', async () => {
  const { mock, submissionRevisions } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  const payload = { text: 'Bản nộp đồ án môn học' };
  const key = 'idem-req-123';

  // First submission attempt
  const res1 = await service.submit('leader_1', 'rec_1', payload, key);
  assert.equal(res1.version, 1);
  assert.equal(res1.timeliness, 'on_time');
  assert.equal(submissionRevisions.size, 1);

  // Network retry with exact same key and body
  const res2 = await service.submit('leader_1', 'rec_1', payload, key);
  assert.equal(res2.id, res1.id);
  assert.equal(res2.version, 1);
  // Guarantee: No second revision created!
  assert.equal(submissionRevisions.size, 1);
});

test('QA-08: Reusing Idempotency-Key with different payload throws 409 IDEMPOTENCY_CONFLICT', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  const key = 'idem-req-conflict';
  await service.submit('leader_1', 'rec_1', { text: 'Nội dung ban đầu' }, key);

  // Send different body with same key
  await assert.rejects(
    service.submit('leader_1', 'rec_1', { text: 'Nội dung sửa đổi gian lận' }, key),
    (err: any) => err instanceof DomainError && err.code === 'IDEMPOTENCY_CONFLICT' && err.status === 409
  );
});

test('QA-08 & ASG-12: Revision requires If-Match matching current version, rejects stale revision with 412', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  // First submission (version 1)
  const v1 = await service.submit('leader_1', 'rec_1', { text: 'Version 1' }, 'key-v1');
  assert.equal(v1.version, 1);

  // Stale revision: trying to revise without If-Match or wrong version
  await assert.rejects(
    service.submit('leader_1', 'rec_1', { text: 'Stale Version 2' }, 'key-v2-stale', undefined),
    (err: any) => err instanceof DomainError && err.code === 'VERSION_CONFLICT' && err.status === 412
  );
  await assert.rejects(
    service.submit('leader_1', 'rec_1', { text: 'Stale Version 2' }, 'key-v2-stale', '"99"'),
    (err: any) => err instanceof DomainError && err.code === 'VERSION_CONFLICT' && err.status === 412
  );

  // Valid revision with If-Match matching current version "1"
  const v2 = await service.submit('leader_1', 'rec_1', { text: 'Version 2 updated' }, 'key-v2-good', '"1"');
  assert.equal(v2.version, 2);
  assert.equal(v2.text, 'Version 2 updated');
});

test('QA-09: Evaluates deadline at server acceptance time, respects lateFirst allow vs lock', async () => {
  // Case A: Deadline passed (yesterday), lateFirst = 'lock'
  const pastDeadline = new Date(Date.now() - 86400000);
  const { mock: mockLocked } = createMockPrisma({
    deadline: pastDeadline,
    lateFirst: 'lock',
  });
  const notif = new NotificationService(new OutboxService());
  const serviceLocked = new SubmissionService(mockLocked, notif);

  // Submission after deadline should be rejected with 403 LATE_SUBMISSION_LOCKED
  await assert.rejects(
    serviceLocked.submit('leader_1', 'rec_1', { text: 'Nộp muộn khi bị khóa' }, 'late-key-1'),
    (err: any) => err.code === 'LATE_SUBMISSION_LOCKED' && err.status === 403
  );

  // Case B: Deadline passed, lateFirst = 'allow'
  const { mock: mockAllowed } = createMockPrisma({
    deadline: pastDeadline,
    lateFirst: 'allow',
  });
  const serviceAllowed = new SubmissionService(mockAllowed, notif);

  const resLate = await serviceAllowed.submit('leader_1', 'rec_1', { text: 'Nộp muộn được cho phép' }, 'late-key-2');
  assert.equal(resLate.version, 1);
  assert.equal(resLate.timeliness, 'late');
});

test('QA-09: Late revision policy override independent from lateFirst (ASG-05, ASG-15)', async () => {
  // Setup: deadline passed, lateFirst = 'allow', lateRevision = 'lock'
  const pastDeadline = new Date(Date.now() - 86400000);
  const { mock } = createMockPrisma({
    deadline: pastDeadline,
    lateFirst: 'allow',
    lateRevision: 'lock',
  });
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  // First submission succeeds as 'late'
  const v1 = await service.submit('leader_1', 'rec_1', { text: 'Bản 1 nộp muộn' }, 'key-late-v1');
  assert.equal(v1.timeliness, 'late');

  // Second submission (revision) after deadline is rejected because lateRevision = 'lock'
  await assert.rejects(
    service.submit('leader_1', 'rec_1', { text: 'Bản 2 sửa sau hạn' }, 'key-late-v2', '"1"'),
    (err: any) => err.code === 'LATE_REVISION_LOCKED' && err.status === 403
  );
});

test('QA-09 & ASG-08: Subsequent deadline change does not reclassify earlier submission timeliness', async () => {
  // Submitted on time
  const futureDeadline = new Date(Date.now() + 86400000);
  const { mock, assignments } = createMockPrisma({ deadline: futureDeadline });
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  const v1 = await service.submit('leader_1', 'rec_1', { text: 'Nộp đúng hạn' }, 'key-v1');
  assert.equal(v1.timeliness, 'on_time');

  // Teacher changes deadline to past date
  const asg = assignments.get('asg_1');
  asg.deadline = new Date(Date.now() - 1000000);

  // Checking old submission revision: timeliness remains 'on_time'!
  const fetched = await service.getSubmission('leader_1', v1.id);
  assert.equal(fetched.timeliness, 'on_time');
});

test('ASG-14: Submission requires at least one content item (text, links, or uploadIds)', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  // Empty submission
  await assert.rejects(
    service.submit('leader_1', 'rec_1', { text: '', links: [], uploadIds: [] }, 'k-empty'),
    (err: any) => err instanceof DomainError && err.code === 'INVALID_INPUT' && err.status === 400
  );

  // Valid with links only
  const resLinks = await service.submit('leader_1', 'rec_1', { links: ['https://example.com/repo'] }, 'k-links');
  assert.equal(resLinks.version, 1);
  assert.deepEqual(resLinks.links, ['https://example.com/repo']);
});

test('ASG-03: Authorization checks: leader and grantee can submit; regular member and class owner cannot', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  // Leader can submit
  const resLeader = await service.submit('leader_1', 'rec_1', { text: 'By Leader' }, 'k-leader');
  assert.equal(resLeader.version, 1);

  // Delegate with grant 'submission.send' can submit revision
  const resDelegate = await service.submit('delegate_1', 'rec_1', { text: 'By Delegate' }, 'k-delegate', '"1"');
  assert.equal(resDelegate.version, 2);

  // Regular member without grant is forbidden (403)
  await assert.rejects(
    service.submit('member_1', 'rec_1', { text: 'By Member' }, 'k-member', '"2"'),
    (err: any) => err instanceof DomainError && err.code === 'FORBIDDEN' && err.status === 403
  );

  // Class owner cannot submit for the student group (403)
  await assert.rejects(
    service.submit('teacher_1', 'rec_1', { text: 'By Teacher' }, 'k-teacher', '"2"'),
    (err: any) => err instanceof DomainError && err.code === 'FORBIDDEN' && err.status === 403
  );
});

test('ASG-09 & ASG-11: Teacher feedback and progress text updates', async () => {
  const { mock } = createMockPrisma();
  const notif = new NotificationService(new OutboxService());
  const service = new SubmissionService(mock, notif);

  const sub = await service.submit('leader_1', 'rec_1', { text: 'Bản nộp 1' }, 'k-sub');

  // Teacher leaves feedback on revision (ASG-09)
  const withFeedback = await service.addFeedback('teacher_1', sub.id, 'Cần bổ sung phần kiến trúc hệ thống');
  assert.equal(withFeedback.feedback?.length, 1);
  assert.equal(withFeedback.feedback![0].text, 'Cần bổ sung phần kiến trúc hệ thống');
  assert.equal(withFeedback.feedback![0].teacherId, 'teacher_1');

  // Student leader updates progress text (ASG-11) - recipient.version was bumped to 2 upon submission
  const progressRes = await service.updateProgress('leader_1', 'rec_1', 'Đang hoàn thiện phần kết luận', '"2"');
  assert.equal(progressRes.progressText, 'Đang hoàn thiện phần kết luận');
  assert.equal(progressRes.version, 3);
});
