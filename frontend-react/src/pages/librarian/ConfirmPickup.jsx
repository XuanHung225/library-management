import { useState, useEffect } from "react";
import loanService from "../../services/loan.service";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate"; // Đảm bảo hàm này nhận vào một date string

export default function ConfirmPickupPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await loanService.getAllLoans();
      // Chỉ lấy các phiếu đã được duyệt (approved) nhưng chưa nhận sách
      setLoans(res.filter((l) => l.status === "approved"));
    } catch {
      setError("Không lấy được danh sách phiếu mượn");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (loanId) => {
    setActionLoading(true);
    try {
      await loanService.confirmPickup(loanId, note);
      setNote("");
      setSelectedId(null);
      fetchLoans();
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(false);
    }
  };

  // Hủy phiếu nếu không đến nhận sách quá hạn
  const handleRejectIfNotPickedUp = async (loanId) => {
    if (
      !window.confirm(
        "Xác nhận từ chối phiếu mượn này do độc giả không đến nhận sách đúng hạn?",
      )
    )
      return;
    setActionLoading(true);
    try {
      await loanService.rejectIfNotPickedUp(loanId);
      setSelectedId(null);
      setNote("");
      fetchLoans();
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-8 border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Xác nhận nhận sách
          </h2>
          <p className="text-gray-500 text-sm">
            Xác nhận khi độc giả đã đến quầy lấy sách vật lý
          </p>
        </div>
        <button
          onClick={fetchLoans}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Làm mới danh sách"
        >
          🔄
        </button>
      </div>

      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} />

      {!loading && !error && loans.length === 0 && (
        <div className="text-center text-gray-400 py-20 bg-gray-50 rounded-lg border-2 border-dashed">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-medium">
            Không có phiếu mượn nào đang chờ xác nhận nhận sách.
          </p>
        </div>
      )}

      {!loading && !error && loans.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 border-b text-left font-bold">Mã phiếu</th>
                <th className="p-4 border-b text-left font-bold">
                  Thông tin Sách
                </th>
                <th className="p-4 border-b text-left font-bold">Độc giả</th>
                <th className="p-4 border-b text-center font-bold">
                  Ngày nhận sách
                </th>
                <th className="p-4 border-b text-center font-bold">
                  Hạn trả dự kiến
                </th>
                <th className="p-4 border-b text-left font-bold">Ghi chú</th>
                <th className="p-4 border-b text-center font-bold">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loans.map((loan) => (
                <tr
                  key={loan.loan_id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="p-4 font-mono text-blue-600 font-bold">
                    #{loan.loan_id}
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-gray-800">{loan.title}</div>
                    <div className="text-xs text-gray-500">{loan.author}</div>
                  </td>

                  <td className="p-4 font-medium text-gray-700">
                    {loan.user_name}
                  </td>

                  {/* THAY ĐỔI: Sử dụng formatDate thay vì .slice(0, 10) */}
                  <td className="p-4 text-center text-gray-600 whitespace-nowrap">
                    {loan.loan_date ? (
                      formatDate(loan.loan_date)
                    ) : (
                      <span className="text-gray-300">---</span>
                    )}
                  </td>

                  {/* THAY ĐỔI: Sử dụng formatDate thay vì .slice(0, 10) */}
                  <td className="p-4 text-center text-gray-600 whitespace-nowrap font-medium">
                    {loan.due_date ? (
                      formatDate(loan.due_date)
                    ) : (
                      <span className="text-gray-300">---</span>
                    )}
                  </td>

                  <td className="p-4">
                    {selectedId === loan.loan_id ? (
                      <input
                        autoFocus
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Nhập ghi chú..."
                      />
                    ) : (
                      <span className="text-gray-500 italic text-sm">
                        {loan.note || "Không có ghi chú"}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {selectedId === loan.loan_id ? (
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                            onClick={() => handleConfirm(loan.loan_id)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "..." : "Lưu"}
                          </button>
                          <button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                            onClick={() => {
                              setSelectedId(null);
                              setNote("");
                            }}
                            disabled={actionLoading}
                          >
                            Hủy
                          </button>
                        </div>
                        {/* Nút Không đến nhận, chỉ hiển thị nếu hôm nay > hạn trả dự kiến */}
                        {(() => {
                          if (!loan.due_date) return null;
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const dueDate = new Date(loan.due_date);
                          dueDate.setHours(0, 0, 0, 0);
                          if (today > dueDate) {
                            return (
                              <button
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all mt-2"
                                onClick={() =>
                                  handleRejectIfNotPickedUp(loan.loan_id)
                                }
                                disabled={actionLoading}
                              >
                                Không đến nhận
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    ) : (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                        onClick={() => {
                          setSelectedId(loan.loan_id);
                          setNote(loan.note || "");
                        }}
                      >
                        Xác nhận
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
