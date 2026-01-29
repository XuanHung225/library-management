import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import LandingFooter from "../components/LandingFooter";
import {
  LogOut,
  BarChart3,
  BookMarked,
  Users,
  History,
  Settings,
  Bell,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout() {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await logout();
      navigate("/");
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const menuItems = [
    {
      path: "/admin/statistics",
      label: "Thống kê",
      icon: <BarChart3 size={20} />,
    },
    {
      path: "/admin/books",
      label: "Quản lý Sách",
      icon: <BookMarked size={20} />,
    },
    {
      path: "/admin/users",
      label: "Quản lý Người dùng",
      icon: <Users size={20} />,
    },
    {
      path: "/admin/service",
      label: "Khôi phục tài khoản",
      icon: <Users size={20} />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-700/20">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-800 tracking-tight leading-none uppercase">
                ABC Library
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={12} className="text-blue-600" />
                <span className="text-[10px] font-bold text-blue-600 tracking-[0.15em] uppercase">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end leading-tight mr-2">
              <span className="text-sm font-bold text-gray-800">
                {user?.full_name || "Admin"}
              </span>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                Hệ thống quản trị
              </span>
            </div>

            <button className="p-2 text-gray-400 hover:text-blue-700 transition-colors">
              <Bell size={20} />
            </button>

            <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-all font-bold text-sm border border-red-100 shadow-sm shadow-red-100/50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ===== SIDEBAR ===== */}
        <aside className="w-72 bg-white border-r border-gray-200 hidden md:flex flex-col">
          <div className="p-6 h-full flex flex-col">
            <p className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 px-4">
              Bảng điều khiển
            </p>

            <nav className="flex flex-col gap-1.5 flex-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 group ${
                    isActive(item.path)
                      ? "bg-blue-700 text-white shadow-lg shadow-blue-700/25 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span
                    className={`${isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-blue-700"} transition-colors`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}

              <div className="my-4 border-t border-gray-50 mx-4"></div>

              <Link
                to="/admin/logs"
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 group ${
                  isActive("/admin/logs")
                    ? "bg-blue-700 text-white shadow-lg shadow-blue-700/25 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`${isActive("/admin/logs") ? "text-white" : "text-gray-400 group-hover:text-blue-700"}`}
                >
                  <Settings size={20} />
                </span>
                Lịch sử truy cập
              </Link>
            </nav>

            {/* Admin Badge */}
            <div className="mt-auto p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-1 text-center">
                Security Status
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[11px] text-blue-900 font-medium">
                  Lớp bảo mật đang bật
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== CONTENT AREA ===== */}
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="p-6 lg:p-10 flex-1">
            <div className="max-w-[1400px] mx-auto">
              {/* Vùng hiển thị nội dung trang admin */}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
