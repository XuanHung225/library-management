import axiosInstance from "../api/axiosInstance";

const bookService = {
  getBooks: (query = "") =>
    query
      ? axiosInstance.get(`/books?search=${query}`).then((res) => res.data)
      : axiosInstance.get("/books").then((res) => res.data),
  getBookById: (id) =>
    axiosInstance.get(`/books/${id}`).then((res) => res.data),
  createBook: (data) => axiosInstance.post("/books", data),
  updateBook: (id, data) => axiosInstance.put(`/books/${id}`, data),
  deleteBook: (id) => axiosInstance.delete(`/books/${id}`),
  getCategories: () =>
    axiosInstance.get("/books/categories").then((res) => res.data),
  // <--- THÊM MỚI: Hàm tạo thể loại
  createCategory: (data) => axiosInstance.post("/books/categories", data),
  uploadBookImage: (formData) =>
    axiosInstance.post("/books/upload-image", formData),
};

export default bookService;
