# Sổ tay hướng dẫn sử dụng WinWork (WinWork User Manual)

| Trường | Giá trị |
| --- | --- |
| Đối tượng | Kỹ sư phần mềm, Trưởng nhóm kỹ thuật, Nhà phát triển điều phối |
| Mục đích | Hướng dẫn vận hành hạm đội đa tác nhân AI qua công cụ `winwork` |
| Vị trí cài đặt | `C:\Users\<User>\.winwork\winwork.ps1` |

---

## 1. Yêu cầu môi trường & Chuẩn bị

Hệ thống WinWork yêu cầu các công cụ sau đã có trong biến môi trường `PATH`:
1. **Git:** `git version >= 2.30` (Hỗ trợ Git Worktree).
2. **WezTerm:** Trình giả lập terminal multiplexer hiện đại trên Windows.
3. **PowerShell:** PowerShell 7+ (khuyên dùng `pwsh.exe`) hoặc Windows PowerShell 5.1.
4. **Các AI CLI Agents:**
   - **Antigravity CLI:** `agy`
   - **OpenAI Codex CLI:** `codex` (với cấu hình tự hành `ask_for_approval = "never"` trong `~/.codex/config.toml`).

> [!TIP]
> **Kiểm tra sức khỏe hệ thống:** Chạy lệnh sau để kiểm tra toàn bộ công cụ:
> ```powershell
> winwork doctor
> ```
> Kết quả mong đợi: Toàn bộ công cụ hiển thị `[OK]`.

---

## 2. Khởi động hạm đội (Fleet Launching)

Để khởi động toàn bộ hệ thống làm việc với cấu hình tiêu chuẩn:

```powershell
winwork start
```

### Các tùy chọn nâng cao:
- **Chỉ định danh sách nhánh:**
  ```powershell
  winwork start -Branches feat/auth,feat/api,feat/web,feat/analytics
  ```
- **Chọn tác nhân mặc định:**
  ```powershell
  winwork start -Agent codex    # Khởi động toàn bộ với Codex
  winwork start -Agent agy      # Khởi động toàn bộ với Antigravity (Mặc định)
  ```
- **Số lượng ô trên một Tab:**
  ```powershell
  winwork start -PanesPerTab 4  # Mặc định 4 ô lưới 2x2
  ```

Sau khi chạy lệnh, WezTerm sẽ tự động bật lên với layout lưới hoàn chỉnh:
- **Pane góc trên bên trái:** Nhánh chính (`main` / `master`) - Vị trí của Bộ chỉ huy.
- **Các Pane còn lại:** Các nhánh tính năng độc lập của các Worker.

---

## 3. Giám sát trạng thái hạm đội (Fleet Telemetry)

Để kiểm tra trạng thái hoạt động theo thời gian thực của toàn bộ các nhánh:

```powershell
winwork status
# Hoặc ngắn gọn:
winwork ps
```

### Thông tin hiển thị bao gồm:
- **Branch:** Tên nhánh Git đang được gán.
- **Agent:** Loại tác nhân đang chạy trong ô (`agy`, `codex`, hoặc `shell`).
- **State:** Tình trạng kết nối terminal (`ACTIVE`, `STANDBY`, `DISCONNECTED`).
- **TaskStatus:** Trạng thái nhiệm vụ (`IDLE`, `IN_PROGRESS`, `RESOLVED`, `VERIFIED`).
- **GitModified:** Số lượng tệp đang có thay đổi chưa commit.
- **LastCommit:** Mã commit gần nhất và thời gian commit.

---

## 4. Quản trị vòng đời Worktree mà không tắt màn hình

Đây là tính năng độc quyền của WinWork giúp bạn mở rộng hoặc thu hẹp số lượng nhánh mà **không làm đổ vỡ layout màn hình hiện tại**:

### 4.1. Gỡ bỏ an toàn một nhánh (Retire to Standby)
Khi một nhánh đã xong việc (hoặc cần hủy bỏ tạm thời), chạy lệnh:

