# SNOTE v2 — Sơ đồ 6 · Trình tự và hợp đồng API

**Đề xuất để duyệt.** Tên thao tác biểu thị hợp đồng nghiệp vụ, có thể đổi khi chuẩn hóa API. Mọi yêu cầu dữ liệu cần phiên hợp lệ. Máy chủ lấy vai trò và phạm vi từ dữ liệu hiện hành.

## 6A — Thành viên cập nhật một mục checklist

```mermaid
sequenceDiagram
    actor U as "Người được giao"
    participant W as "Web"
    participant A as "API công việc"
    participant D as "PostgreSQL"
    U->>W: Đánh dấu hoàn thành
    W->>A: Gửi việc, mục và trạng thái đích
    A->>D: Đọc phạm vi, phân công và mục trong giao dịch
    alt Có quyền và việc đang mở
        A->>D: Ghi trạng thái đích và đọc số mục
        D-->>A: Trạng thái đã lưu và số đếm
        A-->>W: Trả dữ liệu công việc mới
        W-->>U: Cập nhật checklist, làm mới danh sách liên quan
    else Thiếu quyền hoặc việc không còn mở
        A-->>W: Trả lỗi theo quyền và trạng thái
        W-->>U: Hiện lý do phù hợp và tải lại dữ liệu được phép
    end
```

**UC-05, UC-09 · FR-06, FR-11.** Gửi trạng thái đích để thao tác lặp không đảo trạng thái. Khi quyền bị thay đổi đồng thời, thao tác phải được sắp thứ tự với lần ghi liên quan. Bảng nhóm và Việc của tôi đọc lại từ cùng việc.

## 6B — Giáo viên mở tiến độ một nhóm

```mermaid
sequenceDiagram
    actor G as "Giáo viên phụ trách"
    participant W as "Web"
    participant A as "API lớp và tiến độ"
    participant D as "PostgreSQL"
    G->>W: Chọn bài giao và nhóm
    W->>A: Yêu cầu tiến độ theo bài và nhóm
    A->>D: Kiểm tra lớp phụ trách và nhóm nhận bài
    alt Đúng phạm vi
        A->>D: Đọc phần việc, cập nhật tiến độ và trạng thái nộp
        D-->>A: Dữ liệu theo nhóm nhận bài
        A-->>W: Trả bản tóm lược với các trường được phép
        W-->>G: Hiện tiến độ, kể cả trạng thái chưa có dữ liệu
    else Sai phạm vi
        A-->>W: Từ chối, tránh tiết lộ dữ liệu ngoài phạm vi
        W-->>G: Hiện không thể truy cập
    end
```

**UC-18, UC-27 · FR-15.** Chiếu người phụ trách, hạn và trạng thái của việc gắn bài. Checklist chi tiết và nháp mở qua luồng tài nguyên được chia sẻ, kiểm tra quyền riêng ở mỗi lần mở.

## 6C — Trưởng nhóm nộp bài và thử lại

```mermaid
sequenceDiagram
    actor L as "Trưởng nhóm"
    participant W as "Web"
    participant A as "API bài nộp"
    participant D as "PostgreSQL"
    L->>W: Xác nhận gửi kết quả
    W->>A: Gửi kết quả và khóa yêu cầu
    A->>D: Kiểm tra quyền hiện tại, khóa yêu cầu và trạng thái nhận nộp
    alt Quyền hợp lệ và cùng yêu cầu đã được ghi
        A-->>W: Trả đúng bản nộp trước đó
    else Quyền hợp lệ và đủ điều kiện nộp mới
        A->>D: Ghi phiên bản và khóa trong giao dịch
        D-->>A: Bản nộp đã ghi
        A-->>W: Trả bản nộp và thời điểm tiếp nhận
    else Vi phạm quyền, điều kiện hoặc khóa dùng với dữ liệu khác
        A-->>W: Báo lỗi, giữ nội dung đang nhập
    end
    W-->>L: Hiện trạng thái theo phản hồi máy chủ
```

**UC-17 · FR-16.** Kiểm tra quyền đọc hiện hành trước khi trả bản nộp cũ. Một yêu cầu đã ghi được trả lại với cùng khóa dù hạn vừa qua. Nộp mới sau hạn, nộp lại và nộp thay theo D-04. Khóa duy nhất và giao dịch xử lý cả hai yêu cầu đồng thời.

## Hợp đồng API tối thiểu

| Thao tác đề xuất | Đầu vào / đầu ra | Điều kiện chính |
|---|---|---|
| `GET /api/me/tasks` | Khoảng ngày tùy chọn. Trả việc, nhãn nguồn, lý do vào nhóm ngày, trạng thái và checklist tóm tắt. | Duy nhất việc trong mỗi nhóm ngày. Tôn trọng múi giờ hồ sơ. |
| `PATCH /api/tasks/:taskId/check-items/:itemId` | Trạng thái đích. Trả mục, số mục xong và bước tiếp theo. | Mục thuộc việc. Người dùng là chủ việc cá nhân hoặc người đang được giao việc nhóm. |
| `GET /api/classes/:classId/assignments/:assignmentId/groups/:groupId/progress` | Trả tiến độ trong phạm vi bài và nhóm. | Giáo viên phụ trách và nhóm nhận bài hợp lệ. |
| `POST /api/classes/:classId/assignments/:assignmentId/groups/:groupId/submissions` | Nội dung kết quả và khóa yêu cầu. Trả mã bản nộp và thời điểm tiếp nhận. | Trưởng nhóm hiện tại. Kiểm tra cả D-04 và khóa thử lại. |

Quy ước lỗi đề xuất: 401 khi cần xác thực, 403 khi hành động bị từ chối trong phạm vi có thể tiết lộ, 404 khi tài nguyên không tìm thấy trong phạm vi được đọc, 409 khi xung đột trạng thái hoặc khóa và 422 khi đầu vào nghiệp vụ không hợp lệ. Trả mã lỗi ổn định để giao diện chọn thông báo. Chốt hợp đồng đầy đủ cho từng mốc trước khi lập trình.
