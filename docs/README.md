# SNOTE v2 — Chỉ mục tài liệu

Tài liệu được chia theo câu hỏi cần trả lời. Mỗi chủ đề có nơi tra cứu chính và mã nguồn xác nhận. Xem [quy ước tài liệu](DOCUMENTATION_POLICY.md) để biết điều kiện đưa nội dung vào từng nhóm.

| Nhóm | Dùng để kiểm soát | Tài liệu hoặc trạng thái |
| --- | --- | --- |
| `product/` | SNOTE phục vụ ai, lớp và workspace là gì, bản đầu gồm luồng nào | [Khái niệm và phạm vi](product/README.md) |
| `requirements/` | Ai được làm gì, trong điều kiện nào, kết quả nghiệp vụ là gì | [Bảy chủ đề nghiệp vụ](requirements/README.md) |
| `ux/` | Mục nào cùng cấp, màn nào mở và hành vi từng thành phần đã duyệt | [Điều hướng, Gantt và Danh sách](ux/README.md) |
| `architecture/` | Ranh giới hệ thống, module, dữ liệu, bảo mật, quyết định thiết kế | Chưa có thiết kế được duyệt. Có [đề xuất toàn vẹn dữ liệu](../review/blocked/data-integrity-proposal.md) để đánh giá; xem [đầu vào và đầu ra](../review/coverage.md). |
| `contracts/` | Các bên trao đổi gì, quyền thực thi, lỗi và ví dụ | Chờ thiết kế và hành vi liên quan được duyệt. Xem [đầu vào và đầu ra](../review/coverage.md). |
| `quality/` | Điều kiện đạt, ca kiểm chứng và cách đo | Có [12 ca nghiệm thu đã duyệt](quality/acceptance-scenarios.md); mục tiêu định lượng còn mở. |
| `operations/` | Môi trường, phát hành, giám sát, sao lưu và phục hồi | Chờ yêu cầu vận hành được duyệt. Xem [đầu vào và đầu ra](../review/coverage.md). |

**Tra theo việc cần làm.** Muốn hiểu lớp và nhóm, đọc [khái niệm](product/concepts.md) rồi đến [tư cách lớp và nhóm](requirements/class-membership.md). Muốn kiểm nút nào xuất hiện trong Công việc, đọc [đặc tả Q32](ux/workspace-gantt.md) cùng [chế độ xem việc](ux/task-views.md). Muốn xem quyết định còn thiếu, vào [hồ sơ rà soát](../review/README.md); [24 ca tình huống](../review/edge-case-audit.md) nêu rủi ro và đề xuất của tác nhân, chưa phải đặc tả đã duyệt.
