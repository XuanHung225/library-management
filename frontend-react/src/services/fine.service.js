import axiosInstance from "../api/axiosInstance";

const fineService = {
  // Lấy danh sách phạt của user đang đăng nhập
  // Không cần truyền userId vì Token trong axiosInstance đã chứa thông tin này
  getMyFines: () => axiosInstance.get("/fines/my").then((res) => res.data),

  // Admin lấy tất cả
  getAllFines: () => axiosInstance.get("/fines").then((res) => res.data),

  // Đánh dấu đã trả (truyền ID vào URL)
  markAsPaid: (fineId) =>
    axiosInstance.patch(`/fines/${fineId}/pay`).then((res) => res.data),
};

export default fineService;
