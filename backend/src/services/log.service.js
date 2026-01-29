const logRepository = require("../repositories/log.repository");

const logAction = async ({ user_id, action, entity, entity_id, detail }) => {
  await logRepository.createLog({ user_id, action, entity, entity_id, detail });
};

module.exports = {
  logAction,
};
