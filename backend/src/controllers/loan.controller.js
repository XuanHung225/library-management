const Joi = require("joi");
const loanSchema = Joi.object({
  book_id: Joi.number().integer().required(),
  due_date: Joi.date().iso().required(),
  note: Joi.string().max(1000).allow(null, ""),
});

const loanService = require("../services/loan.service");

/**
 * Tạo phiếu mượn
 */
exports.createLoan = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { error, value } = loanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { book_id, due_date, note } = value;

    await loanService.createLoan(user_id, book_id, due_date, note);

    return res.status(201).json({
      message: "Loan created successfully",
    });
  } catch (err) {
    // Lỗi nghiệp vụ
    if (err.message.includes("Sách") || err.message.includes("mượn")) {
      return res.status(422).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * Trả sách + tính phạt
 */
exports.returnBook = async (req, res) => {
  try {
    const { loan_id } = req.body;
    const user = req.user;

    // Nhận kết quả từ service
    const result = await loanService.returnBook(loan_id, user);

    res.json({
      message: result.message,
      warning: result.fine, // Frontend có thể hiển thị popup nếu có warning
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Xem danh sách loan
 */
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await loanService.getAllLoans();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyLoans = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const loans = await loanService.getUserLoans(userId);
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.approveOrRejectLoan = async (req, res) => {
  try {
    const { loan_id } = req.params;
    const { action, note } = req.body; // action: 'approve' | 'reject'
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }
    const loan = await require("../services/loan.service").getLoanById(loan_id);
    if (!loan)
      return res.status(404).json({ message: "Phiếu mượn không tồn tại" });
    if (loan.status !== "pending")
      return res
        .status(400)
        .json({ message: "Chỉ xử lý phiếu mượn chờ duyệt" });
    // Nếu duyệt, kiểm tra lại số lượng sách
    if (action === "approve") {
      const [bookRows] = await require("../config/db").query(
        "SELECT available_quantity FROM books WHERE id = ?",
        [loan.book_id],
      );
      if (
        !bookRows ||
        bookRows.length === 0 ||
        bookRows[0].available_quantity <= 0
      ) {
        return res
          .status(400)
          .json({ message: "Sách đã hết, không thể duyệt" });
      }
      await require("../repositories/loan.repository").updateLoanStatusAndNote(
        loan_id,
        "approved",
        note,
      );
      await require("../repositories/loan.repository").updateBookQuantity(
        loan.book_id,
        -1,
      );
    } else {
      await require("../repositories/loan.repository").updateLoanStatusAndNote(
        loan_id,
        "rejected",
        note,
      );
    }
    res.json({
      message:
        action === "approve" ? "Đã duyệt phiếu mượn" : "Đã từ chối phiếu mượn",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmPickup = async (req, res) => {
  try {
    const { loan_id } = req.params;
    const { note } = req.body;

    // SỬA: Gọi qua Service để xử lý logic
    await loanService.confirmPickup(loan_id, note);

    res.json({
      message: "Đã xác nhận nhận sách, chuyển sang trạng thái đang mượn",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Xóa yêu cầu mượn sách (chỉ cho phép xóa khi trạng thái là 'pending')
 */
exports.deleteLoanRequest = async (req, res) => {
  try {
    const { loan_id } = req.params;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const loan = await require("../services/loan.service").getLoanById(loan_id);
    if (!loan)
      return res.status(404).json({ message: "Phiếu mượn không tồn tại" });
    if (loan.user_id !== userId)
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa phiếu mượn này" });
    if (loan.status !== "pending" && loan.status !== "rejected")
      return res
        .status(400)
        .json({
          message:
            "Chỉ được xóa phiếu mượn ở trạng thái chờ duyệt hoặc từ chối",
        });
    await require("../repositories/loan.repository").deleteLoan(loan_id);
    res.json({ message: "Đã xóa yêu cầu mượn sách" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Đánh dấu phiếu mượn là mất sách
 * PUT /loans/:loan_id/lost
 * Chỉ thủ thư hoặc admin được phép
 */
exports.markBookAsLost = async (req, res) => {
  try {
    const { loan_id } = req.params;
    const { note } = req.body;
    await loanService.markBookAsLost(loan_id, note, req.user);
    res.json({ message: "Đã cập nhật trạng thái mất sách", fine: 100000 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Từ chối phiếu mượn nếu không đến nhận sách quá hạn
 * PUT /loans/:loan_id/reject-if-not-picked-up
 * Chỉ thủ thư hoặc admin được phép
 */
exports.rejectIfNotPickedUp = async (req, res) => {
  try {
    const { loan_id } = req.params;
    await loanService.rejectIfNotPickedUp(loan_id, req.user);
    res.json({
      message:
        "Đã chuyển phiếu mượn sang trạng thái 'rejected' do không đến nhận sách đúng hạn.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
