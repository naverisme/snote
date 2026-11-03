# SNOTE v2 — Hồ sơ yêu cầu và thiết kế

Các tài liệu mô tả hành vi và kiến trúc đích để duyệt trước khi triển khai. Thứ tự đọc đi từ hành vi người dùng đến thiết kế và nghiệm thu.

| Thứ tự | Tài liệu | Nội dung |
|---|---|---|
| 1 | [Use Case](requirements/use-cases.md) | Sơ đồ 1. Tác nhân, chức năng, ngoại lệ và mã nghiệm thu. |
| 2 | [Luồng nghiệp vụ](requirements/business-workflows.md) | Sơ đồ 2. Luồng lớp học, việc cá nhân và Hộp thu nhanh. |
| 3 | [SRS](requirements/srs.md) và [phân quyền](requirements/permissions.md) | Phạm vi, yêu cầu chức năng và phi chức năng, quyền theo hành động. |
| 4 | [Kiến trúc hệ thống](architecture/system.md) | Sơ đồ 3 và 4. Ngữ cảnh, container, module và phụ thuộc. |
| 5 | [ERD](architecture/data-model.md) | Sơ đồ 5. Dữ liệu workspace, công việc, lớp, bài giao và bài nộp. |
| 6 | [Trình tự và API](architecture/sequences.md) | Sơ đồ 6. Kiểm tra quyền, tiến độ và nộp bài có thể thử lại. |
| 7 | [Điều hướng](architecture/frontend-navigation.md) và [triển khai](architecture/deployment.md) | Luồng màn hình và quy trình đưa bản phát hành qua staging. |
| 8 | [Kế hoạch bàn giao](delivery/plan.md) | Timeline, công sức, chi phí giả định và nghiệm thu. |

## Chuẩn bị coding

1. [Quyết định M0](requirements/decisions.md) ghi các mặc định triển khai và những mục cần kiểm chứng trước phát hành.
2. [Hợp đồng phối hợp](architecture/implementation-contracts.md) xác định biên module, giao diện dùng chung và dữ liệu thử.
3. [Hợp đồng API M1](architecture/m1-api-contract.md) ghi payload, mã lỗi, quy tắc ngày giờ và ví dụ để khóa hợp đồng.
4. [Phân công coding](delivery/agent-work-plan.md) chia phạm vi theo agent và thứ tự ghép.
5. [Hồ sơ sẵn sàng coding](delivery/coding-readiness.md) có phiếu giao A0/Q0 và bằng chứng cần có trước khi mở từng mốc.

Dùng mã UC, FR, NFR và AT để lần từ yêu cầu sang luồng và ca kiểm thử.
