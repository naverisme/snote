# SNOTE v2 — Wireframe frontend M1

**Bố cục đề xuất để duyệt trước khi dựng giao diện.** [Sơ đồ điều hướng](frontend-navigation.md) xác định đường đi giữa màn hình. Wireframe này đặt các thành phần vào từng màn hình. Màu xám trong hình chỉ để phân biệt vùng và nút chính.

![Wireframe M1 gồm năm màn hình máy tính và một ví dụ điện thoại](assets/m1-wireframes.svg)

## Vị trí và hành vi

| Màn hình | Bố cục | Thao tác và trạng thái |
|---|---|---|
| **Đăng nhập** | Form ở giữa, email trên mật khẩu, thông báo lỗi ngay dưới trường liên quan hoặc trước nút chính. | **Đăng nhập** ở cuối form. Đang gửi thì khóa gửi lặp. Khi phiên hết, đăng nhập lại rồi kiểm tra quyền vào đích cũ. |
| **Việc của tôi** | Tiêu đề và **+ Tạo việc** ở đầu vùng nội dung. Dưới là bộ lọc ngày, hai lối vào **Cần xử lý** và **Quan trọng**, rồi danh sách. | Chọn một bộ lọc đổi cùng danh sách. Mỗi dòng có tiêu đề, lý do, hạn hoặc thời lượng, và tiến độ checklist nếu có. Chọn dòng mở việc gốc. Đặt **Tải thêm** sau danh sách khi còn trang. |
| **Chi tiết việc** | Đường quay lại và tiêu đề trên cùng. **Đánh dấu hoàn thành** ở đầu màn hình. Checklist bên trái, **Lịch làm của tôi** bên phải trên máy tính. | **Sửa thông tin** cạnh thông tin việc. **+ Thêm mục** ở cuối checklist. **Lên lịch / Sửa lịch** trong vùng kế hoạch. Việc hoàn tất hiện **Mở lại** thay cho nút hoàn thành. Khi việc đóng, ẩn hoặc vô hiệu thao tác ghi checklist và kế hoạch, vẫn hiển thị dữ liệu đã lưu. |
| **Hộp thu nhanh** | **+ Lưu nhanh** cạnh tiêu đề. Ô tìm và bộ lọc trạng thái ngay dưới, danh sách ở giữa, tải thêm ở cuối. | Lưu nhanh mở form chọn URL hoặc văn bản. Mỗi dòng tài nguyên mở chi tiết. Trạng thái trống theo bộ lọc được hiển thị trong vùng danh sách. |
| **Chi tiết tài nguyên** | Đường quay lại và tiêu đề ở đầu. Nút **Mở nguồn** phía trên bên phải cho mục URL. Khối nội dung ở giữa, trường tiêu đề, nhãn và trạng thái bên dưới. | **Lưu sửa** ở cuối form. Mục văn bản giữ cùng vị trí hiển thị nội dung, bỏ nút mở nguồn. |
| **Điện thoại** | Thanh điều hướng trái chuyển thành menu trên thanh đầu. Mỗi màn hình xếp thành một cột. | Nút chính ở đầu màn hình hoặc cuối form tương ứng. Chi tiết việc xếp checklist trước lịch làm. Bộ lọc ngày xuống hai dòng khi thiếu chỗ. |

## Form và phản hồi

- **Tạo việc:** đặt tiêu đề trước, rồi mô tả, mức quan trọng và hạn. **Hủy** và **Lưu việc** ở chân form. Khi tạo thành công, mở chi tiết việc mới.
- **Lưu nhanh:** chọn loại trước, sau đó nhập URL hoặc văn bản, tiêu đề và nhãn tùy chọn. **Hủy** và **Lưu** ở chân form. Khi thành công, trở về danh sách và báo mục đã lưu. Nếu bộ lọc hiện tại loại mục mới, thông báo phải có đường mở mục.
- **Lên lịch:** hiển thị thời lượng trước, các khoảng làm tiếp theo, nút thêm khoảng bên dưới, **Hủy** và **Lưu lịch** ở chân form. Nhắc hạn gốc trong vùng thông tin để người dùng phân biệt với lịch riêng.
- **Đang tải, trống và lỗi:** giữ tiêu đề và điều hướng ổn định. Lỗi đọc đặt tại vùng nội dung với **Thử lại** khi phù hợp. Lỗi lưu giữ nguyên dữ liệu đã nhập. Khi không còn quyền, chuyển sang trạng thái không truy cập được, kèm đường quay về.
- Trên máy tính, form tạo có thể mở trong hộp thoại. Trên điện thoại, dùng màn hình dọc. Giữ cùng thứ tự trường, thao tác, thông báo và thứ tự tiêu điểm. Khi đóng form, trả tiêu điểm về nút mở nếu vẫn còn.

## Bàn giao frontend

- **A0:** khung điều hướng chung và đăng nhập. Đầu mối A sở hữu router gốc.
- **B1:** Hộp thu, form lưu nhanh và chi tiết tài nguyên.
- **C1:** form tạo việc, chi tiết và vùng checklist. Dữ liệu việc gốc thuộc C.
- **D1:** danh sách Việc của tôi và vùng kế hoạch. D bàn giao khối kế hoạch để C lắp vào chi tiết việc qua giao diện chung.
- **Q1:** kiểm tra đường đi, tiêu điểm, thao tác bằng bàn phím, vùng lỗi/trống và thứ tự nút trên máy tính lẫn điện thoại.

Đối chiếu từng thao tác với [hợp đồng API M1](m1-api-contract.md). Workspace nhóm, bài giao và bảng giáo viên thuộc M2–M3 và cần wireframe theo vai trò trước khi mở frontend của các mốc đó.
