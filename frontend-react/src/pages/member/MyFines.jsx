import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
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
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function MyFines() {
  const { user } = useAuthContext();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchFines = async () => {
      try {
        setLoading(true);
        const data = await fineService.getMyFines();
        setFines(data);
      } catch (err) {
        setError("Không thể tải danh sách tiền phạt. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchFines();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Tiền phạt của tôi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Theo dõi và quản lý các khoản phí phát sinh do trả sách muộn.
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <span className="text-blue-700 font-semibold text-lg">
            Tổng nợ:{" "}
            {formatCurrency(
              fines
                .filter((f) => !f.is_paid)
                .reduce((sum, f) => sum + Number(f.amount), 0),
            )}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          {fines.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg">Tuyệt vời! Bạn không có khoản phạt nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Lý do & Mã phiếu
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Ngày phát hành
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-center text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fines.map((fine) => (
                    <tr
                      key={fine.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {fine.reason}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mã: #F-{fine.id} | Loan ID: {fine.loan_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(fine.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(fine.issued_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {fine.is_paid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500"></span>
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
                            Chưa thanh toán
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
