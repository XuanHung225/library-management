const bookRepository = require("../repositories/book.repository");

const getAllBooks = async () => {
  return await bookRepository.getAllBooks();
};

const createBook = async (book) => {
  // Business logic: kiểm tra dữ liệu, validate, ...
  // (Có thể bổ sung validate bằng Joi ở đây nếu muốn)
  return await bookRepository.createBook(book);
};

const getAllCategories = async () => {
  return await bookRepository.getAllCategories();
};

const createCategory = async (category) => {
  // Có thể check trùng tên ở đây nếu cần logic phức tạp
  return await bookRepository.createCategory(category);
};

const getBookById = async (id) => {
  return await bookRepository.getBookById(id);
};

const updateBook = async (id, book) => {
  return await bookRepository.updateBook(id, book);
};

const deleteBook = async (id) => {
  return await bookRepository.deleteBook(id);
};

module.exports = {
  getAllBooks,
  createBook,
  getAllCategories,
  getBookById,
  updateBook,
  deleteBook,
  createCategory,
};
