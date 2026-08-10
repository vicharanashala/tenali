# Tenali — Comprehensive Master Specification

This document is the definitive specification for the Tenali educational platform. It contains every technical detail required to recreate the entire project from scratch, including technology stack, architecture, UI/UX design system, all API endpoints with exact parameters, algorithmic specifications for question generation, and deployment procedures.

---

## 1. Overview

**Tenali** is a web-based educational learning platform featuring 56 interactive quiz and puzzle games covering mathematics (primary through secondary/GCSE level), geometry, language arts, and general knowledge, plus a Random Mix cross-topic quiz mode. The platform uses a "supermarket" metaphor: a home screen displays a grid of game cards that users click to enter individual learning experiences.

**Key characteristics:**
- Real-time per-question timing and adaptive difficulty
- No database—questions generated algorithmically or loaded from JSON files at startup
- Single-file frontend monolith (App.jsx, App.css) for simplicity
- `makeQuizApp` factory function generates standardized quiz components from configuration objects
- Adaptive difficulty mode on every quiz: floating-point skill score (0.0–3.0) with smooth +0.25/-0.35 adjustments
- Random Mix mode: pulls from all 56 topics with progressive difficulty and topic tracking
- Dark/light theme toggle with localStorage persistence
- Student-specific URL routes for adaptive learning (e.g., `/taittiriya` for student "Taittiriya")
- Responsive design: works from 300px phones to 4K displays

---

## 2. Technology Stack

### Frontend
- **React 19.x** (latest)
- **Vite 8.x** (build tool, dev server)
- **CSS 3** with custom properties (CSS variables)
- **No external UI libraries** (all components custom-built)
- **Fonts**:
  - Display: Source Serif 4 (Google Fonts CDN)
  - Body/UI: DM Sans (Google Fonts CDN)

### Backend
- **Node.js** (v18+)
- **Express 5.x** (HTTP server, routing, CORS)
- **JSON files** for question storage (no database)

### Deployment
- **Render.com** (single service, serves both built client and API)
- **Build**: `cd client && npm install && npm run build`
- **Start**: `cd server && node index.js`

---

## 3. Project Structure (Exact Directory Tree)

```
Tenali/
├── client/
│   ├── index.html                         # HTML shell with font links
│   ├── vite.config.js                     # Vite config with API proxy
│   ├── eslint.config.js                   # ESLint rules
│   ├── package.json                       # React 19, Vite 8
│   ├── .env                               # Dev: VITE_API_BASE_URL=http://localhost:4000
│   ├── .env.production                    # Prod: VITE_API_BASE_URL= (empty, relative URLs)
│   ├── src/
│   │   ├── main.jsx                       # React entry: ReactDOM.createRoot(App)
│   │   ├── index.css                      # Global reset (body { margin: 0; })
│   │   ├── App.jsx                        # All components (~8000 lines)
│   │   └── App.css                        # All styles (~2000 lines)
│   └── dist/                              # Built output (created by npm run build)
│       ├── index.html
│       ├── assets/
│       └── ...
├── server/
│   ├── index.js                           # Express server (~5000 lines)
│   └── package.json                       # express, cors
├── chitragupta/
│   └── questions/
│       ├── 0001.json
│       ├── 0002.json
│       └── ... (991 files total)
├── vocab/
│   └── questions/
│       ├── 0001.json
│       ├── 0002.json
│       └── ... (3964 files total)
├── supermarket/
│   ├── SKILL.md                           # This file (master spec)
│   │
│   │   # Original 16 Apps
│   ├── gk/SKILL.md                        # General Knowledge
│   ├── addition/SKILL.md                  # Addition
│   ├── quadratic/SKILL.md                 # Quadratic Evaluation
│   ├── multiply/SKILL.md                  # Multiplication Tables
│   ├── vocab/SKILL.md                     # Vocabulary Builder
│   ├── spot/SKILL.md                      # Twin Hunt
│   ├── sqrt/SKILL.md                      # Square Root
│   ├── polymul/SKILL.md                   # Polynomial Multiplication
│   ├── polyfactor/SKILL.md                # Polynomial Factorization
│   ├── primefactor/SKILL.md               # Prime Factorization
│   ├── qformula/SKILL.md                  # Quadratic Formula
│   ├── simul/SKILL.md                     # Simultaneous Equations
│   ├── funceval/SKILL.md                  # Function Evaluation
│   ├── lineq/SKILL.md                     # Line Equation
│   ├── basicarith/SKILL.md                # Basic Arithmetic
│   ├── custom/SKILL.md                    # Custom Lesson
│   │
│   │   # Factory-Generated Puzzles (14 via makeQuizApp)
│   ├── sets/SKILL.md                      # Sets (union, intersection, Venn)
│   ├── sequences/SKILL.md                 # Sequences (AP, GP, Fibonacci)
│   ├── ratio/SKILL.md                     # Ratio & Proportion
│   ├── percent/SKILL.md                   # Percentages
│   ├── indices/SKILL.md                   # Indices & Powers
│   ├── surds/SKILL.md                     # Surds
│   ├── prob/SKILL.md                      # Probability
│   ├── stats/SKILL.md                     # Statistics (mean, median, mode)
│   ├── trig/SKILL.md                      # Trigonometry (SOHCAHTOA)
│   ├── vectors/SKILL.md                   # Vectors
│   ├── matrix/SKILL.md                    # Matrices
│   ├── log/SKILL.md                       # Logarithms
│   ├── diff/SKILL.md                      # Differentiation
│   ├── circleth/SKILL.md                  # Circle Theorems
│   │
│   │   # Additional Factory Puzzles (16 newer topics)
│   ├── ineq/SKILL.md                      # Inequalities
│   ├── bearings/SKILL.md                  # Bearings
│   ├── coordgeom/SKILL.md                 # Coordinate Geometry
│   ├── transform/SKILL.md                 # Transformations
│   ├── mensur/SKILL.md                    # Mensuration (area, volume)
│   ├── bases/SKILL.md                     # Number Bases
│   ├── integ/SKILL.md                     # Integration
│   ├── stdform/SKILL.md                   # Standard Form
│   ├── bounds/SKILL.md                    # Bounds (upper & lower)
│   ├── sdt/SKILL.md                       # Speed, Distance, Time
│   ├── variation/SKILL.md                 # Variation (direct & inverse)
│   ├── hcflcm/SKILL.md                    # HCF & LCM
│   ├── profitloss/SKILL.md                # Profit & Loss
│   ├── rounding/SKILL.md                  # Rounding
│   ├── binomial/SKILL.md                  # Binomial Theorem
│   ├── complex/SKILL.md                   # Complex Numbers
│   │
│   │   # Geometry Puzzles (6 topics, primary through 10th Std CBSE)
│   ├── angles/SKILL.md                    # Angles (types, on a line, vertically opposite)
│   ├── triangles/SKILL.md                 # Triangles (angle sum, isosceles, exterior angle)
│   ├── congruence/SKILL.md                # Congruence (SSS, SAS, ASA, RHS)
│   ├── pythag/SKILL.md                    # Pythagoras' Theorem (2D and 3D)
│   ├── polygons/SKILL.md                  # Polygons (interior/exterior angles, diagonals)
│   └── similarity/SKILL.md               # Similarity (scale factor, area/volume ratios)
├── render.yaml                            # Render.com deployment config
└── .github/workflows/                     # CI/CD (if using GitHub Pages)
```

