const committeeService = require("../services/committee.service");

async function getCommitteeAnalytics(req, res) {
  try {
    const result = await committeeService.getCommitteeAnalytics();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Committee analytics авахад алдаа гарлаа" });
  }
}

module.exports = {
  getCommitteeAnalytics
};