const db = require("../config/db");

// --- THÊM HÀM NÀY VÀO ---
const createUser = async (userData) => {
  // 1. Tìm ID của role tương ứng từ bảng roles
  const [roles] = await db.query("SELECT id FROM roles WHERE name = ?", [
    userData.role,
  ]);
  if (roles.length === 0) {
    throw new Error(
      `Không tìm thấy vai trò '${userData.role}' trong hệ thống.`,
    );
  }
  const role_id = roles[0].id;

  // 2. Chèn dữ liệu mới vào bảng users
  // Mặc định is_active = 1 (hoạt động)
  const [result] = await db.query(
    `INSERT INTO users (username, password, email, full_name, role_id, is_active, created_at) 
     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
    [
      userData.username,
      userData.password, // Mật khẩu này đã được hash từ service
      userData.email,
      userData.full_name,
      role_id,
    ],
  );
  return result.insertId; // Trả về ID của user vừa tạo
};

// ... Các hàm cũ giữ nguyên ...

const getAllUsers = async (roleFilter = null) => {
  let sql = `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.is_active, r.name AS role, u.created_at
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.deleted_at IS NULL`;

  const params = [];
  if (roleFilter) {
    sql += ` AND r.name = ?`;
    params.push(roleFilter);
  }
  sql += ` ORDER BY u.created_at DESC`;

  const [rows] = await db.query(sql, params);
  return rows;
};

const getUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.is_active, r.name AS role, u.created_at
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.id = ? AND u.deleted_at IS NULL`,
    [id],
  );
  return rows[0];
};

const updateUserRole = async (id, role_id) => {
  await db.query("UPDATE users SET role_id = ? WHERE id = ?", [role_id, id]);
};

const setActive = async (id, active) => {
  await db.query("UPDATE users SET is_active = ? WHERE id = ?", [
    active ? 1 : 0,
    id,
  ]);
};

const updateProfile = async (id, profile) => {
  const fields = [];
  const values = [];

  if (profile.full_name !== undefined) {
    fields.push("full_name = ?");
    values.push(profile.full_name);
  }
  if (profile.date_of_birth !== undefined) {
    fields.push("date_of_birth = ?");
    values.push(profile.date_of_birth || null);
  }
  if (profile.gender !== undefined) {
    if (!["male", "female", "other"].includes(profile.gender))
      throw new Error("Giới tính không hợp lệ");
    fields.push("gender = ?");
    values.push(profile.gender);
  }
  if (profile.phone !== undefined) {
    fields.push("phone = ?");
    values.push(profile.phone);
  }
  if (profile.address !== undefined) {
    fields.push("address = ?");
    values.push(profile.address);
  }

  if (fields.length === 0) return;
  values.push(id);
  await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
};

const updateAvatar = async (userId, avatarUrl) => {
  await db.query("UPDATE users SET avatar_url = ? WHERE id = ?", [
    avatarUrl,
    userId,
  ]);
};

const deleteUser = async (id) => {
  await db.query(
    "UPDATE users SET deleted_at = NOW(), is_active = 0 WHERE id = ?",
    [id],
  );
};

module.exports = {
  createUser, // <--- PHẢI EXPORT Ở ĐÂY
  getAllUsers,
  getUserById,
  updateUserRole,
  setActive,
  updateProfile,
  updateAvatar,
  deleteUser,
};
