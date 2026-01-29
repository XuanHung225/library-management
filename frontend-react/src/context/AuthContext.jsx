import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Khởi tạo User từ LocalStorage để không bị null khi vừa F5
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Nếu local không có user, coi như là khách, dừng loading luôn
      const savedUser = localStorage.getItem("user");
      // Nếu bạn dùng Token, hãy check thêm: const token = localStorage.getItem('token');

      if (!savedUser) {
        setLoading(false);
        return;
      }

      try {
        // Gọi API để lấy thông tin mới nhất (đề phòng user bị admin khóa lúc đang dùng)
        const res = await authService.getProfile();
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (error) {
        console.log("Session expired or invalid", error);
        // Token hết hạn thì logout luôn
        setUser(null);
        localStorage.removeItem("user");
        // localStorage.removeItem('token'); // Xóa token nếu có
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    // Lưu ý: Thường login sẽ trả về cả token, bạn nhớ lưu token nếu cần nhé
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    localStorage.removeItem("user");
    // localStorage.removeItem('token'); // Xóa token nếu có
    window.location.href = "/"; // Refresh cứng để xóa sạch state rác
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Xuất khẩu đúng tên
export const useAuthContext = () => useContext(AuthContext);
