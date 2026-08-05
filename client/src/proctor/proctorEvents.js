/**
 * proctorEvents.js — Utility to send proctor events to the server.
 *
 * Features:
 *   - Retry logic (1 retry after 2s on failure)
 *   - localStorage fallback for failed events (retried on next connection)
 *   - Request timeout (5s via AbortController)
 */

const API = import.meta.env?.VITE_API_BASE_URL || '';
const STORAGE_KEY = 'tenali_proctor_pending_events'
const RETRY_DELAY_MS = 2000
const REQUEST_TIMEOUT_MS = 5000

function getToken() {
  try { return localStorage.getItem('tenali-auth-token') || null } catch { return null }
}

function getPendingEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function savePendingEvents(events) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch { /* quota exceeded */ }
}

function addToPending(event) {
  const pending = getPendingEvents()
  pending.push({ ...event, _pendingAt: Date.now() })
  if (pending.length > 50) pending.splice(0, pending.length - 50)
  savePendingEvents(pending)
}

export async function reportProctorEvent({ sessionId, type, severity = 1, evidence, metadata, transcript, sessionStatus }) {
  const token = getToken();
  if (!sessionId) return null;

  const body = { sessionId, type, severity, evidence, metadata, transcript, sessionStatus };

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Try with retry
  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const r = await fetch(`${API}/api/proctor/event`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout)
      if (r.ok) {
        retryPendingEvents(token)
        return await r.json()
      }
    } catch {
      if (attempt === 0) await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
    }
  }

  addToPending(body)
  return null
}

async function retryPendingEvents(token) {
  const pending = getPendingEvents()
  if (pending.length === 0) return

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const remaining = []
  for (const event of pending) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const { _pendingAt, ...body } = event
      const r = await fetch(`${API}/api/proctor/event`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout)
      if (!r.ok) remaining.push(event)
    } catch {
      remaining.push(event)
    }
  }
  savePendingEvents(remaining)
}

export async function startProctorSession({ quizType, settings, consentGiven }) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const r = await fetch(`${API}/api/proctor/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ quizType, settings, consentGiven }),
      signal: controller.signal,
    });
    clearTimeout(timeout)
    return r.ok ? await r.json() : null;
  } catch { return null }
}

export async function endProctorSession(sessionId) {
  if (!sessionId) return null;
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const r = await fetch(`${API}/api/proctor/end`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId }),
      signal: controller.signal,
    });
    clearTimeout(timeout)
    return r.ok ? await r.json() : null;
  } catch { return null }
}

export async function submitEmotion({ quizType, emotion, feedback }) {
  const token = getToken();
  if (!token) return null;
  try {
    const r = await fetch(`${API}/api/emotions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ quizType, emotion, feedback }),
    });
    return r.ok ? await r.json() : null;
  } catch { return null }
}

export async function captureScreenshot(videoElement) {
  if (!videoElement) return null;
  try {
    const canvas = document.createElement('canvas');
    const maxDim = 480
    const vw = videoElement.videoWidth || 320
    const vh = videoElement.videoHeight || 240
    const scale = Math.min(maxDim / vw, maxDim / vh, 1)
    canvas.width = Math.round(vw * scale)
    canvas.height = Math.round(vh * scale)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch { return null }
}

export async function reportProctorEventWithScreenshot({ sessionId, type, severity = 1, videoRef }) {
  let screenshot = null;
  if (videoRef?.current) {
    screenshot = await captureScreenshot(videoRef.current);
  }
  return reportProctorEvent({ sessionId, type, severity, evidence: screenshot });
}
