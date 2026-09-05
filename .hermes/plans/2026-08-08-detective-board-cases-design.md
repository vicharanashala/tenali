# Detective Board Cases — Design

**Date:** 2026-08-08
**Scope:** A new board-based crime-scene case type inside the Math Detective Agency, plus Case 1 ("The Vanished Birthday Cupcakes"), with a data schema that supports a 3-case interconnected arc (Cases 2–3 are future data additions).

---

## 1. Background & context

The Math Detective Agency (`client/src/detective-app.jsx`, mounted at `modeMap.detective`) is currently a **text-based** case experience: a case library of stage-based cases plus "enhanced" cases with suspects, evidence, elimination and accusation. It already provides:

- `DetectiveMascot` (emoji badge + speech pill), sounds (Web Audio), progressive hints
- Suspect lineup, evidence panel, elimination via multiple-choice reasoning, accusation
- XP / ranks / progress persisted in `localStorage` key `tenali-detective-progress`
- Case dedup (`usedCaseIds`), age gating via `AGE_TOPIC_MAP` (minimum age per topic)
- Dynamic case generators (`detective-generators.js`) with randomized numbers

**What is missing:** any spatial/exploration experience. The requested feature is a **2D board-based crime scene** — a 12×12 grid the learner walks a detective around, interacting with objects that reveal clues. Some objects need contextual math (math is the detective tool); others are pure observation. Evidence is stored in a notebook; suspects are eliminated on a collapsible suspect board by dragging evidence onto them; a mascot assistant nudges struggling learners through hints and a simpler variant.

This design is intentionally for **younger learners (ages ~6–9, UKG–Class 4)**: Case 1's math is 2nd-grade level (addition/subtraction within 100, money ₹, measurement in cm, clock reading, counting, simple tables).

### Goals

1. Add a board-based case type (`type: 'board'`) to the Detective Agency that reuses the existing progress/XP/ranks/mascot/sound machinery.
2. Deliver Case 1 fully authored: "The Vanished Birthday Cupcakes" at Greenleaf Animal School.
3. Implement the three independent engines cleanly: **Investigation** (movement, interactions, notebook, suspect board), **Learning** (silent difficulty bands, hints, simpler-variant fallback, between-case mastery), **Narrative** (case data, dialogues, culprit motivation, Mr. B note).
4. Make Cases 2 & 3 pure data additions later (including the elephant mastermind reveal).

### Non-goals (this iteration)

- Building Cases 2 and 3.
- Replacing or refactoring the existing text-based case system.
- Any server-side changes (the board case is fully client-side, like the rest of the detective app).
- Real "drag physics" beyond drag-and-drop / tap-tap; no pixel-perfect physics engine.

---

## 2. Architecture

Three new files + a small router change in `detective-app.jsx`.

| File | Responsibility | Engine |
|---|---|---|
| `client/src/detective-board-engine.js` | Pure, framework-free logic: board model, movement, interaction resolution, hint ladder, silent difficulty band, evidence↔suspect contradiction matching, notebook summary, gradual profile reveal. No React, no DOM. | Investigation + Learning |
| `client/src/detective-board-cases.js` | **Data only.** `BOARD_CASES` registry; Case 1 authored as a board spec. Exports `getBoardCase(id)` and `validateBoardCase(spec)`. | Narrative |
| `client/src/detective-board-app.jsx` | `BoardCasePlay` React shell: 12×12 grid, hat-marked detective, on-screen D-pad, notebook overlay, suspect poster overlay, mascot bar, math interaction card, confession scene. | Presentation |
| `client/src/detective-board.css` | Scoped visual identity (see §8). All classes prefixed `.dbc-`. | Presentation |
| `detective-app.jsx` (small edit) | Case-library router: cases with `type: 'board'` render `BoardCasePlay`. Add `boardMastery` to the persisted progress default shape. Respect optional `maxAge` in the age filter. | Glue |

**Why three separate files:** the user explicitly asked for three independent engines, and the design-for-isolation principle applies — engine is pure & unit-testable, data is declarative & validated, UI is a thin shell. Cases 2–3 then require only `detective-board-cases.js` edits (plus `maxAge`-appropriate entries).

### Integration points with existing code

