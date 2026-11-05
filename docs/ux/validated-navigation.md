# SNOTE v2 — Điều hướng đã xác nhận

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Phân cấp tính năng và cách xem trong workspace, phạm vi cá nhân và lớp |
| Trạng thái | Đã đối chiếu ở mức được nói rõ; **chưa duyệt wireframe hay hợp đồng lệnh** |
| Nguồn | [Hồ sơ nguồn](../../review/provenance.md), SRC-03 đến SRC-08; [PR #6](https://github.com/naverisme/snote/pull/6) |

## Cấp tính năng

Khi đăng ký, người dùng tự chọn một hoặc nhiều cách dùng: Quản lý cá nhân, Người học, Giáo viên; có thể thay đổi sau. Mọi tài khoản có workspace cá nhân mặc định. Chọn Giáo viên làm xuất hiện lối vào Lớp học và thao tác tạo lớp, nhưng không yêu cầu tạo lớp ngay khi đăng ký; Giáo viên vẫn dùng workspace cá nhân. Chọn Người học làm xuất hiện phạm vi các lớp đang học. Quyền thao tác bên trong lớp và workspace còn phụ thuộc vai trò trong chính phạm vi đó. Vị trí chính xác của các lối vào này chưa được duyệt.

Trong một workspace, **Công việc | Lịch | Thư viện** là các mục ngang cấp, đứng gần nhau. **Thư viện ở cạnh Lịch** để người dùng mở bất cứ khi nào cần. Khi xem Công việc hoặc Lịch, vùng nội dung chính chỉ trình bày tính năng được chọn, không đồng thời hiện ghi chú gây xao nhãng. Thư viện chứa Hộp thu (ở workspace cá nhân mặc định), thư mục và các mục văn bản/ghi chú, đường dẫn, tệp.

“Việc của tôi” và “Lịch của tôi” là phạm vi tổng hợp xuyên workspace; Công việc và Lịch bên trong một workspace chỉ theo workspace đó. Sự kiện lớp còn hiện trong Lịch của tôi và Lịch của những workspace nhóm liên quan.

## Chế độ xem công việc

**Gantt** là chế độ mặc định. **Danh sách** là chế độ cùng cấp để xem tổng quan và quản lý nhiều việc, gồm lưu trữ hoặc xóa hàng loạt theo quyền. Các chế độ cùng quan sát các việc trong phạm vi đang chọn. Người dùng có thể lọc theo Hôm nay, Ngày mai, Quan trọng và thay đổi cách sắp xếp mặc định. Hôm nay và Ngày mai gồm việc có hạn hoặc lịch làm riêng trong ngày tương ứng và không lặp một việc trong cùng bộ lọc. Mức quan trọng gồm Cao, Vừa, Thấp. Cách sắp xếp chi tiết, biểu diễn thanh Gantt, khả năng chỉnh sửa trên trục và các hành động chi tiết chưa được duyệt.

**Giới hạn:** vị trí và số lượng các nút khác, loại thành phần, lệnh/API từng nút, cách chọn ngày/tuần/tháng, trạng thái tải/trống/lỗi và wireframe chi tiết cần được xác nhận riêng. Không áp dụng các bản vẽ giao diện trong lịch sử Git. Xem [hồ sơ rà soát](../../review/unresolved.md).
