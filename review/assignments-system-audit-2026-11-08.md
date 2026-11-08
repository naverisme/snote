# Rà hệ thống Bài giao/Nộp #32 trước thiết kế lại UI

| Trường | Giá trị |
| --- | --- |
| Nhánh/SHA kiểm | `feat/v2/assignments` / `e454b0c9200a83760f389fd41c6b772f95485ec1` |
| Task | `TASK-20261108-205635`; issue #32 và phần Bài giao của #33 |
| Nguồn v2 | `docs/requirements/assignments-and-submissions.md` (ASG-03–18), `docs/requirements/structural-rules.md` (STR-16), `docs/contracts/README.md`, `docs/quality/README.md` (QA-08/09/13), `review/system-redesign-readiness.md` tại checkout `s_note_v2` SHA `bdc1df38` |
| Giới hạn | Đọc mã và chạy build/test giả lập tại head trên; chưa chạy phép cạnh tranh, lỗi kho tệp và mất mạng trên PostgreSQL/browser thật. Không xác nhận cổng UI đã qua. |

## Đường chạy và kết quả

`StudentSubmissionForm` → `AssignmentFeature.handleSubmitApi` → `api.submitWork` → `SubmissionController.submit` (session/CSRF) → `SubmissionService.submit` → `SubmissionAuthService` → Prisma `SubmissionRevision`, `SubmissionAttachment`, `OperationReceipt`, `OutboxEvent`.

- `npm run build -w apps/api`: đạt.
- `npm run build -w apps/web`: đạt; Vite chỉ cảnh báo `use client` của Lucide bị bỏ qua.
- `node --test apps/api/dist/modules/assignments/*.spec.js apps/api/dist/modules/submissions/*.spec.js apps/api/dist/modules/notifications/*.spec.js`: 24/24 đạt. Các ca gửi, hạn và receipt dùng mock transaction; chưa là bằng chứng cạnh tranh DB.
- CSRF: controller dùng `requireAuthAndCsrf` cho gửi, nhận xét và tiến độ; test controller xác nhận từ chối CSRF giả. Mức này đạt ở đường HTTP controller, chưa kiểm refresh session trên browser.
- Revision/notification: một lần gửi thành công ghi revision, receipt và outbox trong cùng callback `$transaction`; test mock đạt. Chưa kiểm worker giao thông báo, quyền khi mở đích và rollback DB thật.

## Sai lệch và lựa chọn sửa

