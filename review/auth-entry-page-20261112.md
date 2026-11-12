# Kiểm chứng trang xác thực — 2026-11-12

| Mục | Kết quả |
| --- | --- |
| Nguồn | `feat/auth-entry-page` từ `s_note_v2` SHA `5259566d1f1c1192564ea29d6893da359e3c47e9` |
| Yêu cầu | Chưa đăng nhập thì không có sidebar; form đăng nhập hiển thị ngay, không có nút mở trung gian |
| Môi trường | Windows PowerShell, Node.js 24.15.0, Edge headless; Vite 7.2.2 trên host |

## VERIFIED

- `npm run build -w @snote/web`: TypeScript và Vite build qua. Vite còn cảnh báo chunk JS trên 500 kB.
- Edge ở 1280×900: trang chỉ có hộp đăng nhập giữa nền trung tính; không thấy khung công việc hoặc sidebar.
- DevTools ở viewport 390×844: `innerWidth=390`, `documentElement.scrollWidth=390`, `#app-sidebar` không tồn tại và nút “Đăng nhập hoặc tạo tài khoản” không tồn tại. Form không tràn ngang.
- Mở `#reset=...` khi tab ứng dụng đang mở chuyển sang tiêu đề “Tạo mật khẩu mới” trên cùng trang xác thực; không dựng sidebar.
- `docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml up --build -d` từ gốc repo: image web build với Vite 7.3.8 và khởi động; `http://localhost:8080` trả 200, `/api/v2/ready` trả `ready`. Ảnh chụp Edge từ URL Docker xác nhận form đăng nhập hiện ngay, không có sidebar.
- `git diff --check`: không có lỗi whitespace.

## Giới hạn

- Vite 5174 trên host dùng API proxy 3000 chưa chạy nên phép kiểm tương tác ở đây chỉ xác nhận giao diện; luồng xác thực backend được ghi ở [báo cáo phát hành localhost](release-readiness-20261112.md).
