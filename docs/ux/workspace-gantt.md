# Khung workspace và màn Công việc/Gantt

| Trường | Giá trị |
| --- | --- |
| Mục đích | Quy định cấp, vị trí, số lượng, kiểu và hành vi các thành phần trong khung workspace và màn Công việc |
| Phạm vi | Web trên máy tính và điện thoại; workspace hiện tại, Gantt và Danh sách công việc |
| Trạng thái | Q32 được chủ sản phẩm chốt sau bản vẽ và các sửa đổi UXR-03–06; lối tắt lớp cùng cấp với workspace được làm rõ tại [SRC-16](../../review/provenance.md) |
| Nguồn nghiệp vụ | [Điều hướng](validated-navigation.md), [chế độ xem việc](task-views.md), [quy tắc công việc](../requirements/tasks.md), [workspace mặc định](../requirements/accounts-and-workspaces.md) |

## Phân cấp và vùng màn

| Cấp | Vị trí | Gồm những gì | Vùng chịu tác động |
| --- | --- | --- | --- |
| Ứng dụng | Đầu thanh bên | Nút Snote về “Việc của tôi” | Mở phạm vi tổng hợp xuyên workspace. |
| Chọn ngữ cảnh | Đầu vùng chính | Cụm workspace và lối tắt Lớp học cùng cấp | Chọn workspace hoặc đi vào phạm vi lớp; lớp vẫn bao trùm các workspace nhóm ở cấp dữ liệu. |
| Workspace | Trên vùng chính, cùng khung ứng dụng | Cụm chọn workspace, Tạo workspace khi bung, nút đổi góc nhìn workspace | Đổi workspace đang mở và dữ liệu của vùng chính. |
| Tính năng trong workspace | Thanh bên, ba mục cùng cấp | Công việc, Lịch trình, Thư viện; Mục lưu ý ở dưới | Chỉ nội dung của mục và workspace đang chọn xuất hiện trong vùng chính. |
| Chế độ trong Công việc | Đầu vùng Công việc | Nút Chế độ xem chuyển Gantt/Danh sách | Thay cách xem cùng tập việc. Danh sách việc khác danh sách workspace. |
| Nội dung Công việc | Phần lớn vùng chính | Lọc, Sắp xếp, điều hướng trục, Gantt hoặc Danh sách, chi tiết khi chọn việc | Thao tác theo quyền và tập việc của workspace đang mở. |

Thư viện và Lịch trình đứng cạnh nhau trong thanh bên để chuyển nhanh. Vùng Công việc không đặt nội dung ghi chú hay lịch trình khác vào Gantt; “Mục lưu ý” chỉ hiện bản xem trước ngắn theo quy tắc UXR-05.
Ba mục Công việc, Lịch trình và Thư viện là **tính năng của workspace đang mở**. Khi chuyển sang lớp, chính vùng điều hướng tính năng này thay bằng năm mục Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt theo [NAV-08](validated-navigation.md). “Mục lưu ý” của workspace không hiển thị trong ngữ cảnh lớp theo [Q33-C3](class-navigation.md).

## Danh mục thành phần Q32

Số lượng tính trên một màn; mục phụ thuộc dữ liệu ghi rõ số lượng biến đổi. Những thao tác thay dữ liệu chỉ có hiệu lực khi người dùng xác nhận và backend kiểm quyền theo [yêu cầu nghiệp vụ](../requirements/README.md). Mã UXR giữ từ bản rà soát để truy vết quyết định.

