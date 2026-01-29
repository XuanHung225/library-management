const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

// Chỉ admin mới xem được log
router.get("/", auth, role("admin"), (req, res) => {
  const logPath = path.join(__dirname, "../../logs/access.log");
  if (!fs.existsSync(logPath)) return res.json([]);
  const lines = fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean);
  // Trả về 200 dòng log mới nhất
  res.json(lines.slice(-200).reverse());
});

module.exports = router;
