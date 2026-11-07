# Điều phối worktree để coding SNOTE v2

Tài liệu điều phối mã nguồn này nằm **ngoài `docs/`**. Chỉ dùng `s_note_v2` hoặc nhánh tách từ đúng nhánh ấy. Cấm đọc/cherry-pick/copy mã, thiết kế, tài liệu v1. [AGENTS.md](AGENTS.md) là lối vào chung; [đặc tả](docs/README.md), [OpenAPI](docs/contracts/openapi.yaml), [lược đồ](docs/architecture/physical-schema.md), [ca kiểm](docs/quality/README.md) là nguồn hiện hành. Issues #28–36 là gói việc, không phải bằng chứng tính năng đã chạy.

## Cổng bắt đầu và thứ tự

1. **Foundation #28 trước:** kiểm `docs/contracts/openapi.yaml` bằng công cụ chuẩn, tạo workspace package và `packages/contracts/` client/types sinh từ spec; tạo Prisma migration, core authorization/storage interface, API/web build tối thiểu. Merge foundation vào `s_note_v2` sau build + migration + contract checks.
2. **Bảy worktree tính năng** tạo từ **head mới sau #28**, không tạo từ commit cũ trước foundation. Backend/frontend dùng client và schema của foundation; không tự tạo endpoint/tên trường khác spec.
3. Mỗi agent mở một PR vào `s_note_v2`, nêu issue, file sở hữu, mã quy tắc và QA. Merge sau check phù hợp; nếu PR khác đổi dependency, cập nhật nhánh bằng merge/rebase có kiểm soát, chạy lại check. Không force push `s_note_v2`.
4. **Integration #36** chạy sau các module: ghép, e2e, quyền, quota và restore. ENV-01–05 phải có số liệu thực trước pilot. Chưa gọi production-ready khi chưa đo, chưa phục hồi thử.

## Sở hữu tệp duy nhất

| Worktree/issue | Đường dẫn được sửa chính | Không tự sửa |
| --- | --- | --- |
| foundation #28 | `packages/contracts/**`, `apps/api/prisma/**`, `apps/api/src/core/**`, `apps/web/src/api/generated/**`, `docs/contracts/**`, `tools/build_openapi.py`, `tools/validate_contract.py`, cấu hình root | Nghiệp vụ module/feature của agent khác |
| API-A #29 | `apps/api/src/modules/identity/**`, `classes/**`, `workspaces/**`, `authorization/**` | Schema/migration, core, module khác |
| API-B #31 | `apps/api/src/modules/tasks/**`, `calendar/**` | Session cá nhân của agent khác, schema, module khác |
| API-C #35 | `apps/api/src/modules/library/**`, `uploads/**`, `storage/**` | Assignments, schema, shared core |
| API-D #32 | `apps/api/src/modules/assignments/**`, `submissions/**`, `notifications/**` | Storage/lib, schema, shared core |
| WEB-A #34 | `apps/web/src/app/**`, `shared/**`, `features/tasks/**`, `features/calendar/**` | Features lớp/bài/Thư viện của agent khác |
| WEB-B #33 | `apps/web/src/features/classes/**`, `features/assignments/**` | `app`, `shared`, generated client, feature Thư viện |
| WEB-C #30 | `apps/web/src/features/library/**` | `app`, `shared`, generated client, feature khác |
| integration #36 | `tests/e2e/**`, `infra/**`, CI/release config sau các module | Mã module/feature/schema: báo lỗi cho chủ sở hữu sửa |

Không hai agent cùng ghi `schema.prisma`, root config, navigation shell hay generated client. Một agent cần thay schema/spec: mở yêu cầu thay đổi gắn issue #28, mô tả payload cũ/mới và tác động; chủ foundation sửa **generator** `tools/build_openapi.py`, sinh lại OpenAPI, cập nhật migration và client; sau khi merge mới cập nhật module phụ thuộc. Không chỉnh tay `openapi.yaml` hoặc generated client. Các API module được phép bổ sung test **trong thư mục của mình**; test tích hợp liên module do #36 sở hữu.

## Tạo worktree trên Windows PowerShell

Chạy từ repo gốc v2 đã có remote `origin`. Trước khi tạo worktree tính năng, chờ #28 merge. Chỉ fetch nhánh v2, không chuyển sang `main` hoặc nhánh cũ.

