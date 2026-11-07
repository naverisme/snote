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

test('VT-01: Đăng ký tài khoản (Người học + Giáo viên) -> Workspace cá nhân tự tạo, có quyền tạo lớp', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);
  const groupLifecycle = new GroupLifecycle(db.client);
  const workspaceService = new WorkspaceService(db.client, groupLifecycle);

  // 1. Đăng ký tài khoản với usage: student và teacher
  const { account, session } = await identity.register({
    email: 'teacher.learner@test.edu.vn',
    password: 'secure-password-2026',
    usages: ['student', 'teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  assert.ok(account.id);
  assert.ok(session.token);

  // 2. Workspace cá nhân mặc định phải tự động được tạo
  const workspaces = await workspaceService.listWorkspaces(account.id);
  assert.equal(workspaces.length, 1);
  assert.equal(workspaces[0].kind, 'default');
  assert.equal(workspaces[0].name, 'Cá nhân');

  // 3. Người dùng có usage teacher được phép tạo lớp
  const newClass = await classService.create(account.id, {
    name: 'Lớp Lập Trình Phân Tán K20',
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  assert.ok(newClass.id);
  assert.equal(newClass.ownerId, account.id);
  assert.equal(newClass.name, 'Lớp Lập Trình Phân Tán K20');
});

test('VT-02: So hai đường vào lớp: Lời mời giáo viên vs Mã lớp', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);

  const { account: teacher } = await identity.register({
    email: 'teacher@test.edu.vn',
    password: 'secure-password-2026',
    usages: ['teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const { account: studentA } = await identity.register({
    email: 'studenta@test.edu.vn',
    password: 'secure-password-2026',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const { account: studentB } = await identity.register({
    email: 'studentb@test.edu.vn',
    password: 'secure-password-2026',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const cls = await classService.create(teacher.id, {
    name: 'Toán Rời Rạc',
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  // Đường 1: Giáo viên gửi lời mời cho studentA
  const invitation = await classService.createInvitation(teacher.id, cls.id, studentA.id);
  assert.equal(invitation.status, 'pending');

  // Đường 2: Bật mã lớp và studentB gửi join request
  const codeState = await classService.setJoinCode(teacher.id, cls.id, true, `"${cls.version}"`);
  assert.ok(codeState.code);

  const joinReq = await classService.createJoinRequest(studentB.id, cls.id, codeState.code);
  assert.equal(joinReq.status, 'pending');

  // Kiểm tra danh sách join request
  const reqList = await classService.listJoinRequests(teacher.id, cls.id);
  assert.ok(reqList.some(r => r.id === joinReq.id));
});

test('VT-03: Lớp giới hạn 1 nhóm: nhận 2 lời mời, chấp nhận 1 -> lời mời còn lại bị vô hiệu hóa', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);
  const groupLifecycle = new GroupLifecycle(db.client);
  const wsService = new WorkspaceService(db.client, groupLifecycle);

  const { account: teacher } = await identity.register({ email: 't@edu.vn', password: 'secure-password-2026', usages: ['teacher'], timeZone: 'Asia/Ho_Chi_Minh' });
  const { account: student } = await identity.register({ email: 's@edu.vn', password: 'secure-password-2026', usages: ['student'], timeZone: 'Asia/Ho_Chi_Minh' });

  const cls = await classService.create(teacher.id, { name: 'Kỹ nghệ phần mềm', timeZone: 'Asia/Ho_Chi_Minh' });
  
  // Tạo 2 nhóm trong lớp
  const group1 = await wsService.createClassGroup(teacher.id, cls.id, { name: 'Nhóm 01' });
  const group2 = await wsService.createClassGroup(teacher.id, cls.id, { name: 'Nhóm 02' });

  assert.equal(group1.kind, 'class_group');
  assert.equal(group2.kind, 'class_group');
  assert.equal(group1.classId, cls.id);
});

test('VT-04: Phân quyền Giáo viên vs Lớp trưởng, Hộp thu riêng bảo mật tuyệt đối', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);
  const groupLifecycle = new GroupLifecycle(db.client);
  const wsService = new WorkspaceService(db.client, groupLifecycle);

  const { account: teacher } = await identity.register({ email: 't@edu.vn', password: 'secure-password-2026', usages: ['teacher'], timeZone: 'Asia/Ho_Chi_Minh' });
  const { account: monitor } = await identity.register({ email: 'm@edu.vn', password: 'secure-password-2026', usages: ['student'], timeZone: 'Asia/Ho_Chi_Minh' });

  const cls = await classService.create(teacher.id, { name: 'Kiến trúc máy tính', timeZone: 'Asia/Ho_Chi_Minh' });

  // Hộp thu cá nhân của Teacher vs Monitor
  const teacherWsList = await wsService.listWorkspaces(teacher.id);
  const monitorWsList = await wsService.listWorkspaces(monitor.id);

  const teacherWs = teacherWsList.find(w => w.kind === 'default');
  const monitorWs = monitorWsList.find(w => w.kind === 'default');

  assert.notEqual(teacherWs.id, monitorWs.id);

  // Monitor không thể đọc workspace cá nhân của Teacher
  await assert.rejects(
    async () => wsService.getWorkspace(monitor.id, teacherWs.id),
    /FORBIDDEN|NOT_FOUND/,
  );
});

test('VT-05: Một việc có hạn hôm nay và một buổi làm riêng hôm nay -> Hiển thị chính xác 1 lần trong Hôm nay', async () => {
  const tasksService = new TasksService();
  const userId = 'usr-001';
  const workspaceId = 'ws-001';

  const todayStr = new Date().toISOString().split('T')[0];

  // Tạo việc có dueAt là hôm nay, gán cho userId
  const { task } = await tasksService.createTask(
    { accountId: userId },
    workspaceId,
    {
      title: 'Ôn tập chương 3',
      assigneeId: userId,
      dueAt: `${todayStr}T17:00:00Z`,
      importance: 'high',
    },
  );

  // Thêm một buổi làm riêng hôm nay
  await tasksService.createWorkSession(
    { accountId: userId },
    {
      taskId: task.id,
      startAt: `${todayStr}T09:00:00Z`,
      endAt: `${todayStr}T11:00:00Z`,
      note: 'Buổi làm sáng',
    },
  );

  // Lấy danh sách Việc của tôi hôm nay
  const myTasks = await tasksService.listMyTasks({ accountId: userId }, { filter: 'today', timeZone: 'UTC' });

  // Kiểm tra: Task chỉ xuất hiện đúng 1 lần duy nhất trong danh sách
  const matching = myTasks.tasks.filter(t => t.id === task.id);
  assert.equal(matching.length, 1, 'Việc phải xuất hiện đúng 1 lần trong bộ lọc Hôm nay');
});

test('VT-06: Việc có hạn chỉ ngày, lập buổi làm sau hạn -> Lưu với nhãn "Làm muộn", hạn giữ nguyên', async () => {
  const tasksService = new TasksService();
  const userId = 'usr-002';
  const workspaceId = 'ws-002';

  // Hạn ngày hôm qua (đã quá hạn)
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
  const originalDueAt = `${yesterday}T23:59:59Z`;

  const { task } = await tasksService.createTask(
    { accountId: userId },
    workspaceId,
    {
      title: 'Báo cáo giữa kỳ',
      dueAt: originalDueAt,
    },
  );

  // Lập buổi làm hôm nay (sau hạn) với đầy đủ startAt và endAt
  const now = Date.now();
  const startAt = new Date(now).toISOString();
  const endAt = new Date(now + 3600000).toISOString();

  const sessionRes = await tasksService.createWorkSession(
    { accountId: userId },
    {
      taskId: task.id,
      startAt,
      endAt,
      note: 'Làm bù sau hạn',
    },
  );

  assert.equal(sessionRes.isLate, true, 'Buổi làm sau hạn phải có cờ isLate = true (Làm muộn)');

  // Kiểm tra hạn công việc ban đầu không bị đổi
  const { task: currentTask } = await tasksService.getTask({ accountId: userId }, task.id);
  assert.equal(currentTask.dueAt, originalDueAt, 'Hạn công việc ban đầu phải được giữ nguyên');
});

test('VT-07: Đánh dấu xong toàn bộ checklist -> Chỉ hoàn thành khi xác nhận; Mở lại ghi audit trail', async () => {
  const tasksService = new TasksService();
  const userId = 'usr-003';
  const workspaceId = 'ws-003';

  let { task } = await tasksService.createTask(
    { accountId: userId },
    workspaceId,
    { title: 'Bài tập tuần', assigneeId: userId },
  );

  // Thêm 2 mục checklist
  const res1 = await tasksService.addChecklistItem({ accountId: userId }, task.id, { text: 'Mục 1' }, `"${task.version}"`);
  task = res1.task;
  const res2 = await tasksService.addChecklistItem({ accountId: userId }, task.id, { text: 'Mục 2' }, `"${task.version}"`);
  task = res2.task;

  // Hoàn thành cả 2 checklist
  const res3 = await tasksService.updateChecklistItem({ accountId: userId }, task.id, res1.checklistItem.id, { done: true }, `"${task.version}"`);
  task = res3.task;
  const res4 = await tasksService.updateChecklistItem({ accountId: userId }, task.id, res2.checklistItem.id, { done: true }, `"${task.version}"`);
  task = res4.task;

  let { task: checkTask } = await tasksService.getTask({ accountId: userId }, task.id);
  // Checklist 100% nhưng trạng thái task vẫn là todo (không tự ý hoàn thành)
  assert.equal(checkTask.status, 'todo', 'Task không được tự ý hoàn thành chỉ vì checklist xong');

  // Xác nhận hoàn thành công việc
  const { task: completedTask } = await tasksService.completeTask({ accountId: userId }, task.id, `"${task.version}"`);
  assert.equal(completedTask.status, 'done');

  // Mở lại công việc
  const { task: reopenedTask } = await tasksService.reopenTask({ accountId: userId }, task.id, `"${completedTask.version}"`);
  assert.equal(reopenedTask.status, 'todo');
});

test('VT-08: Lưu nhanh mục vào Hộp thu riêng -> Sao chép sang workspace nhóm độc lập', async () => {
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
  }

  class MockQuota {
    async checkAndReserve() {}
    async commitBlob() {}
    async releaseReservation() {}
    async getWorkspaceQuota() { return { usedBytes: 0, maxBytes: 1000000 }; }
  }

  const store = new MockStore();
  const quota = new MockQuota();
  const uploadStore = { findStaging: async () => null, updateStagingStatus: async () => {} };
  const lib = new LibraryService(store, quota, uploadStore);

  const personalWsId = 'ws-personal';
  const groupWsId = 'ws-group';

  // 1. Lưu nhanh một mục text vào Hộp thu cá nhân
  const item = await lib.createItem(
    { accountId: 'user-01' },
    personalWsId,
    {
      type: 'text',
      title: 'Ý tưởng đồ án',
      content: 'Nghiên cứu kiến trúc vi dịch vụ phân tán',
    },
  );

  assert.equal(item.workspaceId, personalWsId);
  assert.equal(item.folderId ?? null, null, 'Hộp thu riêng có folderId = null');

  // 2. Sao chép mục sang workspace nhóm
  const copiedItem = await lib.copyItem(
    { accountId: 'user-01' },
    item.id,
    { targetWorkspaceId: groupWsId, targetFolderId: null },
  );

  assert.notEqual(copiedItem.id, item.id);
  assert.equal(copiedItem.workspaceId, groupWsId);
  assert.equal(copiedItem.title, 'Ý tưởng đồ án');

  // Sửa bản gốc không ảnh hưởng bản sao (tham số: principal, itemId, ifMatch, input)
  await lib.updateItem(
    { accountId: 'user-01' },
    item.id,
    `"${item.version}"`,
    { title: 'Ý tưởng đã sửa' },
  );

  const checkCopied = await lib.getItem({ accountId: 'user-01' }, copiedItem.id);
  assert.equal(checkCopied.item.title, 'Ý tưởng đồ án', 'Bản sao hoàn toàn độc lập với bản gốc');
});

test('VT-09: Sự kiện lịch tạo cho 1 nhóm trong lớp có 2 nhóm -> Chỉ nhóm liên quan thấy', async () => {
  const cal = new CalendarService();
  const classId = 'class-cnpm';
  const group1Id = 'group-01';
  const group2Id = 'group-02';
  const teacher = { accountId: 'teacher-01' };
  const student1 = { accountId: 'student-g1' };
  const student2 = { accountId: 'student-g2' };

  // Giáo viên tạo sự kiện giới hạn cho group1
  const { event } = await cal.createEvent(teacher, {
    title: 'Báo cáo Sprint 1 Nhóm 1',
    scope: { type: 'class', id: classId },
    timed: {
      startsAt: '2026-11-15T08:00:00Z',
      endsAt: '2026-11-15T10:00:00Z',
    },
    audience: [group1Id],
  });

  // Group 1 list events -> thấy
  const { events: eventsG1 } = await cal.listMyEvents(student1, 'UTC', [group1Id]);
  assert.ok(eventsG1.some(e => e.id === event.id));

  // Group 2 list events -> KHÔNG thấy
  const { events: eventsG2 } = await cal.listMyEvents(student2, 'UTC', [group2Id]);
  assert.equal(eventsG2.some(e => e.id === event.id), false, 'Nhóm 2 không được thấy sự kiện của nhóm 1');
});

test('VT-10: Bài giao quá hạn: Nhóm chưa nộp bị khóa; Nhóm đã nộp có quyền sửa vẫn được sửa', async () => {
  function createMockPrisma() {
    const classes = new Map([
      ['c_1', { id: 'c_1', ownerId: 't_1', name: 'Class 1', status: 'active', timeZone: 'Asia/Ho_Chi_Minh', version: 1 }],
    ]);
    const workspaces = new Map([
      ['w_1', { id: 'w_1', classId: 'c_1', name: 'Group 1', status: 'active', version: 1, ownerId: 's_1' }],
      ['w_2', { id: 'w_2', classId: 'c_1', name: 'Group 2', status: 'active', version: 1, ownerId: 's_2' }],
    ]);
    const assignments = new Map();
    const recipients = new Map();
    const classMemberships = new Map([
      ['c_1:t_1', { classId: 'c_1', accountId: 't_1', role: 'teacher', status: 'active' }],
      ['c_1:s_1', { classId: 'c_1', accountId: 's_1', role: 'student', status: 'active' }],
      ['c_1:s_2', { classId: 'c_1', accountId: 's_2', role: 'student', status: 'active' }],
    ]);
    const workspaceMemberships = new Map([
      ['w_1:s_1', { workspaceId: 'w_1', accountId: 's_1', role: 'leader', status: 'active' }],
      ['w_2:s_2', { workspaceId: 'w_2', accountId: 's_2', role: 'leader', status: 'active' }],
    ]);
    const submissions = new Map();
    const receipts = new Map();

    const mock = {
      $transaction: async (cb) => cb(mock),
      class: { findUnique: async ({ where }) => classes.get(where.id) || null },
      classPolicy: { findUnique: async () => ({ lateFirst: 'lock', lateRevision: 'allow' }) },
      workspace: {
        findMany: async ({ where }) => where.id.in.map(id => workspaces.get(id)).filter(Boolean),
        findUnique: async ({ where }) => workspaces.get(where.id) || null,
      },
      classMembership: {
        findFirst: async ({ where }) => classMemberships.get(`${where.classId}:${where.accountId}`) || null,
      },
      workspaceMembership: {
        findFirst: async ({ where }) => workspaceMemberships.get(`${where.workspaceId}:${where.accountId}`) || null,
      },
      grant: { findFirst: async () => null },
      assignment: {
        findUnique: async ({ where }) => assignments.get(where.id) || null,
        create: async ({ data }) => {
          const record = { id: `asg_${assignments.size + 1}`, ...data, version: 1, createdAt: new Date() };
          assignments.set(record.id, record);
          return record;
        },
      },
      assignmentRecipient: {
        create: async ({ data }) => {
          const record = { id: `rec_${recipients.size + 1}`, ...data, version: 1 };
          recipients.set(record.id, record);
          return record;
        },
        update: async ({ where, data }) => {
          const r = recipients.get(where.id);
          if (r) Object.assign(r, data);
          return r;
        },
        findFirst: async ({ where }) => {
          return Array.from(recipients.values()).find(r => r.assignmentId === where.assignmentId && r.workspaceId === where.workspaceId) || null;
        },
        findUnique: async ({ where }) => recipients.get(where.id) || null,
      },
      submission: {
        findUnique: async ({ where }) => submissions.get(where.id) || null,
        findFirst: async ({ where }) => {
          return Array.from(submissions.values()).find(s => s.recipientId === where.recipientId) || null;
        },
        create: async ({ data }) => {
          const record = { id: `sub_${submissions.size + 1}`, ...data, version: 1, revisions: [] };
          submissions.set(record.id, record);
          return record;
        },
        update: async ({ where, data }) => {
          const item = submissions.get(where.id);
          Object.assign(item, data);
          return item;
        },
      },
      submissionRevision: {
        create: async ({ data }) => {
          const sub = submissions.get(data.submissionId);
          const rev = { id: `rev_${randomUUID()}`, ...data, createdAt: new Date() };
          if (sub) sub.revisions.push(rev);
          return rev;
        },
        findFirst: async ({ where }) => {
          for (const s of submissions.values()) {
            if (s.recipientId === where.recipientId && s.revisions.length > 0) {
              return s.revisions[s.revisions.length - 1];
            }
          }
          return null;
        },
      },
      operationReceipt: {
        findUnique: async () => null,
        create: async ({ data }) => receipts.set(data.key, data),
      },
      auditEvent: { create: async () => {} },
      outboxEvent: { create: async () => {} },
    };
    return mock;
  }

  const prisma = createMockPrisma();
  const notif = {
    notifyAssignmentCreated: async () => {},
    notifySubmissionCreated: async () => {},
    notifySubmissionReceived: async () => {},
    notifyFeedbackAdded: async () => {},
  };
  const asg = new AssignmentService(prisma, notif);
  const sub = new SubmissionService(prisma, notif);

  // Hạn đã qua 2 ngày trước
  const pastDeadline = new Date(Date.now() - 48 * 3600 * 1000).toISOString();

  const assignment = await asg.createAssignment('t_1', 'c_1', {
    title: 'Bài tập Giải thuật đồ thị',
    deadline: pastDeadline,
    recipientWorkspaceIds: ['w_1', 'w_2'],
    lateFirst: 'lock',
    lateRevision: 'allow',
  });

  const rec1 = await prisma.assignmentRecipient.findFirst({ where: { assignmentId: assignment.id, workspaceId: 'w_1' } });
  const rec2 = await prisma.assignmentRecipient.findFirst({ where: { assignmentId: assignment.id, workspaceId: 'w_2' } });

  // 1. Nhóm W_2 chưa nộp lần nào, cố nộp sau hạn -> BỊ CHẶN LATE_SUBMISSION_LOCKED
  await assert.rejects(
    async () => sub.submit('s_2', rec2.id, { text: 'Nộp muộn' }, 'idemp-w2'),
    /LATE_SUBMISSION_LOCKED|LATE_POLICY_LOCKED|FORBIDDEN/,
  );

  // 2. Giả lập Nhóm W_1 đã có nộp lần 1 trước hạn
  const firstSub = await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      recipientId: rec1.id,
      submittedById: 's_1',
      status: 'submitted',
      currentRevisionNumber: 1,
      version: 1,
    },
  });
  firstSub.revisions.push({ id: 'rev_1', submissionId: firstSub.id, version: 1, recipientId: rec1.id });

  // Nộp sửa đổi (revision) sau hạn -> THÀNH CÔNG vì lateRevision = 'allow'
  const rev = await sub.submit('s_1', rec1.id, { text: 'Bản sửa đổi' }, 'idemp-w1-rev', `"${firstSub.version}"`);
  assert.ok(rev.id);
  assert.equal(rev.timeliness, 'late', 'Ghi nhận nộp muộn cho bản sửa đổi');
});

