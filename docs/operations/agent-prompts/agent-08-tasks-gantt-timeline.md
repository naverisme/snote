# ĐẶC TẢ TÁC NHÂN: AGENT-08 (Tasks - Gantt Timeline)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-08`
- **Tên màn hình:** Tasks - Gantt Timeline
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab08TasksGantt.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #8`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=8`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/tasks.md (TSK-01..15)`
- `docs/ux/workspace-and-tasks.md (UXR-11)`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab08TasksGantt.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Trục thời gian ngang 22 ngày hiển thị lưới cột ngày rõ ràng.
2. Thanh tiến độ công việc (Task Bars) thể hiện thời gian bắt đầu, số ngày thực hiện, trạng thái hoàn thành.
3. Các mốc Milestone phân định rõ chu kỳ giao nộp.
4. Click vào công việc mở Task Drawer bên phải (w: 380px) hiển thị checklist, người được giao, hạn chót.
5. Hiệu ứng chuyển đổi mượt mà 160ms (UXR-11).
