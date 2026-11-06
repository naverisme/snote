# Phiếu đối chiếu Q33 — Bốn màn

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Chủ sản phẩm đã chốt C1–C5, A1–A3, B1–B3, D1–D2, E1–E8 (E1–E2 có sửa), F1–F10 và Thư viện I6–I13 tại SRC-19–22/25; G1–G12 **tạm duyệt** ở [phiếu G](ux-q33-g-provisional.md), chưa khóa thành đặc tả triển khai |
| Nền đã chốt | [Q32 khung workspace/Gantt](../../docs/ux/workspace-gantt.md), [quy tắc nghiệp vụ](../../docs/requirements/README.md) |
| Mục tiêu | Phân biệt mệnh đề đã chuyển vào `docs/` với các thành phần còn đề xuất |

## Xem từng màn

| Màn | Phần đã duyệt | Phần còn rà soát |
| --- | --- | --- |
| Lịch trình | [A1–A3, E6, F10](../../docs/ux/calendar-q33.md): ba chế độ, lọc, đích sự kiện, múi giờ, điều hướng và chi tiết sự kiện | [CUX còn mở](ux-q33-calendar.md) |
| Thư viện | [B1–B3, E7, F8, I6–I13](../../docs/ux/library-q33.md): bố cục, lưu/tìm, quyền thư mục, trình soạn, ghi đè/tạo bản sao và tải tệp | [LUX còn mở](ux-q33-library.md) |
| Lớp học | [C1–C5, E1–E5, F1–F7](../../docs/ux/class-navigation.md): bảng Thành viên, vai trò, yêu cầu, hàng nhóm, Cài đặt và lưu trữ | [CLUX còn mở](ux-q33-class.md) |
| Bài giao/nộp | [D1–D2, E8, F9](../../docs/ux/assignments-q33.md): tạo bài, hai quyền sau hạn, bảng nhóm và phiên bản bản nộp | [AUX còn mở](ux-q33-assignments.md) |

## Bố cục ở mức vùng — còn là bản nháp ngoài các mục đã chốt

Bảng này giữ phương án đầy đủ để rà soát; không chuyển toàn bộ thành tài liệu chính thức từ việc duyệt 13 câu hỏi.

| Màn | Điều hướng/phạm vi ở ngoài vùng chính | Đầu vùng chính | Vùng chính | Khi chọn một mục |
| --- | --- | --- | --- | --- |
| Lịch trình workspace | Cụm workspace và ba mục của Q32, chọn Lịch trình | Tên phạm vi, ngày đang xem, cách xem, Tạo sự kiện theo quyền | Chỉ lưới lịch và bộ lọc lịch | Chi tiết sự kiện cạnh lưới hoặc màn riêng trên điện thoại |
| Thư viện workspace | Cụm workspace và ba mục của Q32, chọn Thư viện | Tên phạm vi, Lưu nhanh, Tìm/Lọc/Sắp xếp | Thư mục ở trái, danh sách mục ở giữa; Hộp thu chỉ ở cá nhân mặc định | Chi tiết text/link/tệp ở phải hoặc màn riêng trên điện thoại |
| Lớp học | Lối chọn Lớp học **cạnh, cùng cấp** lối chọn workspace; khi mở lớp, vùng tính năng thay ba mục workspace bằng mục lớp phù hợp | Tên lớp; không có hàng tab cấp lớp riêng | Chỉ nội dung tính năng lớp đang chọn | Chọn nhóm đi vào workspace nhóm; chọn bài mở chi tiết bài |
| Bài giao/nộp | Bài giao là một trong **năm mục tính năng của lớp**, thay cho ba mục workspace; các thành phần chi tiết còn đề xuất | Tên bài, hạn và quyền hiện hành | Giáo viên xem từng nhóm; nhóm nhận bài xem phần tiến độ/bản nộp của mình | Mở phiên bản, nhận xét hoặc biểu mẫu nộp theo quyền |

## Những lựa chọn có ảnh hưởng đến bố trí

Mỗi dòng dưới đây ghi lại **đúng phần đã chốt** của các lượt Q33. Các chi tiết không có trong dòng trả lời vẫn nằm trong các bản nháp và [sổ câu hỏi](../unresolved.md).

