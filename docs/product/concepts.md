# Khái niệm SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Mục đích | Thống nhất đối tượng, bài toán và tên gọi giữa tài liệu nghiệp vụ, giao diện và thiết kế |
| Phạm vi | Khái niệm sản phẩm của `s_note_v2` |
| Kiểm định | DCA-checked theo quyết định về sản phẩm |
| Bằng chứng duyệt | [SRC-01 đến SRC-04, SRC-07 đến SRC-11, SRC-20](../../review/provenance.md) |

SNOTE hướng tới người học, người quản lý công việc cá nhân và giáo viên. Người dùng cần lưu nhanh thông tin để tìm lại, biết việc nào cần làm tiếp và giữ dự án riêng theo từng workspace. Khi cộng tác, nhóm cần thấy rõ người phụ trách, hạn, lịch và tiến độ. Giáo viên cần theo dõi bài giao và kết quả của nhiều nhóm trong lớp. [Nguồn sản phẩm](../../review/provenance.md)

| Khái niệm | Nghĩa trong SNOTE |
| --- | --- |
| Cách dùng tài khoản | Các lựa chọn Người học, Giáo viên và Quản lý cá nhân để điều chỉnh chức năng hiển thị. Quyền trên dữ liệu còn phụ thuộc vai trò tại lớp hoặc workspace cụ thể. |
| Workspace | Không gian làm việc có Công việc, Lịch và Thư viện. Một người có thể dùng nhiều workspace và mời người khác cộng tác. |
| Workspace cá nhân mặc định | Workspace được tạo khi đăng ký cho mọi tài khoản, không cho thêm thành viên hoặc chia sẻ quyền truy cập. Hộp thu có đích lưu tại đây. Muốn cộng tác, người dùng tạo workspace khác. |
| Lớp | Cấp trên các workspace nhóm thuộc lớp. Giáo viên chủ lớp tổ chức người học, bài giao và các nhóm. |
| Member (thành viên lớp) | Vai trò ban đầu của người học khi tư cách tham gia lớp có hiệu lực. Giáo viên có thể chọn vai trò khác cho người đó trong bảng thành viên; quyền của vai trò được cấu hình ở Cài đặt lớp. |
| Nhóm trong lớp | Tên gọi của workspace thuộc lớp. Nhóm và workspace dùng chung khái niệm không gian làm việc. |
| Lớp trưởng | Vai trò trong lớp, có quyền mặc định và quyền do giáo viên cấu hình. |
| Trưởng nhóm | Người quản lý chính của workspace nhóm, trong phạm vi nhóm đó. |
| Thư viện | Nơi lưu văn bản hoặc ghi chú, đường dẫn và tệp, có thư mục để phân loại. |
| Hộp thu | Phần riêng tư của Thư viện trong workspace cá nhân mặc định, nhận mục lưu nhanh. |
| Việc của tôi | Phạm vi tổng hợp việc cá nhân và việc được giao từ các workspace người dùng còn quyền truy cập. |
| Lịch của tôi | Phạm vi tổng hợp lịch liên quan đến người dùng xuyên workspace. |

Quy tắc theo các khái niệm trên được ghi theo chủ đề ở [yêu cầu nghiệp vụ](../requirements/README.md). Phạm vi phát hành được tách riêng tại [phạm vi bản đầu](first-release.md).
