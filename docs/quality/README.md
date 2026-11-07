# Tiêu chí chất lượng và kiểm chứng v2

| Trường | Giá trị |
| --- | --- |
| Trạng thái | 12 ca nền Q36 ở [acceptance-scenarios.md](acceptance-scenarios.md); các kiểm chứng bổ sung theo quyền thiết kế [SRC-27](../../review/provenance.md), chưa phải báo cáo chạy test |
| Nguyên tắc | Kiểm từ yêu cầu → API/quyền → màn hình; quan sát kết quả và dữ liệu sau lỗi, không chỉ bấm nút |

| Mã | Tình huống đầu vào | Kết quả đạt |
| --- | --- | --- |
| QA-01 | Sinh viên bật/tắt Giáo viên trong Cài đặt, sở hữu một lớp cũ | Tạo lớp mới chỉ khi bật Teacher; tắt không mất quyền chủ lớp cũ; không xem/sửa lớp của giáo viên khác |
| QA-02 | Chấp nhận lời mời hoặc duyệt mã lớp, rồi yêu cầu vào nhóm; hai người duyệt đồng thời khi giới hạn một nhóm | Tư cách lớp Member có hiệu lực đúng bước; tư cách nhóm độc lập; không vượt giới hạn; lời mời cũ không hồi sinh |
| QA-03 | Lưu trữ lớp/nhóm với yêu cầu chờ, khôi phục sau khi người học vào nhóm khác | Không duyệt/chấp nhận trong lúc lưu trữ, không tự kích hoạt sau khôi phục; nhóm không khôi phục một phần nếu vượt giới hạn |
| QA-04 | Thành viên, Lớp trưởng, trưởng nhóm, chủ lớp và người kiêm vai trò thử từng action ở từng scope | Quyền hợp trong scope, tạo/sửa/xóa/hủy/Nộp/checklist tách biệt; thay role không mở Hộp thu hoặc lịch riêng người khác |
| QA-05 | Hai người ghi đè cùng một bản mục Thư viện, người thứ ba sao chép/xóa nguồn | Chỉ một ghi đè nền cũ thành công; người sau xem xung đột; bản sao độc lập, bản nộp cũ giữ nội dung |
| QA-06 | Tải 25 MB, vượt 25 MB, sai loại, vượt quota, hết ngân sách vật lý; khôi phục rác khi đầy | Chỉ báo thành công sau bytes + metadata; lỗi không tạo mục/phiên bản; thiếu chỗ giữ mục trong rác; số quota logic và vật lý đúng |
| QA-07 | Ghi đè 1.000 nội dung khác nhau của cùng tệp trong môi trường kiểm thử | Quota logic đúng J1/J2; tiêu thụ vật lý được đo và chặn tăng khi hết ngân sách, không dọn im lặng bản cũ |
| QA-08 | Nộp xong nhưng cắt mạng trước phản hồi, thử lại cùng key; hai người sửa từ version nền cũ | Một phiên bản/biên nhận cho một ý định; key khác nội dung báo lỗi; sửa xung đột phải xem bản mới; không xóa bytes đã commit |
| QA-09 | Bắt đầu tải trước hạn, hoàn tất sau hạn; đổi hạn/cài đặt/quyền khi đang tải | Kết quả theo thời điểm máy chủ chấp nhận và chính sách hiệu lực lúc đó; bản nộp cũ không bị phân loại lại; không có nút Thu hồi |
| QA-10 | Sự kiện cả ngày một ngày và nhiều ngày qua múi giờ, đổi múi giờ lớp, hủy sự kiện được gửi nhiều nhóm | Ngày dân sự không lệch, event có giờ theo người xem; mọi lịch cùng trạng thái Đã hủy; người đã mất quyền không xem lại |
| QA-11 | Giao lại việc có buổi làm riêng, checklist 0 mục rồi thêm/xóa sau hoàn thành | Lịch riêng không chuyển người; nhắc cũ dừng; checklist 0 mục không hiện 100%; trạng thái hoàn thành chỉ đổi bằng thao tác xác nhận |
| QA-12 | URL redirect vào mạng riêng, ảnh bìa tải chậm khi URL đầu thay đổi | Không truy cập đích bị cấm; văn bản vẫn lưu; phản hồi preview cũ không ghi đè URL mới |
| QA-13 | Chuyển workspace nhanh, lọc/gõ liên tiếp, mất quyền trong khi dữ liệu cũ còn trên màn; bật giảm chuyển động | Phản hồi cũ không thay ngữ cảnh mới, dữ liệu bị thu quyền biến mất ngay, keyboard/focus đúng, reduced motion hoạt động |
| QA-14 | Phục hồi đồng thời metadata và bytes vào môi trường riêng, rồi đối soát | Đọc lại được lịch sử và mọi phiên bản nộp, không tham chiếu thiếu/tệp lạc quyền, không dọn tệp đang được tham chiếu |

**Mục tiêu pilot do tác nhân chọn:** p95 phần xử lý backend cho truy vấn danh sách được quyền trong bộ dữ liệu thử ≤ 1 giây, không tính thời gian truyền mạng/tệp; 100% ca quyền và toàn vẹn P0 phải đạt trước khi cấp quyền dùng thật. Đo với dữ liệu mô phỏng tối thiểu 5 lớp, 20 workspace/lớp, 1.000 việc/workspace ở nhóm tải, đồng thời 20 yêu cầu ghi vào cùng quota/nhóm; đây là cỡ tải kiểm thử, không phải dự báo người dùng. UX chuyển động kiểm trên máy tính/điện thoại, không yêu cầu khung hình khi trình duyệt bị throttling; ghi lại thiết bị và điều kiện đo. Thời gian phục hồi và độ bền phụ thuộc cấu hình kho tệp ở [vận hành](../operations/README.md).

Khi thực thi, giữ bằng chứng pass/fail, dữ liệu đầu vào, phiên bản commit và môi trường trong báo cáo kiểm thử ngoài `docs/`. Đánh giá các ca đã đề xuất tại [hồ sơ 24 tình huống](../../review/edge-case-audit.md) cùng 12 ca Q36. Không coi danh sách ở đây là kết quả chạy.
