import { useParams, useNavigate } from "react-router-dom";
import BorrowBookForm from "../../components/forms/BorrowBookForm";
import { IoArrowBack } from "react-icons/io5"; // Nếu bạn dùng react-icons

export default function BorrowBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate("/borrow-books")}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <span className="mr-2">←</span> Quay lại danh mục sách
        </button>

        <div className="flex flex-col items-center">
          <BorrowBookForm bookId={id} />

          <div className="mt-8 text-center text-gray-500 text-sm max-w-md">
            <p>
              Lưu ý: Yêu cầu mượn sách của bạn sẽ được thủ thư duyệt trước khi
              bạn có thể đến nhận sách trực tiếp tại thư viện.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
