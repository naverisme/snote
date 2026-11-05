# SNOTE v2 — Chỉ mục tài liệu

Bộ tài liệu này chỉ trình bày những quyết định về sản phẩm và hành vi đã được chủ sản phẩm xác nhận trong cuộc trao đổi về v2. **Nội dung đã được đối chiếu trong phạm vi ấy; việc có mặt trong repo không tự xác nhận các thiết kế chi tiết.** Xem [quy ước tài liệu](DOCUMENTATION_POLICY.md) để biết phạm vi từng nhóm và cách kiểm tra hiệu lực.

| Nhóm | Câu hỏi trả lời | Tài liệu đang dùng |
| --- | --- | --- |
| `product/` | SNOTE phục vụ ai; lớp, workspace/nhóm và Thư viện là gì? | [Khái niệm sản phẩm](product/concepts.md) |
| `requirements/` | Những quy tắc nghiệp vụ, quyền và ngoại lệ nào đã được xác nhận? | [Quy tắc đã xác nhận](requirements/verified-business-rules.md) |
| `ux/` | Phân cấp điều hướng và chế độ xem nào đã được xác nhận? | [Điều hướng đã xác nhận](ux/validated-navigation.md) |

`architecture/` và `contracts/` chưa có tài liệu đủ căn cứ để sử dụng. Tương tự, chưa có tài liệu được kiểm định để đưa vào `verification/` hoặc `operations/`. Không suy ra mô hình dữ liệu, API, bố cục chi tiết, công nghệ, tiêu chí nghiệm thu hay kế hoạch coding từ ba tài liệu trên.

[Dấu vết nguồn và kết quả rà soát](../review/provenance.md) ghi phạm vi đối chiếu và các tệp cũ đã gỡ khỏi chỉ mục hiện hành. [Các điểm chưa chốt](../review/unresolved.md) nằm ngoài `docs/` và không phải yêu cầu triển khai. Bản cũ vẫn truy xuất được trong lịch sử Git.