| Mã | Chủ đề | Nội dung đã chốt và nơi tra cứu |
| --- | --- | --- |
| Q33-C1–C5 | Điều hướng lớp | Một lối lớp cạnh workspace mở danh sách lớp; năm mục lớp thay ba mục workspace, ẩn Cài đặt nếu không có quyền; không hiện Mục lưu ý trong lớp; bấm nhóm mở Công việc, về lớp qua lối lớp; điện thoại dùng menu dọc thu gọn. [Chi tiết](../../docs/ux/class-navigation.md) |
| Q33-E1–E2 | Mặc định và vai trò lớp | Chọn một lớp mở **Thành viên** mặc định; bảng người trong lớp dạng lưới, mỗi người một hàng với ô vai trò. Người mới gia nhập mặc định Member; giáo viên chọn vai trò khác ở hàng, quyền mặc định theo vai trò và cấu hình khác đặt trong Cài đặt. [UX](../../docs/ux/class-navigation.md) · [quyền](../../docs/requirements/permissions.md) |
| Q33-E3–E5 | Nhóm, Thành viên, Cài đặt | Hàng nhóm chỉ hiện tên/trưởng nhóm/tư cách; Thành viên tách danh sách người, lời mời của mình và yêu cầu chờ duyệt; Cài đặt chia bốn phần và chỉ mở một phần mỗi lần. [Điều hướng lớp](../../docs/ux/class-navigation.md) |
| Q33-E6 | Điều hướng và chi tiết Lịch | Ba nút Trước/Hôm nay/Sau; chi tiết cạnh lưới trên máy tính, màn riêng trên điện thoại. [Lịch](../../docs/ux/calendar-q33.md) |
| Q33-E7 | Xóa thư mục | Chỉ xóa thư mục rỗng, yêu cầu chuyển mục ra trước khi xóa. [Thư viện](../../docs/ux/library-q33.md) · [LIB-07](../../docs/requirements/library.md) |
| Q33-E8 | Bản nộp và xung đột | Hiện bản hiện hành trước, lịch sử/nhận xét khi chọn nhóm; người gửi xem bản hiện hành trước khi gửi lại sau xung đột. [Bài giao](../../docs/ux/assignments-q33.md) |
| Q33-A1–A3 | Lịch | Tháng/Tuần/Ngày, mặc định Tuần/Ngày theo thiết bị; lọc sự kiện, buổi làm, mốc hạn; chọn đích khi tạo; hiển thị theo múi giờ người xem, hạn bài tính theo lớp. [Chi tiết](../../docs/ux/calendar-q33.md) |
| Q33-B1–B3 | Thư viện | Ba vùng trên máy tính, luồng màn riêng trên điện thoại; Lưu nhanh ba loại, Hộp thu cá nhân, tìm tiêu đề/URL/văn bản nhập; quyền quản lý/chuyển thư mục. [Chi tiết](../../docs/ux/library-q33.md) · [quy tắc thư mục](../../docs/requirements/library.md) |
| Q33-D1–D2 | Bài giao | Tạo bài cần tiêu đề và nhóm nhận; mô tả/hạn tùy chọn; hai quyền sau hạn ba trạng thái; bảng ba nguồn tiến độ theo nhóm; nộp cần ít nhất một loại nội dung. [Chi tiết](../../docs/ux/assignments-q33.md) · [quy tắc bài giao](../../docs/requirements/assignments-and-submissions.md) |
| Q33-F1–F7 | Lớp và quyền | Bảng quyền theo vai trò nằm trong phần Quyền lớp trưởng; vai trò cấp lớp Member/Lớp trưởng; chỉ chủ lớp đổi vai trò có lưu dấu; bảng ba cột chính; tách loại yêu cầu và thao tác theo quyền; điện thoại cuộn bảng giữ cột Người học; lớp lưu trữ chỉ đọc, chủ lớp khôi phục trong Cài đặt. [UX](../../docs/ux/class-navigation.md) · [quyền](../../docs/requirements/permissions.md) |
| Q33-F8 | Thư viện | Chỉ xóa thư mục khi không còn mục và thư mục con; xử lý riêng các mục và thư mục con trước. [LIB-07](../../docs/requirements/library.md) |
| Q33-F9 | Bản nộp | Chi tiết phiên bản đã chọn hiển thị người nộp, thời điểm, đúng/muộn, bản chụp nội dung đã nộp và phản hồi tương ứng. [UX](../../docs/ux/assignments-q33.md) |
| Q33-F10 | Lịch | Chi tiết sự kiện gồm tiêu đề, thời gian, phạm vi nhận, nội dung và nút Sửa theo quyền; trường bắt buộc khi tạo vẫn mở. [UX](../../docs/ux/calendar-q33.md) |

**Còn để rà soát:** G1–G12 đã [tạm duyệt](ux-q33-g-provisional.md) cho danh sách lớp, thứ tự mục lớp, tìm/lọc Thành viên, khung bảng quyền, lưới/tạo sự kiện, lọc và Sao chép Thư viện, lịch sử/trạng thái bản nộp, trạng thái màn và chuyển động. Các thông số, quyền từng ô và ngoại lệ nêu trong phiếu G vẫn mở. Không tự nâng phương án tạm duyệt thành yêu cầu coding.
