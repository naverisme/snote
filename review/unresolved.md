# Các điểm chưa chốt — SNOTE v2

Mã R giữ dấu vết từ mốc PR #10 và bổ sung những điều kiện cần cho bộ tài liệu. Quyết định đã chốt nằm trong [phiếu duyệt gộp](decision-batch.md); các tình huống, rủi ro và khuyến nghị mới nằm trong [hồ sơ 24 ca](edge-case-audit.md) và [đề xuất toàn vẹn dữ liệu](blocked/data-integrity-proposal.md). Xem [hồ sơ nguồn](provenance.md) để đối chiếu phần đã chốt.

| Mã | Chủ đề cần quyết định | Phần tài liệu phụ thuộc |
| --- | --- | --- |
| R-01 | Khóa phá hòa của ba nhóm TASK-11, vị trí việc có mốc tương lai/buổi làm đã qua và việc hoàn thành. J10 đã chốt nhóm Chưa lên lịch cùng thứ tự riêng tại TASK-17; không hỏi lại phần đó. Đề xuất [EC-16](edge-case-audit.md). | Công việc, truy vấn và nghiệm thu biên |
| R-02 | H1–H10 và J9/J11 đã chốt quyền theo [ma trận](../docs/requirements/permission-matrix.md), gồm Hủy sự kiện và giao lại checklist. Còn từng ô Cài đặt G4, quyền xóa vĩnh viễn sự kiện chung, ngoại lệ theo trường và chuyển trưởng nhóm. Ca bàn giao/lưu trữ ở EC-10–12; hình thức G4 vẫn tạm duyệt. | Ma trận quyền còn thiếu, UX theo vai trò và hợp đồng thực thi |
| R-04 | J4–J6 đã chốt tệp nộp/đề bài, lỗi ghi phiên bản và không có nút Thu hồi trong bản đầu tại ASG-16–18. Còn thời điểm chấp nhận nộp sát hạn, mất phản hồi sau khi ghi thành công, chống gửi trùng, quyền thay đổi giữa chừng và phối hợp lưu tệp/metadata. Đề xuất [EC-05–07](edge-case-audit.md). | Luồng phiên bản, hợp đồng và kiểm chứng |
| R-05 | Q32, Q33 C–F và Thư viện I đã chốt trong phạm vi [chỉ mục UX](../docs/ux/README.md). G1–G12 vẫn **tạm duyệt**; J7 chốt nghiệp vụ cả ngày nhưng chưa chốt điều khiển G6. Còn biểu tượng, lọc/bảng, ô quyền, trạng thái biên và ngưỡng chuyển động. Xem EC-14/20/21. | Wireframe và đặc tả UX cho các phần chưa khóa |
| R-06 | Ranh giới module, cách lưu dữ liệu, công nghệ, giao tiếp, lỗi, phân trang, đồng bộ và thiết kế triển khai. | `architecture/` và `contracts/` |
| R-07 | J1–J3 chốt cách tính quota, giữ lịch sử và lấy thẻ URL đầu tại LIB-16–18. Còn ngân sách vật lý, ngưỡng cảnh báo, đơn vị MB/GB, định danh nội dung trùng, hợp đồng metadata, khôi phục khi đầy, nhận chia sẻ từ ứng dụng khác và hạn mức chính thức. Lịch sử không có trần vật lý là rủi ro EC-01; tham chiếu/dọn rác và lỗi đồng thời ở EC-02–04/08/19/20/22. | Hợp đồng lưu trữ và quy tắc còn thiếu của Thư viện |
| R-08 | Ranh giới phát hành từng tính năng, nghiệm thu đầy đủ, mục tiêu chất lượng, môi trường, mốc và phạm vi sở hữu tệp. | `quality/`, `operations/` và cổng giao việc |
| R-09 | Mẫu bài giao ngoài ASG-13, so sánh nhiều nhóm ngoài bảng ba nguồn và nhắc hạn. Lớp/nhóm lưu trữ chỉ đọc theo CLS-14/16. Còn khôi phục nhóm gây vượt giới hạn và bàn giao/rời khi lưu trữ theo EC-11/12; không tự dùng ngoại lệ giảm giới hạn CLS-11 cho khôi phục. | Phạm vi sản phẩm và UX giáo viên |
| R-11 | J7–J9 đã chốt sự kiện cả ngày, không có lặp ở bản đầu và quyền Hủy/sửa/xóa sự kiện riêng. Còn nguồn múi giờ của từng phạm vi, biên khoảng ngày, đổi loại sự kiện và thể hiện UX. Đề xuất EC-13/14; trạng thái hủy trên nhiều lịch/nhắc theo EC-24. | Lịch và ca biên |
| R-12 | H5/J11 chốt quyền checklist, lưu người/thời điểm và chuyển quyền khi giao lại tại TASK-15/16. Còn cách hiện lịch sử, checklist 0 mục/đổi sau hoàn thành và vòng đời buổi làm riêng của người cũ; đề xuất EC-17/18. Không tự chuyển lịch riêng sang người nhận mới. | Công việc, quyền và lịch sử |
| R-15 | Ràng buộc chọn công nghệ, đối tượng dùng hợp đồng và quy mô dự kiến. | Thiết kế, hợp đồng và tiêu chí chất lượng |
| R-16 | Bổ sung ca nghiệm thu và mục tiêu đo. Q36 duyệt 12 ca nền; [24 ca phân tích EC](edge-case-audit.md) mới là đề xuất có kết quả quan sát mong đợi, chưa phải ca đã duyệt hoặc kết quả kiểm thử. | `quality/` |
| R-17 | Đối tượng thử nghiệm/phát hành, môi trường và mục tiêu sao lưu/phục hồi. EC-01/22 nêu rủi ro ngân sách vật lý và khôi phục lệch metadata/tệp; chưa chốt nhà cung cấp, RPO/RTO hoặc ngưỡng cụ thể. | `operations/` |

Nguồn lịch sử và khác biệt với tài liệu cũ được ghi tại [hồ sơ nguồn](provenance.md). Quyết định đã chốt được tra tại [chỉ mục docs](../docs/README.md).

## Mã đã đóng

| Mã | Quy tắc đã xác nhận |
| --- | --- |
| R-03 | Người cập nhật tiến độ và quyền đọc của giáo viên, nhóm nhận bài, quyền liên nhóm: [ASG-11](../docs/requirements/assignments-and-submissions.md). |
| R-10 | Quyền sau rời lớp, người nhận bàn giao và khôi phục lớp lưu trữ: [CLS-12](../docs/requirements/class-membership.md). |
| R-13 | Lời mời cũ, yêu cầu chờ và giảm giới hạn nhóm: [CLS-11](../docs/requirements/class-membership.md). |
| R-14 | Chuyển chủ, tự rời và lưu trữ workspace độc lập; bản đầu không xóa vĩnh viễn: [ACC-08–10](../docs/requirements/accounts-and-workspaces.md). |