| Mã | Vị trí, cùng cấp và mục cha | Số lượng và kiểu | Tác động khi bấm/chọn |
| --- | --- | --- | --- |
| UXR-01 | Đầu thanh bên; cấp ứng dụng | 1 nút Snote | Mở “Việc của tôi” tổng hợp xuyên workspace; [NAV-03](validated-navigation.md). |
| UXR-02 | Thanh bên; ba mục ngang cấp thuộc workspace đang mở | 3 nút Công việc, Lịch trình, Thư viện | Chọn mục để vùng chính hiển thị đúng tính năng của workspace đang mở; chỉ một mục được chọn tại một thời điểm. |
| UXR-03 | Đầu vùng chính; nhóm chọn workspace, trên nội dung tính năng | Thu gọn: 1 cụm icon xếp lớp, nhìn thấy tối đa 2 icon. Bung: 1 icon cho mỗi workspace được phép mở, thêm 1 icon đổi góc nhìn sang danh sách workspace. | Bấm cụm để bung theo chiều ngang. Bấm icon workspace để chuyển workspace. Giữ và kéo trái/phải để cuộn đến workspace mong muốn; **thả chỉ dừng ở vị trí đó, bấm icon mới chuyển**. Bấm icon đổi góc nhìn để xem cùng các workspace dạng danh sách. |
| UXR-04 | Bên trái ngoài cùng dãy workspace **chỉ khi UXR-03 đã bung** | 1 icon Tạo workspace | Mở thao tác tạo workspace; chỉ tạo khi xác nhận. Không có lối chia sẻ workspace cá nhân mặc định [ACC-06](../requirements/accounts-and-workspaces.md). |
| UXR-05 | Thanh bên, dưới ba nút UXR-02; thuộc workspace đang mở | 1 tiêu đề “Mục lưu ý”, tối đa 3 dòng xem trước | Mỗi dòng hiện loại mục, tiêu đề và thời điểm nếu có, từ ghi chú được ghim, việc gần hạn hoặc lịch trình sắp đến giờ **trong workspace đang mở**. Bấm dòng để mở mục nguồn; không hiện nội dung đầy đủ ở thanh bên. |
| UXR-06 | Đầu vùng Công việc; chế độ xem thuộc Công việc | 1 nút “Chế độ xem” | Bấm để chuyển giữa Gantt và Danh sách công việc của cùng tập việc; mặc định Gantt. Đây không phải nút đổi sang danh sách workspace UXR-03. |
| UXR-07 | Cạnh UXR-06; hành động trong Công việc | 1 nút Tạo việc khi có quyền | Mở tạo việc ở workspace hiện hành; hạn có thể để trống. |
| UXR-08 | Đầu Công việc, nhóm điều khiển hiển thị | 1 điều khiển Lọc | Thay tập việc đang nhìn thấy, hiện dấu khi đang áp lọc và có lối bỏ lọc; không sửa dữ liệu việc. Các bộ lọc Hôm nay, Ngày mai và Quan trọng theo [VIEW-04](task-views.md). |
| UXR-09 | Cạnh Lọc, cùng nhóm điều khiển hiển thị | 1 điều khiển Sắp xếp | Đổi thứ tự hàng nhìn thấy. Trong Gantt không đảo chiều thời gian; lưu thứ tự làm mặc định là thao tác xác nhận riêng theo quy tắc công việc. |
| UXR-10 | Trên lưới Gantt; nhóm điều hướng trục | 3 nút Trước, Hôm nay, Sau; 1 nhãn khoảng ngày; 1 bộ chọn Ngày/Tuần | Di chuyển khoảng đang xem hoặc đổi độ chi tiết của trục. Hôm nay ở đây đưa trục về hiện tại, khác bộ lọc việc hôm nay. |
| UXR-11 | Vùng chính Công việc khi Gantt được chọn | 1 lưới tên việc và trục thời gian; số hàng theo việc hiện có | Biểu diễn hạn và buổi làm nhìn thấy theo quyền bằng dấu hiệu phân biệt; chọn hàng để mở việc. Bản đầu không kéo thanh để sửa. Buổi làm riêng của người khác không xuất hiện. |
| UXR-12 | Gắn với lưới Gantt khi có việc thiếu mốc | 1 nhóm “Chưa có mốc thời gian” với số việc phù hợp | Hiện việc không có hạn và không có buổi làm nhìn thấy; bấm việc để mở chi tiết, không tự vẽ thanh thời gian giả. |
| UXR-13 | Khi chọn việc; cạnh Gantt trên máy tính, màn riêng trên điện thoại | 1 vùng chi tiết | Xem và sửa theo quyền: người phụ trách, hạn, checklist, trạng thái, lịch làm riêng của mình. |
| UXR-14 | Vùng chính khi Danh sách việc được chọn | 1 danh sách, 1 ô chọn trên mỗi hàng đủ quyền; nhóm hành động chỉ hiện khi có mục được chọn | Lưu trữ hoặc xóa nhiều việc theo quyền và sau xác nhận. |

