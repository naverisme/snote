# Q33-C — Đề xuất màn Lớp học

| Trường | Giá trị |
| --- | --- |
| Trạng thái | C1–C5 đã chuyển vào [điều hướng lớp được duyệt](../../docs/ux/class-navigation.md); các màn con và kiểu chi tiết khác còn đề xuất, không dùng làm yêu cầu coding |
| Phạm vi | Danh sách lớp, lớp đang mở, nhóm (workspace thuộc lớp), thành viên và cài đặt theo quyền |
| Quy tắc nguồn | [CLS-01 đến CLS-12](../../docs/requirements/class-membership.md), [PER-01 đến PER-08](../../docs/requirements/permissions.md), [ASG-01](../../docs/requirements/assignments-and-submissions.md), [NAV-01/02](../../docs/ux/validated-navigation.md) |

**Lớp là cấp trên workspace nhóm trong dữ liệu.** Trên giao diện, lối chọn Lớp học **cùng cấp và đứng cạnh lối chọn workspace** trong vùng chọn ngữ cảnh. Ba mục Công việc/Lịch trình/Thư viện là tính năng của workspace; khi vào lớp, chính vùng điều hướng tính năng đó đổi thành các mục của lớp. Mở một nhóm sẽ vào workspace nhóm ở Công việc theo C4. Nếu tài khoản vừa học vừa dạy, cùng một lối Lớp học hiển thị các lớp theo tư cách thực tế, không đòi tạo hai tài khoản. Cách trình bày các hàng trong danh sách nhiều lớp vẫn cần duyệt.

| Mã | Cấp, vị trí, thành phần cùng nhóm | Số lượng, loại đề xuất | Hành động hoặc thông tin hiển thị | Nguồn/ràng buộc |
| --- | --- | --- | --- | --- |
| CLUX-01 | Vùng chọn ngữ cảnh, **cạnh và cùng cấp** lối chọn workspace; ngoài vùng tính năng | 1 lối Lớp học mở danh sách lớp, không tính trong hai icon của bộ chọn workspace | Chọn lớp trong danh sách mới đổi ngữ cảnh. Kiểu icon và cách trình bày mỗi lớp còn chờ duyệt. | C1, CUXC-01 |
| CLUX-02 | Vùng chính khi ở Lớp học | 1 danh sách lớp, một dòng mỗi lớp; 1 chỉ dấu vai trò trên dòng | Chọn lớp để vào màn lớp. Phân biệt lớp đang học, lớp dạy và lớp lưu trữ theo tư cách. | CLS-01/10; cách nhóm danh sách đề xuất |
| CLUX-03 | Đầu danh sách lớp | 1 nút Tạo lớp chỉ cho tài khoản chọn Giáo viên, 1 nút Tham gia lớp cho người học | Tạo lớp khi xác nhận; tham gia qua mã lớp gửi yêu cầu chờ duyệt. Lời mời nhận có lối Chấp nhận riêng. | CLS-01–03 |
| CLUX-04 | Đầu màn một lớp | 1 tiêu đề tên lớp, 1 chỉ dấu tư cách/quyền hiện hành, 1 nút quay lại danh sách | Hiện đúng lớp đang mở; không là tên workspace nhóm. | CLS-01, PER-01/02 |
| CLUX-05 | **Cùng vùng tính năng ở thanh bên** nơi workspace hiện Công việc/Lịch trình/Thư viện; thay ba mục ấy khi lớp đang mở | 5 mục Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt; **ẩn Cài đặt** nếu không có quyền quản lý lớp | Chỉ một vùng tính năng cấp lớp hiện theo mục được chọn. Thứ tự, icon và trạng thái chọn còn đề xuất; không đặt thêm hàng tab dưới tiêu đề lớp. | C2, CUXC-02 |
| CLUX-06 | Vùng Nhóm của lớp | Đề xuất 1 danh sách nhóm, mỗi nhóm 1 dòng/tile, 1 nút Tạo nhóm khi có quyền | Chọn nhóm vào workspace nhóm với Công việc là mục đầu; trở lại qua lối Lớp học. Các trường hiển thị trên hàng nhóm còn đề xuất. | CLS-04/06, C4 |
| CLUX-07 | Vùng Thành viên, phần lời mời và yêu cầu | 1 nhóm lời mời đến cho chính mình; 1 nhóm yêu cầu chờ duyệt nếu có quyền | Người học Chấp nhận/Từ chối lời mời trước khi tư cách hiệu lực. Yêu cầu qua mã lớp do giáo viên duyệt; yêu cầu vào nhóm do người có quyền theo PER-04 duyệt khi còn chỗ. | CLS-02/03/05/11, PER-04 |
| CLUX-08 | Vùng Thành viên, danh sách người | 1 danh sách theo lớp; thông tin vai trò/nhóm theo người và quyền | Giáo viên quản lý tư cách, lớp trưởng và quyền được cấp; trưởng nhóm chỉ quản lý trong workspace nhóm, không nhờ vai trò đó mà sửa cài đặt lớp. | PER-01–06; thao tác cụ thể trong ma trận quyền còn R-02 |
| CLUX-09 | Vùng Cài đặt lớp theo quyền giáo viên | 1 biểu mẫu cài đặt và các điều khiển quyền theo chức năng | Giáo viên đổi giới hạn nhóm, người được tạo nhóm/duyệt yêu cầu và quyền lớp trưởng; thay đổi không tự vô hiệu tư cách đã có khi giảm giới hạn. | CLS-06/11, PER-02/04/06 |
| CLUX-10 | Phần quản lý vòng đời lớp theo quyền chủ lớp | 1 nút Lưu trữ; khi lớp lưu trữ có nút Khôi phục theo quyền | Lưu trữ lớp vẫn giữ lịch sử; chủ lớp khôi phục. Chuyển chủ lớp hoạt động cần Giáo viên khác chấp nhận. | CLS-10/12 |

