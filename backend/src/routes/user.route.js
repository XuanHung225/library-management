const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const controller = require("../controllers/user.controller");
const uploadAvatar = require("../middlewares/upload.middleware");

router.use(auth);

// Cho phép cả Admin và Librarian truy cập, logic phân quyền cụ thể sẽ nằm ở Controller

// Cho phép cả admin và librarian gọi các API này
router.get("/", role("admin", "librarian"), controller.getAllUsers);
router.get("/:id", role("admin", "librarian"), controller.getUser);
router.put("/:id/role", role("admin", "librarian"), controller.updateRole);
router.put("/:id/active", role("admin", "librarian"), controller.setActive);
router.delete("/:id", role("admin", "librarian"), controller.deleteUser);
router.post("/", role("admin"), controller.createUser);

// API cho user tự cập nhật thông tin cá nhân
router.put("/:id/profile", controller.updateProfile);

// API upload avatar
router.post("/avatar", uploadAvatar, controller.uploadAvatar);

module.exports = router;
