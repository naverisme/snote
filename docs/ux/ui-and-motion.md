# Hệ giao diện tối giản và chuyển động SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Thiết kế giao diện được chủ sản phẩm giao tự quyết tại [SRC-27](../../review/provenance.md); tôn trọng Q32, Q33 C–F và phân cấp đã chốt |
| Phạm vi | Web máy tính/điện thoại, lớp, workspace, Công việc, Lịch, Thư viện, Bài giao |
| Ý đồ | Mật độ thấp, khoảng trắng rõ, chữ và dữ liệu là trọng tâm theo tham chiếu chatgpt.com; không sao chép thương hiệu hay đặt nhiều bảng thông tin không liên quan trên cùng màn |

## Nguyên tắc bố cục và thành phần

Mỗi thời điểm chỉ có **một ngữ cảnh** (lớp, workspace hoặc tổng hợp của tôi), **một tính năng** trong ngữ cảnh và **một vùng dữ liệu chính**. Nền trung tính, đường phân cách mảnh, tương phản chữ đủ đọc, tối đa một hành động chính mỗi vùng; trạng thái bằng chữ/biểu tượng cùng nhau, không chỉ bằng màu. Nội dung dài cuộn trong vùng thích hợp; không cho các hiệu ứng che tiêu đề, quyền hoặc thông báo lỗi.

| Cấp / vị trí | Thành phần, số lượng và kiểu | Khi thao tác / dữ liệu hiện ra |
| --- | --- | --- |
| Thanh bên trên cùng | Nút Snote, một lối Lớp học và bộ chọn workspace **cùng cấp** | Snote về Việc của tôi; Lớp học mở danh sách lớp; chọn workspace đổi ngữ cảnh. Cụm workspace thu gọn tối đa hai icon, bung ngang có nút Tạo ở trái và lối danh sách; kéo chỉ cuộn, bấm mới chọn. |
| Thanh bên giữa | Một nhóm mục tính năng theo ngữ cảnh | Workspace: Công việc, Lịch trình, Thư viện. Lớp: Thành viên, Nhóm, Bài giao, Lịch lớp, Cài đặt; chọn lớp mở Thành viên. Cài đặt lớp chỉ hiện cho chủ lớp. Một mục được chọn; chỉ dữ liệu mục đó hiện ở vùng chính. |
| Thanh bên dưới ba mục workspace | Một vùng Mục lưu ý, tối đa ba dòng | Xem trước ngắn ghi chú ghim, việc gần hạn, sự kiện sắp tới trong workspace đang mở. Chọn dòng mở đúng mục nguồn; không đưa ghi chú vào vùng Gantt hay Lịch. Trong lớp không hiện vùng này. |
| Đầu vùng Công việc | Bộ chuyển Gantt/Danh sách, Tạo việc, Lọc, Sắp xếp, lối “Sắp tới (n)” cạnh lọc thời gian | Gantt mặc định. Lọc và Sắp tới chỉ đổi tập nhìn thấy; Danh sách có chọn nhiều theo quyền; Gantt chưa kéo thanh để sửa. |
| Vùng Công việc | Một lưới Gantt **hoặc** một bảng Danh sách; một chi tiết khi chọn việc | Chi tiết nằm cạnh trên máy tính, thành màn riêng trên điện thoại. Buổi làm riêng không hiện với người khác. Việc không có mốc vào nhóm riêng, không vẽ thanh giả. |
| Vùng Lịch | Một lưới Tháng/Tuần/Ngày, cụm Trước/Hôm nay/Sau, Lọc; chi tiết khi chọn | Mặc định Tuần máy tính/Ngày điện thoại. Sự kiện cả ngày dùng dải ngày riêng ở đầu lưới, sự kiện có giờ ở trục giờ; hạn là mốc. Sự kiện trùng xếp cạnh, cảnh báo không chặn lưu. |
| Vùng Thư viện | Bộ chọn thư mục, danh sách mục, một vùng chi tiết; tìm/lọc/sắp xếp ở đầu danh sách | Hộp thu chỉ trong workspace cá nhân mặc định; item văn bản/link/tệp có biểu tượng loại và thao tác theo quyền. Ghi đè hoặc tạo bản sao là lựa chọn rõ trước khi lưu tệp. |
| Vùng lớp | Mỗi lần một mục Thành viên/Nhóm/Bài giao/Lịch lớp/Cài đặt | Bảng Thành viên có ba cột chính Người học/Vai trò/Nhóm; vai trò chỉnh ngay trên hàng bởi chủ lớp. Danh sách nhóm chỉ tóm tắt tên, trưởng nhóm, trạng thái; Bài giao chọn nhóm mới mở bản nộp/nhận xét. Cài đặt chia phần, mỗi lần mở một phần. |

