const EPSILON = 0.01;
function clamp(p, lo = EPSILON, hi = 1 - EPSILON) {
  return Math.min(hi, Math.max(lo, p));
}

const DEFAULT_PARAMS = {
  pInit: 0.3,
  pTransit: 0.06,
  pGuess: 0.25,
  pSlip: 0.10,
};

function validateParams({ pGuess, pSlip }) {
  if (pGuess >= 0.5 || pSlip >= 0.5) {
    throw new Error(`Degenerate BKT params: pGuess=${pGuess}, pSlip=${pSlip} must both be < 0.5`);
  }
}

function bktUpdate(pMastery, isCorrect, params = DEFAULT_PARAMS) {
  validateParams(params);
  const { pTransit, pGuess, pSlip } = params;
  const pL = clamp(pMastery);
  
  // 1. Raw Bayesian update (posterior)
  let rawPosterior;
  if (isCorrect) {
    rawPosterior = (pL * (1 - pSlip)) / (pL * (1 - pSlip) + (1 - pL) * pGuess);
  } else {
    rawPosterior = (pL * pSlip) / (pL * pSlip + (1 - pL) * (1 - pGuess));
  }
  rawPosterior = clamp(rawPosterior);

  // 2. Apply smoothing layer (cap the jump distance to ~11% of the gap)
  const SMOOTHING_FACTOR = 0.11;
  const posterior = pL + (rawPosterior - pL) * SMOOTHING_FACTOR;

  // 3. Transit to next state
  const pMasteryNext = clamp(posterior + (1 - posterior) * pTransit);
  return { posterior, pMasteryNext };
}

/**
 * Convenience wrapper used by Concept Playgrounds.
 * Accepts (currentScore, isCorrect, params?, meta?) and returns the new numeric mastery.
 */
function updateBKT(currentScore, isCorrect, params, _meta) {
  const { pMasteryNext } = bktUpdate(currentScore, isCorrect, params || DEFAULT_PARAMS);
  return pMasteryNext;
}

export { bktUpdate, updateBKT, DEFAULT_PARAMS, clamp };
