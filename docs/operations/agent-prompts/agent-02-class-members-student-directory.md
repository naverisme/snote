# ĐẶC TẢ TÁC NHÂN: AGENT-02 (Class Members - Student Directory)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-02`
- **Tên màn hình:** Class Members - Student Directory
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab02ClassMembersStudent.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #2`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=2`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/class-membership.md (CLS-01, CLS-02, CLS-13)`
- `docs/requirements/access-control.md (PER-02, PER-10)`
- `docs/ux/class-membership-q33.md`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab02ClassMembersStudent.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Giao diện danh bạ học sinh dạng chỉ đọc (Readonly Directory).
2. Hiển thị rõ thông tin Giáo viên chủ nhiệm và Lớp trưởng ở phần đầu trang.
3. Hiển thị badge nhóm mà mỗi học sinh đang trực thuộc.
4. Nút "Rời lớp học" với modal cảnh báo điều kiện và hậu quả (mất liên kết nhóm).
