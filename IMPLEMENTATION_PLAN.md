# Kế hoạch xây dựng SNOTE v2

| Thuộc tính | Quy định |
| --- | --- |
| Phạm vi | Bản đầu theo [product/first-release](docs/product/first-release.md), chỉ nhánh `s_note_v2`; tuyệt đối không đọc hoặc tái sử dụng v1 |
| Trạng thái | Kế hoạch thực thi; không phải báo cáo tính năng đã hoàn thành |
| Nguồn đặc tả | [docs](docs/README.md), [OpenAPI](docs/contracts/openapi.yaml), [lược đồ](docs/architecture/physical-schema.md), [QA](docs/quality/README.md) |
| Điều phối | [AGENTS.md](AGENTS.md), [WORKTREES.md](WORKTREES.md), [bảng công việc](WORK_QUEUE.md), Foundation #28, bốn lát cắt #29/#31/#35/#32, tích hợp #36; #30/#33/#34 là đầu việc UI nằm trong các lát cắt |
| Đơn vị hoàn thành | Một PR có build, kiểm tra liên quan, chứng cứ, phiên bản commit, người/vùng sở hữu; merge vào `s_note_v2` |

Kế hoạch ở gốc repo vì nó mô tả **cách thực hiện và thứ tự công việc**; `docs/` giữ đặc tả sản phẩm/hệ thống phải đúng. Mọi ngày công, lịch và ngân sách chỉ được lập sau khi biết số người, môi trường và năng lực thực tế. Không điền con số giả. Có thể coding foundation bằng dữ liệu giả; không gọi pilot sẵn sàng khi chưa đóng các đầu vào môi trường trong [review/unresolved](review/unresolved.md).

**Bản điều chỉnh phân công:** Theo yêu cầu chủ sản phẩm trong cuộc trao đổi ngày 2026-11-07, worktree tính năng được chia theo luồng, mỗi worktree chịu trách nhiệm API và UI của luồng đó. Phân công bốn lát cắt ở mục 2 thay bảng bốn API/ba WEB của bản kế hoạch trước; quy tắc nghiệp vụ trong `docs/` giữ nguyên.

## 0. Quy tắc vận hành trước mỗi PR

1. Fetch `s_note_v2`, tạo một branch/worktree riêng theo [WORKTREES](WORKTREES.md); đọc issue được giao, các mã quy tắc/QA, phạm vi tệp. Không dùng `main`/v1 làm điểm gốc.
2. Ghi trong PR: mục tiêu, quyết định liên quan, route/schema liên quan, tệp đã đổi, test pass/fail, trường hợp chưa kiểm và SHA dependency. Chỉ stage đường dẫn mình sở hữu; không sửa generated file bằng tay.
3. Thay contract/schema/shared shell: mở yêu cầu thay đổi với ví dụ trước/sau và tác động. Chủ foundation/schema hoặc worktree Ngữ cảnh sửa vùng được giao; các lát cắt phụ thuộc cập nhật từ commit đã merge. Không nhân đôi type, action ID hay component.
4. Mọi API truy dữ liệu theo scope đã xác thực và kiểm quyền tại thời điểm commit; UI chỉ phản ánh quyền, không là nơi cấp quyền. Mọi thao tác có cạnh tranh kiểm version/giao dịch; lỗi không được tạo thành công giả.
5. Chỉ merge khi các kiểm tra phù hợp có bằng chứng, không có lỗi quyền/toàn vẹn P0, reviewer xác nhận ranh giới tệp. Khi GitHub Actions bị chặn ngoài mã nguồn, ghi rõ nguyên nhân và chạy tương đương trên PostgreSQL thật trong môi trường khác; không coi job chưa chạy là pass. Thay đổi OpenAPI phải sinh lại client và kiểm tương thích trước khi merge module dùng nó.

## 1. Foundation — issue #28, một worktree độc quyền

**Đầu vào:** head `s_note_v2` sau PR #37; `docs/contracts/openapi.yaml`, `tools/build_openapi.py`, `physical-schema.md`, `permission-matrix.md`. **Đầu ra:** repo có thể build và migration được; client/server dùng chung hợp đồng. Chỉ ghép các lát cắt sau khi Foundation đạt cổng và merge; mã chuẩn bị sớm phải ghi SHA phụ thuộc và cập nhật lại từ head đã merge.

