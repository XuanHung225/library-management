import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError("");
    setMessage("");

    // ❌ không gửi confirmPassword lên backend
    const { confirmPassword, ...payload } = data;

    try {
      const res = await authService.resetPassword(payload);
      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-surface-dark p-4 md:p-8 rounded shadow mt-8 md:mt-16 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Đặt lại mật khẩu</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Tên đăng nhập</label>
          <input
            type="text"
            {...register("username", { required: true })}
            className="w-full border p-2 rounded"
          />
          {errors.username && <span className="text-red-500">Bắt buộc</span>}
        </div>

        <div>
          <label className="block mb-1">Mã OTP</label>
          <input
            type="text"
            {...register("code", {
              required: true,
              minLength: 6,
              maxLength: 6,
            })}
            className="w-full border p-2 rounded"
          />
          {errors.code && <span className="text-red-500">Mã OTP gồm 6 số</span>}
        </div>

        <div>
          <label className="block mb-1">Mật khẩu mới</label>
          <input
            type="password"
            {...register("newPassword", {
              required: true,
              minLength: 6,
            })}
            className="w-full border p-2 rounded"
          />
          {errors.newPassword && (
            <span className="text-red-500">Tối thiểu 6 ký tự</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Nhập lại mật khẩu</label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: true,
              validate: (value) =>
                value === newPassword || "Mật khẩu không khớp",
            })}
            className="w-full border p-2 rounded"
          />
          {errors.confirmPassword && (
            <span className="text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {error && <div className="text-red-500">{error}</div>}
        {message && <div className="text-green-600">{message}</div>}

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded"
        >
          Đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
}
