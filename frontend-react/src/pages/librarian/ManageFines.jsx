import { useEffect, useState } from "react";
import fineService from "../../services/fine.service";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

// Helper: Định dạng tiền tệ VNĐ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Helper: Định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function ManageFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllFines = async () => {
    try {
      setLoading(true);
      const data = await fineService.getAllFines();
      setFines(data);
    } catch (err) {
      setError("Không thể tải danh sách tiền phạt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFines();
  }, []);

  const handleMarkAsPaid = async (fineId) => {
    if (!window.confirm("Xác nhận độc giả đã thanh toán khoản phạt này?"))
      return;

    try {
      await fineService.markAsPaid(fineId);
      setFines((prev) =>
        prev.map((f) =>
          f.id === fineId ? { ...f, is_paid: 1, paid_at: new Date() } : f,
        ),
      );
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể cập nhật"));
    }
  };

  const filteredFines = fines.filter(
    (fine) =>
      fine.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.user_id.toString().includes(searchTerm),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
            Quản lý Tiền phạt
          </h2>
          <p className="text-blue-600 font-medium">
            Hệ thống theo dõi nợ sách của độc giả
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã ID..."
            className="w-full md:w-80 px-4 py-2.5 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-blue-600 text-white text-sm uppercase">
                  {/* --- 1. THÊM CỘT TIÊU ĐỀ Ở ĐÂY --- */}
                  <th className="px-6 py-4 font-semibold w-24">Mã</th>

                  <th className="px-6 py-4 font-semibold">Độc giả</th>
                  <th className="px-6 py-4 font-semibold">Chi tiết vi phạm</th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {filteredFines.length === 0 ? (
                  <tr>
                    {/* --- 3. SỬA colSpan TỪ 5 THÀNH 6 --- */}
                    <td
                      colSpan="6"
                      className="p-12 text-center text-blue-400 font-medium"
                    >
                      Không tìm thấy dữ liệu phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredFines.map((fine) => (
                    <tr
                      key={fine.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      {/* --- 2. THÊM DỮ LIỆU CỘT MÃ PHIẾU --- */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-500">
                          F#{fine.id}
                        </span>
                      </td>

                      {/* Độc giả */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-900">
                          {fine.full_name || "N/A"}
                        </div>
                        <div className="text-xs font-semibold text-blue-500 uppercase tracking-tighter">
                          ID: #{fine.user_id}
                        </div>
                      </td>

                      {/* Chi tiết */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 font-medium">
                          {fine.reason}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Phát hành: {formatDate(fine.issued_at)}
                        </div>
                      </td>

                      {/* Số tiền */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-blue-800">
                          {formatCurrency(fine.amount)}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 text-center">
                        {fine.is_paid ? (
                          <div className="flex flex-col items-center">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                              Đã thu tiền
                            </span>
                            <span className="text-[10px] text-blue-400 mt-1">
                              {formatDate(fine.paid_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            Chờ thanh toán
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4 text-right">
                        {!fine.is_paid ? (
                          <button
                            onClick={() => handleMarkAsPaid(fine.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-all text-sm"
                          >
                            Thu tiền
                          </button>
                        ) : (
                          <span className="text-blue-300 font-bold text-sm italic">
                            Hoàn tất
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
