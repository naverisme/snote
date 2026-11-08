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
     * Khi nhận được tín hiệu có mã [TASK-ID]: Đọc kỹ mô tả và file đính kèm, BẮT BUỘC chạy winwork ack <TASK_ID> để xác nhận bắt đầu làm việc về Bộ chỉ huy; chỉ sửa đổi trong phạm vi vùng tệp sở hữu tại [WORKTREES.md](WORKTREES.md).
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
     * Giao thức Tự chủ Động & Ma trận Phân quyền (Dynamic Autonomy & Permission Matrix):
       - Chế độ vận hành kép (Dual-Mode):
         + Chế độ Tự Hành (Autopilot): Kích hoạt bằng /goal trong chat hoặc chạy winwork auto ở Terminal phụ. Bộ chỉ huy chủ động 100% điều phối theo WORK_QUEUE.md, tự động verify, tự động giao việc tiếp theo, tự động nudge phím Enter và failover quota cho đến khi xong việc hoặc chạm blocker.
         + Chế độ Điều phối (Co-Pilot - Mặc định): Bộ chỉ huy dừng lại sau mỗi mốc, đề xuất phương án và chờ người dùng ra lệnh/duyệt kế hoạch.
       - Ma trận 3 Vùng Quyền Lực (The Permission Matrix):
         + VÙNG XANH (Tự quyết 100% - Green): Nghiệm thu task đạt test (winwork verify), giao việc tiếp theo từ WORK_QUEUE.md, yêu cầu sửa lỗi build/test/lint, tự động Nudge Enter, tự động failover quota (gy -> codex). Bộ chỉ huy tự làm ngay không cần xin phép.
         + VÙNG VÀNG (Tự làm & Thông báo - Yellow): Tự động đóng băng an toàn (winwork freeze), yêu cầu mở Pull Request, chạy kiểm thử tích hợp E2E #36. Bộ chỉ huy tự làm và gửi thông báo ngắn gọn.
         + VÙNG ĐỎ (Bắt buộc dừng hỏi người dùng - Red): Sửa đổi schema Prisma/OpenAPI cốt lõi phá vỡ hợp đồng liên nhóm, xóa worktree/branch, ra quyết định môi trường máy chủ thực tế (ENV-01 đến ENV-06), merge PR vào production. Bộ chỉ huy BẮT BUỘC dừng lại xin phê duyệt từ người dùng.
     * Vòng đời Worktree & Tái chế tại chỗ (Worktree Lifecycle & Zero-Restart Recycle):
       - Khi một nhánh hoàn thành nhiệm vụ và PR đã được merge vào s_note_v2, worktree đó trở thành tài nguyên hoàn tất cần dọn dẹp.
       - Dọn dẹp an toàn (winwork retire <tên_nhánh> [-DeleteBranch]): Tự động hạ cánh Agent CLI, chuyển CWD về mainPath để giải phóng 100% file handle lock trên Windows, xóa worktree sạch sẽ và chuyển Pane đó sang chế độ [STANDBY (shell)] bảo toàn 100% cấu trúc hình học lưới WezTerm.
       - Tái chế tức thì (winwork recycle <nhánh_cũ> <nhánh_mới> [-Agent <agent>] [-DeleteBranch]): Tự động gỡ worktree cũ, tạo/liên kết worktree mới từ s_note_v2, đồng bộ AGENTS.md và tái kích hoạt ngay trên chính Pane cũ mà KHÔNG CẦN khởi động lại WezTerm hay làm gián đoạn các nhánh khác.
       - Tiếp quản ghế chờ (winwork recycle standby <nhánh_mới> hoặc winwork claim <nhánh_mới>): Tiếp quản ngay một Pane đang ở trạng thái [STANDBY] để triển khai feature mới vào một "Worker Slot" trống.
     * Giao thức luân chuyển Agent & Cầu dao đóng băng (Failover Chain & Circuit Breaker):
       - Khi một Agent gặp sự cố hạn ngạch (Quota Exceeded / Rate Limit), chạy `winwork failover <tên_nhánh>` (hoặc đổi chủ động bằng `winwork switch <tên_nhánh> <agent_mới>`) để chuyển giao sang Agent kế tiếp trong chuỗi luân chuyển (mặc định: `agy -> codex --yolo` với toàn quyền tự hành, không hỏi proceed).
       - Agent mới tự động nhận prompt tiếp quản: đọc lại `git status`, `git log -1` và `review/inbox/` để hoàn thiện tiếp phần việc dở dang.
       - Khi toàn bộ Agent trong danh sách đều đã hết Quota, hệ thống lập tức tự động kích hoạt Cầu dao đóng băng (`winwork freeze`) bảo vệ toàn bộ tiến trình.
       - Có thể dùng `winwork check-quota` (hoặc `winwork monitor`) để quét tự động toàn bộ cửa sổ terminal và kích hoạt failover tự động.
     * Quy chuẩn chế tác giao diện theo kỹ năng Stageshow (Stageshow UI Craft Standard):
       - Áp dụng bắt buộc cho toàn bộ mã nguồn giao diện trong `apps/web/src/features/**`:
         1. Tiết chế & Trọng tâm (Restraint & Focus): Chữ thật chỉ đặt ở nơi có câu chuyện nghiệp vụ và hành động cốt lõi (Title, action, result, state); vùng thông tin phụ dùng tone xám điềm tĩnh (`muted`), skeleton loader phải giữ nguyên pitch và hình học của component thật (tránh layout shift).
         2. Thẩm mỹ Điềm tĩnh (Quiet Hierarchy): Loại bỏ hoàn toàn hiệu ứng hào nhoáng rẻ tiền (cấm gradient tím sặc sỡ, cấm icon lấp lánh stock AI). Nền trung tính dịu mắt, viền hairline 1px tinh tế, 1 màu Accent duy nhất cho hành động kích hoạt.
         3. Khoảng cách & Hình học chuẩn xác (Geometric Insets & Spacing): Inset tối thiểu 12px từ lề thẻ; bán kính bo góc ngoài = bán kính bo góc trong + padding; căn chỉnh số liệu và ký hiệu tiền tệ/đơn vị chuẩn xác bên trái.
         4. Chuyển động có Nguyên do (Intentional Motion): Mọi animation từ 150-250ms phải phản ánh tương quan vị trí (khi xóa/thêm item, các item xung quanh trượt êm ái); tuân thủ nghiêm ngặt `@media (prefers-reduced-motion: reduce)`.
         5. Trạng thái rỗng & Minh họa tính năng (Empty State & Feature Showcase): Tại các màn hình chưa có dữ liệu, hiển thị khung minh họa thu nhỏ (miniature preview / demo card) theo phong cách Stageshow để hướng dẫn người dùng trực quan trong 5 giây.
     * Trách nhiệm Dẫn dắt UI/UX & Sáng tạo của Bộ chỉ huy (Commander's UI/UX Leadership & Stageshow Creative Mandate):
       - Bộ chỉ huy (s_note_v2 / main) BẮT BUỘC luôn chủ động kiểm tra tài liệu thiết kế, rà soát mã nguồn giao diện và bổ sung kiến thức/hướng dẫn UI-UX chi tiết (tokens, màu sắc, khoảng cách, icons, trạng thái tương tác) vào từng yêu cầu giao việc (`winwork assign`) cho các worktree phụ thuộc.
       - Luôn đề cao tư duy sáng tạo dựa trên bộ kỹ năng Stageshow: Không chấp nhận giao diện sơ sài, khô cứng hay khuôn mẫu tầm thường; chủ động đề xuất và hiện thực hóa các giải pháp trực quan hóa tinh xảo, phân cấp thị giác điềm tĩnh (Quiet Hierarchy), chuyển động vi mô (Micro-interactions) mượt mà và khung minh họa thu nhỏ (Miniature Showcase) cho các trạng thái rỗng (Empty States).

Mô tả hệ thống, hợp đồng giao tiếp, tiêu chí nghiệm thu và quy trình vận hành có hiệu lực theo trạng thái trong chỉ mục. Quyết định về nghiệp vụ được lưu ở `docs/requirements/` và dẫn chiếu từ những tài liệu sử dụng nó.
