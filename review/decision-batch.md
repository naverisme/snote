# Phiếu duyệt gộp Q21–Q37

Các câu hỏi tiếp nối Q01–Q20 đã được ghi ở PR #10. Từng hàng nêu rõ phần đã duyệt và phần còn là đề xuất. Dùng mã R để tra phần tài liệu bị chặn. [Hồ sơ nguồn](provenance.md) · [Sổ câu hỏi](unresolved.md)

## Workspace, lớp và quyền

| Mã | Cần quyết định | Kết quả hoặc phương án còn mở | Liên quan |
| --- | --- | --- | --- |
| Q21 | Workspace cá nhân mặc định có thể thêm thành viên hoặc đổi sang workspace khác không? | **Đã duyệt phần chia sẻ**: không cho chia sẻ workspace mặc định, tạo workspace khác để cộng tác [ACC-06](../docs/requirements/accounts-and-workspaces.md). Khả năng đổi workspace mặc định và đích Hộp thu vẫn mở. | R-07 |
| Q22 | Quyền mặc định ở workspace độc lập và phạm vi lớp trưởng được áp dụng thế nào? | **Đã chốt**: người tạo quản lý thành viên/cấp quyền trong workspace độc lập; thành viên thao tác việc được giao theo quyền; lớp trưởng mặc định xem/sửa công việc, lịch, ghi chú chung, cần quyền riêng cho tệp/đường dẫn; quyền theo tư cách dừng khi tư cách hết hiệu lực. [PER-02, PER-07, PER-08](../docs/requirements/permissions.md). | R-02, R-14 còn bàn giao chủ workspace độc lập |
| Q23 | Khi đã ở một nhóm, hệ thống xử lý yêu cầu chờ, lời mời cũ và thay đổi giới hạn ra sao? | **Đã chốt**: lời mời lưu trữ không hồi sinh khi rời; duyệt yêu cầu theo chỗ còn; giảm giới hạn giữ tư cách hiện có và chặn người vào mới. [CLS-11](../docs/requirements/class-membership.md). | CLS-11 |
| Q24 | Rời lớp, thiếu người nhận bàn giao và lưu trữ lớp xử lý thế nào? | **Đã chốt**: ngừng quyền đọc dữ liệu chung sau rời, giữ lịch sử, giáo viên chỉ định người nhận bàn giao trước khi rời; lớp lưu trữ đọc lịch sử theo quyền và chủ lớp có thể khôi phục. [CLS-12](../docs/requirements/class-membership.md). | R-09 |

## Công việc, lịch, Thư viện và bài giao

| Mã | Cần quyết định | Kết quả hoặc phương án còn mở | Liên quan |
| --- | --- | --- | --- |
| Q25 | Xếp một việc thỏa nhiều nhóm “Việc tiếp theo” và phá hòa thế nào? | **Đã chốt**: một nhóm ưu tiên/việc; quá hạn cũ trước, hạn hôm nay gần trước, thiếu hạn xét buổi làm sớm; bằng mốc xét quan trọng và giữ thứ tự ổn định. [TASK-11](../docs/requirements/tasks.md). | R-01 còn khóa phá hòa kỹ thuật |
| Q26 | Workspace nhóm có việc chờ phân công không và ai xử lý yêu cầu đổi người? | **Đã chốt**: có việc chờ phân công, tối đa một người phụ trách sau giao; người giao/quản lý quyết định đổi, người cũ chịu trách nhiệm đến khi đổi; checklist theo việc. [TASK-02, TASK-13](../docs/requirements/tasks.md). | R-12 còn quyền từng mục |
| Q27 | Dùng múi giờ nào cho ngày lọc và hiển thị lịch? | **Đã chốt**: lọc Hôm nay/Ngày mai và Lịch của tôi theo múi giờ người xem; hạn bài theo múi giờ lớp; hạn việc chỉ ngày giữ múi giờ lúc đặt. [TASK-06, TASK-10](../docs/requirements/tasks.md), [CAL-01](../docs/requirements/calendar.md). | R-11 còn sự kiện lặp |
| Q28 | Ai gửi cập nhật tiến độ bằng văn bản và ai xem bài, tiến độ, bản nộp? | **Đã chốt**: trưởng nhóm/người được cấp quyền gửi; giáo viên và thành viên nhóm nhận bài đọc; đọc liên nhóm cần quyền riêng do giáo viên cấp. [ASG-11](../docs/requirements/assignments-and-submissions.md). | ASG-11 |
| Q29 | Nhiều người nộp cùng lúc, tải tệp lỗi hoặc muốn thu hồi bản nộp thì sao? | **Đã chốt phần phiên bản/xung đột**: bản đã ghi giữ nguyên khi lỗi tải, người gửi phiên bản cũ cần xem lại, chỉ tạo phiên bản khi đủ phần, sửa bằng phiên bản mới theo quyền và hạn. **Thu hồi riêng bản nộp chưa được mô tả trong phương án**, vẫn mở. [ASG-12](../docs/requirements/assignments-and-submissions.md). | R-04 |
| Q30 | Thông tin tối thiểu, loại tệp và giới hạn lưu là gì? | **Đã chốt phần đầu**: cần nội dung theo loại văn bản/link/tệp; lưu nhanh cho phép thiếu tiêu đề và thư mục. **Định dạng và hạn mức tệp chưa có giá trị**. [LIB-05](../docs/requirements/library.md). | R-07 |
| Q31 | Sự kiện trùng giờ, lặp lại và sửa sau khi gửi xử lý ra sao? | **Đã chốt**: cho trùng giờ và cảnh báo; người có quyền sửa, người nhận thấy cập nhật đúng phạm vi; sự kiện lặp đặc tả sau. [CAL-06](../docs/requirements/calendar.md). | R-11 còn tính năng lặp |

