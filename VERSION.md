# Feature BC: Version 0.1 - Initial Directory Setup & Database Schema
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Establish the storage structure, directory hierarchy, and JSON schema validation format for conceptual multiple-choice questions.

## Key Decisions
- **Isolated Question Storage**
  - Stored questions inside a dedicated root directory (`conceptual/questions/`) rather than nested in server utilities, keeping the DB queries isolated.
- **Strict JSON Schema**
  - Defined a static structure containing unique `id`, `topic`, `question`, `options` (an array of exactly 4 strings), `answerOption` (A-D), `answerText`, and a detailed `explanation`.

## Implementation
- Added `conceptual/questions/` directory.
- Added draft schema files.

## Status

Introduced
- Folder structures for question seeding
- Initial JSON schema specifications

Removed
- (None)

Superseded by
- Version 0.2

---

# Feature BC: Version 0.2 - Backend Caching & Indexer
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Parse, load, and index all conceptual JSON questions into memory on backend server startup to prevent repetitive disk I/O.

## Key Decisions
- **One-Time Startup Cache**
  - Chose to load and index all question files synchronously once at server startup into a global array (`conceptualQuestions`) to avoid disk read latency during active quiz sessions.

## Implementation
- Modified `server/index.js` to add the `loadConceptual` loader function.

## Status

Introduced
- Server-side question caching mechanism

Removed
- (None)

Superseded by
- Version 0.3

---

# Feature BC: Version 0.3 - API Gateway & Topic Resolver
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Expose Express endpoints to fetch random conceptual questions filtered by topic.

## Key Decisions
- **Dynamic Topic Filtering**
  - Created a resolver endpoint `GET /conceptual-api/question` returning questions matching the `topic` query param.
- **Graceful Failure Fallback**
  - Designed the API to return a `404` or error response if the topic database is missing, allowing the client to recognize the failure and proceed with a calculation question.

## Implementation
- Modified `server/index.js` to register `GET /conceptual-api/question`.
- Modified `client/vite.config.js` to proxy `/conceptual-api` routes.

## Status

Introduced
- `GET /conceptual-api/question` endpoint
- Proxy routing configuration

Removed
- (None)

Superseded by
- Version 0.4

---

# Feature BC: Version 0.4 - Milestone Checkpoints & Fetching
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Trigger conceptual queries dynamically during the adaptive quiz lifecycle.

## Key Decisions
- **Milestone Detection**
  - Configured generated quiz components to flag milestones at specific query bounds (every 5th question: `questionNumber % 5 === 0`).
- **Silent Standard Fallback**
  - Programmed the client-side fetch wrapper to catch fetch errors and silently fall back to querying standard calculation questions, preventing UI crashes.

## Implementation
- Modified `client/src/App.jsx` to integrate `isMilestone` checks inside the loading routine.

## Status

Introduced
- Milestone-based query triggers
- Client fallback error handling

Removed
- (None)

Superseded by
- Version 0.5

---

# Feature BC: Version 0.5 - Validation Endpoint & Verification
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Implement backend checks to validate student choice selection and return correct answer feedback.

## Key Decisions
- **Uppercase Badge Comparison**
  - Implemented `POST /conceptual-api/check` using simple uppercase letter matching (`A`, `B`, `C`, `D`) rather than raw text matching to avoid character encoding mismatches.

## Implementation
- Modified `server/index.js` to register `POST /conceptual-api/check`.

## Status

Introduced
- `POST /conceptual-api/check` endpoint

Removed
- (None)

Superseded by
- Version 0.6

---

# Feature BC: Version 0.6 - Interactive MCQ UI Render
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Replace calculation text boxes with a styled multiple-choice card selection UI.

## Key Decisions
- **Dynamic UI Swapping**
  - Programmed the quiz component to verify if `question.isConceptual` is true. If active, it hides the text inputs and renders a structured layout of 4 option cards.
- **Theme-Aligned Feedback Coloring**
  - Used Tailwind-free CSS variables to color cards (green for correct, red/green blend for incorrect) and highlight badges.

## Implementation
- Modified `client/src/App.jsx` (`makeQuizApp`) to conditionally render the option card grid.

## Status

Introduced
- Clickable MCQ option card selection panel

Removed
- (None)

Superseded by
- Version 0.7

---

# Feature BC: Version 0.7 - Solve Explanation & Adaptive Scoring
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Integrate the Solve button for conceptual questions and set up adaptive level adjustments.

## Key Decisions
- **Solve Route Binding**
  - Overrode Solve click handlers to hit the backend verification route with an empty answer, fetching the correct option and the detailed explanation.
