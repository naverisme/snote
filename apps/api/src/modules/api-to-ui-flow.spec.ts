import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { TestDb } from './test-db';
import { IdentityService } from './identity/identity.service';
import { AccountService } from './identity/account-service';
import { InMemorySessionStore } from './identity/session-store';
import { ClassService } from './classes/class-service';
import { WorkspaceService } from './workspaces/workspace-service';
import { GroupLifecycle } from './workspaces/group-lifecycle';
import { AdmissionService } from './classes/admission';
import { ScopedAuthorization, allows } from './authorization/policy';
import { DomainError } from '../core/authorization';

test('Luồng API -> UI: Đăng ký, Đăng nhập, Quản lý ngữ cảnh và Kiểm chứng QA-01–04', async () => {
  const db = new TestDb();
  const sessionStore = new InMemorySessionStore();
  const identity = new IdentityService(db.client, sessionStore);
  const accountService = new AccountService(db.client);
  const classService = new ClassService(db.client);
  const groupLifecycle = new GroupLifecycle(db.client);
  const workspaceService = new WorkspaceService(db.client, groupLifecycle);

  // ==========================================
  // 1. Luồng Xác thực (Auth flow): Đăng ký tài khoản
  // ==========================================
  const { account: userTeacher, session: teacherSession } = await identity.register({
    email: 'giaovien@truong.edu.vn',
    password: 'secure-password-2026',
    usages: ['student', 'teacher'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  assert.ok(userTeacher.id);
  assert.ok(teacherSession.token);
  assert.ok(teacherSession.csrfToken);
  assert.ok(teacherSession.cookie.includes('snote_session='));

  // Kiểm tra Default Personal Workspace tự động tạo khi đăng ký (STR-01, ACC-01)
  const teacherWorkspaces = await workspaceService.listWorkspaces(userTeacher.id);
  assert.equal(teacherWorkspaces.length, 1);
  assert.equal(teacherWorkspaces[0].kind, 'default');
  assert.equal(teacherWorkspaces[0].name, 'Cá nhân');

  // Đăng nhập lại
  const loginRes = await identity.login({
    email: 'giaovien@truong.edu.vn',
    password: 'secure-password-2026',
  });
  assert.equal(loginRes.account.id, userTeacher.id);

  // ==========================================
  // 2. QA-01: Bật/tắt Giáo viên và quyền sở hữu lớp
  // ==========================================
  // Tạo lớp khi Teacher usage đang bật
  const class10A = await classService.create(userTeacher.id, {
    name: 'Lớp 10A Tin học',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  assert.equal(class10A.name, 'Lớp 10A Tin học');
  assert.equal(class10A.ownerId, userTeacher.id);

  // Tắt Teacher usage
  const updatedAccount = await accountService.changeUsages(
    userTeacher.id,
    ['student'],
    `"${userTeacher.version}"`,
  );
  assert.deepEqual(updatedAccount.usages, ['student']);

  // Thử tạo thêm lớp mới khi đã tắt Teacher -> Bị chặn 403
  await assert.rejects(
    () => classService.create(userTeacher.id, { name: 'Lớp 10B', timeZone: 'Asia/Ho_Chi_Minh' }),
    (err: unknown) => err instanceof DomainError && err.status === 403,
  );

  // Lớp cũ 10A vẫn được quản lý bình thường bởi userTeacher
  const classLoaded = await classService.get(userTeacher.id, class10A.id);
  assert.equal(classLoaded.id, class10A.id);

  // ==========================================
  // 3. QA-02: Tiếp nhận học sinh & Giới hạn nhóm (groupLimit = 1)
  // ==========================================
  const { account: studentAlice } = await identity.register({
    email: 'alice@student.vn',
    password: 'alice-password-12345',
    usages: ['student'],
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  // Bật lại Teacher để quản trị
  await accountService.changeUsages(userTeacher.id, ['teacher'], `"${updatedAccount.version}"`);

  // Giáo viên gửi lời mời cho Alice vào Lớp 10A
  const classInv = await classService.createInvitation(userTeacher.id, class10A.id, studentAlice.id);
  assert.equal(classInv.status, 'pending');

  // Alice nhận lời mời và chấp nhận vào lớp
  const aliceInvs = await identity.getInvitations(studentAlice.id);
  assert.equal(aliceInvs.length, 1);
  assert.equal(aliceInvs[0].id, classInv.id);

  // Giả lập kích hoạt tư cách lớp
  await db.client.classMembership.create({
    data: { classId: class10A.id, accountId: studentAlice.id, role: 'member', status: 'active' },
  });

  // Giáo viên tạo 2 nhóm trong Lớp 10A (giới hạn 1 nhóm/học sinh)
  const groupRed = await workspaceService.createClassGroup(userTeacher.id, class10A.id, { name: 'Nhóm Đỏ' });
  const groupBlue = await workspaceService.createClassGroup(userTeacher.id, class10A.id, { name: 'Nhóm Xanh' });

  // Mời Alice vào Nhóm Đỏ
  const groupInvRed = await workspaceService.createGroupInvitation(userTeacher.id, groupRed.id, studentAlice.id);
  assert.equal(groupInvRed.status, 'pending');

  // Mời Alice vào Nhóm Xanh
  const groupInvBlue = await workspaceService.createGroupInvitation(userTeacher.id, groupBlue.id, studentAlice.id);
  assert.equal(groupInvBlue.status, 'pending');

  // ==========================================
  // 4. QA-03: Lưu trữ nhóm và bảo toàn trạng thái
  // ==========================================
  const archivedRed = await workspaceService.archiveWorkspace(userTeacher.id, groupRed.id, `"${groupRed.version}"`);
  assert.equal(archivedRed.status, 'archived');

  const restoredRed = await workspaceService.restoreWorkspace(userTeacher.id, groupRed.id, `"${archivedRed.version}"`);
  assert.equal(restoredRed.status, 'active');

  // ==========================================
  // 5. QA-04: Phân quyền Lớp trưởng vs Thành viên
  // ==========================================
  const aliceMembership = await db.client.classMembership.findFirst({
    where: { classId: class10A.id, accountId: studentAlice.id, status: 'active' },
  });
  assert.ok(aliceMembership);

  // Thăng cấp Alice thành Lớp trưởng (Monitor)
  const monitorAlice = await classService.changeMemberRole(
    userTeacher.id,
    class10A.id,
    aliceMembership.id,
    'monitor',
    `"${aliceMembership.version}"`,
  );
  assert.equal(monitorAlice.role, 'monitor');

  // Lớp trưởng có thể duyệt nhóm và sửa văn bản chung, nhưng không có quyền xóa tệp hay hủy sự kiện
  const monitorFacts = {
    scope: { type: 'workspace' as const, id: groupRed.id },
    classId: class10A.id,
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

  assert.equal(allows({ accountId: studentAlice.id }, 'group.approve', monitorFacts), true);
  assert.equal(allows({ accountId: studentAlice.id }, 'library.edit_text', monitorFacts), true);
  assert.equal(allows({ accountId: studentAlice.id }, 'library.delete', monitorFacts), false);
  assert.equal(allows({ accountId: studentAlice.id }, 'event.cancel', monitorFacts), false);
});
