const { readCsv } = require("../repositories/csv.repository");
const { groupBy } = require("../utils/group");
const { average, standardDeviation, round, min, max } = require("../utils/math");

function getCommitteeType(committeeAvg, globalAvg, disagreement) {
  const diff = committeeAvg - globalAvg;

  if (diff < -3 && disagreement > 6) {
    return "Хатуу, санал зөрөлдөөн өндөр";
  }

  if (diff < -3) {
    return "Хатуу талдаа";
  }

  if (diff > 3 && disagreement > 6) {
    return "Зөөлөн боловч санал зөрөлдөөнтэй";
  }

  if (diff > 3) {
    return "Зөөлөн талдаа";
  }

  return "Дундаж комисс";
}

function getHealthScore(committeeAvg, globalAvg, disagreement) {
  // Health Score бол албан ёсны дүн биш.
  // Комиссийн үнэлгээний тогтвортой байдлыг 0-100 оноогоор харуулах туслах индекс.
  const avgPenalty = Math.abs(committeeAvg - globalAvg) * 3;
  const disagreementPenalty = disagreement * 2;

  const score = 100 - avgPenalty - disagreementPenalty;

  return Math.max(0, Math.min(100, round(score)));
}

async function getCommitteeAnalytics() {
  const students = await readCsv("students.csv");
  const defenseScores = await readCsv("defense_scores.csv");

  const globalAvg = average(students.map((s) => s.final_score_100));
  const studentsByCommittee = groupBy(students, "committee");
  const defenseByStudent = groupBy(defenseScores, "student_id");

  const result = Object.keys(studentsByCommittee).map((committeeName) => {
    const committeeStudents = studentsByCommittee[committeeName];

    const finalScores = committeeStudents.map((s) => s.final_score_100);
    const committeeAvg = average(finalScores);

    const studentDisagreements = committeeStudents.map((student) => {
      const scores = defenseByStudent[student.student_id].map((d) => d.total_35);

      return {
        student_id: student.student_id,
        range: max(scores) - min(scores),
        std: standardDeviation(scores)
      };
    });

    const disagreementIndex = average(studentDisagreements.map((d) => d.std));
    const avgRange = average(studentDisagreements.map((d) => d.range));

    return {
      committee: committeeName,
      studentCount: committeeStudents.length,
      averageScore: round(committeeAvg),
      differenceFromGlobal: round(committeeAvg - globalAvg),
      disagreementIndex: round(disagreementIndex),
      averageRange: round(avgRange),
      healthScore: getHealthScore(committeeAvg, globalAvg, disagreementIndex),
      type: getCommitteeType(committeeAvg, globalAvg, disagreementIndex)
    };
  });

  return {
    globalAverage: round(globalAvg),
    committees: result.sort((a, b) => b.averageScore - a.averageScore)
  };
}

module.exports = {
  getCommitteeAnalytics
};