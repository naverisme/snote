# Q33-B — Đề xuất màn Thư viện

| Trường | Giá trị |
| --- | --- |
| Trạng thái | B1–B3, E7 và F8 đã chuyển vào [đặc tả được duyệt](../../docs/ux/library-q33.md) và [LIB-06/07](../../docs/requirements/library.md); các chi tiết khác còn đề xuất |
| Phạm vi | Thư viện của workspace cá nhân mặc định, workspace cộng tác và nhóm trong lớp |
| Quy tắc nguồn | [LIB-01 đến LIB-05](../../docs/requirements/library.md), [ACC-06](../../docs/requirements/accounts-and-workspaces.md), [PER-01, PER-02, PER-07](../../docs/requirements/permissions.md), [Q32](../../docs/ux/workspace-gantt.md) |

Thư viện là **một mục ngang cấp** với Công việc và Lịch trình trong workspace. Hộp thu là một phần của Thư viện **chỉ trong workspace cá nhân mặc định**. Khi xem Thư viện, vùng chính không hiển thị Gantt hoặc lưới lịch; thanh bên “Mục lưu ý” của workspace vẫn thuộc khung Q32.

| Mã | Cấp, vị trí, thành phần cùng nhóm | Số lượng, loại đề xuất | Hành động hoặc thông tin hiển thị | Nguồn/ràng buộc |
| --- | --- | --- | --- | --- |
| LUX-01 | Đầu vùng Thư viện, thuộc workspace đang mở | 1 tiêu đề “Thư viện · [workspace]” và 1 nhãn phạm vi cá nhân/chung | Cho biết nơi nội dung mới sẽ lưu và ai có thể thấy; không tự đổi đích lưu. | LIB-02/03 |
| LUX-02 | Thanh thư mục, chỉ ở workspace cá nhân mặc định | 1 mục Hộp thu | Bấm để xem mục lưu nhanh chưa phân loại, riêng cho chủ tài khoản. Không xuất hiện ở workspace nhóm. | LIB-02, ACC-06 |
| LUX-03 | Cột trái trong vùng Thư viện, cùng cấp với danh sách thư mục | 1 mục Tất cả và 1 cây thư mục có số nhánh theo dữ liệu | Chọn thư mục để đổi tập mục ở vùng chính. Quyền tạo/đổi tên/xóa thư mục đã chốt ở LIB-06; kiểu mục Tất cả vẫn đề xuất. | LIB-01/06 |
| LUX-04 | Đầu Thư viện; vị trí chính xác cạnh tiêu đề còn đề xuất | 1 nút Lưu nhanh | Mở lựa chọn Văn bản, Đường dẫn hoặc Tệp. Hộp thu chỉ trong workspace cá nhân mặc định; trong nhóm lưu nội dung chung theo quyền. | B2, LIB-01/02/03/05 |
| LUX-05 | Thanh trên danh sách mục | 1 ô Tìm đã chốt; điều khiển Lọc loại và Sắp xếp còn đề xuất | Tìm tiêu đề/URL/văn bản do người dùng nhập; chưa tìm nội dung tệp. Cách lọc loại và sắp xếp chưa được duyệt. | Q33-B2; R-05/R-07 |
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

## Điểm còn mở

B1–B3, E7 và F8 đã chốt bố cục, lưu nhanh/tìm, quyền thư mục và chỉ xóa thư mục khi không có mục lẫn thư mục con. Chưa chốt mục “Tất cả”, điều khiển Lọc/Sắp xếp, vị trí Sao chép ở chi tiết mục và giới hạn tệp. LIB-04 chỉ chốt hành vi sao chép giữ bản nguồn, không quyết định vị trí nút.

Loại tệp, hạn mức và định dạng ghi chú vẫn theo [R-07](../../review/unresolved.md); không suy ra từ bố trí màn.
