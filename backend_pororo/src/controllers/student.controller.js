const studentService = require("../services/student.service");

async function searchStudents(req, res) {
  try {
    const result = await studentService.searchStudents(req.query.q);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Student хайхад алдаа гарлаа" });
  }
}

async function getStudentDetail(req, res) {
  try {
    const result = await studentService.getStudentDetail(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Оюутан олдсонгүй" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Student detail авахад алдаа гарлаа" });
  }
}

module.exports = {
  searchStudents,
  getStudentDetail
};