- **Router:** in the case-library component, when the resolved case object has `type: 'board'`, render `BoardCasePlay` instead of `EnhancedCasePlay`.
- **Progress shape:** `loadDetectiveProgress()` default becomes `{ xp, casesSolved, cases, usedCaseIds, age, boardMastery: {} }`. `boardMastery` maps a skill family key (e.g. `'addsub'`) → band level `0|1|2` (Easy/Medium/Hard).
- **Age filter:** `filterCasesByAge` gains support for an optional case `maxAge`; board cases carry `ageRange: [6, 9]` so only younger learners see them.
- **Completion:** `BoardCasePlay` calls the same `onComplete(caseId, solved, stats)` flow → XP/ranks, `cases` record, `usedCaseIds` dedup. Stars derived from total hints used (0 → 3★, ≤2 → 2★, else 1★), matching existing behavior.

---

## 3. Board & movement

- **12×12 grid, entire board always visible.** Tiles sized via CSS grid so the board fits a phone width (~26–32px tiles). No camera/pan/zoom.
- **Tiles:** mostly walkable floor; a small set of **blocked decorative tiles** (pond, fence) authored in `spec.blocked` to make the scene feel like a place. Blocked tiles render a distinct chalk texture and block movement.
- **Detective avatar:** emoji-based detective with a visible **hat marker** (`🕵️` on a marker tile). The **current cell is highlighted with a pulsing chalk ring** — this is the "which block am I in" identifier.
- **Input:**
  - Desktop: **WASD + arrow keys**.
  - Touch/tablet: **on-screen D-pad** (▲ ◀ ▼ ▶) beneath the board. Both call the same movement function.
  - Step = one tile, with a small CSS hop animation and a soft step tick sound.
- **Interaction:** an object's cell is walkable. **Stepping onto an object cell opens its interaction automatically** (no extra button for 2nd graders). On touch, tapping an object within 1 tile also opens it.
- **Interaction lifecycle:** an object is **interacted once**. After observation or solving math, the cell shows a pinned **evidence tag** state (§8) and re-stepping shows a brief toast: "Already in your notebook!" Objects never re-ask math.

### Movement rules (engine)

- `movePlayer(state, dx, dy)` returns `{ ok, nextState }` or `{ ok: false, reason: 'blocked' | 'edge' }`. Pure — no DOM, no randomness.
- Player position `[x, y]`; movement is grid-adjacent only (no diagonal).
- Stepping onto an object cell auto-triggers `interactAt(state)`.

---

## 4. Board case data schema

```js
{
  type: 'board',
  id: 'board-1',
  title: 'The Vanished Birthday Cupcakes',
  description: 'The class cupcakes vanished before snack time. Can you crack the case?',
  difficulty: 1,
  xpReward: 60,
  topic: 'adventure',
  skillFamily: 'addsub',            // learning-engine key for between-case mastery
  ageRange: [6, 9],
  gridSize: 12,
  blocked: [[x, y], ...],           // non-walkable decorative cells
  playerStart: [x, y],
  suspects: [{
    id: 'leo', name: 'Leo', animalEmoji: '🦁', species: 'lion',
    profile: {                        // slots unlock via clues; '???' until then
      favouriteFood: 'chocolate',
      footprint: '14 cm',
      colour: 'golden mane',
      timing: 'early',
    },
    motiveContext: '…',               // revealed at accusation; always empathetic
  }, {
    id: 'mila', name: 'Mila', animalEmoji: '🐭', species: 'mouse',
    profile: { favouriteFood: '…', footprint: '…', colour: '…', timing: '…' },
    motiveContext: '…',
  }, {
    id: 'teddy', name: 'Teddy', animalEmoji: '🐻', species: 'bear',
    profile: { favouriteFood: '…', footprint: '…', colour: '…', timing: '…' },
    motiveContext: '…',
  }, {
    id: 'riya', name: 'Riya', animalEmoji: '🐰', species: 'rabbit',
    profile: { favouriteFood: '…', footprint: '…', colour: '…', timing: '…' },
    motiveContext: '…',
  }],
  culprit: 'riya',
  objects: [{
    id: 'footprints',
    cell: [2, 3], emoji: '🦶', name: 'Footprints by the door',
    category: 'identity',             // Who? | time: When? | location: Where? | motive: Why?
    clueType: 'investigation',
    investigation: {
      hints: ['…', '…'],              // hint 1 (contextual nudge), hint 2 (worked step)
      math: {
        easy:   { narrative: '…', question: '…', answer: 15 },
        medium: { narrative: '…', question: '…', answer: 15 },
        hard:   { narrative: '…', question: '…', answer: 15 },
      },
      unlocksProfile: [{ suspectId: 'mila', field: 'footprint' }, { suspectId: 'leo', field: 'footprint' }],
    },
    evidence: { id: 'ev-footprints', text: '…', category: 'identity' },
  }, {
    id: 'icecream',
    cell: [5, 4], emoji: '🍦', name: 'Ice cream cart',
    category: 'motive',
    clueType: 'observation',
    observation: {
      text: 'The ice cream cart is still full. Only vanilla is left — someone got the last chocolate!',
      unlocksProfile: [{ suspectId: 'leo', field: 'favouriteFood' }],
    },
    evidence: { id: 'ev-icecream', text: '…', category: 'motive' },
  }],
  eliminationRules: [
    { evidenceId: 'ev-footprints', eliminates: ['mila'] },   // culprit never appears
  ],
  currentThoughts: [
    { afterEvidenceIds: ['ev-footprints'], lines: ['The footprint is 15 cm — too big for a mouse!'] },
  ],
  confession: {
    culpritNarrative: '…',            // why she did it (age-appropriate)
    mrBNote: 'Excellent observation, Detective. Every mystery begins with listening.',
  },
}
```

