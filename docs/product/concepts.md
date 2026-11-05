# SNOTE v2 — Khái niệm và phạm vi sản phẩm

- **Trạng thái:** Đã duyệt đối với các mệnh đề trong tài liệu này; chưa xác nhận phạm vi phát hành hoặc chi tiết triển khai.
- **Phạm vi:** SNOTE v2.
- **Người chịu trách nhiệm:** Chủ sản phẩm.
- **Ngày cập nhật:** 2026-11-05.
- **Nguồn quyết định:** Các xác nhận trực tiếp của chủ sản phẩm trong phiên rà soát ngày 2026-11-05; thay đổi và đối chiếu được ghi trong pull request đưa tài liệu này vào `s_note_v2`.

## Bài toán và người dùng

SNOTE phục vụ học sinh, người dùng cá nhân và giáo viên. Người dùng cần lưu nhanh thông tin để tìm lại, quản lý việc riêng và việc được giao, theo dõi hạn, lịch và tiến độ, cộng tác minh bạch trong workspace. Giáo viên tạo lớp, giao bài cho các nhóm, quan sát tiến độ và phản hồi kết quả.

Hồ sơ mang tên **AI Note** là tư liệu cũ, không phải nguồn yêu cầu đã duyệt cho SNOTE v2. Các mốc và lựa chọn kỹ thuật trong hồ sơ v2 trước đây cũng phải được thẩm định lại trước khi sử dụng.

## Khái niệm và quan hệ

| Khái niệm | Định nghĩa đã xác nhận |
| --- | --- |
| Tài khoản | Một người có thể tham gia nhiều workspace và giữ các vai trò khác nhau theo từng lớp hoặc workspace. |
| Workspace | Không gian làm việc có Công việc, Lịch và Thư viện; có thành viên, vai trò, lời mời/yêu cầu tham gia và nội dung theo phạm vi quyền. Một tài khoản có thể có nhiều workspace để tách các việc, dự án hoặc bài tập. |
| Lớp | Không gian do giáo viên tạo và quản lý, ở **một cấp trên** các workspace thuộc lớp. Lớp có người học, quy tắc quyền, bài giao và sự kiện chung. |
| Nhóm trong lớp | **Chính là một workspace thuộc lớp**, được gọi là “nhóm” trong ngữ cảnh lớp. Nhóm và workspace không phải hai cấp hoặc hai loại không gian làm việc khác nhau. |
| Workspace độc lập | Workspace không thuộc lớp, có thể dùng riêng hoặc mời người khác cùng làm. Quyền quản trị lớp không tự áp dụng cho workspace độc lập. |
| Lớp trưởng | Vai trò ở cấp lớp được giáo viên điều chỉnh quyền; quyền áp dụng trên các workspace thuộc lớp theo cấu hình. |
| Trưởng nhóm | Vai trò quản trị workspace của nhóm mình; không tự có quyền quản lý cả lớp hoặc workspace nhóm khác. |

Giáo viên là chủ lớp và là chủ các workspace thuộc lớp; trưởng nhóm là người quản trị workspace được giao. Người được giáo viên cấp quyền tạo workspace nhóm mặc định trở thành người quản trị workspace vừa tạo; giáo viên có thể thay đổi quyền đó.

Tư cách thành viên lớp và tư cách thành viên workspace nhóm là hai phạm vi riêng. Việc vào lớp không tự cấp quyền đọc nội dung của mọi nhóm. Một người học được tham gia tối đa bao nhiêu workspace nhóm đang hoạt động trong cùng lớp phụ thuộc cài đặt của giáo viên.

## Thư viện, công việc và lịch

**Thư viện** là nơi chứa văn bản/ghi chú, đường dẫn và tệp trong mỗi workspace. Nội dung được phân loại vào thư mục và có thể mang thông tin như tiêu đề, nguồn, mô tả, nhãn và ngày lưu. “Bài viết” không phải loại nội dung bắt buộc riêng; một đường dẫn đến bài viết vẫn là đường dẫn. Chưa có quyết định về lưu toàn văn trang web.

**Hộp thu** thuộc Thư viện của workspace cá nhân được chọn làm mặc định. Nội dung lưu nhanh chưa phân loại đi vào đây và chỉ chủ tài khoản thấy; việc workspace có thêm thành viên không tự chia sẻ nội dung Hộp thu. Người dùng có thể phân loại và chia sẻ/chuyển nội dung bằng hành động rõ ràng.

**Việc của tôi** tổng hợp việc cá nhân và việc được giao mà người dùng còn quyền đọc từ mọi workspace. Công việc bên trong một workspace chỉ hiển thị việc của workspace đó.

**Lịch của tôi** tổng hợp các buổi làm riêng, hạn việc và sự kiện liên quan đến người dùng từ mọi workspace. Lịch workspace hiển thị nội dung chung thuộc phạm vi workspace. Lịch lớp có sự kiện lớp và hạn bài giao; sự kiện lớp cũng xuất hiện trong Lịch của tôi và Lịch của các workspace nhóm liên quan theo quyền. Một sự kiện xuất hiện từ nhiều đường xem vẫn là một sự kiện gốc. Lịch còn chứa sự kiện không gắn công việc, như lịch học, lịch thi hoặc cuộc hẹn riêng.

Các quy tắc hành động, phạm vi quyền và ngoại lệ được ghi tại [quy tắc nghiệp vụ đã xác nhận](../requirements/verified-business-rules.md). Hành vi điều hướng đã xác nhận nằm tại [cấu trúc giao diện](../ux/validated-navigation.md).
