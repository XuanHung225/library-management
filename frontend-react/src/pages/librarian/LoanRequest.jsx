import { useEffect, useState } from "react";
import loanService from "../../services/loan.service";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function LoanRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    loanService.getAllRequests
      ? loanService
          .getAllRequests()
          .then(setRequests)
          .catch(() => setError("Không lấy được dữ liệu"))
          .finally(() => setLoading(false))
      : setLoading(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Yêu cầu mượn sách</h2>
      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} />
      {!loading &&
        !error &&
        (!requests || requests.length === 0 ? (
          <div>Không có yêu cầu nào.</div>
        ) : (
          <table className="w-full border">
            <thead>
              <tr>
                <th className="p-2 border">Người mượn</th>
                <th className="p-2 border">Tên sách</th>
                <th className="p-2 border">Ngày yêu cầu</th>
                <th className="p-2 border">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="p-2 border">{req.username}</td>
                  <td className="p-2 border">{req.book_title}</td>
                  <td className="p-2 border">{req.requested_at}</td>
                  <td className="p-2 border">{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </div>
  );
}
