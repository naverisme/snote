# SNOTE v2 — Khái niệm sản phẩm

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Các khái niệm đã xác nhận trong cuộc trao đổi về SNOTE v2 |
| Trạng thái | Đã đối chiếu với quyết định trực tiếp của chủ sản phẩm trong phạm vi nêu dưới đây |
| Nguồn | [Hồ sơ nguồn](../../review/provenance.md), SRC-01 đến SRC-08; [PR #6](https://github.com/naverisme/snote/pull/6) |

SNOTE hướng tới học sinh, người dùng cá nhân và giáo viên. Một người có thể sử dụng nhiều workspace để tách công việc cá nhân, dự án và bài tập nhưng vẫn xem được việc và lịch liên quan trên phạm vi cá nhân. **AI Note** là nội dung cũ, không phải tên hay nguồn yêu cầu cho v2.

| Khái niệm | Ý nghĩa đã xác nhận |
| --- | --- |
| Cách dùng tài khoản | Khi đăng ký, người dùng tự chọn Người học, Giáo viên, Quản lý cá nhân; có thể chọn cả học và dạy trên cùng tài khoản, và đổi lựa chọn sau. Lựa chọn này điều chỉnh chức năng hiển thị. Quyền trong một lớp/workspace được xét theo vai trò và phạm vi của chính lớp/workspace đó. |
| Workspace cá nhân mặc định | Tự tạo lúc đăng ký cho mọi tài khoản, kể cả tài khoản chọn Giáo viên, để Hộp thu có đích lưu. Người dùng vẫn được tạo thêm workspace khác. |
| Workspace | Không gian làm việc có Công việc, Lịch và Thư viện; có thể thêm thành viên để cộng tác. Một người có thể có nhiều workspace. |
| Lớp | Cấp bao trùm các workspace thuộc lớp, do giáo viên tạo và quản lý. Lớp có người học và bài giao cho nhóm. |
| Nhóm trong lớp | Chính là **workspace thuộc lớp** trong ngữ cảnh học tập, không phải một loại thực thể/cấp không gian khác. Workspace độc lập cũng có thể có thành viên và công việc chung. |
| Giáo viên, lớp trưởng, trưởng nhóm | Giáo viên quản lý lớp; lớp trưởng có quyền cấp lớp do giáo viên điều chỉnh; trưởng nhóm quản lý workspace của nhóm mình. Cùng một người có thể mang vai trò khác nhau theo phạm vi. |
| Thư viện | Khu vực của workspace để lưu văn bản/ghi chú, đường dẫn và tệp; có thư mục để phân loại các mục và thông tin gắn với chúng. “Bài viết” không phải loại nội dung riêng đã được chốt. |
| Hộp thu | Thành phần của Thư viện trong workspace cá nhân mặc định, nhận mục lưu nhanh chưa phân loại; nội dung này riêng tư cho chủ tài khoản. |
| Việc của tôi | Màn tổng hợp việc cá nhân và việc được giao từ các workspace người dùng tham gia; màn Công việc của workspace chỉ theo workspace đó. |
| Lịch của tôi | Màn tổng hợp lịch liên quan đến người dùng xuyên các workspace; Lịch của workspace có phạm vi của workspace ấy. |

Người tự chọn Giáo viên có thể tạo lớp, không cần bước xét duyệt vai trò riêng, nhưng không phải tạo lớp ngay khi đăng ký. Lớp mới mặc định không công khai: lời mời của giáo viên có hiệu lực sau khi người học chấp nhận; người vào bằng mã lớp gửi yêu cầu để giáo viên duyệt. Việc tự chọn Giáo viên không cấp quyền quản lý lớp của người khác.

Giáo viên là chủ lớp và các workspace nhóm thuộc lớp; giáo viên mặc định là người có quyền lập nhóm và có thể ủy quyền cho lớp trưởng hoặc người học cụ thể. Người được ủy quyền tạo nhóm mặc định làm trưởng nhóm kiêm admin của workspace vừa tạo; giáo viên có thể thay đổi. Các quyền cụ thể, tư cách thành viên, lịch và bài giao được ghi tại [quy tắc nghiệp vụ](../requirements/verified-business-rules.md). [Điều hướng](../ux/validated-navigation.md) chỉ nêu phân cấp đã xác nhận.

**Phạm vi bản đầu đã xác nhận ở mức luồng chính:** cá nhân, cộng tác workspace, cùng khả năng tạo lớp, lập nhóm và giao bài cơ bản cho Giáo viên; giáo viên không bắt buộc sử dụng Lớp học. Chi tiết mốc phát hành và các tính năng mở rộng chưa chốt.

**Chưa xác nhận:** cách lưu nội dung từ từng nền tảng, trường metadata bắt buộc, lưu toàn văn trang web, giới hạn kỹ thuật của file hay mô hình dữ liệu. Các điểm cần quyết định nằm ở [hồ sơ rà soát](../../review/unresolved.md).
