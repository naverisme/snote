# Hướng dẫn tác nhân — SNOTE v2

Áp dụng trên `s_note_v2` và các nhánh tách từ đó.

**Ranh giới nguồn:** Cấm đọc, sao chép, chuyển đổi hoặc tái sử dụng tài liệu, thiết kế, mã nguồn và dữ liệu từ SNOTE v1 để lập đặc tả hay triển khai v2. Chỉ dùng quyết định đã xác nhận cho v2 và tài liệu hiện hành có dấu vết nguồn trong nhánh `s_note_v2`. Khi còn thiếu dữ kiện môi trường, ghi vào `review/`; theo [SRC-27](review/provenance.md), tác nhân được tự quyết thiết kế trong bảy nhóm docs với nguồn, giới hạn và phép kiểm rõ ràng. Không điền bằng nội dung v1. Lịch sử Git của v2 chỉ phục vụ truy vết việc sửa/gỡ tài liệu v2, không tự trở thành nguồn thiết kế.

1. Đọc [chỉ mục tài liệu](docs/README.md) và [quy ước](docs/DOCUMENTATION_POLICY.md). Chọn tài liệu chủ đề theo nhiệm vụ. Xác định phạm vi và phiên bản quyết định trước khi dùng.
2. Tra mã quy tắc ở tài liệu chủ đề. Kiểm bằng chứng trong [hồ sơ nguồn](review/provenance.md) khi có hai cách hiểu, ảnh hưởng liên nhóm hoặc cần xác minh một quyết định.
3. Chủ động rà tình huống bình thường, ngoại lệ, đồng thời và lỗi giữa chừng; dự đoán hậu quả, phản biện phương án của mình và nêu đề xuất cụ thể theo yêu cầu SRC-26. Dùng [sổ câu hỏi](review/unresolved.md) và [hồ sơ tình huống](review/edge-case-audit.md), ghi nguồn, điều kiện, rủi ro, lựa chọn và kết quả kiểm chứng mong đợi. Tự hoàn thiện phần phân tích đã được giao; chỉ gom những quyết định sản phẩm còn thiếu để chủ sản phẩm cân nhắc. Quyền tự quyết tại SRC-27 cho phép chuyển thiết kế cụ thể đủ căn cứ vào docs; số liệu phụ thuộc máy chủ, chi phí và kết quả thử nghiệm không được tự bịa. Ghi giới hạn và giữ bản thảo lịch sử ở review.
4. Xếp bản thô v2, bản vẽ đề xuất và dấu vết vào khu vực [rà soát](review/README.md). Không đưa nguồn v1 vào khu vực này. Lịch sử Git của v2 chỉ phục vụ kiểm kê thay đổi và không cấp hiệu lực cho bản cũ.
5. Khi thay tài liệu, cập nhật chỉ mục và liên kết chịu ảnh hưởng. Khi nhận việc coding, bắt buộc đọc [kế hoạch xây dựng](IMPLEMENTATION_PLAN.md), [luật worktree](WORKTREES.md), [OpenAPI](docs/contracts/openapi.yaml) và issue được giao; chỉ sửa vùng tệp sở hữu. Foundation #28 là cổng ghép trước bốn worktree tính năng, mỗi worktree sở hữu cả API và UI của một luồng.
6. Giao thức tự động phối hợp qua winwork:
   - Định vị vai trò:
     * Nhánh chính (s_note_v2 / main): Đóng vai trò Bộ chỉ huy điều phối. Giao việc bằng `winwork assign <nhánh_phụ> "<yêu cầu>" [-File <tệp>]`, và nghiệm thu lưu vết bằng `winwork verify <TASK_ID> -Note "<kết quả>"`.
     * Nhánh phụ (Workers: foundation, api-a, web-a...): Nhận lệnh từ PTY stream hoặc kiểm tra hàng đợi bằng `winwork inbox`.
   - Quy tắc hành vi bắt buộc của Agent:
     * Khi nhận được tín hiệu có mã `[TASK-ID]`: Đọc kỹ mô tả và file đính kèm, chỉ sửa đổi trong phạm vi vùng tệp sở hữu tại [WORKTREES.md](WORKTREES.md).
     * Khi hoàn thành: Commit mã nguồn lấy commit SHA và bắt buộc chạy lệnh:
       `winwork resolve <TASK_ID> -Sha <COMMIT_SHA> -Note "<mô tả kiểm thử>"`
       *(Lệnh này tự động cập nhật review/inbox, kích hoạt tín hiệu Reverse PTY báo cáo Bộ chỉ huy và tự động kích hoạt Auto-Advance để Worker làm tiếp task mới).*
      * Quy tắc Đường ống Bất đồng bộ (Async Worker Protocol - Cấm Worker ngồi chờ):
        - Nghiệm thu của Bộ chỉ huy (winwork verify) là cổng kiểm định chất lượng chạy song song bất đồng bộ, KHÔNG PHẢI điều kiện để Worker dừng code.
        - Sau khi chạy winwork resolve, Worker NGHIÊM CẤM ngồi chờ Bộ chỉ huy nghiệm thu. Nếu trong 
