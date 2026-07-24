/**
 * REFLECTION JOURNAL (Feature CT — platform-wide)
 *
 * A private, always-available reflection journal for the whole application.
 * A floating 📓 button sits on every screen; clicking it toggles a docked
 * side panel on the right where the learner writes free-form notes and,
 * optionally, attaches ("mentions") the question they are currently on.
 *
 * Panel layout: a headerless right-side panel — the quiz/question stays
 * visible next to it. The panel is full-height below the top controls
 * (theme toggle etc.) and horizontally resizable by dragging its left edge
 * (width persists across sessions). Past notes live behind an "All notes"
 * button: each note sits in its own card, 🗑 deletes it, and clicking a card
 * opens it for in-place editing. "Export .txt" downloads the whole journal
 * as a plain-text file. Esc or the 📓 button closes the panel.
 *
 * PLATFORM-WIDE BY DESIGN. Earlier this lived only inside the Car Journey
 * (Feature CR pilot). Here it is a standalone module mounted ONCE at the app
 * root, so it works over every quiz, lab and screen with no per-quiz wiring.
 *
 * MERGE-SAFE / ZERO-TOUCH:
 *  - All code lives in this file + ReflectionJournal.css (owned files upstream
 *    never edits).
 *  - App.jsx is touched in exactly two insertion-only spots: one import and
 *    one <ReflectionJournal /> mount.
 *  - "Mention the current question" reads the question straight from the DOM
 *    at click time (the factory + most quizzes render it in `.question-box`),
 *    so NONE of the ~60 quiz components need to be modified or made aware of
 *    the journal. The captured text is shown in an editable field, so even
 *    where capture is imperfect the learner can fix it before saving.
 *
 * 100% client-side. Entries persist in localStorage under `tenali-journal`.
 * Private to the device — nothing is uploaded.
 */
import { useEffect, useRef, useState } from 'react';
import './ReflectionJournal.css';

const RJ_LS_KEY = 'tenali-journal';
const RJ_WIDTH_KEY = 'tenali-journal-width';
const RJ_MIN_WIDTH = 280;   // px — narrowest useful panel
const RJ_DEFAULT_WIDTH = 380;

function rjLoad() {
  try {
    const j = JSON.parse(localStorage.getItem(RJ_LS_KEY));
    if (j && typeof j === 'object' && Array.isArray(j.entries)) return j;
  } catch { /* corrupt value — start fresh */ }
  return { entries: [] };
}

function rjSave(j) {
  try { localStorage.setItem(RJ_LS_KEY, JSON.stringify(j)); } catch { /* storage full/blocked */ }
}

function rjLoadWidth() {
  const w = parseInt(localStorage.getItem(RJ_WIDTH_KEY), 10);
  return Number.isFinite(w) && w >= RJ_MIN_WIDTH ? w : RJ_DEFAULT_WIDTH;
}

function rjAddEntry(journal, text, quote = null) {
  const entry = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    ts: Date.now(),
    quote: quote || null,   // the mentioned question, verbatim
    text: text.trim(),
  };
  return { entries: [...journal.entries, entry] };
}

function rjRemoveEntry(journal, id) {
  return { entries: journal.entries.filter((e) => e.id !== id) };
}

function rjUpdateEntry(journal, id, text) {
  return { entries: journal.entries.map((e) => (e.id === id ? { ...e, text: text.trim() } : e)) };
}

/** Day streak: consecutive calendar days with ≥1 entry, counting back from
 *  today (or yesterday, so the streak isn't shown as broken before the
 *  learner has had a chance to write today). */
function rjStreak(journal) {
  if (!journal.entries.length) return 0;
  const days = new Set(journal.entries.map((e) => new Date(e.ts).toDateString()));
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(d.toDateString())) { streak += 1; d.setDate(d.getDate() - 1); }
  return streak;
}

function rjEntryDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Download the whole journal as a plain-text file. */
function rjExportTxt(journal) {
  const lines = [...journal.entries].reverse().map((e) => {
    const stamp = new Date(e.ts).toLocaleString();
    return `[${stamp}]${e.quote ? `\nQuestion: ${e.quote}` : ''}\n${e.text}\n`;
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tenali-journal.txt';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Read whatever question is currently on screen, straight from the DOM.
 * The quiz factory and most custom quizzes render the prompt inside
 * `.question-box`; we fall back to any visible element whose class mentions
 * "question". Returns '' when nothing suitable is found — the caller then
 * lets the learner type the reference by hand.
 */
function rjCaptureQuestion() {
  const selectors = ['.question-box', '.ch-question', '[class*="question-text"]', '[class*="question"]'];
  for (const sel of selectors) {
    for (const el of document.querySelectorAll(sel)) {
      if (el.closest('.rj-side')) continue;            // never capture our own UI
      if (el.offsetParent === null) continue;          // skip hidden elements
      const t = (el.innerText || '').replace(/\s+/g, ' ').trim();
      if (t && t.length >= 2 && t.length <= 400) return t;
    }
  }
  return '';
}

export default function ReflectionJournal() {
  const [journal, setJournal] = useState(rjLoad);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('write');          // 'write' | 'notes'
  const [noteDraft, setNoteDraft] = useState('');
  const [quoteDraft, setQuoteDraft] = useState(null); // null = no question attached; '' or text = attached
  const [editingId, setEditingId] = useState(null);   // note being edited in the All-notes view
  const [editDraft, setEditDraft] = useState('');
  const [panelWidth, setPanelWidth] = useState(rjLoadWidth);
  const widthRef = useRef(panelWidth);

  const persist = (next) => { setJournal(next); rjSave(next); };

  const closePanel = () => {
    setOpen(false);
    setView('write');
    setEditingId(null);
  };

  // Esc closes the panel (there is no header ✕ — the 📓 FAB toggles it).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  /** Horizontal-only resize: drag the panel's left edge. */
  const startResize = (e) => {
    e.preventDefault();
    const onMove = (ev) => {
      const max = Math.round(window.innerWidth * 0.7);
      const w = Math.min(Math.max(window.innerWidth - ev.clientX, RJ_MIN_WIDTH), max);
      widthRef.current = w;
      setPanelWidth(w);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove('rj-resizing');
      try { localStorage.setItem(RJ_WIDTH_KEY, String(widthRef.current)); } catch { /* ignore */ }
    };
    document.body.classList.add('rj-resizing');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const attachQuestion = () => {
    const captured = rjCaptureQuestion();
    setQuoteDraft(captured); // may be '' — the editable field lets them type it
  };

  const saveNote = () => {
    if (!noteDraft.trim()) return;
    const q = quoteDraft && quoteDraft.trim() ? quoteDraft.trim() : null;
    persist(rjAddEntry(journal, noteDraft, q));
    setNoteDraft('');
    setQuoteDraft(null);
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditDraft(e.text);
  };

  const saveEdit = () => {
    if (!editDraft.trim()) return;
    persist(rjUpdateEntry(journal, editingId, editDraft));
    setEditingId(null);
  };

  const streak = rjStreak(journal);

  return (
    <>
      <button
        className="rj-fab"
        title={open ? 'Close journal' : 'Reflection journal'}
        onClick={() => (open ? closePanel() : setOpen(true))}
      >
        📓{streak > 0 && <span className="rj-streak-badge">🔥{streak}</span>}
      </button>

      {open && (
        <aside className="rj-side" style={{ width: panelWidth }}>
          <div className="rj-resizer" title="Drag to resize" onPointerDown={startResize} />

          {view === 'write' ? (
            <div className="rj-newnote">
              <textarea
                className="rj-textarea"
                rows={3}
                placeholder="What clicked? What's still fuzzy? Write it for future-you…"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />

              {quoteDraft === null ? (
                <button className="rj-mention-btn" onClick={attachQuestion}>
                  📎 Mention the question I'm on
                </button>
              ) : (
                <div className="rj-mention-box">
                  <label className="rj-mention-label">📎 Question mentioned (edit if needed):</label>
                  <div className="rj-mention-row">
                    <input
                      className="rj-mention-input"
                      value={quoteDraft}
                      placeholder="Type or paste the question…"
                      onChange={(e) => setQuoteDraft(e.target.value)}
                    />
                    <button className="rj-mention-remove" title="Remove" onClick={() => setQuoteDraft(null)}>✕</button>
                  </div>
                </div>
              )}

              <div className="rj-actions">
                <button
                  className="rj-btn rj-btn-soft rj-btn-icon"
                  onClick={() => setView('notes')}
                  title={`All notes${journal.entries.length > 0 ? ` (${journal.entries.length})` : ''}`}
                  aria-label={`All notes${journal.entries.length > 0 ? ` (${journal.entries.length})` : ''}`}
                >
                  🗂
                </button>
                <button
                  className="rj-btn rj-btn-icon"
                  disabled={!noteDraft.trim()}
                  onClick={saveNote}
                  title="Save note"
                  aria-label="Save note"
                >
                  🔖
                </button>
              </div>
            </div>
          ) : (
            <div className="rj-notes">
              <div className="rj-notes-bar">
                <button className="rj-btn rj-btn-soft" onClick={() => { setView('write'); setEditingId(null); }}>
                  ← Write
                </button>
                <button
                  className="rj-btn rj-btn-soft"
                  disabled={!journal.entries.length}
                  onClick={() => rjExportTxt(journal)}
                >
                  ⬇ Export .txt
                </button>
              </div>

              <div className="rj-notes-list">
                {journal.entries.length === 0 ? (
                  <p className="rj-empty">No entries yet. Jot the first thing that clicks.</p>
                ) : (
                  [...journal.entries].reverse().map((e) => (
                    <div
                      key={e.id}
                      className={`rj-entry${editingId === e.id ? ' editing' : ''}`}
                      onClick={() => { if (editingId !== e.id) startEdit(e); }}
                    >
                      <div className="rj-entry-meta">
                        <span>{rjEntryDate(e.ts)}</span>
                        <button
                          className="rj-delete"
                          title="Delete note"
                          onClick={(ev) => { ev.stopPropagation(); persist(rjRemoveEntry(journal, e.id)); if (editingId === e.id) setEditingId(null); }}
                        >
                          🗑
                        </button>
                      </div>
                      {e.quote && <blockquote className="rj-quote">{e.quote}</blockquote>}
                      {editingId === e.id ? (
                        <div className="rj-edit" onClick={(ev) => ev.stopPropagation()}>
                          <textarea
                            className="rj-textarea"
                            rows={3}
                            value={editDraft}
                            autoFocus
                            onChange={(ev) => setEditDraft(ev.target.value)}
                          />
                          <div className="rj-actions">
                            <button className="rj-btn rj-btn-soft" onClick={() => setEditingId(null)}>Cancel</button>
                            <button className="rj-btn" disabled={!editDraft.trim()} onClick={saveEdit}>Save</button>
                          </div>
                        </div>
                      ) : (
                        <p className="rj-entry-text">{e.text}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
}
