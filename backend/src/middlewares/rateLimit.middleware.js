const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 50, // tối đa 50 lần/15 phút
  message: { message: "Quá nhiều lần đăng nhập, vui lòng thử lại sau." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 20, // tối đa 20 lần/giờ
  message: { message: "Quá nhiều lần đăng ký, vui lòng thử lại sau." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter };
