# Line Equation — Formal Specification

## 1. Purpose

A line equation quiz where the player determines the slope (m) and y-intercept (c) of a line given two points, using the linear equation y = mx + c. Features configurable question count (default 20) and difficulty levels controlling coefficient ranges.

## 2. Constants

```javascript
const DEFAULT_TOTAL = 20  // default number of questions per quiz
const AUTO_ADVANCE_MS = 1500  // auto-advance delay in milliseconds
```

## 3. Difficulty Levels

| Level | m and c Type | Range | Example |
|-------|-------------|-------|---------|
| Easy | Integer m and c | Built from m, c values (1–10) | Points: (0, 2), (1, 5) → m = 3, c = 2 |
| Medium | Any real m and c | Any (m and c can be decimals) | Points: (1, 2), (3, 5) → m = 1.5, c = 0.5 |
| Hard | Any real m and c | Larger range with decimals | Points: (2, 3), (5, 9) → m = 2, c = -1 |

**Server-side implementation:**
- Easy: Generate from integer m and c values, compute two points to guarantee integer results
- Medium/Hard: Generate two random points, compute m and c via the slope formula

## 4. API Specification

### 4.1 GET /lineq-api/question

**Query parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Default: 'easy'.

**Response (200):**
```json
{
  "id": "lineq-1775067701647-0.857",
  "difficulty": "easy",
  "x1": 0,
  "y1": 2,
  "x2": 1,
  "y2": 5,
  "prompt": "Find m and c in y = mx + c for the line through (0, 2) and (1, 5)",
  "m": 3,
  "c": 2
}
```

The line passes through both points: y1 = m*x1 + c and y2 = m*x2 + c.

### 4.2 POST /lineq-api/check

**Request body:**
```json
{
  "x1": 0,
  "y1": 2,
  "x2": 1,
  "y2": 5,
  "m": 3,
  "c": 2
}
```

**Response (200):**
```json
{
  "correct": true,
  "correctM": 3,
  "correctC": 2,
  "message": "Correct"
}
```

**Validation:** Verify that both points satisfy the equation: `y1 === m*x1 + c` and `y2 === m*x2 + c`, with floating-point tolerance (0.01).

## 5. Frontend Component Specification

### 5.1 Component: LineqApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| difficulty | string | 'easy' | Selected difficulty |
| started | boolean | false | Quiz has begun |
| finished | boolean | false | All questions done |
| question | object/null | null | Current question from API |
| m | string | '' | Player's slope |
| c | string | '' | Player's y-intercept |
| score | number | 0 | Correct answers count |
| questionNumber | number | 0 | Current question number |
| numQuestions | string | '20' | Configurable question count |
| totalQ | number | 20 | Computed total questions |
| feedback | string | '' | Feedback with reasoning |
| loading | boolean | false | Fetching question |
| revealed | boolean | false | Answer shown |
| results | array | [] | Result objects for each question |

**Timer:** `useTimer()` — starts on question load, stops on submit.

**advanceRef:** `useRef(() => {})` — updated every render with current advance logic.

### 5.2 User Flow

```
[Show difficulty selector: Easy / Medium / Hard]
[Show "How many questions?" input (default 20)]
[Show "Start Quiz" button]
        ↓ (click Start)
[Lock difficulty selector, compute totalQ]
[Set started=true, questionNumber=1, score=0, results=[]]
[fetchQuestion(difficulty)]
        ↓
[Display: "Question N/totalQ"]
[Display: "Find m and c in y = mx + c for the line through (x1, y1) and (x2, y2)"]
[Show 2 input fields: m and c]
[Timer starts counting]
        ↓ (type m and c, submit)
[POST /lineq-api/check]
[Stop timer, record result]
[Show feedback: "Correct! m = 3, c = 2" or "Incorrect. Correct: m = 3, c = 2"]
[Auto-advance after 1.5s if correct; click Next if wrong]
        ↓
[If questionNumber < totalQ: increment, fetchQuestion]
[If questionNumber >= totalQ: set finished=true]
        ↓ (finished)
[Show: "Quiz complete.", "Final score: 15/20"]
[Show ResultsTable with all results]
[Show "Play Again" button → restarts quiz]
```

### 5.3 Points Display

Display the two points clearly:
```javascript
const pointsStr = `(${question.x1}, ${question.y1}) and (${question.x2}, ${question.y2})`;
// Example: "Find m and c for the line through (0, 2) and (1, 5)"
```

### 5.4 Feedback Format

Client-side construction:
```javascript
// Correct: "Correct! m = 3, c = 2"
// Incorrect: "Incorrect. Correct: m = 3, c = 2"
```

### 5.5 Results Record

After each answer, append to `results`:
```javascript
{
  question: `Line through (${question.x1}, ${question.y1}) and (${question.x2}, ${question.y2})`,
  userAnswer: `m = ${m}, c = ${c}`,
  correctAnswer: `m = ${data.correctM}, c = ${data.correctC}`,
  correct: data.correct,
  time: timeTaken
}
```

### 5.6 UI Layout

```
┌─────────────────────────────────┐
│ [← Home]                        │
│        Line Equation            │
│   Find slope and y-intercept   │
│   for y = mx + c given points  │
│                    [8s] [Score]  │
│ [Easy] [Medium] [Hard]          │
│    How many questions? [20]     │
│                                 │
│       Question 7/20             │
│ Find m and c for the line      │
│  through (0, 2) and (1, 5)     │
│                                 │
│  m = [__________]              │
│  c = [__________]              │
│          [Submit]               │
│┌─ Correct! m = 3, c = 2 ──────┐│
│  (auto-advances in 1.5s if correct) ││
│┌── Running Results Table ──────┐│
│ # │ Question │ Ans │ ✓/✗ │ t  ││
│└──────────────────────────────┘│
└─────────────────────────────────┘
```

### 5.7 Keyboard Support

Enter key listener activates submit or next when appropriate. Only active when `started && !finished`. Tab moves between m and c input fields.

### 5.8 Auto-Advance

Uses the shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook. After a correct answer is revealed, automatically advances to the next question after 1.5 seconds. On wrong answers, the player must click Next manually. The player can press Enter to skip the wait on correct answers.

### 5.9 Running Results Table

The results table is displayed both during gameplay and on the finish screen.

## 6. Implementation Notes

- Difficulty selector is disabled while quiz is in progress
- Input fields validate: accept integers for easy, decimals for medium/hard
- Allow both integer and decimal formats (3, 3.5, -1.5, etc.)
- Server recomputes slope and y-intercept from the given points
- Formula for slope: m = (y2 - y1) / (x2 - x1)
- Formula for y-intercept: c = y1 - m * x1
- Floating-point comparison tolerance: 0.01
- Configurable question count defaults to 20 via `DEFAULT_TOTAL`
- Results array is reset on "Play Again"
- Uses DM Sans (body/UI) and Source Serif 4 (heading) fonts from Google Fonts
