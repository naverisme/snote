# ĐẶC TẢ TÁC NHÂN: AGENT-12 (Assignments - Teacher 3-Axis Matrix)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-12`
- **Tên màn hình:** Assignments - Teacher 3-Axis Matrix
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab12AssignmentsTeacher.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #12`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=12`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/assignments-and-submissions.md (ASG-01..15)`
- `docs/ux/assignments-q33.md (CUXD-03)`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab12AssignmentsTeacher.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Ma trận tiến độ 3 trục CUXD-03: Nhóm thực hiện × Bài tập × Trạng thái nộp bài.
2. Danh sách các bài nộp với huy hiệu trạng thái: Đúng hạn, Nộp muộn (VT-06/VT-10), Chưa nộp.
3. Khung chấm điểm theo Rubric và nhập nhận xét trực tiếp gắn liền với phiên bản nộp.
4. Nút công bố điểm hoặc yêu cầu nộp lại phiên bản mới.
