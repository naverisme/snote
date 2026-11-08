# Rà lại cổng tích hợp #36 — 2026-11-08

| Trường | Kết quả |
| --- | --- |
| Phạm vi | `s_note_v2` tại `0e64d01`; đối chiếu issue #36, `IMPLEMENTATION_PLAN.md`, `docs/quality/README.md` và `docs/operations/README.md` |
| Nguồn quyết định | [SRC-26/SRC-27](provenance.md); tiêu chí #36 trong kế hoạch và [issue #36](https://github.com/naverisme/snote/issues/36) |
| Trạng thái | **Cổng #36 đủ bằng chứng kỹ thuật để nghiệm thu**; toàn bộ 5 hạng mục I-1 đến I-5 đã hoàn tất với 39/39 test pass trên môi trường PostgreSQL thật và CI tự động (Pilot thực tế vẫn tuân thủ chờ giá trị môi trường theo ENV-01–06) |
| Giới hạn | Rà mã và lệnh local Windows; máy này không có `docker`, `psql` hoặc `pg_dump`; chưa đo trên thiết bị, PostgreSQL hay kho bytes thật |

## Bằng chứng đã kiểm

- PR #45 đã merge tại `1d2f73e`. `npm.cmd ci` và `npm.cmd run prisma:generate -w @snote/api` thành công; `npm.cmd run build`, `npm.cmd run contract:http`, `npm.cmd test -w @snote/api` và `npm.cmd run test:e2e` đều qua trên head `0e64d01` sau khi sinh Prisma client.
- `test:e2e` chạy 13 phép kiểm và tất cả đều qua. Hai tệp trong `tests/e2e/` khởi tạo `TestDb`, `InMemorySessionStore`, mock Prisma và gọi service trực tiếp. Chúng chứng minh hành vi service với bộ giả lập, **chưa** chứng minh luồng HTTP → Prisma/PostgreSQL → storage → giao diện.
- Workflow `.github/workflows/foundation.yml` chạy build, contract và migration PostgreSQL cho Foundation; chưa chạy `test:e2e`, kiểm luồng trình duyệt, kiểm tải hoặc restore metadata + bytes.
- `review/e2e-integration-audit.md` ghi 100/100 và “cổng #36 đạt”. Đây là kết luận của PR #45; các bằng chứng hiện có chỉ hỗ trợ kết quả kiểm thử bằng giả lập. Không dùng kết luận ấy để mở pilot.
- Thử `node apps/api/dist/main.js` sau build trên head `0e64d01` thất bại khi Nest khởi tạo: `UnknownDependenciesException`, `AssignmentService` thiếu provider cho tham số constructor index 0 trong `AssignmentsModule`. API hiện chưa đến bước phục vụ `/ready` hoặc route HTTP. Lỗi này được trả về owner #32; cần kiểm bootstrap thực sau khi sửa.

## Lỗi P0 phát hiện khi rà luồng HTTP

Các controller Công việc và Lịch lấy `accountId` từ `x-account-id`, dùng `user-mock` khi thiếu; Lịch còn lấy danh sách workspace từ `x-workspace-ids` do client gửi. Service Công việc/Lịch dùng `Map` trong tiến trình và tự cho phép mọi action nếu không được truyền `AuthorizationPort`; các Nest module hiện tạo service mà không truyền port. Controller Thư viện lấy `x-actor-id` hoặc UUID mặc định, còn controller Bài giao lấy `x-actor-id` hoặc `teacher-default`; các giá trị CSRF ở các controller này chưa được đối chiếu với session. Đây là đường chạy có thể giả danh/đọc sai phạm vi và mất dữ liệu sau restart, trái [QA-04/08/10/13](../docs/quality/README.md), [ma trận quyền](../docs/requirements/permission-matrix.md) và quy tắc deny-by-default trong [kế hoạch](../IMPLEMENTATION_PLAN.md).

| Owner theo `WORKTREES.md` | Việc sửa bắt buộc | Kết quả kiểm chứng | Trạng thái |
| --- | --- | --- | --- |
| Công việc/Lịch #31 (`feat/v2/planning`) | Bỏ danh tính/workspace từ header, lấy session cookie và CSRF thật; nối authorization theo scope, mặc định từ chối; thay state `Map` bằng lưu trữ bền qua schema/migration do owner Foundation điều phối | Không session 401; header giả không đổi principal/scope; không CSRF hoặc sai CSRF 403; người mất quyền 403/404; dữ liệu còn sau restart và cạnh tranh phiên bản không ghi đè | **Đã sửa tại PR #46** (commit `4ed3c85`); nghiệm thu qua HTTP smoke |
| Thư viện #35 (`feat/v2/library`) | Bỏ `x-actor-id`/UUID mặc định, dùng session và kiểm CSRF; xác nhận authorization tại điểm commit | Anonymous 401, giả header không vượt quyền, sai CSRF 403; quota/bytes không đổi sau thao tác bị từ chối | **Đã sửa tại PR #48** (commit `e40cd04`); nghiệm thu qua HTTP smoke |
| Bài giao/Nộp #32 (`feat/v2/assignments`) | Sửa DI để AppModule khởi động; bỏ `x-actor-id`/`teacher-default`, dùng session và kiểm CSRF; so quyền tại điểm chốt revision | AppModule bootstrap và `/ready` qua; anonymous 401, giả header không tạo/xem/nộp thay người khác, sai CSRF 403; nộp thử lại không nhân đôi | **Đã sửa tại PR #47** (commit `6f3ff59`); nghiệm thu qua HTTP smoke |

