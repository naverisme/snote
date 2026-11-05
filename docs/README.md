# SNOTE v2 — Chỉ mục tài liệu

**Quy ước đã chốt:** xem [phân loại bảy nhóm và quy tắc duyệt](DOCUMENTATION_POLICY.md). Các tài liệu mới bên dưới ghi đúng **phạm vi đã được chủ sản phẩm xác nhận**. Các tệp trong danh mục cũ tiếp tục là đầu vào cần thẩm định; không suy ra yêu cầu, sơ đồ, hợp đồng, kế hoạch hay trạng thái sẵn sàng coding đã được duyệt.

## Nội dung đã xác nhận trong đợt rà soát

| Nhóm | Tài liệu | Phạm vi |
| --- | --- | --- |
| Sản phẩm | [Khái niệm và phạm vi](product/concepts.md) | Người dùng, lớp, workspace/nhóm, Thư viện, Việc của tôi và Lịch của tôi. |
| Yêu cầu | [Quy tắc nghiệp vụ đã xác nhận](requirements/verified-business-rules.md) | Quyền, tham gia, công việc, lịch, bài giao, tiến độ và nộp bài. |
| Trải nghiệm | [Điều hướng và chế độ xem](ux/validated-navigation.md) | Ba tính năng của workspace, Gantt mặc định và các phạm vi xem; chưa phải wireframe hoàn chỉnh. |

Các thuật ngữ và quy tắc mới được ưu tiên trong đúng phạm vi đã xác nhận; nếu một tệp cũ mâu thuẫn hoặc nêu chi tiết chưa được duyệt, cần rà lại theo [quy ước tài liệu](DOCUMENTATION_POLICY.md) trước khi dùng.

## Danh mục hiện có (chưa duyệt lại)

| STT cũ | Tài liệu | Nội dung đang mô tả |
|---|---|---|
| 1 | [Use Case](requirements/use-cases.md) | Sơ đồ 1. Tác nhân, chức năng, ngoại lệ và mã nghiệm thu. |
| 2 | [Luồng nghiệp vụ](requirements/business-workflows.md) | Sơ đồ 2. Luồng lớp học, việc cá nhân và Hộp thu nhanh. |
| 3 | [SRS](requirements/srs.md) và [phân quyền](requirements/permissions.md) | Phạm vi, yêu cầu chức năng và phi chức năng, quyền theo hành động. |
| 4 | [Kiến trúc hệ thống](architecture/system.md) | Sơ đồ 3 và 4. Ngữ cảnh, container, module và phụ thuộc. |
| 5 | [ERD](architecture/data-model.md) | Sơ đồ 5. Dữ liệu workspace, công việc, lớp, bài giao và bài nộp. |
| 6 | [Trình tự và API](architecture/sequences.md) | Sơ đồ 6. Kiểm tra quyền, tiến độ và nộp bài có thể thử lại. |
| 7 | [Cấu trúc frontend và đặc tả thành phần](architecture/frontend-information-architecture.md), [Điều hướng](architecture/frontend-navigation.md), [wireframe M1](architecture/frontend-wireframes.md), [wireframe M2–M3](architecture/frontend-collaboration-wireframes.md), [chế độ xem công việc và Gantt](architecture/task-views.md) và [triển khai](architecture/deployment.md) | Luồng màn hình, bố cục frontend cơ bản và quy trình đưa bản phát hành qua staging. |
| 8 | [Kế hoạch bàn giao](delivery/plan.md) | Timeline, công sức, chi phí giả định và nghiệm thu. |

## Tài liệu chuẩn bị coding hiện có (cần thẩm định lại)

1. [Quyết định M0](requirements/decisions.md) ghi các mặc định được đề xuất và những mục cần kiểm chứng trước phát hành.
2. [Hợp đồng phối hợp](architecture/implementation-contracts.md) đề xuất biên module, giao diện dùng chung và dữ liệu thử.
3. [Hợp đồng API M1](architecture/m1-api-contract.md) ghi payload, mã lỗi, quy tắc ngày giờ và ví dụ hợp đồng được đề xuất.
4. [Phân công coding](delivery/agent-work-plan.md) đề xuất phạm vi theo agent và thứ tự ghép.
5. [Hồ sơ sẵn sàng coding](delivery/coding-readiness.md) nêu phiếu giao A0/Q0 và bằng chứng được đề xuất trước khi mở từng mốc.

Dùng mã UC, FR, NFR và AT để lần từ yêu cầu sang luồng và ca kiểm thử.
