# Bảng điều phối công việc SNOTE v2

| Thuộc tính | Giá trị |
| --- | --- |
| Phạm vi | Chỉ `s_note_v2` và các nhánh tách từ đó; không dùng nguồn SNOTE v1 |
| Loại tài liệu | Bảng điều phối thực thi, không thay đặc tả trong `docs/` hoặc trạng thái issue/PR trên GitHub |
| Cập nhật | 2026-11-08; kiểm lại PR/commit trước khi dùng bảng trạng thái |
| Nguồn | [Kế hoạch](IMPLEMENTATION_PLAN.md), [luật worktree](WORKTREES.md), [OpenAPI](docs/contracts/openapi.yaml), issues #28–36 và yêu cầu chia tính năng API + UI của chủ sản phẩm |

## Thư mục và nhánh

Tất cả worktree là **thư mục anh em của `SNOTE`**, không nằm trong `SNOTE`. `SNOTE` chỉ là checkout tích hợp `s_note_v2`; không coding tính năng trực tiếp ở đây.

| Thư mục bên cạnh `SNOTE` | Nhánh | Vai trò | Trạng thái 2026-11-08 |
| --- | --- | --- | --- |
| `snote-v2-worktree-layout` | `docs/v2/fullstack-worktrees` | Kế hoạch, sở hữu tệp, bảng điều phối | PR #41 đã merge thành `54d06f68`; worktree sạch đã được gỡ |
| `snote-v2-foundation` | `feat/v2/foundation` | Contract, schema/migration, core và build chung #28 | PR #39 đã merge vào `s_note_v2` tại `bc8e6ff`; hoàn tất F1–F6 và AA-F01–09; worktree đã gỡ |
| `snote-v2-api-a` | `feat/v2/api-a` | Lát cắt Ngữ cảnh #29, gồm phần UI #33/#34 | PR #40 đã merge tại `1488c00`; worktree không còn trong `git worktree list` ngày 2026-11-08 |
| `snote-v2-planning` | `feat/v2/planning` | Công việc/Lịch #31 + UI việc/lịch #34 | PR #44 và PR #46 (P0 auth/CSRF/deny-by-default) đã MERGE vào `s_note_v2`; pass 16 API tests; hoàn tất |
| `snote-v2-library` | `feat/v2/library` | Thư viện #35 + UI #30 | PR #43 và PR #48 (P0 auth/CSRF/deny-by-default) đã MERGE vào `s_note_v2`; pass 19 API tests; hoàn tất |
| `snote-v2-assignments` | `feat/v2/assignments` | Bài giao/Nộp #32 + UI bài giao #33 | PR #42 và PR #47 (P0 auth/CSRF/DI AppModule) đã MERGE vào `s_note_v2`; pass 23 API tests; hoàn tất |
| `snote-v2-integration` | `feat/v2/integration` | E2E, tải, backup/restore #36 | PR #49 (I-1), PR #50 (I-2), PR #51 (I-3), PR #52 (I-4, I-5) đã MERGE vào `s_note_v2`; 39/39 E2E tests pass 100%; hoàn tất |

`snote-v2-worktree-layout` là thư mục tạm đã gỡ sau khi PR tài liệu merge và checkout sạch; hàng trên giữ dấu vết, không chỉ dẫn tạo lại. Không tạo worktree Ngữ cảnh thứ hai cho phạm vi PR #40 đã merge. Không xóa/sửa các tệp chưa commit ở bất kỳ worktree nào.

## Việc làm được ngay