| Thứ tự | Công việc cụ thể | Bằng chứng để qua cổng |
| --- | --- | --- |
| F1 | Chọn và pin phiên bản Node/package manager, React/Vite, NestJS/Prisma/PostgreSQL theo phiên tương thích; tạo workspace packages, `apps/api`, `apps/web`, config TypeScript/lint/test và Docker Compose dev | Cài mới từ lockfile, build API/web trong checkout sạch; Compose khởi động PostgreSQL và volume thử |
| F2 | Kiểm OpenAPI 3.1 bằng validator chuẩn; sửa registry cho schema request/response/error cụ thể từng thao tác, status/header và ví dụ nhất quán; xác nhận route thiếu bằng action catalog | Validator chuẩn và kiểm `tools/validate_contract.py` qua; diff sinh lại YAML không đổi khi chạy lần hai; không còn `Result.data` chung ở operation nghiệp vụ cần codegen |
| F3 | Sinh `packages/contracts` và web client/types từ cùng OpenAPI; chuẩn hóa `requestId`, cookie/CSRF, ETag/If-Match, Idempotency-Key, cursor, UTC/date-only, 401/403/404/409/412/429/503 | Generated client build; một fixture cùng payload đi qua client/server contract; route có tên/kiểu không tự đặt khác |
| F4 | Hiện thực Prisma schema + migrations từ lược đồ v2; unique/CHECK/partial unique cần thiết bằng SQL khi Prisma không biểu đạt; seed dữ liệu giả không chứa người thật | Migrate DB trắng và reset/migrate lần hai được; kiểm DB với unique active, reference, scope và version; schema migration có owner duy nhất |
| F5 | Tạo core auth session/cookie/CSRF, kiểm scope/action, transaction+receipt/outbox, storage adapter interface và lỗi miền; chỉ khung/tối thiểu, không làm nghiệp vụ module | Core unit/contract checks cho deny-by-default, 409/412, requestId, same key/same body, different body/409; health/readiness rõ |
| F6 | Tạo CI build/lint/test/contract/migration, README chạy local và env mẫu không có secret; xác nhận module skeleton import qua public interfaces | Build/test/contract/migration có bằng chứng trong checkout sạch; khi GitHub Actions chạy được, CI xanh. Khi GitHub khóa job vì billing, cần kết quả tương đương trên PostgreSQL thật và ghi ngoại lệ rõ trong PR trước khi cân nhắc merge; ghi SHA merge làm gốc cho feature |

**Điều kiện dừng F:** nếu một field, action, vai trò hay transaction quan trọng chưa có cách biểu diễn, sửa hợp đồng/lược đồ trong #28 trước khi phát client. Chưa có máy chủ thật không cản build dev, nhưng môi trường pilot vẫn bị chặn.

## 2. Bốn worktree tính năng, mỗi worktree sở hữu API và UI

Sau khi #28 merge, cập nhật worktree Ngữ cảnh đang có và tạo ba worktree còn lại từ cùng head `s_note_v2` mới theo [WORKTREES.md](WORKTREES.md). [Bảng điều phối](WORK_QUEUE.md) nêu rõ phần có thể chuẩn bị trước và tín hiệu để nối thật. Mỗi worktree giao một luồng người dùng có backend, frontend, trạng thái lỗi và phép kiểm của chính luồng ấy. Không tách một tính năng thành PR API và PR WEB riêng. #30, #33 và #34 vẫn là mã issue để truy vết yêu cầu màn hình, được thực hiện bởi worktree tương ứng dưới đây; không tạo ba worktree WEB riêng.

| Worktree chính / issue | Phạm vi API → UI cùng sở hữu | Nghiệm thu lát cắt |
| --- | --- | --- |
| **Ngữ cảnh** #29; nhận phần lớp của #33 và shell của #34 | `identity`, `classes`, `workspaces`, `authorization` → đăng nhập/tài khoản, bộ chọn lớp/workspace, bảng Thành viên, Nhóm, Cài đặt lớp, shell/điều hướng và thành phần dùng chung | QA-01–04/13: hai duyệt nhóm đồng thời, quyền theo scope, rời/lưu trữ/bàn giao, đổi ngữ cảnh không lộ dữ liệu cũ |
| **Công việc và Lịch** #31; nhận phần việc/lịch của #34 | `tasks`, `calendar` → Việc của tôi, Gantt/Danh sách, chi tiết việc, Lịch của tôi/workspace/lớp | QA-04/10/11/13: checklist, lịch riêng, ngày cả ngày, hủy sự kiện, đổi màn nhanh |
| **Thư viện** #35; bao gồm #30 | `library`, `uploads`, `storage` → Hộp thu, thư mục, văn bản/link/tệp, phiên bản, quota, rác và khôi phục | QA-05–07/12–14: ghi đè cạnh tranh, bytes và mục chốt cùng, quota, URL an toàn, trạng thái upload |
| **Bài giao và Nộp** #32; nhận phần bài giao của #33 | `assignments`, `submissions`, `notifications` → tạo bài, tiến độ, nộp/sửa bản nộp, lịch sử phiên bản và nhận xét | QA-08/09/13: không nộp đôi, hạn/quyền tại commit, client xử lý mất phản hồi và xung đột |

**Điểm bàn giao bắt buộc:** Foundation cung cấp generated client/action enum/schema; Ngữ cảnh cung cấp public authorization/membership và shell/router/shared components; Thư viện cung cấp verified blob/quota/ref cho Bài giao; Công việc/Lịch cung cấp tiến độ việc và mốc lịch theo hợp đồng đã chốt. Mỗi feature import giao diện công khai, không truy cập bảng hoặc tệp riêng của feature khác trong controller. Có thể dùng fixture theo OpenAPI để dựng phần mình trong khi chờ upstream; không merge luồng người dùng thật còn nối stub.

