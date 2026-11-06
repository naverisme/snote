# Lịch cá nhân, workspace và lớp

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định sự kiện thuộc lịch nào và ai được tạo sự kiện chung |
| Phạm vi | Lịch của tôi, Lịch workspace, sự kiện lớp và buổi làm riêng |
| Kiểm định | DCA-checked theo các quyết định về phạm vi lịch |
| Bằng chứng duyệt | [SRC-04, SRC-10, SRC-15, SRC-19, Q11, Q12, Q27, Q31, Q33-A3](../../review/provenance.md) |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| CAL-01 | “Lịch của tôi” tổng hợp xuyên workspace theo quyền truy cập và hiển thị theo múi giờ người xem. Lịch trong workspace theo phạm vi workspace đang mở. | SRC-04, Q27 |
| CAL-02 | Lịch có sự kiện độc lập với công việc, như lịch học, lịch thi, cuộc hẹn cá nhân. Thành viên tự tạo sự kiện riêng. | SRC-04, Q12 |
| CAL-03 | Khi tạo sự kiện lớp, giáo viên chọn cả lớp hoặc các nhóm cụ thể. Sự kiện xuất hiện trong Lịch của tôi và Lịch của các workspace nhóm liên quan theo đối tượng nhận và quyền truy cập. | SRC-04, Q11 |
| CAL-04 | Giáo viên và người quản lý workspace nhóm được tạo sự kiện chung của nhóm. Lớp trưởng có quyền tạo khi giáo viên cấp. Quyền sửa lịch chung theo PER-02. | SRC-02, Q12 |
| CAL-05 | Buổi làm riêng của công việc chỉ xuất hiện với người sở hữu. Quy tắc đặt buổi làm và nhãn “Làm muộn” ở TASK-07. | SRC-04, Q19 |
| CAL-06 | Cho lưu các sự kiện trùng giờ và hiện cảnh báo khi trùng. Người có quyền sửa sự kiện đã gửi thì phần cập nhật hiển thị cho đối tượng nhận trong đúng phạm vi sự kiện. Tính năng sự kiện lặp được đặc tả ở lượt sau. | Q31 |
| CAL-07 | Lịch workspace và Lịch lớp hiển thị thời điểm theo múi giờ người xem, như Lịch của tôi. Khi tạo sự kiện từ Lịch của tôi, người dùng chọn phạm vi riêng hoặc workspace có quyền; khi tạo từ Lịch workspace, đích mặc định là workspace đang mở. Hạn bài vẫn được xác định theo múi giờ lớp theo ASG-07. | Q33-A3, SRC-19 |

Xem [Công việc](tasks.md), [quyền](permissions.md) và [R-11](../../review/unresolved.md) cho cách chỉnh một lần/mọi lần của sự kiện lặp khi tính năng này được đưa vào phạm vi, cùng chi tiết quyền sửa từng loại sự kiện.
