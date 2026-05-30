const teacherService = require("../services/teacher.service");

async function getTeachers(req, res) {
  try {
    res.json(await teacherService.getTeachers());
  } catch {
    res.status(500).json({ message: "Багшийн жагсаалт авахад алдаа гарлаа" });
  }
}

async function getTeacherAnalytics(req, res) {
  try {
    res.json(await teacherService.getTeacherAnalytics());
  } catch {
    res.status(500).json({ message: "Teacher analytics авахад алдаа гарлаа" });
  }
}

async function getTeacherDetail(req, res) {
  try {
    const result = await teacherService.getTeacherDetail(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Багш олдсонгүй" });
    }

    res.json(result);
  } catch {
    res.status(500).json({ message: "Багшийн дэлгэрэнгүй авахад алдаа гарлаа" });
  }
}

module.exports = {
  getTeachers,
  getTeacherAnalytics,
  getTeacherDetail,
};