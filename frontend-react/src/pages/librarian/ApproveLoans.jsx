import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  AlertCircle,
  RotateCcw,
} from "lucide-react"; // Cần cài đặt lucide-react
import loanService from "../../services/loan.service";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ApproveLoansPage() {
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
      setLoans(res.filter((l) => l.status === "pending"));
    } catch {
      setError("Không lấy được danh sách phiếu mượn");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (loanId, action) => {
    if (!loanId) return;
    setActionLoading(true);
    try {
      if (action === "approve") {
        await loanService.approveLoan(loanId, note);
      } else {
        await loanService.rejectLoan(loanId, note);
      }
      setNote("");
      setSelectedId(null);
      fetchLoans();
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Duyệt Phiếu Mượn
          </h2>
          <p className="text-gray-500 mt-1">
            Quản lý và phê duyệt các yêu cầu mượn sách từ thành viên.
          </p>
        </div>
        <button
          onClick={fetchLoans}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition-all"
        >
          <RotateCcw size={18} /> Làm mới
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Sạch bóng phiếu chờ!
          </h3>
          <p className="text-gray-500">
            Hiện tại không có yêu cầu nào cần xử lý.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thông tin mượn
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    Người mượn
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loans.map((loan) => (
                  <tr
                    key={loan.loan_id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Sách & Mã */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {loan.title}
                          </div>
                          <div className="text-xs font-mono text-gray-400 uppercase">
                            #{loan.loan_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Người mượn */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 w-fit mx-auto">
                        <User size={14} />
                        {loan.user_name || loan.user_id}
                      </div>
                    </td>

                    {/* Thời gian */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock size={14} className="text-gray-400" />
                        <span>Mượn: {formatDate(loan.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-600 font-medium">
                        <Calendar size={14} />
                        <span>Hạn: {formatDate(loan.due_date)}</span>
                      </div>
                    </td>

                    {/* Ghi chú */}
                    <td className="px-6 py-4">
                      {selectedId === loan.loan_id ? (
                        <div className="relative">
                          <MessageSquare
                            size={14}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Thêm lý do..."
                            className="pl-8 pr-2 py-1.5 border border-blue-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic flex items-center gap-1">
                          {loan.note || (
                            <span className="text-gray-300 opacity-50">
                              Không có ghi chú
                            </span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      {selectedId === loan.loan_id ? (
                        <div className="flex justify-end gap-2 animate-in fade-in slide-in-from-right-2">
                          <button
                            onClick={() =>
                              handleAction(loan.loan_id, "approve")
                            }
                            disabled={actionLoading}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title="Xác nhận duyệt"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleAction(loan.loan_id, "reject")}
                            disabled={actionLoading}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Từ chối"
                          >
                            <XCircle size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedId(null);
                              setNote("");
                            }}
                            disabled={actionLoading}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                          >
                            <AlertCircle size={20} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedId(loan.loan_id);
                            setNote(loan.note || "");
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          Xử lý ngay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