| Mã/mức | Quan sát tại SHA kiểm | Hậu quả và phản biện | Sửa trong vùng sở hữu/phụ thuộc; kiểm chứng mong đợi |
| --- | --- | --- | --- |
| A32-01 / P0 | `SubmissionService.submit` kiểm quyền, revision, class policy và lấy `now` **trước** `$transaction`; bên trong chỉ đọc lại revision khi đã có bản trước. Bản đầu không có kiểm cạnh tranh trước create. `AssignmentRecipient.update` ghi `version: recipient.version + 1` theo giá trị cũ. | Thu hồi quyền hoặc đổi hạn trong lúc ghi vẫn có thể chốt theo dữ kiện cũ. Hai bản đầu đồng thời cùng chọn version 1; unique DB làm một request lỗi 500 thay vì 412/409 có nghĩa. Kiểm revision lại trong transaction vẫn chưa khóa hàng nên không đủ. | Owner #32 cần giao dịch serializable hoặc khóa/CAS hàng recipient, đọc lại quyền/hạn tại điểm chốt, map xung đột unique/serialization sang 412/409. Nếu cần sửa schema/core, chuyển owner #28 và xin duyệt theo ma trận. Kiểm bằng hai HTTP request đồng thời trên PostgreSQL và đổi quyền/hạn có barrier trước commit. |
| A32-02 / P0 | `SubmissionService.submit` ghi thẳng `input.uploadIds` thành `SubmissionAttachment.blobId`; không tra staging/blob `verified`, actor/scope, không thêm `QuotaReference` hoặc commit reservation. `SubmissionAttachment` chỉ có UUID, không có FK tới `Blob`. | UUID tùy ý có thể thành bản nộp thành công dù bytes không tồn tại; GC/quota không thấy ref. Chỉ kiểm tệp ở UI không giải quyết server. | Owner #32 phối hợp public interface #35 để kiểm verified blob, quyền/scope, quota/ref trong cùng đơn vị commit và dọn staging khi lỗi. Schema/FK nếu cần thuộc #28. Kiểm blob thiếu, khác actor/scope, vượt quota, rollback metadata/ref và GC sau nộp. |
| A32-03 / P0 | `StudentSubmissionForm.handleFilesSelected` chỉ tạo ID `blob-<filename>-<time>` từ `File`; không gửi bytes lên upload API. Form còn cho nhập blob ID thô. | Chọn tệp tạo cảm giác đã đính kèm, nhưng backend có thể nhận ID giả; kết hợp A32-02 gây thành công giả, trái ASG-16/17. | Owner UI #32 nối upload staging → verified thật từ #35, chỉ cho gửi ID đã xác minh; bỏ trường nhập ID thô trong luồng người dùng. Kiểm file thật đọc lại được sau restart và lỗi upload không tạo revision. |
| A32-04 / P0 | Form tạo `Idempotency-Key` mới ở mỗi lần nhấn gửi; lỗi fetch không giữ key/body để hỏi `/operations/by-key/{key}` hoặc retry cùng key. UI báo lỗi thường sau phản hồi mất, dù commit có thể đã thành công. | Người dùng nhấn lại tạo revision mới hoặc gặp 412; không biết kết quả lần trước. Receipt backend có hỗ trợ replay cùng key/body nhưng UI chưa dùng. | Owner UI #32 giữ một intent/key/body qua trạng thái “đang xác nhận/chưa rõ kết quả”, tra receipt bằng quyền hiện hành hoặc retry cùng key; chỉ báo thành công khi có receipt committed. Kiểm chặn response sau commit rồi tải lại browser. |
| A32-05 / P1 | `calculateCivilDeadline` bỏ qua tham số `timeZone`, trả 23:59:59.999 UTC cho ngày `YYYY-MM-DD`. | Hạn chỉ ngày ở lớp `Asia/Ho_Chi_Minh` sẽ mở thêm 7 giờ so với cuối ngày địa phương; test hiện tại chỉ kiểm các phần UTC, nên chưa bắt lỗi. | Owner #32 chuyển ngày dân sự theo IANA zone sang thời điểm UTC, kiểm cả DST, zone không hợp lệ và giây cuối ngày. Không tự giả múi giờ khi dữ liệu sai. |
| A32-06 / P0 | `AssignmentService.listAssignments` đọc theo `classId` mà không gọi auth; `AssignmentService.listRecipients` chỉ gọi `requireCanViewAssignment`, sau đó trả mọi nhóm. `AssignmentAuthService.requireCanViewAssignment` cho bất kỳ thành viên lớp xem bài và một thành viên workspace được xem nếu nằm trong một recipient bất kỳ. | Có thể lộ tiêu đề/danh sách nhóm và `progressText`/`submissionVersion` của nhóm khác, trái ASG-11 và quyền đọc theo scope. | Owner #32 lọc theo action/scope trước phân trang và trước trả recipient; giáo viên hoặc grant riêng mới xem nhóm khác. Kiểm thành viên lớp không nhận bài, thành viên nhóm A không đọc tiến độ nhóm B qua list/detail và không lộ số đếm. |
| A32-07 / P1 | `SubmissionAuthService.requireCanSubmit` cho `workspace.ownerId` hoặc grant hành động nhưng không xác nhận grant holder là thành viên còn hiệu lực; không kiểm lớp đã archived hay assignment còn nhận gửi. `addFeedback` kiểm quyền trước transaction. | Quyền gửi/nhận xét có thể tồn tại sau khi rời nhóm hoặc lớp ngừng hoạt động, và đổi quyền trong lúc ghi có thể lọt. Cần đối chiếu PM về grant còn hiệu lực trước khi chốt cách xử lý owner. | Owner #32 dùng API quyền hiện hành #29 ngay tại commit, kiểm trạng thái lớp/assignment; test thu hồi membership/grant trong khi gửi và sau archive. |

## Quyết định tiếp theo

Các lỗi A32-01–04 và A32-06 là cổng P0 trước khi dùng UI làm bằng chứng nghiệp vụ. Ưu tiên sửa đường gửi/receipt/tệp và quyền đọc trong phạm vi #32, đồng thời yêu cầu owner #35/#28 cung cấp interface/ref/constraint cần thiết. Phương án chỉ vá UI hoặc thêm test mock không chặn được sai lệch DB/storage. Giữ bản brief thiết kế lại UI ở trạng thái chuẩn bị cho đến khi ca PostgreSQL/browser trên cùng SHA đạt và nguồn dữ liệu thật được xác nhận; ENV-01–06 vẫn mở theo `review/unresolved.md`.
