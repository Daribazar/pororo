const { readCsv } = require("../repositories/csv.repository");
const { groupBy } = require("../utils/group");
const { average, round } = require("../utils/math");

async function getTopicAnalytics() {
  const students = await readCsv("students.csv");
  const categories = await readCsv("thesis_categories.csv");

  const byTopic = groupBy(students, "Сэдэв");
  const byProgram = groupBy(students, "program");

  const topicPerformance = Object.keys(byTopic).map((topic) => {
    const rows = byTopic[topic];

    return {
      topic,
      studentCount: rows.length,
      averageScore: round(average(rows.map((s) => s.final_score_100)))
    };
  });

  const programPerformance = Object.keys(byProgram).map((program) => {
    const rows = byProgram[program];

    return {
      program,
      studentCount: rows.length,
      averageScore: round(average(rows.map((s) => s.final_score_100)))
    };
  });

  return {
    topicPerformance: topicPerformance.sort((a, b) => b.averageScore - a.averageScore),
    programPerformance: programPerformance.sort((a, b) => b.averageScore - a.averageScore),
    categoryCounts: categories
  };
}

module.exports = {
  getTopicAnalytics
};