### Invariants enforced by `validateBoardCase(spec)` (run in tests + dev load)

1. Grid is 12×12; `playerStart` in-bounds and not blocked; no object shares a cell with `blocked` or another object.
2. Every `investigation` object has E/M/H variants whose **answers are all equal** (the evidence value), plus exactly two `hints` (hint 1, hint 2) for the hint ladder.
3. Every `eliminationRules` `eliminates` entry references a real suspect **and never the culprit**.
4. Every profile slot has at least one clue that unlocks it, and every `unlocksProfile` entry references a real suspect id and an existing profile field.
5. `currentThoughts` `afterEvidenceIds` reference real evidence ids, are ordered by collection, and each clue collection has a matching thought state.
6. Every evidence id is unique and referenced by exactly one object.
7. Each object has exactly one category and one clue type.

---

## 5. Learning engine — silent adaptation, hints, mastery

### Silent difficulty band (within a case)

- Each case belongs to a `skillFamily` (Case 1: `'addsub'`). The **initial band** comes from `boardMastery[skillFamily]`, defaulting to **Easy** (0) when absent.
- Band levels: `0 = easy`, `1 = medium`, `2 = hard`.
- Each math interaction presents the variant for the current band. The band is **silent** — the story UI never references difficulty.

### Band nudges

- **2 consecutive correct answers → band up (+1)** (silent, "the next interaction is slightly richer, not longer").
- **2 wrong answers → band down (−1)** (silent).
- Bands clamp at 0..2. The nudge happens between interactions, never mid-interaction.

### Hint ladder & simpler-variant fallback

Per math interaction:

