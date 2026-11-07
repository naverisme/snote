# Hợp đồng REST v2

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Hợp đồng logic cho web v2 theo [SRC-27](../../review/provenance.md); tên trường và đường dẫn bên dưới là lựa chọn thiết kế, có thể tăng phiên bản nếu thay đổi phá vỡ client |
| Phụ thuộc | [Quy tắc cấu trúc](../requirements/structural-rules.md), [dữ liệu/giao dịch](../architecture/data-and-transactions.md), [quyền](../requirements/permission-matrix.md) |

Đầy đủ nhóm hành động và payload tối thiểu ở [danh mục thao tác](action-catalog.md). Base path `/api/v2`. JSON UTF-8; thời điểm có giờ là ISO 8601 có offset, phản hồi chuẩn hóa UTC; ngày cả ngày là `YYYY-MM-DD`, `endDateExclusive` không gồm ngày cuối. Mọi đầu vào được kiểm tra phía máy chủ, quyền theo đối tượng chứ không theo tab hiển thị. ID là chuỗi opaque; không suy quyền từ ID. Danh sách phân trang cursor với `limit` tối đa 100 và `nextCursor`, sắp xếp có khóa ID ổn định; cursor không được vượt phạm vi hoặc tư cách hiện tại. `requestId` giúp tra lỗi, không chứa dữ liệu riêng.

| Phạm vi | Thao tác chính | Điều kiện và hiệu lực |
| --- | --- | --- |
| Tài khoản | `GET/PATCH /me`, `GET/PATCH /me/usages` | Chọn/bật/tắt Sinh viên/Giáo viên; tắt Teacher chặn tạo lớp mới nhưng không bỏ quyền chủ lớp đã có |
| Lớp | `POST /classes`, `GET /classes`, `GET /classes/{id}`, `POST /classes/{id}/archive`, `POST /classes/{id}/restore` | Tạo cần usage Teacher; đọc/khôi phục theo tư cách; archive chặn ghi ở lớp và nhóm |
| Tư cách | `POST /classes/{id}/join-requests`, `POST /class-invitations/{id}/accept`, `POST /class-join-requests/{id}/approve`, `POST /group-invitations/{id}/accept`, `POST /group-join-requests/{id}/approve` | Chấp nhận hoặc duyệt là điểm kích hoạt; kiểm giới hạn và trạng thái lúc đó; lưu trữ thì không kích hoạt yêu cầu chờ |
| Workspace | `GET/POST /workspaces`, `GET /workspaces/{id}`, `POST /workspaces/{id}/archive`, `POST /workspaces/{id}/restore` | Nhóm có classId bất biến; mặc định không chia sẻ/chuyển chủ/lưu trữ; chuyển chủ theo luồng có người nhận chấp nhận |
| Quyền | `GET/PATCH /classes/{id}/policy`, `POST/DELETE /grants/{id}` | Chỉ chủ lớp; `PATCH` cần `If-Match`; cấp riêng có người/hành động/phạm vi, thu hồi có hiệu lực cho thao tác mới |
| Việc | `GET/POST /workspaces/{id}/tasks`, `PATCH /tasks/{id}`, `POST /tasks/{id}/reassign`, `PATCH /tasks/{id}/checklist/{itemId}` | `If-Match` khi sửa phiên bản, giao lại kiểm quyền; lịch làm riêng ở `/me/work-sessions`, không xuất trong việc của người khác |
| Lịch | `GET/POST /events`, `PATCH /events/{id}`, `POST /events/{id}/cancel` | Scope và audience rõ; hủy cần action riêng; kết quả lịch tổng hợp theo quyền, ngày cả ngày không dịch sang múi giờ người xem |
| Thư viện | `GET/POST /workspaces/{id}/library/items`, `POST /library/items/{id}/revisions`, `POST /library/items/{id}/copies`, `POST /library/items/{id}/trash`, `POST /library/items/{id}/restore` | Ghi đè cần `If-Match` version nền; sao chép chốt một revision; khôi phục kiểm quota; quyền tải bytes qua endpoint cấp quyền riêng |
| Bài giao | `GET/POST /classes/{id}/assignments`, `GET /assignments/{id}/recipients`, `GET /assignment-recipients/{id}/submissions`, `POST /assignment-recipients/{id}/submissions` | Mỗi nhóm một recipient; Nộp cần quyền riêng, nội dung tối thiểu và hai luật quá hạn; không có Thu hồi bản đầu |
| Tải tệp và kết quả | `POST /uploads`, `PUT /uploads/{id}/content`, `GET /operations/by-key/{key}` | Tệp tạm có quyền và TTL; bytes xong chưa là thành công nghiệp vụ. `GET /operations/by-key/{key}` chỉ cho principal/scope còn quyền, trả `pending/succeeded/failed` và biên nhận đã cam kết |