---

## 4. Global Constants

All constants are defined at the top of App.jsx or vite.config.js:

```javascript
// App.jsx
const API = import.meta.env.VITE_API_BASE_URL || ''
const DEFAULT_TOTAL = 20                   // Default question count for quizzes
const AUTO_ADVANCE_MS = 1500               // Auto-advance delay after correct answer (ms)
const WINDOW = 8                           // Adaptive table rolling window size
const FAST_THRESH = 3000                   // Mastery speed threshold (ms)
const MEDIUM_THRESH = 6000                 // Comfortable speed threshold (ms)
const ADVANCE_COUNT = 5                    // Consecutive correct to advance table

// server/index.js
const PORT = process.env.PORT || 4000
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
```

---

## 5. Theme System

### CSS Custom Properties (Dark Theme — Default)

All CSS variables defined on `:root`:

```css
:root {
  /* Fonts */
  --font-display: 'Source Serif 4', 'Georgia', serif;
  --font-body: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;

  /* Colors */
  --clr-bg: #1a1614;                    /* Main background */
  --clr-card: #2c2622;                  /* Card/panel background */
  --clr-surface: #362f2a;               /* Elevated surface (tables, etc.) */
  --clr-input: #3e3631;                 /* Input field background */
  --clr-text: #ede8e3;                  /* Primary text */
  --clr-text-soft: #a89e94;             /* Secondary/muted text */
  --clr-border: rgba(255, 245, 230, 0.10); /* Subtle borders */

  /* Accent Colors */
  --clr-accent: #e8864a;                /* Primary accent (buttons, links) */
  --clr-accent-soft: rgba(232, 134, 74, 0.15); /* Accent background (subtle) */

  /* Feedback Colors */
  --clr-correct: #5cb87a;               /* Correct answer text */
  --clr-correct-bg: rgba(92, 184, 122, 0.12); /* Correct feedback background */
  --clr-wrong: #e05a4a;                 /* Wrong answer text */
  --clr-wrong-bg: rgba(224, 90, 74, 0.12); /* Wrong feedback background */

  /* UI Elements */
  --clr-badge: #4a4340;                 /* Badge background */
  --clr-placeholder: #6b6058;           /* Placeholder text */
  --clr-hover: rgba(255, 245, 230, 0.04);       /* Subtle hover */
  --clr-hover-strong: rgba(255, 245, 230, 0.08); /* Strong hover */

  /* Border Radius */
  --radius: 16px;                       /* Default border radius */
  --radius-sm: 10px;                    /* Small border radius */

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15);
  --shadow-btn: 0 2px 8px rgba(0,0,0,0.20);

  /* Transitions */
  --transition: 180ms ease;
}
```

### CSS Custom Properties (Light Theme)

Applied when `[data-theme="light"]` on `<html>`:

```css
[data-theme="light"] {
  --clr-bg: #f5f0eb;
  --clr-card: #fffdf9;
  --clr-surface: #f0ebe5;
  --clr-input: #ffffff;
  --clr-text: #2c2420;
  --clr-text-soft: #6b5e54;
  --clr-border: rgba(60, 45, 30, 0.12);
  --clr-accent: #e07a3a;
  --clr-accent-soft: rgba(224, 122, 58, 0.10);
  --clr-correct: #3a8a5c;
  --clr-correct-bg: #eaf5ef;
  --clr-wrong: #c24b3a;
  --clr-wrong-bg: #fdf0ee;
  --clr-badge: #c0c0c0;
  --clr-placeholder: #b5a99a;
  --clr-hover: rgba(60, 40, 20, 0.04);
  --clr-hover-strong: rgba(60, 40, 20, 0.08);
  --shadow-card: 0 4px 24px rgba(60,40,20,0.08), 0 1px 3px rgba(60,40,20,0.06);
  --shadow-btn: 0 2px 8px rgba(60,40,20,0.10);
}
```

### Theme Toggle Implementation

**DOM Structure:**
- Fixed button in top-right corner: `position: fixed; top: 16px; right: 16px; z-index: 100;`
- Icon: '☀️' in dark mode, '🌙' in light mode
- Button styling: transparent background, 36×36px, center icon, cursor: pointer, hover opacity 0.7

**Persistence:**
- localStorage key: `tenali-theme`
- Default: `'dark'`
- On component mount: `document.documentElement.setAttribute('data-theme', theme)`
- On toggle: update localStorage and DOM attribute

---

## 6. URL Routing

The platform uses client-side routing (no React Router). All routing is determined by reading `window.location.pathname`:

| Path | Component | studentName |
|------|-----------|-------------|
| `/taittiriya` | AdaptiveTablesApp | "Taittiriya" |
| `/tatsavit` | AdaptiveTablesApp | "Tatsavit" |
| `/intervalscheduling` | IntervalSchedulingApp | N/A |
| `/extendedeuclid` | ExtendedEuclidApp | N/A |
| `/` or any other | Home (supermarket) | N/A |

**Implementation pattern:**
```javascript
// In App.jsx
const pathname = window.location.pathname
if (pathname === '/taittiriya') {
  return <AdaptiveTablesApp studentName="Taittiriya" />
}
// ... other routes
return <Home />
```

---

## 7. Home Screen (Supermarket Menu)

### Layout Structure
- **Page background**: 100% viewport height, centered content via flexbox
- **Main card**: max-width 900px, background var(--clr-card), border-radius var(--radius), shadow var(--shadow-card)
- **Card padding**: 48px 40px on desktop; 32px 24px on mobile (<600px)
- **Content order**:
  1. Title ("Tenali")
  2. Subtitle ("Choose a learning game to begin")
  3. Search bar
  4. Grid of app cards
  5. Grid dimension indicator (below grid)

### Title and Subtitle
- **Title (h1)**: font-family var(--font-display), font-size clamp(2.4rem, 5vw, 3.2rem), weight 700, letter-spacing -0.02em, margin 0 0 8px 0
- **Subtitle (p)**: font-family var(--font-body), font-size 1.05rem, color var(--clr-text-soft), margin 0 0 24px 0

### Search Bar
- **Class**: `.search-bar`
- **Container**: width 100%, max-width 340px, margin 0 auto 28px auto
- **Input**:
  - width 100%, padding 12px 16px
  - border 1.5px solid var(--clr-border)
  - border-radius 20px (pill shape)
  - background var(--clr-input)
  - color var(--clr-text)
  - placeholder-color var(--clr-placeholder)
  - font-size 0.95rem
  - font-family var(--font-body)
  - focus: outline none, box-shadow 0 0 0 3px var(--clr-accent-soft)
- **Behavior**: Real-time text filter—only apps whose name or subtitle contains (case-insensitive) the search text are shown; others have display: none

### App Grid
- **Container class**: `.app-grid`
- **Grid definition**: `display: grid; grid-template-columns: repeat(auto-fill, 180px); gap: 14px; justify-content: center;`
- **Each card dimensions**: 180px width × 160px height (100% width × 140px height on mobile)
- **Card structure**:
  - Outer div: class `.app-card`, position relative, cursor pointer, transition background var(--transition), border 1.5px solid var(--clr-border), border-radius var(--radius-sm), background var(--clr-input)
  - Hover state: background var(--clr-hover-strong), border 1.5px solid var(--clr-accent)
  - Inner layout: flexbox column, justify-content space-between, align-items center, padding 12px, height 100%
  - Title (name): font-family var(--font-display), font-size 1.1rem, weight 700, text-align center
  - Subtitle: font-family var(--font-body), font-size 0.75rem, color var(--clr-text-soft), text-align center
  - **Colored dot** (on hover): position absolute, top 8px, right 8px, width 12px, height 12px, border-radius 50%, background varies by card color class:
    - `.purple`: #a65acc
    - `.blue`: #3b82f6
    - `.green`: #10b981

### Grid Dimension Indicator
- **Position**: below grid, margin-top 20px
- **Text**: "R × C" (e.g., "4 × 4")
- **Font**: DM Sans, 0.8rem, color var(--clr-text-soft)
- **Opacity**: 0.6
- **Implementation**: useRef on grid element, read `getComputedStyle(gridEl).gridTemplateColumns` on mount and resize, compute column count, calculate row count as `Math.ceil(apps.length / cols)`

### All Apps Registry (56 apps + Random Mix + Custom Lesson)

The `allApps` array contains all 56 quiz topics plus Random Mix and Custom Lesson. Each entry has `key`, `name`, `subtitle`, and `color` ('purple', 'blue', or 'green'). Topics span:

- **Original 16**: GK, Addition, Quadratic, Multiplication, Vocabulary, Twin Hunt, Square Root, Poly Multiply, Poly Factor, Prime Factors, Quadratics (formula), Sim. Eq., Functions, Line Equation, Arithmetic, Custom Lesson
- **14 Factory Puzzles**: Sets, Sequences, Ratio, Percentages, Indices, Surds, Probability, Statistics, Trigonometry, Vectors, Matrices, Logarithms, Differentiation, Circle Theorems
- **10 Additional Topics**: Inequalities, Bearings, Coordinate Geometry, Transformations, Mensuration, Number Bases, Integration, Standard Form, Bounds, Speed/Distance/Time
- **6 More Topics**: Variation, HCF & LCM, Profit & Loss, Rounding, Binomial Theorem, Complex Numbers
- **6 Geometry**: Angles, Triangles, Congruence, Pythagoras' Theorem, Polygons, Similarity
- **Special**: Random Mix (cross-topic adaptive quiz)

---

## 8. Shared Components and Hooks

### QuizLayout Component
**Props**: `{ title, subtitle, onBack, children }`

**Structure**:
```jsx
<div className="quiz-layout">
  <button onClick={onBack} className="back-btn">← Home</button>
  <h1>{title}</h1>
  <p className="subtitle">{subtitle}</p>
  {children}
</div>
```

**Styling**:
- Back button: text color var(--clr-accent), background transparent, cursor pointer, margin-bottom 16px, font-family var(--font-body)
- h1: same as home title
- .subtitle: color var(--clr-text-soft), margin 0 0 24px 0

