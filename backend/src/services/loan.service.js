const db = require("../config/db");
const loanRepository = require("../repositories/loan.repository");
const fineRepository = require("../repositories/fine.repository");
const logService = require("./log.service");

const FINE_PER_DAY = 5000; // 5.000 VNĐ một ngày

const createLoan = async (user_id, book_id, due_date, note) => {
  note = note?.trim() || null;

  // 1. Kiểm tra số lượng sách còn
  const [bookRows] = await db.query(
    "SELECT available_quantity FROM books WHERE id = ? AND deleted_at IS NULL",
    [book_id],
  );
  if (!bookRows || bookRows.length === 0) {
    throw new Error("Sách không tồn tại");
  }
  if (bookRows[0].available_quantity <= 0) {
    throw new Error("Sách đã hết");
  }

  // 2. Giới hạn mượn của user
  const [loanCountRows] = await db.query(
    `SELECT COUNT(*) AS cnt
     FROM loans
     WHERE user_id = ?
       AND status IN ('pending','approved','borrowed')
       AND deleted_at IS NULL`,
    [user_id],
  );
  if (loanCountRows[0].cnt >= 5) {
    throw new Error("Bạn đã đạt giới hạn số sách có thể mượn");
  }

  // 3. Kiểm tra trùng sách
  const [dupRows] = await db.query(
    `SELECT id
     FROM loans
     WHERE user_id = ?
       AND book_id = ?
       AND status IN ('pending','approved','borrowed')
       AND deleted_at IS NULL`,
    [user_id, book_id],
  );
  if (dupRows.length > 0) {
    throw new Error("Bạn đã có yêu cầu mượn hoặc đang mượn sách này");
  }

  // 4. Tạo phiếu mượn
  await loanRepository.createLoan(user_id, book_id, due_date, "pending", note);

  await logService.logAction({
    user_id,
    action: "create_loan",
    entity: "loan",
    entity_id: null,
    detail: `Yêu cầu mượn sách book_id=${book_id}, due_date=${due_date}, note=${note || "N/A"}`,
  });
};

