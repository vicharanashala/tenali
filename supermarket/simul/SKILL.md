# Simultaneous Equations (Unified 2×2 / 3×3) — Formal Specification

## 1. Purpose

A simultaneous equations quiz with two difficulty levels: Easy (2×2 system — solve for x, y) and Hard (3×3 system — solve for x, y, z). Replaces the former separate Linear Equations and Simultaneous Equations puzzles.

## 2. Constants

```javascript
const DEFAULT_TOTAL = 20  // default number of questions per quiz
const AUTO_ADVANCE_MS = 1500  // auto-advance delay in milliseconds
```

## 3. Difficulty Levels

| Level | System Size | Variables | Coeff Range | Description |
|-------|-------------|-----------|-------------|-------------|
| Easy  | 2×2         | x, y      | 1–10        | Two equations, two unknowns with integer solutions |
| Hard  | 3×3         | x, y, z   | 1–15        | Three equations, three unknowns with integer solutions |

**Server-side implementation:**
- Easy: Generates integer x, y solutions first, then builds two linearly independent equations (determinant ≠ 0).
- Hard: Generates integer x, y, z solutions first, then builds three equations ensuring the 3×3 coefficient matrix has non-zero determinant.

## 4. API Specification

### 4.1 GET /simul-api/question

**Query parameters:**
- `difficulty` (string, optional): 'easy' or 'hard'. Default: 'easy'.

**Response (200) — Easy (2×2):**
```json
{
  "id": "simul-1775067701647-0.857",
  "size": 2,
  "eqs": [
    { "a": 2, "b": 3, "d": 13 },
    { "a": 1, "b": -2, "d": -1 }
  ],
  "solution": { "x": 2, "y": 3 }
}
```

**Response (200) — Hard (3×3):**
```json
{
  "id": "simul-1775067701648-0.123",
  "size": 3,
  "eqs": [
    { "a": 1, "b": 1, "c": 1, "d": 6 },
    { "a": 1, "b": -1, "c": 1, "d": 2 },
    { "a": 1, "b": 1, "c": -1, "d": 0 }
  ],
  "solution": { "x": 2, "y": 2, "z": 2 }
}
```

### 4.2 POST /simul-api/check

**Request body:**
```json
{
  "eqs": [...],
  "size": 2,
  "solution": { "x": 2, "y": 3 },
  "userX": 2,
  "userY": 3,
  "userZ": 0
}
```

**Response (200):**
```json
{
  "correct": true,
  "solution": { "x": 2, "y": 3 },
  "message": "Correct"
}
```

**Validation:** For 2×2: verify `a*ux + b*uy === d` for both equations. For 3×3: verify `a*ux + b*uy + c*uz === d` for all three. Tolerance: 0.1.

## 5. Frontend Component Specification

### 5.1 Component: SimulApp

**Props:** `onBack` (function)

**Key behavior:**
- `is3x3` derived from `question.size === 3`
- Only two difficulty radio buttons: "Easy (2×2)" and "Hard (3×3)"
- For Easy: shows x and y input fields; for Hard: shows x, y, and z
- Subtitle and welcome text change based on difficulty
- Equation formatter: `fmtEq2` for 2×2, `fmtEq3` for 3×3

### 5.2 Auto-Advance

Uses `useAutoAdvance(revealed, advanceRef, isCorrect)` — only auto-advances on correct answers. On wrong answers, the player must click Next manually.

### 5.3 UI Layout

```
┌─────────────────────────────────┐
│ [← Home]                        │
│   Simultaneous Eq.              │
│   Solve the 2×2 / 3×3 system   │
│                    [8s] [Score]  │
│ [Easy (2×2)] [Hard (3×3)]       │
│    How many questions? [20]     │
│                                 │
│       Question 7/20             │
│  2x + 3y = 13                   │
│  x − 2y = −1                    │
│                                 │
│  x = [__________]              │
│  y = [__________]              │
│  (z = [__________] for 3×3)    │
│          [Submit]               │
│┌─ Correct! (x, y) = (2, 3) ───┐│
└─────────────────────────────────┘
```

## 6. Implementation Notes

- Replaced the separate Linear Equations (2×2) and Simultaneous Equations (3×3) puzzles
- Single unified API endpoint `/simul-api` handles both sizes
- Difficulty selector shows only Easy and Hard (no Medium)
- Server ensures linearly independent equations for unique solutions
- Uses DM Sans (body/UI) and Source Serif 4 (heading) fonts
- Input validation: accepts integers and decimals, negative numbers