### ResultsTable Component
**Props**: `{ results }`

**Structure**: HTML `<table>` with:
- Column headers: "#", "Question", "Your Answer", "Result", "Time"
- One row per result object:
  - `results[i].question` (abbreviated or full question text)
  - `results[i].userAnswer`
  - `results[i].correctAnswer`
  - Icon: "✓" (green, var(--clr-correct)) for correct, "✗" (red, var(--clr-wrong)) for wrong
  - `results[i].time` formatted as "Ns" (e.g., "5.2s")
- Row styling:
  - Correct rows: text-color var(--clr-correct), background var(--clr-correct-bg)
  - Wrong rows: text-color var(--clr-wrong), background var(--clr-wrong-bg)
- Summary footer (after all rows):
  - Calculate total time: `results.reduce((sum, r) => sum + r.time, 0)`
  - Calculate average: `totalTime / results.length`
  - Display: "Total time: Ns · Average: Ns per question"

### useTimer Hook
**Returns object**: `{ elapsed, start, stop, reset }`

**Implementation**:
```javascript
function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    setElapsed(0)
    intervalRef.current = setInterval(() => {
      setElapsed(prev => prev + 0.25) // 250ms updates
    }, 250)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    return elapsed
  }, [elapsed])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setElapsed(0)
  }, [])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  return { elapsed, start, stop, reset }
}
```

**Usage**: Call `timer.start()` when question loads, `timer.stop()` when answer submitted, `timer.reset()` between questions.

### useAutoAdvance Hook
**Params**: `(revealed, advanceFnRef, isCorrect)`

**Behavior**: When revealed=true AND isCorrect=true, calls `advanceFnRef.current()` after AUTO_ADVANCE_MS (1500ms).

**Implementation**:
```javascript
function useAutoAdvance(revealed, advanceFnRef, isCorrect) {
  useEffect(() => {
    if (!revealed || !isCorrect) return
    const timeoutId = setTimeout(() => {
      advanceFnRef.current()
    }, AUTO_ADVANCE_MS)
    return () => clearTimeout(timeoutId)
  }, [revealed, isCorrect])
}
```

**Usage**: Pass a ref to the "next" or "advance" function:
```javascript
const advanceRef = useRef(null)
// ... later ...
useAutoAdvance(revealed, advanceRef, isCorrect)
```

### makeQuizApp Factory Function

Most quiz components (36 of 56) are generated by the `makeQuizApp` factory rather than hand-written. The factory accepts a configuration object and returns a complete React component with setup, playing, and finished phases.

**Signature:**
```javascript
const MyApp = makeQuizApp({
  title: 'Quiz Title',
  subtitle: 'Short description',
  apiPath: 'quiz-api',          // GET /quiz-api/question, POST /quiz-api/check
  diffLabels: {
    easy: 'Easy — Description',
    medium: 'Medium — Description',
    hard: 'Hard — Description',
    extrahard: 'Extra Hard — Description'
  }
})
```

**Features included automatically:**
- Four difficulty buttons (Easy, Medium, Hard, Extra Hard) plus Adaptive
- Question count selector (default 20)
- Timer, score tracking, results table
- Auto-advance on correct answers
- Keyboard Enter support
- Adaptive difficulty mode with smooth score adjustments

### Adaptive Difficulty Mode

Every quiz app (factory-generated and hand-written) includes an "Adaptive" difficulty button alongside Easy/Medium/Hard/Extra Hard. When selected, difficulty adjusts smoothly based on performance.

**Implementation:**
```javascript
const ADAPT_DIFFS = ['easy', 'medium', 'hard', 'extrahard']
const ADAPT_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', extrahard: 'Extra Hard' }
const ADAPT_COLORS = { easy: '#4caf50', medium: '#ff9800', hard: '#f44336', extrahard: '#9c27b0' }

function adaptiveLevel(score) {
  return ADAPT_DIFFS[Math.min(Math.max(Math.round(score), 0), 3)]
}
function adaptivePct(score) {
  return Math.min(100, Math.max(0, (score / 3) * 100))
}
```

**Score mechanics:** Float score 0.0–3.0, +0.25 on correct, -0.35 on wrong. Uses `adaptScoreRef` (useRef) for synchronous access in `loadQuestion()`, preventing stale closure issues. Maps to discrete difficulty levels for API calls.

**Visual indicators:** Gradient-colored adaptive pill button, progress bar during play showing current level, "Reached level" display on finished screen.

### Random Mix Mode

Cross-topic adaptive quiz pulling from all 56 topics randomly. Uses `RANDOM_MIX_TOPICS` array (key/name/api for each topic). Progressive difficulty: 3 consecutive correct → level up, 2 consecutive wrong → level down. Features skip-topic button, topic stats breakdown on finished screen, and skipped topics shown as crossed-out clickable pills.

### NumPad Component
**Props**: `{ value, onChange, disabled }`

**Layout**: 4 rows of buttons:
- Row 1: [1] [2] [3]
- Row 2: [4] [5] [6]
- Row 3: [7] [8] [9]
- Row 4: [±] [0] [⌫]

**Behavior**:
- Digits 0–9: append to value (max ~15 chars)
- ± (toggle sign): prepend/remove minus sign from value
- ⌫ (backspace): remove last character
- All buttons: disabled if prop disabled=true, cursor: pointer, background var(--clr-input), color var(--clr-text), border 1px solid var(--clr-border), padding 12px, border-radius var(--radius-sm), font-family var(--font-body), font-weight 600

**Validation**: `onChange` callback only called if result matches regex `/^-?\d+$/` (optional leading minus, then digits).

---

## 9. Standard Quiz Pattern

All 56 quiz components follow a consistent three-phase flow:

### Phase 1: Setup
- **State variables**: `difficulty`, `numQuestions`, `started`
- **UI elements**:
  - Difficulty selector (if applicable): radio pills (easy/medium/hard) or dropdown
  - Question count input: "How many questions?" with text input (default DEFAULT_TOTAL = 20)
  - Start button: calls setState({ started: true, ...initialization })
