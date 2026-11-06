# Q33-D — Đề xuất màn Bài giao, tiến độ và bản nộp

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Bản rà soát, chưa được chủ sản phẩm duyệt; không dùng làm yêu cầu coding |
| Phạm vi | Đề xuất mục Bài giao ở vùng tính năng của lớp, màn bài giao của giáo viên và màn nhận bài của một nhóm |
| Quy tắc nguồn | [ASG-01 đến ASG-12](../../docs/requirements/assignments-and-submissions.md), [PER-03/05](../../docs/requirements/permissions.md), [CAL-03](../../docs/requirements/calendar.md), [Q33-C](ux-q33-class.md) |

Mỗi bài giao thuộc **lớp**, được gửi cho cả lớp hoặc những nhóm được chọn. Mỗi nhóm có tiến độ, bản nộp và phản hồi riêng. Giáo viên có màn so sánh nhóm; người học trong nhóm chỉ thấy phần của nhóm mình, trừ quyền liên nhóm do giáo viên cấp. Đề xuất đặt Bài giao trong **vùng tính năng của lớp thay cho ba mục tính năng workspace**, không thêm tab cạnh tiêu đề lớp. Màn này không tự hiển thị Công việc hoặc Thư viện của các nhóm khác.

| Mã | Cấp, vị trí, thành phần cùng nhóm | Số lượng, loại đề xuất | Hành động hoặc thông tin hiển thị | Nguồn/ràng buộc |
| --- | --- | --- | --- | --- |
| AUX-01 | Vùng chính khi chọn mục Bài giao đề xuất ở thanh tính năng của lớp | 1 danh sách bài, một hàng mỗi bài; 1 nút Tạo bài khi có quyền | Chọn bài để mở; giáo viên tạo bài cho cả lớp hoặc nhóm chọn. Người học thấy bài gửi đến nhóm mình. | ASG-01, PER-05, NAV-08 |
| AUX-02 | Đầu màn chi tiết bài giao | 1 tiêu đề, 1 nhãn trạng thái và hạn, 1 lối về danh sách | Cho biết bài nào, lớp nào, hạn đang áp dụng và quyền của người xem. | ASG-01/05/07 |
| AUX-03 | Dưới đầu bài, nhóm nội dung bài | 1 vùng mô tả, 1 nhóm đính kèm nếu có | Hiện yêu cầu của giáo viên. Trường mô tả/đính kèm cụ thể cần xác nhận; không giả định mẫu bài. | R-09 |
| AUX-04 | Màn giáo viên, vùng nhận bài | 1 bộ chọn phạm vi Cả lớp/Nhóm chọn khi tạo; 1 danh sách nhóm nhận | Gửi bài cho đúng nhóm, theo dõi từng nhóm. | ASG-01 |
| AUX-05 | Màn giáo viên, nhóm cài đặt hạn | 1 điều khiển hạn, 2 tùy chọn độc lập “Nộp lần đầu sau hạn” và “Sửa bản nộp sau hạn”, mỗi tùy chọn kế thừa/có giá trị riêng theo bài | Giá trị đặt rõ trên bài ưu tiên mặc định lớp; trước hạn cho phép người có quyền theo ASG-03; sau hạn dùng hai quyền riêng. | ASG-05–08 |
| AUX-06 | Màn giáo viên, vùng theo dõi | 1 bảng, một hàng mỗi nhóm nhận; 3 cột thông tin tiến độ | Hiện số việc xong/tổng việc, tiến độ checklist và cập nhật văn bản **tách ba nguồn**; chọn nhóm để xem chi tiết bản nộp của nhóm ấy. Chưa hiển thị một tỷ lệ nhóm tự tính. | ASG-02/11 |
| AUX-07 | Màn nhóm nhận bài, vùng tiến độ của nhóm | 1 nhóm ba nguồn tiến độ, 1 nút Cập nhật tiến độ nếu có quyền | Trưởng nhóm hoặc người được cấp quyền gửi văn bản cập nhật. Thành viên nhóm xem dữ liệu của nhóm. | ASG-02/11 |
| AUX-08 | Màn nhóm nhận bài, cạnh tình trạng nộp | 1 nút Nộp lần đầu **hoặc** Sửa bản nộp, theo trạng thái và quyền | Mở biểu mẫu tương ứng; khi quá hạn, bật/khóa dựa vào đúng tùy chọn hiệu lực của bài. Trưởng nhóm có quyền mặc định; người khác cần cấp riêng. | ASG-03/05/06 |
| AUX-09 | Khi Nộp/Sửa | 1 biểu mẫu gồm vùng văn bản, đường dẫn và thêm tệp theo nội dung được gửi | Hiện bản xem lại nội dung, kiểm tra đầy đủ, xác nhận gửi; tệp lỗi không tạo phiên bản mới. Không chốt dung lượng/định dạng tệp từ màn này. | ASG-04/12, R-07 |
| AUX-10 | Bên dưới bản hiện hành | 1 danh sách phiên bản; một mục mỗi phiên bản; 1 vùng nhận xét theo phiên bản đã chọn | Xem người gửi, thời điểm, trạng thái đúng/muộn theo hạn lúc nộp và nhận xét của giáo viên cho từng phiên bản. Sửa tạo phiên bản mới, giữ bản cũ. | ASG-04/08/09/12 |
| AUX-11 | Biểu mẫu khi bản hiện hành vừa đổi | 1 trạng thái xung đột và 1 nút Xem lại | Ngừng xác nhận gửi phiên bản mới trên dữ liệu cũ; người gửi xem bản hiện hành rồi quyết định gửi lại. | ASG-12 |
| AUX-12 | Màn giáo viên, nhóm thao tác vòng đời | 1 nút Ngừng giao hoặc Lưu trữ theo trạng thái | Giữ lịch sử bài đã có tiến độ hoặc bản nộp; bản đầu không có hành động xóa vĩnh viễn ở đây. | ASG-10 |

