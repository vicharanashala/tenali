# Percentages — Formal Specification

## 1. Overview

Percentages quiz covering the IGCSE syllabus with four difficulty levels. Students practice finding percentages of amounts, percentage increase/decrease, reverse percentage calculations, and compound interest problems. All questions generated algorithmically on-the-fly with clean numeric answers. Features optional adaptive mode that adjusts difficulty based on performance. Users enter numeric answers; dollar signs and commas are stripped automatically.

**Target Grade Level:** IGCSE (Age 14–16)

## 2. Component Specification

**Component:** `PercentApp` (hand-written, located in `App.jsx` monolith)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Custom Features:**
- Hand-written (not factory-built)
- Adaptive mode via `isAdaptive` state
- Score-based difficulty progression: `adaptScore` (float 0–3), `adaptScoreRef` (ref)
- Gradient progress bar for adaptive mode
- User input cleaned: dollar signs and commas removed before answer checking

**Files:**
- Component: `App.jsx` (monolith, `PercentApp` function, lines 4279–4425)
- CSS: `App.css` (reuses standard quiz classes)
- Server: `/percent-api/` routes in `server/index.js`
- Vite proxy: `/percent-api` entry in `vite.config.js`

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

### 4.1 GET /percent-api/question

**Purpose:** Generate a random percentage question at the specified difficulty.

**Query Parameters:**
- `difficulty` (string): 'easy', 'medium', 'hard', or 'extrahard'

**Response (Easy — find percentage):**
```json
{
  "id": 1712345678000,
  "difficulty": "easy",
  "type": "find_pct",
  "pct": 20,
  "base": 150,
  "answer": 30,
  "prompt": "What is 20% of 150?"
}
```

**Response (Medium — increase/decrease):**
```json
{
  "id": 1712345678001,
  "difficulty": "medium",
  "type": "inc_dec",
  "op": "increase",
  "pct": 15,
  "base": 80,
  "answer": 92,
  "prompt": "Increase 80 by 15%"
}
```

**Response (Hard — reverse percentage):**
```json
{
  "id": 1712345678002,
  "difficulty": "hard",
  "type": "reverse",
  "op": "increase",
  "pct": 20,
  "finalVal": 60,
  "answer": 50,
  "prompt": "After a 20% increase, the price is $60. What was the original price?"
}
```

**Response (ExtraHard — compound interest):**
```json
{
  "id": 1712345678003,
  "difficulty": "extrahard",
  "type": "compound",
  "P": 1000,
  "rate": 10,
  "years": 3,
  "op": "increase",
  "answer": 1331,
  "prompt": "$1000 invested at 10% compound interest per year for 3 years. Find the final amount."
}
```

### 4.2 POST /percent-api/check

**Purpose:** Validate user's percentage answer.

**Request Body:** Question fields plus `userAnswer` (string, may include $ or commas)

**Response:**
```json
{ "correct": true, "display": "30", "message": "Correct!" }
```

**Server-side Algorithm:**

1. **Find %:** answer = (pct/100) × base; parse user float, compare with tolerance 0.01
2. **Increase/Decrease:** answer = base × (1 ± pct/100); parse user float, compare with tolerance 0.01
3. **Reverse %:** answer = finalVal / (1 ± pct/100); parse user float, compare with tolerance 0.01
4. **Compound:** answer = P × (1 ± rate/100)^years; round to nearest cent; parse user float, compare with tolerance 0.5

**Utility Functions (server):**
- Input cleaning: Remove `$`, commas, and `−` (em dash) before parsing

## 5. Difficulty Levels

| Level | Type | Description | Example |
|-------|------|-------------|---------|
| Easy | find_pct | Find X% of a number | What is 20% of 150? → 30 |
| Medium | inc_dec | Increase or decrease a number by X% | Increase 80 by 15% → 92 |
| Hard | reverse | Reverse percentage: given final amount and %, find original | After 20% increase, price is $60. Original? → $50 |
| ExtraHard | compound | Compound interest or repeated % change | $1000 at 10% per year for 3 years → $1331 |

## 6. Question Generation Algorithm

### Easy (Find Percentage)
```
1. Generate pct ∈ {5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90}
2. Generate base ∈ {50, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000}
3. Compute answer = (pct/100) × base
4. Return: { id, difficulty: "easy", type: "find_pct", pct, base, answer, prompt }
```

### Medium (Increase/Decrease)
```
1. Generate op ∈ {increase, decrease}
2. Generate pct ∈ {5, 10, 15, 20, 25, 30, 40, 50}
3. Generate base ∈ {40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500}
4. Compute change = (pct/100) × base
5. If op === increase: answer = base + change
   Else: answer = base − change
6. Return: { id, difficulty: "medium", type: "inc_dec", op, pct, base, answer, prompt }
```

### Hard (Reverse Percentage)
```
1. Generate op ∈ {increase, decrease}
2. Generate pct ∈ {10, 15, 20, 25, 30, 40, 50}
3. Generate original ∈ {40, 50, 60, 80, 100, 120, 150, 200, 250, 300}
4. If op === increase: finalVal = original × (1 + pct/100)
   Else: finalVal = original × (1 − pct/100)
5. Return: { id, difficulty: "hard", type: "reverse", op, pct, finalVal, answer: original, prompt }
```

### ExtraHard (Compound Interest)
```
1. Generate P ∈ {100, 200, 500, 1000, 2000, 5000}
2. Generate rate ∈ {5, 10, 15, 20}
3. Generate years ∈ {2, 3, 4}
4. Generate op ∈ {increase, decrease}
5. Compute multiplier = (1 ± rate/100)
6. Compute answer = Math.round(P × multiplier^years × 100) / 100
7. If op === increase: prompt uses "compound interest" context
   Else: prompt uses "population decrease" context
8. Return: { id, difficulty: "extrahard", type: "compound", P, rate, years, op, answer, prompt }
```

## 7. Answer Checking Logic

**All types:**
- Parse user input: Remove `$`, commas, `−` (em dash), convert to float
- Compare with specified tolerance based on type:
  - **Compound:** tolerance 0.5 (allows rounding to nearest cent)
  - **Others:** tolerance 0.01

## 8. Registration

1. **Home `allApps` array:** `{ key: 'percent', name: 'Percentages', subtitle: 'Find, increase, reverse, compound', color: 'red' }`
2. **Home `modeMap` object:** `percent: PercentApp`
3. **`CUSTOM_PUZZLES` array:** `{ key: 'percent', name: 'Percentages' }`
4. **`fetchQuestionForType` URL map:** `percent: '${API}/percent-api/question?difficulty=${difficulty}'`
5. **`getPromptForType` switch:** Returns `q.prompt` (pre-built by server)
6. **CustomApp `handleSubmit` switch:** POSTs to `/percent-api/check` with `userAnswer` string
7. **CustomApp `renderInputs` switch:** Text input with placeholder "Type your answer"
8. **Vite proxy:** `/percent-api` → `http://127.0.0.1:4000`

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
- **Easy:** 12 percentages × 13 bases = 156+ unique problems
- **Medium:** 2 operations × 8 percentages × 12 bases = 192+ unique problems
- **Hard:** 2 operations × 7 percentages × 10 originals = 140+ unique problems
- **ExtraHard:** 6 principals × 4 rates × 3 years × 2 operations = 144+ unique problems
