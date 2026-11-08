# Kiểm kê DCA — gộp đặc tả và lọc tệp lịch sử

| Phạm vi | Kết quả |
| --- | --- |
| Nguồn | `naverisme/snote`, chỉ nhánh `s_note_v2`, commit gốc `49caff82e8b004ca0afc2ab52229c4711fdd9334`; cây sạch trước khi sửa. Không dùng v1 hoặc `project_sources/`. |
| Đã kiểm | 36 tệp `docs/`, 34 tệp `review/`, chỉ mục, mã quy tắc và dấu vết nguồn, lược đồ Prisma ở mức danh mục model; các liên kết Markdown liên quan. |
| Chưa kiểm | Tính đúng của mọi endpoint, test và ràng buộc DB khi chạy; toàn bộ triển khai UI; sơ đồ chưa qua renderer Mermaid trên GitHub. |
| Phân loại | `docs/` là đặc tả đích; `review/` là nguồn và bằng chứng theo SHA; `apps/`, `packages/`, `tests/`, `tools/`, Compose và manifest là mã/cấu hình công cụ đang có, không tự xóa. Tệp lịch sử không là mã nguồn hay đặc tả đang có hiệu lực. |
| Kết quả cây | `docs/` từ 36 xuống 30 tệp (bao gồm OpenAPI); `review/` từ 34 lên 15 sau khi bỏ 20 tệp và thêm hồ sơ này. 11 đặc tả thành 5 tệp chủ đề; 20 bản lưu trữ/nháp/snapshot rời cây hiện hành, nội dung còn trong commit gốc. |

## Nơi lưu chính và ánh xạ

| Nguồn cũ | Nơi tra hiện hành | Cách xử lý |
| --- | --- | --- |
| `product/concepts.md`, `first-release.md` | [product/overview.md](../docs/product/overview.md) | Gộp khái niệm, phạm vi bản đầu, thêm sơ đồ cấp lớp–workspace; giữ nguồn theo phần. |
| `requirements/permissions.md`, `permission-matrix.md` | [requirements/access-control.md](../docs/requirements/access-control.md) | Một tệp cho vai trò PER và hành động PM; giữ nguyên mã, điều kiện và ngoại lệ. |
| `ux/validated-navigation.md`, `task-views.md`, `workspace-gantt.md` | [ux/workspace-and-tasks.md](../docs/ux/workspace-and-tasks.md) | Gộp NAV, VIEW, UXR theo thứ tự phân cấp → chế độ → thành phần/trạng thái; bỏ đoạn tóm lặp. |
| `architecture/data-and-transactions.md`, `physical-schema.md` | [architecture/data-model.md](../docs/architecture/data-model.md) | Gộp logic, giao dịch, lược đồ; thêm quan hệ khái niệm và sửa tên model giả `PersonalWorkspace`, `PolicyOverride`, `TaskHistory` để tránh nhầm là bảng Prisma. |
| `contracts/README.md`, `action-catalog.md` | [contracts/README.md](../docs/contracts/README.md) | Một bảng thao tác/payload và một phần quy ước, mã lỗi, ví dụ; OpenAPI vẫn là nguồn máy đọc được. |
| `review/archive/`, `review/blocked/`, `review/document-understanding-presentation.md` | [Lịch sử commit gốc](https://github.com/naverisme/snote/tree/49caff82e8b004ca0afc2ab52229c4711fdd9334/review) | 20 tệp đã hoàn tất, chỉ là đề xuất chưa duyệt hoặc ảnh chụp tiến độ. Bỏ khỏi cây hiện hành, sửa link tham chiếu thành URL khóa SHA. Không dùng làm quy tắc. |

**Giữ riêng vì khác đối tượng đọc:** `requirements/structural-rules.md` ghi bổ sung vòng đời theo SRC-27, các tệp nghiệp vụ giữ mã ACC/CLS/TASK/CAL/LIB/ASG; `ux/ui-and-motion.md` quy định trạng thái chung, bốn màn CUX theo tính năng; `architecture/security-boundaries.md` là ranh giới bảo mật, `decision-algorithms.md` là nhánh quyết định; OpenAPI vẫn là hợp đồng máy đọc được. Không gộp các chức năng chỉ vì tệp ngắn: agent cần nơi sở hữu rõ cho từng màn và từng luật.

## Phát hiện và giới hạn

| Mã | Kết luận | Xử lý |
| --- | --- | --- |
| DCA-09 STALE | `contracts/action-catalog.md` còn nói cổng #28 chưa làm, trong khi [ENV-05](unresolved.md) đã khép cổng coding theo PR #39. `contracts/README.md` còn nhắc việc #29 trong tương lai. | Viết lại thành yêu cầu đồng bộ contract khi thay; không khẳng định môi trường pilot đã đạt. |
| DCA-10 AMBIGUITY | ASG-02 có ba nguồn tiến độ nhưng chưa định nghĩa tỷ lệ tổng hợp nhóm; màn CUXD-03 đã tránh tự tính tỷ lệ. | Ghi [GAP-02](unresolved.md), giữ ba nguồn hiển thị riêng; không suy công thức. |
| DCA-11 AMBIGUITY | TASK-11/17 chưa phân nhóm việc không hạn chỉ có buổi làm riêng đã qua. | Tiếp tục [GAP-01](unresolved.md), không tự đổi thuật toán A5. |
| DCA-12 UNVERIFIED | Sơ đồ lược đồ và bảng thiết kế có thể không tương đương mọi ràng buộc trong migration; danh mục `model` Prisma tại mốc nguồn có 36 model, nhưng sự có mặt của model không chứng minh giao dịch xuyên bảng. | Đổi tên các thực thể khái niệm bị tưởng là bảng; nhấn mạnh schema và migration là hiện trạng mã, tài liệu là thiết kế, cần kiểm bằng test/SQL khi kết luận đã triển khai. |
| DCA-13 DUPLICATE | Chỉ mục UX, yêu cầu và product liệt kê nhiều dòng trỏ cùng một chủ đề sau khi gộp. | Một dòng mỗi tệp chủ đề; link tương đối cũ được chuyển, mã PER/PM/NAV/VIEW/UXR giữ nguyên. |

**Bằng chứng và hiệu lực:** Quy tắc nghiệp vụ có mã vẫn dựa vào [provenance](provenance.md) và hồ sơ quyết định theo phạm vi, không dựa vào tuổi tệp hoặc thao tác merge. Các hình mới chỉ là Mermaid khái niệm, không nhận là UML/ERD chính thức; hướng cạnh và nguồn đã đối chiếu với STR-01/04/05, ASG-01. Báo cáo test cũ có giá trị đúng môi trường/SHA đã ghi. Không đọc v1. Kiểm liên kết, ID và cú pháp cần thực hiện sau khi chỉnh các chỉ mục.
