# Vận hành bản đầu SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Trạng thái | Thiết kế pilot theo quyền tự quyết [SRC-27](../../review/provenance.md); giá tiền, máy chủ và nhà cung cấp chỉ khóa khi có báo giá/môi trường thực |
| Mục tiêu | Giữ được bản nộp và lịch sử, khôi phục được cả metadata và bytes, không lẫn dữ liệu nhóm |

| Thành phần | Triển khai và theo dõi |
| --- | --- |
| Web | Tài sản tĩnh build từ frontend; TLS, cấu hình URL backend theo môi trường, không để secret trong bundle |
| Backend | Một ứng dụng module, worker có thể cùng bản triển khai hoặc process riêng; chỉ một version schema tương thích tại mỗi thời điểm phát hành |
| PostgreSQL | Volume bền, migration có kế hoạch kiểm/rollback, backup có kiểm tra phục hồi; giới hạn kết nối, theo dõi giao dịch lỗi/quota tranh chấp |
| Tệp | Storage adapter: local volume bền cho môi trường thử cô lập; triển khai nhiều máy/đòi độ bền dùng object storage tương thích. Không dùng `localStorage` của trình duyệt để chứa tệp người dùng. Theo dõi bytes hiện hành, lịch sử, rác, staging và snapshot nộp tách biệt |
| Công việc nền | Hàng việc/biên nhận có thử lại và khóa chống lặp; kiểm quyền/trạng thái tại điểm phát nhắc, kiểm URL/phiên bản trước cập nhật preview, dọn staging đã chứng minh không còn tham chiếu |

**Môi trường:** development dùng dữ liệu giả; staging phục hồi từ backup thử đã loại dữ liệu nhạy cảm hoặc dữ liệu giả; production/pilot tách secret, bucket/volume, DB và domain. Docker Compose phù hợp môi trường đơn máy pilot nhưng không tự cung cấp backup, tính sẵn sàng cao hay scale ngang. Kết nối đến tệp/DB phải có kiểm tra sức khỏe; lỗi kho tệp làm upload dừng và giữ dữ liệu cũ, còn đọc không liên quan có thể tiếp tục nếu an toàn.

**Google Sign-In:** tạo OAuth Client ID loại Web application theo [hướng dẫn Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid); thêm đúng origin của web (development: `http://localhost:5173`, production: origin HTTPS thực tế) vào Authorized JavaScript origins. Đặt cùng Client ID ở `GOOGLE_CLIENT_ID` của API và `VITE_GOOGLE_CLIENT_ID` của web rồi build lại web; Client ID là public, không đặt client secret trong bundle. Không bật nút Google khi chưa cấu hình cả hai phía. API [xác minh ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token) gồm chữ ký, audience, issuer, thời hạn và `email_verified`. Áp dụng migration `20261111120000_google_identity` trước khi phát hành API. Luồng thực với Google chỉ xác nhận được khi có Client ID và origin hợp lệ của môi trường triển khai (UNKNOWN).

**Sao lưu và phục hồi:** sao lưu metadata cùng danh sách phiên bản tệp/tham chiếu ở mốc tương thích; giữ bản sao ngoài máy chủ chính và kiểm tra restore định kỳ vào môi trường cách ly. Trước dọn rác sau restore phải đối soát và bảo đảm có đủ bytes của mọi revision nộp. Pilot đặt mục tiêu phục hồi dữ liệu trong vòng **24 giờ** kể từ mốc sao lưu đã kiểm tra và đưa dịch vụ trở lại trong **8 giờ** từ lúc bắt đầu khôi phục; đây là mục tiêu thiết kế cần diễn tập, không phải cam kết đã đo. Nếu hosting không đáp ứng, điều chỉnh mục tiêu công khai trước khi phát hành. Cách giữ bản nộp bất biến không đồng nghĩa được giữ vô hạn mọi backup vật lý; phải quy định vòng đời backup theo ngân sách/điều kiện sử dụng.

**Phát hành:** migration tương thích bản đang chạy, backup/điểm phục hồi, chạy migration, phát hành backend rồi frontend, kiểm luồng đăng nhập/quyền, tạo tệp, Nộp và đọc bản cũ. Lỗi rollback mã ứng dụng tương thích schema; migration phá hủy phải có phương án phục hồi đã thử, không rollback tự động mà không xác định trạng thái tệp. Ghi version và mốc phát hành vào báo cáo vận hành.

**Giám sát:** độ trễ/lỗi endpoint, lượng tệp staging, biên nhận pending quá lâu, quota logic và bytes vật lý, thất bại preview, lỗi đối soát, thất bại backup/restore, hàng nhắc lịch; cảnh báo trước khi chạm ngân sách vật lý. Log chứa requestId, actor/scope/action không chứa nội dung riêng, mật khẩu, token hoặc bytes. Không tự đặt ngưỡng byte vật lý trước khi chọn máy chủ: khi cấu hình triển khai phải đặt ngân sách và ngưỡng cảnh báo, thử tình huống hết chỗ theo QA-06/07.

**Chưa thể đóng cổng triển khai thực tế:** nơi chạy, chi phí, công suất, ngân sách bytes vật lý, khóa bí mật, đối tượng thử và diễn tập restore phải được ghi bằng giá trị thực của môi trường. Đây là đầu vào vận hành, không làm thay đổi quy tắc sản phẩm đã chốt.