```powershell
git fetch origin s_note_v2
git worktree add ..\snote-v2-foundation -b feat/v2/foundation origin/s_note_v2
git -C ..\snote-v2-foundation status --short --branch
```

Sau khi PR foundation merge, cập nhật điểm gốc và tạo các worktree độc lập. Mỗi đường dẫn/nhánh chỉ tạo **một lần**; nếu đã tồn tại dùng `git worktree list` để tìm, không xóa worktree có sửa đổi.

```powershell
git fetch origin s_note_v2
git worktree add ..\snote-v2-api-a -b feat/v2/api-a origin/s_note_v2
git worktree add ..\snote-v2-api-b -b feat/v2/api-b origin/s_note_v2
git worktree add ..\snote-v2-api-c -b feat/v2/api-c origin/s_note_v2
git worktree add ..\snote-v2-api-d -b feat/v2/api-d origin/s_note_v2
git worktree add ..\snote-v2-web-a -b feat/v2/web-a origin/s_note_v2
git worktree add ..\snote-v2-web-b -b feat/v2/web-b origin/s_note_v2
git worktree add ..\snote-v2-web-c -b feat/v2/web-c origin/s_note_v2
git worktree list
```

Ví dụ agent API-C làm trong `..\snote-v2-api-c`: xác nhận nhánh và diff trước khi commit, chỉ stage đường dẫn sở hữu, push PR tới `s_note_v2`.

```powershell
git -C ..\snote-v2-api-c status --short --branch
git -C ..\snote-v2-api-c diff --check
git -C ..\snote-v2-api-c add apps/api/src/modules/library apps/api/src/modules/uploads apps/api/src/modules/storage
git -C ..\snote-v2-api-c commit -m "feat(v2): implement library and uploads"
git -C ..\snote-v2-api-c push -u origin feat/v2/api-c
```

Trên Bash/Linux, thay `..\snote-v2-api-c` bằng `../snote-v2-api-c`; các nguyên tắc branch và file giữ nguyên. Trước khi xóa worktree đã merge: kiểm `git status` sạch, xác nhận PR đã merge, rồi `git worktree remove <path>`; xóa nhánh feature theo quy trình Git, không xóa dữ liệu chưa commit.

## Hợp đồng phối hợp

| Tình huống | Hành động bắt buộc |
| --- | --- |
| Hai agent cần một trường API mới | Ghi issue với ví dụ request/response/lỗi, cập nhật OpenAPI qua chủ foundation, sinh client và đồng bộ sau merge. Không dùng tên trường tạm khác nhau ở hai phía |
| Module API-C và API-D cần tệp nộp | API-C cung cấp tham chiếu tệp `verified`/bytes bất biến, API-D chỉ chốt phiên bản và quota qua interface core; không gọi thẳng đường dẫn storage của nhau |
| WEB-B/C cần thay menu, token hoặc shared component | Yêu cầu WEB-A đổi `app/shared`, không copy component thứ hai; feature PR chỉ import API công khai |
| Migration làm PR khác lỗi | Chỉ chủ #28 sửa `schema.prisma`/migration; owner module sửa phần mình sau migration mới. PR nêu dependency SHA, không sửa trực tiếp file của agent khác |
| Quyền/riêng tư không rõ | Dừng đúng thao tác đó, đối chiếu `STR`, `PM`, action catalog; nếu vẫn mâu thuẫn mở issue thiết kế và chỉ tiếp tục phần không phụ thuộc. Không suy quyền từ nút UI hay role Teacher toàn cục |
| Trùng file khi merge | Xác định owner theo bảng, owner thực hiện thay đổi hoặc PR phối hợp riêng; không dùng `git add .` và chọn kết quả conflict tùy tiện |

**Definition of done mỗi feature:** build/lint phạm vi phụ trách, test hành vi có hậu quả thực (quyền, đồng thời, lỗi), đối chiếu OpenAPI, trạng thái UX, liên kết mã quy tắc/QA trong PR. Không tự nhận QA-14 hay mục tiêu pilot đã đạt nếu chưa chạy diễn tập. `s_note_v2` là nhánh tích hợp duy nhất; mỗi worktree là một checkout/nhánh riêng, không phải nhánh con tự động của Git.
