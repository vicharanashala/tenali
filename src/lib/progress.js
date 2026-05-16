const API_BASE = '/api';

const XP_FIRST_ATTEMPT = 10;
const XP_AFTER_HINT = 5;
const XP_STAGE_COMPLETE = 20;
const XP_MASTERY = 100;

async function fetchProgress(userId) {
  try {
    const res = await fetch(`${API_BASE}/progress/get?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return await res.json();
  } catch (error) {
    console.error('[fetchProgress]', error);
    return [];
  }
}

async function saveProgress(data) {
  try {
    const res = await fetch(`${API_BASE}/progress/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save progress');
    return await res.json();
  } catch (error) {
    console.error('[saveProgress]', error);
    return null;
  }
}

async function recordAttempt(data) {
  try {
    const res = await fetch(`${API_BASE}/attempts/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record attempt');
    return await res.json();
  } catch (error) {
    console.error('[recordAttempt]', error);
    return null;
  }
}

export {
  fetchProgress,
  saveProgress,
  recordAttempt,
  XP_FIRST_ATTEMPT,
  XP_AFTER_HINT,
  XP_STAGE_COMPLETE,
  XP_MASTERY,
};