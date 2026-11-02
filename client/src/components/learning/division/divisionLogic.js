/**
 * Pure state machine and mathematical logic for Division Equal Sharing.
 * Fully decoupled from React for clean testability and zero-dependency verification.
 */

/**
 * Returns the emotional state ('neutral' | 'happy' | 'sad') for each friend based on current candy counts
 * and remaining candies in the jar.
 *
 * Rules:
 * 1. Initial state (no candies distributed yet, counts all 0):
 *    - All friends begin with neutral faces.
 * 2. Unequal distribution (one or more have received more, others have less):
 *    - Friend(s) who have more candies (count === max) are neutral (waiting for others).
 *    - Friend(s) who have fewer candies (count < max) are sad.
 * 3. Equal distribution (all have reached an equal number > 0):
 *    - If the jar still has enough candies to distribute at least 1 more to everyone (jarCount >= counts.length):
 *      -> Friends display NEUTRAL (sharing is still actively in progress).
 *    - Only when the jar is empty (jarCount === 0) OR contains only a leftover remainder
 *      that cannot be shared equally among all friends (jarCount < counts.length):
 *      -> Friends display HAPPY!
 *
 * @param {number[]} counts - Array of candy counts, e.g. [2, 2, 1]
 * @param {number} [jarCount=0] - Number of candies remaining in the jar
 * @returns {Array<'neutral'|'happy'|'sad'>}
 */
export function getEmotionalState(counts, jarCount = 0) {
  if (!counts || counts.length === 0) return [];
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const friendCount = counts.length;

  // Initial state: no candies given yet -> all neutral
  if (max === 0) {
    return counts.map(() => 'neutral');
  }

  // When counts are unequal:
  // Friend(s) with more candies (count === max) are neutral (waiting for others).
  // Friend(s) with fewer candies (count < max) are sad.
  if (min < max) {
    return counts.map(count => (count === max ? 'neutral' : 'sad'));
  }

  // When counts are equal (min === max && max > 0):
  // If the jar still has enough candies to share another round equally -> neutral
  const canShareMore = jarCount >= friendCount;
  if (canShareMore) {
    return counts.map(() => 'neutral');
  }

  // Only when jar is empty or has a remainder that cannot be equally shared -> happy!
  return counts.map(() => 'happy');
}

/**
 * Determines whether a friend is locked from receiving another chocolate in the current round.
 * A friend who has received a chocolate in the current round is locked until every other friend has caught up.
 *
 * @param {number} friendIndex - 0-based index of friend
 * @param {number[]} counts - Current counts array
 * @returns {boolean}
 */
export function isFriendLocked(friendIndex, counts) {
  if (!counts || counts.length === 0) return false;
  const min = Math.min(...counts);
  // If this friend has more than the minimum count, they are locked until others reach the same level.
  return counts[friendIndex] > min;
}

/**
 * Checks whether the current distribution is equal across all friends.
 *
 * @param {number[]} counts
 * @returns {boolean}
 */
export function isDistributionEqual(counts) {
  if (!counts || counts.length === 0) return true;
  const first = counts[0];
  return counts.every(c => c === first);
}

/**
 * Checks whether sharing has reached a fair completed state:
 * - All friends have equal chocolates, AND
 * - The jar has fewer chocolates than the number of friends (cannot give 1 to everyone fairly).
 *
 * @param {number[]} counts
 * @param {number} jarCount
 * @returns {boolean}
 */
export function isFairSharingComplete(counts, jarCount) {
  if (!isDistributionEqual(counts)) return false;
  return jarCount < counts.length;
}

/**
 * Attempts to give one chocolate from the jar to a specified friend.
 * Returns null if the move is invalid (jar empty or friend locked).
 *
 * @param {number} friendIndex
 * @param {number[]} counts
 * @param {number} jarCount
 * @param {boolean} [allowFree=false] - When true, bypasses turn-taking locking for free experimentation
 * @returns {{ counts: number[], jarCount: number } | null}
 */
export function giveChocolate(friendIndex, counts, jarCount, allowFree = false) {
  if (jarCount <= 0) return null;
  if (!allowFree && isFriendLocked(friendIndex, counts)) return null;

  const nextCounts = [...counts];
  nextCounts[friendIndex] += 1;
  return {
    counts: nextCounts,
    jarCount: jarCount - 1
  };
}

/**
 * Returns a chocolate from a friend's plate back to the jar.
 * Allows the student to correct an unequal distribution or undo.
 *
 * @param {number} friendIndex
 * @param {number[]} counts
 * @param {number} jarCount
 * @returns {{ counts: number[], jarCount: number } | null}
 */
export function returnChocolate(friendIndex, counts, jarCount) {
  if (counts[friendIndex] <= 0) return null;

  const nextCounts = [...counts];
  nextCounts[friendIndex] -= 1;
  return {
    counts: nextCounts,
    jarCount: jarCount + 1
  };
}

/**
 * Derives the visual equation representation from the physical sharing results:
 * Total = (Friends × Per Friend) + Leftover
 *
 * @param {number} total
 * @param {number} friendsCount
 * @param {number} perFriend
 * @param {number} leftover
 */
export function deriveEquation(total, friendsCount, perFriend, leftover) {
  return {
    total,
    friendsCount,
    perFriend,
    leftover,
    equationString: `${total} = ${friendsCount} × ${perFriend}${leftover > 0 ? ` + ${leftover}` : ''}`,
    divisionString: `${total} ÷ ${friendsCount} = ${perFriend}${leftover > 0 ? ` (R ${leftover})` : ''}`,
    formalTerms: {
      dividend: total,
      divisor: friendsCount,
      quotient: perFriend,
      remainder: leftover
    }
  };
}

