# Q33-B — Đề xuất màn Thư viện

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Bản rà soát, chưa được chủ sản phẩm duyệt; không dùng làm yêu cầu coding |
| Phạm vi | Thư viện của workspace cá nhân mặc định, workspace cộng tác và nhóm trong lớp |
| Quy tắc nguồn | [LIB-01 đến LIB-05](../../docs/requirements/library.md), [ACC-06](../../docs/requirements/accounts-and-workspaces.md), [PER-01, PER-02, PER-07](../../docs/requirements/permissions.md), [Q32](../../docs/ux/workspace-gantt.md) |

Thư viện là **một mục ngang cấp** với Công việc và Lịch trình trong workspace. Hộp thu là một phần của Thư viện **chỉ trong workspace cá nhân mặc định**. Khi xem Thư viện, vùng chính không hiển thị Gantt hoặc lưới lịch; thanh bên “Mục lưu ý” của workspace vẫn thuộc khung Q32.

| Mã | Cấp, vị trí, thành phần cùng nhóm | Số lượng, loại đề xuất | Hành động hoặc thông tin hiển thị | Nguồn/ràng buộc |
| --- | --- | --- | --- | --- |
| LUX-01 | Đầu vùng Thư viện, thuộc workspace đang mở | 1 tiêu đề “Thư viện · [workspace]” và 1 nhãn phạm vi cá nhân/chung | Cho biết nơi nội dung mới sẽ lưu và ai có thể thấy; không tự đổi đích lưu. | LIB-02/03 |
| LUX-02 | Thanh thư mục, chỉ ở workspace cá nhân mặc định | 1 mục Hộp thu | Bấm để xem mục lưu nhanh chưa phân loại, riêng cho chủ tài khoản. Không xuất hiện ở workspace nhóm. | LIB-02, ACC-06 |
| LUX-03 | Cột trái trong vùng Thư viện, cùng cấp với danh sách thư mục | 1 mục Tất cả và 1 cây thư mục có số nhánh theo dữ liệu | Chọn thư mục để đổi tập mục ở vùng chính. Tạo/đổi tên/xóa thư mục là thao tác cần duyệt riêng. | LIB-01; thao tác quản trị thư mục chưa được chốt |
| LUX-04 | Đầu Thư viện, cạnh tiêu đề | 1 nút Lưu nhanh | Mở lựa chọn Văn bản, Đường dẫn hoặc Tệp. Nếu chọn lưu nhanh vào Hộp thu, tiêu đề và thư mục tùy chọn. | LIB-01/02/05, Q20 |
| LUX-05 | Thanh trên danh sách mục | 1 ô Tìm, 1 điều khiển Lọc loại, 1 điều khiển Sắp xếp | Thu hẹp theo văn bản/đường dẫn/tệp và sắp tập mục trong workspace/thư mục hiện tại. Tìm theo nội dung toàn văn chưa được chốt. | Đề xuất UX; R-07 |
| LUX-06 | Vùng chính | 1 danh sách mục; số hàng theo dữ liệu | Mỗi hàng hiện biểu tượng loại, tên/đại diện nội dung và thư mục; bấm mở một mục. Không tự trộn mục của workspace khác. | LIB-01/03 |
| LUX-07 | Bên phải danh sách trên máy tính, màn riêng trên điện thoại | 1 vùng chi tiết khi chọn mục | Xem nội dung văn bản, URL hoặc thông tin tệp. Tải tệp theo quyền; mở URL khi người dùng chọn. | LIB-01, quyền theo workspace |
| LUX-08 | Trong vùng chi tiết, theo quyền | 1 nhóm hành động của một mục | Chỉnh nội dung/phân loại nếu có quyền; riêng thao tác **Sao chép sang workspace** giữ bản nguồn và tạo bản đích theo quyền đích. Không gọi đây là chuyển/xóa bản nguồn. | LIB-04; quyền sửa/xóa cụ thể còn R-02 |
| LUX-09 | Khi tạo hoặc sửa mục | 1 biểu mẫu theo loại Văn bản/Đường dẫn/Tệp | Bắt buộc có nội dung đúng loại; tiêu đề, thư mục tùy chọn trong luồng lưu nhanh. Tệp lỗi không tạo mục hoàn chỉnh; giới hạn loại/dung lượng chưa đặt. | LIB-05, R-07 |

## Trạng thái và màn nhỏ

| Trạng thái | Phương án đề xuất |
| --- | --- |
| Đang tải | Giữ tên workspace và thanh thư mục, tải trong vùng danh sách/chi tiết. |
| Hộp thu rỗng | Hiện lối Lưu nhanh cho chủ tài khoản. |
| Thư mục rỗng hoặc không có kết quả tìm | Nêu rõ tình huống và có lối đổi thư mục/bỏ lọc. |
| Lỗi tải tệp | Mục dở không xuất hiện như tệp hoàn chỉnh; báo lỗi ở biểu mẫu. |
| Hết quyền workspace | Không hiển thị nội dung đã tải cũ, có lối về workspace hợp lệ. |
| Điện thoại | Danh sách thư mục mở trong một bảng chọn; bấm một mục mở chi tiết màn riêng. Ba mục workspace và cụm chuyển workspace theo Q32. |

## Điểm cần duyệt

1. LUX-03: thư mục nên hiện như **cây** bên trái trên máy tính và bảng chọn trên điện thoại? Ai được tạo/đổi tên/xóa thư mục chung?
2. LUX-04: nút Lưu nhanh trong Thư viện của workspace nhóm có lưu thẳng vào nhóm (mặc định là nội dung chung), còn Hộp thu riêng chỉ có ở workspace cá nhân mặc định? Đề xuất giữ đúng như vậy.
3. LUX-05: bản đầu tìm theo tiêu đề/URL và văn bản do người dùng nhập; việc tìm trong nội dung tệp và lưu toàn văn trang web để sau. Có phù hợp không?
4. LUX-08: thao tác sao chép từ cá nhân sang nhóm nên ở chi tiết mục; chọn workspace đích từ danh sách các workspace còn quyền. Chưa đề xuất chia sẻ bằng đường dẫn công khai.

Loại tệp, hạn mức và định dạng ghi chú vẫn theo [R-07](../../review/unresolved.md); không suy ra từ bố trí màn.
