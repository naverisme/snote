# ĐẶC TẢ TÁC NHÂN: AGENT-11 (Library - Explorer & Storage)

## 1. PHẠM VI TRÁCH NHIỆM & TỆP SỞ HỮU
- **Mã tác nhân:** `AGENT-11`
- **Tên màn hình:** Library - Explorer & Storage
- **Tệp component sở hữu ĐỘC QUYỀN:** `apps/web/src/previews/Tab11LibraryExplorer.tsx`
- **Tab ID kiểm duyệt trên trình duyệt:** `Tab #11`
- **URL kiểm duyệt trực tiếp:** `http://localhost:5173/?tab=11`

---

## 2. TÀI LIỆU NGỮ CẢNH BẮT BUỘC ĐỌC (CONTEXT INGESTION)
Trước khi thực hiện bất kỳ dòng code nào, Agent PHẢI đọc kỹ các tệp đặc tả sau:
- `docs/requirements/library.md (LIB-01..10, LIB-08 quota, QA-05)`
- `docs/ux/library-q33.md`

---

## 3. CÁC QUY TẮC BẤT BIẾN (INVARIANT RULES)
1. **Sở hữu tệp độc quyền:** Bạn CHỈ ĐƯỢC PHÉP đọc và sửa tệp `apps/web/src/previews/Tab11LibraryExplorer.tsx`. TUYỆT ĐỐI KHÔNG sửa `App.tsx`, `theme.css`, `types.ts`, `PreviewHarness.tsx` hay các tệp Tab khác.
2. **Quy chuẩn B&W Monochrome Neutral Grayscale:** 
   - Tuyệt đối KHÔNG hardcode màu sắc rực rỡ (`#3b82f6`, `#ef4444`, v.v.).
   - Bắt buộc dùng biến CSS: `--bg-app` (`#121214`), `--surface-card` (`#18191e`), `--surface-hover` (`#22242c`), `--border-divider` (`#262832`), `--text-primary` (`#f0f0f2`), `--text-secondary` (`#a0a2b0`).
3. **Biểu tượng:** Chỉ dùng thư viện Lucide React (`lucide-react`).
4. **Mock State tự thân:** Không phụ thuộc vào API backend. Toàn bộ tương tác dùng React `useState`.
5. **Tiêu chuẩn WCAG AA:** Thứ tự heading `h1 -> h2 -> h3`, mọi button có icon phải có `aria-label` và `title`.

---

## 4. CÁC TÍNH NĂNG & THÀNH PHẦN BẮT BUỘC HOÀN THIỆN
1. Khung cây thư mục FolderTree bên trái (chiều rộng cố định 240px).
2. Thanh hiển thị hạn ngạch lưu trữ (Storage Quota Meter) theo LIB-08.
3. Lưới tệp tin (File Grid) hiển thị icon định dạng (PDF, Image, Doc, Zip), kích thước, người tải lên.
4. Drawer xem trước tài liệu và lịch sử các phiên bản tệp (ETag Concurrency - QA-05).
5. Mục Thùng rác (Trash Bin) hỗ trợ khôi phục hoặc xóa vĩnh viễn.
