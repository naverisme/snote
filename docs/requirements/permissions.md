# Vai trò và quyền theo phạm vi

| Trường | Giá trị |
| --- | --- |
| Mục đích | Tra quyền mặc định, quyền cần cấp riêng và phạm vi áp dụng |
| Phạm vi | Các hành động trong lớp và workspace nhóm đã được xác nhận |
| Kiểm định | DCA-checked cho các ô có căn cứ bên dưới |
| Bằng chứng duyệt | [SRC-02, SRC-05, SRC-08 đến SRC-10, Q01, Q02, Q05, Q08, Q12](../../review/provenance.md) |

| Mã | Chủ thể và phạm vi | Quyền mặc định hoặc điều kiện đã duyệt | Nguồn |
| --- | --- | --- | --- |
| PER-01 | Giáo viên chủ lớp | Là chủ lớp và các workspace nhóm thuộc lớp. Được xem, sửa, xóa toàn bộ nội dung chung trong các nhóm của lớp mình. Hộp thu và buổi làm riêng chỉ người sở hữu thấy. | SRC-01, SRC-02, SRC-03, Q19 |
| PER-02 | Lớp trưởng trong lớp | Tối đa một lớp trưởng chính. Mặc định được xem và sửa công việc, lịch, ghi chú chung của mọi nhóm trong lớp. Quyền xóa cần giáo viên cấp thêm. Giáo viên có thể điều chỉnh và cấp quyền hỗ trợ cho người khác. | SRC-02, SRC-09, Q01 |
| PER-03 | Trưởng nhóm và người quản lý thêm | Mỗi nhóm có một trưởng nhóm chính. Giáo viên có thể bổ sung người quản lý workspace theo cấu hình. Quyền quản lý áp dụng trong workspace nhóm. Quyền sửa bài giao và Nộp bài được xét riêng. | SRC-02, SRC-09 |
| PER-04 | Duyệt yêu cầu vào nhóm | Mặc định giáo viên, lớp trưởng và trưởng nhóm của nhóm được yêu cầu có thể duyệt. Giáo viên có thể thay đổi quy tắc này trong lớp. | SRC-02, SRC-08 |
| PER-05 | Tạo hoặc sửa bài giao cấp lớp | Mặc định thuộc giáo viên. Quyền sửa bài giao của lớp trưởng hoặc trưởng nhóm cần được giáo viên ủy quyền riêng. | SRC-09 |
| PER-06 | Ủy quyền và thu hồi | Giáo viên chủ lớp có thể cấp quyền theo chức năng. Bản đầu chưa có vai trò đồng giáo viên riêng. Thu hồi có hiệu lực ngay với thao tác mới và giữ lịch sử thao tác hợp lệ trước đó. | Q02, Q05 |

Quyền theo hành động còn có tại các tài liệu sở hữu quy tắc tương ứng.

- [Tạo nhóm và bàn giao](class-membership.md).
- [Chỉnh việc, checklist, lịch làm riêng](tasks.md).
- [Tạo sự kiện chung](calendar.md).
- [Tư cách Nộp và sửa bản nộp](assignments-and-submissions.md).
- [Chia sẻ tài liệu và phạm vi Hộp thu](library.md).

Ma trận đầy đủ theo trường, theo trạng thái tư cách và theo vai trò đồng thời còn ở [R-02](../../review/unresolved.md). Bảng trên chỉ kết luận những quyền có nguồn xác nhận.
