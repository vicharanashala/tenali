/**
 * client/src/lib/scoreApi.js (#92)
 * Client-side helper for reporting score events from self-contained / browser-only games.
 */
export async function reportScoreEvent(event) {
  try {
    const token =
      (typeof localStorage !== 'undefined' && (localStorage.getItem('tenali-token') || localStorage.getItem('token'))) || null;
    if (!token) return null;

    const res = await fetch('/api/score/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to report score event:', err);
    return null;
  }
}
