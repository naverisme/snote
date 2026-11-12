# Kiểm chứng bản chạy localhost — 2026-11-12

| Mục | Kết quả |
| --- | --- |
| Nguồn | Nhánh `feat/release-readiness` từ `s_note_v2` SHA `6f9e816224d23a713f05b4940718d3df5e719021`; không dùng SNOTE v1 |
| Môi trường | Windows PowerShell, Node.js 22, Docker Desktop/Engine 29.9.2, PostgreSQL 17.7 trong Docker |
| Phạm vi | Cấu hình Compose một máy, API/Web, PostgreSQL, Mailpit thử nghiệm; sửa phân quyền thao tác nhóm và dữ liệu giả trên UI; reset mật khẩu qua SMTP |

## VERIFIED

- `npm run build`: API TypeScript và web Vite build thành công.
- `npm run test -w @snote/api`: 3/3 ca core qua.
- `node --test apps/api/dist/modules/identity/password-reset-mailer.spec.js`: 2/2 ca qua; reset tiêu thụ token một lần và thu hồi phiên cũ.
- `node --test apps/api/dist/modules/storage/storage.spec.js`: 6/6 ca qua; ngân sách vật lý tính mỗi byte một lần và chặn hai lần staging đồng thời vượt ngân sách trong một tiến trình API.
- `npm run contract:validate`: 87 paths, 107 operations, 982 references hợp lệ.
- `npm run contract:http`: typed client qua HTTP fixture.
- `npm run prisma:migrate -w @snote/api`: 2 migration trên PostgreSQL 17.7 thử nghiệm riêng ở `127.0.0.1:5433`.
- `npm run test:e2e`: **45/45 qua** trên DB thử nghiệm riêng, gồm HTTP, quyền, lớp, bài giao, nộp, thư viện, benchmark và ca workspace mới. Lần chạy đầu với PostgreSQL Windows đang dừng trả 503; sau khi chuyển sang DB thử nghiệm và chạy migration, toàn bộ ca qua.
- `docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml up --build -d`: image build và các dịch vụ khởi động; PostgreSQL và API healthy. Web chỉ bind `127.0.0.1:8080/8443`, Mailpit bind `127.0.0.1:8025`.
- HTTP qua Caddy: `/` trả 200, `/api/v2/ready` trả `ready`, Mailpit trả 200. Đăng ký 201, yêu cầu reset 201, Mailpit nhận thư, reset 201, đăng nhập mới 201, phiên cũ trả 401. Không ghi token reset hoặc secret vào báo cáo.
- `git diff --check`: không có lỗi whitespace.

## INFERRED / giới hạn phát hành

- Compose dùng volume bền cho DB và bytes; các ca trên xác nhận ứng dụng chạy localhost. Chưa diễn tập khôi phục **volume thực của Compose** trên máy chủ đích. Ca RECOV-01 của E2E kiểm metadata và bytes trong môi trường thử, không thay phép diễn tập triển khai.
- `npm audit --omit=dev --json` còn 9 cảnh báo (4 high, 5 moderate), chủ yếu chuỗi Prisma 6 và một số phụ thuộc bắc cầu. Cần triage và nâng cấp tương thích trước khi coi đây là bản phát hành công khai. Không tự nâng Prisma lên major mới khi chưa kiểm migration/client tương ứng.
- `MAX_STORAGE_BYTES` trong mẫu là 1 GiB cho localhost; giá trị máy chủ thật, cảnh báo dung lượng và lịch backup phải được chọn theo dung lượng đã cấp.

## UNKNOWN / đầu vào còn thiếu

- Google OAuth Web Client ID và origin hợp lệ chưa được người dùng cung cấp; luồng Google thực chưa kiểm.
- Chưa có SMTP thật; Mailpit chỉ là hộp thư thử localhost.
- Chưa có domain/máy chủ đích, DNS/TLS thực, lịch backup và phép thử restore trên môi trường đích. Không tuyên bố đã deploy công khai.
