# Fractions (Add) — Formal Specification

## 1. Overview

A fraction addition quiz with three difficulty levels. The player adds two fractions and provides the answer in simplified (lowest terms) form. Easy mode uses same denominators, Medium mode requires finding the LCD with different denominators, and Hard mode involves mixed numbers. Features a custom stacked fraction input UI (numerator/bar/denominator), auto-advance on correct answers (1.5s), Enter key to advance after wrong answers, and a running results table.

## 2. Component Specification

**Component:** `FractionAddApp` (located in `App.jsx` monolith)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `App.jsx` (monolith, `FractionAddApp` function)
- CSS: `App.css` (`.fraction-*` class family)
- Server: `/fractionadd-api/` routes in `server/index.js`
- Vite proxy: `/fractionadd-api` entry in `vite.config.js`

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `difficulty` | string | 'easy' | Selected difficulty: 'easy', 'medium', or 'hard' |
| `numQuestions` | string | '20' | User input for total question count |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `question` | object\|null | null | Current question from API (see §4.1 for shape) |
| `ansNum` | string | '' | User's answer numerator input |
| `ansDen` | string | '' | User's answer denominator input |
| `ansWhole` | string | '' | User's whole part input (hard mode only) |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question index (1-based in display) |
| `totalQ` | number | 20 | Parsed and validated total question count |
| `feedback` | string | '' | Feedback message displayed after submission |
| `isCorrect` | boolean\|null | null | Whether last answer was correct (null before submission) |
| `loading` | boolean | false | True while fetching next question |
| `revealed` | boolean | false | True after answer submitted and checked |
| `results` | array | [] | Array of result objects for ResultsTable |

