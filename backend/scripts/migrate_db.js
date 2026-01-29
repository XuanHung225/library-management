const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const SQL_FILE = path.resolve(
  __dirname,
  "..",
  "..",
  "database",
  "library_db.sql",
);

async function main() {
  console.log("Reading SQL file:", SQL_FILE);
  const sql = fs.readFileSync(SQL_FILE, "utf8");

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  if (!host || !user || !password || !database) {
    throw new Error(
      "Database configuration missing. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your environment.",
    );
  }
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    console.log("Running migration...");
    const [result] = await connection.query(sql);
    console.log("Migration executed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
