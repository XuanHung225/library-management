const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/avatars"));
  },
  filename: function (req, file, cb) {
    // Đổi tên file: userId_timestamp.ext
    const ext = path.extname(file.originalname);
    const safeName = `${req.user.id}_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Chỉ hỗ trợ file ảnh jpg, png, webp"), false);
  }
  cb(null, true);
};

const limits = { fileSize: 2 * 1024 * 1024 }; // 2MB

const uploadAvatar = multer({ storage, fileFilter, limits }).single("avatar");

module.exports = uploadAvatar;
