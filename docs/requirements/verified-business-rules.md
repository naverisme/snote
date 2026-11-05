# SNOTE v2 — Quy tắc nghiệp vụ đã xác nhận

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Hành vi được chủ sản phẩm xác nhận trong cuộc trao đổi về v2 |
| Trạng thái | Đã đối chiếu trong phạm vi mệnh đề dưới đây; không phải SRS đầy đủ hay phê duyệt triển khai |
| Nguồn | [Hồ sơ nguồn](../../review/provenance.md), SRC-01 đến SRC-07; [PR #6](https://github.com/naverisme/snote/pull/6) |

Định nghĩa lớp, nhóm và workspace ở [khái niệm sản phẩm](../product/concepts.md). Quy tắc chi tiết chưa nêu dưới đây không được lấy từ hồ sơ cũ.

## Tư cách và quyền

Khi đăng ký, người dùng tự chọn Người học, Giáo viên hoặc Quản lý cá nhân; có thể chọn cả học và dạy trên cùng tài khoản, cũng như đổi cách dùng sau này. Người tự chọn Giáo viên được tạo lớp mà không cần duyệt vai trò riêng. Quyền với nội dung của từng lớp/workspace vẫn theo tư cách và vai trò tại phạm vi ấy.

| Phạm vi | Quy tắc |
| --- | --- |
| Lớp | Chỉ tài khoản tự chọn Giáo viên mở lớp. Lớp mới mặc định không công khai; người học vào bằng lời mời hoặc mã lớp, gửi yêu cầu và giáo viên duyệt trước khi tư cách có hiệu lực. Lớp là cấp trên các workspace nhóm thuộc lớp. |
| Workspace nhóm | Giáo viên tạo nhóm hoặc cấp quyền tạo. Người được ủy quyền tạo mặc định là admin workspace ấy, giáo viên có thể đổi. Thành viên được mời/xếp vào nhóm phải chấp nhận trước khi tư cách có hiệu lực. |
| Yêu cầu vào nhóm | Mặc định giáo viên, lớp trưởng và trưởng nhóm của workspace đó có thể duyệt; giáo viên có thể cấu hình lại. Mặc định mỗi người học có tối đa một nhóm đang hoạt động trong cùng lớp; giáo viên có thể đổi giới hạn trong cài đặt lớp. |
| Rời nhóm | Thành viên có thể rời. Trưởng nhóm hoặc người đang phụ trách việc phải bàn giao trước; việc và lịch sử vẫn thuộc workspace. |
| Giáo viên | Được xem, sửa và xóa toàn bộ **nội dung chung** trong các workspace nhóm của lớp mình. Quyền này không tự mở nội dung riêng của người học. |
| Lớp trưởng | Mặc định được xem và sửa công việc, lịch và ghi chú chung của mọi nhóm trong lớp; giáo viên có thể chỉnh quyền. Quyền xóa mặc định chưa được chốt. |
| Trưởng nhóm | Quản lý workspace nhóm mình, không tự có quyền quản lý lớp hoặc nhóm khác. Một workspace có thể được nhiều người quản lý tùy cấu hình giáo viên. |

## Thư viện, công việc và lịch

- Workspace cá nhân mặc định được tạo khi đăng ký; người dùng vẫn có thể tạo thêm workspace.
- Thư viện lưu văn bản/ghi chú, đường dẫn và tệp; các mục được phân loại trong thư mục. Hộp thu của Thư viện thuộc workspace cá nhân mặc định nhận mục lưu nhanh và riêng tư cho chủ tài khoản.
- “Việc của tôi” tổng hợp việc cá nhân và việc được giao từ mọi workspace còn quyền truy cập; màn Công việc của workspace chỉ hiện việc thuộc workspace ấy.
- Việc cá nhân và việc giao cho thành viên đều có thể không đặt hạn. Khi giao việc, khoảng được giao để hoàn thành bắt đầu từ lúc giao; người giao chọn mốc kết thúc nếu đặt hạn. Người đảm nhận tự sắp các buổi làm riêng; buổi làm sau hạn vẫn lưu và được đánh dấu “Làm muộn”, không tự đổi hạn.
- “Thời lượng còn lại” là đếm ngược đến hạn; việc chưa hoàn thành quá hạn thì đếm thời gian quá hạn. Với hạn chỉ có ngày, mốc quá hạn là 00:00 ngày kế tiếp theo múi giờ áp dụng cho việc; hạn kèm giờ tính từ thời điểm đã đặt.
- Checklist hiển thị số mục và tỷ lệ hoàn thành (3/5 = 60%). Hoàn thành việc là thao tác xác nhận riêng, không tự động theo checklist.
- Bộ lọc Hôm nay gồm việc có hạn hôm nay hoặc có buổi làm riêng hôm nay; Ngày mai dùng cùng cách tính. Một việc thỏa cả hai điều kiện chỉ hiện một lần trong cùng bộ lọc. Việc quá hạn chưa xong cần nhãn hoặc bộ lọc riêng. Thứ tự hiển thị mặc định có thể chỉnh; độ ưu tiên khi sắp xếp và cách phá hòa chưa chốt.
- Mức quan trọng có ba mức Cao, Vừa, Thấp. Mức này không tự đổi hạn hoặc lịch làm. Ai được sửa mức của việc được giao còn cần xác nhận.
- “Lịch của tôi” tổng hợp xuyên workspace. Lịch cũng chứa sự kiện độc lập với việc, như lịch học, lịch thi, hẹn riêng. Sự kiện của lớp xuất hiện trong Lịch của tôi và Lịch của workspace nhóm liên quan; lịch làm cá nhân không tự công khai cho các thành viên khác.

## Bài giao và nộp

| Phạm vi | Quy tắc |
| --- | --- |
| Giao bài | Giáo viên giao cùng bài cho cả lớp hoặc chọn nhóm. Mỗi nhóm có tiến độ và bản nộp của riêng nhóm. |
| Tiến độ | Giáo viên xem riêng số việc hoàn thành/tổng số việc, tiến độ checklist từng việc và cập nhật bằng văn bản do nhóm gửi. Chưa tính một phần trăm tổng hợp cho cả nhóm khi chưa chốt trọng số. |
| Nộp và sửa | Mặc định trưởng nhóm bấm Nộp và sửa bản nộp; giáo viên có thể cấp quyền ấy cho thành viên khác. Sửa bản nộp ghi lịch sử phiên bản, người sửa và thời điểm. |
| Hạn | Trước và đến hạn, bản nộp được sửa. Sau hạn, mặc định khóa cả nộp lần đầu lẫn sửa bản đã nộp. Giáo viên có hai cài đặt **riêng** để cho phép từng hành động sau hạn. |
| Ưu tiên cài đặt | Cài đặt lớp là mặc định chung; cài đặt tường minh trên từng bài giao được ưu tiên hơn mặc định lớp. |
| Kiểu hạn bài | Giáo viên có thể chọn ngày kèm giờ hoặc chỉ ngày; hạn chỉ ngày kết thúc vào cuối ngày ấy theo múi giờ lớp. |

**Giới hạn:** chưa có ma trận quyền cho mọi thao tác, quy tắc sắp xếp chi tiết, trọng số tiến độ tổng hợp, quy tắc phản hồi/đổi hạn sau nộp, wireframe hay API được duyệt. Xem [vấn đề chưa chốt](../../review/unresolved.md).
