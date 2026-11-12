# Lấy thông tin và chạy SNOTE trên localhost

| Trường | Giá trị |
| --- | --- |
| Mục đích | Hướng dẫn người vận hành lấy đúng thông tin cấu hình và tự kiểm tra bản Docker Compose trên máy cá nhân |
| Phạm vi | SNOTE v2 chạy tại `http://localhost:8080`; Mailpit chỉ nhận thư thử trên máy này |
| Nguồn | Quyền thiết kế SRC-27; [cấu hình Compose](../../compose.yaml), [mẫu môi trường](../../deploy/.env.example), [hướng dẫn Docker](../../deploy/README.md) |
| Trạng thái | `VERIFIED`: tên biến, cổng và lệnh theo mã hiện hành. `INFERRED`: các bước thao tác trên dịch vụ bên ngoài theo tài liệu chính thức. `UNKNOWN`: Client ID Google của bạn và dung lượng máy cụ thể. |

## 1. Cần chuẩn bị gì?

| Thông tin | Lấy ở đâu | Bắt buộc cho localhost? | Điền vào đâu |
| --- | --- | --- | --- |
| Docker Desktop và Docker Compose | Cài Docker Desktop, mở ứng dụng; kiểm `docker version` và `docker compose version` | Có | Không điền vào tệp |
| Mật khẩu PostgreSQL mới | Tự tạo bằng lệnh bên dưới | Có khi tạo môi trường mới | `POSTGRES_PASSWORD` và phần mật khẩu trong `DATABASE_URL` phải giống nhau |
| Cổng web, Mailpit | Cấu hình sẵn: web `8080`, Mailpit `8025` | Có | `HTTP_PORT=8080`; Mailpit đã nằm trong `compose.local.yaml` |
| Google OAuth **Web Client ID** | Google Cloud Console, theo mục 3 | Chỉ khi muốn thử Đăng nhập Google | `GOOGLE_CLIENT_ID` và `VITE_GOOGLE_CLIENT_ID`, cùng một giá trị |
| SMTP thật | Nhà cung cấp email của bạn | **Không**; localhost dùng Mailpit | Chỉ cần cho máy chủ công khai |
| Domain/TLS công khai | Nhà cung cấp domain/máy chủ | **Không** | Chỉ cần cho máy chủ công khai |

Client ID Google có dạng `...apps.googleusercontent.com` và được dùng ở cả web lẫn API. Không cần nhập Google Client Secret cho luồng Google Identity Services đang dùng. Mật khẩu DB, khóa SMTP và tệp `deploy/.env.local` là bí mật: giữ trên máy của bạn, không gửi qua chat và không commit Git.

## 2. Tạo tệp cấu hình local

Mở PowerShell tại gốc repo SNOTE. **Nếu `deploy/.env.local` đã tồn tại và stack đang có dữ liệu, giữ nguyên mật khẩu DB hiện có.** PostgreSQL không đổi mật khẩu của volume cũ chỉ vì bạn sửa biến môi trường. Không chạy `docker compose down -v` với dữ liệu cần giữ.

Chỉ khi chưa có tệp môi trường, chạy:

```powershell
$dbPassword = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
$template = Get-Content deploy/.env.example -Raw
$template.Replace('replace-with-a-long-random-password', $dbPassword) |
  Set-Content deploy/.env.local
```

Lệnh sinh một mật khẩu ngẫu nhiên dạng hex và đặt cùng giá trị vào hai chỗ trong tệp. Mở `deploy/.env.local` để kiểm các dòng sau; để trống hai Client ID nếu chưa lấy được:

```dotenv
SITE_ADDRESS=http://localhost
PUBLIC_BASE_URL=http://localhost:8080
BIND_ADDRESS=127.0.0.1
HTTP_PORT=8080
HTTPS_PORT=8443
MAX_STORAGE_BYTES=1073741824
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
```

`MAX_STORAGE_BYTES=1073741824` là mức thử 1 GiB, không phải ngân sách tự động phù hợp mọi máy. Xem dung lượng trống của ổ chứa dữ liệu Docker và chọn mức có khoảng trống cho backup, bản nộp, tệp tạm. Các giá trị localhost ở trên giữ dịch vụ trên máy của bạn; không đổi `BIND_ADDRESS` thành `0.0.0.0` khi chỉ thử local.

