# Multiplication Tables — Formal Specification

## 1. Overview

A configurable multiplication tables drill where the player selects which times tables to practice (2–9 via checkboxes), configures the question count (default 20), and solves client-side generated multiplication problems shuffled from the selected tables. Questions are of the form n × m where n is the selected table and m ranges from 1 to 10. Features an on-screen NumPad, auto-advance after 1.5 seconds on correct answers, and a running results table displayed during and after gameplay.

## 2. Component Specification

**Component:** `MultiplyApp` (located in `/multiply/MultiplyApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `MultiplyApp.jsx`
- NumPad component: `shared/NumPad.jsx`
- Server: `/multiply-api/` routes (optional fallback only)

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `tables` | Set | new Set([2]) | Selected table numbers (2–9) |
| `numQuestions` | string | '20' | User input for total question count |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `pool` | array | [] | Shuffled array of `{ table, multiplier }` objects |
| `poolIndex` | number | 0 | Current index in the pool (0-based) |
| `answer` | string | '' | Player's current input (numeric string) |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question index (0-based in code, 1-based in display) |
| `totalQuestions` | number | 20 | Total questions for this session |
| `feedback` | string | '' | Feedback message displayed after submission |
| `isCorrect` | boolean\|null | null | Whether last answer was correct (null before submission) |
| `revealed` | boolean | false | True after answer submitted and checked |
| `results` | array | [] | Array of result objects: `{ question, userAnswer, correctAnswer, correct, time }` |

**Timer:** Uses shared `useTimer()` hook. Starts when question loads. Stops when answer is submitted.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook.

## 4. Question Generation (Client-Side)

**All questions are generated client-side; no server API is used for initial generation.**

**Algorithm:**
1. Iterate over each selected table `t` (from `tables` Set)
2. For each table, generate 10 pairs: `(t, 1), (t, 2), ..., (t, 10)`
3. Collect all pairs into a single pool
4. Shuffle pool using Fisher-Yates algorithm
5. Slice pool to `min(totalQuestions, pool.length)` questions
6. Store in `pool` state

**Pool Size:**
- Maximum questions per table: 10 (multipliers 1–10)
- If 3 tables selected: maximum 30 questions available
- If user requests 50 questions but only 30 are available, use all 30

**Question Format:**
Each question object: `{ table: 5, multiplier: 7, prompt: "5 × 7", answer: 35 }`

**Fisher-Yates Shuffle:**
```javascript
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```

## 5. API Endpoints (Fallback Only)

**Note:** These endpoints exist for compatibility but are NOT used during normal operation. All questions are generated client-side.

### 5.1 GET /multiply-api/question

**Purpose:** Fallback endpoint (not typically used).

**Query Parameters:**
- `table` (integer, optional): Specific table number

**Response (200):**
```json
{
  "id": "5-1775067701647-0.857",
  "table": 5,
  "multiplier": 7,
  "prompt": "5 × 7",
  "answer": 35
}
```

### 5.2 POST /multiply-api/check

**Purpose:** Validate multiplication answer.

**Request Body:**
```json
{
  "table": 5,
  "multiplier": 7,
  "answer": 35
}
```

**Response (200):**
```json
{
  "correct": true,
  "correctAnswer": 35,
  "message": "Correct"
}
```

**Validation Logic (Server-side):**
```javascript
const correct = Number(answer) === table * multiplier
```

## 6. Answer Validation (Client-Side)

**Validation performed immediately upon submission (no server round-trip needed):**

```javascript
const correct = Number(userAnswer) === question.table * question.multiplier
```

**Accepted Format:** Numeric integer

**Tolerance:** Exact match only

**Edge Cases:**
- Negative input: Accepted but will not match (product is always positive)
- Non-numeric input: Returns false
- Empty submission: Returns false

## 7. UI Structure

**Setup Phase:**
```
┌────────────────────────────────────┐
│ [← Home]                           │
│         Multiplication              │
│  Practice any times table           │
│                                    │
│  Table selection:                   │
│  [2] [3] [4] [5] [6] [7] [8] [9]   │
│  (checkboxes, default: 2 selected) │
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
│         Multiplication              │
│                           [Timer] [Score] │
│                                    │
│        Question 3/20                │
│         5 × 7 = ?                   │
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
│ [Correct! 5 × 7 = 35]             │
│   (auto-advancing in 1.5s...)      │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Q  │ Ans │ ✓/✗│ t   │     ││
│  │ 1 │ 2×1 │  2  │ ✓  │ 1.2s│     ││
│  │ 2 │ 5×3 │ 15  │ ✓  │ 1.8s│     ││
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
│  │20 │ 9×9 │ 81  │ ✓  │ 2.1s│     ││
│  └─────────────────────────────┘│
│                                    │
│  Total: 36s  ·  Avg: 1.8s          │
│                                    │
│          [Play Again]              │
└────────────────────────────────────┘
```

## 8. Keyboard Shortcuts

| Key | Action | Condition |
|-----|--------|-----------|
| `0–9` | Append digit to input | Before answer revealed |
| `−` or `-` | Toggle sign (append or remove leading minus) | Before answer revealed |
| `Backspace` or `⌫` | Delete last character | Before answer revealed |
| `Enter` | Submit answer (if not revealed) OR go to next question (if revealed) | Always when started |

## 9. Auto-Advance Behavior

**Trigger:** After correct answer revealed (`revealed === true` AND `isCorrect === true`)

**Timing:** 1.5 seconds (constant `AUTO_ADVANCE_MS = 1500`)

**Action:** Increments `poolIndex`, resets input/feedback/revealed, checks if finished

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
- `±`: Toggle sign (not needed for multiplication, but included for consistency)
- Digits 0–9: Append digit to answer
- `⌫`: Delete last character
- Disabled when answer revealed

## 11. CSS Classes & Styling

| Class | Purpose |
|-------|---------|
| `.quiz-container` | Main wrapper |
| `.table-selector` | Checkbox group for table selection |
| `.table-checkbox` | Individual checkbox |
| `.table-checkbox.selected` | Checked checkbox |
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

**Fonts:** DM Sans (body/UI), Source Serif 4 (headings)

## 12. Results Record

```javascript
{
  question: `${question.table} × ${question.multiplier}`,  // e.g., "5 × 7"
  userAnswer: answer,                                       // e.g., "35"
  correctAnswer: String(question.table * question.multiplier),  // e.g., "35"
  correct: isCorrect,                                       // true/false
  time: timeTaken                                           // seconds
}
```

## 13. Implementation Notes

- **Table selection:** Checkboxes for tables 2–9; default table 2 selected
- **Pool generation:** Always uses Fisher-Yates shuffle before each quiz start
- **Client-side validation:** Answer is checked immediately without server round-trip
- **Questions limit:** If user requests more questions than available, use all available
- **Input type:** `type="text"` (not "number") to support NumPad
- **Results reset:** Array cleared on "Play Again"
- **Question numbering:** Internally 0-based, displayed as 1-based
- **Config:** `DEFAULT_TOTAL = 20` shared across all quiz apps
- **Fonts:** Google Fonts — DM Sans (body/UI) and Source Serif 4 (headings)
- **No server dependency:** Full client-side generation and validation means instant feedback, no latency
