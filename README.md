# SNOTE v2

SNOTE hỗ trợ tổ chức công việc, lịch và tài liệu theo workspace, đồng thời cho giáo viên quản lý lớp và giao bài cho nhóm.

- [Chỉ mục tài liệu](docs/README.md) dẫn tới phạm vi sản phẩm, quy tắc nghiệp vụ và trải nghiệm đã đối chiếu.
- [Quy ước tài liệu](docs/DOCUMENTATION_POLICY.md) quy định nơi lưu và cách xác định hiệu lực.
- [Hồ sơ rà soát](review/README.md) ghi nguồn, phần còn thiếu và nội dung đưa ra duyệt.
- [Hướng dẫn tác nhân](AGENTS.md) chỉ đường đọc và dùng tài liệu khi nhận việc trên `s_note_v2`.
- [Kế hoạch xây dựng](IMPLEMENTATION_PLAN.md) chia mốc foundation, tính năng, tích hợp và cổng phát hành thử.
- [Luật worktree](WORKTREES.md) quy định nhánh, vùng tệp độc quyền, thứ tự phụ thuộc và lệnh tạo các checkout coding.
- [Bảng điều phối công việc](WORK_QUEUE.md) cho biết thư mục nào đang có, việc làm được ngay và tín hiệu phải chờ trước khi nối hoặc merge.

## Foundation local (issue #28)

Node `24.15.0`, npm `11.15.0`, PostgreSQL `17.7`. Dùng dữ liệu giả và credential trong `.env.example` chỉ cho máy phát triển.

```powershell
Copy-Item .env.example .env
docker compose up -d db
npm ci
npm run contract:generate
$env:DATABASE_URL='postgresql://snote:snote_dev_only@localhost:5432/snote?schema=public'
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run build
npm run contract:http
python -m pip install -r tools/requirements.txt
python tools/validate_contract.py
python -m openapi_spec_validator docs/contracts/openapi.yaml
```

API skeleton: `npm --workspace @snote/api run start` (`/api/v2/health`). Web skeleton: `npm --workspace @snote/web exec vite -- --host`. `packages/contracts` chứa kiểu sinh từ OpenAPI; `apps/web/src/api/generated/client.ts` dùng cookie và các header hợp đồng. Các module nghiệp vụ còn do #29–35 sở hữu.