- **Tuned Adaptive Score Adjustments**
  - Programmed correct answers to award `+0.25` to the adaptive score, and incorrect/solved inputs to subtract `-0.35` to stabilize difficulty levels.

## Implementation
- Modified `client/src/App.jsx` to update Solve handlers and scoring rules.
- Modified `server/index.js` (`generateExplanation`) to parse conceptual step-wise explanations.

## Status

Introduced
- MCQ Solve explanation reveals
- Tuned MCQ adaptive scoring math

Removed
- (None)

Superseded by
- Version 0.8

---

# Feature BC: Version 0.8 - Keyboard Navigation & Duplicate Prevention
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Implement keyboard listener controls for touchless answering and filter out recently answered questions.

## Key Decisions
- **Event Listeners for Choices**
  - Added window keydown event listeners to bind keyboard keys `A`, `B`, `C`, and `D` for selecting cards, and `Enter` to submit.
- **Client-Passed Exclude Filter**
  - Client sends an `exclude` list parameter containing answered question IDs, which the backend uses to filter the cache array and prevent duplication.

## Implementation
- Modified `client/src/App.jsx` to bind keydown shortcuts and build `exclude` query strings.
- Modified `server/index.js` to parse exclude parameters and filter questions.

## Status

Introduced
- Keyboard shortcut options selection (`A`-`D`, `Enter`)
- Question duplicate prevention filters

Removed
- (None)

Superseded by
- Version 0.9

---

# Feature BC: Version 0.9 - Custom Quiz App & 6-Topic Seeding
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Replicate MCQ behaviors for custom quiz components and seed initial question databases.

## Key Decisions
- **FractionAddApp Integration**
  - Re-implemented the MCQ card render and keyboard listeners inside `FractionAddApp` because it bypassed the generated factory structure.
- **Pedagogical Seeding for 6 Topics**
  - Authored 10 conceptual question sets covering Fractions, Indices, Linear Equations, Trigonometry, Basic Arithmetic, and Quadratic Formula to address critical theoretical bottlenecks.

## Implementation
- Modified `client/src/App.jsx` to integrate MCQ checks inside `FractionAddApp`.
- Added 10 JSON database files under `conceptual/questions/`.
- Added `DESIGN_RATIONALE.md` and `HOWTO_EXTEND.md`.

## Status

Introduced
- Custom Fraction Addition MCQ layout
- 10 seeded JSON database files
- Reviewer documentation guides

Removed
- (None)

Superseded by
- Version 1.0

---

# Feature BC: Version 1.0 - Conceptual MCQ Variants
**Author**: Bithika Jain (@Bithika-Jain)

## Overview
- **Feature Name**: Conceptual Multiple-Choice Variants
- **Target SRS ID**: `Feature BC`
- **Author**: Bithika Jain (@Bithika-Jain)

## Feature Description
The Conceptual MCQ Variants feature integrates conceptual multiple-choice check-ins directly into adaptive math quizzes. It checks student comprehension of core math rules, definitions, and theorems (e.g., fraction division, negative/zero indices) rather than just mechanical calculations, triggering checkpoints at milestone intervals (such as every 5th question or level promotion). If a conceptual database is missing, the system gracefully falls back to standard calculation questions.

## Final Architecture (v1.0)
- **Component 1: Cached JSON Databases (`conceptual/questions/*.json`)**: Statically defined question banks representing 6 initial topics.
- **Component 2: Server API Endpoints (`server/index.js`)**: Startup database loader cache, `GET /conceptual-api/question` resolving parameters, and `POST /conceptual-api/check` validation route.
- **Component 3: Interactive MCQ Quiz Components (`client/src/App.jsx`)**: Adaptable UI option cards (A-D) and keydown listeners mapped in both the generated quiz app factory (`makeQuizApp`) and custom quiz modules (`FractionAddApp`).
- **Data flow**: Client detects adaptive milestone -> queries `/conceptual-api/question` -> displays options layout -> submits selected choice to `/conceptual-api/check` -> reveals validation feedback and step explanation.
- **State management**: Uses React local component state (`question`, `answer`, `revealed`, `isCorrect`, `feedback`) and ref parameters (`questionNumber`, `adaptScoreRef`) to sync progress without causing premature component re-renders.
- **Failure handling**: Catches fetch failures on the frontend to automatically fallback to standard calculation questions, preventing quiz crashes.

## Technical Evolution

### v0.0
- Initial concept of introducing conceptual math questions.