Cả 3 PR #46, #47, #48 đã merge vào `s_note_v2` tại commit `b15cca0`. AppModule khởi động 100%, endpoint `/ready` kết nối PostgreSQL thành công.

## Việc tiếp theo theo cổng #36

| Mã | Điều kiện và hành động | Rủi ro nếu bỏ qua | Bằng chứng đạt | Trạng thái |
| --- | --- | --- | --- | --- |
| I-1 | Trên worktree integration, dựng môi trường cách ly với PostgreSQL thật và storage bền tạm; chạy migration, seed, API và web từ cùng SHA; thêm smoke qua HTTP và client sinh từ OpenAPI | Route, cookie/CSRF, transaction hoặc mapping DB có thể sai dù unit test qua | Log lệnh, SHA, phiên bản DB, request/response cho đăng nhập, quyền, việc, thư viện và nộp; kiểm lỗi 401/403/409/412 | **ĐẠT (Hoàn thành)** — `tests/e2e/http-smoke.spec.mjs`, hồ sơ tại `review/i1-http-smoke-evidence.md` |
| I-2 | Chạy 12 VT và QA-01–14 trên luồng thật; kiểm thao tác đồng thời và lỗi giữa chừng, gồm nộp mất phản hồi, quota/GC và URL preview | Thành công giả, ghi trùng hoặc lộ dữ liệu trong lúc cạnh tranh | Kết quả từng mã, trạng thái DB/bytes sau lỗi và test tự động lặp lại được | **ĐẠT (Hoàn thành)** — `tests/e2e/qa-real-flow.spec.mjs`, hồ sơ tại `review/i2-real-flow-qa-evidence.md` |
| I-3 | Chạy giao diện trên desktop/mobile hoặc thiết bị kiểm thử được nêu; kiểm focus, keyboard, reduced motion và phản hồi cũ sau đổi workspace | Dữ liệu cũ còn hiển thị hoặc thao tác sai ngữ cảnh | Môi trường thiết bị, bước chạy và ảnh/log kết quả | **ĐẠT (Hoàn thành)** — `tests/e2e/web-interactions.spec.mjs`, hồ sơ tại `review/i3-web-interactions-evidence.md` |
| I-4 | Đo p95 với tập dữ liệu/độ đồng thời trong `docs/quality/README.md`; sao lưu và phục hồi metadata **cùng bytes**, đối soát mọi revision nộp | Không biết tải thực hoặc có thể mất bản nộp sau restore | Script, cấu hình máy, số đo, checksum/đối soát và thời gian phục hồi | **ĐẠT (Hoàn thành)** — `p95 = 185.39ms` (target ≤ 1.000ms), phục hồi 100% SHA-256 (`tests/e2e/benchmark-and-recovery.spec.mjs`), hồ sơ tại `review/i4-performance-recovery-evidence.md` |
| I-5 | Thêm các kiểm tra trên vào CI hoặc ghi rõ gate thủ công bắt buộc; cập nhật báo cáo #36 và trạng thái issue theo đúng bằng chứng | Head mới có thể vượt qua CI chỉ với Foundation | Workflow hoặc biên bản kiểm trên đúng SHA; chỉ đóng #36 khi các cổng cần thiết qua | **ĐẠT (Hoàn thành)** — Đã tích hợp 39 test E2E vào `.github/workflows/foundation.yml` chạy trên PostgreSQL 17.7 container; cập nhật hồ sơ đóng cổng #36 |

**Phản biện và lựa chọn:** 13 bài service hiện tại hữu ích để bắt lỗi quy tắc, nhưng tên `e2e` và tỷ lệ 100% dễ tạo nhận định rằng hệ thống đã chạy xuyên lớp. Giữ các bài đó làm lớp kiểm nhanh; thêm lớp kiểm thật theo I-1–I-4 và báo cáo riêng từng lớp. Nếu môi trường thật chưa có, ghi phần đã chạy bằng dữ liệu giả và giữ pilot bị chặn theo ENV-01–06. Không tự đặt máy chủ, chi phí hoặc kết quả đo.
