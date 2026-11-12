# Kiểm thay đổi múi giờ web — 2026-11-12

- Phạm vi: nhánh `feat/vietnam-timezone`, mã triển khai `a306adbcc856c6b5a39d87b58e2eb9e165e0c872` từ `7d7476a27e2a70b3a04b8000135f0f41756f3731`.
- Môi trường: Windows/PowerShell, Node.js 24.15.0, Vite 7.2.2; xem giao diện bằng Microsoft Edge headless ở `http://127.0.0.1:5174/`.
- `npm run build -w @snote/web`: đạt, TypeScript và Vite hoàn tất.
- `node --test apps/web/src/shared/time-zone.spec.ts apps/web/src/features/calendar/calendar.spec.ts`: 7/7 đạt.
- `TZ=America/New_York node --test apps/web/src/shared/time-zone.spec.ts` (biến môi trường đặt trong PowerShell trước lệnh): 2/2 đạt, kiểm độc lập múi giờ máy.
- `git diff --check`: đạt.
- Ảnh chụp Edge ở 1280×900 cho thấy trang đăng nhập còn bố cục đầy đủ. Các ô chọn múi giờ trên form đăng ký/tạo lớp/Lịch/hạn bài đã được kiểm trong mã nguồn; chưa có ảnh chụp các màn sau xác thực trong lượt này.
- Giới hạn: không di chuyển múi giờ bản ghi cũ; API vẫn nhận trường `timeZone` theo hợp đồng. Múi giờ nguồn của lớp/workspace đã lưu tiếp tục được dùng khi tạo sự kiện cả ngày, hạn bài chỉ ngày; giờ hiển thị ở web là giờ Việt Nam.
- Sau khi fast-forward vào `s_note_v2` tại `4faec722bf494ca39838e897d5de3139191dbe8a`, chạy `docker compose --env-file deploy/.env.local -f compose.yaml -f compose.local.yaml build web` và `up -d --no-deps web`: đạt, image web dùng Vite 7.3.8. `GET http://localhost:8080/` và asset JS trả 200; asset không còn `calendar-tz-select` hay `auth-timezone`; `GET /api/v2/ready` trả `ready`. Các container db/api/mailpit/web đang chạy; db và api có health check đạt.
