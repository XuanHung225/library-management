import { useState, useEffect } from "react";
import loanService from "../../services/loan.service";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function RejectedLoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await loanService.getAllLoans();
      setLoans(res.filter((l) => l.status === "rejected"));
    } catch {
      setError("Không lấy được danh sách phiếu mượn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-6">Phiếu mượn đã từ chối</h2>
      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} />
      {!loading && !error && loans.length === 0 && (
        <div>Không có phiếu mượn nào bị từ chối.</div>
      )}
      {!loading && !error && loans.length > 0 && (
        <table className="w-full border mb-6">
          <thead>
            <tr>
              <th className="p-2 border">Tên sách</th>
              <th className="p-2 border">Người mượn</th>
              <th className="p-2 border">Ngày mượn</th>
              <th className="p-2 border">Hạn trả</th>
              <th className="p-2 border">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="p-2 border">{loan.title}</td>
                <td className="p-2 border">{loan.user_id}</td>
                <td className="p-2 border">{loan.loan_date?.slice(0, 10)}</td>
                <td className="p-2 border">{loan.due_date?.slice(0, 10)}</td>
                <td className="p-2 border">{loan.note || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
