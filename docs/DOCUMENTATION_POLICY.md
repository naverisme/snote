# Quy ước tài liệu SNOTE v2

**Phạm vi quyết định:** cấu trúc và quy tắc quản lý `docs/` trên nhánh `s_note_v2`. Việc chốt cấu trúc **không đồng nghĩa** với duyệt nội dung, sơ đồ, hợp đồng, kế hoạch hoặc kết luận sẵn sàng coding đã viết trước đây.

## 1. Vai trò của `docs/`

`docs/` là nơi lưu các mô tả sản phẩm và hệ thống có giá trị tham chiếu lâu dài: yêu cầu, quyết định được duyệt, thiết kế, giao diện hợp đồng, tiêu chí kiểm chứng và vận hành. Tài liệu có thể ở trạng thái nháp để cùng đánh giá; đường dẫn trong `docs/` không tự cấp hiệu lực phê duyệt.

| Nhóm đích | Nội dung thuộc nhóm | Ranh giới |
| --- | --- | --- |
| `product/` | Vấn đề, mục tiêu, người dùng, phạm vi sản phẩm, thuật ngữ và phạm vi từng phiên bản. | Không chứa đặc tả màn hình hay danh sách việc phải làm. |
| `requirements/` | Yêu cầu chức năng và phi chức năng, luồng nghiệp vụ, quy tắc, ngoại lệ, vai trò và ma trận quyền, điều kiện chấp nhận ở mức nghiệp vụ. | Không quyết định bố cục giao diện hoặc payload API. |
| `ux/` | Điều hướng, cấu trúc màn hình, thứ bậc thành phần, vị trí, kiểu, hành vi, trạng thái và wireframe đã được thảo luận. | Không đặt quy tắc quyền chỉ trong hình vẽ; quy tắc đó phải ở `requirements/`. |
| `architecture/` | Ranh giới hệ thống và module, mô hình dữ liệu, giao dịch, bảo mật, triển khai ở mức thiết kế và quyết định kiến trúc (ADR). | Không dùng sơ đồ để thay thế hợp đồng trường dữ liệu hay endpoint. |
| `contracts/` | Hợp đồng API và dữ liệu giữa các thành phần: endpoint, schema, định dạng, lỗi, phân trang, quyền thực thi và ví dụ. | Quyền nghiệp vụ bắt nguồn từ `requirements/`; hợp đồng diễn đạt cách thực thi quyền. |
| `verification/` | Ma trận truy vết, ca và phương pháp nghiệm thu, chiến lược kiểm thử và cách đo các yêu cầu phi chức năng. | Tiêu chí nghiệp vụ ở `requirements/`; kết quả chạy, log và báo cáo từng lần kiểm thử ở hệ thống/đầu ra thực thi, có liên kết đến đây. |
| `operations/` | Yêu cầu và quy trình môi trường, phát hành, giám sát, sao lưu, phục hồi, ứng phó sự cố. | Sơ đồ topology ở `architecture/`; các bước thực hiện và kiểm tra ở đây. |

Chỉ tạo thư mục khi đã có tài liệu đúng phạm vi. `docs/README.md` là chỉ mục; tệp này là quy ước phân loại, không thay thế mục lục hoặc nội dung của bảy nhóm.

## 2. Nội dung nằm ngoài `docs/`

| Loại | Nơi quản lý |
| --- | --- |
| Công việc đang chạy, phân công agent, người chịu trách nhiệm, trạng thái, deadline và thứ tự ưu tiên | GitHub Issues/Projects hoặc công cụ quản lý công việc được chọn; liên kết đến tài liệu nền khi cần. Kế hoạch mốc được duyệt có thể là tài liệu tham chiếu, nhưng không thay thế bảng công việc đang chạy. |
| Mã nguồn, migration, cấu hình thực thi, test tự động, fixture | Thư mục mã nguồn tương ứng trong repo. |
| Log, ảnh chụp chạy thử, kết quả CI, báo cáo từng lần chạy, bản build | Hệ thống CI/release hoặc nơi lưu bằng chứng được chỉ định; dẫn liên kết từ ca/điều kiện kiểm chứng nếu cần. |
| Ghi chép thô, ảnh hoặc bản vẽ chưa chọn, trích xuất nghiên cứu | Nguồn hoặc khu vực làm việc được gắn nhãn nháp; chỉ đưa vào `docs/` khi chuyển thành tài liệu có mục đích, nguồn và trạng thái rõ ràng. Tệp nguồn chỉnh sửa của sơ đồ được giữ cạnh sơ đồ nếu cần để bảo trì. |

Không tuyên bố dự án tuân thủ một tiêu chuẩn bên ngoài chỉ vì cấu trúc này tương đồng với cách phân tách thường gặp. Nếu áp dụng tiêu chuẩn cụ thể, ghi rõ phiên bản, điều khoản liên quan, chỗ áp dụng và bằng chứng đối chiếu.

## 3. Trạng thái và quyền quyết định

Mỗi tài liệu mới hoặc được rà soát lại phải ghi ở đầu tài liệu: **Trạng thái** (`Nháp`, `Chờ duyệt`, `Đã duyệt`, `Thay thế`), **phạm vi/phiên bản áp dụng**, **người chịu trách nhiệm**, **ngày cập nhật**, và **liên kết quyết định/PR duyệt** nếu đã duyệt. Thiếu thông tin duyệt thì coi là **chưa duyệt**. Trạng thái trong văn bản do người viết tự gán không thay thế bằng chứng phê duyệt.

Chủ sản phẩm duyệt bài toán, phạm vi, quy tắc nghiệp vụ, quyền và trải nghiệm. Người phụ trách kỹ thuật đề xuất, rà tính nhất quán và duyệt chi tiết kỹ thuật trong phạm vi đã được chủ sản phẩm xác nhận. Thay đổi ảnh hưởng hai phía cần cả hai xem xét. Quyết định được ghi ở PR/issue hoặc biên bản có liên kết từ tài liệu; không suy diễn sự đồng ý từ sự tồn tại của tệp.

Khi hai nguồn mâu thuẫn, ưu tiên quyết định đã duyệt còn hiệu lực cho đúng phạm vi và phiên bản; nếu chưa có quyết định hoặc hai quyết định cùng hiệu lực xung đột, ghi rõ hai cách hiểu và báo người chịu trách nhiệm trước khi thực hiện phần bị ảnh hưởng. Không áp dụng máy móc thứ tự thư mục để phân xử mâu thuẫn.

## 4. Chuyển từ hồ sơ hiện tại

Các tệp hiện có trong `docs/requirements/`, `docs/architecture/` và `docs/delivery/` là **tư liệu đầu vào cần thẩm định lại**. Chúng được giữ nguyên đường dẫn để không phá liên kết và lịch sử. `delivery/` là cấu trúc cũ, không phải nhóm thứ tám đã duyệt. Chỉ chuyển hoặc tách từng tài liệu sang nhóm đích sau khi xác nhận mục đích, nội dung, người quyết định và trạng thái; một tệp cũ có thể phải tách ra nhiều nhóm.

Các nhận định “đã khóa”, “đủ để coding”, phân công agent và cổng mốc trong tệp cũ không tự có hiệu lực. Tám bước chuẩn bị trước coding vẫn là khung kiểm soát đã thống nhất; dữ liệu và đầu ra của từng bước phải được duyệt lại trước khi dùng làm cơ sở giao coding. Sửa chỉ mục và các liên kết khi chuyển tài liệu; giữ tham chiếu đến bản cũ hoặc ghi rõ tệp thay thế.
