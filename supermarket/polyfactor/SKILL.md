# Polynomial Factorization — Formal Specification

## 1. Purpose

A polynomial factorization quiz where the player factors a quadratic polynomial ax² + bx + c into the form (px + q)(rx + s). The player enters the four coefficients (p, q, r, s) individually. Features configurable question count (default 20) and difficulty levels controlling coefficient ranges.

## 2. Constants

```javascript
const DEFAULT_TOTAL = 20  // default number of questions per quiz
const AUTO_ADVANCE_MS = 1500  // auto-advance delay in milliseconds
```

## 3. Difficulty Levels

| Level | Coeff Range | Example |
|-------|-------------|---------|
| Easy | 1–10 | 2x² + 7x + 3 = (2x + 1)(x + 3) |
| Medium | 1–20 | 6x² + 13x + 5 = (3x + 1)(2x + 5) |
| Hard | 1–30 | Complex factorizations with larger coefficients |

**Server-side implementation:**
The server generates random factors (px + q) and (rx + s) within the difficulty range, then multiplies them to create the polynomial. This guarantees all generated polynomials are factorable. The response includes both the polynomial and the factors, but the factors are only used for validation, not shown to the player.

## 4. API Specification

### 4.1 GET /polyfactor-api/question

**Query parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Default: 'easy'.

**Response (200):**
```json
{
  "id": "polyfactor-1775067701647-0.857",
  "difficulty": "easy",
  "a": 2,
  "b": 7,
  "c": 3,
  "prompt": "Factor 2x² + 7x + 3",
  "p": 2,
  "q": 1,
  "r": 1,
  "s": 3
}
```

The polynomial is `ax² + bx + c`, and it factors as `(px + q)(rx + s)`. The values `p, q, r, s` are included for server validation only.

### 4.2 POST /polyfactor-api/check

**Request body:**
```json
{
  "a": 2,
  "b": 7,
  "c": 3,
  "p": 2,
  "q": 1,
  "r": 1,
  "s": 3
}
```

**Response (200):**
```json
{
  "correct": true,
  "message": "Correct"
}
```

**Validation:** Verify that `(p*r)*x² + (p*s + q*r)*x + (q*s) = a*x² + b*x + c`. Accept both orderings (i.e., (px + q)(rx + s) and (rx + s)(px + q) are equivalent).

## 5. Frontend Component Specification

### 5.1 Component: PolyfactorApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| difficulty | string | 'easy' | Selected difficulty |
| started | boolean | false | Quiz has begun |
| finished | boolean | false | All questions done |
| question | object/null | null | Current question from API |
| p | string | '' | Coefficient p |
| q | string | '' | Coefficient q |
| r | string | '' | Coefficient r |
| s | string | '' | Coefficient s |
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
[Display: "Question N/totalQ", prompt "Factor 2x² + 7x + 3"]
[Display: "Enter coefficients p, q, r, s for (px + q)(rx + s)"]
[Show 4 input fields in a row: p, q, r, s]
[Timer starts counting]
        ↓ (type answers, submit)
[POST /polyfactor-api/check]
[Stop timer, record result]
[Show feedback: "Correct! (2x + 1)(x + 3)" or "Incorrect. Correct: (2x + 1)(x + 3)"]
[Auto-advance after 1.5s if correct; click Next if wrong]
        ↓
[If questionNumber < totalQ: increment, fetchQuestion]
[If questionNumber >= totalQ: set finished=true]
        ↓ (finished)
[Show: "Quiz complete.", "Final score: 15/20"]
[Show ResultsTable with all results]
[Show "Play Again" button → restarts quiz]
```

### 5.3 Feedback Format

Client-side construction:
```javascript
const factorStr = `(${p}x + ${q})(${r}x + ${s})`;
// Correct: "Correct! (2x + 1)(x + 3)"
// Incorrect: "Incorrect. Correct: (2x + 1)(x + 3)"
```

### 5.4 Results Record

After each answer, append to `results`:
```javascript
{
  question: `Factor ${question.a}x² + ${question.b}x + ${question.c}`,
  userAnswer: `(${p}x + ${q})(${r}x + ${s})`,
  correctAnswer: `(${question.p}x + ${question.q})(${question.r}x + ${question.s})`,
  correct: data.correct,
  time: timeTaken
}
```

### 5.5 UI Layout

```
┌─────────────────────────────────┐
│ [← Home]                        │
│    Polynomial Factorization     │
│   Factor ax² + bx + c into      │
│      (px + q)(rx + s)           │
│                    [8s] [Score]  │
│ [Easy] [Medium] [Hard]          │
│    How many questions? [20]     │
│                                 │
│       Question 7/20             │
│      Factor 2x² + 7x + 3        │
│ Enter p, q, r, s:              │
│  p: [__]  q: [__]              │
│  r: [__]  s: [__]              │
│          [Submit]               │
│┌─ Correct! (2x + 1)(x + 3) ───┐│
│  (auto-advances in 1.5s if correct) ││
│┌── Running Results Table ──────┐│
│ # │ Question │ Ans │ ✓/✗ │ t  ││
│└──────────────────────────────┘│
└─────────────────────────────────┘
```

### 5.6 Keyboard Support

Enter key listener activates submit or next when appropriate. Only active when `started && !finished`. Tab moves between input fields.

### 5.7 Auto-Advance

Uses the shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook. After a correct answer is revealed, automatically advances to the next question after 1.5 seconds. On wrong answers, the player must click Next manually. The player can press Enter to skip the wait on correct answers.

### 5.8 Running Results Table

The results table is displayed both during gameplay and on the finish screen.

## 6. Implementation Notes

- Difficulty selector is disabled while quiz is in progress
- All inputs are integer fields only
- Server guarantees all generated polynomials are factorable
- Validation accepts both orderings: (px + q)(rx + s) and (rx + s)(px + q)
- Configurable question count defaults to 20 via `DEFAULT_TOTAL`
- Results array is reset on "Play Again"
- Uses DM Sans (body/UI) and Source Serif 4 (heading) fonts from Google Fonts
