# SNOTE v2 — Hợp đồng M1 để bàn giao coding

Phạm vi: FR-01 đến FR-08 cho tài khoản thử nghiệm, workspace cá nhân, Hộp thu, việc, checklist và kế hoạch. Đây là hợp đồng cho A0 tạo schema dùng chung và dữ liệu mẫu. Hợp đồng tổng quan nằm ở [kiến trúc phối hợp](implementation-contracts.md). M1 dùng [quyết định M0](../requirements/decisions.md) làm mặc định triển khai.

## 1. Quy ước chung

- JSON dùng camelCase. ID là chuỗi mờ. Chuỗi đầu vào cần cắt khoảng trắng đầu cuối trước khi kiểm tra độ dài. POST/PATCH/PUT từ chối trường lạ. PATCH bỏ qua trường không gửi, `null` chỉ hợp lệ với trường được ghi rõ là cho phép xóa giá trị.
- API lấy người dùng từ phiên. M1 tự xác định workspace cá nhân, người gọi không gửi `userId` hoặc `workspaceId` trong payload ghi. ID của người khác trả 404 cho cả đọc và ghi, và danh sách không lộ số lượng.
- Lỗi có dạng `{ "error": { "code": "...", "message": "...", "fieldErrors": { "field": "..." } } }`. `fieldErrors` chỉ cần cho lỗi trường. Mã chính: 401 `UNAUTHENTICATED` hoặc `INVALID_CREDENTIALS`, 404 `NOT_FOUND`, 409 `TASK_CLOSED`, 422 `VALIDATION_ERROR`. JSON hỏng trả 400 `INVALID_JSON`.
- Tạo mới trả 201, đọc và cập nhật trả 200, đăng xuất thành công trả 204. Web giữ giá trị biểu mẫu khi lưu lỗi. Khi sửa checklist hoặc việc thành công, làm mới việc và tổng hợp từ API.
- Trang danh sách Hộp thu và Việc của tôi dùng `limit` từ 1 đến 100, mặc định 25, và cursor mờ. Cursor gắn bộ lọc, thứ tự và người dùng. Cursor sai trả 422. Khi nguồn thay đổi, client làm mới trang đầu. Trang cuối có `nextCursor: null`.

## 2. A · Phiên và workspace

| API | Yêu cầu | Phản hồi |
|---|---|---|
| `POST /api/session/login` | `{ email, password }` của tài khoản mẫu. | 200 `{ user: { id, timeZone } }` và cookie phiên. Lỗi sai thông tin trả cùng mã lỗi chung. |
| `GET /api/session` | Cookie phiên hiệu lực. | 200 `{ user: { id, timeZone } }`. Phiên hết hạn hoặc đã thu hồi trả 401. |
| `DELETE /api/session` | Phiên hiện tại nếu có. | 204, thu hồi phiên và xóa cookie. Gọi lại trả 204. |
| `GET /api/me/workspace` | Phiên hiệu lực. | 200 `{ id, kind: "PERSONAL", role: "OWNER" }`. |

A0 dùng dữ liệu seed tạo tài khoản và workspace cá nhân cùng giao dịch. Chạy lại seed không sinh thêm workspace. Đăng nhập công khai tự đăng ký, khôi phục mật khẩu và quản lý phiên nhiều thiết bị để sau. A0 phải ghi cách lưu và thu hồi phiên, chính sách cookie, hạn phiên, phòng yêu cầu giả mạo và giới hạn thử đăng nhập trong bàn giao kỹ thuật trước khi cấp truy cập thật.

## 3. B · Hộp thu

`Resource = { id, kind, title, url, text, tags, status, createdAt, updatedAt }`.

