# Tenali — Complete Software Specification

**Version:** 4.0 | **Date:** April 5, 2026 | **Author:** Sudarshan Iyengar, IIT Ropar

> This document is a complete, formal specification of the Tenali educational quiz platform. An LLM given only this document should be able to recreate the entire project from scratch.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory Structure](#2-directory-structure)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Build & Deployment](#4-build--deployment)
5. [Server Architecture](#5-server-architecture)
6. [Solve Middleware & Explanation Engine](#6-solve-middleware--explanation-engine)
7. [Server Utility Functions](#7-server-utility-functions)
8. [Server Data Loading](#8-server-data-loading)
9. [Server API Endpoints — Complete Catalog](#9-server-api-endpoints--complete-catalog)
10. [Tatsavit Endpoint (9-Level Drill)](#10-tatsavit-endpoint)
11. [Client Architecture](#11-client-architecture)
12. [Client Hooks](#12-client-hooks)
13. [Shared Components](#13-shared-components)
14. [Cross-Cutting Features](#14-cross-cutting-features)
15. [makeQuizApp Factory](#15-makequizapp-factory)
16. [AdaptiveTablesApp](#16-adaptivetablesapp)
17. [ScaffoldedTablesApp](#17-scaffoldedtablesapp)
18. [TatsavitApp (9-Level Progressive Drill)](#18-tatsavitapp)
19. [RandomMixApp](#19-randommixapp)
20. [CustomApp (Custom Lesson Builder)](#20-customapp)
21. [Specialized Quiz Apps](#21-specialized-quiz-apps)
22. [Home Component](#22-home-component)
23. [App Shell & Routing](#23-app-shell--routing)
24. [modeMap — Component Registry](#24-modemap--component-registry)
25. [regularApps — Menu Items](#25-regularapps--menu-items)
26. [RANDOM_MIX_TOPICS Array](#26-random_mix_topics-array)
27. [CUSTOM_PUZZLES Array](#27-custom_puzzles-array)
28. [fetchQuestionForType URL Map](#28-fetchquestionfortype-url-map)
29. [getPromptForType Logic](#29-getpromptfortype-logic)
30. [Data Persistence (localStorage)](#30-data-persistence)
31. [CSS Design System](#31-css-design-system)
32. [Prerequisite Graph (graph/index.html)](#32-prerequisite-graph)
33. [Path Finder & Journey (graph/path.html)](#33-path-finder--journey)
34. [Enhanced Landing Page (enhanced/index.html)](#34-enhanced-landing-page)

---

## 1. Project Overview

Tenali is an adaptive, web-based educational math quiz platform. It serves **69 distinct puzzle types** spanning arithmetic, algebra, geometry, calculus, statistics, vectors/matrices, number theory, general knowledge, and vocabulary. The platform adapts difficulty in real time based on accuracy and response speed.

Primary students: **Taittiriya** and **Tatsavit** (Tatsavit is also the name of the 9-level progressive drill puzzle; context determines which is meant).

Deployed at: `tenali.onrender.com`

### Key Features (v4.0)
- 69 puzzle types with adaptive difficulty
- Per-topic difficulty tracking (each topic adjusts independently)
- Interactive DifficultySlider with draggable seeker
- Solve button with stepped timeline explanations across all puzzles
- Skip button in adaptive mode (counts as incorrect)
- Self-report buttons (Too Hard / Too Easy) that skip to next question
- 991 GK questions + 7,662 vocabulary questions from JSON banks
- Prerequisite DAG visualization with Journey learning paths
- Dark/light theme toggle

---

## 2. Directory Structure

```
Tenali/
├── server/
│   ├── package.json          # Express server dependencies
│   └── index.js              # ~7200 lines: ALL API endpoints + static serving
├── client/
│   ├── package.json          # React client dependencies
│   ├── vite.config.js        # Vite build + dev proxy config (40+ proxy routes)
│   ├── src/
│   │   ├── main.jsx          # React entry point (StrictMode)
│   │   ├── App.jsx           # ~10,900 lines: ALL components in one file
│   │   ├── App.css           # ~2,520 lines: Complete CSS design system
│   │   └── index.css         # Minimal base styles
│   └── dist/                 # Built output (gitignored)
├── chitragupta/
│   └── questions/            # 991 GK question JSON files
├── vocab/
│   └── questions/            # 7,662 vocabulary question JSON files
├── graph/
│   ├── index.html            # Prerequisite DAG visualization (D3 + dagre)
│   └── path.html             # Path finder + "Start the Journey" quiz engine
├── enhanced/
│   └── index.html            # Enhanced landing page preview
├── render.yaml               # Render deployment config
└── SRS.md                    # This file
```

---

## 3. Tech Stack & Dependencies

### Server (`server/package.json`)
```json
{
  "name": "aryabhata-server",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "http-proxy-middleware": "^3.0.5"
  }
}
```

### Client (`client/package.json`)
```json
{
  "type": "module",
  "dependencies": {
    "axios": "^1.13.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.0",
    "vite": "^8.0.0",
    "eslint": "^9.39.4"
  }
}
```

### External Libraries (CDN in HTML pages)
- D3.js 7.9.0 (graph visualization)
- Dagre 0.8.5 (DAG layout algorithm)

---

## 4. Build & Deployment

### `render.yaml`
```yaml
services:
  - type: web
    name: tenali
    env: node
    buildCommand: npm install && cd client && npm install && npm run build
    startCommand: node server/index.js
    healthCheckPath: /api/health
```

### Vite Config
- Dev server: `0.0.0.0:5173`
- 40+ API proxy routes to `http://127.0.0.1:4000`
- React plugin for JSX
- Production build outputs to `client/dist/`

### Server
- Port: `process.env.PORT || 4000`
- Binds to `0.0.0.0`
- Serves `client/dist` as static files
- Special routes: `/graph`, `/path`, `/enhanced`
- Catch-all `/*` serves `index.html` for SPA routing

---

## 5. Server Architecture

`server/index.js` is a single ~7200-line Express 5 file containing all API logic. Structure:

1. **Imports & config** (lines 1–30)
2. **CORS + JSON + static middleware** (lines 55–65)
3. **Solve middleware** (lines 84–115) — intercepts check endpoints when `solve: true`
4. **generateExplanation()** (lines 125–851) — 700+ line function covering 50+ puzzle types
5. **Question generators** — per-topic functions that create random problems
6. **Check handlers** — per-topic POST handlers that validate answers
7. **Utility functions** — `gcd`, `simplifyFraction`, `toMixed`, `lcm`, `nCr`, `factorial`, etc.
8. **Data loading** — `loadQuestions()` (GK), `loadVocab()` (vocabulary)
9. **Static file serving & route handlers** (lines 7150+)

---

## 6. Solve Middleware & Explanation Engine

### Solve Middleware (line 84)

Intercepts ALL `POST *-api/check` requests when `req.body.solve === true`. Uses Express monkey-patching pattern:

```javascript
app.use((req, res, next) => {
  if (req.method !== 'POST' || !req.path.includes('-api/check')) return next();
  if (!req.body?.solve) return next();
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    data.solved = true;
    const explanation = generateExplanation(req, data);
    if (explanation) data.explanation = explanation;
    return originalJson(data);
  };
  next();
});
```

This adds solve support to all 59+ check endpoints without modifying any individual handler.

### generateExplanation() (line 125)

A comprehensive 700+ line function that produces step-by-step educational explanations for 50+ puzzle types. Coverage includes:

| Category | Types Covered |
|----------|--------------|
| Arithmetic | basicarith, addition, multiply, decimals |
| Algebra | qformula, simul, lineareq, funceval, lineq, remfactor |
| Fractions & Surds | fractionadd, surds, indices |
| Sequences & Ratios | sequences, ratio, percent |
| Geometry | trig, invtrig, coordgeom, angles, triangles, congruence, pythag, polygons, similarity, circleth, bearings, heron, circmeasure |
| Calculus | diff, integ, limits, diffeq |
| Statistics & Probability | stats, prob, permcomb |
| Matrices & Vectors | matrix, vectors, dotprod |
| Advanced | binomial, complex, conics, linprog, bases, stdform, bounds, sdt, variation, hcflcm, profitloss, rounding, log, ineq, transform, mensur |
| Special | tatsavit (9 sub-types), gk, vocab, squaring, sets |

Each explanation provides a structured, step-by-step walkthrough of the solution method, not just the answer.

---

## 7. Server Utility Functions

### Mathematical
- `gcd(a, b)` — Euclidean algorithm
- `lcm(a, b)` — via gcd
- `simplifyFraction(num, den)` — reduce to lowest terms
- `toMixed(num, den)` — improper fraction to mixed number
- `nCr(n, r)` — combinations
- `factorial(n)` — factorial computation
- `isPerfectSquare(n)`, `simpleSurd(n)` — surd simplification
- `primeFactors(n)` — prime factorization

### Random Generation
- `randomInt(min, max)`, `randInt(lo, hi)` and per-module variants (`idxRand`, `seqRand`, `setRand`, `triRand`)
- `pick(arr)` and per-module variants — random element selection
- `randomSignedDigit()` — random integer [-9, 9]

### Formatting
- `formatSignedTerm(value, variablePart, isFirst)` — polynomial term display
- `buildQuadraticPrompt(a, b, c, x)` — quadratic expression string
- `formatPoly(coeffs)` — polynomial display
- `sup(n)` — superscript formatting
- `fmtFracExp(num, den)` — fractional exponents
- `fmtComplex(re, im)` — complex number display
- `fmtMat(M)`, `fmtVec(v)` — matrix/vector display

### Difficulty Mappers
- `digitRange(digits)`, `quadraticRange(difficulty)`, `polyCoeffRange(difficulty)`, `factorCoeffRange(difficulty)`, `primeRange(difficulty)`, `qfRange(difficulty)`, `simulRange(difficulty)`, `linearRange(difficulty)`, `arithRange(difficulty)`, `bandForStep(step)`

---

## 8. Server Data Loading

### GK Questions (`loadQuestions()`)
- Path: `../chitragupta/questions/`
- 991 JSON files loaded at startup
- Fields: `id`, `question`, `options`, `answerOption`, `answerText`, `genre`

### Vocabulary Questions (`loadVocab()`)
- Path: `../vocab/questions/`
- 7,662 JSON files loaded at startup
- Fields: `id`, `question`, `options`, `answerOption`, `answerText`, `difficulty`

---

## 9. Server API Endpoints — Complete Catalog

Every puzzle type has a GET (question generation) and POST (answer checking) endpoint pair. 59 endpoint pairs total:

| API Path | Puzzle Type |
|----------|------------|
| `/addition-api` | Addition |
| `/angles-api` | Angles |
| `/banking-api` | Banking (RD) |
| `/bases-api` | Number Bases |
| `/basicarith-api` | Basic Arithmetic (+, −, ×) |
| `/bearings-api` | Bearings |
| `/binomial-api` | Binomial Theorem |
| `/bounds-api` | Bounds |
| `/circle-api` | Circle Theorems |
| `/circmeasure-api` | Circular Measure |
| `/complex-api` | Complex Numbers |
| `/congruence-api` | Congruence |
| `/conics-api` | Conic Sections |
| `/coordgeom-api` | Coordinate Geometry |
| `/decimals-api` | Decimals |
| `/diff-api` | Differentiation |
| `/diffeq-api` | Differential Equations |
| `/dotprod-api` | Dot Product / Matrix Multiply |
| `/fractionadd-api` | Fraction Addition |
| `/funceval-api` | Function Evaluation |
| `/gk-api` | General Knowledge |
| `/gst-api` | GST |
| `/hcflcm-api` | HCF & LCM |
| `/heron-api` | Heron's Formula |
| `/indices-api` | Indices / Exponents |
| `/ineq-api` | Inequalities |
| `/integ-api` | Integration |
| `/invtrig-api` | Inverse Trigonometry |
| `/limits-api` | Limits |
| `/lineareq-api` | Linear Equations |
| `/lineq-api` | Line Equation (slope/intercept) |
| `/linprog-api` | Linear Programming |
| `/log-api` | Logarithms |
| `/matrix-api` | Matrices |
| `/mensur-api` | Mensuration |
| `/multiply-api` | Multiplication Tables |
| `/percent-api` | Percentages |
| `/permcomb-api` | Permutations & Combinations |
| `/polyfactor-api` | Polynomial Factoring |
| `/polymul-api` | Polynomial Multiplication |
| `/primefactor-api` | Prime Factorization |
| `/prob-api` | Probability |
| `/profitloss-api` | Profit & Loss |
| `/pythag-api` | Pythagoras' Theorem |
| `/qformula-api` | Quadratic Formula |
| `/quadratic-api` | Quadratic Evaluation |
| `/ratio-api` | Ratio & Proportion |
| `/remfactor-api` | Remainder/Factor Theorem |
| `/rounding-api` | Rounding |
| `/sdt-api` | Speed, Distance, Time |
| `/section-api` | Section Formula |
| `/sequences-api` | Sequences |
| `/sets-api` | Set Operations |
| `/shares-api` | Shares & Dividends |
| `/similarity-api` | Similarity |
| `/simul-api` | Simultaneous Equations |
| `/sqrt-api` | Square Roots |
| `/squaring-api` | Squaring (a+b)² |
| `/standardform-api` | Standard Form |
| `/stats-api` | Statistics |
| `/surds-api` | Surds |
| `/tatsavit-api` | Tatsavit 9-Level Drill |
| `/transform-api` | Transformations |
| `/triangles-api` | Triangles |
| `/trig-api` | Trigonometry |
| `/variation-api` | Variation |
| `/vectors-api` | Vectors |
| `/vocab-api` | Vocabulary |
| `/polygons-api` | Polygons |

Plus system routes:
- `GET /api/health` — health check
- `GET /graph` — prerequisite graph page
- `GET /path` — path finder / journey page
- `GET /enhanced` — enhanced landing page
- `GET /*` — SPA catch-all

---

## 10. Tatsavit Endpoint

`tatsavit-api` is a special endpoint generating one of 9 question types based on `level` parameter:

| Level | Type | Description |
|-------|------|-------------|
| 0 | Tables (1-digit) | Single-digit multiplication |
| 1 | Tables (up to 20) | Extended multiplication tables |
| 2 | Squares | Squaring 2-digit numbers |
| 3 | Square Root | Estimation and trial |
| 4 | Monomial × | Coefficient + exponent multiplication |
| 5 | Percentage | Fraction of a number |
| 6 | Addition | Up to 3-digit addition |
| 7 | Subtraction | Up to 3-digit subtraction |
| 8 | Negative Arithmetic | Sign tracking operations |

---

## 11. Client Architecture

`client/src/App.jsx` is a single ~10,900-line React 19 file containing ALL components. Structure:

1. **Constants** — `API`, `DEFAULT_TOTAL` (20), `AUTO_ADVANCE_MS` (1500)
2. **Hooks** — `useAutoAdvance`, `useTimer`
3. **Shared components** — `ResultsTable`, `renderFeedback`, `DifficultySlider`, `NumPad`, `QuizLayout`, `MatrixBox`
4. **Utility functions** — `adaptiveLevel`, `adaptivePct`
5. **Standalone quiz apps** — `AdaptiveTablesApp`, `ScaffoldedTablesApp`, `GKApp`, `AdditionApp`, etc.
6. **Factory-generated apps** — `makeQuizApp` produces ~28 quiz components
7. **Specialized apps** — `TatsavitApp`, `RandomMixApp`, `SquaringApp`, `DotProdApp`, `CustomApp`, etc.
8. **App shell** — `App` (routing + theme), `Home` (menu grid)
9. **Data maps** — `modeMap`, `regularApps`, `RANDOM_MIX_TOPICS`, `CUSTOM_PUZZLES`, `fetchQuestionForType`, `getPromptForType`

---

## 12. Client Hooks

### useAutoAdvance(revealed, advanceFnRef, isCorrect)
Auto-advances to next question after a correct answer is revealed. Fires after `AUTO_ADVANCE_MS` (1500ms). Only triggers when `isCorrect === true`.

### useTimer()
Returns `{ elapsed, start, stop, reset }` where `elapsed` is a number (seconds). Updates every 250ms for smooth UI display. `stop()` returns the final elapsed time.

---

## 13. Shared Components

### renderFeedback(feedback, isCorrect)
Centralized feedback renderer used by all 31+ quiz components. Two modes:

**Normal mode** (correct/wrong): Renders `<div className="feedback correct|wrong">{feedback}</div>`

**Solve mode** (stepped timeline): When feedback starts with `"Solution:"`, parses into structured timeline:
- Answer badge: gradient pill with accent background + shadow
- Steps: Each explanation line becomes a mini-card connected by vertical timeline dots and lines
- Last step highlighted with accent border and green dot
- Step detection: Lines starting with numbers, "Step N:", "Answer:", "Multiply", "Calculate", etc. start new steps

### DifficultySlider({ pct, onChange, maxWidth })
Interactive difficulty bar with draggable seeker thumb. Renders a gradient track (green → orange → red → purple) with a circular white thumb at the current position. Supports pointer drag for real-time adjustment. Used across all adaptive quiz components and TatsavitApp.

### NumPad({ value, onChange, onSubmit, disabled, showDecimal, showSlash, showCaret, showX })
Virtual numeric keypad (0–9, ±, backspace). Optional keys for decimal point, fraction slash, exponent caret, and variable x. Used in quizzes requiring numeric input.

### ResultsTable({ results })
Renders quiz results as a color-coded table with columns for question, user answer, correct answer, time, and correctness. Shows total time and average time per question.

### QuizLayout({ title, subtitle, onBack, children, timer })
Wrapper component for quiz pages. Renders header with back button, timer display, title, and subtitle.

### MatrixBox({ matrix, label })
Renders a matrix in grid format with optional label.

---

## 14. Cross-Cutting Features

These features apply across all or most quiz components:

### Solve Button
Every quiz has a "Solve" button (outline style, accent border) visible when the question is unanswered. Sends `{ ...question, solve: true }` to the check endpoint. The solve middleware adds a step-by-step explanation. Result displayed as a stepped timeline card.

### Skip Button (Adaptive Mode Only)
In adaptive mode, a "Skip" button appears alongside Submit and Solve. Skipping:
- Counts the question as incorrect
- Lowers difficulty for the current topic/type
- Records `(skipped)` in results
- Advances to next question

### Self-Report Buttons (Too Hard / Too Easy)
Always-visible buttons in adaptive mode. Behavior:
- **Too Hard**: Lowers the current topic's difficulty AND skips to next question (if unanswered) or advances (if answered)
- **Too Easy**: Raises the current topic's difficulty AND skips/advances
- Both show transient acknowledgment text via `reportAck` state (1.5s fade)

### Per-Topic Difficulty Tracking
Difficulty adjustments are tracked independently per topic/type:
- **makeQuizApp**: Each quiz instance has its own `adaptScore` (0–3), already independent since each is a separate component
- **RandomMixApp**: `topicDiffMap` state — object keyed by topic key, each value 0–3
- **TatsavitApp**: `typeDiffMap` state — object keyed by type index (0–8), each value 0–3

### DifficultySlider
All adaptive difficulty bars are interactive sliders. Users can drag the seeker thumb to manually set difficulty level in addition to automatic progression.

### Feedback Centering
All correct/incorrect feedback text is center-aligned across all puzzles.

---

## 15. makeQuizApp Factory

```javascript
function makeQuizApp({ title, subtitle, apiPath, diffLabels, placeholders, tip, answerField })
```

Returns a `GeneratedQuizApp` component with standardized behavior:
- Setup screen: difficulty selection (radio pills + Adaptive), question count input
- Playing screen: question prompt, answer input, Submit/Solve/Skip buttons, DifficultySlider, self-report buttons
- Finished screen: score summary, ResultsTable, Play Again

**Adaptive features**: `adaptScore` (0–3), `adaptScoreRef`, `adaptivePct()`, `adaptiveLevel()` mapping to easy/medium/hard/extrahard. Self-report with `reportAck` state. `handleSkip` for skip functionality. `handleSolve` for solve functionality.

**28+ apps generated by makeQuizApp**:
TrigApp, IneqApp, CoordGeomApp, ProbApp, StatsApp, MatrixApp, VectorsApp, TransformApp, MensurApp, BearingsApp, LogApp, DiffApp, BasesApp, CircleThApp, IntegApp, StdFormApp, BoundsApp, SDTApp, VariationApp, HcfLcmApp, ProfitLossApp, RoundingApp, BinomialApp, ComplexApp, AnglesApp, TrianglesApp, CongruenceApp, PythagApp, PolygonsApp, SimilarityApp, LinearEqApp, DecimalsApp, PermCombApp, LimitsApp, InvTrigApp, RemFactorApp, HeronApp, SharesApp, BankingApp, GSTApp, SectionApp, LinProgApp, CircMeasureApp, ConicsApp, DiffEqApp

---

## 16. AdaptiveTablesApp

Multiplication tables drill with rolling-window adaptive algorithm. Tracks per-table performance and focuses on weak areas. Custom implementation (not factory-generated).

---

## 17. ScaffoldedTablesApp

Guided multiplication tables with scaffolding. Shows partial products and hints. Custom implementation.

---

## 18. TatsavitApp (9-Level Progressive Drill)

Progressive mental math training cycling through 9 question types. Custom implementation with:

**State**:
- `adaptLevel` (float 0.0–8.0): Controls which type appears. `currentLevel()` = floor of adaptLevel
- `adaptLevelRef`: Ref for synchronous access
- `streakRef`: Tracks consecutive correct/wrong streak
- `typeDiffMap`: Per-type difficulty tracking (9 types × 4 difficulty levels)
- `showSlowHint`: Triggers when answer time exceeds per-type slow threshold
- `reportAck`: Transient feedback for self-report buttons

**Adaptive progression**:
- Correct answer: +0.3 (or +0.15 if slow, +0.5 on 3-streak)
- Wrong answer: −0.4 (or −0.6 if slow)
- Self-report adjusts per-type difficulty independently

**Per-type slow thresholds** (seconds): Tables 8, Tables20 10, Squares 12, SqRoots 15, Monomial 12, Percentage 20, Addition 10, Subtraction 10, NegArith 12. Harder within-type difficulty adds 1–5 seconds buffer.

**Within-type difficulty**: `adaptiveDifficulty()` returns easy/medium/hard/extrahard based on `typeDiffMap[currentType]`.

**Wrong answers don't count**: Only correct answers advance the question counter. Wrong answers reload a fresh question at the same number.

---

## 19. RandomMixApp

Adaptive cross-topic quiz drawing from 43 topics. Custom implementation with:

**State**:
- `topicDiffMap`: Per-topic difficulty tracking (object keyed by topic key, each 0–3)
- `streak`: Positive = correct streak, negative = wrong streak
- `skippedTopics`: Set of topic keys the user has skipped
- `reportAck`: Transient self-report feedback

**Difficulty progression**:
- 3 correct in a row → level up that topic
- 2 wrong in a row → level down that topic
- Self-report buttons adjust current topic's difficulty independently

**Topic selection**: Random from available (non-skipped) topics. Users can skip individual topics and unskip them later.

**43 available topics**: basicarith, addition, quadratic, multiply, sqrt, funceval, lineq, fractionadd, surds, indices, sequences, ratio, percent, sets, trig, ineq, coordgeom, prob, stats, matrix, vectors, transform, mensur, bearings, log, diff, bases, circleth, integ, stdform, bounds, sdt, variation, hcflcm, profitloss, rounding, binomial, complex, angles, triangles, congruence, pythag, polygons, similarity

---

## 20. CustomApp (Custom Lesson Builder)

Lets users build custom lessons by selecting specific puzzle types and quantities. Supports 68 puzzle types via `CUSTOM_PUZZLES` array.

---

## 21. Specialized Quiz Apps

These have custom implementations (not factory-generated):

| App | Description |
|-----|-------------|
| GKApp | Multiple-choice general knowledge from 991 questions |
| AdditionApp | Addition practice with configurable digit count |
| BasicArithApp | +, −, × with positive and negative numbers |
| QuadraticApp | Evaluate y = ax² + bx + c at given x |
| MultiplyApp | Multiplication tables (2–19) |
| VocabApp | Vocabulary definitions from 7,662 questions |
| SquaringApp | (a+b)² = a² + 2ab + b² — fill four boxes |
| DotProdApp | Dot product and matrix multiplication |
| SetsApp | Set operations and Venn diagrams |
| SequencesApp | Arithmetic & geometric sequences |
| RatioApp | Ratio & proportion |
| PercentApp | Percentage calculations |
| IndicesApp | Laws of exponents |
| SurdsApp | Surd operations |
| FractionAddApp | Fraction addition |
| TwinHuntApp | Find the common object (visual) |
| SqrtApp | Square root drill |
| PolyMulApp | Polynomial multiplication |
| PolyFactorApp | Polynomial factoring |
| PrimeFactorApp | Prime factorization |
| QFormulaApp | Quadratic formula |
| SimulApp | Simultaneous equations (2×2 or 3×3) |
| FuncEvalApp | Function evaluation |
| LineEqApp | Line equation (slope & intercept) |
| IntervalSchedulingApp | Interval scheduling algorithm |
| ExtendedEuclidApp | Extended Euclidean algorithm |
| AdaptiveMixedApp | Mixed quiz mode |

---

## 22. Home Component

Searchable grid of all 69 quiz types. Features:
- Text search filters by name and subtitle
- Color-coded cards (blue, green, purple)
- Responsive grid layout
- Click to enter any quiz

---

## 23. App Shell & Routing

`App` component manages:
- Dark/light theme toggle with `localStorage` persistence
- `mode` state for routing (`null` = home, string = quiz key)
- Renders `Home` or the appropriate quiz component via `modeMap`

---

## 24. modeMap — Component Registry

Maps 71 string keys to React components:

```
gk, addition, quadratic, multiply, vocab, spot (TwinHunt), sqrt, polymul,
polyfactor, primefactor, qformula, simul, funceval, lineq, basicarith,
fractionadd, surds, indices, sequences, ratio, percent, sets, trig, ineq,
coordgeom, prob, stats, matrix, vectors, dotprod, transform, mensur,
bearings, log, diff, bases, circleth, integ, stdform, bounds, sdt,
variation, hcflcm, profitloss, rounding, binomial, complex, angles,
triangles, congruence, pythag, polygons, similarity, squaring, lineareq,
decimals, permcomb, limits, invtrig, remfactor, heron, shares, banking,
gst, section, linprog, circmeasure, conics, diffeq, tatsavit, randommix,
custom
```

---

## 25. regularApps — Menu Items

Array of 69 objects `{ key, name, subtitle, color }` displayed on the Home screen. Each maps to a `modeMap` entry.

---

## 26. RANDOM_MIX_TOPICS Array

43 topic objects `{ key, name, api }` used by RandomMixApp. Excludes special apps (GK, vocab, spot, tatsavit, custom) and multi-input puzzles (polymul, polyfactor, simul, squaring, dotprod).

---

## 27. CUSTOM_PUZZLES Array

68 puzzle objects `{ key, name }` used by CustomApp. Includes all puzzle types including special ones (GK, vocab, tatsavit).

---

## 28. fetchQuestionForType URL Map

Maps puzzle keys to API `GET` endpoints. Handles difficulty parameter mapping and special parameter variations (e.g., Tatsavit adds `level` parameter).

---

## 29. getPromptForType Logic

Generates display text for each puzzle type's question. Returns `null` for multi-input puzzles (polymul, polyfactor, simul) that need special rendering. Formats mathematical expressions and equations for display.

---

## 30. Data Persistence

- Theme preference (dark/light) stored in `localStorage`
- Quiz state is ephemeral (not persisted across sessions)

---

## 31. CSS Design System

`App.css` (~2,520 lines) with CSS custom properties for theming. Major sections:

1. **Base** — Custom properties & theme variables (dark/light modes via `[data-theme]`)
2. **Core Layout** — App shell and main content container
3. **Typography** — Text hierarchy
4. **Search Bar** — Quiz topic filtering
5. **Menu Grid** — Home page quiz grid
6. **Buttons** — Primary, secondary, utility styles
7. **Header & Status Indicators** — Progress pills, timer display
8. **Radio Group** — Difficulty/option selection pills
9. **Welcome & Results Screens** — Quiz start/end states
10. **Question Display** — Prompts, equations, vocabulary
11. **Answer Input** — Text input styling
12. **Multiple Choice** — Option cards for GK/vocab
13. **Feedback** — Color-coded states + solve timeline:
    - `.feedback.correct` — green background
    - `.feedback.wrong` — red background
    - `.feedback.solve` — transparent container
    - `.solve-answer-badge` — gradient pill with shadow
    - `.solve-timeline` — vertical timeline container
    - `.solve-step` — flex row (marker + content)
    - `.solve-step-marker` — dot + connecting line
    - `.solve-step-content` — mini-card per step, hover highlight, last-child accent
14. **Button Row** — Horizontal action button layout

---

## 32. Prerequisite Graph (graph/index.html)

Interactive DAG visualization (594 lines) using D3.js + Dagre:
- Nodes represent 69 puzzle types
- Directed edges show "must know before" relationships
- Click a node to highlight: gold arrows (ancestors/prerequisites), blue arrows (descendants/unlocks)
- Legend with 8 categories: Arithmetic, Algebra, Geometry, Calculus, Statistics & Probability, Vectors & Matrices, Number Theory, Other
- Reset/Fit All navigation buttons
- Tooltip shows node details and dependency chains

---

## 33. Path Finder & Journey (graph/path.html)

Path finder and structured learning quiz engine (1,017 lines):
- Computes shortest prerequisite path between two selected topics
- "Start the Journey" mode: quiz along the path
- Features: Solve button, Skip button, self-report difficulty buttons
- Functions: `loadJourneyQuestion()`, `submitJourneyAnswer()`, `skipJourneyQuestion()`, `solveJourneyQuestion()`, `reportJourneyDifficulty()`, `renderJourneyComplete()`, `quitJourney()`
- Styled solve feedback matching the React app's timeline card design

---

## 34. Enhanced Landing Page (enhanced/index.html)

Preview landing page for marketing/presentation purposes.

---

## Appendix: Complete Puzzle Type List (69 types)

| # | Key | Name | Category |
|---|-----|------|----------|
| 1 | addition | Addition | Arithmetic |
| 2 | basicarith | Basic Arithmetic | Arithmetic |
| 3 | multiply | Multiplication Tables | Arithmetic |
| 4 | decimals | Decimals | Arithmetic |
| 5 | fractionadd | Fraction Addition | Arithmetic |
| 6 | percent | Percentages | Arithmetic |
| 7 | ratio | Ratio & Proportion | Arithmetic |
| 8 | rounding | Rounding | Arithmetic |
| 9 | sqrt | Square Roots | Arithmetic |
| 10 | squaring | Squaring (a+b)² | Arithmetic |
| 11 | hcflcm | HCF & LCM | Number Theory |
| 12 | primefactor | Prime Factorization | Number Theory |
| 13 | bases | Number Bases | Number Theory |
| 14 | indices | Indices / Exponents | Algebra |
| 15 | surds | Surds | Algebra |
| 16 | lineareq | Linear Equations | Algebra |
| 17 | quadratic | Quadratic Evaluation | Algebra |
| 18 | qformula | Quadratic Formula | Algebra |
| 19 | simul | Simultaneous Equations | Algebra |
| 20 | funceval | Function Evaluation | Algebra |
| 21 | lineq | Line Equation | Algebra |
| 22 | polymul | Polynomial Multiplication | Algebra |
| 23 | polyfactor | Polynomial Factoring | Algebra |
| 24 | sequences | Sequences | Algebra |
| 25 | ineq | Inequalities | Algebra |
| 26 | binomial | Binomial Theorem | Algebra |
| 27 | remfactor | Remainder/Factor Theorem | Algebra |
| 28 | variation | Variation | Algebra |
| 29 | stdform | Standard Form | Algebra |
| 30 | bounds | Bounds | Algebra |
| 31 | log | Logarithms | Algebra |
| 32 | complex | Complex Numbers | Algebra |
| 33 | trig | Trigonometry | Geometry |
| 34 | invtrig | Inverse Trigonometry | Geometry |
| 35 | coordgeom | Coordinate Geometry | Geometry |
| 36 | angles | Angles | Geometry |
| 37 | triangles | Triangles | Geometry |
| 38 | congruence | Congruence | Geometry |
| 39 | pythag | Pythagoras' Theorem | Geometry |
| 40 | polygons | Polygons | Geometry |
| 41 | similarity | Similarity | Geometry |
| 42 | circleth | Circle Theorems | Geometry |
| 43 | bearings | Bearings | Geometry |
| 44 | mensur | Mensuration | Geometry |
| 45 | heron | Heron's Formula | Geometry |
| 46 | circmeasure | Circular Measure | Geometry |
| 47 | conics | Conic Sections | Geometry |
| 48 | transform | Transformations | Geometry |
| 49 | section | Section Formula | Geometry |
| 50 | diff | Differentiation | Calculus |
| 51 | integ | Integration | Calculus |
| 52 | limits | Limits | Calculus |
| 53 | diffeq | Differential Equations | Calculus |
| 54 | prob | Probability | Statistics |
| 55 | stats | Statistics | Statistics |
| 56 | permcomb | Permutations & Combinations | Statistics |
| 57 | matrix | Matrices | Vectors & Matrices |
| 58 | vectors | Vectors | Vectors & Matrices |
| 59 | dotprod | Dot Product | Vectors & Matrices |
| 60 | sdt | Speed, Distance, Time | Applied |
| 61 | profitloss | Profit & Loss | Applied |
| 62 | shares | Shares & Dividends | Applied |
| 63 | banking | Banking (RD) | Applied |
| 64 | gst | GST | Applied |
| 65 | linprog | Linear Programming | Applied |
| 66 | gk | General Knowledge | Other |
| 67 | vocab | Vocabulary | Other |
| 68 | spot | Twin Hunt | Other |
| 69 | tatsavit | Tatsavit (9-Level Drill) | Special |

Plus meta-modes: `randommix` (adaptive cross-topic), `custom` (lesson builder).
