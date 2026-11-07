# Kế hoạch xây dựng SNOTE v2

| Thuộc tính | Quy định |
| --- | --- |
| Phạm vi | Bản đầu theo [product/first-release](docs/product/first-release.md), chỉ nhánh `s_note_v2`; tuyệt đối không đọc hoặc tái sử dụng v1 |
| Trạng thái | Kế hoạch thực thi; không phải báo cáo tính năng đã hoàn thành |
| Nguồn đặc tả | [docs](docs/README.md), [OpenAPI](docs/contracts/openapi.yaml), [lược đồ](docs/architecture/physical-schema.md), [QA](docs/quality/README.md) |
| Điều phối | [AGENTS.md](AGENTS.md), [WORKTREES.md](WORKTREES.md), issues #28–36 |
| Đơn vị hoàn thành | Một PR có build, kiểm tra liên quan, chứng cứ, phiên bản commit, người/vùng sở hữu; merge vào `s_note_v2` |

Kế hoạch ở gốc repo vì nó mô tả **cách thực hiện và thứ tự công việc**; `docs/` giữ đặc tả sản phẩm/hệ thống phải đúng. Mọi ngày công, lịch và ngân sách chỉ được lập sau khi biết số người, môi trường và năng lực thực tế. Không điền con số giả. Có thể coding foundation bằng dữ liệu giả; không gọi pilot sẵn sàng khi chưa đóng các đầu vào môi trường trong [review/unresolved](review/unresolved.md).

## 0. Quy tắc vận hành trước mỗi PR

1. Fetch `s_note_v2`, tạo một branch/worktree riêng theo [WORKTREES](WORKTREES.md); đọc issue được giao, các mã quy tắc/QA, phạm vi tệp. Không dùng `main`/v1 làm điểm gốc.
2. Ghi trong PR: mục tiêu, quyết định liên quan, route/schema liên quan, tệp đã đổi, test pass/fail, trường hợp chưa kiểm và SHA dependency. Chỉ stage đường dẫn mình sở hữu; không sửa generated file bằng tay.
3. Thay contract/schema/shared shell: mở yêu cầu thay đổi với ví dụ trước/sau và tác động. Chủ foundation/schema hoặc WEB-A sửa vùng được giao; agent phụ thuộc cập nhật từ commit đã merge. Không nhân đôi type, action ID hay component.
4. Mọi API truy dữ liệu theo scope đã xác thực và kiểm quyền tại thời điểm commit; UI chỉ phản ánh quyền, không là nơi cấp quyền. Mọi thao tác có cạnh tranh kiểm version/giao dịch; lỗi không được tạo thành công giả.
5. Chỉ merge khi CI phù hợp xanh, không có lỗi quyền/toàn vẹn P0, reviewer xác nhận ranh giới tệp. Thay đổi OpenAPI phải sinh lại client và chạy kiểm tương thích trước khi merge module dùng nó.

## 1. Foundation — issue #28, một worktree độc quyền

**Đầu vào:** head `s_note_v2` sau PR #37; `docs/contracts/openapi.yaml`, `tools/build_openapi.py`, `physical-schema.md`, `permission-matrix.md`. **Đầu ra:** repo có thể build và migration được; client/server dùng chung hợp đồng. Chưa chia bảy worktree feature trước khi PR này merge.

| Thứ tự | Công việc cụ thể | Bằng chứng để qua cổng |
| --- | --- | --- |
| F1 | Chọn và pin phiên bản Node/package manager, React/Vite, NestJS/Prisma/PostgreSQL theo phiên tương thích; tạo workspace packages, `apps/api`, `apps/web`, config TypeScript/lint/test và Docker Compose dev | Cài mới từ lockfile, build API/web trong checkout sạch; Compose khởi động PostgreSQL và volume thử |
| F2 | Kiểm OpenAPI 3.1 bằng validator chuẩn; sửa registry cho schema request/response/error cụ thể từng thao tác, status/header và ví dụ nhất quán; xác nhận route thiếu bằng action catalog | Validator chuẩn và kiểm `tools/validate_contract.py` qua; diff sinh lại YAML không đổi khi chạy lần hai; không còn `Result.data` chung ở operation nghiệp vụ cần codegen |
| F3 | Sinh `packages/contracts` và web client/types từ cùng OpenAPI; chuẩn hóa `requestId`, cookie/CSRF, ETag/If-Match, Idempotency-Key, cursor, UTC/date-only, 401/403/404/409/412/429/503 | Generated client build; một fixture cùng payload đi qua client/server contract; route có tên/kiểu không tự đặt khác |
| F4 | Hiện thực Prisma schema + migrations từ lược đồ v2; unique/CHECK/partial unique cần thiết bằng SQL khi Prisma không biểu đạt; seed dữ liệu giả không chứa người thật | Migrate DB trắng và reset/migrate lần hai được; kiểm DB với unique active, reference, scope và version; schema migration có owner duy nhất |
| F5 | Tạo core auth session/cookie/CSRF, kiểm scope/action, transaction+receipt/outbox, storage adapter interface và lỗi miền; chỉ khung/tối thiểu, không làm nghiệp vụ module | Core unit/contract checks cho deny-by-default, 409/412, requestId, same key/same body, different body/409; health/readiness rõ |
| F6 | Tạo CI build/lint/test/contract/migration, README chạy local và env mẫu không có secret; xác nhận module skeleton import qua public interfaces | PR #28 xanh trong checkout sạch; người khác chạy được lệnh đã ghi; merge vào `s_note_v2` rồi ghi SHA làm gốc cho các worktree feature |

