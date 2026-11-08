# Phiếu duyệt gộp Q21–Q37

Các câu hỏi tiếp nối Q01–Q20 đã được ghi ở PR #10. Từng hàng nêu rõ phần đã duyệt và phần còn là đề xuất. Dùng mã R để tra phần tài liệu bị chặn. [Hồ sơ nguồn](provenance.md) · [Sổ câu hỏi](unresolved.md)

## Workspace, lớp và quyền

| Mã | Cần quyết định | Kết quả hoặc phương án còn mở | Liên quan |
| --- | --- | --- | --- |
| Q21 | Workspace cá nhân mặc định có thể thêm thành viên hoặc đổi sang workspace khác không? | **Đã duyệt phần chia sẻ**: không cho chia sẻ workspace mặc định, tạo workspace khác để cộng tác [ACC-06](../docs/requirements/accounts-and-workspaces.md). I1 sau đó chốt Hộp thu cố định, không đổi chủ/chia sẻ/lưu trữ workspace mặc định tại ACC-07. | R-07 |
| Q22 | Quyền mặc định ở workspace độc lập và phạm vi lớp trưởng được áp dụng thế nào? | **Đã chốt**: người tạo quản lý thành viên/cấp quyền trong workspace độc lập; thành viên thao tác việc được giao theo quyền; lớp trưởng mặc định xem/sửa công việc, lịch, ghi chú chung, cần quyền riêng cho tệp/đường dẫn; quyền theo tư cách dừng khi tư cách hết hiệu lực. [PER-02, PER-07, PER-08](../docs/requirements/access-control.md). Bàn giao chủ workspace độc lập chốt sau tại [ACC-08/09](../docs/requirements/accounts-and-workspaces.md). | R-02 còn các ô quyền cụ thể |
| Q23 | Khi đã ở một nhóm, hệ thống xử lý yêu cầu chờ, lời mời cũ và thay đổi giới hạn ra sao? | **Đã chốt**: lời mời lưu trữ không hồi sinh khi rời; duyệt yêu cầu theo chỗ còn; giảm giới hạn giữ tư cách hiện có và chặn người vào mới. [CLS-11](../docs/requirements/class-membership.md). | CLS-11 |
| Q24 | Rời lớp, thiếu người nhận bàn giao và lưu trữ lớp xử lý thế nào? | **Đã chốt**: ngừng quyền đọc dữ liệu chung sau rời, giữ lịch sử, giáo viên chỉ định người nhận bàn giao trước khi rời; lớp lưu trữ đọc lịch sử theo quyền và chủ lớp có thể khôi phục. [CLS-12](../docs/requirements/class-membership.md). | R-09 |

## Công việc, lịch, Thư viện và bài giao

| Mã | Cần quyết định | Kết quả hoặc phương án còn mở | Liên quan |
| --- | --- | --- | --- |
| Q25 | Xếp một việc thỏa nhiều nhóm “Việc tiếp theo” và phá hòa thế nào? | **Đã chốt**: một nhóm ưu tiên/việc; quá hạn cũ trước, hạn hôm nay gần trước, thiếu hạn xét buổi làm sớm; bằng mốc xét quan trọng và giữ thứ tự ổn định. [TASK-11](../docs/requirements/tasks.md). | R-01 còn khóa phá hòa kỹ thuật |
| Q26 | Workspace nhóm có việc chờ phân công không và ai xử lý yêu cầu đổi người? | **Đã chốt**: có việc chờ phân công, tối đa một người phụ trách sau giao; người giao/quản lý quyết định đổi, người cũ chịu trách nhiệm đến khi đổi; checklist theo việc. [TASK-02, TASK-13](../docs/requirements/tasks.md). | R-12 còn lịch riêng và ca biên checklist |
| Q27 | Dùng múi giờ nào cho ngày lọc và hiển thị lịch? | **Đã chốt**: lọc Hôm nay/Ngày mai và Lịch của tôi theo múi giờ người xem; hạn bài theo múi giờ lớp; hạn việc chỉ ngày giữ múi giờ lúc đặt. [TASK-06, TASK-10](../docs/requirements/tasks.md), [CAL-01](../docs/requirements/calendar.md). | R-11 còn nguồn múi giờ và khoảng ngày |
| Q28 | Ai gửi cập nhật tiến độ bằng văn bản và ai xem bài, tiến độ, bản nộp? | **Đã chốt**: trưởng nhóm/người được cấp quyền gửi; giáo viên và thành viên nhóm nhận bài đọc; đọc liên nhóm cần quyền riêng do giáo viên cấp. [ASG-11](../docs/requirements/assignments-and-submissions.md). | ASG-11 |
| Q29 | Nhiều người nộp cùng lúc, tải tệp lỗi hoặc muốn thu hồi bản nộp thì sao? | **Đã chốt phần phiên bản/xung đột**: bản đã ghi giữ nguyên khi lỗi tải, người gửi phiên bản cũ cần xem lại, chỉ tạo phiên bản khi đủ phần, sửa bằng phiên bản mới theo quyền và hạn. J6 sau đó chốt bản đầu **không có nút Thu hồi bản nộp**, tại ASG-18. [ASG-12](../docs/requirements/assignments-and-submissions.md). | R-04 |
| Q30 | Thông tin tối thiểu, loại tệp và giới hạn lưu là gì? | **Đã chốt phần đầu**: cần nội dung theo loại văn bản/link/tệp; lưu nhanh cho phép thiếu tiêu đề và thư mục. I8–I9 sau đó chốt loại tệp và mức **thử nghiệm** 25 MB/tệp, 1 GB/workspace tại [LIB-11](../docs/requirements/library.md); J1–J2 sau đó chốt cách tính và giữ lịch sử tại LIB-16/17; ngân sách vật lý và giá trị chính thức theo máy chủ còn R-07. | R-07, SRC-25 |
| Q31 | Sự kiện trùng giờ, lặp lại và sửa sau khi gửi xử lý ra sao? | **Đã chốt**: cho trùng giờ và cảnh báo; người có quyền sửa, người nhận thấy cập nhật đúng phạm vi; J8 sau đó xác nhận sự kiện lặp ngoài phạm vi bản đầu tại CAL-10. [CAL-06](../docs/requirements/calendar.md). | R-11 còn nguồn múi giờ và khoảng ngày |

