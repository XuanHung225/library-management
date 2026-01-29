import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { getAvatarUrl } from "../../utils/getAvatarUrl";
import { Mail, Phone, MapPin, Calendar, User } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuthContext();
  const basePath = user?.role === "librarian" ? "/librarian" : "/member";

  // --- Hàm xử lý định dạng ngày tháng ---
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    // Kiểm tra xem ngày có hợp lệ không
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- Hàm xử lý hiển thị giới tính ---
  const formatGender = (gender) => {
    if (!gender) return "Chưa xác định";
    // Chuyển về chữ thường để so sánh cho chính xác
    const g = String(gender).toLowerCase();

    if (["male", "nam", "m", "trai"].includes(g)) return "Nam";
    if (["female", "nu", "nữ", "f", "gai"].includes(g)) return "Nữ";
    return "Khác";
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 mb-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

        <div className="relative px-8 pb-8">
          {/* Avatar & Action Button */}
          <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 mb-6 gap-4">
            <div className="relative mx-auto sm:mx-0">
              <img
                src={getAvatarUrl(user?.avatar_url)}
                alt="Avatar"
                className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-md bg-white"
              />
              {/* Online status indicator */}
              <span
                className="absolute bottom-2 right-2 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-white"
                title="Đang hoạt động"
              ></span>
            </div>

            <div className="text-center sm:text-right mb-2">
              <Link
                to={`${basePath}/edit-profile`}
                className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-all shadow hover:shadow-lg"
              >
                Chỉnh sửa hồ sơ
              </Link>
            </div>
          </div>

          {/* User Basic Info */}
          <div className="text-center sm:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {user?.full_name || user?.username}
            </h2>
            <p className="text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wide">
                @{user?.username}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                {user?.role === "librarian" ? "Thủ thư" : "Thành viên"}
              </span>
            </p>
          </div>

          <div className="h-px bg-gray-100 w-full mb-8"></div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <InfoItem
              icon={<Mail size={20} className="text-blue-600" />}
              label="Email"
              value={user?.email}
            />
            <InfoItem
              icon={<Phone size={20} className="text-blue-600" />}
              label="Số điện thoại"
              value={user?.phone || "Chưa cập nhật"}
            />
            <InfoItem
              icon={<User size={20} className="text-blue-600" />}
              label="Giới tính"
              value={formatGender(user?.gender)}
            />
            <InfoItem
              icon={<Calendar size={20} className="text-blue-600" />}
              label="Ngày sinh"
              value={formatDate(user?.date_of_birth)}
            />
            <InfoItem
              icon={<MapPin size={20} className="text-blue-600" />}
              label="Địa chỉ"
              value={user?.address || "Chưa có thông tin"}
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component hiển thị từng dòng thông tin
function InfoItem({ icon, label, value, fullWidth = false }) {
  return (
    <div
      className={`flex items-start gap-4 ${fullWidth ? "md:col-span-2" : ""} group`}
    >
      <div className="flex-shrink-0 p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-gray-800 font-medium text-base break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
