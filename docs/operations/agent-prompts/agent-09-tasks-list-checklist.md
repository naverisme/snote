# ĐẶC TẢ TÁC NHÂN: AGENT-09 (Tasks - List & Checklist)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-09`
- **Tên màn hình:** Tasks - List & Checklist
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab09TasksList.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #9`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=9`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/tasks.md (TSK-01..15, VT-07)`
- `docs/ux/workspace-and-tasks.md (UXR-12)`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab09TasksList.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Thanh bộ lọc tác vụ: Tất cả, Hôm nay, Ngày mai, Việc quan trọng, Đã hoàn thành (UXR-12).
2. Mỗi thẻ công việc hiển thị tiến độ checklist con (ví dụ 3/5 mục).
3. Quy tắc VT-07: Khi tick chọn đủ các mục con, KHÔNG tự động chuyển trạng thái xong mà PHẢI hiện modal xác nhận hoàn thành công việc.
4. Form thêm nhanh công việc với người phụ trách và nhãn ưu tiên.