## 3. Lấy Google Web Client ID (tùy chọn)

1. Mở [trang Clients của Google Auth Platform](https://console.cloud.google.com/auth/clients), chọn hoặc tạo một Google Cloud project. Điền tên ứng dụng `SNOTE` và thông tin liên hệ trong mục **Branding** nếu Console yêu cầu.
2. Chọn **Create client** → loại ứng dụng **Web application**. Ở **Authorized JavaScript origins**, thêm chính xác `http://localhost:8080`. Nếu còn dùng Vite trực tiếp ở cổng 5173, thêm `http://localhost:5173` như một origin thứ hai. Origin không có đường dẫn `/api/v2` và không có dấu `/` cuối. Luồng hiện tại nhận credential qua JavaScript callback nên không cần Authorized redirect URI.
3. Lưu, sao chép **Client ID** (không sao chép Client Secret) vào cả `GOOGLE_CLIENT_ID` và `VITE_GOOGLE_CLIENT_ID` trong `deploy/.env.local`. Hai giá trị phải giống hệt nhau. Cách tạo Client ID và cấu hình origin được Google mô tả trong [hướng dẫn Google Identity Services](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
4. Chạy lại lệnh `up --build -d` ở mục 4. Biến `VITE_GOOGLE_CLIENT_ID` được đóng vào web khi build; chỉ khởi động lại container sẽ không cập nhật nút Google. Mở trang bằng đúng `localhost:8080`, không đổi sang `127.0.0.1:8080` nếu origin Google chỉ khai báo `localhost`.

Nếu Google Console yêu cầu cấu hình Audience hoặc người dùng thử, hoàn thành các mục theo trạng thái của project; [Google Auth Platform Audience](https://support.google.com/cloud/answer/15549945) là nơi quản lý phạm vi truy cập. Việc đăng nhập Google thực tế vẫn cần kiểm trên Client ID của bạn; không suy ra hoạt động chỉ vì nút đã hiện.

## 4. Chạy và kiểm tra

```powershell
docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml config --quiet
docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml up --build -d
docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml ps
```

Mở `http://localhost:8080`; tại màn đăng nhập, tạo một tài khoản thử bằng email và mật khẩu ít nhất 12 ký tự. Chạy `Invoke-RestMethod http://localhost:8080/api/v2/ready` và kiểm `status` là `ready`. Để thử **Quên mật khẩu**, yêu cầu đặt lại bằng email tài khoản vừa tạo, mở `http://localhost:8025`, chọn thư SNOTE và bấm liên kết. Mailpit chỉ giữ thư thử, không gửi thư ra hộp thư thật. Cổng SMTP 1025 chỉ nằm trong mạng Compose; không cần mở cổng này trên Windows.

Nếu trang không mở, xem `ps` và log:

```powershell
docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml logs --tail=100 api web db
```

Các lỗi thường gặp:

- **Cổng 8080 hoặc 8025 đã dùng:** dừng ứng dụng đang giữ cổng, hoặc đổi `HTTP_PORT` trong `.env.local`; nếu đổi cổng web, cập nhật `PUBLIC_BASE_URL` và Authorized JavaScript origin của Google cho đúng cổng mới.
- **API báo lỗi xác thực PostgreSQL:** kiểm `POSTGRES_PASSWORD` và `DATABASE_URL` có cùng mật khẩu; nếu volume đã tồn tại, dùng mật khẩu ban đầu của volume đó. Không xóa volume để “sửa nhanh” khi còn dữ liệu.
- **Không thấy nút Google:** kiểm cả hai biến Client ID, rồi chạy lại `up --build -d`; mở Developer Tools nếu Google từ chối origin.
- **Không có thư reset:** kiểm container `mailpit` trong `ps` và log `api`; trong cấu hình local, không cần nhập SMTP thật.

## 5. Khi chuyển sang máy chủ công khai

Localhost chỉ kiểm máy của bạn. Trước khi cấp tài khoản thật cần domain/DNS, SMTP thật, ngân sách dung lượng thực, lịch backup và phép thử khôi phục cả PostgreSQL lẫn volume tệp. Các biến và trình tự triển khai nằm trong [hướng dẫn Docker](../../deploy/README.md) và [quy trình vận hành](README.md). Không dùng `compose.local.yaml` hoặc Mailpit trên domain công khai.
