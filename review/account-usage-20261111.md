# Đơn giản hóa cách dùng tài khoản — 2026-11-11

| Trường | Giá trị |
| --- | --- |
| Nguồn | SRC-31; giữ ACC-02/03/05 và STR-03 |
| Nhánh | `feat/simplify-account-usage`, từ `bad6e4e9eab59f073311d1880bea042756b16e8f` |
| Môi trường | Windows, Node 24.15.0, npm 11, Vite 7.2.2, PostgreSQL `snote_test` cho ca web có HTTP |

**VERIFIED:** Form đăng ký và Cài đặt tài khoản chỉ đưa ra hai nhu cầu lớp học. Client gửi `personal` nếu không chọn; gửi `student`, `teacher` hoặc cả hai nếu có chọn. Workspace cá nhân vẫn do server tạo cho mọi tài khoản. API vẫn nhận các tổ hợp cũ. Cài đặt cập nhật bản ghi tài khoản hiện có với `usages` và `version` trả về để không mất các trường khác của tài khoản.

**VERIFIED (lệnh):** `npm.cmd run build` đạt; `node --test tests/e2e/account-usage-selection.spec.mjs tests/e2e/web-interactions.spec.mjs` đạt 14/14; `npm.cmd run test -w @snote/api` đạt 3/3; `git diff --check` đạt. Các phép kiểm này không chứng minh giao diện đã được đo trực quan trong trình duyệt ở mọi kích thước.

**INFERRED:** Cách hỏi mới giảm nhầm lẫn giữa nhu cầu sử dụng lớp và workspace cá nhân luôn có sẵn. Đây là thay đổi UX được chủ sản phẩm đồng ý ở SRC-31, không thay ma trận quyền theo đối tượng.