- **No quiz content shown until started=true**

### Phase 2: Playing
- **State variables**: `question`, `answer` (user input), `score`, `questionNumber`, `totalQ`, `feedback`, `isCorrect`, `loading`, `revealed`, `results`, `timer`
- **UI layout**:
  - QuizLayout wrapper with back button
  - Progress pill (top-right): "Q X of Y"
  - Timer pill (top-right, next to progress): "Ns" (updated real-time)
  - Question display (large, centered)
  - Input mechanism (varies by quiz: text input, numpad, option cards, radio, etc.)
  - Submit button: disabled until answer provided, calls POST endpoint to check answer
  - Feedback display (revealed after submit):
    - Correct: green text, var(--clr-correct) background
    - Wrong: red text, var(--clr-wrong) background
    - Shows correct answer and explanation
  - Next button: appears after feedback revealed, auto-advances if isCorrect=true (after AUTO_ADVANCE_MS)
  - Results table: grows as user progresses, displayed below input area

### Phase 3: Finished
- **State**: finished=true, all results collected
- **UI display**:
  - Final score: "Score: X / Y (Z%)"
  - Full results table (all questions)
  - Play Again button: resets to setup phase (started=false)
  - Back Home button: goes to home screen

### State Management Template
```javascript
const [difficulty, setDifficulty] = useState('easy')
const [numQuestions, setNumQuestions] = useState(DEFAULT_TOTAL)
const [started, setStarted] = useState(false)
const [finished, setFinished] = useState(false)

const [question, setQuestion] = useState(null)
const [questionNumber, setQuestionNumber] = useState(1)
const [totalQ, setTotalQ] = useState(numQuestions)
const [answer, setAnswer] = useState('')
const [score, setScore] = useState(0)
const [feedback, setFeedback] = useState('')
const [isCorrect, setIsCorrect] = useState(null)
const [loading, setLoading] = useState(false)
const [revealed, setRevealed] = useState(false)
const [results, setResults] = useState([])
const timer = useTimer()
const advanceRef = useRef(null)
useAutoAdvance(revealed, advanceRef, isCorrect)
```

### Submit and Advance Handlers
```javascript
const handleSubmit = async () => {
  setLoading(true)
  const timeTaken = timer.stop()

  // POST to API endpoint to check answer
  const response = await fetch(`${API}/quiz-api/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ /* question params */ ...answer })
  })
  const data = await response.json()

  setIsCorrect(data.correct)
  setFeedback(data.message || (data.correct ? 'Correct!' : 'Incorrect'))
  setRevealed(true)

  // Record result
  setResults(prev => [...prev, {
    question: /* abbreviated question */,
    userAnswer: answer,
    correctAnswer: data.correctAnswer,
    correct: data.correct,
    time: timeTaken
  }])

  if (data.correct) setScore(prev => prev + 1)
  setLoading(false)
}

const handleNext = () => {
  if (questionNumber >= totalQ) {
    setFinished(true)
    return
  }

  setQuestionNumber(prev => prev + 1)
  setAnswer('')
  setFeedback('')
  setIsCorrect(null)
  setRevealed(false)
  timer.reset()
  // ... fetch next question
}

advanceRef.current = handleNext
```

---

## 10. Keyboard Shortcuts

**All quizzes**:
- `Enter`: Submit answer (if not revealed), or advance to next question (if revealed and input focused)

**Multiple-choice quizzes (GK, Vocab, Custom)**:
- `1`, `2`, `3`, `4`: Select option 1/2/3/4 and submit immediately
- `a`, `b`, `c`, `d`: Select option A/B/C/D and submit immediately

**Arithmetic quizzes (Addition, Multiplication, Basic Arithmetic, etc.)**:
- `0`–`9`: Type digit (global keydown listener, no input focus required)
- `-` (minus): Toggle leading minus sign
- `Backspace`: Delete last character

**Adaptive Tables**:
- `Enter`: Advance to next question after wrong answer (normal navigation)

---

## 11. Question Deduplication (GK and Vocab)

Both GK and Vocab quizzes track "seen" question IDs on the client side to avoid repeats within a session.

**Implementation**:
1. Client maintains array `seenIds: []`
2. When requesting next question via GET endpoint, include query param: `?exclude=id1,id2,id3,...`
3. Server receives exclude list, filters out those IDs before selecting random question
4. Server returns new question ID
5. Client adds ID to seenIds
6. If all questions exhausted (exclude list contains all question IDs), server resets and allows any

**Endpoints affected**: `/gk-api/question?exclude=...`, `/vocab-api/question?exclude=...`

---

## 12. Responsive Breakpoints

**700px (tablet to mobile transition)**:
- `.app-grid`: grid-template-columns changes to single column (or 2 columns)
- Menu cards: 100% width
- Buttons: 100% width
- Adaptive tables (if applicable): stack vertically with quiz area on top (order: -1 on quiz container)
- Ref table: 3-column compact grid layout, max-height 180px with overflow-y: auto

**600px (smaller tablet/large phone)**:
- Card padding: 32px 24px (down from 48px 40px)
- Extended Euclid inputs: stack vertically
- Font sizes: reduce clamp min values slightly

**500px (phone)**:
- Title: clamp(1.8rem, 4vw, 2.4rem)
- Menu cards: 100% width, reduced padding
- All multi-column layouts: single column
- NumPad: 2 columns (instead of 3), larger touch targets

---

## 13. Server Architecture (Express)

### Initialization
```javascript
// server/index.js
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

// Load GK questions from chitragupta/questions/*.json (991 files)
const gkQuestions = loadQuestionsFromDir('../chitragupta/questions')

// Load vocab questions from vocab/questions/*.json (3964 files)
const vocabQuestions = loadQuestionsFromDir('../vocab/questions')

