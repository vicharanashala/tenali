# CT — Reflection Journal + CR — Real-World Math Pathways

Two features, bundled into one PR at the maintainers' request. They are
independent: neither reads the other's state, and they touch different files
apart from a handful of lines in `App.jsx`.

---

## CT — Reflection Journal

A platform-wide notebook. A floating 📓 button sits on every screen; clicking it
docks a panel on the right, so the question stays visible while the student
writes.

- **Docked side panel, not a modal** — the quiz is never hidden behind it.
- **Resizable** — drag the left edge to widen; the textarea itself resizes
  vertically only, so it can't drift out of the panel.
- **📎 Mention question** — pulls the current question in as an editable quote
  attached to the note.
- **Notes list** — each entry is a card; click to edit inline, 🗑 to delete.
- **Export** — downloads every note as a plain-text file.
- **Streak badge** — 🔥 on the button once entries land on consecutive days.
- `Esc` or the 📓 button closes it.

Storage is `localStorage`, so notes stay on the student's own browser and
nothing is sent anywhere.

**Files:** `ReflectionJournal.jsx`, `ReflectionJournal.css`, two lines in
`App.jsx` (import + one render site).

---

## CR — Real-World Math Pathways

A phenomenon-first route into the existing Tenali cards. Instead of picking a
topic, the student picks something real — a car — and the mathematics arrives in
the order the phenomenon demands it.

**The Car Journey** is the first pathway: sixteen stops from counting wheels
(ages 6–8) to the differential equations of the suspension (ages 15–16). Each
stop opens with a question about the car, not about the maths.

### How a stop works

Each stop runs a short ladder of generated questions banded by difficulty, then
a mastery check that must be passed to unlock the next stop.

- **Practice ladder** — 6 questions (2 each at bands 1–3), gate at 4/6.
- **Mastery check** — passing it marks the stop cleared and opens the next one.
- **Stops are locked in sequence.** Finish the previous stop to unlock the next.

### Road License — hand-off into Tenali

Clearing a stop earns a licence naming the Tenali card it maps to and the level
the student has demonstrably earned:

> 🪪 Cleared: Multiplication — start at **Hard — tables up to 12** in Tenali.

Tapping **Open Multiplication →** opens that card with Hard already selected.
The student can change it freely before starting — the licence says where they
*can* start, not where they must. Stops that feed two cards produce a separate
row and button for each.

The recommendation travels through a one-shot `localStorage` channel with a
five-minute TTL, so a stale value can never carry over into an unrelated visit.

### Band-level resume

Leaving a stop mid-practice costs only the current band, not the whole stop. A
checkpoint is written at each band boundary, so returning offers to pick up
where the student parked. There is deliberately no question-level memory —
questions are generated fresh each time, so remembering individual ones would
mean remembering answers that no longer apply.

### Remediation after a failed check

Failing the mastery check does not replay the same ladder. The retry is shorter
(1× band 1, 2× band 2, 2× band 3 — gate 3/5), and question templates are served
least-seen-first, so a student does not immediately meet the questions they just
failed.

### Now can you solve…

Every cleared stop carries six harder questions with revealable solutions. No
timer, no score, nothing to submit — they only use maths from stops already
driven, and each asks slightly more than the last.

**Files:** `CarJourneyApp.jsx`, `CarJourneyApp.css`, `CjChallenge.jsx`,
`RealWorldHub.jsx`, `cjReco.js`, plus small additions in `App.jsx`.

---

## Shared UI changes

- **Themed scrollbars** app-wide — thin, rounded, following the light/dark theme
  variables, replacing the default browser bars that clashed with the app's
  surfaces. Components that intentionally hide their scrollbar are unaffected.
- The Car Journey screens were trimmed of descriptive prose and the licence
  modal widened, so the questions and controls carry the page.

## How to test

```bash
cd client && npm install && npm run dev
```

**Reflection Journal** — click the 📓 button on any screen; write a note, attach
a question with 📎, save, then reopen to edit or export it.

**Car Journey** — open the ☰ menu → **Real-World** → **Cars**. Stop 1 is open;
the rest unlock in sequence. Clear a stop to see its Road Licence, then tap
**Open <topic> →** to land on that Tenali card with the earned level selected.

## Notes for reviewers

- **No server changes.** Both features are client-only; no new endpoints, no
  schema changes, no new dependencies.
- **`App.jsx` footprint is deliberately small** — an import and a render site
  for the journal, and difficulty-initialiser lines for the cards the Road
  Licence can open. This was kept minimal to avoid conflicting with other work
  in that file.
- **Progress is per-browser.** Both features use `localStorage`, so nothing
  syncs across devices. Server-backed sync would need an account and is out of
  scope here.
- Branch is merged up to date with `main` and builds clean.
