# Ca nghiệm thu nền SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định tình huống và kết quả quan sát để kiểm quy tắc đã chốt |
| Phạm vi | Mười hai tình huống nền; chưa bao phủ toàn bộ hành vi của bản đầu |
| Kiểm định | Chủ sản phẩm duyệt Q36; [SRC-12](../../review/provenance.md) |
| Giới hạn | Dữ liệu thử chi tiết, cách thực thi, thiết bị, mục tiêu hiệu năng và phục hồi còn ở [R-16](../../review/unresolved.md) |

| Mã | Thiết lập và thao tác | Kết quả cần quan sát | Quy tắc |
| --- | --- | --- | --- |
| VT-01 | Đăng ký một tài khoản chọn Người học và Giáo viên, chưa tạo lớp | Workspace cá nhân đã có. Tài khoản có lối vào lớp đang học và chức năng tạo lớp khi cần. | [ACC-01 đến ACC-03](../requirements/accounts-and-workspaces.md), NAV-01, NAV-02 |
| VT-02 | So hai đường vào lớp bằng lời mời giáo viên và mã lớp | Lời mời có hiệu lực sau khi người học chấp nhận. Mã lớp tạo yêu cầu chờ giáo viên duyệt. | [CLS-02, CLS-03](../requirements/class-membership.md) |
| VT-03 | Lớp giới hạn một nhóm, người học có hai lời mời rồi chấp nhận một lời mời hợp lệ | Có một tư cách nhóm hiệu lực. Lời mời còn lại hết hiệu lực, rời danh sách chờ và có trong lịch sử lưu trữ. | [CLS-05 đến CLS-07](../requirements/class-membership.md) |
| VT-04 | So quyền giáo viên và lớp trưởng ở cấu hình mặc định, có nội dung chung và Hộp thu riêng | Giáo viên xem, sửa, xóa nội dung chung của lớp mình. Lớp trưởng xem và sửa phần đã được cấp mặc định, quyền xóa cần cấp thêm. Hộp thu chỉ chủ tài khoản thấy. | [PER-01, PER-02](../requirements/permissions.md), [LIB-02](../requirements/library.md) |
| VT-05 | Một việc có hạn hôm nay và một buổi làm riêng hôm nay | Việc xuất hiện một lần trong bộ lọc Hôm nay của người sở hữu buổi làm. | [TASK-10](../requirements/tasks.md) |
| VT-06 | Việc có hạn chỉ ngày, lập một buổi làm sau hạn | Trước ranh giới ngày kế tiếp chưa quá hạn. Từ 00:00 ngày kế tiếp theo múi giờ áp dụng, việc chưa xong hiện thời gian quá hạn. Buổi làm vẫn lưu với nhãn Làm muộn, hạn giữ nguyên. | [TASK-05 đến TASK-07](../requirements/tasks.md) |
| VT-07 | Đánh dấu xong toàn bộ checklist rồi xác nhận hoàn thành và mở lại | Checklist hiện tỷ lệ xong. Việc chỉ hoàn thành khi xác nhận. Mở lại ghi người và thời điểm. | [TASK-08, TASK-09](../requirements/tasks.md) |
| VT-08 | Lưu nhanh một mục rồi sao chép vào workspace nhóm | Mục lưu nhanh vào Hộp thu riêng. Bản gốc ở nguồn. Bản sao chịu quyền của workspace nhóm. | [LIB-02 đến LIB-04](../requirements/library.md) |
| VT-09 | Giáo viên tạo sự kiện cho một nhóm trong lớp có hai nhóm | Sự kiện hiện trong lịch của nhóm liên quan và Lịch của tôi của người được thấy. | [CAL-03](../requirements/calendar.md) |
| VT-10 | Bài giao đã quá hạn. Cài đặt lớp mở cả hai quyền. Bài giao ghi rõ khóa nộp lần đầu và kế thừa cài đặt sửa. | Nhóm chưa nộp bị khóa nộp lần đầu. Nhóm đã nộp, có người được cấp quyền sửa, vẫn được sửa theo cài đặt lớp. | [ASG-03, ASG-05, ASG-06](../requirements/assignments-and-submissions.md) |
| VT-11 | Nộp bản có tệp, sửa mục Thư viện, đổi hạn và nhận xét phiên bản | Phiên bản đã nộp giữ nội dung và trạng thái đúng hạn hoặc muộn tại lúc nộp. Nhận xét gắn phiên bản. Hạn mới áp dụng cho lần sau. | [ASG-04, ASG-08, ASG-09](../requirements/assignments-and-submissions.md) |
| VT-12 | Mở Việc của tôi và Công việc workspace, chuyển Danh sách, mở chi tiết từ Gantt | Gantt mặc định trong cả hai phạm vi. Danh sách giữ đúng tập việc theo phạm vi. Sửa việc qua chi tiết. | [TASK-01](../requirements/tasks.md), [VIEW-01 đến VIEW-03](../ux/task-views.md) |

Phương pháp chạy, bộ dữ liệu thử, phạm vi thiết bị và ngưỡng chất lượng sẽ được bổ sung sau khi các đầu vào tương ứng được chốt. Không suy ra mức đáp ứng hoặc mục tiêu khôi phục từ việc duyệt 12 ca này.
