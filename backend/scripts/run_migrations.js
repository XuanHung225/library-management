const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "migrations");

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function getAppliedMigrations(conn) {
  const [rows] = await conn.query("SELECT name FROM migrations");
  return new Set(rows.map((r) => r.name));
}

async function applyMigration(conn, name, sql) {
  console.log(`Applying migration: ${name}`);
  // Execute statements sequentially so failing statement is easier to identify
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    console.log("Executing statement:", stmt.split("\n")[0].slice(0, 200));
    try {
      await conn.query(stmt);
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      if (
        /duplicate key name|duplicate index|already exists|duplicate column/i.test(
          msg,
        )
      ) {
        console.warn("Non-fatal migration warning (skipping):", msg);
        continue;
      }
      throw err;
    }
  }
  await conn.query("INSERT INTO migrations (name) VALUES (?)", [name]);
  console.log(`Migration applied: ${name}`);
}

async function main() {
  console.log("Run migrations from", MIGRATIONS_DIR);
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

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
    await ensureMigrationsTable(conn);
    const applied = await getAppliedMigrations(conn);

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping already-applied migration: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      try {
        await applyMigration(conn, file, sql);
      } catch (err) {
        console.error(`Failed to apply migration ${file}:`, err.message || err);
        process.exitCode = 1;
        break;
      }
    }

    console.log("Migrations finished.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Migration runner error:", err);
  process.exit(1);
});
