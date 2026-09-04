const INTERVAL_DAYS = [1, 3, 7, 14, 30]; // stopgap ladder for this pilot only

function nextInterval(currentRungIndex, wentWell) {
  if (wentWell) {
    return Math.min(currentRungIndex + 1, INTERVAL_DAYS.length - 1);
  }
  return Math.max(currentRungIndex - 1, 0);
}

module.exports = { INTERVAL_DAYS, nextInterval };
