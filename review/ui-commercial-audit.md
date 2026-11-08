# Rà giao diện theo tính năng — 2026-11-08

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Web v2 tại head `cb464e6`; chỉ mã và tài liệu v2 hiện hành |
| Nguồn | Yêu cầu người dùng ngày 2026-11-08; [UX tổng hợp](../docs/ux/ui-and-motion.md), [Q32](../docs/ux/workspace-gantt.md), [điều hướng lớp](../docs/ux/class-navigation.md), [SRC-27](provenance.md) |
| Trạng thái | Rà mã tĩnh và cải tiến shell trên branch `feat/v2/ui-review`; cần xem trên thiết bị và dữ liệu thật trước khi kết luận đủ chất lượng phát hành |

## Thứ tự sửa theo trải nghiệm người dùng

| Vùng | Quan sát tại head gốc | Rủi ro và lựa chọn | Kết quả kiểm chứng mong đợi |
| --- | --- | --- | --- |
| Workspace và điều hướng chung | Cụm tròn chồng lên nhau khó hiểu là từng workspace; danh sách là `div` bấm được nhưng không nhận focus; mobile ẩn hẳn sidebar. Các dòng “Mục lưu ý” là văn bản cố định, không gắn dữ liệu hoặc mở được mục. | Đã tách vòng tròn, thêm tên/loại/lớp/trạng thái, nút danh sách có focus, Escape và lối mở menu mobile. Thay ba dòng tĩnh bằng trạng thái rỗng trung thực. Khi có API cho Mục lưu ý, owner Ngữ cảnh nối tối đa ba mục thật với đích điều hướng UXR-05. | Mỗi vòng tròn ứng với đúng một ID; nhấp và chọn bằng bàn phím đổi đúng workspace; kéo ngang chỉ cuộn; mobile mở được mọi tính năng; lớp và workspace không lẫn dữ liệu. |
| Công việc | `TasksContainer` đặt fixture vào danh sách khi request lỗi, kể cả nhánh đã xóa dữ liệu khi mất quyền; tạo việc dùng `prompt()`; workspace cá nhân truyền `undefined` xuống container nên thao tác tạo dùng ID giả `default-workspace`. | P0 về độ tin cậy/quyền: owner Công việc bỏ fixture khỏi đường chạy thật, giữ lỗi và nút Thử lại, chặn dữ liệu cũ khi mất quyền; tạo việc bằng form trong ngữ cảnh đúng. Sau đó tinh chỉnh mật độ Gantt/Danh sách, nhóm Chưa lên lịch và bảng chi tiết theo Q32. | API 403/404/500 không hiện việc mẫu; tạo việc ở workspace hiện tại qua ID thật; quyền, trạng thái rỗng, loading và mobile được kiểm trên cùng dữ liệu. |
| Lịch trình | `CalendarContainer` khởi tạo fixture và đặt lại fixture khi tải lỗi, thông báo gọi là “bản nháp ngoại tuyến” dù không có cơ chế lưu offline. | P0 về thông tin sai: owner Lịch chỉ hiển thị dữ liệu đã xác thực, phân biệt lỗi tải với bản nháp thật nếu sau này có offline. Giữ ngày cả ngày ở dải riêng và thời gian theo múi giờ như UX đã chốt. | Lỗi mạng không sinh sự kiện giả; đổi workspace/lớp không giữ sự kiện cũ; Tuần/Ngày trên desktop/mobile giữ focus và mốc hiện tại. |
| Thư viện | `LibraryView` thay quota lỗi bằng 1 GiB giả và chỉ `console.error` khi danh sách lỗi. | P0 về chỉ tiêu giả: owner Thư viện dùng trạng thái “Chưa tải được dung lượng”, Thử lại và khóa quyết định phụ thuộc quota cho đến khi có số thật. Dùng một hành động chính, trạng thái upload theo bytes → metadata → đã lưu. | Không báo còn chỗ khi quota API lỗi; lỗi từng giai đoạn upload có lối tiếp tục đúng; tìm kiếm và thư mục không lẫn giữa workspace. |
| Lớp học | Bộ chọn lớp dùng `div` như nút; không có Escape/focus khi đóng. | Owner Ngữ cảnh áp dụng mẫu button/focus của bộ chọn workspace; trên mobile bảng Thành viên giữ cột Người học. | Dùng bàn phím chọn lớp, mở lớp vào Thành viên, không thấy Cài đặt nếu không có quyền. |
| Bài giao và Nộp | Container hiện loading dạng một dòng chữ; khoảng cách và màu đặt inline riêng, khác shell. | Owner Bài giao giữ hình học của hàng/card khi tải, dùng token chung, biên nhận phiên bản/giờ nhận sau nộp và thông báo rõ khi chưa biết kết quả. | Không nộp đôi khi mạng chập chờn; trạng thái lỗi/xung đột không biến thành thành công; skeleton không làm nhảy bố cục. |
| Trang đăng nhập/demo | Head gốc chứa tài khoản và mật khẩu demo cố định, nhiều câu mô tả kỹ thuật như “SHA-256”, “Stageshow UI”. | Đã tách trang demo khỏi giao diện phát hành và chuyển thông tin đăng nhập demo sang biến môi trường dev. Màn phát hành dùng một lời dẫn theo tác vụ. | Build phát hành không chứa mật khẩu demo cố định; khách chưa đăng nhập không thấy menu tính năng riêng tư. |

## Giới hạn và phản biện

- Sau đợt rà tiếp, các PR [#58](https://github.com/naverisme/snote/pull/58), [#59](https://github.com/naverisme/snote/pull/59), [#60](https://github.com/naverisme/snote/pull/60) loại bỏ dữ liệu giả khi API lỗi, quota giả, và ID tệp nộp tự tạo. Tệp nộp chỉ được đưa vào bản nộp sau khi upload xác nhận `verified`. Đây là thay đổi đang chờ review và kiểm thử tích hợp, chưa được coi là phát hành.
- Checklist công việc chưa có đường đọc trong OpenAPI v2 dù có lệnh ghi. UI tạm khóa thao tác để tránh tạo mục chỉ tồn tại trong bộ nhớ. Cần hợp đồng đọc và kiểm thử quyền theo TASK-15/16 trước khi mở lại.
- Sau khi tải lại trang, phiên đăng nhập vẫn có thể còn hiệu lực nhưng CSRF token chỉ lưu trong bộ nhớ. Hợp đồng hiện chưa có cách cấp lại token cho phiên còn sống; cần quyết định liên nhóm và cập nhật hợp đồng trước khi coi các lệnh ghi là ổn định.
- Đổi màu và khoảng cách không giải quyết được lỗi dữ liệu. Các sửa đổi P0 đã được đề xuất trong PR tính năng; cần nghiệm thu tích hợp trước khi đánh giá “sẵn sàng thương mại”.
- Bản shell mới chưa có kiểm chứng thị giác trên thiết bị thật, chưa đo tương phản toàn bộ màn, và chưa kiểm nghiệm với tên workspace rất dài, số lượng lớn hoặc tên lớp giống nhau. Dùng fixture v2 để kiểm những ca đó và ghi kết quả vào review.
- Không tự đặt số quota, trạng thái offline hoặc lời hứa vận hành. Các điều kiện môi trường còn mở theo [unresolved](unresolved.md).
