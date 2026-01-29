const mysql = require("mysql2/promise");

async function inspect() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "H@ihu0cwa",
    database: process.env.DB_NAME || "library_db",
  });

  for (const table of ["users", "books", "loans", "fines", "password_resets"]) {
    try {
      const [cols] = await conn.query(`SHOW COLUMNS FROM ${table}`);
      console.log(`\nTABLE: ${table}`);
      cols.forEach((c) => console.log(`  ${c.Field} ${c.Type} ${c.Null}`));
    } catch (err) {
      console.log(`\nTABLE: ${table} - ERROR:`, err.message);
    }
  }

  await conn.end();
}

inspect().catch((e) => {
  console.error(e);
  process.exit(1);
});
