# Lịch cá nhân, workspace và lớp

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định sự kiện thuộc lịch nào và ai được tạo sự kiện chung |
| Phạm vi | Lịch của tôi, Lịch workspace, sự kiện lớp và buổi làm riêng |
| Kiểm định | DCA-checked theo các quyết định về phạm vi lịch |
| Bằng chứng duyệt | [SRC-04, SRC-10, Q11 và Q12](../../review/provenance.md) |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| CAL-01 | “Lịch của tôi” tổng hợp xuyên workspace theo quyền truy cập. Lịch trong workspace theo phạm vi workspace đang mở. | SRC-04 |
| CAL-02 | Lịch có sự kiện độc lập với công việc, như lịch học, lịch thi, cuộc hẹn cá nhân. Thành viên tự tạo sự kiện riêng. | SRC-04, Q12 |
| CAL-03 | Khi tạo sự kiện lớp, giáo viên chọn cả lớp hoặc các nhóm cụ thể. Sự kiện xuất hiện trong Lịch của tôi và Lịch của các workspace nhóm liên quan theo đối tượng nhận và quyền truy cập. | SRC-04, Q11 |
| CAL-04 | Giáo viên và người quản lý workspace nhóm được tạo sự kiện chung của nhóm. Lớp trưởng có quyền tạo khi giáo viên cấp. Quyền sửa lịch chung theo PER-02. | SRC-02, Q12 |
| CAL-05 | Buổi làm riêng của công việc chỉ xuất hiện với người sở hữu. Quy tắc đặt buổi làm và nhãn “Làm muộn” ở TASK-07. | SRC-04, Q19 |

Xem [Công việc](tasks.md), [quyền](permissions.md) và [R-11](../../review/unresolved.md) cho lặp sự kiện, xung đột thời gian và hành vi sau khi sự kiện đã được chia sẻ.