- `kind` là `URL` hoặc `TEXT`. `status` là `UNPROCESSED` hoặc `PROCESSED`. `url` và `text` có thể là `null` theo loại. `tags` là mảng chuỗi, tối đa 10 nhãn, mỗi nhãn 1–40 ký tự. Khử trùng theo so sánh không phân biệt hoa thường, giữ cách viết đầu tiên.
- POST `/api/inbox` nhận `kind`, `url` hoặc `text` tương ứng, `title?`, `tags?`. URL tuyệt đối HTTP/HTTPS tối đa 2.048 ký tự. Văn bản 1–10.000 ký tự. Tiêu đề nếu gửi dài 1–200 ký tự. Nếu thiếu tiêu đề, lấy tên host cho URL hoặc tối đa 200 ký tự từ dòng đầu của văn bản. Trạng thái khởi tạo `UNPROCESSED`. Trả `Resource`.
- GET `/api/inbox/:id` trả `Resource`. PATCH nhận ít nhất một trong `title`, `tags`, `status`, trả bản sau sửa. Đổi nội dung gốc và xóa để sau. Lưu lại cùng URL bằng yêu cầu tạo mới được phép.
- GET `/api/inbox` nhận `q?`, `status?`, `limit?`, `cursor?`. Tìm chuỗi con không phân biệt hoa thường trong tiêu đề, URL, văn bản và nhãn. Giữ nguyên dấu tiếng Việt. Mặc định gồm cả hai trạng thái. Xếp `createdAt` giảm dần, phá hòa theo ID tăng dần. Trả `{ items: Resource[], nextCursor }`.
- URL là dữ liệu lưu và đường dẫn do người dùng mở. Máy chủ không tải URL để lấy tiêu đề hoặc nội dung trong M1.

## 4. C · Công việc và checklist

`Task = { id, workspaceId, title, description, priority, due, status, completedAt, createdAt, updatedAt }`.

- Tiêu đề 1–200 ký tự, mô tả tối đa 5.000 ký tự hoặc `null`. Mức quan trọng `LOW | NORMAL | HIGH`. Trạng thái `OPEN | DONE`. Thời hạn là `null`, `{ kind: "date", date, timeZone }` hoặc `{ kind: "instant", at }`. Đầu vào hạn theo ngày dùng `{ kind: "date", date }`. Với hạn theo ngày mới hoặc đổi ngày, API lấy `timeZone` từ hồ sơ. Ngày phải tồn tại trên lịch. Hạn theo thời điểm nhận timestamp có độ lệch hoặc UTC.
- POST `/api/tasks` nhận `title`, `description?`, `priority?`, `due?`. Mặc định `NORMAL`, hạn và mô tả `null`, trạng thái `OPEN`. Trả `Task`.
- GET `/api/tasks/:taskId` trả `{ task, checkItems, checklist }`. PATCH nhận ít nhất một trong `title`, `description`, `priority`, `due`, `status`, trả `Task`. Đặt `DONE` lần đầu ghi `completedAt`, đặt lại cùng trạng thái giữ thời điểm cũ. Mở lại đặt `completedAt: null`. Hoàn thành mọi mục checklist giữ nguyên trạng thái việc.
- `CheckItem = { id, label, position, done }`. `Checklist = { doneCount, totalCount, nextItemId }`. Mục đầu tiên chưa xong lấy theo `position` rồi ID, hoặc `null` khi hết hoặc không có mục. M1 cho phép tối đa 100 mục một việc.
- POST `/api/tasks/:taskId/check-items` nhận `{ label }` từ 1–200 ký tự và nối cuối. PATCH `/api/tasks/:taskId/check-items/:itemId` nhận `{ done }` là trạng thái đích. Cả hai trả `{ item, checklist }`. Mục không thuộc việc trả 404. Việc đã xong trả 409 khi ghi checklist. Xóa, đổi nhãn và sắp lại checklist thuộc phạm vi sau M1.
- C cung cấp cho D cổng đọc việc theo người dùng đã xác thực, gồm `Task` và `Checklist`. C chịu trách nhiệm lọc quyền trên cổng đọc. D không ghi vào bảng việc hoặc checklist.

## 5. D · Kế hoạch và Việc của tôi

