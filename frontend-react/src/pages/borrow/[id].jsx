import { useParams } from "react-router-dom";
import BorrowBookForm from "../../components/forms/BorrowBookForm";

export default function BorrowBookPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <BorrowBookForm bookId={id} />
    </div>
  );
}
