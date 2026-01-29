const db = require("../config/db");

const createLog = async ({ user_id, action, entity, entity_id, detail }) => {
  await db.query(
    "INSERT INTO logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)",
    [user_id, action, entity, entity_id, detail],
  );
};

module.exports = {
  createLog,
};
