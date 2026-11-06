# Vai trò và quyền theo phạm vi

| Trường | Giá trị |
| --- | --- |
| Mục đích | Tra quyền mặc định, quyền cần cấp riêng và phạm vi áp dụng |
| Phạm vi | Các hành động trong lớp, workspace nhóm và workspace cộng tác độc lập đã được xác nhận |
| Kiểm định | DCA-checked cho các ô có căn cứ bên dưới |
| Bằng chứng duyệt | [SRC-02, SRC-05, SRC-08 đến SRC-10, SRC-15, SRC-20, SRC-22, SRC-24, Q01, Q02, Q05, Q08, Q12, Q22, E2, F1–F3, H1–H10](../../review/provenance.md) |

| Mã | Chủ thể và phạm vi | Quyền mặc định hoặc điều kiện đã duyệt | Nguồn |
| --- | --- | --- | --- |
| PER-01 | Giáo viên chủ lớp | Là chủ lớp và các workspace nhóm thuộc lớp. Được xem, sửa, xóa toàn bộ nội dung chung trong các nhóm của lớp mình. Hộp thu và buổi làm riêng chỉ người sở hữu thấy. | SRC-01, SRC-02, SRC-03, Q19 |
| PER-02 | Lớp trưởng trong lớp | Tối đa một lớp trưởng chính. Mặc định được xem và sửa công việc, lịch, ghi chú chung của mọi nhóm trong lớp. Quyền đối với tệp hoặc đường dẫn chung ngoài ghi chú và quyền xóa cần giáo viên cấp riêng. Giáo viên có thể điều chỉnh và cấp quyền hỗ trợ cho người khác. | SRC-02, SRC-09, Q01, Q22 |
| PER-03 | Trưởng nhóm và người quản lý thêm | Mỗi nhóm có một trưởng nhóm chính. Giáo viên có thể bổ sung người quản lý workspace theo cấu hình. Quyền quản lý áp dụng trong workspace nhóm. Quyền sửa bài giao và Nộp bài được xét riêng. | SRC-02, SRC-09 |
| PER-04 | Duyệt yêu cầu vào nhóm | Mặc định giáo viên, lớp trưởng và trưởng nhóm của nhóm được yêu cầu có thể duyệt. Giáo viên có thể thay đổi quy tắc này trong lớp. | SRC-02, SRC-08 |
| PER-05 | Tạo hoặc sửa bài giao cấp lớp | Mặc định thuộc giáo viên. Quyền sửa bài giao của lớp trưởng hoặc trưởng nhóm cần được giáo viên ủy quyền riêng. | SRC-09 |
| PER-06 | Ủy quyền và thu hồi | Giáo viên chủ lớp có thể cấp quyền theo chức năng. Bản đầu chưa có vai trò đồng giáo viên riêng. Thu hồi có hiệu lực ngay với thao tác mới và giữ lịch sử thao tác hợp lệ trước đó. | Q02, Q05 |
| PER-07 | Workspace cộng tác không thuộc lớp | Người tạo workspace quản lý thành viên và cấp quyền quản lý trong workspace đó. Thành viên thao tác với việc được giao theo quyền của việc. Workspace cá nhân mặc định không cho chia sẻ theo ACC-06. | Q22, SRC-11 |
| PER-08 | Quyền gắn với tư cách thành viên | Khi tư cách trong lớp hoặc workspace hết hiệu lực, các quyền chỉ có từ tư cách đó dừng cho thao tác mới; lịch sử thao tác đã hợp lệ được giữ. | Q22, Q24 |
| PER-09 | Vai trò và quyền trong lớp | Người học mới gia nhập có vai trò cấp lớp **Member** theo CLS-13. Giáo viên chọn vai trò cấp lớp khác cho từng người ngay tại hàng của người đó trong bảng Thành viên. Quyền mặc định theo vai trò và các cài đặt quyền khác do giáo viên quản lý trong **Cài đặt lớp**, không sửa tại ô vai trò. Vai trò cấp lớp không tự đổi vai trò quản lý workspace nhóm. Giáo viên chủ lớp vẫn theo PER-01 và việc chuyển chủ theo CLS-10. | E2, SRC-20 |
| PER-10 | Danh mục vai trò cấp lớp bản đầu | Người học có thể mang vai trò **Member** hoặc **Lớp trưởng** do giáo viên chọn trong bảng Thành viên. Giáo viên chủ lớp là chủ sở hữu, không phải lựa chọn trong ô vai trò. **Trưởng nhóm** thuộc workspace nhóm. Quyền ủy quyền theo chức năng không tạo vai trò cấp lớp mới. | F2, SRC-22 |
| PER-11 | Thay vai trò cấp lớp | Chỉ giáo viên chủ lớp thay vai trò cấp lớp trong hàng thành viên. Quyền mới áp dụng cho thao tác tiếp theo; ghi người đổi và thời điểm. Ô vai trò không dùng để chuyển chủ lớp, việc ấy theo CLS-10. | F3, SRC-22 |
| PER-12 | Cấp quyền cá nhân | Giáo viên chủ lớp cấp quyền theo chức năng, giới hạn ở lớp, nhóm hoặc bài giao cụ thể. Người được cấp không ủy quyền tiếp; thu hồi chỉ chặn thao tác mới và ghi lịch sử. Quyền Nộp bài được cấp riêng theo ASG-03. | H9, SRC-24 |
| PER-13 | Nhiều tư cách và ranh giới | Hợp các quyền hợp lệ trong đúng phạm vi lớp/nhóm/bài. Tắt quyền Lớp trưởng không xóa quyền Trưởng nhóm của chính nhóm đó. Tư cách đã hết, dữ liệu riêng và lớp lưu trữ là giới hạn phải kiểm trước thao tác. Không có quyền khớp thì từ chối; kiểm quyền thực tế khi thực hiện, kể cả giao diện còn nút cũ. | H10, SRC-24 |
| PER-14 | Quyền lớp trưởng theo hành động | Mặc định xem/sửa việc, lịch và ghi chú văn bản chung của mọi nhóm theo PER-02. Tạo và xóa nội dung, quản lý thành viên, truy cập tệp/đường dẫn chung của nhóm khác là các quyền riêng; không suy từ quyền sửa. | H3, SRC-24 |

Quyền theo hành động còn có tại các tài liệu sở hữu quy tắc tương ứng.

- [Tạo nhóm và bàn giao](class-membership.md).
- [Chỉnh việc, checklist, lịch làm riêng](tasks.md).
- [Tạo sự kiện chung](calendar.md).
- [Tư cách Nộp và sửa bản nộp](assignments-and-submissions.md).
- [Chia sẻ tài liệu và phạm vi Hộp thu](library.md).

Các hành động và phạm vi đã chốt được tách ở [ma trận quyền H1–H10](permission-matrix.md). Ô quyền Cài đặt chưa nêu giá trị, ngoại lệ theo trường và thao tác thay trưởng nhóm vẫn còn ở [R-02](../../review/unresolved.md). Bảng trên chỉ kết luận những quyền có nguồn xác nhận.
Điều kiện bàn giao khi người tạo workspace độc lập muốn rời hoặc chuyển quản lý còn ở [R-14](../../review/unresolved.md).
