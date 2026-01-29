const db = require("../src/config/db");
const bcrypt = require("bcryptjs");

async function main() {
  console.log("Starting password hashing migration...");
  const [rows] = await db.query("SELECT id, username, password FROM users");
  let updated = 0;
  for (const u of rows) {
    const pwd = u.password || "";
    if (typeof pwd !== "string") continue;
    // naive check for bcrypt hash
    if (pwd.startsWith("$2")) continue;

    const hashed = await bcrypt.hash(pwd, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      u.id,
    ]);
    console.log(`Hashed password for ${u.username} (id=${u.id})`);
    updated++;
  }

  console.log(`Migration complete. Updated ${updated} users.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
