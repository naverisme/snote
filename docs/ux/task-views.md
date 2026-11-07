# Chế độ xem công việc

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định vị trí của Gantt và Danh sách trong Công việc và cách người dùng thao tác |
| Phạm vi | “Việc của tôi” và Công việc của workspace trên web |
| Kiểm định | DCA-checked cho chế độ, mặc định và giới hạn thao tác của bản đầu |
| Bằng chứng duyệt | [SRC-03, SRC-04, SRC-07, Q09 và Q19](../../review/provenance.md) |

| Mã | Thành phần | Loại và quan hệ | Hành vi đã chốt |
| --- | --- | --- | --- |
| VIEW-01 | Gantt | Chế độ xem cùng cấp với Danh sách, thuộc Công việc | Mặc định khi mở “Việc của tôi” hoặc Công việc workspace. Mở chi tiết việc để sửa. Bản đầu chưa sửa bằng kéo thả trên trục. |
| VIEW-02 | Danh sách | Chế độ xem cùng cấp với Gantt, thuộc Công việc | Xem tổng quan và quản lý nhiều việc, gồm lưu trữ hoặc xóa hàng loạt theo quyền. |
| VIEW-03 | Phạm vi đang xem | Điều kiện chung của hai chế độ | Dùng tập việc theo phạm vi đang mở. Buổi làm riêng chỉ hiện cho người sở hữu. |
| VIEW-04 | Bộ lọc và sắp xếp | Điều khiển trong Công việc | Có Hôm nay, Ngày mai, Quan trọng và cài đặt thứ tự mặc định. Kết quả và thứ tự theo TASK-10 đến TASK-12. |

Có **hai chế độ cùng cấp đã chốt**. Gantt và Danh sách cùng thuộc Công việc. Lịch và Thư viện là mục ngang cấp với Công việc ở cấp workspace. [SRC-03 và Q19](../../review/provenance.md)

Chi tiết thành phần, trục thời gian, thao tác trên điện thoại và trạng thái màn đã được duyệt trong [khung workspace và màn Công việc/Gantt](workspace-gantt.md). [Hệ giao diện/chuyển động](ui-and-motion.md) bổ sung trạng thái, cách xử lý dữ liệu dao động và lối Sắp tới theo STR-19.
