# Ratio & Proportion — Formal Specification

## 1. Overview

Ratio and proportion quiz covering the IGCSE syllabus with four difficulty levels. Students practice simplifying ratios, dividing amounts in given ratios, and solving direct and inverse proportion problems. All questions generated algorithmically on-the-fly. Features optional adaptive mode that adjusts difficulty based on performance. Users enter answers in appropriate formats (e.g. "3:2", "72, 48", or "32").

**Target Grade Level:** IGCSE (Age 14–16)

## 2. Component Specification

**Component:** `RatioApp` (hand-written, located in `App.jsx` monolith)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Custom Features:**
- Hand-written (not factory-built)
- Adaptive mode via `isAdaptive` state
- Score-based difficulty progression: `adaptScore` (float 0–3), `adaptScoreRef` (ref)
- Gradient progress bar for adaptive mode
- Dynamic placeholders based on difficulty level

**Files:**
- Component: `App.jsx` (monolith, `RatioApp` function, lines 4142–4278)
- CSS: `App.css` (reuses standard quiz classes)
- Server: `/ratio-api/` routes in `server/index.js`
- Vite proxy: `/ratio-api` entry in `vite.config.js`

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

### 4.1 GET /ratio-api/question

**Purpose:** Generate a random ratio/proportion question at the specified difficulty.

**Query Parameters:**
- `difficulty` (string): 'easy', 'medium', 'hard', or 'extrahard'

**Response (Easy — simplify):**
```json
{
  "id": 1712345678000,
  "difficulty": "easy",
  "type": "simplify",
  "a": 12,
  "b": 8,
  "ansA": 3,
  "ansB": 2,
  "prompt": "Simplify the ratio 12 : 8"
}
```

**Response (Medium — divide 2-part):**
```json
{
  "id": 1712345678001,
  "difficulty": "medium",
  "type": "divide2",
  "ra": 3,
  "rb": 2,
  "total": 120,
  "ans1": 72,
  "ans2": 48,
  "prompt": "Divide 120 in the ratio 3 : 2"
}
```

**Response (Medium — divide 3-part):**
```json
{
  "id": 1712345678002,
  "difficulty": "medium",
  "type": "divide3",
  "ra": 2,
  "rb": 3,
  "rc": 1,
  "total": 60,
  "ans1": 20,
  "ans2": 30,
  "ans3": 10,
  "prompt": "Divide 60 in the ratio 2 : 3 : 1"
}
```

**Response (Hard — direct proportion):**
```json
{
  "id": 1712345678003,
  "difficulty": "hard",
  "type": "direct",
  "qtyA": 5,
  "valA": 20,
  "qtyB": 8,
  "answer": 32,
  "prompt": "If 5 items cost $20, how much do 8 items cost?"
}
```

**Response (ExtraHard — inverse proportion):**
```json
{
  "id": 1712345678004,
  "difficulty": "extrahard",
  "type": "inverse",
  "workersA": 4,
  "daysA": 6,
  "workersB": 3,
  "ansNum": 8,
  "ansDen": 1,
  "prompt": "4 workers take 6 days to finish a job. How many days for 3 workers?"
}
```

### 4.2 POST /ratio-api/check

**Purpose:** Validate user's ratio/proportion answer.

**Request Body:** Question fields plus `answer` (string)

**Response:**
```json
{ "correct": true, "display": "3:2", "message": "Correct!" }
```

**Server-side Algorithm:**

1. **Simplify:** Parse user answer as "a:b" format; simplify both expected and user answers by GCD; compare
2. **Divide2:** Parse user answer as "a, b" format; compare both parts to expected
3. **Divide3:** Parse user answer as "a, b, c" format; compare all three parts
4. **Direct:** Parse user answer as float; compare with tolerance `|userVal − expected| < 0.01`
5. **Inverse:** Parse user answer as integer or fraction; simplify both; compare

**Utility Functions (server):**
- `gcd(a, b)`: Euclidean GCD for ratio reduction
- `simplifyFraction(num, den)`: Reduce fraction to lowest terms

## 5. Difficulty Levels

| Level | Type | Description | Example |
|-------|------|-------------|---------|
| Easy | simplify | Simplify a ratio to lowest terms | 12:8 → 3:2 |
| Medium | divide | Divide an amount in a given ratio (2-part or 3-part) | Divide 120 in ratio 3:2 → 72, 48 |
| Hard | direct | Direct proportion: if a items cost x, how much for b items? | 5 items cost $20; 8 items cost? → $32 |
| ExtraHard | inverse | Inverse proportion: if a workers take x days, how long for b workers? | 4 workers take 6 days; 3 workers take? → 8 days |