eview/inbox/ hoặc WORK_QUEUE.md còn task tiếp theo trong phân vùng sở hữu, Worker BẮT BUỘC tự động chuyển sang làm task tiếp theo ngay lập tức.
        - Nếu đã giải quyết hết task trong inbox: Worker lập tức chạy toàn bộ test suite (unit test, contract validation, build, lint, edge cases) và tự giác mở Pull Request vào s_note_v2.
     * Khi cần báo cáo nhánh chính hoặc bị nghẽn (blocker): Bắt buộc dùng `winwork send main "<nội dung báo cáo/nhờ giúp>"` để gửi thông báo về Bộ chỉ huy.
     * Khi cần trao đổi với nhánh phụ khác: Dùng `winwork send <tên_nhánh> "<nội dung>"`.
     * Khi Bộ chỉ huy nghiệm thu: Chạy `winwork verify <TASK_ID> -Note "<kết quả>"`, hệ thống tự động lưu vết vào `review/archive/completed-tasks.md` và bắn tín hiệu xác nhận về lại worker.
     * Quy tắc Nghiệm thu & Giao việc Tức thì (Zero-Idle Continuous Pipeline):
       - Bộ chỉ huy (s_note_v2 / main) KHÔNG ĐƯỢC PHÉP ngồi chờ hoặc dừng hỏi người dùng nếu trong `WORK_QUEUE.md` vẫn còn việc chưa làm.
       - Khi nhận tín hiệu `RESOLVED` từ worker: Bộ chỉ huy lập tức kiểm tra commit và chạy test nghiệm thu.
       - Nghiệm thu & giao việc tiếp theo tức thì trong 1 lệnh duy nhất:
         `winwork verify <TASK_ID> -Note "<kết quả test>" -Next "<yêu cầu task tiếp theo trích từ WORK_QUEUE.md>"`
         (Lệnh này đóng task cũ, lưu vết vào archive, và ngay lập tức tự động dispatch task mới sang worker mà không có độ trễ).
       - Nếu worker đã xong toàn bộ việc độc lập: Bộ chỉ huy lập tức giao lệnh mở Pull Request: `winwork assign <tên_nhánh> "Mở Pull Request vào s_note_v2 kèm bằng chứng test"`.
     * Điều kiện Dừng giao việc của Bộ chỉ huy:
       - Bộ chỉ huy chỉ dừng chu trình giao việc khi rơi vào 1 trong 3 trạng thái:
         1. [DONE]: Mọi hạng mục trong `WORK_QUEUE.md` đã chuyển sang HOÀN THÀNH, tất cả PR tính năng (#40, #42...) đã merge và E2E gate #36 đã pass.
         2. [BLOCKED]: Nhánh phụ cần dữ liệu phụ thuộc upstream chưa công bố (G3-G6) hoặc vướng quyết định môi trường máy chủ thực tế (ENV-01-06 trong `review/unresolved.md`).
         3. [CIRCUIT-BREAKER]: Toàn bộ Agent cạn kiệt Quota và hệ thống đã tự động đóng băng an toàn (`winwork freeze`).
     * Nghiêm cấm can thiệp hạ tầng giao diện: Tuyệt đối không tự ý chạy các lệnh quản trị cửa sổ cấp thấp như `wezterm cli kill-pane`, `split-pane` hay tự động tái cấu trúc layout; chỉ sử dụng các lệnh chuẩn của `winwork`.
     * Giao thức đóng băng & khôi phục (Freeze/Resume): Khi cạn kiệt Quota hoặc cần tạm dừng hệ thống, lệnh `winwork freeze` (hoặc `winwork pause`) tự động tạo commit WIP snapshot bảo toàn mọi thay đổi dở dang trên tất cả worktree và ghi hồ sơ trạng thái vào `review/freeze-state.json`. Khi quota hồi phục hoặc sẵn sàng tiếp tục, lệnh `winwork resume` (hoặc `winwork unfreeze`) sẽ tự động đánh thức các agent tiếp quản công việc từ commit WIP và tiếp tục hoàn thiện task trong `review/inbox/`.
     * Giao thức luân chuyển Agent & Cầu dao đóng băng (Failover Chain & Circuit Breaker):
       - Khi một Agent gặp sự cố hạn ngạch (Quota Exceeded / Rate Limit), chạy `winwork failover <tên_nhánh>` (hoặc đổi chủ động bằng `winwork switch <tên_nhánh> <agent_mới>`) để chuyển giao sang Agent kế tiếp trong chuỗi luân chuyển (mặc định: `agy -> codex`).
       - Agent mới tự động nhận prompt tiếp quản: đọc lại `git status`, `git log -1` và `review/inbox/` để hoàn thiện tiếp phần việc dở dang.
       - Khi toàn bộ Agent trong danh sách đều đã hết Quota, hệ thống lập tức tự động kích hoạt Cầu dao đóng băng (`winwork freeze`) bảo vệ toàn bộ tiến trình.
       - Có thể dùng `winwork check-quota` (hoặc `winwork monitor`) để quét tự động toàn bộ cửa sổ terminal và kích hoạt failover tự động.

Mô tả hệ thống, hợp đồng giao tiếp, tiêu chí nghiệm thu và quy trình vận hành có hiệu lực theo trạng thái trong chỉ mục. Quyết định về nghiệp vụ được lưu ở `docs/requirements/` và dẫn chiếu từ những tài liệu sử dụng nó.