// Static file serving
app.use(express.static(path.join(__dirname, '../client/dist')))

// API Routes (see section 14)
// ... all endpoints ...

// SPA Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`)
})
```

### Question Loading Helper
```javascript
function loadQuestionsFromDir(dirPath) {
  const questions = []
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.json'))
    .sort()

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf-8'))
    questions.push(content)
  }

  return questions
}
```

---

## 14. API Endpoints (Comprehensive Reference)

All endpoints return JSON. All POST endpoints accept `Content-Type: application/json`.

### Health Check
```
GET /api/health
Response: { ok: true, questions: N }
```

### General Knowledge (GK)
```
GET /gk-api/question
Query: exclude=comma,separated,ids (optional)
Response: { id, question, options[], genre, answerOption }

POST /gk-api/check
Body: { id, answerOption }
Response: { correct, correctAnswer, correctAnswerText, message }
```

### Addition
```
GET /addition-api/question
Query: digits=1|2|3 (number of digits per operand)
Response: { id, digits, a, b, prompt, answer }
  - prompt: "X + Y = ?"
  - answer: integer

POST /addition-api/check
Body: { a, b, answer }
Response: { correct, correctAnswer, message }
```

### Quadratic (y = ax² + bx + c)
```
GET /quadratic-api/question
Query: difficulty=easy|medium|hard
Response: { id, a, b, c, x, prompt, answer }
  - x: specific x value to evaluate
  - answer: computed y value

POST /quadratic-api/check
Body: { a, b, c, x, answer }
Response: { correct, correctAnswer, message }
```

### Multiplication Tables
```
GET /multiply-api/question
Query: table=1..10 (times table number)
Response: { id, table, multiplier, prompt, answer }
  - multiplier: random 1..12
  - answer: table × multiplier

POST /multiply-api/check
Body: { table, multiplier, answer }
Response: { correct, correctAnswer, message }
```

### Vocabulary
```
GET /vocab-api/question
Query: difficulty=easy|medium|hard|extra-hard, exclude=comma,separated,ids
Response: { id, word, question (definition prompt), options[], answerOption, difficulty }

POST /vocab-api/check
Body: { id, answerOption }
Response: { correct, correctAnswer, correctAnswerText, message }
```

### Square Root
```
GET /sqrt-api/question
Query: step=number (progressive difficulty)
Response: { id, q, step, prompt, floorAnswer, ceilAnswer, sqrtRounded }
  - q: number to find square root of
  - floorAnswer: floor(sqrt(q))
  - ceilAnswer: ceil(sqrt(q))
  - sqrtRounded: round(sqrt(q))

POST /sqrt-api/check
Body: { q, answer }
Response: { correct, floorAnswer, ceilAnswer, sqrtRounded, message }
```

### Polynomial Multiplication
```
GET /polymul-api/question
Query: difficulty=easy|medium|hard
Response: { id, difficulty, poly1, poly2, poly1Str, poly2Str, prompt, resultDegree, correctCoeffs }
  - poly1, poly2: arrays of coefficients
  - correctCoeffs: result coefficient array

POST /polymul-api/check
Body: { poly1, poly2, coeffs }
  - coeffs: user's array of result coefficients
Response: { correct, correctCoeffs, message }
```

### Polynomial Factorization
```
GET /polyfactor-api/question
Query: difficulty=easy|medium|hard
Response: { id, difficulty, a, b, c, prompt, p, q, r, s }
  - Factorize ax² + bx + c = (px + q)(rx + s)

POST /polyfactor-api/check
Body: { a, b, c, p, q, r, s }
Response: { correct, message }
```

### Prime Factorization
```
GET /primefactor-api/question
Query: difficulty=easy|medium|hard
Response: { id, difficulty, originalNumber, allFactors[], remaining, factorsFound[], prompt }

POST /primefactor-api/check
Body: { originalNumber, factor, currentRemaining }
Response: { correct, nextRemaining, factorsFound[], allFactorsList[], isComplete, message }
```

### Quadratic Formula (roots of ax² + bx + c = 0)
```
GET /qformula-api/question
Query: difficulty=easy|medium|hard
Response: { id, difficulty, a, b, c, prompt, discriminant, rootType, root1, root2, root1Real, root1Imag, root2Real, root2Imag }

POST /qformula-api/check
Body: { a, b, c, root1, root2, root1Real, root1Imag, root2Real, root2Imag, rootType }
Response: { correct, correctRoot1, correctRoot2, message }
```

### Simultaneous Equations
```
GET /simul-api/question
Query: difficulty=easy|hard (determines 2×2 or 3×3)
Response: { id, size (2 or 3), eqs[], solution: {x, y[, z]} }

POST /simul-api/check
Body: { eqs, size, solution, userX, userY[, userZ] }
Response: { correct, solution, message }
```

### Function Evaluation
```
GET /funceval-api/question
Query: difficulty=easy|medium|hard
Response: { id, difficulty, functionType, a, b, c, d, x, y, z, prompt, answer }

POST /funceval-api/check
Body: { a, b, c, d, x, y, z, answer }
Response: { correct, correctAnswer, message }
```

### Line Equation (find m and c from two points)
```
GET /lineq-api/question
Query: difficulty=easy|medium|hard
Response: { id, difficulty, x1, y1, x2, y2, prompt, m (slope), c (y-intercept) }

POST /lineq-api/check
Body: { x1, y1, x2, y2, m, c }
Response: { correct, correctM, correctC, message }
```

### Basic Arithmetic
```
GET /basicarith-api/question
Query: difficulty=easy|medium|hard
Response: { id, a, b, op (+|-|×), prompt, answer }

POST /basicarith-api/check
Body: { a, b, op, answer }
Response: { correct, correctAnswer, message }
```

### Custom Lesson (mixed quiz builder)
```
GET /custom-api/question
Query: modes=gk,addition,multiply (selected quiz types), difficulty=easy|medium|hard
Response: { mode, question object (format varies by mode) }

