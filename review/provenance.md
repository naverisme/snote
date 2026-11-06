# Hồ sơ đối chiếu nguồn — SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Kiểm kê lịch sử | Cây `docs/` và `AGENTS.md` trên `s_note_v2` tại commit `80c14b10b73d21b2e00ee9539953091d0f67351d` |
| Mốc tổ chức lại | 9 tệp tại `583435b35811ab4285447b3afb9aafbad04f6d82`. Ánh xạ từ mốc này ở phần cuối. |
| Nguồn xác nhận | Phát biểu và câu “đúng”, “duyệt” của chủ sản phẩm trong chuỗi trao đổi SNOTE v2, được gom theo mã ngữ cảnh bên dưới |
| Kết quả kiểm kê lịch sử | Biên soạn các khái niệm, quy tắc và phân cấp điều hướng đủ căn cứ, gỡ 22 tệp cũ khỏi cây v2 |
| Giới hạn | Không kiểm chứng bằng người dùng khác, mã nguồn chạy hoặc đặc tả ngoài cuộc trao đổi; đối chiếu không tương đương duyệt thiết kế kỹ thuật |

## Nguồn và mệnh đề

Các câu trích ngắn là phát biểu của chủ sản phẩm trong chuỗi trao đổi này; chỉ giúp tìm lại quyết định theo chủ đề, không thay thế bản ghi hội thoại. Câu hỏi của trợ lý và nội dung cũ trong Git **không** là bằng chứng chấp thuận nếu người dùng chưa xác nhận.

