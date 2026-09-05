 # Board Case Elimination Polish — Design

**Date:** 2026-08-16
**Scope:** Three UX fixes to the board-based crime-scene cases (Math Detective Agency, `type: 'board'`): (1) stop the mascot tab from overlapping the game board, (2) auto-open the suspect poster with its short elimination (stamp) animation whenever the child eliminates a suspect from the notebook, and (3) make already-answered deduction prompts visibly "resolved" and non re-answerable in a way that feels native to the case-file UI.

---

## 1. Background & context

Board cases (`client/src/detective-board-app.jsx`, `BoardCasePlay`) render a 12×12 chalkboard crime scene with a spiral notebook (Evidence Found + Current Thoughts) and a suspect poster. Since the "notebook deduction prompts" work, elimination happens **inside the notebook**: the child taps a suspect comparison row in a prompt card (`handlePromptEliminate`), and a correct tap calls `applyElimination`.

Three problems were reported:

1. **Mascot overlaps the board.** The `.dbc-mascot-bar` floats over the board's top edge via `margin-bottom: -1.05rem` + `z-index: 2` (detective-board.css:291-305), covering the board's border/padding and reading as broken.
2. **No elimination feedback moment.** The suspect poster's `ELIMINATED` stamp (`dbc-stamp-slam`) and card shake (`dbc-stamp-shake`) play on the poster, but the poster stays mounted hidden while eliminated — so the animation plays invisibly when the child eliminates from the notebook. The satisfying "slam" from the old tap-the-suspect version is lost.
3. **Answered prompts look unfinished and are re-answerable.** After a correct answer, only the correct suspect's row is disabled (detective-board-app.jsx:487-497); the other rows remain tappable and the card does not fade, so the child can't tell which deductions are done.

### Goals

1. Mascot sits fully above the board — its own row, never overlapping board content.
2. On a correct elimination in the notebook: the suspect poster opens **while the notebook stays open**, the stamp + shake animation plays on screen, and the poster closes again (~1.15s). On the **final** elimination (only the culprit remains) the poster stays open so the child can tap **Accuse [name]!** immediately.
3. A deduction prompt whose elimination is done fades to `opacity: 0.6` (matching eliminated poster cards), all its comparison rows are disabled, and the correct row keeps its green ✓.

### Non-goals

- Changing movement, math cards, band adaptation, persistence/resume, confession, case data, or the engine's pure logic.
- Any server-side work.
- Cases 2-3 content.

---

## 2. Design details

### 2.1 Mascot fully above the board — `detective-board.css`

- `.dbc-mascot-bar` (line ~291): remove `margin-bottom: -1.05rem`, `position: relative`, and `z-index: 2`. Restore a symmetric `border-radius: 14px` (the asymmetric `14px 14px 8px 8px` only made sense when the board covered its bottom edge).
- Keep `align-self: center` + `max-width: 100%` so the mascot remains a centered pill in its own row directly above the board.
- `.dbc-board-wrap` (line ~136): remove the now-unneeded `z-index: 1`.

Net effect: mascot row → board, normal flex gap, no overlap at any viewport width.

### 2.2 Auto-open suspect poster on elimination — `detective-board-app.jsx`

In the correct branch of `handlePromptEliminate` (line ~409), after `setEngine(res.state)`:

1. `setPosterOpen(true)` — the notebook is **not** closed; the poster slides in from the right over the shared dim (see 2.3).
2. If `onlyCulpritRemains(story, res.state)` → **no** timer; the poster stays open so the child can accuse.
3. Otherwise → `clearTimeout(posterTimer.current)` then `posterTimer.current = setTimeout(() => setPosterOpen(false), POSTER_STAMP_MS)`.

New module constant `POSTER_STAMP_MS = 1150` (slide-in 0.28s + `dbc-stamp-slam` 0.4s + card shake 0.45s + margin before slide-out).

