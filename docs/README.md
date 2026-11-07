# SNOTE v2 — Chỉ mục tài liệu

Tài liệu được chia theo câu hỏi cần trả lời. Mỗi chủ đề có nơi tra cứu chính và mã nguồn xác nhận. Xem [quy ước tài liệu](DOCUMENTATION_POLICY.md) để biết điều kiện đưa nội dung vào từng nhóm.

| Nhóm | Dùng để kiểm soát | Tài liệu hoặc trạng thái |
| --- | --- | --- |
| `product/` | SNOTE phục vụ ai, lớp và workspace là gì, bản đầu gồm luồng nào | [Khái niệm và phạm vi](product/README.md) |
| `requirements/` | Ai được làm gì, trong điều kiện nào, kết quả nghiệp vụ là gì | [Chỉ mục yêu cầu](requirements/README.md) và [cấu trúc/vòng đời](requirements/structural-rules.md) |
| `ux/` | Mục nào cùng cấp, màn nào mở và hành vi từng thành phần đã duyệt | [Chỉ mục màn](ux/README.md) và [hệ giao diện/chuyển động](ux/ui-and-motion.md) |
| `architecture/` | Ranh giới hệ thống, module, dữ liệu, bảo mật, quyết định thiết kế | [Kiến trúc v2](architecture/README.md) · [dữ liệu/giao dịch](architecture/data-and-transactions.md) · [lược đồ quan hệ](architecture/physical-schema.md) · [quyền/bảo mật](architecture/security-boundaries.md) |
| `contracts/` | Các bên trao đổi gì, quyền thực thi, lỗi và ví dụ | [Hợp đồng REST v2](contracts/README.md) · [danh mục thao tác](contracts/action-catalog.md) · [OpenAPI](contracts/openapi.yaml) |
| `quality/` | Điều kiện đạt, ca kiểm chứng và cách đo | [Tiêu chí và ca biên](quality/README.md) · [12 ca nền](quality/acceptance-scenarios.md) |
| `operations/` | Môi trường, phát hành, giám sát, sao lưu và phục hồi | [Vận hành pilot](operations/README.md) |

**Tra theo việc cần làm.** Muốn hiểu lớp và nhóm, đọc [khái niệm](product/concepts.md) rồi đến [tư cách lớp và nhóm](requirements/class-membership.md). Muốn kiểm nút nào xuất hiện trong Công việc, đọc [đặc tả Q32](ux/workspace-gantt.md) cùng [chế độ xem việc](ux/task-views.md). Muốn xem quyết định còn thiếu, vào [hồ sơ rà soát](../review/README.md); [24 ca tình huống](../review/edge-case-audit.md) nêu rủi ro và đề xuất của tác nhân, chưa phải đặc tả đã duyệt.
