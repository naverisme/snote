# SNOTE v2 — Điều hướng và chế độ xem đã xác nhận

- **Trạng thái:** Đã duyệt ở mức phân cấp và hành vi nêu dưới đây; số lượng, vị trí chi tiết của từng thành phần trên màn hình chưa được duyệt lại.
- **Phạm vi:** Giao diện SNOTE v2.
- **Người chịu trách nhiệm:** Chủ sản phẩm.
- **Ngày cập nhật:** 2026-11-05.
- **Nguồn quyết định:** Các xác nhận trực tiếp của chủ sản phẩm trong phiên rà soát ngày 2026-11-05; pull request đưa tệp này vào `s_note_v2` ghi phạm vi thay đổi.

Định nghĩa lớp, nhóm và workspace ở [khái niệm sản phẩm](../product/concepts.md); phạm vi dữ liệu và quyền ở [quy tắc nghiệp vụ](../requirements/verified-business-rules.md). Tài liệu này chưa thay thế wireframe hoặc hợp đồng tương tác chi tiết.

## Trong một workspace

**Công việc | Lịch | Thư viện** là ba mục ngang cấp. Chúng đứng gần nhau; khi đổi mục, vùng nội dung chính chỉ hiển thị tính năng được chọn trong cùng workspace. Nút **Thư viện** ở cạnh **Lịch** để người dùng mở ghi chú, đường dẫn và tệp khi cần. Không thêm “Ghi chú” và “Tài liệu” như hai mục ngang cấp chứa dữ liệu trùng với Thư viện.

**Thư viện** có Hộp thu, thư mục và các mục văn bản/ghi chú, đường dẫn, tệp. Hộp thu của workspace cá nhân mặc định nhận nội dung lưu nhanh chưa phân loại. Lối vào “Lưu nhanh” có thể được dùng từ màn khác nhưng đích lưu và phạm vi riêng tư vẫn là Hộp thu này; vị trí nút và cách nhận nội dung từ nền tảng khác chưa được chốt.

## Công việc và các cách xem

- **Gantt** là chế độ mặc định khi mở Công việc. **Danh sách** là chế độ cùng cấp để xem tổng quan và thao tác trên nhiều việc, gồm lưu trữ hoặc xóa hàng loạt theo quyền.
- Hai chế độ đọc cùng công việc gốc; chuyển cách xem không tạo bản sao. Bộ lọc như Hôm nay, Ngày mai và Quan trọng quyết định tập việc; thứ tự hiển thị có mặc định theo bộ lọc và có thể đổi mặc định trong cài đặt.
- “Việc của tôi” là phạm vi xuyên workspace; Công việc trong workspace chỉ hiển thị việc thuộc workspace đó. Cả hai tuân quyền đọc hiện hành.
- Hạn, khoảng từ lúc giao đến hạn, lịch làm riêng và buổi làm muộn là các ý nghĩa khác nhau. Bản vẽ Gantt và Lịch phải diễn đạt rõ ý nghĩa từng mốc/thanh, không coi khoảng được giao để hoàn thành là thời gian làm liên tục.

## Lịch

Lịch của tôi, Lịch workspace và Lịch lớp là các phạm vi xem; cùng một sự kiện gốc có thể xuất hiện trong nhiều phạm vi phù hợp quyền mà không tạo mục trùng trong một màn. Lịch riêng không làm lộ buổi làm cá nhân cho người khác. Bấm mục liên quan đến công việc hoặc bài giao mở đúng đối tượng gốc.

Các lựa chọn về ngày/tuần/tháng, bộ lọc chi tiết, số nút, vị trí từng điều khiển và trạng thái tải/trống/lỗi phải được duyệt ở đặc tả màn hình sau; không suy ra từ các wireframe cũ.
