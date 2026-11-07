# Điều phối worktree để coding SNOTE v2

Tài liệu điều phối mã nguồn này nằm **ngoài `docs/`**. Chỉ dùng `s_note_v2` hoặc nhánh tách từ đúng nhánh ấy. Cấm đọc/cherry-pick/copy mã, thiết kế, tài liệu v1. [AGENTS.md](AGENTS.md) là lối vào chung; [kế hoạch xây dựng](IMPLEMENTATION_PLAN.md) chia các mốc; [đặc tả](docs/README.md), [OpenAPI](docs/contracts/openapi.yaml), [lược đồ](docs/architecture/physical-schema.md), [ca kiểm](docs/quality/README.md) là nguồn hiện hành. Issues #28–36 là gói việc, không phải bằng chứng tính năng đã chạy.

Phân công bốn worktree theo API + UI của từng luồng được cập nhật theo yêu cầu chủ sản phẩm ngày 2026-11-07; [kế hoạch](IMPLEMENTATION_PLAN.md) ghi trách nhiệm, [bảng điều phối](WORK_QUEUE.md) ghi tín hiệu để bắt đầu/nối/merge.

## Cổng bắt đầu và thứ tự

1. **Foundation #28 trước:** kiểm `docs/contracts/openapi.yaml` bằng công cụ chuẩn, tạo workspace package và `packages/contracts/` client/types sinh từ spec; tạo Prisma migration, core authorization/storage interface, API/web build tối thiểu. Merge foundation vào `s_note_v2` sau build + migration + contract checks.
2. **Bốn worktree tính năng theo luồng** tạo từ **head mới sau #28**: Ngữ cảnh, Công việc/Lịch, Thư viện, Bài giao/Nộp. Mỗi worktree sở hữu cả backend và frontend của luồng đó, dùng client/schema từ foundation. #30/#33/#34 là phần UI được phân cho bốn worktree, không tạo worktree WEB riêng.
3. Mỗi worktree mở một PR lát cắt vào `s_note_v2`, nêu issue chính và issue UI liên quan, vùng sở hữu, mã quy tắc và QA API → UI. Merge sau kiểm phù hợp; nếu PR khác đổi dependency, cập nhật nhánh bằng merge/rebase có kiểm soát, chạy lại check. Không force push `s_note_v2`.
4. **Integration #36** chạy sau các module: ghép, e2e, quyền, quota và restore. ENV-01–05 phải có số liệu thực trước pilot. Chưa gọi production-ready khi chưa đo, chưa phục hồi thử.

## Sở hữu tệp duy nhất

| Worktree/issue | Đường dẫn được sửa chính | Không tự sửa |
| --- | --- | --- |
| foundation #28 | `packages/contracts/**`, `apps/api/prisma/**`, `apps/api/src/core/**`, `apps/web/src/api/generated/**`, `docs/contracts/**`, `docs/architecture/physical-schema.md`, `tools/build_openapi.py`, `tools/validate_contract.py`, cấu hình root | Nghiệp vụ module/feature của agent khác |
| Ngữ cảnh #29 (+ UI lớp của #33, shell của #34) | `apps/api/src/modules/{identity,classes,workspaces,authorization}/**`; `apps/web/src/{app,shared}/**`, `apps/web/src/features/{identity,classes,workspaces}/**` | Schema/migration, generated client, feature Việc/Lịch/Thư viện/Bài giao |
| Công việc/Lịch #31 (+ UI phần việc/lịch của #34) | `apps/api/src/modules/{tasks,calendar}/**`; `apps/web/src/features/{tasks,calendar}/**` | `app/shared`, schema, module và feature khác |
| Thư viện #35 (+ UI #30) | `apps/api/src/modules/{library,uploads,storage}/**`; `apps/web/src/features/library/**` | Schema, Bài giao, `app/shared` |
| Bài giao/Nộp #32 (+ UI bài giao của #33) | `apps/api/src/modules/{assignments,submissions,notifications}/**`; `apps/web/src/features/assignments/**` | Storage/Thư viện, schema, `app/shared` |
| integration #36 | `tests/e2e/**`, `infra/**`, CI/release config sau các module | Mã module/feature/schema: báo lỗi cho chủ sở hữu sửa |

Không hai worktree cùng ghi `schema.prisma`, root config, navigation shell hay generated client. Một lát cắt cần thay schema/spec: mở yêu cầu gắn #28, mô tả payload cũ/mới và tác động; chủ foundation sửa **generator** `tools/build_openapi.py`, sinh lại OpenAPI, cập nhật migration và client; sau khi merge mới cập nhật lát cắt phụ thuộc. Không chỉnh tay `openapi.yaml` hoặc generated client. Mỗi lát cắt thêm test API và UI trong thư mục sở hữu; test tích hợp liên lát cắt do #36 sở hữu.