| Mã | Lượt xác nhận trong cuộc trao đổi | Nội dung được xác nhận | Tệp lúc ghi quyết định |
| --- | --- | --- | --- |
| SRC-01 | “snote dành cho học sinh, cá nhân, giáo viên”; “mỗi cá nhân có các workspace”; “lớp lớn hơn workspace”; “workspace là nhóm ... cùng cấp cùng kiểu” | Đối tượng, nhiều workspace, lớp bao trùm workspace nhóm, nhóm = workspace. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md` |
| SRC-02 | “người học phải chấp nhận”; “muốn giáo viên được sửa/xóa nội dung chung”; “mặc định ... cả 3 người nhưng giáo viên có thể setting”; “lớp trưởng được xem và sửa ... là mặc định” | Tư cách nhóm, quyền giáo viên, ba người duyệt yêu cầu nhóm, quyền mặc định lớp trưởng. | `docs/requirements/verified-business-rules.md` |
| SRC-03 | “Lưu nhanh ... chính là 1 thành phần của ghi chú”; “oke dùng thư viện đi”; “Việc của tôi ... đúng”; “gantt là mặc định, danh sách ... xóa nhiều, lưu trữ nhiều”; yêu cầu Thư viện đứng cạnh Lịch | Thư viện/Hộp thu, phạm vi việc, các chế độ xem, phân cấp điều hướng. | `docs/product/concepts.md`, `docs/ux/validated-navigation.md` |
| SRC-04 | “Thời lượng còn lại ... đếm ngược đến hạn”; “3/5 ... 60%”; “việc ... k bắt buộc đặt hạn”; “lịch làm sau hạn ... làm muộn”; “Lịch của tôi tổng hợp xuyên workspace”; “duyệt” | Hạn tùy chọn, đếm ngược/quá hạn, lịch làm riêng, checklist, tổng hợp lịch và sự kiện độc lập. | `docs/requirements/verified-business-rules.md` |
| SRC-05 | “Sau hạn chưa nộp lần nào ... khóa nộp lần đầu”; “đặt riêng với cho sửa bản đã nộp sau hạn”; “mặc định ... trưởng nhóm”; “duyệt” | Hai quyền sau hạn riêng; người nộp/sửa mặc định và quyền bổ sung; ưu tiên cài đặt từng bài; lịch sử sửa. | `docs/requirements/verified-business-rules.md` |
| SRC-06 | “chốt kiến trúc này cho dự án snote” sau khi xác định bảy nhóm `docs/`, và [PR #5](https://github.com/naverisme/snote/pull/5) | Bảy nhóm tài liệu và hướng dẫn tác nhân; chốt cấu trúc không duyệt các bản thiết kế cũ. | `docs/DOCUMENTATION_POLICY.md`, `AGENTS.md` |
| SRC-07 | Hai lượt sau câu hỏi về phần còn thiếu: chủ sản phẩm nói “oke” với các đề xuất 1–7, sau đó thay cách nhận vai trò thành tự chọn lúc đăng ký; lượt “pke” xác nhận đề xuất một tài khoản vừa học vừa dạy và lớp mặc định không công khai | Workspace cá nhân mặc định; giới hạn nhóm mặc định; bộ lọc ngày và mức quan trọng; tiến độ tách nguồn; tự chọn cách dùng, quyền tạo lớp và phạm vi lớp. Phạm vi phát hành đầu còn cần làm rõ do yêu cầu lối vào Lớp học sau đăng ký. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md`, `docs/ux/validated-navigation.md` |
| SRC-08 | Chủ sản phẩm nói “giáo viên cũng có không gian cá nhân, không nhất thiết phải tạo lớp ngay khi tạo tài khoản. còn lại đồng ý” sau bốn đề xuất về bản phát hành đầu, lời mời/mã lớp, yêu cầu vào nhóm và quyền lập nhóm | Lớp học cơ bản thuộc bản đầu nhưng tạo lớp là tùy chọn; hai đường vào lớp, hai đường vào nhóm, giáo viên mặc định lập nhóm và quyền ủy nhiệm; người được ủy nhiệm tạo nhóm mặc định là trưởng nhóm kiêm admin. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md`, `docs/ux/validated-navigation.md` |
| SRC-09 | Chủ sản phẩm trả lời “đồng ý” với bốn đề xuất về quyền xóa của lớp trưởng, sửa bài giao cấp lớp, một trưởng nhóm chính cùng người quản lý thêm, và tự rời lớp sau bàn giao | Mặc định quyền cấp lớp; quyền Nộp tách quyền quản lý workspace; điều kiện rời lớp và giữ lịch sử. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md` |
| SRC-10 | Sau khi yêu cầu hỏi gộp trước khi cập nhật GitHub, chủ sản phẩm nói “duyệt full còn lại”; riêng mục 4 nêu rằng khi giới hạn một nhóm và đã vào một nhóm, lời mời khác phải vô hiệu, xóa hoặc lưu trữ. Phương án lưu trữ được chọn trong số các cách chủ sản phẩm cho phép. | Hai mươi điểm về quyền lớp, công việc, lịch, Thư viện, bài giao, Gantt và nền tảng; lời mời cũ hết hiệu lực và lưu trữ khi giới hạn một nhóm. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md`, `docs/ux/validated-navigation.md` |
| SRC-11 | Chủ sản phẩm trả lời Q21 “không chia sẻ workspace mặc định (cá nhân)”. | Workspace cá nhân mặc định không thêm thành viên và không chia sẻ quyền truy cập. Chưa quyết định có được đổi workspace mặc định hay không. | `docs/product/concepts.md`, `docs/requirements/accounts-and-workspaces.md` |
| SRC-12 | Chủ sản phẩm nói “duyệt q35 36 37”, “q32 chưa chốt” và đồng ý đổi công nghệ theo đề xuất; cung cấp bản vẽ Gantt, yêu cầu đánh giá từng thành phần và tìm giải pháp lưu trữ. | Duyệt phạm vi hợp đồng web trước và ca nghiệm thu mẫu, tiếp tục làm rõ mục tiêu vận hành; Q32 cùng phương án lưu trữ vẫn ở vùng rà soát. Các tên công nghệ là đầu vào thiết kế, chưa tự suy ra hợp đồng hay ngưỡng vận hành. | `review/decision-batch.md`, `review/blocked/ux-workspace-gantt.md`, `review/blocked/storage-proposal.md` |
| SRC-13 | Chủ sản phẩm sửa UXR-03 đến UXR-06: “tối đa 2”, máy tính hiện tên khi hover, điện thoại hiện tên cạnh icon; bung ngang, tạo workspace ở đầu trái, đổi sang danh sách và giữ-kéo; “mục lưu ý” xem trước nội dung quan trọng; “chế độ xem” đổi Gantt/Danh sách. | Diễn giải chính xác ý đồ bản vẽ cho bốn thành phần. Bố trí Q32 tổng thể và các chi tiết chưa mô tả vẫn mở. | `review/blocked/ux-workspace-gantt.md`, `review/decision-batch.md` |
| SRC-14 | Sau bản đánh giá UXR-01–14 và bảng bốn lựa chọn cuối cùng (danh sách workspace, Mục lưu ý, Gantt còn lại và nút Snote), chủ sản phẩm nói “chốt q32”. | Duyệt Q32: danh sách workspace hiện tên/lớp/trạng thái; kéo chỉ cuộn và bấm mới chọn; Mục lưu ý theo workspace tối đa ba dòng và mở mục nguồn; UXR-07–14; nút Snote về Việc của tôi. Các quy tắc UXR-03–06 đã được chủ sản phẩm sửa ở SRC-13. | `docs/ux/workspace-gantt.md`, `review/decision-batch.md` |
| SRC-15 | Ngay sau khi trợ lý nêu bước tiếp theo là rà Q22–Q31, chủ sản phẩm trả lời “chốt”. | Duyệt các phương án Q22–Q31 đúng nội dung trong phiếu tại mốc Q32, không tự suy ra giới hạn tệp, định dạng rich text, quyền cụ thể ngoài phương án hoặc các thông số kỹ thuật chưa được nêu. | `docs/requirements/permissions.md`, `class-membership.md`, `tasks.md`, `calendar.md`, `library.md`, `assignments-and-submissions.md` |
| SRC-16 | Sau bản bố trí Q33, chủ sản phẩm nói “đồng ý với cách bố trí ... lối tắt của lớp ... cùng cấp với workspace ... công việc lịch trình và thư viện ... cấp tính năng ... thay đổi dựa trên workspace đang mở ... đối với lớp ... tính năng ... phù hợp”. | Duyệt hai cấp giao diện: lối vào lớp và bộ chọn workspace ngang cấp ở vùng chọn ngữ cảnh; vùng điều hướng tính năng thay theo ngữ cảnh workspace/lớp. Lớp vẫn lớn hơn workspace nhóm ở mô hình nghiệp vụ. Chưa duyệt tên/số mục tính năng lớp, kiểu bộ chọn nhiều lớp hoặc hành vi từng màn Q33. | `docs/ux/validated-navigation.md`, `docs/ux/workspace-gantt.md`, `review/blocked/ux-q33-review.md` |
| SRC-17 | Trợ lý nêu rõ “Năm mục lớp đang đề xuất—Nhóm, Bài giao, Lịch lớp, Thành viên, Cài đặt—vẫn chờ bạn duyệt tên, số lượng và hành vi”; chủ sản phẩm trả lời “chốt”. | Chốt tên và số lượng năm mục tính năng lớp trong vùng đã duyệt tại SRC-16. Phát biểu trước đó không mô tả hành vi chi tiết, thứ tự bắt buộc, kiểu điều khiển hoặc cách hiện theo quyền, nên các phần đó tiếp tục chờ duyệt ở Q33. | `docs/ux/validated-navigation.md`, `review/blocked/ux-q33-review.md` |
| SRC-18 | Chủ sản phẩm nói “cấm tái sử dụng bản v1. tiếp theo đi”. | Cấm lấy tài liệu, mã nguồn hoặc thiết kế SNOTE v1 làm đầu vào cho đặc tả, tài liệu hay coding v2; tiếp tục làm rõ v2 từ quyết định đã xác nhận, giữ phần còn thiếu ở vùng rà soát. | `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md` |
| SRC-19 | Sau bảng 13 phương án C1–C5, A1–A3, B1–B3, D1–D2 được trình bày rõ trong cuộc trao đổi, chủ sản phẩm trả lời “chốt”. | Duyệt đúng nội dung của 13 dòng: chọn lớp và đổi tính năng, bộ lọc/chế độ lịch, bố cục/lưu/tìm/thư mục, biểu mẫu bài và ba nguồn tiến độ. Không duyệt các hàng còn lại của bản thảo Q33 chỉ vì chung màn. | `docs/ux/class-navigation.md`, `calendar-q33.md`, `library-q33.md`, `assignments-q33.md`; `docs/requirements/calendar.md`, `library.md`, `assignments-and-submissions.md` |
| SRC-20 | Chủ sản phẩm sửa E1: “khi chọn 1 lớp mặc định mở danh sách lớp”; E2: “danh sách lớp ... dạng danh sách như exel, rule được chọn ngay bên trong danh sách, mặc định mọi thành viên khi vào đều là member, rule khác được giáo viên chọn riêng, quyền hạn khác mặc định được giáo viên tùy chỉnh rule trong setting cũng như các tính năng cài đặt để trong setting”. | Hiểu “danh sách lớp” là bảng người trong lớp vì E2 đặt ô vai trò theo người: khi chọn một lớp, mở mục Thành viên mặc định. Người học gia nhập mang vai trò Member; giáo viên chọn vai trò khác ngay trên hàng; cài đặt quyền mặc định theo vai trò và các cấu hình khác thuộc Cài đặt. Không suy ra các cột phụ hoặc bố cục cài đặt từ chữ “Excel”. E3–E8 chưa được duyệt. | `docs/ux/class-navigation.md`, `docs/requirements/class-membership.md`, `permissions.md`; `review/blocked/ux-q33-class.md` |
| SRC-21 | Sau khi E1–E2 được sửa và cập nhật, trợ lý ghi “E3–E8 vẫn chờ bạn quyết định”; chủ sản phẩm trả lời “Chốt”. | Duyệt E3–E8 theo bảng đã trình: hàng nhóm chỉ hiện tên/trưởng nhóm/tư cách; Thành viên tách ba vùng; Cài đặt chia bốn phần và mỗi lần mở một phần; lịch có Trước/Hôm nay/Sau và chi tiết theo thiết bị; chỉ xóa thư mục rỗng; bản nộp hiện hành trước và xem lại khi xung đột. Không duyệt các chi tiết ngoài sáu phương án. | `docs/ux/class-navigation.md`, `calendar-q33.md`, `library-q33.md`, `assignments-q33.md`; `docs/requirements/library.md` |
| SRC-22 | Sau bảng mười đề xuất F1–F10 về quyền và thành phần Q33, chủ sản phẩm nói “Duyệt”. | Duyệt đúng mười mục: bảng quyền vai trò trong phần Quyền lớp trưởng; vai trò lớp Member/Lớp trưởng, chủ lớp và trưởng nhóm tách; chỉ giáo viên chủ lớp đổi vai trò và lưu dấu; ba cột bảng Thành viên, ba loại vùng/yêu cầu; bảng điện thoại cuộn ngang giữ cột Người học; lớp lưu trữ chỉ đọc; thư mục chỉ xóa nếu không có mục/thư mục con; chi tiết phiên bản nộp và sự kiện Lịch. Trường bắt buộc khi tạo sự kiện vẫn chưa chốt. | `docs/requirements/permissions.md`, `class-membership.md`, `library.md`; `docs/ux/class-navigation.md`, `calendar-q33.md`, `library-q33.md`, `assignments-q33.md` |
| SRC-23 | Sau bảng mười hai phương án G1–G12 về các chi tiết giao diện còn mở, chủ sản phẩm trả lời “tạm thời duyệt đi”. | Chấp thuận tạm thời đúng các phương án G1–G12 để tiếp tục rà thiết kế, **chưa khóa thành đặc tả triển khai**. G4 chưa có danh mục và giá trị quyền; G6 chưa giải quyết sự kiện cả ngày; G12 chưa có số liệu chuyển động. Giữ ở khu vực rà soát, không gán trạng thái duyệt cuối cho `docs/ux/`. | `review/blocked/ux-q33-g-provisional.md`, `review/unresolved.md` |
| SRC-24 | Sau bảng H1–H10 về quyền theo hành động, chủ sản phẩm nói “chốt và tiếp theo”. | Chốt đúng mười đề xuất H: Member xem lớp và phạm vi nhóm mình; trưởng nhóm quản lý workspace; Lớp trưởng có quyền sửa chung nhưng tạo/xóa tách; thành viên tạo việc chờ phân công; người phụ trách/quản lý chỉnh checklist có ghi dấu; sửa/hủy sự kiện tách quyền; Thư viện phân loại văn bản, link, tệp; mời/đưa khỏi nhóm kèm bàn giao; ủy quyền cá nhân theo phạm vi; cộng quyền hợp lệ của nhiều tư cách trong giới hạn riêng tư/lưu trữ/tư cách. Các ô chưa được đề xuất không suy ra đã chốt. | `docs/requirements/permission-matrix.md`, `permissions.md`, `tasks.md`, `calendar.md`, `library.md`, `class-membership.md` |

### Sổ quyết định của lượt hỏi gộp (SRC-10)

Chủ sản phẩm duyệt các phương án 1–3 và 5–20 của bảng hỏi gộp; mục 4 được sửa bằng quy tắc vô hiệu lời mời khác khi đã vào một nhóm. Bảng dưới ghi nội dung được đưa vào docs; những chi tiết không nêu vẫn là câu hỏi mở.

| Mã | Nội dung được dùng | Tài liệu đích |
| --- | --- | --- |
| Q01 | Tối đa một lớp trưởng chính; người hỗ trợ nhận quyền riêng. | Yêu cầu quyền |
| Q02 | Bản đầu chưa có vai trò đồng giáo viên riêng. | Sản phẩm, yêu cầu quyền |
| Q03 | Có lưu trữ lớp; chuyển chủ lớp đang hoạt động cho Giáo viên khác với sự chấp nhận. | Sản phẩm, yêu cầu quyền |
| Q04 | Khi giới hạn một nhóm và người học vào một nhóm, lời mời nhóm khác hết hiệu lực. Người dùng cho phép vô hiệu/xóa/lưu trữ; chọn lưu trữ để giữ dấu vết, không hiện ở danh sách chờ. | Yêu cầu tư cách nhóm |
| Q05 | Thu hồi ủy quyền có hiệu lực ngay với thao tác mới, giữ lịch sử cũ. | Yêu cầu quyền |
| Q06 | Một người phụ trách chính mỗi việc; có thể tách việc hoặc dùng checklist khi nhiều người cùng làm. | Yêu cầu công việc |
| Q07 | Giao việc hiệu lực ngay, có thông báo và lối yêu cầu đổi người phụ trách. | Yêu cầu công việc |
| Q08 | Người giao/quản lý sửa hạn và quan trọng; người nhận sửa checklist, trạng thái, lịch làm riêng; đổi hạn ghi lịch sử. | Yêu cầu công việc |
| Q09 | Việc tiếp theo mặc định xếp quá hạn → hạn hôm nay → lịch làm hôm nay; xét hạn và quan trọng, cho đổi mặc định. | Yêu cầu công việc, trải nghiệm |
| Q10 | Hoàn thành là thao tác riêng; có mở lại và ghi người/thời điểm. | Yêu cầu công việc |
| Q11 | Giáo viên chọn sự kiện lớp cho cả lớp hoặc nhóm cụ thể. | Yêu cầu lịch |
| Q12 | Giáo viên/người quản lý tạo sự kiện chung; lớp trưởng cần quyền tạo được cấp; thành viên tạo sự kiện riêng. | Yêu cầu lịch |
| Q13 | Mục mới ở Thư viện nhóm mặc định chung; nội dung riêng lưu ở workspace cá nhân, Hộp thu vẫn riêng. | Yêu cầu Thư viện |
| Q14 | Đưa mục cá nhân vào nhóm bằng thao tác sao chép, giữ bản riêng nguồn. | Yêu cầu Thư viện |
| Q15 | Bản nộp có văn bản, đường dẫn, tệp và lưu nội dung theo phiên bản lúc Nộp. | Yêu cầu bài giao |
| Q16 | Phản hồi theo phiên bản; bản đầu chưa có điểm số/thang điểm. | Sản phẩm, yêu cầu bài giao |
| Q17 | Đổi hạn sau nộp có lịch sử; tình trạng đúng/muộn của bản cũ dựa hạn lúc nộp. | Yêu cầu bài giao |
| Q18 | Giáo viên ngừng giao/lưu trữ bài có tiến độ hoặc bản nộp, giữ lịch sử; bản đầu không xóa vĩnh viễn. | Yêu cầu bài giao |
| Q19 | Gantt mặc định ở Việc của tôi và workspace; bản đầu mở chi tiết để sửa, chưa kéo thả, lịch làm riêng vẫn riêng tư. | Trải nghiệm |
| Q20 | Bản đầu là web trên máy tính/điện thoại, lưu nhanh qua web; tích hợp chia sẻ từ ứng dụng khác đặc tả sau. | Sản phẩm, trải nghiệm |

`PR #6` trước đây đưa ba tài liệu mới vào nhánh; lần rà này đã giới hạn lại các mệnh đề theo chính các lượt xác nhận nêu trên. Tên và mã ngữ cảnh không chứng minh mọi chi tiết được diễn giải trong PR cũ đã được duyệt.