**Timer:** Uses shared `useTimer()` hook. Starts when question loads. Stops when answer is submitted.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceFnRef, isCorrect)` hook. Only fires when `isCorrect === true`.

**Enter key after wrong:** A `useEffect` adds a global `keydown` listener for Enter when `revealed && !isCorrect`, calling `advance()`.

## 4. API Endpoints

### 4.1 GET /fractionadd-api/question

**Purpose:** Generate a random fraction addition question at the specified difficulty.

**Query Parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Defaults to 'easy'.

**Response (Easy — same denominators):**
```json
{
  "id": 1712345678000,
  "n1": 2, "d1": 5,
  "n2": 1, "d2": 5,
  "difficulty": "easy",
  "mixed": false
}
```
- `d1 === d2` always (same denominator)
- Denominators range: 2–10
- Numerators range: 1 to (den-1)

**Response (Medium — different denominators):**
```json
{
  "id": 1712345678001,
  "n1": 1, "d1": 3,
  "n2": 1, "d2": 4,
  "difficulty": "medium",
  "mixed": false
}
```
- `d1 !== d2` guaranteed
- Denominators range: 2–12
- Numerators range: 1 to (den-1)

**Response (Hard — mixed numbers):**
```json
{
  "id": 1712345678002,
  "w1": 1, "n1": 2, "d1": 3,
  "w2": 2, "n2": 1, "d2": 4,
  "difficulty": "hard",
  "mixed": true
}
```
- `d1 !== d2` guaranteed
- Denominators range: 2–15
- Whole parts range: 1–5
- Numerators range: 1 to (den-1)

### 4.2 POST /fractionadd-api/check

**Purpose:** Validate the user's fraction addition answer against the correct simplified result.

**Request Body (Easy/Medium):**
```json
{
  "n1": 1, "d1": 3,
  "n2": 1, "d2": 4,
  "ansNum": 7, "ansDen": 12,
  "mixed": false
}
```

**Request Body (Hard):**
```json
{
  "n1": 2, "d1": 3, "w1": 1,
  "n2": 1, "d2": 4, "w2": 2,
  "ansWhole": 3, "ansNum": 11, "ansDen": 12,
  "mixed": true
}
```

**Response:**
```json
{
  "correct": true,
  "correctNum": 7,
  "correctDen": 12,
  "display": "7/12",
  "message": "Correct!"
}
```

For hard mode, also includes `correctWhole`.

**Server-side Algorithm:**
1. Compute sum: `totalNum = n1*d2 + n2*d1`, `totalDen = d1*d2` (for mixed: convert to improper first via `w*d + n`)
2. Simplify using GCD (Euclidean algorithm): `g = gcd(|totalNum|, totalDen)`, result = `totalNum/g` / `totalDen/g`
3. For hard mode, convert user answer to improper fraction for comparison: `userTotal = ansWhole*ansDen + ansNum`
4. Compare simplified user answer against simplified correct answer (both num and den must match)

**Utility Functions (server):**
- `gcd(a, b)`: Euclidean GCD algorithm, operates on absolute values
- `simplifyFraction(num, den)`: Divide by GCD, ensure positive denominator
- `toMixed(num, den)`: Convert improper fraction to `{whole, num, den}`

## 5. Difficulty Levels

| Level | Denominators | Denominator Constraint | Numerator Range | Mixed Numbers |
|-------|-------------|----------------------|-----------------|---------------|
| Easy | 2–10 | Same (d1 = d2) | 1 to den-1 | No |
| Medium | 2–12 | Different (d1 ≠ d2) | 1 to den-1 | No |
| Hard | 2–15 | Different (d1 ≠ d2) | 1 to den-1 | Yes (whole 1–5) |

## 6. UI Layout

### 6.1 Setup Phase
Standard welcome box with:
- Description text (changes with selected difficulty)
- Difficulty dropdown: Easy / Medium / Hard
- Questions number input (1–100, default 20)
- Start Quiz button

### 6.2 Playing Phase

**Problem Display:** Uses `.fraction-expression` flex layout:
- Easy/Medium: `[n1/d1] + [n2/d2] =`
- Hard: `[w1 n1/d1] + [w2 n2/d2] =`

Each fraction rendered as a stacked element (`.fraction-display`):
- `.frac-num` — numerator (top)
- `.frac-bar` — horizontal dividing line
- `.frac-den` — denominator (bottom)

Mixed numbers use `.mixed-number` with `.mixed-whole` + `.fraction-display`.

**Answer Input (`.fraction-answer-area`):**
- Hard mode: whole number text input (`.fraction-whole-input`, placeholder "W")
- Stacked fraction input (`.fraction-input-stack`):
  - Numerator field (`.frac-num-input`, placeholder "num")
  - Accent-colored dividing bar (`.fraction-input-bar`)
  - Denominator field (`.frac-den-input`, placeholder "den")
- All fields support Enter key to submit/advance
- Numerator accepts negative integers; denominator accepts positive integers only

**Feedback:** Standard `.feedback.correct` / `.feedback.wrong` div

**Buttons:** Submit (disabled if num/den empty or den=0) or Next Question / Finish Quiz

### 6.3 Finished Phase
Standard welcome box with score and ResultsTable.

## 7. CSS Classes

| Class | Purpose |
|-------|---------|
| `.fraction-display` | Inline-flex column container for stacked fraction |
| `.frac-num` | Fraction numerator text (1.5rem, weight 600) |
| `.frac-bar` | Horizontal bar between num/den (2px, var(--clr-fg)) |
| `.frac-den` | Fraction denominator text (1.5rem, weight 600) |
| `.mixed-number` | Flex container for whole + fraction |
| `.mixed-whole` | Whole number text (1.8rem, weight 700) |
| `.fraction-problem` | Column layout for problem + answer area |
| `.fraction-expression` | Flex row for the equation display |
| `.frac-operator` | Plus/equals signs (1.8rem, accent color) |
| `.fraction-answer-area` | Flex row for answer input fields |
| `.fraction-whole-input` | Whole number input field (3rem square) |
| `.fraction-input-stack` | Column layout for numerator/bar/denominator inputs |
| `.fraction-field` | Base input field style (4rem wide, 2rem tall) |
| `.frac-num-input` | Numerator input (no bottom border-radius) |
| `.fraction-input-bar` | Accent-colored dividing bar (4.5rem wide, 3px) |
| `.frac-den-input` | Denominator input (no top border-radius) |

**Mobile breakpoint (max-width: 500px):** Reduces font sizes and input widths for compact display.

## 8. Registration Points

The puzzle must be registered in these locations:

1. **Home `allApps` array:** `{ key: 'fractionadd', name: 'Fractions (Add)', subtitle: 'Add fractions and simplify', color: 'blue' }`
2. **Home `modeMap` object:** `fractionadd: FractionAddApp`
3. **`CUSTOM_PUZZLES` array:** `{ key: 'fractionadd', name: 'Fractions (Add)' }`
4. **`fetchQuestionForType` URL map:** `fractionadd: '${API}/fractionadd-api/question?difficulty=${difficulty}'`
5. **`getPromptForType` switch:** Returns `"w1 n1/d1 + w2 n2/d2 = ?"` (mixed) or `"n1/d1 + n2/d2 = ?"` (simple)
6. **CustomApp `handleSubmit` switch:** POSTs to `/fractionadd-api/check` with ansNum/ansDen = Number(answer)/1
7. **CustomApp `renderInputs` switch:** Uses standard numeric input + NumPad (same case as basicarith etc.)
8. **Vite proxy:** `/fractionadd-api` → `http://127.0.0.1:4000`

## 9. State Machine

```
setup ──[Start Quiz]──→ playing ──[Last Q answered]──→ finished
                           │                              │
                           │ ←──[loadQuestion on qNum change]──┘ (Play Again resets to setup)
```

## 10. Answer Validation Rules

1. All answers must be in **simplified (lowest terms)** form
2. Comparison is done by reducing both user and correct answers to lowest terms and checking numerator AND denominator equality
3. For hard mode, user's mixed number `W N/D` is converted to improper fraction `(W*D+N)/D` before simplification and comparison
4. Zero denominator is prevented in the UI (submit button disabled when den=0 or empty)
