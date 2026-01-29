import axiosInstance from "../api/axiosInstance";

const authService = {
  login: (data) => axiosInstance.post("/auth/login", data),
  register: (data) => axiosInstance.post("/auth/register", data),
  verifyEmail: (data) => axiosInstance.post("/auth/verify-email", data),
  getProfile: () => axiosInstance.get("/auth/profile"),
  logout: () => axiosInstance.post("/auth/logout"),
  changePassword: (data) => axiosInstance.post("/auth/change-password", data),
  requestPasswordReset: (data) =>
    axiosInstance.post("/auth/request-password-reset", data),
  resetPassword: (data) => axiosInstance.post("/auth/reset-password", data),
};

export default authService;
