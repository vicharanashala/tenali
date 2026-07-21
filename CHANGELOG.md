# Changelog

Percentages — Level 1: Find a Percentage
Author: Ritish Karmakar

Version 1 — July 8, 2026
Built the complete learning experience for Percentages Level 1 from the ground up.
The explanation screen has five parts: an interactive visual where students drag a slider and watch a percentage bar fill up live, click-through theory, a worked example, a copyable AI study assistant prompt for students who want extra help from their own AI tool, and an understanding check before they're allowed into the real quiz. The understanding check pulls from 20 different real-life question templates — discounts, exam marks, sports stats — with randomized numbers each time and no repeats, so a student can't just memorize one answer to pass.
The graded quiz was rebuilt with step-by-step diagnostic solving. If a student gets a question wrong, instead of just marking it incorrect, it breaks the problem into two guided steps — converting the percentage, then applying it — and walks them through each one. If they keep struggling with the same type of step across different questions, the app automatically sends them back to the exact part of the explanation that covers it, checks their understanding, then lets them continue.
The whole quiz got a kid-friendly redesign too — a game-like "Percent Island" theme with XP, gems, a combo counter, unlockable badges, a friendly mascot with speech bubbles, confetti and sound on correct answers, and a level-completion screen.
Files Changed
FileChangeApp.jsxRebuilt the graded PercentApp component — new question generator, 3-mode state machine (Normal, Step-Wise Diagnostic, Check Question), escalation/failure-tracking logic, kid-friendly UI (Percent Island theme, mascot, XP/Gems/Combo, star progress, confetti, sound)App.cssAdded the full kid-friendly theme styling — Percent Island layout, mascot speech bubbles, star animations, confetti, chunky button styles, cream card backgroundsPercentExplanationApp.jsxBuilt the 5-part explanation screen (Level1ExplanationView) — interactive visual model, click-through theory, worked example, AI study assistant prompt, understanding check with 20 randomized scenario templatesPercentExplanationApp.cssStyling for the 5-part explanation screen

Version 2 — July 9, 2026
A cleanup pass focused on cognitive load. Both the explanation screen and the graded quiz were originally showing everything stacked on one long scrollable page, which was too much at once for the target age group. I changed both to reveal one section or one step at a time, with smooth fade transitions and a progress indicator so students always know where they are.
I also fixed a sound bug — the app was creating a brand-new audio object every time a sound effect played, which eventually hits a browser limit and breaks. I fixed this by sharing a single audio instance across the whole app, so sound now plays reliably no matter how long the session runs, and the mute toggle works cleanly without needing to recreate anything.
Files Changed
FileChangeaudioContext.jsNEW — Singleton AudioContext + shared playSound utilityApp.jsxRemoved duplicate local playSound, imported the shared one; rewrote step-wise quiz rendering to show one card at a time instead of all stackedApp.cssAdded .percentages-card-transition-wrapper + fade-in keyframes for the one-card-at-a-time quiz viewPercentExplanationApp.jsxImported shared playSound; added activeSection state, horizontal timeline progress indicator, Previous/Next navigation, fixed a missing closing </div>PercentExplanationApp.cssAdded transition wrapper + fade-in keyframes for one-section-at-a-time view, timeline hover styles

Version 3 — July 15, 2026
The biggest update, based on direct feedback from my mentor.
I removed the AI study assistant prompt step entirely — it's no longer part of the flow.
I replaced the old drag-and-drop matching game with a proper guided mini-story. A friendly mascot now walks the student through one of five different real-world examples — a candy jar, a pizza, a classroom, a piggy bank, or a football match — picked at random each time so it stays fresh, but only one example is shown per visit so it doesn't overwhelm. The story plays out in five short beats: introduce the whole amount, show a part being taken away, ask the student to guess the percentage, reveal the answer and formula, then recap. I also removed the old interaction where students had to tap 25 individual items one by one — that's now a simple animated reveal with a single tap to continue, which is far less tedious and keeps the focus on understanding rather than clicking.
I also gave the mascot three different expressions — explaining, excited, and thinking — so it reacts appropriately to what's happening in the story.
Separately, I simplified the rest of the explanation screen for younger readers: shorter, simpler sentences, bigger formula and result displays, and a small info popup on the header instead of permanent instructional text cluttering every screen.
Finally, I fixed a background color bug where some cards on the explanation screen and the graded quiz didn't match the rest of the app — everything now uses the same consistent color scheme in both light and dark mode.
Files Changed
FileChangePercentExplanationApp.jsxRemoved the AI Study Assistant Prompt section; replaced the old drag-and-drop Story section with a new data-driven, scenario-based Story component (5 rotating real-world scenarios) and mascot avatar with 3 expressions; added hover/tap info popup on the section header; simplified Theory and Worked Example section contentPercentExplanationApp.cssRemoved AI prompt and old drag-game styles; added Story section, mascot, and info popup styles; fixed background token usage across cards to resolve the color-drift bug; added responsive/typography adjustmentsPercent Island stylesheetFixed background token usage to match the rest of the app in both light and dark mode

Version 4 — July 16, 2026
Acted on a second round of mentor feedback about the theory and worked-example sections specifically.
Previously, the Concept Theory and Worked Example sections showed all their points and steps stacked on screen at once. I changed both to reveal one idea or one step at a time, with a "1 of 4" style progress indicator so students can see how much is left, and simple back/next navigation to move through them.
I also reordered the Concept Theory section so the core formula is introduced first, followed by the supporting explanation — since that's the main thing students need to walk away remembering, rather than saving it for last.
I increased the font size and spacing on both sections' cards to make everything easier to read and less cramped for a young student, and fixed a bug where the "Interactive Visual Model" heading was accidentally appearing twice on the first section.
Files Changed
FileChangePercentExplanationApp.jsxConverted Concept Theory and Worked Example sections from all-cards-stacked to one-card-at-a-time click-through, with progress indicators and inner Back/Next navigation; reordered Concept Theory so the formula is introduced first; fixed duplicate rendering of the "Interactive Visual Model" headingPercentExplanationApp.cssIncreased font size and card spacing/padding on Theory and Worked Example cards; added progress-indicator and inner navigation button styles

---

# Changelog — Tenali

Percentages — Level 1: Find a Percentage
Author: Ritish Karmakar

Version 1 — July 8, 2026
Built the complete learning experience for Percentages Level 1 from the ground up.
The explanation screen has five parts: an interactive visual where students drag a slider and watch a percentage bar fill up live, click-through theory, a worked example, a copyable AI study assistant prompt for students who want extra help from their own AI tool, and an understanding check before they're allowed into the real quiz. The understanding check pulls from 20 different real-life question templates — discounts, exam marks, sports stats — with randomized numbers each time and no repeats, so a student can't just memorize one answer to pass.
The graded quiz was rebuilt with step-by-step diagnostic solving. If a student gets a question wrong, instead of just marking it incorrect, it breaks the problem into two guided steps — converting the percentage, then applying it — and walks them through each one. If they keep struggling with the same type of step across different questions, the app automatically sends them back to the exact part of the explanation that covers it, checks their understanding, then lets them continue.
The whole quiz got a kid-friendly redesign too — a game-like "Percent Island" theme with XP, gems, a combo counter, unlockable badges, a friendly mascot with speech bubbles, confetti and sound on correct answers, and a level-completion screen.
Files Changed
FileChangeApp.jsxRebuilt the graded PercentApp component — new question generator, 3-mode state machine (Normal, Step-Wise Diagnostic, Check Question), escalation/failure-tracking logic, kid-friendly UI (Percent Island theme, mascot, XP/Gems/Combo, star progress, confetti, sound)App.cssAdded the full kid-friendly theme styling — Percent Island layout, mascot speech bubbles, star animations, confetti, chunky button styles, cream card backgroundsPercentExplanationApp.jsxBuilt the 5-part explanation screen (Level1ExplanationView) — interactive visual model, click-through theory, worked example, AI study assistant prompt, understanding check with 20 randomized scenario templatesPercentExplanationApp.cssStyling for the 5-part explanation screen

