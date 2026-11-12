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
- `git diff --check`: không có lỗi whitespace.

## Giới hạn

- Kiểm giao diện qua Vite 5174 dùng API proxy 3000 chưa chạy trên host; xác thực thực tế cần kiểm qua bản Docker 8080 sau khi build image. Các ca xác thực backend được ghi ở [báo cáo phát hành localhost](release-readiness-20261112.md).
