# Hướng dẫn tác nhân — SNOTE v2

Áp dụng trên `s_note_v2` và các nhánh tách từ đó.

**Ranh giới nguồn:** Cấm đọc, sao chép, chuyển đổi hoặc tái sử dụng tài liệu, thiết kế, mã nguồn và dữ liệu từ SNOTE v1 để lập đặc tả hay triển khai v2. Chỉ dùng quyết định đã xác nhận cho v2 và tài liệu hiện hành có dấu vết nguồn trong nhánh `s_note_v2`. Khi còn thiếu dữ kiện môi trường, ghi vào `review/`; theo [SRC-27](review/provenance.md), tác nhân được tự quyết thiết kế trong bảy nhóm docs với nguồn, giới hạn và phép kiểm rõ ràng. Không điền bằng nội dung v1. Lịch sử Git của v2 chỉ phục vụ truy vết việc sửa/gỡ tài liệu v2, không tự trở thành nguồn thiết kế.

1. Đọc [chỉ mục tài liệu](docs/README.md) và [quy ước](docs/DOCUMENTATION_POLICY.md). Chọn tài liệu chủ đề theo nhiệm vụ. Xác định phạm vi và phiên bản quyết định trước khi dùng.
2. Tra mã quy tắc ở tài liệu chủ đề. Kiểm bằng chứng trong [hồ sơ nguồn](review/provenance.md) khi có hai cách hiểu, ảnh hưởng liên nhóm hoặc cần xác minh một quyết định.
3. Chủ động rà tình huống bình thường, ngoại lệ, đồng thời và lỗi giữa chừng; dự đoán hậu quả, phản biện phương án của mình và nêu đề xuất cụ thể theo yêu cầu SRC-26. Dùng [sổ câu hỏi](review/unresolved.md) và [hồ sơ tình huống](review/edge-case-audit.md), ghi nguồn, điều kiện, rủi ro, lựa chọn và kết quả kiểm chứng mong đợi. Tự hoàn thiện phần phân tích đã được giao; chỉ gom những quyết định sản phẩm còn thiếu để chủ sản phẩm cân nhắc. Quyền tự quyết tại SRC-27 cho phép chuyển thiết kế cụ thể đủ căn cứ vào docs; số liệu phụ thuộc máy chủ, chi phí và kết quả thử nghiệm không được tự bịa. Ghi giới hạn và giữ bản thảo lịch sử ở review.
4. Xếp bản thô v2, bản vẽ đề xuất và dấu vết vào khu vực [rà soát](review/README.md). Không đưa nguồn v1 vào khu vực này. Lịch sử Git của v2 chỉ phục vụ kiểm kê thay đổi và không cấp hiệu lực cho bản cũ.
5. Khi thay tài liệu, cập nhật chỉ mục và liên kết chịu ảnh hưởng. Khi nhận việc coding, dùng phạm vi sở hữu tệp và hợp đồng phối hợp của công việc đã được giao.

Mô tả hệ thống, hợp đồng giao tiếp, tiêu chí nghiệm thu và quy trình vận hành có hiệu lực theo trạng thái trong chỉ mục. Quyết định về nghiệp vụ được lưu ở `docs/requirements/` và dẫn chiếu từ những tài liệu sử dụng nó.