Điện thoại giữ thứ bậc như desktop, thay thanh bên bằng vùng điều hướng thu gọn mở theo yêu cầu, không để đồng thời bảng lớp và Gantt. Tên workspace hiện cạnh icon; trên desktop tên mặc định ẩn, hiện khi hover/focus. Bảng Thành viên cuộn ngang, cố định cột Người học. Modal chỉ dùng cho hành động ngắn hoặc xác nhận; chi tiết dài thành màn/side panel riêng. Các nút quan trọng có nhãn đọc được và trạng thái disabled nêu lý do.

## Trạng thái, nguồn dữ liệu và thao tác

| Vùng | Đang tải / trống / lỗi / thành công |
| --- | --- |
| Đổi workspace/lớp | Giữ thanh điều hướng, đánh dấu ngữ cảnh mới, vùng dữ liệu cũ ngừng tương tác trong lúc tải. Trống có lời dẫn theo quyền; lỗi có Thử lại. Mất quyền thì xóa dữ liệu cũ khỏi màn và chuyển tới ngữ cảnh còn quyền. |
| Tải tệp | Ô tệp hiện tiến độ thật nếu có; tệp xong nhưng bản ghi chưa xong tiếp tục trạng thái Đang lưu. Chỉ sau cả bytes + metadata hoàn tất hiện dấu tích xanh giữa ô rồi mờ; lỗi hiện Thử lại, không báo đã lưu. |
| Nộp bài | Gửi → Đang xác nhận → Thành công kèm số phiên bản/giờ nhận, hoặc Lỗi/Xung đột/Chưa rõ kết quả. Chưa rõ kết quả tra mã thao tác trước khi nút gửi tạo ý định mới. Nút Thu hồi không xuất hiện. |
| Ghi đè Thư viện | Hiện hai lựa chọn Ghi đè mục / Tạo bản sao. Nếu phiên bản nền cũ, dừng và đưa lối Xem bản mới hoặc Tạo bản sao; không thay nội dung đang nhập trước khi người dùng chọn. |
| Lịch | Sự kiện hủy vẫn có nhãn Đã hủy khi người nhận còn quyền. Đổi múi giờ giữ ngày sự kiện cả ngày; event có giờ dịch vị trí trên trục. Không có điều khiển sự kiện lặp trong bản đầu. |
| Việc tiếp theo | Bốn nhóm ưu tiên đã chốt. “Sắp tới (n)” là một nút cạnh lọc, không tự bung thông tin tương lai; khi bấm mở tập việc có mốc tương lai. Không có checklist thì hiện chữ “Chưa có checklist”, không hiện 0/0. |

## Chuyển động và dữ liệu đổi liên tục

Thời lượng dưới đây là **ngân sách thiết kế** do tác nhân chọn để làm prototype/kiểm chứng, không phải chỉ số đo đã đạt. Dùng easing nhẹ, dịch chuyển nhỏ và opacity; không lắc/nhấp nháy để gây chú ý. Chỉ animation các thuộc tính transform/opacity khi phù hợp; chiều cao nội dung nên chuyển có giới hạn để tránh giật khi dữ liệu dài. Nếu hệ điều hành yêu cầu giảm chuyển động, thay chuyển động bằng đổi trạng thái tức thời, giữ focus và thông báo.