## Tạo worktree trên Windows PowerShell

Chạy từ repo gốc v2 đã có remote `origin`. Trước khi tạo worktree tính năng, chờ #28 merge. Chỉ fetch nhánh v2, không chuyển sang `main` hoặc nhánh cũ.

```powershell
git fetch origin s_note_v2
git worktree add ..\snote-v2-foundation -b feat/v2/foundation origin/s_note_v2
git -C ..\snote-v2-foundation status --short --branch
```

Sau khi PR foundation merge, cập nhật điểm gốc và tạo các worktree tính năng còn thiếu. Nhánh Ngữ cảnh hiện dùng `feat/v2/api-a` để giữ PR nháp #40; cập nhật nhánh ấy từ Foundation đã merge rồi tiếp tục cả UI và API. Không tạo thêm `feat/v2/context` trùng sở hữu. Mỗi đường dẫn/nhánh chỉ tạo **một lần**; nếu đã tồn tại dùng `git worktree list` để tìm, không xóa worktree có sửa đổi.

```powershell
git fetch origin s_note_v2
git worktree add ..\snote-v2-planning -b feat/v2/planning origin/s_note_v2
git worktree add ..\snote-v2-library -b feat/v2/library origin/s_note_v2
git worktree add ..\snote-v2-assignments -b feat/v2/assignments origin/s_note_v2
git worktree list
```

Ví dụ worktree Thư viện làm trong `..\snote-v2-library`: xác nhận nhánh và diff trước khi commit, chỉ stage đường dẫn API và UI sở hữu, push PR tới `s_note_v2`.

```powershell
git -C ..\snote-v2-library status --short --branch
git -C ..\snote-v2-library diff --check
git -C ..\snote-v2-library add apps/api/src/modules/library apps/api/src/modules/uploads apps/api/src/modules/storage apps/web/src/features/library
git -C ..\snote-v2-library commit -m "feat(v2): implement library from API to UI"
git -C ..\snote-v2-library push -u origin feat/v2/library
```

Trên Bash/Linux, dùng đường dẫn `../snote-v2-library`; các nguyên tắc branch và file giữ nguyên. Trước khi xóa worktree đã merge: kiểm `git status` sạch, xác nhận PR đã merge, rồi `git worktree remove <path>`; xóa nhánh feature theo quy trình Git, không xóa dữ liệu chưa commit.

## Hợp đồng phối hợp

| Tình huống | Hành động bắt buộc |
| --- | --- |
| Hai agent cần một trường API mới | Ghi issue với ví dụ request/response/lỗi, cập nhật OpenAPI qua chủ foundation, sinh client và đồng bộ sau merge. Không dùng tên trường tạm khác nhau ở hai phía |
| Thư viện và Bài giao cần tệp nộp | Thư viện cung cấp tham chiếu tệp `verified`/bytes bất biến; Bài giao chốt phiên bản và quota qua interface công khai, không gọi thẳng đường dẫn storage |
| Công việc/Lịch, Thư viện hoặc Bài giao cần thay menu, token hay shared component | Yêu cầu Ngữ cảnh đổi `app/shared`, không copy component thứ hai; lát cắt chỉ import API công khai |
| Migration làm PR khác lỗi | Chỉ chủ #28 sửa `schema.prisma`/migration; owner module sửa phần mình sau migration mới. PR nêu dependency SHA, không sửa trực tiếp file của agent khác |
| Quyền/riêng tư không rõ | Dừng đúng thao tác đó, đối chiếu `STR`, `PM`, action catalog; nếu vẫn mâu thuẫn mở issue thiết kế và chỉ tiếp tục phần không phụ thuộc. Không suy quyền từ nút UI hay role Teacher toàn cục |
| Trùng file khi merge | Xác định owner theo bảng, owner thực hiện thay đổi hoặc PR phối hợp riêng; không dùng `git add .` và chọn kết quả conflict tùy tiện |

**Definition of done mỗi lát cắt:** build/lint API và UI, test hành vi có hậu quả thực (quyền, đồng thời, lỗi), một luồng đi qua client sinh từ OpenAPI đến API và trạng thái UX thật, liên kết mã quy tắc/QA trong PR. Stub chỉ phục vụ phát triển, không tính nghiệm thu. Không tự nhận QA-14 hay mục tiêu pilot đã đạt nếu chưa chạy diễn tập. `s_note_v2` là nhánh tích hợp duy nhất; mỗi worktree là một checkout/nhánh riêng, không phải nhánh con tự động của Git.
