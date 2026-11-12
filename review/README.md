# Hồ sơ kiểm định và lịch sử SNOTE v2

`review/` không phải mã nguồn hay đặc tả hiện hành. Người đọc thường bắt đầu ở [docs](../docs/README.md); chỉ mở các hồ sơ sau khi cần nguồn, vấn đề chưa chốt hoặc bằng chứng một lần chạy.

| Cần kiểm | Mở tệp |
| --- | --- |
| Quy tắc nào đến từ quyết định nào | [provenance.md](provenance.md), [decision-batch.md](decision-batch.md) |
| Điểm nghiệp vụ hoặc môi trường chưa được đóng | [unresolved.md](unresolved.md) |
| Phân loại tệp đã bỏ, gộp, giữ; ánh xạ đường dẫn cũ | [dca-consolidation-20261109.md](dca-consolidation-20261109.md) |
| Kết quả kiểm thử gắn SHA/môi trường | [hồ sơ foundation](foundation-audit.md), [I1](i1-http-smoke-evidence.md), [I2](i2-real-flow-qa-evidence.md), [I3](i3-web-interactions-evidence.md), [I4](i4-performance-recovery-evidence.md) |
| Đối chiếu và kết quả tích hợp 14 trường hợp UI | [14-tab-integration-20261113.md](14-tab-integration-20261113.md) |
| Rủi ro hoặc nhận định chưa tự trở thành quy tắc | [edge-case-audit.md](edge-case-audit.md), [ui-commercial-audit.md](ui-commercial-audit.md), [integration-gate-reassessment.md](integration-gate-reassessment.md) |

Các phiếu nháp Q33, hồ sơ điều phối và snapshot cũ đã được loại khỏi cây hiện hành. Lịch sử còn tại commit v2 `49caff82`; xem bảng đường dẫn trong hồ sơ kiểm kê. Không dùng kết quả kiểm thử tại một SHA làm bằng chứng cho SHA khác.
