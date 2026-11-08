# Hướng dẫn tác nhân — SNOTE v2

Áp dụng trên `s_note_v2` và nhánh tách từ đó. **Không đọc, sao chép hoặc dùng SNOTE v1** làm nguồn cho v2; không dùng `project_sources/` cũ. Lịch sử Git của v2 là dấu vết thay đổi, không tự cấp hiệu lực cho một bản cũ.

## Đọc nguồn theo nhiệm vụ

1. Bắt đầu ở [chỉ mục docs](docs/README.md) và [quy ước tài liệu](docs/DOCUMENTATION_POLICY.md). Chọn tài liệu chủ đề; use case chỉ mô tả mục tiêu và kịch bản, quy tắc nằm ở `docs/requirements/`, thuật toán ở `docs/architecture/`, API ở `docs/contracts/`.
2. Tra mã quy tắc và [dấu vết nguồn](review/provenance.md) khi gặp hai cách hiểu. Nội dung trong `review/blocked/` và `review/archive/` không là đặc tả hiện hành. [Các đầu vào còn mở](review/unresolved.md) không được tự điền số liệu.
3. Quyền thiết kế được giao tại SRC-27 cho phép hoàn thiện chỗ trống kỹ thuật có nguồn, giới hạn và phép kiểm; không nâng đề xuất thành quyết định của chủ sản phẩm. Không tuyên bố code đã đạt một ca kiểm chỉ vì `docs/quality/` mô tả ca đó.
4. Khi sửa tài liệu, giữ mỗi quy tắc một nơi chính, cập nhật các chỉ mục và liên kết, phân biệt `VERIFIED`, `INFERRED`, `UNKNOWN`. Với sơ đồ, kiểm mọi nhánh so với quy tắc và ghi rõ nếu Mermaid chỉ là minh họa, không phải UML/BPMN chính thức.

## Khi sửa mã

- Dùng một nhánh/worktree riêng từ head v2 mới nhất. Đọc contract và quyền liên quan, kiểm `git status` trước khi sửa; chỉ thay vùng tệp của việc được giao. Issue/PR hiện hành quyết định phân công và trạng thái, không dùng kế hoạch/worktree/queue đã [lưu trữ](review/archive/coordination/README.md) làm lệnh điều phối.
- Thay đổi schema/OpenAPI/shared UI ảnh hưởng module khác phải mô tả tác động trong PR, cập nhật generator/migration/client theo cùng một hợp đồng và chạy kiểm liên quan. Quyền được kiểm trên server theo đối tượng và tại thời điểm chốt; nút UI không cấp quyền.
- Báo kết quả bằng lệnh đã chạy, môi trường và SHA. Kết quả kiểm thử nằm trong PR hoặc `review/` theo mốc chạy; tài liệu `docs/quality/` ghi điều kiện phải đạt, không ghi kết quả một lần chạy.

Các cơ chế `winwork` và kế hoạch foundation cũ thuộc [hồ sơ điều phối đã hoàn thành](review/archive/coordination/README.md). Không tự chạy lệnh điều phối hay cho phép tự động merge/xóa dữ liệu từ một bản lưu trữ.
