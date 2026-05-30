const teacherService = require("../services/teacher.service");

async function getTeacherAnalytics(req, res) {
  try {
    const result = await teacherService.getTeacherAnalytics();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Teacher analytics авахад алдаа гарлаа" });
  }
}

module.exports = {
  getTeacherAnalytics
};