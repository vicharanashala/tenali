# Sequences & Series — Formal Specification

## 1. Overview

Arithmetic and geometric sequences and series quiz covering the IGCSE syllabus with four difficulty levels. Students practice finding nth terms and sums using explicit formulas. All questions generated algorithmically on-the-fly. Features optional adaptive mode that adjusts difficulty based on performance. Users enter integer or fraction answers (e.g. "39" or "3/4").

**Target Grade Level:** IGCSE (Age 14–16)

## 2. Component Specification

**Component:** `SequencesApp` (hand-written, located in `App.jsx` monolith)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Custom Features:**
- Hand-written (not factory-built)
- Adaptive mode via `isAdaptive` state
- Score-based difficulty progression: `adaptScore` (float 0–3), `adaptScoreRef` (ref)
- Gradient progress bar for adaptive mode

**Files:**
- Component: `App.jsx` (monolith, `SequencesApp` function, lines 4019–4141)
- CSS: `App.css` (reuses standard quiz classes)
- Server: `/sequences-api/` routes in `server/index.js`
- Vite proxy: `/sequences-api` entry in `vite.config.js`

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `difficulty` | string | 'easy' | Selected difficulty: 'easy', 'medium', 'hard', or 'extrahard' |
| `isAdaptive` | boolean | false | True if user selects adaptive mode |
| `adaptScore` | number | 0 | Adaptive score (0–3 range) controlling effective difficulty |
| `adaptScoreRef` | MutableRefObject | 0 | Ref mirror of `adaptScore` for effectiveDiff() function |
| `numQuestions` | string | '20' | User input for total question count |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `question` | object\|null | null | Current question from API (see §4 for shapes) |
| `answer` | string | '' | User's text answer input |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question index (1-based in display) |
| `totalQ` | number | 20 | Parsed and validated total question count |
| `feedback` | string | '' | Feedback message displayed after submission |
| `isCorrect` | boolean\|null | null | Whether last answer was correct (null before submission) |
| `loading` | boolean | false | True while fetching next question |
| `revealed` | boolean | false | True after answer submitted and checked |
| `results` | array | [] | Array of result objects for ResultsTable |