const returnBook = async (loan_id, user) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const loan = await loanRepository.getLoanById(loan_id);
    if (!loan) throw new Error("Loan not found");
    if (loan.status === "returned")
      throw new Error("Sách đã được trả trước đó");

    // --- LOGIC SO SÁNH NGÀY CHUẨN HÓA ---
    const now = new Date();
    const dueDate = new Date(loan.due_date);

    // Đưa về 0h sáng của ngày tương ứng
    const compareNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const compareDue = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
    );

    let fineMessage = null;

    // Chỉ tính phạt nếu NGÀY HIỆN TẠI > NGÀY HẠN TRẢ
    if (compareNow > compareDue) {
      const diffTime = compareNow - compareDue;
      // Vì đã đưa về 0h, diffTime luôn là bội số của 24h. Dùng floor cho chắc chắn.
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        const amount = diffDays * FINE_PER_DAY;
        const reason = `Quá hạn ${diffDays} ngày (Hạn trả: ${dueDate.toLocaleDateString("vi-VN")})`;

        await fineRepository.createFine(
          {
            user_id: loan.user_id,
            loan_id: loan.id,
            amount: amount,
            reason: reason,
          },
          connection,
        );

        fineMessage = `Có phát sinh phạt: ${amount.toLocaleString()} VNĐ (${diffDays} ngày)`;
      }
    }

    // 4. Cập nhật trạng thái Loan -> Returned
    await connection.query(
      `UPDATE loans SET status = 'returned', return_date = NOW() WHERE id = ?`,
      [loan_id],
    );

    // 5. Cộng lại số lượng sách (+1)
    await connection.query(
      `UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?`,
      [loan.book_id],
    );

    // 6. Ghi log
    await logService.logAction({
      user_id: user && user.id,
      action: "return_book",
      entity: "loan",
      entity_id: loan_id,
      detail: `Trả sách ID=${loan.book_id}. ${fineMessage || "Không quá hạn"}`,
    });

    await connection.commit();

    return {
      message: "Trả sách thành công",
      warning: fineMessage, // Trả về warning để frontend hiển thị alert
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllLoans = async () => {
  const loans = await loanRepository.getAllLoans();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return loans.map((loan) => {
    const dueDate = loan.due_date ? new Date(loan.due_date) : null;
    if (dueDate) dueDate.setHours(0, 0, 0, 0);

    return {
      ...loan,
      status_display:
        loan.status === "borrowed" && dueDate && dueDate < now
          ? "quá hạn"
          : loan.status,
    };
  });
};

const getUserLoans = async (user_id) => {
  const loans = await loanRepository.getUserLoans(user_id);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return loans.map((loan) => {
    const dueDate = loan.due_date ? new Date(loan.due_date) : null;
    if (dueDate) dueDate.setHours(0, 0, 0, 0);

    const isOverdue = loan.status === "borrowed" && dueDate && dueDate < now;

    return {
      ...loan,
      status_display: isOverdue ? "quá hạn" : loan.status,
    };
  });
};

const getLoanById = async (loan_id) => {
  return await loanRepository.getLoanById(loan_id);
};

const confirmPickup = async (loan_id, note) => {
  const loan = await loanRepository.getLoanById(loan_id);
  if (!loan) throw new Error("Phiếu mượn không tồn tại");
  if (loan.status !== "approved") {
    throw new Error("Phiếu mượn chưa được duyệt hoặc trạng thái không hợp lệ");
  }

  await loanRepository.confirmLoanPickup(loan_id, note);

  await logService.logAction({
    user_id: loan.user_id,
    action: "confirm_pickup",
    entity: "loan",
    entity_id: loan_id,
    detail: `Đã nhận sách, bắt đầu tính thời gian mượn. Ghi chú: ${note}`,
  });

  return true;
};

// Đánh dấu phiếu mượn là mất sách
const markBookAsLost = async (loan_id, note, user) => {
  // Lấy thông tin phiếu mượn
  const loan = await loanRepository.getLoanById(loan_id);
  if (!loan) throw new Error("Loan not found");
  if (loan.status === "lost") throw new Error("Loan already marked as lost");
  // Chỉ cho phép admin/librarian hoặc chính user xác nhận (nếu cần)
  // (Đã kiểm tra quyền ở middleware route)
  await loanRepository.updateLoanStatusAndNote(loan_id, "lost", note || "");
  await fineRepository.createFine({
    user_id: loan.user_id,
    loan_id,
    amount: 100000,
    reason: "Mất sách",
  });
  await logService.logAction({
    user_id: user?.id || loan.user_id,
    action: "mark_lost",
    entity: "loan",
    entity_id: loan_id,
    detail: `Đánh dấu mất sách, phạt 100000. Ghi chú: ${note || ""}`,
  });
  return true;
};

// Từ chối phiếu mượn nếu không đến nhận sách quá hạn
const rejectIfNotPickedUp = async (loan_id, user) => {
  const loan = await loanRepository.getLoanById(loan_id);
  if (!loan) throw new Error("Loan not found");
  if (loan.status !== "approved")
    throw new Error("Chỉ phiếu mượn ở trạng thái 'approved' mới được từ chối.");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(loan.due_date);
  dueDate.setHours(0, 0, 0, 0);
  if (today <= dueDate)
    throw new Error("Chỉ được từ chối khi đã quá hạn trả dự kiến.");
  await loanRepository.updateLoanStatusAndNote(
    loan_id,
    "rejected",
    (loan.note || "") + " | Từ chối do không đến nhận sách đúng hạn",
  );
  await logService.logAction({
    user_id: user?.id || loan.user_id,
    action: "reject_not_picked_up",
    entity: "loan",
    entity_id: loan_id,
    detail: `Từ chối phiếu mượn do không đến nhận sách đúng hạn.`,
  });
  return true;
};

module.exports = {
  createLoan,
  returnBook,
  getAllLoans,
  getUserLoans,
  getLoanById,
  confirmPickup,
  markBookAsLost,
  rejectIfNotPickedUp,
};
