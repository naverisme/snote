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
| `snote-v2-foundation` | `feat/v2/foundation` | Contract, schema/migration, core và build chung #28 | PR #39 draft; PostgreSQL 17.7 CI đạt trên `bf26488`, PostgreSQL 18.6 cục bộ đạt; còn rà contract/server fixture và review |
| `snote-v2-api-a` | `feat/v2/api-a` | Lát cắt Ngữ cảnh #29, gồm phần UI #33/#34; giữ tên cũ để bảo toàn PR #40 | PR #40 draft; mới có service backend, chưa có luồng API → UI hoàn chỉnh |
| `snote-v2-planning` | `feat/v2/planning` | Công việc/Lịch #31 + UI việc/lịch #34 | Chưa tạo; chờ Foundation merge |
| `snote-v2-library` | `feat/v2/library` | Thư viện #35 + UI #30 | Chưa tạo; chờ Foundation merge |
| `snote-v2-assignments` | `feat/v2/assignments` | Bài giao/Nộp #32 + UI bài giao #33 | Chưa tạo; chờ Foundation merge |
| `snote-v2-integration` | `feat/v2/integration` | E2E, tải, backup/restore #36 | Chưa tạo; chờ bốn lát cắt merge để chạy cổng đầy đủ |

`snote-v2-worktree-layout` là thư mục tạm đã gỡ sau khi PR tài liệu merge và checkout sạch; hàng trên giữ dấu vết, không chỉ dẫn tạo lại. `snote-v2-api-a` là worktree Ngữ cảnh hiện có, không tạo worktree `context` thứ hai hoặc đổi tên nhánh khi PR #40 đang mở. Không xóa/sửa các tệp chưa commit ở bất kỳ worktree nào.

## Việc làm được ngay

| Mã | Việc và nơi làm | Kết quả cần ghi | Không cần đợi |
| --- | --- | --- | --- |
| N1 — xong | Chốt nội dung PR #41 trong `snote-v2-worktree-layout`: rà tên thư mục, bảng owner, liên kết, `git diff --check` | Đã merge vào `s_note_v2` tại `54d06f68` | Foundation, CI, môi trường PostgreSQL |
| N2 | Hoàn thiện #28 trong `snote-v2-foundation`: sửa khoảng trống contract/schema có bằng chứng, sinh lại client, kiểm diff sinh ổn định | SHA contract/schema, fixture client/server, kết quả validator/build/test | PR #41 merge hoặc API-A hoàn thành |
| N3 — vòng đầu đạt | Chạy migration DB trắng, reset/migrate và kiểm constraint thật cho #28; chạy lại ở mỗi head đổi schema | PostgreSQL 17.7 CI đạt tại `bf26488`; PostgreSQL 18.6 cục bộ đạt sau AA-F02; còn kiểm transaction nghiệp vụ theo lát cắt | Không cần lệnh mới; CI đã hoạt động lại |
| N4 | Rà ma trận quyền, ca đồng thời/lỗi giữa chừng và khoảng trống đầu vào #29–35 trong `review/` hoặc issue tương ứng; dựng fixture theo OpenAPI trong vùng sở hữu khi phù hợp | Yêu cầu thay contract gửi owner #28, bộ ca kiểm; không gọi là feature hoàn chỉnh | Foundation merge; không thêm route/type tạm trái hợp đồng |
| N5 | Chuẩn bị checklist tích hợp #36 từ QA-01–14 và `review/unresolved.md`; ghi rõ môi trường/đo đạc cần thu sau này | Danh sách phép kiểm và dữ liệu giả, không ghi kết quả chưa chạy | Bốn lát cắt merge |

**Tín hiệu hoàn tất N1:** PR #41 đã merge. **Tín hiệu hoàn tất Foundation:** PR #39 ghi bằng chứng F1–F6 trên **head hiện tại**, xử lý khoảng trống contract/schema cản feature và được merge; SHA merge là mốc gốc của các worktree tính năng. Kết quả CI của head cũ không thay thế CI cho head mới.

## Việc phải chờ tín hiệu

| Mã | Việc | Tín hiệu bắt đầu hoặc nối thật | Vì sao phải chờ |
| --- | --- | --- | --- |
| G1 | Tạo ba worktree `planning`, `library`, `assignments` từ `origin/s_note_v2`; cập nhật `api-a` từ cùng mốc | #39 đã merge, fetch được SHA Foundation trên `s_note_v2` | Tránh mỗi tính năng tự đặt schema/client/core khác nhau |
| G2 | Hoàn thiện Ngữ cảnh #29 API → UI và merge PR #40 | G1; contract/schema của #28 ổn định; public authorization/membership và shell được kiểm | Backend hiện chỉ là service chuẩn bị sớm; cần route, UI, PostgreSQL và QA thật |
| G3 | Nối quyền/tư cách thật trong Công việc/Lịch #31, Thư viện #35 và Bài giao/Nộp #32 | Public interface Ngữ cảnh có commit/SHA ổn định, lý tưởng đã merge | Không suy quyền từ role/UI hay đọc bảng riêng của Ngữ cảnh |
| G4 | Nối UI ba lát cắt vào router/menu/shared shell | Shell và giao diện public của Ngữ cảnh đã có commit/SHA ổn định | Tránh nhiều owner cùng sửa `apps/web/src/app` hoặc `shared` |
| G5 | Nối verified blob/quota/reference thật vào Bài giao/Nộp | Public interface Thư viện đã có commit/SHA ổn định, đã kiểm với bytes thật | Bản nộp không được chốt tệp staging hoặc quota chưa xác minh |
| G6 | Nối tiến độ việc/mốc lịch thật vào Bài giao/Nộp nếu luồng bài giao dùng chúng | Public interface Công việc/Lịch đã có commit/SHA ổn định | Không ghi trùng tiến độ hoặc tự suy trạng thái việc |
| G7 | Merge từng PR lát cắt | Dependency upstream đã cập nhật, stub đã thay bằng API thật, build/test/contract/QA tương ứng đạt, reviewer xác nhận vùng tệp | Không coi service unit test hay màn fixture là luồng hoàn chỉnh |
| G8 | Tạo/chạy cổng tích hợp đầy đủ #36 | G7 cho cả bốn lát cắt; checkout sạch từ `s_note_v2` | E2E, tải, quyền, quota và restore cần hệ thống thật ghép đủ |
| G9 | Quyết định pilot/phát hành | G8 có bằng chứng, P0 đã đóng; ENV-01–06 có dữ liệu môi trường và lựa chọn nhà cung cấp tương ứng | Không thể suy hạ tầng, chi phí, nhóm thử hay năng lực phục hồi từ mã |

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