### v0.1
- Established root folder `conceptual/questions/` and defined the strict JSON question schema (`id`, `topic`, `question`, `options`, `answerOption`, `answerText`, `explanation`).

### v0.2
- Implemented startup caching in `server/index.js` via the `loadConceptual` indexer, storing parsed files into memory.

### v0.3
- Exposed the `GET /conceptual-api/question` endpoint and added proxy configurations in `client/vite.config.js`.

### v0.4
- Integrated milestones (`questionNumber % 5 === 0`) and silent fallbacks into the generated quiz component factory (`makeQuizApp`).

### v0.5
- Implemented uppercase character matching validations under `POST /conceptual-api/check`.

### v0.6
- Developed conditional MCQ UI rendering in the frontend, displaying interactive choice cards (A, B, C, D) using Tailwind-free CSS variables for layout and card status highlights.

### v0.7
- Integrated the Solve action to fetch explanations from `generateExplanation` and calibrated adaptive score changes (`+0.25` for correct, `-0.35` for incorrect/solve).

### v0.8
- Added keydown listeners (`A`, `B`, `C`, `D`, `Enter`) and ID-based client-passed `exclude` list parameters to prevent duplicate questions.

### v0.9
- Ported milestone triggers and MCQ UI render layers to the custom `FractionAddApp` and seeded 10 question databases for the 6 primary math topics.

## Final Design Philosophy
The feature evolved from an initial concept of separate quizzes to an integrated, milestone-driven check-in mechanism. By using a single monolithic factory in `App.jsx`, we successfully injected conceptual checks across 45+ math modules with zero duplicate code. Choosing custom JSON databases over auto-generation ensured high-quality, pedagogical MCQ choices targeting student misconceptions. The graceful fallback mechanism separates content generation from client-side execution, guaranteeing stability even if new topic databases are not yet seeded.

---

## v1.0 Scope and Limitations

### Shipped
- Fully functional MCQ quiz variants across the adaptive quiz factory (`makeQuizApp`) and custom `FractionAddApp`.
- 10 seeded JSON database files for 6 primary math topics.
- Touchless keyboard navigation support (`A`-`D`, `Enter`).
- Detailed step-wise correct answer explanation panel.
- Exclude list parameters for duplicate prevention.

### Deferred
- Automated mathematical diagram generation inside options.
- Dynamic MCQ generation based on individual student mistake history logs.

### Known limitations
- Conceptual MCQ variants are currently restricted to Adaptive mode (to maintain fast drilling flow in static modes).
- Initial database seeding is restricted to 6 core topics (Fraction Addition, Indices, Linear Equations, Trigonometry, Basic Arithmetic, and Quadratic Formula), with other topics rolling out gradually.

---

## Verification

### Automated Tests
- Checked backend database loads and route responses via unit scripts:
  `node test_quick.js` (all tests passed).
- Built production client package:
  `npm run build` (successful compilation without errors/warnings).

### Manual Verification Steps
1. Open the adaptive quiz dashboard and initiate the Fraction Addition quiz.
2. Advance through calculation questions to reach Question 5 (milestone).
3. Confirm that the numeric input field is hidden and replaced by 4 styled choice cards (A, B, C, D).
4. Hover over choices to verify interactive highlights. Click/select a choice, then press `Enter` (or press keyboard key `A`, `B`, `C`, or `D` then `Enter`).
5. Confirm correct feedback display, green/red highlight states, and step-wise explanation reveal.

---

## Acceptance Criteria
- [x] Supports multiple-choice options (A, B, C, D) dynamically mapped inside the question renderer engine.
- [x] Loads conceptual logic definitions from static JSON question databases.
- [x] Verifies selected choices via client-side state and backend check handlers.
- [x] Explanations avoid paragraphs exceeding 3 lines.
- [x] Gracefully falls back to calculation questions if the database is missing.

---

## Feature Demo
*Note: To avoid bloating the repository clone size with large binary files (images/videos), demo media assets are not committed directly to the git source repository. Instead, they are uploaded directly in the Pull Request description.*

- **Screenshot & Video Demo**: Available directly inside the GitHub Pull Request description.

---

## Appendix: Implementation Notes
- **Adaptive Score Math**: Correct choices increment difficulty score by `+0.25`, incorrect answers or Solves decrement it by `-0.35` to stabilize student level.
- **Vite Proxy configuration**: Extends proxy rules to direct all conceptual routes to port 4000.
- **Linter Alignment**: Ensured code styling is aligned with standard ES6 rules and doesn't conflict with ESLint rules (unused vars, impure functions).
- **Static serving**: Serves compiled assets under `client/dist` where standard Express routing handles index mapping.
