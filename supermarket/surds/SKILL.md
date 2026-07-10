# Surds — Formal Specification

## 1. Overview

A surds quiz covering the IGCSE syllabus with four difficulty levels. The player works with square roots (surds), simplifying, adding/subtracting like surds, multiplying, and rationalising denominators. Uses algorithmic on-the-fly question generation providing unlimited unique problems. User types answers as text using √ symbol (or "sqrt" shorthand). Features auto-advance on correct answers (1.5s), Enter key to advance after wrong answers, and a running results table. Optional adaptive mode adjusts difficulty based on performance.

**Target Grade Level:** IGCSE (Age 14–16)

## 2. Component Specification

**Component:** `SurdsApp` (hand-written, located in `App.jsx` monolith)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Custom Features:**
- Hand-written (not factory-built)
- Adaptive mode via `isAdaptive` state
- Score-based difficulty progression: `adaptScore` (float 0–3), `adaptScoreRef` (ref)
- Gradient progress bar for adaptive mode
- User input normalization: "sqrt" → √ on submit

**Files:**
- Component: `App.jsx` (monolith, `SurdsApp` function, lines 4624–4800+)
- CSS: `App.css` (reuses standard quiz classes)
- Server: `/surds-api/` routes in `server/index.js`
- Vite proxy: `/surds-api` entry in `vite.config.js`

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

### 4.1 GET /surds-api/question

**Purpose:** Generate a random surds question at the specified difficulty.

**Query Parameters:**
- `difficulty` (string, optional): 'easy', 'medium', 'hard', or 'extrahard'. Defaults to 'easy'.

**Response (Easy — simplify √n):**
```json
{ "id": 1712345678000, "difficulty": "easy", "type": "simplify", "n": 72 }
```
- `n = a² × b` where `b` is square-free
- `a` ranges 2–9, `b` drawn from SQUARE_FREE list

**Response (Medium — add/subtract like surds):**
```json
{ "id": 1712345678001, "difficulty": "medium", "type": "addsub", "a": 3, "b": 2, "r": 5, "op": "+" }
```
- `a`, `b` range 1–9; for subtraction, `a > b` guaranteed
- `r` is a square-free radicand
- `op` is '+' or '-'

**Response (Hard — multiply surds):**
```json
{ "id": 1712345678002, "difficulty": "hard", "type": "multiply", "c1": 2, "r1": 6, "c2": 3, "r2": 10 }
```
- Represents `(c1√r1) × (c2√r2)`
- `c1`, `c2` range 1–5; `r1`, `r2` square-free

**Response (ExtraHard — rationalise, simple):**
```json
{ "id": 1712345678003, "difficulty": "extrahard", "type": "rationalise", "subtype": "simple", "a": 6, "b": 1, "r": 3 }
```
- Represents `a / (b√r)`

**Response (ExtraHard — rationalise, conjugate):**
```json
{ "id": 1712345678004, "difficulty": "extrahard", "type": "rationalise", "subtype": "conjugate", "a": 5, "p": 2, "q": 1, "r": 3 }
```
- Represents `a / (p + q√r)`

### 4.2 POST /surds-api/check

**Purpose:** Validate the user's surd answer against the correct simplified result.

**Request Body:** Question fields plus `answer` (string, e.g. "6√2", "5√5", "2√3/3", "10-5√3")

**Response:**
```json
{ "correct": true, "display": "6√2", "message": "Correct!" }
```

**Server-side Algorithm:**

1. **Simplify (easy):** Factor out largest perfect square from n → `outer√inner`
2. **Add/subtract (medium):** `a ± b` gives coefficient, radicand unchanged
3. **Multiply (hard):** `c1*c2 × √(r1*r2)`, then simplify √(r1*r2) via `simpleSurd()`
4. **Rationalise simple:** `a/(b√r) = a√r/(b*r)`, simplify fraction
5. **Rationalise conjugate:** `a/(p+q√r) × (p-q√r)/(p-q√r) = a(p-q√r)/(p²-q²r)`

**Answer parsing:** `parseSurd(s)` regex extracts `{ rational, coeff, radicand }` from strings like "6√2", "5", "10-5√3". User answers are normalized (√radicand simplified to square-free) before comparison.

**Utility Functions (server):**
- `isPerfectSquare(n)`: Check if n is a perfect square
- `simpleSurd(n)`: Factor out largest perfect square → `{ outer, inner }`
- `SQUARE_FREE`: Array of square-free numbers [2,3,5,6,7,10,11,13,14,15,17,19,21,22,23,26,29,30]
- `randInt(lo, hi)`: Random integer in [lo, hi]
- `pick(arr)`: Random element from array
- `gcd(a, b)`: Euclidean GCD (reused from fractions)
- `simplifyFraction(num, den)`: Reduce fraction (reused from fractions)

## 5. Difficulty Levels

