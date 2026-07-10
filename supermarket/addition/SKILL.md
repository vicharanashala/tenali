# Addition — Formal Specification

## 1. Overview

An arithmetic puzzle focusing on addition of positive integers. The player selects a difficulty level (1-digit, 2-digit, or 3-digit), configures the question count (default 20), and solves randomly generated addition problems. Features an on-screen NumPad, auto-advance after 1.5 seconds on correct answers, and a running results table displayed during and after gameplay.

## 2. Component Specification

**Component:** `AdditionApp` (located in `/addition/AdditionApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `AdditionApp.jsx`
- NumPad component: `shared/NumPad.jsx`
- Server: `/addition-api/` routes

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `digits` | number | 1 | Selected difficulty: 1 (ones), 2 (tens), or 3 (hundreds) |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `question` | object\|null | null | Current question: `{ id, digits, a, b, prompt, answer }` |
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

### 4.1 GET /addition-api/question

**Purpose:** Generate a random addition question at the specified difficulty level.

**Query Parameters:**
- `digits` (integer, optional): 1, 2, or 3. Defaults to 1 if missing or invalid.

**Request Example:**
```
GET /addition-api/question?digits=2
```

**Response (200):**
```json
{
  "id": "2-1775067701647-0.857",
  "digits": 2,
  "a": 47,
  "b": 83,
  "prompt": "47 + 83",
  "answer": 130
}
```

**Response Fields:**
- `id` (string): Unique question ID (timestamp + random)
- `digits` (integer): The difficulty level (1, 2, or 3)
- `a` (integer): First operand in range [min, max] for the difficulty
- `b` (integer): Second operand in range [min, max] for the difficulty
- `prompt` (string): Display string (e.g., "47 + 83")
- `answer` (integer): The correct sum (a + b)

### 4.2 POST /addition-api/check

**Purpose:** Validate the player's answer.

**Request Body:**
```json
{
  "a": 47,
  "b": 83,
  "answer": 130
}
```

**Request Fields:**
- `a` (integer): First operand from the question
- `b` (integer): Second operand from the question
- `answer` (integer or string): Player's submitted answer

**Response (200):**
```json
{
  "correct": true,
  "correctAnswer": 130,
  "message": "Correct"
}
```

**Response Fields:**
- `correct` (boolean): True if answer === a + b
- `correctAnswer` (integer): The correct sum
- `message` (string): Optional message

**Validation Logic (Server-side):**
```javascript
const serverSum = Number(a) + Number(b)
const correct = Number(answer) === serverSum
```

## 5. Server Algorithm

**Difficulty Mapping:**

| Difficulty | `digits` param | Min | Max | Example Range |
|-----------|-----------------|-----|-----|----------------|
| One digit | 1 | 0 | 9 | 0–9 |
| Two digits | 2 | 10 | 99 | 10–99 |
| Three digits | 3 | 100 | 999 | 100–999 |

**Range Calculation Function:**
```javascript
function digitRange(digits) {
  if (digits === 1) return { min: 0, max: 9 }
  if (digits === 2) return { min: 10, max: 99 }
  if (digits === 3) return { min: 100, max: 999 }
  return { min: 0, max: 9 }  // fallback
}
```

**Question Generation:**
1. Get difficulty range from `digitRange(digits)`
2. Generate `a = randomInt(min, max)`
3. Generate `b = randomInt(min, max)` independently
4. Compute `answer = a + b`
5. Format `prompt = "${a} + ${b}"`
6. Return with unique ID

**Randomization:** Uniform random integers within the specified range, independent generation of both operands.

## 6. Answer Validation

**Accepted Format:** Numeric integer (may be parsed from string)

**Validation:**
- Server recomputes: `a + b`
- Compares client-submitted answer via: `Number(answer) === a + b`
- Coerces both to Number type before comparison

**Tolerance:** Exact match only (no rounding)

**Edge Cases:**
- Negative user input: Accepted but will not match (sum is always positive)
- Leading zeros: "0047" treated as 47
- Non-numeric input: Returns false (fails validation)
- Empty submission: Returns false

## 7. UI Structure

**Setup Phase:**
```
┌────────────────────────────────────┐
│ [← Home]                           │
│             Addition                │
│  Choose a level and solve           │
│      addition questions             │
│                                    │
│  [One digit] [Two digits] [Three digits] │
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
│             Addition                │
│                           [Timer] [Score] │
│                                    │
│        Question 7/20                │
│         47 + 83 = ?                 │
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
│ [Correct! 47 + 83 = 130]           │
│   (auto-advancing in 1.5s...)      │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Q  │ Ans │ ✓/✗│ t   │     ││
│  │ 1 │ 3+7 │ 10  │ ✓  │ 2.3s│     ││
│  │ 2 │12+8 │ 20  │ ✓  │ 1.8s│     ││
│  └─────────────────────────────┘│
└────────────────────────────────────┘
```

**Finished Phase:**
```
┌────────────────────────────────────┐
│        Quiz complete.               │
│     Final score: 17/20              │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Q  │ Ans │ ✓/✗│ t   │     ││
│  │ 1 │ 3+7 │ 10  │ ✓  │ 2.3s│     ││
│  │...│...  │... │ ...│ ...s│     ││
│  │20 │88+12│ 100 │ ✗(90)│ 5.1s│     ││
│  └─────────────────────────────┘│
│                                    │
│  Total: 63s  ·  Avg: 3.2s          │
│                                    │
│          [Play Again]              │
└────────────────────────────────────┘
```

**Feedback Messages:**
- Correct: `"Correct! 47 + 83 = 130"`
- Incorrect: `"Incorrect. 47 + 83 = 130"`

## 8. Keyboard Shortcuts

| Key | Action | Condition |
|-----|--------|-----------|
| `0–9` | Append digit to input | Before answer revealed |
| `−` or `-` | Toggle sign (append or remove leading minus) | Before answer revealed |
| `Backspace` or `⌫` | Delete last character | Before answer revealed |
| `Enter` | Submit answer (if not revealed) OR go to next question (if revealed) | Always when started |

**Implementation:**
- Physical keyboard: onChange handler for input, keydown listener for Enter
- NumPad: onClick handlers call `handleNumPad(key)`
- Input validation: Regex `/^-?\d+$/` allows optional leading minus + digits

## 9. Auto-Advance Behavior

**Trigger:** After correct answer revealed (`revealed === true` AND `isCorrect === true`)

**Timing:** 1.5 seconds (constant `AUTO_ADVANCE_MS = 1500`)

**Action:** Calls internal advance function which increments `questionNumber`, resets answer/feedback/revealed states, and calls `fetchQuestion(digits)`

**Skip:** Pressing Enter or clicking Next before auto-advance completes immediately triggers advance

**Wrong Answers:** Do not auto-advance; must click Next or press Enter

**Implementation:**
```javascript
const advanceRef = useRef(() => {})
advanceRef.current = () => {
  setQuestionNumber(prev => prev + 1)
  setAnswer('')
  setFeedback('')
  setRevealed(false)
  fetchQuestion(digits)
}
useAutoAdvance(revealed, advanceRef, isCorrect)
```

## 10. NumPad Component

**Layout:**
```
[±] [1] [2] [3]
[⌫] [4] [5] [6]
[ ] [7] [8] [9]
[       0      ]
```

**Behavior:**
- `±`: If answer is empty or '-', set to '-' (or clear if already '-'). If answer has digits, prepend '-' or remove it.
- Digits 0–9: Append to current answer
- `⌫`: Delete last character (slice off one char)
- Disabled when answer is revealed (`revealed === true`)

**Key Handler:**
```javascript
const handleNumPad = (key) => {
  if (revealed) return
  if (key === '±') {
    setAnswer(prev => {
      if (!prev || prev === '-') return prev === '-' ? '' : '-'
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev
    })
  } else if (key === '⌫') {
    setAnswer(prev => prev.slice(0, -1))
  } else {
    setAnswer(prev => prev + key)
  }
}
```

## 11. CSS Classes & Styling

| Class | Purpose |
|-------|---------|
| `.quiz-container` | Main wrapper |
| `.difficulty-selector` | Radio pill group for 1/2/3 digit selection |
| `.radio-pill` | Individual difficulty button |
| `.radio-pill.active` | Selected difficulty |
| `.question-display` | Question text area |
| `.input-field` | Text input for answer |
| `.numpad` | NumPad grid container |
| `.numpad-key` | Individual NumPad button |
| `.numpad-key.accent` | Accent buttons (±, ⌫) |
| `.feedback-box` | Feedback message container |
| `.feedback-box.correct` | Correct answer styling |
| `.feedback-box.incorrect` | Incorrect answer styling |
| `.results-table` | Results display table |
| `.timer-display` | Timer counter |
| `.score-display` | Score counter |

**Fonts:** DM Sans (body/UI), Source Serif 4 (headings)

## 12. Implementation Notes

- **Question count:** Input parsed as integer; if invalid, defaults to 20
- **Difficulty lock:** Selector disabled once quiz starts (`disabled={started && !finished}`)
- **Input type:** `type="text"` (not "number") to support NumPad and minus sign on all devices
- **Answer field:** Included in GET response but not used for validation; server recomputes
- **Results reset:** Array cleared on "Play Again" click
- **Question numbering:** Internally 0-based, displayed as 1-based (display: `questionNumber + 1` / `totalQ`)
- **Config:** `DEFAULT_TOTAL = 20` is shared constant across all quiz apps