Version 2 — July 9, 2026
A cleanup pass focused on cognitive load. Both the explanation screen and the graded quiz were originally showing everything stacked on one long scrollable page, which was too much at once for the target age group. I changed both to reveal one section or one step at a time, with smooth fade transitions and a progress indicator so students always know where they are.
I also fixed a sound bug — the app was creating a brand-new audio object every time a sound effect played, which eventually hits a browser limit and breaks. I fixed this by sharing a single audio instance across the whole app, so sound now plays reliably no matter how long the session runs, and the mute toggle works cleanly without needing to recreate anything.
Files Changed
FileChangeaudioContext.jsNEW — Singleton AudioContext + shared playSound utilityApp.jsxRemoved duplicate local playSound, imported the shared one; rewrote step-wise quiz rendering to show one card at a time instead of all stackedApp.cssAdded .percentages-card-transition-wrapper + fade-in keyframes for the one-card-at-a-time quiz viewPercentExplanationApp.jsxImported shared playSound; added activeSection state, horizontal timeline progress indicator, Previous/Next navigation, fixed a missing closing </div>PercentExplanationApp.cssAdded transition wrapper + fade-in keyframes for one-section-at-a-time view, timeline hover styles

Version 3 — July 15, 2026
The biggest update, based on direct feedback from my mentor.
I removed the AI study assistant prompt step entirely — it's no longer part of the flow.
I replaced the old drag-and-drop matching game with a proper guided mini-story. A friendly mascot now walks the student through one of five different real-world examples — a candy jar, a pizza, a classroom, a piggy bank, or a football match — picked at random each time so it stays fresh, but only one example is shown per visit so it doesn't overwhelm. The story plays out in five short beats: introduce the whole amount, show a part being taken away, ask the student to guess the percentage, reveal the answer and formula, then recap. I also removed the old interaction where students had to tap 25 individual items one by one — that's now a simple animated reveal with a single tap to continue, which is far less tedious and keeps the focus on understanding rather than clicking.
I also gave the mascot three different expressions — explaining, excited, and thinking — so it reacts appropriately to what's happening in the story.
Separately, I simplified the rest of the explanation screen for younger readers: shorter, simpler sentences, bigger formula and result displays, and a small info popup on the header instead of permanent instructional text cluttering every screen.
Finally, I fixed a background color bug where some cards on the explanation screen and the graded quiz didn't match the rest of the app — everything now uses the same consistent color scheme in both light and dark mode.
Files Changed
FileChangePercentExplanationApp.jsxRemoved the AI Study Assistant Prompt section; replaced the old drag-and-drop Story section with a new data-driven, scenario-based Story component (5 rotating real-world scenarios) and mascot avatar with 3 expressions; added hover/tap info popup on the section header; simplified Theory and Worked Example section contentPercentExplanationApp.cssRemoved AI prompt and old drag-game styles; added Story section, mascot, and info popup styles; fixed background token usage across cards to resolve the color-drift bug; added responsive/typography adjustmentsPercent Island stylesheetFixed background token usage to match the rest of the app in both light and dark mode

Version 4 — July 16, 2026
Acted on a second round of mentor feedback about the theory and worked-example sections specifically.
Previously, the Concept Theory and Worked Example sections showed all their points and steps stacked on screen at once. I changed both to reveal one idea or one step at a time, with a "1 of 4" style progress indicator so students can see how much is left, and simple back/next navigation to move through them.
I also reordered the Concept Theory section so the core formula is introduced first, followed by the supporting explanation — since that's the main thing students need to walk away remembering, rather than saving it for last.
I increased the font size and spacing on both sections' cards to make everything easier to read and less cramped for a young student, and fixed a bug where the "Interactive Visual Model" heading was accidentally appearing twice on the first section.
Files Changed
FileChangePercentExplanationApp.jsxConverted Concept Theory and Worked Example sections from all-cards-stacked to one-card-at-a-time click-through, with progress indicators and inner Back/Next navigation; reordered Concept Theory so the formula is introduced first; fixed duplicate rendering of the "Interactive Visual Model" headingPercentExplanationApp.cssIncreased font size and card spacing/padding on Theory and Worked Example cards; added progress-indicator and inner navigation button styles

---

# Changelog — Tenali
All notable changes to this repository, grouped by date (newest first).
Auto-curated from git history: pull-request merges and direct commits are listed;
routine branch-sync merges are omitted. Regenerate with `gen_changelog.py`.

## Version 3 — 2026-07-15
Overview
This release removes the AI Study Assistant Prompt step from the explanation flow, replaces the old drag-and-drop Story section with a new guided, mascot-led mini-lesson, and significantly simplifies the rest of the explanation screen for younger readers. It also fixes a recurring background color mismatch so every screen in the module — Home, Explanation, Story, and the graded quiz — now looks visually consistent in both light and dark mode.
1. REMOVED — AI Study Assistant Prompt Section

The "AI Study Assistant Prompt" step (previously Section 4 of the explanation flow, shipped in Version 1) has been removed from the explanation screen entirely.
The explanation flow is now 5 sections: Interactive Visual → Concept Theory → Worked Example → Percent Story → Quick Check Quiz — with Percent Story taking the position the AI prompt step previously held, and Quick Check Quiz remaining the final gate before the graded quiz.
The "after 2 failed rounds, nudge back to the AI prompt" escape hatch (Version 1) no longer applies, since there is no AI prompt step to return to.

2. NEW — Percent Story Section (replaces "Percent Pop")

Removed the old drag-and-drop matching game that had been occupying Section 4. Testing showed it didn't reinforce the concept well and left students under-prepared for the quiz that follows.
Replaced it with a guided comic-style mini-lesson: a friendly mascot character walks the student through a short story that builds up the idea of "part out of whole = percent" step by step.
Each time a student reaches this section, one of five different real-world scenarios is chosen at random — a candy jar, a pizza, a classroom of students, a piggy bank, or a football match — so repeat visits don't feel identical, without showing multiple scenarios at once and overwhelming the student.
The story unfolds across five short panels: introducing the whole amount, showing the part being taken away, asking the student to guess the percentage, revealing the answer and formula, and a quick recap before moving on.
Replaced an earlier interaction that asked students to tap 25 individual items one by one (tedious and not meaningful practice) with a simple animated reveal — items fade away on their own while a counter updates, and the student taps once to continue.
Added a "make your best guess" moment before the answer is revealed, so students engage with the problem instead of just watching.

3. NEW — Mascot Character

Introduced a simple, friendly illustrated mascot with three clear expressions (explaining, excited, and thinking) that appear at different points in the story to match what's being said — designed to feel warm and approachable for ages 7–9.

4. Simplified — Explanation Screen Readability Pass

Removed extra instructional subtext that appeared on every section; replaced it with a small info icon next to the section header that shows a short description only when hovered or tapped, keeping the main screen clean.
Shortened the "Concept Theory" section's four explanation points down to one short, simple sentence each, and gave each point its own clearly separated card — matching the layout already used in the worked example section.
Enlarged the main formula and result displays (e.g. "Find 25% of 200 = 50") so they're the most visually prominent thing on the screen, with supporting math shown smaller underneath.
Enlarged the step text in the worked example section and gave each step, plus the final answer, its own clearly separated card so nothing runs together.
Verified the updated layout doesn't overlap or overflow on small mobile screens.

5. Fixed — Background Color Consistency

Fixed a recurring bug where card backgrounds on the explanation screen didn't match the rest of the app due to leftover local color settings — all cards now consistently use the same background as the Home page, in both light and dark mode.
Applied the same fix to the graded practice screen ("Percent Island"), which had previously been using its own unrelated color scheme — it now visually matches the rest of the app.

Verification

npm run build succeeded with no errors.
Manual walkthrough confirmed: all five Story scenarios play correctly with no repeats in a single session; the reveal animation and guess step work as intended; the info popup opens/closes correctly on both hover (desktop) and tap (mobile); no layout overlap at mobile widths; and light/dark mode render consistently across the Home page, explanation screen, Story section, and graded quiz.
Confirmed no unrelated changes were introduced to background styling anywhere in the app during this pass.

Files Changed
FileChangePercentExplanationApp.jsxRemoved AI Study Assistant Prompt section; replaced old drag-game Story section with new data-driven, scenario-based Story component and mascot; added info popup; simplified/restructured Theory and Worked Example sectionsPercentExplanationApp.cssRemoved AI prompt and old drag-game styles; added new Story, mascot, and info popup styles; fixed background token usage across cards; added responsive/typography adjustmentsPercent Island stylesheetFixed background token usage to match the rest of the app



