# Quadratic — Formal Specification

## 1. Overview

A single-variable polynomial evaluation puzzle where the player substitutes values into quadratic expressions y = ax² + bx + c. The player selects a difficulty level (Easy, Medium, Hard), configures the question count (default 20), and solves randomly generated problems with step-by-step feedback after each submission. Features an on-screen NumPad, auto-advance after 1.5 seconds on correct answers, and a running results table displayed during and after gameplay.

## 2. Component Specification

**Component:** `QuadraticApp` (located in `/quadratic/QuadraticApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `QuadraticApp.jsx`
- NumPad component: `shared/NumPad.jsx`
- Server: `/quadratic-api/` routes

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `difficulty` | string | 'easy' | Selected difficulty: 'easy', 'medium', or 'hard' |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `question` | object\|null | null | Current question: `{ id, a, b, c, x, prompt, answer }` |
| `answer` | string | '' | Player's current input (numeric string, may be empty or '-') |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question index (0-based in code, 1-based in display) |
| `numQuestions` | string | '20' | User input for total question count |
| `totalQ` | number | 20 | Parsed and validated total question count |
| `feedback` | string | '' | Multi-line feedback message with step-by-step reasoning |
| `isCorrect` | boolean\|null | null | Whether last answer was correct (null before submission) |
| `loading` | boolean | false | True while fetching next question |
| `revealed` | boolean | false | True after answer submitted and checked |
| `results` | array | [] | Array of result objects: `{ question, userAnswer, correctAnswer, correct, time }` |

**Timer:** Uses shared `useTimer()` hook. Starts when question loads. Stops when answer is submitted.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook.

## 4. Difficulty Levels

| Level | Range min | Range max | Coefficient a | Typical Range |
|-------|-----------|-----------|---------------|---------------|
| Easy | -3 | 3 | ±1 to ±3 (nonzero) | -27 to 27 |
| Medium | -6 | 6 | ±1 to ±6 (nonzero) | -216 to 216 |
| Hard | -9 | 9 | ±1 to ±9 (nonzero) | -729 to 729 |

**Constraint:** Coefficient `a` must never be zero; all other coefficients and the x value may be zero.

**Server-side implementation:**
```javascript
function quadraticRange(difficulty) {
  if (difficulty === 'easy') return { min: -3, max: 3 }
  if (difficulty === 'medium') return { min: -6, max: 6 }
  if (difficulty === 'hard') return { min: -9, max: 9 }
  return { min: -3, max: 3 }  // fallback
}
```

All four values (a, b, c, x) are generated independently within the same range, except a is regenerated if it equals zero.

## 5. API Endpoints

### 5.1 GET /quadratic-api/question

**Purpose:** Generate a random quadratic expression evaluation question.

**Query Parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Defaults to 'easy' if missing or invalid.

**Request Example:**
```
GET /quadratic-api/question?difficulty=medium
```

**Response (200):**
```json
{
  "id": "quadratic-1775067701647-0.857",
  "difficulty": "medium",
  "a": 2,
  "b": -5,
  "c": 3,
  "x": -2,
  "prompt": "If x = -2, find y for y = 2x² − 5x + 3",
  "answer": 21
}
```

**Response Fields:**
- `id` (string): Unique question ID (timestamp + random)
- `difficulty` (string): The difficulty level ('easy', 'medium', or 'hard')
- `a` (integer): Coefficient of x² (never zero)
- `b` (integer): Coefficient of x
- `c` (integer): Constant term
- `x` (integer): The value to substitute
- `prompt` (string): Human-readable prompt (for reference, not used by client in final version)
- `answer` (integer): The correct value of y (a*x² + b*x + c)

**Prompt Formatting:**
The `prompt` field uses `formatSignedTerm(value, variable, isFirst)`:
- First term (x²): Shows natural sign (−3x² or 7x²), no operator prefix
- Subsequent terms: Show operator + value (+ 3x, − 4, + 0)
- Zero values: Displayed as "+ 0x" or "+ 0"
- Symbols: `−` (U+2212 minus) and `×` (U+00D7 multiplication) for display clarity

### 5.2 POST /quadratic-api/check

**Purpose:** Validate the player's answer to the quadratic evaluation problem.

**Request Body:**
```json
{
  "a": 2,
  "b": -5,
  "c": 3,
  "x": -2,
  "answer": 21
}
```

**Request Fields:**
- `a` (integer): Coefficient a from the question
- `b` (integer): Coefficient b from the question
- `c` (integer): Coefficient c from the question
- `x` (integer): The substitution value from the question
- `answer` (integer or string): Player's submitted answer for y

**Response (200):**
```json
{
  "correct": true,
  "correctAnswer": 21,
  "message": "Correct"
}
```

**Response Fields:**
- `correct` (boolean): True if answer === a*x² + b*x + c
- `correctAnswer` (integer): The correct value
- `message` (string): Optional feedback

**Validation Logic (Server-side):**
```javascript
const y = a * x * x + b * x + c
const correct = Number(answer) === y
```

The server recomputes the entire result from the provided coefficients and x value; it does not trust any pre-computed client values.

## 6. Server Algorithm

**Question Generation:**
1. Get range from `quadraticRange(difficulty)`
2. Generate `a = randomInt(min, max)`, then if a === 0, regenerate until nonzero
3. Generate `b = randomInt(min, max)`
4. Generate `c = randomInt(min, max)`
5. Generate `x = randomInt(min, max)`
6. Compute `answer = a * x * x + b * x + c`
7. Format prompt using `formatSignedTerm()` helper
8. Return question object

**Coefficient Regeneration for a:**
```javascript
let a = randomInt(min, max)
while (a === 0) {
  a = randomInt(min, max)
}
```

## 7. Answer Validation

**Accepted Format:** Numeric integer

**Validation:**
- Server recomputes: y = a*x² + b*x + c
- Compares: `Number(answer) === y`
- Coerces to Number before comparison

**Tolerance:** Exact match only (no rounding)

**Edge Cases:**
- Negative user input: Accepted, will match if correct
- Non-numeric input: Returns false
- Empty submission: Returns false

## 8. UI Structure

**Setup Phase:**
```
┌────────────────────────────────────┐
│ [← Home]                           │
│            Quadratic                │
│  Evaluate y = ax² + bx + c         │
│                                    │
│  [Easy] [Medium] [Hard]            │
│                                    │
│  How many questions?                │
│  ┌────────────┐                    │
│  │    20      │                    │
│  └────────────┘                    │
│                                    │
│         [Start Quiz]               │
└────────────────────────────────────┘
```

**Playing Phase:**
```
┌────────────────────────────────────┐
│ [← Home]                           │
│            Quadratic                │
│                           [Timer] [Score] │
│                                    │
│        Question 3/20                │
│                                    │
│  Given: x = −2                     │
│                                    │
│  y = 2x² − 5x + 3                  │
│                                    │
│      ┌──────────────┐              │
│      │  y = ?       │              │
│      └──────────────┘              │
│                                    │
│    [± ] [1] [2] [3]               │
│    [⌫ ] [4] [5] [6]               │
│    [   ] [7] [8] [9]              │
│    [       0       ]               │
│                                    │
│       [Submit]  [Clear]            │
│                                    │
│ [Correct!                          │
│  y = 2(−2)² − 5(−2) + 3           │
│  = 2(4) + 10 + 3                   │
│  = 8 + 10 + 3                      │
│  = 21]                             │
│   (auto-advancing in 1.5s...)      │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Eq  │ Ans │ ✓/✗│ t   │   ││
│  │ 1 │x² + x−2,x=−2│ 0 │ ✓ │1.8s│ ││
│  │ 2 │3x²−x+1,x=0 │ 1 │ ✓ │2.1s│ ││
│  └─────────────────────────────┘│
└────────────────────────────────────┘
```

**Finished Phase:**
```
┌────────────────────────────────────┐
│        Quiz complete.               │
│     Final score: 19/20              │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Eq  │ Ans │ ✓/✗│ t   │   ││
│  │...│...  │... │ ...│ ...s│   ││
│  │20 │−x² + 1,x=3  │ −8 │ ✓ │2.3s│ ││
│  └─────────────────────────────┘│
│                                    │
│  Total: 41s  ·  Avg: 2.1s          │
│                                    │
│          [Play Again]              │
└────────────────────────────────────┘
```

## 9. Keyboard Shortcuts

| Key | Action | Condition |
|-----|--------|-----------|
| `0–9` | Append digit to input | Before answer revealed |
| `−` or `-` | Toggle sign (append or remove leading minus) | Before answer revealed |
| `Backspace` or `⌫` | Delete last character | Before answer revealed |
| `Enter` | Submit answer (if not revealed) OR go to next question (if revealed) | Always when started |

## 10. Auto-Advance Behavior

**Trigger:** After correct answer revealed (`revealed === true` AND `isCorrect === true`)

**Timing:** 1.5 seconds (constant `AUTO_ADVANCE_MS = 1500`)

**Action:** Increments `questionNumber`, resets input/feedback/revealed, calls `fetchQuestion(difficulty)`

**Skip:** Pressing Enter before auto-advance completes immediately triggers advance

**Wrong Answers:** Do not auto-advance; must click Next or press Enter

## 11. Step-by-Step Feedback

**Generated entirely client-side after receiving `data.correctAnswer`:**

```javascript
const { a, b, c, x } = question
const xSq = x * x              // x²
const termA = a * xSq          // a·x²
const termB = b * x            // b·x
const sign = (v) => v >= 0 ? `+ ${v}` : `− ${Math.abs(v)}`

const reasoning = [
  `y = ${a}(${x})² ${sign(b)}(${x}) ${sign(c)}`,
  `= ${a}(${xSq}) ${sign(termB)} ${sign(c)}`,
  `= ${termA} ${sign(termB)} ${sign(c)}`,
  `= ${data.correctAnswer}`
].join('\n')
```

**Example (a=2, b=−5, c=3, x=−2, correct answer=21):**
```
Correct!
y = 2(−2)² − 5(−2) + 3
= 2(4) + 10 + 3
= 8 + 10 + 3
= 21
```

**Incorrect example:**
```
Incorrect.
y = 2(−2)² − 5(−2) + 3
= 2(4) + 10 + 3
= 8 + 10 + 3
= 21
```

**Rendering:** Feedback div uses `white-space: pre-line` to display newlines.

## 12. Question Display

**Two-line format (NOT using server's `prompt`):**

```jsx
<span className="given">x = {question.x}</span>
<span className="equation">
  y = {formatCoeff(question.a)}x² {formatSign(question.b)} {formatCoeff(Math.abs(question.b))}x {formatSign(question.c)} {Math.abs(question.c)}
</span>
```

**Coefficient formatting rules:**
- Coefficient = 1: Omit the 1 (show just "x²", not "1x²")
- Coefficient = −1: Show "−x²" (not "−1x²")
- Other values: Show the number (e.g., "2x²", "−3x")
- Signs between terms: "+" for positive, "−" for negative
- Symbols: Use "×" (U+00D7) for multiplication if shown, "−" (U+2212) for minus

## 13. Results Record

```javascript
{
  question: `y = ${a}x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}, x=${x}`,
  userAnswer: answer,
  correctAnswer: data.correctAnswer,
  correct: data.correct,
  time: timeTaken
}
```

## 14. CSS Classes & Styling

| Class | Purpose |
|-------|---------|
| `.quiz-container` | Main wrapper |
| `.difficulty-selector` | Radio pill group |
| `.radio-pill` | Individual difficulty button |
| `.radio-pill.active` | Selected difficulty |
| `.question-display` | Question text area |
| `.given` | "x = N" line |
| `.equation` | "y = ax² + bx + c" line |
| `.input-field` | Text input for answer |
| `.numpad` | NumPad grid container |
| `.numpad-key` | Individual NumPad button |
| `.numpad-key.accent` | Accent buttons (±, ⌫) |
| `.feedback-box` | Feedback message container |
| `.feedback-box.correct` | Correct answer styling (green) |
| `.feedback-box.incorrect` | Incorrect answer styling (red) |
| `.results-table` | Results display table |
| `.timer-display` | Timer counter |
| `.score-display` | Score counter |

**Fonts:** DM Sans (body/UI), Source Serif 4 (headings)

## 15. NumPad Component

**Layout:**
```
[±] [1] [2] [3]
[⌫] [4] [5] [6]
[ ] [7] [8] [9]
[       0      ]
```

**Behavior:**
- `±`: Toggle sign of current answer
- Digits 0–9: Append digit
- `⌫`: Delete last character
- Disabled when answer revealed

## 16. Implementation Notes

- **Difficulty lock:** Selector disabled once quiz starts (`disabled={started && !finished}`)
- **Input type:** `type="text"` (not "number") to support NumPad and minus sign
- **Input placeholder:** "y = ?" (mathematical context)
- **Coefficient constraint:** `a` guaranteed nonzero by server `while (a === 0)` loop
- **Results reset:** Array cleared on "Play Again"
- **Question numbering:** Internally 0-based, displayed as 1-based
- **Config:** `DEFAULT_TOTAL = 20` shared across all quiz apps
- **Fonts:** Google Fonts — DM Sans (body/UI) and Source Serif 4 (headings)
