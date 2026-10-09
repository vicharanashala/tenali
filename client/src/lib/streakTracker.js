/**
 * Daily Streak Tracking Utility for Tenali (#324)
 * 
 * Manages daily streak persistence in localStorage under:
 * - `tenali-streak`: integer streak count
 * - `tenali-last-active-date`: string date format YYYY-MM-DD
 * 
 * Dispatches custom events when streak updates:
 * - `tenali-streak-change`: detail { streak, lastActiveDate, incremented, isStreakActiveToday }
 * - `tenali-xp-float`: detail { text, amount }
 */

export const STREAK_KEY = 'tenali-streak';
export const LAST_ACTIVE_KEY = 'tenali-last-active-date';

/**
 * Format a Date object to YYYY-MM-DD in local time zone
 */
export function getTodayString(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's YYYY-MM-DD string
 */
export function getYesterdayString(dateObj = new Date()) {
  const yesterday = new Date(dateObj);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayString(yesterday);
}

/**
 * Reads and computes the current streak status from localStorage
 */
export function getStreakData() {
  try {
    const rawStreak = localStorage.getItem(STREAK_KEY);
    const lastActiveDate = localStorage.getItem(LAST_ACTIVE_KEY) || null;
    const today = getTodayString();
    const yesterday = getYesterdayString();

    const streakVal = parseInt(rawStreak, 10);
    const parsedStreak = isNaN(streakVal) ? 0 : Math.max(0, streakVal);

    if (!lastActiveDate) {
      return {
        streak: 0,
        lastActiveDate: null,
        isStreakActiveToday: false,
        streakStatus: 'none',
      };
    }

    if (lastActiveDate === today) {
      return {
        streak: parsedStreak,
        lastActiveDate,
        isStreakActiveToday: true,
        streakStatus: 'active',
      };
    }

    if (lastActiveDate === yesterday) {
      return {
        streak: parsedStreak,
        lastActiveDate,
        isStreakActiveToday: false,
        streakStatus: 'intact',
      };
    }

    // Missed 1+ days -> streak reset to 0 until activity recorded
    return {
      streak: 0,
      lastActiveDate,
      isStreakActiveToday: false,
      streakStatus: 'broken',
    };
  } catch (err) {
    console.warn('[streakTracker] Error reading streak data:', err);
    return {
      streak: 0,
      lastActiveDate: null,
      isStreakActiveToday: false,
      streakStatus: 'error',
    };
  }
}

/**
 * Records a practice/problem activity for today.
 * Increments streak if last active was yesterday, maintains if today, resets to 1 if missed.
 */
export function recordActivity() {
  try {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const currentData = getStreakData();

    let newStreak = 1;
    let incremented = false;

    if (currentData.lastActiveDate === today) {
      // Already active today
      newStreak = currentData.streak;
      incremented = false;
    } else if (currentData.lastActiveDate === yesterday) {
      // Extending streak from yesterday
      newStreak = currentData.streak + 1;
      incremented = true;
    } else {
      // New streak starting today
      newStreak = 1;
      incremented = true;
    }

    localStorage.setItem(STREAK_KEY, String(newStreak));
    localStorage.setItem(LAST_ACTIVE_KEY, today);

    const eventDetail = {
      streak: newStreak,
      lastActiveDate: today,
      incremented,
      isStreakActiveToday: true,
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tenali-streak-change', { detail: eventDetail })
      );

      if (incremented) {
        window.dispatchEvent(
          new CustomEvent('tenali-xp-float', {
            detail: {
              text: `🔥 ${newStreak} Day Streak!`,
              amount: 25,
            },
          })
        );
      }
    }

    return eventDetail;
  } catch (err) {
    console.warn('[streakTracker] Error recording activity:', err);
    return { streak: 0, lastActiveDate: null, incremented: false, isStreakActiveToday: false };
  }
}

/**
 * Reset streak to 0 (e.g. for testing or profile reset)
 */
export function resetStreak() {
  try {
    localStorage.removeItem(STREAK_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tenali-streak-change', {
          detail: { streak: 0, lastActiveDate: null, incremented: false, isStreakActiveToday: false },
        })
      );
    }
  } catch (err) {
    console.warn('[streakTracker] Error resetting streak:', err);
  }
}
