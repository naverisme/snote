# Phiếu đối chiếu Q33 — Bốn màn

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Chủ sản phẩm đã chốt C1–C5, A1–A3, B1–B3, D1–D2 tại SRC-19 và sửa E1–E2 tại SRC-20; các chi tiết khác trong các bản nháp liên kết **chưa được duyệt** |
| Nền đã chốt | [Q32 khung workspace/Gantt](../../docs/ux/workspace-gantt.md), [quy tắc nghiệp vụ](../../docs/requirements/README.md) |
| Mục tiêu | Phân biệt mệnh đề đã chuyển vào `docs/` với các thành phần còn đề xuất |

## Xem từng màn

| Màn | Phần đã duyệt | Phần còn rà soát |
| --- | --- | --- |
| Lịch trình | [A1–A3](../../docs/ux/calendar-q33.md): ba chế độ, lọc, đích sự kiện, múi giờ | [CUX còn mở](ux-q33-calendar.md) |
| Thư viện | [B1–B3](../../docs/ux/library-q33.md): bố cục, lưu/tìm và quyền thư mục | [LUX còn mở](ux-q33-library.md) |
| Lớp học | [C1–C5, E1–E2](../../docs/ux/class-navigation.md): chọn lớp, mặc định bảng Thành viên, chọn vai trò trong hàng, cài đặt quyền | [CLUX còn mở](ux-q33-class.md) |
| Bài giao/nộp | [D1–D2](../../docs/ux/assignments-q33.md): tạo bài, hai quyền sau hạn, bảng nhóm và bản nộp | [AUX còn mở](ux-q33-assignments.md) |

## Bố cục ở mức vùng — còn là bản nháp ngoài các mục đã chốt

Bảng này giữ phương án đầy đủ để rà soát; không chuyển toàn bộ thành tài liệu chính thức từ việc duyệt 13 câu hỏi.

| Màn | Điều hướng/phạm vi ở ngoài vùng chính | Đầu vùng chính | Vùng chính | Khi chọn một mục |
| --- | --- | --- | --- | --- |
| Lịch trình workspace | Cụm workspace và ba mục của Q32, chọn Lịch trình | Tên phạm vi, ngày đang xem, cách xem, Tạo sự kiện theo quyền | Chỉ lưới lịch và bộ lọc lịch | Chi tiết sự kiện cạnh lưới hoặc màn riêng trên điện thoại |
| Thư viện workspace | Cụm workspace và ba mục của Q32, chọn Thư viện | Tên phạm vi, Lưu nhanh, Tìm/Lọc/Sắp xếp | Thư mục ở trái, danh sách mục ở giữa; Hộp thu chỉ ở cá nhân mặc định | Chi tiết text/link/tệp ở phải hoặc màn riêng trên điện thoại |
| Lớp học | Lối chọn Lớp học **cạnh, cùng cấp** lối chọn workspace; khi mở lớp, vùng tính năng thay ba mục workspace bằng mục lớp phù hợp | Tên lớp; không có hàng tab cấp lớp riêng | Chỉ nội dung tính năng lớp đang chọn | Chọn nhóm đi vào workspace nhóm; chọn bài mở chi tiết bài |
| Bài giao/nộp | Bài giao là một trong **năm mục tính năng của lớp**, thay cho ba mục workspace; các thành phần chi tiết còn đề xuất | Tên bài, hạn và quyền hiện hành | Giáo viên xem từng nhóm; nhóm nhận bài xem phần tiến độ/bản nộp của mình | Mở phiên bản, nhận xét hoặc biểu mẫu nộp theo quyền |

## Những lựa chọn có ảnh hưởng đến bố trí

Mỗi dòng dưới đây ghi lại **đúng phần đã chốt** của lượt 13 câu hỏi. Các chi tiết không có trong dòng trả lời vẫn nằm trong các bản nháp và [sổ câu hỏi](../unresolved.md).

| Mã | Chủ đề | Nội dung đã chốt và nơi tra cứu |
| --- | --- | --- |
| Q33-C1–C5 | Điều hướng lớp | Một lối lớp cạnh workspace mở danh sách lớp; năm mục lớp thay ba mục workspace, ẩn Cài đặt nếu không có quyền; không hiện Mục lưu ý trong lớp; bấm nhóm mở Công việc, về lớp qua lối lớp; điện thoại dùng menu dọc thu gọn. [Chi tiết](../../docs/ux/class-navigation.md) |
| Q33-E1–E2 | Mặc định và vai trò lớp | Chọn một lớp mở **Thành viên** mặc định; bảng người trong lớp dạng lưới, mỗi người một hàng với ô vai trò. Người mới gia nhập mặc định Member; giáo viên chọn vai trò khác ở hàng, quyền mặc định theo vai trò và cấu hình khác đặt trong Cài đặt. [UX](../../docs/ux/class-navigation.md) · [quyền](../../docs/requirements/permissions.md) |
| Q33-A1–A3 | Lịch | Tháng/Tuần/Ngày, mặc định Tuần/Ngày theo thiết bị; lọc sự kiện, buổi làm, mốc hạn; chọn đích khi tạo; hiển thị theo múi giờ người xem, hạn bài tính theo lớp. [Chi tiết](../../docs/ux/calendar-q33.md) |
| Q33-B1–B3 | Thư viện | Ba vùng trên máy tính, luồng màn riêng trên điện thoại; Lưu nhanh ba loại, Hộp thu cá nhân, tìm tiêu đề/URL/văn bản nhập; quyền quản lý/chuyển thư mục. [Chi tiết](../../docs/ux/library-q33.md) · [quy tắc thư mục](../../docs/requirements/library.md) |
| Q33-D1–D2 | Bài giao | Tạo bài cần tiêu đề và nhóm nhận; mô tả/hạn tùy chọn; hai quyền sau hạn ba trạng thái; bảng ba nguồn tiến độ theo nhóm; nộp cần ít nhất một loại nội dung. [Chi tiết](../../docs/ux/assignments-q33.md) · [quy tắc bài giao](../../docs/requirements/assignments-and-submissions.md) |

**Chưa chốt:** E3–E8, các cột ngoài danh tính/vai trò, bảng điện thoại, vị trí nút Sao chép trong Thư viện, cách lọc loại/sắp xếp, thứ tự và biểu tượng các mục lớp, nội dung chi tiết Cài đặt, thanh thời gian và chi tiết Lịch, cách trình bày phiên bản nộp và các trạng thái biên. Không tự nâng những hàng còn lại trong bản nháp thành yêu cầu coding.
