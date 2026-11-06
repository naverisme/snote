# Màn Thư viện — Q33-B

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Thư viện của workspace cá nhân, cộng tác và nhóm trong lớp |
| Trạng thái | B1–B3, E7 và F8 được chủ sản phẩm chốt; thành phần khác còn ở [phiếu rà soát](../../review/blocked/ux-q33-library.md) |
| Nguồn | [SRC-19, SRC-21/22](../../review/provenance.md), [LIB-01–07](../requirements/library.md), [NAV-04/06](validated-navigation.md) |

| Mã | Cấp, vị trí | Số lượng, loại | Hành vi đã chốt |
| --- | --- | --- | --- |
| CUXB-01 | Vùng chính Thư viện trên máy tính | 3 vùng cạnh nhau: cây thư mục bên trái, danh sách mục ở giữa, chi tiết mục đã chọn bên phải | Chọn thư mục đổi tập mục; chọn một mục mở chi tiết của mục đó trong cùng workspace. Không trộn nội dung workspace khác. |
| CUXB-02 | Vùng Thư viện trên điện thoại | 1 bảng chọn thư mục; danh sách mục và chi tiết là các màn kế tiếp | Mở thư mục từ bảng chọn, rồi chọn mục để sang màn chi tiết. |
| CUXB-03 | Đầu vùng Thư viện của workspace đang mở | 1 nút Lưu nhanh mở ba loại Văn bản, Đường dẫn, Tệp | Trong workspace nhóm, lưu vào nội dung chung của nhóm theo quyền. Hộp thu chỉ nằm trong Thư viện của workspace cá nhân mặc định, theo [LIB-02/03](../requirements/library.md). |
| CUXB-04 | Điều khiển tìm trong phạm vi Thư viện đang xem | 1 ô tìm | Tìm tiêu đề, URL và văn bản người dùng đã nhập; bản đầu chưa tìm trong nội dung tệp. |
| CUXB-05 | Vùng thư mục trong workspace | Các hành động tạo, đổi tên, xóa thư mục theo quyền; hành động chuyển mục giữa thư mục trong cùng workspace | Chủ hoặc người có quyền quản lý workspace được quản lý thư mục; người có quyền sửa mục được chuyển mục ấy. [LIB-06](../requirements/library.md) |
| CUXB-06 | Thao tác xóa thư mục theo quyền | 1 trạng thái kiểm tra thư mục rỗng trước khi xóa | Nếu còn mục hoặc thư mục con, không xóa; yêu cầu chuyển mục ra, chuyển hoặc xóa thư mục con riêng trước. Không xóa dây chuyền. [LIB-07](../requirements/library.md). |

Đưa mục cá nhân sang nhóm bằng sao chép giữ bản nguồn theo [LIB-04](../requirements/library.md). Vị trí nút sao chép, bộ lọc loại, sắp xếp, định dạng và giới hạn tệp còn ở [R-05/R-07](../../review/unresolved.md).
