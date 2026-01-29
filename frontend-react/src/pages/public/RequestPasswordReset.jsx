import { useForm } from "react-hook-form";
import { useState } from "react";
import authService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

export default function RequestPasswordReset() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError("");
    setMessage("");
    try {
      const res = await authService.requestPasswordReset(data);
      setMessage(res.data.message);

      // Chuyển sang trang reset password sau khi gửi OTP
      setTimeout(() => {
        navigate("/reset-password", {
          state: { username: data.username },
        });
      }, 1000); // đợi 1 chút cho user thấy thông báo
    } catch (err) {
      setError(err.response?.data?.message || "Gửi OTP thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-surface-dark p-4 md:p-8 rounded shadow mt-8 md:mt-16 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Quên mật khẩu</h2>
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
        {error && <div className="text-red-500">{error}</div>}
        {message && <div className="text-green-600">{message}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded"
        >
          Gửi mã OTP
        </button>
      </form>
    </div>
  );
}
