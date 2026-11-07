# API-A #29 — rà đầu vào trước triển khai

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Tài khoản, lớp, workspace, tư cách và quyền của [issue #29](https://github.com/naverisme/snote/issues/29) |
| Thời điểm đối chiếu | 2026-11-07, khoảng 15:39–15:41 UTC |
| Checkout | `feat/v2/api-a`, HEAD `63a1ae7edf9dff69a913c236815ca3be156c5763` |
| Trạng thái | Rà đầu vào; chưa triển khai hoặc nghiệm thu API-A. Cổng foundation chưa đạt |
| Nguồn | [AGENTS](../AGENTS.md), [kế hoạch](../IMPLEMENTATION_PLAN.md), [worktrees](../WORKTREES.md), [SRC-26/27](provenance.md), các tài liệu v2 dẫn dưới đây; không dùng v1 |

## Cổng bắt đầu

[PR foundation #39](https://github.com/naverisme/snote/pull/39) đang mở, `draft=true`, `merged_at=null`; head trùng HEAD checkout này. Nhánh đích `s_note_v2` vẫn ở `269efe03ce0beeeb12cd5811fc088dbbfffe6c58` khi đối chiếu. Có mã foundation trong checkout không chứng minh foundation đã merge hoặc qua kiểm migration.

[Workflow run 42386449645](https://github.com/naverisme/snote/actions/runs/42386449645), gắn với head foundation, trả `completed/failure`; job `build` số `128444759977` trả `failure`, không có steps trong phản hồi connector. Mô tả PR #39 và [hồ sơ foundation](foundation-audit.md) ghi lần chạy trước bị GitHub chặn do billing. Không suy nguyên nhân riêng của lần chạy mới từ thông tin lần trước. Chưa thu được bằng chứng PostgreSQL/migration thành công.

[WORKTREES, cổng 1–2](../WORKTREES.md) yêu cầu merge foundation trước khi tách worktree tính năng; [kế hoạch F](../IMPLEMENTATION_PLAN.md) yêu cầu xử lý field/action/transaction quan trọng còn thiếu trong #28 trước khi phát client. Vì vậy chưa bắt đầu coding API-A, chưa đổi schema, generator, client hay core. Hồ sơ này thực hiện phần rà soát độc lập theo AGENTS mục 3–4; các yêu cầu bên dưới là bản nháp bàn giao cho owner #28, chưa được gửi lên GitHub.

## Dấu vết đầu vào đã kiểm

| Đầu vào tại HEAD | Git blob |
| --- | --- |
| [OpenAPI](../docs/contracts/openapi.yaml) | `0e2d61ce4e7d57f6fa2c98a65c351c6c55a5d167` |
| [Prisma schema](../apps/api/prisma/schema.prisma) | `cd69066dd6098fadd86a0c86cde7d0e884ba8b07` |
| [Types đã sinh](../packages/contracts/src/schema.ts) | `92c725300ea3150dd5659fd166cd5dde89c61d2d` |

Đã đọc hợp đồng bằng `js-yaml` có sẵn trong `node_modules`, chỉ truy vấn dữ liệu, không chạy generator. Kết quả: 78 paths, 98 operations; 48 operations mang tag `auth/account/class/membership/workspace/grant` liên quan API-A. Đã đối chiếu [registry generator](../tools/build_openapi.py), [SQL migration](../apps/api/prisma/migrations/20261107105000_foundation/migration.sql), [lược đồ](../docs/architecture/physical-schema.md), [action catalog](../docs/contracts/action-catalog.md) và [core authorization](../apps/api/src/core/authorization.ts).

Đây là kết quả kiểm tĩnh, không thay validator OpenAPI chuẩn, build, kiểm PostgreSQL hoặc QA runtime. Python hiện không có `yaml`; không có `docker`/`psql` trên PATH trong phiên rà này. Không cài dependency hay sửa môi trường của owner khác để suy ra cổng đã đạt.

## Bản nháp yêu cầu foundation #28

Mỗi hàng mô tả hiện trạng kiểm được và đề nghị cụ thể. Payload mới là ví dụ đề xuất, chỉ được dùng sau khi owner cập nhật generator/schema, sinh lại client, kiểm tương thích và merge. Không coi các ví dụ này là contract hiện hành.

| Mã / nguồn | Hiện trạng và ảnh hưởng | Đề nghị trước/sau; điều kiện kiểm |
| --- | --- | --- |
| AA-F01 — PER-09–11, PM-09 | Có `GET /classes/{classId}/members`, có action `class.role_change`, chưa có mutation đổi vai trò cấp lớp. `PATCH /groups/{groupId}/leader` chỉ đổi vai trò nhóm | Bổ sung route, ví dụ `PATCH /classes/{classId}/members/{membershipId}/role` với `{role:"member" hoặc "monitor"}`, `If-Match` bắt buộc và `MembershipResult`. Chỉ chủ lớp; từ chối leader ở cấp lớp; tối đa một monitor chính; đổi đồng thời không tạo hai monitor |
| AA-F02 — GroupCreate, ACC-04 | `POST /workspaces` và tạo nhóm nhận `{name:...}`, nhưng `Workspace` ở response và Prisma đều không có `name`. Tên nhận vào không có chỗ lưu/đọc lại | Thêm tên workspace vào schema/migration và response. Ví dụ tạo `{name:"Nhóm A"}` thì đọc lại có `name:"Nhóm A"`. Khóa cách đặt tên workspace mặc định trong fixture; không lấy dữ liệu v1 |
| AA-F03 — CLS-03, JoinClass | Có body `{code:...}` và `POST /classes/{classId}/join-code`, nhưng response là `ClassResult`, không có code; Prisma chưa có chỗ lưu trạng thái/mã lớp | Định nghĩa đối tượng mã lớp và persistence riêng hoặc field có owner rõ; response cấp mã chỉ cho chủ lớp, ví dụ `{data:{classId,code,enabled,version},requestId}`. Kiểm mã bị tắt/thay mới, lớp lưu trữ và không tiết lộ mã cho người ngoài; chốt quyền trước khi biết classId |
| AA-F04 — ACC-08, CLS-10, STR-10 | Tạo transfer trả `ClassResult`/`WorkspaceResult`, không có `transferId` để người nhận chấp nhận. `POST /ownership-transfers/{transferId}/accept` luôn trả `WorkspaceResult`, kể cả khi target là lớp | Tạo/list transfer trả đối tượng có `id`, target, recipient, trạng thái/version; accept trả transfer và kết quả đúng target hoặc union có discriminator. Ví dụ target `class` không bị ép thành workspace. Hai accept cạnh tranh chỉ một owner; recipient rời hoặc tắt teacher trước accept phải được kiểm lại |
| AA-F05 — ACC-04/09, PER-07 | Workspace độc lập có tạo/đọc/archive/transfer, chưa có route mời/chấp nhận hoặc rời theo workspace; route `/groups/...` chưa có cam kết áp dụng cho workspace độc lập | Bổ sung các route membership workspace độc lập hoặc mô tả rõ alias trong generator, không tự đặt alias trong controller. Fixture hai tài khoản: mời chưa cấp quyền, accept mới có tư cách; rời cần bàn giao. Mọi đường mời/share/leave/transfer/archive từ chối workspace `default` |
| AA-F06 — STR-11–13, PM-07/08/21/22 | `Action` chỉ có các mutation; chưa biểu diễn quyền đọc riêng tệp/link hoặc tiến độ/bản nộp nhóm khác. `library.edit_file` không phân biệt link; không được suy quyền đọc hay Nộp từ quyền sửa/quản lý | Owner khóa action đọc theo loại dữ liệu và scope, cùng rule áp dụng cho link; ví dụ cấp đọc tệp ở workspace A không cấp sửa, đọc nhóm B hay Nộp. Nếu dùng quyền suy ra từ mutation thì phải ghi quy tắc chính thức và chạy toàn ma trận; không tự dùng chuỗi action ngoài enum |
| AA-F07 — If-Match, ACC-01, PER-11 | `PATCH /me/usages` và `PATCH /groups/{groupId}/leader` có `If-Match` tùy chọn nhưng không khai báo 412. `PATCH policy` khai báo 412 nhưng header vẫn tùy chọn. Prisma `Grant` chưa có version trong khi `Grant` response bắt buộc version | Khóa version nền bắt buộc trên mutation sửa tài nguyên đã có; khai báo 412 nhất quán, có ETag đọc được. Chốt Grant là tài nguyên có version lưu thật hay response bất biến được định nghĩa rõ. Hai writer cùng version chỉ một thành công; writer cũ không ghi đè |
| AA-F08 — STR-07/08, action catalog | Invitation/JoinRequest đang dùng `MembershipResult/ListResult`; không có target type/id, initiator/recipient và trạng thái accepted/approved của đối tượng yêu cầu. Prisma Invitation/JoinRequest chưa có version. Không có dấu thế hệ archive để phân biệt lời mời cũ sau restore | Tách schema invitation/request khỏi membership, trả đúng ID dùng trong accept/approve và thông tin target theo quyền. Khóa chuyển trạng thái archive: vô hiệu invitation cũ và yêu cầu xem xét lại request; không tự hồi sinh. Test archive → restore → accept invitation cũ vẫn không kích hoạt |
| AA-F09 — auth/session, ENV-06, STR-17 | Login/register chỉ trả `AccountResult`; chưa mô tả `Set-Cookie` hoặc cách client lấy CSRF token cho mutation tiếp theo. Schema chưa có persistence token reset dùng một lần. Register nhận `timeZone`, Account chưa có field đó | Chốt trả cookie + CSRF bằng header/schema được sinh; fixture login → mutation/logout phải dùng được. Owner chọn persistence reset token hash/expiry/consumed, kiểm một lần/hết hạn/không lộ email. Chốt nguồn timezone tài khoản: field Account hoặc workspace mặc định với quy tắc rõ; không tự bịa provider email ENV-06 |

## Phương án triển khai sau khi mở cổng

Sở hữu chỉ bốn thư mục `apps/api/src/modules/{identity,classes,workspaces,authorization}/`. Dùng type sinh từ hợp đồng và `AuthorizationPort` foundation; các module B/C/D gọi public interface của API-A. Không cho controller ngoài API-A đọc trực tiếp bảng tư cách để tự suy quyền.

1. Identity: đăng ký tạo account, usages và đúng một workspace `default` trong một transaction; ít nhất một usage. Tắt teacher chỉ chặn tạo lớp mới, giữ owner lớp cũ. Thiếu bước tạo workspace hoặc audit thì rollback toàn bộ.
2. Classes/membership: phân biệt invitation với join request; kích hoạt lớp mới cho role Member. Mọi đường accept/approve nhóm và restore nhóm phải dùng chung cơ chế tuần tự hóa tại DB; kiểm tư cách lớp, archive và giới hạn hiện hành tại commit. Không đặt unique cứng một nhóm/người.
3. Workspaces/lifecycle: lớp của nhóm bất biến, default không share/archive/transfer. Restore nhóm kiểm toàn bộ thành viên trước khi đổi trạng thái; có xung đột thì rollback toàn bộ. Transfer kiểm owner, recipient và điều kiện hiện hành rồi thay owner nguyên tử. Leave/remove kiểm trách nhiệm và ghi lịch sử; không xóa việc/bản nộp.
4. Authorization: scope → tư cách → hợp quyền đúng action → riêng tư/archive → quyết định. Teacher tự khai không cấp quyền ngoài lớp sở hữu; lớp trưởng không mặc định có quyền tệp/link liên nhóm, tạo/xóa/hủy/checklist/Nộp. Grant và policy không vượt riêng tư/tư cách/archive. Kiểm lại trong transaction ghi, không cache quyết định từ lúc mở màn.

Phản biện phương án khóa: chỉ khóa `(classId,accountId)` trong accept nhóm chưa bảo đảm an toàn với đổi `groupLimit`, archive lớp và restore nhóm nhiều người. Đề nghị một thứ tự khóa nhất quán cho các writer cùng lớp, rồi workspace và các account theo ID tăng dần; hoặc isolation serializable với retry có giới hạn cho **toàn bộ** quyết định. Chủ API-A cần chứng minh bằng PostgreSQL thật. Khóa trong bộ nhớ một tiến trình không đủ khi API có nhiều worker. Trả 503 sau khi hết retry; không báo thành công nếu transaction chưa commit.

## Ma trận kiểm phải thực thi

Các hàng sau là ca cần chạy, chưa phải kết quả pass. Kế thừa [QA-01–04](../docs/quality/README.md), [VT-01–04](../docs/quality/acceptance-scenarios.md), [EC-07/09–12/19](edge-case-audit.md) và [STR-01–14](../docs/requirements/structural-rules.md).

| Ca | Điều kiện/thao tác | Kết quả quan sát cần có |
| --- | --- | --- |
| AA-Q01 / QA-01 | Teacher tạo lớp, tắt teacher, thao tác lớp cũ rồi tạo lớp mới; teacher khác dùng ID lớp | Lớp cũ còn đúng owner; tạo mới bị từ chối khi tắt; không lộ dữ liệu lớp khác |
| AA-Q02 / VT-01 | Đăng ký đủ usages, chèn lỗi sau tạo account hoặc trước tạo workspace; retry | Chỉ khi commit mới có account với một default; lỗi không để account/usage/workspace dở dang |
| AA-Q03 / QA-02 | Lời mời lớp được accept; mã lớp chỉ tạo request rồi owner approve | Tư cách lớp Member kích hoạt đúng bước; không tự có tư cách nhóm; người khác không accept hộ |
| AA-Q04 / EC-09 | Đồng thời approve/approve và approve/accept cho cùng người, hai nhóm, limit 1 | Tối đa một nhóm active; cùng transaction vô hiệu invitation khác; rời nhóm không hồi sinh invitation cũ |
| AA-Q05 / CLS-11 | Giảm limit dưới số nhóm hiện có; cạnh tranh giảm limit với accept | Giữ tư cách đã có, chặn gia nhập mới theo limit hiện hành; không tự loại thành viên |
| AA-Q06 / QA-03, EC-11 | Archive A → thành viên vào B → restore A, limit 1; chạy đồng thời với accept B | Xung đột giữ A archived và toàn bộ dữ liệu/tư cách nguyên trạng; không restore một phần, không đẩy khỏi B |
| AA-Q07 / STR-08 | Archive lớp/nhóm có pending; thử accept/approve, restore, thử invitation cũ | Trong archive bị chặn; restore không tự kích hoạt pending; invitation cũ cần gửi mới, request cần duyệt lại có kiểm hiện trạng |
| AA-Q08 / EC-10 | Thay người nhận transfer; hai accept; recipient mất tư cách hoặc tắt teacher lúc nhận lớp | Một owner; request cũ không thay owner mới; điều kiện recipient kiểm tại commit; thất bại không đổi owner |
| AA-Q09 / CLS-08/09/12 | Leave/remove khi là leader hoặc có việc chưa bàn giao; chèn lỗi giữa handover và kết thúc tư cách | `HANDOVER_REQUIRED` khi chưa đáp ứng; lỗi rollback cả handover và leave; khi rời thành công mất quyền mới, lịch sử/bản nộp còn |
| AA-Q10 / QA-04 | Mỗi role và role kiêm nhiệm, action riêng, scope khác; revoke grant khi request đã mở | Hợp quyền trong scope; không cấp tiếp; quyền mới kiểm tại commit; leader vẫn giữ quyền nhóm khi tắt quyền monitor |
| AA-Q11 / PM-02/03 | Owner lớp/monitor/leader và grant cố đọc default hoặc lịch riêng; ghi khi lớp hay nhóm archived | Dữ liệu riêng chỉ chủ; archive chặn ghi cả nhóm con; chỉ người có quyền restore mới mở lại ghi |
| AA-Q12 / security boundaries | List/search/count/cursor từ scope khác, rồi đổi tư cách giữa hai trang | Lọc quyền trước phân trang/tổng hợp; không lộ title/count riêng; cursor không giữ quyền cũ |
| AA-Q13 / AA-F07/09 | Hai PATCH cùng ETag; login thiếu/sai CSRF; reset token hết hạn hoặc dùng lần hai | Chỉ một PATCH thành công, còn lại 412; mutation thiếu/sai CSRF bị từ chối; reset an toàn; không log password/token/nội dung riêng |

## Điều kiện tiếp tục

- Owner #28 xử lý các khoảng trống hợp đồng/schema quan trọng, sinh lại types/client và ghi SHA dependency sau merge; sửa registry thay vì chỉnh YAML tay.
- Foundation có bằng chứng build, contract và PostgreSQL migrate/reset/constraint thành công; PR foundation merge vào `s_note_v2` theo cổng hiện hành. Không dùng test stub để thay bằng chứng tích hợp.
- Đồng bộ worktree API-A từ foundation đã merge theo quy trình có kiểm soát; bảo toàn tệp chưa commit xuất hiện từ tiến trình khác trong phiên này (`authorization/policy.ts`, `classes/admission.ts` tại lúc kiểm). Hồ sơ này không sửa hoặc nhận chúng là phần đã triển khai.
- Sau đó triển khai trong vùng sở hữu và thực thi ma trận trên, ghi môi trường/SHA/kết quả thật trong hồ sơ PR. Chưa đánh dấu #29 hoàn tất hay QA-01–04 pass.
