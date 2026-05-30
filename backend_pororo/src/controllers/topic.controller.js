const topicService = require("../services/topic.service");

async function getTopicAnalytics(req, res) {
  try {
    const result = await topicService.getTopicAnalytics();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Topic analytics авахад алдаа гарлаа" });
  }
}

module.exports = {
  getTopicAnalytics
};