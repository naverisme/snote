# Chọn lớp và điều hướng tính năng lớp — Q33-C

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Chuyển giữa lớp và workspace, vùng tính năng lớp trên web máy tính và điện thoại |
| Trạng thái | C1–C5, E1–E5 và F1–F7 (các mục liên quan lớp) được chủ sản phẩm chốt; phần khác còn ở [phiếu rà soát](https://github.com/naverisme/snote/blob/49caff82e8b004ca0afc2ab52229c4711fdd9334/review/blocked/ux-q33-class.md) |
| Nguồn | [SRC-16, SRC-17, SRC-19–22](../../review/provenance.md), [NAV-07/08](workspace-and-tasks.md) |

Lối chọn lớp và bộ chọn workspace **cùng cấp trên giao diện**. Ở cấp dữ liệu, lớp bao trùm các workspace nhóm. Vùng tính năng của lớp thay ba mục Công việc, Lịch trình, Thư viện của workspace.

| Mã | Cấp và vị trí | Số lượng, loại | Hành vi đã chốt |
| --- | --- | --- | --- |
| CUXC-01 | Vùng chọn ngữ cảnh, cạnh bộ chọn workspace | 1 lối tắt Lớp học | Bấm mở danh sách các lớp được phép truy cập; chọn một lớp mới đổi ngữ cảnh. Lối này không tính vào giới hạn hai icon xếp lớp của bộ chọn workspace [UXR-03](workspace-and-tasks.md). |
| CUXC-02 | Vùng tính năng khi một lớp đang mở; cùng vùng nơi workspace hiển thị ba tính năng | 5 mục trong danh mục: Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt | Chọn mục để chỉ hiển thị đúng màn tính năng lớp ấy. Người không có quyền quản lý lớp **không thấy Cài đặt**; mọi thao tác vẫn phải kiểm quyền khi thực hiện. |
| CUXC-03 | Vùng Nhóm thuộc lớp đang mở | Các nhóm trong lớp theo dữ liệu | Chọn một nhóm để chuyển sang workspace nhóm và mở Công việc làm mục đầu. Dùng lối Lớp học CUXC-01 để quay lại phạm vi lớp. |
| CUXC-04 | Thanh bên trong ngữ cảnh lớp | 0 dòng xem trước “Mục lưu ý” của workspace | Không hiển thị bản xem trước thuộc workspace khi đang ở lớp. Trở lại workspace thì áp dụng [UXR-05](workspace-and-tasks.md). |
| CUXC-05 | Vùng tính năng lớp trên điện thoại | 1 danh sách điều hướng thu gọn, mở theo chiều dọc | Chọn một mục thì đóng danh sách và hiển thị đúng một màn tính năng lớp. Cài đặt vắng mặt khi không có quyền quản lý lớp như CUXC-02. |
| CUXC-06 | Vùng chính ngay sau khi chọn **một lớp cụ thể** trong danh sách các lớp CUXC-01 | 1 màn **Thành viên**, mở mặc định | Hiển thị bảng thành viên của đúng lớp vừa chọn. “Danh sách các lớp” ở CUXC-01 là màn chọn lớp; “danh sách lớp” ở đây là danh sách người trong lớp, không phải quay lại màn chọn lớp. |
| CUXC-07 | Mục Thành viên của lớp; vùng chính | 1 bảng dạng lưới như bảng tính, mỗi thành viên 1 hàng; 3 cột chính: Người học, Vai trò, Nhóm đang tham gia | Ô Vai trò trong hàng chỉ giáo viên chủ lớp thay được giữa **Member** và **Lớp trưởng**; người không có quyền chỉ xem. Nhóm đang tham gia hiện tên hoặc số nhóm. Vai trò mới áp dụng ngay cho thao tác tiếp theo và ghi người/thời điểm đổi. Không chuyển chủ lớp bằng ô này. [PER-09–11](../requirements/access-control.md) |
| CUXC-08 | Mục Nhóm của lớp | 1 danh sách nhóm, mỗi nhóm 1 hàng | Mỗi hàng chỉ hiện tên nhóm, trưởng nhóm và tư cách của người xem; chọn hàng để mở workspace nhóm theo CUXC-03. |
| CUXC-09 | Mục Thành viên của lớp | 3 vùng tách biệt: bảng người trong lớp, lời mời của chính người xem, yêu cầu đang chờ duyệt | Vùng yêu cầu chia yêu cầu vào lớp và yêu cầu vào nhóm; mỗi hàng yêu cầu hiện đích, người gửi, thời điểm, trạng thái. Nút Duyệt/Từ chối chỉ hiện khi người xem có quyền với đúng yêu cầu đó. Lời mời chưa chấp nhận không nằm trong thành viên có hiệu lực. [CLS-02/03/05](../requirements/class-membership.md) |
| CUXC-10 | Mục Cài đặt của lớp, chỉ người có quyền quản lý lớp thấy | 4 phần cấu hình: giới hạn nhóm; quyền tạo/duyệt nhóm; quyền lớp trưởng; hai mặc định nộp sau hạn | Mỗi lần chỉ mở một phần. Trong phần **Quyền lớp trưởng** có bảng quyền theo vai trò cấp lớp; giáo viên chỉnh quyền mặc định tại đây. Giáo viên còn quản lý các cài đặt lớp khác trong mục Cài đặt. [PER-09/10](../requirements/access-control.md) |
| CUXC-11 | Bảng Thành viên trên điện thoại | 1 bảng cuộn ngang trong chính vùng bảng, cố định cột Người học | Khi cuộn để xem cột Vai trò hoặc Nhóm, tên người vẫn ở cùng hàng; việc chọn vai trò theo quyền như CUXC-07. |
| CUXC-12 | Lớp lưu trữ | 1 trạng thái chỉ đọc; 1 nút Khôi phục trong Cài đặt dành cho chủ lớp | Đọc lịch sử theo quyền, khóa tạo/sửa mới. Chủ lớp khôi phục trước khi tiếp tục thao tác. [CLS-12/14](../requirements/class-membership.md) |

**Cài đặt lớp** là nơi giáo viên chỉnh quyền mặc định theo vai trò và các cấu hình lớp khác. Bốn phần E5 xác định phạm vi và cách mở từng phần; F1 xác định bảng quyền theo vai trò nằm trong phần Quyền lớp trưởng. Ô Vai trò trong bảng Thành viên chỉ chọn vai trò, không thay bảng quyền này.

Bố cục tối giản, quyền hiển thị, trạng thái chọn và chuyển động theo [thiết kế tổng hợp](ui-and-motion.md) sau SRC-27. Icon cụ thể được đối chiếu trên bản mẫu ENV-04. Vai trò **trong lớp** tại CUXC-07 không tự thay vai trò trưởng nhóm hoặc người quản lý trong một workspace nhóm; quyền nghiệp vụ ở [vai trò và quyền](../requirements/access-control.md) và [tư cách lớp/nhóm](../requirements/class-membership.md).
