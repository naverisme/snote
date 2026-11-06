# Q33-A — Đề xuất màn Lịch trình

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Bản rà soát, chưa được chủ sản phẩm duyệt; không dùng làm yêu cầu coding |
| Phạm vi | “Lịch của tôi” xuyên workspace, Lịch trình của một workspace, và đề xuất màn lịch trong lớp; sự kiện lớp có lối tạo theo quyền |
| Quy tắc nguồn | [CAL-01 đến CAL-06](../../docs/requirements/calendar.md), [TASK-05 đến TASK-07](../../docs/requirements/tasks.md), [NAV-03–05](../../docs/ux/validated-navigation.md), [Q32](../../docs/ux/workspace-gantt.md) |

Trong workspace, giữ nguyên bộ chọn và ba mục tính năng đã duyệt ở Q32. Khi chọn **Lịch trình**, chỉ nội dung lịch xuất hiện trong vùng chính. Khi vào lớp, vùng tính năng đổi theo NAV-08; **Lịch lớp** là tên mục đề xuất, không phải mục thứ tư cạnh Công việc/Lịch trình/Thư viện. “Lịch của tôi” là phạm vi tổng hợp cấp ứng dụng; tiêu đề phải phân biệt rõ ba phạm vi.

| Mã | Cấp, vị trí, thành phần cùng nhóm | Số lượng, loại đề xuất | Hành động hoặc thông tin hiển thị | Nguồn/ràng buộc |
| --- | --- | --- | --- | --- |
| CUX-01 | Đầu vùng nội dung Lịch; thuộc phạm vi đang mở | 1 tiêu đề tương ứng: “Lịch của tôi”, “Lịch trình · [workspace]” hoặc “Lịch lớp · [lớp]” | Chỉ hiển thị, không đổi phạm vi khi bấm. Tên mục lớp là đề xuất. | CAL-01, Q32, NAV-08 |
| CUX-02 | Cạnh tiêu đề, nhóm điều hướng thời gian | 3 nút Trước, Hôm nay, Sau; 1 nhãn khoảng | Đổi khoảng thời gian đang nhìn thấy, không sửa sự kiện. | Đề xuất UX |
| CUX-03 | Cạnh CUX-02, cùng nhóm điều khiển lịch | 3 lựa chọn Tháng, Tuần, Ngày, chỉ một lựa chọn tại một thời điểm | Đổi cách nhìn cùng tập sự kiện. | Đề xuất UX, chưa có quy tắc nghiệp vụ về các chế độ này |
| CUX-04 | Bên phải thanh công cụ Lịch | 1 nút Tạo sự kiện theo quyền | Mở biểu mẫu, cho chọn sự kiện riêng hoặc chung theo phạm vi được phép; chỉ ghi khi xác nhận. | CAL-02, CAL-04; lớp trưởng cần quyền tạo riêng |
| CUX-05 | Dưới công cụ, trong Lịch | 1 nút Lọc mở lựa chọn loại hiển thị | Bật/tắt sự kiện riêng, sự kiện chung, buổi làm riêng và mốc hạn/bài giao đã được phép thấy; không sửa dữ liệu. | CAL-01–05; **việc hiện hạn như mục riêng là đề xuất hiển thị** |
| CUX-06 | Vùng nội dung chính | 1 lưới thời gian; số ô và số mục theo khoảng đã chọn | “Lịch của tôi” hiển thị theo múi giờ người xem; Lịch workspace chỉ lấy dữ liệu workspace; sự kiện lớp theo phạm vi nhận. Buổi làm riêng của người khác không hiện. Múi giờ hiển thị Lịch workspace/Lịch lớp cần duyệt riêng. | CAL-01, CAL-03, CAL-05, Q27 |
| CUX-07 | Trên một ô sự kiện hoặc mục đến hạn | 1 lối mở chi tiết trên mỗi mục | Mở chi tiết tương ứng, không mở ghi chú ngoài phạm vi lịch. | Đề xuất UX |
| CUX-08 | Cạnh lưới trên máy tính; màn riêng trên điện thoại | 1 vùng chi tiết khi chọn | Xem nội dung, thời gian, phạm vi nhận và người chỉnh theo quyền; mở sửa nếu có quyền. | CAL-04/06, PER-02; trường chi tiết còn chờ duyệt |
| CUX-09 | Khi tạo/sửa sự kiện | 1 biểu mẫu theo phạm vi | Nhập thông tin sự kiện; nếu là sự kiện lớp, giáo viên chọn cả lớp hoặc nhóm nhận. Khi trùng giờ, cảnh báo và vẫn cho lưu. Sửa sự kiện đã gửi cập nhật cho người nhận đúng phạm vi. | CAL-03, CAL-06 |

## Trạng thái và màn nhỏ

| Trạng thái | Phương án đề xuất |
| --- | --- |
| Đang tải | Giữ tiêu đề phạm vi và điều hướng; trạng thái tải nằm ở lưới. |
| Chưa có sự kiện | Thông báo chỉ cho khoảng đang xem, có Tạo sự kiện nếu có quyền. |
| Lọc không có kết quả | Nêu bộ lọc đang áp và nút Bỏ lọc. |
| Lỗi tải hoặc mất quyền | Thử lại trong phạm vi hiện tại; mất quyền thì về phạm vi lịch còn truy cập. |
| Điện thoại | Khi ở workspace giữ ba mục tính năng như Q32; khi ở lớp vùng đó đổi thành mục lớp phù hợp. Lưới cuộn theo thời gian, chi tiết mở màn riêng. Chế độ Tháng/Tuần/Ngày vẫn dùng cùng nguồn dữ liệu. |

## Điểm cần duyệt

1. Có chọn **ba** cách xem Tháng/Tuần/Ngày như CUX-03, hay ít hơn? Mặc định đề xuất là **Tuần** trên máy tính, **Ngày** trên điện thoại.
2. CUX-05: hạn việc và hạn bài là dấu mốc trong Lịch hay chỉ sự kiện và buổi làm? Quy tắc hiện tại xác nhận lịch có hạn việc/bài, còn hình thức và lọc là đề xuất.
3. CUX-04/09: khi tạo từ “Lịch của tôi”, người dùng chọn sự kiện riêng hoặc đích workspace; từ Lịch workspace thì mặc định đích workspace đang mở. Có giữ cách này không?
4. CUX-06: Lịch workspace và Lịch lớp hiển thị theo múi giờ người xem như “Lịch của tôi”, hay cố định theo múi giờ lớp/workspace? Hạn bài vẫn xác định theo múi giờ lớp theo ASG-07.

Chưa đưa nút sự kiện lặp vì [CAL-06](../../docs/requirements/calendar.md) để đặc tả tính năng lặp ở lượt sau. Không tự giả định khả năng sửa sự kiện của người không có quyền.
