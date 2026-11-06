# Bài giao, tiến độ và phiên bản nộp

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định cách giao bài cho nhóm, theo dõi tiến độ, nộp và nhận xét |
| Phạm vi | Bài giao cấp lớp, bản nộp của nhóm và cài đặt hạn |
| Kiểm định | DCA-checked theo các quyết định về bài giao và phiên bản |
| Bằng chứng duyệt | [SRC-05, SRC-07, SRC-09, SRC-10, SRC-15, SRC-19, Q15 đến Q18, Q28, Q29, Q33-D1/D2](../../review/provenance.md) |

## Giao bài và theo dõi

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| ASG-01 | Giáo viên giao cùng bài cho cả lớp hoặc chọn nhóm nhận. Tiến độ và bản nộp được theo dõi riêng theo từng nhóm nhận bài. | SRC-05, SRC-08 |
| ASG-02 | Giáo viên xem ba phần riêng gồm số việc hoàn thành trên tổng số việc, checklist từng việc và cập nhật bằng văn bản của nhóm. Tỷ lệ tổng hợp của cả nhóm chờ chốt cách tính. | SRC-07 |
| ASG-03 | Trưởng nhóm chính mặc định được Nộp và sửa bản nộp. Giáo viên có thể cấp riêng cho thành viên khác. Người quản lý thêm cần quyền Nộp riêng. | SRC-05, SRC-09 |
| ASG-04 | Bản nộp gồm văn bản, đường dẫn và tệp. Khi nộp, nội dung được giữ theo đúng phiên bản đã gửi. Thay đổi mục trong Thư viện sau đó giữ nguyên phiên bản đã nộp. Mỗi lần sửa bản nộp ghi phiên bản, người sửa và thời điểm. | SRC-05, Q15 |
| ASG-11 | Trưởng nhóm chính hoặc người được giáo viên cấp quyền có thể gửi cập nhật tiến độ bằng văn bản. Giáo viên và thành viên nhóm nhận bài xem tiến độ và bản nộp của nhóm ấy. Xem dữ liệu của nhóm khác cần quyền riêng do giáo viên cấp. | Q28 |
| ASG-12 | Khi nhiều người thao tác Nộp cùng lúc, nếu phiên bản hiện hành đã thay đổi thì người đang gửi phải xem lại trước khi tạo phiên bản tiếp theo. Chỉ ghi phiên bản mới sau khi các phần gửi, kể cả tệp, đầy đủ; lỗi tải tệp không thay thế bản đã ghi. Mỗi lần sửa hợp lệ tạo phiên bản mới theo quyền và hạn, giữ các phiên bản cũ để tra cứu. | Q29 |
| ASG-13 | Khi tạo bài giao cần có tiêu đề và ít nhất một nhóm nhận bài. Mô tả và hạn bài có thể để trống. Đối tượng cả lớp hoặc nhóm được chọn vẫn theo ASG-01; không gửi bài nếu chưa có nhóm nhận nào. | Q33-D1, SRC-19 |
| ASG-14 | Bản nộp lần đầu và mỗi phiên bản sửa cần ít nhất một nội dung có giá trị thuộc văn bản, đường dẫn hoặc tệp. Có thể kết hợp nhiều loại. Trường hợp nội dung/tệp chưa đủ không tạo phiên bản mới; bản đã ghi giữ nguyên theo ASG-12. | Q33-D2, SRC-19 |

## Hạn và hai quyền sau hạn

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| ASG-05 | Người có quyền được nộp và sửa đến hết hạn. Sau hạn, mặc định khóa nộp lần đầu và sửa bản đã nộp. Giáo viên có hai cài đặt độc lập để mở từng hành động. | SRC-05 |
| ASG-06 | Với từng cài đặt, giá trị tường minh trên bài giao được ưu tiên. Khi bài giao chưa đặt giá trị, dùng mặc định lớp cho cài đặt tương ứng. | SRC-05 |
| ASG-07 | Hạn bài có thể là ngày kèm giờ hoặc chỉ ngày. Hạn chỉ ngày kết thúc vào cuối ngày ấy theo múi giờ lớp. | SRC-05 |
| ASG-08 | Đổi hạn sau khi có bản nộp được ghi lịch sử. Trạng thái đúng hạn hoặc muộn của bản đã nộp dựa trên hạn có hiệu lực lúc nộp. Hạn mới áp dụng cho hành động tiếp theo. | Q17 |
| ASG-15 | Hai quyền sau hạn trên từng bài được đặt **riêng**, mỗi quyền chọn một trong ba trạng thái: Kế thừa lớp, Cho phép, Khóa. Kế thừa lớp dùng giá trị lớp của quyền tương ứng; Cho phép/Khóa trên bài là giá trị tường minh và ưu tiên hơn giá trị lớp theo ASG-06. | Q33-D1, SRC-19 |

| Cài đặt có hiệu lực sau hạn | Nộp lần đầu | Sửa bản đã nộp |
| --- | --- | --- |
| Cả hai tắt | Khóa | Khóa |
| Chỉ mở nộp lần đầu | Cho phép | Khóa |
| Chỉ mở sửa bản nộp | Khóa | Cho phép |
| Cả hai mở | Cho phép | Cho phép |

Bảng áp dụng với người có quyền theo ASG-03. Cột “Nộp lần đầu” áp dụng cho nhóm chưa có bản nộp. Cột “Sửa bản đã nộp” áp dụng cho nhóm đã có bản nộp. [SRC-05](../../review/provenance.md)

## Nhận xét và lưu trữ

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| ASG-09 | Giáo viên nhận xét theo từng phiên bản nộp. Bản đầu dùng nhận xét, điểm số và thang điểm ở ngoài phạm vi. | Q16 |
| ASG-10 | Giáo viên có thể lưu trữ hoặc ngừng giao bài đã có tiến độ hoặc bản nộp, vẫn giữ lịch sử để tra cứu. Xóa vĩnh viễn trường hợp này ở ngoài phạm vi bản đầu. | Q18 |

Quyền cập nhật và đọc theo nhóm đã chốt tại ASG-11; xử lý phiên bản xung đột và tệp lỗi tại ASG-12. Thao tác thu hồi riêng một bản nộp, giới hạn tệp và cách khôi phục khi tệp được tải đầy đủ nhưng ghi dữ liệu không thành công còn ở [R-04](../../review/unresolved.md).
