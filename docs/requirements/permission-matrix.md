# Ma trận quyền theo hành động — H1–H10 và J9/J11

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Lớp, workspace nhóm, mục chung và dữ liệu riêng trong SNOTE v2 |
| Trạng thái | H1–H10, J9 và J11 được chủ sản phẩm **chốt**; chỉ các hành động có hàng dưới đây có giá trị xác nhận |
| Nguồn | [SRC-24/26](../../review/provenance.md), [quy tắc vai trò](permissions.md) và các tài liệu nghiệp vụ dẫn trong từng hàng |

**Cách đọc:** “Theo quyền cấp riêng” nghĩa là không được mặc định; “theo cài đặt lớp” chỉ quyền giáo viên đã bật trong phạm vi tương ứng. Chủ lớp có quyền với nội dung **chung** của các nhóm theo PER-01. Một người có thể đồng thời là Member của lớp, Lớp trưởng và Trưởng nhóm; mỗi tư cách chỉ cấp quyền trong phạm vi của nó. Cách dùng tài khoản khi đăng ký không tự cấp quyền trên dữ liệu lớp hoặc nhóm [ACC-05](accounts-and-workspaces.md).

## Ranh giới bắt buộc

| Mã | Điều kiện | Quyết định |
| --- | --- | --- |
| PM-01 | Tư cách lớp/nhóm còn hiệu lực | Khi tư cách chấm dứt, quyền chỉ phát sinh từ tư cách ấy dừng cho thao tác mới; việc kiêm nhiệm không mở dữ liệu ngoài phạm vi của từng tư cách. [PER-08](permissions.md) |
| PM-02 | Hộp thu và buổi làm riêng | Chỉ chủ dữ liệu xem; quyền giáo viên hoặc quản lý nội dung chung không mở dữ liệu riêng. [LIB-02](library.md), [TASK-07](tasks.md) |
| PM-03 | Lớp hoặc workspace đang lưu trữ | Chỉ đọc lịch sử theo quyền; không tạo hoặc sửa nội dung trong phạm vi lưu trữ. Lớp lưu trữ khóa các nhóm; workspace nhóm có thể lưu trữ riêng; workspace độc lập có thể lưu trữ theo quyền chủ. [CLS-14/16](class-membership.md), [ACC-10](accounts-and-workspaces.md) |
| PM-04 | Không tìm thấy quyền hợp lệ cho đúng hành động và đối tượng | Từ chối thao tác. Kiểm lại quyền khi thực hiện, dù giao diện còn hiển thị nút từ trạng thái cũ. H10 |
| PM-05 | Nhiều tư cách đồng thời | Hợp các quyền hợp lệ trong **đúng phạm vi**; tắt quyền Lớp trưởng không xóa quyền Trưởng nhóm trong nhóm họ quản lý. Ranh giới PM-01–04 luôn áp dụng. H10 |

## Cấp lớp và phạm vi xem

| Mã | Hành động/đối tượng | Quyền mặc định đã chốt | Giới hạn |
| --- | --- | --- | --- |
| PM-06 | Xem danh sách người và nhóm trong lớp | Thành viên lớp còn tư cách, gồm Member và Lớp trưởng; giáo viên chủ lớp | Không từ danh sách lớp suy ra quyền xem nội dung mọi nhóm. H1 |
| PM-07 | Xem bài giao, sự kiện lớp, tiến độ và bản nộp | Thành viên xem bài giao của nhóm nhận và sự kiện gửi đến mình; tiến độ/bản nộp nhóm mình theo ASG-11 | Đọc dữ liệu nhóm khác cần quyền riêng do giáo viên cấp; giáo viên xem theo PER-01/ASG-11. H1 |
| PM-08 | Xem nội dung chung của workspace nhóm | Thành viên/Trưởng nhóm xem nhóm mình; Lớp trưởng mặc định xem **việc, lịch, ghi chú văn bản** chung mọi nhóm; giáo viên chủ lớp xem mọi nội dung chung | Lớp trưởng cần cấp riêng để xem tệp/đường dẫn chung của nhóm khác. H1/H3, PER-02 |
| PM-09 | Chỉnh vai trò cấp lớp hoặc Cài đặt lớp | Giáo viên chủ lớp | Ô Vai trò chỉ chọn Member/Lớp trưởng; trưởng nhóm không được quyền quản lý lớp chỉ vì quản lý workspace. PER-09–11, H2 |

## Nội dung và điều phối trong workspace nhóm