- Add `const posterTimer = useRef(null)` alongside `toastTimer` (line ~228).
- Clear `posterTimer.current` at the top of the correct branch (a second elimination can't preempt an in-flight close) and on unmount — extend the existing cleanup effect at line ~279.
- Why the animation plays: the eliminated suspect's `.dbc-stamp` element (`{s.eliminated && …}`) mounts in the same render that flips `posterOpen` to true, so `dbc-stamp-slam` + the `.dbc-suspect-card.is-eliminated` shake run while the poster is visible. No replay hack needed; each suspect's stamp mounts only once.

### 2.3 Shared dim while notebook + poster are open — `detective-board-app.jsx`

Two independent `.dbc-overlay-backdrop` elements (notebook line ~740, poster line ~800) each paint `rgba(10,8,7,0.55)`; with both open the screen would double-dim (~0.8).

- The poster backdrop's class becomes `is-open` only when `posterOpen && !notebookOpen`.
- When the notebook is open, the poster drawer slides over the notebook's existing dim. Its ✕ close and Accuse buttons remain interactive; the Escape handler order is unchanged (closes notebook first, then poster).
- Also fixes the existing aha-nudge path ("Open Suspects and accuse Riya!" while the notebook is open).

### 2.4 Answered prompt cards — `detective-board-app.jsx` + `detective-board.css`

In `renderThoughtEntry` (prompt branch, line ~476):

- `const answeredId = promptAnswer(story, entry);` and `const answered = !!answeredId && engine.eliminatedIds.includes(answeredId);`
- Card class: `dbc-prompt-card${answered ? ' is-done' : ''}`.
- Comparison rows: `disabled={eliminated || answered}` and guard the click with `!eliminated && !answered`.
- Suppress the inline hint once answered (`const hint = answered ? null : …`).
- The correct row keeps its existing `is-answered` green ✓ + mint border.

CSS (`detective-board.css`, near the prompt-card rules ~line 680):

```css
.dbc-prompt-card.is-done { opacity: 0.6; }
.dbc-prompt-card.is-done .dbc-prompt-row:hover { transform: none; box-shadow: none; border-color: rgba(42, 46, 51, 0.25); }
```

`opacity: 0.6` mirrors `.dbc-suspect-card.is-eliminated` (line ~895), so "resolved" uses the same visual language as the poster. `.dbc-prompt-row:disabled` (already `opacity: 0.75`, `cursor: default`) covers the rows.

---

## 3. Error & edge handling

- **Rapid eliminations:** the pending poster-close timer is cleared before scheduling a new one, so an earlier auto-close can't close the poster during the next stamp.
- **Final elimination:** no timer — the poster stays; Accuse is the CTA. The child can still dismiss with ✕ / Escape if they want to keep gathering clues.
- **Reduced motion:** `prefers-reduced-motion` collapses the slam/shake to fades (existing rule, line ~1216); the ~1.15s poster window still applies — short and predictable.
- **Wrong answers:** unchanged (shake + escalating hint on the tapped row); no poster interaction.
- **Resume/persistence:** `posterOpen`, `notebookOpen`, and the poster timer are not persisted — unchanged behavior. `promptMisses` stays ephemeral.
- **Narrow phones:** with both drawers open the poster (right, on top) may overlap the notebook's right edge for the ~1.15s flash; acceptable and brief.

---

## 4. Testing — `client/src/detective-board.test.jsx`

New UI (mount) tests in the existing `Board case integration` describe block:

1. **Prompt elimination opens the poster:** render with a snapshot that has `ev-footprints` collected and no eliminations; open the notebook (tap Notebook toggle), tap the "Mila" prompt row; assert the poster has `is-open`.
2. **Non-final elimination auto-closes the poster:** same setup with `vi.useFakeTimers()`; after the correct tap, advance `POSTER_STAMP_MS`; assert the poster no longer has `is-open` and the notebook is still open.
3. **Final elimination keeps the poster open:** snapshot with `mila` and `leo` already eliminated; eliminate `teddy` via the UI; assert the poster still has `is-open` and the **Accuse** button is present.
4. **Answered prompt is done and locked:** after a correct answer, assert the prompt card has `is-done` and every `.dbc-prompt-row` in it is `disabled`.
5. Existing engine + integration tests stay green (the full detective-flow test drives the engine directly, untouched).

Run: `vitest run src/detective-board.test.jsx` in `client/`; `npm run lint`.

---

## 5. Files touched

| File | Change |
|---|---|
| `client/src/detective-board-app.jsx` | Poster auto-open/close + timer; shared-dim backdrop condition; answered-prompt detection + locking; `POSTER_STAMP_MS` |
| `client/src/detective-board.css` | Mascot no-overlap; remove board-wrap z-index; `.dbc-prompt-card.is-done` |
| `client/src/detective-board.test.jsx` | New UI tests for poster open/close, final elimination, answered prompts |

No engine, data, server, or chrome (theme/settings/coins) changes.

---

## 6. Out of scope

- Case content (cases 2-3), movement, math variants, band adaptation, persistence, confession copy.
- The global chrome z-index layering (already resolved separately).
- Server-side work.
