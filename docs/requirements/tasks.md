# Công việc, hạn và lịch làm riêng

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định việc thuộc phạm vi nào, cách giao việc, hạn và thứ tự theo dõi |
| Phạm vi | Công việc cá nhân và công việc được giao trong workspace |
| Kiểm định | DCA-checked cho quy tắc công việc và thời gian |
| Bằng chứng duyệt | [SRC-03, SRC-04, SRC-07, SRC-10, SRC-15, SRC-24, Q06 đến Q10, Q25 đến Q27, H4–H5](../../review/provenance.md) |

## Phạm vi và người phụ trách

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| TASK-01 | “Việc của tôi” tổng hợp việc cá nhân và việc được giao từ mọi workspace còn quyền truy cập. Màn Công việc của workspace chỉ lấy việc thuộc workspace đang mở. | SRC-03 |
| TASK-02 | Việc trong workspace nhóm có thể ở trạng thái chờ phân công. Sau khi giao, một việc có tối đa một người phụ trách chính. Checklist thuộc về việc; phần cần giao riêng từng người được tách thành các việc riêng. | Q06, Q26 |
| TASK-03 | Giao việc cho một thành viên có hiệu lực ngay và người nhận được thông báo. Người nhận có thể yêu cầu đổi người phụ trách. | Q07 |
| TASK-04 | Người giao hoặc người có quyền quản lý việc được giao sửa hạn và mức quan trọng. Người nhận cập nhật checklist, trạng thái và lịch làm riêng. Quyền sửa việc chung của lớp trưởng áp dụng theo PER-02. Mỗi lần đổi hạn được ghi lịch sử. | SRC-02, Q08 |
| TASK-13 | Khi người nhận yêu cầu đổi người phụ trách, người giao hoặc người có quyền quản lý quyết định. Người hiện tại tiếp tục chịu trách nhiệm đến khi quyết định giao lại có hiệu lực. | Q26 |
| TASK-14 | Thành viên có thể tạo việc chung **chờ phân công** trong workspace nhóm mình. Giáo viên, trưởng nhóm hoặc người có quyền quản lý việc chọn người phụ trách. Việc người dùng tạo không tự cho phép họ đổi hạn, mức quan trọng hoặc xóa việc sau khi đã giao. Lớp trưởng muốn tạo việc ở nhóm khác cần quyền tạo riêng. | H3–H4, SRC-24 |
| TASK-15 | Người phụ trách và người quản lý việc được thêm, sửa, xóa và đánh dấu mục checklist của việc. Thành viên khác chỉ xem theo quyền. Mỗi thay đổi mục checklist ghi người thao tác và thời điểm. Quyền sửa trường chung của việc không tự cấp quyền sửa checklist. | H5, SRC-24 |

## Thời gian và hoàn thành

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| TASK-05 | Việc cá nhân và việc được giao có thể không đặt hạn. Khi giao việc, khoảng được giao để hoàn thành bắt đầu từ thời điểm giao. Nếu đặt hạn, người giao chọn mốc kết thúc. | SRC-04 |
| TASK-06 | “Thời lượng còn lại” đếm ngược đến hạn. Việc quá hạn chưa hoàn thành hiện thời gian đã quá hạn. Hạn chỉ có ngày bắt đầu quá hạn lúc 00:00 ngày kế tiếp theo **múi giờ lưu cùng hạn lúc đặt hạn**; đổi nơi xem không tự đổi mốc này. Với hạn kèm giờ, dùng thời điểm đã đặt. | SRC-04, Q27 |
| TASK-07 | Người phụ trách tự đặt buổi làm riêng. Buổi làm sau hạn vẫn lưu và có nhãn “Làm muộn”. Thay đổi lịch làm giữ nguyên hạn của việc. Buổi làm riêng chỉ người sở hữu thấy. | SRC-04, Q08, Q19 |
| TASK-08 | Checklist hiện số mục đã xong và tỷ lệ, ví dụ 3/5 là 60%. Trạng thái hoàn thành thay đổi khi người dùng xác nhận hoàn thành việc. | SRC-04, Q10 |
| TASK-09 | Người phụ trách hoặc người quản lý có thể mở lại việc đã hoàn thành. Lịch sử ghi người mở lại và thời điểm. | Q10 |

## Bộ lọc và thứ tự

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| TASK-10 | Hôm nay hoặc Ngày mai theo múi giờ người xem gồm việc có hạn trong ngày tương ứng hoặc có buổi làm riêng trong ngày đó. Một việc thỏa cả hai điều kiện chỉ xuất hiện một lần trong cùng bộ lọc. Việc quá hạn chưa xong có nhãn hoặc bộ lọc riêng. | SRC-07, Q27 |
| TASK-11 | “Việc tiếp theo” mặc định chia theo thứ tự quá hạn chưa xong → hạn hôm nay → buổi làm hôm nay; mỗi việc chỉ nằm ở nhóm ưu tiên đầu tiên mà nó thỏa. Nhóm quá hạn xếp hạn cũ nhất trước; nhóm hạn hôm nay xếp hạn gần nhất trước; việc thiếu hạn nhưng có buổi làm hôm nay xếp buổi làm sớm nhất trước. Khi mốc bằng nhau xét mức quan trọng, sau đó giữ thứ tự ổn định. Người dùng có thể đổi thứ tự mặc định. | SRC-07, Q09, Q25 |
| TASK-12 | Mức quan trọng gồm Cao, Vừa và Thấp. Đổi mức giữ nguyên hạn và lịch làm. Chủ việc cá nhân sửa mức của việc mình. Quyền sửa việc được giao theo TASK-04. | SRC-07, Q08 |

Chi tiết thứ tự ổn định khi mọi khóa bằng nhau và trường hợp việc không có hạn hoặc buổi làm vẫn ở [R-01](../../review/unresolved.md). Quyền checklist theo TASK-15; các chi tiết lịch sử mở lại ngoài người/thời điểm đã chốt ở TASK-09 và hình thức lịch sử theo [R-12](../../review/unresolved.md). Xem [ma trận quyền](permission-matrix.md) cho hành động và phạm vi.
