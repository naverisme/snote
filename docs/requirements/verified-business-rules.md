# SNOTE v2 — Quy tắc nghiệp vụ đã xác nhận

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Hành vi được chủ sản phẩm xác nhận trong cuộc trao đổi về v2 |
| Trạng thái | Đã đối chiếu trong phạm vi mệnh đề dưới đây; không phải SRS đầy đủ hay phê duyệt triển khai |
| Nguồn | [Hồ sơ nguồn](../../review/provenance.md), SRC-01 đến SRC-10; [PR #6](https://github.com/naverisme/snote/pull/6) |

Định nghĩa lớp, nhóm và workspace ở [khái niệm sản phẩm](../product/concepts.md). Quy tắc chi tiết chưa nêu dưới đây không được lấy từ hồ sơ cũ.

## Tư cách và quyền

Khi đăng ký, người dùng tự chọn Người học, Giáo viên hoặc Quản lý cá nhân; có thể chọn cả học và dạy trên cùng tài khoản, cũng như đổi cách dùng sau này. Mọi tài khoản, kể cả Giáo viên, đều có workspace cá nhân mặc định. Người tự chọn Giáo viên được tạo lớp mà không cần duyệt vai trò riêng và không bắt buộc tạo lớp lúc đăng ký. Quyền với nội dung của từng lớp/workspace vẫn theo tư cách và vai trò tại phạm vi ấy.

| Phạm vi | Quy tắc |
| --- | --- |
| Lớp | Chỉ tài khoản tự chọn Giáo viên mở lớp, khi cần. Lớp mới mặc định không công khai. Nếu giáo viên mời, người học chấp nhận là thành viên có hiệu lực, không cần giáo viên duyệt lần hai; nếu dùng mã lớp, người học gửi yêu cầu và giáo viên duyệt trước khi thành viên có hiệu lực. Lớp là cấp trên các workspace nhóm thuộc lớp. |
| Workspace nhóm | Mặc định giáo viên tạo nhóm; giáo viên có thể cấp quyền này cho lớp trưởng hoặc người học cụ thể. Người được ủy quyền tạo mặc định là trưởng nhóm kiêm admin workspace ấy; giáo viên có thể đổi sau. Thành viên được mời/xếp vào nhóm phải chấp nhận trước khi tư cách có hiệu lực. |
| Yêu cầu vào nhóm | Người học tự gửi yêu cầu thì tư cách có hiệu lực sau khi người có quyền duyệt, không cần họ chấp nhận lần hai. Mặc định giáo viên, lớp trưởng và trưởng nhóm của workspace đó có thể duyệt; giáo viên có thể cấu hình lại. Mặc định mỗi người học có tối đa một nhóm đang hoạt động trong cùng lớp; giáo viên có thể đổi giới hạn trong cài đặt lớp. Có thể có nhiều lời mời đang chờ; khi giới hạn là một và người học vào một nhóm, lời mời nhóm khác hết hiệu lực, biến khỏi danh sách chờ và được lưu trữ làm lịch sử. |
| Rời nhóm | Thành viên có thể rời. Trưởng nhóm hoặc người đang phụ trách việc phải bàn giao trước; việc và lịch sử vẫn thuộc workspace. |
| Rời lớp | Người học được tự rời lớp sau khi rời mọi nhóm thuộc lớp và hoàn tất bàn giao vai trò/công việc đang phụ trách. Lịch sử việc và bài nộp vẫn được giữ. |
| Giáo viên | Được xem, sửa và xóa toàn bộ **nội dung chung** trong các workspace nhóm của lớp mình. Quyền này không tự mở nội dung riêng của người học. |
| Lớp trưởng | Mỗi lớp có tối đa một lớp trưởng chính; giáo viên có thể cấp quyền hỗ trợ cho người khác. Lớp trưởng mặc định được xem và sửa công việc, lịch và ghi chú chung của mọi nhóm, nhưng không được xóa mặc định; giáo viên có thể cấp quyền xóa. Quyền này không tự bao gồm sửa bài giao cấp lớp. |
| Trưởng nhóm và người quản lý thêm | Mỗi nhóm có một trưởng nhóm chính. Giáo viên có thể cho thêm người quản lý workspace; các quyền quản lý workspace không tự cấp quyền sửa bài giao cấp lớp hoặc quyền Nộp bài. Trưởng nhóm không tự quản lý lớp/nhóm khác. |
| Bài giao cấp lớp | Mặc định chỉ giáo viên tạo và sửa bài giao cấp lớp. Lớp trưởng và trưởng nhóm không tự có quyền sửa; giáo viên có thể ủy quyền riêng. |
| Chủ lớp | Bản đầu chưa có vai trò đồng giáo viên riêng; giáo viên chủ lớp có thể ủy quyền từng chức năng. Giáo viên có thể lưu trữ lớp; muốn rời lớp đang hoạt động thì phải chuyển quyền chủ lớp cho tài khoản Giáo viên khác và người nhận chấp nhận. |
| Thu hồi quyền ủy quyền | Có hiệu lực với thao tác mới ngay khi thu hồi; lịch sử các thao tác trước đó vẫn giữ. |

## Thư viện, công việc và lịch

- Workspace cá nhân mặc định được tạo khi đăng ký; người dùng vẫn có thể tạo thêm workspace.
- Thư viện lưu văn bản/ghi chú, đường dẫn và tệp; các mục được phân loại trong thư mục. Hộp thu của Thư viện thuộc workspace cá nhân mặc định nhận mục lưu nhanh và riêng tư cho chủ tài khoản.
- Mục mới trong Thư viện của workspace nhóm mặc định là nội dung chung theo quyền workspace. Người dùng chọn workspace cá nhân để lưu riêng. Đưa mục từ workspace cá nhân sang nhóm bằng thao tác **sao chép** rõ ràng: bản gốc riêng vẫn ở nguồn, bản sao chịu quyền của nhóm.
- “Việc của tôi” tổng hợp việc cá nhân và việc được giao từ mọi workspace còn quyền truy cập; màn Công việc của workspace chỉ hiện việc thuộc workspace ấy.
- Việc cá nhân và việc giao cho thành viên đều có thể không đặt hạn. Khi giao việc, khoảng được giao để hoàn thành bắt đầu từ lúc giao; người giao chọn mốc kết thúc nếu đặt hạn. Người đảm nhận tự sắp các buổi làm riêng; buổi làm sau hạn vẫn lưu và được đánh dấu “Làm muộn”, không tự đổi hạn.
- “Thời lượng còn lại” là đếm ngược đến hạn; việc chưa hoàn thành quá hạn thì đếm thời gian quá hạn. Với hạn chỉ có ngày, mốc quá hạn là 00:00 ngày kế tiếp theo múi giờ áp dụng cho việc; hạn kèm giờ tính từ thời điểm đã đặt.
- Mỗi việc có một người phụ trách chính. Nếu nhiều người cùng làm thì có thể chia thành các việc riêng hoặc các bước checklist của việc chung; quyền phụ trách của từng bước chưa được đặc tả.
- Giao việc cho một thành viên hiệu lực ngay và thông báo cho người đó, không cần họ chấp nhận như khi vào nhóm. Người nhận có thể yêu cầu đổi người phụ trách; quy trình xử lý yêu cầu chưa được đặc tả.
- Người giao hoặc người có quyền quản lý việc được giao sửa hạn và mức quan trọng; người nhận cập nhật checklist, trạng thái và lịch làm riêng. Quyền sửa việc chung của lớp trưởng theo cấu hình lớp vẫn áp dụng. Mỗi lần đổi hạn được ghi lịch sử.
- Checklist hiển thị số mục và tỷ lệ hoàn thành (3/5 = 60%). Hoàn thành việc là thao tác xác nhận riêng, không tự động theo checklist. Người phụ trách hoặc người quản lý được mở lại việc đã hoàn thành; ghi người và thời điểm mở lại.
- Bộ lọc Hôm nay gồm việc có hạn hôm nay hoặc có buổi làm riêng hôm nay; Ngày mai dùng cùng cách tính. Một việc thỏa cả hai điều kiện chỉ hiện một lần trong cùng bộ lọc. Việc quá hạn chưa xong có nhãn hoặc bộ lọc riêng.
- Thứ tự mặc định của “Việc tiếp theo”: việc quá hạn chưa xong, rồi việc đến hạn hôm nay, rồi việc có buổi làm hôm nay. Trong từng nhóm xét hạn gần trước, sau đó mức quan trọng; người dùng được đổi thứ tự mặc định. Quy tắc phá hòa hoàn toàn và thứ tự với việc cùng thuộc nhiều nhóm con chưa đặc tả.
- Mức quan trọng có ba mức Cao, Vừa, Thấp. Mức này không tự đổi hạn hoặc lịch làm. Với việc được giao, người giao hoặc người có quyền quản lý việc được sửa mức; việc cá nhân do chủ việc sửa.
- “Lịch của tôi” tổng hợp xuyên workspace. Lịch cũng chứa sự kiện độc lập với việc, như lịch học, lịch thi, hẹn riêng. Khi tạo sự kiện lớp, giáo viên chọn áp dụng cả lớp hoặc các nhóm cụ thể; sự kiện xuất hiện trong Lịch của tôi và Lịch các workspace nhóm liên quan theo quyền. Lịch làm cá nhân không tự công khai cho các thành viên khác.
- Giáo viên và người quản lý workspace nhóm được tạo sự kiện chung của nhóm. Lớp trưởng tạo sự kiện chung khi giáo viên cấp quyền; thành viên tự tạo sự kiện riêng.

## Bài giao và nộp

| Phạm vi | Quy tắc |
| --- | --- |
| Giao bài | Giáo viên giao cùng bài cho cả lớp hoặc chọn nhóm. Mỗi nhóm có tiến độ và bản nộp của riêng nhóm. |
| Tiến độ | Giáo viên xem riêng số việc hoàn thành/tổng số việc, tiến độ checklist từng việc và cập nhật bằng văn bản do nhóm gửi. Chưa tính một phần trăm tổng hợp cho cả nhóm khi chưa chốt trọng số. |
| Nội dung bản nộp | Gồm văn bản, đường dẫn và tệp. Khi Nộp, lưu nội dung của đúng phiên bản đó; chỉnh một mục trong Thư viện sau này không tự đổi bản đã nộp. |
| Nộp và sửa | Mặc định trưởng nhóm chính bấm Nộp và sửa bản nộp; người quản lý thêm không tự có quyền này, giáo viên có thể cấp riêng cho thành viên khác. Sửa bản nộp ghi lịch sử phiên bản, người sửa và thời điểm. |
| Hạn | Trước và đến hạn, bản nộp được sửa. Sau hạn, mặc định khóa cả nộp lần đầu lẫn sửa bản đã nộp. Giáo viên có hai cài đặt **riêng** để cho phép từng hành động sau hạn. |
| Ưu tiên cài đặt | Cài đặt lớp là mặc định chung; cài đặt tường minh trên từng bài giao được ưu tiên hơn mặc định lớp. |
| Kiểu hạn bài | Giáo viên có thể chọn ngày kèm giờ hoặc chỉ ngày; hạn chỉ ngày kết thúc vào cuối ngày ấy theo múi giờ lớp. |
| Đổi hạn sau khi nộp | Ghi lịch sử đổi hạn. Trạng thái đúng hạn/muộn của một bản đã nộp được giữ theo hạn có hiệu lực lúc nộp; hạn mới áp dụng cho các hành động tiếp theo. |
| Phản hồi | Giáo viên nhận xét gắn với từng phiên bản nộp. Bản đầu chưa có điểm số hoặc thang điểm. |
| Ngừng giao | Giáo viên có thể lưu trữ/ngừng giao bài đã có tiến độ hoặc bản nộp, vẫn giữ tiến độ và lịch sử để tra cứu; bản đầu chưa xóa vĩnh viễn trường hợp này. |

**Giới hạn:** chưa có ma trận quyền cho mọi thao tác, cách phá hòa khi sắp việc, trọng số tiến độ tổng hợp, quy trình xử lý yêu cầu đổi người phụ trách, chi tiết phiên bản/nhận xét và lịch sử chỉnh sửa ở mức dữ liệu, wireframe hay API được duyệt. Xem [vấn đề chưa chốt](../../review/unresolved.md).
