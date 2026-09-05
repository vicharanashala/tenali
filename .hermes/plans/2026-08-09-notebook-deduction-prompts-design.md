# Notebook Deduction Prompts — Design

**Date:** 2026-08-09
**Scope:** Rework the **Current Thoughts** section of the detective notebook for board cases (Case 1, "The Vanished Birthday Cupcakes") so it *helps the child think like a detective, not think for them*: short questions + visual suspect comparisons + the child's own decision, with escalating owl hints on incorrect choices.

---

## 1. Background & context

Board cases (`detective-board-app.jsx`) persist a spiral notebook with two sections: **Evidence Found** and **Current Thoughts**. Today `currentThoughts` is an array of prose entries (`{ afterEvidenceIds, lines }`) rendered as plain text lines. The deduction is fully spelled out ("The kitchen print is 15 cm long — far too big for tiny Mila's 4 cm paws!"). Elimination happens in a separate flow: select an evidence card in the notebook, then tap a suspect in the suspect poster.

**Problem:** the notebook does the reasoning for the child. Long paragraphs raise cognitive load for ages ~6–9 and remove the "aha" moment.

### Goals

1. Make the notebook the **primary deduction interface**: relevant evidence + suspect characteristics + a short question; the child makes the elimination decision.
2. Keep every deduction solvable without revealing the answer in the prompt.
3. Incorrect choices keep the suspect active and trigger escalating owl hints.
4. Apply the prompt treatment to the three elimination clues; keep the four flavour clues as short one-line observations.
5. Demote the suspect poster to a collapsible reference/progress view (profiles, eliminated stamps + short reasons, Accuse button).

### Non-goals

- Changing movement, math interactions, band adaptation, persistence, or the confession flow.
- Changing cases 2–3 (pure data, future).
- Any server-side work.

---

## 2. Data model — `currentThoughts` union

Each entry keeps `afterEvidenceIds` (activation logic unchanged). Three `kind`s:

### `prompt` (the 3 elimination clues)

The answer is **not stored** — it is derived from `eliminationRules` by the engine.

```js
{
  kind: 'prompt',
  afterEvidenceIds: ['ev-footprints'],
  evidenceEmoji: '👣',
  evidenceShort: 'Footprint — 15 cm',
  question: 'Which suspect\u2019s footprint is too tiny?',
  compare: [
    { suspectId: 'leo',  value: '16 cm' },
    { suspectId: 'mila', value: '4 cm' },
    { suspectId: 'teddy', value: '18 cm' },
    { suspectId: 'riya', value: '9 cm' },
  ],
  hint1: 'The print is 15 cm. Whose paws can\u2019t even reach that?',
  hint2: 'Who has the smallest paws in class?',
}
```

Case 1 authored prompts:

| Clue | Question | Comparisons | Answer |
|---|---|---|---|
| `ev-footprints` | Which suspect's footprint is too tiny? | Leo 16 cm · Mila 4 cm · Teddy 18 cm · Riya 9 cm | `mila` |
| `ev-clock` | Who couldn't be in the kitchen at 9:40? | Leo "gym at 9:40" · Mila "on time" · Teddy "late (after the rain)" · Riya "early, always" | `leo` |
| `ev-muddy` | Whose prints were old and dry — before the rain? | Teddy "old · dry" · Leo "fresh · wet" · Mila "fresh · wet" · Riya "fresh · wet" | `teddy` |

### `note` (the 4 flavour clues — icon + one short line)

```js
{ kind: 'note', afterEvidenceIds: ['ev-icecream'], emoji: '🍦', text: 'Only vanilla left — someone took the last chocolate scoop.' }
```

Milk, ice cream cart, blue feather, chalkboard note all use this shape (existing text shortened to one line).

### `aha` (the final conclusion)

```js
{
  kind: 'aha',
  afterEvidenceIds: ['ev-footprints', 'ev-clock', 'ev-muddy'],
  emoji: '🧠',
  text: 'Mila, Leo and Teddy all have alibis — only one classmate is left!',
  nudge: 'Open Suspects and accuse Riya!',
}
```

### Suspect data

Replace the long `motiveContext` paragraph (shown on eliminated cards) with a short authored `eliminatedReason`:

```js
eliminatedReason: "Only 4 cm paws — too tiny for a 15 cm print.",
```

`motiveContext` is removed from the suspect objects.

---

## 3. Engine changes — `detective-board-engine.js`

- `getNotebookLines(spec, collectedEvidenceIds)` → returns **active entry objects** (filter/order unchanged).
- `getLatestThought` → newest single active **entry object**.
- `getThoughtsForEvidence` → active entry objects whose `afterEvidenceIds` include the given evidence.
- **New** `promptAnswer(spec, promptEntry)` → the suspect eliminated by the prompt's evidence (resolved from `eliminationRules`; null if none). Pure, single source of truth.
- `validateBoardSpec` extensions:
  - `kind` must be `'prompt' | 'note' | 'aha'`.
  - `note`: requires `emoji` + `text`.
  - `prompt`: requires `question`, `compare` (array, ≥2 rows, each `suspectId` a real suspect), exactly two hints (`hint1`, `hint2`), and at least one `afterEvidenceIds` id present in `eliminationRules`.
  - `aha`: requires `text`.
  - Existing checks (real evidence ids, duplicate ids, etc.) unchanged.

