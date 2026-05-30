const teacherService = require("./teacher.service");
const committeeService = require("./committee.service");

async function getAlerts() {
  const teacherAnalytics = await teacherService.getTeacherAnalytics();
  const committeeAnalytics = await committeeService.getCommitteeAnalytics();

  const alerts = [];

  const strictest = teacherAnalytics.strictest[0];
  const lenient = teacherAnalytics.mostLenient[0];

  alerts.push({
    type: "teacher",
    level: "warning",
    title: "Хамгийн хатуу багш",
    message: `${strictest.name} багшийн Severity Index ${strictest.severity_index}. Бусдаас бага оноо өгөх хандлагатай.`
  });

  alerts.push({
    type: "teacher",
    level: "info",
    title: "Хамгийн зөөлөн багш",
    message: `${lenient.name} багшийн Severity Index ${lenient.severity_index}. Бусдаас өндөр оноо өгөх хандлагатай.`
  });

  const mostDisagreedCommittee = [...committeeAnalytics.committees].sort(
    (a, b) => b.disagreementIndex - a.disagreementIndex
  )[0];

  alerts.push({
    type: "committee",
    level: "warning",
    title: "Санал зөрөлдөөн өндөртэй комисс",
    message: `${mostDisagreedCommittee.committee} комиссын Disagreement Index ${mostDisagreedCommittee.disagreementIndex}.`
  });

  const lowestHealth = [...committeeAnalytics.committees].sort(
    (a, b) => a.healthScore - b.healthScore
  )[0];

  alerts.push({
    type: "committee",
    level: "danger",
    title: "Health Score бага комисс",
    message: `${lowestHealth.committee} комиссын Health Score ${lowestHealth.healthScore}/100.`
  });

  return alerts;
}

module.exports = {
  getAlerts
};