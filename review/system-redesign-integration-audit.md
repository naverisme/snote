# Kiểm duyệt lại cổng tích hợp #36 trước đợt UI mới — 2026-11-08

| Trường | Kết quả |
| --- | --- |
| Task | `TASK-20261108-205638`, đã ACK qua `winwork` |
| SHA kiểm | `8c47736a3df0fc7a3e08b19e0ddff549f84b116a` (merge `s_note_v2@bdc1df38` vào `feat/v2/integration`) |
| Nguồn | [Issue #36](https://github.com/naverisme/snote/issues/36), [kế hoạch](../IMPLEMENTATION_PLAN.md), [sở hữu](../WORKTREES.md), [hợp đồng](../docs/contracts/openapi.yaml), [QA](../docs/quality/README.md), `review/system-redesign-readiness.md` tại checkout `s_note_v2@bdc1df38` (tệp đính kèm chưa commit) |
| Môi trường | Windows 11, Node 24.15.0, Docker Engine 29.9.2, container `snote-postgres-test` PostgreSQL 17.7 cổng 5432; dữ liệu test có sẵn và tài khoản mới ngẫu nhiên, chưa reset DB trắng |
| Kết luận | **Cổng #36 cần mở lại: P0 mất task sau restart.** 42/42 test hiện tại qua nhưng không bao phủ sự kiện đó; điều kiện tải, phục hồi DB và trình duyệt thực vẫn chưa đủ bằng chứng. Không dùng kết quả cũ để xác nhận pilot. |

## Kết quả chạy trên SHA mới

| Phép kiểm | Quan sát | Trạng thái/giới hạn |
| --- | --- | --- |
| `npm.cmd run build` | API `tsc` và web `tsc -b && vite build` qua; Vite cảnh báo chunk 513.98 kB và chỉ thị `use client` của `lucide-react` bị bỏ qua | **Đạt build**, chưa đo tải trang |
| `npm.cmd run contract:validate` | 86 paths, 106 operations, 973 refs | **Đạt** kiểm cấu trúc contract |
| `npm.cmd run contract:http` | Fixture client typed qua HTTP, gồm 409/412 và header bắt buộc | **Đạt fixture**, không thay thế E2E DB |
| `npm.cmd test -w @snote/api` | 3/3 core tests qua | **Đạt** core unit |
| `npm.cmd run test:e2e` | 42/42 qua trên container PostgreSQL 17.7 đang chạy; `http-smoke` kiểm anonymous 401, giả header, CSRF 403, If-Match 412, idempotency 409 và client sinh từ OpenAPI | **Đạt đúng phạm vi test hiện có**; 12 VT gọi service với giả lập, không phải 12 luồng HTTP |
| `node tests/e2e/repro-restart-loss.mjs` | Register 201, tạo task 200, `GET /tasks/:id` trước restart 200; đóng Nest app, tạo app mới cùng PostgreSQL, login 201, `GET` cùng ID **404**; script thoát 1 vì mong đợi 200 | **Sai/P0**, tái hiện được qua HTTP; chỉ kiểm task, chưa chạy ca tương tự cho lịch/checklist |
| Chrome headless `1365×900` và `390×844 --force-prefers-reduced-motion` trên web build Vite preview | Trang chưa đăng nhập render desktop; viewport 390 bị cắt ngang hero và nút đăng nhập ở header nằm ngoài màn. [Ảnh desktop](evidence/system-redesign-desktop.png), [ảnh mobile](evidence/system-redesign-mobile-reduced.png) | **Sai responsive ở trang đầu**; đây là browser smoke, chưa kiểm focus/keyboard, đăng nhập, tương tác trên máy thật hoặc computed motion |

## Lỗi và khoảng trống liên nhóm

| Mã / mức | Nguồn và hậu quả | Lựa chọn sửa, owner và phép kiểm sau sửa |
| --- | --- | --- |
| INT-01 / **P0** | `TasksService` giữ task, checklist, work session và audit trong `Map`/mảng (`apps/api/src/modules/tasks/tasks.service.ts`); HTTP repro trên cùng DB trả 404 sau restart. Dữ liệu task đã được client báo thành công nhưng biến mất, trái kiến trúc lưu trữ và QA-11/14. | Owner #31 chuyển trạng thái sang persistence/giao dịch. Nếu cần migration/schema, phối hợp owner Foundation #28 theo `WORKTREES.md` và ma trận quyền trước khi sửa. Thêm regression HTTP tạo → đọc → restart tiến trình → login → đọc/cập nhật cùng ID; kiểm checklist và lịch. Không sửa module/schema từ worktree integration. |
| INT-02 / **cao, chưa thử restart** | `CalendarService` cũng giữ sự kiện và audit trong `Map`/mảng (`apps/api/src/modules/calendar/calendar.service.ts`). Cùng cơ chế khởi tạo mới cho thấy rủi ro mất sự kiện, nhưng báo cáo này chưa chạy HTTP repro lịch. | Owner #31 dùng cùng thiết kế persistence, kiểm tạo event → restart → đọc trên lịch cá nhân và workspace, kể cả hủy sự kiện. |
| INT-03 / **cao** | `BENCH-01` chỉ seed **10 task trong 1 workspace**, chạy 40 GET theo lô 20; `BENCH-02` tạo 20 task cùng workspace. [QA](../docs/quality/README.md) đòi tối thiểu 5 lớp, 20 workspace/lớp, 1.000 task/workspace ở nhóm tải và 20 ghi cạnh tranh cùng quota/nhóm. p95 cũ không chứng minh ngưỡng ở tải đã định. | Owner #36 tạo bộ seed có kiểm đếm và đo lại p95, lưu CPU/RAM/DB, số mẫu, SHA và phân phối độ trễ. Giữ số 185.39 ms cũ là kết quả cho tải nhỏ, không gọi đạt mục tiêu pilot. |
| INT-04 / **cao** | `RECOV-01` tạo `metadataSnapshot` bằng JS từ ba blob giả, ghi `manifest.json`, sao chép bytes. Không dùng `pg_dump`/`pg_restore`, không tạo và đọc lại revision nộp từ DB phục hồi. QA-14 yêu cầu metadata + bytes và mọi phiên bản nộp. | Owner #36 dựng DB đích cách ly, sao lưu/khôi phục PostgreSQL và blob từ dữ liệu nộp thật qua HTTP, đọc lại từng revision sau restore, so SHA-256, ref và quyền; ghi thời gian. Có Docker/PostgreSQL local nhưng chưa chạy diễn tập này. |
| INT-05 / **trung bình** | `WEB-01…12` chủ yếu đọc mã/CSS hoặc gọi logic; ảnh Chrome chỉ chứng minh trang đầu render. Chưa có automation thao tác trong browser authenticated ở desktop/mobile; focus, keyboard, stale response và giảm motion chưa được quan sát end to end. Ảnh mobile phát hiện cắt ngang nội dung. | Owner shell #29 sửa responsive; owner #36 thêm kiểm trình duyệt thật ở viewport desktop/mobile với tài khoản giả, focus/keyboard, motion giảm, đổi workspace có response trễ. Nếu thay visual theo lệnh UI sau này, chụp lại đúng SHA mới. |

**Phản biện:** 42/42 pass là bằng chứng tốt cho những đường đã lập trình kiểm; dùng nó làm kết luận cổng sẽ bỏ sót mất dữ liệu khi restart và yêu cầu tải/restore cụ thể. Không sửa giả lập để “xanh” cổng. Ưu tiên khôi phục persistence ở owner #31, sau đó mở rộng test #36 trên cùng head. ENV-01–06 tiếp tục là quyết định môi trường thực ở [unresolved](unresolved.md); không suy từ container local.

**Giới hạn thực thi:** Không kiểm 12 VT xuyên HTTP; không chạy browser với phiên đăng nhập, bàn phím hoặc thiết bị vật lý; không chạy pg_dump/pg_restore, tải chuẩn QA hay restart lịch. Các mục này là **chưa kiểm**, không phải pass. `review/system-redesign-readiness.md` đang là tệp chưa commit tại checkout `s_note_v2`, được đọc để nhận task; đường liên kết trong hàng nguồn chỉ có hiệu lực khi tệp ấy được commit.