## Các nguồn cũ đã kiểm kê và xử lý

Các tệp dưới đây có mặt ở snapshot trước lần rà này, phần lớn phát sinh trong đợt tài liệu [ngày 2026-11-03](https://github.com/naverisme/snote/commit/0faca48035fc49e3eab9b975f5303e2b89ed0f0c) hoặc các commit kế tiếp. Có tệp là bản thảo, có tệp tự tuyên bố “đã khóa”/“sẵn sàng coding”; **không có bằng chứng chủ sản phẩm duyệt toàn bộ nội dung ấy**. Vì tài liệu xen kẽ ý đúng với quyết định chưa chốt, đã gỡ nguyên tệp khỏi cây hiện hành để tránh lấy nhầm làm nguồn triển khai. Bản cũ còn ở [snapshot lịch sử](https://github.com/naverisme/snote/tree/80c14b10b73d21b2e00ee9539953091d0f67351d/docs).

| Vùng nguồn lịch sử | Tệp đã gỡ | Nguyên nhân và trạng thái |
| --- | --- | --- |
| `requirements/` | `business-workflows.md`, `decisions.md`, `permissions.md`, `srs.md`, `use-cases.md` | Luồng, ma trận quyền, thuật toán sắp xếp và chính sách nộp/chia nhóm chứa quyết định chưa duyệt hoặc trái quyết định mới. Không giữ mã UC/FR/NFR làm chuẩn. |
| `architecture/` | `data-model.md`, `deployment.md`, `frontend-collaboration-wireframes.md`, `frontend-information-architecture.md`, `frontend-navigation.md`, `frontend-wireframes.md`, `implementation-contracts.md`, `m1-api-contract.md`, `sequences.md`, `system.md`, `task-views.md` | Schema, API, mô đun, triển khai và thành phần UI chưa được thảo luận/chốt. Một số mô hình nhóm tách `STUDY_GROUP` khỏi `WORKSPACE` và điều hướng Hộp thu cấp ứng dụng trái định nghĩa mới. |
| `architecture/assets/` | `m1-wireframes.svg`, `m2-m3-wireframes.svg`, `task-gantt-wireframe.svg` | Hình phụ thuộc wireframe cũ; chưa duyệt vị trí, số nút và hành động. |
| `delivery/` | `agent-work-plan.md`, `coding-readiness.md`, `plan.md` | Kế hoạch, mốc, phân công và kết luận sẵn sàng coding chưa được duyệt; `delivery/` không thuộc bảy nhóm `docs/` đã chốt. |

Ví dụ xung đột có thể kiểm tra ở [quyết định cũ](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/requirements/decisions.md): giới hạn một nhóm cứng không có cài đặt cho giáo viên và khóa tuyệt đối mọi lần nộp/sửa sau hạn; [ERD cũ](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/architecture/data-model.md) tách nhóm và workspace; [điều hướng cũ](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/architecture/frontend-information-architecture.md) đặt Hộp thu nhanh ngang cấp workspace. Ba tài liệu được biên soạn từ các mệnh đề có xác nhận trong đợt rà soát đó.

## Ánh xạ đợt tổ chức lại

Đối chiếu toàn bộ 9 tệp trong cây `s_note_v2` tại mốc `583435b35811ab4285447b3afb9aafbad04f6d82` với các quyết định trong cuộc trao đổi. Mốc này chứa các quyết định đến PR #10. Các bản AI Note, tệp thô kèm dự án và các nhánh khác nằm ngoài phạm vi của đợt tổ chức này. [Cây nguồn](https://github.com/naverisme/snote/tree/583435b35811ab4285447b3afb9aafbad04f6d82)

| Phần ở mốc nguồn | Mã nguồn và quy tắc | Nơi tra cứu chính sau khi tách |
| --- | --- | --- |
| Khái niệm, phạm vi bản đầu | SRC-01, SRC-03, SRC-04, SRC-07 đến SRC-10, Q02, Q16, Q18 đến Q20 | [Khái niệm](../docs/product/concepts.md), [phạm vi bản đầu](../docs/product/first-release.md) |
| Đăng ký, cách dùng tài khoản, workspace mặc định | SRC-01, SRC-02, SRC-07, SRC-08, SRC-11, ACC-01 đến ACC-06 | [Tài khoản và workspace](../docs/requirements/accounts-and-workspaces.md) |
| Vào lớp, vào nhóm, giới hạn, bàn giao | SRC-01, SRC-02, SRC-07 đến SRC-10, Q03, Q04, CLS-01 đến CLS-10 | [Tư cách lớp và nhóm](../docs/requirements/class-membership.md) |
| Chủ lớp, lớp trưởng, trưởng nhóm, ủy quyền | SRC-01, SRC-02, SRC-08, SRC-09, Q01, Q02, Q05, PER-01 đến PER-06 | [Vai trò và quyền](../docs/requirements/permissions.md) |
| Giao việc, hạn, checklist và bộ lọc | SRC-03, SRC-04, SRC-07, Q06 đến Q10, Q19, TASK-01 đến TASK-12 | [Công việc](../docs/requirements/tasks.md) |
| Sự kiện và quyền hiển thị lịch | SRC-04, Q11, Q12, Q19, CAL-01 đến CAL-05 | [Lịch](../docs/requirements/calendar.md) |
| Hộp thu, tệp, đường dẫn, văn bản, sao chép | SRC-03, SRC-07, SRC-08, Q13, Q14, Q20, LIB-01 đến LIB-04 | [Thư viện](../docs/requirements/library.md) |
| Tiến độ, quyền nộp, cấu hình quá hạn, bản nộp và phản hồi | SRC-05, SRC-07 đến SRC-10, Q15 đến Q18, ASG-01 đến ASG-10 | [Bài giao và nộp](../docs/requirements/assignments-and-submissions.md) |
| Điều hướng workspace, lối vào tài khoản và cách xem việc | SRC-03, SRC-04, SRC-07, SRC-08, SRC-13, SRC-14, Q09, Q19, Q20, NAV-01 đến NAV-06, VIEW-01 đến VIEW-04, UXR-01 đến UXR-14 | [Điều hướng](../docs/ux/validated-navigation.md), [chế độ xem việc](../docs/ux/task-views.md), [Gantt Q32](../docs/ux/workspace-gantt.md) |

Tệp `docs/requirements/verified-business-rules.md` giữ lối vào tới chỉ mục chủ đề. Nội dung gốc để so sánh nằm tại [mốc PR #10](https://github.com/naverisme/snote/blob/583435b35811ab4285447b3afb9aafbad04f6d82/docs/requirements/verified-business-rules.md). Mã mới dùng để dẫn chiếu tài liệu. Nghiệp vụ được kiểm theo nguồn trên. Các khoảng trống và đề xuất nằm ở [sổ câu hỏi](unresolved.md).

### Sơ đồ nghiệp vụ

| Sơ đồ | Quan hệ và nguồn | Phạm vi đối chiếu |
| --- | --- | --- |
| Vào lớp | Lời mời → người học chấp nhận. Mã lớp → yêu cầu → giáo viên duyệt. Hai đường dẫn đến tư cách có hiệu lực. CLS-02, CLS-03. | Luồng thành công tại lớp, dạng Mermaid flowchart. |
| Vào nhóm | Được mời hoặc xếp → người học chấp nhận. Tự yêu cầu → người có quyền duyệt. Khi tư cách có hiệu lực dưới giới hạn một nhóm, lời mời nhóm khác được lưu trữ và hết hiệu lực. CLS-05 đến CLS-07. | Luồng thành công tại nhóm và điều kiện vô hiệu lời mời, dạng Mermaid flowchart. |

Hai sơ đồ đặt cạnh quy tắc gốc trong [tư cách lớp và nhóm](../docs/requirements/class-membership.md). Ký pháp hiển thị theo [hướng dẫn Mermaid trên GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams#creating-mermaid-diagrams).