## 2026-07-14

- **PR #34** (`feature/AL-learning-checkpoints`) — ahana4banerjee
- **PR #44** (`new_f`) — muditagrawal2007
- Fix submission delay: cache tatsavit userId + fire-and-forget LIL processAttempt to unblock responses  _(fac08b4, muditagrawal2007)_
- **PR #43** (`fix/mathlab-api-base`) — vicharanashala
- fix(mathlab): remove double API-base prefix in Visual Learning Universe  _(e8aca58, Jinal Gupta)_
- Restore Addition, Arithmetic, Coord. Geometry & Mensuration flashcards to home grid  _(9372b71, muditagrawal2007)_
- Guard generateMqExplanation with try-catch to prevent crash on questions with empty data  _(93e556a, muditagrawal2007)_
- **PR #41** (`new_f`) — muditagrawal2007
- Fix: Remove auto-submit on MCQ selection in LinearAlgebra mission quiz  _(c54726b, muditagrawal2007)_
- Remove language puzzle from home grid, wildcard /language route, guide button home-only, hamburger appends /language  _(b7f0069, muditagrawal2007)_
- **PR #39** (`new_f`) — muditagrawal2007
- **PR #40** (`fix/linalg-api-base`) — vicharanashala
- fix(linear-algebra): route quiz API through VITE_API_BASE_URL  _(915d3c8, Jinal Gupta)_
- fix: remove Random Mix, Custom Lesson, Gym from regularApps (grid cards) - kept in hamburger only  _(e8b6469, muditagrawal2007)_
- fix: remove Random Mix, Custom Lesson, Gym from flashcard grid (kept in hamburger)  _(acefa1d, muditagrawal2007)_
- fix: restore Random Mix, Custom Lesson, Gym, and Goal Practice to hamburger menu  _(fd16a1c, muditagrawal2007)_
- **PR #19** (`new_f`) — muditagrawal2007
- fix: add isGoalMode prop to GeneratedQuizApp and fix broken comment syntax  _(3c59513, muditagrawal2007)_
- feat: add Idli–Vada–Sambhar multiples & LCM game  _(b0fb976, Jinal Gupta)_
- feat: resolved merge conflicts and restored the feature functionality  _(ecef295, Ahana Banerjee)_
- **PR #33** (`feat/guide-vlu-performance-overhaul`) — Shubhdix9

## 2026-07-13

- style(menu): remove addition, mensuration, and coordinate geometry from hamburger menu  _(e8c1b77, Shubh dixit)_
- fix(addition): fix addition screen crash and remove extra modes  _(23a7be5, Shubh dixit)_
- **PR #35** (`language_integration`) — KrishnaG-101
- fix: hide the Guided Learning Journey banner from the Goal Selection view  _(21e10b4, Ahana Banerjee)_
- feat: optimize wordCreator verification latency and restore original layout  _(1cfebc2, Krishna Gelra)_
- Fix ReferenceError: setIsGoalMode is not defined in App state  _(81ff9ae, Shubh dixit)_
- feat: place the feature button on the main page below the search bar  _(36f71d7, Ahana Banerjee)_
- Fix isGoalSelection reference error in Home component  _(6f83f14, Shubh dixit)_
- Fix missing InteractiveLcmHcfApp import from upstream merge  _(fbd4502, Shubh dixit)_
- Resolve merge conflicts with upstream main and fix syntax errors  _(bee657a, Shubh dixit)_
- **PR #12** (`feature/new-feature`) — poorvipravallika06
- **PR #11** (`feature/AN-goal-based-practice-sessions`) — ahana4banerjee
- removed the route laquiz and correct the answers  _(001f190, muditagrawal2007)_
- perf: instant question transitions + visual counting caps  _(60cf163, Shubh dixit)_
- added the timer in the quiz and fix the solution part  _(3022297, muditagrawal2007)_
- feat: add confetti animations  _(0b6b158, Ahana Banerjee)_
- feat: add confetti animation  _(fba34e4, Ahana Banerjee)_
- added feature in the quiz  _(05f9444, muditagrawal2007)_
- added feature in the quiz  _(5f17c85, muditagrawal2007)_
- added feature in the quiz  _(5633feb, muditagrawal2007)_
- added the quiz seciotn in the linear algebra  _(d5ff001, muditagrawal2007)_
- feat: implement a targeted concept revision loop  _(dabfebd, Ahana Banerjee)_
- feat: Replaced "❌ Try Again" with "Oh no, it's okay" rendered in theme-compliant warning/wrong color  _(fd7f464, Ahana Banerjee)_
- feat: add a confetti animation upon clearing a checkpoint quiz  _(6b864df, Ahana Banerjee)_
- feat: block access to succesive topics in learning journey  _(5796f40, Ahana Banerjee)_
- integrated the new Learning Journey feature, enabling structured learning with sequential unlock rules, automatic integration with existing concept quiz modules, and cumulative 15-question topic checkpoints.  _(d42b5b6, Ahana Banerjee)_

## 2026-07-12

- feat: modular language puzzles framework & word creator  _(db31c33, Krishna Gelra)_

## 2026-07-11

- feat: Visual Learning Universe title size fix, Guide & UI tweaks  _(aafeae5, Shubh dixit)_
- feat: implement progressive gamified levels and retry flow for HCF/LCM quiz  _(675d485, poorvipravallika06)_

## 2026-07-10

- Implement confidence-based quiz progression flow (sequential redirection)  _(6fa50ad, poorvipravallika06)_
- Remove unused variables in LcmHcfApp.jsx to pass eslint checks  _(de4f388, poorvipravallika06)_
- Refine HCF Venn circles padding, cap LCM jump height, and implement progressive quiz tiers  _(3dd1cc4, poorvipravallika06)_
- UI standardization, premium dark theme updates, and module layout improvements  _(e408a79, Shubh dixit)_
- change  _(717bd0f, muditagrawal2007)_
- **PR #10** (`new`) — muditagrawal2007

## 2026-07-09

## Version 2 — 2026-07-09

### Overview
Refactoring pass across the Percentages feature addressing two issues raised after a Proof of Concept review: excessive cognitive load from stacked, scrollable content, and a browser-limit bug in sound playback caused by repeatedly creating new `AudioContext` instances. This release intentionally touches both `App.jsx` (graded quiz) **and** `PercentExplanationApp.jsx` / `.css` (explanation screen) — the prior restriction against modifying the explanation screen was deliberately lifted for this task.

### Changed — One-Card-at-a-Time View
- **Graded Quiz — Step-Wise Diagnostic Mode (`App.jsx`):**
  - Previously, all step cards (Step 1, Step 2, full solution recap) were stacked and simultaneously visible.
  - Now, exactly one card is rendered at a time — either the current step (`stepwiseState.currentStepIndex`) or the recap card (`stepwiseState.showRecap === true`).
  - A `key` prop on the card wrapper forces React to unmount/remount on each transition, triggering a `@keyframes percentages-card-fade-in` animation on every card swap.
  - A persistent step progress badge (e.g. "Step 1 of 2") is shown in the header.
- **Explanation Screen — Level 1 View (`PercentExplanationApp.jsx`):**
  - Previously, all 5 sections (Interactive Visual, Theory, Worked Example, AI Prompt, Quick Check Quiz) were stacked and simultaneously visible on one long scrollable page.
  - Now, an `activeSection` state (1–5) controls which single section is rendered.
  - Added a horizontal timeline progress indicator at the top showing steps 1–5, with filled green circles for completed steps, an orange-highlighted active step, grey pending steps, a filled tracking line, and click-back navigation to any previously visited section.
  - Added Previous/Next navigation buttons at the bottom of each card for sequential progression.
  - A `key`-based wrapper triggers a matching `@keyframes explanation-card-fade-in` animation on every section change.
  - The Quick Check Quiz (step 5) in the timeline remains disabled until `isExplanationFinished` is true (all 4 prior sections completed) — preserving the existing no-shortcut gating.

