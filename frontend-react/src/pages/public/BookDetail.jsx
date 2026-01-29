import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bookService from "../../services/book.service";
import { useAuthContext } from "../../context/AuthContext";
import { getBookUrl } from "../../utils/getBookUrl";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kiểm tra quyền quản trị
  const isAdminOrLibrarian =
    user && (user.role === "admin" || user.role === "librarian");

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const data = await bookService.getBookById(id);
        setBook(data);
      } catch (err) {
        setError("Không thể tải thông tin chi tiết sách.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-10">
        <ErrorMessage message={error} />
      </div>
    );
  if (!book)
    return <div className="text-center p-10">Không tìm thấy sách.</div>;

  const handleEditClick = () => {
    if (user && user.role === "librarian") {
      navigate(`/librarian/books/edit/${book.id}`);
    } else {
      // Mặc định là admin hoặc các role khác
      navigate(`/admin/books/edit/${book.id}`);
    }
  };

  const handleDeleteBook = async () => {
    // 1. Xác nhận trước khi xóa
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa cuốn sách này không?",
    );
    if (!isConfirmed) return;

    try {
      // 2. Gọi API xóa
      await bookService.deleteBook(book.id);

      // 3. Thông báo thành công
      alert("Xóa sách thành công!");

      // 4. Điều hướng dựa trên Role
      const basePath = user.role === "librarian" ? "/librarian" : "/admin";
      navigate(`${basePath}/books`);
    } catch (err) {
      console.error("Lỗi khi xóa sách:", err);
      alert("Xóa sách thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition shadow-sm bg-white px-4 py-2 rounded-lg"
        >
          <span className="mr-2">←</span> Quay lại danh sách
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          {/* Cột trái: Ảnh bìa */}
          <div className="md:w-2/5 bg-gray-200 flex items-center justify-center p-8">
            <img
              src={getBookUrl(book.image)}
              alt={book.title}
              className="w-full max-w-sm rounded-lg shadow-2xl object-cover transform transition hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/default-book.jpg";
              }}
            />
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="md:w-3/5 p-8 md:p-12">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-2">
                {book.category_name || "Chưa phân loại"}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 mt-2 italic">
                bởi {book.author || "Chưa rõ tác giả"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 border-t border-b py-6 mb-8">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                  Mã ISBN
                </span>
                <span className="text-lg text-gray-800 font-medium">
                  {book.isbn || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                  Nhà xuất bản
                </span>
                <span className="text-lg text-gray-800 font-medium">
                  {book.publisher || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                  Năm xuất bản
                </span>
                <span className="text-lg text-gray-800 font-medium">
                  {book.published_year || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                  Trạng thái
                </span>
                <span
                  className={`text-lg font-bold ${book.available_quantity > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {book.available_quantity > 0
                    ? `Còn hàng (${book.available_quantity})`
                    : "Đã hết hàng"}
                </span>
              </div>
            </div>

            {/* Phần mô tả (Nếu có) */}
            {book.description && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Mô tả sách:
                </h3>
                <p className="text-gray-600 leading-relaxed text-justify">
                  {book.description}
                </p>
              </div>
            )}

            {/* Các nút hành động */}
            <div className="flex flex-wrap gap-4">
              {isAdminOrLibrarian ? (
                <>
                  <button
                    onClick={handleEditClick}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex-1 md:flex-none"
                  >
                    Chỉnh sửa thông tin
                  </button>

                  <button
                    onClick={handleDeleteBook}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex-1 md:flex-none"
                  >
                    Xóa sách
                  </button>
                </>
              ) : (
                <button
                  disabled={book.available_quantity <= 0}
                  onClick={() => navigate(`/borrow/${book.id}`)}
                  className={`px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex-1 md:flex-none ${
                    book.available_quantity > 0
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {book.available_quantity > 0
                    ? "Đăng ký mượn sách ngay"
                    : "Hiện đã hết sách"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
