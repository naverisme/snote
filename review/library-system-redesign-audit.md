# Kiểm duyệt Thư viện #35 trước thiết kế lại UI

| Trường | Giá trị |
| --- | --- |
| Task | `TASK-20261108-205633`; issue [#35](https://github.com/naverisme/snote/issues/35), UI [#30](https://github.com/naverisme/snote/issues/30) |
| Mốc kiểm | `97764c862fec4bee3ae3b7093829d26433c8049c` trên `feat/v2/library`; bản sửa của kiểm duyệt nằm ở commit được báo qua `winwork resolve` |
| Phạm vi | Chỉ mã v2 trong `apps/api/src/modules/{library,uploads,storage}/**` và `apps/web/src/features/library/**`; không dùng nguồn v1 |
| Nguồn quy tắc | [LIB-01–18](../docs/requirements/library.md), [CUXB-01–09](../docs/ux/library-q33.md), [kiến trúc giao dịch](../docs/architecture/data-and-transactions.md), [QA-05–07/12–14](../docs/quality/README.md), `review/system-redesign-readiness.md` tại checkout tích hợp v2 `bdc1df38` |
| Giới hạn | Test service dùng mock, chưa chứng minh giao dịch PostgreSQL, HTTP upload thật, phục hồi bytes hoặc tính quota dưới 20 ghi đồng thời. Không có số liệu ENV-01–06. |

## Đường kiểm và kết quả

`POST /uploads` → `PUT /uploads/{id}/content` → `POST /workspaces/{id}/library/items` đi qua `UploadController`/`UploadService`, `LocalStorageAdapter`, `PrismaUploadStore`, `LibraryService` và `PrismaQuotaStore`. UI gọi ba bước trong `LibraryView.handleUploadFile`. `GET /workspaces/{id}/library/items` và `GET /library/items/{id}` cấp danh sách/chi tiết. Copy, revision, trash và restore đi qua `LibraryService`; dữ liệu riêng được Prisma store ghi từng lệnh riêng lẻ. Download chỉ trả URL qua `getDownload`.

| Trạng thái | Quan sát, ảnh hưởng, bằng chứng | Xử lý và phép kiểm mong đợi |
| --- | --- | --- |
| **Đã sửa** | `listItems` chỉ kiểm `library.read_text` rồi trả cả link/file, lộ title/ID/version cho principal chỉ có quyền văn bản; trái action catalog và PM-07/08. | Lọc từng item theo `read_text/read_link/read_file`; unit test principal chỉ đọc text chỉ nhận text. Cần kiểm HTTP với grant tùy chỉnh trên PostgreSQL. |
| **Đã sửa sau E2E** | Lần lọc đầu trả `200 []` cho người không có bất kỳ quyền đọc nào; QA-04 yêu cầu `403`. | Chặn ở cấp workspace nếu cả ba action đọc đều bị từ chối. Chạy lại E2E 39/39 và unit test outsider 403. |
| **Đã sửa một phần** | `copyItem` đọc quota đích nhưng không dùng kết quả, thêm ref dù đã đầy; trái LIB-12/16, QA-06. | Gọi `checkRestore` trước khi thêm ref, test đầy quota không thêm item/ref. Đây mới là kiểm tuần tự; ghi song song vẫn cần giao dịch giữ chỗ nguyên tử. |
| **Đã sửa UI** | `LibraryView` thay lỗi đọc quota bằng `0/1 GB`, và nếu chi tiết GET lỗi vẫn hiển thị metadata từ list; sau lỗi tải cả trang còn có thể giữ dữ liệu scope cũ. | Hiện lỗi và nút thử lại, xoá state cũ, bỏ item mà GET chi tiết lỗi. Build web đạt. Vẫn cần thử browser khi đổi workspace trước khi response cũ về. |
| **Sai — P0** | `QuotaService.checkAndReserve` đọc tổng rồi tạo reservation qua hai lệnh; hai upload song song có thể đều qua kiểm 1 GB. `PrismaQuotaStore` dùng query/upsert riêng, không khóa quota theo scope. `checkRestore` và copy cũng có cửa sổ race. | Owner Foundation cần cơ chế transaction/khóa theo scope và retry toàn bộ quyết định; owner #35 nối service vào đó. Chạy 20 upload/copy/restore cùng quota, tổng ref+reservation không vượt ngưỡng. Không tự sửa schema/contract trong worktree này. |
| **Sai — P0** | File commit cập nhật staging `committed`, thêm quota ref, tạo revision rồi item bằng bốn lệnh rời; lỗi giữa chừng để trạng thái thành công giả hoặc mất reservation. `createRevision` và trash/restore cũng ghi rời; `updateItem`/`createRevision` chỉ so `If-Match` từ bản đọc trước rồi update không điều kiện. | Giao dịch metadata + quota + conditional version; staging chỉ committed khi item/revision đã chốt. Fault injection sau mỗi bước và hai writer cùng version phải cho một kết quả duy nhất, không mất ref hoặc lịch sử. Phụ thuộc thiết kế transaction của Foundation. |
| **Sai — P0** | `PrismaQuotaStore.getActiveWorkspaceBlobs` cộng mọi `QuotaReference` gồm `library_item` cũ; trash/overwrite không xóa ref cũ, restore không thêm ref mới. Vì thế rác/lịch sử vẫn có thể bị tính vào quota, trái LIB-16/17. Không thấy purge 30 ngày hoặc GC có bảo vệ ref bản nộp trong module. | Thiết kế ref gắn item/revision, phân biệt active library với snapshot submission; chuyển ref atomically khi overwrite/trash/restore, purge sau hạn, GC chỉ bytes không còn ref hợp lệ. Test cùng blob ở hai item và submission, trash một/đôi item, restore khi đầy, purge sau 30 ngày. Cần phối hợp owner #32 và Foundation. |
| **Sai — P0** | `fetchUrlPreview` dùng `fetch(... redirect:'follow')` rồi mới kiểm URL cuối; request tới mạng riêng đã xảy ra. Nó cũng không resolve/ghim IP trước connect, cho DNS tới IP riêng. `getItem` fetch lại URL mỗi lần đọc thay vì dùng preview lưu lúc ghi, trái LIB-18/QA-12. | Chặn scheme khác HTTPS/HTTP, resolve và kiểm mọi IP trước connect, kiểm từng redirect trước khi theo; giới hạn bytes/thời gian; cache preview gắn revision. Test redirect public→private và DNS public-name→private bằng server giả. Quyết định lưu preview có thể cần schema Foundation. |
| **Sai — P1** | `UploadService.putContent` không truyền `declaredType` cho `storage.verify`; `UploadStaging` không lưu tên tệp/size/declaredType. Media sniff chỉ đọc 1024 byte; ZIP/OpenXML dựa vào declaredType nếu có, TXT không xác minh UTF-8. `storage.stage` chỉ so kích thước tối đa, không so size đã khai; budget vật lý check/read mỗi chunk không giữ chỗ nguyên tử. | Ghi metadata khai báo và so thực tế; kiểm magic/container/extension cho allowlist LIB-11; kiểm byte count; quota vật lý theo phép đo ENV-01. Test spoofed ZIP/Office, text UTF-8 lỗi, size sai, 2 upload đồng thời sát budget. Schema cần Foundation. |
| **Sai — P1** | `getDownload` trả `/api/v2/blobs/{blobId}/content` nhưng không thấy controller phục vụ route này; ID là UUID DB còn storage mở bằng digest. URL không phải signed và không thấy kiểm quyền lúc GET bytes. | Thiết kế endpoint stream từ `Blob.storageKey` có kiểm session/scope/ref tại lúc tải, hoặc URL ký ngắn hạn. Test tải thật, revocation trước GET bytes, bytes đúng SHA-256, 404 khi mất ref. Hợp đồng download hiện hành cần đối chiếu Foundation. |
| **Sai — P1** | `PrismaLibraryStore.createItem/findItem/listItems/updateItem` không lưu/đọc `title`; schema `LibraryItem` không có cột title. UI nhận title undefined sau reload. `updateFolder` chỉ chặn chính nó, không kiểm parent tồn tại/cùng workspace/chu kỳ nhiều cấp. | Thêm cột/migration hoặc nguồn title có dấu vết; bảo vệ parent bằng kiểm chuỗi tổ tiên trong transaction. Test reload PostgreSQL, parent khác workspace và A→B→A. Schema do Foundation sở hữu. |
| **Chưa kiểm** | Session/CSRF guard đã có unit test; chưa chạy HTTP với cookie hết hạn/thu hồi quyền giữa stream và commit. UI có thể ghi response cũ sau chuyển workspace vì `loadData` không hủy request cũ. | Chạy HTTP+browser theo QA-13, scope switch khi các GET chậm. Không tự nhận đạt từ unit mock. |

## Phản biện và thứ tự

Kiểm quota trước copy giúp từ chối trường hợp đầy theo thứ tự, nhưng chưa giải quyết đồng thời. Không nên coi `26/26` service tests là cổng P0 vì mocks không tạo race/giao dịch DB. Làm transaction và ref model trước, rồi nối download/preview và UI theo trạng thái thật. Cổng UI mới trong `review/system-redesign-readiness.md` ở checkout tích hợp chưa đạt: quyền danh sách đã được chặn ở service, nhưng quota/metadata/SSRF/download còn lỗi P0/P1. Mọi thay đổi schema hoặc OpenAPI phá hợp đồng cần chủ sản phẩm duyệt theo AGENTS.md; bản này chỉ mô tả payload và phép kiểm, không tự thay các vùng đó.

## Lệnh đã chạy trên nhánh kiểm duyệt

```text
npm run build --workspace @snote/api                 PASS
node --test apps/api/dist/modules/library/library-service.spec.js apps/api/dist/modules/uploads/upload-service.spec.js apps/api/dist/modules/storage/storage.spec.js apps/api/dist/modules/library/library-session.guard.spec.js  PASS 26/26
npm run build --workspace @snote/web                 PASS
node --test apps/web/src/features/library/library-ui.spec.ts  PASS 3/3
python tools/validate_contract.py                    PASS 86 paths, 106 operations, 973 refs
.agents/skills/impeccable/scripts/bin/windows-x64/impeccable.exe detect apps/web/src  PASS static scan, 59 files; parsed-page rules not run
git diff --check                                      PASS
npm run contract:http                                 PASS
node --test (all compiled API *.spec.js)             PASS 97/97
npm run test:e2e                                      PASS 39/39 after QA-04 fix
```