## Trạng thái và màn nhỏ

| Trạng thái | Phương án đề xuất |
| --- | --- |
| Chưa có lớp | Giáo viên thấy Tạo lớp; người học thấy Tham gia lớp; cùng tài khoản có thể thấy cả hai. |
| Lớp chưa có nhóm, bài giao hoặc sự kiện | Thông báo trong đúng mục Nhóm, Bài giao hoặc Lịch lớp, không trộn nội dung các mục. |
| Lời mời chờ chấp nhận | Hiện trạng thái chờ, không coi người học đã là thành viên. |
| Hết chỗ theo giới hạn nhóm | Tắt/không cho hoàn tất duyệt và giải thích giới hạn; lời mời cũ hết hiệu lực theo CLS-07/11. |
| Lớp đã lưu trữ | Hiện nhãn lưu trữ, chỉ những thao tác phù hợp với trạng thái và quyền; chi tiết khả năng chỉnh sửa khi lưu trữ còn R-09. |
| Điện thoại | Năm mục lớp (trừ Cài đặt khi không có quyền) trong danh sách thu gọn mở dọc; chọn mục thì đóng và hiển thị một màn. Cách trình bày các hàng lớp/nhóm còn đề xuất. |

## Điểm còn mở

C1–C5 đã chốt một lối lớp, danh mục theo quyền, ẩn “Mục lưu ý” trong lớp, mở nhóm và menu dọc điện thoại. Còn kiểu icon/trạng thái chọn và cách trình bày danh sách nhiều lớp; thứ tự/biểu tượng năm mục; chi tiết các hàng nhóm, màn Thành viên và Cài đặt. CLUX-07 đề xuất hai vùng lời mời/yêu cầu trong Thành viên, chưa được duyệt. Các thành phần CLUX-02–04 và CLUX-07–10 chỉ là bản xem trước.

Không tự đặt quyền đọc mọi tệp/đường dẫn của lớp trưởng; [PER-02](../../docs/requirements/permissions.md) yêu cầu cấp riêng. Không coi trưởng nhóm là người quản trị lớp.
