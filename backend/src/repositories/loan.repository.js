const db = require("../config/db");

/**
 * User tạo yêu cầu mượn sách
 * ❗ KHÔNG set loan_date ở đây
 */
const createLoan = async (
  user_id,
  book_id,
  due_date,
  status = "pending",
  note,
) => {
  await db.query(
    `INSERT INTO loans (user_id, book_id, loan_date, due_date, status, note)
     VALUES (?, ?, NULL, ?, ?, ?)`,
    [user_id, book_id, due_date, status, note],
  );
};

/**
 * Cập nhật số lượng sách (+1 hoặc -1)
 */
const updateBookQuantity = async (book_id, delta) => {
  await db.query(
    `UPDATE books 
     SET available_quantity = available_quantity + ?
     WHERE id = ? AND deleted_at IS NULL`,
    [delta, book_id],
  );
};

/**
 * Lấy 1 phiếu mượn theo ID
 */
const getLoanById = async (loan_id) => {
  const [[loan]] = await db.query(
    `SELECT * FROM loans WHERE id = ? AND deleted_at IS NULL`,
    [loan_id],
  );
  return loan;
};

/**
 * Cập nhật trạng thái phiếu mượn
 * ❗ CHỈ set return_date khi status = returned
 */
const updateLoanStatus = async (loan_id, status) => {
  if (status === "returned") {
    await db.query(
      `UPDATE loans
       SET status = ?, return_date = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [status, loan_id],
    );
  } else {
    await db.query(
      `UPDATE loans
       SET status = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [status, loan_id],
    );
  }
};

/**
 * Admin xác nhận user đã nhận sách
 * 👉 ĐÂY là lúc set loan_date
 */
const confirmLoanPickup = async (loan_id, note) => {
  await db.query(
    `UPDATE loans
     SET 
       status = 'borrowed',
       note = ?,
       loan_date = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    [note, loan_id],
  );
};

/**
 * Admin cập nhật trạng thái + ghi chú
 */
const updateLoanStatusAndNote = async (loan_id, status, note) => {
  await db.query(
    `UPDATE loans
     SET status = ?, note = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [status, note, loan_id],
  );
};

/**
 * Soft delete phiếu mượn
 */
const deleteLoan = async (loan_id) => {
  await db.query(
    `UPDATE loans
     SET deleted_at = NOW()
     WHERE id = ?`,
    [loan_id],
  );
};

/**
 * Lấy tất cả phiếu mượn (admin)
 */
const getAllLoans = async () => {
  const [rows] = await db.query(
    `SELECT 
        l.id AS loan_id,
        l.status,
        l.loan_date,
        l.due_date,
        l.created_at,
        l.note,
        b.title,
        b.author,
        u.id AS user_id,
        u.full_name AS user_name
     FROM loans l
     JOIN books b ON l.book_id = b.id
     JOIN users u ON l.user_id = u.id
     WHERE l.deleted_at IS NULL
     ORDER BY l.created_at DESC`,
  );
  return rows;
};

/**
 * Lấy danh sách phiếu mượn của user
 */
const getUserLoans = async (user_id) => {
  const [rows] = await db.query(
    `SELECT 
        l.id,
        l.created_at,
        l.loan_date,
        l.due_date,
        l.status,
        l.note,
        b.title,
        b.author
     FROM loans l
     JOIN books b ON l.book_id = b.id
     WHERE l.user_id = ? AND l.deleted_at IS NULL
     ORDER BY l.created_at DESC`,
    [user_id],
  );
  return rows;
};

module.exports = {
  createLoan,
  updateBookQuantity,
  getLoanById,
  updateLoanStatus,
  confirmLoanPickup,
  updateLoanStatusAndNote,
  deleteLoan,
  getAllLoans,
  getUserLoans,
};
