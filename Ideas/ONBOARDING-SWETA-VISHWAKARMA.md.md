# Tenali Onboarding Document

## 1. What is Tenali?

Tenali is a web platform for practising maths by answering questions, not just reading explanations. It covers topics from arithmetic and fractions through algebra, geometry, probability and calculus,etc. The app generates the questions itself, checks the answers, and can show a worked solution.

The idea is to fix two common problems with studying maths: theory-heavy material is easy to switch off from, and a fixed question bank gets repetitive. Because questions are generated, there's no fixed list to run out of, and difficulty can adapt to the learner. Students can practise alone, track progress, or compete with others in a live Battle Arena. The repository also contains a code playground.

## 2. What do I understand by Tenali (as a system)? 

Tenali is a browser app with a React frontend and a Node/Express backend. When a learner opens a puzzle, the frontend requests a question from the backend, shows it, sends the learner's answer back for checking, and then displays the feedback or solution.

According to the my understanding, most puzzle types follow one pattern: `GET /<type>-api/question` generates a question and `POST /<type>-api/check` checks an answer. Adding `solve: true` to the check request returns a step-by-step solution. This is why the frontend doesn't need a stored list of questions.

The main pieces are:

- **Frontend:** React components for topics, questions, timers, scores and feedback.
- **Puzzle APIs:** Express routes that generate questions and check answers.
- **Accounts:** JWT authentication, with passwords hashed using bcrypt.
- **Battle Arena:** Real-time multiplayer using Socket.IO.
- **Code playground:** A separate `/api/playground2/run` endpoint supporting 50+ languages, unrelated to the maths APIs.
- **Storage:** MongoDB through Mongoose, with an in-memory fallback. The deployment is described as one Node process serving both the app and the APIs.

The path of one question: student → React quiz → question endpoint → generated question → student answer → check endpoint → result or solution → feedback on screen.

There's also admin-only functionality, such as a proctoring-session dashboard. What I know about all of this comes from the documentation and from the part of the code my PR touched.

## 3. Current state of the repository

**Stack:** React 19 and Vite 8 on the frontend, with Framer Motion, Three.js and mafs; Node.js 20+, Express 5 and Socket.IO 4 on the backend; MongoDB with Mongoose; JWT, bcrypt, rate limiting and a CORS allowlist; a single-VPS deployment at `tenali.fun`.

**Existing features (per the README):** generated questions, difficulty and adaptive practice, many puzzle formats, step-by-step solutions, the Battle Arena, the code playground, accounts with progress tracking (XP, coins, streaks, badges), Random Mix and Custom Lesson modes, vocabulary and general-knowledge activities, interactive learning modules, internationalisation with right-to-left support, accessibility features, and optional exam-mode proctoring.

It's a wide feature set. A change to a shared component or helper can affect several puzzles, so changes need checking across more than one flow.

## 4. Gaps in the code

### 4.1 One very large frontend file

`client/src/App.jsx` holds most of the puzzle components. Issue #256 puts it at about 70,500 lines, and issue [#234](https://github.com/vicharanashala/tenali/issues/234) tracks extracting components from it. At that size it's hard to see which helpers a component can reach, and a shared edit can break something unrelated.

### 4.2 Undefined identifiers, one confirmed runtime crash

[Issue #256](https://github.com/vicharanashala/tenali/issues/256) reports 24 `no-undef` errors in `App.jsx`. The confirmed example is `createDynamicWeightBank`, which is defined inside `BalanceScaleApp` but called from `MixedLabApp` and from a `fetchQuestion` elsewhere, so it throws `ReferenceError: createDynamicWeightBank is not defined` when that code runs.

The 24 errors cover eight identifiers: `createDynamicWeightBank`, `isGoalMode`, `isAdaptive`, `finished`, `difficulty`, `question`, `handleTimeout` and `process`. The issue says each one needs its own judgement (hoist it, define it locally, or remove dead code) and warns against hoisting everything just to silence the linter. It also points out that `process` is a Node global used in browser code, which is a different kind of problem.

### 4.3 No client test runner

The client has no test runner ([#229](https://github.com/vicharanashala/tenali/issues/229)), so nothing exercises these code paths. The issue also notes that lint has been failing for other reasons (about 1,050 errors at the time), which buried this signal. A build can pass while a rarely reached puzzle still crashes.

### 4.4 Repeated timer and timeout logic

Several quiz components start timers and handle timeouts in very similar ways. That's a refactoring opportunity, since a fix in one place can be missed in another. Repeated code isn't automatically a bug, so I'd confirm that behaviour actually differs before changing it.

### 4.5 My own change isn't covered by focused tests

The PR reports a successful production build and a clean ESLint run. A build only shows the app bundles, and neither check proves a learner can finish each affected quiz. Until client tests exist, the affected puzzles need to be opened and tried by hand.

## 5. Ideas for the project

- **Split `App.jsx` into feature modules.** Start with a small, low-risk group of components and shared helpers, and check the routes after each move (issue #234).
- **Add a client test runner.** Start with pure helpers such as weight-bank generation, then a few representative quiz flows covering question loading, answer checking, timeout and completion (issue #229).
- **Make timer behaviour consistent.** Document how timers work in each mode first, and extract a shared hook only where behaviour truly matches.
- **Be deliberate about helper scope.** Search each helper's definition and call sites, and run ESLint with `no-undef` enabled. Don't move everything to module scope without checking what depends on component state.
- **Keep a manual regression checklist.** Until automated tests exist: question generation, correct and wrong answers, timeout, next question, result recording and session completion, with the PR stating which checks were actually run.

## 6. My contribution

My contribution is [PR #357, "fix: improve balance scale weight bank and quiz timers"](https://github.com/vicharanashala/tenali/pull/357), which is linked to issue #256. At the time of writing it is open, has one commit, and has no reviews yet.

My project work:

- improves the Balance Scale dynamic weight bank,
- updates quiz timer handling, and
- adjusts quiz completion-state handling in the affected components.

My PR reports a successful production build and ESLint with 0 errors.

