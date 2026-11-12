# Tích hợp giao diện 14 trường hợp — 2026-11-13

Nguồn đối chiếu được chủ sản phẩm xác nhận: `stash@{0}` ngày 11/11 và ảnh `.git/preview-14-screens/tab-01.png` đến `tab-14.png`. Phần mã chạy dùng nhánh v2; không lấy dữ liệu mẫu trong preview làm dữ liệu nghiệp vụ. Môi trường kiểm: Windows PowerShell, Node 22, npm 11, Docker Compose tại `http://localhost:8080`. Head gốc: `4ebaf8e432aaedf9de0fba8185c8ed2ce1ce5f57`.

## Phạm vi tích hợp

| Tab | Giao diện chạy với dữ liệu thật | Giới hạn so với ảnh mẫu |
| --- | --- | --- |
| 01 Thành viên lớp / giáo viên | Danh bạ, lời mời, yêu cầu, mã lớp và thống kê; mã lớp đọc lại từ API sau chuyển màn | Hợp đồng Account không có tên/email |
| 02 Thành viên lớp / học sinh | Thẻ tư cách, giáo viên/lớp trưởng, tìm/lọc nhóm, sao chép mã tài khoản | Không có email hay ảnh đại diện từ API |
| 03 Nhóm trong lớp / giáo viên | Số nhóm, số học sinh đã/chưa phân nhóm, trưởng nhóm, tìm/lọc và vào workspace | Không có sức chứa nhóm, đề tài, tiến độ bài nộp tổng hợp trong contract |
| 04 Nhóm trong lớp / học sinh | Nhóm của bạn, thành viên, lời mời, nhóm khác, xin vào/rời nhóm theo API | Không có sức chứa nhóm; quyền tạo/xin vào được chốt ở server |
| 05 Cài đặt lớp | Mã mời hiện hành, đổi/khóa mã, thông tin lớp và chính sách, lưu trữ | Không có mã học phần, học kỳ, mô tả hoặc sĩ số tối thiểu/tối đa trong contract |
| 06 Thành viên nhóm / trưởng nhóm | Sĩ số, công việc được giao đã hoàn thành, yêu cầu chờ, mời/xử lý thành viên | Không có hiện diện, ngày vào hay chuyên môn trong contract |
| 07 Thành viên nhóm / thành viên | Trưởng nhóm, công việc của bản thân, danh bạ và lối tắt Gantt/Thư viện | Không có hiện diện hay chuyên môn trong contract |
| 08 Gantt | Giữ giao diện đã được chấp nhận, dùng danh sách việc và checklist API | — |
| 09 List/checklist | Bộ lọc hôm nay/quá hạn/ưu tiên/đã xong/chưa có mốc; checklist đọc/ghi API với version Task | Dịch vụ Task hiện còn lưu trong bộ nhớ tiến trình; cần lưu DB để giữ qua lần khởi động API |
| 10 Lịch | Lịch và chi tiết sự kiện dùng API; nhãn kỹ thuật được bỏ khỏi UI | — |
| 11 Thư viện | Cây thư mục, mục, chi tiết, phiên bản; xóa cache cũ khi tải lỗi; tiêu đề mục được lưu bằng Prisma | Dung lượng không hiển thị số giả nếu API lỗi |
| 12 Bài giao / giáo viên | Tải danh sách nhóm thật cho form giao bài; ánh xạ tên nhóm và tính nguồn công việc/checklist từ API; lịch sử bản nộp, nhận xét | Điểm số trong preview nằm ngoài phát hành đầu theo ASG-09 |
| 13 Bài giao / học sinh | Nộp/sửa theo phiên bản, cập nhật tiến độ, lịch sử và phản hồi | Điểm số trong preview nằm ngoài phát hành đầu theo ASG-09 |
| 14 Ghi chú | Tạo/xem/chuyển thùng rác qua thư viện văn bản; tiêu đề được lưu bền sau tải lại | Ghim ghi chú chưa có contract lưu bền, không dùng trạng thái giả tại client |

**Tác động hợp đồng và schema:** Thêm `GET /classes/{classId}/join-code` chỉ cho chủ lớp và `GET /tasks/{taskId}/checklist-items` theo `task.read`. Đã cập nhật generator OpenAPI, YAML sinh ra, types, API controller, web client và tài liệu contract cùng lần. Thêm cột `LibraryItem.title` nullable bằng migration `20261113120000_library_item_title` và cập nhật Prisma adapter đọc/ghi; dữ liệu cũ không bị thay đổi, tiêu đề cũ chưa có vẫn là `null`.

## Kết quả kiểm

- `python tools/build_openapi.py`, `npm run contract:generate`, `npm run contract:validate`: PASS, 109 operations và 997 refs.
- `npm run build -w @snote/api`, `npm run build -w @snote/web`: PASS.
- `$env:DATABASE_URL='postgresql://x:x@localhost:5432/x'; npx prisma validate --schema apps/api/prisma/schema.prisma`: PASS (chỉ kiểm schema, không kết nối DB).
- `node --test apps/api/dist/modules/classes/join-code.spec.js apps/api/dist/modules/tasks/tasks.spec.js apps/api/dist/modules/library/library-service.spec.js`: 19/19 PASS.
- `node --test apps/web/src/features/tasks/tasks.spec.ts apps/web/src/features/assignments/assignments.spec.ts apps/web/src/features/calendar/calendar.spec.ts`: 20/20 PASS.
- `node --test tests/e2e/web-interactions.spec.mjs tests/e2e/account-usage-selection.spec.mjs`: 14/14 PASS.
- `npm run contract:http`: PASS.
- `git diff --check`: PASS.
- QA ảnh trên stack cô lập `snote-qa-14` tại `localhost:8081`: đã đăng nhập và chụp đủ 14 trường hợp qua giao diện thật với ba tài khoản vai trò khác nhau. Sau khi áp migration, kiểm qua API xác nhận tiêu đề ghi chú vẫn còn sau khi đọc lại; checklist GET trả mục vừa tạo; mã mời hiện trên cả tab 05 và tab 01; form giao bài có nhóm thật. Ảnh QA ở `%LOCALAPPDATA%/Temp/snote-qa-14-screens/tab-01.png` đến `tab-14.png`.

`VERIFIED`: build, contract, các kiểm nêu trên, HTTP 200/ready trên host 8080 và thao tác vào đủ 14 màn trên stack QA riêng. `INFERRED`: cách ánh xạ chi tiết thị giác từ preview sang dữ liệu v2 theo các giới hạn trên. `UNKNOWN`: mức khớp pixel tuyệt đối với dữ liệu trong ảnh demo. Không suy ra ca kiểm đã đạt chỉ từ mô tả trong `docs/quality/`.
