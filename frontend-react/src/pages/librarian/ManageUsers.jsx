import { useEffect, useState } from "react";
import userService from "../../services/user.service";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { useAsync } from "../../hooks/useAsync";
import { useAuthContext } from "../../context/AuthContext";

export default function ManageUsers() {
  const { user: currentUser } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // --- 1. ĐÃ XÓA phone khỏi state khởi tạo ---
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    role: "user",
  });

  const isAdminOrLibrarian =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "librarian");

  const {
    loading,
    error,
    data: users,
    run,
  } = useAsync(userService.getAll, [], false);

  useEffect(() => {
    if (isAdminOrLibrarian) {
      run();
    }
  }, [isAdminOrLibrarian, run]);

  const filteredUsers = users?.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      u.username.toLowerCase().includes(searchLower) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchLower)) ||
      (u.phone && u.phone.includes(searchTerm)) || // Vẫn giữ tìm kiếm theo phone nếu database có sẵn
      (u.email && u.email.toLowerCase().includes(searchLower));

    const matchesTab = activeTab === "all" ? true : u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (currentUser.role === "librarian" && newUser.role !== "user") {
      alert("Thủ thư chỉ được phép tạo tài khoản người dùng!");
      return;
    }
    try {
      await userService.create(newUser);
      alert(`Tạo tài khoản thành công!`);
      setShowAddForm(false);
      // --- 3. RESET state không kèm phone ---
      setNewUser({
        username: "",
        password: "",
        email: "",
        full_name: "",
        role: "user",
      });
      run();
    } catch (err) {
      alert(
        "Lỗi: " + (err.response?.data?.message || "Không thể tạo tài khoản"),
      );
    }
  };

  const handleDelete = async (targetUser) => {
    if (window.confirm(`Xóa người dùng "${targetUser.username}"?`)) {
      try {
        await userService.deleteUser(targetUser.id);
        alert("Xóa thành công!");
        run();
      } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Không thể xóa"));
      }
    }
  };

  const canDelete = (targetUser) => {
    if (currentUser.id === targetUser.id) return false;
    if (targetUser.role === "admin") return false;
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "librarian") return targetUser.role === "user";
    return false;
  };

  if (!isAdminOrLibrarian)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Không có quyền truy cập.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl mt-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">
            Quản lý tài khoản
          </h2>
          <p className="text-gray-500 text-sm">
            Vai trò:{" "}
            <span className="font-bold text-blue-600 uppercase">
              {currentUser.role}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Tìm tên, email, SĐT..."
            className="flex-grow md:w-72 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold"
          >
            {showAddForm ? "Hủy" : "+ Thêm mới"}
          </button>
        </div>
      </div>

      {/* Tabs Phân loại */}
      <div className="flex border-b border-gray-100 mb-8 gap-8">
        {["all", "librarian", "user"].map((id) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`pb-4 text-sm font-bold transition-all relative capitalize ${
              activeTab === id
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {id === "all"
              ? "Tất cả"
              : id === "librarian"
                ? "Thủ thư"
                : "Người dùng"}
            {activeTab === id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Form Thêm Mới - ĐÃ LOẠI BỎ INPUT SỐ ĐIỆN THOẠI */}
      {showAddForm && (
        <div className="mb-10 p-6 border-2 border-blue-50 rounded-2xl bg-blue-50/20">
          <form
            onSubmit={handleCreateUser}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <input
              className="p-3 border rounded-xl"
              placeholder="Họ tên"
              value={newUser.full_name}
              onChange={(e) =>
                setNewUser({ ...newUser, full_name: e.target.value })
              }
              required
            />
            <input
              className="p-3 border rounded-xl"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              required
            />
            <input
              className="p-3 border rounded-xl"
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
            <input
              className="p-3 border rounded-xl"
              type="password"
              placeholder="Mật khẩu"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
            <select
              className="p-3 border rounded-xl bg-white"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              disabled={currentUser.role !== "admin"}
            >
              <option value="user">User</option>
              {currentUser.role === "admin" && (
                <option value="librarian">Librarian</option>
              )}
            </select>
            <div className="lg:col-span-5 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
              >
                Lưu tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <LoadingSpinner />}
      <ErrorMessage message={error} />

      {/* Bảng dữ liệu - Vẫn giữ cột SĐT để hiển thị nếu Database đã có dữ liệu từ trước */}
      {!loading && !error && filteredUsers && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase font-bold border-b border-gray-50">
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Email</th>
                <th className="p-4">SĐT</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-gray-400">
                    Không tìm thấy tài khoản.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="p-4 font-bold text-gray-800">
                      {u.full_name || "---"}
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-sm">
                      {u.username}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{u.email}</td>
                    <td className="p-4 text-gray-600">{u.phone || "---"}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          u.role === "admin"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : u.role === "librarian"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-green-50 text-green-600 border-green-100"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {canDelete(u) && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-gray-300 hover:text-red-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
