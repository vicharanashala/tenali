# Square Root — Formal Specification

## 1. Overview

A progressive square root estimation drill where the player estimates the integer square root of random numbers. Both floor and ceiling of the true square root are accepted as correct answers. Difficulty increases automatically based on the question number across 5 progressive bands (steps 1–10, 11–20, 21–35, 36–60, 61+), with optional configurable question limit (default unlimited). Features an on-screen NumPad, auto-advance after 1.5 seconds on correct answers, and a running results table displayed during gameplay.

## 2. Component Specification

**Component:** `SqrtApp` (located in `/sqrt/SqrtApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `SqrtApp.jsx`
- NumPad component: `shared/NumPad.jsx`
- Server: `/sqrt-api/` routes

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `numQuestions` | string | '' | Optional question limit (empty = unlimited) |
| `started` | boolean | false | True after drill start button clicked |
| `finished` | boolean | false | True when limit reached or user exits |
| `question` | object\|null | null | Current question: `{ id, q, step, prompt, floorAnswer, ceilAnswer, sqrtRounded }` |
| `answer` | string | '' | Player's current input (numeric string) |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question count (0-based in code, 1-based in display) |
| `totalQ` | number | Infinity | Total questions (Infinity if no limit) |
| `feedback` | string | '' | Multi-line feedback message |
| `isCorrect` | boolean\|null | null | Whether last answer was correct |
| `loading` | boolean | false | True while fetching question |
| `revealed` | boolean | false | True after answer submitted and checked |
| `results` | array | [] | Array of result objects: `{ question, userAnswer, correctAnswer, correct, time }` |

**Timer:** Uses shared `useTimer()` hook. Starts when question loads. Stops when answer is submitted.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook.

## 4. Progressive Difficulty Bands

Difficulty scales automatically based on the question number (`step`):

| Step Range | Number Range (q) | Approx √ Range | Example |
|-----------|-----------------|-----------------|---------|
| 1–10 | 2 to 50 | 1.4 to 7.1 | √47 ≈ 6.9 |
| 11–20 | 51 to 150 | 7.1 to 12.2 | √137 ≈ 11.7 |
| 21–35 | 151 to 350 | 12.3 to 18.7 | √280 ≈ 16.7 |
| 36–60 | 351 to 700 | 18.7 to 26.5 | √625 = 25 |
| 61+ | 701 to 999 | 26.5 to 31.6 | √950 ≈ 30.8 |

**Server-side implementation:**
```javascript
function bandForStep(step) {
  if (step <= 10) return { min: 2, max: 50 }
  if (step <= 20) return { min: 51, max: 150 }
  if (step <= 35) return { min: 151, max: 350 }
  if (step <= 60) return { min: 351, max: 700 }
  return { min: 701, max: 999 }
}
```

The number `q` is generated using `randomInt(band.min, band.max)`.

## 5. API Endpoints

### 5.1 GET /sqrt-api/question

**Purpose:** Generate a random number in the difficulty band determined by the step, and return its square root information.

**Query Parameters:**
- `step` (integer, optional): Question number (1-based), determines difficulty band. Default: 1. Minimum: 1.

**Request Example:**
```
GET /sqrt-api/question?step=5
```

**Response (200):**
```json
{
  "id": "sqrt-1775067701647-0.857",
  "step": 5,
  "q": 47,
  "prompt": "√47",
  "floorAnswer": 6,
  "ceilAnswer": 7,
  "sqrtRounded": "6.86"
}
```

**Response Fields:**
- `id` (string): Unique question ID (timestamp + random)
- `step` (integer): The step number passed in
- `q` (integer): The number to find the square root of
- `prompt` (string): Display string (e.g., "√47")
- `floorAnswer` (integer): Floor of √q
- `ceilAnswer` (integer): Ceiling of √q
- `sqrtRounded` (string): √q.toFixed(2) — 2 decimal places

**Notes:**
- Both floor and ceiling are returned for client-side feedback
- Server computes floor and ceiling from the true square root

### 5.2 POST /sqrt-api/check

**Purpose:** Validate the player's answer (accepts either floor or ceiling).

**Request Body:**
```json
{
  "q": 47,
  "answer": 7
}
```

**Request Fields:**
- `q` (integer): The number from the question
- `answer` (integer or string): Player's submitted answer

**Response (200):**
```json
{
  "correct": true,
  "floorAnswer": 6,
  "ceilAnswer": 7,
  "sqrtRounded": "6.86",
  "message": "Correct"
}
```

**Response Fields:**
- `correct` (boolean): True if answer === floorAnswer or answer === ceilAnswer
- `floorAnswer` (integer): Floor of √q
- `ceilAnswer` (integer): Ceiling of √q
- `sqrtRounded` (string): √q formatted to 2 decimal places
- `message` (string): Optional feedback

**Validation Logic (Server-side):**
```javascript
const sqrt = Math.sqrt(Number(q))
const floorAnswer = Math.floor(sqrt)
const ceilAnswer = Math.ceil(sqrt)
const correct = (Number(answer) === floorAnswer) || (Number(answer) === ceilAnswer)
```

**Examples:**
- √47 ≈ 6.856 → accept 6 or 7 → correct
- √49 = 7.000 → accept 7 only (floor === ceiling) → correct
- √2 ≈ 1.414 → accept 1 or 2 → correct

## 6. Frontend Component Specification

### 6.1 Component: SqrtApp

**Props:** `onBack` (function)

**State:** (Described in Section 3)

### 6.2 User Flow

```
[Show setup message: "The square-root drill will keep going until you stop."]
[Show optional "Limit questions?" input (empty = unlimited)]
[Show "Start Drill" button]
        ↓ (click Start)
[started=true, questionNumber=0, score=0, results=[]]
[Clamp totalQ: if numQuestions is '', set to Infinity; otherwise parse]
[fetchQuestion(1)]  ← step=1 for first question
        ↓
[Display: "Question N" (no total shown, just count)]
[Display: "√47 = ?"]
[Show NumPad below input]
[Timer starts]
        ↓ (submit via keyboard or NumPad)
[POST /sqrt-api/check {q, answer}]
[Stop timer, record result]
[Show feedback with step-by-step reasoning]
[Auto-advance after 1.5s if correct; click Next if wrong]
        ↓
[questionNumber++]
[If questionNumber >= totalQ: set finished=true]
[Else: fetchQuestion(questionNumber + 1)]  ← step increases
        ↓
[Loop until finished or user exits via "← Home"]

[User can exit at any time by clicking "← Home"]
```

### 6.3 Keyboard Support

| Key | Action | Condition |
|-----|--------|-----------|
| `0–9` | Append digit to input | Before answer revealed |
| `−` or `-` | Toggle sign | Before answer revealed |
| `Backspace` or `⌫` | Delete last character | Before answer revealed |
| `Enter` | Submit answer (if not revealed) OR go to next (if revealed) | Always when started |

### 6.4 Step-by-Step Feedback

**Generated entirely client-side after receiving `data.sqrtRounded`, `floorAnswer`, `ceilAnswer`:**

```javascript
const reasoning = [
  `√${question.q} = ${data.sqrtRounded}`,
  `⌊${data.sqrtRounded}⌋ = ${data.floorAnswer}, ⌈${data.sqrtRounded}⌉ = ${data.ceilAnswer}`
].join('\n')
```

**Correct answer:**
```
Correct!
√47 = 6.86
⌊6.86⌋ = 6, ⌈6.86⌉ = 7
```

**Incorrect answer:**
```
Incorrect.
√47 = 6.86
⌊6.86⌋ = 6, ⌈6.86⌉ = 7
Acceptable answers: 6 or 7
```

Uses mathematical floor (⌊⌋) and ceiling (⌈⌉) notation.

### 6.5 Results Record

```javascript
{
  question: `√${question.q}`,           // e.g., "√47"
  userAnswer: answer,                    // e.g., "7"
  correctAnswer: `${data.floorAnswer} or ${data.ceilAnswer}`,  // e.g., "6 or 7"
  correct: data.correct,
  time: timeTaken
}
```

### 6.6 UI Layout

```
┌────────────────────────────────────┐
│ [← Home]                           │
│          Square Root                │
│  Floor or ceiling is accepted       │
│                           [Timer] [Score] │
│                                    │
│  Optional: Limit questions?         │
│  ┌────────────────┐                │
│  │                │                │
│  └────────────────┘ (leave empty for unlimited)  │
│                                    │
│         [Start Drill]              │
└────────────────────────────────────┘

DURING DRILL:
┌────────────────────────────────────┐
│ [← Home]                           │
│          Square Root                │
│                           [Timer] [Score] │
│                                    │
│         Question 14                │
│          √247 = ?                   │
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
│ [Correct!                          │
│  √247 = 15.72                      │
│  ⌊15.72⌋ = 15, ⌈15.72⌉ = 16]     │
│   (auto-advancing in 1.5s...)      │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Q  │ Ans │ ✓/✗│ t   │     ││
│  │ 1 │ √37 │  6  │  ✓  │ 3.2s│     ││
│  │ 2 │ √5  │  2  │  ✓  │ 2.8s│     ││
│  │14 │√247│ 16  │  ✓  │ 5.1s│     ││
│  └─────────────────────────────┘│
│  Total: 62s  ·  Avg: 4.4s         │
└────────────────────────────────────┘
```

### 6.7 Results Display

**Key difference from other quizzes:** Results table is displayed below the quiz area **at all times during gameplay** (not only on a finish screen). It grows incrementally with each answered question, showing the full session history.

## 7. NumPad Component

**Layout:**
```
[±] [1] [2] [3]
[⌫] [4] [5] [6]
[ ] [7] [8] [9]
[       0      ]
```

**Behavior:**
- `±`: Toggle sign (prepend or remove leading `-`)
- Digits 0–9: Append digit to answer
- `⌫`: Delete last character
- Disabled when answer revealed

## 8. Auto-Advance Behavior

**Trigger:** After correct answer revealed (`revealed === true` AND `isCorrect === true`)

**Timing:** 1.5 seconds (constant `AUTO_ADVANCE_MS = 1500`)

**Action:** Increments `questionNumber`, resets answer/feedback/revealed states, fetches next question with `step = questionNumber + 1`

**Skip:** Pressing Enter before auto-advance completes immediately triggers advance

**Wrong Answers:** Do not auto-advance; must click Next or press Enter

## 9. CSS Classes & Styling

| Class | Purpose |
|-------|---------|
| `.quiz-container` | Main wrapper |
| `.setup-section` | Initial configuration area |
| `.question-display` | Question text area ("Question N") |
| `.prompt-display` | The "√47 = ?" prompt |
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

**Special Characters:**
- Square root: √ (U+221A)
- Floor: ⌊ (U+230A), ⌋ (U+230B)
- Ceiling: ⌈ (U+2308), ⌉ (U+2309)

## 10. Implementation Notes

- **No difficulty selector:** Difficulty increases automatically based on step number
- **Optional question limit:** Input accepts empty string (unlimited) or numeric value
- **Infinite mode:** When `totalQ === Infinity`, no "finish" state; drill continues until user navigates away
- **Results always visible:** Table shown during gameplay, not hidden until finish screen
- **Input type:** `type="text"` (not "number") to support NumPad and minus sign
- **Step progression:** `fetchQuestion(questionNumber + 1)` ensures step increases with each question
- **Server recalculation:** Both floor and ceiling always recomputed server-side from q; client does not store these values
- **Config:** `DEFAULT_TOTAL = 20` not used here (drill is unlimited by default)
- **Fonts:** Google Fonts — DM Sans (body/UI) and Source Serif 4 (headings)