## 6. Question Generation Algorithm

### Easy (Simplify Ratio)
```
1. Generate GCD g ∈ [2, 8]
2. Generate a = (random 1–10) × g
3. Generate b = (random 1–10) × g
4. Ensure a and b are not already simplified (GCD check)
5. Compute GCD(a, b) = g
6. Answer: ansA = a/g, ansB = b/g
7. Return: { id, difficulty: "easy", type: "simplify", a, b, ansA, ansB, prompt }
```

### Medium (Divide Amount)
```
1. With 75% probability: 2-part division
   a. Generate ra ∈ [1, 7], rb ∈ [1, 7]
   b. Generate multiplier k ∈ [2, 15]
   c. total = (ra + rb) × k
   d. unit = total / (ra + rb)
   e. ans1 = ra × unit, ans2 = rb × unit
   f. type = "divide2"
2. Else: 3-part division
   a. Generate ra ∈ [1, 5], rb ∈ [1, 5], rc ∈ [1, 5]
   b. Generate multiplier k ∈ [2, 10]
   c. total = (ra + rb + rc) × k
   d. unit = total / (ra + rb + rc)
   e. ans1 = ra × unit, ans2 = rb × unit, ans3 = rc × unit
   f. type = "divide3"
3. Return: { id, difficulty: "medium", type, ra, rb, [rc], total, ans1, ans2, [ans3], prompt }
```

### Hard (Direct Proportion)
```
1. Generate unitVal ∈ [2, 15]
2. Generate qtyA ∈ [2, 10], valA = unitVal × qtyA
3. Generate qtyB ∈ [2, 15], valB = unitVal × qtyB
4. Randomly choose context:
   - Cost: "If qtyA items cost $valA, how much do qtyB items cost?"
   - Weight: "If qtyA kg weighs valA lbs, how much do qtyB kg weigh?"
   - Consumption: "A car uses valA litres for qtyA km. How many litres for qtyB km?"
5. Return: { id, difficulty: "hard", type: "direct", qtyA, valA, qtyB, answer: valB, prompt }
```

### ExtraHard (Inverse Proportion)
```
1. Generate workersA ∈ [2, 10], daysA ∈ [2, 15]
2. Compute totalWork = workersA × daysA
3. Find all divisors of totalWork (excluding workersA itself) in range [2, 20]
4. Pick workersB from divisors (at least one must exist; else add workersA+1)
5. Compute daysB = totalWork / workersB
6. Simplify daysB as fraction: ansNum, ansDen
7. Return: { id, difficulty: "extrahard", type: "inverse", workersA, daysA, workersB, ansNum, ansDen, prompt }
```

## 7. Answer Checking Logic

**Simplify:**
- Parse user as "a:b" (colon-separated)
- Both sides simplified via GCD
- Compare ansA/ansDen === expected simplified

**Divide2/Divide3:**
- Parse user as comma or space-separated numbers
- Compare each component to expected (with integer tolerance)

**Direct:**
- Parse user as float
- Compare: `|userVal − expected| < 0.01`

**Inverse:**
- Parse user as integer or fraction (a/b format)
- Simplify both sides
- Compare simplified fractions

## 8. Registration

1. **Home `allApps` array:** `{ key: 'ratio', name: 'Ratio & Proportion', subtitle: 'Simplify, divide, direct & inverse', color: 'orange' }`
2. **Home `modeMap` object:** `ratio: RatioApp`
3. **`CUSTOM_PUZZLES` array:** `{ key: 'ratio', name: 'Ratio & Proportion' }`
4. **`fetchQuestionForType` URL map:** `ratio: '${API}/ratio-api/question?difficulty=${difficulty}'`
5. **`getPromptForType` switch:** Returns `q.prompt` (pre-built by server)
6. **CustomApp `handleSubmit` switch:** POSTs to `/ratio-api/check` with `answer` string
7. **CustomApp `renderInputs` switch:** Text input with dynamic placeholder (easy: "3:2", medium: "72, 48", hard: "32", extrahard: "8 or 8/3")
8. **Vite proxy:** `/ratio-api` → `http://127.0.0.1:4000`

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
- **Easy:** 10 × 10 × ~40 GCD multiples = 4,000+ unique problems
- **Medium (2-part):** 7 × 7 × 14 = 686+ unique problems
- **Medium (3-part):** 5 × 5 × 5 × 9 = 1,125+ unique problems
- **Hard:** 14 unitVal × 9 qtyA × 14 qtyB × 3 contexts = 5,292+ unique problems
- **ExtraHard:** 9 workersA × 14 daysA × variable divisors = effectively unlimited
