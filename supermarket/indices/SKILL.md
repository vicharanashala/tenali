# Indices (Laws of Exponents) — Formal Specification

## 1. Overview

An indices quiz covering the IGCSE exponents syllabus with four difficulty levels. Students practice simplifying expressions using index laws (add/subtract/multiply exponents), evaluating zero/negative exponents, fractional exponents, and mixed expressions with fraction bases. All questions generated algorithmically on-the-fly. Features optional adaptive mode that adjusts difficulty based on performance. Users enter exponents (as integers) or evaluated answers (as integers or fractions).

**Target Grade Level:** IGCSE (Age 14–16)

## 2. Component Specification

**Component:** `IndicesApp` (hand-written, located in `App.jsx` monolith)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Custom Features:**
- Hand-written (not factory-built)
- Adaptive mode via `isAdaptive` state
- Score-based difficulty progression: `adaptScore` (float 0–3), `adaptScoreRef` (ref)
- Gradient progress bar for adaptive mode
- Context-sensitive input placeholders based on difficulty

**Files:**
- Component: `App.jsx` (monolith, `IndicesApp` function, lines 4426–4612)
- CSS: `App.css` (reuses standard quiz classes)
- Server: `/indices-api/` routes in `server/index.js`
- Vite proxy: `/indices-api` entry in `vite.config.js`

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

### 4.1 GET /indices-api/question

**Purpose:** Generate a random indices question at the specified difficulty.

**Query Parameters:**
- `difficulty` (string): 'easy', 'medium', 'hard', or 'extrahard'

**Response (Easy — simplify, multiply subtype):**
```json
{
  "id": 1712345678000,
  "difficulty": "easy",
  "type": "simplify",
  "subtype": "multiply",
  "base": "x",
  "m": 3,
  "n": 4,
  "prompt": "x³ × x⁴",
  "answerExp": 7
}
```

**Response (Easy — simplify, divide subtype):**
```json
{
  "id": 1712345678001,
  "difficulty": "easy",
  "type": "simplify",
  "subtype": "divide",
  "base": "y",
  "m": 9,
  "n": 2,
  "prompt": "y⁹ ÷ y²",
  "answerExp": 7
}
```

**Response (Easy — simplify, power subtype):**
```json
{
  "id": 1712345678002,
  "difficulty": "easy",
  "type": "simplify",
  "subtype": "power",
  "base": "a",
  "m": 3,
  "n": 2,
  "prompt": "(a³)²",
  "answerExp": 6
}
```

**Response (Medium — evaluate, zero):**
```json
{
  "id": 1712345678003,
  "difficulty": "medium",
  "type": "evaluate",
  "subtype": "zero",
  "prompt": "5⁰",
  "answerNum": 1,
  "answerDen": 1
}
```

**Response (Medium — evaluate, negative):**
```json
{
  "id": 1712345678004,
  "difficulty": "medium",
  "type": "evaluate",
  "subtype": "negative_eval",
  "numBase": 2,
  "n": 3,
  "prompt": "2⁻³",
  "answerNum": 1,
  "answerDen": 8
}
```

**Response (Hard — evaluate, fractional):**
```json
{
  "id": 1712345678005,
  "difficulty": "hard",
  "type": "evaluate",
  "subtype": "fractional",
  "numBase": 27,
  "expNum": 2,
  "expDen": 3,
  "prompt": "27^(2/3)",
  "answerNum": 9,
  "answerDen": 1
}
```

**Response (ExtraHard — evaluate, negative fractional):**
```json
{
  "id": 1712345678006,
  "difficulty": "extrahard",
  "type": "evaluate",
  "subtype": "neg_frac",
  "numBase": 8,
  "expNum": -1,
  "expDen": 3,
  "prompt": "8^(-1/3)",
  "answerNum": 1,
  "answerDen": 2
}
```

### 4.2 POST /indices-api/check

**Purpose:** Validate user's indices answer.

**Request Body:** Question fields plus `answer` (string)

**Response:**
```json
{ "correct": true, "display": "x⁷", "message": "Correct!" }
```

**Server-side Algorithm:**

1. **Simplify (easy):** Parse answer as integer exponent, compare to `answerExp`
2. **Evaluate (medium/hard/extrahard):** Parse answer as integer or fraction (a/b), simplify both expected (answerNum/answerDen) and user, compare

**Utility Functions (server):**
- `sup(n)`: Format integer as Unicode superscript (handles negative with ⁻)
- `fmtFracExp(num, den)`: Format fractional exponent as "num/den"
- `gcd(a, b)`: Euclidean GCD
- `simplifyFraction(num, den)`: Reduce fraction to lowest terms

## 5. Difficulty Levels

