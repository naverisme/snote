# Phiếu duyệt gộp Q21–Q37

Các câu hỏi tiếp nối Q01–Q20 đã được ghi ở PR #10. Mỗi hàng là một lựa chọn để bạn xác nhận hoặc sửa. Các phương án trong phiếu giữ trạng thái đề xuất. Dùng mã R để tra phần tài liệu bị chặn. [Hồ sơ nguồn](provenance.md) · [Sổ câu hỏi](unresolved.md)

## Workspace, lớp và quyền

| Mã | Cần quyết định | Phương án để duyệt | Liên quan |
| --- | --- | --- | --- |
| Q21 | Workspace cá nhân mặc định có thể thêm thành viên hoặc đổi sang workspace khác không? | **Đã duyệt phần chia sẻ**: không cho chia sẻ workspace mặc định, tạo workspace khác để cộng tác [ACC-06](../docs/requirements/accounts-and-workspaces.md). Khả năng đổi workspace mặc định và đích Hộp thu vẫn mở. | R-07 |
| Q22 | Quyền mặc định ở workspace độc lập và phạm vi lớp trưởng được áp dụng thế nào? | Người tạo workspace độc lập quản lý thành viên và cấp quyền quản lý. Thành viên thao tác trên việc được giao theo quyền công việc. Với lớp trưởng, giữ mặc định xem và sửa công việc, lịch, ghi chú chung, cấp riêng nếu mở sang tệp hoặc đường dẫn. Quyền theo tư cách dừng khi tư cách hết hiệu lực. | R-02, R-14 |
| Q23 | Khi đã ở một nhóm, hệ thống xử lý yêu cầu chờ, lời mời cũ và thay đổi giới hạn ra sao? | Lời mời đã lưu trữ giữ hết hiệu lực khi người học rời nhóm. Yêu cầu tự gửi đang chờ chỉ được duyệt nếu còn chỗ. Khi giáo viên hạ giới hạn, giữ tư cách hiện có và chặn gia nhập mới tới khi đáp ứng giới hạn. | R-13 |
| Q24 | Rời lớp, thiếu người nhận bàn giao và lưu trữ lớp xử lý thế nào? | Khi rời lớp, ngừng đọc dữ liệu chung của lớp và nhóm, giữ lịch sử ở lớp. Nếu thiếu người nhận bàn giao nhóm, giáo viên chỉ định người nhận trước khi người cũ rời. Lớp lưu trữ để đọc lịch sử và có thể khôi phục bởi chủ lớp. | R-02, R-09, R-10 |

## Công việc, lịch, Thư viện và bài giao

| Mã | Cần quyết định | Phương án để duyệt | Liên quan |
| --- | --- | --- | --- |
| Q25 | Xếp một việc thỏa nhiều nhóm “Việc tiếp theo” và phá hòa thế nào? | Mỗi việc vào nhóm ưu tiên đầu tiên mà nó thỏa. Trong nhóm quá hạn, đề xuất xếp hạn cũ nhất trước. Với việc có buổi làm hôm nay và thiếu hạn, dùng buổi làm sớm nhất làm mốc xếp. Khi mốc bằng nhau, xét mức quan trọng rồi giữ thứ tự ổn định. | R-01 |
| Q26 | Workspace nhóm có việc chờ phân công không và ai xử lý yêu cầu đổi người? | Cho tạo việc chờ phân công. Sau khi giao có tối đa một người phụ trách chính. Người giao hoặc người quản lý có quyền xem xét yêu cầu đổi, người hiện tại tiếp tục phụ trách tới khi việc được giao lại. Checklist bản đầu theo việc, các phần cần giao từng người có thể tách thành việc riêng. | R-12 |
| Q27 | Dùng múi giờ nào cho ngày lọc và hiển thị lịch? | Hôm nay, Ngày mai và hiển thị lịch cá nhân theo múi giờ người xem. Hạn bài theo múi giờ lớp như đã chốt. Hạn việc chỉ ngày lưu theo múi giờ áp dụng lúc đặt hạn để việc đổi nơi xem không tự đổi mốc quá hạn. | R-01, R-11 |
| Q28 | Ai gửi cập nhật tiến độ bằng văn bản và ai xem bài, tiến độ, bản nộp? | Trưởng nhóm hoặc người được cấp quyền gửi cập nhật. Giáo viên và thành viên nhóm nhận bài xem dữ liệu của nhóm đó. Mở quyền xem liên nhóm bằng quyền riêng do giáo viên cấp. | R-02, R-03 |
| Q29 | Nhiều người nộp cùng lúc, tải tệp lỗi hoặc muốn thu hồi bản nộp thì sao? | Giữ bản đã ghi. Người gửi xem lại nếu bản hiện hành vừa đổi. Chỉ ghi phiên bản mới khi các phần đã gửi đầy đủ, báo tệp lỗi nếu tải thiếu. Bản đầu đề xuất giữ các phiên bản để tra cứu và sửa bằng phiên bản mới theo quyền và hạn. | R-04 |
| Q30 | Thông tin tối thiểu, loại tệp và giới hạn lưu là gì? | Bản đầu yêu cầu nội dung theo loại văn bản, đường dẫn hoặc tệp. Tiêu đề và thư mục có thể để trống khi lưu nhanh. Chốt danh sách tệp, dung lượng mỗi tệp và dung lượng tổng dựa trên dữ liệu dự kiến dùng. | R-07 |
| Q31 | Sự kiện trùng giờ, lặp lại và sửa sau khi gửi xử lý ra sao? | Cho lưu sự kiện trùng và hiện cảnh báo. Sự kiện lặp đặc tả sau. Khi sửa sự kiện đã gửi, người có quyền chỉnh và người nhận thấy lịch cập nhật theo phạm vi đã chọn. | R-11 |