**Biên chung:** JSON thành công `{ "data": ..., "requestId": "..." }`; danh sách `{ "data": [...], "nextCursor": "...", "requestId": "..." }`. Lỗi `{ "error": { "code": "...", "message": "...", "details": {} }, "requestId": "..." }`. `details` chỉ mô tả trường/điều kiện hợp lệ mà người gọi được xem; không tiết lộ nội dung tenant khác. Dùng `If-Match` với ETag cho cập nhật phiên bản; 412 khi bản nền cũ, trả đường đọc bản hiện hành trong đúng scope. Nộp còn cần `Idempotency-Key` tạo ở client cho mỗi lần bấm, gắn nội dung, principal, recipient và hành động; cùng key+cùng nội dung trả biên nhận cũ, khác nội dung trả 409.

| HTTP | Mã lỗi | Tình huống và hành động của UI |
| --- | --- | --- |
| 400/422 | `INVALID_INPUT`, `FILE_TYPE`, `FILE_TOO_LARGE` | Sửa trường hoặc tệp; không tạo mục/phiên bản hoàn chỉnh |
| 401/403 | `UNAUTHENTICATED`, `FORBIDDEN` | Đăng nhập lại hoặc bỏ nút; không trả chi tiết dữ liệu ngoài quyền |
| 404 | `NOT_FOUND` | Đối tượng không tồn tại **hoặc không được quyền biết có tồn tại** |
| 409 | `GROUP_LIMIT`, `ARCHIVED`, `QUOTA_EXCEEDED`, `PHYSICAL_CAPACITY`, `DEADLINE_CLOSED`, `IDEMPOTENCY_CONFLICT`, `HANDOVER_REQUIRED` | Nêu lý do trong phạm vi được phép; dữ liệu hiện hành không đổi |
| 412 | `VERSION_CONFLICT` | Xem bản hiện hành trước khi lưu/nộp lại; không ghi đè âm thầm |
| 429 | `RATE_LIMITED` | Chờ theo `Retry-After`; không thử lại trong vòng lặp không giới hạn |
| 503 | `RETRYABLE`, `STORAGE_UNAVAILABLE` | Hiện trạng thái chưa rõ nếu request đã gửi; tra `/operations/{id}` trước khi tạo ý định mới |

**Ví dụ Nộp:** `POST /api/v2/assignment-recipients/ar_1/submissions` với header `Idempotency-Key: c_789`, `If-Match: "submission-3"`, body `{ "text": "Bản sửa", "links": [], "uploadIds": ["up_12"] }`. Thành công `201` trả `{ "data": { "submissionId": "s_4", "version": 4, "acceptedAt": "2026-11-07T06:00:00Z", "timeliness": "on_time" }, "requestId": "r_123" }`. Đây là **ví dụ định dạng**, không xác định hạn của một bài thật. Mất phản hồi: truy `/operations/by-key/{key}` với quyền hiện tại hoặc gửi lại cùng key để lấy biên nhận; không tạo `s_5`.

**Ví dụ cả ngày:** `{ "scope": { "type": "class", "id": "cl_1" }, "allDay": { "startDate": "2026-11-10", "endDateExclusive": "2026-11-11", "timeZone": "Asia/Ho_Chi_Minh" }, "title": "Thi" }`. UI hiển thị đúng ngày 10/11 cho mọi múi giờ. Sự kiện có giờ thay `allDay` bằng `{ "startsAt": "...", "endsAt": "..." }`; không chấp nhận cả hai loại đồng thời.

Hợp đồng đường dẫn là bản đầu cho web; trước khi client/backend coding song song phải sinh schema OpenAPI máy đọc được và kiểm tự động để không lệch. [Danh mục thao tác](action-catalog.md) quy định cả chuyển chủ, cấp quyền, phản hồi, tải tệp; không suy quyền mới chỉ từ việc tồn tại endpoint.
