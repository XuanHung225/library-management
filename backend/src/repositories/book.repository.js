const db = require("../config/db");

// Lấy tất cả sách
const getAllBooks = async () => {
  const [rows] = await db.query(`
    SELECT b.*, c.name AS category_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.deleted_at IS NULL
  `);
  return rows;
};

// Lấy tất cả thể loại
const getAllCategories = async () => {
  const [rows] = await db.query("SELECT id, name FROM categories");
  return rows;
};

// <--- THÊM MỚI: Repository tạo thể loại
const createCategory = async (category) => {
  const query = "INSERT INTO categories (name) VALUES (?)";
  const [result] = await db.query(query, [category.name]);
  return result;
};

// Tạo sách mới
const createBook = async (book) => {
  // Đảm bảo mọi trường đều có giá trị hợp lệ, không undefined
  const query = `
    INSERT INTO books 
    (title, author, isbn, publisher, published_year, total_quantity, available_quantity, category_id, image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Xử lý từng trường
  const title = book.title ? String(book.title) : null;
  const author = book.author ? String(book.author) : null;
  const isbn = book.isbn ? String(book.isbn) : null;
  const publisher = book.publisher ? String(book.publisher) : null;
  const published_year = book.published_year
    ? Number(book.published_year)
    : null;
  const total_quantity =
    book.total_quantity !== undefined && book.total_quantity !== null
      ? Number(book.total_quantity)
      : 0;
  const available_quantity =
    book.available_quantity !== undefined && book.available_quantity !== null
      ? Number(book.available_quantity)
      : total_quantity;
  const category_id =
    book.category_id !== undefined &&
    book.category_id !== null &&
    book.category_id !== ""
      ? Number(book.category_id)
      : null;
  const image = typeof book.image === "string" ? book.image : null;

  const values = [
    title,
    author,
    isbn,
    publisher,
    published_year,
    total_quantity,
    available_quantity,
    category_id,
    image,
  ];

  const [result] = await db.query(query, values);
  return result;
};

const getBookById = async (id) => {
  const [[book]] = await db.query(
    `
    SELECT b.*, c.name AS category_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ? AND b.deleted_at IS NULL
  `,
    [id],
  );
  return book;
};

// Cập nhật sách
const updateBook = async (id, book) => {
  const query = `
    UPDATE books SET
      title = ?,
      author = ?,
      isbn = ?,
      publisher = ?,
      published_year = ?,
      total_quantity = ?,
      available_quantity = ?,
      category_id = ?,
      image = ?
    WHERE id = ? AND deleted_at IS NULL
  `;
  const values = [
    book.title || null,
    book.author || null,
    book.isbn || null,
    book.publisher || null,
    book.published_year ? Number(book.published_year) : null,
    book.total_quantity !== undefined && book.total_quantity !== null
      ? Number(book.total_quantity)
      : 0,
    book.available_quantity !== undefined && book.available_quantity !== null
      ? Number(book.available_quantity)
      : book.total_quantity !== undefined
        ? Number(book.total_quantity)
        : 0,
    book.category_id !== undefined &&
    book.category_id !== null &&
    book.category_id !== ""
      ? Number(book.category_id)
      : null,
    typeof book.image === "string" ? book.image : null,
    id,
  ];
  const [result] = await db.query(query, values);
  return result;
};

// Xóa mềm sách
const deleteBook = async (id) => {
  const [result] = await db.query(
    "UPDATE books SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id],
  );
  return result;
};
// Lấy chi tiết sách theo id

module.exports = {
  getAllBooks,
  createBook,
  getAllCategories,
  getBookById,
  updateBook,
  deleteBook,
  createCategory,
};
