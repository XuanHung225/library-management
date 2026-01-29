const db = require("../src/config/db");

async function main() {
  const [cols] = await db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
  );
  const colNames = cols.map((c) => c.COLUMN_NAME);

  const hasIsActive = colNames.includes("is_active");
  const hasRoleId = colNames.includes("role_id");

  let selectCols = [
    "u.id",
    "u.username",
    "u.email",
    "u.password",
    "u.created_at",
  ];
  if (hasIsActive) selectCols.push("u.is_active");
  if (hasRoleId) selectCols.push("r.name AS role");
  else if (colNames.includes("role")) selectCols.push("u.role AS role");

  const sql = `SELECT ${selectCols.join(", ")} FROM users u ${hasRoleId ? "LEFT JOIN roles r ON u.role_id = r.id" : ""} ORDER BY u.id ASC LIMIT 20`;

  const [rows] = await db.query(sql);

  console.log("First users:");
  rows.forEach((r) => {
    const active = hasIsActive ? r.is_active : "(n/a)";
    console.log(
      `id=${r.id} | username=${r.username} | email=${r.email || ""} | role=${r.role || ""} | active=${active} | password=${(r.password || "").slice(0, 6)}...`,
    );
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
