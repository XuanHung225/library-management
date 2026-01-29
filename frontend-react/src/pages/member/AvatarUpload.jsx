import { useState, useRef } from "react";
import { useAuthContext } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { getAvatarUrl } from "../../utils/getAvatarUrl";
export default function AvatarUpload() {
  const { user, setUser } = useAuthContext();

  const [preview, setPreview] = useState(null); // chỉ dùng cho ảnh mới
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Chỉ hỗ trợ ảnh jpg, png, webp");
      return;
    }

    if (f.size > 2 * 1024 * 1024) {
      setError("Dung lượng tối đa 2MB");
      return;
    }

    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f)); // chỉ set khi chọn ảnh mới
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Vui lòng chọn ảnh");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axiosInstance.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // cập nhật avatar mới vào context
      setUser({ ...user, avatar_url: res.data.avatar_url });

      setSuccess("Cập nhật avatar thành công!");
      setFile(null);
      setPreview(null); // reset preview sau khi lưu
    } catch (err) {
      setError(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ưu tiên preview nếu có, không thì avatar từ user
  const avatarSrc =
    preview || getAvatarUrl(user?.avatar_url) || "/default-avatar.png";

  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="mb-4">
        <img
          src={avatarSrc}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
      </div>

      <form
        onSubmit={handleUpload}
        className="flex flex-col items-center gap-2"
      >
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold"
        >
          Chọn ảnh
        </button>

        {file && <span className="text-xs text-gray-500">{file.name}</span>}

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu avatar"}
        </button>
      </form>
    </div>
  );
}
