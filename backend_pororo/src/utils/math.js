function average(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + Number(n), 0) / numbers.length;
}

function standardDeviation(numbers) {
  if (!numbers.length) return 0;

  const avg = average(numbers);
  const variance = average(numbers.map((n) => Math.pow(Number(n) - avg, 2)));

  return Math.sqrt(variance);
}

function round(value, digits = 2) {
  return Number(Number(value).toFixed(digits));
}

function min(numbers) {
  return Math.min(...numbers.map(Number));
}

function max(numbers) {
  return Math.max(...numbers.map(Number));
}

module.exports = {
  average,
  standardDeviation,
  round,
  min,
  max
};