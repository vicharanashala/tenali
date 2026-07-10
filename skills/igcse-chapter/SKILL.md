---
name: igcse-chapter
description: Use this skill whenever the user asks to add, build, scaffold, or convert a Cambridge IGCSE chapter into an interactive Tenali lesson module — e.g. "build chapter 7", "add the chapter on trigonometry", "do the same for chapter X". Use it for both fresh chapters and edits to existing chapter modules. Triggers include any mention of a chapter number ("chapter 5", "chapter 6", "/chapter7"), chapter title from the IGCSE Mathematics Core and Extended coursebook, or a request to mirror the existing /chapter5 or /chapter6 module pattern. Do NOT use this skill for non-chapter quizzes (gym, supertables, IntervalScheduling, etc.) — those use other patterns.
---

# IGCSE Chapter Module — pattern guide

This is a project-level skill. It documents the conventions that every `/chapterN` route in `client/src/App.jsx` must follow so that new chapters look, feel, and behave identically to the ones already shipped (`/chapter5`, `/chapter6`).

If the user asks for a new chapter, follow this guide end-to-end. If they ask for a change ("don't lock lessons", "add a slider", etc.), apply the change uniformly to *all* existing chapter modules so behaviour stays consistent.

---

## What "a chapter" is in Tenali

A chapter is a single self-contained React component, mounted at `pathname === '/chapterN'`, whose job is to walk a student through one numbered chapter of the *Cambridge IGCSE Mathematics Core and Extended* coursebook by:

1. Showing an **overview** of all lessons in the chapter.
2. Letting the student pick any lesson at any time (no sequential locking).
3. For each lesson: showing a **teach panel** (rule + worked example), then a **practice stream** of questions that ramps from custom warm-ups into the actual chapter exercise problems and word problems.
4. Saving progress to `localStorage` so reloads resume.

The student should be able to finish the chapter purely by working through the lessons.

---

## File layout & integration

- All chapter modules live inside `client/src/App.jsx` (the same monolithic file as the rest of the app — do not split into new files).
- Each chapter is a single function component named `ChapterNApp({ onBack })` (e.g. `Chapter5App`, `Chapter6App`).
- Helpers and lesson data go *immediately above* the component, prefixed with `chN_` (e.g. `ch6_parseFrac`, `CH6_LESSONS`).
- Each chapter is wired into the URL router by adding a branch in `App()`:

  ```jsx
  if (pathname === '/chapterN') {
    return (
      <>
        <button className="theme-toggle" onClick={toggleTheme} title={...}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        <ChapterNApp onBack={() => { window.location.href = '/' }} />
      </>
    )
  }
  ```

  Place the new branch alongside the existing `/chapter5` and `/chapter6` branches.
- Progress is stored under the localStorage key `tenali-chapterN-progress` (one key per chapter).

---

## Lesson catalogue shape

```js
const CHN_LESSONS = [
  {
    id: 'L1',
    title: 'Lesson 1 · <topic name>',
    teach: {
      heading: '<one-line concept summary>',
      body: [ '<para 1>', '<para 2>', ... ],   // 3–6 paragraphs
      example: '<short worked example, math allowed>',
    },
    qFormat: 'optional input-format hint string',
    questions: [ /* 8–14 questions, ramping in difficulty */ ],
  },
  // …
]
```

A chapter typically has **10–18 lessons**. Each maps to one micro-skill from the chapter's exercises. Word-problem lessons get their own dedicated lesson rather than being mixed in.

### Question kinds

```js
{ kind: 'mcq',       prompt, options[], correct,  solution }
{ kind: 'fill-num',  prompt, answer (number), tol?, solution }
{ kind: 'fill-frac', prompt, answer ('a/b' or 'w a/b'), solution }
{ kind: 'fill-std',  prompt, answer ('ax10^n' or '3.4e-7'), solution }
{ kind: 'fill-text', prompt, answer (string),       solution }
```

- **Most questions should be MCQ.** Use `fill-*` only when MCQ would feel artificial (open-ended computation, simplification with too many plausible forms).
- MCQ option count is variable — typically 4, but 2 (yes/no) or 3 are fine; up to 9 is supported.
- The first option in the array can be the correct one (`correct: 0`) — display order is shuffled deterministically per question.
- Each question must have a `solution` string. Keep it short, show steps with math notation.

### Question ramp inside a lesson

1. Two or three custom warm-ups (small numbers, friendly cases) that build the underlying skill.
2. The chapter's actual exercise items, in roughly the order the textbook presents them.
3. If the topic has multi-step word problems, finish with one or two of those — don't skip them.

Coverage target: hit the substantive parts of every numbered exercise in the chapter. It's fine to omit nearly identical repeats and items that depend on knowledge the student is presumed to have from the gym.

