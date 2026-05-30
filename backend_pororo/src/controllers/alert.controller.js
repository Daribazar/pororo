const alertService = require("../services/alert.service");

async function getAlerts(req, res) {
  try {
    const result = await alertService.getAlerts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Alert авахад алдаа гарлаа" });
  }
}

module.exports = {
  getAlerts
};