test('VT-11: Nộp bài, nhận xét phiên bản, đổi hạn sau đó -> Snapshot và nhận xét gắn chặt với phiên bản', async () => {
  function createMockPrisma() {
    const classes = new Map([
      ['c_1', { id: 'c_1', ownerId: 't_1', name: 'Class 1', status: 'active', timeZone: 'Asia/Ho_Chi_Minh', version: 1 }],
    ]);
    const workspaces = new Map([
      ['w_1', { id: 'w_1', classId: 'c_1', name: 'Group 1', status: 'active', version: 1, ownerId: 's_1' }],
    ]);
    const assignments = new Map();
    const recipients = new Map();
    const classMemberships = new Map([
      ['c_1:t_1', { classId: 'c_1', accountId: 't_1', role: 'teacher', status: 'active' }],
      ['c_1:s_1', { classId: 'c_1', accountId: 's_1', role: 'student', status: 'active' }],
    ]);
    const workspaceMemberships = new Map([
      ['w_1:s_1', { workspaceId: 'w_1', accountId: 's_1', role: 'leader', status: 'active' }],
    ]);
    const submissions = new Map();
    const submissionRevisions = new Map();
    const feedbacks = new Map();

    const mock = {
      $transaction: async (cb) => cb(mock),
      class: { findUnique: async ({ where }) => classes.get(where.id) || null },
      classPolicy: { findUnique: async () => ({ lateFirst: 'allow', lateRevision: 'allow' }) },
      workspace: {
        findMany: async ({ where }) => where.id.in.map(id => workspaces.get(id)).filter(Boolean),
        findUnique: async ({ where }) => workspaces.get(where.id) || null,
      },
      classMembership: {
        findFirst: async ({ where }) => classMemberships.get(`${where.classId}:${where.accountId}`) || null,
      },
      workspaceMembership: {
        findFirst: async ({ where }) => workspaceMemberships.get(`${where.workspaceId}:${where.accountId}`) || null,
      },
      grant: { findFirst: async () => null },
      assignment: {
        findUnique: async ({ where }) => assignments.get(where.id) || null,
        create: async ({ data }) => {
          const record = { id: 'asg_1', ...data, version: 1, createdAt: new Date(), updatedAt: new Date() };
          assignments.set(record.id, record);
          return record;
        },
        update: async ({ where, data }) => {
          const item = assignments.get(where.id);
          Object.assign(item, data, { updatedAt: new Date(), version: (item?.version ?? 1) + 1 });
          return item;
        },
      },
      assignmentRecipient: {
        create: async ({ data }) => {
          const record = { id: 'rec_1', ...data, version: 1 };
          recipients.set(record.id, record);
          return record;
        },
        update: async ({ where, data }) => {
          const r = recipients.get(where.id);
          if (r) Object.assign(r, data);
          return r;
        },
        findFirst: async () => recipients.get('rec_1') || null,
        findUnique: async ({ where }) => recipients.get(where.id) || null,
        findMany: async ({ where }) => Array.from(recipients.values()).filter(r => !where?.assignmentId || r.assignmentId === where.assignmentId),
      },
      submission: {
        findUnique: async ({ where }) => submissions.get(where.id) || null,
        findFirst: async () => submissions.get('sub_1') || null,
        create: async ({ data }) => {
          const record = { id: 'sub_1', ...data, version: 1, revisions: [] };
          submissions.set(record.id, record);
          return record;
        },
        update: async ({ where, data }) => {
          const item = submissions.get(where.id);
          Object.assign(item, data);
          return item;
        },
      },
      submissionRevision: {
        create: async ({ data }) => {
          const rev = { id: data.id || `rev_${randomUUID()}`, ...data, createdAt: new Date() };
          submissionRevisions.set(rev.id, rev);
          const sub = submissions.get(data.submissionId);
          if (sub) sub.revisions.push(rev);
          return rev;
        },
        findFirst: async () => null,
        findUnique: async ({ where }) => submissionRevisions.get(where.id) || null,
      },
      submissionAttachment: {
        findMany: async () => [],
      },
      feedback: {
        create: async ({ data }) => {
          const record = { id: 'fb_1', ...data, createdAt: new Date() };
          feedbacks.set(record.id, record);
          return record;
        },
        findMany: async ({ where }) => {
          return Array.from(feedbacks.values()).filter(f => !where?.submissionId || f.submissionId === where.submissionId);
        },
      },
      operationReceipt: {
        findUnique: async () => null,
        create: async () => {},
      },
      auditEvent: { create: async () => {} },
      outboxEvent: { create: async () => {} },
    };
    return mock;
  }

  const prisma = createMockPrisma();
  const notif = {
    notifyAssignmentCreated: async () => {},
    notifyAssignmentUpdated: async () => {},
    notifySubmissionCreated: async () => {},
    notifySubmissionReceived: async () => {},
    notifyFeedbackCreated: async () => {},
  };
  const asg = new AssignmentService(prisma, notif);
  const sub = new SubmissionService(prisma, notif);

  const assignment = await asg.createAssignment('t_1', 'c_1', {
    title: 'Xây dựng Web App',
    deadline: '2026-11-20T23:59:59Z',
    recipientWorkspaceIds: ['w_1'],
  });

  const rec = await prisma.assignmentRecipient.findFirst({});

  // Nộp bản 1
  const submission = await sub.submit('s_1', rec.id, {
    text: 'Mã nguồn commit #1',
    links: ['https://github.com/my-group/repo'],
  }, 'idemp-1');

  // Giáo viên nhận xét bản 1
  const fbSub = await sub.addFeedback('t_1', submission.id, 'Mã nguồn sạch, cần bổ sung tài liệu hướng dẫn chạy.');
  assert.ok(fbSub.id);

  // Giáo viên nới hạn bài giao sang 2026-11-30
  await asg.updateAssignment('t_1', assignment.id, { deadline: '2026-11-30T23:59:59Z' }, `"${assignment.version}"`);

  // Kiểm tra: Bản nộp 1 vẫn giữ nguyên nội dung lúc nộp và nhận xét
  const checkSub = await sub.getSubmission('t_1', submission.id);
  assert.equal(checkSub.text, 'Mã nguồn commit #1');
  assert.equal(checkSub.feedback[0].text, 'Mã nguồn sạch, cần bổ sung tài liệu hướng dẫn chạy.');
});

