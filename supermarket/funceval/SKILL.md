# Function Evaluation — Formal Specification

## 1. Purpose

A function evaluation quiz where the player evaluates linear functions of 1, 2, or 3 variables at given points. The function format scales with difficulty: easy uses f(x) = ax + b, medium uses f(x, y) = ax + by + c, and hard uses f(x, y, z) = ax + by + cz + d. Uses a NumPad for input and features configurable question count (default 20).

## 2. Constants

```javascript
const DEFAULT_TOTAL = 20  // default number of questions per quiz
const AUTO_ADVANCE_MS = 1500  // auto-advance delay in milliseconds
```

## 3. Difficulty Levels

| Level | Function Type | Variables | Coeff Range | Example |
|-------|---------------|-----------|-------------|---------|
| Easy | f(x) = ax + b | 1 | 1–10 | f(x) = 3x + 2, f(5) = ? → 17 |
| Medium | f(x, y) = ax + by + c | 2 | 1–20 | f(x, y) = 2x + 5y + 1, f(3, 2) = ? → 17 |
| Hard | f(x, y, z) = ax + by + cz + d | 3 | 1–30 | f(x, y, z) = 2x + 3y + 4z + 1, f(1, 2, 3) = ? → 23 |

**Server-side implementation:**
Generate random coefficients and variable values within the difficulty range. Compute the result by substituting the given variable values into the function.

## 4. API Specification

### 4.1 GET /funceval-api/question

**Query parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Default: 'easy'.

**Response (200):**
```json
{
  "id": "funceval-1775067701647-0.857",
  "difficulty": "easy",
  "functionType": "1var",
  "a": 3,
  "b": 2,
  "c": 0,
  "d": 0,
  "x": 5,
  "y": 0,
  "z": 0,
  "prompt": "Evaluate f(x) = 3x + 2, f(5) = ?",
  "answer": 17
}
```

**For medium (2 variables):**
```json
{
  "functionType": "2var",
  "a": 2,
  "b": 5,
  "c": 1,
  "d": 0,
  "x": 3,
  "y": 2,
  "z": 0,
  "prompt": "Evaluate f(x, y) = 2x + 5y + 1, f(3, 2) = ?",
  "answer": 17
}
```

**For hard (3 variables):**
```json
{
  "functionType": "3var",
  "a": 2,
  "b": 3,
  "c": 4,
  "d": 1,
  "x": 1,
  "y": 2,
  "z": 3,
  "prompt": "Evaluate f(x, y, z) = 2x + 3y + 4z + 1, f(1, 2, 3) = ?",
  "answer": 23
}
```

### 4.2 POST /funceval-api/check

**Request body:**
```json
{
  "a": 3,
  "b": 2,
  "c": 0,
  "d": 0,
  "x": 5,
  "y": 0,
  "z": 0,
  "answer": 17
}
```

**Response (200):**
```json
{
  "correct": true,
  "correctAnswer": 17,
  "message": "Correct"
}
```

**Validation:** Compute the result server-side: `a*x + b*y + c*z + d` (depending on functionType). Allow floating-point tolerance (0.01).

## 5. Frontend Component Specification

### 5.1 Component: FuncevalApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| difficulty | string | 'easy' | Selected difficulty |
| started | boolean | false | Quiz has begun |
| finished | boolean | false | All questions done |
| question | object/null | null | Current question from API |
| answer | string | '' | Player's answer |
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
[Display function description and prompt:]
  "Evaluate f(x) = 3x + 2, f(5) = ?"
  or
  "Evaluate f(x, y) = 2x + 5y + 1, f(3, 2) = ?"
  or
  "Evaluate f(x, y, z) = 2x + 3y + 4z + 1, f(1, 2, 3) = ?"
[Show input field with NumPad below]
[Timer starts counting]
        ↓ (type answer via physical keyboard or NumPad, submit)
[POST /funceval-api/check]
[Stop timer, record result]
[Show feedback: "Correct! f(5) = 17" or "Incorrect. f(5) = 17"]
[Auto-advance after 1.5s if correct; click Next if wrong]
        ↓
