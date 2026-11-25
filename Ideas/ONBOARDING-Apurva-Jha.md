# Onboarding Document — Tenali

**Contributor:** Apurva Jha  
**Repository:** [vicharanashala/tenali](https://github.com/vicharanashala/tenali)  
**Date:** October 2026  

---

## 1. What is Tenali?

**Tenali** is an open-source, interactive mathematics learning platform. It is designed to make math concepts intuitive and engaging for students, ranging from early childhood arithmetic to high school algebra, geometry, and calculus.

### Core Problems Addressed:
1. **Passive Drill & Memorization:** Traditional platforms often rely on static textbook question banks. Tenali generates practice problems **algorithmically on the fly**, providing an endless stream of non-repeating questions computed from difficulty settings.
2. **One-Size-Fits-All Pacing:** Fixed problem sets can bore advanced students or overwhelm struggling learners. Tenali uses real-time adaptive scoring to adjust question difficulty dynamically based on student performance.
3. **Engagement & Motivation:** Math practice is paired with game-like elements—coins, experience points (XP), topic badges, and interactive visual sandboxes—to keep learners motivated.

---

## 2. What Do You Understand by Tenali as a System?

Tenali is built as a decoupled web application with a single-page React frontend and a Node.js/Express backend.

### How a Student Interacts with the System:
1. **Selecting an Activity:** The student picks a topic from the home dashboard (such as basic arithmetic, fractions, or linear equations).
2. **Receiving a Question:** The client requests a question from the server (`GET /<topic>-api/question?difficulty=...`). The server computes random numbers within that difficulty band, packages the prompt, and returns the problem to the client.
3. **Submitting an Answer:** The student enters their answer and clicks **Submit**. The frontend sends the response to the validation route (`POST /<topic>-api/check`).
4. **Grading & Feedback:** The server evaluates whether the answer is mathematically correct (`correct: true/false`). The frontend displays immediate feedback, and the adaptive score adjusts (moving difficulty up on success, down on mistakes).
5. **Step-by-Step Explanations:** If the learner gets stuck or clicks **Solve**, the server's explanation middleware (`server/explanations.js`) generates a step-by-step walkthrough of the solution.
6. **Progress Tracking:** The server asynchronously logs attempt data to MongoDB (via `server/lil/`), updating the student's earned coins and XP via the attempt-processing and student-state flow (`server/lil/processAttempt.js` and `studentState.js`), while streak handling is managed in `server/index.js`.

---

## 3. Current State of the Repository — What Has Been Done So Far

Tenali already includes a solid foundation of learning modules and server utilities:

### A. Technology Stack
- **Frontend:** React single-page application built with Vite, using Vanilla CSS, modern component layouts, and specialized libraries like Three.js and Mafs for visual sandboxes.
- **Backend:** Node.js with Express 5, providing modular REST routers under `server/routes/` for over 50 math topics.
- **Data & Auth:** MongoDB with Mongoose for user accounts, attempt history, and progress records, including a resilient in-memory fallback for local development.
- **Testing:** Automated API contract tests in `server/routes/__tests__/apiContract.test.js`, standalone unit tests for Bayesian Knowledge Tracing (BKT) in `server/lib/bkt.test.js`, and client-side Vitest tests.

### B. Existing Capabilities
- **Modular Math Routers:** Procedural question generation and answer verification across arithmetic, algebra, geometry, and calculus.
- **Solve & Explanation Engine:** A centralized explanation generator (`server/explanations.js`) that constructs step-by-step solutions when requested.
- **Attempt Telemetry:** Background logging (`server/lil/processAttempt.js`) that captures student answers, prompts, and timestamps.
- **Knowledge Tracing (BKT):** A standalone implementation of Bayesian Knowledge Tracing (`server/lib/bkt.js`) designed to model general skill acquisition.

---

## 4. Existing Misconception Detection

Tenali already has a Misconception Monsters feature that identifies specific patterns in incorrect student answers.

The existing classifier is located at `client/src/monsters/classifier.js` and currently recognises four misconception patterns:

- Bracketeer
- Sign-Swapper
- Decimal-Drifter
- Carry-Crasher

**The existing classifier has no fraction rules, and it runs on the client after the answer.**

Therefore, although Tenali already supports misconception detection for certain mathematical errors, it does not currently identify the specific fraction-addition misconception in which a student adds the numerators and denominators directly.

For example:

\[
\frac{1}{2}+\frac{1}{3}=\frac{2}{5}
\]

This is the specific misconception that Fraction Fusser is intended to identify.

### Investigation of the Existing `misconceptions.js` Module

The repository also contains `client/src/lib/misconceptions.js`, which includes a `fractionadd-api` configuration with fraction-related hint entries.

However, the investigation found that this module is not imported or referenced elsewhere in the repository. Its fraction rules use generic incorrect-answer comparisons rather than checking the actual fraction operands. The first rule returns for every incorrect answer, making the second rule unreachable.

The module therefore appears to be an unconnected earlier diagnostic prototype rather than part of the active Misconception Monsters classification system.

It is not suitable as the foundation for Fraction Fusser because its current rule interface does not receive the question operands required to identify the specific numerator-plus-denominator misconception.

## 5. Proposed Fraction Fusser Architecture

### 5.1 Recommended Approach: Extend the Existing Monster Classifier

The recommended approach is to extend the existing client-side classifier at `client/src/monsters/classifier.js` with a new fraction-addition misconception rule.

The rule would identify the following incorrect operation:

\[
\frac{a}{b}+\frac{c}{d}
\longrightarrow
\frac{a+c}{b+d}
\]

It would compare the student's submitted answer with the result of this incorrect operation. Equivalent fractions should also be recognised using mathematical equivalence rather than exact string matching.

This approach follows the existing Monster architecture instead of introducing an independent misconception-detection mechanism.

### 5.2 Why Extend the Existing Classifier?

The existing Monster system already provides a client-side classification mechanism and a user-facing experience for identified misconceptions.

Extending this system has several advantages:

- It maintains a single misconception-classification mechanism.
- It allows Fraction Fusser to follow the same pattern as the four existing Monsters.
- It makes existing Monster infrastructure available for explanations, tracking and guided practice.
- It avoids introducing a separate server-side classification system that would need additional integration with the existing Monster interface.

### 5.3 Existing Components That Can Be Reused

| Existing component | Current responsibility | Proposed use for Fraction Fusser |
|---|---|---|
| `server/routes/misc.js` | Checks fraction answers and returns correctness information. | Reuse the existing fraction checker for answer validation without changing its contract. |
| `client/src/monsters/fetchInterceptor.js` | Intercepts supported quiz-answer requests and passes incorrect answers to the classifier. | Extend its topic support and answer extraction to recognise the fraction-addition request payload. |
| `client/src/monsters/classifier.js` | Identifies the four existing Monster misconception patterns. | Add a fraction-specific rule to recognise the numerator-plus-denominator error. |
| `client/src/monsters/monsterStore.js` | Records Monster occurrences and cure-related information in browser local storage. | Extend its registered Monster IDs and reuse its existing tracking mechanism. |
| `client/src/monsters/monsterExplanations.js` | Stores explanations and descriptions for existing Monsters. | Add Fraction Fusser's description and progressively detailed explanations. |
| `client/src/monsters/MonsterToast.jsx` | Displays Monster notifications. | Reuse the existing notification mechanism with Fraction Fusser-specific presentation details. |
| `client/src/monsters/CureFlow.jsx` | Provides practice questions for correcting identified misconceptions. | Reuse the practice flow with fraction-specific questions and fraction-aware answer comparison. |
| `client/src/monsters/GuidedSolver.jsx` | Provides guided solving experiences for existing Monsters. | Reuse the guided-solving framework with fraction-addition explanations and examples. |
| `client/src/monsters/MonsterDetail.jsx` | Displays Monster information and related learning support. | Present Fraction Fusser's explanations and occurrence-based progression. |

These components already provide much of the required infrastructure. However, some require additional configuration or adaptation rather than being directly reusable without changes.

### 5.4 Frequency-Based Explanation Progression

The existing Monster store provides a reusable occurrence counter through `getMonsterBreachCount(monsterId)`.

It counts recorded occurrences of a particular Monster and stores the event history in browser local storage. The cumulative breach count is not reset when a student completes a cure; the count of slips since the last cure is tracked separately.

Fraction Fusser could reuse this mechanism to provide explanations at progressively deeper levels:

| Occurrence | Proposed learning response |
|---|---|
| First occurrence | A short reminder explaining why denominators cannot be added directly. |
| Second occurrence | A visual explanation showing why fractions must have the same-sized parts before addition. |
| Third and subsequent occurrences | A more detailed guided explanation covering common denominators, conversion and addition of numerators. |

This would allow the explanation to become more supportive as the same misconception continues to occur, without introducing a separate frequency-tracking mechanism.

The existing counter is browser-local, so its history is not automatically shared across different devices.

### 5.5 Responsibilities of the Fraction Checker and Monster Classifier

The existing fraction checker and the Monster classifier would have separate responsibilities:

- **Fraction checker:** Determines whether the submitted fraction answer is mathematically correct.
- **Monster classifier:** When the answer is incorrect, checks whether it matches the specific numerator-plus-denominator misconception.

The existing fraction checker can therefore continue handling answer validation, while Fraction Fusser adds misconception-specific identification.

### 5.6 Why Not Create a Separate Server-Side Classifier?

A separate server-side misconception detector would introduce another classification mechanism alongside the existing client-side Monster system.

It would also require additional integration to connect backend classification results with the existing Monster notifications, tracking, explanations and practice features.

The existing client-side classifier is used for supported quiz flows. However, the fraction-addition request must first be integrated into the existing request-interception pipeline so that the required question and answer information reaches the classifier. Once this integration is addressed, extending the existing classifier is the more consistent approach for this feature.

### 5.7 Architectural Decision

Fraction Fusser should extend the existing `client/src/monsters/classifier.js` system and reuse the existing Monster infrastructure wherever appropriate.

The older `client/src/lib/misconceptions.js` module should not be reused because it is unreferenced, its fraction rules do not identify the specific misconception, and it is disconnected from the active Monster system.

The existing fraction checker should remain responsible for mathematical answer validation. The Monster system should handle misconception identification and the associated learning experience.

This architecture is a proposal for mentor review. Implementation and any necessary changes to the existing components will remain pending mentor approval.

---

## 6. Your Contribution

I contributed solutions to three listed issues in the repository:

---

### Issue #214 — Language Puzzles Tile & Navigation Fix
- **Branch:** `fix/language-puzzles-tile`
- **Commits:** `cc0977ba`, `76477437`
- **Files Modified:**
  - [`client/src/App.jsx`](https://github.com/vicharanashala/tenali/blob/main/client/src/App.jsx)
  - [`client/src/features/tiles.js`](https://github.com/vicharanashala/tenali/blob/main/client/src/features/tiles.js)

#### The Problem
The Language Puzzles activity could not be launched properly from the navigation menu and its tile was not present on the home dashboard. In `client/src/App.jsx`, clicking the navigation bar button triggered a hard browser refresh via `window.location.href = '/language'`, which resulted in a 404 or blank view because the client does not use full server-side routing for sub-apps. Additionally, the Language Puzzles module was missing from the main tile catalog array in `client/src/features/tiles.js`.

#### The Fix
1. In `client/src/App.jsx`, replaced the hard reload `window.location.href` with the internal SPA state updater `onSelect('language')`.
2. In `client/src/features/tiles.js`, registered the `language` entry in the `TILES` array with appropriate metadata:
   ```javascript
   {
     key: 'language',
     name: 'Language Puzzles',
     subtitle: 'Fill in the blanks to create new words',
     color: 'orange',
     category: 'shelf'
   }
   ```

#### Why it Matters
It prevents unwanted full-page reloads, retains user session state, and ensures the Language Puzzles module is discoverable on the home dashboard grid.

---

### Issue #215 — Geocraft Tile & Redirect Normalization
- **Branch:** `fix/geocraft-tile`
- **Commits:** `89a441a7`
- **Files Modified:**
  - [`client/src/features/tiles.js`](https://github.com/vicharanashala/tenali/blob/main/client/src/features/tiles.js)

#### The Problem
The Geocraft 3D/geometry module had an inconsistent entry definition in `GEOCRAFT_ENTRY` within `client/src/features/tiles.js`. It contained `{ isRedirect: true, path: '/geocraft' }`, causing the dashboard to attempt an external redirection rather than rendering the embedded React component. Furthermore, it was not cleanly integrated into the primary `TILES` catalog list.

#### The Fix
1. Cleaned up `GEOCRAFT_ENTRY` by removing `isRedirect: true` and the redundant `path: '/geocraft'` property.
2. Formally added `geocraft` into the `TILES` catalog array so it renders identically to all native interactive sandboxes:
   ```javascript
   {
     key: 'geocraft',
     name: '📐 GeoCraft',
     subtitle: 'Interactive Geometry Lab',
     color: 'featured',
     category: 'shape-space'
   }
   ```

#### Why it Matters
Normalizes all dashboard activities under a single unified rendering model and allows seamless in-app navigation without broken redirects.

---

### Issue #220 — Standalone Deployment & Subpath Routing for Matrix Mystics
- **Branch:** `matrixmystics`
- **Commits:** `73d5b682`, `aa9561c4`
- **Files Modified:**
  - [`server/index.js`](https://github.com/vicharanashala/tenali/blob/main/server/index.js)
  - [`.env.example`](https://github.com/vicharanashala/tenali/blob/main/.env.example)

#### The Problem
Matrix Mystics needed to be deployable both as an embedded module within Tenali and as an independent, standalone service running on its own dedicated port (4004) under a custom subpath (`/matrixmystics/`). Without proper subpath routing and static asset mounting, running the server in standalone mode caused static client assets (JS/CSS) to 404 when requested under `/matrixmystics/`.

#### The Fix
1. Updated `.env.example` to document the environment configuration options:
   ```env
   PORT=4004
   SUBPATH_REDIRECT=/matrixmystics
   VITE_BASE_PATH=/matrixmystics/
   ```
2. In `server/index.js`:
   - Configured Express to serve static frontend assets (`clientDistPath`) from both the root path and the `SUBPATH_REDIRECT` path (`/matrixmystics`).
   - Added a redirect rule so visits to `/matrixmystics` automatically redirect to `/matrixmystics/` to ensure relative client asset paths resolve properly.
   - Ensured the SPA catch-all fallback (`*`) serves `index.html` from the correct subpath.

#### Why it Matters
Enables Matrix Mystics to be embedded into micro-frontends, reverse proxies (e.g., Nginx), or standalone containers without broken asset links or routing collisions.
