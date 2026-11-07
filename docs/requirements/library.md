# Thư viện và Hộp thu

| Trường | Giá trị |
| --- | --- |
| Mục đích | Xác định loại nội dung, đích lưu nhanh, thư mục và phạm vi chia sẻ |
| Phạm vi | Thư viện của workspace, Hộp thu cá nhân và sao chép vào nhóm |
| Kiểm định | DCA-checked theo các quyết định lưu và chia sẻ |
| Bằng chứng duyệt | [SRC-03, SRC-07, SRC-08, SRC-10, SRC-15, SRC-19, SRC-21/22, SRC-24/25/26, Q13, Q14, Q20, Q30, Q33-B3, E7, F8, H7, I1/I6–I13, J1–J3](../../review/provenance.md) |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| LIB-01 | Thư viện lưu văn bản hoặc ghi chú, đường dẫn và tệp. Người dùng phân loại các mục và thông tin đi kèm vào thư mục. | SRC-03 |
| LIB-02 | Lưu nhanh đưa mục chưa phân loại vào Hộp thu trong Thư viện của workspace cá nhân mặc định. Chỉ chủ tài khoản thấy Hộp thu. Bản đầu có luồng lưu nhanh từ giao diện web. | SRC-03, SRC-07, SRC-08, Q20 |
| LIB-03 | Mục mới trong Thư viện workspace nhóm mặc định là nội dung chung theo quyền workspace. Người dùng chọn workspace cá nhân để lưu riêng. | Q13 |
| LIB-04 | Đưa mục từ cá nhân sang nhóm bằng thao tác sao chép. Bản gốc riêng vẫn ở nguồn và bản sao chịu quyền của workspace đích. | Q14 |
| LIB-05 | Mục Thư viện cần nội dung hợp với loại văn bản, đường dẫn hoặc tệp đã chọn. Khi lưu nhanh, tiêu đề và thư mục có thể để trống; mục chưa phân loại vào Hộp thu theo LIB-02. | Q30 |
| LIB-06 | Chủ workspace hoặc người có quyền quản lý workspace được tạo, đổi tên và xóa thư mục trong workspace đó. Người có quyền sửa một mục Thư viện được chuyển mục ấy giữa các thư mục **trong cùng workspace**. Quyền sửa mục không tự cấp quyền quản lý thư mục. | Q33-B3, SRC-19 |
| LIB-07 | Chỉ xóa thư mục khi không còn **mục hoặc thư mục con**. Nếu còn mục, người dùng phải chuyển mục ra trước; nếu còn thư mục con, phải chuyển hoặc xóa riêng thư mục con trước. Không xóa dây chuyền các mục hoặc thư mục con. | E7, F8, SRC-21/22 |
| LIB-08 | Thành viên nhóm được tạo mục Thư viện chung trong nhóm mình và sửa/xóa mục mình tạo. Sửa/xóa mục của người khác cần quyền quản lý workspace hoặc cấp riêng; giáo viên chủ lớp có quyền với nội dung chung theo PER-01. Bảng quyền tách ghi chú văn bản khỏi tệp và đường dẫn; Lớp trưởng mặc định được sửa ghi chú chung của mọi nhóm, còn tệp/đường dẫn ở nhóm khác cần cấp riêng. Tạo mục ở nhóm khác cũng cần quyền riêng. | H3/H7, SRC-24 |
| LIB-09 | Mục Văn bản lưu nội dung nhiều dòng, tiêu đề tùy chọn. Khi nhập `- ` ở đầu dòng, trình soạn thảo chuyển thành dấu đầu dòng; Enter tiếp tục danh sách, Enter tại dòng trống kết thúc. Nhập `1. ` tạo danh sách đánh số, Enter tăng số ở dòng kế tiếp. Các URL trong văn bản vẫn bấm được; nếu nhiều URL, chỉ URL đầu tiên có thẻ xem trước dưới nội dung. | I6, SRC-25 |
| LIB-10 | URL không có tiền tố giao thức, ví dụ `example.com`, được nhận diện và tự bổ sung `https://` cho đích mở ở cả Văn bản và mục Đường dẫn; chữ đã nhập có thể giữ nguyên. Thẻ xem trước đầu tiên của Văn bản hiện ảnh bìa, tiêu đề, tên miền khi lấy được; thiếu ảnh thì hiện tên miền và đường dẫn. Mục Đường dẫn lưu URL, tiêu đề và ghi chú tùy chọn do người dùng nhập; không lưu toàn văn trang nguồn ở bản đầu. | I6/I7, SRC-25 |
| LIB-11 | Loại tệp nhận trong bản đầu: PDF; ảnh JPEG, PNG, WebP; TXT; DOCX, XLSX, PPTX; ZIP. ZIP chỉ cho tải xuống, không xem trước hoặc tự giải nén. Kiểm tra loại tệp thực tế và quyền tải/lưu. Giới hạn thử nghiệm: 25 MB mỗi tệp và 1 GB mỗi workspace; cảnh báo khi gần đầy. Các con số được rà lại khi chọn máy chủ và ngân sách lưu trữ. | I8/I9, SRC-25 |
| LIB-12 | Sao chép mục sang workspace khác tạo một mục độc lập mang nội dung tại thời điểm sao chép và quyền của workspace đích. Sửa, ghi đè hoặc xóa bản nguồn sau đó không đổi bản sao; thao tác trên bản sao cũng không đổi bản nguồn. Cách tối ưu bytes lưu tệp không thay đổi tính độc lập này. | I10, SRC-25 |
| LIB-13 | Người tải tệp lên hoặc người có quyền sửa nội dung trong workspace, khi tư cách còn hiệu lực, được chọn **Ghi đè mục này** hoặc **Tạo bản sao**. Ghi đè giữ cùng mục và thay nội dung hiện hành, lưu các phiên bản cũ để tra cứu/khôi phục. Tạo bản sao sinh mục mới và giữ mục cũ; nếu sao chép sang workspace khác áp dụng LIB-12. Bản nộp đã gửi giữ nội dung theo phiên bản lúc gửi theo ASG-04. | I11 sửa, SRC-25 |
| LIB-14 | Xóa mục Thư viện chuyển vào Thùng rác 30 ngày; người tạo mục hoặc người quản lý có quyền được khôi phục trong thời gian này. Hết thời gian giữ thì mục bị xóa khỏi Thùng rác; bản chụp nội dung đã thuộc phiên bản nộp vẫn được giữ theo ASG-04. Quyền xóa theo LIB-08. | I12, SRC-25 |
| LIB-15 | Mục tệp chỉ hiện như đã lưu thành công khi cả tệp và dữ liệu của mục đều được ghi đầy đủ. Nếu một bước thất bại, báo lỗi để thử lại, dọn tệp tải dở và không tạo mục hoàn chỉnh trong danh sách. | I13, SRC-25 |
| LIB-16 | Hạn mức workspace tính tệp hiện hành và bản chụp tệp nộp thuộc workspace nhóm. Cùng nội dung được tham chiếu nhiều lần trong một workspace chỉ tính một lần; bản sao sang workspace khác tính vào hạn mức đích. Tệp chỉ còn trong Thùng rác hoặc lịch sử ghi đè không tính vào hạn mức người dùng nhưng vẫn được theo dõi trong dung lượng máy chủ. Nếu nội dung còn thuộc bản nộp thì vẫn thuộc tập phải tính. | J1, SRC-26 |
| LIB-17 | Giữ lịch sử ghi đè khi mục còn hoạt động. Khi xóa mục, các phiên bản cùng vào Thùng rác 30 ngày; hết hạn dọn chúng, trừ nội dung vẫn được bản nộp tham chiếu. Quy tắc này chưa đặt trần dung lượng vật lý hoặc số phiên bản. | J2, SRC-26 |
| LIB-18 | Lấy tiêu đề/ảnh bìa khi lưu hoặc đổi URL đầu tiên của Văn bản; lưu kết quả để hiển thị lại, không lưu toàn văn. Nếu lấy thất bại, dùng tên miền và URL. Dịch vụ lấy ảnh chỉ truy cập đích web công khai và kiểm tra cả chuyển hướng. | J3, SRC-26 |

Loại tệp và giới hạn thử nghiệm theo LIB-11; cách tính và giữ phiên bản theo LIB-16/17. Trần dung lượng vật lý, mức cảnh báo, nhận dạng nội dung trùng và hợp đồng metadata còn ở [R-07](../../review/unresolved.md). Rủi ro lịch sử tăng không giới hạn được phân tích tại [EC-01](../../review/edge-case-audit.md). Xem [ma trận quyền](permission-matrix.md) để tách quyền đối với văn bản, đường dẫn, tệp và thư mục.
