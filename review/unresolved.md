# Điểm còn mở — SNOTE v2

Quy tắc sản phẩm và phương án kiến trúc sau khi chủ sản phẩm giao tác nhân tự quyết tại [SRC-27](provenance.md) được tra ở [docs](../docs/README.md). Bảng này giữ các thông số cần đo tại môi trường thật và khoảng trống nghĩa chưa được chốt. Không điền giả số liệu hoặc lấy dữ liệu v1 để lấp khoảng trống.

| Mã | Đầu vào/giới hạn còn mở | Nơi sử dụng và điều kiện đóng |
| --- | --- | --- |
| ENV-01 | Máy chủ, kho tệp, giá lưu/traffic, công suất và ngân sách bytes vật lý; ngưỡng cảnh báo trước khi đầy | [Vận hành](../docs/operations/README.md), [quota](../docs/architecture/data-and-transactions.md). Đóng bằng cấu hình và phép đo thử, không gán số từ 1 GB logic |
| ENV-02 | Nhóm thử nghiệm đầu tiên, số lớp/thành viên/tệp dự kiến, dữ liệu và consent khi thử | [Chất lượng](../docs/quality/README.md), [vận hành](../docs/operations/README.md). Ca tải mô phỏng chỉ là điểm kiểm thử, không phải dự báo |
| ENV-03 | Khả năng thực tế đạt mục tiêu phục hồi 24 giờ dữ liệu/8 giờ dịch vụ và lịch backup theo nhà cung cấp | [Vận hành](../docs/operations/README.md). Đóng sau một lần phục hồi metadata + bytes đã đo |
| ENV-04 | Bộ icon và bản mẫu giao diện để kiểm bằng thiết bị/màn hình thật; lựa chọn font, độ tương phản, motion giảm | [UI/chuyển động](../docs/ux/ui-and-motion.md). Quy tắc tương tác/thời lượng đề xuất đã có; kiểm trước khi chốt hình ảnh cuối |
| ENV-06 | Nhà cung cấp gửi email và cấu hình gửi lại mật khẩu; trong development dùng bộ gửi giả không chứa địa chỉ thật | `POST /auth/password-reset-request`; đóng bằng dịch vụ được chọn, thử token hết hạn/một lần và giám sát lỗi gửi |
| GAP-01 | Việc không có hạn, chỉ có **buổi làm riêng đã qua**, vẫn chưa hoàn thành: TASK-11/17 không đặt nó vào ba nhóm hôm nay/quá hạn, nhưng TASK-17 cũng không xem là “không có buổi làm” để vào Chưa lên lịch | [Công việc](../docs/requirements/tasks.md), [sơ đồ A5](../docs/architecture/decision-algorithms.md). Cần xác định nó nằm ở nhóm nào hoặc một bộ lọc riêng; không tự sửa thứ tự đã chốt |

## Điều kiện kỹ thuật đã khép theo hồ sơ triển khai

| Mã | Bằng chứng trong phạm vi | Giới hạn còn lại |
| --- | --- | --- |
| ENV-05 | [PR #39](https://github.com/naverisme/snote/pull/39) và [hồ sơ foundation](foundation-audit.md) ghi OpenAPI validator, generated client và migration; `apps/api/prisma/` có schema/migration trên `bdc1df38` | Đã khép **cổng bắt đầu coding**, không chứng minh pilot trên máy chủ thực. Kiểm lại cùng SHA khi đổi contract/schema |

## Mã lịch sử đã được giải quyết

R-01/R-02/R-04/R-05/R-06/R-07/R-09/R-11/R-12 và phần thiết kế của R-08/R-15/R-16/R-17 được xử lý bởi [quy tắc cấu trúc](../docs/requirements/structural-rules.md), [ma trận quyền](../docs/requirements/permission-matrix.md), [kiến trúc](../docs/architecture/README.md), [hợp đồng](../docs/contracts/README.md), [UX](../docs/ux/ui-and-motion.md), [chất lượng](../docs/quality/README.md) và [vận hành](../docs/operations/README.md). Các ca EC-01–24 ở [hồ sơ rủi ro](edge-case-audit.md) là đầu vào thiết kế, không phải phát hiện lỗi đã chạy. R-03/R-10/R-13/R-14 đã đóng trước đó theo [dấu vết nguồn](provenance.md).

Các giá trị môi trường còn mở không biến một đề xuất G1–G12 trước SRC-27 thành quyết định đã duyệt trước đây. Xem [lịch sử phiếu G](blocked/ux-q33-g-provisional.md) khi cần truy nguyên. GAP-01 là lỗ hổng nghĩa của phép phân nhóm, không phải phát hiện lỗi chạy.
