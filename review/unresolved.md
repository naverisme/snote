# Điểm chưa chốt — SNOTE v2

Các mục dưới đây là **câu hỏi cần quyết định**, không phải đặc tả hay danh sách việc đã giao. Nguồn đối chiếu và phạm vi kiểm kê ở [provenance](provenance.md). Không dùng nội dung lịch sử Git để tự điền câu trả lời.

| Mã | Loại | Phần thiếu hoặc xung đột | Phần bị chặn |
| --- | --- | --- | --- |
| R-01 | Chưa xác nhận một phần | Hôm nay/Ngày mai đã tính theo hạn hoặc buổi làm riêng và không lặp. Còn thiếu thứ tự ưu tiên giữa quá hạn, đến hạn, lịch làm, các mức quan trọng và cách phá hòa. | Sắp xếp, truy vấn và tiêu chí nghiệm thu công việc. |
| R-02 | Chưa xác nhận | Toàn bộ thao tác của từng vai trò, quyền xóa của lớp trưởng, quy tắc ủy quyền/thu hồi và tình huống nhiều quản trị viên cùng nhóm. | Ma trận quyền và API thực thi. |
| R-03 | Chưa xác nhận một phần | Đã chốt hiển thị riêng số việc xong/tổng, checklist từng việc và cập nhật văn bản, chưa có phần trăm chung. Còn thiếu quyền cập nhật văn bản và quyền đọc bài ở nhóm khác. | Bảng tiến độ lớp và hợp đồng dữ liệu. |
| R-04 | Chưa xác nhận | Quy tắc gắn phản hồi vào phiên bản nộp, đổi hạn sau nộp, xóa/thu hồi bản nộp và xử lý nhiều người có quyền nộp. | Luồng nộp đầy đủ và hợp đồng phiên bản. |
| R-05 | Chưa xác nhận | Thành phần, số lượng và vị trí nút của từng màn; thao tác/lệnh từng nút; cách vẽ Gantt, màn hình hẹp và trạng thái tải/trống/lỗi. | Wireframe và đặc tả UX chi tiết. |
| R-06 | Chưa xác nhận | Ranh giới module, schema dữ liệu, lựa chọn công nghệ, API, mã lỗi, phân trang, đồng bộ và triển khai. | `architecture/` và `contracts/`. |
| R-07 | Chưa xác nhận | Định dạng file hỗ trợ, metadata bắt buộc, cách lưu nhanh từ các nền tảng, toàn văn web, quy tắc Hộp thu khi đổi workspace mặc định. | Thư viện và hợp đồng lưu trữ. |
| R-08 | Chưa xác nhận | Ca nghiệm thu đầy đủ, mục tiêu phi chức năng, môi trường và lịch triển khai; kế hoạch và sở hữu tệp khi coding song song. Phạm vi phát hành đầu cần đối chiếu với yêu cầu Giáo viên có lối vào Lớp học ngay sau đăng ký. | `verification/`, `operations/` và phân công coding. |
| R-09 | Đề xuất chưa xác nhận phạm vi | Mẫu bài giao, so sánh tiến độ các nhóm, nhắc hạn và lưu trữ lớp được nêu là tính năng giai đoạn sau; chưa chốt từng hành vi và mốc phát hành. | Phạm vi sản phẩm và đặc tả giáo viên. |

Nguồn xung đột cũ gồm [quyết định](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/requirements/decisions.md), [mô hình dữ liệu](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/architecture/data-model.md) và [giao diện](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/architecture/frontend-information-architecture.md). Phần nào đã có quyết định mới nằm trong `docs/`; các câu hỏi còn lại ở bảng trên.
