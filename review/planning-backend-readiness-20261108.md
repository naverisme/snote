# Kiểm duyệt backend Công việc/Lịch #31 — 2026-11-08

| Trường | Bằng chứng |
| --- | --- |
| Task | `TASK-20261108-205630`, `TASK-20261108-205729` đã ACK |
| Head kiểm | `4670ead0b1d6d13a946727ee471c4f1dd29795ab` (`feat/v2/planning`) |
| Đầu vào | Issue [#31](https://github.com/naverisme/snote/issues/31), [#34](https://github.com/naverisme/snote/issues/34), `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, `WORKTREES.md`, `docs/contracts/openapi.yaml`; `review/system-redesign-readiness.md` ở worktree `s_note_v2` (file chưa có trên head này) |
| Kết luận | **Chưa đạt cổng backend #31.** Test service pass không chứng minh persistence, HTTP → DB → restart hay UI không hiển thị dữ liệu giả. |

## Lệnh đã chạy và quan sát

| Lệnh | Kết quả |
| --- | --- |
| `npm run build -w @snote/api` | Pass |
| `npm run build -w @snote/web` | Pass (Vite cảnh báo directive `use client` của lucide) |
| `python tools/validate_contract.py` | Pass: 86 paths, 106 operations, 973 refs |
| `node --test apps/api/dist/modules/tasks/*.spec.js apps/api/dist/modules/calendar/*.spec.js` | 16/16 pass; test service dùng bộ nhớ, không kiểm DB/restart |
| `node --test apps/web/src/features/tasks/tasks.spec.ts apps/web/src/features/calendar/calendar.spec.ts` | 6/6 pass; không kiểm fetch lỗi hay dữ liệu fixture trong app |
| Script Node tạo task qua `new TasksService(auth)`, rồi đọc ID bằng `new TasksService(auth)` thứ hai | `NOT_FOUND` 404. Đây là mô phỏng vòng đời instance, **chưa** phải thử restart HTTP/PostgreSQL. |
| `python -c "import yaml; ..."` kiểm `docs/contracts/openapi.yaml` | Có đường ghi checklist, không có GET checklist; `Task` schema không chứa checklist/progress. |

Lệnh tái tạo vòng đời instance (chạy sau build):

```powershell
@'
const { TasksService } = require('./apps/api/dist/modules/tasks/tasks.service.js');
const auth = { decide: async () => ({ allowed: true }) };
(async () => {
  const principal = { accountId: 'audit-user' };
  const before = new TasksService(auth);
  const { task } = await before.createTask(principal, 'audit-ws', { title: 'restart-proof' });
  const after = new TasksService(auth);
  try { await after.getTask(principal, task.id); console.log('UNEXPECTED_PERSISTENCE'); }
  catch (error) { console.log(error.status, error.code); }
})();
'@ | node
```

Kết quả: `404 NOT_FOUND`.

## Bảng sai lệch và đề xuất

| Mức / trạng thái | Quy tắc | Quan sát trên head kiểm | Đề xuất và phép kiểm mong đợi |
| --- | --- | --- | --- |
| **P0 / sai** | TASK-02/15/16, CAL-01/08, QA-10/11; persistence trong `docs/architecture/` | `TasksService` giữ tasks/checklist/workSessions/audits bằng `Map`/mảng; `CalendarService` giữ events/auditEvents tương tự. Hai module chỉ inject authorization, không inject Prisma. Instance mới trả 404 cho task vừa tạo; event cũng mất theo cùng cấu trúc. | Dùng giao dịch PostgreSQL cho ghi task/checklist/session/audit/event/audience; read từ DB, kiểm version bằng compare-and-swap trong giao dịch. Test HTTP tạo/sửa, restart API, đọc lại và đối chiếu DB, audit, quyền. **Không tự đổi schema/migration**: `Event` hiện thiếu `ownerId`/`content`, `TaskAudit` thiếu action, checklist chưa lưu actor thao tác; cần owner Foundation/chỉ huy xét cổng Red trước thay contract/schema liên nhóm. |
| **P0 / sai** | TASK-15, TASK-08, QA-11, OpenAPI | Service có `getChecklistItems`, nhưng controller không có GET checklist; OpenAPI không có đường GET và `Task` public không chứa checklist/tỷ lệ. UI checklist lấy fixture và chỉ sửa state local, tạo cảm giác đã lưu. | Chủ contract/Foundation chốt đường đọc checklist + actor/time/progress trong schema và client sinh; sau đó #31 nối controller/UI với DB. Kiểm thêm/sửa/xóa, refresh và restart vẫn đúng 0 mục = “Chưa có checklist”, tỷ lệ và audit. |
| **P0 / sai** | PM-04, QA-04/13, yêu cầu không thành công giả | `apps/web/src/features/{tasks,calendar}/api.ts` trả fixture hoặc tự tạo/sửa dữ liệu khi HTTP 401/403/409/412/500 hay mất mạng; container cũng nạp fixture khi lỗi. `csrf-token` là chuỗi mặc định, mutation không bắt buộc ETag. | Bỏ đường fallback fixture khỏi runtime, lấy CSRF session thật và ETag từ API/client sinh; hiển thị lỗi riêng 401/403/409/412, không đổi state khi server từ chối. Kiểm lỗi fetch từng mã: không có dữ liệu giả, mutation không báo thành công, 403 xóa dữ liệu scope cũ. File UI thuộc #31 nhưng đang có worktree UI riêng; cần đồng bộ owner trước khi sửa để tránh ghi đè. |
| **P1 / sai** | TASK-06/10, STR-17, CAL-09, QA-10 | Hạn chỉ ngày được dựng thành `23:59:59Z` thay 00:00 ngày kế tiếp trong múi giờ đã lưu; `dueDateZone` chỉ ở Map. Event all-day nhận timezone từ client, chưa đối chiếu nguồn zone của class/workspace/account; chỉ so thứ tự chuỗi ngày, chưa xác thực ngày hợp lệ. | Tính mốc quá hạn từ civil date + source zone và lưu cả hai. Server lấy zone từ scope tại điểm tạo, kiểm ngày hợp lệ và `[start,endExclusive)`; test qua các múi giờ, DST và đổi zone lớp sau khi lưu. |
| **P1 / sai** | CAL-03, PM-07/08, QA-10 | `GET /me/events` gọi `listMyEvents(principal, timeZone)` không truyền workspace IDs; code lọc event lớp qua authorization nhưng danh sách workspace của event cùng phạm vi không được tổng hợp theo nhiều lịch. `GET /events` lọc `scope.type/id` nên event lớp không hiện ở lịch workspace nhóm nhận. | Dùng quan hệ audience từ DB và membership tại lần đọc, trả cùng event vào các lịch liên quan (không nhân bản state). Test một event gửi hai nhóm, hủy và mất quyền: các lịch còn quyền thấy cùng ID/trạng thái; nhóm mất quyền không thấy. |
| **P1 / chưa kiểm đầy đủ** | PM-01–05/13/15/23, QA-04; 409/412 | Controller hiện lấy session cookie và CSRF cho mutation, service mặc định deny, kiểm action theo scope. `requireVersion` trả 412 khi thiếu/stale If-Match; test bulk stale pass. Tuy nhiên kiểm quyền rồi sửa `Map` không có transaction/lock, nên thu hồi quyền hoặc ghi cạnh tranh giữa hai bước chưa được bảo vệ. `getChecklistItems` không có HTTP route. | Giữ kiểm session/CSRF hiện có; khi chuyển DB, kiểm quyền và version tại điểm commit, thử hai request đồng thời và thu hồi quyền khi ghi. Phân biệt 409 xung đột nghiệp vụ với 412 thiếu/stale version; không xác nhận đạt từ unit test đồng bộ. |
| **P1 / chưa kiểm** | TASK-03/07/13/16, STR-18, QA-11 | Reassign giữ session chủ cũ trong Map; test chứng minh không chuyển dữ liệu trong cùng instance. Chưa thấy yêu cầu đổi người, thông báo giao việc, dừng nhắc cũ hay persistence audit. | Thêm luồng request/decision và thông báo sau khi giao dịch commit; kiểm checklist chuyển quyền, session cũ chỉ chủ cũ thấy, reminder cũ dừng, refresh/restart còn audit. |

## Phản biện và phụ thuộc

Các test hiện hành có giá trị cho quy tắc service (checklist không tự hoàn thành, all-day giữ ngày trong một instance, quyền mặc định từ chối, CSRF ở controller). Chúng không thể dùng làm chứng cứ persistence hoặc cổng UI vì dữ liệu và authorization chưa được thử trên cùng giao dịch DB. Cách sửa nhanh bằng cache/file JSON sẽ tiếp tục thiếu atomicity, version và điểm chốt quyền; ưu tiên Prisma/PostgreSQL theo kiến trúc đã có.

`schema.prisma` đã có `Task`, `ChecklistItem`, `PrivateWorkSession`, `TaskAudit`, `Event`, `EventAudience`, nhưng chưa đủ trường cho toàn bộ hành vi và module #31 không sử dụng chúng. Đã báo `main` bằng `winwork send main` về cổng schema/migration Red. Chưa chạy PostgreSQL thật, restart tiến trình HTTP, kiểm 409 cạnh tranh hay khôi phục backup trong lần rà này; giữ trạng thái **chưa kiểm**, không suy pass từ hồ sơ #36/PR cũ. Vùng mã sửa tương lai: `apps/api/src/modules/{tasks,calendar}/**` và `apps/web/src/features/{tasks,calendar}/**`; schema/OpenAPI/generated client do owner Foundation xử lý theo `WORKTREES.md`.
