const mysql = require("mysql2");

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

if (!host || !user || !password || !database) {
  throw new Error(
    "Database configuration missing. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your environment.",
  );
}

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
  dateStrings: true,
});

console.info(
  `DB: host=${host} user=${user} database=${database} (password hidden)`,
);

// Quick connection test to fail early if DB not reachable
pool.getConnection((err, connection) => {
  if (err) {
    console.error("DB connection test failed:", err.message || err);
  } else {
    // Chạy lệnh SQL để đồng bộ múi giờ với MySQL Server
    connection.query("SET time_zone = '+07:00';", (queryErr) => {
      if (queryErr) {
        console.error("Failed to set time_zone:", queryErr.message);
      } else {
        console.info("DB connection test succeeded & Timezone set to GMT+7");
      }
      connection.release();
    });
  }
});

module.exports = pool.promise();
