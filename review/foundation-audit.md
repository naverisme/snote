# Foundation #28 — giới hạn và kiểm chứng

Nguồn: issue #28, `IMPLEMENTATION_PLAN.md` F1–F6, `docs/architecture/physical-schema.md`, `docs/contracts/README.md`, SRC-27. Đây là hồ sơ triển khai, không bổ sung quy tắc nghiệp vụ.

| Tình huống | Rủi ro | Lựa chọn trong foundation | Kết quả cần kiểm |
| --- | --- | --- | --- |
| Hai người kích hoạt nhóm cùng lúc | Vượt `groupLimit` dù unique active vẫn đúng | Module #29 phải khóa cặp lớp/người, kiểm lại số nhóm trong transaction; migration chỉ giữ unique active | QA-02 chạy hai request đồng thời, một request bị từ chối khi giới hạn một nhóm |
| Nộp commit nhưng mất phản hồi | Nộp đôi hoặc mất thời điểm chấp nhận | `OperationReceipt` có unique key và core yêu cầu callback transaction | QA-08 trả cùng receipt với cùng key/body, khác body 409 |
| Cập nhật từ version cũ | Ghi đè âm thầm | `requireVersion` trả 412; các module phải tăng version trong cùng transaction | QA-05/08 chỉ một writer thành công |
| Bytes upload xong nhưng DB commit thất bại | Tệp lạc và UI báo thành công giả | `StoragePort` tách staging/verify; module #35 chốt ref sau xác minh | QA-06 kiểm không có item hoàn chỉnh khi thất bại |
| Migration chạy trên DB trắng và reset | SQL CHECK/partial unique lỗi ở PostgreSQL thật | CI dùng PostgreSQL 17.7, deploy rồi reset/migrate | Job foundation xanh và truy vấn DB kiểm ràng buộc |

Giới hạn môi trường hiện tại: máy Windows không có Docker/PostgreSQL, nên chưa có kết quả migration hoặc constraint trên DB thật. CI được cấu hình nhưng chưa chạy trên remote. Seed chỉ có `fixture@example.invalid`, không có người thật.
