import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  X,
  BookOpen,
  Info,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function AboutModal() {
  const location = useLocation();
  const navigate = useNavigate();

  const isOpen = location.hash === "#about";

  const handleClose = () => {
    navigate(location.pathname, { replace: true });
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={handleClose}></div>

      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-slide-up">
        {/* --- HEADER --- */}
        <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hướng dẫn & Quy định</h2>
              <p className="text-white/80 text-sm">
                Dành cho bạn đọc và khách ghé thăm
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* 1. Hướng dẫn mượn sách */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <CheckCircle2 className="text-green-500" size={20} />
              Quy trình mượn sách
            </h3>
            <div className="grid grid-cols-1 gap-3 ml-2 border-l-2 border-gray-100 pl-4">
              <div className="relative">
                <span className="font-semibold text-primary">Bước 1:</span> Tìm
                sách trên hệ thống online. Thêm vào giỏ mượn và gửi yêu cầu mượn
                sách.
              </div>
              <div className="relative">
                <span className="font-semibold text-primary">Bước 2:</span> Chờ
                nhân viên thư viện duyệt yêu cầu và chuẩn bị sách.
              </div>
              <div className="relative">
                <span className="font-semibold text-primary">Bước 3:</span> Nhận
                thông báo từ thư viện khi sách đã sẵn sàng để đến lấy.
              </div>
              <div className="relative">
                <span className="font-semibold text-primary">Bước 4:</span> Đến
                thư viện trong thời gian quy định để nhận sách.
              </div>
            </div>
          </section>

          {/* 2. Quy định chung */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
              <BookOpen className="text-primary" size={20} />
              Quy định mượn - trả
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                <span>
                  Số lượng: Tối đa <strong>05 cuốn</strong>/lần mượn.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                <span>
                  Thời gian: Được giữ sách trong <strong>14 ngày</strong>.
                </span>
              </li>
            </ul>
          </section>

          {/* 3. Tiền phạt & Bồi thường */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold text-red-600 mb-4">
              <AlertTriangle size={20} />
              Phí phạt & Bồi thường
            </h3>
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-red-50 text-red-700">
                  <tr>
                    <th className="p-3 font-semibold">Vi phạm</th>
                    <th className="p-3 font-semibold text-right">Mức phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="p-3 text-red-500 font-medium">
                      Quá hạn trả sách
                    </td>
                    <td className="p-3 text-right">5.000 đồng / ngày / cuốn</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-800">
                      Làm mất sách
                    </td>
                    <td className="p-3 text-right">Đền 100.000 đồng</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-400 italic">
              * Phí phạt sẽ được cộng dồn vào tài khoản thành viên. Bạn không
              thể tiếp tục mượn sách nếu có phí phạt chưa thanh toán vượt quá
              150.000đ.
            </p>
          </section>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <HelpCircle size={16} />
            <span>Mọi thắc mắc vui lòng liên hệ hỗ trợ.</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Đã hiểu
            </button>
            <Link
              to="/register"
              onClick={handleClose}
              className="flex-1 sm:flex-none px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              Đăng ký thành viên
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
