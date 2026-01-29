# Backend - Quản Lý Thư Viện

Đây là mã nguồn backend của hệ thống quản lý thư viện, sử dụng Node.js, Express và MySQL.

## 1. Cài đặt

```sh
cd backend
npm install
```

## 2. Cấu hình môi trường

Sao chép file `.env.example` thành `.env` và điền các giá trị:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Thông tin kết nối MySQL
- `JWT_SECRET`: Chuỗi bí mật ký JWT
- `JWT_EXPIRES_IN`: Thời gian sống của token (ví dụ: 8h)
- (Tùy chọn) `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Gửi email OTP

## 3. Migration & Seed dữ liệu

```sh
npm run migrate:run      # Chạy migration
npm run migrate:rollback # Quay lại migration trước
npm run migrate:status   # Xem trạng thái migration
npm run hash-passwords   # Hash lại mật khẩu người dùng cũ (nếu có)
```

## 4. Khởi động server

```sh
npm run dev   # Chạy chế độ phát triển
npm start     # Chạy production
```

## 5. Cấu trúc thư mục

- `src/controllers/`    : Xử lý logic các API
- `src/routes/`         : Định nghĩa route
- `src/services/`       : Xử lý nghiệp vụ
- `src/repositories/`   : Truy vấn database
- `src/middlewares/`    : Middleware xác thực, phân quyền, logging...
- `migrations/`         : File SQL migration
- `scripts/`            : Script hỗ trợ quản trị

## 6. Kiểm thử

```sh
npm test
```

## 7. Liên kết
- [Frontend hướng dẫn](../frontend-react/README.md)
- [README tổng quan](../README.md)

## 8. Đóng góp
Mọi đóng góp vui lòng tạo pull request hoặc issue trên GitHub.