**Timer:** Uses shared `useTimer()` hook.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceFnRef, isCorrect)` hook. Only fires when `isCorrect === true`.

**Enter key after wrong:** A `useEffect` adds a global `keydown` listener for Enter when `revealed && !isCorrect`, calling `advance()`.

## 4. API Endpoints

### 4.1 GET /sequences-api/question

**Purpose:** Generate a random sequences/series question at the specified difficulty.

**Query Parameters:**
- `difficulty` (string): 'easy', 'medium', 'hard', or 'extrahard'

**Response (Easy — arithmetic nth term):**
```json
{
  "id": 1712345678000,
  "difficulty": "easy",
  "type": "arith_nth",
  "a": 3,
  "d": 4,
  "n": 10,
  "terms": [3, 7, 11, 15],
  "answer": 39,
  "prompt": "3, 7, 11, 15, ... Find the 10th term"
}
```

**Response (Medium — arithmetic sum):**
```json
{
  "id": 1712345678001,
  "difficulty": "medium",
  "type": "arith_sum",
  "a": 3,
  "d": 4,
  "n": 10,
  "terms": [3, 7, 11, 15],
  "answer": 210,
  "prompt": "3, 7, 11, 15, ... Find the sum of first 10 terms"
}
```

**Response (Hard — geometric nth term):**
```json
{
  "id": 1712345678002,
  "difficulty": "hard",
  "type": "geom_nth",
  "a": 2,
  "r": 3,
  "n": 5,
  "terms": ["2", "6", "18", "54"],
  "ansNum": 162,
  "ansDen": 1,
  "prompt": "2, 6, 18, 54, ... Find the 5th term"
}
```

**Response (ExtraHard — geometric sum):**
```json
{
  "id": 1712345678003,
  "difficulty": "extrahard",
  "type": "geom_sum",
  "a": 2,
  "r": 3,
  "n": 5,
  "terms": ["2", "6", "18"],
  "ansNum": 242,
  "ansDen": 1,
  "prompt": "2, 6, 18, ... Find the sum of first 5 terms"
}
```

### 4.2 POST /sequences-api/check

**Purpose:** Validate user's sequence/series answer against the correct result.

**Request Body:** Question fields plus `answer` (string, e.g. "39" or "3/4")

**Response:**
```json
{ "correct": true, "display": "39", "message": "Correct!" }
```

**Server-side Algorithm:**

1. **Arithmetic nth term:** `answer = a + (n−1)×d`; parse user integer, compare to expected
2. **Arithmetic sum:** `answer = n/2 × (2a + (n−1)d)`; parse user integer, compare
3. **Geometric nth term:** `answer = a × r^(n−1)`; if r is fraction (1/2, 1/3), store as ansNum/ansDen; parse user as integer or fraction, simplify, compare
4. **Geometric sum:** `answer = a(r^n − 1)/(r − 1)` for r ≠ 1; use rational arithmetic to compute exact fraction; parse user as integer or fraction, simplify, compare

**Utility Functions (server):**
- `gcd(a, b)`: Euclidean GCD
- `simplifyFraction(num, den)`: Reduce fraction to lowest terms

## 5. Difficulty Levels

| Level | Type | Formula | Description | Example |
|-------|------|---------|-------------|---------|
| Easy | arith_nth | a_n = a + (n−1)d | Find nth term of arithmetic sequence | 3, 7, 11, 15, ... Find 10th term → 39 |
| Medium | arith_sum | S_n = n/2 × (2a + (n−1)d) | Find sum of first n terms of arithmetic sequence | 3, 7, 11, 15, ... Sum of first 10 → 210 |
| Hard | geom_nth | a_n = ar^(n−1) | Find nth term of geometric sequence (may involve fractions) | 2, 6, 18, ... Find 5th term → 162 |
| ExtraHard | geom_sum | S_n = a(r^n − 1)/(r − 1) | Find sum of first n terms of geometric sequence | 2, 6, 18, ... Sum of first 5 → 242 |

## 6. Question Generation Algorithm

### Easy (Arithmetic nth Term)
```
1. Generate a ∈ [−10, 20], d ∈ [−8, 8]
2. If d === 0, override d to one of: ±1, ±2, ±3, ±5
3. Generate n ∈ [5, 20]
4. Compute first 4 terms: [a, a+d, a+2d, a+3d]
5. Compute answer = a + (n−1)×d
6. Return: { id, difficulty: "easy", type: "arith_nth", a, d, n, terms, answer, prompt }
```

### Medium (Arithmetic Sum)
```
1. Generate a ∈ [1, 15], d ∈ [1, 8] (keep positive for cleaner sums)
2. Generate n ∈ [5, 20]
3. Compute first 4 terms: [a, a+d, a+2d, a+3d]
4. Compute answer = Math.round(n/2 × (2a + (n−1)d))
5. Return: { id, difficulty: "medium", type: "arith_sum", a, d, n, terms, answer, prompt }
```

### Hard (Geometric nth Term)
```
1. Generate a ∈ {1, 2, 3, 4, 5, -1, -2, -3}
2. Generate r ∈ {2, 3, -2, -3, 1/2, 1/3, -1/2, -1/3}
3. Generate n ∈ [3, 8]
4. Compute first 4 terms: [a, ar, ar², ar³]
5. Compute answer = a × r^(n−1)
6. If r is integer, ansNum = answer, ansDen = 1
   Else use rational arithmetic: r_frac = {n, d}, compute a × (r_n^(n−1) / r_d^(n−1))
7. Return: { id, difficulty: "hard", type: "geom_nth", a, r, n, terms (formatted), ansNum, ansDen, prompt }
```

### ExtraHard (Geometric Sum)
```
1. Generate a ∈ {1, 2, 3, 4, 5}
2. Generate r ∈ {2, 3, -2, 1/2} (1/2 for fractional case)
3. Generate n ∈ [3, 7]
4. Compute first 3 terms: [a, ar, ar²]
5. If r is integer: answer = a(r^n − 1)/(r − 1)
   ansNum = Math.round(answer), ansDen = 1
   Else use rational arithmetic for r_frac:
     S = a × (r_den^n − r_num^n) / (r_den^(n−1) × (r_den − r_num))
   Simplify fraction
