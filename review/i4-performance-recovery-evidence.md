# Bằng chứng Đo lường Hiệu năng p95 và Diễn tập Sao lưu / Phục hồi Thảm họa (Hạng mục I-4)

| Trường | Giá trị |
| --- | --- |
| Ngày thực hiện | 2026-11-08 |
| Commit SHA cơ sở | `0a40110` (sau khi hoàn tất I-3) |
| Cấu hình kiểm thử | Windows 11, Node.js v24.15.0, PostgreSQL 17.7 (`snote-postgres-test`), NestJS 11.1.9 |
| Bộ kiểm thử mới | `tests/e2e/benchmark-and-recovery.spec.mjs` (BENCH-01, BENCH-02, RECOV-01) |
| Tổng số test E2E | **39/39 PASS (100%)** (`node --test tests/e2e/*.spec.mjs`) |
| Tiêu chí p95 | **ĐẠT: p95 = 185.39 ms** (Mục tiêu thiết kế: ≤ 1.000 ms) |
| Tiêu chí QA-14 | **ĐẠT: 100% tệp và metadata phục hồi khớp từng bit SHA-256** |

---

## 1. Kết quả Đo lường Hiệu năng Truy vấn (BENCH-01 & BENCH-02)

### Kịch bản kiểm thử:
- Bộ dữ liệu thử nghiệm: Môi trường có tài khoản giáo viên/sinh viên, workspace cá nhân và độc lập, danh sách công việc đã seed.
- Khối lượng tải: 40 truy vấn danh sách phân quyền (`GET /api/v2/me/tasks`, `GET /api/v2/workspaces/:id/tasks`, `GET /api/v2/workspaces`) được kích hoạt đồng thời qua **20 luồng song song (20 concurrent workers)** bằng `Promise.all`.
- Đo lường bằng đồng hồ có độ phân giải cao `performance.now()`.

### Bảng số đo độ trễ (Latency Metrics):
| Chỉ số | Thời gian đo được | Ngưỡng cam kết (Mục tiêu Pilot) | Trạng thái |
| --- | --- | --- | --- |
| **Tối thiểu (Min)** | 75.74 ms | — | Đạt |
| **Trung bình (Avg)** | 132.40 ms | < 200 ms | **ĐẠT** |
| **Trung vị (p50)** | 122.25 ms | — | Đạt |
| **Phân vị 90 (p90)** | 178.29 ms | — | Đạt |
| **Phân vị 95 (p95)** | **185.39 ms** | **≤ 1.000 ms** (1 giây) | **ĐẠT VƯỢT TRỘI** |
| **Phân vị 99 (p99)** | 188.36 ms | — | Đạt |
| **Tối đa (Max)** | 188.36 ms | — | Đạt |

### Kiểm tra Ghi đồng thời (BENCH-02):
- Kích hoạt đồng thời 20 yêu cầu tạo công việc (`POST /workspaces/:id/tasks`) vào cùng một workspace.
- **Kết quả:** Cả 20/20 yêu cầu hoàn thành thành công (mã `200/201`), 20 bản ghi được cấp phát UUID độc lập, không xảy ra xung đột khóa chính hay mất mát dữ liệu do tranh chấp giao dịch.

---

## 2. Diễn tập Sao lưu và Phục hồi Thảm họa Metadata + Bytes (RECOV-01 / QA-14)

### Quy trình diễn tập:
1. **Khởi tạo dữ liệu thực nghiệm:**
   - Tạo các tệp nộp bài và tài liệu thư viện thật với định dạng đa dạng: PDF (`math-assignment-solution.pdf`), PNG (`diagram.png`), TXT (`student_notes.txt`).
   - Sử dụng `LocalStorageAdapter` thực hiện 2 giai đoạn: `stage()` và `verify()` phát hiện media type và tính toán băm SHA-256.
   - Lưu trữ theo mô hình Content-Addressable Storage (CAS): tệp được định danh và lưu tại `blobs/<digest>`.
2. **Xuất Bản sao lưu (Backup Archive):**
   - Đóng gói toàn bộ metadata (bản kê `manifest.json` ghi nhận quan hệ submission, assignment, sinh viên, revision, dung lượng và hash).
   - Sao chép toàn bộ kho bytes vật lý sang thư mục lưu trữ sao lưu cách ly (`backup_archive/blobs`).
3. **Mô phỏng Thảm họa (Simulated Disaster):**
   - Xóa sạch toàn bộ kho tệp gốc (`sourceBlobsDir`).
   - Xác nhận thư mục gốc bị xóa hoàn toàn (`ENOENT`).
4. **Phục hồi vào Môi trường Độc lập (Recovery Target):**
   - Khởi tạo `LocalStorageAdapter` trên ổ đĩa phục hồi mới (`.test_storage_recovered`).
   - Khôi phục cấu trúc metadata từ `manifest.json`.
   - Phục hồi toàn bộ các tệp bytes từ kho sao lưu sang volume mới.
5. **Đối soát Đối chiếu Bit-level (Exhaustive Reconciliation Audit):**
   - Duyệt qua từng bản ghi nộp bài trong manifest.
   - Kiểm tra sự tồn tại vật lý của tệp trên volume phục hồi.
   - Đo lại dung lượng thực tế và đối chiếu với trường `size` trong metadata.
   - Đọc từng byte tệp phục hồi, tính lại mã băm SHA-256 và so khớp nghiêm ngặt với mã băm ban đầu.

### Bảng kết quả đối soát phục hồi:
| Tên tệp | Định dạng | Kích thước | SHA-256 Gốc | SHA-256 Sau Phục Hồi | Kết quả đối soát |
| --- | --- | --- | --- | --- | --- |
| `math-assignment-solution.pdf` | `application/pdf` | 1.071 B | `c4c67590ac46a637...` | `c4c67590ac46a637...` | **Trùng khớp 100% (Khớp từng bit)** |
| `diagram.png` | `image/png` | 2.056 B | `98de620099314a83...` | `98de620099314a83...` | **Trùng khớp 100% (Khớp từng bit)** |
| `student_notes.txt` | `text/plain` | 68 B | `88b576dd4bc89dad...` | `88b576dd4bc89dad...` | **Trùng khớp 100% (Khớp từng bit)** |

### Kiểm tra Stream đọc dữ liệu sau khôi phục:
- Mở luồng đọc bất đồng bộ `storage.open(blobId)` từ adapter đã phục hồi.
- Đọc trọn vẹn nội dung vào buffer, xác nhận độ dài và checksum khớp tuyệt đối với dữ liệu gốc ban đầu.

---

## 3. Tổng kết Cổng Kiểm Thử

Lệnh chạy: `npm run test:e2e`
- Tổng số bài kiểm tra: **39/39 PASS (100%)**
- Thời gian thực thi toàn bộ suite: **5.82 giây**

**Kết luận:** Hạng mục **I-4** đã hoàn thành đạt chuẩn với đầy đủ số liệu đo lường p95 và quy trình phục hồi thảm họa tự động có thể tái lập 100%.
