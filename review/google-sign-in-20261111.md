# Kiểm tích hợp Google Sign-In — 2026-11-11

| Mục | Kết quả |
| --- | --- |
| Nền v2 | `e3cee8ec552559f58fc1a5554d53a72a7d78455b` |
| Môi trường | Windows, PowerShell, Node/npm và Python; worktree `feat/google-registration` |
| Phạm vi | API xác minh Google ID token, tài khoản Google, migration, client web, OpenAPI |

## Lệnh đã chạy

- `npm.cmd run prisma:generate -w @snote/api` — PASS.
- `npm.cmd run build` — PASS (API và web; Vite cảnh báo bundle >500 kB).
- `node --test apps/api/dist/modules/identity/google-sign-in.spec.js apps/api/dist/modules/identity/google-token-verifier.spec.js` — PASS, 3/3.
- `node --test apps/api/dist/modules/qa-context.spec.js apps/api/dist/modules/api-to-ui-flow.spec.js` — PASS, 6/6.
- `npm.cmd run contract:http` — PASS.
- `python tools/validate_contract.py` với `PYTHONPATH=.runtime/pydeps` — PASS, 87 paths, 107 operations, 982 refs.
- `npx.cmd prisma validate --schema apps/api/prisma/schema.prisma` với `DATABASE_URL` thử nghiệm — PASS.
- `npm.cmd run prisma:migrate -w @snote/api` với PostgreSQL local, schema cô lập `google_registration_test` — PASS, cả foundation và migration Google đã áp dụng.
- `node .runtime/verify-google-db.cjs` với cùng schema cô lập, Google verifier giả lập — PASS: tài khoản và workspace cá nhân được ghi vào PostgreSQL, lần đăng nhập kế tiếp dùng lại tài khoản.

## Giới hạn

- Chưa kiểm giao dịch thực với Google; cần Client ID loại Web application cùng Authorized JavaScript origin hợp lệ. Kiểm với Google thực sau khi cấu hình `GOOGLE_CLIENT_ID` và `VITE_GOOGLE_CLIENT_ID` cùng một giá trị.
- Tài khoản email/mật khẩu trùng email Google trả `ACCOUNT_LINK_REQUIRED`; chưa có luồng liên kết tài khoản.

## Kiểm sau merge (2026-11-12)

Trên `s_note_v2` tại SHA `819321873c2351b9d97638f8c3a860a77775aee3`, Windows/PowerShell, PostgreSQL 18 local (`snote`, schema `public`): `npm.cmd install --offline`, `npm.cmd run prisma:generate -w @snote/api`, `npm.cmd run prisma:migrate -w @snote/api`, `npm.cmd run build`, `node --test apps/api/dist/modules/identity/google-sign-in.spec.js apps/api/dist/modules/identity/google-token-verifier.spec.js` (3/3) và `npm.cmd run contract:http` đều PASS. Migration Google áp dụng thành công vào database phát triển. API và web chưa có Google Client ID trong cấu hình local; kiểm với Google thực vẫn UNKNOWN.
