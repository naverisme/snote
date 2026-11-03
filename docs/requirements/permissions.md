# SNOTE v2 — Ma trận phân quyền

**Bản đề xuất · D-01.** Mọi hàng giả định phiên hợp lệ và tài nguyên đúng phạm vi. Một người có thể kiêm vai trò. Vai trò áp dụng theo từng workspace, lớp và nhóm nhận bài.

| Hành động | Chủ dữ liệu cá nhân | Thành viên nhóm | Người được giao | Trưởng nhóm / điều phối | Giáo viên phụ trách | Quản trị lớp |
|---|---|---|---|---|---|---|
| Đọc, tìm, sửa Hộp thu và kế hoạch riêng | Có | — | — | — | — | — |
| Đọc việc và lịch nhóm | — | Có | Có | Có | Chiếu dữ liệu giới hạn theo bài giao | — |
| Đánh dấu checklist, đổi trạng thái việc nhóm | — | — | Việc đang được giao | Khi chính mình được giao | — | — |
| Tạo, giao lại, đổi hạn và đầu ra việc nhóm | — | — | — | Có | — | — |
| Tạo, sửa, hủy lịch họp nhóm | — | — | — | Có | — | — |
| Gắn tài nguyên vào việc | Việc riêng | Nếu được quyền sửa liên kết và dùng tài nguyên | Theo quyền sửa liên kết đã cấp | Có khi được dùng tài nguyên | — | — |
| Mời người dùng vào dự án | — | — | — | Chủ workspace dự án | — | — |
| Tạo lớp | — | — | — | — | Có khi đã được cấp tư cách giáo viên | — |
| Quản lý thành viên lớp và chia nhóm | — | — | — | — | Có | Theo ủy quyền trong lớp |
| Công bố bài và chọn nhóm nhận | — | — | — | — | Có | — |
| Xem bài giao và phản hồi | — | Nhóm nhận bài | Nhóm nhận bài | Nhóm nhận bài | Lớp phụ trách | — |
| Gắn việc với bài giao | — | — | — | Nhóm nhận bài | — | — |
| Gửi cập nhật tiến độ | — | Nhóm nhận bài | Nhóm nhận bài | Nhóm nhận bài | — | — |
| Chia sẻ nháp hoặc checklist với giáo viên | — | — | — | Khi được quyền chia sẻ tài nguyên của nhóm | Đọc trong phạm vi được cấp | — |
| Nộp đại diện nhóm | — | — | — | Trưởng nhóm hiện tại, theo D-04 | — | — |
| Phản hồi bản đã nộp | — | — | — | — | Lớp phụ trách và đúng bản nộp | — |

Dấu — biểu thị vai trò ở cột đó tự thân chưa cấp quyền. Ví dụ trưởng nhóm có quyền của thành viên và chỉ cập nhật checklist với tư cách người được giao. Người ngoài workspace không có quyền theo membership. Quyền chia sẻ hẹp trên một tài nguyên được xét riêng theo người nhận, mục đích, phạm vi bài và thời điểm thu hồi.

### Điều kiện triển khai

1. Máy chủ xác thực phiên, lấy vai trò từ dữ liệu có thẩm quyền, rồi kiểm tra phạm vi và hành động trên bản ghi. Các truy vấn danh sách, tìm kiếm, số đếm và chi tiết áp dụng cùng phạm vi.
2. Tác vụ do giáo viên đọc qua tiến độ chỉ trả người phụ trách, hạn và trạng thái của việc gắn với bài đã giao đúng nhóm. Mở nháp hoặc checklist chi tiết cần quyền chia sẻ hiện hành.
3. Lời mời chưa chấp nhận không cấp quyền vào workspace. Giao lại việc gỡ quyền cập nhật của người cũ nếu họ không còn là người được giao. Thu hồi tư cách nhóm gỡ quyền theo vai trò nhóm ở lần đọc hoặc ghi tiếp theo.
4. Với thao tác ghi có thể tranh chấp, kiểm tra lại quyền trong cùng giao dịch hoặc khóa bản ghi cần thiết. Giao diện tải lại khi quyền hoặc trạng thái đã thay đổi.

**Kiểm thử:** [AT-01, AT-03, AT-04 và AT-05](use-cases.md#5-kịch-bản-nghiệm-thu-xuyên-suốt), cùng bộ kiểm tra quyền trong [kế hoạch bàn giao](../delivery/plan.md).
