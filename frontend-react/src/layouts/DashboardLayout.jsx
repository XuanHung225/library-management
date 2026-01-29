import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";
import LandingFooter from "../components/LandingFooter";
import AboutModal from "../components/AboutModal"; // 1. Import Modal mới
import {
  LogOut,
  User,
  Key,
  ChevronDown,
  BookOpen,
  Library,
  BadgeDollarSign,
  Bell,
  HelpCircle, // Thêm icon Help
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardLayout() {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems = [
    { path: "/borrow-books", label: "Mượn sách", icon: <Library size={20} /> },
    {
      path: "/my-loans",
      label: "Sách đang mượn",
      icon: <BookOpen size={20} />,
    },
    {
      path: "/my-fines",
      label: "Tiền phạt",
      icon: <BadgeDollarSign size={20} />,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* 2. Đặt Modal ở đây để nó lắng nghe sự kiện thay đổi hash của URL */}
      <AboutModal />

      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* ... Giữ nguyên phần Header cũ của bạn ... */}
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight uppercase">
              ABC Library
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-primary transition-colors relative">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20">
                  <img
                    src={
                      user?.avatar_url
                        ? `${API_URL}${user.avatar_url}`
                        : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-gray-700 leading-none">
                    {user?.full_name || "Member"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
                    Thành viên
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-2 pb-3 text-xs text-gray-400 font-semibold uppercase tracking-widest">
                    Tài khoản
                  </div>
                  <Link
                    to="/member/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition"
                  >
                    <User size={16} /> Thông tin cá nhân
                  </Link>
                  <Link
                    to="/member/change-password"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition"
                  >
                    <Key size={16} /> Đổi mật khẩu
                  </Link>
                  <div className="border-t border-gray-50 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-medium"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ===== SIDEBAR ===== */}
        {/* ===== SIDEBAR ===== */}
        <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col shadow-sm">
          <div className="p-6">
            <p className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">
              Danh mục chính
            </p>

            <nav className="flex flex-col gap-1.5">
              {/* 1. Duyệt qua các menu items cũ */}
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-lg shadow-primary/20 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span
                    className={
                      isActive(item.path) ? "text-white" : "text-gray-400"
                    }
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}

              {/* 2. Chèn Widget Hướng dẫn ngay dưới Tiền phạt */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="text-primary" size={18} />
                    <span className="font-bold text-[13px] text-gray-800">
                      Quy định thư viện
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                    Nắm rõ quy trình mượn trả và phí quá hạn.
                  </p>
                  <a
                    href="#about"
                    className="flex items-center justify-center w-full py-2 bg-white border border-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                  >
                    Xem chi tiết
                  </a>
                </div>
              </div>
            </nav>
          </div>

          {/* 3. Phần dưới cùng giờ có thể để trống hoặc dùng cho việc khác */}
          <div className="mt-auto p-6">
            {/* Bạn có thể để thông tin phiên bản hoặc bản quyền nhỏ ở đây */}
            <p className="text-[10px] text-gray-300 text-center uppercase tracking-widest">
              v1.0.0 ABC Library
            </p>
          </div>
        </aside>

        {/* ===== MAIN CONTENT AREA ===== */}
        <main className="flex-1 overflow-auto flex flex-col custom-scrollbar">
          <div className="p-6 lg:p-10 flex-1">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </div>
          <LandingFooter />
        </main>
      </div>
    </div>
  );
}
