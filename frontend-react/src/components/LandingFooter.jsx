import { Link } from "react-router-dom";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Cột 1: Giới thiệu & Logo */}
          <div className="col-span-1 md:col-span-1">
            <Link
              to="/"
              className="text-2xl font-extrabold text-primary tracking-tight font-sans mb-4 block"
            >
              ABC Library
            </Link>
            <p className="text-gray-600 leading-relaxed mb-6">
              Khám phá thế giới tri thức vô tận. Chúng tôi cung cấp hàng ngàn
              đầu sách đa dạng giúp bạn phát triển bản thân mỗi ngày.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-primary hover:text-white transition"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-primary hover:text-white transition"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-primary hover:text-white transition"
              >
                <TwitterIcon size={18} />
              </a>
            </div>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">
              Khám phá
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/books"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Danh mục sách
                </Link>
              </li>
              <li>
                <a
                  href="#news"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Tin tức
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Giới thiệu
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">
              Hỗ trợ
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Hướng dẫn mượn sách
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">
              Liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin size={20} className="text-primary shrink-0" />
                <span>123 Đường ABC, Phường IJK, TP. Hà Nội</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Phone size={20} className="text-primary shrink-0" />
                <span>0921 124 5678</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Mail size={20} className="text-primary shrink-0" />
                <span>support@abclibrary.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Thanh bản quyền dưới cùng */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center">
            © {currentYear} ABC Library. Thiết kế bởi đội ngũ sáng tạo.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span className="cursor-pointer hover:text-primary">
              Tiếng Việt
            </span>
            <span className="cursor-pointer hover:text-primary">English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
