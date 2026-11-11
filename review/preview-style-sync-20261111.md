# Đồng bộ phong cách 14 tab preview với màn tính năng

| Trường | Giá trị |
| --- | --- |
| Nguồn | 14 tab trong `apps/web/src/previews/`, trạng thái working tree ngày 2026-11-11; `docs/ux/ui-and-motion.md` |
| Mốc mã nguồn | `62f891be5492cacb48e793ea49c46a50805fc7fe` (`s_note_v2`) |
| Worktree | `feat/sync-preview-style-14`; bản preview đang sửa được sao chép từ working tree gốc để đối chiếu trước khi xóa |
| Môi trường | Windows, Node 24.15.0, npm 11, Vite 7.2.2, Chrome headless |
| Phạm vi | Hình thức màn web; không thay hợp đồng API hay quyền trên server |

## Ánh xạ

| Tab | Màn tính năng hiện hành | Trạng thái đồng bộ |
| --- | --- | --- |
| 01–02 Thành viên lớp (giáo viên/học sinh) | `ClassMembersView` | Token, thẻ, bảng, nút, biểu mẫu, nhãn vai trò |
| 03–04 Nhóm trong lớp (giáo viên/học sinh) | `ClassGroupsView` | Token, thẻ, bảng, nút, biểu mẫu |
| 05 Cài đặt lớp | `ClassSettingsView` | Token, phần, biểu mẫu, nút |
| 06–07 Thành viên nhóm (trưởng nhóm/thành viên) | `GroupMembersView` | Token, thẻ, bảng, nút |
| 08–09 Công việc Gantt/Danh sách | `TasksContainer`, `TaskGanttView`, `TaskListView` | Token, bộ lọc, nút, trạng thái trống/lỗi |
| 10 Lịch | `CalendarContainer`, `CalendarView` | Token, nút điều hướng, màu hành động chính |
| 11 Thư viện | `LibraryView` và các thành phần con | Bố cục ba vùng, biên, chữ, nút, màu thao tác; nạp utility CSS vốn thiếu |
| 12–13 Bài giao (giáo viên/học sinh) | `AssignmentFeature` | Token, chữ, bố cục, màu hành động chính |
| 14 Mục lưu ý | Vùng `notes` của workspace | Thẻ, chữ; nội dung hiện vẫn là placeholder của ứng dụng |

## Phong cách được rút ra

**INFERRED từ 14 tab preview trước khi xóa:** nền trắng và xám trung tính; viền mảnh; góc bo 6–8 px; chữ thao tác 12–14 px, tiêu đề vùng 18 px; một hành động chính màu gần đen trên mỗi vùng; màu đỏ/vàng/xanh lá dành cho trạng thái có nghĩa. Quy tắc bố cục màn tính năng được giới hạn trong `.feature-page` ở `feature-sync.css`. Bản preview đối chiếu còn trong lịch sử Git; màn tính năng giữ logic API và quyền hiện hành.

Token hành động chính, focus input và góc modal trong `theme.css` được dùng chung bởi các hộp thoại ngoài `.feature-page`; đổi về cùng hệ trung tính để chúng không trở lại màu xanh cũ.

**VERIFIED:** `npm.cmd run build -w @snote/web` và `git diff --check` (phạm vi mã mới, không gồm các bản preview có whitespace từ trước) thành công. `http://127.0.0.1:5173/` trả HTTP 200. Đã nhìn ảnh Chrome headless ở 1440×900 cho Thư viện, Công việc Gantt và Thành viên lớp; bố cục Thư viện chuyển từ dạng không có utility CSS sang ba vùng. Qua Chrome DevTools Protocol, Thư viện ở viewport thật 390×844 px có `innerWidth = scrollWidth = 390`, đã đối chiếu chế độ sáng và tối. Cổng API 3000 không chạy trong lần chụp nên Thư viện và Công việc hiển thị trạng thái lỗi/trống; các trạng thái có dữ liệu chưa được đối chiếu trực quan ở lần này.

**UNKNOWN:** Màn Mục lưu ý chưa có nguồn dữ liệu thật trong ứng dụng. Báo cáo này không coi tab preview với dữ liệu mẫu là chức năng đã hoàn thiện.

## Gỡ 14 tab kiểm duyệt

**VERIFIED (2026-11-11):** Đã xóa `PreviewHarness` và 14 component tab, nút điều hướng, bộ định tuyến query preview và tham số giả lập vai trò trong các màn lớp/nhóm. Quyền hiển thị của các màn này lấy từ người dùng và chủ thể hiện hành. Đã xóa tài liệu điều phối chỉ dành cho 14 tab vì các đường dẫn của chúng không còn tồn tại. `npm.cmd run build`, 12/12 ca `web-interactions.spec.mjs` và `git diff --check` đạt.

**VERIFIED (giới hạn):** Toàn bộ e2e đạt 41/42; BENCH-01 đo p95 khoảng 2,5 giây, vượt ngưỡng 1 giây trong cả lần chạy tổng và lần chạy riêng. Không có thay đổi backend hay schema trong nhánh này.
