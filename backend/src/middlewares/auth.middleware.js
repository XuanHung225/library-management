const { verify } = require("../../utils/jwt");
const db = require("../config/db");

module.exports = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = verify(token);
    // Check user active status in DB to prevent access for deactivated accounts
    const [rows] = await db.query("SELECT is_active FROM users WHERE id = ?", [
      payload.id,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Unauthorized" });
    const userRecord = rows[0];
    if (userRecord.is_active === 0)
      return res.status(403).json({ message: "Account deactivated" });

    req.user = payload;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};
