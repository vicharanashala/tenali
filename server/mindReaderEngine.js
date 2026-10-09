/**
 * TENALI MIND READER — INFERENCE ENGINE
 * ══════════════════════════════════════════════════════════════════════
 *
 * Implements a probabilistic question-answering (20-questions style) engine
 * that narrows a candidate pool of mathematical concepts through Yes/No/DK
 * questions.
 *
 * ALGORITHM OVERVIEW
 * ──────────────────
 * 1. Prior: uniform probability over all non-eliminated candidates.
 * 2. Bayesian update on each answer:
 *      answer=yes,  KB=true  → likelihood 0.90  (strong confirmation)
 *      answer=yes,  KB=false → likelihood 0.00  (strict elimination)
 *      answer=yes,  KB=null  → likelihood 0.50  (ambiguous / partial)
 *      answer=no,   KB=true  → likelihood 0.00  (strict elimination)
 *      answer=no,   KB=false → likelihood 0.90  (strong confirmation)
 *      answer=no,   KB=null  → likelihood 0.50  (ambiguous / partial)
 *      answer=dk,   any      → likelihood 0.80  (slight dampening)
 * 3. Normalise surviving probabilities to sum to 1.
 * 4. Predict when any of the following hold:
 *      (a) only 1 candidate remains,
 *      (b) no more questions to ask,
 *      (c) no remaining question has meaningful information gain,
 *      (d) one candidate is an unambiguous leader (high probability,
 *          large gap, and no remaining question can split the top-N), or
 *      (e) candidate pool is small with low remaining question value.
 * 5. Next-question selection via a hybrid score:
 *      combined(q) = (1−ercWeight)·IG_norm(q) + ercWeight·ERC_norm(q)
 *    IG (Shannon entropy reduction) is combined with ERC (Expected Remaining
 *    Candidates), which directly optimises game length.
 *    When top candidates are near-tied, questions are re-ranked by a group
 *    tiebreak score (mean pairwise KB-answer separation across top-N).
 *    After DK answers, questions with definitive KB answers are up-weighted.
 *    After incorrect predictions, questions that distinguish the rejected
 *    concept from survivors receive a multiplicative score boost.
 *
 * CONFIDENCE METRIC
 * ─────────────────
 * Four-component formula:
 *   (gap × pool_factor)
 *   + igExhaustedWeight × ig_exhaustion_bonus
 *   + consistencyWeight × answer_consistency_score
 *   − contradictionPenalty × contradiction_count
 * A DK decay multiplier (dkDecay^dkCount) is applied last.
 *
 * SIMILAR CONCEPT DETECTION & KB GAP ANNOTATION
 * ──────────────────────────────────────────────
 * Concepts within Hamming distance ≤ 2 are listed in `similarConcepts`.
 * Each entry includes `wereAsked` and `missedQuestions` so developers can
 * identify which distinguishing questions were never asked in this session.
 */

'use strict';

// ─── Central Configuration ────────────────────────────────────────────────────

/**
 * Central tuning surface for the Mind Reader inference engine.
 * All threshold values live here. Tests may override individual fields
 * between sections; always restore after overriding.
 *
 * Exported so tests can override fields without monkey-patching constants.
 */
