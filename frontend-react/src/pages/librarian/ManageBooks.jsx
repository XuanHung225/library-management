import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookForm from "../../components/forms/BookForm";
import bookService from "../../services/book.service";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuthContext } from "../../context/AuthContext"; // Giả sử bạn dùng AuthContext

export default function ManageBookPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext(); // Lấy thông tin user để check role
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  // Hàm xác định đường dẫn quay về dựa trên Role
  const getRedirectPath = () => {
    return user?.role === "librarian" ? "/librarian/books" : "/admin/books";
  };

  // 1. Tải dữ liệu nếu ở chế độ Chỉnh sửa
  useEffect(() => {
    if (isEditMode) {
      const fetchBook = async () => {
        try {
          const data = await bookService.getBookById(id);
          setInitialData(data);
        } catch (error) {
          alert("Không thể tải thông tin sách: " + error.message);
          navigate(getRedirectPath()); // Quay lại trang danh sách nếu lỗi
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [id, isEditMode]);

  // 2. Xử lý khi Submit (Thêm hoặc Sửa)
  const handleFormSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await bookService.updateBook(id, formData);
        alert("Cập nhật sách thành công!");
      } else {
        await bookService.createBook(formData);
        alert("Thêm sách mới thành công!");
      }

      // Điều hướng về trang danh sách tương ứng với Role
      navigate(getRedirectPath());
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline mb-4 flex items-center"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isEditMode ? `Chỉnh sửa: ${initialData?.title}` : "Thêm sách mới"}
          </h1>
          <p className="text-gray-500">
            Điền đầy đủ thông tin sách vào biểu mẫu bên dưới.
          </p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <BookForm
            initialData={initialData}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate(getRedirectPath())}
          />
        </div>
      </div>
    </div>
  );
}
