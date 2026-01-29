const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loan.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

// Authenticated endpoints
router.post("/", auth, loanController.createLoan);
router.put("/return", auth, loanController.returnBook); // PUT /return expects { loan_id } in body
// Only librarians and admins can list all loans
router.get("/", auth, role("admin", "librarian"), loanController.getAllLoans);
router.get("/my", auth, loanController.getMyLoans);
router.put(
  "/:loan_id/approve",
  auth,
  role("librarian", "admin"),
  require("../controllers/loan.controller").approveOrRejectLoan,
);
router.put(
  "/:loan_id/confirm-pickup",
  auth,
  role("librarian", "admin"),
  require("../controllers/loan.controller").confirmPickup,
);
// Xóa yêu cầu mượn sách (chỉ user xóa được phiếu của mình, trạng thái pending)
router.delete("/:loan_id", auth, loanController.deleteLoanRequest);
// Đánh dấu mất sách (chỉ thủ thư hoặc admin)
router.put(
  "/:loan_id/lost",
  auth,
  role("librarian", "admin"),
  loanController.markBookAsLost,
);
// Từ chối phiếu mượn nếu không đến nhận sách quá hạn
router.put(
  "/:loan_id/reject-if-not-picked-up",
  auth,
  role("librarian", "admin"),
  loanController.rejectIfNotPickedUp,
);

module.exports = router;