| Level | Type | Input Format | Description | Example |
|-------|------|-------------|-------------|---------|
| Easy | simplify | Exponent integer | Basic index laws: multiply (add), divide (subtract), power-of-power | x³ × x⁴ → enter "7" for x⁷ |
| Medium | evaluate | Number or fraction | Zero/negative exponents on numeric bases | 2⁻³ → enter "1/8" |
| Hard | evaluate | Number | Fractional exponents on numeric bases | 27^(2/3) → enter "9" |
| ExtraHard | evaluate | Number or fraction | Negative fractional exponents, fraction bases | (8/27)^(-2/3) → enter "9/4" |

## 6. Question Generation Algorithm

### Easy (Simplify)
```
1. Generate base ∈ {x, y, a, b, m, n, p}
2. Randomly choose subtype:
   a) multiply: m ∈ [2, 8], n ∈ [2, 8], answerExp = m + n
   b) divide: m ∈ [5, 12], n ∈ [1, m−1], answerExp = m − n
   c) power: m ∈ [2, 5], n ∈ [2, 5], answerExp = m × n
3. Return: { id, difficulty: "easy", type: "simplify", subtype, base, m, n, prompt, answerExp }
```

### Medium (Evaluate)
```
1. Randomly choose subtype:
   a) zero: numBase ∈ [2, 20], answerNum = 1, ansDen = 1
   b) negative_eval: numBase ∈ {2, 3, 4, 5, 10}, n ∈ {1, 2, 3}
      answerNum = 1, answerDen = numBase^n
   c) negative_simplify: base ∈ {x, y, a, b, m, n, p}, a ∈ [1, 5], b ∈ [a+1, a+6]
      answerExp = b − a (simplified x^(−a) × x^b)
2. Return: { id, difficulty: "medium", type: "evaluate", subtype, ..., prompt, answerNum, answerDen [or answerExp] }
```

### Hard (Fractional Exponents)
```
1. Choose from 28 curated combos of (base, expNum, expDen) with clean integer results:
   - Square roots: 4^(1/2)=2, 9^(1/2)=3, ..., 100^(1/2)=10
   - Cube roots: 8^(1/3)=2, 27^(1/3)=3, ..., 125^(1/3)=5
   - Combined: 4^(3/2)=8, 9^(3/2)=27, 8^(2/3)=4, ..., 81^(3/4)=27
2. Compute root = base^(1/expDen), answer = root^expNum
3. Return: { id, difficulty: "hard", type: "evaluate", subtype: "fractional", numBase, expNum, expDen, prompt, answerNum: answer, answerDen: 1 }
```

### ExtraHard (Mixed — Negative Fractional & Fraction Bases)
```
1. Randomly choose subtype:
   a) neg_frac: From 12 curated combos (base, expNum, expDen) with negative exponents
      Result: a^(−m/n) = 1/a^(m/n)
      Example: 8^(−1/3) = 1/2
   b) frac_base: From 8 curated combos of (a/b)^n or (a/b)^(m/n)
      Example: (1/2)^(−2) = 4, (8/27)^(−2/3) = 9/4
2. Return: { id, difficulty: "extrahard", type: "evaluate", subtype, prompt, answerNum, answerDen }
```

## 7. Answer Checking Logic

**Simplify (easy):**
- Parse user as integer
- Compare to `answerExp`

**Evaluate (medium/hard/extrahard):**
- Parse user as integer or fraction (a/b)
- Simplify both expected and user fractions via GCD
- Compare: `userNum/gcd(uNum,uDen) === ansNum/gcd(aNum,aDen)` AND same denominator

## 8. Registration

1. **Home `allApps` array:** `{ key: 'indices', name: 'Indices', subtitle: 'Laws of exponents', color: 'purple' }`
2. **Home `modeMap` object:** `indices: IndicesApp`
3. **`CUSTOM_PUZZLES` array:** `{ key: 'indices', name: 'Indices' }`
4. **`fetchQuestionForType` URL map:** `indices: '${API}/indices-api/question?difficulty=${difficulty}'`
5. **`getPromptForType` switch:** Returns `q.prompt + " = ?"` (prompt pre-built by server)
6. **CustomApp `handleSubmit` switch:** POSTs to `/indices-api/check` with `answer` string
7. **CustomApp `renderInputs` switch:** Text input with context-sensitive placeholder
8. **Vite proxy:** `/indices-api` → `http://127.0.0.1:4000`

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
- **Easy:** 7 bases × 3 subtypes × ~30 exponent pairs = 600+ unique problems
- **Medium:** 3 subtypes × varied ranges (1 + 30 + 36) = 67+ unique problems
- **Hard:** 28 curated combos (all with clean integer answers)
- **ExtraHard:** 12 neg_frac + 8 frac_base = 20 curated combos with exact answers
