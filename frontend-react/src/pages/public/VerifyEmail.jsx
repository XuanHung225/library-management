import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

export default function VerifyEmail() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const pendingVerify = localStorage.getItem("pendingVerify");
    if (!pendingVerify) {
      navigate("/register"); // hoặc /login
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setError("");
    setMessage("");
    try {
      const res = await authService.verifyEmail(data);
      setMessage(res.data.message);

      localStorage.removeItem("pendingVerify");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Xác thực thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-surface-dark p-4 md:p-8 rounded shadow mt-8 md:mt-16 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">Xác thực email</h2>

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
          <label className="block mb-1">Mã xác thực (OTP)</label>
          <input
            type="text"
            {...register("code", {
              required: true,
              minLength: 6,
              maxLength: 6,
            })}
            className="w-full border p-2 rounded"
          />
          {errors.code && (
            <span className="text-red-500">Mã xác thực gồm 6 số</span>
          )}
        </div>

        {error && <div className="text-red-500">{error}</div>}
        {message && <div className="text-green-600">{message}</div>}

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded"
        >
          Xác thực
        </button>
      </form>
    </div>
  );
}
