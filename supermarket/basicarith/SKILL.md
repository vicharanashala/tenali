# Basic Arithmetic — Formal Specification

## 1. Overview

A mixed arithmetic puzzle supporting addition, subtraction, and multiplication with both positive and negative numbers. The player selects a difficulty level (1-digit, 2-digit, or 3-digit), configures the question count (default 20), and solves randomly generated problems with random operation selection. Each operand has a 40% chance of negation. Features an on-screen NumPad, auto-advance after 1.5 seconds on correct answers, and a running results table displayed during and after gameplay.

## 2. Component Specification

**Component:** `BasicArithApp` (located in `/basicarith/BasicArithApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `BasicArithApp.jsx`
- NumPad component: `shared/NumPad.jsx`
- Server: `/basicarith-api/` routes

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `difficulty` | string | 'easy' | Selected difficulty: 'easy', 'medium', or 'hard' |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `question` | object\|null | null | Current question: `{ id, a, b, op, prompt, answer }` |
| `answer` | string | '' | Player's current input (numeric string, may be empty or '-') |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question index (0-based in code, 1-based in display) |
| `numQuestions` | string | '20' | User input for total question count |
| `totalQ` | number | 20 | Parsed and validated total question count |
| `feedback` | string | '' | Feedback message displayed after submission |
| `isCorrect` | boolean\|null | null | Whether last answer was correct (null before submission) |
| `loading` | boolean | false | True while fetching next question |
| `revealed` | boolean | false | True after answer submitted and checked |
| `results` | array | [] | Array of result objects: `{ question, userAnswer, correctAnswer, correct, time }` |

**Timer:** Uses shared `useTimer()` hook. Starts when question loads. Stops when answer is submitted.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook.

## 4. API Endpoints

### 4.1 GET /basicarith-api/question

**Purpose:** Generate a random arithmetic question at the specified difficulty level with a random operation.

**Query Parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Defaults to 'easy' if missing or invalid.

**Request Example:**
```
GET /basicarith-api/question?difficulty=medium
```

**Response (200):**
```json
{
  "id": "arith-1775067701647-0.857",
  "difficulty": "medium",
  "a": -45,
  "b": 32,
  "op": "+",
  "prompt": "(−45) + 32",
  "answer": -13
}
```

**Response Fields:**
- `id` (string): Unique question ID (timestamp + random)
- `difficulty` (string): The difficulty level ('easy', 'medium', or 'hard')
- `a` (integer): First operand, may be negative
- `b` (integer): Second operand, may be negative
- `op` (string): Operation: '+', '−' (U+2212 minus sign), or '×' (U+00D7 multiplication sign)
- `prompt` (string): Display string with readable formatting and parentheses for negative numbers (e.g., "(−45) + 32" or "67 − (−12)")
- `answer` (integer): The correct result

### 4.2 POST /basicarith-api/check

**Purpose:** Validate the player's answer.

**Request Body:**
```json
{
  "a": -45,
  "b": 32,
  "op": "+",
  "answer": -13
}
```

**Request Fields:**
- `a` (integer): First operand from the question
- `b` (integer): Second operand from the question
- `op` (string): Operation from the question ('+', '−', or '×')
- `answer` (integer or string): Player's submitted answer

**Response (200):**
```json
{
  "correct": true,
  "correctAnswer": -13,
  "message": "Correct"
}
```

**Response Fields:**
- `correct` (boolean): True if the answer matches the correct result
- `correctAnswer` (integer): The correct result
- `message` (string): Optional message

**Validation Logic (Server-side):**
```javascript
let correctResult
if (op === '+') correctResult = a + b
else if (op === '−') correctResult = a - b
else if (op === '×') correctResult = a * b
const correct = Number(answer) === correctResult
```

## 5. Server Algorithm

**Difficulty Mapping:**

| Difficulty | Magnitude Range | Example | Range with Negation |
|-----------|-----------------|---------|-------------------|
| Easy | 1–9 | 7, -3 | -9 to 9 |
| Medium | 10–99 | 45, -67 | -99 to 99 |
| Hard | 100–999 | 345, -501 | -999 to 999 |

**Range Calculation Function:**
```javascript
function arithRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 9 }
  if (difficulty === 'medium') return { min: 10, max: 99 }
  if (difficulty === 'hard') return { min: 100, max: 999 }
  return { min: 1, max: 9 }  // fallback
}
```

**Question Generation:**
1. Get range from `arithRange(difficulty)`
2. Generate base `a_base = randomInt(min, max)`, then with 40% chance negate it
3. Generate base `b_base = randomInt(min, max)`, then with 40% chance negate it
4. Choose operation uniformly: `op = ['+'  '−', '×'][randomInt(0, 2)]`
5. Compute correct answer based on operation:
   - `+`: answer = a + b
   - `−`: answer = a - b
   - `×`: answer = a * b
6. Format prompt with readable parentheses for negative operands
7. Return question object

**Negation Logic:**
```javascript
const maybeNegate = (n) => Math.random() < 0.4 ? -n : n
const a = maybeNegate(randomInt(min, max))
const b = maybeNegate(randomInt(min, max))
```

**Prompt Formatting:**
- For negation and parentheses: If operand is negative, wrap in parentheses: "(−45)"
- For operation symbols:
  - Addition: `+`
  - Subtraction: `−` (U+2212, minus sign, not hyphen)
  - Multiplication: `×` (U+00D7, multiplication sign)
- Example prompts:
  - `"−7 + 6"` (first operand negative, no parens; positive second operand)
  - `"(−45) + 32"` (both operands shown with clarity)
  - `"67 − (−12)"` (subtraction of negative)
  - `"(−5) × (−3)"` (multiplication, both negative)

## 6. Answer Validation

**Accepted Format:** Numeric integer (may be parsed from string)

**Validation:**
- Server recomputes result based on operator
- Compares: `Number(answer) === result`
- Coerces both to Number before comparison

**Tolerance:** Exact match only (no rounding)

**Edge Cases:**
- Negative user input: Accepted, will match if correct
- Leading zeros: "0047" treated as 47, "-0013" treated as -13
- Non-numeric input: Returns false
- Empty submission: Returns false
- Spaces: Not trimmed; "- 13" does not parse correctly

## 7. UI Structure

**Setup Phase:**
```
┌────────────────────────────────────┐
│ [← Home]                           │
│         Basic Arithmetic            │
│  Practice +, −, × with             │
│    positive and negative numbers    │
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
│         Basic Arithmetic            │
│                           [Timer] [Score] │
│                                    │
│        Question 7/20                │
│        (−45) + 32 = ?              │
│                                    │
│      ┌──────────────┐              │
│      │  Type answer │              │
│      └──────────────┘              │
│                                    │
│    [± ] [1] [2] [3]               │
│    [⌫ ] [4] [5] [6]               │
│    [   ] [7] [8] [9]              │
│    [       0       ]               │
│                                    │
│       [Submit]  [Clear]            │
│                                    │
│ [Correct! (−45) + 32 = −13]        │
│   (auto-advancing in 1.5s...)      │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Q  │ Ans │ ✓/✗│ t   │     ││
│  │ 1 │7+6  │ 13  │ ✓  │ 1.9s│     ││
│  │ 2 │−5×3 │ −15 │ ✓  │ 2.4s│     ││
│  └─────────────────────────────┘│
└────────────────────────────────────┘
```

**Finished Phase:**
```
┌────────────────────────────────────┐
│        Quiz complete.               │
│     Final score: 18/20              │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Q  │ Ans │ ✓/✗│ t   │     ││
│  │...│...  │... │ ...│ ...s│     ││
│  │20 │−23−17│−40│ ✓  │ 3.5s│     ││
│  └─────────────────────────────┘│
│                                    │
│  Total: 48s  ·  Avg: 2.4s          │
│                                    │
│          [Play Again]              │
└────────────────────────────────────┘
```

**Feedback Messages:**
- Correct: `"Correct! (−45) + 32 = −13"`
- Incorrect: `"Incorrect. (−45) + 32 = −13"`

## 8. Keyboard Shortcuts

| Key | Action | Condition |
|-----|--------|-----------|
| `0–9` | Append digit to input | Before answer revealed |
| `−` or `-` | Toggle sign (append or remove leading minus) | Before answer revealed |
| `Backspace` or `⌫` | Delete last character | Before answer revealed |
| `Enter` | Submit answer (if not revealed) OR go to next question (if revealed) | Always when started |

**Global keydown listener:** Active on entire page during quiz; captures numeric and Enter keys without requiring input focus.

**Implementation:**
- Physical keyboard: keydown listener for all keys; input onChange for text entry validation
- NumPad: onClick handlers call `handleNumPad(key)`
- Input validation: Regex `/^-?\d+$/` allows optional leading minus + digits

## 9. Auto-Advance Behavior

**Trigger:** After correct answer revealed (`revealed === true` AND `isCorrect === true`)

**Timing:** 1.5 seconds (constant `AUTO_ADVANCE_MS = 1500`)

**Action:** Calls internal advance function which increments `questionNumber`, resets answer/feedback/revealed states, and calls `fetchQuestion(difficulty)`

**Skip:** Pressing Enter before auto-advance completes immediately triggers advance

**Wrong Answers:** Do not auto-advance; must click Next or press Enter

## 10. NumPad Component

**Layout:**
```
[±] [1] [2] [3]
[⌫] [4] [5] [6]
[ ] [7] [8] [9]
[       0      ]
```

**Behavior:**
- `±`: Toggle sign of current answer (prepend or remove leading `-`)
- Digits 0–9: Append digit to answer
- `⌫`: Delete last character
- Disabled when answer revealed

## 11. CSS Classes & Styling

| Class | Purpose |
|-------|---------|
| `.quiz-container` | Main wrapper |
| `.difficulty-selector` | Radio pill group for Easy/Medium/Hard |
| `.radio-pill` | Individual difficulty button |
| `.radio-pill.active` | Selected difficulty |
| `.question-display` | Question text area |
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

**Operation Symbols in Display:**
- Addition: `+` (U+002B)
- Subtraction: `−` (U+2212 minus sign, not `-` hyphen)
- Multiplication: `×` (U+00D7)

**Fonts:** DM Sans (body/UI), Source Serif 4 (headings)

## 12. Implementation Notes

- **Difficulty lock:** Selector disabled once quiz starts (`disabled={started && !finished}`)
- **Input type:** `type="text"` (not "number") to support NumPad and minus sign on all devices
- **Global keyboard:** keydown listener works without input focus for digit entry
- **Negative handling:** Input allows leading `-`; validation checks `/^-?\d+$/`
- **Operation symbols:** Server sends '−' (U+2212) and '×' (U+00D7) in prompts and op field
- **Results reset:** Array cleared on "Play Again" click
- **Question numbering:** Internally 0-based, displayed as 1-based (display: `questionNumber + 1` / `totalQ`)
- **Negation chance:** Each operand independently has 40% chance of negation; this creates variety
- **Config:** `DEFAULT_TOTAL = 20` is shared constant across all quiz apps