| Chuyển trạng thái | Đề xuất chuyển động | Điều kiện hủy/đổi dữ liệu |
| --- | --- | --- |
| Cụm workspace thu ↔ bung | 180–240 ms, icon tách từ cụm, mờ phần còn lại nhẹ; icon đang chọn nổi rồi về vị trí mới; danh sách dùng cùng nhịp | Giữ-kéo ngang chỉ cuộn với quán tính nhẹ; thả không chọn. Bấm trong lúc đang bung kết thúc chuyển động cũ rồi chuyển đúng workspace đã bấm. |
| Chuyển ngữ cảnh lớp/workspace hoặc mục tính năng | Chỉ báo chọn trượt 140–180 ms; vùng nội dung mờ/hiện 120–180 ms sau khi có dữ liệu. Không trượt toàn màn qua nhiều trang | Request đến muộn của ngữ cảnh cũ không được ghi đè ngữ cảnh mới. Giữ thanh bên và focus hợp lý; khi mất quyền xóa dữ liệu cũ ngay, không chờ fade. |
| Gantt ↔ Danh sách | 140–220 ms mờ đổi vùng dữ liệu, giữ thanh điều khiển và bộ lọc; không giả vờ biến hàng Gantt thành bảng | Hủy transition cũ nếu bấm liên tiếp; chỉ một chế độ có thể thao tác. Khi cùng tập việc cập nhật, không reset vùng cuộn tùy tiện. |
| Chuyển ngày/tuần/tháng trên Lịch | 180–240 ms dịch trục nhẹ theo hướng thời gian, ngày hôm nay có điểm nhấn tĩnh; event cập nhật vị trí có hoạt ảnh ngắn | Đổi múi giờ chỉ di chuyển event có giờ; event cả ngày giữ ô ngày. Chỉ vẽ event trong khoảng nhìn thấy, không phát nhắc từ hoạt ảnh. |
| Mở/đóng chi tiết việc, mục hoặc sự kiện | Máy tính: panel xuất hiện 180–240 ms, nền chính giữ vị trí; điện thoại: màn riêng 200–260 ms | Escape/Back trở về vị trí và phần tử đã mở; focus vào tiêu đề panel, đóng trả focus nút/hàng trước đó. |
| Dữ liệu hàng thay đổi, lọc/sắp xếp | Hàng mới xuất hiện 120–180 ms; hàng bị loại mờ nhanh, vị trí còn lại dịch nhẹ tối đa 220 ms | Không animate hàng loạt >20 hàng hay khi refresh dữ liệu lớn; dùng cập nhật tức thời. Giữ khóa ID và vị trí cuộn để tránh nhảy khi dữ liệu đến liên tiếp. |
| Upload → ghi metadata → thành công | Tiến độ xác thực, sau commit hiện tích xanh 500–700 ms rồi mờ 160–240 ms; lỗi hiện ngay với nhãn và thao tác thử lại | Không tự chạy tích nếu client chỉ tải bytes xong. Không để ảnh bìa URL cũ thay ảnh của URL mới; preview lỗi không đảo trạng thái mục đã lưu. |
| Xác nhận Nộp / lỗi xung đột | Nút vào Đang xác nhận không lặp gửi; kết quả thành công hiện biên nhận tĩnh, xung đột hiện bản hiện hành rõ ràng | Mất mạng vẫn giữ bản nháp và mã thao tác; không biến spinner lâu thành xác nhận giả. Gửi lại cùng mã lấy kết quả cũ. |

**Dao động dữ liệu:** Hiển thị dữ liệu cũ trong lúc làm mới chỉ khi người dùng còn quyền và có nhãn Đang cập nhật; kết quả gắn request/ngữ cảnh + revision, phản hồi cũ bị bỏ qua. Tìm kiếm đợi khoảng 250 ms sau khi ngừng gõ trước khi gọi, kết quả đến sai truy vấn bị bỏ. Số đếm thay đổi dùng đổi số ngắn hoặc tức thời, không đếm từ 0 qua hàng trăm giá trị. Thông báo quá hạn và thời lượng còn lại cập nhật theo mốc thời gian có nghĩa (phút khi còn xa, giây chỉ khi gần hạn trong chi tiết), không rerender cả Gantt mỗi giây. Không dùng chuyển động để che sự thay đổi quyền, hạn nộp hoặc người phụ trách.

Các chỉ số chuyển động là lựa chọn UX của v2 và sẽ được đo trên máy tính/điện thoại thực trong nghiệm thu. [Đặc tả Q32](workspace-gantt.md) và [màn Q33](README.md) quyết định nghiệp vụ và vị trí đã chốt; tài liệu này làm rõ hình thức/trạng thái trong phạm vi được chủ sản phẩm giao tự quyết, không cấp thêm quyền.
