module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1. Nếu route có ID và user đang truy cập chính profile của họ -> Cho phép
    if (req.params.id && String(req.user.id) === String(req.params.id)) {
      return next();
    }

    // 2. Kiểm tra xem role của user có nằm trong danh sách được phép không
    // roles ở đây sẽ là một mảng ví dụ: ['admin', 'librarian']
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Nếu không khớp cái nào thì mới cấm
    return res
      .status(403)
      .json({
        message: "Forbidden: Bạn không có quyền thực hiện hành động này",
      });
  };
};