[If questionNumber < totalQ: increment, fetchQuestion]
[If questionNumber >= totalQ: set finished=true]
        ↓ (finished)
[Show: "Quiz complete.", "Final score: 15/20"]
[Show ResultsTable with all results]
[Show "Play Again" button → restarts quiz]
```

### 5.3 Function Display

Display the function and the specific evaluation point clearly:
```javascript
const funcStr =
  question.functionType === '1var'
    ? `f(x) = ${question.a}x + ${question.b}`
    : question.functionType === '2var'
    ? `f(x, y) = ${question.a}x + ${question.b}y + ${question.c}`
    : `f(x, y, z) = ${question.a}x + ${question.b}y + ${question.c}z + ${question.d}`;

const evalStr =
  question.functionType === '1var'
    ? `f(${question.x})`
    : question.functionType === '2var'
    ? `f(${question.x}, ${question.y})`
    : `f(${question.x}, ${question.y}, ${question.z})`;

// Display: "Evaluate f(x) = 3x + 2, f(5) = ?"
```

### 5.4 Feedback Format

Client-side construction:
```javascript
// Correct: "Correct! f(5) = 17"
// Incorrect: "Incorrect. f(5) = 17"
```

### 5.5 Results Record

After each answer, append to `results`:
```javascript
{
  question: `${funcStr}, ${evalStr}`,
  userAnswer: answer,
  correctAnswer: data.correctAnswer,
  correct: data.correct,
  time: timeTaken
}
```

### 5.6 UI Layout

```
┌─────────────────────────────────┐
│ [← Home]                        │
│      Function Evaluation        │
│  Evaluate linear functions     │
│   at given points              │
│                    [8s] [Score]  │
│ [Easy] [Medium] [Hard]          │
│    How many questions? [20]     │
│                                 │
│       Question 7/20             │
│ Evaluate f(x) = 3x + 2         │
│        f(5) = ?                 │
│                                 │
│       ┌──────────────┐           │
│       │  Type answer  │           │
│       └──────────────┘           │
│     [1] [2] [3]                 │
│     [4] [5] [6]                 │
│     [7] [8] [9]                 │
│     [       0       ]            │
│  [± ] [ Submit]                 │
│┌─ Correct! f(5) = 17 ─────────┐│
│  (auto-advances in 1.5s if correct) ││
│┌── Running Results Table ──────┐│
│ # │ Question │ Ans │ ✓/✗ │ t  ││
│└──────────────────────────────┘│
└─────────────────────────────────┘
```

### 5.7 Keyboard Support

Enter key listener activates submit or next when appropriate. Only active when `started && !finished`. Physical keyboard input works alongside the NumPad.

### 5.8 NumPad

An on-screen numeric keypad displayed below the input field, featuring:
- Digits 0–9 arranged in a calculator-style grid (3 columns + full-width 0)
- A ± key that toggles the sign of the current answer
- A ⌫ key that deletes the last character
- Physical keyboard input works alongside the on-screen keypad
- Input uses `type="text"` with regex validation: `/^-?\d+$/.test(v)`

NumPad key handler:
```javascript
const handleNumPad = (key) => {
  if (revealed) return
  if (key === '±') setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : prev ? '-' + prev : '-')
  else if (key === '⌫') setAnswer(prev => prev.slice(0, -1))
  else setAnswer(prev => prev + key)
}
```

Input validation (onChange): `if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v)`

### 5.9 Auto-Advance

Uses the shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook. After a correct answer is revealed, automatically advances to the next question after 1.5 seconds. On wrong answers, the player must click Next manually. The player can press Enter to skip the wait on correct answers.

### 5.10 Running Results Table

The results table is displayed both during gameplay and on the finish screen.

## 6. Implementation Notes

- Difficulty selector is disabled while quiz is in progress
- Input validation accepts integers only (use NumPad or type directly)
- Client displays the function formula and evaluation point clearly
- Server validates by recomputing the result
- Floating-point comparison tolerance: 0.01
- Configurable question count defaults to 20 via `DEFAULT_TOTAL`
- Results array is reset on "Play Again"
- Uses DM Sans (body/UI) and Source Serif 4 (heading) fonts from Google Fonts
