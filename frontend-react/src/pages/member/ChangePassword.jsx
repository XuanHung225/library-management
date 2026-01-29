import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setError("");
    setMessage("");

    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    try {
      const res = await authService.changePassword(payload);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-surface-dark p-4 md:p-8 rounded shadow mt-8 md:mt-16 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Đổi mật khẩu</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            {...register("currentPassword", { required: "Bắt buộc" })}
            className="w-full border p-2 rounded"
          />
          {errors.currentPassword && (
            <span className="text-red-500">
              {errors.currentPassword.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1">Mật khẩu mới</label>
          <input
            type="password"
            {...register("newPassword", {
              required: "Bắt buộc",
              minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
            })}
            className="w-full border p-2 rounded"
          />
          {errors.newPassword && (
            <span className="text-red-500">{errors.newPassword.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Nhập lại mật khẩu mới</label>
          <input
            type="password"
            {...register("confirmPassword", {
              validate: (value) =>
                value === watch("newPassword") || "Mật khẩu không khớp",
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
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}
