# SNOTE v2 — Sơ đồ 2 · Luồng nghiệp vụ theo vai trò

**Trạng thái: đề xuất để duyệt.** Tài liệu mô tả hành vi mong muốn và nối các bước với [Sơ đồ 1 — Use Case](use-cases.md). Mỗi làn là một vai trò. Mũi tên qua làn thể hiện một lần bàn giao hoặc một kết quả có thể quan sát. Một người có thể giữ nhiều vai trò tùy workspace và lớp.

## 1. Lớp học — Từ giao bài đến phản hồi

### 1.1 Chuẩn bị lớp, giao bài và phân công

```mermaid
flowchart TD
    subgraph G["Giáo viên phụ trách"]
        G1["Tạo lớp và mở tham gia · UC-14"]
        G2["Chia nhóm và chỉ định trưởng nhóm · UC-14"]
        G3["Công bố yêu cầu, đầu ra, hạn và nhóm nhận · UC-15"]
    end
    subgraph M["Sinh viên / thành viên"]
        M1["Tham gia bằng mã hoặc liên kết · UC-24"]
        M2["Xem yêu cầu và hạn nộp của bài · UC-16"]
        M3["Mở việc được giao trong Việc của tôi · UC-06, UC-08"]
    end
    subgraph L["Trưởng nhóm"]
        L1["Mở bài được giao trong ngữ cảnh nhóm · UC-16"]
        L2["Tạo hoặc gắn phần việc với bài · UC-25"]
        L3["Giao người phụ trách, ghi đầu ra và hạn · UC-11"]
    end
    G1 --> M1 --> G2 --> G3
    G3 --> M2
    G3 --> L1 --> L2 --> L3 --> M3
```

### 1.2 Thực hiện, gửi tiến độ và nộp bài

```mermaid
flowchart TD
    subgraph M["Thành viên"]
        M1["Mở việc được giao và lên lịch làm riêng · UC-04, UC-06"]
        M2["Thực hiện và cập nhật checklist, trạng thái · UC-09"]
        M3["Gửi cập nhật tiến độ nếu cần · UC-26"]
        M4["Đọc phản hồi của bài nộp nhóm · UC-20"]
    end
    subgraph L["Trưởng nhóm"]
        L1["Rà phần việc và chuẩn bị đầu ra · UC-08"]
        L2["Xác nhận nộp đại diện nhóm · UC-17"]
        L3["Xem lý do và xử lý theo quy định nộp · D-04"]
    end
    subgraph S["SNOTE"]
        S1{"Đúng quyền, đủ đầu ra và đang nhận nộp?"}
        S2["Ghi bản nộp và thời điểm tiếp nhận"]
    end
    subgraph G["Giáo viên phụ trách"]
        G1["Xem tiến độ của đúng nhóm và bài · UC-18"]
        G2["Mở bản đã nộp và gửi phản hồi · UC-19"]
    end
    M1 --> M2 --> L1
    M2 --> M3 --> G1
    M2 --> G1
    L1 --> L2 --> S1
    S1 -->|Có| S2 --> G2 --> M4
    S1 -->|Không| L3
    L3 -->|Sau khi xử lý và đủ điều kiện| L2
```

Các nhánh cần kiểm tra cùng luồng chính:

| Điểm bàn giao | Điều kiện và kết quả cần quan sát |
|---|---|
| Sinh viên → lớp | Mã sai, hết hiệu lực hoặc lớp đóng thì chưa tạo tư cách thành viên. Vào lớp thành công chỉ cấp phạm vi lớp. Quyền vào nhóm được cấp khi sinh viên được xếp nhóm. |
| Giáo viên → nhóm | Chỉ nhóm nhận bài mở được yêu cầu. Việc thuộc nhóm khác hoặc thuộc bài không giao cho nhóm bị từ chối khi gắn. |
| Trưởng nhóm → người phụ trách | Khi giao lại, người mới thấy việc trong Việc của tôi. Người cũ mất quyền cập nhật theo phân công, dù vẫn có thể xem việc chung nếu còn là thành viên. |
| Nhóm → giáo viên | Tiến độ gồm dữ liệu việc gắn với đúng bài và cập nhật do nhóm gửi. Nháp và checklist chi tiết chỉ mở được khi có chia sẻ theo UC-27. |
| Trưởng nhóm → bản nộp | Việc cập nhật tiến độ vẫn để bài ở trạng thái chưa nộp. Yêu cầu nộp bị từ chối không tạo bản nộp. Gửi lại cùng yêu cầu sau lỗi mạng chỉ ghi nhận một lần. Nộp muộn và nộp lại theo D-04. |
| Giáo viên → nhóm | Phản hồi gắn đúng bản nộp. Thành viên nhóm nhận bài mở được phản hồi của nhóm mình. Nhóm khác bị từ chối qua cả danh sách và liên kết trực tiếp. |

## 2. Cá nhân — Tạo việc, lên lịch và chọn bước tiếp theo

