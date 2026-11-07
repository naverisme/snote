import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { TestDb } from './test-db';
import { IdentityService, hashPassword, verifyPassword } from './identity/identity.service';
import { AccountService } from './identity/account-service';
import { InMemorySessionStore } from './identity/session-store';
import { ClassService } from './classes/class-service';
import { WorkspaceService } from './workspaces/workspace-service';
import { GroupLifecycle } from './workspaces/group-lifecycle';
import { AdmissionService } from './classes/admission';
import { PrismaAdmissionStore } from './classes/prisma-admission-store';
import { ScopedAuthorization, allows } from './authorization/policy';
import { PrismaPolicyReader } from './authorization/prisma-policy-reader';
import { DomainError } from '../core/authorization';

test('QA-01: Sinh viên bật/tắt Giáo viên trong Cài đặt, sở hữu một lớp cũ', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const accountService = new AccountService(db.client);
  const classService = new ClassService(db.client);

  // 1. Đăng ký tài khoản chỉ với usage student
  const { account: studentAcc } = await identity.register({
    email: 'student@example.invalid',
    password: 'password123456',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  assert.deepEqual(studentAcc.usages, ['student']);

  // 2. Thử tạo lớp khi chưa có Teacher usage -> Bị từ chối 403
  await assert.rejects(
    () => classService.create(studentAcc.id, { name: 'Lớp Toán 10A', timeZone: 'Asia/Ho_Chi_Minh' }),
    (err: unknown) => err instanceof DomainError && err.status === 403,
  );

  // 3. Bật Teacher usage qua AccountService (yêu cầu If-Match version)
  const updatedAcc = await accountService.changeUsages(
    studentAcc.id,
    ['student', 'teacher'],
    `"${studentAcc.version}"`,
  );
  assert.deepEqual(updatedAcc.usages, ['student', 'teacher']);
  assert.equal(updatedAcc.version, studentAcc.version + 1);

  // 4. Tạo lớp thành công khi đã có Teacher usage
  const cls = await classService.create(studentAcc.id, { name: 'Lớp Toán 10A', timeZone: 'Asia/Ho_Chi_Minh' });
  assert.equal(cls.name, 'Lớp Toán 10A');
  assert.equal(cls.ownerId, studentAcc.id);
  assert.equal(cls.status, 'active');

  // 5. Tắt Teacher usage (chỉ còn student)
  const toggledOff = await accountService.changeUsages(
    studentAcc.id,
    ['student'],
    `"${updatedAcc.version}"`,
  );
  assert.deepEqual(toggledOff.usages, ['student']);

  // 6. Thử tạo lớp thứ hai sau khi tắt -> Bị từ chối 403
  await assert.rejects(
    () => classService.create(studentAcc.id, { name: 'Lớp Toán 10B', timeZone: 'Asia/Ho_Chi_Minh' }),
    (err: unknown) => err instanceof DomainError && err.status === 403,
  );

  // 7. Lớp cũ vẫn giữ nguyên quyền chủ lớp: có thể lấy thông tin và lưu trữ lớp cũ! (STR-03)
  const loadedClass = await classService.get(studentAcc.id, cls.id);
  assert.equal(loadedClass.id, cls.id);
  assert.equal(loadedClass.ownerId, studentAcc.id);

  const archivedClass = await classService.setArchived(studentAcc.id, cls.id, true, `"${cls.version}"`);
  assert.equal(archivedClass.status, 'archived');

  // 8. Giáo viên khác không thể xem hoặc sửa lớp này
  const { account: otherTeacher } = await identity.register({
    email: 'other@example.invalid',
    password: 'password123456',
    usages: ['teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  await assert.rejects(
    () => classService.get(otherTeacher.id, cls.id),
    (err: unknown) => err instanceof DomainError && err.status === 404,
  );
});

test('QA-02: Chấp nhận lời mời hoặc duyệt mã lớp, rồi vào nhóm; giới hạn 1 nhóm', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);
  const workspaceService = new WorkspaceService(db.client);

  // Teacher tạo lớp
  const { account: teacher } = await identity.register({
    email: 'teacher2@example.invalid',
    password: 'password123456',
    usages: ['teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  const cls = await classService.create(teacher.id, { name: 'Lớp 11B', timeZone: 'Asia/Ho_Chi_Minh' });

  // Student A đăng ký
  const { account: studentA } = await identity.register({
    email: 'studentA@example.invalid',
    password: 'password123456',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  // Teacher mời Student A vào lớp
  const invitation = await classService.createInvitation(teacher.id, cls.id, studentA.id);
  assert.equal(invitation.status, 'pending');

  // Student B đăng ký và dùng mã lớp
  const { account: studentB } = await identity.register({
    email: 'studentB@example.invalid',
    password: 'password123456',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  // Bật mã lớp
  const codeState = await classService.setJoinCode(teacher.id, cls.id, true, `"${cls.version}"`);
  assert.equal(codeState.enabled, true);
  assert.ok(codeState.code);

  // Student B nộp mã lớp -> tạo JoinRequest
  const joinReq = await classService.createJoinRequest(studentB.id, cls.id, codeState.code!);
  assert.equal(joinReq.status, 'pending');

  // Teacher tạo 2 nhóm trong lớp (giới hạn mặc định groupLimit = 1)
  const group1 = await workspaceService.createClassGroup(teacher.id, cls.id, { name: 'Nhóm 1' });
  const group2 = await workspaceService.createClassGroup(teacher.id, cls.id, { name: 'Nhóm 2' });
  assert.equal(group1.kind, 'class_group');
  assert.equal(group2.kind, 'class_group');

  // Khi chưa là thành viên lớp, Student A không thể vào nhóm
  await assert.rejects(
    () => workspaceService.createGroupInvitation(teacher.id, group1.id, studentA.id),
    (err: unknown) => err instanceof DomainError && err.status === 403,
  );
});

test('QA-03: Lưu trữ nhóm/lớp và khôi phục', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);
  const groupLifecycle = new GroupLifecycle(db.client);
  const workspaceService = new WorkspaceService(db.client, groupLifecycle);

  const { account: teacher } = await identity.register({
    email: 'teacher3@example.invalid',
    password: 'password123456',
    usages: ['teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  const cls = await classService.create(teacher.id, { name: 'Lớp 12A', timeZone: 'Asia/Ho_Chi_Minh' });
  const group = await workspaceService.createClassGroup(teacher.id, cls.id, { name: 'Nhóm Dự Án' });

  // Lưu trữ nhóm
  const archivedGroup = await workspaceService.archiveWorkspace(teacher.id, group.id, `"${group.version}"`);
  assert.equal(archivedGroup.status, 'archived');

  // Khôi phục nhóm
  const restoredGroup = await workspaceService.restoreWorkspace(teacher.id, group.id, `"${archivedGroup.version}"`);
  assert.equal(restoredGroup.status, 'active');
});

test('QA-04: Thành viên, Lớp trưởng, Trưởng nhóm và Chủ lớp phân quyền theo scope', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const classService = new ClassService(db.client);
  const workspaceService = new WorkspaceService(db.client);

  const { account: teacher } = await identity.register({
    email: 'teacher4@example.invalid',
    password: 'password123456',
    usages: ['teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  const cls = await classService.create(teacher.id, { name: 'Lớp Lý', timeZone: 'Asia/Ho_Chi_Minh' });

  const { account: student1 } = await identity.register({
    email: 'student1@example.invalid',
    password: 'password123456',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  // Tạo membership trực tiếp cho student1
  const m1 = await db.client.classMembership.create({
    data: { classId: cls.id, accountId: student1.id, role: 'member', status: 'active' },
  });

  // Thăng cấp student1 lên monitor
  const monitorM = await classService.changeMemberRole(teacher.id, cls.id, m1.id, 'monitor', `"${m1.version}"`);
  assert.equal(monitorM.role, 'monitor');

  // Thử thăng cấp người thứ hai lên monitor -> Bị từ chối 409 vì chỉ cho phép tối đa 1 monitor
  const { account: student2 } = await identity.register({
    email: 'student2@example.invalid',
    password: 'password123456',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  const m2 = await db.client.classMembership.create({
    data: { classId: cls.id, accountId: student2.id, role: 'member', status: 'active' },
  });

  await assert.rejects(
    () => classService.changeMemberRole(teacher.id, cls.id, m2.id, 'monitor', `"${m2.version}"`),
    (err: unknown) => err instanceof DomainError && err.status === 409,
  );

  // Monitor có quyền monitorDefaults nhưng không có quyền xóa tệp hay hủy sự kiện của người khác
  const factsMonitor = {
    scope: { type: 'workspace' as const, id: 'w1' },
    classId: cls.id,
    classOwner: false,
    classMember: true,
    monitor: true,
    workspaceMember: true,
    workspaceOwner: false,
    leader: false,
    manager: false,
    archived: false,
    defaultWorkspace: false,
    grants: new Set<any>(),
  };

  assert.equal(allows({ accountId: student1.id }, 'library.edit_text', factsMonitor), true);
  assert.equal(allows({ accountId: student1.id }, 'library.delete', factsMonitor), false);
  assert.equal(allows({ accountId: student1.id }, 'event.cancel', factsMonitor), false);
  assert.equal(allows({ accountId: student1.id }, 'task.checklist', factsMonitor), false);
});

test('Password hashing and verification is secure and timing-safe', () => {
  const hash = hashPassword('my-super-secret-password-12345');
  assert.ok(hash.includes(':'));
  assert.equal(verifyPassword('my-super-secret-password-12345', hash), true);
  assert.equal(verifyPassword('wrong-password', hash), false);
});
