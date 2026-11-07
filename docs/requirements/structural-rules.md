# Quy tắc cấu trúc và vòng đời v2

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Thiết kế bổ sung do chủ sản phẩm giao quyền quyết định tại [SRC-27](../../review/provenance.md); tuân theo các quy tắc đã chốt trước đó |
| Phạm vi | Tài khoản, lớp, workspace, tư cách, quyền, dữ liệu và thời gian |

## Cấu trúc và tư cách

| Mã | Quy tắc |
| --- | --- |
| STR-01 | Tài khoản có một workspace cá nhân mặc định. Workspace cộng tác độc lập nằm ngoài lớp; workspace nhóm thuộc đúng một lớp suốt vòng đời, không chuyển sang lớp khác hay chuyển thành workspace độc lập. Cùng một loại workspace được gọi là nhóm theo ngữ cảnh lớp. |
| STR-02 | Đăng ký chọn một hoặc nhiều cách dùng Sinh viên/Giáo viên/Quản lý cá nhân; Cài đặt **tài khoản** cho bật/tắt sau đó. Chỉ khi bật Giáo viên mới được tạo lớp mới; tài khoản chỉ bật Sinh viên được tham gia lớp, không tạo lớp. Lựa chọn tự khai, không mang nhãn đã xác minh. |
| STR-03 | Tắt Giáo viên chặn tạo lớp mới nhưng không tước quyền chủ lớp đang sở hữu; chuyển chủ lớp là luồng bàn giao riêng. Bật Giáo viên không cấp quyền trong lớp của người khác. Cách dùng tài khoản khác với vai trò Member/Lớp trưởng trong từng lớp và trưởng nhóm trong từng workspace. |
| STR-04 | Tư cách nhóm chỉ có hiệu lực nếu tư cách lớp còn hiệu lực. Hai quan hệ tư cách được lưu riêng và có lịch sử; mỗi cách gia nhập đều kiểm giới hạn nhóm hiện hành tại lúc kích hoạt. Không dùng ràng buộc cứng một nhóm trong cơ sở dữ liệu vì giáo viên được đổi giới hạn. |
| STR-05 | Bài giao thuộc một lớp; với mỗi nhóm nhận có một phần theo dõi tiến độ và chuỗi phiên bản nộp riêng. Một sự kiện lớp có một nguồn với các đối tượng nhận; nhiều lịch chỉ là cách hiển thị theo quyền, không phải nhiều sự kiện độc lập. |
| STR-06 | Danh sách Việc của tôi và Lịch của tôi tổng hợp dữ liệu đang có quyền; bộ đếm, tìm kiếm, cảnh báo trùng lọc theo quyền **trước khi** tổng hợp. Dữ liệu riêng không tham gia tổng hợp của người khác. |

## Lời mời, lưu trữ và bàn giao

| Mã | Quy tắc |
| --- | --- |
| STR-07 | Lời mời vào lớp/nhóm có hiệu lực sau khi người học chấp nhận; yêu cầu dùng mã lớp cần giáo viên duyệt; yêu cầu vào nhóm do người có quyền theo cài đặt duyệt. Vào lớp mặc định Member, không tự vào nhóm. |
| STR-08 | Khi lớp hoặc nhóm lưu trữ, lời mời/yêu cầu chờ không thể hoàn tất. Khôi phục không tự kích hoạt chúng: người có quyền xem lại điều kiện hiện tại và gửi lời mời mới hoặc duyệt lại yêu cầu. Lời mời nhóm đã vô hiệu do đạt giới hạn không hồi sinh. |
| STR-09 | Rời nhóm/lớp cần bàn giao trách nhiệm theo CLS-08/09; quyền theo tư cách dừng ở thời điểm rời, lịch sử và bản nộp ở lại. Khôi phục nhóm phải kiểm xung đột giới hạn trước; có xung đột thì giữ nguyên trạng thái lưu trữ và hiển thị điều kiện chặn, không tự loại khỏi nhóm khác. |
| STR-10 | Chuyển chủ workspace/lớp chỉ hoàn tất sau khi người nhận còn đủ tư cách và chấp nhận. Không để hai lần chấp nhận cạnh tranh tạo hai chủ. Đổi trưởng nhóm giữ nguyên workspace, việc và lịch sử, chỉ thay quyền quản lý có hiệu lực. |

