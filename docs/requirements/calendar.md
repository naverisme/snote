# Lịch cá nhân, workspace và lớp

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định sự kiện thuộc lịch nào và ai được tạo sự kiện chung |
| Phạm vi | Lịch của tôi, Lịch workspace, sự kiện lớp và buổi làm riêng |
| Kiểm định | DCA-checked theo các quyết định về phạm vi lịch |
| Bằng chứng duyệt | [SRC-04, SRC-10, SRC-15, SRC-19, SRC-24, SRC-26, Q11, Q12, Q27, Q31, Q33-A3, H6, J7–J9](../../review/provenance.md) |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| CAL-01 | “Lịch của tôi” tổng hợp xuyên workspace theo quyền truy cập và hiển thị theo múi giờ người xem. Lịch trong workspace theo phạm vi workspace đang mở. | SRC-04, Q27 |
| CAL-02 | Lịch có sự kiện độc lập với công việc, như lịch học, lịch thi, cuộc hẹn cá nhân. Thành viên tự tạo sự kiện riêng. | SRC-04, Q12 |
| CAL-03 | Khi tạo sự kiện lớp, giáo viên chọn cả lớp hoặc các nhóm cụ thể. Sự kiện xuất hiện trong Lịch của tôi và Lịch của các workspace nhóm liên quan theo đối tượng nhận và quyền truy cập. | SRC-04, Q11 |
| CAL-04 | Giáo viên và người quản lý workspace nhóm được tạo sự kiện chung của nhóm. Lớp trưởng có quyền tạo khi giáo viên cấp. Quyền sửa lịch chung theo PER-02. | SRC-02, Q12 |
| CAL-05 | Buổi làm riêng của công việc chỉ xuất hiện với người sở hữu. Quy tắc đặt buổi làm và nhãn “Làm muộn” ở TASK-07. | SRC-04, Q19 |
| CAL-06 | Cho lưu các sự kiện trùng giờ và hiện cảnh báo khi trùng. Người có quyền sửa sự kiện đã gửi thì phần cập nhật hiển thị cho đối tượng nhận trong đúng phạm vi sự kiện. Sự kiện lặp ngoài phạm vi bản đầu theo CAL-10. | Q31 |
| CAL-07 | Lịch workspace và Lịch lớp hiển thị thời điểm theo múi giờ người xem, như Lịch của tôi. Khi tạo sự kiện từ Lịch của tôi, người dùng chọn phạm vi riêng hoặc workspace có quyền; khi tạo từ Lịch workspace, đích mặc định là workspace đang mở. Hạn bài vẫn được xác định theo múi giờ lớp theo ASG-07. | Q33-A3, SRC-19 |
| CAL-08 | Người tạo sự kiện chung, người có quyền quản lý workspace nhóm và giáo viên chủ lớp được sửa sự kiện chung thuộc phạm vi của họ; quyền sửa lịch chung của Lớp trưởng theo cấu hình lớp. Quyền xóa/hủy sự kiện tách khỏi quyền sửa. Khi sự kiện bị hủy, người nhận vẫn tra được dấu vết sự kiện đã hủy. | H6, SRC-24 |
| CAL-09 | Có sự kiện cả ngày: người tạo chọn một ngày hoặc khoảng ngày, không nhập giờ. Ngày gắn với múi giờ của phạm vi lúc tạo và giữ đúng ngày trên lịch khi người xem đổi múi giờ. Sự kiện có giờ vẫn hiển thị theo múi giờ người xem. Nguồn múi giờ cho từng phạm vi chưa có định nghĩa đầy đủ, theo R-11. | J7, SRC-26 |
| CAL-10 | Bản đầu không có sự kiện lặp hoặc điều khiển lặp hằng ngày/hằng tuần. Người dùng tạo từng sự kiện riêng; sửa một lần/cả chuỗi ở ngoài phạm vi bản đầu. | J8, SRC-26 |
| CAL-11 | Giáo viên chủ lớp, người tạo và người quản lý workspace của sự kiện được hủy sự kiện chung trong phạm vi họ có quyền. Lớp trưởng cần quyền Hủy riêng. Người nhận vẫn thấy dấu vết Đã hủy. Sự kiện riêng do chủ sự kiện sửa hoặc xóa. Giới hạn tư cách/lưu trữ theo PER-13 vẫn áp dụng. | J9, SRC-26 |

Xem [ma trận quyền](permission-matrix.md). Nguồn múi giờ phạm vi, biên khoảng ngày và trường hợp đổi loại sự kiện vẫn ở [R-11](../../review/unresolved.md); phương án xử lý tại [EC-13/14](../../review/edge-case-audit.md).
