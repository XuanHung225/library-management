const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "migrations");

async function main() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  if (!host || !user || !password || !database) {
    throw new Error(
      "Database configuration missing. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your environment.",
    );
  }
  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    // Ensure migrations table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [rows] = await conn.query(
      "SELECT name FROM migrations ORDER BY run_at DESC LIMIT 1",
    );
    if (rows.length === 0) {
      console.log("No applied migrations to rollback.");
      return;
    }

    const lastName = rows[0].name;
    // Look for .down.sql or down_<name>.sql
    const candidates = [
      path.join(MIGRATIONS_DIR, `${lastName}.down.sql`),
      path.join(MIGRATIONS_DIR, `down_${lastName}`),
      path.join(MIGRATIONS_DIR, `down-${lastName}.sql`),
    ];

    const file = candidates.find((f) => fs.existsSync(f));
    if (!file) {
      console.error(
        `Rollback file not found for migration ${lastName}. Expected one of:\n${candidates.join("\n")}`,
      );
      process.exit(1);
    }

    const sql = fs.readFileSync(file, "utf8");

    const dry =
      process.argv.includes("--dry") || process.argv.includes("--preview");
    if (dry) {
      console.log(
        `--- DRY RUN: previewing rollback SQL for ${lastName} (file: ${file}) ---\n`,
      );
      console.log(sql);
      console.log("\n--- END PREVIEW ---");
      process.exit(0);
    }

    console.log(`Applying rollback from ${file}...`);
    await conn.query(sql);
    // remove migration record
    await conn.query("DELETE FROM migrations WHERE name = ?", [lastName]);
    console.log(`Rollback applied and migration record removed: ${lastName}`);
  } catch (err) {
    console.error("Rollback failed:", err.message || err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Error running rollback:", err);
  process.exit(1);
});
