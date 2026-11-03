# SNOTE v2 — M0 · Quyết định làm cơ sở phân công

Các lựa chọn dưới đây cụ thể hóa [SRS](srs.md) và [Use Case](use-cases.md#6-quyết-định-mở-trước-khi-chốt-srs) cho kế hoạch triển khai. Đây là mặc định kỹ thuật và nghiệp vụ để chia việc. Khi chủ sản phẩm thay đổi một mặc định, cập nhật yêu cầu, hợp đồng và nhiệm vụ liên quan trước khi mở nhánh triển khai. Các mục kiểm chứng với người dùng vẫn là điều kiện phát hành.

| Quyết định | Mặc định triển khai | Phạm vi |
|---|---|---|
| D-01 · Quyền lớp | Giáo viên phụ trách tạo lớp, công bố bài, xem tiến độ và phản hồi. Quản trị lớp được giao quản lý thành viên và nhóm. Giáo viên thấy người phụ trách, hạn và trạng thái phần việc gắn bài. Nháp và checklist chi tiết chỉ xem khi có chia sẻ hiệu lực. Tư cách giáo viên do người vận hành cấp ở bản thử. | M3. Xác nhận luồng cấp quyền giáo viên trước khi mở đăng ký diện rộng. |
| D-02 · Hộp thu và tệp | Web nhập trực tiếp URL HTTP/HTTPS hoặc văn bản. Tìm theo tiêu đề, nội dung văn bản và nhãn. Kết quả bài tập dùng văn bản hoặc URL. Chia sẻ từ hệ điều hành, tự tải nội dung URL, tải tệp và tìm trong tệp để sau. | M1–M3. |
| D-03 · Ưu tiên | Hai nhóm độc lập **Cần xử lý** và **Quan trọng**. Cần xử lý gồm việc còn mở quá hạn, đến hạn hôm nay hoặc có lịch làm hôm nay. Xếp quá hạn trước, sau đó việc đến hạn hôm nay, rồi việc chỉ có lịch làm hôm nay. Trong cùng nhóm con xếp mốc thời gian tăng dần, mức quan trọng giảm dần, rồi ID để phá hòa. Quan trọng gồm việc còn mở mức cao, xếp hạn gần trước, việc không hạn sau cùng, rồi ID. Một việc có thể xuất hiện trong cả hai nhóm gợi ý. Bộ đếm Hôm nay, Ngày mai vẫn tính mỗi việc một lần trong từng ngày. | M1. Dùng dữ liệu thử để rà thứ tự với người dùng. |
| D-04 · Nộp bài | Trưởng nhóm hiện tại được nộp một bản thành công cho mỗi nhóm nhận bài. Hạn là thời điểm chính xác. Nhận nộp khi thời điểm máy chủ ghi nhận nhỏ hơn hoặc bằng hạn. Bản đầu không có mở lại, nộp muộn, nộp bản mới hoặc nộp thay. Cùng người, cùng khóa và cùng nội dung trả bản đã ghi khi người đó còn quyền nộp theo vai trò, kể cả khi đã qua hạn. Khóa đã dùng với nội dung khác hoặc khóa khác sau khi có bài nộp trả xung đột. | M3. Duyệt chính sách với giáo viên trước thử nghiệm thật. |
| D-05 · Tiến độ | Checklist hiện số mục xong và mục chưa xong đầu tiên. Người có quyền xác nhận hoàn thành việc bằng thao tác riêng. Tiến độ nhóm là số việc đã hoàn thành trên tổng số việc gắn đúng bài, kèm trạng thái nộp riêng. Không có việc thì hiển thị chưa có dữ liệu. | M1, M3. |
| D-06 · Phạm vi | Triển khai và nghiệm thu theo M1 cá nhân, M2 cộng tác, M3 lớp học, M4 phát hành. Phiên chạy thử dùng tài khoản và dữ liệu giả. | [Lộ trình](../delivery/plan.md). |
| D-07 · Múi giờ và ngày | Dùng múi giờ IANA của hồ sơ để tính ranh giới ngày. Việc cá nhân và nhóm có thể để hạn trống hoặc dùng ngày địa phương `YYYY-MM-DD`. Hạn chỉ có ngày được coi quá hạn từ đầu ngày kế tiếp theo múi giờ nghiệp vụ đã lưu lúc đặt hạn. Việc có hạn chính xác dùng timestamp. Lịch làm, họp và hạn nộp bài dùng thời điểm có múi giờ quy chiếu. | M1–M3. |
| D-08 · Tư cách và phân công | Workspace cá nhân thuộc một tài khoản. Người được giao việc nhóm phải là thành viên hiệu lực của workspace. Một việc nhóm có tối đa một người phụ trách chính trong bản đầu. Một sinh viên có thể ở tối đa một nhóm hiệu lực trong cùng lớp. Vai trò điều phối và người nhận việc được kiểm tra tại thời điểm ghi. | M2–M3. |

## Kết quả rà M0

- Đã có yêu cầu, quyền, mô hình dữ liệu, hành vi lỗi và thứ tự bàn giao. [Hợp đồng phối hợp](../architecture/implementation-contracts.md) cụ thể hóa các điểm các agent cần dùng chung.
- Có thể chuẩn bị nền kỹ thuật và phân công M1. M2 và M3 chỉ mở khi mốc trước qua cổng tích hợp, phạm vi quyền và dữ liệu của mốc mới được kiểm tra.
- Chỉ tiêu tải, RPO/RTO và dự toán vẫn là mục tiêu kế hoạch. Kích cỡ hạ tầng, cách cấp tài khoản giáo viên khi mở rộng, vòng đời dữ liệu lớp và nghiệm thu thực tế cần người phụ trách sản phẩm xác nhận trước phát hành.