## UX và đầu vào kỹ thuật

| Mã | Cần quyết định | Kết quả hoặc phương án còn mở | Liên quan |
| --- | --- | --- | --- |
| Q32 | Duyệt bố trí workspace và Gantt theo thành phần nào? | **Đã chốt** toàn bộ bốn lựa chọn cuối cùng, cùng các sửa đổi UXR-03–06 và UXR-07–14. Đặc tả thành phần, cấp, số lượng, hành động và trạng thái tại [docs/ux/workspace-gantt.md](../docs/ux/workspace-and-tasks.md). | SRC-14 |
| Q33 | Phạm vi tiếp theo của đặc tả màn nào cần có trước khi bàn giao thiết kế? | **Đã duyệt** C1–C5, A1–A3, B1–B3, D1–D2, E1–E8 (E1–E2 theo sửa đổi), F1–F10 và **quyền H1–H10**. **G1–G12 chỉ tạm duyệt** trong [phiếu G](https://github.com/naverisme/snote/blob/49caff82e8b004ca0afc2ab52229c4711fdd9334/review/blocked/ux-q33-g-provisional.md), chưa chuyển thành đặc tả triển khai. [Phiếu Q33](https://github.com/naverisme/snote/blob/49caff82e8b004ca0afc2ab52229c4711fdd9334/review/blocked/ux-q33-review.md), [chỉ mục UX](../docs/ux/README.md), [ma trận quyền](../docs/requirements/access-control.md). R-05/R-02 còn phần chưa khóa. | SRC-16, SRC-17, SRC-19–24, R-05, R-02 |
| Q34 | Có ràng buộc bắt buộc về công nghệ, tự lưu trữ hoặc quy mô không? | Chủ sản phẩm đưa bộ React/TypeScript/Vite/Tailwind, NestJS, PostgreSQL/Prisma, REST, GitHub, Docker Compose; đồng ý điều chỉnh xác thực theo đề xuất. Đối chiếu và phương án lưu trữ trong [hồ sơ kỹ thuật để duyệt](https://github.com/naverisme/snote/blob/49caff82e8b004ca0afc2ab52229c4711fdd9334/review/blocked/storage-proposal.md). Chưa có số liệu quy mô hoặc quyết định nơi lưu tệp. | R-06, R-15 |
| Q35 | Hợp đồng bản đầu phục vụ ai? | **Đã duyệt hướng**: đặc tả giao tiếp cho web v2 trước; chỉ đặc tả thêm ứng dụng khác khi phạm vi ấy được chốt. Endpoint/trường/lỗi vẫn cần thiết kế. | R-06, R-07, R-15 |
| Q36 | Các ca nào dùng làm nền nghiệm thu và cần đo chất lượng gì? | **Đã duyệt hướng và 12 ca nền** [tại `quality/`](../docs/quality/acceptance-scenarios.md). Quy mô thử, thời gian đáp ứng và mục tiêu phục hồi chưa có giá trị cụ thể. | R-08, R-16 |
| Q37 | Bản đầu thử nghiệm riêng hay phát hành rộng, cần môi trường và phục hồi ở mức nào? | **Đã duyệt trình tự làm rõ**: chọn đối tượng thử rồi xác định môi trường, quyền truy cập và mục tiêu sao lưu/phục hồi. Đối tượng, mức mất dữ liệu và thời gian khôi phục chưa được nêu nên vẫn mở. | R-08, R-17 |

## Quyết định sau Q33

| Mã | Phạm vi | Kết quả và nơi tra cứu |
| --- | --- | --- |
| I1–I5 | Workspace | Đã chốt Hộp thu cố định ở workspace cá nhân mặc định, chuyển chủ/rời/lưu trữ workspace độc lập và nhóm không tách khỏi lớp. [Tài khoản/workspace](../docs/requirements/accounts-and-workspaces.md) · [lớp/nhóm](../docs/requirements/class-membership.md) · [SRC-25](provenance.md). |
| I6–I13 | Thư viện và tệp | Đã chốt trình soạn danh sách tự động, URL và thẻ bìa đầu tiên, loại tệp và hạn mức thử nghiệm, bản sao độc lập, lựa chọn ghi đè có lịch sử/tạo bản sao, Thùng rác 30 ngày và trạng thái tải. [Yêu cầu](../docs/requirements/library.md) · [UX](../docs/ux/library-q33.md) · [SRC-25](provenance.md). |

Các phần để mở tiếp tục nằm ở hồ sơ rà soát. Các mã đã chốt không được hỏi lại như một quyết định còn thiếu; chỉ nêu phần phát sinh hoặc xung đột có dẫn nguồn.


## J1–J11 — Đã chốt tại SRC-26

Bảng lưu đúng phạm vi đề xuất được duyệt; các cơ chế kỹ thuật và chính sách mới được đề xuất sau đó nằm riêng trong [hồ sơ tình huống](edge-case-audit.md).

| Mã | Nội dung đã chốt | Quy tắc chính |
| --- | --- | --- |
| J1 | Hạn mức workspace tính tệp hiện hành và bản chụp tệp nộp; cùng nội dung trong một workspace tính một lần, sao chép qua workspace tính ở đích. Nội dung chỉ còn trong rác/lịch sử ghi đè không tính quota người dùng, vẫn theo dõi dung lượng máy chủ. | LIB-16 |
| J2 | Giữ lịch sử ghi đè khi mục hoạt động; xóa mục đưa các phiên bản vào rác 30 ngày, sau đó dọn trừ nội dung còn được bản nộp tham chiếu. | LIB-17 |
| J3 | Lấy tiêu đề/ảnh bìa URL đầu tiên khi lưu/đổi URL đầu, giữ kết quả để hiển thị lại, không lưu toàn văn. Fallback tên miền/URL; chỉ truy cập đích web công khai và kiểm chuyển hướng. | LIB-18 |
| J4 | Tệp đề bài và bản nộp dùng danh sách loại tệp, 25 MB/tệp như Thư viện. Tệp nộp tính vào workspace nhóm; tệp giáo viên đính kèm bài tính vào hạn mức riêng thử nghiệm 1 GB/lớp. | ASG-16 |
| J5 | Tệp xong nhưng ghi phiên bản nộp thất bại: không tạo phiên bản/đổi bản hiện hành/tính quota; báo thử lại, dọn tệp tạm. Chỉ thành công khi tệp và metadata phiên bản hoàn tất. | ASG-17 |
| J6 | Bản đầu không có nút Thu hồi bản nộp; sửa tạo phiên bản mới theo quyền và hạn, giữ bản cũ. | ASG-18 |
| J7 | Sự kiện cả ngày chọn ngày/khoảng ngày, không có giờ; gắn múi giờ phạm vi lúc tạo, giữ đúng ngày khi người xem đổi múi giờ. Sự kiện có giờ vẫn theo múi giờ người xem. | CAL-09 |
| J8 | Không có sự kiện lặp hoặc điều khiển hằng ngày/hằng tuần ở bản đầu; tạo từng sự kiện độc lập. | CAL-10 |
| J9 | Giáo viên chủ lớp, người tạo và người quản lý workspace hủy sự kiện chung trong đúng phạm vi; Lớp trưởng cần quyền Hủy riêng. Giữ dấu Đã hủy; chủ sự kiện riêng được sửa/xóa. | CAL-11, PM-23/24 |
| J10 | Chưa lên lịch nằm sau ba nhóm ưu tiên của Việc tiếp theo; gồm việc không có hạn/buổi làm, xếp quan trọng Cao → Vừa → Thấp, thời điểm tạo cũ trước, mã việc để ổn định khi bằng nhau. | TASK-17 |
| J11 | Giao lại giữ checklist/lịch sử; người nhận mới được sửa, người cũ mất quyền từ việc được giao trừ quyền quản lý độc lập. Giữ người/thời điểm sửa trước đó. | TASK-16, PM-13 |

**Giới hạn:** J chưa xác định trần vật lý, chi tiết giao dịch, thời điểm nộp sát hạn, múi giờ từng phạm vi hoặc khóa phá hòa mọi nhóm việc. J không chốt toàn bộ phiếu G. Yêu cầu chủ động của SRC-26 cho phép tác nhân tự phát triển và phản biện phương án, không tự ghi quyết định sản phẩm mới là đã duyệt.
