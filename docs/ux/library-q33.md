# Màn Thư viện — Q33-B

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Thư viện của workspace cá nhân, cộng tác và nhóm trong lớp |
| Trạng thái | B1–B3, E7, F8 và I6–I13 được chủ sản phẩm chốt; thành phần khác còn ở [phiếu rà soát](../../review/blocked/ux-q33-library.md) |
| Nguồn | [SRC-19, SRC-21/22, SRC-25](../../review/provenance.md), [LIB-01–15](../requirements/library.md), [NAV-04/06](validated-navigation.md) |

| Mã | Cấp, vị trí | Số lượng, loại | Hành vi đã chốt |
| --- | --- | --- | --- |
| CUXB-01 | Vùng chính Thư viện trên máy tính | 3 vùng cạnh nhau: cây thư mục bên trái, danh sách mục ở giữa, chi tiết mục đã chọn bên phải | Chọn thư mục đổi tập mục; chọn một mục mở chi tiết của mục đó trong cùng workspace. Không trộn nội dung workspace khác. |
| CUXB-02 | Vùng Thư viện trên điện thoại | 1 bảng chọn thư mục; danh sách mục và chi tiết là các màn kế tiếp | Mở thư mục từ bảng chọn, rồi chọn mục để sang màn chi tiết. |
| CUXB-03 | Đầu vùng Thư viện của workspace đang mở | 1 nút Lưu nhanh mở ba loại Văn bản, Đường dẫn, Tệp | Trong workspace nhóm, lưu vào nội dung chung của nhóm theo quyền. Hộp thu chỉ nằm trong Thư viện của workspace cá nhân mặc định, theo [LIB-02/03](../requirements/library.md). |
| CUXB-04 | Điều khiển tìm trong phạm vi Thư viện đang xem | 1 ô tìm | Tìm tiêu đề, URL và văn bản người dùng đã nhập; bản đầu chưa tìm trong nội dung tệp. |
| CUXB-05 | Vùng thư mục trong workspace | Các hành động tạo, đổi tên, xóa thư mục theo quyền; hành động chuyển mục giữa thư mục trong cùng workspace | Chủ hoặc người có quyền quản lý workspace được quản lý thư mục; người có quyền sửa mục được chuyển mục ấy. [LIB-06](../requirements/library.md) |
| CUXB-06 | Thao tác xóa thư mục theo quyền | 1 trạng thái kiểm tra thư mục rỗng trước khi xóa | Nếu còn mục hoặc thư mục con, không xóa; yêu cầu chuyển mục ra, chuyển hoặc xóa thư mục con riêng trước. Không xóa dây chuyền. [LIB-07](../requirements/library.md). |
| CUXB-07 | Trình soạn mục Văn bản trong Thư viện | 1 vùng nhập nhiều dòng; một thẻ xem trước dưới văn bản nếu có URL hợp lệ | `- ` tạo danh sách dấu đầu dòng, `1. ` tạo danh sách đánh số; Enter tiếp tục và tăng số, Enter ở dòng trống kết thúc danh sách. Mọi URL nhận diện được vẫn bấm mở; chỉ URL đầu tiên tạo thẻ xem trước. Thẻ hiện ảnh bìa, tiêu đề, tên miền khi có dữ liệu; thiếu ảnh thì hiện tên miền và đường dẫn. [LIB-09/10](../requirements/library.md) |
| CUXB-08 | Khi sửa tệp đã tải lên, trong phạm vi mục có quyền sửa | 1 thông báo chọn giữa 2 nút **Ghi đè mục này** và **Tạo bản sao** | Ghi đè giữ cùng mục với nội dung hiện hành mới và lịch sử phiên bản; tạo bản sao sinh mục mới, cho chọn thư mục đích nếu cần. Bản sao sang workspace khác theo LIB-12. Bản nộp đã gửi giữ nội dung lúc nộp. [LIB-13](../requirements/library.md) |
| CUXB-09 | Chính ô tài liệu khi người dùng tải tệp lên | 1 trạng thái đang tải với tiến độ nếu đo được; 1 dấu tích xanh giữa ô khi hoàn tất | Chỉ hiện dấu tích khi tệp **và thông tin mục** đã lưu; dấu tích mờ dần rồi ô trở về hiển thị bình thường. Khi lỗi, hiện lỗi và nút Thử lại, không hiện dấu tích hoặc mục tệp hoàn chỉnh. [LIB-15](../requirements/library.md) |

Sao chép giữa workspace tạo các mục độc lập theo [LIB-12](../requirements/library.md). Xóa mục vào Thùng rác và khôi phục trong 30 ngày theo [LIB-14](../requirements/library.md). Vị trí, trạng thái và chuyển động bổ sung ở [thiết kế tổng hợp](ui-and-motion.md); xung đột, quota và lưu tệp ở [STR-15/16](../requirements/structural-rules.md), [hợp đồng](../contracts/README.md).
