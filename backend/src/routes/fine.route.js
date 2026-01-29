const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const controller = require("../controllers/fine.controller");

// User: Xem danh sách phạt của chính mình
// Endpoint: GET /api/fines/my
router.get("/my", auth, controller.getMyFines);

// Admin/Librarian: Xem tất cả
// Endpoint: GET /api/fines
router.get("/", auth, role("admin", "librarian"), controller.getAllFines);

// Admin/Librarian: Đánh dấu đã trả tiền
// Endpoint: PATCH /api/fines/:id/pay
// Thay đổi từ POST /pay sang PATCH /:id/pay cho đúng chuẩn
router.patch(
  "/:id/pay",
  auth,
  role("admin", "librarian"),
  controller.markAsPaid,
);

module.exports = router;
