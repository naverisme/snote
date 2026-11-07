# Quy ước tài liệu SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Phạm vi | Nhánh `s_note_v2` và các nhánh tách từ đó |
| Trạng thái | Cấu trúc bảy nhóm đã được chủ sản phẩm chốt; nội dung từng tệp cần bằng chứng riêng |
| Nguồn | [PR #5](https://github.com/naverisme/snote/pull/5) và quyết định của chủ sản phẩm về cấu trúc `docs/` |

`docs/` chứa tài liệu tham chiếu dài hạn đã nêu rõ mục đích, phạm vi, nguồn và trạng thái. Chỉ tạo thư mục khi có nội dung đã được đối chiếu đủ căn cứ cho thư mục đó. Chỉ mục ở [README](README.md) cho biết tài liệu nào hiện được dùng.

**Nguồn của v2:** Không tái sử dụng nội dung SNOTE v1 cho `docs/`, `review/`, thiết kế hoặc coding v2. Nguồn hợp lệ là phát biểu/duyệt của chủ sản phẩm về v2 và tài liệu v2 đã được đối chiếu trong đúng phạm vi. Khi còn thiếu dữ kiện, giữ điểm đó mở để xác minh; sự tồn tại của dữ liệu ở v1 không lấp được khoảng trống.

| Nhóm | Nội dung được phép đặt ở đây | Ranh giới |
| --- | --- | --- |
| `product/` | Bài toán, người dùng, mục tiêu, phạm vi và thuật ngữ sản phẩm. | Không chứa bố cục màn hình hoặc công việc đang chạy. |
| `requirements/` | Yêu cầu, quy tắc, luồng nghiệp vụ, quyền và ngoại lệ đã xác nhận. | Không tự đặt API hay giao diện. |
| `ux/` | Điều hướng, thứ bậc và hành vi thành phần, trạng thái màn hình, wireframe khi đã được duyệt trong đúng phạm vi. | Hình vẽ không thay thế quy tắc quyền. |
| `architecture/` | Ranh giới hệ thống, module, dữ liệu, bảo mật, triển khai ở mức thiết kế và quyết định kiến trúc khi có bằng chứng duyệt. | Không suy diễn cấu trúc hệ thống chỉ từ yêu cầu nghiệp vụ. |
| `contracts/` | Hợp đồng giao tiếp, schema, lỗi và ví dụ giữa các thành phần khi đã thống nhất. | Quyền nghiệp vụ bắt nguồn từ `requirements/`. |
| `quality/` | Tiêu chí nghiệm thu, yêu cầu phi chức năng và phương pháp kiểm chứng đã xác nhận. | Kết quả một lần chạy nằm trong hệ thống thực thi/báo cáo. |
| `operations/` | Thiết kế và quy trình môi trường, phát hành, sao lưu, phục hồi, giám sát khi được xác nhận. | Không thay thế tài liệu kiến trúc. |

Mỗi tài liệu nêu rõ phần nào đã được chủ sản phẩm chấp thuận, bằng chứng quyết định và giới hạn chưa được chốt. Trạng thái tự ghi trong file hay việc merge PR không tự chứng minh sự chấp thuận nội dung. Khi nguồn xung đột hoặc chỉ là đề xuất chưa được giao quyền thiết kế, đặt vấn đề ở [hồ sơ rà soát](../review/unresolved.md). [SRC-27](../review/provenance.md) giao tác nhân tự quyết kiến trúc và UX còn thiếu; tài liệu do tác nhân thiết kế phải ghi nguồn, giả định, giới hạn và điều kiện kiểm chứng. Giá trị phụ thuộc hạ tầng/đo đạc tiếp tục ở review cho đến khi có số liệu thực.

Ghi chép thô v2, bản vẽ chưa duyệt và dấu vết đối chiếu ở ngoài `docs/`. Công việc đang chạy và phân công được quản lý trong issue/project hoặc công cụ điều phối đã chọn; mã nguồn, kiểm thử thực thi và cấu hình ở khu vực mã nguồn tương ứng. Lịch sử Git của v2 giữ bản cũ để truy nguyên quá trình thay đổi, không cấp hiệu lực cho chúng. Cấu trúc này là quy ước nội bộ của SNOTE, không phải tuyên bố tuân thủ một tiêu chuẩn bên ngoài.
