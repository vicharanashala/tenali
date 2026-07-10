# Quadratic Formula — Formal Specification

## 1. Purpose

A quadratic formula puzzle where the player finds the roots of ax² + bx + c = 0 using the quadratic formula. The UI adapts based on the nature of roots: two distinct real roots, one repeated root, or complex roots (real + imaginary parts). Features configurable question count (default 20) and difficulty levels.

## 2. Constants

```javascript
const DEFAULT_TOTAL = 20  // default number of questions per quiz
const AUTO_ADVANCE_MS = 1500  // auto-advance delay in milliseconds
```

## 3. Difficulty Levels

| Level | Root Type | Range | Example |
|-------|-----------|-------|---------|
| Easy | Integer roots only | Built from factors | x² + 5x + 6 = 0 → roots: -2, -3 |
| Medium | Real roots (integer or decimal) | Discriminant ≥ 0 | 2x² + 3x + 1 = 0 → roots: -0.5, -1 |
| Hard | Any roots (including complex) | Any discriminant | x² + 2x + 5 = 0 → roots: -1 + 2i, -1 - 2i |

**Server-side implementation:**
- Easy: Generate from integer roots built as factors
- Medium: Generate with non-negative discriminant, allowing decimals
- Hard: Generate with any discriminant, potentially complex roots

## 4. API Specification

### 4.1 GET /qformula-api/question

**Query parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Default: 'easy'.

**Response (200):**
```json
{
  "id": "qformula-1775067701647-0.857",
  "difficulty": "easy",
  "a": 1,
  "b": 5,
  "c": 6,
  "prompt": "Find roots of x² + 5x + 6 = 0",
  "discriminant": 1,
  "rootType": "two_distinct",
  "root1": -2,
  "root2": -3,
  "root1Real": -2,
  "root1Imag": 0,
  "root2Real": -3,
  "root2Imag": 0
}
```

**rootType values:**
- `"two_distinct"`: discriminant > 0 → two different real roots
- `"one_repeated"`: discriminant = 0 → one root with multiplicity 2
- `"two_complex"`: discriminant < 0 → two complex conjugate roots

For complex roots, both root1 and root2 are provided with `Real` and `Imag` parts.

### 4.2 POST /qformula-api/check

**Two distinct roots request:**
```json
{
  "a": 1,
  "b": 5,
  "c": 6,
  "root1": -2,
  "root2": -3,
  "rootType": "two_distinct"
}
```

**One repeated root request:**
```json
{
  "a": 1,
  "b": -2,
  "c": 1,
  "root": -1,
  "rootType": "one_repeated"
}
```

**Complex roots request:**
```json
{
  "a": 1,
  "b": 2,
  "c": 5,
  "root1Real": -1,
  "root1Imag": 2,
  "root2Real": -1,
  "root2Imag": -2,
  "rootType": "two_complex"
}
```

**Response (200):**
```json
{
  "correct": true,
  "correctRoot1": -2,
  "correctRoot2": -3,
  "message": "Correct"
}
```

**Validation:** Compute roots server-side using the quadratic formula. Compare with tolerance (0.01 for real parts, 0.01 for imaginary parts). Accept roots in either order for two distinct/complex cases.

## 5. Frontend Component Specification

### 5.1 Component: QformulaApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| difficulty | string | 'easy' | Selected difficulty |
| started | boolean | false | Quiz has begun |
| finished | boolean | false | All questions done |
| question | object/null | null | Current question from API |
| root1 | string | '' | First root (or real part for complex) |
| root2 | string | '' | Second root (or imag part for one root) |
| root1Real | string | '' | Real part of first complex root |
| root1Imag | string | '' | Imaginary part of first complex root |
| root2Real | string | '' | Real part of second complex root |
| root2Imag | string | '' | Imaginary part of second complex root |
| root | string | '' | Repeated root (for one_repeated case) |
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
[Display: "Question N/totalQ", prompt "Find roots of x² + 5x + 6 = 0"]
[Based on question.rootType, render appropriate input layout:]
  → two_distinct: 2 input fields (Root 1, Root 2)
  → one_repeated: 1 input field (Root)
  → two_complex: 4 input fields (Root 1 Real, Root 1 Imag, Root 2 Real, Root 2 Imag)
