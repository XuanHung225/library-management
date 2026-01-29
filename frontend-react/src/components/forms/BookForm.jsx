import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import bookService from "../../services/book.service";

export default function BookForm({ initialData, onSubmit, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Lấy URL từ biến môi trường (ví dụ: http://localhost:3000)
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      published_year: new Date().getFullYear(),
      total_quantity: 0,
      category_id: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        // Fallback: nếu backend trả về object category thay vì field category_id
        category_id: initialData.category_id || initialData.category?.id,
      });
    }
  }, [initialData, reset]);

  // 1. Tải danh sách thể loại
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await bookService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi tải thể loại:", error);
      }
    };
    fetchCategories();
  }, []);

  // 2. Xử lý hiển thị ảnh Preview
  useEffect(() => {
    if (initialData?.image) {
      // Logic ghép URL thông minh: tránh lặp lại dấu / hoặc /uploads
      const imgUrl = initialData.image.startsWith("http")
        ? initialData.image
        : `${BASE_URL}${initialData.image.startsWith("/") ? "" : "/"}${initialData.image}`;
      setPreviewImage(imgUrl);
    }
  }, [initialData, BASE_URL]);

  // Tìm đoạn useEffect xử lý logic hiển thị ảnh Preview và thay bằng đoạn này:
  const imageFile = watch("image");

  useEffect(() => {
    // Kiểm tra an toàn: imageFile phải tồn tại, có phần tử và phần tử đó phải là File/Blob hợp lệ
    if (imageFile && imageFile.length > 0 && imageFile[0] instanceof Blob) {
      const file = imageFile[0];

      // Tạo URL tạm thời để hiển thị
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setUploadError("");

      // Hàm dọn dẹp để tránh rò rỉ bộ nhớ
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageFile]);

  // 3. Hàm Upload ảnh lên server
  const handleImageUpload = async (fileToUpload) => {
    if (!fileToUpload) return null;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("image", fileToUpload);

      // Lấy token từ LocalStorage để vượt qua middleware auth/role
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");

      // URL ĐÚNG: Cấu trúc theo server.js là /api/books/upload-image
      const res = await fetch(`${BASE_URL}/api/books/upload-image`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(
          "Server không trả về JSON hợp lệ. Kiểm tra lại API URL.",
        );
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Bạn không có quyền upload. Vui lòng đăng nhập lại.");
        }
        throw new Error(data.message || "Upload thất bại");
      }

      setUploading(false);
      return data.image_url; // Trả về chuỗi "/uploads/books/..."
    } catch (err) {
      setUploading(false);
      setUploadError(err.message);
      return null;
    }
  };

  // 4. Xử lý gửi form (Đã sửa)
  const onFormSubmit = async (data) => {
    let finalImageUrl = initialData?.image || "";

    // LOGIC SỬA ĐỔI:
    // Kiểm tra xem data.image có phải là FileList và phần tử đầu tiên có phải là File thực sự không
    const hasNewFile =
      data.image &&
      data.image.length > 0 &&
      (data.image[0] instanceof File || data.image[0] instanceof Blob);

    if (hasNewFile) {
      // Chỉ upload khi người dùng thực sự chọn file mới
      const uploadedPath = await handleImageUpload(data.image[0]);
      if (uploadedPath) {
        finalImageUrl = uploadedPath;
      } else {
        return; // Dừng lại nếu upload lỗi
      }
    }

    // Chuẩn bị dữ liệu gửi đi
    const submitData = {
      ...data,
      image: finalImageUrl, // Dùng đường dẫn mới (nếu có upload) hoặc đường dẫn cũ
      published_year: Number(data.published_year),
      total_quantity: Number(data.total_quantity),
      category_id: Number(data.category_id),
    };

    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-6"
    >
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </h2>
        <span className="text-sm text-gray-500">(*) Thông tin bắt buộc</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* KHU VỰC TẢI ẢNH */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ảnh bìa sách
          </label>
          <div
            className={`relative group border-2 border-dashed rounded-lg overflow-hidden bg-gray-50 hover:border-blue-400 transition-colors h-64 flex items-center justify-center ${uploadError ? "border-red-400" : "border-gray-300"}`}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            ) : (
              <div className="text-center p-4">
                <p className="mt-1 text-xs text-gray-500">Click để chọn ảnh</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {uploadError && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {uploadError}
            </p>
          )}
          {uploading && (
            <p className="text-blue-500 text-xs mt-2 text-center animate-pulse">
              Đang tải ảnh lên...
            </p>
          )}
        </div>

        {/* KHU VỰC NHẬP THÔNG TIN */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sách *
            </label>
            <input
              {...register("title", { required: "Vui lòng nhập tên sách" })}
              className={`w-full border p-2.5 rounded-lg outline-none transition-all ${errors.title ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tác giả *
            </label>
            <input
              {...register("author", { required: "Vui lòng nhập tên tác giả" })}
              className="w-full border border-gray-300 p-2.5 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thể loại *
            </label>
            <select
              {...register("category_id", {
                required: "Vui lòng chọn thể loại",
              })}
              className="w-full border border-gray-300 p-2.5 rounded-lg bg-white"
            >
              <option value="">-- Chọn thể loại --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã ISBN
            </label>
            <input
              {...register("isbn")}
              className="w-full border border-gray-300 p-2.5 rounded-lg"
              placeholder="978-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà xuất bản
            </label>
            <input
              {...register("publisher")}
              className="w-full border border-gray-300 p-2.5 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Năm xuất bản
            </label>
            <input
              type="number"
              {...register("published_year")}
              className="w-full border border-gray-300 p-2.5 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng tổng
            </label>
            <input
              type="number"
              {...register("total_quantity", { min: 0 })}
              className="w-full border border-gray-300 p-2.5 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-8 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md disabled:opacity-50"
        >
          {uploading
            ? "Đang tải ảnh..."
            : initialData
              ? "Cập nhật ngay"
              : "Thêm sách mới"}
        </button>
      </div>
    </form>
  );
}
