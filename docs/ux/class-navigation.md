# Chọn lớp và điều hướng tính năng lớp — Q33-C

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Chuyển giữa lớp và workspace, vùng tính năng lớp trên web máy tính và điện thoại |
| Trạng thái | C1–C5 và E1–E5 được chủ sản phẩm chốt; phần khác còn ở [phiếu rà soát](../../review/blocked/ux-q33-class.md) |
| Nguồn | [SRC-16, SRC-17, SRC-19–21](../../review/provenance.md), [NAV-07/08](validated-navigation.md) |

Lối chọn lớp và bộ chọn workspace **cùng cấp trên giao diện**. Ở cấp dữ liệu, lớp bao trùm các workspace nhóm. Vùng tính năng của lớp thay ba mục Công việc, Lịch trình, Thư viện của workspace.

| Mã | Cấp và vị trí | Số lượng, loại | Hành vi đã chốt |
| --- | --- | --- | --- |
| CUXC-01 | Vùng chọn ngữ cảnh, cạnh bộ chọn workspace | 1 lối tắt Lớp học | Bấm mở danh sách các lớp được phép truy cập; chọn một lớp mới đổi ngữ cảnh. Lối này không tính vào giới hạn hai icon xếp lớp của bộ chọn workspace [UXR-03](workspace-gantt.md). |
| CUXC-02 | Vùng tính năng khi một lớp đang mở; cùng vùng nơi workspace hiển thị ba tính năng | 5 mục trong danh mục: Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt | Chọn mục để chỉ hiển thị đúng màn tính năng lớp ấy. Người không có quyền quản lý lớp **không thấy Cài đặt**; mọi thao tác vẫn phải kiểm quyền khi thực hiện. |
| CUXC-03 | Vùng Nhóm thuộc lớp đang mở | Các nhóm trong lớp theo dữ liệu | Chọn một nhóm để chuyển sang workspace nhóm và mở Công việc làm mục đầu. Dùng lối Lớp học CUXC-01 để quay lại phạm vi lớp. |
| CUXC-04 | Thanh bên trong ngữ cảnh lớp | 0 dòng xem trước “Mục lưu ý” của workspace | Không hiển thị bản xem trước thuộc workspace khi đang ở lớp. Trở lại workspace thì áp dụng [UXR-05](workspace-gantt.md). |
| CUXC-05 | Vùng tính năng lớp trên điện thoại | 1 danh sách điều hướng thu gọn, mở theo chiều dọc | Chọn một mục thì đóng danh sách và hiển thị đúng một màn tính năng lớp. Cài đặt vắng mặt khi không có quyền quản lý lớp như CUXC-02. |
| CUXC-06 | Vùng chính ngay sau khi chọn **một lớp cụ thể** trong danh sách các lớp CUXC-01 | 1 màn **Thành viên**, mở mặc định | Hiển thị bảng thành viên của đúng lớp vừa chọn. “Danh sách các lớp” ở CUXC-01 là màn chọn lớp; “danh sách lớp” ở đây là danh sách người trong lớp, không phải quay lại màn chọn lớp. |
| CUXC-07 | Mục Thành viên của lớp; vùng chính | 1 bảng dạng lưới như bảng tính, mỗi thành viên 1 hàng; 1 ô vai trò trên mỗi hàng | Người gia nhập lớp có vai trò **Member** mặc định. Giáo viên chọn vai trò khác ngay tại ô vai trò trong hàng của người đó; người không có quyền chỉ xem. Quyền mặc định theo vai trò và các cài đặt quyền khác được giáo viên chỉnh trong **Cài đặt**, không chỉnh tại bảng này. Chuyển chủ lớp phải theo [CLS-10](../requirements/class-membership.md), không bằng ô vai trò. [PER-09](../requirements/permissions.md) |
| CUXC-08 | Mục Nhóm của lớp | 1 danh sách nhóm, mỗi nhóm 1 hàng | Mỗi hàng chỉ hiện tên nhóm, trưởng nhóm và tư cách của người xem; chọn hàng để mở workspace nhóm theo CUXC-03. |
| CUXC-09 | Mục Thành viên của lớp | 3 vùng tách biệt: bảng người trong lớp, lời mời của chính người xem, yêu cầu đang chờ duyệt | Hiện hành động Chấp nhận/Từ chối hoặc Duyệt theo quyền và trạng thái; không gộp lời mời chưa chấp nhận vào thành viên có hiệu lực. [CLS-02/03/05](../requirements/class-membership.md) |
| CUXC-10 | Mục Cài đặt của lớp, chỉ người có quyền quản lý lớp thấy | 4 phần cấu hình: giới hạn nhóm; quyền tạo/duyệt nhóm; quyền lớp trưởng; hai mặc định nộp sau hạn | Mỗi lần chỉ mở một phần để tránh hiển thị dày đặc. Giáo viên còn quản lý quyền mặc định theo vai trò tại đây theo [PER-09](../requirements/permissions.md); vị trí chi tiết của điều khiển quyền theo vai trò chưa được chốt. |

**Cài đặt lớp** là nơi giáo viên chỉnh quyền mặc định theo vai trò và các cấu hình lớp khác. Bốn phần E5 xác định phạm vi và cách mở từng phần; danh sách trường cụ thể và vị trí điều khiển quyền theo vai trò chưa được chốt.

Thứ tự năm mục, ký hiệu biểu tượng, trạng thái chọn, cột bổ sung/sắp xếp/lọc bảng thành viên, cách tương tác bảng trên điện thoại, bố trí danh sách nhiều lớp và hành vi khi lớp lưu trữ còn ở [R-05](../../review/unresolved.md). Vai trò **trong lớp** tại CUXC-07 không tự thay vai trò trưởng nhóm hoặc người quản lý trong một workspace nhóm; quyền nghiệp vụ ở [vai trò và quyền](../requirements/permissions.md) và [tư cách lớp/nhóm](../requirements/class-membership.md).
