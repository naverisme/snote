# Các điểm chưa chốt — SNOTE v2

Mã R giữ dấu vết từ mốc PR #10 và bổ sung những điều kiện cần cho bộ tài liệu. Các phương án trả lời nằm trong [phiếu duyệt gộp](decision-batch.md). Xem [hồ sơ nguồn](provenance.md) để đối chiếu phần đã chốt.

| Mã | Chủ đề cần quyết định | Phần tài liệu phụ thuộc |
| --- | --- | --- |
| R-01 | Khóa phá hòa kỹ thuật khi cùng mốc và cùng mức quan trọng; vị trí việc không có hạn hay buổi làm trong “Việc tiếp theo”. Quy tắc nhóm ưu tiên, thời gian và múi giờ đã chốt tại TASK-10, TASK-11. | Công việc, truy vấn và nghiệm thu biên |
| R-02 | Ma trận quyền theo hành động/trường, tổ hợp vai trò đồng thời, quyền được cấp thêm chi tiết và thao tác thay trưởng nhóm. Quyền mặc định và thời điểm dừng quyền theo tư cách đã chốt ở PER-01 đến PER-08. | Quyền, UX theo vai trò và hợp đồng thực thi |
| R-04 | Thu hồi riêng một bản nộp, giới hạn tệp và xử lý tệp đã lưu khi ghi dữ liệu phiên bản thất bại. Xung đột phiên bản và lỗi tải thiếu đã chốt tại ASG-12. | Luồng phiên bản, hợp đồng và kiểm chứng |
| R-05 | Q32 đã chốt khung workspace và màn Công việc/Gantt; Q33 đã chốt lối lớp ngang cấp bộ chọn workspace và vùng tính năng đổi theo ngữ cảnh. Còn kiểu lối chọn lớp/nhiều lớp, tên và số mục tính năng lớp, bố trí/hành vi chi tiết cho Lịch trình, Thư viện, Lớp học, bài giao, trạng thái Mục lưu ý khi mở lớp; thông số chuyển động và hình ảnh cụ thể của Gantt nếu cần thiết kế bổ sung. | Wireframe và đặc tả UX cho các màn còn lại |
| R-06 | Ranh giới module, cách lưu dữ liệu, công nghệ, giao tiếp, lỗi, phân trang, đồng bộ và thiết kế triển khai. | `architecture/` và `contracts/` |
| R-07 | Định dạng và hạn mức tệp, định dạng văn bản, khả năng đổi workspace mặc định của Hộp thu, lưu toàn văn trang được liên kết và nhận chia sẻ từ ứng dụng khác. Yêu cầu nội dung theo loại, tiêu đề/thư mục tùy chọn khi lưu nhanh đã chốt tại LIB-05. | Thư viện, Hộp thu và hợp đồng lưu trữ |
| R-08 | Ranh giới phát hành từng tính năng, nghiệm thu đầy đủ, mục tiêu chất lượng, môi trường, mốc và phạm vi sở hữu tệp. | `quality/`, `operations/` và cổng giao việc |
| R-09 | Mẫu bài giao, so sánh nhiều nhóm, nhắc hạn và hành vi chi tiết khi lớp lưu trữ. | Phạm vi sản phẩm và UX giáo viên |
| R-11 | Đặc tả và cài đặt sự kiện lặp, quyền sửa chi tiết theo loại sự kiện. Múi giờ, trùng giờ và cập nhật sự kiện đã gửi theo Q27, Q31. | Lịch và ca biên |
| R-12 | Quyền checklist theo từng mục và lịch sử thay đổi mục; việc chờ phân công và người duyệt đổi người đã chốt tại TASK-02, TASK-13. | Công việc, quyền và phiên bản thay đổi |
| R-14 | Khi người tạo workspace độc lập muốn rời, chuyển quyền quản lý hoặc xóa workspace, ai được nhận và điều kiện nào áp dụng? Q22 mới chốt người tạo quản lý thành viên và cấp quyền; workspace cá nhân mặc định không chia sẻ theo ACC-06. | Vòng đời workspace độc lập và quyền |
| R-15 | Ràng buộc chọn công nghệ, đối tượng dùng hợp đồng và quy mô dự kiến. | Thiết kế, hợp đồng và tiêu chí chất lượng |
| R-16 | Bổ sung ca nghiệm thu và mục tiêu chất lượng cần đo; 12 ca nền Q36 đã duyệt. | `quality/` |
| R-17 | Thử nghiệm riêng hay phát hành rộng, môi trường và mục tiêu sao lưu/phục hồi. | `operations/` |

Nguồn lịch sử và khác biệt với tài liệu cũ được ghi tại [hồ sơ nguồn](provenance.md). Quyết định đã chốt được tra tại [chỉ mục docs](../docs/README.md).

## Mã đã đóng ở Q22–Q31

| Mã | Quy tắc đã xác nhận |
| --- | --- |
| R-03 | Người cập nhật tiến độ và quyền đọc của giáo viên, nhóm nhận bài, quyền liên nhóm: [ASG-11](../docs/requirements/assignments-and-submissions.md). |
| R-10 | Quyền sau rời lớp, người nhận bàn giao và khôi phục lớp lưu trữ: [CLS-12](../docs/requirements/class-membership.md). |
| R-13 | Lời mời cũ, yêu cầu chờ và giảm giới hạn nhóm: [CLS-11](../docs/requirements/class-membership.md). |
