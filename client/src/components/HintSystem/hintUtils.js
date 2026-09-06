export const API = import.meta.env.VITE_API_BASE_URL || '';

export function getLocalXp() {
  try {
    const val = localStorage.getItem('tenali_xp');
    return val ? parseInt(val, 10) : 300;
  } catch { return 300; }
}

export function setLocalXp(val) {
  try { localStorage.setItem('tenali_xp', val.toString()); } catch {}
}

export function changeXp(delta) {
  const current = getLocalXp();
  const next = Math.max(0, current + delta);
  setLocalXp(next);
  return next;
}

export function recordDailyStreak() {
  try {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayStr = istTime.toISOString().split('T')[0];
    const lastActive = localStorage.getItem('tenali-last-active-date');
    let currentStreak = parseInt(localStorage.getItem('tenali-streak') || '0', 10);

    if (!lastActive || currentStreak < 1) {
      currentStreak = 1;
    } else if (lastActive !== todayStr) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak = (currentStreak || 0) + 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }

    localStorage.setItem('tenali-last-active-date', todayStr);
    localStorage.setItem('tenali-streak', String(currentStreak));
    try {
      window.dispatchEvent(new CustomEvent('tenali-streak-change', { detail: { streak: currentStreak } }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    return currentStreak;
  } catch (e) {
    console.error('Error recording streak:', e);
    return 1;
  }
}