---

## Math typography (CRITICAL)

All prompts, options, solutions, and teach paragraphs render through the chapter's private `chNRenderMath()` (modelled on `ch5RenderMath`). Use these conventions in the source data:

| Source | Renders as |
|---|---|
| `\\frac{2}{3}` | stacked fraction with bar |
| `\\frac{2 \\times 3}{3 \\times 3}` | nested expressions inside fractions are fine |
| `1\\frac{1}{4}` | mixed number |
| `^5`, `^-7` | superscript exponent |
| `\\times`, `\\div`, `\\approx`, `\\sim`, `\\le`, `\\ge`, `\\ne`, `\\to`, `\\cdot`, `\\cdots`, `\\pm` | proper Unicode glyphs |
| `\\pi`, `\\theta`, `\\Delta`, `\\alpha`, `\\beta`, `\\gamma`, `\\delta`, `\\mu`, `\\sigma`, `\\omega` | Greek letters |
| `\\sum`, `\\prod`, `\\int` | ∑, ∏, ∫ |
| `\\angle`, `\\triangle`, `\\square`, `\\infty` | ∠, △, □, ∞ |
| `\\ell`, `\\circ` | ℓ, ° |
| `\\sin`, `\\cos`, `\\tan`, `\\log`, `\\ln` | written as plain "sin", "cos", … |
| `\\left(`, `\\right)`, `\\left[`, `\\right]` | parentheses / brackets (the \\left/\\right wrapper is stripped) |
| `\\u2208`, `\\u2209`, `\\u2205`, `\\u222a`, `\\u2229`, `\\u2286`, `\\u2282` | ∈, ∉, ∅, ∪, ∩, ⊆, ⊂ |
| `\\u2660`, `\\u2663`, `\\u2665`, `\\u2666` | ♠, ♣, ♥, ♦ |
| `\\u2019`, `\\u2032`, `\\u2013` | ’, ′, – |
| `\\$12`, `\\%` | escaped dollar / percent |

If you need a command that isn't in the list above, ADD it to **every** `chN_subOps` (chapters 5–20 share the same body — when extending, update them all in one pass via a script). Otherwise the LaTeX token will render literally to the student.

### Vertical alignment rules

- Always use `verticalAlign: 'middle'` for fractions in inline contexts (the global `MathFrac` uses a baseline offset that flushes them down — define a private `ChNFrac` that fixes this).
- Question prompt container: `display: flex; alignItems: center; justifyContent: center; minHeight: 80; lineHeight: 2.1` — gives fractions room to breathe.
- Option cards: `display: flex; alignItems: center; justifyContent: center; minHeight: 64`. The number label (`1.`, `2.`, …) goes in an `position: absolute` span on the left so the option content stays centered.

---

## UX requirements (must-have)

These are non-negotiable behaviours. New chapters that omit any of these are wrong.

1. **No lesson locking.** Every lesson is clickable from the moment the page loads. Show ✅ for completed, ▶ for in-progress, ○ for not started — but never disable, gray out, or 🔒 a lesson based on what came before.
   - **Completed lessons go visibly green.** Use a green left-edge bar (`borderLeft: '4px solid #2ea043'`), a green-tinted gradient background (`linear-gradient(90deg, rgba(46,160,67,0.32) 0%, rgba(46,160,67,0.18) 100%)`), and a small white-on-green `DONE` pill on the right. The student should be able to see at a glance which lessons are finished without reading any text.
     - **Text colour MUST stay readable on both themes.** Do NOT override the title colour with pale green like `#a6f0b6` — that pale-on-green combination is invisible against the light-theme gradient. Keep `color: 'var(--clr-text)'` (which is dark on light theme and light on dark theme) and use `fontWeight: 600` for completed lessons. The green left bar + DONE pill provide the visual signal; the text just needs to remain legible.
2. **Question slider.** Above the question card, render a `<input type="range" min={1} max={N} value={qIdx+1}>` that jumps straight to the chosen question. Dragging it resets the per-question state but bumps (does not lower) the saved high-water-mark in localStorage.
3. **MCQ keyboard shortcuts.** Pressing `1`..`9` selects the corresponding option. The active card highlights green if correct, red if wrong; the correct option always highlights green after reveal.
4. **Number labels.** Display option labels as `1. 2. 3. …` (not A/B/C). Match `CH5_OPTION_LABEL` / `CH6_OPTION_LABEL`.
5. **Next button + auto-advance.** After an answer is revealed, show a prominent green **Next →** button AND a 5-second countdown ("auto-advance in 5s · or press Enter"). Any keystroke (Enter or Space) or button click advances immediately. Navigation away cancels the timer.
   - **Wrong answers go to the END of the lesson.** When the student answers a question wrongly, APPEND that question to the end of the play sequence (not 4 positions later — the old `CHN_RETRY_GAP` constant is gone). The lesson runs against a dynamic `playList` of source-question indices (initialised to `[0..N-1]`); a wrong answer pushes `workingList = [...playList, sourceIdx]`, lengthening the list. The student therefore works through every fresh question first and meets a "retry cluster" at the tail. The slider's max grows to match. A retry that's also wrong gets re-appended again, so the lesson cannot finish until every wrong-answered question has eventually been answered correctly. The student should see a small badge ("retry" or "↻") on questions that came back from the queue, so they know why they're seeing it again.
