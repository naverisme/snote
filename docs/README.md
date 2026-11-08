# SNOTE v2 — Chỉ mục tài liệu

Tài liệu được chia theo câu hỏi cần trả lời. Mỗi chủ đề có nơi tra cứu chính và mã nguồn xác nhận. Xem [quy ước tài liệu](DOCUMENTATION_POLICY.md) để biết điều kiện đưa nội dung vào từng nhóm.

| Nhóm | Dùng để kiểm soát | Tài liệu hoặc trạng thái |
| --- | --- | --- |
| `product/` | SNOTE phục vụ ai, lớp và workspace là gì, bản đầu gồm luồng nào | [Khái niệm và phạm vi](product/README.md) |
| `requirements/` | Ai được làm gì, trong điều kiện nào, kết quả nghiệp vụ là gì | [Chỉ mục yêu cầu](requirements/README.md), [use case](requirements/use-cases.md) và [cấu trúc/vòng đời](requirements/structural-rules.md) |
| `ux/` | Mục nào cùng cấp, màn nào mở và hành vi từng thành phần đã duyệt | [Chỉ mục màn](ux/README.md) và [hệ giao diện/chuyển động](ux/ui-and-motion.md) |
| `architecture/` | Ranh giới hệ thống, module, dữ liệu, bảo mật, quyết định thiết kế | [Kiến trúc v2](architecture/README.md) · [dữ liệu và giao dịch](architecture/data-model.md) · [sơ đồ thuật toán](architecture/decision-algorithms.md) · [bảo mật](architecture/security-boundaries.md) |
| `contracts/` | Các bên trao đổi gì, quyền thực thi, lỗi và ví dụ | [Hợp đồng REST và danh mục thao tác](contracts/README.md) · [OpenAPI](contracts/openapi.yaml) |
| `quality/` | Điều kiện đạt, ca kiểm chứng và cách đo | [Tiêu chí và ca biên](quality/README.md) · [12 ca nền](quality/acceptance-scenarios.md) |
| `operations/` | Môi trường, phát hành, giám sát, sao lưu và phục hồi | [Vận hành pilot](operations/README.md) |

**Lối đọc ngắn:** [Tổng quan sản phẩm](product/overview.md) → [use case](requirements/use-cases.md) → đúng [quy tắc theo chủ đề](requirements/README.md) → [màn tương ứng](ux/README.md) → [kiến trúc](architecture/README.md) hoặc [API](contracts/README.md). Để kiểm Công việc/Gantt, dùng một [đặc tả điều hướng và màn Công việc](ux/workspace-and-tasks.md). Khi có lỗi/cạnh tranh, tra [sơ đồ quyết định](architecture/decision-algorithms.md). Các vấn đề chưa có câu trả lời nằm ở [unresolved](../review/unresolved.md), không tự suy thành yêu cầu.

`docs/` là **đặc tả đích**, không khẳng định phần mềm hiện đã đáp ứng. `review/` giữ dấu vết quyết định và kết quả theo commit. Mã chạy, migration và test nằm ngoài `docs/`. Các bản điều phối/đề xuất cũ đã rời cây hiện hành, vẫn truy lại được bằng lịch sử Git trong [hồ sơ kiểm kê](../review/dca-consolidation-20261109.md).