```mermaid
flowchart TD
    subgraph U["Người dùng"]
        U1["Tạo việc riêng hoặc mở việc được giao · UC-03, UC-08"]
        U2["Ước lượng thời lượng và chọn lịch làm nếu cần · UC-04"]
        U3["Mở Việc của tôi và chọn việc sẽ làm · UC-06, UC-07"]
        U4["Thực hiện và cập nhật checklist hoặc trạng thái · UC-05, UC-09"]
    end
    subgraph S["SNOTE"]
        S1["Lưu kế hoạch riêng gắn với công việc gốc"]
        S2["Tổng hợp Hôm nay, Ngày mai và Quá hạn"]
        S3["Hiện lý do gợi ý và bước checklist tiếp theo nếu có"]
        S4{"Người dùng đã xác nhận hoàn thành?"}
        S5["Cập nhật bộ đếm việc còn phải làm"]
    end
    U1 --> U2 --> S1 --> S2 --> S3 --> U3 --> U4 --> S4
    U1 -->|Chưa lên lịch làm| S2
    S4 -->|Chưa| S2
    S4 -->|Rồi| S5
```

- Hôm nay và Ngày mai lấy theo múi giờ người dùng. Một việc vừa đến hạn vừa có lịch làm trong cùng một ngày chỉ tính một lần trong mục ngày đó. Việc chưa có lịch và hạn vẫn mở được từ danh sách chung.
- Nếu giờ kết thúc không sau giờ bắt đầu, giữ dữ liệu nhập và yêu cầu sửa. Đổi lịch làm riêng không đổi hạn của công việc gốc. Nếu quyền cập nhật việc nhóm bị thu hồi trong lúc đang mở, từ chối thao tác và đọc lại trạng thái.
- Đề xuất trong Sơ đồ 1 tách việc cần xử lý hôm nay hoặc quá hạn khỏi nhóm việc quan trọng. Xong hết checklist có thể gợi ý xác nhận hoàn thành. Thứ tự gợi ý và cách tính hoàn thành còn chờ D-03 và D-05.

## 3. Hộp thu nhanh — Lưu, phân loại, tìm lại và dùng

```mermaid
flowchart TD
    subgraph U["Người dùng"]
        U1["Nhập nội dung và nguồn nếu có · UC-01"]
        U2["Gắn nhãn hoặc đánh dấu đã xử lý · UC-02"]
        U3["Tìm và mở lại nội dung · UC-02"]
        U4["Chọn tài nguyên để gắn vào việc nhóm · UC-13"]
        U5["Xác nhận chia sẻ nếu có quyền"]
    end
    subgraph S["SNOTE"]
        S1{"Dữ liệu hợp lệ?"}
        S2["Lưu riêng vào Chưa xử lý"]
        S3["Báo lỗi và giữ nội dung nhập"]
        S4{"Tài nguyên đã dùng chung?"}
        S5["Gắn tài nguyên theo quyền hiện tại"]
        S6["Từ chối và giữ nguyên quyền"]
    end
    U1 --> S1
    S1 -->|Có| S2 --> U2 --> U3
    S1 -->|Không| S3 --> U1
    S2 -->|Tìm trước khi phân loại| U3
    U3 --> U4 --> S4
    S4 -->|Có| S5
    S4 -->|Chưa| U5
    U5 -->|Được phép và đã xác nhận| S5
    U5 -->|Thiếu quyền hoặc hủy| S6
```

- Người dùng có thể lưu trước, phân loại sau và tìm lại cả mục đã xử lý. Tìm kiếm chỉ trả về nội dung được phép đọc. Nếu không có kết quả, hiển thị trạng thái trống.
- Khi gắn tài nguyên, kiểm tra quyền sửa việc và quyền dùng hoặc chia sẻ tài nguyên. Việc chung chỉ mở tài nguyên trong phạm vi đã chia sẻ. Sau thu hồi, truy cập qua liên kết cũ cũng bị từ chối.
- Cách nhận nội dung trực tiếp từ nền tảng khác và giới hạn tệp chờ quyết định D-02. Sơ đồ áp dụng được cho thao tác nhập trực tiếp trên web.

## 4. Kiểm tra xuyên luồng

| Kịch bản | Kết quả cần quan sát | Tham chiếu Sơ đồ 1 |
|---|---|---|
| Giáo viên giao cùng một bài cho hai nhóm. Nhóm A gửi tiến độ rồi nộp và nhận phản hồi. | Gửi tiến độ chưa đổi trạng thái nộp. Nhóm B chưa nộp và không đọc được bài nộp của nhóm A. | AT-04 |
| Thành viên đặt lịch làm riêng rồi trưởng nhóm đổi hạn. | Lịch nhóm hiển thị hạn mới. Lịch cá nhân giữ khoảng làm cũ. Công việc chỉ xuất hiện một lần trong mỗi danh sách ngày. | AT-02, AT-03 |
| Giáo viên mở nháp riêng, sau đó thử lại khi nhóm chia sẻ rồi thu hồi. | Lần đầu bị từ chối, lần hai mở được và lần cuối bị từ chối kể cả qua URL cũ. | AT-05 |
| Trưởng nhóm gửi lại cùng thao tác nộp sau mất kết nối. | Bản nộp chỉ được ghi nhận một lần. Nếu phiên đã hết, SNOTE yêu cầu xác thực lại. Nếu quyền nộp đã bị thu hồi, thao tác bị từ chối. | AT-06 |
| Người dùng lưu một URL trên web, tải lại rồi tìm và chia sẻ vào nhóm. | Mục tìm lại được trước khi phân loại. Thành viên được cấp quyền mở từ việc chung, tài khoản ngoài nhóm bị từ chối. | AT-01 |
