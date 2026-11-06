# Q33-A — Đề xuất màn Lịch trình

| Trường | Giá trị |
| --- | --- |
| Trạng thái | A1–A3, E6 và F10 đã chuyển vào [đặc tả được duyệt](../../docs/ux/calendar-q33.md); các chi tiết khác còn đề xuất |
| Phạm vi | “Lịch của tôi” xuyên workspace, Lịch trình của một workspace, và đề xuất màn lịch trong lớp; sự kiện lớp có lối tạo theo quyền |
| Quy tắc nguồn | [CAL-01 đến CAL-06](../../docs/requirements/calendar.md), [TASK-05 đến TASK-07](../../docs/requirements/tasks.md), [NAV-03–05](../../docs/ux/validated-navigation.md), [Q32](../../docs/ux/workspace-gantt.md) |

Trong workspace, giữ nguyên bộ chọn và ba mục tính năng đã duyệt ở Q32. Khi chọn **Lịch trình**, chỉ nội dung lịch xuất hiện trong vùng chính. Khi vào lớp, vùng tính năng đổi theo NAV-08; **Lịch lớp** là một trong năm tên mục đã chốt, không phải mục thứ tư cạnh Công việc/Lịch trình/Thư viện. “Lịch của tôi” là phạm vi tổng hợp cấp ứng dụng; tiêu đề phải phân biệt rõ ba phạm vi.

| Mã | Cấp, vị trí, thành phần cùng nhóm | Số lượng, loại đề xuất | Hành động hoặc thông tin hiển thị | Nguồn/ràng buộc |
| --- | --- | --- | --- | --- |
| CUX-01 | Đầu vùng nội dung Lịch; thuộc phạm vi đang mở | 1 tiêu đề tương ứng: “Lịch của tôi”, “Lịch trình · [workspace]” hoặc “Lịch lớp · [lớp]” | Chỉ hiển thị, không đổi phạm vi khi bấm. Tên **mục** Lịch lớp đã chốt; định dạng tiêu đề ở đây còn là đề xuất. | CAL-01, Q32, NAV-08 |
| CUX-02 | Cạnh tiêu đề, nhóm điều hướng thời gian | 3 nút Trước, Hôm nay, Sau; 1 nhãn khoảng | Đổi khoảng thời gian đang nhìn thấy, không sửa sự kiện. | Đề xuất UX |
| CUX-03 | Trong vùng điều khiển Lịch; vị trí chính xác cạnh CUX-02 còn đề xuất | 3 lựa chọn Tháng, Tuần, Ngày, chỉ một lựa chọn tại một thời điểm | Đổi cách nhìn cùng tập sự kiện; mặc định Tuần trên máy tính, Ngày trên điện thoại. | A1, [đặc tả được duyệt](../../docs/ux/calendar-q33.md) |
| CUX-04 | Bên phải thanh công cụ Lịch | 1 nút Tạo sự kiện theo quyền | Mở biểu mẫu, cho chọn sự kiện riêng hoặc chung theo phạm vi được phép; chỉ ghi khi xác nhận. | CAL-02, CAL-04; lớp trưởng cần quyền tạo riêng |
| CUX-05 | Trong vùng điều khiển Lịch; vị trí chính xác còn đề xuất | 1 điều khiển Lọc ba nhóm sự kiện, buổi làm, mốc hạn việc/bài giao | Lọc các mục người xem được phép thấy; không sửa dữ liệu. Việc tách sự kiện riêng/chung thành hai công tắc vẫn đề xuất. | A2, CAL-01–05 |
| CUX-06 | Vùng nội dung chính | 1 lưới thời gian; số ô và số mục theo khoảng đã chọn | Ba lịch hiển thị theo múi giờ người xem [CAL-07](../../docs/requirements/calendar.md); Lịch workspace chỉ lấy dữ liệu workspace, sự kiện lớp theo phạm vi nhận. Buổi làm riêng của người khác không hiện. Kiểu lưới cụ thể vẫn đề xuất. | CAL-01/03/05/07, Q33-A3 |
| CUX-07 | Trên một ô sự kiện hoặc mục đến hạn | 1 lối mở chi tiết trên mỗi mục | Mở chi tiết tương ứng, không mở ghi chú ngoài phạm vi lịch. | Đề xuất UX |
| CUX-08 | Cạnh lưới trên máy tính; màn riêng trên điện thoại | 1 vùng chi tiết khi chọn | Theo F10: tiêu đề, khoảng thời gian, phạm vi nhận, nội dung; nút Sửa theo quyền. Người chỉnh nếu thêm vào là đề xuất. | CAL-04/06, PER-02, F10 |
| CUX-09 | Khi tạo/sửa sự kiện | 1 biểu mẫu theo phạm vi | Nhập thông tin sự kiện; nếu là sự kiện lớp, giáo viên chọn cả lớp hoặc nhóm nhận. Khi trùng giờ, cảnh báo và vẫn cho lưu. Sửa sự kiện đã gửi cập nhật cho người nhận đúng phạm vi. | CAL-03, CAL-06 |

## Trạng thái và màn nhỏ

| Trạng thái | Phương án đề xuất |
| --- | --- |
| Đang tải | Giữ tiêu đề phạm vi và điều hướng; trạng thái tải nằm ở lưới. |
| Chưa có sự kiện | Thông báo chỉ cho khoảng đang xem, có Tạo sự kiện nếu có quyền. |
| Lọc không có kết quả | Nêu bộ lọc đang áp và nút Bỏ lọc. |
| Lỗi tải hoặc mất quyền | Thử lại trong phạm vi hiện tại; mất quyền thì về phạm vi lịch còn truy cập. |
| Điện thoại | Khi ở workspace giữ ba mục tính năng như Q32; khi ở lớp vùng đó đổi thành mục lớp phù hợp. Lưới cuộn theo thời gian, chi tiết mở màn riêng. Chế độ Tháng/Tuần/Ngày vẫn dùng cùng nguồn dữ liệu. |

## Điểm còn mở

A1–A3, E6 và F10 đã chốt ba cách xem, nhóm lọc, đích tạo, múi giờ, Trước/Hôm nay/Sau, vị trí chi tiết theo thiết bị và bốn trường chi tiết cùng nút Sửa theo quyền tại [đặc tả Lịch](../../docs/ux/calendar-q33.md). Kiểu lưới từng chế độ và trường bắt buộc khi tạo còn mở.

Chưa đưa nút sự kiện lặp vì [CAL-06](../../docs/requirements/calendar.md) để đặc tả tính năng lặp ở lượt sau. Không tự giả định khả năng sửa sự kiện của người không có quyền.
