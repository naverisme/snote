# SNOTE v2 — Hợp đồng phối hợp triển khai

Tài liệu nối [SRS](../requirements/srs.md), [quyết định M0](../requirements/decisions.md) và [sơ đồ trình tự](sequences.md). Đây là đặc tả để các agent triển khai độc lập. Trước khi mở các nhánh tính năng, người tích hợp đưa hợp đồng đã dùng vào nền chung và ghi rõ commit gốc.

## Nền chung và biên module

- Monorepo TypeScript với React/Vite, Express và PostgreSQL/Prisma. Cấu trúc chuẩn bị gồm `apps/web`, `apps/api`, `packages/contracts` và `prisma`. Tên tệp bên dưới là đích dự kiến trên nhánh v2.
- `packages/contracts/src/<module>` sở hữu DTO, schema kiểm tra đầu vào và ví dụ theo module. Web và API dùng chung gói này. Chủ module đề xuất thay đổi qua PR dành cho hợp đồng. Người tích hợp kiểm tra tương thích và ghép trước khi các nhánh phụ thuộc cập nhật.
- Phiên cung cấp ID người dùng và ngữ cảnh xác thực cho API. Các module dùng dịch vụ quyền và dữ liệu có thẩm quyền. Web hiển thị quyền từ phản hồi, và API kiểm tra lại trên mỗi thao tác.
- Chỉ người tích hợp thay đổi cấu hình root, lockfile, cây migration, router gốc, xuất gói dùng chung, cấu hình CI và triển khai. Chủ module gửi đề xuất schema trong PR hoặc bàn giao. Người tích hợp áp dụng migration theo thứ tự và chạy trên cơ sở dữ liệu trắng lẫn dữ liệu mốc trước.
- Mỗi thay đổi ghi trạng thái sau thành công. Các ca từ chối ghi được kiểm tra không sinh tác dụng phụ. Tác vụ có thể tranh chấp kiểm tra lại điều kiện trong giao dịch và dùng ràng buộc duy nhất phù hợp.

## Quy ước API dùng chung

- Dùng tiền tố `/api`, JSON với ID chuỗi không mang ý nghĩa nghiệp vụ. Trả đối tượng hoặc danh sách có `items` và `nextCursor` khi phân trang. Lỗi có dạng `{ error: { code, message, fieldErrors? } }`.
- 401 khi cần xác thực, 403 khi được phép biết đối tượng nhưng hành động thiếu quyền, 404 khi đối tượng nằm ngoài phạm vi đọc, 409 khi xung đột, 422 khi dữ liệu nghiệp vụ sai. Mã lỗi có thể dùng ổn định trong kiểm thử. Không trả chi tiết bản ghi ngoài phạm vi.
- Định dạng thời điểm ISO 8601 có độ lệch múi giờ hoặc UTC. Hạn biểu diễn `null` hoặc một trong `{ kind: "date", date, timeZone }` và `{ kind: "instant", at }`. API tính ranh giới ngày theo D-07. Việc gốc và lịch làm riêng được tách trong phản hồi.
- Chủ module tạo ví dụ thành công, đầu vào sai và thiếu quyền trong gói hợp đồng. Web có thể phát triển với dữ liệu giả cùng hợp đồng cho đến khi API tương ứng sẵn sàng.

## M1 · Hợp đồng các luồng đầu tiên

| Module | API dự kiến | Đầu vào và kết quả tối thiểu |
|---|---|---|
| Phiên | `POST /api/session/login`, `GET /api/session`, `DELETE /api/session` | Đăng nhập bằng định danh và mật khẩu trong dữ liệu thử. Thành công tạo phiên và trả `user: { id, timeZone }`. Đọc phiên trả người dùng hiện tại. Đăng xuất thu hồi phiên. Thiết kế cơ chế phiên và cookie trước khi mở nhánh phụ thuộc. |
| Workspace | `GET /api/me/workspace` | Trả ID workspace cá nhân và quyền. Tạo workspace và tư cách chủ một lần khi chuẩn bị tài khoản hoặc lần khởi tạo đã xác định. |
| Hộp thu | `POST /api/inbox`, `PATCH /api/inbox/:id`, `GET /api/inbox`, `GET /api/inbox/:id` | URL hoặc văn bản, tiêu đề tùy chọn, nhãn. Tạo trả `id, kind, title, status`. Tìm với từ khóa và bộ lọc trạng thái. Người ngoài phạm vi nhận 404. |
| Công việc | `POST /api/tasks`, `GET /api/tasks/:taskId`, `PATCH /api/tasks/:taskId` | Tiêu đề, mô tả, mức quan trọng, hạn và trạng thái. Trả mã việc, workspace nguồn và quyền hiệu lực. M1 dùng workspace cá nhân. |
| Checklist | `POST /api/tasks/:taskId/check-items`, `PATCH /api/tasks/:taskId/check-items/:itemId` | Tạo mục có nhãn và thứ tự. Sửa nhận trạng thái đích hoặc trường được phép. Trả mục và tổng hợp `doneCount, totalCount, nextItemId`. Xóa hoặc sắp lại mục khi yêu cầu được đặc tả. |
| Kế hoạch | `PUT /api/me/task-plans/:taskId` | Đặt thời lượng dự kiến theo phút và danh sách khoảng làm, có thể rỗng. Trả kế hoạch riêng. Việc vẫn giữ hạn gốc. |
| Việc của tôi | `GET /api/me/tasks` | Trả việc được đọc, nguồn và nhóm ngày/gợi ý, lý do, thời lượng, trạng thái, checklist tóm tắt. Phân nhóm và thứ tự theo D-03. M2 mở rộng sang việc nhóm qua cùng giao diện. |

## M2 và M3 · Điểm tích hợp cần khóa trước khi mở nhánh

| Mốc | Bên cung cấp | Điểm tích hợp |
|---|---|---|
| M2 | Workspace | Membership hiệu lực, lời mời đúng người và quyền điều phối. Chấp nhận lại cùng lời mời trả cùng kết quả. |
| M2 | Công việc và lịch | Giao lại, đổi hạn, lịch họp và truy vấn việc của người được giao. Danh sách và lịch dùng cùng mã việc. Kế hoạch cá nhân độc lập. |
| M2 | Tài nguyên | Cấp và thu hồi chia sẻ cho tài nguyên, xác nhận quyền khi gắn hoặc mở lại. Tìm kiếm và URL trực tiếp phải kiểm tra cùng phạm vi. |
| M3 | Lớp và bài giao | Cấp tư cách trong lớp, nhóm và workspace. Xác nhận bài giao và việc gắn thuộc đúng nhóm. |
| M3 | Tiến độ và bản nộp | Dùng hợp đồng ở [Sơ đồ 6](sequences.md). Áp dụng D-04, khóa thử lại và quyền hiện tại. Trả phản hồi theo đúng bản nộp cho thành viên nhóm. |

## Dữ liệu tích hợp chung

Dùng tài khoản giả ổn định: một giáo viên, một quản trị lớp, trưởng nhóm A, thành viên A, thành viên B và một người ngoài lớp. Tạo hai lớp, hai nhóm trong lớp chính, một workspace dự án và workspace cá nhân theo tài khoản. Có một việc cá nhân, một việc nhóm được giao, một nháp riêng và một tài nguyên chia sẻ rồi thu hồi. Khi chạy kiểm thử ngày, cố định đồng hồ và dùng hồ sơ `Asia/Ho_Chi_Minh` cùng một múi giờ khác. Khi chạy M3, kiểm tra cùng lúc thao tác nộp trùng, thay trưởng nhóm và truy cập chéo nhóm.
