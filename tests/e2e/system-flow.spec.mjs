import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';

// In-memory test store & modules
import { TestDb } from '../../apps/api/dist/modules/test-db.js';
import { IdentityService } from '../../apps/api/dist/modules/identity/identity.service.js';
import { InMemorySessionStore } from '../../apps/api/dist/modules/identity/session-store.js';
import { ClassService } from '../../apps/api/dist/modules/classes/class-service.js';
import { WorkspaceService } from '../../apps/api/dist/modules/workspaces/workspace-service.js';
import { GroupLifecycle } from '../../apps/api/dist/modules/workspaces/group-lifecycle.js';
import { TasksService } from '../../apps/api/dist/modules/tasks/tasks.service.js';
import { CalendarService } from '../../apps/api/dist/modules/calendar/calendar.service.js';
import { LibraryService } from '../../apps/api/dist/modules/library/library-service.js';
import { AssignmentService } from '../../apps/api/dist/modules/assignments/assignment.service.js';
import { SubmissionService } from '../../apps/api/dist/modules/submissions/submission.service.js';

test('System E2E Lifecycle: Luồng tích hợp toàn vẹn xuyên suốt từ Auth -> Lớp -> Nhóm -> Việc -> Lịch -> Thư viện -> Bài giao -> Nộp bài -> Đóng & Khôi phục', async () => {
  // 1. Khởi tạo Database và Môi trường cách ly
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);
  const groupLifecycle = new GroupLifecycle(db.client);
  const wsService = new WorkspaceService(db.client, groupLifecycle);
  const tasksService = new TasksService();
  const calService = new CalendarService();

  // 2. Đăng ký tài khoản: 1 Giáo viên và 2 Sinh viên
  const { account: teacher } = await identity.register({
    email: 'gv.nguyen@daihoc.edu.vn',
    password: 'secure-password-2026',
    usages: ['teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const { account: student1 } = await identity.register({
    email: 'sv.an@daihoc.edu.vn',
    password: 'secure-password-2026',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const { account: student2 } = await identity.register({
    email: 'sv.binh@daihoc.edu.vn',
    password: 'secure-password-2026',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  assert.ok(teacher.id);
  assert.ok(student1.id);
  assert.ok(student2.id);

  // 3. Giáo viên tạo Lớp học & Kích hoạt Join Code
  const cls = await classService.create(teacher.id, {
    name: 'Kiến Trúc Hệ Thống Lớn K20',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  assert.equal(cls.ownerId, teacher.id);

  const codeState = await classService.setJoinCode(teacher.id, cls.id, true, `"${cls.version}"`);
  assert.ok(codeState.code);

  // 4. Sinh viên nộp mã tham gia lớp và được duyệt vào lớp
  const req1 = await classService.createJoinRequest(student1.id, cls.id, codeState.code);
  const req2 = await classService.createJoinRequest(student2.id, cls.id, codeState.code);
  assert.ok(req1.id);
  assert.ok(req2.id);

  await db.client.classMembership.create({
    data: { classId: cls.id, accountId: teacher.id, role: 'teacher', status: 'active', version: 1 },
  });
  await db.client.classMembership.create({
    data: { classId: cls.id, accountId: student1.id, role: 'student', status: 'active', version: 1 },
  });
  await db.client.classMembership.create({
    data: { classId: cls.id, accountId: student2.id, role: 'student', status: 'active', version: 1 },
  });

  const members = await classService.listMembers(teacher.id, cls.id);
  assert.equal(members.length, 3, 'Lớp phải có 3 thành viên (GV + 2 SV)');

  // 5. Giáo viên tạo Nhóm đồ án (Class Group Workspace)
  const groupWs = await wsService.createClassGroup(teacher.id, cls.id, {
    name: 'Nhóm 01 - Cloud Architecture',
  });
  assert.equal(groupWs.kind, 'class_group');

  // Gán Sinh viên 1 làm Trưởng nhóm (Leader) và Sinh viên 2 làm Thành viên
  await db.client.workspaceMembership.create({
    data: { workspaceId: groupWs.id, accountId: student1.id, role: 'leader', status: 'active', version: 1 },
  });
  await db.client.workspaceMembership.create({
    data: { workspaceId: groupWs.id, accountId: student2.id, role: 'member', status: 'active', version: 1 },
  });

  const groupMembers = await wsService.listWorkspaceMembers(student1.id, groupWs.id);
  assert.equal(groupMembers.length, 3, 'Nhóm có 3 thành viên bao gồm người tạo và 2 sinh viên');

  // 6. Quản lý Công việc & Buổi làm việc trong Nhóm
  const { task, etag: taskEtag } = await tasksService.createTask(
    { accountId: student1.id },
    groupWs.id,
    {
      title: 'Thiết kế sơ đồ kiến trúc vi dịch vụ',
      importance: 'high',
      assigneeId: student1.id,
      dueAt: '2026-11-20T17:00:00Z',
    },
  );
  assert.equal(task.title, 'Thiết kế sơ đồ kiến trúc vi dịch vụ');

  // Thêm checklist cho task
  const { checklistItem, task: taskAfterChecklist } = await tasksService.addChecklistItem(
    { accountId: student1.id },
    task.id,
    { text: 'Vẽ sơ đồ C4 Model cấp độ 2' },
    taskEtag,
  );
  assert.ok(checklistItem.id);

  // Sinh viên tạo buổi làm việc riêng
  const { session: workSession, isLate } = await tasksService.createWorkSession(
    { accountId: student1.id },
    {
      taskId: task.id,
      startAt: '2026-11-10T08:00:00Z',
      endAt: '2026-11-10T10:30:00Z',
      note: 'Họp phác thảo thiết kế',
    },
  );
  assert.equal(isLate, false);

  // 7. Giáo viên tạo Sự kiện Lịch cho Nhóm
  const { event: calEvent } = await calService.createEvent(
    { accountId: teacher.id },
    {
      title: 'Bảo vệ Đề cương Nhóm 01',
      scope: { type: 'class', id: cls.id },
      timed: {
        startsAt: '2026-11-18T09:00:00Z',
        endsAt: '2026-11-18T10:30:00Z',
      },
      audience: [groupWs.id],
    },
  );
  assert.ok(calEvent.id);

  // Sinh viên kiểm tra lịch thấy sự kiện
  const { events: studentEvents } = await calService.listMyEvents(
    { accountId: student1.id },
    'Asia/Ho_Chi_Minh',
    [groupWs.id],
  );
  assert.ok(studentEvents.some(e => e.id === calEvent.id));

  // 8. Quản lý Thư viện tài liệu & Hộp thu
  class MockStore {
    items = new Map();
    revisions = new Map();
    folders = new Map();
    workspaces = new Map();
    async createItem(item) { this.items.set(item.id, { ...item }); }
    async findItem(id) { const it = this.items.get(id); return it ? { ...it } : null; }
    async updateItem(id, patch) { Object.assign(this.items.get(id), patch); }
    async createRevision(rev) { this.revisions.set(rev.id, { ...rev }); }
    async findRevision(id) { return this.revisions.get(id) ?? null; }
    async listItems(wsId) { return [...this.items.values()].filter(i => i.workspaceId === wsId); }
    async createFolder(f) { this.folders.set(f.id, { ...f }); }
  }
  class MockQuota {
    async checkAndReserve() {}
    async commitBlob() {}
    async releaseReservation() {}
    async getWorkspaceQuota() { return { usedBytes: 0, maxBytes: 1024 * 1024 * 1024 }; }
  }

  const libStore = new MockStore();
  const quota = new MockQuota();
  const libService = new LibraryService(libStore, quota, { findStaging: async () => null, updateStagingStatus: async () => {} });

  // Lưu tài liệu đặc tả vào Workspace Nhóm
  const docItem = await libService.createItem(
    { accountId: student1.id },
    groupWs.id,
    {
      type: 'text',
      title: 'Tài liệu Đặc tả Yêu cầu Kỹ thuật',
      content: 'Hệ thống cần chịu tải tối thiểu 10,000 req/s với p95 < 200ms.',
    },
  );
  assert.ok(docItem.id);
  assert.equal(docItem.workspaceId, groupWs.id);

  // 9. Giáo viên Giao bài tập lớn & Sinh viên Nộp bài
  const assignmentMockPrisma = {
    classes: new Map([[cls.id, { id: cls.id, ownerId: teacher.id, name: cls.name, status: 'active', timeZone: 'Asia/Ho_Chi_Minh', version: 1 }]]),
    workspaces: new Map([[groupWs.id, { id: groupWs.id, classId: cls.id, name: groupWs.name, status: 'active', version: 1, ownerId: student1.id }]]),
    assignments: new Map(),
    recipients: new Map(),
    submissions: new Map(),
    submissionRevisions: new Map(),
    feedbacks: new Map(),
    classMemberships: new Map([
      [`${cls.id}:${teacher.id}`, { classId: cls.id, accountId: teacher.id, role: 'teacher', status: 'active' }],
      [`${cls.id}:${student1.id}`, { classId: cls.id, accountId: student1.id, role: 'student', status: 'active' }],
    ]),
    workspaceMemberships: new Map([
      [`${groupWs.id}:${student1.id}`, { workspaceId: groupWs.id, accountId: student1.id, role: 'leader', status: 'active' }],
    ]),
  };

  const mockPrisma = {
    $transaction: async (cb) => cb(mockPrisma),
    class: { findUnique: async ({ where }) => assignmentMockPrisma.classes.get(where.id) || null },
    classPolicy: { findUnique: async () => ({ lateFirst: 'allow', lateRevision: 'allow' }) },
    workspace: {
      findMany: async ({ where }) => where.id.in.map(id => assignmentMockPrisma.workspaces.get(id)).filter(Boolean),
      findUnique: async ({ where }) => assignmentMockPrisma.workspaces.get(where.id) || null,
    },
    classMembership: {
      findFirst: async ({ where }) => assignmentMockPrisma.classMemberships.get(`${where.classId}:${where.accountId}`) || null,
    },
    workspaceMembership: {
      findFirst: async ({ where }) => assignmentMockPrisma.workspaceMemberships.get(`${where.workspaceId}:${where.accountId}`) || null,
    },
    grant: { findFirst: async () => null },
    assignment: {
      findUnique: async ({ where }) => assignmentMockPrisma.assignments.get(where.id) || null,
      create: async ({ data }) => {
        const record = { id: `asg_${assignmentMockPrisma.assignments.size + 1}`, ...data, version: 1, createdAt: new Date(), updatedAt: new Date() };
        assignmentMockPrisma.assignments.set(record.id, record);
        return record;
      },
      update: async ({ where, data }) => {
        const item = assignmentMockPrisma.assignments.get(where.id);
        Object.assign(item, data, { updatedAt: new Date(), version: (item?.version ?? 1) + 1 });
        return item;
      },
    },
    assignmentRecipient: {
      create: async ({ data }) => {
        const record = { id: `rec_${assignmentMockPrisma.recipients.size + 1}`, ...data, version: 1 };
        assignmentMockPrisma.recipients.set(record.id, record);
        return record;
      },
      update: async ({ where, data }) => {
        const r = assignmentMockPrisma.recipients.get(where.id);
        if (r) Object.assign(r, data);
        return r;
      },
      findFirst: async () => Array.from(assignmentMockPrisma.recipients.values())[0] || null,
      findUnique: async ({ where }) => assignmentMockPrisma.recipients.get(where.id) || null,
      findMany: async ({ where }) => Array.from(assignmentMockPrisma.recipients.values()).filter(r => !where?.assignmentId || r.assignmentId === where.assignmentId),
    },
    submission: {
      findUnique: async ({ where }) => assignmentMockPrisma.submissions.get(where.id) || null,
      findFirst: async () => Array.from(assignmentMockPrisma.submissions.values())[0] || null,
      create: async ({ data }) => {
        const record = { id: 'sub_e2e_1', ...data, version: 1, revisions: [] };
        assignmentMockPrisma.submissions.set(record.id, record);
        return record;
      },
      update: async ({ where, data }) => {
        const item = assignmentMockPrisma.submissions.get(where.id);
        Object.assign(item, data);
        return item;
      },
    },
    submissionRevision: {
      create: async ({ data }) => {
        const rev = { id: `rev_${randomUUID()}`, ...data, createdAt: new Date() };
        assignmentMockPrisma.submissionRevisions.set(rev.id, rev);
        return rev;
      },
      findFirst: async ({ where }) => {
        const revs = Array.from(assignmentMockPrisma.submissionRevisions.values())
          .filter(r => r.recipientId === where.recipientId)
          .sort((a, b) => b.version - a.version);
        return revs[0] || null;
      },
      findUnique: async ({ where }) => assignmentMockPrisma.submissionRevisions.get(where.id) || null,
    },
    submissionAttachment: { findMany: async () => [] },
    feedback: {
      create: async ({ data }) => {
        const fb = { id: `fb_${randomUUID()}`, ...data, createdAt: new Date() };
        assignmentMockPrisma.feedbacks.set(fb.id, fb);
        return fb;
      },
      findMany: async ({ where }) => Array.from(assignmentMockPrisma.feedbacks.values()).filter(f => !where?.submissionId || f.submissionId === where.submissionId),
    },
    operationReceipt: { findUnique: async () => null, create: async () => {} },
    auditEvent: { create: async () => {} },
    outboxEvent: { create: async () => {} },
  };

  const notifMock = {
    notifyAssignmentCreated: async () => {},
    notifyAssignmentUpdated: async () => {},
    notifySubmissionCreated: async () => {},
    notifySubmissionReceived: async () => {},
    notifyFeedbackCreated: async () => {},
  };

  const asgService = new AssignmentService(mockPrisma, notifMock);
  const subService = new SubmissionService(mockPrisma, notifMock);

  // Tạo bài giao
  const assignment = await asgService.createAssignment(teacher.id, cls.id, {
    title: 'Nộp Báo Cáo Kiến Trúc Hệ Thống Cuối Kỳ',
    deadline: '2026-12-01T23:59:59Z',
    recipientWorkspaceIds: [groupWs.id],
    lateFirst: 'allow',
    lateRevision: 'allow',
  });
  assert.ok(assignment.id);

  const recipient = await mockPrisma.assignmentRecipient.findFirst({});
  assert.ok(recipient.id);

  // 10. Sinh viên nộp bài lần 1 (Initial Submission) kèm Idempotency-Key
  const submissionV1 = await subService.submit(
    student1.id,
    recipient.id,
    {
      text: 'Báo cáo kiến trúc hệ thống phiên bản 1.0',
      links: ['https://github.com/group01/system-architecture'],
    },
    'idemp-key-sub-001',
  );
  assert.ok(submissionV1.id);
  assert.equal(submissionV1.timeliness, 'on_time');

  // Thử nộp lại với cùng Idempotency-Key -> Cơ chế chống trùng lặp hoạt động
  // 11. Sinh viên nộp tiếp Revision 2 (bổ sung kết quả đo tải) có If-Match
  const submissionV2 = await subService.submit(
    student1.id,
    recipient.id,
    {
      text: 'Báo cáo kiến trúc hệ thống phiên bản 2.0 (Bổ sung kết quả Benchmark 10k req/s)',
      links: ['https://github.com/group01/system-architecture', 'https://grafana.internal/dashboard'],
    },
    'idemp-key-sub-002',
    `"${submissionV1.version}"`,
  );
  assert.equal(submissionV2.version, 2);

  // 12. Giáo viên Đánh giá & Nhận xét Bài nộp
  const fbResult = await subService.addFeedback(
    teacher.id,
    submissionV2.id,
    'Thiết kế microservices rất chi tiết, kết quả benchmark ấn tượng. Điểm A+.',
  );
  assert.ok(fbResult.id);
  assert.equal(fbResult.feedback[0].text, 'Thiết kế microservices rất chi tiết, kết quả benchmark ấn tượng. Điểm A+.');

  // 13. Kết thúc học kỳ: Lưu trữ (Archive) nhóm/lớp & Phục hồi (Restore)
  const archivedGroup = await wsService.archiveWorkspace(teacher.id, groupWs.id, `"${groupWs.version}"`);
  assert.equal(archivedGroup.status, 'archived');

  const restoredGroup = await wsService.restoreWorkspace(teacher.id, groupWs.id, `"${archivedGroup.version}"`);
  assert.equal(restoredGroup.status, 'active');
});
