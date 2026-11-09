# ĐẶC TẢ TÁC NHÂN: AGENT-05 (Class Settings - Teacher Admin)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-05`
- **Tên màn hình:** Class Settings - Teacher Admin
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab05ClassSettingsAdmin.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #5`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=5`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/class-membership.md (CLS-10, CLS-14)`
- `docs/requirements/access-control.md (PER-01, PER-06)`
- `docs/ux/class-membership-q33.md`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab05ClassSettingsAdmin.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Form cấu hình thông tin học phần: Mã lớp, tên môn học, học kỳ, mô tả.
2. Quản lý mã mời (Join Code): Xem mã 6 ký tự, nút Sao chép, nút Đổi mã mới (Regenerate), nút Bật/Tắt tiếp nhận học sinh mới.
3. Chính sách nhóm: Giới hạn thành viên tối thiểu/tối đa, cho phép học sinh tự lập nhóm hay bắt buộc giáo viên chỉ định.
4. Khu vực nguy hiểm (Danger Zone): Lưu trữ lớp (Archive Class), Xóa lớp học vĩnh viễn với ô gõ lại tên lớp để xác nhận.
