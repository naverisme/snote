# SNOTE v2 — Quy tắc nghiệp vụ đã xác nhận

- **Trạng thái:** Đã duyệt trong phạm vi các quy tắc dưới đây; chưa duyệt toàn bộ SRS, API hoặc mốc coding.
- **Phạm vi:** SNOTE v2.
- **Người chịu trách nhiệm:** Chủ sản phẩm.
- **Ngày cập nhật:** 2026-11-05.
- **Nguồn quyết định:** Các xác nhận trực tiếp của chủ sản phẩm trong phiên rà soát ngày 2026-11-05; pull request đưa tệp này vào `s_note_v2` ghi phạm vi thay đổi.

Xem [khái niệm sản phẩm](../product/concepts.md). Các phần chưa được nêu hoặc ghi rõ “chưa chốt” không được suy ra từ hồ sơ cũ.

## Lớp, workspace và quyền

| Hành động/phạm vi | Quy tắc đã xác nhận |
| --- | --- |
| Lớp và nhóm | Chỉ giáo viên được tạo lớp. “Nhóm” là tên gọi của workspace khi thuộc lớp; lớp ở một cấp trên workspace. Giáo viên là chủ lớp và các workspace thuộc lớp. |
| Tạo workspace nhóm | Giáo viên tạo hoặc cấp quyền tạo cho người khác. Người được ủy quyền tạo mặc định là admin của workspace vừa tạo; giáo viên có thể đổi quyền. |
| Vào lớp | Người học gửi yêu cầu; giáo viên duyệt trước khi tư cách lớp có hiệu lực. |
| Vào workspace nhóm | Người học được xếp/mời phải chấp nhận trước khi tư cách thành viên nhóm có hiệu lực. Mặc định giáo viên, lớp trưởng và trưởng nhóm của workspace đó có thể duyệt yêu cầu vào nhóm; giáo viên có thể thay đổi quy tắc. |
| Một người ở nhiều nhóm | Giới hạn số workspace nhóm đang hoạt động trong cùng lớp do giáo viên đặt trong cài đặt lớp. |
| Rời nhóm | Thành viên được tự rời; nếu đang là trưởng nhóm hoặc phụ trách việc thì phải bàn giao trước. Công việc và lịch sử vẫn thuộc workspace. |
| Giáo viên | Xem, sửa, xóa toàn bộ nội dung chung trong các workspace thuộc lớp mình. Không tự có quyền với workspace độc lập hoặc dữ liệu riêng của người học. |
| Lớp trưởng | Mặc định xem và sửa công việc, lịch, ghi chú chung của mọi workspace nhóm trong lớp và duyệt yêu cầu vào nhóm. Giáo viên có thể chỉnh quyền. Quyền xóa mặc định chưa được xác nhận. |
| Trưởng nhóm | Quản lý workspace nhóm mình, mặc định duyệt yêu cầu vào đó. Vai trò này không tự cấp quyền quản lý lớp hoặc nhóm khác. |

Quyền được xét theo người, hành động và phạm vi hiện tại. Quyền sửa nội dung chung không tự cấp quyền nộp kết quả đại diện nhóm.

## Thư viện

- Mỗi workspace có Thư viện chứa văn bản/ghi chú, đường dẫn và tệp; các mục có thể được xếp vào thư mục và gắn thông tin phù hợp với dạng nội dung.
- Hộp thu thuộc Thư viện của workspace cá nhân mặc định. Mục lưu nhanh ở đây chỉ chủ tài khoản thấy cho đến khi có hành động phân loại/chia sẻ/chuyển rõ ràng.
- “Bài viết” không phải loại nội dung riêng bắt buộc. Lưu toàn văn web, định dạng tệp hỗ trợ và nhận nội dung từ nền tảng khác chưa được chốt.

## Công việc và thời gian

