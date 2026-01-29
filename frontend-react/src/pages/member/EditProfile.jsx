import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import userService from "../../services/user.service";
import AvatarUpload from "./AvatarUpload";

export default function EditProfile() {
  const { user, setUser } = useAuthContext();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    date_of_birth: user?.date_of_birth ? user.date_of_birth.slice(0, 10) : "",
    gender: user?.gender || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await userService.update(user.id, form);

      // cập nhật lại user trong context
      setUser({ ...user, ...form });

      setSuccess("Cập nhật thành công!");
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Chỉnh sửa thông tin cá nhân
      </h2>

      {/* Upload avatar */}
      <AvatarUpload />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Họ và tên</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Ngày sinh</label>
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Giới tính</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Địa chỉ nhà</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
