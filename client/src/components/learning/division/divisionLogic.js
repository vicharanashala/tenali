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

