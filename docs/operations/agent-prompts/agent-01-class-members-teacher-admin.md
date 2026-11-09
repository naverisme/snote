# ĐẶC TẢ TÁC NHÂN: AGENT-01 (Class Members - Teacher Admin)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-01`
- **Tên màn hình:** Class Members - Teacher Admin
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab01ClassMembersAdmin.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #1`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=1`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/class-membership.md (CLS-01, CLS-02, CLS-03, CLS-08, CLS-13)`
- `docs/requirements/access-control.md (PER-01, PER-02, PER-09, PER-10, PER-11)`
- `docs/ux/class-membership-q33.md (CUXC-07, CUXC-09, CUXC-11)`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab01ClassMembersAdmin.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Bảng danh sách thành viên lớp có cột thao tác sticky (CUXC-11).
2. Modal bổ nhiệm / bãi nhiệm Lớp trưởng (CLS-02).
3. Tab hoặc danh sách duyệt mã mời tham gia lớp (CLS-03, Join Requests).
4. Hành động Kick / Xóa thành viên khỏi lớp với modal xác nhận an toàn (CLS-08).
5. Bộ lọc tìm kiếm theo tên, email, vai trò (Giáo viên, Lớp trưởng, Học sinh).
