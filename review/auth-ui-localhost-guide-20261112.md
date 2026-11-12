# Kiểm chứng giao diện tài khoản và hướng dẫn localhost — 2026-11-12

| Mục | Kết quả |
| --- | --- |
| Nguồn | Nhánh `feat/auth-ui-guide` từ `s_note_v2` SHA `c7c4fa00940fb8190828061b66e9e81f1fe66dc0` |
| Môi trường | Windows PowerShell, Node.js 24.15.0, Vite 7.2.2 từ `node_modules` hiện có; Edge headless để kiểm hiển thị |
| Phạm vi | Modal đăng nhập/đăng ký/quên mật khẩu/đặt lại và hướng dẫn lấy cấu hình localhost |

## VERIFIED

- `npm run build -w @snote/web`: TypeScript và Vite build thành công. Vite báo cảnh báo kích thước chunk trên 500 kB; đây là cảnh báo tối ưu bundle, không làm hỏng bản dựng.
- Hiển thị trực tiếp ở 1280×900 và 390×844: màn đăng nhập, đặt lại mật khẩu và đăng ký giữ bố cục trong viewport; màn đăng ký dài có vùng cuộn của dialog. Kiểm bằng Edge headless và ảnh chụp tạm ngoài repo.
- Tương tác DOM trong trình duyệt: chuyển từ đăng nhập sang quên mật khẩu; màn quên mật khẩu không có ô token kỹ thuật. Nút hiện mật khẩu và chuyển qua đăng ký đã được render và bấm thử.
- `docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml up --build -d` tại gốc repo: image web mới build bằng Vite 7.3.8 và khởi động. HTTP `/` trả 200, `/api/v2/ready` trả `ready`, Mailpit trả 200; API và PostgreSQL healthy.
- `git diff --check`: không có lỗi whitespace.

## INFERRED / UNKNOWN

- Các bước Google Cloud trong [hướng dẫn](../docs/operations/localhost-configuration-guide.md) đối chiếu tài liệu Google Identity Services; Client ID thật chưa được cung cấp nên chưa kiểm đăng nhập Google end-to-end.
- SMTP thật chưa có; local dùng Mailpit. Hướng dẫn không xác nhận triển khai công khai hoặc phép thử phục hồi dữ liệu trên máy chủ đích.
