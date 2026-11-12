# Chạy SNOTE v2 bằng Docker Compose

## Thử trên localhost

1. Sao chép `deploy/.env.example` thành `deploy/.env.local`. Thay cùng một mật khẩu ngẫu nhiên ở `POSTGRES_PASSWORD` và phần mật khẩu của `DATABASE_URL`. Không commit tệp này.
2. Chạy `docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml up --build -d` từ gốc repo. Compose chờ PostgreSQL khỏe, chạy migration, rồi khởi động API và web.
3. Mở `http://localhost:8080`. Hộp thư thử đặt lại mật khẩu ở `http://localhost:8025`. Kiểm `http://localhost:8080/api/v2/ready` trả `{"status":"ready"}`.
4. Xem trạng thái bằng `docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml ps`. Xem log bằng cùng tiền tố lệnh và `logs -f api web`.

Google Sign-In chỉ xuất hiện nếu `GOOGLE_CLIENT_ID` và `VITE_GOOGLE_CLIENT_ID` cùng chứa Web Client ID của Google, có Authorized JavaScript origin `http://localhost:8080`. Thay đổi `VITE_GOOGLE_CLIENT_ID` cần build lại image web.

## Đưa lên domain thật

Tạo tệp môi trường riêng trên máy chủ. Đặt `SITE_ADDRESS` là domain đã trỏ DNS, `PUBLIC_BASE_URL=https://domain`, `BIND_ADDRESS=0.0.0.0`, `HTTP_PORT=80`, `HTTPS_PORT=443`, mật khẩu database riêng, ngân sách lưu trữ vật lý `MAX_STORAGE_BYTES` theo dung lượng đã cấp và SMTP thật (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`). Giá trị 1 GiB trong tệp mẫu chỉ để thử localhost. Dùng `compose.yaml` không kèm `compose.local.yaml`; Mailpit chỉ dành cho localhost. Mở cổng 80/443 để Caddy cấp và gia hạn TLS. Khai báo chính xác origin HTTPS trong Google Cloud rồi build lại web với Client ID.

Trước khi cấp tài khoản thật, phải thử backup và khôi phục **cả** volume PostgreSQL lẫn `storage_data` trong môi trường riêng; xác nhận đọc lại được tệp và các bản nộp. Đồng thời đặt ngân sách lưu trữ vật lý, cảnh báo, lịch backup và SMTP đáng tin cậy theo [quy trình vận hành](../docs/operations/README.md). `docker compose down` giữ volume; tránh `down -v` với dữ liệu thật. Chưa có máy chủ/domain và phép diễn tập restore nên việc chạy localhost không xác nhận đã sẵn sàng phát hành công khai.
