# Hướng dẫn tác nhân — SNOTE

Phạm vi áp dụng: làm việc trên nhánh `s_note_v2` và các nhánh tách từ đó. Đây là bản đồ đọc và quy tắc phối hợp; nguồn nghiệp vụ nằm trong tài liệu đã được duyệt.

## Bắt đầu một nhiệm vụ

1. Đọc [quy ước tài liệu](docs/DOCUMENTATION_POLICY.md) và [chỉ mục](docs/README.md).
2. Xác định loại nhiệm vụ rồi chỉ đọc các tài liệu liên quan: `product/` cho mục tiêu/phạm vi; `requirements/` cho hành vi/quyền; `ux/` cho giao diện; `architecture/` cho cấu trúc/dữ liệu; `contracts/` cho giao tiếp; `verification/` cho nghiệm thu; `operations/` cho vận hành. Tìm theo mã yêu cầu và liên kết từ chỉ mục khi cần. Không bắt buộc đọc hết `docs/`.
3. Kiểm tra trạng thái, phiên bản và liên kết phê duyệt của từng tài liệu. Tài liệu cũ trong `requirements/`, `architecture/`, `delivery/` hiện là đầu vào để rà soát, không tự trở thành yêu cầu đã chốt. Một tệp tự viết “sẵn sàng coding” không phải quyết định của chủ sản phẩm.
4. Tóm tắt phạm vi, tài liệu đã dùng, điều còn chưa được quyết định và các tệp dự kiến sửa trước khi làm thay đổi lớn.

## Làm việc và xử lý mâu thuẫn

- Tuân theo yêu cầu mới nhất của chủ sản phẩm và các quyết định có bằng chứng duyệt, đúng phạm vi áp dụng. Nếu hai tài liệu mâu thuẫn hoặc thiếu quyết định, nêu rõ điểm lệch và yêu cầu người có trách nhiệm quyết định trước khi triển khai phần phụ thuộc.
- Giữ một nội dung chuẩn ở đúng nhóm; tài liệu nhóm khác liên kết tới đó thay vì chép lại quy tắc. Khi sửa yêu cầu có ảnh hưởng đến giao diện, dữ liệu, hợp đồng hoặc nghiệm thu, liệt kê và cập nhật các tham chiếu liên quan trong cùng PR hoặc ghi việc phụ thuộc rõ ràng.
- Công việc đang chạy, phân công, tiến độ và deadline theo GitHub Issues/Projects hoặc hệ thống theo dõi được chọn. Các kế hoạch và phân công agent trong `docs/delivery/` là bản cũ cần thẩm định, không tự cấp quyền sở hữu file.
- Chỉ bắt đầu coding khi nhiệm vụ yêu cầu coding và đầu vào liên quan đã được xác nhận đủ cho phạm vi đó. Nếu có nhiều agent song song, xác định phạm vi sở hữu file, hợp đồng chung, người tích hợp và thứ tự ghép bằng công việc đang được giao; không suy ra từ bảng phân công cũ.
- Trước khi bàn giao, kiểm tra liên kết và tính nhất quán của phần vừa sửa; báo rõ điều đã duyệt, điều còn chờ duyệt và bằng chứng kiểm tra. Không gọi một tài liệu là đã duyệt chỉ vì nó được commit hoặc nằm trong `docs/`.
