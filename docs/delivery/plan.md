# SNOTE v2 — Lộ trình, ước lượng và kế hoạch nghiệm thu

**Bản lập kế hoạch.** Tuần tính từ lúc bắt đầu dự án. Mốc và chi phí là giả định nội bộ để so sánh phạm vi. Sau khi hoàn thành mốc thiết kế đầu tiên, dùng thời gian thực tế để ước lượng lại.

## 1. Timeline và điều kiện qua mốc

| Mốc | Tuần giả định | Phụ thuộc | Đầu ra và tiêu chí qua mốc |
|---|---:|---|---|
| M0 · Chốt hồ sơ | 1 | Phạm vi người dùng | Duyệt SRS, quyền, sơ đồ, thứ tự phát hành và các quyết định ảnh hưởng trực tiếp đến M1. Mã yêu cầu liên kết được với ca nghiệm thu. |
| M1 · Nền tảng và cá nhân | 2–4 | M0 | Đăng nhập, workspace cá nhân, Hộp thu, tìm kiếm, việc, lịch làm và checklist. Chạy AT-01 phần cá nhân và AT-02 với dữ liệu giả. |
| M2 · Cộng tác | 5–6 | M1 | Lời mời, giao việc, lịch nhóm và chia sẻ tài nguyên. Hoàn tất AT-01, AT-03 và ca thu hồi quyền của AT-05. |
| M3 · Lớp học | 7–9 | M2, duyệt D-01 và D-04 | Tạo lớp, chia nhóm, giao bài, gắn phần việc, tiến độ, nộp và phản hồi. Chạy AT-04, AT-05 và AT-06 với hai nhóm. |
| M4 · Thử nghiệm và phát hành | 10–11 | M3 | Nghiệm thu người dùng, đo NFR, diễn tập phục hồi, kiểm tra staging và bàn giao vận hành. Người phụ trách sản phẩm duyệt phát hành. |
| Dự phòng | 12 | Theo tình hình | Xử lý phát hiện kiểm thử, sai lệch ước lượng hoặc lịch nghiệm thu. |

Giả định một người thực hiện khoảng 22 giờ tập trung mỗi tuần, có người duyệt sản phẩm và người dùng thử theo mốc. Lịch tuần là cửa sổ làm việc theo thứ tự phụ thuộc. Nếu phát sinh nhánh ngoài phạm vi, cập nhật ước lượng và quyết định có dời phát hành hay không.

## 2. Ước lượng công sức và chi phí

| Hạng mục | Giờ thấp | Giờ cao | Nội dung |
|---|---:|---:|---|
| M0 · Hồ sơ và quyết định | 12 | 20 | Rà yêu cầu, duyệt quyền và thiết kế cần cho M1. |
| M1 · Nền kỹ thuật và cá nhân | 40 | 58 | Dựng nền, phiên, dữ liệu và luồng cá nhân, gồm kiểm thử. |
| M2 · Cộng tác | 30 | 45 | Thành viên, giao việc, lịch nhóm, chia sẻ, kiểm tra quyền. |
| M3 · Lớp học | 42 | 64 | Bài giao, tiến độ, nộp, phản hồi và chống gửi trùng. |
| M4 · Nghiệm thu và phát hành | 20 | 28 | Staging, kiểm thử tải, phục hồi và bàn giao. |
| **Tổng cơ sở** | **144** | **215** | Bao gồm triển khai, kiểm tra theo mốc và sửa lỗi dự kiến. |
| **Tổng có dự phòng 10%** | **159** | **237** | Làm tròn lên theo giờ. |

Với **đơn giá giả định 150.000 đồng/giờ**, chi phí quy đổi công sức khoảng **23,85–35,55 triệu đồng**. Đây là ví dụ tính ngân sách, có thể thay đơn giá và năng lực thực tế. Hạ tầng, công cụ trả phí, tên miền và thuế được tính riêng. Nếu tự thực hiện, theo dõi giờ công và tiền mặt ở hai cột riêng.

Chi phí vận hành tháng gồm Web/API, PostgreSQL, lưu bản sao và quan sát hệ thống. Tên miền quy đổi theo tháng hoặc ghi khoản năm. Điền đơn giá thực tế sau khi chọn nhà cung cấp và xác định tải. Mức đầu tư ban đầu bằng chi phí công sức, khoản thiết lập một lần và phần hạ tầng trong thời gian chạy thử.

## 3. Ma trận nghiệm thu

| Ca | Yêu cầu chính | Dữ liệu và cách kiểm |
|---|---|---|
| AT-01 · Lưu, tìm, chia sẻ | FR-02, FR-03, FR-12 | Chủ lưu URL, tìm lại sau tải lại, chia sẻ vào nhóm. Người ngoài không tìm thấy hoặc mở được. |
| AT-02 · Kế hoạch cá nhân | FR-04 đến FR-08 | Việc quan trọng còn ba ngày và việc đến hạn hôm nay. Thêm lịch làm cùng ngày, xác nhận bộ đếm, sửa checklist và kiểm tra bước tiếp theo. |
| AT-03 · Giao việc và lịch nhóm | FR-07, FR-09 đến FR-11 | Mời thành viên, giao việc, đặt lịch riêng, đổi hạn chung và giờ họp. Cả hai tài khoản đọc lại đúng dữ liệu. |
| AT-04 · Giao bài đến phản hồi | FR-13 đến FR-17 | Hai nhóm cùng nhận bài. Nhóm A cập nhật, nộp và đọc phản hồi. Nhóm B xem bài riêng, dữ liệu bài nộp nhóm A bị từ chối. |
| AT-05 · Quyền và thu hồi | FR-09, FR-11, FR-12, FR-15, NFR-01 | Kiểm tra danh sách, tìm kiếm, URL trực tiếp và thao tác sửa sau khi gỡ thành viên hoặc thu hồi chia sẻ. |
| AT-06 · Thử lại khi nộp | FR-01, FR-16, NFR-06 | Hai lần nộp cùng khóa. Sau đó thử cùng khóa khác dữ liệu và phiên hết hạn. Xác nhận một bản nộp cho cùng yêu cầu hợp lệ. |
| Kiểm tra phi chức năng | NFR-02 đến NFR-05 | Ghi số đo tải, thao tác bàn phím, kiểm tra nhật ký và diễn tập phục hồi. |

Thực hiện kiểm thử đơn vị cho quy tắc ngày, thứ tự checklist và trạng thái. Kiểm thử tích hợp trên cơ sở dữ liệu cho quyền, phạm vi, giao dịch và khóa thử lại. Chạy nghiệm thu qua giao diện cho mỗi nhóm vai trò, sau đó cho người dùng thử làm theo tình huống của họ.

## 4. Bàn giao và điều kiện phát hành

- Mỗi kết quả kiểm thử ghi mã FR/AT, commit, môi trường, dữ liệu mẫu, người thực hiện, kết quả và lỗi liên quan.
- Hoàn thành toàn bộ ca bắt buộc của mốc. Lỗi làm lộ dữ liệu, sai quyền, mất dữ liệu hoặc sai bản nộp phải xử lý trước khi phát hành.
- Người phụ trách duyệt chỉ tiêu NFR, tài liệu cấu hình, cách theo dõi sự cố, kết quả phục hồi và hướng dẫn quay lui theo [sơ đồ triển khai](../architecture/deployment.md).
- Báo cáo sau chạy thử ghi điều người dùng hoàn thành được, trở ngại và các yêu cầu cần cập nhật. Hạng mục ngoài phạm vi được đưa vào vòng kế hoạch tiếp theo.