---

## 4. UI & interaction — `detective-board-app.jsx`

### Current Thoughts rendering

The section renders active entries by kind:

- **`note`** → `.dbc-thought-note` (emoji + short line).
- **`prompt`** → `.dbc-prompt-card`: evidence chip (`evidenceEmoji + evidenceShort`) → question → **tappable comparison rows** (emoji + name + value).
- **`aha`** → `.dbc-aha-card`: conclusion + an **Open Suspects** button (`setPosterOpen(true)`).

Default view shows the **latest** entry; tapping an evidence card in Evidence Found filters to that clue's entry (`getThoughtsForEvidence`); the existing **Show all thoughts (N)** toggle stacks every active entry.

### Deduction interaction

New `handlePromptEliminate(evidenceId, suspectId)` → `applyElimination(engine, story, evidenceId, suspectId)`:

- **Correct** → stamp SFX, `setEngine`, suspect eliminated (row shows ✓, poster updates), mascot praise including the short reason (e.g. *"Eliminated! Mila's paws are only 4 cm — far too tiny."*). When `onlyCulpritRemains` → solved mascot nudge.
- **Incorrect** (`no-contradiction`) → wrong SFX, suspect stays active, brief shake on the tapped row, inline hint appears in the card. A `promptMisses` counter per evidence id escalates: 1st miss → `hint1`, 2nd+ → `hint2`. **Unlimited attempts.**
- `already` / `not-collected` are guarded (rows for eliminated suspects aren't tappable; prompts only render once their evidence is collected).

`promptMisses` is ephemeral component state (not persisted in the board snapshot).

### Poster becomes a reference view

- Remove drag-and-drop on evidence cards, `handleDrop`, `handleSuspectTap`, `is-target` highlighting.
- `selectedEvidenceId` is repurposed as a **notebook evidence → thought filter** only (no poster coupling).
- Suspect cards: profiles + eliminated stamp + short `eliminatedReason`; not tappable. The **Accuse [name]** button remains (only appears when `onlyCulpritRemains`).

---

## 5. Visual design — `detective-board.css`

Extends the existing "Chalk & Case File" identity; no palette/type changes.

- `.dbc-thought-note` — one-line observation (icon inline, Nunito 700).
- `.dbc-prompt-card` — manilla card, dashed border, ~paper surface.
- `.dbc-prompt-evidence` — small evidence chip (reuses `--dbc-tag` tint).
- `.dbc-prompt-question` — Caveat display, largest element in the card.
- `.dbc-prompt-row` — tappable comparison row; hover lift; states:
  - `.is-answered` — correct suspect: green ✓, dimmed, non-interactive.
  - `.is-wrong` — brief shake (`prefers-reduced-motion` collapses to a fade).
- `.dbc-prompt-hint` — hint line, `--dbc-ink-soft`, appears after a miss.
- `.dbc-aha-card` + `.dbc-aha-nudge` — conclusion + Open Suspects button.
- Reuse `.dbc-stamp`/`.dbc-motive-line` styling for the poster's eliminated card (now showing `eliminatedReason`).

Touch targets ≥ 44px for rows; keyboard operability (Enter/Space) on rows; `aria-label` on each row (e.g. "Choose Mila — 4 cm paws").

---

## 6. Testing — `client/src/detective-board.test.jsx`

**Engine:**
- Update `getNotebookLines` / `getLatestThought` / `getThoughtsForEvidence` tests to entry-object shape.
- `promptAnswer` resolves `mila`/`leo`/`teddy` for the three prompts; null for a note.
- Validator: spec passes; missing `question` fails; `compare` with unknown suspect fails; prompt whose evidence has no elimination rule fails.

**UI (mount tests):**
- Prompt renders evidence chip, question, and 4 comparison rows.
- Tapping the correct suspect eliminates it (poster suspect gains `is-eliminated`, `onComplete` unchanged); tapping a wrong suspect shows a hint and leaves the suspect active.
- Second wrong tap escalates to `hint2`.
- Notes render as short lines; the `aha` renders its conclusion + Open Suspects button.
- Existing suite (exit dialog, resume, engine) stays green.

---

## 7. Verification

- `vitest run src/detective-board.test.jsx` in `client/`.
- `eslint` on `detective-board-app.jsx`, `detective-board-cases.js`, `detective-board-engine.js`, `detective-board.css`-adjacent files.
- Manual pass in dev: open notebook → solve footprints → tap suspects in the prompt (wrong → hint, right → eliminate) → verify poster stamp + short reason → accuse Riya → confession.

---

## 8. Out of scope

- Cases 2–3 data (future).
- Movement, math variants, band adaptation, persistence/resume, confession content.
- Server-side work.
