# ĐẶC TẢ TÁC NHÂN: AGENT-10 (Calendar - Schedule Grid)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-10`
- **Tên màn hình:** Calendar - Schedule Grid
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab10CalendarGrid.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #10`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=10`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/calendar.md (CAL-01..12, VT-09)`
- `docs/ux/calendar-q33.md`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab10CalendarGrid.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Lưới lịch trực quan hỗ trợ xem theo Tháng, Tuần, Ngày.
2. Thẻ sự kiện phân định rõ phạm vi (Scope): Lớp học (Toàn lớp), Nhóm (Chỉ nhóm thấy - VT-09), Cá nhân (Riêng tư).
3. Thuật toán phát hiện trùng lịch (Collision Detection) hiển thị huy hiệu cảnh báo va chạm giờ làm việc.
4. Modal tạo/chỉnh sửa sự kiện lịch với chọn địa điểm, thời gian bắt đầu/kết thúc.
