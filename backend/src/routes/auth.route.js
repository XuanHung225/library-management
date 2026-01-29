const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const auth = require("../middlewares/auth.middleware");
const {
  loginLimiter,
  registerLimiter,
} = require("../middlewares/rateLimit.middleware");

router.post("/login", loginLimiter, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/register", registerLimiter, authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/change-password", auth, authController.changePassword);
router.post("/logout", auth, authController.logout);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

// Lấy profile người dùng hiện tại
router.get("/profile", auth, authController.getProfile);

module.exports = router;
