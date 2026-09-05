# Board Case UX Polish — "The Vanished Birthday Cupcakes"

**Date:** 2026-08-08    
**Scope:** A focused UX/readability pass on the board-based crime-scene case ("The Vanished Birthday Cupcakes") in the Math Detective Agency. Visual + behavioral polish only — no new puzzle types, no schema changes.

---

## 1. Background & goals

The board case (`type: 'board'`) renders a 12×12 chalkboard crime scene. The UI shell lives in `client/src/detective-board-app.jsx`, the styling in `client/src/detective-board.css`, Case 1 data in `client/src/detective-board-cases.js`, and the pure logic in `client/src/detective-board-engine.js`.

Learners (ages ~6–9) reported real usability problems, all stemming from low contrast and cognitive load:

1. A **horizontal scrollbar** appears because `.dbc-scene` uses `max-width: min(720px, 100vw)` — on viewports where the padded `.card` is narrower than `100vw`, the board overflows the page.
2. The **intro screen** heading ("Case 001 · Greenleaf Animal School", title) is set in semi-transparent ink on manilla paper, so it washes out.
3. The **briefing** is a long explanatory paragraph — too much text before play.
4. The notebook's **"Current Thoughts"** section lists every collected thought at once; headings and thought text read as faint.
5. The **notebook and suspects panels** slide in but vanish abruptly (conditional unmount kills the exit animation).
6. **Observation objects** (no math — ice cream cart, feather, chalkboard) dump a long sentence of flavor text, then demand a decision.
7. The **Skip** button is light-on-paper (hard to see); the math card's "Skip for now" link is faint too.
8. The **confession narrative** is a long wall of text at the end of the case.

### Goals

1. Remove the horizontal scrollbar on all viewports.
2. Make every heading, label, and thought line readable against the paper surfaces.
3. Cut text load at the three biggest moments: intro briefing, observation interactions, confession.
4. Make notebook thought-reading sequential (one thought at a time) with an opt-in "show all".
5. Smooth open **and** close for the notebook/suspects panels.

### Non-goals

- Changing the board/engine data schema.
- New puzzle types or changes to case 2/3 content.
- Reworking the elimination interaction model (tap-to-select → tap-suspect stays).

---

## 2. Architecture

No new files. Four touched files, each with one clear responsibility:

| File | Change |
|---|---|
| `client/src/detective-board.css` | Scrollbar fix, contrast token bumps, smooth slide-out transitions, skip-button style |
| `client/src/detective-board-engine.js` | Two new pure helpers: `getLatestThought`, `getThoughtsForEvidence` |
| `client/src/detective-board-app.jsx` | Notebook thought panel behavior, observation-card encouragement |
| `client/src/detective-board-cases.js` | Case 1 copy only: briefing + confession |

The helper functions are pure (state + spec in, strings out), matching the existing engine conventions so they stay unit-testable without React.

---

## 3. Design details

### 3.1 Horizontal scrollbar (CSS)

`.dbc-scene` change:

```css
max-width: min(720px, 100%);   /* was min(720px, 100vw) */
```

Add `overflow-x: hidden` to `.dbc-root` as a safety net. The board is a 12×12 `1fr` grid with `width: 100%`, so once the scene can't exceed its parent it fits any viewport.

### 3.2 Intro screen & heading contrast (CSS)

- Intro case tab: inline `color: rgba(42,46,51,0.6)` → `rgba(42,46,51,0.9)`, border darkened.
- `.dbc-paper-scene-title`: bump to `2.1rem`, weight 700, full ink (`#2A2E33`).
- `.dbc-section-label` (used for "Evidence Found", "Current Thoughts", "In class today"): `rgba(42,46,51,0.55)` → full ink `var(--dbc-ink)`.
- `.dbc-card-label`: `rgba(42,46,51,0.6)` → `var(--dbc-ink)`.
- `.dbc-thought-line`: switch from Caveat to Nunito 700, `1.05rem`, full ink — the handwritten face is too thin for body thought text at this size.

### 3.3 Briefing copy (data)

New briefing (short, catchy, keeps the interaction instruction):

