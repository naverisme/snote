# Độ phủ tài liệu SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Mốc nguồn | `s_note_v2` tại `583435b35811ab4285447b3afb9aafbad04f6d82`, sau PR #10 |
| Đã đọc | Toàn bộ 9 tệp tại mốc nguồn và các quyết định trong cuộc trao đổi |
| Đã tổ chức | Tài liệu theo chủ đề ở `product/`, `requirements/`, `ux/`, `quality/` cùng chỉ mục và hồ sơ rà soát; Q32 đã bổ sung đặc tả Gantt |
| Cập nhật sau mốc nguồn | Các quyết định đến SRC-26/J1–J11 đã đối chiếu; 24 ca rủi ro và đề xuất toàn vẹn dữ liệu nằm ở `review/`, chưa trở thành đặc tả đã duyệt |
| Bằng chứng | [Hồ sơ nguồn](provenance.md) |

## Khung tám bước và phần tài liệu tương ứng

| Bước đã thống nhất | Tài liệu kiểm soát | Trạng thái ở mốc này |
| --- | --- | --- |
| 1. Chốt bài toán và phạm vi | [Khái niệm](../docs/product/concepts.md) và [phạm vi bản đầu](../docs/product/first-release.md) | Đã ghi đối tượng, luồng chính và phạm vi web. Chi tiết phát hành theo R-08 và R-09. |
| 2. Chốt luồng nghiệp vụ | [Yêu cầu](../docs/requirements/README.md) theo bảy chủ đề | Có đường vào/rời lớp và nhóm, chờ phân công, vòng đời workspace theo I1–I5 và các trường hợp biên; bổ sung hạn mức/phiên bản/sự kiện/giao lại theo J; tình huống giao nhau còn ở sổ câu hỏi và EC. |
| 3. Chốt quy tắc và quyền | [Vai trò và quyền](../docs/requirements/permissions.md), [ma trận H1–H10](../docs/requirements/permission-matrix.md) cùng quy tắc ở từng chủ đề | Đã rõ chủ workspace độc lập, quyền lớp trưởng, ngừng quyền khi rời, quyền đọc/cập nhật bài theo nhóm, nhiều hành động và cách hợp quyền kiêm nhiệm. J9/J11 bổ sung quyền Hủy và giao lại checklist. Các ô quyền chưa xác định còn ở R-02. |
| 4. Duyệt kiến trúc giao diện | [Điều hướng và cách xem việc](../docs/ux/README.md), [Gantt Q32](../docs/ux/workspace-gantt.md), [bốn màn Q33](../docs/ux/README.md) | Khung workspace/Gantt, C1–C5, A1–A3, B1–B3, D1–D2, E1–E8, F1–F10 và Thư viện I6–I13 đã duyệt. [G1–G12](blocked/ux-q33-g-provisional.md) tạm duyệt; các ô quyền/trạng thái chưa rõ còn ở R-02/R-05. |
| 5. Chốt mô hình hệ thống và dữ liệu | Nhóm `architecture/` | Có [đề xuất phiên bản, tệp và toàn vẹn](blocked/data-integrity-proposal.md) để phản biện; chưa duyệt, ranh giới module/toàn bộ mô hình vẫn mở. |
| 6. Khóa hợp đồng triển khai | Nhóm `contracts/` | Chờ cấu trúc hệ thống, quyền liên quan và quy tắc giao tiếp. |
| 7. Thiết kế nghiệm thu trước khi giao việc | Nhóm `quality/`, [12 ca đã duyệt](../docs/quality/acceptance-scenarios.md) | 12 ca nền Q36 đã duyệt; [24 ca tình huống](edge-case-audit.md) bổ sung điều kiện/kết quả mong đợi dưới trạng thái đề xuất. Chưa thực thi kiểm thử sản phẩm; ngưỡng đo vẫn mở. |
| 8. Lập kế hoạch coding và cổng duyệt | Theo dõi công việc trong công cụ điều phối theo [quy ước](../docs/DOCUMENTATION_POLICY.md) | Phạm vi coding, sở hữu tệp và cổng bàn giao phụ thuộc các đầu vào đã chốt. |

## Điều kiện để mở các nhóm còn thiếu

| Nhóm | Câu hỏi tài liệu phải trả lời | Bằng chứng đầu vào | Đầu ra khi được duyệt |
| --- | --- | --- | --- |
| `architecture/` | Hệ thống có những ranh giới nào? Dữ liệu và quyền đi qua đâu? | Quy tắc lớp bao trùm workspace, nhóm dùng chung khái niệm workspace, Hộp thu và lịch làm riêng, phiên bản nộp, ràng buộc kỹ thuật được chọn | Ngữ cảnh hệ thống, sơ đồ module, mô hình dữ liệu, ranh giới quyền và riêng tư, bản ghi quyết định kỹ thuật |
| `contracts/` | Bên nào đọc hoặc thay đổi dữ liệu nào, điều kiện và lỗi ra sao? | Kiến trúc đã duyệt, đặc tả thao tác UX, mã quy tắc quyền và hành vi | Danh mục thao tác, mô hình dữ liệu trao đổi, quyền, lỗi, phân trang, ví dụ, chính sách phiên bản |
| `quality/` | Kiểm từng quy tắc bằng cách nào và quan sát gì để kết luận đạt? | Mã quy tắc, UX và hợp đồng trong phạm vi nghiệm thu, Q36 duyệt 12 ca nền; mục tiêu chất lượng còn mở | Ma trận quy tắc → tình huống → kết quả mong đợi, ca quyền, ca biên và mục tiêu đo |
| `operations/` | Phát hành, theo dõi và khôi phục bản đang chạy thế nào? | Thiết kế triển khai, mục tiêu thử nghiệm hoặc phát hành, dữ liệu và thời gian phục hồi được chốt | Mô tả môi trường, phát hành và quay lui, giám sát, sao lưu và quy trình phục hồi |

Tên tệp chi tiết trong bốn nhóm sẽ theo quyết định kỹ thuật được chốt. [Phiếu duyệt](decision-batch.md) gom các quyết định đang chặn chúng.
