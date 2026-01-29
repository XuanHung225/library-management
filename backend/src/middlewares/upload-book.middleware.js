const multer = require("multer");
const path = require("path");

// Thay đổi trong file middlewares/upload-book.middleware.js
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Sử dụng đường dẫn tương đối tính từ thư mục chạy server
    // Đảm bảo thư mục này đã tồn tại
    cb(null, "uploads/books");
  },
  // ... các phần còn lại giữ nguyên
  filename: function (req, file, cb) {
    // Đổi tên file: book_timestamp_random.ext
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `book_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Chỉ hỗ trợ file ảnh jpg, png, webp"), false);
  }
  cb(null, true);
};

const limits = { fileSize: 5 * 1024 * 1024 }; // Tăng lên 5MB cho ảnh bìa sách sắc nét hơn

// Lưu ý: trường nhận file tên là 'image' (khớp với frontend)
const uploadBookImage = multer({ storage, fileFilter, limits }).single("image");

module.exports = uploadBookImage;