[Timer starts counting]
        ↓ (type roots, submit)
[POST /qformula-api/check]
[Stop timer, record result]
[Show feedback: "Correct! Roots: -2, -3" or "Incorrect. Correct roots: -2, -3"]
[Auto-advance after 1.5s if correct; click Next if wrong]
        ↓
[If questionNumber < totalQ: increment, fetchQuestion]
[If questionNumber >= totalQ: set finished=true]
        ↓ (finished)
[Show: "Quiz complete.", "Final score: 15/20"]
[Show ResultsTable with all results]
[Show "Play Again" button → restarts quiz]
```

### 5.3 Dynamic UI Based on Root Type

**Two Distinct Real Roots:**
```
Root 1: [__________]
Root 2: [__________]
```

**One Repeated Root:**
```
Root: [__________]
```

**Two Complex Roots:**
```
Root 1: [__________] + [__________]i
Root 2: [__________] + [__________]i
```

### 5.4 Feedback Format

Client-side construction:
```javascript
let rootsStr = '';
if (question.rootType === 'two_distinct') {
  rootsStr = `${root1}, ${root2}`;
} else if (question.rootType === 'one_repeated') {
  rootsStr = `${root} (repeated)`;
} else {
  rootsStr = `${root1Real} + ${root1Imag}i, ${root2Real} + ${root2Imag}i`;
}
// Correct: "Correct! Roots: -2, -3"
// Incorrect: "Incorrect. Correct roots: -2, -3"
```

### 5.5 Results Record

After each answer, append to `results`:
```javascript
{
  question: `Roots of ${question.a}x² + ${question.b}x + ${question.c} = 0`,
  userAnswer: rootsStr,
  correctAnswer: correctRootsStr,
  correct: data.correct,
  time: timeTaken
}
```

### 5.6 UI Layout

```
┌─────────────────────────────────┐
│ [← Home]                        │
│       Quadratic Formula         │
│    Find the roots of ax² + ... │
│        using the formula        │
│                    [8s] [Score]  │
│ [Easy] [Medium] [Hard]          │
│    How many questions? [20]     │
│                                 │
│       Question 7/20             │
│   Find roots of x² + 5x + 6 = 0 │
│                                 │
│ Root 1: [__________]            │
│ Root 2: [__________]            │
│          [Submit]               │
│┌─ Correct! Roots: -2, -3 ─────┐│
│  (auto-advances in 1.5s if correct) ││
│┌── Running Results Table ──────┐│
│ # │ Question │ Ans │ ✓/✗ │ t  ││
│└──────────────────────────────┘│
└─────────────────────────────────┘
```

### 5.7 Keyboard Support

Enter key listener activates submit or next when appropriate. Only active when `started && !finished`. Tab moves between input fields.

### 5.8 Auto-Advance

Uses the shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook. After a correct answer is revealed, automatically advances to the next question after 1.5 seconds. On wrong answers, the player must click Next manually. The player can press Enter to skip the wait on correct answers.

### 5.9 Running Results Table

The results table is displayed both during gameplay and on the finish screen.

## 6. Implementation Notes

- Difficulty selector is disabled while quiz is in progress
- Input fields validate: real numbers (with decimal points) for real parts, signed numbers for imaginary parts
- Client accepts decimals (e.g., -0.5) for medium and hard difficulties
- Root ordering: server accepts roots in either order (e.g., both -2, -3 and -3, -2 are correct)
- Complex root format: user enters real part, then imaginary part (e.g., for -1 + 2i: real = -1, imag = 2)
- Configurable question count defaults to 20 via `DEFAULT_TOTAL`
- Results array is reset on "Play Again"
- Uses DM Sans (body/UI) and Source Serif 4 (heading) fonts from Google Fonts
