const updateAvatar = async (userId, avatarUrl) => {
  await require("../repositories/user.repository").updateAvatar(
    userId,
    avatarUrl,
  );
};

const userRepository = require("../repositories/user.repository");
const logService = require("./log.service");

// Nhận tham số roleFilter
const getAllUsers = async (roleFilter = null) => {
  return await userRepository.getAllUsers(roleFilter);
};

const getUserById = async (id) => {
  return await userRepository.getUserById(id);
};

const updateUserRole = async (id, role_id, actor_id = null) => {
  const result = await userRepository.updateUserRole(id, role_id);
  // Log action
  if (logService && logService.logAction) {
    await logService.logAction({
      user_id: actor_id,
      action: "update_role",
      entity: "user",
      entity_id: id,
      detail: `Cập nhật role user_id=${id} thành role_id=${role_id}`,
    });
  }
  return result;
};

const updateProfile = async (id, profile) => {
  await userRepository.updateProfile(id, profile);
};

const setActive = async (id, active, actor_id = null) => {
  const result = await userRepository.setActive(id, active);
  if (logService && logService.logAction) {
    await logService.logAction({
      user_id: actor_id,
      action: "set_active",
      entity: "user",
      entity_id: id,
      detail: `Cập nhật active user_id=${id} thành ${active}`,
    });
  }
  return result;
};

const deleteUser = async (id, actor_id) => {
  await userRepository.deleteUser(id);

  await logService.logAction({
    user_id: actor_id,
    action: "delete_user",
    entity: "user",
    entity_id: id,
    detail: `Xóa user id=${id} (Soft delete)`,
  });
};

const createUser = async (userData, actor_id = null) => {
  const newUserId = await userRepository.createUser(userData);

  // Log hành động tạo user
  if (logService && logService.logAction) {
    await logService.logAction({
      user_id: actor_id,
      action: "create_user",
      entity: "user",
      entity_id: newUserId,
      detail: `Tạo user mới: ${userData.username} với role: ${userData.role}`,
    });
  }
  return newUserId;
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  setActive,
  updateProfile,
  updateAvatar,
  deleteUser,
  createUser,
};