## Cách tính quyền

| Mã | Thứ tự quyết định |
| --- | --- |
| STR-11 | Xác định đối tượng/phạm vi → tư cách còn hiệu lực → hợp các quyền đúng hành động từ các vai trò còn hiệu lực và quyền cấp riêng → điều kiện lưu trữ/riêng tư/hạn → cho phép hoặc từ chối. Giao diện ẩn nút không thay kiểm tra máy chủ. |
| STR-12 | Chủ lớp có quyền trên dữ liệu **chung** của các nhóm. Lớp trưởng mặc định xem/sửa việc, lịch, ghi chú văn bản chung; quyền tạo/xóa/hủy, tệp/đường dẫn liên nhóm, checklist, phân công và Nộp là những hành động tách biệt. Trưởng nhóm quản lý nhóm mình, không quản lý lớp. |
| STR-13 | Cài đặt quyền lớp có hai tầng: mặc định theo Member/Lớp trưởng và cấp riêng theo người + hành động + phạm vi lớp/nhóm/bài. Thu hồi ngừng thao tác mới, lịch sử cũ giữ nguyên; quyền bắt buộc về chấp nhận tham gia, riêng tư, bàn giao, lưu trữ và chủ lớp không bị công tắc cấu hình vô hiệu. |
| STR-14 | Người nhận việc sửa checklist/trạng thái và lịch làm riêng; không tự sửa hạn, mức quan trọng hay xóa việc. Giao lại giữ checklist/lịch sử, chấm dứt quyền từ vai trò người nhận cũ. |

## Nội dung và thời gian

| Mã | Quy tắc |
| --- | --- |
| STR-15 | Mục Thư viện có bản hiện hành và phiên bản nội dung; bản sao là mục độc lập. Khi hai người ghi đè cùng phiên bản nền, người đến sau xem xung đột và được xem bản mới hoặc tạo bản sao; không ghi đè im lặng. Khôi phục từ rác cần quota; thiếu chỗ thì giữ mục trong rác đến hết hạn và báo phần thiếu. |
| STR-16 | Tệp đã tải nhưng lần Nộp chưa rõ kết quả phải tra theo mã thao tác trước khi dọn. Một mã thao tác cùng nội dung trả một biên nhận, không tạo phiên bản trùng. Hạn và quyền Nộp được xét lúc máy chủ chấp nhận hoàn tất; bắt đầu tải trước hạn không bảo đảm nộp đúng hạn. |
| STR-17 | Sự kiện cả ngày của lớp/nhóm dùng múi giờ lớp lúc tạo, workspace độc lập dùng múi giờ workspace lúc tạo, sự kiện riêng dùng múi giờ người tạo lúc lưu. Workspace độc lập khởi tạo múi giờ từ tài khoản người tạo; chủ workspace được đổi múi giờ cho sự kiện tương lai, ngày của sự kiện đã lưu giữ nguyên. UI chọn ngày cuối bao gồm; hợp đồng dùng ngày kết thúc loại trừ. Sự kiện có giờ giữ thời điểm và hiển thị theo múi giờ người xem. |
| STR-18 | Checklist không có mục hiện “Chưa có checklist”. Sửa checklist sau khi hoàn thành có thể đổi tỷ lệ nhưng không tự mở lại việc. Giao lại không chuyển buổi làm riêng cho người mới; lịch sử riêng người cũ còn, nhắc tương lai theo trách nhiệm cũ dừng. |
| STR-19 | Việc tiếp theo giữ thứ tự bốn nhóm đã chốt. Lối “Sắp tới (n)” luôn nằm cạnh bộ lọc thời gian, chỉ hiện số lượng; bấm mới mở việc có mốc tương lai. Việc tương lai vẫn trên Gantt khi trục nhìn thấy. |

**Nguồn:** STR-01–14 cụ thể hóa C1–C4, S1–S3, vòng đời và ma trận quyền được chủ sản phẩm đồng ý trong cuộc trao đổi sau PR #25. STR-15/16 là D1–D3, STR-17–19 là T1–T5 và phương án T5 cuối được đồng ý. Các trường giao tiếp, ngân sách vật lý và mục tiêu vận hành ở [kiến trúc](../architecture/README.md), [hợp đồng](../contracts/README.md), [vận hành](../operations/README.md).
