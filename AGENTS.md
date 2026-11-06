# Hướng dẫn tác nhân — SNOTE v2

Áp dụng trên `s_note_v2` và các nhánh tách từ đó.

**Ranh giới nguồn:** Cấm đọc, sao chép, chuyển đổi hoặc tái sử dụng tài liệu, thiết kế, mã nguồn và dữ liệu từ SNOTE v1 để lập đặc tả hay triển khai v2. Chỉ dùng quyết định đã xác nhận cho v2 và tài liệu hiện hành có dấu vết nguồn trong nhánh `s_note_v2`. Khi v2 còn thiếu dữ kiện, ghi vào `review/` để hỏi chủ sản phẩm; không điền bằng nội dung v1. Lịch sử Git của v2 chỉ phục vụ truy vết việc sửa/gỡ tài liệu v2, không tự trở thành nguồn thiết kế.

1. Đọc [chỉ mục tài liệu](docs/README.md) và [quy ước](docs/DOCUMENTATION_POLICY.md). Chọn tài liệu chủ đề theo nhiệm vụ. Xác định phạm vi và phiên bản quyết định trước khi dùng.
2. Tra mã quy tắc ở tài liệu chủ đề. Kiểm bằng chứng trong [hồ sơ nguồn](review/provenance.md) khi có hai cách hiểu, ảnh hưởng liên nhóm hoặc cần xác minh một quyết định.
3. Dùng [sổ câu hỏi](review/unresolved.md) để nhận diện điều kiện còn thiếu. Khi một tác vụ phụ thuộc phần chưa duyệt, ghi cụ thể mã câu hỏi và ảnh hưởng. Gom các câu hỏi cần chủ sản phẩm quyết định trước lượt cập nhật GitHub.
4. Xếp bản thô v2, bản vẽ đề xuất và dấu vết vào khu vực [rà soát](review/README.md). Không đưa nguồn v1 vào khu vực này. Lịch sử Git của v2 chỉ phục vụ kiểm kê thay đổi và không cấp hiệu lực cho bản cũ.
5. Khi thay tài liệu, cập nhật chỉ mục và liên kết chịu ảnh hưởng. Khi nhận việc coding, dùng phạm vi sở hữu tệp và hợp đồng phối hợp của công việc đã được giao.

Mô tả hệ thống, hợp đồng giao tiếp, tiêu chí nghiệm thu và quy trình vận hành có hiệu lực theo trạng thái trong chỉ mục. Quyết định về nghiệp vụ được lưu ở `docs/requirements/` và dẫn chiếu từ những tài liệu sử dụng nó.
