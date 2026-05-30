const summaryService = require("../services/summary.service");

async function getSummary(req, res) {
  try {
    const result = await summaryService.getSummary();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Summary авахад алдаа гарлаа" });
  }
}

module.exports = {
  getSummary
};