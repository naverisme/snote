# Màn Lịch trình và Lịch lớp — Q33-A

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Lịch của tôi, Lịch trình của workspace và Lịch lớp trên web máy tính/điện thoại |
| Trạng thái | A1–A3 và E6 được chủ sản phẩm chốt; các thành phần khác còn ở [phiếu rà soát](../../review/blocked/ux-q33-calendar.md) |
| Nguồn | [SRC-19, SRC-21](../../review/provenance.md), [CAL-01–07](../requirements/calendar.md), [NAV-08](validated-navigation.md) |

| Mã | Cấp, vị trí | Số lượng, loại | Hành vi đã chốt |
| --- | --- | --- | --- |
| CUXA-01 | Đầu vùng Lịch đang mở, thuộc chính màn lịch | 1 bộ chọn ba chế độ Tháng, Tuần, Ngày | Đổi cách xem cùng tập dữ liệu lịch; mặc định **Tuần trên máy tính**, **Ngày trên điện thoại**. |
| CUXA-02 | Vùng điều khiển của màn Lịch | 1 điều khiển Lọc với ba nhóm nội dung: sự kiện, buổi làm, mốc hạn việc/bài giao | Chỉ thay nội dung được nhìn thấy, không sửa sự kiện hay hạn; từng mục chỉ xuất hiện khi người xem có quyền. Buổi làm riêng chỉ chủ sở hữu thấy. |
| CUXA-03 | Màn tạo sự kiện mở từ Lịch của tôi hoặc Lịch workspace | 1 lựa chọn đích khi đi từ Lịch của tôi: riêng hoặc workspace có quyền; từ Lịch workspace, đích mặc định là workspace đang mở | Chỉ lưu sự kiện vào phạm vi được chọn và được phép. Sự kiện lớp theo đối tượng nhận ở [CAL-03](../requirements/calendar.md). |
| CUXA-04 | Lưới lịch của cả ba phạm vi | 1 vùng thời gian theo chế độ CUXA-01 | Hiển thị thời điểm theo **múi giờ người xem**; hạn bài vẫn được xác định theo **múi giờ lớp** trước khi hiển thị. |
| CUXA-05 | Đầu vùng Lịch, cùng nhóm điều hướng thời gian | 3 nút Trước, Hôm nay, Sau | Chuyển khoảng xem trước/sau; Hôm nay đưa lịch về khoảng chứa ngày hiện tại của người xem, không đổi dữ liệu sự kiện. |
| CUXA-06 | Khi chọn một sự kiện | 1 vùng chi tiết cạnh lưới trên máy tính; 1 màn riêng trên điện thoại | Hiển thị chi tiết của sự kiện được chọn theo quyền truy cập. Trường chi tiết cụ thể và nút sửa còn cần xác định. |

Kiểu lưới từng chế độ, trường chi tiết và biểu mẫu chưa được chốt trong A1–A3/E6; theo [R-05](../../review/unresolved.md). Quyền tạo/sửa và cảnh báo trùng giờ theo [yêu cầu Lịch](../requirements/calendar.md).
