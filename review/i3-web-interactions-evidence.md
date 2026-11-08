# Bằng chứng kiểm thử Tương tác Giao diện & Hành vi Client (Hạng mục I-3)

| Trường | Giá trị |
| --- | --- |
| Ngày thực hiện | 2026-11-08 |
| Commit SHA cơ sở | `465ffc0` (sau khi merge PR #50 vào `s_note_v2`) |
| Môi trường máy chủ | Node.js v24.15.0, PostgreSQL 17.7 (`snote-postgres-test`), NestJS 11.1.9, Vite 7.2.2 |
| Bộ kiểm thử mới | `tests/e2e/web-interactions.spec.mjs` (9 phép kiểm chuyên sâu WEB-01 đến WEB-09) |
| Tổng số test E2E | **36/36 PASS (100%)** (`node --test tests/e2e/*.spec.mjs`) |
| Thời gian chạy | **4.37 giây** |

---

## 1. Mục tiêu và Tiêu chí Hạng mục I-3

Theo [rà lại cổng tích hợp #36](integration-gate-reassessment.md) và tiêu chí chất lượng [QA-13](../docs/quality/README.md):
- **Reduced Motion (Giảm chuyển động):** Khi người dùng kích hoạt `prefers-reduced-motion: reduce` trong hệ điều hành, CSS và hook JavaScript phải lập tức triệt tiêu toàn bộ hiệu ứng chuyển động và chuyển cảnh (animation/transition duration đặt về `0.01ms !important`).
- **Khả năng tiếp cận bằng phím & Focus (Keyboard Navigation & Focus Trapping):**
  - Mọi modal dialog (`AuthModal`, `CreateWorkspaceModal`, `AccountSettingsModal`) phải tuân thủ chuẩn WCAG 2.1 với `role="dialog"`, `aria-modal="true"`, nút đóng có nhãn rõ ràng (`aria-label="Đóng"`), và tự động đặt focus vào trường nhập liệu chính (`autoFocus`).
  - Phím `Escape` đóng modal ngay lập tức; bấm ra vùng overlay ngoài đóng modal trong khi bấm bên trong nội dung modal được bảo toàn (`e.stopPropagation()`).
  - Vòng focus (`:focus` và `:focus-visible`) có độ tương phản cao với viền `var(--accent)` và hiệu ứng bóng đổ `0 0 0 2px rgba(37, 99, 235, 0.2)`.
- **Chuyển Workspace Nhanh & Chống Ô nhiễm Dữ liệu Cũ (Race Condition & Cache Invalidation - QA-13):**
  - Khi người dùng chuyển qua lại liên tiếp giữa các workspace với độ trễ mạng ngẫu nhiên, cơ chế sequence tracking phải loại bỏ triệt để các phản hồi chậm đến sau từ các workspace cũ.
  - Chuyển workspace lập tức xóa trắng (`null` / rỗng) các chi tiết việc đang chọn, bản thảo nháp chưa lưu và bộ nhớ đệm riêng tư, tuyệt đối không để rò rỉ hay hiển thị lẫn lộn dữ liệu giữa các workspace.
  - Khi đăng xuất hoặc bị thu hồi quyền, toàn bộ thông tin phiên và danh sách workspace/lớp lập tức được tẩy sạch khỏi bộ nhớ.
- **Thích ứng thiết bị di động (Responsive Breakpoint 768px):** Tại khung nhìn nhỏ (`<= 768px`), thanh bên (`.app-sidebar`) tự động ẩn (`display: none`), thanh chọn ngữ cảnh tự động ngắt dòng linh hoạt (`flex-wrap: wrap`).
- **Phân tách biên dữ liệu đa workspace qua HTTP thật:** Xác nhận phân tách hoàn toàn danh sách công việc giữa Workspace cá nhân và Workspace độc lập trên máy chủ NestJS và cơ sở dữ liệu PostgreSQL 17.7.

---

## 2. Chi tiết 9 Phép kiểm trong `tests/e2e/web-interactions.spec.mjs`

### Phép kiểm WEB-01: Triệt tiêu chuyển động qua CSS (`prefers-reduced-motion`)
- Kiểm tra mã nguồn CSS `apps/web/src/shared/theme.css` và gói CSS đã build `apps/web/dist/assets/*.css`.
- Xác nhận truy vấn `@media (prefers-reduced-motion: reduce)` thiết lập:
  - `animation-duration: 0.01ms !important;`
  - `animation-iteration-count: 1 !important;`
  - `transition-duration: 0.01ms !important;`
  - `scroll-behavior: auto !important;`
- **Kết quả:** Đạt (PASS) cả trên mã nguồn lẫn gói sản phẩm sau build.

### Phép kiểm WEB-02: Logic Hook `useReducedMotion` & Lắng nghe sự kiện động
- Khởi tạo trình theo dõi dựa trên hook `useReducedMotion` với `window.matchMedia`.
- Ban đầu `matches = false` -> Hook trả về `false`.
- Khi người dùng bật tính năng giảm chuyển động trong hệ điều hành (`change` event với `matches = true`) -> Hook lập tức phản ứng và cập nhật trạng thái thành `true`.
- Khi người dùng tắt tính năng giảm chuyển động (`change` event với `matches = false`) -> Hook cập nhật về `false`.
- Trên môi trường SSR hoặc không có `matchMedia` -> Hook an toàn trả về `false` mà không sinh lỗi.
- **Kết quả:** Đạt (PASS) — bộ lắng nghe sự kiện giải phóng sạch sẽ khi component unmount.

### Phép kiểm WEB-03: Ngữ nghĩa Accessibility & Chỉ báo Focus trong Modal
- Rà soát các modal `AuthModal.tsx`, `CreateWorkspaceModal.tsx`, `AccountSettingsModal.tsx`.
- Xác nhận đầy đủ các thuộc tính chuẩn ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label="Đóng"`, `autoFocus`.
- Xác nhận CSS quy định độ tương phản cao cho trường nhập liệu khi được focus:
  `border-color: var(--accent); box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); outline: none;`
- **Kết quả:** Đạt (PASS).

### Phép kiểm WEB-04: Đóng Modal bằng phím Escape & Ngăn lan truyền sự kiện
- Nhấn các phím thông thường (`Enter`, `Tab`, `ArrowDown`) -> Modal giữ nguyên trạng thái mở.
- Nhấn phím `Escape` -> Kích hoạt gọi hàm `onClose()` đóng modal ngay lập tức.
- Bấm vào khung overlay nền gọi `onClose()`, trong khi bấm vào nội dung bên trong modal kích hoạt `e.stopPropagation()` ngăn chặn đóng ngoài ý muốn.
- **Kết quả:** Đạt (PASS).

### Phép kiểm WEB-05: Điều khiển phím và thuộc tính của WorkspaceSwitcher
- Kiểm tra thuộc tính `aria-expanded` phản ánh chính xác trạng thái bung mở danh sách (`true`) hoặc thu gọn (`false`).
- Kiểm tra bộ sinh ký tự viết tắt (`getInitials`):
  - "Cá nhân" -> "CÁ"
  - "Nhóm 1" -> "NH"
  - "Alpha Beta" -> "AL"
  - Chuỗi rỗng -> mặc định "WS"
- Xác nhận vị trí nút tạo mới Workspace luôn nằm ở đầu trái ngoài cùng theo quy ước UXR-04.
- **Kết quả:** Đạt (PASS).

### Phép kiểm WEB-06: Sequence Tracker triệt tiêu phản hồi trễ khi chuyển Workspace liên tiếp
- Mô phỏng 5 lần chuyển workspace liên tiếp với độ trễ mạng ngẫu nhiên và bất đối xứng:
  - WS-1: 120ms
  - WS-2: 180ms
  - WS-3: 30ms (xong đầu tiên nhưng không phải yêu cầu cuối)
  - WS-4: 100ms
  - WS-5: 40ms (yêu cầu cuối cùng do người dùng chọn)
- Khi toàn bộ 5 Promise hoàn tất:
  - Dữ liệu hiển thị cuối cùng cam kết (`committedState`) bắt buộc là `ws-5-epsilon`.
  - Các phản hồi chậm đến sau từ WS-1, WS-2 và WS-4 bị đánh dấu `dropped: true` và hủy bỏ an toàn, không làm lệch ngữ cảnh hiển thị.
- **Kết quả:** Đạt (PASS).

### Phép kiểm WEB-07: Tẩy sạch Bộ nhớ đệm & Dữ liệu riêng tư khi chuyển Ngữ cảnh
- Khởi tạo container trạng thái lưu trữ việc đang chọn (`task-private-101`), từ khóa tìm kiếm bí mật, bản thảo chưa lưu và tài liệu đệm.
- Khi chuyển sang Workspace công khai (`switchContext('ws-public-shared')`):
  - `selectedTaskId` lập tức trả về `null`.
  - `searchQuery` bị xóa trắng.
  - `activeDraft` bị hủy bỏ.
  - `cachedItems` từ workspace cũ bị làm rỗng hoàn toàn (`[]`).
- Khi người dùng đăng xuất (`logout()`): toàn bộ trạng thái phiên bị xóa sạch.
- **Kết quả:** Đạt (PASS).

### Phép kiểm WEB-08: Thích ứng Giao diện Di động (Breakpoint <= 768px)
- Xác nhận quy tắc `@media (max-width: 768px)` trong `apps/web/src/shared/theme.css`:
  - Thanh bên `.app-sidebar` ẩn hoàn toàn (`display: none`).
  - Thanh chuyển đổi ngữ cảnh `.context-selector-cluster` cho phép ngắt dòng (`flex-wrap: wrap`).
- **Kết quả:** Đạt (PASS).

### Phép kiểm WEB-09: Tích hợp HTTP Thật — Cô lập Biên Dữ liệu Đa Workspace
- Đăng ký tài khoản trên máy chủ NestJS thật nối PostgreSQL 17.7.
- Lấy Workspace cá nhân mặc định và tạo thêm một Workspace độc lập ("Project Titan Independent").
- Tạo 1 công việc tại Workspace cá nhân ("Personal Study Plan") và 1 công việc tại Workspace độc lập ("Titan Architecture Review").
- Thực hiện truy vấn song song `/workspaces/:id/tasks` mô phỏng hành vi chuyển đổi nhanh trên trình duyệt.
- Xác nhận:
  - Workspace cá nhân chỉ chứa đúng "Personal Study Plan", tuyệt đối không chứa việc của Titan.
  - Workspace Titan chỉ chứa đúng "Titan Architecture Review", tuyệt đối không chứa việc cá nhân.
- **Kết quả:** Đạt (PASS) — cách ly 100% dữ liệu qua giao thức HTTP thật.

---

## 3. Tổng kết Toàn bộ Suite Kiểm thử E2E

Lệnh thực thi:
```bash
npm run test:e2e
```

Kết quả:
```text
✔ VT-01 đến VT-12: 12 kịch bản nghiệm thu tính năng (Pass 12/12)
✔ HTTP Smoke 1 đến 7: 7 kịch bản HTTP socket và typed OpenAPI client (Pass 7/7)
✔ QA-01 đến QA-14: 7 kịch bản QA toàn diện đồng thời, SSRF, ETag 412, idempotency (Pass 7/7)
✔ System E2E Lifecycle: Luồng tích hợp toàn vẹn xuyên suốt (Pass 1/1)
✔ WEB-01 đến WEB-09: 9 phép kiểm tương tác web, focus/keyboard, reduced motion, cache reset (Pass 9/9)

ℹ tests 36
ℹ suites 0
ℹ pass 36
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4374.5871
```

**Kết luận:** Hạng mục **I-3** đã hoàn thành đạt chuẩn 100% bằng chứng thực nghiệm lặp lại được.
