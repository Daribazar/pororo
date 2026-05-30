const studentService = require("../services/student.service");

async function getAllStudents(req, res) {
  try {
    const result = await studentService.getAllStudents();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Оюутны жагсаалт авахад алдаа гарлаа" });
  }
}

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
  getAllStudents,
  searchStudents,
  getStudentDetail
};