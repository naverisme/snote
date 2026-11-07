# Foundation #28 — giới hạn và kiểm chứng

Nguồn: issue #28, `IMPLEMENTATION_PLAN.md` F1–F6, `docs/architecture/physical-schema.md`, `docs/contracts/README.md`, SRC-27. Đây là hồ sơ triển khai, không bổ sung quy tắc nghiệp vụ.

| Tình huống | Rủi ro | Lựa chọn trong foundation | Kết quả cần kiểm |
| --- | --- | --- | --- |
| Hai người kích hoạt nhóm cùng lúc | Vượt `groupLimit` dù unique active vẫn đúng | Module #29 phải khóa cặp lớp/người, kiểm lại số nhóm trong transaction; migration chỉ giữ unique active | QA-02 chạy hai request đồng thời, một request bị từ chối khi giới hạn một nhóm |
| Nộp commit nhưng mất phản hồi | Nộp đôi hoặc mất thời điểm chấp nhận | `OperationReceipt` có unique key và core yêu cầu callback transaction | QA-08 trả cùng receipt với cùng key/body, khác body 409 |
| Cập nhật từ version cũ | Ghi đè âm thầm | `requireVersion` trả 412; các module phải tăng version trong cùng transaction | QA-05/08 chỉ một writer thành công |
| Bytes upload xong nhưng DB commit thất bại | Tệp lạc và UI báo thành công giả | `StoragePort` tách staging/verify; module #35 chốt ref sau xác minh | QA-06 kiểm không có item hoàn chỉnh khi thất bại |
| Migration chạy trên DB trắng và reset | SQL CHECK/partial unique lỗi ở PostgreSQL thật | CI dùng PostgreSQL 17.7, deploy rồi reset/migrate | Job foundation xanh và truy vấn DB kiểm ràng buộc |

Kết quả cũ ngày 2026-11-07: lúc đó chưa có PostgreSQL chạy được để kiểm migration/constraint. Seed chỉ có `fixture@example.invalid`, không có người thật. Xem kết quả mới bên dưới; không dùng ghi chú cũ làm trạng thái hiện tại.

Sau khi mở PR #39, GitHub Actions trả `failure` trước khi tạo runner/bước chạy. Annotation của check run `128443560482`: "The job was not started because your account is locked due to a billing issue." Chưa có kết quả migration từ CI; cần xử lý trạng thái thanh toán GitHub rồi chạy lại job hoặc dùng PostgreSQL local để có bằng chứng F4/F6.

## Kiểm Foundation ngày 2026-11-08

Sau khi PR #41 merge thành `54d06f68`, nhánh Foundation đã merge head mới (`5c3f27c`). Máy có PostgreSQL 18.6 cài sẵn nhưng service hệ thống không mở được trong phiên này. Tạo một cluster riêng tại `%TEMP%/snote-v2-foundation-pg18-20261108`, chỉ nghe `127.0.0.1:15432`, database thử riêng `snote_foundation`, auth trust chỉ cho instance phát triển cục bộ. Cổng mặc định 55432 thuộc dải port Windows loại trừ; chuyển sang 15432. Không dùng dữ liệu người thật.

Với `DATABASE_URL=postgresql://snote@127.0.0.1:15432/snote_foundation?schema=public`, đã chạy `prisma generate`, `prisma migrate deploy`, `prisma migrate reset --force --skip-seed` trên **database thử riêng**, và `npm run check:db --workspace @snote/api`. Migration DB trắng và reset/migrate lần hai đạt. Kiểm DB đã xác nhận lỗi PostgreSQL đúng mã: unique active `23505`, tên workspace bắt buộc `23502`, scope workspace sai `23514`, dạng thời gian event sai `23514`; đọc lại tên workspace sau ghi thành công. Trước và sau sửa AA-F02 đều chạy được trên PostgreSQL 18.6.

Đã chạy lại `python -m openapi_spec_validator docs/contracts/openapi.yaml`, generator OpenAPI + `npm run contract:generate`, validator cục bộ (78 paths, 98 operations, 871 refs), `prisma validate`, build API/web và 3 core tests; tất cả đạt. Generator chạy lại không để diff ngoài thay đổi nguồn AA-F02. AA-F02 thêm `Workspace.name` bắt buộc vào schema, migration, response và lược đồ kiến trúc; module Ngữ cảnh #29 phải đặt tên cho workspace mặc định khi tạo.

Giới hạn: kế hoạch pin PostgreSQL 17.7 và CI chạy trên phiên đó; lần kiểm này dùng 18.6, chưa thay thế bằng chứng tương thích 17.7. GitHub Actions vẫn cần chạy lại khi tài khoản được mở. Các khoảng trống AA-F01, AA-F03–09 trong hồ sơ API-A chưa giải quyết; không merge Foundation chỉ dựa vào kết quả này. Log test đầy đủ và SHA sau khi commit cần ghi vào PR #39.