- GET `/api/me/task-plans/:taskId` trả `{ taskId, estimatedMinutes, blocks }` khi còn quyền đọc việc. Nếu chưa có kế hoạch, trả `estimatedMinutes: null` và `blocks: []`.
- PUT `/api/me/task-plans/:taskId` nhận `{ estimatedMinutes, blocks }`. Số phút là số nguyên 1–1.440 hoặc `null`. Tối đa 20 khoảng, mỗi khoảng `{ startsAt, endsAt }`, bắt buộc kết thúc sau bắt đầu. Khoảng giao nhau trong cùng một việc bị từ chối. `blocks: []` xóa các khoảng. PUT thay toàn bộ kế hoạch trong một giao dịch và trả `{ taskId, estimatedMinutes, blocks }`. Chỉ lập kế hoạch khi còn quyền đọc việc và việc đang mở.
- GET `/api/me/tasks` nhận `view=all|today|tomorrow|overdue|actionable|important`, mặc định `all`. Trả `{ items, nextCursor, counts: { today, tomorrow, overdue } }`. Mỗi mục trả `{ task, source, checklist, estimatedMinutes, blocks, reasons }`. M1 có `source: { kind: "PERSONAL", workspaceId }`. `reasons` dùng mã `DUE_TODAY`, `DUE_TOMORROW`, `PLANNED_TODAY`, `PLANNED_TOMORROW`, `OVERDUE`, `HIGH_PRIORITY` khi điều kiện tương ứng đúng.
- `all` gồm cả việc đã xong, xếp `updatedAt` giảm dần rồi ID tăng dần. Các view còn lại chỉ gồm việc mở. `actionable` và `important` xếp theo D-03. View ngày xếp theo mốc hạn/lịch phù hợp sớm nhất rồi ID. Với khoảng bắt đầu trước ngày đang xét, dùng đầu ngày đó làm mốc xếp. `overdue` xếp hạn tăng dần rồi ID. Các số đếm tính trên toàn phạm vi có quyền, trước phân trang.
- Hạn ngày được xếp nhóm theo giá trị ngày lịch đã nhập. Quá hạn bắt đầu từ đầu ngày kế tiếp theo múi giờ đã lưu trên hạn. Với hạn theo thời điểm và lịch làm, dùng ngày theo múi giờ hồ sơ hiện tại. Khoảng làm giao ngày nào thuộc ngày đó, dùng khoảng nửa mở `[startsAt, endsAt)`. Khoảng kết thúc đúng 00:00 không tính vào ngày mới. Xếp việc có hạn ngày với việc có hạn giờ bằng mốc quá hạn tương ứng.
- Tính lý do trước, gộp theo ID việc rồi đếm. Việc có hạn hôm nay và hai khoảng làm hôm nay chỉ xuất hiện một lần trong view hôm nay. Việc không hạn và không lịch vẫn có trong `all`. Việc hoàn thành có thể mở lại và kế hoạch đã lưu được giữ.

## 6. Ví dụ để khóa hợp đồng

- Đồng hồ giả `2026-11-04T10:00:00+07:00`. Việc A có hạn ngày 04/11 và hai khoảng làm ngày đó. Kết quả `today: 1` nếu chỉ có A. Lý do của A gồm `DUE_TODAY` và `PLANNED_TODAY`. Khi sang 00:00 ngày 05/11 theo múi giờ nghiệp vụ, A quá hạn nếu còn mở.
- Việc B có mức `HIGH`, hạn ngày 07/11. B hiện ở `important` dù A hiện ở `actionable`. Hoàn thành A làm giảm bộ đếm ngày nhưng A vẫn tìm được ở `all`.
- Một checklist có ba mục, hai mục đầu đã xong. Trả `doneCount: 2`, `totalCount: 3`, `nextItemId` của mục thứ ba. Gửi lại `{ "done": true }` cho mục thứ hai giữ nguyên kết quả.
- Tài khoản khác thử lấy, sửa, tìm tài nguyên của người tạo và thử mở hoặc đặt kế hoạch cho việc của người tạo. Các thao tác trực tiếp trả 404, danh sách và số đếm chỉ chứa dữ liệu thuộc phạm vi tài khoản khác.