1. **Wrong answer →** mascot: "Detective, try again — here's a hint." Shows **hint 1** (the object's `hint` text).
2. **Wrong again →** mascot shows **hint 2** (a worked-step hint).
3. **After 2 hints used and still wrong →** mascot offers the **simpler prerequisite version**: the **Easy** variant of the same object, in its own context ("Let's try an easier version of this one, Detective.").
4. **Solved (any variant) →** clue is awarded immediately; story continues. The learner never waits on a mastery quiz.

Answer checking is tolerant: trims whitespace, accepts units ("15 cm" → 15), numeric tolerance < 0.01 (reuse `checkDetectiveAnswer` semantics from `detective-app.jsx`).

### Variant design rule

E/M/H are **different operations on different numbers that land on the same answer**, and that answer **is the evidence value**. Example (footprints → 15 cm):

- Easy: "The front paw print is 8 cm and the back paw print is 7 cm. How long is the whole print?" → 15
- Medium: "The whole print is 20 cm. The toe part is 5 cm. How long is the heel part?" → 15
- Hard: "A print is 3 steps long, and each step is 5 cm. How long is the print?" → 15

Every learner therefore experiences the **same story and same clue**, with an appropriate challenge.

### Between-case mastery

- At case completion, recompute the skill family band from the run: **strong** (≥ 2/3 answers correct and ≤ 2 total hints) → band up one (clamp 2); **struggling** (more than half wrong, or > 4 total hints) → band down one (clamp 0); otherwise keep. A child who never meets the case's harder variants still ends at their own comfortable band — they never *see* a difficulty path.
- Persist under `boardMastery[skillFamily]`. Future cases read this for their initial band. No per-case "mastery quizzes."

---

## 6. Notebook & suspect board

### Notebook (collapsible overlay, slides from the left)

- **Evidence Found:** one card per collected evidence. Each card is **draggable** (desktop) / **tap-selectable** (touch) for elimination, shows its category tag — 🕵️ **Who** / ⏰ **When** / 📍 **Where** / 💡 **Why** — plus its short text.
- **Current Thoughts:** hand-authored lines from `currentThoughts`, computed by the engine from collected evidence (e.g. "Leo likes chocolate. Vanilla probably belongs to someone else. Two suspects remain.").
- Empty state (before any evidence): "Nothing in the notebook yet — keep exploring the scene."

### Suspect board (collapsible overlay, slides from the right)

- Rendered as a **one-piece poster**: each suspect is a card with profile slots (Favourite Food, Footprint, Colour, Timing). Slots show **"???"** until the clue that unlocks them is collected, then fill in.
- **Eliminated suspects** get a stamped greyed look but stay readable (learning value: the learner can see why).

### Elimination — drag evidence onto suspect

- **Desktop:** drag an evidence card from the notebook onto a suspect card.
- **Touch:** tap an evidence card (it highlights), then tap a suspect card.
- **Validation:** elimination is valid only if `eliminationRules` says that evidence eliminates that suspect. Because the culprit appears in no rule, **the culprit can never be wrongly eliminated**.
  - Valid → stamp animation + mascot: "Eliminated! Great reasoning, Detective." + sound.
  - Invalid → no elimination; mascot: "That clue doesn't rule out [name], Detective — keep looking."
- **Win condition:** when only the culprit remains non-eliminated, the mascot prompts; an **"Accuse [name]"** button appears on the poster. Tapping it plays the confession scene (§7). No extra evidence-summary step (kept simpler than the existing enhanced case flow for this age band).

---

## 7. Narrative — Case 1 content

**Title:** *The Case of the Vanished Birthday Cupcakes*
**Setting:** Greenleaf Animal School, the day of the class baking celebration. The cupcakes disappeared from the kitchen table minutes before snack time. Low-stakes, warm, no villainy.

### Suspects (classmates)

| id | Name | Animal | Initial profile hints |
|---|---|---|---|
| `leo` | Leo | 🦁 lion | Loves chocolate; a bit of a show-off. |
| `mila` | Mila | 🐭 mouse | Tiny, quiet, shy. |
| `teddy` | Teddy | 🐻 bear | Big, clumsy, forgetful, leaves mud. |
| `riya` | Riya | 🐰 rabbit | Quick, eager to please, always watching the clock. |

### Culprit & motivation (empathetic)

**Riya the rabbit.** She hid the cupcakes to decorate them in secret as a **surprise for the teacher**, who'd been so tired. She forgot to ask permission first and is embarrassed to admit it — exactly the "was trying to help but made a mistake / forgot to ask permission" motivation required. At the confession she hands the detective the **Mr. B note** and says: *"Someone called Mr. B asked me to give this to you."*

### Mr. B note (Case 1)

> *Excellent observation, Detective.*
> *Every mystery begins with listening.*

Symbolic foreshadowing: Case 2's note mentions "sounds"; the mastermind revealed in Case 3 is **an elephant** — its big ears retrospectively connect "listening" and "sounds." Children should wonder *why listening?* and *why sounds?* during Cases 1–2.

### Board objects (7 — 4 investigation + 3 observation ≈ the half/half rhythm)

| Object | Cell | Category | Type | Reveals | Eliminates |
|---|---|---|---|---|---|
| 🦶 **Footprints by the door** | [2,3] | identity | investigation | footprint slots (all suspects) | `mila` |
| ⏰ **Classroom clock** | [9,6] | time | investigation | timing slots (all suspects) | `leo` |
| 🐾 **Muddy trail** | [4,8] | location | investigation | colour/mud slots | `teddy` |
| 🥛 **Spilled milk jug** | [11,2] | motive | investigation | motive note | — |
| 🍦 **Ice cream cart** | [5,4] | motive | observation | `leo` favouriteFood | — (red herring) |
| 🪶 **Blue feather** | [7,9] | identity | observation | `riya` colour slot | — |
| 📝 **Chalkboard note** | [0,10] | location | observation | `mila` timing slot | — |

Object wording, numbers, and E/M/H variants are authored in `detective-board-cases.js` during implementation per the §5 variant rule. **Elimination chain:** each of the three investigation clues eliminates exactly one innocent suspect — footprints rule out Mila (15 cm is far too big for tiny mouse paws), the clock rules out Leo (the cupcakes vanished at 9:40 while he was leading the gym drills in front of the whole class), the muddy trail rules out Teddy (his prints are old and dry, from before the rain — not the wet kitchen trail). That leaves **Riya**. Observation clues (vanilla cart, blue feather, chalkboard note) enrich the poster and build the "aha" rather than eliminate; the milk-jug motive note explains the secret baking.

### 3-case arc (future data)

Case 2 (culprit note: "Not everything is what it sounds like.") and Case 3 (mastermind = elephant, Mr. B) are authored later **as pure data** in `detective-board-cases.js` — no engine changes required.

---

## 8. Visual identity — "Chalk & Case File"

Grounded in the subject: a child detective's crime scene at a schoolhouse. The artifacts of the world — **chalkboard maps, evidence tags, a spiral notebook, a red rubber stamp, manilla case folders** — drive every choice. The whole case UI is one self-contained **dossier pulled open on the dark desk** (the app's dark-brown shell is the desk; the case is the light scene inside it). Scoped under `client/src/detective-board.css` with `.dbc-` prefixed classes and its own custom properties, so it renders identically in both app themes and cannot collide with shell styles.