| Level | Type | Description | Example |
|-------|------|-------------|---------|
| Easy | simplify | Simplify √n to a√b | √72 = 6√2 |
| Medium | addsub | Add/subtract like surds | 3√5 + 2√5 = 5√5 |
| Hard | multiply | Multiply and simplify | 2√6 × 3√10 = 6·2√15 = 12√15 |
| ExtraHard | rationalise | Rationalise denominators | 6/√3 = 2√3, 5/(2+√3) = 10-5√3 |

## 6. Question Generation Algorithm

### Easy (Simplify √n)
```
1. Generate b ∈ SQUARE_FREE
2. Generate a ∈ [2, 9]
3. Compute n = a² × b
4. Return: { id, difficulty: "easy", type: "simplify", n }
```

### Medium (Add/Subtract Like Surds)
```
1. Generate r ∈ SQUARE_FREE
2. Generate a ∈ [1, 9], b ∈ [1, 9]
3. Generate op ∈ {'+', '−'}
4. If op === '−': ensure a > b (for positive result)
5. Compute answer coefficient = (op === '+' ? a + b : a − b)
6. Return: { id, difficulty: "medium", type: "addsub", a, b, r, op }
```

### Hard (Multiply Surds)
```
1. Generate r1 ∈ SQUARE_FREE, c1 ∈ [1, 5]
2. Generate r2 ∈ SQUARE_FREE, c2 ∈ [1, 5]
3. Server will compute product: c1*c2 × √(r1*r2), then simplify
4. Return: { id, difficulty: "hard", type: "multiply", c1, r1, c2, r2 }
```

### ExtraHard (Rationalise)
```
1. Randomly choose subtype:
   a) simple (50%): a / (b√r)
      - Generate r ∈ SQUARE_FREE, b ∈ [1, 4], a ∈ [1, 12]
   b) conjugate (50%): a / (p + q√r)
      - Generate r ∈ SQUARE_FREE, p ∈ [1, 5], q ∈ {±1, ±2}, a ∈ [1, 10]
2. Return: { id, difficulty: "extrahard", type: "rationalise", subtype, ... }
```

## 7. Answer Checking Logic

**All types:**
- Parse user string: Replace "sqrt" with √, remove spaces
- Extract as `{ rational, coeff, radicand }`
- Normalize both expected and user answers (simplify radicand to square-free)
- Compare normalized forms

## 8. Registration

1. **Home `allApps` array:** `{ key: 'surds', name: 'Surds', subtitle: 'Simplify, add, multiply, rationalise', color: 'green' }`
2. **Home `modeMap` object:** `surds: SurdsApp`
3. **`CUSTOM_PUZZLES` array:** `{ key: 'surds', name: 'Surds' }`
4. **`fetchQuestionForType` URL map:** `surds: '${API}/surds-api/question?difficulty=${difficulty}'`
5. **`getPromptForType` switch:** Returns appropriate prompt for each surd type
6. **CustomApp `handleSubmit` switch:** POSTs to `/surds-api/check` with answer string
7. **CustomApp `renderInputs` switch:** Text input with "e.g. 6√2" placeholder
8. **Vite proxy:** `/surds-api` → `http://127.0.0.1:4000`

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

## 10. UI Layout

### 10.1 Setup Phase
Standard welcome box with:
- Description text
- Tip: "type √ using 'sqrt' or copy-paste √"
- Difficulty pills: Easy — Simplify / Medium — Add/Sub / Hard — Multiply / Extra Hard — Rationalise
- Adaptive mode toggle with gradient background when active
- Adaptive mode explanation text (only when `isAdaptive === true`)
- Questions number input (1–100, default 20)
- Start Quiz button

### 10.2 Playing Phase
- Progress pill: "Question N/T"
- Adaptive level pill (only if adaptive mode): Shows current level with color
- Adaptive progress bar (only if adaptive mode): Gradient from green to purple
- Question prompt in large text (1.6rem)
- Single text input (placeholder "e.g. 6√2")
- Input normalization: "sqrt" → √ on submit
- Feedback div (correct/wrong)
- Submit / Next Question / Finish Quiz buttons
- Running ResultsTable

### 10.3 Finished Phase
Standard welcome box with score and ResultsTable, plus level reached (if adaptive mode used).

## 11. Answer Format

Users type answers as text strings:
- Simple surd: `6√2`, `√3`, `5`
- Mixed: `10-5√3`, `10+5√3`
- Fractional: `2√3/3`, `(10-5√3)/7`
- Shorthand: `sqrt` is auto-replaced with `√`

## 12. State Machine

```
setup ──[Start Quiz]──→ playing ──[Last Q answered]──→ finished
                           │                              │
                           │ ←──[loadQuestion on qNum]────┘ (Play Again resets to setup)
```

## 13. Generation Guarantees

All questions are generated algorithmically on-the-fly:
- **Easy:** 8 square-free bases × 8 multipliers = 64+ unique radicands; effectively unlimited
- **Medium:** 18 radicands × 9 × 9 × 2 ops = 2916+ unique problems
- **Hard:** 18 × 5 × 18 × 5 = 8100+ unique products
- **ExtraHard simple:** 18 × 4 × 12 = 864+ unique problems
- **ExtraHard conjugate:** 18 × 5 × 6 × 10 = 5400+ unique problems
