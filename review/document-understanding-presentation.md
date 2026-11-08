# SNOTE v2 — Tôi hiểu bộ tài liệu như thế nào

> Bản trình bày tổng hợp để rà soát cách hiểu, đọc trên nhánh `s_note_v2` ngày 2026-11-07. Đây không phải quyết định sản phẩm mới, đặc tả thay thế hay báo cáo phần mềm đã chạy. Các liên kết dẫn tới nguồn hiện hành.

---

## 1. Bộ tài liệu có một trật tự hiệu lực

- `docs/` là nơi tra cứu dài hạn theo **bảy nhóm**: sản phẩm, nghiệp vụ, UX, kiến trúc, hợp đồng, chất lượng, vận hành.
- `review/` giữ dấu vết quyết định, phân tích rủi ro, bản thảo và thông số còn cần xác minh. Nội dung trong `review/blocked/` không tự trở thành yêu cầu triển khai.
- Quy tắc có mã trong tài liệu chủ đề; `review/provenance.md` giải thích nguồn và phạm vi xác nhận. Trạng thái của một file hoặc lịch sử Git không tự chứng minh nội dung đã được duyệt.
- Toàn bộ v2 có ranh giới nguồn riêng: **không lấy tài liệu, thiết kế, mã hay dữ liệu SNOTE v1** để lấp khoảng trống.

Nguồn: [chỉ mục](../docs/README.md), [quy ước](../docs/DOCUMENTATION_POLICY.md), [hồ sơ nguồn](provenance.md), [chỉ mục rà soát](README.md).

---

## 2. SNOTE giải quyết việc gì và có những đối tượng nào?

SNOTE phục vụ người học, người quản lý việc cá nhân và giáo viên: lưu thông tin để tìm lại, theo dõi việc và lịch, cộng tác theo workspace, giao bài và xem kết quả từng nhóm. Bản đầu là **web trên máy tính và điện thoại**.

| Đối tượng | Cách tôi hiểu |
| --- | --- |
| Tài khoản | Một người có thể chọn nhiều cách dùng; lựa chọn Giáo viên cho phép tạo lớp, nhưng quyền đọc/sửa dữ liệu luôn xét theo tư cách ở từng phạm vi. |
| Workspace cá nhân mặc định | Có cho mọi tài khoản, là nơi đặt Hộp thu riêng; không thêm thành viên, chuyển chủ hay lưu trữ. |
| Workspace cộng tác độc lập | Không nằm trong lớp; có thành viên, chủ, luồng bàn giao và lưu trữ riêng. |
| Lớp và nhóm | Lớp là cấp trên; **nhóm chính là workspace thuộc lớp**, không phải loại không gian tách rời. |

Nguồn: [khái niệm](../docs/product/concepts.md), [phạm vi bản đầu](../docs/product/first-release.md), [ACC-01–10](../docs/requirements/accounts-and-workspaces.md), [STR-01–03](../docs/requirements/structural-rules.md).

---

## 3. Tư cách và quyền là hai lớp kiểm tra khác nhau

- Vào lớp bằng **lời mời → người học chấp nhận** hoặc **mã lớp → giáo viên duyệt**. Người học vào lớp có vai trò Member ban đầu; vào nhóm là bước riêng.
- Vào nhóm qua lời mời/xếp nhóm cần người học chấp nhận; tự yêu cầu cần người có quyền duyệt. Giới hạn số nhóm đang hoạt động là cấu hình của lớp và được kiểm tại lúc kích hoạt. Lời mời vô hiệu không hồi sinh khi rời nhóm.
- Quyền được xét theo **đối tượng → tư cách còn hiệu lực → hành động và phạm vi → giới hạn riêng tư/lưu trữ/hạn**. Một người kiêm vai trò được cộng quyền hợp lệ trong đúng phạm vi. Nút trên UI không thay kiểm quyền ở máy chủ.
- Hộp thu và buổi làm riêng chỉ chủ dữ liệu thấy. Lớp hoặc nhóm lưu trữ chỉ đọc lịch sử theo quyền; rời đi phải bàn giao trách nhiệm và không xóa lịch sử.

Nguồn: [CLS-01–16](../docs/requirements/class-membership.md), [ma trận PM-01–24](../docs/requirements/permission-matrix.md), [STR-04, STR-07–14](../docs/requirements/structural-rules.md).

---

## 4. Công việc và Lịch có phạm vi rõ ràng

