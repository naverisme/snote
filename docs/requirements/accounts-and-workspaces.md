# Tài khoản và workspace

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định cách dùng tài khoản, nơi lưu mặc định và phạm vi cộng tác |
| Phạm vi | Đăng ký, lựa chọn cách dùng và workspace SNOTE v2 |
| Kiểm định | DCA-checked theo các quyết định tài khoản và workspace |
| Bằng chứng duyệt | [SRC-01, SRC-02, SRC-07, SRC-08, SRC-11, SRC-25, SRC-31](../../review/provenance.md) |

| Mã | Quy tắc đã duyệt | Nguồn |
| --- | --- | --- |
| ACC-01 | Mọi tài khoản có phạm vi cá nhân theo ACC-02. Khi đăng ký, người dùng có thể chọn nhu cầu tham gia lớp (Người học), tạo lớp (Giáo viên), cả hai hoặc không chọn mục nào nếu chỉ dùng cá nhân. Các lựa chọn lớp học có thể đổi sau trong Cài đặt tài khoản. Nếu không chọn mục nào, client gửi cách dùng `personal`; nếu chọn, gửi `student` và/hoặc `teacher`. `personal` còn được API chấp nhận cho tài khoản đã có dữ liệu. | SRC-07, SRC-31 |
| ACC-02 | Mọi tài khoản có workspace cá nhân mặc định được tạo khi đăng ký, kể cả tài khoản chọn Giáo viên. Hộp thu dùng workspace này làm đích lưu. | SRC-07, SRC-08 |
| ACC-03 | Quyền tạo lớp dành cho tài khoản chọn Giáo viên và có hiệu lực từ lựa chọn này. Giáo viên tạo lớp khi cần sau đăng ký. | SRC-07, SRC-08 |
| ACC-04 | Một tài khoản có thể tạo thêm workspace và thêm thành viên để cộng tác. Công việc, Lịch và Thư viện có phạm vi từng workspace. Khi workspace thuộc lớp, người dùng gọi đó là nhóm. | SRC-01, SRC-03 |
| ACC-05 | Cách dùng tài khoản điều chỉnh chức năng hiển thị. Quyền trên dữ liệu được xác định theo tư cách và vai trò trong đúng lớp hoặc workspace. | SRC-02, SRC-07 |
| ACC-06 | Workspace cá nhân mặc định không cho thêm thành viên hoặc chia sẻ quyền truy cập. Người dùng tạo workspace khác để cộng tác. | SRC-11 |
| ACC-07 | Hộp thu luôn thuộc workspace cá nhân mặc định trong bản đầu. Workspace này không đổi chủ, không chia sẻ, không chuyển thành nhóm và không được lưu trữ. | I1/I4, SRC-25 |
| ACC-08 | Chủ workspace cộng tác độc lập chọn một thành viên đang có tư cách làm chủ mới. Người nhận phải chấp nhận; quyền chủ cũ kết thúc khi người mới nhận thành công. Ghi lịch sử chuyển giao. | I2, SRC-25 |
| ACC-09 | Thành viên workspace độc lập được tự rời sau khi bàn giao việc đang phụ trách. Chủ phải chuyển quyền theo ACC-08 và bàn giao việc trước khi rời. Nội dung, việc và lịch sử ở lại workspace. | I3, SRC-25 |
| ACC-10 | Chủ workspace độc lập được lưu trữ và khôi phục workspace; khi lưu trữ chỉ đọc theo quyền. Bản đầu không có nút xóa vĩnh viễn workspace độc lập. Workspace cá nhân mặc định theo ACC-07 không được lưu trữ. | I4, SRC-25 |

Xem [quyền theo phạm vi](access-control.md), [Hộp thu](library.md) và [điều hướng theo cách dùng](../ux/workspace-and-tasks.md).

**Đăng ký qua Google (INFERRED từ yêu cầu tích hợp Google ngày 2026-11-11 và SRC-27):** Google là một cách xác thực cho cùng tài khoản SNOTE, không là cách dùng `student`/`teacher`/`personal` mới. Lần đầu dùng Google vẫn chọn nhu cầu lớp học và múi giờ theo ACC-01, được tạo workspace cá nhân theo ACC-02. Lần sau nhận lại cùng tài khoản theo `sub` đã xác minh. Email trùng tài khoản mật khẩu không tự liên kết; người dùng tiếp tục đăng nhập bằng phương thức cũ cho tới khi có luồng liên kết đã xác minh. Giới hạn: cơ chế liên kết tài khoản và chính sách thay đổi email Google chưa được quyết định trong yêu cầu này.