export const giveCandy = giveChocolate;
export const returnCandy = returnChocolate;

// ============================================================================
// GROUPING MODEL (Measurement Division — Stage 3 & Stage 4)
// Known: total quantity, target group size.
// Find: number of complete groups formed, and valid remainder.
// ============================================================================

/**
 * Checks whether an individual group container has reached or exceeded target size.
 */
export function isGroupFull(count, targetSize) {
  return count >= targetSize;
}

/**
 * Checks whether a container has exceeded target size (oversized error).
 */
export function isGroupOversized(count, targetSize) {
  return count > targetSize;
}

/**
 * Checks whether another complete group can be formed from loose items.
 */
export function canMakeMoreGroups(looseCount, targetSize) {
  return looseCount >= targetSize;
}

/**
 * Validates complete grouping state:
 * 1. Every non-empty group is filled exactly to targetSize (none oversized, none partial).
 * 2. Remaining loose items are strictly less than targetSize (a valid remainder that cannot make another group).
 * 3. At least one group is completed (unless total < targetSize).
 */
export function isGroupingComplete(groupCounts, looseCount, targetSize) {
  if (!groupCounts || groupCounts.length === 0) return false;
  const activeGroups = groupCounts.filter((c) => c > 0);
  if (activeGroups.length === 0) return false;

  const allActiveAreExact = activeGroups.every((c) => c === targetSize);
  const remainderIsValid = looseCount < targetSize;
  return allActiveAreExact && remainderIsValid;
}

/**
 * Places one item into a group container from the loose items.
 */
export function giveToGroup(groupIndex, groupCounts, looseCount) {
  if (looseCount <= 0) return null;
  const next = [...groupCounts];
  next[groupIndex] = (next[groupIndex] || 0) + 1;
  return {
    groupCounts: next,
    looseCount: looseCount - 1
  };
}

/**
 * Returns an item from a group container back to the loose source.
 */
export function returnFromGroup(groupIndex, groupCounts, looseCount) {
  if (!groupCounts[groupIndex] || groupCounts[groupIndex] <= 0) return null;
  const next = [...groupCounts];
  next[groupIndex] -= 1;
  return {
    groupCounts: next,
    looseCount: looseCount + 1
  };
}

/**
 * Derives the visual equation representation for grouping (measurement model):
 * Total = (Complete Groups × Group Size) + Leftover
 */
export function deriveGroupingEquation(total, targetSize, completeGroupsCount, leftover) {
  return {
    total,
    groupSize: targetSize,
    completeGroups: completeGroupsCount,
    leftover,
    equationString: `${total} = ${completeGroupsCount} × ${targetSize}${leftover > 0 ? ` + ${leftover}` : ''}`,
    divisionString: `${total} ÷ ${targetSize} = ${completeGroupsCount}${leftover > 0 ? ` (R ${leftover})` : ''}`,
    formalTerms: {
      dividend: total,
      divisor: targetSize,
      quotient: completeGroupsCount,
      remainder: leftover
    }
  };
}

// ============================================================================
// REPAIR MODEL (Stage 5: Error Detection & Correction)
// ============================================================================

/**
 * Validates that an unequal distribution has been repaired:
 * - All recipient plates have equal counts > 0.
 * - The jar has fewer items than recipients (fair distribution complete).
 */
export function isRepairSolved(counts, jarCount) {
  if (!counts || counts.length === 0) return false;
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const isEqual = min === max && min > 0;
  const remainderValid = jarCount < counts.length;
  return isEqual && remainderValid;
}


// ============================================================================
// STAGE 6: ACTION SELECTION (Choose Sharing vs Grouping Model)
// ============================================================================

/**
 * Identifies the mathematical model for an activity problem.
 * Sharing: Known recipients (friends), discover share per friend.
 * Grouping: Known target size, discover number of complete groups.
 *
 * @param {object} problem
 * @returns {'sharing' | 'grouping'}
 */
export function identifyProblemModel(problem) {
  if (!problem) return 'sharing';
  if (problem.targetSize && !problem.friends) return 'grouping';
  if (problem.friends) return 'sharing';
  return 'sharing';
}

/**
 * Validates whether the learner selected the correct model strategy for a visual problem.
 *
 * @param {'sharing' | 'grouping'} selectedModel
 * @param {object} problem
 * @returns {boolean}
 */
export function validateModelSelection(selectedModel, problem) {
  return selectedModel === identifyProblemModel(problem);
}

// ============================================================================
// STAGE 7: REPRESENTATION LADDER (Connect Actions to Quantities & Dot Patterns)
// ============================================================================

/**
 * Validates matching an object collection to a dot card or numeral.
 *
 * @param {number} selectedQuantity
 * @param {number} actualQuantity
 * @returns {boolean}
 */
export function validateQuantityMatch(selectedQuantity, actualQuantity) {
  return selectedQuantity === actualQuantity;
}

/**
 * Validates matching an arrangement (distinguishing e.g. 3 groups of 2 from 2 groups of 3).
 *
 * @param {number} groups
 * @param {number} sizePerGroup
 * @param {number} targetGroups
 * @param {number} targetSize
 * @returns {boolean}
 */
export function validateArrangementMatch(groups, sizePerGroup, targetGroups, targetSize) {
  return groups === targetGroups && sizePerGroup === targetSize;
}

/**
 * Generates an array of dot items for rendering a visual dot-pattern card.
 *
 * @param {number} count
 * @returns {Array<{ id: number, active: boolean }>}
 */
export function generateDotGrid(count) {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, active: true }));
}
