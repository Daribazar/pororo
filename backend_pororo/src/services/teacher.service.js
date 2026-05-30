const { readCsv } = require("../repositories/csv.repository");

function buildFingerprint(teacher) {
  const severity = teacher.severity_index;
  const noise = teacher.noise;

  let tendency = "Balanced";
  let consistency = "Stable";

  if (severity <= -5) tendency = "Very Strict";
  else if (severity < -2) tendency = "Strict";
  else if (severity >= 5) tendency = "Very Lenient";
  else if (severity > 2) tendency = "Lenient";

  if (noise >= 3.5) consistency = "Variable";

  return `${tendency} & ${consistency}`;
}

async function getTeacherAnalytics() {
  const teachers = await readCsv("teacher_analytics.csv");

  const enrichedTeachers = teachers.map((teacher) => ({
    ...teacher,
    fingerprint: buildFingerprint(teacher)
  }));

  const strictest = [...enrichedTeachers]
    .sort((a, b) => a.severity_index - b.severity_index)
    .slice(0, 5);

  const mostLenient = [...enrichedTeachers]
    .sort((a, b) => b.severity_index - a.severity_index)
    .slice(0, 5);

  return {
    strictest,
    mostLenient,
    teachers: enrichedTeachers
  };
}

module.exports = {
  getTeacherAnalytics
};