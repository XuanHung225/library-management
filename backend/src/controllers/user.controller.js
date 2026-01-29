const Joi = require("joi");
const userService = require("../services/user.service");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
// --- SCHEMA ---
const updateRoleSchema = Joi.object({
  role: Joi.string().valid("user", "librarian", "admin").required(),
});
const setActiveSchema = Joi.object({
  active: Joi.boolean().required(),
});
const updateProfileSchema = Joi.object({
  full_name: Joi.string().max(100).allow(""),
  date_of_birth: Joi.date().iso().allow(null),
  gender: Joi.string().valid("male", "female", "other").allow(null),
  phone: Joi.string().max(20).allow(""),
  address: Joi.string().max(255).allow(""),
}).min(1);

const createUserSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  full_name: Joi.string().required(),
  role: Joi.string().valid("user", "librarian").required(), // Nhận role từ client
});

// --- HELPER: CHECK HIERARCHY ---
const checkHierarchy = (actorRole, targetRoleName) => {
  // Chuẩn hóa về chữ thường để so sánh
  const actor = actorRole ? actorRole.toLowerCase() : "";
  const target = targetRoleName ? targetRoleName.toLowerCase() : "";

  console.log(`[CheckHierarchy] Actor: '${actor}' vs Target: '${target}'`);

  if (actor === "admin") return true; // Admin có toàn quyền
  if (actor === "librarian") {
    // Librarian chỉ được tác động nếu target là user
    return target === "user";
  }
  return false;
};

// --- HELPER: Lấy role name của người đang request ---
// Hàm này phòng trường hợp req.user từ auth middleware không có field 'role' (tên) mà chỉ có 'role_id'
const getActorRoleName = async (reqUser) => {
  // Nếu trong req.user đã có tên role (do middleware gán), dùng luôn
  if (reqUser.role && isNaN(reqUser.role)) return reqUser.role;

  // Nếu chưa có, phải query lại DB để lấy tên role dựa trên ID
  // Lưu ý: Đoạn này phụ thuộc vào cấu trúc bảng roles của bạn
  const [rows] = await db.query(
    `SELECT r.name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`,
    [reqUser.id],
  );

  if (rows.length > 0) return rows[0].name;
  return null;
};

// --- CONTROLLERS ---

exports.getAllUsers = async (req, res) => {
  try {
    const actorRole = await getActorRoleName(req.user);

    // Nếu là Librarian, chỉ lấy danh sách User.
    const roleFilter = actorRole === "librarian" ? "user" : null;
    const users = await userService.getAllUsers(roleFilter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id); // Target user

    if (!user) return res.status(404).json({ message: "User not found" });

    // Lấy role người thực hiện
    const actorRole = await getActorRoleName(req.user);

    // Kiểm tra quyền
    if (!checkHierarchy(actorRole, user.role)) {
      console.log(`Failed: ${actorRole} tried to view ${user.role}`);
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient privileges" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || parseInt(req.user.id, 10) !== parseInt(id, 10)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa thông tin này" });
    }
    const { error, value } = updateProfileSchema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    if (value.date_of_birth === "") delete value.date_of_birth;
    if (value.gender === "") delete value.gender;

    await userService.updateProfile(id, value);
    res.json({ message: "Cập nhật thông tin thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateRoleSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { role: newRoleName } = value;

    if (req.user && parseInt(req.user.id, 10) === parseInt(id, 10)) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const targetUser = await userService.getUserById(id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Lấy role người thực hiện
    const actorRole = await getActorRoleName(req.user);

    // Check 1: Có được sửa người này không?
    if (!checkHierarchy(actorRole, targetUser.role)) {
      return res.status(403).json({
        message: `Bạn (${actorRole}) không có quyền thay đổi role của tài khoản ${targetUser.role}`,
      });
    }

    // Check 2: Librarian không được nâng quyền thành admin/librarian
    if (actorRole === "librarian" && newRoleName !== "user") {
      return res
        .status(403)
        .json({ message: "Librarian chỉ được phép set role là User" });
    }

    const [roleRows] = await db.query("SELECT id FROM roles WHERE name = ?", [
      newRoleName,
    ]);
    if (roleRows.length === 0)
      return res.status(400).json({ message: "Invalid role" });

    await userService.updateUserRole(id, roleRows[0].id, req.user.id);
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = setActiveSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { active } = value;

    if (
      req.user &&
      parseInt(req.user.id, 10) === parseInt(id, 10) &&
      active === false
    ) {
      return res.status(400).json({ message: "Cannot deactivate yourself" });
    }

    const targetUser = await userService.getUserById(id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Lấy role người thực hiện
    const actorRole = await getActorRoleName(req.user);

    if (!checkHierarchy(actorRole, targetUser.role)) {
      return res.status(403).json({
        message: `Bạn (${actorRole}) không có quyền active/deactive tài khoản ${targetUser.role}`,
      });
    }

    await userService.setActive(id, active, req.user.id);
    res.json({ message: "User active status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Không có file ảnh" });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await userService.updateAvatar(req.user.id, avatarUrl);
    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await userService.getUserById(id);
    if (!targetUser)
      return res.status(404).json({ message: "User không tồn tại" });

    const actorRole = await getActorRoleName(req.user);

    // Không được tự xóa chính mình
    if (parseInt(req.user.id) === parseInt(id)) {
      return res
        .status(400)
        .json({ message: "Bạn không thể tự xóa chính mình" });
    }

    // ADMIN: được xóa user và librarian, không được xóa admin
    // LIBRARIAN: chỉ được xóa user
    if (actorRole === "admin") {
      if (targetUser.role === "admin") {
        return res
          .status(403)
          .json({ message: "Admin không được xóa tài khoản admin khác" });
      }
    } else if (actorRole === "librarian") {
      if (targetUser.role !== "user") {
        return res
          .status(403)
          .json({ message: "Librarian chỉ được phép xóa User" });
      }
    } else {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa tài khoản này" });
    }

    await userService.deleteUser(id, req.user.id);
    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const actorRole = await getActorRoleName(req.user);

    const { error, value } = createUserSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // ADMIN: được tạo user hoặc librarian, không được tạo admin
    // LIBRARIAN: chỉ được tạo user
    if (actorRole === "admin") {
      if (value.role === "admin") {
        return res
          .status(403)
          .json({ message: "Admin không được tạo tài khoản admin khác" });
      }
    } else if (actorRole === "librarian") {
      if (value.role !== "user") {
        return res
          .status(403)
          .json({ message: "Librarian chỉ được phép tạo User" });
      }
    } else {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền tạo tài khoản mới" });
    }

    // Hash mật khẩu và lưu vào DB
    const salt = await bcrypt.genSalt(10);
    const hashedParams = {
      ...value,
      password: await bcrypt.hash(value.password, salt),
    };

    const newUserId = await userService.createUser(hashedParams);
    res
      .status(201)
      .json({
        message: `Đã tạo thêm một ${value.role === "librarian" ? "Librarian" : "User"} mới thành công`,
        userId: newUserId,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
