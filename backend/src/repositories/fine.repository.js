const db = require("../config/db");

const createFine = async (fineData, connection = null) => {
  const query = `
    INSERT INTO fines (user_id, loan_id, amount, reason, is_paid, issued_at)
    VALUES (?, ?, ?, ?, 0, NOW())
  `;
  const params = [
    fineData.user_id,
    fineData.loan_id,
    fineData.amount,
    fineData.reason,
  ];

  // Nếu có connection (từ transaction) thì dùng, không thì dùng pool mặc định
  const dbExecutor = connection || db;
  await dbExecutor.query(query, params);
};

const getMyFines = async (user_id) => {
  const [rows] = await db.query(
    `SELECT id, loan_id, amount, reason, is_paid, issued_at, paid_at 
     FROM fines 
     WHERE user_id = ? AND deleted_at IS NULL`,
    [user_id],
  );
  return rows;
};

const getAllFines = async () => {
  const [rows] = await db.query(
    `SELECT f.id, f.loan_id, f.user_id, f.amount, f.reason, f.is_paid, f.issued_at, f.paid_at, u.username, u.full_name 
     FROM fines f 
     LEFT JOIN users u ON f.user_id = u.id 
     WHERE f.deleted_at IS NULL 
     ORDER BY f.issued_at DESC`,
  );
  return rows;
};

const markAsPaid = async (fine_id) => {
  const [result] = await db.query(
    "UPDATE fines SET is_paid = 1, paid_at = NOW() WHERE id = ? AND is_paid = 0",
    [fine_id],
  );
  // Trả về true nếu có dòng được update (tìm thấy và chưa trả), ngược lại false
  return result.affectedRows > 0;
};

module.exports = {
  createFine,
  getMyFines,
  getAllFines,
  markAsPaid,
};