**Thứ tự ghép:** Ngữ cảnh và Thư viện có thể tiến hành trước; Công việc/Lịch cần nối quyền từ Ngữ cảnh; Bài giao cần nối quyền/tư cách, tệp/quota và mốc công việc. Mỗi PR feature phải chạy luồng API → UI của phạm vi mình trên dữ liệu giả qua client đã sinh, gồm quyền, lỗi, thao tác đồng thời liên quan, trạng thái màn và QA tương ứng. Kiểm lint/type/build, contract và test hậu quả thực. Migration/spec/shared shell chỉ do owner tương ứng sửa; feature cập nhật từ commit đã merge rồi kiểm lại.

**Nhánh API-A đang có:** `feat/v2/api-a` và PR nháp #40 chứa service phía backend chuẩn bị sớm từ Foundation chưa merge. Đây là đầu vào của worktree Ngữ cảnh, chưa đạt lát cắt hoàn chỉnh. Giữ nhánh/PR này, sau khi Foundation đạt cổng thì cập nhật từ head mới, bổ sung UI lớp/workspace và kiểm luồng thật; đổi tên PR theo phạm vi cuối. Không tạo nhánh Ngữ cảnh thứ hai hoặc gọi #29 hoàn tất từ các test service hiện có.

## 3. Ghép toàn hệ thống — issue #36

Chỉ bắt đầu cổng tích hợp đầy đủ sau khi bốn PR lát cắt cần thiết merge. Worktree integration sở hữu `tests/e2e/**`, `infra/**`, CI/release; lỗi ở API/UI của lát cắt được trả về cùng owner. Một PR riêng có thể bổ sung smoke tests sớm, nhưng không gọi hoàn thành #36 trước khi chạy luồng thật.

1. Dựng môi trường cách ly từ commit sạch và dữ liệu giả; migrate, seed, build web/API, chạy worker/storage. Không dùng account/tệp thật của người dùng.
2. Chạy 12 ca nền trong `docs/quality/acceptance-scenarios.md` và QA-01–14; đo cả API lẫn trạng thái màn, đặc biệt quyền, tư cách nhóm đồng thời, nộp đứt mạng, quota và GC.
3. Kiểm tải theo bộ dữ liệu và p95 đã nêu ở `docs/quality/README.md`; lưu cách đo, cấu hình máy, commit, kết quả pass/fail trong báo cáo ngoài `docs/`. Kết quả mô phỏng không thay số người dùng pilot thực.
4. Trên desktop/mobile thật hoặc thiết bị kiểm thử được ghi rõ, kiểm keyboard/focus, responsive, reduced motion, chuyển workspace nhanh và phản hồi đến muộn.
5. Đối soát DB/blob, diễn tập backup và phục hồi **metadata cùng bytes** vào môi trường riêng; đọc lại các revision nộp và kiểm quyền sau restore.

**Cổng phát hành thử:** tất cả lỗi quyền/toàn vẹn P0 đã xử lý; client/server cùng version contract; migration/rollback mã tương thích; backup restore và giám sát có bằng chứng. ENV-01–05 cần giá trị môi trường thực trước pilot, ENV-06 cần nhà cung cấp email trước khi dùng reset mật khẩu thực. Nếu chưa có hosting hoặc nhóm thử, có thể kết thúc kiểm bằng dữ liệu giả và ghi trạng thái **pilot blocked**.

## 4. Theo dõi tiến độ và thay đổi

| Mốc | Báo cáo khi hoàn tất | Không được tuyên bố trước bằng chứng |
| --- | --- | --- |
| F | SHA merge #28, lockfile, OpenAPI validator, generated client, migration/build/test | “Bốn worktree tính năng đã có nền chung” khi F chưa xanh |
| A | SHA bốn PR lát cắt #29/#31/#35/#32, phần UI của #30/#33/#34, QA API → UI và dependency SHA | “Tính năng hoàn chỉnh” từ service backend hoặc màn dùng fixture |
| I | SHA #36, báo cáo e2e, đo tải, restore, danh sách lỗi P0 | “Ứng dụng đã đạt nghiệm thu” chỉ từ unit tests |
| Pilot | Giá trị ENV-01–06, vận hành/chi phí, đối tượng thử, bản phát hành xác định | “Sẵn sàng production/pilot” từ sơ đồ hoặc Docker Compose đơn thuần |

Một thay đổi nghiệp vụ đi theo **quy tắc → contract/schema → generated client → API → UI → QA**, có PR và dấu vết quyết định. Bug module trả về owner; conflict tệp theo [WORKTREES](WORKTREES.md). Không sửa trực tiếp tài liệu `docs/` để mô tả kết quả chạy; kết quả test, ước lượng và tiến độ sống trong issue/PR/báo cáo thực thi ngoài `docs/`.
