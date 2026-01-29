const fineService = require("../services/fine.service");
const Joi = require("joi");

// Validate ID từ params
const fineIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

exports.getMyFines = async (req, res) => {
  try {
    // req.user được giải mã từ middleware auth
    const fines = await fineService.getMyFines(req.user.id);
    res.json(fines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllFines = async (req, res) => {
  try {
    const fines = await fineService.getAllFines();
    res.json(fines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    // Validate req.params thay vì req.body
    const { error, value } = fineIdSchema.validate(req.params);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await fineService.markAsPaid(value.id);

    res.json({ message: "Fine marked as paid successfully" });
  } catch (err) {
    // Phân biệt lỗi 404 và 500
    if (err.message === "Fine not found or already paid") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};
