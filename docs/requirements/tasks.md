# Công việc, hạn và lịch làm riêng

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định việc thuộc phạm vi nào, cách giao việc, hạn và thứ tự theo dõi |
| Phạm vi | Công việc cá nhân và công việc được giao trong workspace |
| Kiểm định | DCA-checked cho quy tắc công việc và thời gian |
| Bằng chứng duyệt | [SRC-03, SRC-04, SRC-07, SRC-10 và Q06 đến Q10](../../review/provenance.md) |

## Phạm vi và người phụ trách

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| TASK-01 | “Việc của tôi” tổng hợp việc cá nhân và việc được giao từ mọi workspace còn quyền truy cập. Màn Công việc của workspace chỉ lấy việc thuộc workspace đang mở. | SRC-03 |
| TASK-02 | Mỗi việc có một người phụ trách chính. Khi nhiều người cùng làm, có thể chia thành các việc riêng hoặc dùng checklist cho việc chung. | Q06 |
| TASK-03 | Giao việc cho một thành viên có hiệu lực ngay và người nhận được thông báo. Người nhận có thể yêu cầu đổi người phụ trách. | Q07 |
| TASK-04 | Người giao hoặc người có quyền quản lý việc được giao sửa hạn và mức quan trọng. Người nhận cập nhật checklist, trạng thái và lịch làm riêng. Quyền sửa việc chung của lớp trưởng áp dụng theo PER-02. Mỗi lần đổi hạn được ghi lịch sử. | SRC-02, Q08 |

## Thời gian và hoàn thành

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| TASK-05 | Việc cá nhân và việc được giao có thể không đặt hạn. Khi giao việc, khoảng được giao để hoàn thành bắt đầu từ thời điểm giao. Nếu đặt hạn, người giao chọn mốc kết thúc. | SRC-04 |
| TASK-06 | “Thời lượng còn lại” đếm ngược đến hạn. Việc quá hạn chưa hoàn thành hiện thời gian đã quá hạn. Hạn chỉ có ngày bắt đầu quá hạn lúc 00:00 ngày kế tiếp theo múi giờ áp dụng cho việc. Với hạn kèm giờ, dùng thời điểm đã đặt. | SRC-04 |
| TASK-07 | Người phụ trách tự đặt buổi làm riêng. Buổi làm sau hạn vẫn lưu và có nhãn “Làm muộn”. Thay đổi lịch làm giữ nguyên hạn của việc. Buổi làm riêng chỉ người sở hữu thấy. | SRC-04, Q08, Q19 |
| TASK-08 | Checklist hiện số mục đã xong và tỷ lệ, ví dụ 3/5 là 60%. Trạng thái hoàn thành thay đổi khi người dùng xác nhận hoàn thành việc. | SRC-04, Q10 |
| TASK-09 | Người phụ trách hoặc người quản lý có thể mở lại việc đã hoàn thành. Lịch sử ghi người mở lại và thời điểm. | Q10 |

## Bộ lọc và thứ tự

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| TASK-10 | Hôm nay hoặc Ngày mai gồm việc có hạn trong ngày tương ứng hoặc có buổi làm riêng trong ngày đó. Một việc thỏa cả hai điều kiện chỉ xuất hiện một lần trong cùng bộ lọc. Việc quá hạn chưa xong có nhãn hoặc bộ lọc riêng. | SRC-07 |
| TASK-11 | Thứ tự mặc định của “Việc tiếp theo” là quá hạn chưa xong, đến hạn hôm nay, rồi có buổi làm hôm nay. Trong từng nhóm xét hạn gần trước, sau đó mức quan trọng. Người dùng có thể đổi thứ tự mặc định. | SRC-07, Q09 |
| TASK-12 | Mức quan trọng gồm Cao, Vừa và Thấp. Đổi mức giữ nguyên hạn và lịch làm. Chủ việc cá nhân sửa mức của việc mình. Quyền sửa việc được giao theo TASK-04. | SRC-07, Q08 |

Các trường hợp xếp hạng trùng, phạm vi múi giờ của ngày lọc và quy trình đổi người phụ trách được theo dõi tại [R-01, R-11 và R-12](../../review/unresolved.md).