### Changed — Audio Context Singleton
- **New module — `client/src/audioContext.js`:**
  - Exports `getAudioContext()` — lazily creates a single shared `AudioContext` singleton and resumes it if suspended, instead of creating a new instance per sound.
  - Exports `playSound(type, enabled)` — builds fresh oscillator/gain nodes per sound event (unchanged behavior) against the shared singleton context, playing either a "correct" chime or "wrong" buzzer.
  - `getAudioContext()` is only ever called from inside `playSound()`, which itself is only ever called from user-gesture event handlers (button clicks) — never on component mount, satisfying the browser's audio-gesture activation requirement.
- **Graded Quiz (`App.jsx`):** removed the duplicated local `playSound` function; now imports the shared `playSound` from `./audioContext`. All existing call sites in the quiz submit handler continue to work unchanged.
- **Explanation Screen (`PercentExplanationApp.jsx`):** imports `playSound` from `./audioContext`; `MicroQuiz.handleSelect` calls `playSound(isCorrect ? 'correct' : 'wrong', true)` inside the option-selection handler (a user-gesture callstack), adding audio cues to Quick Check Quiz answers for the first time.
- **Mute toggle:** `playSound` accepts an `enabled` boolean parameter — passing `false` skips audio without touching or closing the singleton context (no `.close()` call), so the shared `AudioContext` persists across mute/unmute rather than being destroyed and needing re-creation.

### Verification
- `npm run build` succeeded (20 modules transformed, no errors).
- 14/14 automated static checks passed, including: `getAudioContext` not called at module top-level; `getAudioContext` only called inside `playSound`; both apps correctly import the shared `playSound`; quiz step timeline disabled until `isExplanationFinished`; Quick Check Quiz gated by `isExplanationFinished`; escalation redirect correctly calls `setActiveSection`; stepwise card and recap card both correctly keyed for transition animation.
- **Preserved invariants confirmed unchanged:** scoring/correctness-checking logic; state machine transitions and escalation logic (`handleQuizSubmit`, `stepwiseState` reducer, `failedRounds`); Quick Check Quiz randomization/no-repeat deduplication (`generateQuestion()`); no-direct-quiz-shortcut gating (`onContinueToQuiz` disabled gate, `isExplanationFinished` logic).
- **Manual browser verification still required** (not yet performed as of this entry) — dev server running locally for: timeline/one-card view check, MicroQuiz gating check, sound playback on quiz answers, step-wise transition/fade-in check, escalation redirect check (fail same step twice), and mute toggle check.

### Files Changed
| File | Change |
|---|---|
| `audioContext.js` | **NEW** — Singleton AudioContext + `playSound` utility |
| `App.jsx` | Removed duplicate `playSound`, imported shared one; rewrote stepwise rendering to one-card-at-a-time |
| `App.css` | Added `.percentages-card-transition-wrapper` + `@keyframes percentages-card-fade-in` |
| `PercentExplanationApp.jsx` | Imported `playSound`; added `activeSection` state, timeline indicator, nav buttons, transition wrapper; fixed a missing closing `</div>` |
| `PercentExplanationApp.css` | Added `.explanation-card-transition-wrapper` + `@keyframes explanation-card-fade-in` + timeline hover styles |

- Refactor HCF & LCM module with dynamic quiz, stepper locks, validation popups, accordion examples, and mistake redirection  _(dce3d1f, poorvipravallika06)_
- change  _(8a493a7, muditagrawal2007)_
- change  _(a386c49, muditagrawal2007)_
- change  _(26a3306, muditagrawal2007)_
- change  _(a45075e, muditagrawal2007)_
- feat: remove standard mode from the goal selector pills in the goal based practice app  _(3f54fac, Ahana Banerjee)_
- feat: implement goal-based practice session as a standalone and isolate it from the main diagnostic and learning module  _(73cb6e8, Ahana Banerjee)_
- feat: replace emojis with standard lucide-react icons  _(613278e, Shubh dixit)_
- chore: remove unused script files from root  _(fa62169, Shubh dixit)_

## 2026-07-08

Version 2 - 2026-07-15
Overview
Improved the Percentages learning and quiz experience with a clearer step-by-step explanation flow and a refreshed kid-friendly adventure theme.

1. Explanation Flow Improvements

- Updated the concept theory section to reveal one idea at a time with progress indicators.
- Updated the worked example to reveal one step at a time, including a separate final answer card.
- Added Previous and Next navigation within the theory and worked-example sections.
- Increased step-card spacing and text size for improved readability.
- Simplified the section progress label to show the current section number.

2. Percentages Quiz UI Redesign

- Replaced the previous percentages color palette with a polished dark/light adventure theme.
- Added centralized theme variables for backgrounds, text, borders, accents, status colors, and shadows.
- Refreshed the quiz shell, progress area, buttons, mute control, animations, stars, and card styling.
- Improved responsive layout behavior and fixed the quiz header mute-button overlap.

Status

Implemented for the Percentages explanation and quiz flows.

Version 1 — 2026-07-08
Overview
This release delivers a complete learning loop for Percentages — Level 1: Find a Percentage: a 5-part explanation screen (interactive visual → click-through theory → worked example → AI study assistant prompt → understanding check) feeding into a brand-new, kid-friendly graded quiz, tied together by an escalation system that sends struggling students back to the exact part of the explanation they need.

1. Levels Selection Screen

Entry point for the Percentages module (LevelsSelectView), listing all four levels:

Level 1: Find a Percentage (active)
Level 2: Increase / Decrease (locked, coming soon)
Level 3: Reverse Percentage (locked, coming soon)
Level 4: Compound Percentage (locked, coming soon)


No direct shortcut into the graded quiz from this screen — students must go through the explanation first.

2. Explanation Screen — 5-Part Design
Level1ExplanationView was built as five sequential parts:

Interactive Visual — drag-to-fill percent bar.
A slider the student drags fills a live percentage bar in real time, alongside a 100-square grid that fills square-by-square so "percent = out of 100" is physically visible rather than just stated. The calculation below updates live as the student drags: Find {percent}% of {whole} = {result}, so the student sees the answer change before any theory text appears.

Design rule: every sub-method is classified before building as either spatial/object visual (bar fills, dot slides, grid lights up — used here, since percentages have no literal physical object like a fraction does, but the bar-fill metaphor works the same way) or no visual (pure symbolic methods fall straight to worked examples instead, per the "don't force a visual where it teaches a wrong mental picture" rule). This classification is decided per sub-method, not per topic — within Percentages, Find and Increase are candidates for a spatial visual; Reverse and Compound were left undecided rather than forced.
Component is reusable (grid, pie/bar, slider) but currently implemented specifically for Percentages → Find; not yet abstracted into a fully reusable cross-topic component.


Click-through theory — one concept revealed per click, not a wall of text.
Worked example — step-by-step reveal, following the same click-through pattern as the theory section.
AI Study Assistant Prompt — a copyable, generic prompt (no numbers baked in) matching the original "prompt handoff" design exactly. Zero cost to Tenali since it hands off to the student's own AI chat tool rather than an in-app LLM tutor.
Understanding Check — an ungraded comprehension gate before unlocking the graded quiz. This evolved beyond the original single-question spec:

Original spec: one ungraded question, same difficulty as the worked example, with different numbers — but a single fixed question can be beaten by memorizing the answer on retry without real understanding.
What shipped instead:

20 real-life scenario templates (discount, exam marks, sports stats, restaurant tip, etc.) instead of one fixed question.
Randomized numbers every attempt, using step = 100 / gcd(percent, 100) to guarantee a clean, whole-number answer without brute-forcing valid combinations.
No-repeat rule — the template just used is excluded from the next pick, so consecutive questions are never the same scenario.
4 questions per round, need 3 correct to pass. A failed round starts a fresh round with new questions — no retry cap, same "repeat until passed" philosophy as the original stuck-loop rule, just applied at the round level instead of a single question.
Distractors built from real mistakes (percent-of-itself, leftover-instead-of-part, 10%-benchmark slip errors), with a collision check to stop a distractor from accidentally matching the correct answer.


This keeps the original spirit (ungraded, confirms understanding, not scored) while closing the memorization gap a single fixed question would have had.



3. Escape Hatches (matches original design)

AI prompt handoff — built exactly as specified: generic, no numbers, student copies it to any AI chat tool.
After 2 failed rounds (8 questions) — a visible nudge points back to the AI prompt box, giving it a genuine trigger condition tied to real struggle rather than being a default first option.
Video link — not yet added to this level; deferred, not built.

