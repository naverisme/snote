# Phạm vi bản đầu

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định các luồng chính mà thiết kế v2 phải phục vụ |
| Phạm vi | Bản phát hành đầu của SNOTE v2 |
| Kiểm định | DCA-checked ở mức chức năng và ranh giới sản phẩm |
| Bằng chứng duyệt | [SRC-07 đến SRC-10, SRC-25/26, J1–J11, Q02, Q16, Q18 đến Q20, I1–I13](../../review/provenance.md) |

| Phần | Phạm vi đã chốt | Tài liệu chi tiết |
| --- | --- | --- |
| Tài khoản và cá nhân | Chọn cách dùng khi đăng ký, có workspace cá nhân, Công việc, Lịch và Thư viện. Giáo viên tạo lớp khi có nhu cầu. | [Tài khoản và workspace](../requirements/accounts-and-workspaces.md) |
| Cộng tác workspace | Tách không gian theo công việc, thêm thành viên, giao việc và theo dõi nội dung chung theo quyền. | [Công việc](../requirements/tasks.md) và [quyền](../requirements/permissions.md) |
| Vòng đời workspace | Chuyển chủ/rời/lưu trữ workspace độc lập; nhóm ở trong lớp. Bản đầu không có nút xóa vĩnh viễn workspace độc lập. | [Workspace](../requirements/accounts-and-workspaces.md) và [nhóm](../requirements/class-membership.md) |
| Thư viện và tệp | Văn bản có danh sách tự động, URL xem trước, bản sao độc lập, ghi đè có lịch sử hoặc tạo bản sao, Thùng rác 30 ngày. Loại tệp và hạn mức thử nghiệm theo LIB-11; cách tính, lịch sử và nguồn xem trước theo LIB-16–18. | [Thư viện](../requirements/library.md) |
| Lớp và bài giao | Tạo lớp, tham gia, lập nhóm và giao bài cơ bản. Theo dõi tiến độ và phản hồi theo phiên bản nộp bằng nhận xét. | [Lớp và nhóm](../requirements/class-membership.md) và [bài giao](../requirements/assignments-and-submissions.md) |
| Lịch | Có sự kiện có giờ và cả ngày; hủy sự kiện chung giữ dấu vết theo quyền. Bản đầu không có sự kiện lặp. | [Lịch](../requirements/calendar.md) |
| Cách xem công việc | Gantt mặc định và Danh sách cùng cấp. Sửa việc qua màn chi tiết trong bản đầu. | [Chế độ xem việc](../ux/task-views.md) |
| Nền tảng | Web trên máy tính và điện thoại. Lưu nhanh từ giao diện web. | [Điều hướng](../ux/validated-navigation.md) |

**Ranh giới đã duyệt.** Bản đầu dùng nhận xét theo phiên bản. Điểm số và thang điểm ở ngoài phạm vi bản đầu. Không có nút Thu hồi bản nộp; sửa bằng phiên bản mới theo ASG-18. Sự kiện lặp ở ngoài phạm vi bản đầu theo CAL-10. Giáo viên chủ lớp ủy quyền từng chức năng, vai trò đồng giáo viên riêng ở ngoài phạm vi bản đầu. Tích hợp nhận chia sẻ trực tiếp từ ứng dụng khác được tách thành phần đặc tả sau. [Q02, Q16, Q19, Q20](../../review/provenance.md)

Độ chi tiết của từng màn, mốc phát hành và các tính năng đề xuất tiếp theo nằm trong [hồ sơ rà soát](../../review/unresolved.md).
