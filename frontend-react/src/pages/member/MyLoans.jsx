import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import loanService from "../../services/loan.service";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Chờ duyệt",
      classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    approved: {
      label: "Đã duyệt",
      classes: "bg-green-100 text-green-800 border-green-200",
    },
    borrowed: {
      label: "Đang mượn",
      classes: "bg-blue-100 text-blue-800 border-blue-200",
    },
    rejected: {
      label: "Từ chối",
      classes: "bg-red-100 text-red-800 border-red-200",
    },
    overdue: {
      label: "Quá hạn",
      classes: "bg-orange-100 text-orange-800 border-orange-200",
    },
    default: {
      label: status,
      classes: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  const normalizedStatus = status ? status.toLowerCase() : "default";
  const config = statusConfig[normalizedStatus] || statusConfig.default;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {config.label}
    </span>
  );
};

export default function MyLoans() {
  const { user } = useAuthContext();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "—";

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loanService
      .getLoansByUser(user.id)
      .then(setLoans)
      .catch(() => setError("Không lấy được dữ liệu"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (loanId) => {
    if (!confirm("Bạn có chắc muốn hủy yêu cầu mượn này?")) return;

    try {
      await loanService.deleteLoanRequest(loanId);
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
    } catch {
      alert("Xóa yêu cầu thất bại");
    }
  };

  const activeLoans = loans.filter(
    (loan) => loan.status && loan.status.toLowerCase() !== "returned",
  );

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Sách đang mượn & Yêu cầu
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý các sách bạn đang mượn hoặc đang chờ thư viện phê duyệt
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded border shadow-sm">
            Tổng cộng: <strong>{activeLoans.length}</strong>
          </div>
        </div>

        <div className="p-0">
          {loading && (
            <div className="p-8">
              <LoadingSpinner />
            </div>
          )}
          <ErrorMessage message={error} />

          {!loading &&
            !error &&
            (activeLoans.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <svg
                  className="w-16 h-16 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
                <p>Bạn hiện không có sách nào đang mượn hoặc chờ duyệt.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">
                        Mã mượn
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        Thông tin sách
                      </th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">
                        Ngày đăng ký
                      </th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">
                        Ngày nhận
                      </th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">
                        Hạn trả
                      </th>
                      <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 font-semibold">Ghi chú</th>
                      <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeLoans.map((loan) => (
                      <tr
                        key={loan.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-4 font-mono text-gray-600 whitespace-nowrap">
                          #{loan.loan_code || loan.id}
                        </td>

                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="flex flex-col">
                            <span
                              className="font-medium text-gray-900 text-base line-clamp-2"
                              title={loan.title}
                            >
                              {loan.title}
                            </span>
                            <span className="text-gray-500 text-xs mt-0.5">
                              {loan.author}
                            </span>
                          </div>
                        </td>

                        {/* Ngày đăng ký */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(loan.created_at)}
                        </td>

                        {/* MỚI: Ngày nhận sách */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap font-medium">
                          {loan.loan_date ? (
                            formatDate(loan.loan_date)
                          ) : (
                            <span className="text-gray-400 text-xs italic font-normal">
                              Chưa nhận sách
                            </span>
                          )}
                        </td>

                        {/* Hạn trả */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          <span
                            className={
                              new Date(
                                new Date(loan.due_date).getTime() +
                                  24 * 60 * 60 * 1000,
                              ) < new Date() && loan.status === "borrowed"
                                ? "text-red-600 font-bold"
                                : ""
                            }
                          >
                            {" "}
                            {formatDate(loan.due_date)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <StatusBadge status={loan.status} />
                        </td>

                        {/* Ghi chú */}
                        <td className="px-4 py-4 text-gray-500 max-w-[200px]">
                          <p
                            className="text-xs italic line-clamp-2"
                            title={loan.note || loan.admin_remark}
                          >
                            {loan.note || loan.admin_remark || (
                              <span className="text-gray-300">Không có</span>
                            )}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          {(loan.status === "pending" ||
                            loan.status === "rejected") && (
                            <button
                              onClick={() => handleDelete(loan.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors text-xs font-medium border border-transparent hover:border-red-100"
                            >
                              Hủy yêu cầu
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
