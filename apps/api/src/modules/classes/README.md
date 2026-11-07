# API-A #29 — lát cắt quyền và tư cách

Nguồn: `docs/requirements/{accounts-and-workspaces,class-membership,permissions,permission-matrix,structural-rules}.md`, `docs/contracts/openapi.yaml`, issue #29, SRC-26/27. Không dùng nguồn v1.

Theo chỉ đạo tiếp tục phần khác trong lúc GitHub Actions bị khóa thanh toán, nhánh này được chuẩn bị trước từ Foundation `63a1ae7`. Đây là ngoại lệ **làm trước**, chưa thay cổng merge Foundation hoặc nghiệm thu PostgreSQL. Cần cập nhật từ Foundation đã merge trước khi ghép tính năng. Entry type trong `packages/contracts/package.json` được sửa ở Foundation commit `9faaad4`, đồng bộ sang nhánh này qua commit `3e72e11`.

## Đã triển khai

- `identity/AccountService`: kiểm danh mục cách dùng, cập nhật nguyên tử cùng version và audit; không đổi quyền chủ lớp cũ khi tắt Teacher (ACC-01/03, STR-02/03).
- `ClassService`: tạo lớp cần Teacher hiện hành; khóa Account chung với cập nhật usages. Chủ lớp lưu trữ/khôi phục lớp, lưu lịch sử, vô hiệu lời mời cũ; yêu cầu chờ chỉ được kích hoạt bởi lượt duyệt mới (CLS-01/14, STR-08).
- `AdmissionService` và `PrismaAdmissionStore`: chấp nhận lời mời/duyệt yêu cầu, Member ban đầu, kiểm tư cách lớp, giới hạn nhóm, thời hạn và trạng thái lưu trữ tại giao dịch. Kích hoạt, vô hiệu lời mời khác và audit cùng giao dịch (CLS-02/03/05–07/11/13, STR-04/07–09).
- `GroupLifecycle`: chủ lớp lưu trữ/khôi phục nhóm; kiểm mọi thành viên trước khi khôi phục. Một người mất tư cách hoặc đạt giới hạn giữ cả nhóm trong trạng thái lưu trữ (STR-09).
- `authorization/ScopedAuthorization`: quyết định theo action/scope, hợp các vai trò còn hiệu lực, cấp riêng; riêng tư và lưu trữ chặn quyền chung. Manager không mặc nhiên Nộp; tắt quyền Monitor không xóa quyền Leader (PM-01–24).
- `authorization/PrismaPolicyReader`: đọc tư cách/quyền hiện tại từ transaction do module gọi cung cấp. Khi Nộp/cập nhật tiến độ, truyền **recipientId thực tế** để chỉ xét Leader/Member trong nhóm nhận ấy; kiểm recipient thuộc đúng assignment.

## Cách dùng và ranh giới tích hợp

Các `index.ts` là lối import công khai. `new AdmissionService(new PrismaAdmissionStore(db))` cung cấp `acceptInvitation` và `approveRequest`. Các service Prisma khác nhận `PrismaClient` qua constructor.

Module ghi dữ liệu phải tạo `new ScopedAuthorization(new PrismaPolicyReader(tx, recipientId))` **trong cùng transaction ghi**, rồi dùng `requireAction` của core. Không giữ cache quyết định quyền. Scope-only reader không cấp quyền dựa trên creator/assignee: module sở hữu đối tượng phải đọc actor/owner/assignee từ DB, kiểm scope khớp và gọi `allows` với facts tương ứng. Dữ liệu riêng dùng endpoint kiểm owner, không dùng action của nội dung chung.

Mọi thao tác thay đổi tư cách nhóm, groupLimit, lưu trữ/khôi phục hoặc quyền duyệt phải khóa row Class bằng `SELECT ... FOR UPDATE` trước khi kiểm/ghi. Admission sử dụng ReadCommitted để lần đếm sau khi nhận khóa thấy commit của người giữ khóa trước. Không đọc điều kiện cạnh tranh bên ngoài transaction. Khi thêm luồng rời/bàn giao phải tuân cùng thứ tự khóa. Core không tự bảo đảm atomicity giữa một quyết định quyền ngoài transaction và lần ghi sau đó.

Hiện đây là service và adapter backend; chưa đăng ký controller vào shell `main.ts`. Chưa có luồng HTTP đăng ký/đăng nhập, tạo workspace/nhóm, tạo lời mời/mã lớp, bàn giao, quản lý policy/grant. Không coi #29 hoàn tất hoặc đã chạy luồng người dùng thật. Cần Foundation bổ sung/khóa cách lưu tên workspace và mã lớp trước hai luồng tương ứng; schema hiện tại chưa có các trường đó. Không sửa schema hoặc đặt payload khác OpenAPI tại nhánh API-A.

## Rủi ro và phép kiểm

| Nguồn / tình huống | Rủi ro | Thiết kế và kết quả cần chứng minh |
| --- | --- | --- |
| EC-09 / hai lượt duyệt nhóm | Vượt groupLimit | Khóa Class trước đếm; test service với store giao dịch đã đạt, cần QA-02 trên PostgreSQL thật với hai kết nối |
| EC-11 / restore một nhóm nhiều người | Khôi phục một phần hoặc vượt giới hạn | Kiểm hết thành viên rồi mới đổi status; cần kiểm rollback và audit trên DB thật |
| PM-01/05 / kiêm vai trò, thu hồi | Quyền cũ tồn tại ngoài phạm vi | Đọc facts mới mỗi lần, hợp quyền đúng scope rồi chặn tư cách/lưu trữ/riêng tư; test policy đã đạt |
| STR-08 / archive rồi restore | Lời mời cũ tự hồi sinh | Archive vô hiệu lời mời; giữ yêu cầu để duyệt lại rõ ràng. Restore không chấp nhận/duyệt tự động |
| Ghi membership xong, audit lỗi | Thay đổi nghiệp vụ thiếu dấu vết | Cùng transaction rollback; test service đã đạt, PostgreSQL còn cần kiểm |

Đánh đổi: khóa theo cả lớp dễ kiểm đúng cho bản đầu nhưng tuần tự hóa lượt duyệt trong cùng lớp; chỉ đổi sang khóa hẹp hơn sau khi có phép đo và kiểm được restore nhiều người cùng policy. Không có số liệu throughput thực.

## Kiểm tại máy

Từ gốc worktree: `npm ci`, `npm --workspace @snote/api run prisma:generate`, `npm --workspace @snote/api run build`, rồi `node --test apps/api/dist/modules/authorization/policy.spec.js apps/api/dist/modules/classes/admission.spec.js apps/api/dist/modules/workspaces/group-lifecycle.spec.js apps/api/dist/modules/identity/account-service.spec.js`.

22 ca module và 3 ca core đã qua trên Node 24.15.0/Windows. Các test cạnh tranh dùng store giao dịch trong bộ nhớ, **chưa chứng minh khóa/ràng buộc PostgreSQL**. Script test Foundation hiện chỉ chọn `dist/core/*.spec.js`; cần chủ Foundation đưa test module vào cổng CI khi tích hợp.
