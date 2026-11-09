# ĐẶC TẢ TÁC NHÂN: AGENT-03 (Class Groups - Teacher Admin)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-03`
- **Tên màn hình:** Class Groups - Teacher Admin
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab03ClassGroupsAdmin.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #3`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=3`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/class-membership.md (CLS-04, CLS-05, CLS-06, CLS-07, CLS-16)`
- `docs/requirements/use-cases.md (UC-04)`
- `docs/ux/class-membership-q33.md`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab03ClassGroupsAdmin.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Lưới Bento hiển thị toàn bộ các nhóm trong lớp học.
2. Thước đo sức chứa nhóm (Capacity Meter: ví dụ 4/5 thành viên) với cảnh báo đủ/thiếu.
3. Nút chuyển thẳng vào Không gian làm việc nhóm (Group Workspace).
4. Thao tác Quản trị viên: Đổi tên nhóm, giải tán/lưu trữ nhóm (Archive Group), tạo nhóm mới hộ học sinh.