4. ⚠️ OPEN ITEM — "Skip to Quiz" vs. no-direct-jump requirement
Design notes state the graded quiz was "kept fully reachable throughout — via 'Skip to Quiz' for confident students and 'Continue to Practice' after passing the check." This conflicts with an explicit later requirement that the All Levels / explanation flow should not allow directly jumping to the graded quiz, bypassing the Understanding Check. This needs to be resolved before final sign-off — either the "Skip to Quiz" escape hatch should be removed, or it was already removed and this design note is stale and should be corrected. Confirm current behavior in the live build before closing out this release.
5. NEW — Graded Quiz: Step-Wise Diagnostic Solving
Rebuilt the graded PercentApp component from the ground up:

Removed the old difficulty-tier setup screen — the quiz now starts directly on Level 1 questions.
Added a frontend question generator (generateFindQuestion) producing randomized, clean percentage-of-a-whole problems (e.g. "What is 60% of 800?").
Implemented a 3-mode state machine:

Normal Mode — single-input question. A correct first-try answer counts toward the 3-star completion goal for the level and reveals an optional "Show full solution" accordion (doesn't affect scoring). A wrong answer transitions into Step-Wise Diagnostic Mode.
Step-Wise Diagnostic Mode — breaks the question into two guided steps:

Convert the percentage to a decimal/fraction
Multiply that value by the whole
Each step is checked independently; a correct step auto-advances, a wrong step reveals the correct method inline and waits for the student to continue. After both steps are resolved, a full solution recap is shown before moving to the next question.


Check Question Mode — shown only after a student returns from an escalation redirect (see below). A single verification question confirms the concept has landed; a correct answer returns them to Normal Mode, a wrong answer sends them back to the explanation again.



6. NEW — Escalation & Revert-to-Explanation Flow
To support students who repeatedly struggle with a specific step inside the graded quiz:

Each step type (conversion vs. multiplication) has its own persistent failure flag (failedStep1, failedStep2).
First failure on a step: the student sees the correct method inline and continues within the same quiz session — no redirect yet.
Second failure on the same step type (even on a later, different question): triggers an escalation —

A friendly mascot message pauses the quiz ("Let's pause and look at this idea together again to make it super clear! 🦉").
The student is redirected back into the Explanation Screen, deep-linked and auto-scrolled to the specific card relevant to the step they struggled with (the theory card for conversion, the worked example card for multiplication), with a brief highlight flash to draw attention to it.
After reviewing, the student clicks "Continue to Practice Quiz" again, which now lands them in Check Question Mode rather than straight back into Normal Mode — a single question confirming they've got it before resuming normal play.
If the check question is answered incorrectly, they're sent back to the explanation again; if correct, they return to Normal Mode.


This escalation flag persists for the rest of the session — it is intentionally not reset after a single successful check answer, so a further failure on that same step type will immediately re-trigger escalation rather than requiring two fresh failures again.
Note: this graded-quiz "Check Question Mode" is a separate mechanism from the explanation screen's "Understanding Check" (Section 2, part 5) — the former is a single-question gate re-entering the quiz after an escalation; the latter is the 4-question/3-to-pass round gating first entry into the quiz.

7. NEW — Kid-Friendly UI/UX Redesign (ages 7–10)




- feat: implement interactive LCM & HCF module with curiosity and confidence meter  _(8108475, poorvipravallika06)_
- added the limit to the number of the questions to visible  _(7636bf4, muditagrawal2007)_
- feat: implement Learning Intelligence Layer (LIL) architecture with goal based practise sessions functionality across all apps and question topic cards  _(c65bcde, Ahana Banerjee)_
- feat: Premium Core Educational Suite & UI Standardization (4 core features)  _(2e4d127, Shubh dixit)_

## 2026-05-11

- feat: add Guess the Number (binary magic card trick)  _(6d4e9ad, Vasuki)_

## 2026-05-03

- Add session summary doc  _(8ffb66e, Sudarshan)_
- Add L17 bridge 27 (+ − in Standard Form). Chapter 5 fully bridged.  _(408c4f2, Sudarshan)_
- Add L16 bridge 26 (× ÷ in Standard Form)  _(e6ee1ac, Sudarshan)_
- Add L15 bridge 25 (Standard Form Basics)  _(805fe78, Sudarshan)_
- Add L14 bridge 24 (Successive % Changes)  _(6aecb9e, Sudarshan)_
- Add L13 bridge 23 (Reverse Percentages)  _(c1b8650, Sudarshan)_
- Add L12 bridge 22 (Multiplier Method)  _(be68994, Sudarshan)_
- Add L11 bridge 21 (% Increase/Decrease)  _(3315931, Sudarshan)_
- Add L10 bridge 20 (X as a percentage of Y)  _(0e4376e, Sudarshan)_
- Add L9 bridge 19 (X% of Y)  _(76d2e9a, Sudarshan)_
- Add L8 bridges 17-18 (% Decimal, % Fraction conversions)  _(735aef8, Sudarshan)_
- Add L7 bridge 16 (Fraction OF / What fraction is M of N)  _(944a78a, Sudarshan)_
- Add L6 bridge 15 (Clear Decimals from Fractions)  _(cae5b23, Sudarshan)_
- Add L5 bridges 13-14 (Reciprocals + Divide Fractions/KCF)  _(c9deb84, Sudarshan)_
- Add Lesson 4 bridges (Bridges 9-12) for Add/Subtract Fractions  _(9ad3eb8, Sudarshan)_
- Add 8 Lesson-prerequisite bridges + LaTeX-typeset fractions  _(3ae971e, Sudarshan)_
- Add in-memory auth fallback when MongoDB is unavailable  _(9767e6c, Sudarshan)_
- auto-commit 2026-05-03 18:28:32  _(c21625e, Sudarshan)_
- auto-commit 2026-05-03 18:18:58  _(8a127a0, Sudarshan)_
- auto-commit 2026-05-03 17:10:36  _(3f49a2d, Sudarshan)_
- auto-commit 2026-05-03 14:19:32  _(8dbe6f6, Sudarshan)_

## 2026-05-02

- auto-commit 2026-05-02 04:12:35  _(8ba9205, Sudarshan)_
- auto-commit 2026-05-02 04:11:25  _(96e8fb3, Sudarshan)_
- Format deploy.yml for consistency and clarity  _(2fdc3c0, S. R. S. Iyengar)_
- Change deployment from GitHub Pages to droplet  _(3ca635b, S. R. S. Iyengar)_
- auto-commit 2026-05-02 01:12:09  _(2ebb0ac, Sudarshan)_
- auto-commit 2026-05-02 00:40:59  _(812a6d5, Sudarshan)_
- auto-commit 2026-05-02 00:22:40  _(4e021b4, Sudarshan)_

## 2026-05-01

- auto-commit 2026-05-01 21:48:39  _(f9a9c42, Sudarshan)_
- auto-commit 2026-05-01 21:40:10  _(c79778e, Sudarshan)_
- auto-commit 2026-05-01 19:26:47  _(8746120, Sudarshan)_
- auto-commit 2026-05-01 16:16:46  _(3d56ee0, Sudarshan)_
- auto-commit 2026-05-01 16:09:32  _(02c7a33, Sudarshan)_
- auto-commit 2026-05-01 16:00:50  _(3bda941, Sudarshan)_
- auto-commit 2026-05-01 15:55:22  _(df7a4bc, Sudarshan)_
- auto-commit 2026-05-01 11:03:48  _(9c13486, Sudarshan)_
- auto-commit 2026-05-01 11:03:37  _(c3a95ae, Sudarshan)_
- auto-commit 2026-05-01 10:52:56  _(1971271, Sudarshan)_
- auto-commit 2026-05-01 10:37:37  _(412ef5e, Sudarshan)_

## 2026-04-30

- auto-commit 2026-04-30 10:16:00  _(f393751, Sudarshan)_
- auto-commit 2026-04-30 09:57:46  _(c65c7c1, Sudarshan)_
- auto-commit 2026-04-30 09:47:25  _(71d189c, Sudarshan)_
- auto-commit 2026-04-30 09:12:34  _(0b309ec, Sudarshan)_
- auto-commit 2026-04-30 09:12:31  _(29c2227, Sudarshan)_
- auto-commit 2026-04-30 09:12:28  _(4d03baa, Sudarshan)_
- auto-commit 2026-04-30 09:12:26  _(12e40ce, Sudarshan)_
- auto-commit 2026-04-30 09:11:50  _(ebb8de4, Sudarshan)_
- auto-commit 2026-04-30 09:08:49  _(30a4fea, Sudarshan)_
- auto-commit 2026-04-30 09:06:41  _(dbf8c68, Sudarshan)_
- auto-commit 2026-04-30 09:02:35  _(5bebedc, Sudarshan)_
- auto-commit 2026-04-30 09:01:01  _(a1975c3, Sudarshan)_
- auto-commit 2026-04-30 08:44:29  _(0987d80, Sudarshan)_
- auto-commit 2026-04-30 08:40:43  _(bc4da92, Sudarshan)_
- auto-commit 2026-04-30 07:58:49  _(d64ddff, Sudarshan)_
- auto-commit 2026-04-30 07:54:49  _(d7b4a58, Sudarshan)_
- auto-commit 2026-04-30 07:54:45  _(e0989dc, Sudarshan)_
- auto-commit 2026-04-30 07:42:12  _(cdbb34b, Sudarshan)_
- auto-commit 2026-04-30 07:42:01  _(5dd1320, Sudarshan)_
- auto-commit 2026-04-30 07:41:05  _(330cffe, Sudarshan)_
- auto-commit 2026-04-30 07:35:45  _(1a2e6e5, Sudarshan)_

## 2026-04-29

- auto-commit 2026-04-29 12:42:25  _(0892380, Sudarshan)_
- auto-commit 2026-04-29 12:13:17  _(8f32df9, Sudarshan)_
- auto-commit 2026-04-29 09:28:52  _(3b054e2, Sudarshan)_
- auto-commit 2026-04-29 09:28:50  _(0cf45b8, Sudarshan)_
- auto-commit 2026-04-29 09:28:47  _(27d1bcc, Sudarshan)_
- auto-commit 2026-04-29 09:19:15  _(156aa0d, Sudarshan)_
- auto-commit 2026-04-29 09:05:51  _(9ef2e59, Sudarshan)_
- auto-commit 2026-04-29 08:53:34  _(7ad7964, Sudarshan)_
- auto-commit 2026-04-29 08:34:32  _(0136b75, Sudarshan)_
- auto-commit 2026-04-29 08:31:44  _(2a5772c, Sudarshan)_
- auto-commit 2026-04-29 08:23:14  _(610c314, Sudarshan)_
- auto-commit 2026-04-29 08:15:18  _(6a321de, Sudarshan)_

## 2026-04-27

- auto-commit 2026-04-27 08:24:40  _(8e7559d, Sudarshan)_
- auto-commit 2026-04-27 08:02:11  _(2b9ca8a, Sudarshan)_
- auto-commit 2026-04-27 07:45:44  _(b81b97b, Sudarshan)_
- auto-commit 2026-04-27 07:01:36  _(14d5c26, Sudarshan)_

## 2026-04-24

- auto-commit 2026-04-24 10:32:06  _(bca8cbd, Sudarshan)_
- Riya: shuffle MCQ options and add keyboard navigation (arrows, Enter, A-D/1-4)  _(238edbe, Sudarshan)_
- auto-commit 2026-04-24 09:56:03  _(afd1562, Sudarshan)_
- Tatsavit: add zoom to line-fitter (+/−/1:1/Fit buttons + mouse wheel)  _(8608f54, Sudarshan)_
- auto-commit 2026-04-24 09:34:47  _(31c2420, Sudarshan)_
- Tatsavit: replace drill with interactive line-fitter (random points, live y=mx+C)  _(cfbb1cc, Sudarshan)_
- auto-commit 2026-04-24 09:14:38  _(163508c, Sudarshan)_
- Add /riya: IGCSE Add Math 0606 practice bank (65 MCQs across 14 topics)  _(1fd6fa5, Sudarshan)_

## 2026-04-20

- auto-commit 2026-04-20 14:18:48  _(aecf603, Sudarshan)_
- Tatsavit: ensure all four MCQ choices are unique  _(555cbb2, Sudarshan)_

## 2026-04-18

- auto-commit 2026-04-18 21:00:22  _(9707001, Sudarshan)_
- auto-commit 2026-04-18 20:34:21  _(2a0c7d5, Sudarshan)_
- auto-commit 2026-04-18 20:28:24  _(6a04d2c, Sudarshan)_
- auto-commit 2026-04-18 20:26:54  _(616edd1, Sudarshan)_
- auto-commit 2026-04-18 20:25:33  _(0fb1759, Sudarshan)_
- auto-commit 2026-04-18 20:24:01  _(a6688c7, Sudarshan)_
- Add version badge + auto-increment on push  _(7d34815, Sudarshan)_
- Add version badge + auto-increment on push  _(7c11afc, Sudarshan)_
- Add version badge + auto-increment on push  _(0977d37, Sudarshan)_
- Add version badge + auto-increment on push  _(5df8f55, Sudarshan)_
- Add version badge + auto-increment on push  _(f7f4737, Sudarshan)_
- Render fractions as stacked LaTeX-style (no / sign), fix level 7 math  _(c2c864c, Sudarshan)_
- Replace Tatsavit with algebra simplification drill  _(f96a02c, Sudarshan)_
- auto-commit 2026-04-18 08:33:10  _(34499ee, Sudarshan)_
- auto-commit 2026-04-18 08:24:37  _(f829f9c, Sudarshan)_
- auto-commit 2026-04-18 08:18:48  _(a6fdb67, Sudarshan)_
- auto-commit 2026-04-18 07:53:54  _(b984612, Sudarshan)_
- auto-commit 2026-04-18 07:52:41  _(05c42ad, Sudarshan)_
- auto-commit 2026-04-18 07:48:54  _(adb4288, Sudarshan)_
- auto-commit 2026-04-18 07:46:12  _(95112a6, Sudarshan)_
- auto-commit 2026-04-18 07:41:25  _(b52b65c, Sudarshan)_
- auto-commit 2026-04-18 07:40:57  _(98ee2c8, Sudarshan)_
- auto-commit 2026-04-18 07:37:42  _(b76d6b5, Sudarshan)_
- auto-commit 2026-04-18 07:36:08  _(ebe80c2, Sudarshan)_
- auto-commit 2026-04-18 07:34:22  _(38dff87, Sudarshan)_
- auto-commit 2026-04-18 07:30:48  _(0f63e88, Sudarshan)_

## 2026-04-17

- auto-commit 2026-04-17 23:49:18  _(3c0a7d3, Sudarshan)_
- auto-commit 2026-04-17 23:46:04  _(6b37d34, Sudarshan)_
- auto-commit 2026-04-17 23:42:52  _(ae1aa7e, Sudarshan)_
- auto-commit 2026-04-17 23:37:40  _(5fb0684, Sudarshan)_
- auto-commit 2026-04-17 23:34:50  _(af4459f, Sudarshan)_
- fix(supertables1): randomly focus on 2 or 3 slowest facts (uniform)  _(90e78a4, Sudarshan)_
- fix(supertables1): no auto Phase 2 — add manual Phase 2 button  _(a3bc937, Sudarshan)_
- fix(supertables1): show lookup table in order (no shuffle), split into 2 rows of 5  _(744d4ca, Sudarshan)_
- feat: add /supertables1 — adaptive 2-phase speed drill with rolling window  _(62fae99, Sudarshan)_
- fix(supertables): exclude incorrect answers from timing data and attempt count  _(34a9ad9, Sudarshan)_
- feat(supertables): trimmed mean (drop top/bottom 10%) for chart and adaptive logic  _(64fabd4, Sudarshan)_
- feat(supertables): make all 10 levels adaptive using session performance data  _(4393f77, Sudarshan)_
- feat(supertables): add live performance chart + record timing on all levels  _(5d9fe1a, Sudarshan)_
- feat(supertables): expand table selection from 20 to 50  _(76bba2d, Sudarshan)_
- fix(supertables): fix grid overflow + Enter key advances on feedback  _(404527d, Sudarshan)_
- fix(supertables): improve contrast and formatting across dark/light themes  _(d29342a, Sudarshan)_
- feat(supertables): sequential level progression + high-contrast theme  _(88378bd, Sudarshan)_
- Add /supertables route with 10-level multiplication learning app  _(c5bcd18, Sudarshan)_
- Add SuperTables: 10-level multiplication learning app  _(bb8db96, Sudarshan)_
- feat: add /lakshya route + spaced repetition for slow multipliers in /tables  _(b01e72b, Sudarshan)_

## 2026-04-16

- feat: add /lakshya route with mastery multiplication program  _(209276d, Sudarshan)_
- feat: add /jatin route with 10-level table learning strategy  _(dac69e8, Sudarshan)_
- fix: theme-aware colors + Yazdan's Levels heading  _(9ea5f87, Sudarshan)_
- fix: replace hardcoded dark colors with theme-aware CSS variables  _(4076eb0, Sudarshan)_
- feat: add /yazdan route with 10-level progressive tables mastery  _(17e10a1, Sudarshan)_
- Enter key accepts Level Up on promotion prompt  _(c9e10cf, Sudarshan)_
- Rename landing page title to Tenali's Tables Desk  _(7f71ee0, Sudarshan)_
- Add /tables route — generic version of the scaffolded tables app  _(cf73ca0, Sudarshan)_
- Fix See Results, confetti, Level 2 single-column layout, Level 1 dimming answer  _(13b3575, Sudarshan)_
- 5-level progression: show answer, partial table, shuffled, reverse+products, no table  _(eecfd45, Sudarshan)_
- Phase 2: show only 5 shuffled rows instead of all 10  _(4556cae, Sudarshan)_
- Fix table readability: larger monospace font, aligned numbers, darker colors  _(692aac0, Sudarshan)_
- Extend table chooser from 2-9 to 2-19  _(7577ba2, Sudarshan)_
- Fix lookup table spacing: use tight gap instead of space-between  _(4c0ae22, Sudarshan)_
- Minimalist mobile-first layout for /taittiriya playing phase  _(f5d0294, Sudarshan)_
- Redesign /taittiriya: 3-phase scaffolded tables with table chooser  _(35bcd86, Sudarshan)_

## 2026-04-05

- Update SRS.md to v4.0 with comprehensive project documentation  _(e0a5851, Sudarshan)_
- Redesign solve card with stepped timeline layout  _(e79b546, Sudarshan)_
- Add interactive difficulty slider and per-topic difficulty tracking  _(d077928, Sudarshan)_
- Add draggable seeker to adaptive difficulty bar across all puzzles  _(375ad77, Sudarshan)_
- Add Skip button, center-align feedback, and visual ack for self-report  _(4491209, Sudarshan)_
- Add visual feedback for Too Hard/Too Easy self-report buttons  _(c7f7b6c, Sudarshan)_
- Redesign solve feedback: centered card with highlighted answer and styled explanation  _(fef7d3e, Sudarshan)_
- Rewrite solve explanations with detailed step-by-step teaching for all puzzle types  _(fccdbba, Sudarshan)_
- Update SRS.md v3.0: document Solve button, self-report buttons, and Journey fixes  _(f3055a7, Sudarshan)_
- Add Solve button across all puzzles with step-by-step explanations  _(d64045c, Sudarshan)_
- Journey quiz: fix Enter key, fix undefined feedback, add Skip + self-report buttons  _(61896d6, Sudarshan)_
- Add self-report difficulty buttons to all adaptive puzzles; add SRS.md  _(a0852b1, Sudarshan)_
- Tatsavit: add always-visible Easy/Hard self-report buttons below Submit  _(5589581, Sudarshan)_
- Add ^, x keys to Tatsavit numpad; accept full expression answers for monomials  _(7c14d56, Sudarshan)_
- Add 'Start the Journey' adaptive quiz to path page  _(d14ff18, Sudarshan)_
- Tatsavit: per-type slow thresholds instead of flat 15s  _(99a4134, Sudarshan)_
- Tatsavit: ask 'easy or difficult?' when student takes >15s on any question  _(8a96f06, Sudarshan)_
- Fix new puzzles (uuid→Date.now), add Tatsavit numpad + time-based hints, persist GK/Vocab seen IDs  _(94715ea, Sudarshan)_
- Add enhanced landing page preview at /enhanced  _(2f2ca88, Sudarshan)_
- Add 15 new puzzles, fix Tatsavit wrong-answer counting & sqrt prompt  _(f65b971, Sudarshan)_
- Style NONE option in red on /path dropdown  _(9573957, Sudarshan)_
- Add NONE source default for longest path, remove tatsavit from graph  _(d457a07, Sudarshan)_
- Route /tatsavit URL to new TatsavitApp instead of old AdaptiveMixedApp  _(f1e5f12, Sudarshan)_
- Add /path — prerequisite path finder with dropdown menus  _(d9c40f4, Sudarshan)_
- Serve prerequisite graph at /graph route  _(2253c62, Sudarshan)_
- Fix TatsavitApp + add prerequisite graph + fix server type bug  _(6344395, Sudarshan)_
- Add Tatsavit progressive drill + limit Squaring to 2-digit (11-99)  _(eb013eb, Sudarshan)_

## 2026-04-04

- Add Squaring puzzle — (a+b)² = a² + 2ab + b²  _(0145abd, Sudarshan)_
- Keep multiplier range 1-10 for multiplication tables  _(90595e4, Sudarshan)_
- Fix Random Mix missing prompts, extend Multiplication to 19  _(117c6a1, Sudarshan)_
- Fix Random Mix submit button — timer.elapsed() TypeError  _(21c05f8, Sudarshan)_
- Show error feedback when wrong factor entered in Prime Factors  _(1cd053b, Sudarshan)_
- Fix question skipping, score bugs, and Bearings repetition  _(4cde017, Sudarshan)_
- Fix Dot Products submit button and restyle with CSS classes  _(37e1e60, Sudarshan)_
- Overhaul Extended Euclidean: BigInt for 20+ digit numbers, wider inputs, proper subscripts  _(ca0d8fb, Sudarshan)_
- Fix Extended Euclidean compute button — rows array was inside comment  _(ed7e0f8, Sudarshan)_
- Fix double-submit causing inflated score in Dot Products  _(16186e5, Sudarshan)_
- Fix Dot Products: remove auto-tab, show proper vector dimensions  _(0ba2252, Sudarshan)_

## 2026-04-03

- Replace text inputs with visual matrix/vector grid boxes in Dot Products  _(b53512e, Sudarshan)_
- Render matrices with proper bracket formatting in Dot Products  _(4140445, Sudarshan)_
- Fix Dot Products medium: use 2D and 3D dot products instead of sum variant  _(77f453c, Sudarshan)_
- Add Dot Products puzzle with 4 difficulty levels  _(0142bb5, Sudarshan)_
- Move Random Mix + Custom Lesson into hamburger menu  _(82d10f4, Sudarshan)_
- Sort puzzles alphabetically, feature Random Mix + Custom in top row  _(c0e6059, Sudarshan)_
- Fix Enter key not advancing after wrong answer in QFormula, Simul, FuncEval, LineEq  _(c9a4ea6, Sudarshan)_
- Fix Enter key not advancing after wrong answer in Prime Factors  _(7b84779, Sudarshan)_
- Add Tenali Raman mascot to landing page  _(2c4fa30, Sudarshan)_
- Retrofit all hand-written quiz apps for visual uniformity  _(4b3322d, Sudarshan)_
- Update all 37 SKILL.md files to comprehensive formal specifications  _(014593f, Sudarshan)_
- Add Adaptive difficulty mode to all puzzle apps  _(85c4a18, Sudarshan)_
- Add Random Mix — adaptive cross-topic quiz with progressive difficulty  _(953511b, Sudarshan)_
- Add 6 geometry puzzles: Angles, Triangles, Congruence, Pythagoras, Polygons, Similarity  _(2bd177e, Sudarshan)_
- Add final 10 puzzles to reach 50 total: Integration, Standard Form, Bounds, Speed/Distance/Time, Variation, HCF & LCM, Profit & Loss, Rounding, Binomial Theorem, Complex Numbers  _(5727703, Sudarshan)_
- Add 14 new puzzles: Trig, Inequalities, Coord Geom, Probability, Statistics, Matrices, Vectors, Transformations, Mensuration, Bearings, Logarithms, Differentiation, Number Bases, Circle Theorems  _(7502b43, Sudarshan)_
- Add Sets puzzle — union, intersection, Venn diagrams  _(a94b016, Sudarshan)_
- Add Sequences, Ratio & Proportion, and Percentages puzzles  _(a72a770, Sudarshan)_
- Add Surds and Indices puzzles with full IGCSE coverage  _(7de490e, Sudarshan)_
- Fractions: replace stacked num/den inputs with single text input  _(87ad057, Sudarshan)_
- Fix Fractions (Add) setup screen to match standard puzzle layout  _(ae24a41, Sudarshan)_
- Tatsavit: increase to 100 questions per session  _(c3cfb93, Sudarshan)_
- Set Taittiriya to start on 3× table (mastered 2×)  _(b17839d, Sudarshan)_
- Fix double plus sign in monomial addition prompts  _(1f8a07e, Sudarshan)_
- Add table advancement to Taittiriya: auto-advance on mastery  _(013386b, Sudarshan)_
- Remove setup phase from Tatsavit — auto-starts immediately  _(248201c, Sudarshan)_
- Fix Taittiriya: show only the current table, not neighbors  _(d4e3a65, Sudarshan)_
- Remove setup phase from Taittiriya — auto-starts immediately  _(16bf1b6, Sudarshan)_
- Add Fractions (Add) puzzle, scaffolded tables for Taittiriya, adaptive mixed quiz for Tatsavit  _(39620ce, Sudarshan)_
- Add extensive code comments and rewrite all SKILL.md as formal specs  _(e97a032, Sudarshan)_
- Fix vocab repetition: add dedup to vocab + GK, expand to ~4000 questions  _(b6d4b61, Sudarshan)_

## 2026-04-02

- Add interval scheduling & extended Euclid pages, fix Custom Lesson crash  _(ce262f9, Sudarshan)_
- Rename GK subtitle to 'General Knowledge questions'  _(58ca1fd, Sudarshan)_
- Enable keyboard input for Arithmetic puzzle  _(46582ab, Sudarshan)_
- Fix desktop adaptive tables layout: balanced spacing and alignment  _(13cd0ac, Sudarshan)_
- Allow Enter key to advance after wrong answers in adaptive tables  _(ef5aa95, Sudarshan)_
- Improve mobile adaptive tables: quiz on top, compact 3-col ref table  _(6894bb5, Sudarshan)_
- Add Next button after wrong answers in adaptive tables  _(b653f5a, Sudarshan)_
- Fix mobile layout for reference table in /tatsavit and /taittiriya  _(0bf8a8c, Sudarshan)_
- Fix keyboard shortcuts: pass letter directly instead of relying on state  _(70eb575, Sudarshan)_
- Fix card layout: subtitle sits right below badge, both centered  _(347a148, Sudarshan)_
- Add keyboard shortcuts (1-4 / a-d) for multiple-choice questions  _(b07f230, Sudarshan)_
- Pin card badges to top: consistent alignment regardless of subtitle length  _(e2b4f64, Sudarshan)_
- Redesign adaptive tables: starting table picker + speed-based adaptation  _(964ba8a, Sudarshan)_
- Fix /taittiriya and /tatsavit: change Vite base from './' to '/'  _(fc5404d, Sudarshan)_
- Make title badges uniform: fixed 140x38px with centered text  _(917b8c3, Sudarshan)_
- Fix GK badge alignment: add min-width to menu-title badges  _(fd27bc3, Sudarshan)_
- Add adaptive multiplication tables for /taittiriya and /tatsavit  _(1fc2cbd, Sudarshan)_
- Complete dark/light theme: all components use CSS variables  _(51859ff, Sudarshan)_
- Shorten puzzle card names: GK, Vocabulary, Quadratics, Sim. Eq., Arithmetic  _(bb9ce73, Sudarshan)_
- Add Custom Lesson puzzle, dark/light theme toggle, search bar, uniform cards  _(d0ec86f, Sudarshan)_
- Lighten title badge to silver grey, center-align all card content  _(b0ae5ea, Sudarshan)_
- Style menu card titles with greyscale badge rectangles  _(b5dcb1f, Sudarshan)_
- Merge linear/simul, add Basic Arithmetic, restructure polymul, fix alignment  _(3c9773f, Sudarshan)_
- Use proper Unicode superscripts instead of ^ for exponents  _(7e568fe, Sudarshan)_
- Fix missing isCorrect state in Addition, Quadratic, Multiply, Sqrt  _(7806cc9, Sudarshan)_
- Rename Spot It to Twin Hunt everywhere  _(55ee5e1, Sudarshan)_
- Only auto-advance on correct answers; wait on wrong answers  _(bb9140c, Sudarshan)_
- Ensure prime factorization never generates prime numbers  _(e04efdc, Sudarshan)_
- Add SKILL.md specs for all 8 new math puzzles  _(84df47e, Sudarshan)_
- Add 8 new math puzzles to Tenali  _(33a9fb3, Sudarshan)_
- Update all SKILL.md specs to reflect current state of all 7 apps  _(b5c9553, Sudarshan)_
- Reverse Vocab Builder: show word, pick the correct definition  _(0d2ab69, Sudarshan)_
- Add Vocab Builder quiz and scatter Spot It items in circles  _(0800f57, Sudarshan)_
- Add Spot It puzzle — find the common object in two panels  _(a035455, Sudarshan)_
- Auto-advance to next question after 1.5s feedback display  _(f510a62, Sudarshan)_
- Add Multiplication Tables quiz and configurable question count  _(7ac6300, Sudarshan)_
- Fix numpad: enable physical keyboard alongside on-screen keypad  _(fd1951b, Sudarshan)_
- Add elegant on-screen numeric keypad to all math quizzes  _(7185057, Sudarshan)_
- Show running results table during Addition and Quadratic quizzes  _(7a6fa71, Sudarshan)_
- Fix: prevent a=0 in quadratic and allow minus sign on mobile keyboard  _(862e31a, Sudarshan)_
- Upgrade typography, responsive grid, and finish screen spacing  _(ce04be1, Sudarshan)_
- Add supermarket documentation hub and clean up old app docs  _(6a7ddcf, Sudarshan)_
- Redesign UI, add step-by-step feedback, quadratic difficulty levels, and 4x4 home grid  _(36a484e, Sudarshan)_

## 2026-04-01

- Add GitHub Pages deployment workflow with relative asset paths  _(a1f10d6, S. R. S. Iyengar)_
- Fix render.yaml: use node env, build client, start server  _(e52f864, S. R. S. Iyengar)_
- Add render.yaml for static site deployment  _(100334e, S. R. S. Iyengar)_

## 2026-03-31

- Add quadratic lesson and sync current Tenali working tree  _(b3b7e5d, sudarshan)_

## 2026-03-14

- Vendor nested quiz apps into main repo  _(4185a9f, S. R. S. Iyengar)_
- Add missing Tenali app content for deployment  _(9e20003, S. R. S. Iyengar)_
- Prepare Tenali for single-service Render deploy  _(7ff9e96, S. R. S. Iyengar)_
- Make all controls fully greyscale  _(f02d086, S. R. S. Iyengar)_
- Restyle Tenali with monochrome pencil theme  _(d3210e9, S. R. S. Iyengar)_
- Unify GK enter and next flow  _(5a552c4, S. R. S. Iyengar)_
- Add Enter key handling across quiz modes  _(7249d29, S. R. S. Iyengar)_
- Make addition flow explicit with next button  _(b26e6a1, S. R. S. Iyengar)_
- Show score in GK mode  _(98f498b, S. R. S. Iyengar)_
- Fix Tenali launcher API calls  _(d2242fc, S. R. S. Iyengar)_
- Integrate Tenali apps into single UI  _(714feca, S. R. S. Iyengar)_
- Proxy Tenali launcher apps through root server  _(36ab1b7, S. R. S. Iyengar)_
- Turn Tenali root into app launcher  _(df55244, S. R. S. Iyengar)_
- Serve built client from Express on single port  _(e19f8ba, S. R. S. Iyengar)_
- Proxy API through Vite for LAN clients  _(caed3e8, S. R. S. Iyengar)_
- Fix client API host for LAN access  _(dce76e0, S. R. S. Iyengar)_
- Scaffold Aryabhata kids addition app v1  _(0182e4b, S. R. S. Iyengar)_




