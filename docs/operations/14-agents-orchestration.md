# ĐẶC TẢ ĐIỀU PHỐI 14 TÁC NHÂN GIAO DIỆN SNOTE V2
## Zero-Collision Agent Architecture & Context Ingestion Protocol

| Trường | Giá trị |
| :--- | :--- |
| **Mã tài liệu** | `DOC-AGENT-14-PROTOCOL` |
| **Trạng thái** | `OFFICIAL SPECIFICATION` |
| **Kiến trúc** | Đa tác nhân song song (Multi-Agent) trên cùng một Workspace đơn |
| **Mô hình cô lập** | Độc quyền theo tệp (File-Level Isolation) — Loại bỏ xung đột Git Worktree |
| **Cơ chế phản hồi** | Vite Hot Module Replacement (HMR) < 50ms |

---

## 1. NGUYÊN TẮC HÀNH VI BẮT BUỘC (INVARIANT RULES)

Mọi Tác nhân (Agent 01 -> Agent 14) khi được khởi động PHẢI tuân thủ 5 điều luật bất biến sau:

1. **Quyền sở hữu tệp độc quyền (Exclusive File Ownership):**
   - Mỗi tác nhân CHỈ ĐƯỢC PHÉP đọc và chỉnh sửa duy nhất 01 tệp component được phân bổ trong `apps/web/src/previews/Tab[01..14]*.tsx`.
   - **TUYỆT ĐỐI KHÔNG ĐƯỢC** chỉnh sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay bất kỳ tệp component nào của tác nhân khác.
2. **Quy chuẩn Thẩm mỹ Đơn sắc (Monochrome Neutral Grayscale System):**
   - Không được dùng bất kỳ màu accent rực rỡ nào (`#3b82f6`, `#ef4444`, `rgb(...)`, `hsl(...)`).
   - Bắt buộc dùng biến CSS:
     - Nền: `var(--bg-app)` (`#121214`), `var(--surface-card)` (`#18191e`), `var(--surface-hover)` (`#22242c`).
     - Viền: `var(--border-divider)` (`#262832`), `var(--border-strong)` (`#3b3e4f`).
     - Chữ: `var(--text-primary)` (`#f0f0f2`), `var(--text-secondary)` (`#a0a2b0`), `var(--sidebar-text)` (`#76798c`).
3. **Biểu tượng Chuẩn hóa (Lucide React SVG):**
   - Chỉ dùng icons từ gói `lucide-react`. Đảm bảo kích thước chuẩn (14px cho icon trong nút nhỏ, 16px-18px cho nút thường, 20px-24px cho tiêu đề).
4. **Cô lập Dữ liệu Tự thân (Zero-API Mock State):**
   - Không thực hiện gọi HTTP API thực tế (`fetch`, `axios`). Sử dụng `useState` cục bộ với mock data đầy đủ, chuẩn kiểu dữ liệu từ `packages/contracts/src/schema.ts`.
5. **Tiêu chuẩn Khả năng Tiếp cận (WCAG AA Accessibility):**
   - Phân cấp thẻ tiêu đề tuần tự (`h1` -> `h2` -> `h3`), không nhảy cóc cấp bậc. Mọi icon-only button phải có `aria-label` và `title`.

---

## 2. MA TRẬN 14 TÁC NHÂN: VAI TRÒ, TỆP PHÂN BỔ & TÀI LIỆU NẠP NGỮ CẢNH