POST /custom-api/check
Body: { mode, ...mode-specific body }
Response: { correct, ...mode-specific response }
```

---

## 15. Difficulty Range Tables

Each quiz has algorithmic generation using difficulty-based ranges. These are implemented in server/index.js as helper functions.

### Addition Ranges
| Difficulty | Digits per Number | Range |
|------------|------------------|-------|
| easy | 1 | 1–9 |
| medium | 2 | 10–99 |
| hard | 3 | 100–999 |

### Quadratic Ranges
| Difficulty | a | b | c | x |
|------------|---|---|---|---|
| easy | 1–2 | -5 to 5 | -10 to 10 | -10 to 10 |
| medium | 1–3 | -10 to 10 | -20 to 20 | -10 to 10 |
| hard | 1–5 | -20 to 20 | -30 to 30 | -15 to 15 |

### Multiplication Ranges
| Difficulty | Table | Multiplier |
|------------|-------|-----------|
| easy | 1–5 | 1–10 |
| medium | 6–8 | 1–12 |
| hard | 9–10 | 1–12 |

### Square Root Ranges
| Step | Range |
|------|-------|
| 1–5 | 1–100 |
| 6–10 | 100–1000 |
| 11+ | 1000–10000 |

### Polynomial Multiplication Ranges
| Difficulty | Coefficients |
|------------|--------------|
| easy | 1–2, constant term -2 to 2 |
| medium | 1–3, constant term -5 to 5 |
| hard | 1–5, constant term -10 to 10 |

### Function Evaluation Ranges
| Difficulty | Functions |
|------------|-----------|
| easy | f(x) = ax + b |
| medium | f(x, y) = ax + by + c |
| hard | f(x, y, z) = ax + by + cz + d |

---

## 16. Vite Configuration

File: `client/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/gk-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/addition-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/quadratic-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/sqrt-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/multiply-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/vocab-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/polymul-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/polyfactor-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/primefactor-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/qformula-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/simul-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/funceval-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/lineq-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/basicarith-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/custom-api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      // Plus 36 additional proxy entries for all newer puzzles:
      // sets-api, sequences-api, ratio-api, percent-api, indices-api, surds-api,
      // prob-api, stats-api, trig-api, vectors-api, matrix-api, log-api, diff-api,
      // circleth-api, ineq-api, bearings-api, coordgeom-api, transform-api,
      // mensur-api, bases-api, integ-api, stdform-api, bounds-api, sdt-api,
      // variation-api, hcflcm-api, profitloss-api, rounding-api, binomial-api,
      // complex-api, angles-api, triangles-api, congruence-api, pythag-api,
      // polygons-api, similarity-api
    }
  }
})
```

**Environment files**:
- `.env`: `VITE_API_BASE_URL=http://localhost:4000` (dev)
- `.env.production`: `VITE_API_BASE_URL=` (production, empty = relative URLs)

---

## 17. Deployment (Render.com)

### render.yaml Configuration
```yaml
services:
  - type: web
    name: tenali
    env: node
    region: oregon
    plan: free
    buildCommand: cd client && npm install && npm run build
    startCommand: cd server && node index.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
```

### Build and Start Process
1. **Build**: Render executes `cd client && npm install && npm run build`
   - Installs all client dependencies
   - Compiles React/Vite build into `dist/` folder
2. **Start**: Render executes `cd server && node index.js`
   - Server starts on PORT (default 4000)
   - Loads GK and vocab questions from disk
   - Serves static files from `../client/dist`
   - Listens for API requests on same port

### Environment Variables
- `NODE_ENV`: Set to 'production'
- `PORT`: Render assigns dynamically; server uses process.env.PORT || 4000
- `CORS_ORIGIN`: Optional; defaults to '*'

---

## 18. Data Formats

### GK Question JSON Format
File: `chitragupta/questions/0001.json`

```json
{
  "id": 1,
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Rome"],
  "answerOption": "B",
  "answerText": "Paris",
  "genre": "Geography"
}
```

**Fields**:
- `id`: Unique integer
- `question`: Question text
- `options`: Array of 4 strings (A, B, C, D)
- `answerOption`: Correct option letter ("A", "B", "C", or "D")
- `answerText`: Text of correct answer
- `genre`: Category (e.g., "Geography", "History", "Science")

### Vocab Question JSON Format
File: `vocab/questions/0001.json`

```json
{
  "id": 1,
  "word": "serendipity",
  "question": "The occurrence of events by chance in a happy or beneficial way",
  "options": ["planned outcome", "lucky coincidence", "coincidental discovery", "fortunate event"],
  "answerOption": "C",
  "answerText": "coincidental discovery",
  "difficulty": "medium"
}
```

**Fields**:
- `id`: Unique integer
- `word`: The vocabulary word
- `question`: Definition or context sentence
- `options`: Array of 4 possible definitions
- `answerOption`: Correct option ("A", "B", "C", or "D")
- `answerText`: Text of correct definition
- `difficulty`: "easy", "medium", "hard", or "extra-hard"

---

## 19. localStorage Keys and Values

The frontend uses browser localStorage to persist user preferences:

| Key | Type | Values | Default |
|-----|------|--------|---------|
| `tenali-theme` | string | "dark" \| "light" | "dark" |
| `tenali-tables-{studentName}` | JSON | `{ currentTable: number }` | N/A |

**Example**:
```javascript
// Theme persistence
localStorage.setItem('tenali-theme', 'light')
const theme = localStorage.getItem('tenali-theme') || 'dark'

// Adaptive tables state (for student "Taittiriya")
localStorage.setItem('tenali-tables-Taittiriya', JSON.stringify({ currentTable: 3 }))
const state = JSON.parse(localStorage.getItem('tenali-tables-Taittiriya') || '{ "currentTable": 1 }')
```

---

