

### [TASK-20261108-025402] Triển khai lát cắt Công việc và Lịch #31 + UI việc/lịch #34: 1) Tasks API: CRUD việc, gán việc, checklist items, hoàn thành/mở lại, bulk actions có kiểm version; 2) Private work sessions; 3) Lịch và sự kiện (timed vs allDay, audience, hủy có audit); 4) Frontend UI Việc và Lịch (Việc của tôi, Gantt, Danh sách, chi tiết việc, Lịch theo múi giờ); 5) Nghiệm thu QA-04, QA-10, QA-11, QA-13.
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/planning (2026-11-08 02:54:02)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: ca8b976, Hoan thanh lat cat Tasks & Calendar API + UI (#31, #34), pass 20 unit/integration tests bao phu QA-04, QA-10, QA-11, QA-13)
  - [x] **VERIFIED by Requester** (Pass Test: Pass 14/14 API specs, 6/6 Web specs, builds clean, files strictly within ownership, verified at 2026-11-08 03:42:01)


### [TASK-20261108-025411] Triển khai lát cắt Bài giao và Nộp #32 + UI bài giao #33: 1) Assignment API: tạo bài giao nhận nhiều nhóm, deadline, late policy override; 2) Submission API: nộp bài chống trùng Idempotency-Key, lịch sử revision, phản hồi feedback; 3) Tiến độ nhóm; 4) Thông báo; 5) Frontend UI Bài giao và Nộp (giáo viên: tạo bài, tiến độ, nhận xét; sinh viên: chi tiết, nộp bài, phiên bản); 6) Nghiệm thu QA-08, QA-09, QA-13.
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/assignments (2026-11-08 02:54:11)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: ea0e2f44f5fb69a59fa0270c01ff9f82455d062e, Triển khai hoàn chỉnh lát cắt Bài giao và Nộp (#32 + UI #33): Assignment/Submission API, tiến độ nhóm, outbox notification, Frontend UI giáo viên và người học, đạt 22/22 ca test gồm QA-08, QA-09, QA-13 và contract validation.)
  - [x] **VERIFIED by Requester** (Pass Test: Pass 22/22 API specs (QA-08 idempotency replay/conflict, QA-09 late policy, QA-13), web Vite build pass, files strictly within ownership, verified at 2026-11-08 03:45:23)

---


### [TASK-20261108-032105] Doc ky review/inbox/feat_v2_assignments.md va WORKTREES.md. Bat dau thuc thi TASK-20261108-025411 trong pham vi tep so huu cua assignments. Xay dung assignment/submission API, tien do nhom va UI bai giao. Sau khi commit, chay: winwork resolve TASK-20261108-025411 -Sha <SHA> -Note '<mota>'
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/assignments (2026-11-08 03:21:05)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: ea0e2f44f5fb69a59fa0270c01ff9f82455d062e, Triển khai hoàn chỉnh lát cắt Bài giao và Nộp (#32 + UI #33): Assignment/Submission API, tiến độ nhóm, outbox notification, Frontend UI giáo viên và người học, đạt 22/22 ca test gồm QA-08, QA-09, QA-13 và contract validation.)
  - [x] **VERIFIED by Requester** (Pass Test: Resolved with main task, verified at 2026-11-08 03:45:33)

---


### [TASK-20261108-033259] THONG BAO TU WINWORK: Tien trinh da duoc DONG BANG (Freeze). Tam dung tat ca thao tac cho den khi nhan lenh resume.
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/assignments (2026-11-08 03:32:59)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: ea0e2f44f5fb69a59fa0270c01ff9f82455d062e, Triển khai hoàn chỉnh lát cắt Bài giao và Nộp (#32 + UI #33): Assignment/Submission API, tiến độ nhóm, outbox notification, Frontend UI giáo viên và người học, đạt 22/22 ca test gồm QA-08, QA-09, QA-13 và contract validation.)
  - [x] **VERIFIED by Requester** (Pass Test: Resolved with main task, verified at 2026-11-08 03:45:33)


### [TASK-20261108-025353] Triển khai lát cắt Thư viện #35 + UI #30: 1) StoragePort local adapter, upload staging/verify/commit; 2) Quota tracking chặt chẽ, từ chối khi vượt dung lượng; 3) Quản lý text/link/file items, revisions, folders, trash 30 ngày và restore; 4) Frontend UI Thư viện (Hộp thu, tài liệu, upload dialog, phiên bản, thùng rác); 5) Nghiệm thu QA-05–07, QA-12–14.
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/library (2026-11-08 02:53:53)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: c8bd4e8, Hoan tat StoragePort local adapter, upload staging/verify/commit, quota tracking, items, revisions, folders, trash 30 ngay va UI Thu vien; 20/20 tests pass QA-05-07, QA-12-14)
  - [x] **VERIFIED by Requester** (Pass Test: Pass 20/20 API tests, 3/3 Web tests, contract:validate 100% pass, clean Vite build, verified at 2026-11-08 03:51:13)

---


### [TASK-20261108-032104] Doc ky review/inbox/feat_v2_library.md va WORKTREES.md. Bat dau thuc thi TASK-20261108-025353 trong pham vi tep so huu cua library. Xay dung StoragePort local adapter, quota, items API va UI thu vien. Sau khi commit, chay: winwork resolve TASK-20261108-025353 -Sha <SHA> -Note '<mota>'
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/library (2026-11-08 03:21:04)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: c8bd4e8, Hoan tat StoragePort local adapter, upload staging/verify/commit, quota tracking, items, revisions, folders, trash 30 ngay va UI Thu vien; 20/20 tests pass QA-05-07, QA-12-14)
  - [x] **VERIFIED by Requester** (Pass Test: Resolved with main task, verified at 2026-11-08 03:51:13)

---


### [TASK-20261108-033259] THONG BAO TU WINWORK: Tien trinh da duoc DONG BANG (Freeze). Tam dung tat ca thao tac cho den khi nhan lenh resume.
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/library (2026-11-08 03:32:59)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: c8bd4e8, Hoan tat StoragePort local adapter, upload staging/verify/commit, quota tracking, items, revisions, folders, trash 30 ngay va UI Thu vien; 20/20 tests pass QA-05-07, QA-12-14)
  - [x] **VERIFIED by Requester** (Pass Test: Resolved with main task, verified at 2026-11-08 03:51:14)

---


### [TASK-20261108-034835] Kiem tra nghiem thu: 20/20 API tests PASS, contract validate PASS, Vite web build PASS. Chi con 1 diem nho: library-ui.spec.ts import tu .tsx khien 'node --test' gap loi ERR_UNKNOWN_FILE_EXTENSION. Hay trich xuat formatBytes va MAX_FILE_SIZE/ALLOWED_EXTENSIONS ra 'apps/web/src/features/library/utils.ts', sua import va commit bo sung de 'node --test library-ui.spec.ts' PASS 100% luon nhe!
- **Ben yeu cau:** s_note_v2 -> **Ben thuc thi:** feat/v2/library (2026-11-08 03:48:35)
- **Tep dinh kem:** none
- **Ky duyet hoan thanh:**
  - [x] **RESOLVED by Implementer** (Commit SHA: ca3c96a, Trich xuat utils.ts, sua import trong library-ui.spec.ts va components; 23/23 tests pass 100%)
  - [x] **VERIFIED by Requester** (Pass Test: Extracted utils.ts, 23/23 tests pass 100%, verified at 2026-11-08 03:51:14)
