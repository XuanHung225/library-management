const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const controller = require("../controllers/book.controller");
const uploadBookImage = require("../middlewares/upload-book.middleware");

// Public: lấy danh sách sách và thể loại
router.get("/", controller.getAll);
router.get("/categories", controller.getCategories);
router.get("/:id", controller.getById);

// Quản trị viên/thủ thư mới được tạo sách
// <--- THÊM MỚI: Route tạo thể loại (Chỉ admin/thủ thư mới được tạo)
router.post(
  "/categories",
  auth,
  role("admin", "librarian"),
  controller.createCategory,
);
// Cập nhật sách
router.put(
  "/:id",
  auth,
  role("admin", "librarian"),
  uploadBookImage,
  controller.update,
);
// Xóa sách
router.delete("/:id", auth, role("admin", "librarian"), controller.delete);

router.post(
  "/",
  auth,
  role("admin", "librarian"),
  uploadBookImage,
  controller.create,
);
router.post(
  "/upload-image",
  auth,
  role("admin", "librarian"),
  uploadBookImage,
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ message: "Không nhận được file ảnh" });
    // Đường dẫn lưu trong DB/frontend: giống khi tạo sách
    const image_url = `/uploads/books/${req.file.filename}`;
    res.json({ image_url });
  },
);
module.exports = router;
