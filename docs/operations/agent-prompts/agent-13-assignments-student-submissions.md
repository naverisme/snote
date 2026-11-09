# ĐẶC TẢ TÁC NHÂN: AGENT-13 (Assignments - Student Submissions)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-13`
- **Tên màn hình:** Assignments - Student Submissions
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab13AssignmentsStudent.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #13`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=13`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/assignments-and-submissions.md (ASG-01..15, VT-10, VT-11)`
- `docs/ux/assignments-q33.md (CUXD-05)`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab13AssignmentsStudent.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Form nộp bài tập hỗ trợ nộp đa phiên bản (v1, v2, v3) với liên kết file tài liệu.
2. Lịch sử phiên bản nộp bài (Version Snapshots): Bất biến, ghi nhận mốc thời gian nộp chính xác (VT-11).
3. Khung hiển thị nhận xét và phản hồi của Giáo viên theo từng phiên bản nộp.
4. Trạng thái khóa bài khi đã hết hạn nộp theo chính sách lớp (VT-10).
