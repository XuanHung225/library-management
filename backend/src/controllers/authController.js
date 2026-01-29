const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(3).max(255).required(),
});
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(255).required(),
});

const verifyEmailSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  code: Joi.string().length(6).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(3).max(255).required(),
  newPassword: Joi.string().min(3).max(255).required(),
});
const requestPasswordResetSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
});

const resetPasswordSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(3).max(255).required(),
});

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { sign, revoke } = require("../../utils/jwt");
const nodemailer = require("nodemailer");

// In-DB OTP flow. Table `password_resets` is used to persist OTPs.
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

async function sendOtp(username, code, toEmail) {
  // If SMTP configured, send real email; otherwise log to console (dev).
  const host = process.env.SMTP_HOST;
  if (host && toEmail) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: "[Library] OTP đặt lại mật khẩu",
      text: `Mã OTP của bạn là ${code}. Mã có hiệu lực trong 15 phút.`,
      html: `<p>Mã OTP của bạn là <strong>${code}</strong>.</p><p>Mã có hiệu lực trong 15 phút.</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error("Failed to send OTP email:", err);
      // fallback to console
    }
  }

  console.log(`Password reset OTP for ${username}: ${code}`);
  return false;
}

exports.login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { username, password } = value;
    // Join roles table to get role name (role_id is normalized in DB)
    const [rows] = await db.query(
      "SELECT u.*, r.name AS role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = ?",
      [username],
    );
    if (rows.length === 0)
      return res.status(401).json({ message: "Sai username hoặc mật khẩu" });
    const user = rows[0];
    // Support hashed passwords; fallback to plain-text for legacy records
    const isMatch = await bcrypt
      .compare(password, user.password)
      .catch(() => false);
    if (!isMatch && password !== user.password) {
      return res.status(401).json({ message: "Sai username hoặc mật khẩu" });
    }

    // Deny login if user is deactivated
    if (user.is_active === 0) {
      return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = sign(payload);
    // Tạo refreshToken (random string, lưu DB hoặc memory, demo lưu tạm vào user table)
    const refreshToken = Math.random().toString(36).substring(2) + Date.now();
    await db.query("UPDATE users SET refresh_token = ? WHERE id = ?", [
      refreshToken,
      user.id,
    ]);
    return res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("AuthController.login error:", err && (err.stack || err));
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "No refresh token" });
    const [rows] = await db.query(
      "SELECT * FROM users WHERE refresh_token = ?",
      [refreshToken],
    );
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid refresh token" });
    const user = rows[0];
    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = sign(payload);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { username, email, password } = value;
    // Check existing user
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );
    if (existing.length > 0)
      return res.status(409).json({ message: "Username đã tồn tại" });
    // Chỉ cho phép đăng ký role 'user' qua API public
    const [roleRows] = await db.query(
      "SELECT id FROM roles WHERE name = 'user'",
    );
    const roleId = roleRows[0]?.id;
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, email, password, role_id, is_active) VALUES (?, ?, ?, ?, 0)",
      [username, email, hashed, roleId],
    );

    // Tạo mã xác thực email
    const code = generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    await db.query(
      "INSERT INTO email_verifications (username, code, expires_at) VALUES (?, ?, ?)",
      [username, code, expiresAt],
    );
    await sendOtp(username, code, email);

    return res
      .status(201)
      .json({
        message:
          "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản",
      });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { username, code } = value;
    const [rows] = await db.query(
      "SELECT * FROM email_verifications WHERE username = ?",
      [username],
    );
    if (rows.length === 0)
      return res
        .status(400)
        .json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn" });
    const record = rows[0];
    if (Date.now() > record.expires_at) {
      await db.query("DELETE FROM email_verifications WHERE username = ?", [
        username,
      ]);
      return res.status(400).json({ message: "Mã xác thực đã hết hạn" });
    }
    if (record.code !== code) {
      return res.status(400).json({ message: "Mã xác thực sai" });
    }
    // Kích hoạt tài khoản
    await db.query("UPDATE users SET is_active = 1 WHERE username = ?", [
      username,
    ]);
    await db.query("DELETE FROM email_verifications WHERE username = ?", [
      username,
    ]);
    return res.json({
      message: "Xác thực email thành công, tài khoản đã được kích hoạt",
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { currentPassword, newPassword } = value;
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User không tồn tại" });
    const user = rows[0];
    const match = await bcrypt
      .compare(currentPassword, user.password)
      .catch(() => false);
    if (!match && currentPassword !== user.password)
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      userId,
    ]);
    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided" });
    revoke(token);
    return res.json({ message: "Đã đăng xuất" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Lấy thông tin profile người dùng hiện tại
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    // Lấy thông tin user, join role
    const [rows] = await db.query(
      "SELECT u.id, u.avatar_url, u.username, u.email, u.full_name, u.date_of_birth, u.gender, u.phone, u.address, u.is_active, r.name AS role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
      [userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User không tồn tại" });
    const user = rows[0];
    return res.json({ user });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { error, value } = requestPasswordResetSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { username } = value;
    const [rows] = await db.query(
      "SELECT id, email FROM users WHERE username = ?",
      [username],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User không tồn tại" });
    const code = generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    const toEmail = rows[0].email || null;
    // persist OTP in DB (insert or update)
    const insertSql = `INSERT INTO password_resets (username, code, expires_at, attempts) VALUES (?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at), attempts = 0`;
    await db.query(insertSql, [username, code, expiresAt]);
    await sendOtp(username, code, toEmail);
    return res.json({
      message: "OTP đã được gửi (console hoặc email nếu có cấu hình)",
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { username, code, newPassword } = value;
    const [rows] = await db.query(
      "SELECT * FROM password_resets WHERE username = ?",
      [username],
    );
    if (rows.length === 0)
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    const record = rows[0];
    if (Date.now() > record.expires_at) {
      await db.query("DELETE FROM password_resets WHERE username = ?", [
        username,
      ]);
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }
    if (record.attempts >= 5) {
      await db.query("DELETE FROM password_resets WHERE username = ?", [
        username,
      ]);
      return res
        .status(429)
        .json({ message: "Vượt quá số lần thử, yêu cầu OTP mới" });
    }
    if (record.code !== code) {
      await db.query(
        "UPDATE password_resets SET attempts = attempts + 1 WHERE username = ?",
        [username],
      );
      return res.status(400).json({ message: "OTP sai" });
    }
    // All good: update password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE username = ?", [
      hashed,
      username,
    ]);
    await db.query("DELETE FROM password_resets WHERE username = ?", [
      username,
    ]);
    return res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    return res.status(500).json(err);
  }
};