## UX và đầu vào kỹ thuật

| Mã | Cần quyết định | Phương án để duyệt | Liên quan |
| --- | --- | --- | --- |
| Q32 | Duyệt bố trí workspace và Gantt theo thành phần nào? | **Chưa chốt**. Bản vẽ của chủ sản phẩm được đối chiếu với bản Gantt cũ; phản biện theo từng thành phần tại [đề xuất theo bản vẽ](blocked/ux-workspace-gantt.md). | R-05 |
| Q33 | Phạm vi tiếp theo của đặc tả màn nào cần có trước khi bàn giao thiết kế? | Áp dụng cùng mẫu số lượng, kiểu, vị trí, cấp và thao tác cho Lịch, Thư viện, Lớp học và bài nộp. Trình duyệt theo màn để giữ ranh giới giữa các tính năng. | R-05, R-08 |
| Q34 | Có ràng buộc bắt buộc về công nghệ, tự lưu trữ hoặc quy mô không? | Chủ sản phẩm đưa bộ React/TypeScript/Vite/Tailwind, NestJS, PostgreSQL/Prisma, REST, GitHub, Docker Compose; đồng ý điều chỉnh xác thực theo đề xuất. Đối chiếu và phương án lưu trữ trong [hồ sơ kỹ thuật để duyệt](blocked/storage-proposal.md). Chưa có số liệu quy mô hoặc quyết định nơi lưu tệp. | R-06, R-15 |
| Q35 | Hợp đồng bản đầu phục vụ ai? | **Đã duyệt hướng**: đặc tả giao tiếp cho web v2 trước; chỉ đặc tả thêm ứng dụng khác khi phạm vi ấy được chốt. Endpoint/trường/lỗi vẫn cần thiết kế. | R-06, R-07, R-15 |
| Q36 | Các ca nào dùng làm nền nghiệm thu và cần đo chất lượng gì? | **Đã duyệt hướng và 12 ca nền** [tại `quality/`](../docs/quality/acceptance-scenarios.md). Quy mô thử, thời gian đáp ứng và mục tiêu phục hồi chưa có giá trị cụ thể. | R-08, R-16 |
| Q37 | Bản đầu thử nghiệm riêng hay phát hành rộng, cần môi trường và phục hồi ở mức nào? | **Đã duyệt trình tự làm rõ**: chọn đối tượng thử rồi xác định môi trường, quyền truy cập và mục tiêu sao lưu/phục hồi. Đối tượng, mức mất dữ liệu và thời gian khôi phục chưa được nêu nên vẫn mở. | R-08, R-17 |

Có thể trả lời theo mã, ví dụ `Q21–Q37 đồng ý, sửa Q25 ..., để mở Q34 và Q37`. Các câu để mở tiếp tục nằm ở hồ sơ rà soát. Nội dung đã xác nhận được cập nhật gộp sau lượt duyệt.
