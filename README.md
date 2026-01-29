# Quản Lý Thư Viện

Một hệ thống quản lý thư viện đơn giản (backend + frontend).

## Tổng quan

- Backend: Node.js + Express, MySQL (migrations + seeds), xác thực JWT, phân quyền RBAC, kiểm thử với Jest/Supertest.
- Frontend: React + Vite, các trang cơ bản cho Sách, Mượn sách, Phạt, Quản trị người dùng.

## Khởi động nhanh

1. Sao chép `.env.example` → `.env` và điền các giá trị (DB*, JWT_SECRET, SMTP* nếu dùng email).
2. Cài đặt thư viện:
   - `cd backend && npm install`
   - `cd frontend-react && npm install`
3. Chạy migration cho database:
   - `cd backend && npm run migrate:run`
4. Hash mật khẩu cũ (nếu có):
   - `cd backend && npm run hash-passwords`
5. Khởi động server phát triển:
   - `cd backend && npm run dev`
   - `cd frontend-react && npm run dev`

## Biến môi trường

Bắt buộc (backend):

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — thông tin kết nối database
- `JWT_SECRET` — chuỗi bí mật dùng ký JWT
- `JWT_EXPIRES_IN` — thời gian sống của token (ví dụ: `8h`)

Tùy chọn (backend):

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — gửi email OTP

Frontend:

- `VITE_API_BASE_URL` — địa chỉ API (ví dụ: `http://localhost:3000/api`)

Ví dụ file `.env` (sao chép vào `backend/.env` hoặc thư mục gốc):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=library_db
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=8h
VITE_API_BASE_URL=http://localhost:3000/api
```

> Không bao giờ commit thông tin bí mật thực tế lên repository. Hãy dùng GitHub Secrets / biến môi trường trong CI cho production.

## Kiểm thử

- Backend: `cd backend && npm test` (Jest + Supertest)

## Migration & Database

- Sử dụng script riêng: `backend/scripts/run_migrations.js` và các file SQL trong `backend/migrations/`.
- Dùng `npm run migrate:status` để xem trạng thái migration.

## Đóng góp

- Hãy tạo issue hoặc pull request. Thêm kiểm thử cho các bản vá lỗi và chạy `npm test` trước khi push.

---

**Lưu ý:** Badge phía trên thể hiện trạng thái CI của repository này.

