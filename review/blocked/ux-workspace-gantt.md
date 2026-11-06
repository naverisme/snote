# Q32 — Đánh giá Gantt theo bản vẽ người dùng

| Trường | Giá trị |
| --- | --- |
| Trạng thái | UXR-03 đến UXR-06 đã được chủ sản phẩm sửa nghĩa; các chi tiết còn lại và Q32 tổng thể chưa chốt |
| Nguồn | Hình `Biểu đồ không có tiêu đề.drawio.png` và lời giải thích UXR-03 đến UXR-06 người dùng gửi ngày 2026-11-06 |
| Đã chốt trước | Công việc, Lịch, Thư viện ngang cấp trong workspace; Gantt mặc định, Danh sách cùng cấp, mở chi tiết để sửa; lịch làm riêng không lộ cho người khác. [NAV-04, NAV-05](../../docs/ux/validated-navigation.md) · [VIEW-01 đến VIEW-04](../../docs/ux/task-views.md) |

## Đọc bản vẽ

Thanh trái có Snote, ba mục Công việc/Lịch trình/Thư viện và bên dưới là một danh mục **Mục lưu ý**. Đầu vùng chính có cụm biểu tượng workspace dạng xếp lớp; chỉ tối đa hai biểu tượng được nhìn thấy khi thu gọn. Bấm cụm biểu tượng thì bung dãy workspace theo chiều ngang, với chức năng tạo workspace ở mép trái. “Chế độ xem” là **nút chuyển Gantt/Danh sách công việc**; Gantt được chọn mặc định. Phần giữa dành cho Gantt, phía trên có “sắp xếp” và “lọc”.

Không lấy nhãn “Chế độ xem” để gọi cụm biểu tượng workspace. Số lượng dưới đây là trên một màn, trừ nơi ghi theo số workspace/việc. Tên hành động là thao tác người dùng; API sẽ ở `contracts/` sau khi duyệt.

| Mã | Vị trí, nhóm và cấp | Số lượng, loại | Khi thao tác | Đề xuất với hình |
| --- | --- | --- | --- | --- |
| UXR-01 | Đầu thanh trái, vỏ ứng dụng | 1 tên/logo Snote, nhãn hoặc nút | Nếu là nút, về phạm vi cá nhân. | Giữ tên, cần quyết định nó có bấm được không. |
| UXR-02 | Thanh trái, **trong workspace đang chọn** | 3 nút Công việc, Lịch trình, Thư viện | Thay vùng chính bằng đúng một tính năng. | Giữ ba mục sát nhau; chọn Công việc thì không hiện ghi chú. |
| UXR-03 | Đầu vùng chính, cấp workspace, nằm trên nội dung chức năng | 1 cụm icon xếp lớp khi thu gọn, nhìn thấy tối đa 2 icon; khi mở có một icon cho mỗi workspace và một icon đổi sang danh sách | Bấm cụm để bung dãy ngang; bấm icon workspace để chọn; giữ và kéo trái/phải để tìm, chọn workspace mong muốn trên máy tính và điện thoại; icon đổi góc nhìn mở danh sách workspace. Vùng chính theo workspace được chọn. | Workspace đang mở nổi phía trước, workspace chưa chọn chìm phía sau, có hiệu ứng mờ dần. Máy tính mặc định ẩn tên, hiện tên khi hover; điện thoại hiện tên bên phải icon workspace. Vị trí chính xác của icon đổi góc nhìn, dạng danh sách và quy tắc kết thúc thao tác kéo còn cần duyệt. |
| UXR-04 | **Bên trái ngoài cùng** của dãy UXR-03 khi đã bung ra | 1 icon Tạo workspace | Bấm để mở thao tác tạo workspace. | Ở trạng thái thu gọn không hiện icon này. Workspace cá nhân mặc định [ACC-06](../../docs/requirements/accounts-and-workspaces.md) không cho chia sẻ. |
| UXR-05 | Thanh trái, bên dưới ba mục tính năng, danh mục **Mục lưu ý** | 1 tiêu đề danh mục; số dòng xem trước theo thông tin cần lưu ý | Hiển thị **một phần** thông tin, ví dụ tiêu đề ghi chú đã ghim, việc gần đến hạn, lịch trình sắp đến giờ. | Đây là vùng thông tin xem nhanh, không phải một nút Thông báo. Nguồn dữ liệu, số dòng tối đa, thứ tự ưu tiên và hành động khi bấm một dòng chưa được chốt. |
| UXR-06 | Đầu Công việc, nhóm chế độ xem | **1 nút Chế độ xem** chuyển Gantt/Danh sách | Bấm để đổi cách xem công việc; mặc định Gantt. | Nút này khác cụm workspace UXR-03. Nhãn, icon và trạng thái thể hiện chế độ hiện tại còn cần quy định. |
| UXR-07 | Cạnh UXR-06, trong Công việc | 1 nút Tạo việc theo quyền | Mở tạo việc trong workspace hiện tại. | Thêm vào hình; việc không bắt buộc có hạn. |
| UXR-08 | Đầu Công việc, nhóm hiển thị | 1 điều khiển Lọc | Đổi tập việc đang nhìn thấy; có lối bỏ lọc. | Giữ vị trí, hiện dấu đang áp lọc. Các lựa chọn trong popup cần duyệt. |
| UXR-09 | Cạnh Lọc, nhóm hiển thị | 1 điều khiển Sắp xếp | Đổi thứ tự hàng; lưu mặc định là thao tác riêng. | Giữ vị trí; trong Gantt chỉ sắp xếp hàng, không đảo trục thời gian. |
| UXR-10 | Trên lưới Gantt | 3 nút Trước/Hôm nay/Sau, 1 nhãn khoảng, 1 bộ chọn độ chi tiết | Đổi khoảng thời gian/độ chi tiết trục. | Hình chưa có; “Hôm nay” ở đây đưa trục về hiện tại, khác lọc việc hôm nay. Ngày/Tuần là đề xuất. |
| UXR-11 | Vùng chính Gantt | 1 lưới tên việc + trục thời gian, số hàng theo việc | Chọn hàng để mở chi tiết, không kéo để sửa bản đầu. | Giữ Gantt là tâm màn; hạn và buổi làm riêng phải có cách vẽ tách nghĩa. |
| UXR-12 | Gắn với lưới Gantt | 1 nhóm việc chưa có mốc nếu phát sinh | Mở chi tiết việc. | Việc không hạn và không có buổi làm nhìn thấy không được vẽ thanh giả. |
| UXR-13 | Khi chọn việc | 1 vùng chi tiết bên phải trên máy tính, màn riêng trên điện thoại | Xem/sửa theo quyền, gồm hạn, checklist, phụ trách, lịch làm riêng của mình. | Tránh nhồi nút sửa trên thanh Gantt. |
| UXR-14 | Khi chuyển Danh sách | 1 danh sách, ô chọn theo hàng có quyền; nhóm thao tác hàng loạt xuất hiện khi chọn | Lưu trữ/xóa nhiều theo quyền và xác nhận. | Danh sách giữ mục đích quản lý hàng loạt đã chốt. |