| Mã | Hành động/đối tượng | Quyền mặc định đã chốt | Giới hạn |
| --- | --- | --- | --- |
| PM-10 | Tạo việc chung trong nhóm | Giáo viên chủ lớp và người quản lý nhóm; thành viên nhóm được tạo **việc chờ phân công** | Lớp trưởng cần quyền tạo riêng nếu muốn tạo việc ở nhóm khác. Người tạo không tự có quyền đổi hạn, mức quan trọng hay xóa sau khi việc được giao. H3/H4, TASK-14 |
| PM-11 | Phân công hoặc đổi người phụ trách | Giáo viên chủ lớp, trưởng nhóm hoặc người quản lý việc trong nhóm | Thành viên tạo việc chờ phân công không tự chọn người nhận; yêu cầu đổi người theo TASK-13. H4 |
| PM-12 | Sửa việc chung | Lớp trưởng mặc định được sửa việc chung mọi nhóm theo PER-02; trưởng nhóm/người quản lý sửa việc nhóm mình; người phụ trách cập nhật checklist, trạng thái và lịch làm riêng theo TASK-04/15 | Quyền **tạo**, **xóa**, phân công và sửa checklist là các hành động tách khỏi quyền sửa trường chung. H3–H5 |
| PM-13 | Chỉnh mục checklist của việc | Người phụ trách và người quản lý việc | Thành viên khác chỉ xem theo quyền. Mỗi thêm/xóa/sửa/đánh dấu mục ghi người và thời điểm. Giao lại giữ checklist/lịch sử, quyền sửa chuyển theo tư cách mới tại TASK-16. H5/J11, TASK-15/16 |
| PM-14 | Tạo sự kiện chung của nhóm | Giáo viên chủ lớp, trưởng nhóm hoặc người quản lý workspace nhóm | Lớp trưởng cần giáo viên cấp quyền tạo; thành viên khác không có quyền tạo sự kiện chung mặc định. CAL-04, H3 |
| PM-15 | Sửa sự kiện chung | Người tạo sự kiện chung, người quản lý workspace nhóm và giáo viên chủ lớp; Lớp trưởng theo quyền sửa lịch chung đang có hiệu lực | Xóa/hủy là quyền riêng. Bản ghi sự kiện bị hủy vẫn để người nhận tra dấu vết. H6, CAL-08 |
| PM-23 | Hủy sự kiện chung | Giáo viên chủ lớp, người tạo và người quản lý workspace của sự kiện trong đúng phạm vi | Lớp trưởng cần quyền Hủy riêng; nếu kiêm người tạo/quản lý thì xét tư cách đó theo PM-05. Giữ dấu vết Đã hủy cho người nhận; PM-01–04 vẫn áp dụng. J9, CAL-11 |
| PM-24 | Sửa hoặc xóa sự kiện riêng | Chủ sự kiện | Quyền quản lý nội dung chung không mở sự kiện riêng. J9, CAL-11 |
| PM-16 | Tạo mục Thư viện chung | Thành viên nhóm trong nhóm mình, trưởng nhóm/người quản lý và giáo viên chủ lớp | Lớp trưởng cần cấp riêng để tạo ở nhóm khác. Mục mới thuộc workspace đích, không vào Hộp thu riêng. H3/H7, LIB-03/08 |
| PM-17 | Sửa hoặc xóa mục Thư viện chung | Người tạo với mục của mình; người quản lý workspace với mục trong nhóm; giáo viên chủ lớp với mọi mục chung | Lớp trưởng mặc định sửa **ghi chú văn bản** chung mọi nhóm; tệp/đường dẫn và quyền xóa mục của người khác cần cấp riêng. H3/H7, LIB-08 |
| PM-18 | Quản lý thư mục trong workspace | Chủ workspace hoặc người có quyền quản lý workspace theo LIB-06 | Chỉ có quyền sửa một mục không tự cấp quyền quản lý thư mục. Điều kiện xóa thư mục ở LIB-07. |

## Thành viên, bài giao và ủy quyền

| Mã | Hành động/đối tượng | Quyền mặc định đã chốt | Giới hạn |
| --- | --- | --- | --- |
| PM-19 | Mời hoặc đề nghị đưa người khỏi nhóm | Giáo viên chủ lớp, trưởng nhóm/người quản lý workspace nhóm | Lớp trưởng chỉ có quyền này khi giáo viên bật. Người được mời phải chấp nhận; đưa trưởng nhóm/người phụ trách việc ra cần bàn giao; lịch sử thuộc workspace. H2/H8, CLS-15 |
| PM-20 | Duyệt yêu cầu vào nhóm | Giáo viên, Lớp trưởng, trưởng nhóm của nhóm được yêu cầu mặc định | Giáo viên chỉnh được quy tắc này; vẫn kiểm giới hạn và tư cách theo PER-04/CLS-05/11. H8 không thay quyền duyệt đã chốt. |
| PM-21 | Tạo/sửa bài giao, cập nhật tiến độ, Nộp/sửa bản nộp | Theo từng quyền độc lập tại PER-05 và ASG-03/11; người quản lý workspace không tự có quyền Nộp | Quyền Nộp cấp riêng theo chức năng, không suy từ quyền sửa bài hoặc quản lý nhóm. H2/H9 |
| PM-22 | Cấp quyền theo cá nhân | Giáo viên chủ lớp cấp theo chức năng và phạm vi một lớp, một nhóm hoặc một bài giao | Người được cấp không cấp tiếp; thu hồi tác động cho thao tác mới và ghi lịch sử. H9, PER-06/12 |

Ma trận này ghi những ô đủ nguồn từ các lượt đã chốt. Quyền Hủy đã bổ sung tại PM-23; xóa vĩnh viễn sự kiện chung chưa được định nghĩa. Cài đặt quyền theo hành động/phạm vi ở [STR-11–14](structural-rules.md), cách hiển thị ở [UX tổng hợp](../ux/ui-and-motion.md) theo SRC-27. Phiếu G4 trước đây chỉ là lịch sử tạm duyệt; quyền H1–H10 và J9/J11 giữ nguyên trong đúng phạm vi.
