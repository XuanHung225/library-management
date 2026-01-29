import React, { useState, useEffect } from "react";
import loanService from "../../services/loan.service";

// Helper để format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

export default function ReturnBook() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Tải danh sách phiếu mượn khi vào trang
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await loanService.getAllLoans();
        // Chỉ lọc lấy những phiếu đang ở trạng thái 'borrowed' (đang mượn)
        const borrowedLoans = data.filter((loan) => loan.status === "borrowed");
        setLoans(borrowedLoans);
      } catch (err) {
        setError("Không thể tải danh sách phiếu mượn.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  // 2. Xử lý Trả sách
  const handleReturnBook = async (loanId) => {
    if (!window.confirm("Xác nhận nhận lại sách từ độc giả?")) return;

    try {
      // Backend mới trả về: { message, warning }
      const response = await loanService.returnBook(loanId);

      // Nếu có tiền phạt phát sinh
      if (response.warning) {
        alert(`✅ Trả sách thành công!\n⚠️ CẢNH BÁO PHẠT: ${response.warning}`);
      } else {
        alert("✅ Trả sách thành công!");
      }

      // Cập nhật giao diện: Loại bỏ phiếu vừa trả khỏi danh sách
      setLoans((prevLoans) =>
        prevLoans.filter((loan) => loan.loan_id !== loanId),
      );
    } catch (err) {
      console.error(err);
      alert(
        "❌ Lỗi khi trả sách: " + (err.response?.data?.message || err.message),
      );
    }
  };

  // Xử lý mất sách
  const handleLostBook = async (loanId) => {
    if (!window.confirm("Xác nhận người dùng làm mất sách?")) return;
    try {
      const response = await loanService.markBookAsLost(loanId);
      alert("✅ Đã cập nhật trạng thái mất sách và phạt 100.000đ");
      setLoans((prevLoans) =>
        prevLoans.filter((loan) => loan.loan_id !== loanId),
      );
    } catch (err) {
      alert(
        "❌ Lỗi khi đánh dấu mất sách: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <span className="loading-spinner">⏳</span> Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
          Quản lý Trả Sách
        </h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loans.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Hiện không có cuốn sách nào đang được mượn.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                  <tr>
                    <th className="p-4 border-b">Mã Phiếu</th>
                    <th className="p-4 border-b">Bạn đọc</th>
                    <th className="p-4 border-b">Tên Sách</th>
                    <th className="p-4 border-b">Ngày mượn</th>
                    <th className="p-4 border-b">Hạn trả</th>
                    <th className="p-4 border-b text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {loans.map((loan) => {
                    // Kiểm tra quá hạn để bôi đỏ
                    const today = new Date();
                    const dueDate = new Date(loan.due_date);
                    today.setHours(0, 0, 0, 0);
                    dueDate.setHours(0, 0, 0, 0);
                    const isOverdue = dueDate < today;
                    return (
                      <tr
                        key={loan.loan_id}
                        className="hover:bg-gray-50 border-b last:border-0 transition"
                      >
                        <td className="p-4 font-medium">#{loan.loan_id}</td>
                        <td className="p-4">
                          <div className="font-semibold">{loan.user_name}</div>
                          <div className="text-xs text-gray-500">
                            ID: {loan.user_id}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-blue-900">
                            {loan.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {loan.author}
                          </div>
                        </td>
                        <td className="p-4">{formatDate(loan.loan_date)}</td>
                        <td
                          className={`p-4 font-medium ${isOverdue ? "text-red-600" : "text-green-600"}`}
                        >
                          {formatDate(loan.due_date)}
                          {isOverdue && (
                            <span className="block text-xs text-red-500">
                              (Quá hạn)
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center flex flex-col gap-2 items-center">
                          <button
                            onClick={() => handleReturnBook(loan.loan_id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors mb-1"
                          >
                            Trả sách
                          </button>
                          <button
                            onClick={() => handleLostBook(loan.loan_id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors"
                          >
                            Mất sách
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
