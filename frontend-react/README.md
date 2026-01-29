# Hệ Thống Quản Lý Thư Viện ABC (Frontend)

Một hệ thống quản lý thư viện hiện đại, thân thiện với người dùng, được xây dựng bằng React và Vite. Dự án cung cấp giao diện web đáp ứng cho người dùng, thủ thư và quản trị viên để quản lý sách, mượn/trả, phạt và tài khoản một cách hiệu quả.

---

## 1. Giới thiệu dự án

Hệ thống Quản Lý Thư Viện ABC giúp tự động hóa các nghiệp vụ thư viện và nâng cao trải nghiệm người dùng. Các tính năng chính:

- Tìm kiếm và tra cứu sách
- Quản lý mượn/trả sách trực tuyến
- Theo dõi và thanh toán tiền phạt
- Phân quyền truy cập cho thành viên, thủ thư, quản trị viên
- Thống kê, nhật ký hoạt động theo thời gian thực

Đây là mã nguồn **frontend**. Để sử dụng đầy đủ, hãy tham khảo thêm phần backend và hướng dẫn cài đặt cơ sở dữ liệu.

---

## 2. Cài đặt & Chạy dự án

### Yêu cầu

- [Node.js](https://nodejs.org/) (khuyến nghị v18 trở lên)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/)

### Các bước thực hiện

1. **Clone mã nguồn**

   ```sh
   git clone https://github.com/<ten-tai-khoan>/<ten-repo>.git
   cd <ten-repo>/frontend-react
   ```

2. **Cài đặt thư viện**

   ```sh
   npm install
   ```

3. **Cấu hình biến môi trường**

   ```sh
   cp .env.example .env
   ```

   Sau đó sửa file `.env`:

   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Chạy server phát triển**
   ```sh
   npm run dev
   ```
   Ứng dụng sẽ chạy tại [http://localhost:5173](http://localhost:5173) mặc định.

---

## 3. Khởi tạo cơ sở dữ liệu

Backend sử dụng MySQL. Để khởi tạo database:

1. **Tạo database và bảng từ file SQL**

   ```sh
   mysql -u <ten_user_mysql> -p < database/init.sql
   ```

   Thay `<ten_user_mysql>` bằng tài khoản MySQL của bạn.

2. **Cấu hình biến môi trường cho backend**
   Trong file `.env` của backend:

   ```
   DB_HOST=localhost
   DB_USER=<ten_user_mysql>
   DB_PASSWORD=<mat_khau_mysql>
   DB_NAME=library_management
   ```

3. **Chạy backend**
   Làm theo hướng dẫn trong thư mục backend để khởi động API server.

---

## 4. Công nghệ sử dụng

- **Frontend:**
  - React (v19)
  - Vite
  - Tailwind CSS
  - React Router
  - Chart.js & react-chartjs-2
  - Lucide React (icon)
  - React Hook Form
  - Axios
  - React Toastify

- **Backend:**
  - Node.js, Express, MySQL (xem chi tiết trong thư mục backend)

---

## Giấy phép

Dự án sử dụng giấy phép [MIT License](../LICENSE).

---

## Đóng góp

Chào mừng mọi đóng góp! Hãy tạo issue hoặc pull request nếu bạn muốn cải tiến hoặc sửa lỗi.

---

**Lưu ý:** Thay `<ten-tai-khoan>/<ten-repo>` bằng đường dẫn repo thực tế của bạn.