- **Việc của tôi** tổng hợp việc cá nhân và việc được giao từ các workspace còn quyền; **Công việc workspace** chỉ lấy dữ liệu workspace đang mở. Một việc có tối đa một người phụ trách chính, có thể chờ phân công.
- Người nhận cập nhật checklist, trạng thái và buổi làm riêng; đổi hạn, mức quan trọng, phân công và xóa là các quyền khác nhau. Hoàn thành cần thao tác xác nhận, không suy từ checklist đạt 100%.
- Gantt là cách xem mặc định; Danh sách là cách xem ngang cấp. Bản đầu sửa việc qua chi tiết, chưa kéo thanh Gantt để sửa.
- Lịch của tôi tổng hợp theo quyền. Sự kiện lớp có **một nguồn** với nhiều đối tượng nhận; các lịch chỉ là cách hiển thị. Sự kiện có giờ đổi theo múi giờ người xem; sự kiện cả ngày giữ ngày dân sự. Hủy sự kiện chung vẫn giữ dấu vết.

Nguồn: [TASK-01–17](../docs/requirements/tasks.md), [CAL-01–11](../docs/requirements/calendar.md), [chế độ xem việc](../docs/ux/task-views.md), [STR-05/17–19](../docs/requirements/structural-rules.md).

---

## 5. Thư viện ưu tiên tính độc lập và toàn vẹn

- Có Văn bản, Đường dẫn, Tệp và thư mục. Lưu nhanh đi vào **Hộp thu của workspace cá nhân mặc định**; mục mới ở nhóm là nội dung chung theo quyền.
- Sao chép sang workspace khác tạo mục độc lập. Ghi đè giữ lịch sử phiên bản; xóa chuyển Thùng rác 30 ngày. Bản nộp đã gửi vẫn giữ nội dung lúc gửi, dù mục nguồn đổi hoặc bị dọn.
- Chỉ báo tệp lưu thành công khi **bytes và thông tin mục** đều hoàn tất. Quota logic tính tệp hiện hành và bản chụp nộp theo phạm vi; rác/lịch sử chỉ còn bản cũ vẫn tiêu thụ dung lượng vật lý và cần giám sát riêng.
- Các giới hạn 25 MB/tệp và 1 GB/workspace hoặc lớp là mức **thử nghiệm**; ngân sách vật lý cần môi trường và phép đo thật.

Nguồn: [LIB-01–18](../docs/requirements/library.md), [ASG-16–17](../docs/requirements/assignments-and-submissions.md), [mô hình dữ liệu](../docs/architecture/data-and-transactions.md), [ENV-01](unresolved.md).

---

## 6. Bài giao được theo dõi theo từng nhóm và từng phiên bản

- Giáo viên giao cho cả lớp hoặc nhóm chọn; mỗi nhóm nhận có tiến độ và chuỗi bản nộp riêng. Ba nguồn theo dõi là số việc hoàn thành, checklist và cập nhật văn bản; tài liệu chưa đặt một công thức tỷ lệ tổng hợp cho ba nguồn.
- Quyền **Nộp** là quyền riêng, không suy từ quyền quản lý workspace. Bản nộp có văn bản, link, tệp và cần ít nhất một nội dung hợp lệ.
- Sau hạn, **Nộp lần đầu** và **Sửa bản đã nộp** là hai cài đặt độc lập; từng bài có thể kế thừa lớp, cho phép hoặc khóa. Hạn/cài đặt/quyền được xét khi máy chủ chấp nhận hoàn tất.
- Mỗi lần sửa tạo phiên bản bất biến mới; bản cũ giữ nội dung, thời điểm và tình trạng đúng/muộn theo hạn lúc nộp. Giáo viên nhận xét theo phiên bản. Bản đầu không có điểm số hay nút Thu hồi.

Nguồn: [ASG-01–18](../docs/requirements/assignments-and-submissions.md), [STR-05/16](../docs/requirements/structural-rules.md), [màn Bài giao](../docs/ux/assignments-q33.md).

---

## 7. UX giữ một ngữ cảnh và một tính năng đang mở

- Lối Lớp học đứng cùng cấp lối chọn workspace trên giao diện, dù lớp bao trùm nhóm ở **cấp dữ liệu**. Trong workspace có Công việc, Lịch trình, Thư viện; trong lớp có Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt. Chọn lớp mặc định mở **Thành viên**.
- Giao diện dùng một vùng dữ liệu chính, trạng thái tải/trống/lỗi, tương tác bàn phím và giảm chuyển động. Việc đổi ngữ cảnh nhanh cần ngăn phản hồi cũ phủ lên dữ liệu mới.
- Màn Gantt Q32 đã được chốt theo thành phần. Các màn Q33 có **phần C/A/B/D/E/F được duyệt theo đúng phạm vi**, còn `ui-and-motion.md` là thiết kế bổ sung theo quyền tự quyết SRC-27. Bản G1–G12 từng tạm duyệt vẫn là lịch sử rà soát.

Nguồn: [NAV-01–08](../docs/ux/validated-navigation.md), [khung Gantt](../docs/ux/workspace-gantt.md), [hệ UI và chuyển động](../docs/ux/ui-and-motion.md), [chỉ mục UX](../docs/ux/README.md), [SRC-19–27](provenance.md).

