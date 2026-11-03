# SNOTE v2 — Rà soát trước coding

**Kết luận:** đặc tả đủ để giao **A0 và Q0**. B1, C1 và D1 đã có phạm vi và hợp đồng để chuẩn bị, nhưng chỉ mở nhánh coding sau khi nền A0 có bằng chứng chạy được. M2 và M3 còn cổng khóa hợp đồng riêng. Tài liệu này ghi rõ điều kiện chuyển bước, không ghi nhận các kiểm tra phần mềm đã chạy.

## 1. Thứ tự đọc và xử lý mâu thuẫn

1. [SRS](../requirements/srs.md) xác định hành vi và phạm vi theo mốc. [Quyết định M0](../requirements/decisions.md) cụ thể hóa các lựa chọn nghiệp vụ đang dùng để triển khai.
2. [Hợp đồng M1](../architecture/m1-api-contract.md) chi phối tên trường, định dạng, mặc định, lỗi và dữ liệu trao đổi trong M1. Hợp đồng dùng chung viết trong code ở A0 phải khớp tài liệu và ví dụ. Các sơ đồ và bảng tổng quan giải thích bối cảnh.
3. Nếu phát hiện lệch giữa tài liệu, code và ca nghiệm thu, mở đề xuất ghi mã FR, quy tắc, hai cách hiểu, thay đổi dự kiến và các agent chịu ảnh hưởng. A điều phối quyết định kỹ thuật. Chủ sản phẩm xử lý thay đổi nghiệp vụ. Ghép tài liệu và hợp đồng trước khi tiếp tục phần bị ảnh hưởng.

## 2. Phiếu giao A0 và Q0

| Phiếu | Phạm vi và đầu ra | Bằng chứng hoàn thành |
|---|---|---|
| **A0.1 · Nền** | Tạo root monorepo, web, API, gói hợp đồng, DB dev/test, lockfile, cấu hình mẫu và script dùng chung. Chọn phiên bản runtime/thư viện và ghi cách chạy từ checkout mới. | Cài bằng lockfile, khởi động web/API, kiểm tra kiểu, build và kiểm tra API hoạt động. Ghi lệnh và kết quả tại SHA bàn giao. |
| **A0.2 · Phiên và workspace** | Tạo mô hình tài khoản, phiên, workspace cá nhân. Tạo tài khoản giả và workspace bằng seed chạy lại được. Tạo các thao tác phiên và cổng xác thực theo hợp đồng M1. | Hai tài khoản truy cập đúng workspace. Gọi đọc phiên sau đăng xuất trả 401. Seed hai lần giữ đúng một workspace cá nhân mỗi tài khoản. |
| **A0.3 · Khóa đường biên** | Đưa schema dùng chung, mã lỗi, ví dụ JSON, cổng đọc việc và phân loại dữ liệu vào gói hợp đồng. Dành thư mục cho B/C/D và ghi quy tắc ghi tệp dùng chung. Chốt đề xuất schema cho tài nguyên, việc và kế hoạch đủ để B/C/D làm trên DB test. | Ví dụ qua cùng schema mà API và web dùng. Các migration nền chạy trên DB trắng và seed hoạt động. Chủ B/C/D có thể chạy kiểm tra hợp đồng từ cùng SHA. |
| **Q0 · Thiết kế kiểm thử** | Chuyển AT-01 phần cá nhân và AT-02 thành ca độc lập. Chuẩn bị dữ liệu, đồng hồ cố định, kỳ vọng và ma trận quyền. Sau khi A0 có môi trường thì cắm kiểm thử xuyên luồng vào nền chung. | Mỗi ca có người dùng, dữ liệu, thao tác, kết quả, mã FR/AT và điều kiện lỗi. Q có thể chuẩn bị ca từ tài liệu khi A0 đang dựng repo. |

A0 bàn giao **một SHA**, lệnh cài/chạy/kiểm tra, cấu hình mẫu, phiên bản hợp đồng và kết quả. Q ghi bảng kết quả riêng với trạng thái **chưa chạy / đạt / lỗi**. Các đường dẫn hoặc lệnh ở A0 chỉ được coi đã bàn giao khi kiểm tra từ checkout sạch.

## 3. Phân công M1 ở mức PR

| Gói | Phần bàn giao | Kiểm tra bắt buộc và giới hạn |
|---|---|---|
| **B1 · Hộp thu** | UI và API tạo, đọc, phân loại, lọc và tìm URL/văn bản. Sở hữu `resources`. | FR-02, FR-03. Lưu và tải lại, tìm cả mục đã xử lý, lỗi URL giữ nội dung, tài khoản khác không đọc qua API hoặc tìm kiếm. Chia sẻ sang nhóm thuộc M2. |
| **C1 · Công việc** | UI và API tạo, sửa, hoàn thành/mở lại, tạo và đánh dấu checklist, cổng đọc việc có quyền. Sở hữu `tasks`. | FR-04, FR-06. Việc chưa có hạn, checklist trống, cập nhật lặp, mục sai việc, việc đóng và từ chối tài khoản ngoài. Mở lại giữ checklist. |
| **D1 · Kế hoạch** | UI và API thời lượng, lịch làm, Việc của tôi và gợi ý. Sở hữu `planning`. D dùng cổng C qua ví dụ giả trước khi ghép. | FR-05, FR-07, FR-08. Kiểm tra trùng lý do, khoảng qua nửa đêm, ngày theo múi giờ, quá hạn và thứ tự gợi ý. Dời lịch giữ nguyên hạn. |
| **Q1 · Nghiệm thu** | Kiểm thử xuyên module bằng dữ liệu seed cố định. | AT-01 phần cá nhân, AT-02, kiểm tra quyền xuyên tài khoản và các luồng bàn phím M1. Q ghi báo cáo, chủ module sửa lỗi. |

