import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import { useState } from "react";
import { useToast } from "../../components/ToastContext";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const onSubmit = async (data) => {
    setError("");
    try {
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      // 👉 THÊM DÒNG NÀY
      localStorage.setItem("pendingVerify", "true");

      showToast("Đăng ký thành công! Vui lòng xác thực email.", "success");
      navigate("/verify-email", { state: { username: data.username } });
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng ký thất bại";
      setError(msg);
      showToast(msg, "error");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-surface-dark p-4 md:p-8 rounded shadow mt-8 md:mt-16 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Đăng ký</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Tên đăng nhập</label>
          <input
            type="text"
            {...register("username", { required: true })}
            className="w-full border p-2 rounded"
          />
          {errors.username && (
            <span className="text-red-500">Tên đăng nhập là bắt buộc</span>
          )}
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full border p-2 rounded"
          />
          {errors.email && (
            <span className="text-red-500">Email là bắt buộc</span>
          )}
        </div>
        <div>
          <label className="block mb-1">Mật khẩu</label>
          <input
            type="password"
            {...register("password", { required: true, minLength: 6 })}
            className="w-full border p-2 rounded"
          />
          {errors.password && (
            <span className="text-red-500">Mật khẩu tối thiểu 6 ký tự</span>
          )}
        </div>
        <div>
          <label className="block mb-1">Nhập lại mật khẩu</label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: true,
              validate: (value, formValues) =>
                value === formValues.password || "Mật khẩu không khớp",
            })}
            className="w-full border p-2 rounded"
          />
          {errors.confirmPassword && (
            <span className="text-red-500">
              {errors.confirmPassword.message ||
                "Nhập lại mật khẩu là bắt buộc"}
            </span>
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded"
        >
          Đăng ký
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/login" className="text-primary hover:underline">
          Đã có tài khoản? Đăng nhập
        </a>
      </div>
    </div>
  );
}