6. Return: { id, difficulty: "extrahard", type: "geom_sum", a, r, n, terms (formatted), ansNum, ansDen, prompt }
```

## 7. Answer Checking Logic

**Arithmetic (easy, medium):**
- Parse user input as float
- Compare: `|userNum − expected| < 0.001` (allow floating-point tolerance)

**Geometric (hard, extrahard):**
- Parse user answer as integer or fraction (a/b format)
- Simplify both expected (ansNum/ansDen) and user answer
- Compare simplified numerators and denominators

## 8. Registration

1. **Home `allApps` array:** `{ key: 'sequences', name: 'Sequences & Series', subtitle: 'Arithmetic & geometric', color: 'teal' }`
2. **Home `modeMap` object:** `sequences: SequencesApp`
3. **`CUSTOM_PUZZLES` array:** `{ key: 'sequences', name: 'Sequences & Series' }`
4. **`fetchQuestionForType` URL map:** `sequences: '${API}/sequences-api/question?difficulty=${difficulty}'`
5. **`getPromptForType` switch:** Returns `q.prompt` (pre-built by server)
6. **CustomApp `handleSubmit` switch:** POSTs to `/sequences-api/check` with `answer` string
7. **CustomApp `renderInputs` switch:** Text input with placeholder "e.g. 42 or 3/4"
8. **Vite proxy:** `/sequences-api` → `http://127.0.0.1:4000`

## 9. Adaptive Mode

**Enable Adaptive Mode:**
User toggles `isAdaptive` checkbox in setup phase.

**Adaptive Score Mechanics:**
- Initial: `adaptScore = 0`, `adaptScoreRef.current = 0`
- On correct answer: `adaptScore = Math.min(3, adaptScore + 0.25)`
- On wrong answer: `adaptScore = Math.max(0, adaptScore - 0.35)`
- Score always maintained in ref for `effectiveDiff()` to use synchronously

**Difficulty Progression:**
```javascript
const ADAPT_DIFFS = ['easy', 'medium', 'hard', 'extrahard']
function adaptiveLevel(score) {
  return ADAPT_DIFFS[Math.min(Math.max(Math.round(score), 0), 3)]
}
```

Maps adaptScore to difficulty:
- [0.0, 0.5) → easy
- [0.5, 1.5) → medium
- [1.5, 2.5) → hard
- [2.5, 3.0] → extrahard

**Progress Bar UI:**
```javascript
function adaptivePct(score) {
  return Math.min(100, Math.max(0, (score / 3) * 100))
}
```
- Linear gradient bar: 0% (green) → 100% (purple)
- Width updates reactively with adaptScore changes
- Displayed only during playing phase

**effectiveDiff() Function:**
```javascript
const effectiveDiff = () => isAdaptive ? adaptiveLevel(adaptScoreRef.current) : difficulty
```
- Used in `loadQuestion()` to determine API difficulty query parameter

**Level Display:**
- Pill shows current level: "Easy", "Medium", "Hard", "Extra Hard"
- Color matches ADAPT_COLORS gradient
- Only shown if `isAdaptive === true`

**Completion Message:**
- Shows "Reached level: [level name]" in final score screen if adaptive mode used

## 10. State Machine

```
setup ──[Start Quiz]──→ playing ──[Last Q answered]──→ finished
                           │                              │
                           │ ←──[loadQuestion on qNum]────┘ (Play Again resets to setup)
```

## 11. Generation Guarantees

All questions are generated algorithmically on-the-fly:
- **Easy:** 30 a values × 16 d values × 16 n values = 7,680+ unique problems
- **Medium:** 15 a values × 8 d values × 16 n values = 1,920+ unique problems
- **Hard:** 8 a values × 7 r values × 6 n values = 336+ unique problems
- **ExtraHard:** 5 a values × 4 r values × 5 n values = 100+ unique problems
