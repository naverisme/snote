# Các điểm chưa chốt — SNOTE v2

Mã R giữ dấu vết từ mốc PR #10 và bổ sung những điều kiện cần cho bộ tài liệu. Các phương án trả lời nằm trong [phiếu duyệt gộp](decision-batch.md). Xem [hồ sơ nguồn](provenance.md) để đối chiếu phần đã chốt.

| Mã | Chủ đề cần quyết định | Phần tài liệu phụ thuộc |
| --- | --- | --- |
| R-01 | Khóa phá hòa kỹ thuật khi cùng mốc và cùng mức quan trọng; vị trí việc không có hạn hay buổi làm trong “Việc tiếp theo”. Quy tắc nhóm ưu tiên, thời gian và múi giờ đã chốt tại TASK-10, TASK-11. | Công việc, truy vấn và nghiệm thu biên |
| R-02 | [H1–H10](../docs/requirements/permission-matrix.md) đã chốt nhiều hành động và cách cộng quyền theo phạm vi. Còn giá trị của **từng ô** trong bảng Cài đặt theo G4, quyền xóa/hủy sự kiện ngoài giáo viên, ngoại lệ theo trường, cách chuyển trưởng nhóm, và một số quyền cấp riêng/chỉnh cấu hình chưa được liệt kê. Hình thức G4 vẫn tạm duyệt ở [phiếu G](blocked/ux-q33-g-provisional.md). | Ma trận quyền còn thiếu, UX theo vai trò và hợp đồng thực thi |
| R-04 | Thu hồi riêng một bản nộp, giới hạn tệp và xử lý tệp đã lưu khi ghi dữ liệu phiên bản thất bại. Xung đột phiên bản và lỗi tải thiếu đã chốt tại ASG-12. | Luồng phiên bản, hợp đồng và kiểm chứng |
| R-05 | Q32 và Q33 C1–C5, A1–A3, B1–B3, D1–D2, E1–E8, F1–F10 đã chốt theo [chỉ mục UX](../docs/ux/README.md). [G1–G12](blocked/ux-q33-g-provisional.md) **chỉ tạm duyệt** để rà thiết kế, chưa là hợp đồng giao coding. Còn biểu tượng mục lớp, chi tiết lọc/bảng, từng ô quyền, sự kiện cả ngày, trạng thái biên, ngưỡng/độ mờ chuyển động và các chi tiết ghi trong phiếu G. | Wireframe và đặc tả UX cho các phần chưa khóa |
| R-06 | Ranh giới module, cách lưu dữ liệu, công nghệ, giao tiếp, lỗi, phân trang, đồng bộ và thiết kế triển khai. | `architecture/` và `contracts/` |
| R-07 | Định dạng và hạn mức tệp, định dạng văn bản, khả năng đổi workspace mặc định của Hộp thu, lưu toàn văn trang được liên kết và nhận chia sẻ từ ứng dụng khác. Nội dung theo loại tại LIB-05; quyền thư mục LIB-06; không xóa thư mục còn mục hoặc thư mục con tại LIB-07; tìm tiêu đề/URL/văn bản nhập trực tiếp tại Q33-B2. | Thư viện, Hộp thu và hợp đồng lưu trữ |
| R-08 | Ranh giới phát hành từng tính năng, nghiệm thu đầy đủ, mục tiêu chất lượng, môi trường, mốc và phạm vi sở hữu tệp. | `quality/`, `operations/` và cổng giao việc |
| R-09 | Mẫu bài giao ngoài trường tối thiểu đã chốt tại ASG-13, hành vi so sánh nhiều nhóm ngoài bảng ba nguồn đã chốt, nhắc hạn và hành vi chi tiết khi lớp lưu trữ. | Phạm vi sản phẩm và UX giáo viên |
| R-11 | Đặc tả/cài đặt sự kiện lặp, sự kiện cả ngày và quyền sửa sự kiện riêng; sửa sự kiện chung và dấu vết hủy đã chốt tại CAL-08. Múi giờ, trùng giờ và cập nhật sự kiện theo Q27, Q31. | Lịch và ca biên |
| R-12 | H5 đã chốt người phụ trách/người quản lý chỉnh từng mục checklist và ghi người/thời điểm tại TASK-15. Còn hình thức lịch sử thay đổi chi tiết, quyền chỉnh mục khi một người giữ nhiều tư cách và quyền khi việc chuyển người phụ trách. | Công việc, quyền và lịch sử |
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