6. **Re-read teach.** A button in the practice header that returns to the teach panel without losing the current question position.
7. **LaTeX-style math.** Use `chNRenderMath()` everywhere a student sees text that contains math — including **lesson titles**. Never display raw `\\frac{…}{…}`, `\\pi`, or `\\u2032`-style escapes to the student. Specifically, in the overview render, the teach panel `<h2>`, the done-screen "You finished" sentence, the "Next: …" button, and the practice-panel `<h3>`, wrap `lesson.title` / `l.title` / `next.title` in `chNRenderMath(...)` — not just `{lesson.title}`. Original chapters 5/6/7/8 emitted titles raw, which means any title containing math will display literally (e.g. "multiples of \\pi"). Fix in any chapter you touch.
8. **Reset progress.** A button on the overview that clears the chapter's localStorage entry after a `confirm()`.

---

## Component skeleton

Treat this as a checklist when scaffolding a new chapter. Read `Chapter5App` (or `Chapter6App`) and copy its structure verbatim, then swap content.

```jsx
function ChapterNApp({ onBack }) {
  // state: progress, activeId, phase ('teach'|'practice'|'done'),
  //        qIdx, selectedIdx, fillInput, revealed, isCorrect, autoCountdown
  // refs:  inputRef, autoTimerRef, advanceRef

  // memoised: optionOrder (deterministic shuffle), correctDisplayIdx

  // effects: persist progress, focus input on entering fill question,
  //          auto-advance timer when revealed, keyboard handler

  // actions: startLesson, acknowledgeTeach, submitFill, pickMcq,
  //          advance, jumpToQuestion, backToOverview, resetAll, cancelAutoAdvance

  // renders: overview (lesson list), teach panel, practice (slider + question
  //          + options/input + reveal + next), done screen
}
```

---

## When the user changes a UX rule

The chapters must stay in lockstep so they feel like one product. Follow this exact workflow whenever the user asks for a behaviour change ("don't lock lessons", "add a slider", "make options centered", "completed lessons go green", etc.):

1. **Update this `SKILL.md` first.** Add or amend the relevant rule so it's the source of truth before any code is touched. Future chapters depend on this file being current.
2. **Apply the change to the chapter the user is currently looking at.** Implement and verify (esbuild) the smallest possible change there.
3. **Stop and ASK the user before propagating to other chapters.** Do NOT silently rewrite Chapter 5 when the user asked you to change Chapter 6. Phrase the question clearly: "I've made the change in Chapter X. Should I apply it to Chapter Y and Z too so they stay consistent?"
4. **Only after explicit confirmation, propagate.** When you do propagate, do it everywhere at once and verify the build once at the end.

The reason for the ask-first step: the user may be experimenting, may want a behaviour to differ for a reason, or may simply want to see how it lands in one chapter before committing across the rest. Don't pre-empt that decision.

---

## Authoring a new chapter — checklist

1. Read the relevant chapter from the PDF (`uploads/Gadeemteam | Cambridge IGCSE…pdf`). The TOC is on PDF page 6; chapter book-page numbers are offset by +12 to PDF page numbers (book p. 149 = PDF p. 161).
2. Render the chapter's pages with `pdftoppm -r 150 -png` and read them with the Read tool — the PDF is a scanned image so text-extraction won't work.
3. Inventory every section, exercise, and worked example. Note which exercises contain word problems.
4. Decide on the lesson breakdown — one lesson per micro-skill, plus dedicated word-problem lessons.
5. Author the lesson catalogue using the question kinds above. Use `\\frac{}{}`, `^N`, `\\times`, etc.
6. Drop the new module into `client/src/App.jsx` immediately above `function App() {`, copying the helpers from `ch5_*` / `ch6_*` and renaming to `chN_*`.
7. Wire the `/chapterN` route in `App()`.
8. Verify with `npx esbuild src/App.jsx --bundle --loader:.jsx=jsx --jsx=automatic …` (the dev server can't always rebuild because of `dist/` permissions; esbuild bundling is the syntax check).
9. Tell the user to navigate to `/chapterN`.

Done.
