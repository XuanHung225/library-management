const router = require("express").Router();
const db = require("../config/db");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/admin", auth, role("admin"), async (req, res) => {
  try {
    const [
      [userTotal], // Tổng người dùng
      [bookStats], // Tổng số cuốn sách
      [lostStats], // Số sách bị mất
      [fineStats], // Tổng tiền phạt
      [userByRole], // (Dữ liệu bổ trợ cho biểu đồ/danh sách)
      [topBooks], // Top sách
      [topBorrowers], // Top người mượn
      [trendStats], // Xu hướng 7 ngày
    ] = await Promise.all([
      // 1. Tổng người dùng
      db.query(`SELECT COUNT(*) AS total FROM users`),

      // 2. Tổng số sách (tổng số bản sao hiện có)
      db.query(
        `SELECT SUM(total_quantity) AS totalBooks FROM books WHERE deleted_at IS NULL`,
      ),

      // 3. Số sách bị mất (tính từ bảng loans có trạng thái 'lost')
      db.query(`SELECT COUNT(*) AS lostBooks FROM loans WHERE status = 'lost'`),

      // 4. Tổng tiền phạt
      db.query(`
        SELECT 
          IFNULL(SUM(amount), 0) AS totalFines,
          IFNULL(SUM(CASE WHEN is_paid = 1 THEN amount ELSE 0 END), 0) AS collected,
          IFNULL(SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END), 0) AS pending
        FROM fines
      `),

      // Các query bổ trợ giữ lại để không làm lỗi giao diện phần dưới
      db.query(
        `SELECT r.name, COUNT(*) AS count FROM users u JOIN roles r ON u.role_id = r.id GROUP BY role_id`,
      ),
      db.query(
        `SELECT b.title, COUNT(l.id) AS count FROM loans l JOIN books b ON l.book_id = b.id GROUP BY b.id ORDER BY count DESC LIMIT 5`,
      ),
      db.query(
        `SELECT u.full_name, COUNT(l.id) AS count FROM loans l JOIN users u ON l.user_id = u.id GROUP BY u.id ORDER BY count DESC LIMIT 5`,
      ),
      db.query(
        `SELECT DATE_FORMAT(loan_date, '%d/%m') AS date, COUNT(*) AS count FROM loans WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY date ORDER BY STR_TO_DATE(date, '%d/%m')`,
      ),
    ]);

    res.json({
      overview: {
        totalUsers: userTotal[0].total,
        totalBooks: bookStats[0].totalBooks || 0,
        lostBooks: lostStats[0].lostBooks || 0,
        totalFines: fineStats[0].totalFines,
      },
      fines: {
        collected: fineStats[0].collected,
        pending: fineStats[0].pending,
      },
      users: {
        byRole: userByRole,
        topBorrowers,
      },
      books: {
        topBooks,
      },
      activity: {
        trends: trendStats,
      },
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Lỗi thống kê admin" });
  }
});

router.get("/librarian", auth, role("librarian", "admin"), async (req, res) => {
  try {
    const [
      [bookStats],
      [loanStats],
      [overdueStats],
      [todayStats],
      [dueSoonStats],
      [pendingStats],
      [lostStats],
      [topBooks],
      [trendStats],
      [monthlyStats],
    ] = await Promise.all([
      // Tổng sách & đầu sách
      db.query(`
SELECT 
  COUNT(*) AS totalTitles,
  SUM(total_quantity) AS totalBooks
FROM books
WHERE deleted_at IS NULL;

      `),

      // Sách đang mượn
      db.query(`
        SELECT COUNT(*) AS totalLoans
        FROM loans
        WHERE return_date IS NULL AND status = 'borrowed'
      `),

      // Quá hạn
      db.query(`
SELECT COUNT(*) AS overdueLoans
FROM loans
WHERE status = 'borrowed'
  AND return_date IS NULL
  -- Cộng thêm 1 ngày vào due_date và so sánh với ngày hiện tại (bỏ qua giờ)
  AND DATE_ADD(DATE(due_date), INTERVAL 1 DAY) <= DATE(NOW());
      `),

      // Mượn hôm nay
      db.query(`
        SELECT COUNT(*) AS todayLoans
        FROM loans
        WHERE DATE(loan_date) = CURDATE()
      `),

      // Sắp quá hạn (3 ngày)
      db.query(`
        SELECT COUNT(*) AS dueSoonLoans
        FROM loans
        WHERE return_date IS NULL
          AND DATE_ADD(DATE(due_date), INTERVAL 1 DAY) BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
          AND status = 'borrowed'
      `),

      // Số lượng phiếu mượn chờ duyệt
      db.query(`
SELECT COUNT(*) AS pendingLoans
        FROM loans
        WHERE status = 'pending' AND deleted_at IS NULL
      `),

      db.query(`
        SELECT COUNT(*) AS lostBooks
        FROM loans
        WHERE status = 'lost'
      `),

      // Top 5 sách mượn nhiều
      db.query(`
        SELECT b.title, COUNT(l.id) AS count
        FROM loans l
        JOIN books b ON l.book_id = b.id
        GROUP BY b.id
        ORDER BY count DESC
        LIMIT 5
      `),

      // Xu hướng 7 ngày
      db.query(`
        SELECT 
          DATE_FORMAT(loan_date, '%d/%m') AS date,
          COUNT(*) AS count
        FROM loans
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY date
        ORDER BY STR_TO_DATE(date, '%d/%m')
      `),

      // Mượn theo tháng
      db.query(`
        SELECT 
          DATE_FORMAT(loan_date, '%m/%Y') AS month,
          COUNT(*) AS count
        FROM loans
        WHERE loan_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND (status = 'borrowed' OR status = 'returned')
        GROUP BY month
        ORDER BY STR_TO_DATE(month, '%m/%Y')
      `),
    ]);

    res.json({
      overview: {
        totalTitles: bookStats[0].totalTitles,
        totalBooks: bookStats[0].totalBooks,
        totalLoans: loanStats[0].totalLoans,
        todayLoans: todayStats[0].todayLoans,
        overdueLoans: overdueStats[0].overdueLoans,
        dueSoonLoans: dueSoonStats[0].dueSoonLoans,
        pendingLoans: pendingStats[0].pendingLoans,
        lostBooks: lostStats[0].lostBooks || 0,
      },
      books: {
        topBooks,
      },
      activity: {
        trends: trendStats,
        monthlyLoans: monthlyStats,
      },
    });
  } catch (err) {
    console.error("Librarian Stats Error:", err);
    res.status(500).json({ message: "Lỗi thống kê librarian" });
  }
});

module.exports = router;
