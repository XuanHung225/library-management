const fineRepository = require("../repositories/fine.repository");

const getMyFines = async (user_id) => {
  return await fineRepository.getMyFines(user_id);
};

const getAllFines = async () => {
  return await fineRepository.getAllFines();
};

const markAsPaid = async (fine_id) => {
  const isUpdated = await fineRepository.markAsPaid(fine_id);
  if (!isUpdated) {
    throw new Error("Fine not found or already paid");
  }
  return true;
};

module.exports = {
  getMyFines,
  getAllFines,
  markAsPaid,
};