### Palette (named tokens)

| Token | Hex | Role |
|---|---|---|
| `--dbc-slate` | `#2E3A37` | Chalkboard backdrop of the 12×12 crime scene |
| `--dbc-chalk` | `#F3EEDC` | Chalk text, grid lines, detective marker, board labels |
| `--dbc-tag` | `#F2B705` | Evidence-yellow: interactive affordances, evidence tags, D-pad, primary buttons |
| `--dbc-paper` | `#E8D8AE` | Manilla dossier: notebook & suspect poster surfaces |
| `--dbc-stamp` | `#C64B34` | ELIMINATED stamp, wrong-answer feedback, Mr. B note seal |
| `--dbc-ink` | `#2A2E33` | Dark text on manilla surfaces |

### Typography (deliberate pairing, loaded from Google Fonts)

- **Display / chalk — `Caveat`:** the detective's hand. Case title, board chalk labels, notebook entries, mascot speech. Used with restraint (headings + board markings).
- **Utility / case file — `Special Elite`** (typewriter): case number, evidence IDs, "EVIDENCE FOUND", "ELIMINATED" stamp, Mr. B note. This is the file-artifact voice.
- **Body — `Nunito`** (already in the app family; rounded, kid-legible): questions, buttons, paragraphs. Reuse of the legible body face is intentional; personality comes from chalk + typewriter.

Scale: board labels ~1.1rem Caveat; evidence tags 0.7rem Special Elite uppercase; body 1.125rem Nunito; interaction question 1.5rem Nunito bold.

### Layout — "the scene on the desk"

```
┌──────────────────────────────────────────────────────────┐
│ case 001 · The Vanished Birthday Cupcakes   [📓][🖼]    │  (dark shell: typewriter + Caveat)
├──────────────────────────────────────────────────────────┤
│   ┌──────────────────────────────────────────────┐      │
│   │  SLATE chalkboard, 12×12, whole scene        │      │
│   │  chalk grid · chalk-drawn objects · 🕵️ hat   │      │
│   │  solved cells grow pinned evidence tags       │      │
│   └──────────────────────────────────────────────┘      │
│            [▲] [◀][▼][▶]   (D-pad, touch only)          │
│   ───────── desk edge ─────────                         │
│   🦉 mascot bar (assistant): "Tap the footprints!"      │
└──────────────────────────────────────────────────────────┘
```

- Top bar: case-folder tab label (Special Elite, `CASE 001`), title (Caveat), right-side toggles **📓 Notebook** and **🖼 Suspects**.
- Center: the slate chalkboard holding the grid — the **hero**. Below it the touch D-pad; a thin "desk edge" divider.
- Bottom: the **mascot assistant bar** — mascot perched on the desk edge, Caveat speech bubble. The mascot is a constant companion, not a floating badge.
- **Math interaction** opens as a **pinned index card** (manilla, hole-punched) centered over the board, question in Nunito, mascot speech above, answer input + actions below.
- **Notebook** slides in from the left (spiral-bound, torn edge). **Suspect poster** slides in from the right (manilla with pinned photos, red string, tape strips).

### Signature — the evidence tag & stamp

