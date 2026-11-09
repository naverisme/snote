# ĐẶC TẢ TÁC NHÂN: AGENT-06 (Group Members - Group Leader Owner)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-06`
- **Tên màn hình:** Group Members - Group Leader Owner
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab06GroupMembersOwner.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #6`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=6`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/access-control.md (PER-03, PER-04, PER-07)`
- `docs/requirements/structural-rules.md (STR-09)`
- `docs/ux/workspace-and-tasks.md`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab06GroupMembersOwner.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Quản lý toàn diện thành viên nhóm học tập ở cương vị Trưởng nhóm.
2. Danh sách đơn xin gia nhập chờ duyệt (Approve / Reject Requests).
3. Nút "Mời thành viên" chọn từ danh sách học sinh trong lớp chưa có nhóm.
4. Hành động chuyển quyền Trưởng nhóm (Transfer Leadership) sang thành viên khác.
5. Hành động Kick / Mời ra khỏi nhóm kèm biên bản bàn giao.
