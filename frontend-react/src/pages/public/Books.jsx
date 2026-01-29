import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import bookService from "../../services/book.service";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { getBookUrl } from "../../utils/getBookUrl";

const fontClass = "font-sans";
const PAGE_SIZE = 9;

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState({});

  // State cho Modal xem ảnh
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuthContext();

  // --- LOGIC KIỂM TRA QUYỀN ---
  const isAdminOrLibrarian =
    user && (user.role === "admin" || user.role === "librarian");

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await bookService.getBooks();
      setBooks(data);
    } catch (err) {
      setError("Không lấy được danh sách sách");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await bookService.getCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  // Logic filter/pagination
  const categoryKey = selectedCategory || "all";
  const currentCategoryPage = currentPage[categoryKey] || 1;
  const booksInCategory = books
    .filter((book) =>
      selectedCategory ? book.category_name === selectedCategory : true,
    )
    .filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author &&
          book.author.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  const totalPages = Math.ceil(booksInCategory.length / PAGE_SIZE);
  const paginatedBooks = booksInCategory.slice(
    (currentCategoryPage - 1) * PAGE_SIZE,
    currentCategoryPage * PAGE_SIZE,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage((prev) => ({ ...prev, [categoryKey]: page }));
    }
  };

  useEffect(() => {
    setCurrentPage((prev) => ({ ...prev, [categoryKey]: 1 }));
    // eslint-disable-next-line
  }, [selectedCategory, searchTerm]);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN NÚT BẤM ---

  const handleDetailClick = (bookId) => {
    if (!user) {
      navigate(`/books/${bookId}`);
      return;
    }

    const rolePathMap = {
      user: "member",
      librarian: "librarian",
      admin: "admin",
    };

    navigate(`/${rolePathMap[user.role]}/books/${bookId}`);
  };

  // Admin: Thêm sách mới
  const handleAddBookClick = () => {
    const rolePathMap = {
      user: "member",
      librarian: "librarian",
      admin: "admin",
    };

    navigate(`/${rolePathMap[user.role]}/add-book`);
  };

  // Admin: Chỉnh sửa sách
  const handleEditClick = (bookId) => {
    const rolePathMap = {
      user: "member",
      librarian: "librarian",
      admin: "admin",
    };

    navigate(`/${rolePathMap[user.role]}/books/edit/${bookId}`);
  };

  // Admin: Xóa sách
  const handleDeleteClick = async (bookId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?")) {
      try {
        // Giả sử service có hàm deleteBook
        await bookService.deleteBook(bookId);
        // Cập nhật lại state books để loại bỏ sách vừa xóa mà không cần reload
        setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookId));
        alert("Xóa sách thành công!");
      } catch (err) {
        alert("Xóa sách thất bại. Vui lòng thử lại.");
      }
    }
  };

  // Admin: Thêm thể loại
  const handleAddCategoryClick = async () => {
    // Đây là ví dụ đơn giản dùng prompt. Bạn có thể thay bằng Modal phức tạp hơn.
    const newCategoryName = prompt("Nhập tên thể loại mới:");
    if (newCategoryName) {
      try {
        await bookService.createCategory({ name: newCategoryName }); // Cần hàm này trong service
        fetchCategories(); // Load lại danh sách thể loại
        alert("Thêm thể loại thành công");
      } catch (e) {
        alert("Lỗi khi thêm thể loại");
      }
    }
  };

  const handleBorrowClick = (bookId) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(`/borrow/${bookId}`);
    }
  };

  return (
    <div className={`bg-[#f9fafb] min-h-screen ${fontClass}`}>
      {/* --- MODAL XEM ẢNH FULL SIZE --- */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)} // Click ra ngoài hoặc vào ảnh để đóng
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Book Cover Large"
              className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-1/4 p-6 bg-white rounded-lg shadow-md hidden md:block h-fit sticky top-4">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="text-xl font-bold">Thể loại sách</h3>
            {/* Nút Thêm Thể Loại (Chỉ Admin/Lib) */}
            {isAdminOrLibrarian && (
              <button
                onClick={handleAddCategoryClick}
                className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 transition"
                title="Thêm thể loại mới"
              >
                + Thêm
              </button>
            )}
          </div>

          <ul className="space-y-2">
            <li
              className={`py-2 px-4 rounded hover:bg-gray-200 cursor-pointer transition-all duration-200 ${!selectedCategory ? "bg-blue-600 text-white" : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              Tất cả
            </li>
            {categories.map((category) => (
              <li
                key={category.id}
                className={`py-2 px-4 rounded hover:bg-gray-200 cursor-pointer transition-all duration-200 ${selectedCategory === category.name ? "bg-blue-600 text-white" : ""}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="w-full md:w-3/4 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold">Danh mục sách</h2>

            <div className="flex w-full md:w-auto gap-2">
              {/* Thanh tìm kiếm */}
              <input
                type="text"
                placeholder="Tìm theo tên sách hoặc tác giả..."
                className="flex-grow md:w-64 p-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Nút Thêm Sách (Chỉ Admin/Lib) */}
              {isAdminOrLibrarian && (
                <button
                  onClick={handleAddBookClick}
                  className="whitespace-nowrap bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition font-medium flex items-center gap-1"
                >
                  <span>+</span> Thêm sách
                </button>
              )}
            </div>
          </div>

          {loading && <LoadingSpinner />}
          <ErrorMessage message={error} />

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative overflow-hidden rounded mb-4 aspect-[2/3] bg-gray-100 group cursor-zoom-in flex items-center justify-center">
                      <img
                        src={getBookUrl(book.image)}
                        alt={book.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/default-book.jpg";
                        }}
                        onClick={() => setPreviewImage(getBookUrl(book.image))}
                      />

                      {/* Hover hint */}
                    </div>

                    <div className="flex-grow">
                      <h3
                        className="font-bold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                        onClick={() => handleDetailClick(book.id)}
                      >
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Tác giả:</span>{" "}
                        {book.author || "-"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Thể loại:</span>{" "}
                        {book.category_name || "-"}
                      </p>

                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${book.available_quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {book.available_quantity > 0
                            ? "Còn hàng"
                            : "Hết hàng"}
                        </span>
                        {isAdminOrLibrarian && (
                          <span className="text-gray-500 text-xs">
                            Tổng: {book.total_quantity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* --- KHU VỰC BUTTONS --- */}
                    <div className="mt-4 flex gap-2">
                      {/* Nút 1: Chi tiết (Luôn có) */}
                      <button
                        onClick={() => handleDetailClick(book.id)}
                        className="flex-1 py-2 px-2 rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Chi tiết
                      </button>

                      {/* Logic phân quyền Admin vs User */}
                      {isAdminOrLibrarian ? (
                        <>
                          {/* Admin: Sửa */}
                          <button
                            onClick={() => handleEditClick(book.id)}
                            className="flex-1 py-2 px-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors shadow-sm text-sm"
                          >
                            Sửa
                          </button>
                          {/* Admin: Xóa */}
                          <button
                            onClick={() => handleDeleteClick(book.id)}
                            className="flex-1 py-2 px-2 rounded bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-sm text-sm"
                          >
                            Xóa
                          </button>
                        </>
                      ) : (
                        // User/Guest: Mượn
                        <button
                          onClick={() => handleBorrowClick(book.id)}
                          disabled={book.available_quantity <= 0}
                          className={`flex-[2] py-2 px-3 rounded font-medium transition-colors shadow-sm text-sm ${
                            book.available_quantity > 0
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {book.available_quantity > 0
                            ? "Mượn sách"
                            : "Hết hàng"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => handlePageChange(currentCategoryPage - 1)}
                    disabled={currentCategoryPage === 1}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`px-3 py-1 rounded border ${currentCategoryPage === i + 1 ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-100"}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => handlePageChange(currentCategoryPage + 1)}
                    disabled={currentCategoryPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
