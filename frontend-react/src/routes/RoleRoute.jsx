import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// SỬA: Import đúng tên hook từ file Context
import { useAuthContext } from "../context/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    // Có thể thay bằng Spinner đẹp hơn
    return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  }

  // 1. Nếu chưa đăng nhập -> Đá về Login (kèm state để login xong quay lại đây)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Nếu đã đăng nhập nhưng không có quyền -> Đá về Home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Render
  return children;
};

export default RoleRoute;
