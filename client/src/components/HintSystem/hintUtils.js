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
