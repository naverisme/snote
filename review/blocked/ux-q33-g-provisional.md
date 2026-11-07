# Q33-G — Phương án giao diện được tạm duyệt

| Trường | Giá trị |
| --- | --- |
| Trạng thái | **Tạm duyệt để tiếp tục rà thiết kế**, chưa khóa thành đặc tả triển khai hoặc chuyển các lựa chọn G vào `docs/ux/` |
| Nguồn | [SRC-23](../provenance.md): chủ sản phẩm trả lời “tạm thời duyệt đi” cho bảng G1–G12 |
| Phạm vi | Những chi tiết giao diện còn mở sau Q33 F1–F10; quyền nghiệp vụ đã chốt ở `docs/requirements/` tiếp tục có hiệu lực |

Các mục dưới đây ghi đúng phương án được tạm duyệt. Khi có bản sửa, đối chiếu mã G trước khi chuyển nội dung sang tài liệu dùng để triển khai. Mọi giá trị quyền chưa được nói rõ vẫn chưa có hiệu lực.

| Mã | Cấp, vị trí, số lượng và kiểu | Hành vi phương án tạm duyệt | Giới hạn cần giữ |
| --- | --- | --- | --- |
| G1 | Màn chọn lớp; 1 hàng mỗi lớp gồm tên, tư cách của mình và trạng thái hoạt động/lưu trữ; tối đa 2 nút ở đầu danh sách | Bấm hàng mở lớp tại Thành viên. Tạo lớp và Tham gia lớp hiện theo quyền tài khoản. | Không tự gán thêm quyền tạo lớp cho người học; kiểu trình bày, nhóm/lọc lớp chưa khóa. |
| G2 | Vùng tính năng của lớp, thay ba mục workspace; 5 mục | Thứ tự đề xuất Thành viên → Nhóm → Bài giao → Lịch lớp → Cài đặt. Chọn mục thay vùng chính; Cài đặt cuối và ẩn nếu không có quyền. | Năm tên mục, một màn mặc định và quyền ẩn Cài đặt đã chốt tại CUXC-02/06; thứ tự chỉ tạm duyệt. |
| G3 | Ngay trên bảng Thành viên; 1 ô Tìm người học và 1 lọc Vai trò | Chỉ thay các hàng đang nhìn thấy. Giữ ba cột chính Người học, Vai trò, Nhóm đang tham gia; chưa thêm cột phụ. | Không tự thay đổi vai trò hoặc tư cách từ lọc/tìm. |
| G4 | Trong phần Quyền lớp trưởng của Cài đặt; 1 bảng quyền, mỗi hàng là một hành động, hai cột Member và Lớp trưởng | Giáo viên chủ lớp có thao tác chỉnh và Lưu quyền; ô Vai trò ở bảng Thành viên chỉ chọn vai trò. | H1–H10 đã chốt nhiều hành động và phạm vi ở [ma trận](../../docs/requirements/permission-matrix.md), nhưng **danh sách và giá trị từng ô hiển thị trong bảng Cài đặt vẫn mở R-02**. Hình thức bảng này vẫn chỉ tạm duyệt. |
| G5 | Vùng Lịch, theo một trong ba chế độ đã chốt | Tuần/Ngày có trục giờ, sự kiện trùng giờ đặt cạnh nhau; buổi làm và sự kiện có dấu phân biệt. Tháng hiện mục rút gọn theo ngày, bấm ngày xem danh sách ngày. Hạn việc/bài giao là mốc, không vẽ thành cuộc họp kéo dài. | Kích thước ô, giới hạn mục rút gọn, hành vi cuộn chưa khóa. |
| G6 | Biểu mẫu Tạo sự kiện; 5 trường: tiêu đề, bắt đầu, kết thúc, phạm vi nhận, nội dung | Đề xuất bắt buộc bốn trường đầu; kết thúc sau bắt đầu. Sự kiện lớp chọn cả lớp/nhóm nhận theo quyền. Trùng giờ cảnh báo nhưng cho lưu. | Trường bắt buộc và kiểm tra thời gian **chỉ tạm duyệt**; J7 đã chốt sự kiện cả ngày tại CAL-09; phải sửa bản thảo để ngày bắt đầu bằng ngày kết thúc vẫn biểu diễn một ngày hợp lệ. Không dùng kiểm tra giờ này cho khoảng ngày. Nguồn múi giờ và kiểu điều khiển còn R-11, xem EC-13/14 trong [hồ sơ tình huống](../edge-case-audit.md). |
| G7 | Đầu danh sách mục Thư viện; 1 ô Tìm, 1 lọc loại, 1 sắp xếp | Lọc loại Tất cả/Văn bản/Đường dẫn/Tệp; sắp xếp Mới nhất/Cũ nhất/Tên. Phạm vi là workspace và thư mục đang xem; không đổi nơi lưu. | Quy tắc thứ tự khi trùng giá trị và trường thời điểm chưa khóa. |
| G8 | Nhóm hành động trong chi tiết một mục Thư viện; 1 nút Sao chép sang workspace | Bấm mở bộ chọn đích, xác nhận mới tạo bản sao và giữ bản nguồn. Chỉ hiện các đích có quyền tạo mục. | Quyền và định nghĩa bản sao ở LIB-04; danh sách quyền chi tiết còn R-02. |
| G9 | Dưới bản nộp hiện hành; 1 nút Lịch sử phiên bản và danh sách một hàng mỗi phiên bản | Hàng hiện số phiên bản, người nộp, thời điểm, đúng/muộn. Bấm hàng mở đúng nội dung và nhận xét của phiên bản đó theo F9. | Kiểu phân trang, tải và trường số phiên bản chưa khóa hợp đồng. |
| G10 | Màn Bài giao, trạng thái theo từng nhóm nhận; tối đa 1 nút Nộp lần đầu hoặc Sửa bản nộp tại thời điểm xem | Phân biệt chưa có bản nộp, đã nộp, quá hạn; nút tùy quyền và hai cài đặt sau hạn. Nếu khóa, hiện lý do cạnh tình trạng nộp. | Không coi “quá hạn” thay thế trạng thái đã/chưa nộp; chúng có thể đồng thời. Không tự tạo quyền từ cách hiện nút. |
| G11 | Vùng dữ liệu của tính năng đang mở; điều hướng và tên phạm vi giữ nguyên | Trạng thái tải/lỗi trong vùng dữ liệu; trống có hành động tạo theo quyền; lọc rỗng có Bỏ lọc; lỗi có Thử lại. | Thông báo cụ thể, thời điểm xóa dữ liệu cũ khi mất quyền còn cần đặc tả. |
| G12 | Bộ chọn workspace và lưới Gantt | Bung/thu cụm workspace với chuyển động ngắn, mờ dần; kéo ngang chỉ cuộn, thả không chọn. Gantt cuộn ngang độc lập; chọn việc mở chi tiết, không kéo thanh để sửa. | Hành vi kéo/chọn Gantt đã chốt ở Q32; thời lượng, easing, độ mờ và ngưỡng kéo chưa có con số, cần bản mẫu trước khi khóa. |

Phần tạm duyệt không thay các quyết định Q32, Q33 C–F hoặc quyền H1–H10 đã chốt. Cổng chuyển vào `docs/ux/`: chủ sản phẩm xác nhận nội dung cuối cùng theo mã G; chỉ chuyển từng mục đủ rõ, còn ô quyền G4 phải được duyệt riêng. [Phiếu Q33](ux-q33-review.md) và [sổ mở](../unresolved.md) theo dõi các phần phụ thuộc.