## Trạng thái cụm workspace theo phần bạn đã giải thích

| Trạng thái | Những gì nhìn thấy | Hành động được mô tả |
| --- | --- | --- |
| Thu gọn | Tối đa hai icon xếp lớp, workspace đang mở nổi, icon còn lại chìm, hiệu ứng mờ dần. Máy tính giấu tên cho tới khi hover; điện thoại hiện tên bên phải icon. | Bấm icon/cụm để bung dãy. |
| Bung ngang | Icon Tạo workspace ở đầu trái, tiếp đến các icon workspace theo chiều ngang và một icon đổi sang dạng danh sách. | Bấm icon để chọn workspace; giữ và kéo qua hai phía trên cả máy tính lẫn điện thoại để tìm/chọn. |
| Dạng danh sách | Một cách nhìn khác của cùng tập workspace; kiểu từng dòng chưa được cung cấp. | Icon chuyển góc nhìn đưa từ dãy ngang sang danh sách. Hành động quay lại dãy ngang cần đặc tả tiếp. |
| Đã chọn workspace | Nội dung vùng chính chuyển sang workspace đó, cụm thu gọn làm nổi icon hiện hành. | Cách xử lý mục Công việc/Lịch/Thư viện đang chọn khi workspace đổi chưa được nêu riêng. |

## Trạng thái và điện thoại

| Tình huống | Đề xuất |
| --- | --- |
| Đang tải | Giữ tên workspace và điều hướng, chỉ vùng nội dung hiện trạng thái tải. |
| Chưa có việc | Nêu rõ và hiện Tạo việc nếu được phép. |
| Lọc không có kết quả | Nêu bộ lọc hiện tại, có lối bỏ lọc. |
| Lỗi hoặc hết quyền | Thử lại với lỗi tạm; chọn workspace khác khi hết quyền. |
| Điện thoại | Ba mục vẫn ngang cấp; tên workspace ở bên phải icon; cụm thu gọn tối đa hai icon, bấm để bung ngang và giữ-kéo hai phía để chọn. Gantt cuộn ngang trong lưới; chi tiết là màn riêng. |

## Những lựa chọn cần phản hồi

1. `UXR-03`: ở danh sách workspace, một dòng gồm những thông tin nào; icon chuyển đổi góc nhìn đặt cạnh cụm hay trong dãy bung; thao tác kéo chọn ngay khi thả hay chỉ cuộn tới icon rồi bấm chọn?
2. `UXR-05`: Mục lưu ý lấy dữ liệu trong workspace đang mở hay tổng hợp xuyên workspace; tối đa bao nhiêu dòng và bấm vào tiêu đề sẽ mở mục nguồn thế nào?
3. `UXR-06/07/10`: nút Chế độ xem thể hiện chế độ hiện tại và chế độ sẽ chuyển sang bằng chữ/icon ra sao; vị trí Tạo việc và điều hướng trục thời gian?
4. `UXR-01`: tên Snote có là nút về “Việc của tôi”? Lối vào “Lịch của tôi” và Lớp học thuộc cấp toàn ứng dụng, cần thiết kế cùng vỏ ứng dụng sau.

Bản này chỉ nằm ở `review/blocked/`, chưa chuyển sang `docs/ux/`.
