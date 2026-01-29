import axiosInstance from "../api/axiosInstance";

const loanService = {
  getLoansByUser: () => axiosInstance.get(`/loans/my`).then((res) => res.data),
  // Tạo phiếu mượn sách
  createLoan: (payload) => axiosInstance.post("/loans", payload),
  // Thủ thư duyệt phiếu mượn
  approveLoan: (loanId, note) =>
    axiosInstance.put(`/loans/${loanId}/approve`, { action: "approve", note }),
  // Thủ thư từ chối phiếu mượn
  rejectLoan: (loanId, note) =>
    axiosInstance.put(`/loans/${loanId}/approve`, { action: "reject", note }),
  // Thủ thư xác nhận user đã nhận sách
  confirmPickup: (loanId, note) =>
    axiosInstance.put(`/loans/${loanId}/confirm-pickup`, { note }),
  // Lấy tất cả phiếu mượn (dành cho thủ thư và admin)
  getAllLoans: () => axiosInstance.get("/loans").then((res) => res.data),
  // Trả sách
  returnBook: (loanId) =>
    axiosInstance.put("/loans/return", { loan_id: loanId }),
  // Xóa yêu cầu mượn sách (chỉ user xóa được phiếu của mình, trạng thái pending)
  deleteLoanRequest: (loanId) => axiosInstance.delete(`/loans/${loanId}`),

  // Đánh dấu mất sách (thủ thư/admin)
  markBookAsLost: (loanId, note) =>
    axiosInstance.put(`/loans/${loanId}/lost`, { note }),

  // Từ chối phiếu mượn nếu không đến nhận sách quá hạn
  rejectIfNotPickedUp: (loanId) =>
    axiosInstance.put(`/loans/${loanId}/reject-if-not-picked-up`),
};

export default loanService;
