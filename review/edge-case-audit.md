# SNOTE v2 — Tình huống biên, rủi ro và phản biện

| Trường | Nội dung |
| --- | --- |
| Mục đích | Chủ động tìm điều kiện khiến các quy tắc đã chốt xung đột, không đủ hoặc khó thực hiện; đưa ra phương án có thể kiểm chứng |
| Căn cứ | Quy tắc hiện hành trên `s_note_v2` sau I và J; yêu cầu chủ động phân tích tại [SRC-26](provenance.md). Không sử dụng v1 |
| Trạng thái | **Phân tích và đề xuất**, chưa phải yêu cầu mới được duyệt, chưa phải báo cáo lỗi tìm thấy trong mã chạy |
| Phương pháp | Xét luồng thường, quyền thay đổi, thao tác đồng thời, lỗi giữa chừng, hết hạn, lưu trữ/khôi phục và thay đổi múi giờ |
| Đầu ra | 24 ca, hậu quả dự kiến, phản biện lựa chọn, đề xuất và kết quả cần quan sát. Thiết kế tham khảo ở [đề xuất toàn vẹn dữ liệu](https://github.com/naverisme/snote/blob/49caff82e8b004ca0afc2ab52229c4711fdd9334/review/blocked/data-integrity-proposal.md) |

**Cách dùng.** “Đã chốt” chỉ phần có mã quy tắc dẫn nguồn. Phần “Đề xuất” là nhận định của tác nhân. “Kiểm chứng” là ca cần thực hiện sau khi có thiết kế/mã; chưa có ca nào trong hồ sơ này được chạy. Không tự chuyển các ca này vào `docs/quality/` với nhãn đã duyệt. Mức P0/P1/P2 là ưu tiên rà thiết kế theo hậu quả, không phải xác suất hay mức sự cố đã đo.

| Ưu tiên | Ý nghĩa | Ca |
| --- | --- | --- |
| P0 | Có thể mất dữ liệu, lộ dữ liệu, sai tư cách/quyền hoặc sai kết quả nộp; cần giải quyết trước khi triển khai thao tác liên quan | EC-01–07, EC-09–11, EC-15, EC-19, EC-22–23 |
| P1 | Có thể chặn người dùng hoặc hiển thị/lập lịch sai; cần khóa trước khi nghiệm thu luồng liên quan | EC-08, EC-12–14, EC-16–18 |
| P2 | Dễ gây hiểu lầm hoặc giảm khả năng dùng; cần đặc tả hành vi và quan sát trên mẫu | EC-20–21, EC-24 |

## EC-01 — Lịch sử không tính hạn mức vẫn chiếm máy chủ

- **Căn cứ:** [LIB-11/16/17](../docs/requirements/library.md). Hạn mức tính tệp hiện hành và bản chụp đã nộp; giữ lịch sử ghi đè, Thùng rác không tính hạn mức người dùng.
- **Tình huống:** Ghi đè một tệp 25 MB bằng 1.000 nội dung khác nhau. Chỉ khoảng 25 MB thuộc bản hiện hành, nhưng lịch sử có thể chiếm khoảng 25 GB, chưa tính sao lưu. Đây là minh họa số học, không phải dự báo tải thực.
- **Hậu quả:** Workspace dưới 1 GB vẫn làm đầy máy chủ hoặc tăng chi phí. Mình phản biện chính J1/J2: hạn mức hiển thị không đủ bảo vệ dung lượng vật lý.
- **Đề xuất:** Tách hạn mức người dùng và ngân sách lưu trữ vật lý; kiểm soát thao tác làm tăng dung lượng, cảnh báo và chặn tăng thêm khi hết ngân sách, bảo toàn bản đang có. Trần, phạm vi chia ngân sách và thông báo cần quyết định khi có máy chủ. Giới hạn số phiên bản hoặc tính lịch sử vào 1 GB là phương án thay đổi J1/J2, không được âm thầm áp dụng.
- **Kiểm chứng:** Mô phỏng nhiều lần ghi đè khác nội dung; số đo vật lý tăng đúng, quota logic không đếm sai. Khi không đủ chỗ, bản hiện hành/lịch sử vẫn đọc được và không xuất hiện dấu tích thành công.

## EC-02 — Hai lần tải đồng thời cùng vượt qua kiểm tra dung lượng

- **Căn cứ:** LIB-11/16, [ASG-16](../docs/requirements/assignments-and-submissions.md).
- **Tình huống:** Giới hạn giả định 1.000 MB, đã dùng 980 MB; hai người cùng tải tệp khác nhau 20 MB, đều thấy còn chỗ. Đơn vị MB/GB chính thức còn phải quy định.
- **Hậu quả:** Cả hai thành công làm vượt hạn; hoặc bộ đếm bị thiếu nếu cập nhật ghi đè nhau.
- **Đề xuất:** Giữ chỗ dung lượng theo phạm vi bằng thao tác nguyên tử, đối soát khi hoàn tất, trả chỗ khi thất bại/hết thời gian. Nội dung trùng trong cùng workspace được đối chiếu sau xác minh nội dung; không để việc khử trùng tiết lộ tệp của workspace khác. Đặt lại cả giao dịch khi gặp xung đột phù hợp cơ chế PostgreSQL [T1].
- **Kiểm chứng:** Cho hai yêu cầu vượt tổng chỗ trống chạy đồng thời; không cùng được chấp nhận vượt quota. Tải lỗi không giữ chỗ vĩnh viễn; tải cùng nội dung không bị tính hai lần sau hoàn tất.

## EC-03 — Dọn tệp nguồn làm hỏng bản nộp hoặc bản sao

- **Căn cứ:** LIB-12/14/16/17, ASG-04: bản sao độc lập, bản nộp giữ đúng phiên bản.
- **Tình huống:** Một nội dung được Thư viện, lịch sử và bản nộp cùng tham chiếu. Người dùng xóa mục nguồn rồi quá 30 ngày; có thể còn bản sao tại workspace khác.
- **Hậu quả:** Dọn bytes theo tuổi mục nguồn có thể xóa luôn nội dung của bản nộp/bản sao còn hợp lệ.
- **Đề xuất:** Theo dõi tham chiếu còn hiệu lực trước khi dọn bytes. Tách định danh mục, phiên bản nội dung và dữ liệu tệp bất biến; quyền đọc luôn theo đối tượng nghiệp vụ. “Xóa khỏi Thùng rác” không đồng nghĩa “xóa bytes đang được đối tượng khác dùng”. Không dùng đường dẫn tệp nguồn làm nội dung duy nhất của bản nộp.
- **Kiểm chứng:** Sau xóa nguồn và dọn rác, mở được bản sao và mọi phiên bản đã nộp với đúng nội dung; không còn lối truy cập trái quyền qua mục đã xóa.

## EC-04 — Hai người ghi đè hoặc khôi phục cùng một mục

- **Căn cứ:** LIB-12/13/17 cho phép nhiều người có quyền sửa, giữ lịch sử và sao chép độc lập; chưa có quy tắc xung đột Thư viện như ASG-12.
- **Tình huống:** A và B cùng mở phiên bản 5; A ghi đè thành 6, B vẫn lưu từ 5. Một người khác đồng thời sao chép hoặc khôi phục bản cũ.
- **Hậu quả:** Thay đổi của A bị thay mà B không biết; bản sao có metadata và bytes thuộc hai phiên bản khác nhau.
- **Đề xuất:** Kiểm phiên bản nền khi lưu, báo xung đột và giữ bản hiện hành; cho xem bản mới hoặc chọn tạo bản sao. Sao chép chốt một phiên bản nguồn duy nhất. Khôi phục nên tạo phiên bản hiện hành mới tham chiếu nội dung cũ, giữ dấu hành động. Đây là bổ sung cơ chế Thư viện, cần duyệt trước khi thành hợp đồng.
- **Kiểm chứng:** Hai lưu đồng thời không âm thầm mất thay đổi; bản sao khớp hoàn toàn một phiên bản đã xác định; lịch sử chỉ đúng người/thời điểm.

## EC-05 — Máy chủ đã nộp thành công nhưng trình duyệt mất phản hồi

- **Căn cứ:** ASG-12/17, LIB-15. J5 nói về **ghi thất bại**, chưa nói về **không biết đã ghi hay chưa**.
- **Tình huống:** Máy chủ ghi phiên bản và tệp thành công, phản hồi bị mất; người dùng bấm Thử lại.
- **Hậu quả:** Tạo hai phiên bản cho cùng lần bấm, tính quota lặp hoặc báo thất bại dù giáo viên đã nhận bài. Dọn “tệp tạm” thiếu kiểm tra còn có thể xóa tệp vừa được chốt.
- **Đề xuất:** Mỗi ý định gửi có mã thao tác chống lặp, gắn người dùng/phạm vi và dấu nhận dạng nội dung. Gửi lại cùng thao tác trả kết quả cũ; nội dung thay đổi phải là ý định mới. Nếu chưa rõ kết quả, tra trạng thái trước khi dọn hoặc tạo phiên bản khác. Không trả nội dung của thao tác cũ nếu người gọi đã mất quyền đọc.
- **Kiểm chứng:** Cắt kết nối ngay sau ghi rồi gửi lại nhiều lần: đúng một phiên bản, một biên nhận, quota đúng; tải tệp hoặc ghi thất bại thực sự không tạo phiên bản.

## EC-06 — Tải trước hạn, hoàn tất nộp sau hạn

- **Căn cứ:** ASG-05–08/15/17; có hai quyền sau hạn độc lập, nhưng thời điểm xác định một lần Nộp chưa chốt.
- **Tình huống:** Bắt đầu tải 23:59:50, máy chủ đủ nội dung và xử lý xác nhận lúc 00:00:05; giáo viên có thể đổi hạn/cài đặt trong lúc tải.
- **Hậu quả:** Máy khách và máy chủ kết luận khác nhau; dùng thời điểm bắt đầu tải tạo cách vượt khóa quá hạn.
- **Đề xuất:** Chốt một thời điểm chấp nhận trên máy chủ trong thao tác hoàn tất; lúc đó kiểm quyền, hạn và cài đặt có hiệu lực, lưu bằng chứng cấu hình cùng kết quả. Bắt đầu tải chưa giữ quyền nộp trước hạn. Biên nhận của thao tác đã thành công vẫn giữ thời điểm cũ khi gửi lại theo EC-05. Cần thông báo rõ quy tắc này trong màn nộp.
- **Phản biện:** Cách này có thể khiến mạng chậm thành nộp muộn. Phương án giữ thời điểm bắt đầu cần thêm vé tiếp nhận có hạn và quy tắc chống lạm dụng; mình chưa đề xuất cho bản đầu.
- **Kiểm chứng:** Kiểm trước/đúng/sau mốc hạn, đổi hạn đồng thời, từng tổ hợp hai quyền sau hạn và gửi lại sau khi đã có biên nhận. Kết quả cũ không bị phân loại lại.

## EC-07 — Mất quyền hoặc lưu trữ workspace trong lúc đang tải

- **Căn cứ:** [PM-01–05](../docs/requirements/access-control.md), LIB-15, ASG-17.
- **Tình huống:** Người dùng mở biểu mẫu khi còn quyền; trong lúc tải, giáo viên thu hồi quyền Nộp hoặc lưu trữ lớp.
- **Hậu quả:** Chỉ kiểm quyền lúc mở màn khiến dữ liệu mới lọt vào sau khi quyền đã dừng.
- **Đề xuất:** Kiểm lại quyền/tư cách/trạng thái lưu trữ tại thời điểm chốt thao tác; không công bố mục hoàn chỉnh nếu không còn hợp lệ. Nếu dùng URL tải trực tiếp tạm thời, quyền tải bytes không được coi là quyền hoàn tất nghiệp vụ. TTL của URL và cách hạn chế tải xuống sau mất quyền cần đặc tả riêng.
- **Kiểm chứng:** Thu hồi trước khi hoàn tất làm thao tác bị từ chối mà không đổi bản hiện hành; trả phần quota giữ chỗ, dọn tệp sau khi xác minh chưa được tham chiếu.

## EC-08 — Khôi phục Thùng rác khi workspace đã đầy

- **Căn cứ:** LIB-14/16: có quyền khôi phục trong 30 ngày, nội dung chỉ nằm ở rác không tính quota.
- **Tình huống:** Xóa tệp, dùng chỗ trống để tải tệp khác rồi khôi phục tệp đã xóa.
- **Hậu quả:** Khôi phục vượt hạn hoặc thất bại không có giải thích. Chỉ tăng bộ đếm theo kích thước tệp cũng sai nếu nội dung đã được bản nộp tính quota.
- **Đề xuất:** Tính phần tăng thực tế và giữ chỗ như tải mới. Nếu thiếu chỗ, giữ mục trong rác theo thời hạn đang có, báo dung lượng cần giải phóng; không xóa mục vì thử khôi phục thất bại. Không tự kéo dài 30 ngày; đề xuất ngoại lệ kéo dài cần quyết định sản phẩm riêng.
- **Kiểm chứng:** Cả hai trường hợp nội dung đã/ chưa được tính quota; khôi phục đủ chỗ thành công, thiếu chỗ không làm mất mục sớm.

## EC-09 — Cùng lúc được duyệt vào hai nhóm

- **Căn cứ:** [CLS-05–07/11](../docs/requirements/class-membership.md), PM-20.
- **Tình huống:** Lớp giới hạn một nhóm, giáo viên và lớp trưởng duyệt hai yêu cầu khác nhau cùng lúc; hoặc người học chấp nhận lời mời khi một yêu cầu khác được duyệt.
- **Hậu quả:** Mỗi thao tác riêng đều thấy còn chỗ nhưng kết quả có hai tư cách hoạt động.
- **Đề xuất:** Mọi đường kích hoạt tư cách cùng dùng một kiểm tra nguyên tử theo người học + lớp, bao gồm kiểm tư cách lớp, giới hạn, thêm nhóm và vô hiệu lời mời. Không chỉ khóa nút trên giao diện; không đặt duy nhất “một nhóm” cứng trong schema vì giáo viên có thể đổi giới hạn.
- **Kiểm chứng:** Chạy các cặp duyệt/chấp nhận đồng thời: tối đa số tư cách cho phép có hiệu lực; thao tác còn lại báo đã hết chỗ, lời mời cũ không tự hồi sinh.

## EC-10 — Hai lời bàn giao chủ cùng được chấp nhận

- **Căn cứ:** [ACC-08/09](../docs/requirements/accounts-and-workspaces.md), CLS-10/12, PER-03.
- **Tình huống:** Chủ gửi bàn giao cho B rồi C; B và C chấp nhận gần nhau. Hoặc người nhận rời workspace trước khi chấp nhận.
- **Hậu quả:** Hai chủ có hiệu lực, mất chủ hoặc chủ cũ rời khi bàn giao chưa thực sự xong.
- **Đề xuất:** Với chuyển chủ workspace độc lập, chỉ một yêu cầu đang chờ có hiệu lực; thay người nhận vô hiệu yêu cầu trước. Chấp nhận kiểm lại chủ hiện hành, tư cách người nhận và trạng thái không đổi rồi chuyển nguyên tử. Chuyển chủ lớp kiểm thêm cách dùng Giáo viên theo CLS-10. Không mặc định quy tắc này cho đổi trưởng nhóm: người nhận trưởng nhóm có phải chấp nhận và ai được chọn còn cần đặc tả riêng.
- **Kiểm chứng:** Sau các lần chấp nhận cạnh tranh chỉ một chủ; lời cũ không thay chủ mới; không cho chủ cũ rời trước bàn giao hợp lệ.

## EC-11 — Khôi phục nhóm làm vượt giới hạn nhóm hoạt động

- **Căn cứ:** CLS-06/11/16. Chưa định nghĩa đủ cách tính tư cách trong nhóm lưu trữ và cách khôi phục khi đã tham gia nhóm khác.
- **Tình huống:** Nhóm A lưu trữ; người học vào B; giáo viên khôi phục A trong lớp giới hạn một nhóm.
- **Hậu quả:** Hoặc vượt giới hạn, hoặc người học mất nhóm/việc mà không đồng ý. Ngoại lệ khi **giảm giới hạn** ở CLS-11 không tự áp dụng cho khôi phục.
- **Đề xuất:** Khôi phục phải có bước kiểm trước và liệt kê xung đột cho giáo viên; giữ nguyên nhóm lưu trữ nếu chưa giải quyết. Giáo viên chọn điều chỉnh giới hạn hoặc hoàn tất chuyển/bàn giao theo quy tắc. Không tự đẩy người học khỏi B hay tự khôi phục một phần A.
- **Phản biện:** Chặn cả nhóm gây chậm vì một thành viên, nhưng ít mơ hồ hơn mở nhóm với tư cách nửa hoạt động; cơ chế khôi phục một phần cần thiết kế và duyệt riêng.
- **Kiểm chứng:** Khôi phục có/không xung đột; thất bại không đổi một phần tư cách, dữ liệu hoặc lời mời.

## EC-12 — Muốn rời lớp đang lưu trữ nhưng còn việc cần bàn giao

- **Căn cứ:** CLS-08–10/12/14, ACC-09/10: lưu trữ chỉ đọc, rời cần bàn giao.
- **Tình huống:** Trưởng nhóm còn việc chưa xong muốn rời lớp lưu trữ; chủ lớp cũng có thể không còn hoạt động thường xuyên.
- **Hậu quả:** Bàn giao bị khóa bởi chỉ đọc, rời bị khóa bởi chưa bàn giao; không có đường hoàn tất rõ ràng.
- **Đề xuất:** Bản đầu hướng về luồng chủ lớp khôi phục → giải quyết bàn giao/rời → lưu trữ lại; phải nêu hệ quả khôi phục trong UX. Nếu muốn bàn giao ngay khi lưu trữ, tách thao tác quản trị vòng đời khỏi nội dung chỉ đọc bằng một quyết định mới. Chưa đủ căn cứ cho tác nhân tự cấp ngoại lệ này.
- **Kiểm chứng:** Giao diện giải thích điều kiện đang chặn và người có quyền xử lý, không chỉ hiện lỗi chung. Trường hợp chủ không còn truy cập cần chính sách hỗ trợ tài khoản riêng.

## EC-13 — Sự kiện cả ngày bị chuyển sang ngày khác

- **Căn cứ:** [CAL-09](../docs/requirements/calendar.md), ASG-07, TASK-06; múi giờ lớp đã có, nguồn múi giờ workspace/riêng chưa rõ.
- **Tình huống:** Lưu ngày 10/11 thành 00:00 UTC rồi hiển thị theo múi giờ người xem; ở một số nơi thành 09/11. Hoặc đổi múi giờ lớp sau khi tạo.
- **Hậu quả:** Vi phạm J7 dù định dạng thời điểm kỹ thuật có vẻ hợp lệ.
- **Đề xuất:** Sự kiện cả ngày lưu ngày dân sự riêng với sự kiện có giờ; giữ ngày và nguồn múi giờ lúc tạo. Không coi một ngày là 24 giờ cố định. Đề xuất lớp dùng múi giờ lớp; workspace nhóm kế thừa lớp; workspace độc lập dùng múi giờ được đặt cho workspace; sự kiện riêng dùng múi giờ người tạo lúc lưu. Phần chọn/đổi múi giờ workspace là bổ sung chưa duyệt.
- **Kiểm chứng:** Cùng sự kiện qua nhiều múi giờ vẫn trên đúng ngày đã chọn; sự kiện có giờ đổi giờ hiển thị đúng. Đổi múi giờ về sau không sửa ngày cũ.

## EC-14 — Một ngày hợp lệ bị chặn bởi “kết thúc phải sau bắt đầu”

- **Căn cứ:** CAL-09; [G6 tạm duyệt](https://github.com/naverisme/snote/blob/49caff82e8b004ca0afc2ab52229c4711fdd9334/review/blocked/ux-q33-g-provisional.md) đề xuất kết thúc sau bắt đầu.
- **Tình huống:** Người dùng chọn cả ngày 10/11–10/11. Kiểm tra dùng chung với sự kiện có giờ từ chối lưu.
- **Hậu quả:** Quy tắc kỹ thuật của bản thảo làm mất trường hợp đã chốt.
- **Đề xuất:** Phân loại trước khi kiểm tra: sự kiện có giờ cần kết thúc sau bắt đầu; cả ngày cho phép ngày cuối bằng ngày đầu. UI hiển thị ngày cuối được tính vào sự kiện; mô hình trao đổi có thể dùng ngày kết thúc loại trừ, phù hợp RFC 5545 [T2]. Ví dụ UI 10–10/11 tương ứng khoảng ngày [10/11, 11/11). Đây là đề xuất hợp đồng, không phải schema đã chốt.
- **Kiểm chứng:** Một ngày, nhiều ngày, cuối tháng/năm và đổi loại sự kiện; không lệch một ngày khi lưu rồi đọc lại.

## EC-15 — Dữ liệu riêng lộ qua số đếm, tìm kiếm hoặc cảnh báo trùng lịch

- **Căn cứ:** PM-02, CAL-05, TASK-07, LIB-02.
- **Tình huống:** Không hiện buổi làm riêng của người khác nhưng dùng nó để tính “bận”, cảnh báo trùng, tìm kiếm, tổng số mục hoặc thứ tự danh sách chung.
- **Hậu quả:** Vẫn suy ra hoạt động riêng dù nội dung đã bị ẩn; giáo viên có thể nhìn được giờ làm cá nhân qua màn tổng hợp.
- **Đề xuất:** Giới hạn tập dữ liệu theo quyền trước khi lọc, tổng hợp hoặc tính xung đột. Không dùng buổi làm riêng của người khác để suy diễn trạng thái lịch chung. API tìm kiếm, xuất dữ liệu và phần xem trước phải dùng cùng ranh giới.
- **Kiểm chứng:** Người thứ hai thay đổi buổi làm riêng không làm thay đổi kết quả chung mà người thứ nhất nhìn thấy, trừ dữ liệu được chia sẻ rõ ràng.

## EC-16 — “Việc tiếp theo” bỏ sót việc có hạn trong tương lai

- **Căn cứ:** TASK-11/17 xác định ba nhóm theo hôm nay/quá hạn và Chưa lên lịch. Việc có hạn tuần sau, không có buổi hôm nay không thuộc bốn nhóm này.
- **Tình huống:** Người dùng không có việc hôm nay nhưng có việc quan trọng vào ngày mai; màn chính có thể có vẻ không còn việc. Việc chỉ có buổi làm trong quá khứ cũng chưa được xếp rõ.
- **Hậu quả:** Không đáp ứng mục tiêu người dùng biết việc cần làm tiếp theo; việc quan trọng không có hạn cũng có thể chìm dưới nhiều việc quá hạn.
- **Đề xuất:** Bổ sung vùng Sắp tới thu gọn sau các nhóm đã chốt và cho biết số việc, dẫn đến danh sách theo thời gian; không trộn âm thầm vào hôm nay. Giữ tùy chỉnh sắp xếp theo mức quan trọng. Chốt riêng cách xử lý buổi làm đã qua, việc đã hoàn thành và khóa phá hòa cho ba nhóm cũ; J10 chỉ chốt khóa cho Chưa lên lịch.
- **Kiểm chứng:** Bộ dữ liệu phủ mọi tổ hợp hạn/buổi làm/trạng thái đều có lối tìm đến, không trùng việc; cách xếp mặc định và tùy chỉnh có kết quả ổn định. Bố cục bổ sung vẫn là đề xuất cần duyệt.

## EC-17 — Checklist trống hoặc bị thay đổi sau khi hoàn thành

- **Căn cứ:** TASK-08/09/15/16 tách tỷ lệ checklist khỏi thao tác hoàn thành.
- **Tình huống:** 0 mục; xóa hết mục; thêm mục chưa xong vào việc đã hoàn thành; bỏ đánh dấu một mục sau khi xong việc.
- **Hậu quả:** 0/0, nhãn 100% sai hoặc tự mở lại việc trái ý người dùng. Quy tắc hiện tại chưa nêu việc đã hoàn thành còn cho sửa checklist đến mức nào.
- **Đề xuất:** Khi không có mục, hiện “Chưa có checklist”, không tự suy ra 100%. Nếu cho sửa checklist của việc hoàn thành, tỷ lệ cập nhật nhưng trạng thái chỉ đổi bằng Mở lại; cảnh báo rõ sự khác nhau. Có thể chọn khóa checklist khi hoàn thành, nhưng đó là chính sách mới, không suy ra từ Q10.
- **Kiểm chứng:** 3/5 = 60%; 0 mục không chia cho 0; thay số mục không tự đổi người chịu trách nhiệm hay trạng thái; các thay đổi được ghi dấu.

## EC-18 — Giao lại việc nhưng lịch làm riêng của người cũ vẫn nhắc

- **Căn cứ:** TASK-07/13/16; J11 chuyển quyền checklist, không quy định vòng đời buổi làm riêng.
- **Tình huống:** A có các buổi làm tương lai, việc được giao sang B; A còn hoặc không còn tư cách nhóm.
- **Hậu quả:** A vẫn bị nhắc việc không còn phụ trách; hoặc lịch riêng bị chuyển cho B làm lộ dữ liệu.
- **Đề xuất:** Không chuyển buổi làm riêng sang người mới. Đề xuất giữ lịch sử riêng của A, đánh dấu việc đã chuyển và ngừng nhắc các buổi gắn trách nhiệm cũ; B tự lập lịch. Phạm vi hiển thị nội dung việc cho A khi đã mất tư cách phải theo PM-01, không dùng bản lưu lịch riêng để mở lại nội dung chung trái quyền.
- **Kiểm chứng:** B nhận checklist và lịch sử chung nhưng không nhận lịch riêng của A; A không sửa việc bằng quyền cũ và không bị nhắc sai nếu chốt phương án ngừng nhắc.

## EC-19 — URL xem trước dẫn máy chủ đến tài nguyên nội bộ

- **Căn cứ:** LIB-10/18 chỉ cho đích web công khai và kiểm chuyển hướng.
- **Tình huống:** URL đầu công khai chuyển hướng vào địa chỉ nội bộ; DNS đổi kết quả giữa kiểm tra và kết nối; ảnh bìa trỏ đến đích bị cấm hoặc trả dữ liệu quá lớn.
- **Hậu quả:** Dịch vụ xem trước có thể truy cập tài nguyên nội bộ hoặc bị chiếm tài nguyên. Kiểm chuỗi URL ban đầu là chưa đủ.
- **Đề xuất:** Kiểm cả đích kết nối thực, từng chuyển hướng và URL ảnh; giới hạn giao thức, thời gian, số hop và bytes; không gửi cookie/credential người dùng tới nguồn. Hướng OWASP [T3] chỉ là cơ sở kỹ thuật, chưa xác định các ngưỡng của SNOTE. Lưu Văn bản không phụ thuộc thành công của xem trước; lỗi trả fallback tên miền/URL.
- **Kiểm chứng:** Các URL loopback/private, redirect, thay DNS và ảnh quá lớn không vượt ranh giới truy cập; URL công khai hợp lệ vẫn có preview; văn bản luôn được lưu độc lập khi hợp lệ.

## EC-20 — Ảnh xem trước cũ ghi đè URL mới

- **Căn cứ:** LIB-09/18 chỉ lấy URL đầu tiên khi lưu/đổi URL đầu.
- **Tình huống:** Đổi A sang B; tác vụ lấy A chậm hơn và hoàn tất sau B; hoặc xóa mọi URL trong lúc đang lấy ảnh.
- **Hậu quả:** Nội dung nói B nhưng thẻ bìa lại của A, gây nhầm nguồn.
- **Đề xuất:** Kết quả preview chỉ cập nhật nếu URL đầu và phiên bản nội dung còn trùng yêu cầu đã phát sinh. Khi không còn URL thì xóa liên kết preview hiện hành; bộ nhớ đệm nguồn có vòng đời riêng. Không đánh dấu toàn bộ mục bị lỗi chỉ vì preview lỗi.
- **Kiểm chứng:** Hoán đổi thứ tự phản hồi A/B và xóa URL lúc tải; không bao giờ hiện thẻ của URL cũ dưới nội dung mới.

## EC-21 — Tự định dạng phá thao tác gõ tiếng Việt hoặc dán nội dung

- **Căn cứ:** LIB-09/10; chỉ rõ `- `, `1. ` và Enter, chưa mô tả bộ gõ, dán, Hoàn tác hoặc nhận diện mọi dạng URL.
- **Tình huống:** Bộ gõ đang tổ hợp ký tự, người dùng dán danh sách nhiều dòng, viết `1.5`, địa chỉ email hoặc URL có dấu câu cuối.
- **Hậu quả:** Nhảy con trỏ, mất ký tự, tự tạo link sai hoặc biến văn bản thông thường thành danh sách.
- **Đề xuất:** Chỉ áp dụng mẫu ở đầu dòng khi thao tác nhập đã hoàn tất; hỗ trợ Hoàn tác chuyển đổi. Đề xuất dán giữ nội dung trước, không chạy lặp quy tắc gõ cho từng ký tự. Phân biệt URL với email/số thập phân, cắt dấu câu ngoài URL; bộ quy tắc nhận diện cụ thể cần mẫu thử.
- **Kiểm chứng:** Gõ tiếng Việt trên máy tính/điện thoại, dán nhiều dòng, Enter tại mục trống, Undo và URL có dấu ngoặc; nội dung không bị mất hoặc tự gửi sang nguồn ngoài khi đang gõ.

## EC-22 — Sao lưu dữ liệu nghiệp vụ và tệp không cùng trạng thái

- **Căn cứ:** LIB-13/15/17, ASG-04/17; môi trường và mục tiêu phục hồi còn [R-17](unresolved.md).
- **Tình huống:** Có bản sao PostgreSQL tại T1 nhưng kho tệp chỉ phục hồi được T0; tác vụ dọn rác chạy trước khi nhận ra bản ghi đã được khôi phục.
- **Hậu quả:** Giao diện có phiên bản nhưng tệp mất, hoặc khôi phục nhầm bytes. Chỉ có backup database không đủ cho lời hứa giữ bản nộp.
- **Đề xuất:** Thiết kế sao lưu và phục hồi theo cả metadata lẫn đối tượng tệp, kèm đối soát tham chiếu và kiểm toàn vẹn. Tạm dừng dọn rác trong quá trình phục hồi/đối soát. Tệp ghi xong nhưng metadata chưa xác định trạng thái phải được kiểm lại sau khởi động; không dọn dựa riêng tên hoặc tuổi tệp. Mục tiêu mất dữ liệu/thời gian phục hồi chưa có số được duyệt.
- **Kiểm chứng:** Phục hồi vào môi trường tách biệt và đọc lại các phiên bản nộp, bản sao, lịch sử ghi đè; xác minh nội dung đúng và không có tham chiếu thiếu. Đây là bài diễn tập cần thực hiện, chưa phải kết quả đã đạt.

## EC-23 — Người tải tệp lên hoặc tự chọn Teacher bị hiểu thành quyền vĩnh viễn

- **Căn cứ:** ACC-03/05, PM-01–05, LIB-13.
- **Tình huống:** Người tải lên đã rời workspace vẫn biết URL/mã mục; hoặc chọn Giáo viên rồi thử sửa lớp của người khác.
- **Hậu quả:** Kiểm riêng `uploader` hoặc cách dùng Teacher vượt ranh giới tư cách, mở dữ liệu ngoài phạm vi.
- **Đề xuất:** Hành động cần đồng thời có tư cách/phạm vi hợp lệ, quyền cho đúng đối tượng và trạng thái cho phép. Trường người tạo/người tải là bằng chứng lịch sử, không tự giữ quyền sau rời; Teacher mở chức năng tạo lớp, không cấp quyền chủ các lớp khác. Cache/quyền giao diện không thay kiểm tra máy chủ.
- **Kiểm chứng:** Thử đọc/sửa/tải bằng mã đối tượng cũ sau rời hoặc đổi vai trò; từ chối đúng phạm vi. Lịch sử vẫn ghi đúng tác giả cũ.

## EC-24 — Hủy sự kiện nhưng bản sao màn hình hoặc nhắc lịch vẫn còn hiệu lực

- **Căn cứ:** CAL-03/08/11 cho cùng sự kiện xuất hiện ở nhiều lịch và giữ dấu Đã hủy; cơ chế nhắc chưa được chốt đầy đủ.
- **Tình huống:** Hủy sự kiện lớp đang xuất hiện ở Lịch của tôi và lịch nhóm; nếu sau này có nhắc, một nhắc đã nằm trong hàng chờ.
- **Hậu quả:** Một lịch báo hủy, lịch khác vẫn báo cuộc họp sắp diễn ra; phát nhắc trễ cho sự kiện đã hủy.
- **Đề xuất:** Các lịch đọc cùng trạng thái nguồn, không nhân bản độc lập sự kiện lớp. Khi có nhắc, kiểm trạng thái và đối tượng nhận ngay trước phát; thao tác hủy lặp không tạo nhiều lịch sử hủy hoặc nhắc hủy. Dấu vết vẫn theo quyền hiện hành, không làm người đã rời thấy lại dữ liệu.
- **Kiểm chứng:** Hủy qua một màn rồi mở các lịch liên quan, tất cả thể hiện Đã hủy; không còn hành động/nhắc tham dự trái trạng thái. Bản đầu không phát sinh chuỗi lặp vì CAL-10.

## Khuyến nghị của tác nhân

1. Ưu tiên chốt ngân sách vật lý và quy tắc bảo vệ bản đã lưu (EC-01–03), cùng thời điểm nhận bài và chống gửi trùng (EC-05–07). Các điểm này ảnh hưởng trực tiếp lời hứa không mất bản nộp.
2. Đặt ràng buộc tư cách, quyền và thao tác khôi phục tại một nơi kiểm soát nhất quán (EC-09–12/23); giao diện chỉ phản ánh kết quả, không thay quyết định quyền.
3. Tách ngày dân sự khỏi thời điểm; hoàn chỉnh phạm vi Việc tiếp theo và lịch riêng khi giao lại (EC-13–18) trước khi đóng hợp đồng màn hình.
4. Giữ các quyết định mới ở hồ sơ đề xuất cho tới khi có duyệt; J không tự chốt G1–G12 hoặc mô hình dữ liệu. Không có cơ sở kết luận bộ tài liệu đã sẵn sàng giao coding toàn bộ.

## Cơ sở kỹ thuật bên ngoài

Các nguồn sau hỗ trợ cơ chế được đề xuất; không phải chứng nhận SNOTE tuân thủ tiêu chuẩn và không thay quyết định sản phẩm. Không lấy một phiên bản tài liệu tham khảo làm quyết định phiên bản công nghệ.

| Mã | Nguồn chính thức | Phần áp dụng |
| --- | --- | --- |
| T1 | [PostgreSQL — Serialization Failure Handling](https://www.postgresql.org/docs/18/mvcc-serialization-failure-handling.html) | Khi dùng mức cô lập tương ứng, lỗi serialization cần thử lại toàn bộ giao dịch, gồm logic lựa chọn; áp dụng để thiết kế kiểm quota/tư cách cạnh tranh, không phải tự chọn mức cô lập toàn hệ thống |
| T2 | [RFC 5545 — iCalendar](https://www.rfc-editor.org/rfc/rfc5545.html) | Sự kiện kiểu DATE và ngày kết thúc không bao gồm trong khoảng; làm cơ sở đề xuất biểu diễn sự kiện cả ngày |
| T3 | [OWASP — SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) | Kiểm đích kết nối, DNS và chuyển hướng cho dịch vụ lấy nội dung bên ngoài |
