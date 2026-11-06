# Phiếu duyệt Q33 — Bốn màn còn lại

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Chủ sản phẩm đồng ý bố cục tổng thể nhưng sửa phân cấp điều hướng: NAV-07/08 đã chốt; tên mục lớp và hành vi chi tiết Q33 còn là đề xuất |
| Nền đã chốt | [Q32 khung workspace/Gantt](../../docs/ux/workspace-gantt.md), [quy tắc nghiệp vụ](../../docs/requirements/README.md) |
| Mục tiêu | Duyệt cấp màn, số lượng, kiểu, vị trí và hành động từng thành phần trước khi đưa vào `docs/ux/` |

## Xem từng màn

| Màn | Phạm vi chính | Đề xuất chi tiết |
| --- | --- | --- |
| Lịch trình | “Lịch của tôi” hoặc Lịch của workspace; sự kiện lớp theo đối tượng nhận | [Q33-A — CUX-01–09](ux-q33-calendar.md) |
| Thư viện | Văn bản, link, tệp, thư mục và Hộp thu cá nhân | [Q33-B — LUX-01–09](ux-q33-library.md) |
| Lớp học | Lớp trên workspace nhóm, vai trò, tư cách và cài đặt | [Q33-C — CLUX-01–10](ux-q33-class.md) |
| Bài giao/nộp | Một bài cấp lớp, mỗi nhóm có tiến độ và bản nộp riêng | [Q33-D — AUX-01–12](ux-q33-assignments.md) |

## Bố cục ở mức vùng

| Màn | Điều hướng/phạm vi ở ngoài vùng chính | Đầu vùng chính | Vùng chính | Khi chọn một mục |
| --- | --- | --- | --- | --- |
| Lịch trình workspace | Cụm workspace và ba mục của Q32, chọn Lịch trình | Tên phạm vi, ngày đang xem, cách xem, Tạo sự kiện theo quyền | Chỉ lưới lịch và bộ lọc lịch | Chi tiết sự kiện cạnh lưới hoặc màn riêng trên điện thoại |
| Thư viện workspace | Cụm workspace và ba mục của Q32, chọn Thư viện | Tên phạm vi, Lưu nhanh, Tìm/Lọc/Sắp xếp | Thư mục ở trái, danh sách mục ở giữa; Hộp thu chỉ ở cá nhân mặc định | Chi tiết text/link/tệp ở phải hoặc màn riêng trên điện thoại |
| Lớp học | Lối chọn Lớp học **cạnh, cùng cấp** lối chọn workspace; khi mở lớp, vùng tính năng thay ba mục workspace bằng mục lớp phù hợp | Tên lớp; không có hàng tab cấp lớp riêng | Chỉ nội dung tính năng lớp đang chọn | Chọn nhóm đi vào workspace nhóm; chọn bài mở chi tiết bài |
| Bài giao/nộp | Đề xuất là một mục trong **vùng tính năng của lớp**, thay cho ba mục workspace | Tên bài, hạn và quyền hiện hành | Giáo viên xem từng nhóm; nhóm nhận bài xem phần tiến độ/bản nộp của mình | Mở phiên bản, nhận xét hoặc biểu mẫu nộp theo quyền |

## Những lựa chọn có ảnh hưởng đến bố trí

Mỗi dòng có câu trả lời đề xuất. Có thể duyệt theo mã hoặc sửa trực tiếp mã thành phần trong tài liệu. Chỉ phương án được bạn xác nhận mới được chuyển vào `docs/ux/`; quy tắc nghiệp vụ và giới hạn tệp còn mở vẫn ở `review/unresolved.md`.

| Mã | Cần chốt | Đề xuất trả lời |
| --- | --- | --- |
| Q33-A1 | Chế độ Lịch | Có Tháng, Tuần, Ngày. Mặc định Tuần trên máy tính và Ngày trên điện thoại. [CUX-03](ux-q33-calendar.md) |
| Q33-A2 | Loại nội dung trong Lịch | Có lọc sự kiện riêng/chung, buổi làm riêng và dấu mốc hạn việc/bài; chỉ hiện mục người xem có quyền. [CUX-05/06](ux-q33-calendar.md) |
| Q33-A3 | Tạo sự kiện và múi giờ | Từ Lịch của tôi chọn đích riêng hoặc workspace; từ workspace mặc định đích hiện tại. Lịch workspace/lớp hiển thị theo múi giờ người xem, hạn bài vẫn tính theo múi giờ lớp. [CUX-04/06/09](ux-q33-calendar.md) |
| Q33-B1 | Bố cục Thư viện | Máy tính có cây thư mục bên trái, danh sách mục ở giữa, chi tiết bên phải. Điện thoại mở thư mục qua bảng chọn và chi tiết màn riêng. [LUX-03/06/07](ux-q33-library.md) |
| Q33-B2 | Lưu nhanh và tìm | Nút Lưu nhanh chọn văn bản/link/tệp. Trong nhóm lưu thẳng mục chung, Hộp thu chỉ ở workspace cá nhân mặc định. Tìm tiêu đề/URL/văn bản người dùng nhập; không tìm nội dung tệp ở bản đầu. [LUX-02/04/05](ux-q33-library.md) |
| Q33-B3 | Thư mục và sao chép | Chủ/người có quyền quản lý workspace tạo, đổi tên, xóa thư mục; người có quyền sửa mục chuyển mục vào thư mục. Sao chép cá nhân → nhóm từ chi tiết mục, chọn workspace đích còn quyền; giữ bản nguồn. [LUX-03/08](ux-q33-library.md) |
| Q33-C1 | Cấp Lớp học | **Đã chốt:** lối Lớp học ngang cấp bộ chọn workspace; vùng tính năng đổi theo ngữ cảnh. **Đề xuất tiếp:** một lối mở danh sách lớp, năm mục Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt thay ba mục workspace; cách hiện Cài đặt theo quyền cần duyệt. [CLUX-01/05](ux-q33-class.md) |
| Q33-C2 | Nhóm và lời mời | Mở nhóm vào workspace nhóm với Công việc là mục đầu; có lối về lớp. Mục Thành viên chia lời mời của mình và yêu cầu chờ duyệt thành hai vùng. [CLUX-06/07](ux-q33-class.md) |
| Q33-D1 | Tạo bài giao | Đề xuất bắt buộc tiêu đề và ít nhất một nhóm nhận; mô tả và hạn là tùy chọn. Trên từng bài, hai cài đặt sau hạn có ba trạng thái riêng Kế thừa lớp/Cho phép/Khóa. [AUX-03–05](ux-q33-assignments.md) |
| Q33-D2 | Tiến độ và Nộp | Giáo viên thấy bảng ba nguồn tiến độ theo nhóm; bấm nhóm mới xem phiên bản/nhận xét. Bản nộp cần ít nhất một trong văn bản/link/tệp; giữ phiên bản cũ nếu lỗi hoặc xung đột. [AUX-06–11](ux-q33-assignments.md) |

Các dòng Q33-B3 và Q33-D1 ảnh hưởng quy tắc nghiệp vụ chưa được chốt. Nếu bạn chỉ duyệt **bố cục** mà không duyệt quyền/thông tin bắt buộc, hai phần ấy vẫn nằm trong `review/` và không được ghi thành yêu cầu sản phẩm.
