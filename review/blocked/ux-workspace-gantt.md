# Q32 — Đánh giá Gantt theo bản vẽ người dùng

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Đề xuất để duyệt từng thành phần; Q32 chưa chốt |
| Nguồn | Hình `Biểu đồ không có tiêu đề.drawio.png` người dùng gửi ngày 2026-11-06 |
| Đã chốt trước | Công việc, Lịch, Thư viện ngang cấp trong workspace; Gantt mặc định, Danh sách cùng cấp, mở chi tiết để sửa; lịch làm riêng không lộ cho người khác. [NAV-04, NAV-05](../../docs/ux/validated-navigation.md) · [VIEW-01 đến VIEW-04](../../docs/ux/task-views.md) |

## Đọc bản vẽ

Thanh trái có Snote, ba mục Công việc/Lịch trình/Thư viện, dưới đó có các dòng thông báo, việc đến hạn, lịch họp và `Test`. Đầu vùng chính là các vòng tròn chồng nhau, ghi “chế độ xem”; hình giữa lại diễn giải rê vào vòng tròn để thấy **tên workspace** và bấm để mở dãy nhiều workspace cùng nút `+`. Phần giữa dành cho Gantt, có “sắp xếp” và “lọc”. Bốn vòng tròn chỉ là minh họa, chưa phải giới hạn bốn workspace.

Đề xuất tách **workspace đang xem** và **chế độ Gantt/Danh sách** thành hai nhóm điều khiển độc lập. Số lượng dưới đây là trên một màn, trừ nơi ghi theo số workspace/việc. Tên hành động là thao tác người dùng; API sẽ ở `contracts/` sau khi duyệt.

| Mã | Vị trí, nhóm và cấp | Số lượng, loại | Khi thao tác | Đề xuất với hình |
| --- | --- | --- | --- | --- |
| UXR-01 | Đầu thanh trái, vỏ ứng dụng | 1 tên/logo Snote, nhãn hoặc nút | Nếu là nút, về phạm vi cá nhân. | Giữ tên, cần quyết định nó có bấm được không. |
| UXR-02 | Thanh trái, **trong workspace đang chọn** | 3 nút Công việc, Lịch trình, Thư viện | Thay vùng chính bằng đúng một tính năng. | Giữ ba mục sát nhau; chọn Công việc thì không hiện ghi chú. |
| UXR-03 | Trên vùng chính, nhóm workspace | 1 nhóm tab/bộ chọn, mục theo workspace được phép mở, 1 dấu chọn | Đổi workspace đang xem. | Giữ ý đổi nhanh; tên workspace đang chọn phải luôn thấy. Chỉ hiện tên khi hover không dùng được trên điện thoại. |
| UXR-04 | Cuối nhóm UXR-03 | 1 nút `+` | Mở tạo workspace, chỉ ghi khi xác nhận. | Giữ dấu `+` và bổ sung tên truy cập. Workspace mặc định không có thao tác chia sẻ [ACC-06](../../docs/requirements/accounts-and-workspaces.md). |
| UXR-05 | Vỏ ứng dụng, tách ba mục tính năng | 1 nút Thông báo, số chưa đọc nếu có | Mở danh sách nhắc hạn/họp/thông báo. | Thay các dòng thông báo cố định để Gantt bớt xao nhãng; chưa được duyệt. |
| UXR-06 | Đầu Công việc, nhóm chế độ xem | 2 nút Gantt và Danh sách | Đổi cách xem cùng tập việc. | Bổ sung nhãn rõ ràng; Gantt mặc định. Vòng tròn workspace không kiêm nhiệm chế độ xem. |
| UXR-07 | Cạnh UXR-06, trong Công việc | 1 nút Tạo việc theo quyền | Mở tạo việc trong workspace hiện tại. | Thêm vào hình; việc không bắt buộc có hạn. |
| UXR-08 | Đầu Công việc, nhóm hiển thị | 1 điều khiển Lọc | Đổi tập việc đang nhìn thấy; có lối bỏ lọc. | Giữ vị trí, hiện dấu đang áp lọc. Các lựa chọn trong popup cần duyệt. |
| UXR-09 | Cạnh Lọc, nhóm hiển thị | 1 điều khiển Sắp xếp | Đổi thứ tự hàng; lưu mặc định là thao tác riêng. | Giữ vị trí; trong Gantt chỉ sắp xếp hàng, không đảo trục thời gian. |
| UXR-10 | Trên lưới Gantt | 3 nút Trước/Hôm nay/Sau, 1 nhãn khoảng, 1 bộ chọn độ chi tiết | Đổi khoảng thời gian/độ chi tiết trục. | Hình chưa có; “Hôm nay” ở đây đưa trục về hiện tại, khác lọc việc hôm nay. Ngày/Tuần là đề xuất. |
| UXR-11 | Vùng chính Gantt | 1 lưới tên việc + trục thời gian, số hàng theo việc | Chọn hàng để mở chi tiết, không kéo để sửa bản đầu. | Giữ Gantt là tâm màn; hạn và buổi làm riêng phải có cách vẽ tách nghĩa. |
| UXR-12 | Gắn với lưới Gantt | 1 nhóm việc chưa có mốc nếu phát sinh | Mở chi tiết việc. | Việc không hạn và không có buổi làm nhìn thấy không được vẽ thanh giả. |
| UXR-13 | Khi chọn việc | 1 vùng chi tiết bên phải trên máy tính, màn riêng trên điện thoại | Xem/sửa theo quyền, gồm hạn, checklist, phụ trách, lịch làm riêng của mình. | Tránh nhồi nút sửa trên thanh Gantt. |
| UXR-14 | Khi chuyển Danh sách | 1 danh sách, ô chọn theo hàng có quyền; nhóm thao tác hàng loạt xuất hiện khi chọn | Lưu trữ/xóa nhiều theo quyền và xác nhận. | Danh sách giữ mục đích quản lý hàng loạt đã chốt. |

## Trạng thái và điện thoại

| Tình huống | Đề xuất |
| --- | --- |
| Đang tải | Giữ tên workspace và điều hướng, chỉ vùng nội dung hiện trạng thái tải. |
| Chưa có việc | Nêu rõ và hiện Tạo việc nếu được phép. |
| Lọc không có kết quả | Nêu bộ lọc hiện tại, có lối bỏ lọc. |
| Lỗi hoặc hết quyền | Thử lại với lỗi tạm; chọn workspace khác khi hết quyền. |
| Điện thoại | Ba mục vẫn ngang cấp; tab workspace có thể thu thành bộ chọn; Gantt cuộn ngang bên trong lưới, chi tiết là màn riêng. |

## Những lựa chọn cần phản hồi

1. `UXR-03/04`: dãy workspace có tên như tab hay một bộ chọn mở ra khi bấm như hình? Nút `+` để tạo workspace hay thêm workspace có sẵn vào dãy?
2. `UXR-05`: thay vùng thông báo dưới thanh trái bằng một nút Thông báo có mở danh sách?
3. `UXR-06/07/10`: duyệt vị trí Gantt–Danh sách, Tạo việc và điều hướng trục thời gian?
4. `UXR-01`: tên Snote có là nút về “Việc của tôi”? Lối vào “Lịch của tôi” và Lớp học thuộc cấp toàn ứng dụng, cần thiết kế cùng vỏ ứng dụng sau.

Bản này chỉ nằm ở `review/blocked/`, chưa chuyển sang `docs/ux/`.
