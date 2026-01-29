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
  });

  const wantJson = process.argv.includes("--json");

  try {
    // Ensure migrations table exists (same as runner)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [rows] = await conn.query(
      "SELECT name, run_at FROM migrations ORDER BY run_at",
    );
    const applied = new Set(rows.map((r) => r.name));

    const files = fs.existsSync(MIGRATIONS_DIR)
      ? fs
          .readdirSync(MIGRATIONS_DIR)
          .filter((f) => f.endsWith(".sql"))
          .sort()
      : [];

    const pending = files.filter((f) => !applied.has(f));

    if (wantJson) {
      const out = {
        migrationsDir: MIGRATIONS_DIR,
        foundFiles: files.length,
        applied: rows.map((r) => ({ name: r.name, run_at: r.run_at })),
        pending,
      };
      console.log(JSON.stringify(out));
      process.exit(0);
    }

    console.log("\nMigration status:\n");
    console.log(`Migrations dir: ${MIGRATIONS_DIR}`);
    console.log(`Found migration files: ${files.length}`);
    console.log(`Applied migrations: ${rows.length}\n`);

    if (rows.length > 0) {
      console.log("--- Applied ---");
      for (const r of rows) console.log(`${r.name}    ${r.run_at}`);
      console.log("");
    }

    if (pending.length > 0) {
      console.log("--- Pending ---");
      for (const p of pending) console.log(p);
      console.log("");
    } else {
      console.log("No pending migrations.");
    }

    process.exit(0);
  } catch (err) {
    if (wantJson) {
      console.error(JSON.stringify({ error: err.message || err }));
    } else {
      console.error("Error checking migrations:", err.message || err);
    }
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