## Trạng thái và màn nhỏ

| Trạng thái | Phương án đề xuất |
| --- | --- |
| Chưa có bài giao | Giáo viên/người được ủy quyền thấy Tạo bài; người học thấy thông báo chưa có bài. |
| Nhóm chưa nộp và còn hạn | Người có quyền thấy Nộp lần đầu; người khác chỉ xem tình trạng. |
| Nhóm đã nộp và còn hạn | Người có quyền thấy Sửa bản nộp; mọi người có quyền đọc thấy lịch sử phiên bản. |
| Quá hạn | Hiển thị riêng trạng thái Nộp lần đầu và Sửa bản nộp theo hai cài đặt sau hạn, không gộp thành một công tắc. |
| Tải tệp lỗi hoặc xung đột phiên bản | Bản đã ghi còn nguyên; biểu mẫu báo lỗi hoặc yêu cầu Xem lại, chưa tạo phiên bản mới. |
| Hết quyền/không phải nhóm nhận | Không mở dữ liệu nhóm khác; chỉ báo không có quyền hoặc bài không được giao cho nhóm hiện tại. |
| Điện thoại | Danh sách nhóm của giáo viên thành từng hàng; mở một nhóm vào chi tiết; biểu mẫu nộp và lịch sử là các vùng theo chiều dọc. |

## Điểm cần duyệt

1. AUX-03: bài giao tối thiểu cần **tiêu đề + mô tả + hạn + nhóm nhận**? Hạn bài đã có quy tắc ngày/giờ nhưng việc bắt buộc đặt hạn chưa được xác nhận; đề xuất chỉ bắt buộc tiêu đề và nhóm nhận cho bản đầu.
2. AUX-05: giao diện hai quyền sau hạn nên có mỗi dòng ba trạng thái **Kế thừa lớp / Cho phép / Khóa** để thể hiện rõ ưu tiên từng bài, thay vì hai công tắc không cho thấy việc kế thừa.
3. AUX-06: bảng giáo viên tách ba cột tiến độ đúng theo ASG-02; chọn nhóm mới thấy phiên bản và phản hồi, tránh lộ cùng lúc quá nhiều nhóm. Duyệt cách này không?
4. AUX-09: bản nộp gồm ba loại nội dung có thể kết hợp, nhưng cần chốt **ít nhất một loại có nội dung** trước khi cho bấm Nộp; giới hạn tệp còn ở R-07.

Thao tác thu hồi riêng một bản nộp còn mở tại [R-04](../../review/unresolved.md), nên chưa đặt nút Thu hồi. Điểm số vẫn ngoài phạm vi bản đầu theo [ASG-09](../../docs/requirements/assignments-and-submissions.md).
