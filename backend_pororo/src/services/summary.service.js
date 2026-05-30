const { readCsv } = require("../repositories/csv.repository");
const { average, round, min, max } = require("../utils/math");

async function getSummary() {
  const students = await readCsv("students.csv");
  const teachers = await readCsv("teachers.csv");
  const committees = await readCsv("committees.csv");

  const finalScores = students.map((s) => s.final_score_100);
  const passedCount = students.filter((s) => s.pass === "Тэнцсэн").length;

  const uniqueCommittees = new Set(committees.map((c) => c.committee));

  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalCommittees: uniqueCommittees.size,
    averageFinalScore: round(average(finalScores)),
    minFinalScore: min(finalScores),
    maxFinalScore: max(finalScores),
    passRate: round((passedCount / students.length) * 100)
  };
}

module.exports = {
  getSummary
};