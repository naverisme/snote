# Đầu vào triển khai còn cần giá trị thực — SNOTE v2

Quy tắc sản phẩm và phương án kiến trúc sau khi chủ sản phẩm giao tác nhân tự quyết tại [SRC-27](provenance.md) được tra ở [docs](../docs/README.md). Bảng này chỉ giữ những thông số không thể suy từ cuộc trao đổi hoặc cần đo tại môi trường thật. Đây không phải lý do để điền giả số liệu hay quay lại v1.

| Mã | Đầu vào/giới hạn còn mở | Nơi sử dụng và điều kiện đóng |
| --- | --- | --- |
| ENV-01 | Máy chủ, kho tệp, giá lưu/traffic, công suất và ngân sách bytes vật lý; ngưỡng cảnh báo trước khi đầy | [Vận hành](../docs/operations/README.md), [quota](../docs/architecture/data-and-transactions.md). Đóng bằng cấu hình và phép đo thử, không gán số từ 1 GB logic |
| ENV-02 | Nhóm thử nghiệm đầu tiên, số lớp/thành viên/tệp dự kiến, dữ liệu và consent khi thử | [Chất lượng](../docs/quality/README.md), [vận hành](../docs/operations/README.md). Ca tải mô phỏng chỉ là điểm kiểm thử, không phải dự báo |
| ENV-03 | Khả năng thực tế đạt mục tiêu phục hồi 24 giờ dữ liệu/8 giờ dịch vụ và lịch backup theo nhà cung cấp | [Vận hành](../docs/operations/README.md). Đóng sau một lần phục hồi metadata + bytes đã đo |
| ENV-04 | Bộ icon và bản mẫu giao diện để kiểm bằng thiết bị/màn hình thật; lựa chọn font, độ tương phản, motion giảm | [UI/chuyển động](../docs/ux/ui-and-motion.md). Quy tắc tương tác/thời lượng đề xuất đã có; kiểm trước khi chốt hình ảnh cuối |
| ENV-06 | Nhà cung cấp gửi email và cấu hình gửi lại mật khẩu; trong development dùng bộ gửi giả không chứa địa chỉ thật | `POST /auth/password-reset-request`; đóng bằng dịch vụ được chọn, thử token hết hạn/một lần và giám sát lỗi gửi |
| ENV-05 | OpenAPI máy đọc được đã có; còn validator chuẩn OpenAPI, client sinh từ spec, Prisma migrations tương thích phiên bản thư viện khi bắt đầu coding | [Hợp đồng](../docs/contracts/README.md). 78 path/98 operation đã sinh, schema vật lý có ở docs/architecture; đóng sau #28 kiểm validator chuẩn, codegen và migration chạy được |

## Mã lịch sử đã được giải quyết

R-01/R-02/R-04/R-05/R-06/R-07/R-09/R-11/R-12 và phần thiết kế của R-08/R-15/R-16/R-17 được xử lý bởi [quy tắc cấu trúc](../docs/requirements/structural-rules.md), [ma trận quyền](../docs/requirements/permission-matrix.md), [kiến trúc](../docs/architecture/README.md), [hợp đồng](../docs/contracts/README.md), [UX](../docs/ux/ui-and-motion.md), [chất lượng](../docs/quality/README.md) và [vận hành](../docs/operations/README.md). Các ca EC-01–24 ở [hồ sơ rủi ro](edge-case-audit.md) là đầu vào thiết kế, không phải phát hiện lỗi đã chạy. R-03/R-10/R-13/R-14 đã đóng trước đó theo [dấu vết nguồn](provenance.md).

Các giá trị môi trường còn mở không biến một đề xuất G1–G12 trước SRC-27 thành quyết định đã duyệt trước đây. Xem [lịch sử phiếu G](blocked/ux-q33-g-provisional.md) khi cần truy nguyên.