## Bộ chọn workspace và các trạng thái

| Trạng thái | Cách hiển thị | Tương tác |
| --- | --- | --- |
| Thu gọn | Tối đa hai icon xếp lớp. Icon của workspace đang mở nổi ở trước, icon chưa chọn chìm ở sau; có hiệu ứng mờ dần. | Bấm cụm để bung; màn máy tính mặc định giấu tên, hiện tên khi hover. Trên điện thoại tên workspace hiện bên phải icon. |
| Bung ngang | Tạo workspace ở đầu trái; tiếp theo là các icon workspace theo chiều ngang, có lối đổi sang danh sách workspace trong cùng nhóm. | Bấm icon chọn workspace. Giữ và kéo qua hai phía để lướt, thả dừng và bấm để chọn; thao tác được hỗ trợ trên máy tính và điện thoại. |
| Danh sách workspace | Mỗi dòng hiện tên workspace, tên lớp nếu đó là nhóm trong lớp, và dấu nhận biết workspace đang mở. | Chọn dòng để chuyển workspace. Đây là góc nhìn khác của cùng bộ chọn workspace, không phải chế độ Danh sách công việc. |
| Sau khi chuyển | Cụm thu gọn làm nổi icon workspace vừa chọn, vùng chính hiển thị dữ liệu của workspace đó. | Các nút tính năng ở thanh bên tiếp tục áp dụng trong phạm vi workspace mới. |

```mermaid
stateDiagram-v2
    [*] --> ThuGon
    ThuGon --> BungNgang: Bấm cụm icon
    BungNgang --> BungNgang: Giữ và kéo
    BungNgang --> DanhSachWorkspace: Đổi góc nhìn
    DanhSachWorkspace --> BungNgang: Trở về dãy ngang
    BungNgang --> ThuGon: Chọn icon workspace
    DanhSachWorkspace --> ThuGon: Chọn dòng workspace
```

Sơ đồ chỉ mô tả thay đổi góc nhìn và lựa chọn workspace. Kéo một mình không đổi workspace. Thời lượng, easing, độ mờ và ngưỡng nhận biết kéo thuộc thiết kế chuyển động, chưa ấn định số khi chưa có bản thử nghiệm.

## Trạng thái vùng Công việc và điện thoại

| Tình huống | Cách hiển thị và thao tác |
| --- | --- |
| Đang tải | Giữ workspace và điều hướng hiện tại; vùng Gantt/Danh sách thể hiện đang tải. |
| Workspace chưa có việc | Hiện thông tin chưa có việc và nút Tạo việc nếu người dùng có quyền. |
| Lọc không có kết quả | Hiện thông báo về bộ lọc và lối bỏ lọc. |
| Lỗi tải | Hiện lỗi ở đúng vùng đang xem và nút Thử lại. |
| Hết quyền workspace | Hiện thông báo không thể xem và lối chọn workspace còn quyền. |
| Điện thoại | Tên workspace đứng bên phải icon; bộ chọn bung ngang có thể giữ-kéo; Gantt cuộn ngang trong lưới; chi tiết việc mở thành màn riêng. Ba mục Công việc, Lịch trình, Thư viện vẫn cùng cấp. |

Các phần Q33 đã chốt của Lịch trình, Thư viện, Lớp học và bài giao có đặc tả riêng trong [chỉ mục UX](README.md); phần chưa chốt tra [phiếu Q33](../../review/blocked/ux-q33-review.md). Thứ tự ưu tiên giữa các dòng “Mục lưu ý” của workspace, quy cách biểu tượng và thông số chuyển động chi tiết chưa ấn định từ tài liệu này.
