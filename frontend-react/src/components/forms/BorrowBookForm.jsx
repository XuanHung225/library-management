import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import loanService from "../../services/loan.service";
import bookService from "../../services/book.service";
import { formatDate } from "../../utils/formatDate";

export default function BorrowBookForm({ bookId, onSuccess }) {
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Ngày hiện tại (YYYY-MM-DD) để chặn ngày quá khứ
  const today = new Date().toISOString().split("T")[0];

  // Lấy thông tin sách
  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);

        // res CHÍNH LÀ object book
        const bookData = await bookService.getBookById(bookId);
        setBook(bookData);
      } catch (err) {
        setError("Không thể tải thông tin chi tiết sách.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) fetchBookDetail();
  }, [bookId]);

  // Submit mượn sách
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        book_id: Number(bookId),
        due_date: dueDate,
        note: note || null,
      };

      await loanService.createLoan(payload);

      setSuccess("Gửi yêu cầu mượn sách thành công!");
      setNote("");

      if (onSuccess) onSuccess();

      setTimeout(() => {
        navigate("/my-loans");
      }, 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
        Xác nhận mượn sách
      </h2>

      {/* Thông tin sách */}
      {book && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            📘 Thông tin sách
          </h3>

          <div className="text-base text-gray-800 space-y-2">
            <p>
              <span className="font-semibold">Tên tác phẩm:</span>{" "}
              <span className="text-gray-900">{book.title}</span>
            </p>
            <p>
              <span className="font-semibold">Tác giả:</span>{" "}
              <span className="text-gray-900">{book.author}</span>
            </p>
          </div>
        </div>
      )}

      {/* Ngày trả */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày trả dự kiến
        </label>

        <input
          type="date"
          min={today}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     outline-none transition-all"
          required
        />

        {dueDate && (
          <p className="mt-2 text-sm text-gray-600">
            Ngày trả dự kiến:{" "}
            <span className="font-semibold">{formatDate(dueDate)}</span>
          </p>
        )}
      </div>

      {/* Ghi chú */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú (nếu có)
        </label>

        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Tôi muốn mượn để phục vụ môn học..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     outline-none transition-all resize-none"
        />

        {note && (
          <p className="mt-2 text-sm text-gray-600">
            Ghi chú của bạn: <span className="font-semibold">{note}</span>
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 mb-4 text-sm">
          {success}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/borrow-books")}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700
                     rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex-[2] bg-blue-600 text-white py-2.5 rounded-lg
                     font-semibold hover:bg-blue-700 disabled:bg-blue-300
                     shadow-md shadow-blue-200 transition-all"
        >
          {loading ? "Đang xử lý..." : "Xác nhận mượn"}
        </button>
      </div>
    </form>
  );
}