## UX và đầu vào kỹ thuật

| Mã | Cần quyết định | Kết quả hoặc phương án còn mở | Liên quan |
| --- | --- | --- | --- |
| Q32 | Duyệt bố trí workspace và Gantt theo thành phần nào? | **Đã chốt** toàn bộ bốn lựa chọn cuối cùng, cùng các sửa đổi UXR-03–06 và UXR-07–14. Đặc tả thành phần, cấp, số lượng, hành động và trạng thái tại [docs/ux/workspace-gantt.md](../docs/ux/workspace-gantt.md). | SRC-14 |
| Q33 | Phạm vi tiếp theo của đặc tả màn nào cần có trước khi bàn giao thiết kế? | **Đã duyệt** C1–C5, A1–A3, B1–B3, D1–D2, E1–E8 (E1–E2 theo sửa đổi), F1–F10 và **quyền H1–H10**. **G1–G12 chỉ tạm duyệt** trong [phiếu G](blocked/ux-q33-g-provisional.md), chưa chuyển thành đặc tả triển khai. [Phiếu Q33](blocked/ux-q33-review.md), [chỉ mục UX](../docs/ux/README.md), [ma trận quyền](../docs/requirements/permission-matrix.md). R-05/R-02 còn phần chưa khóa. | SRC-16, SRC-17, SRC-19–24, R-05, R-02 |
| Q34 | Có ràng buộc bắt buộc về công nghệ, tự lưu trữ hoặc quy mô không? | Chủ sản phẩm đưa bộ React/TypeScript/Vite/Tailwind, NestJS, PostgreSQL/Prisma, REST, GitHub, Docker Compose; đồng ý điều chỉnh xác thực theo đề xuất. Đối chiếu và phương án lưu trữ trong [hồ sơ kỹ thuật để duyệt](blocked/storage-proposal.md). Chưa có số liệu quy mô hoặc quyết định nơi lưu tệp. | R-06, R-15 |
| Q35 | Hợp đồng bản đầu phục vụ ai? | **Đã duyệt hướng**: đặc tả giao tiếp cho web v2 trước; chỉ đặc tả thêm ứng dụng khác khi phạm vi ấy được chốt. Endpoint/trường/lỗi vẫn cần thiết kế. | R-06, R-07, R-15 |
| Q36 | Các ca nào dùng làm nền nghiệm thu và cần đo chất lượng gì? | **Đã duyệt hướng và 12 ca nền** [tại `quality/`](../docs/quality/acceptance-scenarios.md). Quy mô thử, thời gian đáp ứng và mục tiêu phục hồi chưa có giá trị cụ thể. | R-08, R-16 |
| Q37 | Bản đầu thử nghiệm riêng hay phát hành rộng, cần môi trường và phục hồi ở mức nào? | **Đã duyệt trình tự làm rõ**: chọn đối tượng thử rồi xác định môi trường, quyền truy cập và mục tiêu sao lưu/phục hồi. Đối tượng, mức mất dữ liệu và thời gian khôi phục chưa được nêu nên vẫn mở. | R-08, R-17 |

Các câu chưa chốt có thể trả lời theo mã, ví dụ `duyệt Q22–Q24, sửa Q25 ...`. Các phần để mở tiếp tục nằm ở hồ sơ rà soát; không mặc định được duyệt chỉ vì Q32 đã chốt.
