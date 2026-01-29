import axiosInstance from "../api/axiosInstance";

const userService = {
  getAll: () => axiosInstance.get("/users").then((res) => res.data),
  getById: (id) => axiosInstance.get(`/users/${id}`).then((res) => res.data),
  update: (id, data) => axiosInstance.put(`/users/${id}/profile`, data),
  deleteUser: (id) =>
    axiosInstance.delete(`/users/${id}`).then((res) => res.data),
  create: (userData) =>
    axiosInstance.post("/users", userData).then((res) => res.data),
};

export default userService;