```powershell
winwork retire <TÊN_NHÁNH> [-DeleteBranch] [-Force]
```
*Ví dụ:*
```powershell
winwork retire feat/auth -DeleteBranch
```
- **Hiện tượng:** Thư mục worktree bị xóa sạch trên đĩa, nhưng ô terminal trong WezTerm vẫn **nằm yên ở vị trí cũ** và đổi tiêu đề thành `[STANDBY (shell)]`. Các agent ở các ô khác tiếp tục làm việc bình thường.

### 4.2. Tiếp quản ô chờ cho nhánh mới (Claim Standby Slot)
Khi bạn muốn tạo một nhánh mới và trong WezTerm đang có sẵn ô `[STANDBY]`:

```powershell
winwork claim <TÊN_NHÁNH_MỚI> [-Agent agy|codex]
```
*Ví dụ:*
```powershell
winwork claim feat/payment -Agent agy
```
- **Hiện tượng:** Ô `[STANDBY]` lập tức được kích hoạt, Git tạo worktree mới, đồng bộ luật và Agent tự động bật lên làm việc ngay trong ô đó.

### 4.3. Tái chế / Hoán đổi trực tiếp (In-Place Recycle)
Nếu bạn muốn thay thế nhánh cũ đã hoàn thành bằng một nhánh mới trong 1 bước duy nhất:

```powershell
winwork recycle <NHÁNH_CŨ> <NHÁNH_MỚI> [-DeleteBranch] [-Agent agy|codex]
```
*Ví dụ:*
```powershell
winwork recycle feat/auth feat/dashboard -DeleteBranch -Agent codex
```

### 4.4. Thêm nhánh mới khi tất cả các ô đều đang bận (Dynamic Scale-Up)
Nếu toàn bộ 4 ô hiện tại đều đang chạy việc quan trọng và bạn muốn mở thêm nhánh thứ 5, thứ 6:

```powershell
winwork add <TÊN_NHÁNH_MỚI> [-Agent agy|codex] [-SpawnTab] [-Split]
```
*Ví dụ:*
```powershell
winwork add feat/security-audit -Agent codex
```
- **Hiện tượng:** WinWork tự động nhận diện tất cả các ô đều đang bận, nó sẽ gọi WezTerm **mở thêm một TAB MỚI** trong cùng cửa sổ terminal hiện tại. Tab mới sẽ chạy độc lập, không làm co hẹp hay ảnh hưởng đến lưới 4 ô ở Tab cũ. Bạn chỉ cần nhấn phím `Ctrl+Shift+[` hoặc click tab để chuyển đổi qua lại.

---

## 5. Điều phối công việc từ Bộ chỉ huy (Task Orchestration)

### 5.1. Giao việc cho Worker
```powershell
winwork assign <TÊN_WORKER> "<Mô tả nhiệm vụ>" [-File <Đường_dẫn_tệp_đính_kèm>]
```
*Ví dụ:*
```powershell
winwork assign auth "Xây dựng module xác thực JWT và refresh token" -File docs/contracts/auth.yaml
```
- Lệnh này tự động tạo tệp `review/inbox/auth/task-<id>.md` và phát tín hiệu PTY kèm 2 xung Enter đánh thức Worker dậy làm việc ngay lập tức.

### 5.2. Nghiệm thu & Giao việc tiếp theo tức thì (Zero-Idle Pipeline)
Khi Worker hoàn thành task và gửi tín hiệu `RESOLVED`, Bộ chỉ huy chạy test kiểm thử và đóng task, đồng thời giao việc tiếp theo trong 1 lệnh duy nhất:

```powershell
winwork verify <TASK_ID> -Note "<Kết quả kiểm thử>" -Next "<Yêu cầu task tiếp theo>"
```
*Ví dụ:*
```powershell
winwork verify TASK-102 -Note "Unit tests pass 100%, linter clean" -Next "Tích hợp middleware phân quyền RBAC"
```
- Lệnh này tự động lưu vết vào `review/archive/completed-tasks.md` và dispatch ngay task mới sang Worker mà không có bất kỳ độ trễ nào.

### 5.3. Nhắc nhở Agent bị treo (Nudge Enter)
Nếu thấy một Agent đang phân vân hoặc chưa submit lệnh:
```powershell
winwork nudge <TÊN_WORKER>
```