**Điều kiện dừng F:** nếu một field, action, vai trò hay transaction quan trọng chưa có cách biểu diễn, sửa hợp đồng/lược đồ trong #28 trước khi phát client. Chưa có máy chủ thật không cản build dev, nhưng môi trường pilot vẫn bị chặn.

## 2. Tách worktree và khóa mốc giao tiếp

Sau khi #28 merge, `git fetch origin s_note_v2` rồi tạo bảy worktree **đều từ cùng head mới** theo lệnh trong [WORKTREES.md](WORKTREES.md). Chốt SHA OpenAPI, migration và generated client trong mô tả mỗi PR. Các nhánh được tạo độc lập; tên `feat/v2/api-a` không phải nhánh con của `feat/v2/foundation`.

| Điểm bàn giao | Ai cung cấp → ai dùng | Hợp đồng phải tồn tại trước khi agent phụ thuộc nối thật |
| --- | --- | --- |
| Quyền và tư cách | API-A → API-B/C/D | Public authorization/membership interface; kiểm scope/role theo trạng thái hiện hành, không gọi trực tiếp bảng của agent khác ở controller |
| Tệp bất biến/quota | API-C → API-D | Interface verified blob/reference/quota reservation; bản nộp chỉ chốt ref sau xác minh bytes |
| Shared UI và điều hướng | WEB-A → WEB-B/C | Public component/router/permission hooks, shell lớp và workspace; feature chỉ import, không sửa `app/shared` |
| API types | Foundation → tất cả | Generated client và action enum; mock/fixture phải cùng schema, không định nghĩa payload riêng |

Agent có thể viết module riêng và dùng stub theo interface trong lúc chờ nhau. Không merge đường đi người dùng thật với stub. PR phụ thuộc phải ghi SHA và chạy lại kiểm sau khi interface upstream merge.

## 3. Triển khai tính năng theo lát cắt

**Đợt A — có thể thực hiện đồng thời sau F:** API-A #29, API-C #35, WEB-A #34. API-B #31 có thể làm logic việc/lịch dựa trên interface quyền F nhưng chỉ nối nghiệp vụ tư cách sau API-A; WEB-B #33 và WEB-C #30 dựng màn bằng fixtures từ generated client và chờ shell WEB-A. API-D #32 xây mô hình bài/nộp trên interface F, rồi nối API-A và API-C khi có hợp đồng public ổn định.

| Issue và vùng sở hữu | Thứ tự bên trong module | Ca kiểm tối thiểu trước PR |
| --- | --- | --- |
| API-A #29 `identity/classes/workspaces/authorization` | Cách dùng tài khoản → workspace cá nhân → lớp/tư cách → nhóm/giới hạn → phân quyền/ủy quyền → bàn giao/archive/restore | QA-01–04: hai lượt duyệt đồng thời không vượt giới hạn; tắt Teacher không mất lớp cũ; không lộ scope khác |
| API-B #31 `tasks/calendar` | Việc và một assignee → checklist/trạng thái → lịch sử/giao lại → buổi làm riêng → sự kiện timed/all-day/audience/hủy | QA-04/10/11: 0 checklist không 100%, lịch riêng không chuyển theo việc, all-day không lệch ngày, cùng event chỉ một nguồn |
| API-C #35 `library/uploads/storage` | Upload staging/verify → Item/Revision/Blob → folder/copy/revision → quota/reservation → trash/restore/GC → preview URL | QA-05–07/12/14: If-Match chống ghi đè đồng thời, hết dung lượng không mất bytes cũ, ref bất biến, SSRF bị chặn |
| API-D #32 `assignments/submissions/notifications` | Bài/recipient → cập nhật tiến độ → luật quá hạn → submission version/receipt → feedback → outbox/thông báo | QA-08/09: mất phản hồi không nộp đôi; quyền/hạn/quota kiểm tại commit, bản cũ giữ timeliness và bytes |
| WEB-A #34 `app/shared/tasks/calendar` | Shell + selector workspace/lớp → Gantt mặc định/danh sách → việc của tôi/lịch → trạng thái lỗi/trống/tải → responsive/motion | QA-10/11/13: không hồi sinh dữ liệu từ request cũ, hủy event đúng mọi view, focus/reduced motion |
| WEB-B #33 `features/classes/assignments` | Danh sách lớp mở mặc định → bảng thành viên/quyền → nhóm/yêu cầu → bài/recipient → nộp/nhận xét/trạng thái chưa rõ kết quả | QA-01–04/08/09/13: hành động theo quyền; key giữ nguyên khi retry; không hiện Thu hồi; xung đột yêu cầu xem bản mới |
| WEB-C #30 `features/library` | Hộp thu riêng → text/link/file và folder → preview → ghi đè hoặc sao chép → upload/rác/restore | QA-05–07/12/13: URL đầu tiên, gõ tiếng Việt, trạng thái upload chỉ tick xanh sau commit, URL cũ không ghi preview mới |