const ENGINE_CONFIG = {

  // ── Question Scoring ─────────────────────────────────────────────────
  /**
   * Weight of Expected Remaining Candidates (ERC) in the combined question score.
   * 0 = pure Information Gain; 1 = pure ERC minimisation. Recommended: 0.4.
   * ERC directly optimises the expected number of questions to resolve the game.
   */
  ercWeight: 0.40,

  /**
   * Probability gap below which top candidates are considered "near-tied"
   * and the group tiebreak phase activates.
   */
  tieThreshold: 0.15,

  /**
   * IG tolerance band (bits): questions within this many bits of the
   * maximum IG are eligible for the tiebreak re-ranking step.
   */
  tieIgTolerance: 0.10,

  /**
   * Number of top candidates to include in the group tiebreak score
   * (mean pairwise KB-answer separation).
   */
  tiebreakTopN: 3,

  /**
   * Multiplicative boost applied to questions that distinguish a previously
   * incorrect prediction from the surviving candidates. Must be ≥ 1.
   */
  incorrectPredictionBoost: 2.0,

  // ── Confidence Calculation ───────────────────────────────────────────
  /**
   * Weight of the IG-exhaustion signal in the confidence formula.
   * Rises as questions run out, giving confidence a bonus near the end.
   */
  igExhaustedWeight: 0.25,

  /**
   * Weight of the answer-consistency signal in the confidence formula.
   * Rewards histories whose answers align well with the top candidate's KB.
   */
  consistencyWeight: 0.15,

  /**
   * Confidence penalty per contradictory answer against the top candidate.
   * A contradiction is: answer='yes' when KB=false, or answer='no' when KB=true.
   */
  contradictionPenalty: 0.10,

  /**
   * Per-DK-answer confidence decay factor (multiplicative, applied last).
   * Reported confidence is scaled by dkDecay^dkCount.
   * With dkDecay=0.88, five DK answers halve the confidence.
   */
  dkDecay: 0.88,

  // ── Prediction Gating ────────────────────────────────────────────────
  /**
   * Maximum IG (bits) below which a remaining question is considered useless
   * and the engine predicts without asking it.
   */
  noIgThreshold: 0.005,

  /**
   * Minimum bestProb required to trigger the "unambiguous leader" prediction.
   */
  unambiguousLeaderProb: 0.90,

  /**
   * Minimum bestProb/secondProb ratio for the "unambiguous leader" rule.
   */
  unambiguousLeaderRatio: 10,

  /**
   * Maximum group tiebreak score (over top-N) for the unambiguous-leader
   * rule to fire. If a question can still strongly separate the top candidates,
   * the engine keeps asking.
   */
  unambiguousMaxTiebreakScore: 0.10,

  // ── Small-Pool Early Guess ───────────────────────────────────────────
  /**
   * Candidate pool size at or below which the small-pool early-guess
   * check applies.
   */
  smallPoolSize: 3,

  /**
   * Maximum combined question score allowed for the small-pool early guess
   * to activate (questions above this threshold are still useful to ask).
   */
  smallPoolScoreThreshold: 0.25,

  /**
   * Minimum probability gap for an early small-pool guess.
   */
  smallPoolGapThreshold: 0.40,
};

// ─── Backward-Compatible Constants ───────────────────────────────────────────

/** Kept for backward compatibility. Mirrors ENGINE_CONFIG.unambiguousLeaderProb. */
const CONFIDENCE_THRESHOLD = ENGINE_CONFIG.unambiguousLeaderProb;

/**
 * Likelihood values for Bayesian update.
 * These model P(answer | concept_is_the_target) for each case.
 */
const LIKELIHOOD = {
  YES_TRUE:   0.90,
  YES_FALSE:  0.00,
  YES_NULL:   0.50,
  NO_TRUE:    0.00,
  NO_FALSE:   0.90,
  NO_NULL:    0.50,
  DK_ANY:     0.80,
};

// ─── Core Helpers ─────────────────────────────────────────────────────────────

/**
 * Shannon entropy of a probability distribution.
 * H = −Σ p_i·log₂(p_i)   (0·log₂(0) defined as 0)
 *
 * @param {number[]} probs
 * @returns {number} Entropy in bits.
 */
