# SNOTE v2 — Đặc tả yêu cầu phần mềm

**Bản 0.1 · Đề xuất để duyệt.** SNOTE giúp sinh viên lưu và tìm lại kiến thức, biết việc tiếp theo cần làm và phối hợp trong nhóm. Giáo viên giao bài, theo dõi tiến độ và phản hồi trong lớp phụ trách. Tài liệu này quy định hành vi đích của v2. Mã UC và AT nằm trong [Sơ đồ 1](use-cases.md), luồng bàn giao trong [Sơ đồ 2](business-workflows.md) và điều kiện cấp quyền trong [ma trận phân quyền](permissions.md).

## Phạm vi theo mốc

| Mốc | Phạm vi | Kết quả quan sát được |
|---|---|---|
| M1 · Cá nhân | Phiên, workspace cá nhân, Hộp thu URL/văn bản, tìm kiếm, việc, checklist, lịch làm và Việc của tôi. | Người dùng lưu lại một nguồn, lên lịch một việc, mở lại và biết bước kế tiếp. |
| M2 · Cộng tác | Workspace dự án, lời mời, phân công, bảng và lịch nhóm, liên kết tài nguyên được chia sẻ. | Một việc nhóm hiện trong Việc của tôi và cập nhật từ bản ghi gốc. |
| M3 · Lớp học | Vào lớp, chia nhóm, giao bài, gắn phần việc, báo cáo tiến độ, nộp và phản hồi. | Giáo viên và hai nhóm có thể chạy toàn bộ luồng với dữ liệu cách ly theo nhóm. |

Hoãn nhận chia sẻ trực tiếp từ hệ điều hành, tải tệp, tìm trong tệp, AI, chấm điểm, tích hợp lịch ngoài và đồng bộ ngoại tuyến. Kết quả bài tập có thể gửi bằng văn bản hoặc URL trong phạm vi đề xuất. Kiểu hiển thị thêm ngoài các màn hình trong [Sơ đồ điều hướng](../architecture/frontend-navigation.md) sẽ được duyệt theo nhu cầu sử dụng.

## Yêu cầu chức năng

| Mã | Mốc | Hành vi và điều kiện đạt | Use Case |
|---|---|---|---|
| FR-01 | M1 | Xác thực tài khoản và tạo phiên. Từ chối yêu cầu dữ liệu khi phiên hết hạn. Sau đăng nhập lại, quyền được đánh giá lại. | UC-21 |
| FR-02 | M1 | Lưu nhanh URL hoặc văn bản vào Chưa xử lý của chủ tài khoản. URL sai định dạng bị từ chối và biểu mẫu giữ nội dung đang nhập khi lỗi. | UC-01 |
| FR-03 | M1 | Gắn nhãn, đánh dấu đã xử lý và tìm lại theo tiêu đề, nhãn hoặc văn bản đã lưu. Kết quả tìm kiếm chỉ chứa tài nguyên người dùng được đọc. | UC-02 |
| FR-04 | M1 | Tạo và sửa việc cá nhân có tiêu đề, có thể thêm mô tả, mức quan trọng và hạn. Việc chưa có hạn vẫn xuất hiện trong danh sách chung. | UC-03 |
| FR-05 | M1 | Lưu thời lượng dự kiến và khoảng lịch làm riêng. Giờ kết thúc phải sau giờ bắt đầu. Dời lịch làm giữ nguyên hạn công việc. | UC-04 |
| FR-06 | M1 | Xem và cập nhật checklist theo quyền. Hiện số mục xong và mục chưa xong đầu tiên theo thứ tự. Hoàn thành công việc là một xác nhận riêng. | UC-05 |
| FR-07 | M1–M2 | Gom việc riêng và việc mình được giao còn quyền đọc. Hiện Hôm nay, Ngày mai, Quá hạn và nhãn nguồn. Trong mỗi nhóm ngày, một việc chỉ tính một lần dù vừa có hạn vừa có lịch làm. | UC-06 |
| FR-08 | M1 | Tách việc cần xử lý khỏi việc quan trọng, hiện lý do, thời lượng và bước checklist nếu có. Xếp theo D-03 khi đã duyệt. | UC-07 |
| FR-09 | M2 | Chủ workspace dự án mời thành viên. Chỉ lời mời đúng người và còn hiệu lực được chấp nhận. Chấp nhận lặp không tạo membership thứ hai. | UC-22, UC-23 |
| FR-10 | M2 | Thành viên xem phân công và lịch nhóm. Người điều phối đặt đầu ra, giao việc, đổi hạn và lên lịch họp. Từ chối giao cho người ngoài workspace. | UC-08, UC-10, UC-11, UC-12 |
| FR-11 | M2 | Người được giao cập nhật checklist và trạng thái theo quyền hiện tại. Bảng nhóm, Việc của tôi và lịch hạn sử dụng cùng bản ghi công việc. | UC-09 |
| FR-12 | M2 | Chỉ gắn tài nguyên đã dùng chung hoặc chia sẻ hợp lệ. Thu hồi chia sẻ có hiệu lực khi tìm kiếm và khi mở liên kết cũ. | UC-13 |
| FR-13 | M3 | Giáo viên tạo lớp, người học tham gia, người có quyền chia nhóm và chỉ định trưởng nhóm. Tư cách thành viên lớp và nhóm được cấp riêng. | UC-14, UC-24 |
| FR-14 | M3 | Giáo viên công bố yêu cầu, đầu ra và hạn cho các nhóm được chọn. Nhóm chỉ thấy bài mình nhận. Trưởng nhóm gắn phần việc đúng workspace vào bài. | UC-15, UC-16, UC-25 |
| FR-15 | M3 | Nhóm gửi cập nhật tiến độ. Giáo viên xem phần việc thuộc đúng bài và nhóm. Nháp và checklist chi tiết cần chia sẻ rõ ràng. | UC-18, UC-26, UC-27 |
| FR-16 | M3 | Trưởng nhóm nộp kết quả. Ghi đúng nhóm, bài, người nộp và thời điểm. Thử lại cùng yêu cầu trả cùng kết quả. Cập nhật tiến độ giữ nguyên trạng thái nộp. | UC-17 |
| FR-17 | M3 | Giáo viên phản hồi vào đúng phiên bản đã nộp. Thành viên nhóm nhận bài đọc được phản hồi của mình. | UC-19, UC-20 |