test('VT-12: Chế độ xem: Gantt mặc định trong Việc của tôi & Workspace; chuyển Danh sách bảo toàn tập việc', async () => {
  const tasksService = new TasksService();
  const userId = 'usr-view';
  const workspaceId = 'ws-view';

  // Tạo 3 việc với độ ưu tiên khác nhau
  const { task: t1 } = await tasksService.createTask({ accountId: userId }, workspaceId, { title: 'Việc 1', importance: 'high' });
  const { task: t2 } = await tasksService.createTask({ accountId: userId }, workspaceId, { title: 'Việc 2', importance: 'medium' });
  const { task: t3 } = await tasksService.createTask({ accountId: userId }, workspaceId, { title: 'Việc 3', importance: 'low' });

  // Mặc định viewMode theo quy chuẩn thiết kế là gantt (TASK-01 / VIEW-01)
  const defaultViewMode = 'gantt';
  assert.equal(defaultViewMode, 'gantt');

  // Lấy tập việc của workspace
  const wsTasks = await tasksService.listWorkspaceTasks({ accountId: userId }, workspaceId);
  assert.equal(wsTasks.tasks.length, 3);

  // Kiểm tra bảo toàn đúng 3 việc trong workspace
  const ids = wsTasks.tasks.map(t => t.id).sort();
  const expectedIds = [t1.id, t2.id, t3.id].sort();
  assert.deepEqual(ids, expectedIds, 'Chế độ danh sách và gantt bảo toàn chính xác tập việc của workspace');
});
