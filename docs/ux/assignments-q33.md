# Màn Bài giao, theo dõi và Nộp — Q33-D

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Bài giao trong lớp, nhóm nhận bài, phiên bản nộp và cài đặt hạn |
| Trạng thái | D1–D2, E8 và F9 được chủ sản phẩm chốt; thành phần khác còn ở [phiếu rà soát](https://github.com/naverisme/snote/blob/49caff82e8b004ca0afc2ab52229c4711fdd9334/review/blocked/ux-q33-assignments.md) |
| Nguồn | [SRC-19, SRC-21/22/26](../../review/provenance.md), [ASG-01–18](../requirements/assignments-and-submissions.md), [NAV-08](workspace-and-tasks.md) |

| Mã | Cấp, vị trí | Số lượng, loại | Hành vi đã chốt |
| --- | --- | --- | --- |
| CUXD-01 | Biểu mẫu tạo bài trong tính năng Bài giao của lớp | 1 trường tiêu đề và 1 bộ chọn nhóm nhận **bắt buộc**; 1 vùng mô tả và 1 trường hạn **tùy chọn** | Chỉ tạo khi có tiêu đề và ít nhất một nhóm nhận; giáo viên có quyền giao bài cho cả lớp hoặc nhóm chọn. [ASG-01/13](../requirements/assignments-and-submissions.md) |
| CUXD-02 | Cùng biểu mẫu, nhóm cài đặt sau hạn | 2 điều khiển độc lập: “Nộp lần đầu sau hạn” và “Sửa bản đã nộp sau hạn”; mỗi điều khiển chọn Kế thừa lớp/Cho phép/Khóa | Giá trị tường minh trên bài ưu tiên giá trị lớp cho đúng hành động ấy; khi kế thừa dùng giá trị lớp. [ASG-05/06/15](../requirements/assignments-and-submissions.md) |
| CUXD-03 | Màn theo dõi của giáo viên | 1 bảng, mỗi nhóm nhận bài 1 hàng, ba nguồn tiến độ tách riêng | Hiện số việc xong/tổng việc, tiến độ checklist và cập nhật văn bản của nhóm; chọn nhóm mới xem phiên bản và nhận xét của nhóm đó. Không tự tính tỷ lệ nhóm từ ba nguồn. [ASG-02/11](../requirements/assignments-and-submissions.md) |
| CUXD-04 | Biểu mẫu Nộp hoặc Sửa bản nộp của người có quyền trong nhóm | Nội dung có thể gồm văn bản, đường dẫn, tệp; tối thiểu 1 loại có giá trị | Không tạo phiên bản mới khi cả ba trống hoặc tệp chưa đủ; khi lỗi/xung đột giữ bản đã ghi và áp dụng [ASG-12/14](../requirements/assignments-and-submissions.md). |
| CUXD-05 | Chi tiết bài giao sau khi chọn nhóm trong bảng giáo viên, hoặc phần nộp của nhóm mình | 1 vùng bản nộp hiện hành trước; 1 lối mở lịch sử phiên bản và nhận xét | Mặc định xem bản hiện hành; chọn nhóm rồi mới mở lịch sử phiên bản và nhận xét đúng nhóm ấy. Không phơi các nhóm khác ngoài quyền. |
| CUXD-06 | Khi bản hiện hành thay đổi trong lúc gửi | 1 trạng thái xung đột với lối xem bản hiện hành | Người gửi phải xem bản hiện hành trước khi quyết định gửi lại; bản đã ghi vẫn nguyên, không tạo phiên bản từ dữ liệu cũ theo [ASG-12](../requirements/assignments-and-submissions.md). |
| CUXD-07 | Khi chọn một phiên bản nộp trong lịch sử | 1 vùng chi tiết của đúng phiên bản đã chọn | Hiện người nộp, thời điểm, trạng thái đúng/muộn, nội dung lúc gửi và nhận xét của giáo viên gắn với phiên bản đó. [ASG-04/08/09](../requirements/assignments-and-submissions.md) |

Quyền Nộp, khóa/mở sau hạn, lịch sử và nhận xét theo phiên bản tra ở [yêu cầu bài giao](../requirements/assignments-and-submissions.md). Giới hạn tệp, lỗi ghi phiên bản và việc không có nút Thu hồi bản nộp ở bản đầu đã chốt tại ASG-16–18. Luồng nộp sát hạn, mất phản hồi và xung đột theo [STR-16](../requirements/structural-rules.md), [hợp đồng](../contracts/README.md) và [trạng thái giao diện](ui-and-motion.md).
