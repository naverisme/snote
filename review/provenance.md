# Hồ sơ đối chiếu nguồn — SNOTE v2

| Trường | Giá trị |
| --- | --- |
| Phạm vi kiểm kê | Cây `docs/` và `AGENTS.md` trên `s_note_v2` tại commit `80c14b10b73d21b2e00ee9539953091d0f67351d` |
| Nguồn xác nhận | Phát biểu và câu “đúng”, “duyệt” của chủ sản phẩm trong chuỗi trao đổi SNOTE v2, được gom theo mã ngữ cảnh bên dưới |
| Kết quả | Chỉ biên soạn các khái niệm, quy tắc và phân cấp điều hướng đủ căn cứ; gỡ 22 tệp cũ khỏi cây v2 hiện hành |
| Giới hạn | Không kiểm chứng bằng người dùng khác, mã nguồn chạy hoặc đặc tả ngoài cuộc trao đổi; đối chiếu không tương đương duyệt thiết kế kỹ thuật |

## Nguồn và mệnh đề

Các câu trích ngắn là phát biểu của chủ sản phẩm trong chuỗi trao đổi này; chỉ giúp tìm lại quyết định theo chủ đề, không thay thế bản ghi hội thoại. Câu hỏi của trợ lý và nội dung cũ trong Git **không** là bằng chứng chấp thuận nếu người dùng chưa xác nhận.

| Mã | Lượt xác nhận trong cuộc trao đổi | Nội dung được xác nhận | Đích |
| --- | --- | --- | --- |
| SRC-01 | “snote dành cho học sinh, cá nhân, giáo viên”; “mỗi cá nhân có các workspace”; “lớp lớn hơn workspace”; “workspace là nhóm ... cùng cấp cùng kiểu” | Đối tượng, nhiều workspace, lớp bao trùm workspace nhóm, nhóm = workspace. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md` |
| SRC-02 | “người học phải chấp nhận”; “muốn giáo viên được sửa/xóa nội dung chung”; “mặc định ... cả 3 người nhưng giáo viên có thể setting”; “lớp trưởng được xem và sửa ... là mặc định” | Tư cách nhóm, quyền giáo viên, ba người duyệt yêu cầu nhóm, quyền mặc định lớp trưởng. | `docs/requirements/verified-business-rules.md` |
| SRC-03 | “Lưu nhanh ... chính là 1 thành phần của ghi chú”; “oke dùng thư viện đi”; “Việc của tôi ... đúng”; “gantt là mặc định, danh sách ... xóa nhiều, lưu trữ nhiều”; yêu cầu Thư viện đứng cạnh Lịch | Thư viện/Hộp thu, phạm vi việc, các chế độ xem, phân cấp điều hướng. | `docs/product/concepts.md`, `docs/ux/validated-navigation.md` |
| SRC-04 | “Thời lượng còn lại ... đếm ngược đến hạn”; “3/5 ... 60%”; “việc ... k bắt buộc đặt hạn”; “lịch làm sau hạn ... làm muộn”; “Lịch của tôi tổng hợp xuyên workspace”; “duyệt” | Hạn tùy chọn, đếm ngược/quá hạn, lịch làm riêng, checklist, tổng hợp lịch và sự kiện độc lập. | `docs/requirements/verified-business-rules.md` |
| SRC-05 | “Sau hạn chưa nộp lần nào ... khóa nộp lần đầu”; “đặt riêng với cho sửa bản đã nộp sau hạn”; “mặc định ... trưởng nhóm”; “duyệt” | Hai quyền sau hạn riêng; người nộp/sửa mặc định và quyền bổ sung; ưu tiên cài đặt từng bài; lịch sử sửa. | `docs/requirements/verified-business-rules.md` |
| SRC-06 | “chốt kiến trúc này cho dự án snote” sau khi xác định bảy nhóm `docs/`, và [PR #5](https://github.com/naverisme/snote/pull/5) | Bảy nhóm tài liệu và hướng dẫn tác nhân; chốt cấu trúc không duyệt các bản thiết kế cũ. | `docs/DOCUMENTATION_POLICY.md`, `AGENTS.md` |

| SRC-07 | Hai lượt sau câu hỏi về phần còn thiếu: chủ sản phẩm nói “oke” với các đề xuất 1–7, sau đó thay cách nhận vai trò thành tự chọn lúc đăng ký; lượt “pke” xác nhận đề xuất một tài khoản vừa học vừa dạy và lớp mặc định không công khai | Workspace cá nhân mặc định; giới hạn nhóm mặc định; bộ lọc ngày và mức quan trọng; tiến độ tách nguồn; tự chọn cách dùng, quyền tạo lớp và phạm vi lớp. Phạm vi phát hành đầu còn cần làm rõ do yêu cầu lối vào Lớp học sau đăng ký. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md`, `docs/ux/validated-navigation.md` |