| Hành vi | Quy tắc đã xác nhận |
| --- | --- |
| Phạm vi | “Việc của tôi” tổng hợp việc cá nhân và việc được giao từ mọi workspace còn quyền; Công việc trong workspace chỉ hiện việc của workspace đó. |
| Hạn | Việc cá nhân và việc được giao đều có thể không hạn. Việc được giao bắt đầu khoảng được giao để hoàn thành ở thời điểm giao; người giao chọn điểm cuối khi đặt hạn. |
| Đếm thời gian | Việc có hạn đếm thời gian còn đến hạn. Quá hạn chưa xong thì đếm thời gian quá hạn. Không hạn thì không đếm. Khi xác nhận hoàn thành, đồng hồ dừng và hiển thị hoàn thành trễ nếu có. |
| Mốc quá hạn | Hạn chỉ có ngày bắt đầu quá hạn lúc 00:00 ngày kế tiếp theo múi giờ áp dụng cho việc; hạn có giờ tính từ thời điểm đã đặt. |
| Lịch làm riêng | Người nhận việc tự chọn các buổi làm. Buổi sau hạn vẫn được lưu, gắn nhãn “Làm muộn”; không tự sửa hạn. Lịch riêng không tự hiển thị trên lịch nhóm của người khác. |
| Checklist | Hiện số mục và tỷ lệ xong, ví dụ 3/5 là 60%. Hoàn thành việc cần xác nhận riêng, không tự đóng khi xong checklist. |
| Bộ lọc và thứ tự | Lọc theo ngữ cảnh như Hôm nay, Ngày mai, Quan trọng; có thứ tự mặc định theo bộ lọc và cài đặt để thay đổi thứ tự mặc định. Thuật toán cụ thể chưa được duyệt. |

## Lịch

- Lịch của tôi tổng hợp sự kiện, hạn và buổi làm riêng từ mọi workspace liên quan mà người dùng được phép thấy. Lịch workspace chứa sự kiện/hạn chung, không tự lộ buổi làm riêng của người khác.
- Sự kiện lớp hiện ở Lịch lớp, Lịch của tôi và Lịch các workspace nhóm liên quan theo quyền. Cùng một sự kiện có thể xuất hiện ở nhiều màn nhưng vẫn là một bản ghi.
- Lịch còn chứa sự kiện độc lập không gắn việc như lịch học, lịch thi, cuộc hẹn cá nhân; sự kiện riêng chỉ chủ tài khoản thấy.

## Bài giao, tiến độ và nộp kết quả

| Hành vi | Quy tắc đã xác nhận |
| --- | --- |
| Phân phối | Giáo viên giao cùng bài cho cả lớp hoặc chọn nhóm nhận. Mỗi nhóm có tiến độ và bản nộp riêng; nhóm chỉ xem bài mình được giao. |
| Tiến độ | Giáo viên xem số việc/checklist đã xong do hệ thống tổng hợp và các bản cập nhật tiến độ dạng văn bản do nhóm gửi, như hai nguồn thông tin riêng. Công thức tổng hợp nhiều việc chưa chốt. |
| Người nộp/sửa | Mặc định trưởng nhóm; giáo viên có thể cấp quyền này cho thành viên khác. Lớp trưởng không tự có quyền nộp từ quyền sửa nội dung chung. |
| Phiên bản | Trước hoặc đúng hạn được nộp và sửa. Mỗi lần sửa lưu bản cũ, bản mới, người sửa và thời điểm. |
| Sau hạn | Mặc định khóa **nộp lần đầu** và **sửa bản đã nộp**. Giáo viên có thể bật hai quyền này bằng hai cài đặt độc lập. |
| Ưu tiên cài đặt | Mặc định ở cấp lớp áp dụng chung. Cài đặt tường minh trên từng bài giao được ưu tiên so với mặc định lớp. Chưa có quy tắc ghi đè theo từng nhóm. |
| Hạn bài | Giáo viên chọn ngày kèm giờ hoặc chỉ ngày. Hạn chỉ có ngày kết thúc cuối ngày đó theo múi giờ lớp. |

Phản hồi gắn phiên bản nào, đổi hạn sau khi đã nộp, quyền xóa bản nộp và công thức tiến độ còn chờ xác minh. Các đề xuất mâu thuẫn trong `requirements/decisions.md`, `requirements/srs.md` và `architecture/data-model.md` là tư liệu cũ cần rà lại; không lấy kết luận “đủ coding” của chúng làm quyết định.
