const bookService = require("../services/book.service");
const Joi = require("joi");

// Cập nhật Schema: Thêm trường image
const bookSchema = Joi.object({
  title: Joi.string().max(500).required(),
  author: Joi.string().max(255).allow(null, ""),
  isbn: Joi.string().max(50).allow(null, ""),
  publisher: Joi.string().max(255).allow(null, ""),
  published_year: Joi.number().integer().min(1000).max(9999).allow(null),
  total_quantity: Joi.number().integer().min(0).default(0),
  category_id: Joi.number().integer().allow(null),
  image: Joi.any(), // THAY ĐỔI: Dùng Joi.any() để chấp nhận cả file object lúc validate body
});

exports.create = async (req, res) => {
  try {
    let bookData = { ...req.body };

    // Đảm bảo category_id là số hoặc null (tránh chuỗi rỗng "")
    if (bookData.category_id === "" || bookData.category_id === "null") {
      bookData.category_id = null;
    } else if (bookData.category_id) {
      bookData.category_id = Number(bookData.category_id);
    }

    if (req.file) {
      bookData.image = `/uploads/books/${req.file.filename}`;
    }

    const { error, value } = bookSchema.validate(bookData);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Đảm bảo available_quantity luôn có giá trị (không undefined)
    const finalData = {
      ...value,
      available_quantity: value.total_quantity || 0, // Gán bằng total_quantity khi tạo mới
      image: bookData.image || null,
    };

    await bookService.createBook(finalData);
    res.json({ message: "Book created successfully", data: finalData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const book = await bookService.getBookById(id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách thể loại sách
exports.getCategories = async (req, res) => {
  try {
    const categories = await bookService.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật sách
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const bookData = req.body;
    // Nếu có file upload mới
    if (req.file) {
      bookData.image = `/uploads/books/${req.file.filename}`;
    }
    await bookService.updateBook(id, bookData);
    res.json({ message: "Cập nhật sách thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa sách
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await bookService.deleteBook(id);
    res.json({ message: "Đã xóa sách" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate cơ bản
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Tên thể loại không được để trống" });
    }

    await bookService.createCategory({ name });
    res.json({ message: "Tạo thể loại thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