The one memorable thing: **the crime scene literally transforms from empty chalk into a pinned, stamped case file.** Solving an object pins a yellow **evidence tag** (jagged edge) onto that cell with a *snap* bounce; eliminating a suspect slams a red **ELIMINATED** rubber stamp onto the poster with a micro-shake and *thunk*. The math you earned is physically visible on the scene. Everything around it stays quiet and disciplined.

### Motion (orchestrated, not scattered; respects `prefers-reduced-motion`)

1. Case open: title chalk-scrawls; grid lines draw themselves.
2. Step: small tile hop; onto an object → chalk ring pulse.
3. Evidence found: tag pins with a *snap*; matching notebook card flies into place.
4. Elimination: stamp slam + micro-shake.
5. Mr. B note: sealed envelope; on open, the typewriter note types out.
- Under reduced motion: all of the above collapse to simple fades (per existing `mda-` media-query pattern in `App.css`).

### UI copy register

Detective address; active voice; consistent action names. Examples: "Tap the footprints, Detective!" · "Open Notebook" / "Close Notebook" · "View Suspects" · "Accuse Riya" → confirmation toast "Riya has been accused." · wrong elimination: "That clue doesn't rule out Leo yet — check who likes chocolate." · empty notebook: "Nothing in the notebook yet — keep exploring the scene."

### Accessibility floor

- Responsive down to small phones (board tiles shrink; D-pad appears; overlays go full-width).
- Visible keyboard focus rings; WASD/arrow gameplay fully keyboard-operable.
- Touch targets ≥ 44px for the D-pad and toggles.
- `prefers-reduced-motion` honored.
- Emoji-as-art with `aria-hidden` and real text labels on interactive tiles/cards.

---

## 9. Persistence, audio, errors

### Persistence

- Extend default progress shape with `boardMastery: {}`.
- In-progress board snapshot saved after each interaction/elimination/hint: `{ playerPos, collectedEvidenceIds, eliminatedIds, band, hintsUsedPerObject }`, stored via the existing in-progress-cases mechanism (`saveInProgressCase`) keyed by the case id, so a refresh resumes the exact scene.
- Completion flows through the existing `onComplete` path → XP, stars (by total hints), `cases`, `usedCaseIds`.

### Audio

- Reuse existing tone helpers (`playTone`, `playCorrectSound`, `playConfettiSound`).
- Add: step tick; evidence *snap*; stamp *thunk*; soft wrong-answer tone.

### Error handling

- `validateBoardCase(spec)` fails fast in tests and at dev load — bad authored data is caught before production, never thrown in the running app.
- Engine functions are pure and defensive: they return safe defaults for malformed specs rather than throwing.
- Runtime failures (e.g. answer-check edge cases, missing evidence references) degrade to the existing toast/skip patterns, never blank screens.

---

## 10. Testing

`client/src/detective-board.test.jsx` (vitest, mirroring the existing `detective.test.jsx` suite):

**Schema validation (Case 1):**
- `validateBoardCase(board1)` passes.
- Every investigation object has E/M/H variants; all three answers equal the evidence value.
- Every `eliminates` entry targets a non-culprit.
- Every profile slot has a revealing clue; every evidence id unique; `currentThoughts` references real evidence.

**Engine (pure units):**
- Movement: bounds, blocked tiles, adjacency-only.
- Interaction: stepping onto object auto-opens; re-step returns already-interacted.
- Band nudges: 2 correct → up; 2 wrong → down; clamps at 0..2.
- Hint ladder: wrong → hint 1 → hint 2 → simpler (Easy) variant offered after 2 hints.
- Answer tolerance: "15 cm" == 15; numeric tolerance.
- Gradual reveal: `getRevealedProfile` shows "???" until unlocking clue collected.
- Notebook lines: `currentThoughts` computed correctly for each evidence set.
- Elimination matching: valid drag eliminates; invalid drag doesn't; culprit un-eliminable.

**Integration (component):**
- Render `BoardCasePlay`; step onto an investigation object; solve math; evidence appears in notebook.
- Drag/tap evidence onto a suspect; elimination applies; only the culprit remains → accuse → completion callback with XP/stars.
- Resume: seeded `initialState` restores position, collected evidence, eliminated ids.

---

## 11. Out of scope / future

- Cases 2 & 3 (pure-data additions in `detective-board-cases.js`; the elephant mastermind arc).
- Any changes to the text-based case system or `EnhancedCasePlay`.
- Server-side work (none required).