---

## 6. Xử lý sự cố Hạn ngạch & Đóng băng an toàn (Failover & Circuit Breaker)

### 6.1. Đổi Agent thủ công trên một Pane
```powershell
winwork switch <TÊN_WORKER> <codex|agy>
```

### 6.2. Kích hoạt luân chuyển tự động khi gặp lỗi hạn ngạch (Rate Limit)
```powershell
winwork failover <TÊN_WORKER>
```
- Tự động chuyển giao tiến trình sang agent tiếp theo trong chuỗi luân chuyển (mặc định: chuyển sang `codex --yolo`).

### 6.3. Cầu dao Đóng băng toàn bộ hệ thống (Freeze)
Khi toàn bộ tác nhân hết quota hoặc bạn cần tắt máy đi ngủ:
```powershell
winwork freeze
# Hoặc:
winwork pause
```
- Hệ thống tự động quét tất cả các worktree, tạo commit lưu vết tạm thời `wip(freeze): auto snapshot`, lưu trạng thái vào `review/freeze-state.json` và đóng băng an toàn.

### 6.4. Đánh thức và khôi phục tiến trình (Resume)
Khi quota đã hồi phục hoặc bắt đầu phiên làm việc mới:
```powershell
winwork resume
# Hoặc:
winwork unfreeze
```
- Tự động khôi phục ngữ cảnh, đánh thức các Worker tiếp tục hoàn thành các task đang dở dang.

---

## 7. Bảng tra cứu toàn bộ câu lệnh CLI (Command Cheat Sheet)

| Lệnh CLI | Chức năng chính | Ghi chú |
| :--- | :--- | :--- |
| `winwork doctor` | Kiểm tra công cụ cần thiết (`git`, `wezterm`, `agy`, `codex`) | Chạy đầu tiên |
| `winwork start` | Khởi động hạm đội WezTerm với lưới 4 pane + main anchor | Khởi động toàn bộ |
| `winwork status` / `ps` | Xem bảng giám sát trạng thái, commit, task của từng worker | Realtime telemetry |
| `winwork list` | Liệt kê danh sách các Git Worktree hiện có | Trạng thái Git |
| `winwork assign <w> "<m>"` | Giao việc kèm tệp đính kèm và phát tín hiệu PTY | Bộ chỉ huy dùng |
| `winwork ack <id>` | Worker xác nhận đã tiếp nhận nhiệm vụ | Worker dùng |
| `winwork resolve <id>` | Worker báo cáo hoàn thành kèm commit SHA và bằng chứng | Worker dùng |
| `winwork verify <id>` | Bộ chỉ huy nghiệm thu task và lưu vết vào archive | Kèm `-Next` để nối việc |
| `winwork nudge <w>` | Bắn xung phím Enter đánh thức agent đang chờ | Chống treo TUI |
| `winwork retire <w>` | Nghi nghỉ an toàn một worktree, đưa Pane về `[STANDBY]` | Bảo toàn lưới |
| `winwork claim <w>` | Gán nhánh mới vào một Pane `[STANDBY]` có sẵn | Không restart |
| `winwork recycle <old> <new>` | Hoán đổi nhánh cũ thành nhánh mới ngay trên 1 Pane | Không restart |
| `winwork add <w>` | Thêm nhánh mới (tự claim standby hoặc mở Tab mới nếu đầy) | Mở rộng động |
| `winwork switch <w> <a>` | Đổi loại agent đang chạy trong một pane | `agy` $\leftrightarrow$ `codex` |
| `winwork failover <w>` | Luân chuyển tự động sang agent kế tiếp khi cạn quota | Quota fallback |
| `winwork freeze` / `pause` | Tạo WIP snapshot và đóng băng toàn hạm đội | Cầu dao an toàn |
| `winwork resume` / `unfreeze`| Đánh thức hạm đội tiếp tục từ snapshot | Khôi phục tiến trình |
| `winwork sync-rules` | Đồng bộ file `AGENTS.md` sang toàn bộ các worktree | Bảo đảm luật đồng nhất |

