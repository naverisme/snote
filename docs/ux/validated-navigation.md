# Điều hướng và phạm vi màn đã xác nhận

| Trường | Giá trị |
| --- | --- |
| Mục đích | Chỉ rõ thứ bậc các mục và nội dung xuất hiện khi đổi phạm vi |
| Phạm vi | Lối vào cá nhân, Lớp học và điều hướng trong workspace |
| Kiểm định | DCA-checked cho phân cấp, điều kiện xuất hiện và hành vi đã duyệt |
| Bằng chứng duyệt | [SRC-03, SRC-04, SRC-07, SRC-08, SRC-16, SRC-17, SRC-19, Q19 và Q20](../../review/provenance.md) |

## Lối vào theo tài khoản

| Mã | Điều kiện và phạm vi | Hành vi đã chốt | Nguồn |
| --- | --- | --- | --- |
| NAV-01 | Chọn Giáo viên | Có lối vào Lớp học và thao tác tạo lớp khi cần. Workspace cá nhân có sẵn sau đăng ký. | SRC-07, SRC-08 |
| NAV-02 | Chọn Người học | Có phạm vi các lớp đang học. Hành động trong lớp và workspace theo quyền tại phạm vi đó. | SRC-07, SRC-08 |
| NAV-03 | Phạm vi cá nhân | “Việc của tôi” và “Lịch của tôi” tổng hợp xuyên workspace theo quyền truy cập. | SRC-03, SRC-04 |

## Các thành phần đã chốt trong workspace

| Mã | Thành phần | Số trong nhóm | Loại và cấp | Khi người dùng thao tác |
| --- | --- | --- | --- | --- |
| NAV-04 | Công việc, Lịch, Thư viện | 3 mục | Điều hướng ngang cấp trong cùng workspace. Thư viện đặt cạnh Lịch. | Chọn một mục để chuyển nội dung sang đúng tính năng trong workspace đang mở. |
| NAV-05 | Vùng nội dung chính | 1 vùng theo mục được chọn | Vùng hiển thị của workspace | Hiện nội dung của Công việc, Lịch hoặc Thư viện theo mục đang chọn. |
| NAV-06 | Hộp thu | 1 phần trong phạm vi đã chốt | Thành phần của Thư viện trong workspace cá nhân mặc định | Hiện các mục lưu nhanh chưa phân loại của chủ tài khoản khi truy cập Hộp thu. |

NAV-04 đến NAV-06 dùng SRC-03 và các quyết định về Hộp thu trong SRC-07, SRC-08. [Q32](../../review/provenance.md) đã chốt kiểu điều khiển và trạng thái của khung workspace cùng màn Công việc tại [đặc tả Gantt](workspace-gantt.md). Các màn khác còn theo [R-05](../../review/unresolved.md).

## Chuyển giữa ngữ cảnh workspace và lớp

| Mã | Thành phần | Cấp và vị trí | Hành vi đã xác nhận | Nguồn |
| --- | --- | --- | --- | --- |
| NAV-07 | Lối tắt Lớp học | Cùng cấp với lối chọn workspace ở vùng chọn ngữ cảnh; không nằm trong ba mục tính năng của workspace | Chọn để đi vào phạm vi lớp. Lớp vẫn là cấp dữ liệu bao trùm các workspace nhóm; việc đứng cạnh workspace chỉ nói về vị trí lối vào giao diện. | SRC-16 |
| NAV-08 | Nhóm điều hướng tính năng theo ngữ cảnh | Trong workspace hiện ba mục Công việc, Lịch trình, Thư viện; khi mở lớp, cùng vùng điều hướng dùng năm mục Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt thay cho ba mục workspace | Vùng nội dung chính chỉ hiện tính năng đang chọn. Cài đặt ẩn với người không có quyền quản lý lớp; quyền thực thi vẫn kiểm ở từng thao tác. Màn điện thoại dùng danh sách thu gọn mở dọc. Xem [điều hướng lớp](class-navigation.md) cho C1–C5; thứ tự, biểu tượng và màn chi tiết khác còn mở. | SRC-16, SRC-17, SRC-19 |

Phạm vi dữ liệu của mỗi màn tra ở [Công việc](../requirements/tasks.md), [Lịch](../requirements/calendar.md) và [Thư viện](../requirements/library.md). Bản đầu dùng web trên máy tính và điện thoại. [Q20](../../review/provenance.md)