---

## 8. Kiến trúc và hợp đồng nối quy tắc với mã

- Bản đầu dùng web responsive, **backend một ứng dụng có các module nghiệp vụ**, PostgreSQL làm nguồn trạng thái, kho bytes bất biến và công việc nền cho preview/nhắc lịch/đối soát/dọn.
- DB và kho tệp không phải một giao dịch nguyên tử. Upload qua staging và xác minh; khi chốt phải kiểm lại quyền, tư cách, hạn, version và quota. Biên nhận chống lặp giúp biết kết quả khi trình duyệt mất phản hồi.
- REST `/api/v2` có quy ước lỗi, `If-Match`/ETag cho cập nhật, `Idempotency-Key` cho Nộp, ngày cả ngày với `endDateExclusive`. OpenAPI là nguồn route/trường/kiểu cho client và backend, được sinh từ generator, không sửa YAML trực tiếp.

Nguồn: [kiến trúc](../docs/architecture/README.md), [dữ liệu/giao dịch](../docs/architecture/data-and-transactions.md), [bảo mật](../docs/architecture/security-boundaries.md), [hợp đồng REST](../docs/contracts/README.md), [OpenAPI](../docs/contracts/openapi.yaml).

---

## 9. Kiểm chứng và vận hành vẫn có cổng riêng

- Có **12 ca nghiệm thu nền** được duyệt và QA-01–14 để kiểm sâu quyền, cạnh tranh, quota, mất phản hồi, múi giờ, preview và phục hồi. Đây là **điều kiện cần kiểm**, chưa phải kết quả chạy test.
- Pilot cần sao lưu và khôi phục **cả metadata lẫn bytes**, rồi đối soát bản nộp và quyền. Mục tiêu phục hồi 24 giờ dữ liệu/8 giờ dịch vụ là mục tiêu thiết kế phải diễn tập, chưa phải cam kết đã đo.
- `ENV-01–06` còn cần hạ tầng, ngân sách, nhóm thử, thiết bị/mẫu UI, email reset, validator/codegen/migration và phép đo thật. Có thể xây nền bằng dữ liệu giả trước khi các giá trị pilot được đóng.
- Kế hoạch coding đặt **foundation issue #28** làm cổng trước bảy worktree tính năng; integration #36 kiểm luồng thật sau khi các module ghép. Kế hoạch không phải bằng chứng tính năng đã hoàn tất.

Nguồn: [12 ca nền](../docs/quality/acceptance-scenarios.md), [QA-01–14](../docs/quality/README.md), [vận hành](../docs/operations/README.md), [đầu vào còn mở](unresolved.md), [kế hoạch](archive/coordination/IMPLEMENTATION_PLAN.md), [worktree](archive/coordination/WORKTREES.md).

---

## 10. Những rủi ro tôi sẽ kiểm đầu tiên khi triển khai

| Tình huống | Hậu quả cần tránh | Điểm kiểm |
| --- | --- | --- |
| Hai lượt duyệt nhóm hoặc hai upload cùng lúc | Vượt giới hạn nhóm/quota | Khóa hoặc tuần tự hóa tại điểm chốt; QA-02/06. |
| Nộp thành công nhưng mất phản hồi | Tạo hai phiên bản hoặc xóa nhầm tệp | Tra biên nhận bằng cùng key; QA-08/09. |
| Mục nguồn bị ghi đè/xóa sau khi đã nộp | Bản nộp cũ mất nội dung | Revision và tham chiếu bất biến; QA-05/14. |
| Rời nhóm, lưu trữ hoặc thu hồi quyền giữa thao tác | Lộ dữ liệu hoặc ghi vào phạm vi hết quyền | Kiểm lại quyền tại commit và lọc trước tổng hợp; QA-03/04/13. |
| Đổi múi giờ hoặc hủy sự kiện nhiều đối tượng nhận | Lệch ngày, trạng thái các lịch không đồng nhất | Một event nguồn, ngày cả ngày cố định; QA-10. |

Đây là thứ tự kiểm tra do tôi tổng hợp từ [24 ca phân tích](edge-case-audit.md) và [tiêu chí chất lượng](../docs/quality/README.md), không phải phát hiện lỗi trong ứng dụng đang chạy.

---

## Kết luận cách hiểu

SNOTE v2 đã có chuỗi tham chiếu **quyết định có nguồn → quy tắc nghiệp vụ → UX/kiến trúc → OpenAPI/schema → ca kiểm → vận hành**. Phần được giao quyền thiết kế tại SRC-27 có hiệu lực theo trạng thái từng tài liệu; các giá trị phụ thuộc môi trường và kết quả chạy vẫn phải được đo. Khi coding, thay đổi cần đi theo chuỗi này và giữ ranh giới nguồn v2.
