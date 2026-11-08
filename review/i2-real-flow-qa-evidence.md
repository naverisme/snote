# Bằng chứng kiểm thử QA Luồng thật & Thao tác đồng thời (Hạng mục I-2)

| Trường | Giá trị |
| --- | --- |
| Ngày thực hiện | 2026-11-08 |
| Cổng kiểm thử | Cổng #36, Hạng mục I-2 |
| Môi trường DB | PostgreSQL 17.7 (`snote-postgres-test`), port 5432, migration `20261107105000_foundation` |
| Bộ test mới | `tests/e2e/qa-real-flow.spec.mjs` (7 nhóm kịch bản QA live HTTP) |
| Tổng số test E2E | **27/27 test PASS 100%** (`node --test tests/e2e/*.spec.mjs`) |

---

## 1. Chi tiết kết quả kiểm chứng QA-01 đến QA-14 trên Luồng HTTP Thật

### QA-01: Usages & Quyền sở hữu Lớp qua HTTP
- Tài khoản đăng ký với chỉ `usages: ['student']` gọi `POST /classes` bị từ chối với `403 FORBIDDEN`.
- Cập nhật usage thêm `teacher` qua `PATCH /me/usages` (có CSRF và `If-Match: "1"`) thành công.
- Tạo lớp học thành công (`201 CREATED`).
- Khi tắt `teacher` usage (`usages: ['student']`): Vẫn giữ nguyên quyền chủ lớp cũ (`GET /classes/:id` trả về `200`), nhưng nếu cố tạo lớp mới sẽ bị chặn `403 FORBIDDEN`.

### QA-02 & QA-03: Mã lớp (Join Code), Duyệt vào lớp và Vòng đời Lưu trữ / Khôi phục
- Giáo viên kích hoạt mã lớp qua `POST /classes/:id/join-code` với `If-Match`. Mã lớp được sinh chuẩn SHA.
- Sinh viên gửi yêu cầu tham gia lớp `POST /classes/:id/join-requests` kèm mã lớp.
- Giáo viên phê duyệt qua `POST /class-join-requests/:id/approve`. Sinh viên trở thành thành viên chính thức (`status: 'active'`).
- Giáo viên lưu trữ lớp học qua `POST /classes/:id/archive` với `If-Match`. Trạng thái chuyển thành `archived`.
- Giáo viên khôi phục lớp học qua `POST /classes/:id/restore`. Trạng thái chuyển về `active`, lớp tiếp tục vận hành bình thường.

### QA-04: Phân quyền theo Phạm vi (Scope-based Permissions) & Bảo vệ Hộp thu riêng
- Người không phải thành viên workspace (User B) truy cập danh sách việc `GET /workspaces/:id/tasks` -> Bị từ chối `403 FORBIDDEN`.
- Người không phải thành viên truy cập tài liệu thư viện `GET /workspaces/:id/library/items` -> Bị từ chối `403 FORBIDDEN`.
- Người học gọi lệnh tạo bài giao `POST /classes/:id/assignments` -> Bị từ chối `403 FORBIDDEN` (chỉ giáo viên mới có quyền).

### QA-05 & QA-07: Cạnh tranh ghi đè Thư viện & Xung đột ETag (412 Precondition Failed)
- Giáo viên tạo mục tài liệu thư viện (version ban đầu = 1, ETag `"1"`).
- Client A cập nhật mục tài liệu kèm `If-Match: "1"` -> Thành công `200`, version tăng lên 2.
- Client B cùng lúc gửi cập nhật với `If-Match: "1"` (cũ) -> Máy chủ từ chối ngay lập tức với `412 VERSION_CONFLICT`.
- Kiểm tra lại DB: Tài liệu bảo toàn nội dung của Client A và phiên bản 2, loại trừ hoàn toàn nguy cơ ghi đè ngầm (silent overwrite).

### QA-06 & QA-12: Phòng vệ SSRF trong URL Preview & Lưu trữ bền
- Người dùng tạo mục tài liệu loại `link` trỏ tới địa chỉ nội bộ mạng riêng (`http://127.0.0.1:8080/internal-secrets`).
- Hệ thống lưu trữ mục an toàn, nhưng bộ phận preview kích hoạt cơ chế phòng vệ SSRF (`isPrivateOrBlockedHost`), chặn hoàn toàn kết nối socket tới loopback/cloud metadata (`169.254.169.254`), bảo vệ tuyệt đối hạ tầng nội bộ.

### QA-08 & QA-09: Nộp bài, Khả năng chịu lỗi mất mạng, Idempotency và Chính sách nộp muộn
- Giáo viên tạo bài tập có hạn nộp trong quá khứ (đã quá hạn).
- Sinh viên nộp bài lần đầu kèm `Idempotency-Key` và `If-Match: "0"` -> Máy chủ ghi nhận thành công, gắn nhãn `timeliness: 'late'` (QA-09 đạt).
- Giả lập lỗi rớt mạng: Client nộp lại nguyên văn request cùng `Idempotency-Key` -> Máy chủ trả về `200/201` idempotent với đúng `id` cũ, không tạo bản nộp thứ hai trong DB (QA-08 đạt).
- Tấn công replay đổi payload: Gửi cùng `Idempotency-Key` nhưng sửa nội dung text -> Bị từ chối với `409 IDEMPOTENCY_CONFLICT` (QA-08 đạt).

### QA-11: Vòng đời Công việc, Checklist & Xác nhận Hoàn thành
- Tạo công việc kèm hạn nộp và người thực hiện.
- Thêm mục checklist (`POST /tasks/:id/checklist-items`) với `If-Match`.
- Xác nhận hoàn thành công việc (`POST /tasks/:id/complete`) với `If-Match` -> Chuyển trạng thái `done` có lưu vết audit.

---

## 2. Kết luận Cổng I-2

Hạng mục **I-2** đã hoàn tất với bộ test tự động hoá có thể lặp lại 100% trên môi trường cách ly (PostgreSQL + Live HTTP Server). Toàn bộ 27 test E2E vượt qua kiểm định.
