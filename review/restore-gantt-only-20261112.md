# Khôi phục thay đổi chưa đạt, giữ giao diện Gantt — 2026-11-12

| Trường | Giá trị |
| --- | --- |
| Nhánh | `fix/restore-gantt-only-20261112` tách từ `s_note_v2` |
| SHA nền | `279c11657d399d2d64f96f7477f5b7541e7752eb` |
| Môi trường | Windows, PowerShell, Node/npm cài tại máy làm việc |
| Phạm vi | Khôi phục các thay đổi chưa commit của OTP, ghi chú, nhóm lớp, tạo và chi tiết việc, schema, OpenAPI và cấu hình chạy; giữ `TaskGanttView.tsx` cùng đầu vào checklist và loại workspace cần cho giao diện này |

## Kết quả theo mốc chạy

| Trạng thái | Kiểm tra | Kết quả |
| --- | --- | --- |
| VERIFIED | `npm run build -w @snote/web` | Exit 0; TypeScript và Vite build thành công. Vite cảnh báo bundle lớn hơn 500 kB. |
| VERIFIED | `npm run build` | Exit 0; API và web build thành công. |
| VERIFIED | `npm run contract:validate` | Exit 0; 87 paths, 107 unique operations, 982 resolved refs. |
| VERIFIED | `git diff --check` | Exit 0. |
| INFERRED | Diff sau khôi phục | Chỉ mã Gantt và hai điểm truyền dữ liệu của Gantt khác HEAD; không còn thay đổi OTP, schema hay contract trong cây làm việc. |
| UNKNOWN | Kiểm trực tiếp trên trình duyệt và dữ liệu thật | Chưa chạy trong mốc này. Việc chủ sản phẩm chấp nhận giao diện Gantt chỉ áp dụng cho phần trình bày, chưa xác nhận các quy tắc thời gian và quyền. |

Tệp vá của thay đổi ban đầu và bản nén các tệp chưa theo dõi được giữ cục bộ trong `.git/restore-gantt-only-20261112.patch` và `.git/restore-gantt-only-20261112-untracked.zip` để truy lại khi cần; hai tệp này không thuộc sản phẩm.
