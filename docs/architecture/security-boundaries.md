# Ranh giới quyền, phiên và nội dung ngoài

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Thiết kế kiểm quyền v2 theo [SRC-27](../../review/provenance.md) và [ma trận nghiệp vụ](../requirements/permission-matrix.md) |

Mỗi request nhận principal đã xác thực; máy chủ tải quyền hiện hành theo đối tượng và hành động. Quyền hợp theo tư cách còn hiệu lực **trong đúng scope**, rồi giới hạn bởi nội dung riêng, lưu trữ, bàn giao, hạn và cài đặt bài. Chọn usage Giáo viên chỉ mở tạo lớp mới, không thay quyền trên lớp khác; tắt usage không bỏ quyền chủ lớp đã tạo. Thu hồi ngừng thao tác tiếp theo, lịch sử cũ không sửa lại. Kiểm lại tại lúc hoàn tất upload/Nộp, không chỉ lúc mở form.

| Đường truy cập | Rào chắn bắt buộc |
| --- | --- |
| API xem/tìm/đếm | Lọc scope và quyền trước phân trang, sắp xếp, tổng hợp; không lộ tiêu đề, số đếm hoặc trạng thái riêng của người khác |
| API sửa/xóa/hủy | Kiểm action riêng, owner/creator không thay điều kiện tư cách và archive; client ẩn nút chỉ để dễ dùng |
| Tệp | Chỉ cấp đường tải ngắn hạn sau kiểm quyền trên item/revision/submission; mã Blob và URL cũ không tự cấp quyền; đặt giới hạn thời gian của đường tải |
| Thông báo/nhắc | Chỉ đưa thông tin tối thiểu trong thông báo, kiểm quyền lại lúc mở đích và trạng thái lúc nhắc; hủy sự kiện ngừng nhắc chưa phát |
| Xem trước URL | Chỉ HTTP(S) tới đích công khai, kiểm địa chỉ kết nối và từng redirect kể cả ảnh, chặn mạng riêng/loopback, giới hạn dung lượng/thời gian/số chuyển hướng, không gửi cookie/credential người dùng |
| Phiên đăng nhập | Cookie an toàn cho web, phiên ngắn hạn có cơ chế làm mới/thu hồi, chống yêu cầu giả mạo và giới hạn nhịp thử đăng nhập; mật khẩu băm có salt bằng thư viện phù hợp được chọn khi triển khai |

Lưu audit gồm người thao tác, scope, action, thời điểm và kết quả cho đổi quyền, chuyển chủ, giao lại, nộp, đổi hạn và hủy. Không đưa mật khẩu, token, nội dung ghi chú riêng hay bytes tệp vào log ứng dụng. Quyền teacher tự khai không được mô tả là danh tính giáo viên đã xác minh.
