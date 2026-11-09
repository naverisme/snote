# ĐẶC TẢ TÁC NHÂN: AGENT-14 (Workspace Notes - Scratchpad)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-14`
- **Tên màn hình:** Workspace Notes - Scratchpad
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab14WorkspaceNotes.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #14`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=14`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/ux/workspace-and-tasks.md (Mục lưu ý, Ghi chú nhanh)`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab14WorkspaceNotes.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Lưới thẻ ghi chú (Notes Bento Grid) hiển thị tiêu đề, trích đoạn nội dung, ngày cập nhật.
2. Tính năng ghim ghi chú quan trọng lên đầu trang (Pinned Notes).
3. Trình soạn thảo ghi chú nhanh với định dạng tiêu đề, danh sách gạch đầu dòng, checklist.
4. Bộ lọc tìm kiếm ghi chú theo từ khóa và thẻ phân loại.
