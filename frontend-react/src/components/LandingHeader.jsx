import { Link, useLocation } from "react-router-dom";

export default function LandingHeader() {
  const location = useLocation();

  // Hàm kiểm tra trạng thái Active của link
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            A
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tighter uppercase font-sans">
            ABC Library
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { name: "Trang chủ", path: "/" },
            { name: "Danh mục sách", path: "/books" },
            {
              name: "Hướng dẫn và quy định mượn sách",
              path: "#about",
              isAnchor: true,
            },
          ].map((item) =>
            item.isAnchor ? (
              <a
                key={item.name}
                href={item.path}
                className="px-4 py-2 text-[15px] font-semibold text-gray-500 hover:text-primary transition-colors duration-200"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 text-[15px] font-semibold transition-all duration-200 rounded-lg ${
                  isActive(item.path)
                    ? "text-primary bg-primary/5"
                    : "text-gray-500 hover:text-primary hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            ),
          )}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:block px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}
