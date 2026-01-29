import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";
import LandingFooter from "../components/LandingFooter";
import {
  LogOut,
  User,
  Key,
  ChevronDown,
  LayoutDashboard,
  FileCheck,
  PackageCheck,
  History,
  BadgeDollarSign,
  BookMarked,
  Users,
  Bell,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function LibLayout() {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      path: "/librarian/statistics",
      label: "Tổng quan",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/approve-loans",
      label: "Duyệt phiếu mượn",
      icon: <FileCheck size={20} />,
    },
    {
      path: "/confirm-pickup",
      label: "Xác nhận nhận sách",
      icon: <PackageCheck size={20} />,
    },
    { path: "/return-books", label: "Trả sách", icon: <History size={20} /> },
    {
      path: "/manage-fines",
      label: "Tiền phạt",
      icon: <BadgeDollarSign size={20} />,
    },
    {
      path: "/librarian/books",
      label: "Quản lý sách",
      icon: <BookMarked size={20} />,
    },
    { path: "/librarian/users", label: "Bạn đọc", icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-800 tracking-tight leading-none">
                ABC LIBRARY
              </span>
              <span className="text-[10px] font-bold text-primary tracking-[0.2em] mt-1 uppercase">
                Librarian Portal
              </span>
            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-primary transition-colors relative p-2">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
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
                    {user?.full_name || "Librarian"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                    Thủ thư
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-2 border-b border-gray-50 mb-2 pb-3 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Quản lý tài khoản
                  </div>
                  <Link
                    to="/librarian/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition"
                  >
                    <User size={16} /> Thông tin cá nhân
                  </Link>
                  <Link
                    to="/librarian/change-password"
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
        <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="p-6 h-full flex flex-col">
            <p className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 px-4">
              Menu quản trị
            </p>
            <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto custom-sidebar-scroll">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 group ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-lg shadow-primary/25 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span
                    className={`${isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-primary"} transition-colors`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* System Status Label */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                  Hệ thống sẵn sàng
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                Mọi tiến trình đang chạy ổn định
              </p>
            </div>
          </div>
        </aside>

        {/* ===== CONTENT AREA ===== */}
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="p-6 lg:p-8 flex-1">
            <div className="max-w-[1400px] mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