| Mã | Việc và nơi làm | Kết quả cần ghi | Trạng thái |
| --- | --- | --- | --- |
| N1 — xong | Chốt nội dung PR #41 trong `snote-v2-worktree-layout`: rà tên thư mục, bảng owner, liên kết, `git diff --check` | Đã merge vào `s_note_v2` tại `54d06f68` | HOÀN THÀNH |
| N2 — xong | Hoàn thiện #28 trong `snote-v2-foundation`: sửa khoảng trống contract/schema có bằng chứng, sinh lại client, kiểm diff sinh ổn định | Đã merge vào `s_note_v2` tại `bc8e6ff` (PR #39); pass F1–F6 và AA-F01–09 | HOÀN THÀNH |
| N3 — xong | Chạy migration DB trắng, reset/migrate và kiểm constraint thật cho #28; chạy lại ở mỗi head đổi schema | PostgreSQL migration đạt, Prisma schema ổn định | HOÀN THÀNH |
| N4 — xong | Rà ma trận quyền, ca đồng thời/lỗi giữa chừng và khoảng trống đầu vào #29–35 trong `review/` | Toàn bộ 78 API unit/integration tests bao phủ đầy đủ QA-01–14 | HOÀN THÀNH |
| N5 — xong phần giả lập | Chuẩn bị checklist tích hợp #36 từ QA-01–14 và `review/unresolved.md`; chạy VT-01–VT-12 ở mức service | PR #45 đã merge; 13/13 bài service giả lập qua. [Báo cáo gốc](review/e2e-integration-audit.md) có đính chính | HOÀN THÀNH PHẦN GIẢ LẬP |
| N6 — xong | Thực hiện I-1–I-5 theo [rà lại cổng #36](review/integration-gate-reassessment.md) trong vùng sở hữu integration | I-1 đến I-5 hoàn tất qua PR #49, #50, #51, #52; 39/39 E2E tests pass trên PostgreSQL thật và CI | HOÀN THÀNH |
| N7 — xong | Trả [lỗi danh tính/quyền và lưu trữ](review/integration-gate-reassessment.md) về owner #31/#35/#32; sửa DI và deny-by-default | PR #46, #47, #48 đã merge; 95 API tests pass; AppModule bootstrap thành công 100% | HOÀN THÀNH |
| N8 — đang chạy | Chiến dịch nâng cấp UI/UX toàn diện theo [skill-driven-ui-guide.md](docs/ux/skill-driven-ui-guide.md) trên 4 worktree chuyên trách | Đã nghiệm thu và merge 3/4 PR: #60 (Assignments UI), #59 (Library UI), #58 (Planning UI) vào `s_note_v2`; đang chạy mũi cuối cùng trên `ui-review` (Shell/Navigation/A11y) | 75% HOÀN THÀNH (ĐANG CHẠY MŨI 4) |

## Việc phải chờ tín hiệu

| Mã | Việc | Tín hiệu bắt đầu hoặc nối thật | Trạng thái |
| --- | --- | --- | --- |
| G1 — xong | Tạo ba worktree `planning`, `library`, `assignments` từ `origin/s_note_v2`; cập nhật `api-a` từ cùng mốc | Đã hoàn thành tại `bc8e6ff`; cả ba worktree đã tạo, `api-a` đã rebase và cập nhật | HOÀN THÀNH |
| G2 — xong | Hoàn thiện Ngữ cảnh #29 API → UI và merge PR #40 | PR #40 đã merge vào `s_note_v2` tại `1488c00` | HOÀN THÀNH |
| G3 — xong | Nối quyền/tư cách thật trong Công việc/Lịch #31, Thư viện #35 và Bài giao/Nộp #32 | Đã nối vào `AppModule` NestJS tại commit `ae2f0d0` | HOÀN THÀNH |
| G4 — xong | Nối UI ba lát cắt vào router/menu/shared shell | Đã nối toàn bộ 4 feature containers vào `apps/web/src/app/App.tsx` tại commit `ae2f0d0` | HOÀN THÀNH |
| G5 — xong | Nối verified blob/quota/reference thật vào Bài giao/Nộp | Public interface Thư viện và StoragePort adapter đã hoạt động thông suốt | HOÀN THÀNH |
| G6 — xong | Nối tiến độ việc/mốc lịch thật vào Bài giao/Nộp nếu luồng bài giao dùng chúng | Hợp đồng công việc/lịch đã liên kết | HOÀN THÀNH |
| G7 — xong | Merge từng PR lát cắt | Cả 4 PR lát cắt #40, #44, #42, #43 đã merge vào `s_note_v2` sạch sẽ | HOÀN THÀNH |
| G8 — xong | Hoàn tất cổng tích hợp #36 theo [kế hoạch rà lại](review/integration-gate-reassessment.md) | Toàn bộ 5 hạng mục I-1 đến I-5 đạt 100%; p95 = 174.49ms ≤ 1.000ms; restore 100% SHA-256; CI tự động 39 tests | HOÀN THÀNH |
| G9 — chờ | Quyết định pilot/phát hành | Chỉ xét sau G8 và giá trị môi trường thực tế ENV-01–06 | CHỜ G8 VÀ ENV |

**Trong khi chờ G2–G6:** owner được xây module và UI trong đường dẫn riêng bằng fixture/stub cùng schema OpenAPI, viết test quyền/lỗi/đồng thời và tài liệu bàn giao. Khi upstream công bố SHA, cập nhật nhánh, thay stub, chạy lại test; chỉ sau đó mới tính G7. Nếu cần đổi OpenAPI/schema, tạo yêu cầu có payload cũ/mới, owner Foundation sửa generator/migration/client; nếu cần đổi shell, owner Ngữ cảnh sửa. Không sửa chéo đường dẫn.

## Tín hiệu từ con người và bên ngoài

Không cần lệnh mới của chủ sản phẩm cho việc code, phân tích hoặc kiểm thử đã nằm trong kế hoạch. Chỉ chuyển phần thực sự phụ thuộc ra ngoài thành tín hiệu rõ:

| Tín hiệu | Nguồn | Cách xử lý trong lúc chờ |
| --- | --- | --- |
| Review/merge PR #41, #39 và PR tính năng | Reviewer/quy trình GitHub theo [kế hoạch](IMPLEMENTATION_PLAN.md) | Hoàn tất bằng chứng và sửa phản hồi review; làm việc độc lập ở N2–N5 |
| GitHub Actions trên head mới | Trạng thái check của PR #39/#40 | Actions đã chạy lại; theo dõi kết quả của đúng SHA, dùng PostgreSQL cách ly để lặp lỗi nếu cần |
| Máy chủ, lưu trữ, chi phí, nhóm thử, email reset, kết quả backup/thiết bị thật | Người vận hành/chủ sản phẩm và phép đo thực; [ENV-01–06](review/unresolved.md) | Xây/test với dữ liệu giả, giữ pilot ở trạng thái chờ; không tự điền số hoặc provider |
| Quyết định nghiệp vụ còn mâu thuẫn sau khi tra nguồn v2 | Chủ sản phẩm hoặc SRC-27 nếu nằm trong quyền tự quyết thiết kế | Ghi `review/unresolved.md` với phương án/kiểm chứng; tiếp tục phần không phụ thuộc |

Khi trạng thái GitHub hoặc máy cục bộ thay đổi, cập nhật **hàng trạng thái và SHA**, không viết lại đặc tả nghiệp vụ. Issue/PR là nguồn tiến độ cuối cùng; bảng này là bản đồ để chọn đúng việc tiếp theo.
