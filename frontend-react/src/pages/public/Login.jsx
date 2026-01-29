import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import { useState } from "react";
import { useToast } from "../../components/ToastContext";
import { useAuthContext } from "../../context/AuthContext";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  // THÊM: State quản lý trạng thái đang gửi yêu cầu
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login: loginContext } = useAuthContext();
  const { showToast } = useToast();

  const onSubmit = async (data) => {
    // 1. Ngăn chặn gửi thêm yêu cầu nếu yêu cầu trước đó chưa xong
    if (isLoading) return;

    setError("");
    setIsLoading(true); // 2. Bắt đầu loading

    try {
      const res = await authService.login(data);
      const user = res.data.user;

      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
      }
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }

      loginContext(user);
      showToast("Đăng nhập thành công!", "success");

      if (user.role === "admin") {
        navigate("/admin/statistics");
      } else if (user.role === "librarian") {
        navigate("/librarian/profile");
      } else {
        navigate("/member/profile");
      }
    } catch (err) {
      console.error(err);

      // THÊM: Xử lý hiển thị lỗi 429 cụ thể cho người dùng
      if (err.response?.status === 429) {
        const msg =
          "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi 1-2 phút.";
        setError(msg);
        showToast(msg, "error");
      } else {
        const msg = "Tên đăng nhập hoặc mật khẩu không đúng";
        setError(msg);
        showToast(msg, "error");
      }
    } finally {
      setIsLoading(false); // 3. Kết thúc loading (quan trọng nhất)
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-surface-dark p-4 md:p-8 rounded shadow mt-8 md:mt-16 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Tên đăng nhập</label>
          <input
            type="text"
            {...register("username", { required: true })}
            className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading} // Khóa input khi đang load
          />
          {errors.username && (
            <span className="text-red-500 text-sm">
              Tên đăng nhập là bắt buộc
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1">Mật khẩu</label>
          <input
            type="password"
            {...register("password", { required: true })}
            className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading} // Khóa input khi đang load
          />
          {errors.password && (
            <span className="text-red-500 text-sm">Mật khẩu là bắt buộc</span>
          )}
        </div>

        {error && <div className="text-red-500 text-sm italic">{error}</div>}

        <button
          type="submit"
          disabled={isLoading} // 4. KHÓA NÚT BẤM KHI ĐANG LOAD
          className={`w-full py-2 rounded text-white transition-all ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:opacity-90"
          }`}
        >
          {isLoading ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/register" className="text-primary hover:underline">
          Chưa có tài khoản? Đăng ký
        </a>
      </div>
      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-primary hover:underline">
          Quên mật khẩu
        </a>
      </div>
    </div>
  );
}