## 20. Font Loading

### HTML Head Section
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tenali</title>

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</head>
```

**Fonts loaded**:
- Source Serif 4 (weight 700 only) — for display headings
- DM Sans (weights 400, 500, 600) — for body and UI

---

## 21. Project-Wide Constants and Conventions

### Numeric Constants
```javascript
DEFAULT_TOTAL = 20        // Default quiz length
AUTO_ADVANCE_MS = 1500    // Delay before auto-advancing correct answer
WINDOW = 8                // Rolling window for adaptive tables
FAST_THRESH = 3000        // Mastery speed (ms)
MEDIUM_THRESH = 6000      // Comfortable speed (ms)
ADVANCE_COUNT = 5         // Consecutive correct to level up
PORT = 4000               // Default server port
```

### File Naming Conventions
- Quiz components: PascalCase, e.g., `AdditionQuiz`, `QuadraticQuiz`
- Shared hooks: camelCase with `use` prefix, e.g., `useTimer`, `useAutoAdvance`
- CSS classes: kebab-case, e.g., `.quiz-layout`, `.app-grid`, `.back-btn`
- API endpoints: all lowercase with hyphens, e.g., `/addition-api/question`

### Spacing Scale
- Extra small: 4px (rarely used)
- Small: 8px
- Standard: 12px, 14px, 16px
- Medium: 20px, 24px
- Large: 32px, 40px, 48px
- Extra large: 64px, 80px

---

## 22. Development Workflow

### Starting Development Environment
```bash
# Terminal 1: Start server
cd server
node index.js
# Server running on http://localhost:4000

# Terminal 2: Start dev frontend
cd client
npm run dev
# Vite dev server on http://localhost:5173
# Proxy routes all /api/* to localhost:4000
```

### Building for Production
```bash
cd client
npm run build
# Creates optimized dist/ folder

cd ../server
node index.js
# Serves dist/ as static files + provides API
```

### Testing a Locally-Built Production Build
```bash
cd client
npm run build
cd ../server
PORT=4000 node index.js
# Navigate to http://localhost:4000
```

---

## 23. Adding a New Quiz to the Platform

There are **7 registration points** for each new puzzle. Most puzzles use the `makeQuizApp` factory.

### Using makeQuizApp (recommended):

1. **Server endpoints** (server/index.js): Add GET `/newpuzzle-api/question` and POST `/newpuzzle-api/check` before the catch-all route.

2. **Factory component** (App.jsx):
   ```javascript
   const NewPuzzleApp = makeQuizApp({
     title: 'New Puzzle',
     subtitle: 'Description',
     apiPath: 'newpuzzle-api',
     diffLabels: { easy: 'Easy — ...', medium: 'Medium — ...', hard: 'Hard — ...', extrahard: 'Extra Hard — ...' }
   })
   ```

3. **7 Registration Points** (all in App.jsx):
   - `modeMap`: Add `newpuzzle: NewPuzzleApp` to component lookup
   - `allApps`: Add `{ key: 'newpuzzle', name: 'New Puzzle', subtitle: '...', color: 'blue' }`
   - `CUSTOM_PUZZLES`: Add `'New Puzzle'` to the array
   - `fetchQuestionForType`: Add URL mapping `newpuzzle: '/newpuzzle-api/question'`
   - `getPromptForType`: Add prompt extraction logic for the puzzle type
   - `CustomApp handleSubmit`: Add answer-checking case
   - `CustomApp renderInputs`: Add input rendering case
   - `apiMap`: Add `newpuzzle: { fetchQuestion: '/newpuzzle-api/question', checkAnswer: '/newpuzzle-api/check' }`

4. **API proxy** (client/vite.config.js):
   ```javascript
   '/newpuzzle-api': { target: 'http://localhost:4000', changeOrigin: true }
   ```

5. **Formal spec** (`supermarket/newpuzzle/SKILL.md`): Document generation algorithm, answer checking, registration points, and adaptive mode support.

---

## 24. Summary of File Line Counts

- **App.jsx**: ~8000 lines (all components, makeQuizApp factory, 56 quiz apps, adaptive mode, Random Mix)
- **App.css**: ~2000 lines (all styles, responsive, theme variables)
- **server/index.js**: ~5000 lines (all 56+ API endpoint pairs, question generation algorithms, helper functions)
- **index.html**: ~15 lines (minimal shell, font links)
- **vite.config.js**: ~120 lines (proxy configuration for all API paths)

---

## 25. Verification Checklist

When implementing Tenali from this specification:

- [ ] Dark theme (default) and light theme colors match exactly
- [ ] Theme toggle button in fixed top-right position (16px from edge)
- [ ] All 56 apps plus Random Mix and Custom Lesson appear in home grid with correct colors
- [ ] Search bar filters apps in real-time
- [ ] Grid dimension indicator displays correctly
- [ ] All 56+ API endpoint pairs implemented with correct parameters and responses
- [ ] Adaptive difficulty mode works on every quiz (smooth score transitions)
- [ ] Random Mix mode pulls from all topics with progressive difficulty
- [ ] GK and vocab questions load from JSON files at startup
- [ ] NumPad component works in math quizzes
- [ ] Auto-advance works for correct answers only
- [ ] Results table displays all information with correct colors
- [ ] Keyboard shortcuts work (Enter, 1–4 for MC, 0–9 for arithmetic)
- [ ] Responsive design works at 300px, 600px, 700px, and 1200px viewports
- [ ] localStorage persistence for theme and adaptive table state
- [ ] Render.com deployment works: build completes, server starts, health check passes

---

## End of Master Specification

This document defines the complete technical blueprint for Tenali. Every component, API endpoint, color value, dimension, algorithm, and behavior is documented here. An implementation team with this document and the 36 individual puzzle SKILL.md files (each containing comprehensive formal specifications with algorithms, API formats, and registration points) should be able to recreate the entire platform from scratch.