**Cổng PR của từng module:** kiểm lint/type/build; test logic có hậu quả và lỗi giữa chừng; mô tả endpoint, action, mã yêu cầu/QA đã thực thi; thử tích hợp tối thiểu với contract F. Nếu cần migration, chỉ owner #28 làm PR schema riêng rồi module cập nhật. CI không được dùng stub để chứng minh luồng tích hợp hoàn thành.

**Thứ tự merge khuyến nghị:** API-A và API-C trước các phần nối thật của API-B/API-D; WEB-A trước WEB-B/WEB-C. Các PR còn lại merge khi phụ thuộc đã cập nhật và test lại. Đây là thứ tự theo phụ thuộc, không ép chờ khi công việc độc lập vẫn làm được.

## 4. Ghép toàn hệ thống — issue #36

Chỉ bắt đầu cổng tích hợp đầy đủ sau khi các PR feature cần thiết merge. Agent integration sở hữu `tests/e2e/**`, `infra/**`, CI/release; lỗi ở module được trả về owner tương ứng. Một PR riêng có thể bổ sung smoke tests sớm, nhưng không gọi hoàn thành #36 trước khi chạy luồng thật.

1. Dựng môi trường cách ly từ commit sạch và dữ liệu giả; migrate, seed, build web/API, chạy worker/storage. Không dùng account/tệp thật của người dùng.
2. Chạy 12 ca nền trong `docs/quality/acceptance-scenarios.md` và QA-01–14; đo cả API lẫn trạng thái màn, đặc biệt quyền, tư cách nhóm đồng thời, nộp đứt mạng, quota và GC.
3. Kiểm tải theo bộ dữ liệu và p95 đã nêu ở `docs/quality/README.md`; lưu cách đo, cấu hình máy, commit, kết quả pass/fail trong báo cáo ngoài `docs/`. Kết quả mô phỏng không thay số người dùng pilot thực.
4. Trên desktop/mobile thật hoặc thiết bị kiểm thử được ghi rõ, kiểm keyboard/focus, responsive, reduced motion, chuyển workspace nhanh và phản hồi đến muộn.
5. Đối soát DB/blob, diễn tập backup và phục hồi **metadata cùng bytes** vào môi trường riêng; đọc lại các revision nộp và kiểm quyền sau restore.

**Cổng phát hành thử:** tất cả lỗi quyền/toàn vẹn P0 đã xử lý; client/server cùng version contract; migration/rollback mã tương thích; backup restore và giám sát có bằng chứng. ENV-01–05 cần giá trị môi trường thực trước pilot, ENV-06 cần nhà cung cấp email trước khi dùng reset mật khẩu thực. Nếu chưa có hosting hoặc nhóm thử, có thể kết thúc kiểm bằng dữ liệu giả và ghi trạng thái **pilot blocked**.

## 5. Theo dõi tiến độ và thay đổi

| Mốc | Báo cáo khi hoàn tất | Không được tuyên bố trước bằng chứng |
| --- | --- | --- |
| F | SHA merge #28, lockfile, OpenAPI validator, generated client, migration/build/test | “Bảy agent đã có nền chung” khi F chưa xanh |
| A | SHA từng PR #29–35, mã QA đã chạy, giao diện public và dependency SHA | “Chạy song song không xung đột” khi sửa chéo schema/shared |
| I | SHA #36, báo cáo e2e, đo tải, restore, danh sách lỗi P0 | “Ứng dụng đã đạt nghiệm thu” chỉ từ unit tests |
| Pilot | Giá trị ENV-01–06, vận hành/chi phí, đối tượng thử, bản phát hành xác định | “Sẵn sàng production/pilot” từ sơ đồ hoặc Docker Compose đơn thuần |

Một thay đổi nghiệp vụ đi theo **quy tắc → contract/schema → generated client → API → UI → QA**, có PR và dấu vết quyết định. Bug module trả về owner; conflict tệp theo [WORKTREES](WORKTREES.md). Không sửa trực tiếp tài liệu `docs/` để mô tả kết quả chạy; kết quả test, ước lượng và tiến độ sống trong issue/PR/báo cáo thực thi ngoài `docs/`.
