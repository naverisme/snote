# Bằng chứng kiểm thử HTTP Smoke xuyên suốt (Hạng mục I-1)

| Trường | Giá trị |
| --- | --- |
| Ngày thực hiện | 2026-11-08 |
| Commit SHA cơ sở | `b15cca0` (sau khi merge PR #46, #47, #48 vào `s_note_v2`) |
| Cấu hình DB | PostgreSQL 17.7 (`snote-postgres-test`), port 5432, schema `public` |
| Migration đã áp dụng | `20261107105000_foundation` |
| Bộ kiểm thử mới | `tests/e2e/http-smoke.spec.mjs` (7 nhóm phép kiểm HTTP socket) |
| Tổng số test E2E | 20/20 PASS (`node --test tests/e2e/*.spec.mjs`) |
| Kết quả CI | Đã cập nhật `.github/workflows/foundation.yml` chạy `npm run test:e2e` trên container PostgreSQL |

---

## 1. Môi trường kiểm thử độc lập (Isolation Environment)

- **PostgreSQL 17.7 Container:** Khởi chạy container `postgres:17.7` trên cổng 5432 với user `snote`, database `snote`.
- **Prisma Migrations:** Chạy `npx prisma migrate deploy --schema apps/api/prisma/schema.prisma` áp dụng thành công migration `20261107105000_foundation`.
- **Database Seed & Validation:** Chạy `npm --workspace @snote/api run seed` và `npm --workspace @snote/api run check:db` thành công 100%.
- **Live HTTP Nest Application:** Khởi tạo `AppModule` với `ApiExceptionFilter`, tiền tố `api/v2`, lắng nghe trực tiếp trên cổng socket loopback `127.0.0.1:<random_port>`.

---

## 2. Chi tiết 7 phép kiểm trong `tests/e2e/http-smoke.spec.mjs`

### Phép kiểm 1: Health & Readiness Check
- `GET /api/v2/health` -> Trả về `200` với `{ status: 'ok' }`.
- `GET /api/v2/ready` -> Thực thi truy vấn `SELECT 1` trên PostgreSQL thật -> Trả về `200` với `{ status: 'ready' }`.

### Phép kiểm 2: Anonymous 401 Gate (Bảo vệ toàn bộ Route)
Kiểm tra toàn bộ các route khi gọi không có session cookie:
- `GET /api/v2/me` -> `401 UNAUTHENTICATED`
- `GET /api/v2/me/tasks` -> `401 UNAUTHENTICATED`
- `POST /api/v2/workspaces/:id/tasks` -> `401 UNAUTHENTICATED`
- `GET /api/v2/me/events` -> `401 UNAUTHENTICATED`
- `GET /api/v2/workspaces/:id/library/items` -> `401 UNAUTHENTICATED`
- `POST /api/v2/workspaces/:id/library/items` -> `401 UNAUTHENTICATED`
- `GET /api/v2/classes/:id/assignments` -> `401 UNAUTHENTICATED`
- `POST /api/v2/classes/:id/assignments` -> `401 UNAUTHENTICATED`
- `POST /api/v2/assignment-recipients/:id/submissions` -> `401 UNAUTHENTICATED`
=> **Kết luận:** Lỗi P0 (controller tự fallback sang mock user hoặc actor mặc định) đã bị triệt tiêu hoàn toàn; toàn bộ route bắt buộc có session cookie hợp lệ.

### Phép kiểm 3: Header Spoofing Rejection (Chống giả mạo danh tính)
Thử gửi các header giả mạo danh tính mà không có cookie session:
- Gửi `x-account-id: spoofed-admin-id` vào `/me/tasks` -> Trả về `401 UNAUTHENTICATED`.
- Gửi `x-account-id: spoofed-admin-id` và `x-workspace-ids: ...` vào `/me/events` -> Trả về `401 UNAUTHENTICATED`.
- Gửi `x-actor-id: spoofed-actor-id` vào `/library/items` -> Trả về `401 UNAUTHENTICATED`.
- Gửi `x-actor-id: teacher-default` vào `/classes/:id/assignments` -> Trả về `401 UNAUTHENTICATED`.
=> **Kết luận:** Không thể leo thang đặc quyền hay đọc trộm workspace thông qua header giả.

### Phép kiểm 4: CSRF Token Enforcement (Bắt buộc kiểm CSRF cho mọi thao tác ghi)
- Gửi request thay đổi dữ liệu (`PATCH /me/usages`) có cookie session nhưng KHÔNG có header `X-CSRF-Token` -> Bị từ chối với `403 FORBIDDEN`.
- Gửi `X-CSRF-Token` giả mạo / không khớp với `csrfHash` của session -> Bị từ chối với `403 FORBIDDEN`.
- Gửi đúng `X-CSRF-Token` phát hành cùng session -> Chấp nhận với `200 OK`.

### Phép kiểm 5: Concurrency Version Conflict (412 Precondition Failed)
- Gửi request cập nhật với `If-Match: "999"` lệch so với version hiện tại trong DB -> Bị từ chối với `412 VERSION_CONFLICT`.

### Phép kiểm 6: Golden Path HTTP Flow (Xuyên suốt 5 lát cắt tính năng)
Thực thi một chu trình nghiệp vụ thực tế hoàn chỉnh qua HTTP:
1. Đăng ký tài khoản Giáo viên (`POST /auth/register`) -> Nhận `Set-Cookie: snote_session=...` và `csrfToken`.
2. Đăng ký tài khoản Sinh viên (`POST /auth/register`) -> Nhận session cookie và `csrfToken` riêng biệt.
3. Giáo viên truy vấn thông tin cá nhân (`GET /me`) -> Trả về `200` với thông tin tài khoản hợp lệ.
4. Giáo viên tạo Lớp học (`POST /classes`) -> Trả về `201` với `classId`.
5. Giáo viên tạo Workspace Nhóm trong lớp (`POST /classes/:id/groups`) -> Trả về `201` với `workspaceId`.
6. Phân công Sinh viên làm Trưởng nhóm đồ án theo quy tắc `ASG-03`.
7. **Luồng Công việc (Tasks):** Giáo viên tạo task trong workspace -> Trả về `200`; truy vấn danh sách `/me/tasks` -> Trả về `200` chứa task vừa tạo.
8. **Luồng Lịch (Calendar):** Giáo viên truy vấn lịch sự kiện `/me/events` -> Trả về `200`.
9. **Luồng Thư viện (Library):** Giáo viên đăng tài liệu vào Thư viện workspace (`POST /library/items`) -> Trả về `201`; truy vấn danh sách `/library/items` -> Trả về `200` chứa item đã lưu.
10. **Luồng Bài giao (Assignments):** Giáo viên giao bài tập cho nhóm đồ án (`POST /classes/:id/assignments`) -> Trả về `200`; lấy danh sách recipient -> Trả về `200` chứa `recipientId`.
11. **Luồng Nộp bài (Submissions):** Sinh viên nộp bài đồ án (`POST /assignment-recipients/:id/submissions`) kèm `Idempotency-Key` và `If-Match: "0"` -> Trả về `200`.
12. **Idempotency Conflict (409):** Nộp lại cùng `Idempotency-Key` nhưng đổi nội dung payload -> Bị từ chối với `409 IDEMPOTENCY_CONFLICT`.

### Phép kiểm 7: Typed OpenAPI Web Client Integration
- Sử dụng client sinh từ `docs/contracts/openapi.yaml` (`apps/web/src/api/generated/client.ts`) để thực hiện các lời gọi HTTP qua socket mạng thực tế.
- Khẳng định 100% tính tương thích giữa OpenAPI contract, API Backend và Web Client.

---

## 3. Cập nhật CI Workflow

Tệp `.github/workflows/foundation.yml` đã được điều chỉnh:
- Trigger chạy tự động trên nhánh `s_note_v2`, `feat/v2/integration`, và mọi pull request.
- Tự động chạy `npm run test:e2e` sau khi PostgreSQL container được khởi động và migrate/seed xong.