> The cupcakes vanished before snack time! Walk the school, Detective — step on anything interesting and find the thief!

### 3.4 Notebook — one thought at a time (engine + app)

New pure helpers:

- `getLatestThought(spec, collectedEvidenceIds)` → the last active `currentThoughts` entry's lines (or `[]`).
- `getThoughtsForEvidence(spec, collectedEvidenceIds, evidenceId)` → every active thought whose `afterEvidenceIds` includes the evidence and are all collected.

Notebook behavior:

- A **Current Thought** panel shows **one** thought: the latest by default.
- Clicking an evidence item still selects it for elimination (existing behavior) **and** swaps the panel to that clue's thought.
- A **"Show all thoughts"** toggle expands to the full active list (the current `getNotebookLines` result); toggling back collapses to the single current thought.
- The section heading becomes **"Current Thought"** (singular) since only one is shown by default.

### 3.5 Smooth open/close (CSS + app)

Convert the notebook/poster from mount + keyframe animation to always-mounted panels with CSS transitions:

- Base state: `transform: translateX(-105%)` (notebook, from left) / `translateX(105%)` (poster, from right), `visibility: hidden` (delayed), `pointer-events: none`.
- `.is-open`: `transform: translateX(0)`, `visibility: visible`, `pointer-events: auto`.
- Backdrop fades via `opacity` with `pointer-events: none` when closed, `aria-hidden` on the closed panels.
- `prefers-reduced-motion` continues to collapse these to instant/no transitions.

The app keeps `notebookOpen` / `posterOpen` booleans (drives the class + Escape handling); only the render/aria pattern changes.

### 3.6 Observation objects (app)

`openObject` for `clueType: 'observation'` shows a short rotated encouragement instead of `obj.observation.text`:

```
"Nice deduction, Detective!" / "Sharp eyes!" / "Good catch!" / "You're on the trail!"
```

The collect button label becomes **"Clue found"**. The follow-up evidence card still shows the existing 1-line evidence text (`obj.evidence.text`) exactly as today — the long `observation.text` sentence is simply never displayed. The observation text stays in the data (harmless) so future cases can reuse it if desired.

### 3.7 Skip button contrast (CSS)

- Observation-card Skip: new ghost-dark style — ink text (`var(--dbc-ink)`), `1.5px solid rgba(42,46,51,0.5)` border, transparent background. Hover keeps the current `translateY(-1px)` lift.
- Math-card "Skip for now" link: `rgba(42,46,51,0.55)` → `rgba(42,46,51,0.85)`.

### 3.8 Confession copy (data)

Shortened `culpritNarrative` (keeps the Mr. B note hook for the future arc):

> Riya's ears droop. "I hid the cupcakes to decorate them as a surprise for the teacher. I just... forgot to ask first." She hands you a folded note. "Mr. B asked me to give you this."

`resolution` and `mrBNote` are unchanged.

---

## 4. Error & edge handling

- **No thoughts yet:** Current Thought panel keeps the existing empty-state copy ("Keep exploring — your thoughts will grow as clues appear.").
- **Evidence with no matching thought:** falls back to the latest thought (avoid a blank panel).
- **Scrollbar fix must hold on ≤500px** (card padding drops to 24px there) — verify with a narrow viewport.
- Reduced motion: no layout shifts; panels just appear/disappear.

## 5. Testing

- New unit tests in `client/src/detective-board.test.jsx`:
  - `getLatestThought` returns the most recent active thought and `[]` when none are collected.
  - `getThoughtsForEvidence` returns thoughts unlocked by a specific evidence (including the multi-evidence final thought once all its evidences are collected).
- Existing mount tests keep passing — assertions target stable strings ("Start the Investigation", "Riya", "Suspects", "1 of 7 clues found").
- Run `npm run lint` and the vitest suite in `client/`.

## 6. Risks & mitigations

- **Always-mounted panels** add two fixed full-height elements to the DOM. Mitigation: `visibility: hidden` + `pointer-events: none` when closed so they're inert and out of the a11y tree.
- **Copy changes** are opinionated. Mitigation: keep the tone warm and grade-appropriate; the evidence line the learner already saw stays identical.