| SRC-08 | Chủ sản phẩm nói “giáo viên cũng có không gian cá nhân, không nhất thiết phải tạo lớp ngay khi tạo tài khoản. còn lại đồng ý” sau bốn đề xuất về bản phát hành đầu, lời mời/mã lớp, yêu cầu vào nhóm và quyền lập nhóm | Lớp học cơ bản thuộc bản đầu nhưng tạo lớp là tùy chọn; hai đường vào lớp, hai đường vào nhóm, giáo viên mặc định lập nhóm và quyền ủy nhiệm; người được ủy nhiệm tạo nhóm mặc định là trưởng nhóm kiêm admin. | `docs/product/concepts.md`, `docs/requirements/verified-business-rules.md`, `docs/ux/validated-navigation.md` |

`PR #6` trước đây đưa ba tài liệu mới vào nhánh; lần rà này đã giới hạn lại các mệnh đề theo chính các lượt xác nhận nêu trên. Tên và mã ngữ cảnh không chứng minh mọi chi tiết được diễn giải trong PR cũ đã được duyệt.

## Các nguồn cũ đã kiểm kê và xử lý

Các tệp dưới đây có mặt ở snapshot trước lần rà này, phần lớn phát sinh trong đợt tài liệu [ngày 2026-11-03](https://github.com/naverisme/snote/commit/0faca48035fc49e3eab9b975f5303e2b89ed0f0c) hoặc các commit kế tiếp. Có tệp là bản thảo, có tệp tự tuyên bố “đã khóa”/“sẵn sàng coding”; **không có bằng chứng chủ sản phẩm duyệt toàn bộ nội dung ấy**. Vì tài liệu xen kẽ ý đúng với quyết định chưa chốt, đã gỡ nguyên tệp khỏi cây hiện hành để tránh lấy nhầm làm nguồn triển khai. Bản cũ còn ở [snapshot lịch sử](https://github.com/naverisme/snote/tree/80c14b10b73d21b2e00ee9539953091d0f67351d/docs).

| Vùng nguồn lịch sử | Tệp đã gỡ | Nguyên nhân và trạng thái |
| --- | --- | --- |
| `requirements/` | `business-workflows.md`, `decisions.md`, `permissions.md`, `srs.md`, `use-cases.md` | Luồng, ma trận quyền, thuật toán sắp xếp và chính sách nộp/chia nhóm chứa quyết định chưa duyệt hoặc trái quyết định mới. Không giữ mã UC/FR/NFR làm chuẩn. |
| `architecture/` | `data-model.md`, `deployment.md`, `frontend-collaboration-wireframes.md`, `frontend-information-architecture.md`, `frontend-navigation.md`, `frontend-wireframes.md`, `implementation-contracts.md`, `m1-api-contract.md`, `sequences.md`, `system.md`, `task-views.md` | Schema, API, mô đun, triển khai và thành phần UI chưa được thảo luận/chốt. Một số mô hình nhóm tách `STUDY_GROUP` khỏi `WORKSPACE` và điều hướng Hộp thu cấp ứng dụng trái định nghĩa mới. |
| `architecture/assets/` | `m1-wireframes.svg`, `m2-m3-wireframes.svg`, `task-gantt-wireframe.svg` | Hình phụ thuộc wireframe cũ; chưa duyệt vị trí, số nút và hành động. |
| `delivery/` | `agent-work-plan.md`, `coding-readiness.md`, `plan.md` | Kế hoạch, mốc, phân công và kết luận sẵn sàng coding chưa được duyệt; `delivery/` không thuộc bảy nhóm `docs/` đã chốt. |

Ví dụ xung đột có thể kiểm tra ở [quyết định cũ](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/requirements/decisions.md): mặc định một nhóm hiệu lực và khóa tuyệt đối mọi lần nộp/sửa sau hạn; [ERD cũ](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/architecture/data-model.md) tách nhóm và workspace; [điều hướng cũ](https://github.com/naverisme/snote/blob/80c14b10b73d21b2e00ee9539953091d0f67351d/docs/architecture/frontend-information-architecture.md) đặt Hộp thu nhanh ngang cấp workspace. Chỉ các mệnh đề đã được chủ sản phẩm xác nhận mới được viết lại vào ba tài liệu hiện hành, không sao chép nguyên tài liệu cũ.
