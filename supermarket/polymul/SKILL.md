# Polynomial Multiplication — Formal Specification

## 1. Purpose

A polynomial multiplication quiz where the player multiplies two polynomials and enters the coefficients of the resulting polynomial. Features configurable question count (default 20), difficulty levels controlling polynomial degree and coefficient ranges, and a running results table during gameplay.

## 2. Constants

```javascript
const DEFAULT_TOTAL = 20  // default number of questions per quiz
const AUTO_ADVANCE_MS = 1500  // auto-advance delay in milliseconds
```

## 3. Difficulty Levels

| Level | Form | Coeff Range | Example |
|-------|------|-------------|---------|
| Easy | a(bx + c) or ax(bx + c) — monomial × binomial | 1–9 | 3(2x + 5) = 6x + 15, or 4x(7x + 8) = 28x² + 32x |
| Medium | (ax + b)(cx + d) — two degree-1 polynomials | 1–10 | (2x + 3)(4x + 1) = 8x² + 14x + 3 |
| Hard | (ax² + bx + c)(dx² + ex + f) — two degree-2 polynomials | 1–20 | Complex higher-degree multiplications |

**Server-side implementation:**
Easy generates a monomial (scalar or single-variable term) and a binomial. Medium generates two linear polynomials. Hard generates two quadratic polynomials. Each polynomial is represented as an array of coefficients `[a₀, a₁, a₂, ...]` where `aₙ` is the coefficient of `xⁿ`.

## 4. API Specification

### 4.1 GET /polymul-api/question

**Query parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Default: 'easy'.

**Response (200):**
```json
{
  "id": "polymul-1775067701647-0.857",
  "difficulty": "easy",
  "poly1": [3, 2],
  "poly2": [1, 4],
  "poly1Str": "2x + 3",
  "poly2Str": "4x + 1",
  "prompt": "Multiply (2x + 3)(4x + 1)",
  "resultDegree": 2,
  "correctCoeffs": [3, 14, 8]
}
```

The `poly1` and `poly2` arrays use index-as-exponent notation: `[3, 2]` means `2x + 3`.
The `resultDegree` is always `degree(poly1) + degree(poly2)`.
The `correctCoeffs` array has length `resultDegree + 1`.

### 4.2 POST /polymul-api/check

**Request body:**
```json
{
  "poly1": [3, 2],
  "poly2": [1, 4],
  "coeffs": [3, 14, 8]
}
```

**Response (200):**
```json
{
  "correct": true,
  "correctCoeffs": [3, 14, 8],
  "message": "Correct"
}
```

**Validation:** Multiply polynomials server-side and compare the `coeffs` array. Allow small floating-point tolerance (within 0.01).

## 5. Frontend Component Specification

### 5.1 Component: PolymulApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| difficulty | string | 'easy' | Selected difficulty |
| started | boolean | false | Quiz has begun |
| finished | boolean | false | All questions done |
| question | object/null | null | Current question from API |
| coeffs | string[] | [] | Player's coefficient inputs |
| score | number | 0 | Correct answers count |
| questionNumber | number | 0 | Current question number |
| numQuestions | string | '20' | Configurable question count |
| totalQ | number | 20 | Computed total questions |
| feedback | string | '' | Feedback with reasoning |
| loading | boolean | false | Fetching question |
| revealed | boolean | false | Answer shown |
| results | array | [] | Result objects for each question |

**Timer:** `useTimer()` — starts on question load, stops on submit.

**advanceRef:** `useRef(() => {})` — updated every render with current advance logic, used by `useAutoAdvance` hook.

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
[Display: "Question N/totalQ", prompt "Multiply (2x + 3)(4x + 1)", input fields for coefficients]
[Timer starts counting]
[Dynamically create input fields based on resultDegree + 1]
[Each field labeled: "Coeff of x⁰", "Coeff of x¹", "Coeff of x²", etc.]
        ↓ (type answers, submit)
[POST /polymul-api/check]
[Stop timer, record result]
[Show feedback: "Correct! Result: 8x² + 14x + 3" or "Incorrect. Correct result: ..."]
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
const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
const resultStr = question.resultDegree === 0
  ? `${data.correctCoeffs[0]}`
  : data.correctCoeffs.map((c, i) => {
      if (c === 0) return null;
      const term = i === 0 ? `${c}` : i === 1 ? `${c === 1 ? '' : c}x` : `${c === 1 ? '' : c}x${sup(i)}`;
      return term;
    }).filter(Boolean).join(' + ');
// Correct: "Correct! Result: 8x² + 14x + 3"
// Incorrect: "Incorrect. Correct result: 8x² + 14x + 3"
```

### 5.4 Results Record

After each answer, append to `results`:
```javascript
{
  question: `${question.poly1Str} × ${question.poly2Str}`,
  userAnswer: coeffs.join(', '),
  correctAnswer: data.correctCoeffs.join(', '),
  correct: data.correct,
  time: timeTaken
}
```

### 5.5 UI Layout

```
┌─────────────────────────────────┐
│ [← Home]                        │
│       Polynomial Multiplication  │
│   Multiply polynomials and      │
│     enter the coefficients      │
│                    [8s] [Score]  │
│ [Easy] [Medium] [Hard]          │
│    How many questions? [20]     │
│                                 │
│       Question 7/20             │
│   Multiply (2x + 3)(4x + 1)     │
│ Coeff of x⁰: [__]              │
│ Coeff of x¹: [__]              │
│ Coeff of x²: [__]              │
│          [Submit]               │
│┌─ Correct! Result: 8x² + ... ─┐│
│  (auto-advances in 1.5s if correct) ││
│┌── Running Results Table ──────┐│
│ # │ Question │ Ans │ ✓/✗ │ t  ││
│└──────────────────────────────┘│
└─────────────────────────────────┘
```

### 5.6 Keyboard Support

Enter key listener activates submit or next when appropriate. Only active when `started && !finished`.

### 5.7 Auto-Advance

Uses the shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook. After a correct answer is revealed, automatically advances to the next question after 1.5 seconds. On wrong answers, the player must click Next manually. The player can press Enter to skip the wait on correct answers.

### 5.8 Running Results Table

The results table is displayed both during gameplay and on the finish screen.

## 6. Implementation Notes

- Difficulty selector is disabled while quiz is in progress
- Input fields are dynamically created based on `question.resultDegree + 1`
- Client validates that inputs are integers only
- Configurable question count defaults to 20 via `DEFAULT_TOTAL`
- Results array is reset on "Play Again"
- Uses DM Sans (body/UI) and Source Serif 4 (heading) fonts from Google Fonts
