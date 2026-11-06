# Màn Bài giao, theo dõi và Nộp — Q33-D

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Bài giao trong lớp, nhóm nhận bài, phiên bản nộp và cài đặt hạn |
| Trạng thái | D1–D2 được chủ sản phẩm chốt; thành phần khác còn ở [phiếu rà soát](../../review/blocked/ux-q33-assignments.md) |
| Nguồn | [SRC-19](../../review/provenance.md), [ASG-01–15](../requirements/assignments-and-submissions.md), [NAV-08](validated-navigation.md) |

| Mã | Cấp, vị trí | Số lượng, loại | Hành vi đã chốt |
| --- | --- | --- | --- |
| CUXD-01 | Biểu mẫu tạo bài trong tính năng Bài giao của lớp | 1 trường tiêu đề và 1 bộ chọn nhóm nhận **bắt buộc**; 1 vùng mô tả và 1 trường hạn **tùy chọn** | Chỉ tạo khi có tiêu đề và ít nhất một nhóm nhận; giáo viên có quyền giao bài cho cả lớp hoặc nhóm chọn. [ASG-01/13](../requirements/assignments-and-submissions.md) |
| CUXD-02 | Cùng biểu mẫu, nhóm cài đặt sau hạn | 2 điều khiển độc lập: “Nộp lần đầu sau hạn” và “Sửa bản đã nộp sau hạn”; mỗi điều khiển chọn Kế thừa lớp/Cho phép/Khóa | Giá trị tường minh trên bài ưu tiên giá trị lớp cho đúng hành động ấy; khi kế thừa dùng giá trị lớp. [ASG-05/06/15](../requirements/assignments-and-submissions.md) |
| CUXD-03 | Màn theo dõi của giáo viên | 1 bảng, mỗi nhóm nhận bài 1 hàng, ba nguồn tiến độ tách riêng | Hiện số việc xong/tổng việc, tiến độ checklist và cập nhật văn bản của nhóm; chọn nhóm mới xem phiên bản và nhận xét của nhóm đó. Không tự tính tỷ lệ nhóm từ ba nguồn. [ASG-02/11](../requirements/assignments-and-submissions.md) |
| CUXD-04 | Biểu mẫu Nộp hoặc Sửa bản nộp của người có quyền trong nhóm | Nội dung có thể gồm văn bản, đường dẫn, tệp; tối thiểu 1 loại có giá trị | Không tạo phiên bản mới khi cả ba trống hoặc tệp chưa đủ; khi lỗi/xung đột giữ bản đã ghi và áp dụng [ASG-12/14](../requirements/assignments-and-submissions.md). |

Quyền Nộp, khóa/mở sau hạn, lịch sử và nhận xét theo phiên bản tra ở [yêu cầu bài giao](../requirements/assignments-and-submissions.md). Vị trí danh sách phiên bản, trạng thái chi tiết theo vai trò, cách thu hồi một bản, giới hạn tệp và mẫu bài đầy đủ còn ở [R-04/R-05/R-07/R-09](../../review/unresolved.md).