function entropy(probs) {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Bayesian likelihood for a single (answer, expectedKB) pair.
 *
 * @param {'yes'|'no'|'dontknow'} answer
 * @param {true|false|null|undefined} expected
 * @returns {number} Likelihood ∈ [0, 1]
 */
function likelihood(answer, expected) {
  if (answer === 'yes') {
    if (expected === true)  return LIKELIHOOD.YES_TRUE;
    if (expected === false) return LIKELIHOOD.YES_FALSE;
    return LIKELIHOOD.YES_NULL;
  }
  if (answer === 'no') {
    if (expected === true)  return LIKELIHOOD.NO_TRUE;
    if (expected === false) return LIKELIHOOD.NO_FALSE;
    return LIKELIHOOD.NO_NULL;
  }
  return LIKELIHOOD.DK_ANY;
}

/**
 * Apply a Bayesian update in-place to the probability map.
 *
 * @param {Object}   probs      - Map id → weight (mutated in-place)
 * @param {Object[]} concepts
 * @param {string}   questionId
 * @param {string}   answer
 */
function applyUpdate(probs, concepts, questionId, answer) {
  for (const c of concepts) {
    if (probs[c.id] === 0) continue;
    probs[c.id] *= likelihood(answer, c.answers[questionId]);
  }
}

/**
 * Normalise a probability map so values sum to 1.
 * Returns the pre-normalisation total, or null if total is 0.
 *
 * @param {Object} probs - Mutated in-place.
 * @returns {number|null}
 */
function normalise(probs) {
  const total = Object.values(probs).reduce((s, v) => s + v, 0);
  if (total === 0) return null;
  for (const id in probs) probs[id] /= total;
  return total;
}

// ─── Question-Scoring Helpers ─────────────────────────────────────────────────

/**
 * Compute the Information Gain of asking question `qId`.
 *
 * IG(q) = H(current) − [P(yes|q)·H(yes branch) + P(no|q)·H(no branch)]
 *
 * @param {Object[]} candidates
 * @param {Object}   probs
 * @param {string}   qId
 * @param {number}   currentH - Current entropy (pre-computed for efficiency)
 * @returns {number} Information gain in bits.
 */
function informationGain(candidates, probs, qId, currentH) {
  const yesProbs = [], noProbs = [];
  let pYes = 0, pNo = 0;

  for (const c of candidates) {
    const p  = probs[c.id];
    const yL = likelihood('yes', c.answers[qId]);
    const nL = likelihood('no',  c.answers[qId]);
    yesProbs.push(p * yL);
    noProbs.push(p * nL);
    pYes += p * yL;
    pNo  += p * nL;
  }

  const total = pYes + pNo;
  if (total === 0) return 0;

  const normYes = pYes > 0 ? yesProbs.map(p => p / pYes) : [];
  const normNo  = pNo  > 0 ? noProbs.map(p  => p / pNo)  : [];

  return currentH - ((pYes / total) * entropy(normYes) + (pNo / total) * entropy(normNo));
}

/**
 * Expected Remaining Candidates (ERC) for question `qId`.
 *
 * ERC = P(yes)·|yes survivors| + P(no)·|no survivors|   (probability-weighted)
 *
 * A smaller ERC means fewer candidates survive on average, directly
 * reducing the number of questions needed to identify the concept.
 *
 * @param {Object[]} candidates
 * @param {Object}   probs
 * @param {string}   qId
 * @returns {number} Expected count ∈ [1, candidates.length]
 */
function expectedRemainingCandidates(candidates, probs, qId) {
  let pYes = 0, pNo = 0, yesSurvivors = 0, noSurvivors = 0;

  for (const c of candidates) {
    const p   = probs[c.id];
    const pyc = p * likelihood('yes', c.answers[qId]);
    const pnc = p * likelihood('no',  c.answers[qId]);
    pYes += pyc;
    pNo  += pnc;
    if (pyc > 0) yesSurvivors++;
    if (pnc > 0) noSurvivors++;
  }

  const total = pYes + pNo;
  if (total === 0) return candidates.length;
  return (pYes / total) * yesSurvivors + (pNo / total) * noSurvivors;
}

/**
 * Definitiveness score for question `q` over `candidates`.
 *
 * Returns the fraction of candidates that have a definitive (non-null)
 * KB answer for this question. A higher score means the question is less
 * likely to receive a "Don't Know" from a child, making it more actionable.
 *
 * @param {Object}   q          - Question object with `.id`
 * @param {Object[]} candidates
 * @returns {number} Fraction ∈ [0, 1]
 */
function definitiveness(q, candidates) {
  if (candidates.length === 0) return 0;
  const definite = candidates.filter(
    c => c.answers[q.id] !== null && c.answers[q.id] !== undefined
  ).length;
  return definite / candidates.length;
}

/**
 * Group tiebreak score for question `q` over `topNCandidates`.
 *
 * Computed as the mean pairwise KB-answer difference across all unique
 * pairs (i, j) in the top-N candidate set:
 *
 *   score = mean( |KB(c_i, q) − KB(c_j, q)| )
 *     where KB(c, q) = 1 if true, 0 if false, 0.5 if null/undefined
 *
 * Score of 1.0 → every pair perfectly separated.
 * Score of 0.0 → all candidates answer identically.
 *
 * @param {Object}   q
 * @param {Object[]} topNCandidates
 * @returns {number} Score ∈ [0, 1]
 */
function groupTiebreakScore(q, topNCandidates) {
  if (topNCandidates.length < 2) return 0;

  let sum = 0, count = 0;
  for (let i = 0; i < topNCandidates.length; i++) {
    for (let j = i + 1; j < topNCandidates.length; j++) {
      const a  = topNCandidates[i].answers[q.id];
      const b  = topNCandidates[j].answers[q.id];
      const va = a === true ? 1 : a === false ? 0 : 0.5;
      const vb = b === true ? 1 : b === false ? 0 : 0.5;
      sum += Math.abs(va - vb);
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

// ─── Question Selection ───────────────────────────────────────────────────────

/**
 * Select the next best question using a hybrid IG + ERC scoring strategy.
 *
 * ALGORITHM:
 * 1. Score every remaining question:
 *      combined(q) = (1−ercWeight)·IG_norm(q) + ercWeight·ERC_norm(q)
 *    If DK answers have been given, blend in a definitiveness weight so
 *    questions with clear KB answers are preferred as dkCount rises.
 *    If rejected concepts are provided, apply a boost to questions that
 *    distinguish those rejected concepts from surviving candidates.
 * 2. If top candidates are near-tied (gap < tieThreshold), re-rank
 *    tiebreak-eligible questions by group tiebreak score over top-N.
 *
 * @param {Object[]} candidates            - Active concepts
 * @param {Object}   probs                 - Map id → normalised probability
 * @param {Object[]} questions             - Remaining unasked questions
 * @param {Object[]} [rejectedConcepts=[]] - Full concept objects that were wrongly predicted
 * @param {number}   [dkCount=0]           - Total DK answers given so far
 * @returns {{ question, ig, maxIG, combinedScore, inTiebreakMode }}
 */
function selectBestQuestion(candidates, probs, questions, rejectedConcepts = [], dkCount = 0) {
  if (questions.length === 0) return null;

  const currentH = entropy(candidates.map(c => probs[c.id]));
  const n        = candidates.length;

  // ── Build boost set from incorrectly predicted concepts ──────────────
  // A question earns a boost if the rejected concept answers it differently
  // from at least one surviving candidate — exactly the questions that would
  // have told them apart.
  const boostSet = new Set();
  for (const r of rejectedConcepts) {
    for (const q of questions) {
      for (const s of candidates) {
        if (r.answers[q.id] !== s.answers[q.id]) {
          boostSet.add(q.id);
          break;  // one differing survivor is enough
        }
      }
    }
  }

  // ── DK alpha: blends definitiveness into scoring as DK count grows ───
  const dkAlpha = dkCount > 0 ? Math.min(dkCount / 5, 1.0) : 0;

  // ── Score all questions ──────────────────────────────────────────────
  let maxIG = 0;
  const scored = questions.map(q => {
    const ig      = informationGain(candidates, probs, q.id, currentH);
    const igNorm  = currentH > 1e-9 ? Math.min(ig / currentH, 1.0) : 0;

    const erc     = expectedRemainingCandidates(candidates, probs, q.id);
    const ercNorm = n > 1 ? 1 - (erc / n) : 0;

    // Base combined score (IG + ERC blend)
    let score = (1 - ENGINE_CONFIG.ercWeight) * igNorm
              +      ENGINE_CONFIG.ercWeight   * ercNorm;

    // DK-aware definitiveness blend: when DK answers accumulate, prefer
    // questions with definitive true/false KB answers over ambiguous nulls,
    // because nulls are likely to produce another DK and make no progress.
    if (dkCount > 0) {
      const def = definitiveness(q, candidates);
      score = (1 - dkAlpha) * score + dkAlpha * def;
    }

    // Incorrect-prediction boost: multiplicatively prioritise questions
    // that distinguish the previously rejected concept from survivors.
    if (boostSet.has(q.id)) {
      score *= ENGINE_CONFIG.incorrectPredictionBoost;
    }

    if (ig > maxIG) maxIG = ig;
    return { q, ig, score };
  });

  // ── Select best by combined score ────────────────────────────────────
  let winner = scored.reduce((best, cur) => cur.score > best.score ? cur : best, scored[0]);

  // ── Tiebreak phase: activate when top candidates are near-tied ───────
  const sortedCandidates = [...candidates].sort((a, b) => probs[b.id] - probs[a.id]);
  const topProb  = probs[sortedCandidates[0].id];
  const nearTied = sortedCandidates.filter(
    c => topProb - probs[c.id] < ENGINE_CONFIG.tieThreshold
  );
  let inTiebreakMode = false;

  if (nearTied.length >= 2) {
    const topN = nearTied.slice(0, ENGINE_CONFIG.tiebreakTopN);

    // Among questions within tieIgTolerance bits of maxIG, re-rank by
    // group tiebreak score (mean pairwise KB-answer separation over top-N).
    const eligible = scored.filter(s => maxIG - s.ig <= ENGINE_CONFIG.tieIgTolerance);
    let bestTs = -Infinity, bestTieEntry = null;

    for (const entry of eligible) {
      const ts = groupTiebreakScore(entry.q, topN);
      if (ts > bestTs) { bestTs = ts; bestTieEntry = entry; }
    }

    if (bestTieEntry !== null && bestTs > 0) {
      winner        = bestTieEntry;
      inTiebreakMode = true;
    }
  }

  return {
    question:      winner.q,
    ig:            winner.ig,
    maxIG,
    combinedScore: winner.score,
    inTiebreakMode,
  };
}

// ─── Core Inference ──────────────────────────────────────────────────────────

/**
 * Run the full inference pipeline for one round.
 *
 * @param {Object[]} allConcepts
 *   Full CONCEPTS array from mindReaderKB.js
 * @param {Object[]} allQuestions
 *   Full QUESTIONS array from mindReaderKB.js
 * @param {Array<{questionId:string, answer:string}>} history
 *   All Q&A pairs so far in this session
 * @param {string[]} incorrectPredictions
 *   Concept names the user has already rejected
 *
 * @returns {{
 *   prediction?: {id, name, description, definingCharacteristics,
 *                 recommendations, reasoning, ambiguousPartners?,
 *                 similarConcepts?},
 *   nextQuestion?: {id, text},
 *   confidence: number,
 *   remainingCount: number,
 *   isFinalQuestion?: boolean,
 *   error?: string
 * }}
 */
function runInference(allConcepts, allQuestions, history, incorrectPredictions) {

  // ── Step 1: Filter out rejected concepts ────────────────────────────
  let candidates = allConcepts.filter(c => !incorrectPredictions.includes(c.name));
  if (candidates.length === 0) {
    return { error: 'No candidate concepts left', confidence: 0, remainingCount: 0 };
  }

  // ── Step 2: Capture initial state for confidence computation ─────────
  const initialCandidateCount = candidates.length;
  // H_initial = entropy of the uniform prior = log₂(n)
  const H_initial = initialCandidateCount > 1 ? Math.log2(initialCandidateCount) : 0;

  // ── Step 3: Initialise uniform priors ────────────────────────────────
  const probs = {};
  for (const c of candidates) probs[c.id] = 1.0 / initialCandidateCount;

  // ── Step 4: Bayesian updates from history ────────────────────────────
  for (const { questionId, answer } of history) {
    applyUpdate(probs, candidates, questionId, answer);
  }

  // ── Step 5: Remove zero-probability candidates & renormalise ─────────
  candidates = candidates.filter(c => probs[c.id] > 0);
  if (candidates.length === 0) {
    return {
      error: 'Inconsistent responses — no matching concepts found.',
      confidence: 0,
      remainingCount: 0,
    };
  }
  if (normalise(probs) === null) {
    return {
      error: 'Probability collapse — all candidates eliminated.',
      confidence: 0,
      remainingCount: 0,
    };
  }

  // ── Step 6: Sort candidates by probability descending ────────────────
  candidates.sort((a, b) => probs[b.id] - probs[a.id]);
  const best       = candidates[0];
  const bestProb   = probs[best.id];
  const secondProb = candidates.length > 1 ? probs[candidates[1].id] : 0;
  const gapFactor  = bestProb - secondProb;

  // ── Step 7: Select the next best question ────────────────────────────
  const askedIds         = new Set(history.map(h => h.questionId));
  const remaining        = allQuestions.filter(q => !askedIds.has(q.id));
  const dkCount          = history.filter(h => h.answer === 'dontknow').length;
  const rejectedConcepts = allConcepts.filter(c => incorrectPredictions.includes(c.name));

  let bestQ          = null;
  let bestIG         = 0;
  let maxIG          = 0;
  let combinedScore  = 0;
  let inTiebreakMode = false;

  if (remaining.length > 0) {
    const sel  = selectBestQuestion(candidates, probs, remaining, rejectedConcepts, dkCount);
    bestQ          = sel.question;
    bestIG         = sel.ig;
    maxIG          = sel.maxIG;
    combinedScore  = sel.combinedScore;
    inTiebreakMode = sel.inTiebreakMode;
  }

  // ── Step 8: Compute confidence (four-component formula) ──────────────

  // Component 1 — probability gap scaled by pool shrinkage.
  // poolFactor approaches 1 as candidates.length → 1, and decreases
  // logarithmically as the pool grows, preventing a large gap among many
  // candidates from appearing overconfident.
  const poolFactor = candidates.length > 1
    ? 1 / Math.log2(candidates.length + 1)
    : 1;
  const gapSignal = gapFactor * poolFactor;

  // Component 2 — IG-exhaustion bonus.
  // Rises toward 1 as the best remaining question becomes less informative,
  // giving the confidence meter a push near the end of the game.
  // Gated on history.length > 0 so the initial call correctly returns 0.
  const igExhaustedFactor = history.length > 0
    ? Math.max(0, 1 - (maxIG / Math.max(H_initial, 1e-9)))
    : 0;

  // Component 3 — answer-consistency score for the top candidate.
  // Fraction of history answers that match the top candidate's KB value.
  const matchingAnswers = history.filter(({ questionId, answer }) => {
    const exp = best.answers[questionId];
    return (answer === 'yes' && exp === true) || (answer === 'no' && exp === false);
  }).length;
  const consistencyScore = history.length > 0 ? matchingAnswers / history.length : 0;

  // Component 4 — contradiction penalty.
  // Count answers that hard-contradict the top candidate's KB (the candidate
  // survived only due to null-entry soft likelihoods).
  const contradictionCount = history.filter(({ questionId, answer }) => {
    const exp = best.answers[questionId];
    return (answer === 'yes' && exp === false) || (answer === 'no' && exp === true);
  }).length;

  const rawConfidence = Math.min(1, Math.max(0,
    gapSignal
    + ENGINE_CONFIG.igExhaustedWeight   * igExhaustedFactor
    + ENGINE_CONFIG.consistencyWeight   * consistencyScore
    - ENGINE_CONFIG.contradictionPenalty * contradictionCount
  ));

  // DK decay multiplier applied last: compresses confidence by dkDecay^dkCount.
  const reportedConfidence = candidates.length === 1
    ? 1.0  // absolute certainty when only one candidate remains
    : Math.min(1, Math.max(0,
        rawConfidence * Math.pow(ENGINE_CONFIG.dkDecay, dkCount)
      ));

  // ── Step 9: Prediction gating — should we guess now? ─────────────────

  // (a) Only one candidate remains — certainty.
  const isCertain = candidates.length === 1;

  // (b) No more questions available.
  const noMoreQuestions = remaining.length === 0;

  // (c) No remaining question has meaningful IG — asking more won't help.
  const noInformationGain = remaining.length > 0 && maxIG < ENGINE_CONFIG.noIgThreshold;

  // (d) Unambiguous leader: high probability AND large ratio gap AND no
  //     remaining question can meaningfully separate the top-N candidates.
  let maxGroupTs = 0;
  if (remaining.length > 0 && candidates.length >= 2) {
    const topN = candidates.slice(0, Math.min(ENGINE_CONFIG.tiebreakTopN, candidates.length));
    for (const q of remaining) {
      const ts = groupTiebreakScore(q, topN);
      if (ts > maxGroupTs) maxGroupTs = ts;
    }
  }
  const unambiguousLeader =
    bestProb >= ENGINE_CONFIG.unambiguousLeaderProb &&
    (bestProb / (secondProb + 1e-9)) >= ENGINE_CONFIG.unambiguousLeaderRatio &&
    maxGroupTs < ENGINE_CONFIG.unambiguousMaxTiebreakScore;

  // (e) Small pool with low remaining question value and a clear leader.
  const smallPoolEarlyGuess =
    candidates.length <= ENGINE_CONFIG.smallPoolSize &&
    combinedScore < ENGINE_CONFIG.smallPoolScoreThreshold &&
    gapFactor > ENGINE_CONFIG.smallPoolGapThreshold;

  if (isCertain || noMoreQuestions || noInformationGain || unambiguousLeader || smallPoolEarlyGuess) {
    return {
      prediction:     buildPrediction(best, candidates, probs, history, allQuestions, allConcepts),
      confidence:     reportedConfidence,
      remainingCount: candidates.length,
    };
  }

  return {
    nextQuestion:    bestQ,
    confidence:      reportedConfidence,
    remainingCount:  candidates.length,
    isFinalQuestion: candidates.length <= 2,
  };
}

// ─── Prediction Builder ────────────────────────────────────────────────────────

/**
 * Build a rich prediction object with reasoning and KB gap annotation.
 *
 * @param {Object}   concept      - Top candidate concept
 * @param {Object[]} candidates   - All surviving candidates (sorted desc)
 * @param {Object}   probs        - Normalised probability map
 * @param {Object[]} history      - Full Q&A history
 * @param {Object[]} allQuestions
 * @param {Object[]} allConcepts
 * @returns {Object}
 */
function buildPrediction(concept, candidates, probs, history, allQuestions, allConcepts) {
  const questionMap = Object.fromEntries(allQuestions.map(q => [q.id, q.text]));

  // Find the top-3 most discriminative confirming Q&A pairs.
  const confirmingEvidence = history
    .filter(({ questionId, answer }) => {
      const exp = concept.answers[questionId];
      return (answer === 'yes' && exp === true) || (answer === 'no' && exp === false);
    })
    .map(({ questionId, answer }) => ({
      question:       questionMap[questionId] || questionId,
      answer,
      discriminative: isDiscriminative(questionId, answer, candidates, probs, concept),
    }))
    .sort((a, b) => b.discriminative - a.discriminative)
    .slice(0, 3);

  // Concepts sharing the exact same answer vector (truly ambiguous).
  const ambiguousPartners = candidates
    .filter(c => c.id !== concept.id && sharesAnswerVector(concept, c, allQuestions))
    .map(c => c.name);

  // Similar concepts (Hamming distance ≤ 2) with KB gap annotation.
  // For each similar concept, record whether the distinguishing questions
  // were actually asked in this session (wereAsked) and which were missed
  // (missedQuestions). This serves as a live diagnostic for developers.
  const askedQIds     = new Set(history.map(h => h.questionId));
  const similarConcepts = [];

  if (allConcepts) {
    for (const other of allConcepts) {
      if (other.id === concept.id) continue;

      const diffQuestions = allQuestions.filter(
        q => concept.answers[q.id] !== other.answers[q.id]
      );

      if (diffQuestions.length <= 2) {
        const missedQuestions = diffQuestions
          .filter(q => !askedQIds.has(q.id))
          .map(q => q.id);

        similarConcepts.push({
          id:                    other.id,
          name:                  other.name,
          differenceCount:       diffQuestions.length,
          distinguishingQuestions: diffQuestions.map(q => ({
            id:               q.id,
            text:             q.text,
            expectedForThis:  concept.answers[q.id],
            expectedForOther: other.answers[q.id],
          })),
          wereAsked:       missedQuestions.length === 0,
          missedQuestions,
        });
      }
    }
  }

  const prediction = {
    id:                      concept.id,
    name:                    concept.name,
    description:             concept.description,
    definingCharacteristics: concept.definingCharacteristics,
    recommendations:         concept.recommendations,
    reasoning:               confirmingEvidence.map(e => ({ question: e.question, answer: e.answer })),
    ambiguousPartners:       ambiguousPartners.length > 0 ? ambiguousPartners : undefined,
  };

  if (similarConcepts.length > 0) prediction.similarConcepts = similarConcepts;

  return prediction;
}

/**
 * Measure how discriminative a confirming Q&A pair is for the target concept.
 * Returns the ratio of the target's likelihood to the average of all others.
 */
function isDiscriminative(questionId, answer, candidates, probs, targetConcept) {
  const others = candidates.filter(c => c.id !== targetConcept.id);
  if (others.length === 0) return 1;

  const targetL  = likelihood(answer, targetConcept.answers[questionId]);
  const avgOther = others.reduce(
    (s, c) => s + likelihood(answer, c.answers[questionId]), 0
  ) / others.length;

  return avgOther === 0 ? 100 : targetL / (avgOther + 1e-9);
}

/**
 * Check if two concepts share identical answer vectors across all questions.
 */
function sharesAnswerVector(a, b, allQuestions) {
  return allQuestions.every(q => a.answers[q.id] === b.answers[q.id]);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  // Primary API
  runInference,

  // Pure helpers (exported for direct unit testing)
  entropy,
  likelihood,
  informationGain,
  expectedRemainingCandidates,
  definitiveness,
  groupTiebreakScore,
  selectBestQuestion,

  // Configuration & constants
  ENGINE_CONFIG,
  CONFIDENCE_THRESHOLD,
  LIKELIHOOD,
};