A chịu trách nhiệm cho route tổng, migration, lockfile và CI. B, C, D quản lý cả giao diện và API trong thư mục tính năng riêng. Khi cần thêm trường dữ liệu, thư viện hoặc route gốc, agent gửi yêu cầu cho A kèm mã FR và ảnh hưởng. Nhánh tính năng có thể tiếp tục với dữ liệu giả khi thay đổi chung đang được xử lý.

## 4. Cổng kiểm tra và cách ghép

| Cổng | Điều kiện đạt | Khi có lỗi |
|---|---|---|
| **G0 · Mở M1** | Checkout mới chạy được nền, DB trắng migrate, seed chạy lại, phiên và workspace qua ca A0, gói hợp đồng và ví dụ đã ghép, công bố SHA cho B1/C1/D1/Q1. | A sửa nền hoặc hợp đồng. Q vẫn chuẩn bị ca. Chỉ mở nhánh tính năng khi đủ bằng chứng. |
| **G1 · Kết thúc M1** | Build, kiểm tra kiểu, kiểm thử module và tích hợp đạt. B và C đã ghép. D chạy trên cổng thật của C. Q xác nhận AT-01 phần cá nhân, AT-02 và ca trái quyền. | Giao lỗi theo chủ module. Nếu cần đổi hợp đồng, ghép thay đổi chung trước. Chạy lại trên SHA mới. |
| **G2 · Mở và kết thúc M2** | Trước mở nhánh: khóa trạng thái lời mời, membership, quyền giao lại, tài nguyên chia sẻ và lịch nhóm. Khi kết thúc: AT-01 đầy đủ, AT-03 và thu hồi quyền đạt. | Tách lỗi quyền khỏi lỗi giao diện. Không đưa dữ liệu nhóm vào thử nghiệm khi ca cô lập còn lỗi. |
| **G3 · Mở và kết thúc M3** | Trước mở nhánh: khóa cơ chế tham gia lớp, đổi nhóm/trưởng nhóm, công bố bài, phạm vi tiến độ, quyền sau rời nhóm và nộp. Khi kết thúc: AT-04 đến AT-06 đạt, thử đồng thời và thử lại cho cùng bản nộp. | Giữ luồng lớp ở staging, chốt chính sách còn mơ hồ và chạy lại bằng hai nhóm. |
| **G4 · Phát hành** | Người phụ trách sản phẩm duyệt nghiệm thu, chỉ tiêu phi chức năng, tài khoản/đối tượng thật, vòng đời dữ liệu, ngân sách và diễn tập phục hồi. | Ghi nguyên nhân và bằng chứng. Chỉ phát hành khi các điều kiện bắt buộc của mốc đạt. |

Quy trình ghép một gói: xác nhận SHA gốc → rà quyền sở hữu tệp → xem thay đổi hợp đồng/migration → chạy kiểm tra trên kết quả ghép → ghi SHA và ca đã chạy. Nếu phát hiện xung đột hành vi, A tạm dừng ghép gói liên quan và thống nhất một quy tắc với các chủ module. Xung đột về dữ liệu ưu tiên kiểm tra cả DB trắng và dữ liệu từ mốc trước.

## 5. Các quyết định được giữ trước mốc liên quan

- **Trước G0:** A ghi rõ runtime, công cụ package manager, cách chạy DB test, cách lưu và thu hồi phiên, cách kiểm tra cấu hình cookie và cách tái tạo dữ liệu mẫu. Đây là đầu ra của nền kỹ thuật.
- **Trước mở M2:** chốt phép thu hồi/tạo lại lời mời, ai cấp hoặc thu hồi quyền chia sẻ, quy tắc chuyển người phụ trách và ảnh hưởng đến lịch cá nhân.
- **Trước mở M3:** xác nhận bằng dữ liệu giả các mặc định về quyền giáo viên, một nhóm mỗi lớp và một bản nộp đúng hạn. Chốt trạng thái bài giao, chuyển nhóm và quyền đọc bài nộp sau rời nhóm.
- **Trước G4:** đo chỉ tiêu thực tế, xác nhận RPO/RTO, lưu trữ dữ liệu và quyền phát hành với người phụ trách. Xem [kế hoạch bàn giao](plan.md).

**Trạng thái hiện tại:** hồ sơ đã đến điểm giao A0/Q0. Chưa có SHA nền, nhánh tính năng, kết quả build ứng dụng hoặc ca kiểm thử đã chạy để mở G0.
