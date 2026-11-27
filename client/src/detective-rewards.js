/**
 * SHARED DETECTIVE REWARD ACCOUNTING
 *
 * One place for translating "how many hints did this attempt use" into stars
 * and XP, and for deciding how much of that reward is actually *new* when a
 * case is replayed.
 *
 * Replays are best-of: only an improvement over the best previously recorded
 * result for that case adds XP/stars. Replaying the same result, or doing
 * worse, awards nothing so the same case can never inflate the profile or the
 * leaderboard.
 */

export const ENHANCED_XP_MULTIPLIER = 1.5;

export function isEnhancedCaseId(caseId) {
  return typeof caseId === 'string' && caseId.startsWith('case-enhanced-');
}

export function starsForHints(totalHintsUsed) {
  const hints = Number(totalHintsUsed) || 0;
  return hints === 0 ? 3 : hints <= 2 ? 2 : 1;
}

export function xpMultiplierForStars(stars) {
  return stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4;
}

/**
 * Full reward for one attempt: what the completion screen shows for this run.
 */
export function computeCaseRewards(caseData, totalHintsUsed) {
  const stars = starsForHints(totalHintsUsed);
  const enhanced = !!(caseData && (isEnhancedCaseId(caseData.id) || caseData.enhanced));
  const multiplier = enhanced ? ENHANCED_XP_MULTIPLIER : 1;
  const xpReward = (caseData && Number(caseData.xpReward)) || 0;
  const xpEarned = Math.round(xpReward * multiplier * xpMultiplierForStars(stars));
  return { stars, xpEarned, enhanced };
}

/**
 * Best-of reward accounting for a completion attempt.
 *
 * `previousCaseEntry` is the existing progress entry for the case (may be
 * undefined, an in-progress snapshot, or a solved entry from an older build).
 * Returns this attempt's reward plus only the *additional* XP/stars that
 * should be credited to the profile.
 */
export function resolveCaseReward(caseData, totalHintsUsed, previousCaseEntry) {
  const attempt = computeCaseRewards(caseData, totalHintsUsed);
  const solvedBefore = !!(previousCaseEntry && previousCaseEntry.status === 'solved');
  const hasRecordedXp = solvedBefore && Number.isFinite(previousCaseEntry.xpEarned);
  const hasRecordedStars = solvedBefore && Number.isFinite(previousCaseEntry.stars);

  // Legacy solved entries without reward data: treat the case as already
  // rewarded so a replay can never duplicate XP.
  const previouslyRewarded = solvedBefore && !hasRecordedXp && !hasRecordedStars;

  const previousXp = hasRecordedXp ? previousCaseEntry.xpEarned : 0;
  const previousStars = hasRecordedStars ? previousCaseEntry.stars : 0;

  const xpAwarded = previouslyRewarded ? 0 : Math.max(0, attempt.xpEarned - previousXp);
  const starsAwarded = previouslyRewarded ? 0 : Math.max(0, attempt.stars - previousStars);

  const bestXp = previouslyRewarded ? attempt.xpEarned : Math.max(previousXp, attempt.xpEarned);
  const bestStars = previouslyRewarded ? attempt.stars : Math.max(previousStars, attempt.stars);

  const previousHints = solvedBefore && Number.isFinite(previousCaseEntry.hintLevel)
    ? previousCaseEntry.hintLevel
    : Number.POSITIVE_INFINITY;
  const bestHintLevel = Math.min(previousHints, Number(totalHintsUsed) || 0);

  return {
    ...attempt,
    xpAwarded,
    starsAwarded,
    bestXp,
    bestStars,
    bestHintLevel,
    isImprovement: xpAwarded > 0 || starsAwarded > 0,
  };
}
