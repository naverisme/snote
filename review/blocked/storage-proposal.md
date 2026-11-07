# Q34 — Phương án lưu dữ liệu và tệp SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Đề xuất kỹ thuật để duyệt; chưa là mô hình dữ liệu/hợp đồng API |
| Quy tắc nguồn | [Thư viện và Hộp thu](../../docs/requirements/library.md), [workspace cá nhân](../../docs/requirements/accounts-and-workspaces.md), [phiên bản bản nộp](../../docs/requirements/assignments-and-submissions.md) |
| Đầu vào công nghệ | React/TypeScript/Vite/Tailwind, NestJS, PostgreSQL/Prisma, REST, Git/GitHub, Docker/Compose; người dùng đồng ý điều chỉnh bảo mật. Phương án kho tệp và quy mô còn cần chọn. |

## Tách theo loại dữ liệu

| Loại | Nơi lưu đề xuất | Lưu ý |
| --- | --- | --- |
| Văn bản/ghi chú | PostgreSQL: nội dung và thông tin mục | I6 đã chốt hành vi danh sách tự động, nhận URL và thẻ xem trước đầu tiên; cách lưu biểu diễn và cách lấy metadata là thiết kế còn mở. |
| Đường dẫn | PostgreSQL: URL và thông tin người dùng nhập | I7 đã chốt nhận URL thiếu giao thức và không lưu toàn văn trang ở bản đầu; cách lấy ảnh bìa và kiểm tra link còn sống chưa chốt. |
| Thư mục và Hộp thu | PostgreSQL: quan hệ thư mục, mục, workspace, người sở hữu, phạm vi riêng/chung | Hộp thu trong workspace cá nhân mặc định, chỉ người đó có quyền. |
| Tệp | Nội dung nhị phân ở kho tệp bền vững; PostgreSQL giữ khóa kho, tên gốc, loại, kích thước, dấu kiểm tra và quan hệ mục | Backend xét quyền hiện hành trước khi đọc/tải. Không công khai thư mục tệp. |
| Bản nộp | PostgreSQL giữ phiên bản và tham chiếu không thay đổi tới nội dung đã nộp | Sửa/xóa mục ở Thư viện không được làm mất bản nộp lịch sử. |

## Phương án kho tệp

| Phương án | Hợp khi | Điều kiện |
| --- | --- | --- |
| Thư mục trên một máy chủ, gắn Docker volume bền vững | Thử nghiệm nhỏ, một máy chủ | Sao lưu tệp ra nơi khác, theo dõi dung lượng, thử phục hồi. Không để tệp trong image hoặc filesystem tạm container. |
| Dịch vụ S3 được quản lý | Muốn tách dữ liệu khỏi máy chạy backend | Xác định chi phí, vùng lưu, quyền và sao lưu/phiên bản theo nhu cầu. |
| MinIO AIStor | Nếu cần tự vận hành kho S3 tương thích và chấp nhận điều kiện giấy phép | Bản mã nguồn mở MinIO cũ đã ngừng được nhà cung cấp duy trì. AIStor Free giới hạn một máy, giấy phép thương mại; không coi MinIO OSS cũ là mặc định. |

**Khuyến nghị có điều kiện:** Khi bản đầu thử trên một máy chủ, dùng volume tệp bền vững + PostgreSQL, viết giao diện `FileStorage` trong backend để sau này chuyển sang S3. Quyết định kho tệp cuối cùng phụ thuộc quy mô, chi phí và môi trường Q37; chưa đi vào `docs/architecture/`.

## Luồng và tính toàn vẹn đề xuất

1. Chọn workspace/thư mục/Hộp thu, backend kiểm quyền theo đích.
2. Text và link được kiểm tra, ghi cùng thông tin thư mục, workspace vào PostgreSQL.
3. Tệp đi qua vùng tạm, kiểm tra loại và kích thước, dùng khóa ngẫu nhiên thay tên gốc, chuyển vào kho bền vững và chỉ đánh dấu sẵn sàng khi đã ghi đầy đủ. Có bước dọn bản tải dở và tệp mồ côi sau sự cố.
4. Mỗi lần tải, backend kiểm tra tư cách hiện hành; nếu dùng S3 thì chỉ cấp URL ngắn hạn sau kiểm quyền. URL đã cấp có thể còn dùng đến khi hết hạn, nên thời hạn cần thiết kế theo yêu cầu thu hồi quyền.
5. Sao chép từ cá nhân sang nhóm tạo bản sao có phạm vi quyền độc lập; bản nộp đã ghi giữ tham chiếu nội dung bất biến. Không để xóa bản gốc làm hỏng bản sao/bản nộp.
6. Sao lưu cả PostgreSQL lẫn kho tệp theo mốc có thể khôi phục và thử phục hồi. Mức mất dữ liệu tối đa, thời gian phục hồi và nơi lưu bản sao lưu đang mở ở Q37.

## Thông tin còn thiếu để chốt

- Một máy chủ tự quản hay đám mây; ước lượng số người, số tệp và tổng dung lượng.
- Loại tệp và mức thử nghiệm đã chốt ở LIB-11; còn cách tính bản sao/phiên bản trong 1 GB/workspace, hạn mức chính thức theo máy chủ và ngân sách.
- Cách lưu danh sách tự động trong văn bản, lấy ảnh bìa URL và bảo vệ quá trình lấy metadata; toàn văn trang đích không lưu trong bản đầu.
- Chọn volume máy chủ hay dịch vụ lưu đối tượng cho bản đầu; mức dự phòng, vị trí và chu kỳ sao lưu.

Nguồn kỹ thuật: [PostgreSQL sao lưu](https://www.postgresql.org/docs/current/backup.html) · [Docker volume](https://docs.docker.com/engine/storage/volumes/) · [NestJS tải tệp](https://docs.nestjs.com/techniques/file-upload) · [AWS S3 URL tạm](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) · [MinIO pháp lý và vòng đời](https://www.min.io/legal) · [AIStor Free](https://www.min.io/pricing) · [OWASP tệp tải lên](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
