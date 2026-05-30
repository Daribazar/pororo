const { readCsv } = require("../repositories/csv.repository");
const { max, min, round } = require("../utils/math");

async function getAllStudents() {
  return await readCsv("students.csv");
}

async function searchStudents(query) {
  const students = await readCsv("students.csv");

  if (!query) {
    return students.slice(0, 20);
  }

  const lowerQuery = query.toLowerCase();

  return students.filter((student) => {
    return (
      String(student.name).toLowerCase().includes(lowerQuery) ||
      String(student.student_id).toLowerCase().includes(lowerQuery) ||
      String(student["Сэдэв"]).toLowerCase().includes(lowerQuery)
    );
  });
}

async function getStudentDetail(studentId) {
  const students = await readCsv("students.csv");
  const defenseScores = await readCsv("defense_scores.csv");
  const yavts2Scores = await readCsv("yavts2_scores.csv");
  const uriScores = await readCsv("uri_scores.csv");

  const student = students.find((s) => s.student_id === studentId);

  if (!student) {
    return null;
  }

  const studentDefense = defenseScores.filter((d) => d.student_id === studentId);
  const studentYavts2 = yavts2Scores.filter((d) => d.student_id === studentId);
  const studentUri = uriScores.filter((d) => d.student_id === studentId);

  const defenseTotals = studentDefense.map((d) => Number(d.total_35)).filter((n) => !isNaN(n));
  const controversyScore = defenseTotals.length >= 2 ? max(defenseTotals) - min(defenseTotals) : 0;

  const alerts = [];

  if (controversyScore >= 15) {
    alerts.push({
      type: "warning",
      message: `Defense онооны зөрүү ${controversyScore} байна. Багш нарын санал зөрөлдөөн өндөр.`
    });
  }

  const trimmedDiff = round(student.defense_trimmed - student.defense_avg_35);

  if (Math.abs(trimmedDiff) >= 2) {
    alerts.push({
      type: "info",
      message: `Trimmed average болон normal average ${trimmedDiff} оноогоор зөрж байна.`
    });
  }

  return {
    student,
    scoreBreakdown: {
      yavts1_15: student.yavts1_15,
      yavts2_avg_20: student.yavts2_avg_20,
      uri_avg_25: student.uri_avg_25,
      reviewer_5: student.reviewer_5,
      defense_avg_35: student.defense_avg_35,
      final_score_100: student.final_score_100
    },
    defenseScores: studentDefense,
    yavts2Scores: studentYavts2,
    uriScores: studentUri,
    fairness: {
      defenseAverage: student.defense_avg_35,
      defenseTrimmed: student.defense_trimmed,
      trimmedDifference: trimmedDiff,
      controversyScore
    },
    alerts
  };
}

module.exports = {
  getAllStudents,
  searchStudents,
  getStudentDetail
};