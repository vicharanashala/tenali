const GRADE_BAND_CONFIG = {
  '1-5':  { blendWeight: 0.05 },
  '6-8':  { blendWeight: 0.10 },
  '9-12': { blendWeight: 0.18 },
};

// previousDisplayed and rawMasteryPercent are both 0-100
function nextDisplayedMastery(previousDisplayed, rawMasteryPercent, gradeBand) {
  const cfg = GRADE_BAND_CONFIG[gradeBand] || GRADE_BAND_CONFIG['6-8'];
  const w = cfg.blendWeight;
  return previousDisplayed * (1 - w) + rawMasteryPercent * w;
}

export { nextDisplayedMastery, GRADE_BAND_CONFIG };