| Tác nhân ID | Vai trò & Mục tiêu | Tệp Component Sở Hữu | Ngữ cảnh Đặc tả Cần Đọc | URL Kiểm duyệt Trực tiếp |
| :---: | :--- | :--- | :--- | :--- |
| **AGENT-01** | Quản lý thành viên lớp (Giáo viên) | `apps/web/src/previews/Tab01ClassMembersAdmin.tsx` | `docs/requirements/class-membership.md`<br>`docs/requirements/access-control.md` | `http://localhost:5173/?tab=1` |
| **AGENT-02** | Danh bạ thành viên lớp (Học sinh) | `apps/web/src/previews/Tab02ClassMembersStudent.tsx` | `docs/requirements/class-membership.md`<br>`docs/requirements/access-control.md` | `http://localhost:5173/?tab=2` |
| **AGENT-03** | Bento nhóm trong lớp (Giáo viên) | `apps/web/src/previews/Tab03ClassGroupsAdmin.tsx` | `docs/requirements/class-membership.md`<br>`docs/requirements/use-cases.md` | `http://localhost:5173/?tab=3` |
| **AGENT-04** | Nhóm trong lớp & Xin gia nhập (Học sinh) | `apps/web/src/previews/Tab04ClassGroupsStudent.tsx` | `docs/requirements/class-membership.md`<br>`docs/requirements/use-cases.md` | `http://localhost:5173/?tab=4` |
| **AGENT-05** | Cài đặt học phần & Mã mời (Giáo viên) | `apps/web/src/previews/Tab05ClassSettingsAdmin.tsx` | `docs/requirements/class-membership.md`<br>`docs/requirements/access-control.md` | `http://localhost:5173/?tab=5` |
| **AGENT-06** | Thành viên nhóm & Phân quyền (Trưởng nhóm) | `apps/web/src/previews/Tab06GroupMembersOwner.tsx` | `docs/requirements/access-control.md`<br>`docs/requirements/structural-rules.md` | `http://localhost:5173/?tab=6` |
| **AGENT-07** | Phân công nhóm & Rời nhóm (Thành viên) | `apps/web/src/previews/Tab07GroupMembersStudent.tsx` | `docs/requirements/access-control.md`<br>`docs/requirements/structural-rules.md` | `http://localhost:5173/?tab=7` |
| **AGENT-08** | Tiến độ dòng thời gian Gantt 22 ngày | `apps/web/src/previews/Tab08TasksGantt.tsx` | `docs/requirements/tasks.md`<br>`docs/ux/workspace-and-tasks.md` | `http://localhost:5173/?tab=8` |
| **AGENT-09** | Danh sách công việc & Checklist xác nhận | `apps/web/src/previews/Tab09TasksList.tsx` | `docs/requirements/tasks.md`<br>`docs/ux/workspace-and-tasks.md` | `http://localhost:5173/?tab=9` |
| **AGENT-10** | Lịch biểu & Cảnh báo trùng lịch | `apps/web/src/previews/Tab10CalendarGrid.tsx` | `docs/requirements/calendar.md`<br>`docs/ux/calendar-q33.md` | `http://localhost:5173/?tab=10` |
| **AGENT-11** | Thư viện tệp, Quota & Cây thư mục | `apps/web/src/previews/Tab11LibraryExplorer.tsx` | `docs/requirements/library.md`<br>`docs/ux/library-q33.md` | `http://localhost:5173/?tab=11` |
| **AGENT-12** | Bài giao & Ma trận tiến độ 3 trục (Giáo viên) | `apps/web/src/previews/Tab12AssignmentsTeacher.tsx` | `docs/requirements/assignments-and-submissions.md`<br>`docs/ux/assignments-q33.md` | `http://localhost:5173/?tab=12` |
| **AGENT-13** | Nộp bài đa phiên bản v1/v2/v3 (Học sinh) | `apps/web/src/previews/Tab13AssignmentsStudent.tsx` | `docs/requirements/assignments-and-submissions.md`<br>`docs/ux/assignments-q33.md` | `http://localhost:5173/?tab=13` |
| **AGENT-14** | Ghi chú nhanh & Thẻ lưu ý Workspace | `apps/web/src/previews/Tab14WorkspaceNotes.tsx` | `docs/ux/workspace-and-tasks.md` | `http://localhost:5173/?tab=14` |

---

## 3. PROMPT NẠP NGỮ CẢNH CHI TIẾT CHO TỪNG AGENT

### Prompt khởi động mẫu cho Agent 01:
```markdown
Bạn là AGENT-01: Chuyên trách Giao diện Thành viên Lớp học (Góc nhìn Giáo viên/Admin).
Nhiệm vụ của bạn:
1. ĐỌC NGỮ CẢNH: Đọc docs/requirements/class-membership.md (các mục CLS-01, CLS-02, CLS-03, CLS-13) và docs/requirements/access-control.md (PER-01, PER-02).
2. TỆP SỞ HỮU DUY NHẤT: apps/web/src/previews/Tab01ClassMembersAdmin.tsx.
3. RÀNG BUỘC KỸ THUẬT:
   - TUYỆT ĐỐI KHÔNG sửa file nào khác ngoài tệp sở hữu.
   - Giữ nguyên thiết kế B&W Monochrome (chỉ dùng CSS variables: --bg-app, --surface-card, --border-divider, --text-primary).
   - Bảng danh sách thành viên có cột dính (sticky action), modal bổ nhiệm Lớp trưởng, duyệt mã mời tham gia, modal xác nhận kick học sinh.
   - Dùng icon Lucide React. Đạt chuẩn WCAG AA.
```

### Prompt khởi động mẫu cho Agent 08:
```markdown
Bạn là AGENT-08: Chuyên trách Giao diện Tiến độ Dòng thời gian Gantt (UXR-11).
Nhiệm vụ của bạn:
1. ĐỌC NGỮ CẢNH: Đọc docs/requirements/tasks.md (TSK-01..15) và docs/ux/workspace-and-tasks.md (UXR-11).
2. TỆP SỞ HỮU DUY NHẤT: apps/web/src/previews/Tab08TasksGantt.tsx.
3. RÀNG BUỘC KỸ THUẬT:
   - Trục thời gian 22 ngày hiển thị thanh tiến độ task trực quan.
   - Milestone bar phân định rõ các mốc chuyển giao.
   - Click vào task mở Drawer chi tiết bên phải (width: 380px) hiển thị checklist, người phụ trách, thời hạn.
   - Chuyển trạng thái mượt mà 160ms. Hệ màu B&W đơn sắc tuyệt đối.
```

### Prompt khởi động mẫu cho Agent 12:
```markdown
Bạn là AGENT-12: Chuyên trách Giao diện Bài giao & Ma trận Tiến độ 3 trục (Giáo viên - CUXD-03).
Nhiệm vụ của bạn:
1. ĐỌC NGỮ CẢNH: Đọc docs/requirements/assignments-and-submissions.md (ASG-01..15) và docs/ux/assignments-q33.md (CUXD-03).
2. TỆP SỞ HỮU DUY NHẤT: apps/web/src/previews/Tab12AssignmentsTeacher.tsx.
3. RÀNG BUỘC KỸ THUẬT:
   - Triển khai ma trận 3 trục: Nhóm / Bài tập / Trạng thái nộp bài.
   - Bảng chấm điểm hỗ trợ nhập điểm và phản hồi theo từng snapshot phiên bản nộp.
   - Phân biệt rõ các trạng thái: Đã nộp đúng hạn, Nộp muộn, Chưa nộp, Cần chấm lại.
```