## Yêu cầu phi chức năng

Các số dưới đây là **mục tiêu lập kế hoạch**, cần xác nhận theo hạ tầng và dữ liệu trước khi làm chuẩn phát hành.

| Mã | Yêu cầu đo được | Phương pháp nghiệm thu |
|---|---|---|
| NFR-01 | Các hành động trong ma trận phân quyền được kiểm tra ở API, gồm đọc danh sách, chi tiết, tìm kiếm và ghi. | Chạy các ca trái quyền với hai lớp, hai nhóm và một tài khoản ngoài nhóm. Kiểm tra cả URL trực tiếp và thời điểm sau thu hồi. |
| NFR-02 | p95 của truy vấn Việc của tôi và tìm URL/văn bản ≤ 500 ms ở staging, đo phía API, với 20 người dùng đồng thời và 1.000 mục/tác vụ thuộc phạm vi mỗi tài khoản mẫu. | Làm nóng dữ liệu, đo trong 10 phút và ghi môi trường, lỗi, p95. Xác nhận tải dữ liệu này trước khi chốt. |
| NFR-03 | Luồng đăng nhập, lưu nhanh, checklist, nộp và xem phản hồi có thể thao tác bằng bàn phím, có tiêu điểm thấy được và lỗi biểu mẫu có nhãn. | Kiểm tra thủ công theo vai trò, từ màn hình vào đến kết quả. |
| NFR-04 | Thay đổi membership, giao việc, nộp và phản hồi có thời điểm và người thực hiện. Nhật ký vận hành ghi mã yêu cầu và kết quả, loại bỏ dữ liệu nhạy cảm. | Kiểm tra ghi nhận đúng trong staging và rà mẫu nhật ký với dữ liệu giả. |
| NFR-05 | Mục tiêu phục hồi ban đầu RPO ≤ 24 giờ, RTO ≤ 4 giờ. | Diễn tập phục hồi vào môi trường tách biệt. Đo tuổi của bản sao và thời gian đến khi qua kiểm tra chức năng. |
| NFR-06 | Sau lỗi mạng hoặc thao tác lặp, dữ liệu nghiệp vụ duy trì nhất quán. Nộp trùng cùng khóa và cùng dữ liệu trả về bản nộp gốc. | Thử hai yêu cầu nộp đồng thời, thử lại sau mất kết nối, và lỗi lưu giữa quá trình. |

## Quy tắc và quyết định trước triển khai

- Dùng [D-07](decisions.md) cho quy tắc múi giờ và hạn chỉ có ngày, cùng [hợp đồng M1](../architecture/m1-api-contract.md) cho cách tính nhóm ngày.
- Tiến độ bài hiển thị số việc đã hoàn thành trên tổng số việc gắn bài, cùng trạng thái nộp riêng. Bài chưa có việc hiển thị chưa có dữ liệu.
- D-01 đến D-08 trong [quyết định M0](decisions.md) ghi mặc định dùng để phân công và kiểm thử. D-03 dùng cho M1. Xác nhận D-04 trước khi mở nhánh nộp bài M3. Các quyết định nghiệp vụ có thể được cập nhật qua quy trình rà soát trước coding.
- Xác nhận nguồn cấp tài khoản giáo viên, người quản lý lớp, chính sách vòng đời dữ liệu và quyền xem sau khi rời lớp trước khi chạy thử với dữ liệu thật.

Khi thay đổi một yêu cầu, cập nhật FR, UC, sơ đồ và ca nghiệm thu liên quan trong cùng thay đổi.
