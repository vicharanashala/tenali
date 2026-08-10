# Matrices — Formal Specification

## 1. Overview

**Matrices** teaches operations on 2×2 matrices including addition, scalar multiplication, determinant calculation, and matrix multiplication. Students manipulate matrices using mathematical notation and understand properties of matrix operations.

**Target Grade Level:** A-Level/Higher Mathematics (ages 16+)

**Key Concepts Covered:**
- Matrix addition: element-wise summation
- Scalar multiplication: multiply all elements by constant
- Determinant: det(A) = ad − bc for [[a,b],[c,d]]
- Matrix multiplication: element by element dot products
- Matrix notation and formatting

## 2. Component Specification

**Component Name:** `MatrixApp`

**Factory:** Created via `makeQuizApp()` factory function with configuration:
```javascript
{
  title: 'Matrices',
  subtitle: 'Add, multiply, determinant',
  apiPath: 'matrix-api',
  diffLabels: {
    easy: 'Easy — Addition',
    medium: 'Medium — Scalar ×',
    hard: 'Hard — Determinant',
    extrahard: 'Extra Hard — Multiply'
  },
  placeholders: (q, d) => d === 'hard' ? 'e.g. 7' : 'e.g. [1,2;3,4]',
  tip: 'Enter matrices as [a,b;c,d] — semicolon separates rows'
}
```

**Props:**
- `onBack`: Callback function to return to menu

**Features:**
- Four difficulty levels: easy, medium, hard, extrahard
- Matrix notation with semicolon row separators
- Integer determinants and elements
- Adaptive mode supported: score 0–3, +0.25 correct, −0.35 wrong

## 3. Difficulty Levels

| Level | Type | Focus | Example | Expected Answer |
|-------|------|-------|---------|-----------------|
| **Easy** | Matrix addition | Add two 2×2 matrices | "A = [1,2;3,4], B = [2,3;4,5]. Find A+B." | [3,5;7,9] |
| **Medium** | Scalar multiplication | Multiply matrix by scalar | "A = [2,3;4,5]. Find 3A." | [6,9;12,15] |
| **Hard** | Determinant | Calculate ad − bc | "Find det of [2,3;4,5]" | −2 |
| **Extra Hard** | Matrix multiplication | Multiply two 2×2 matrices | "A = [1,2;3,4], B = [2,0;1,3]. Find AB." | [4,6;10,12] |

## 4. API Endpoints

### GET /matrix-api/question

**Query Parameters:**
- `difficulty`: 'easy' | 'medium' | 'hard' | 'extrahard' (default: 'easy')

**Response (Easy — Addition):**
```json
{
  "id": 1234567890,
  "difficulty": "easy",
  "type": "add",
  "prompt": "A = [1,2;3,4], B = [2,3;4,5]. Find A + B.",
  "answer": [[3,5],[7,9]],
  "display": "[3,5;7,9]"
}
```

**Response (Medium — Scalar):**
```json
{
  "id": 1234567890,
  "difficulty": "medium",
  "type": "scalar",
  "prompt": "A = [2,3;4,5]. Find 3A.",
  "answer": [[6,9],[12,15]],
  "display": "[6,9;12,15]"
}
```

**Response (Hard — Determinant):**
```json
{
  "id": 1234567890,
  "difficulty": "hard",
  "type": "determinant",
  "prompt": "Find the determinant of [2,3;4,5]",
  "answer": -2,
  "display": "-2"
}
```

**Response (Extra Hard — Multiply):**
```json
{
  "id": 1234567890,
  "difficulty": "extrahard",
  "type": "multiply",
  "prompt": "A = [1,2;3,4], B = [2,0;1,3]. Find AB.",
  "answer": [[4,6],[10,12]],
  "display": "[4,6;10,12]"
}
```

### POST /matrix-api/check

**Request Body:**
```json
{
  "type": "determinant",
  "answer": -2,
  "display": "-2",
  "userAnswer": "-2"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "-2",
  "message": "Correct!"
}
```

**Checking Logic by Type:**

**determinant:**
- Parse user answer as integer
- Direct numeric comparison

**add, scalar, multiply:**
- Parse matrix: remove brackets, split by semicolon (rows), split by comma (elements)
- Check dimensions: must be 2×2
- Correct if all elements match expected matrix

## 5. Question Generation Algorithm

### Helper Functions
```
function triRand(lo, hi)
  return lo + floor(random() * (hi - lo + 1))

function triPick(arr)
  return arr[floor(random() * arr.length)]
```

### Easy — Matrix Addition

```
difficulty = 'easy':
  A = [[triRand(-5,9), triRand(-5,9)], [triRand(-5,9), triRand(-5,9)]]
  B = [[triRand(-5,9), triRand(-5,9)], [triRand(-5,9), triRand(-5,9)]]
  R = [[A[0][0]+B[0][0], A[0][1]+B[0][1]], [A[1][0]+B[1][0], A[1][1]+B[1][1]]]

  formatMatrix = (m) => "[{m[0][0]},{m[0][1]};{m[1][0]},{m[1][1]}]"
  prompt = "A = {formatMatrix(A)}, B = {formatMatrix(B)}. Find A + B."
  answer = R
  display = formatMatrix(R)
  type = 'add'
```

### Medium — Scalar Multiplication

```
difficulty = 'medium':
  k = triRand(-3, 5)
  if k == 0: k = 2

  A = [[triRand(-5,9), triRand(-5,9)], [triRand(-5,9), triRand(-5,9)]]
  R = [[k*A[0][0], k*A[0][1]], [k*A[1][0], k*A[1][1]]]

  formatMatrix = (m) => "[{m[0][0]},{m[0][1]};{m[1][0]},{m[1][1]}]"
  prompt = "A = {formatMatrix(A)}. Find {k}A."
  answer = R
  display = formatMatrix(R)
  type = 'scalar'
```

### Hard — Determinant

```
difficulty = 'hard':
  a = triRand(-5, 8)
  b = triRand(-5, 8)
  c = triRand(-5, 8)
  d = triRand(-5, 8)

  det = a*d - b*c
  prompt = "Find the determinant of [{a},{b};{c},{d}]"
  answer = det
  display = String(det)
  type = 'determinant'
```

### Extra Hard — Matrix Multiplication

```
difficulty = 'extrahard':
  A = [[triRand(-3,5), triRand(-3,5)], [triRand(-3,5), triRand(-3,5)]]
  B = [[triRand(-3,5), triRand(-3,5)], [triRand(-3,5), triRand(-3,5)]]

  R = [
    [A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
    [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]
  ]

  formatMatrix = (m) => "[{m[0][0]},{m[0][1]};{m[1][0]},{m[1][1]}]"
  prompt = "A = {formatMatrix(A)}, B = {formatMatrix(B)}. Find AB."
  answer = R
  display = formatMatrix(R)
  type = 'multiply'
```

## 6. Answer Checking Logic

**String Normalization:**
```
userStr = userAnswer.replace(/\s+/g, '').replace(/−/g, '-')
```

**For determinant:**
```
userNum = parseInt(userStr)
correct = !isNaN(userNum) && userNum === expectedAnswer
```

**For matrix operations:**
```
// Parse: [a,b;c,d]
parsed = userStr.replace(/[\[\]]/g, '').split(';')
if parsed.length === 2:
  row0 = parsed[0].split(',').map(Number)
  row1 = parsed[1].split(',').map(Number)
  if row0.length === 2 && row1.length === 2:
    correct = all elements match expected matrix exactly
```

## 7. Registration

**allApps Key:** `matrix`

**modeMap Component:** `MatrixApp` (registered in `modeMap` object)

**CUSTOM_PUZZLES Entry:**
```javascript
{ key: 'matrix', name: 'Matrices' }
```

**fetchQuestionForType URL:**
```
`${API}/matrix-api/question?difficulty=${difficulty}`
```

**apiMap Entry:**
```javascript
matrix: 'matrix-api'
```

**Factory Configuration (App.jsx line 3345–3350):**
```javascript
const MatrixApp = makeQuizApp({
  title: 'Matrices',
  subtitle: 'Add, multiply, determinant',
  apiPath: 'matrix-api',
  diffLabels: {
    easy: 'Easy — Addition',
    medium: 'Medium — Scalar ×',
    hard: 'Hard — Determinant',
    extrahard: 'Extra Hard — Multiply'
  },
  placeholders: (q, d) => d === 'hard' ? 'e.g. 7' : 'e.g. [1,2;3,4]',
  tip: 'Enter matrices as [a,b;c,d] — semicolon separates rows'
})
```

## 8. Adaptive Mode

**Supported:** Yes, via `makeQuizApp()` factory

**Adaptive Score Range:** 0 to 3
- Score 0.0 → Difficulty: easy
- Score 0.75–1.5 → Difficulty: medium
- Score 1.75–2.5 → Difficulty: hard
- Score 2.75+ → Difficulty: extrahard

**Score Adjustment:**
- Correct answer: +0.25
- Wrong answer: −0.35

**Visual Feedback:**
- Gradient progress bar
- Real-time difficulty label: "Easy", "Medium", "Hard", "Extra Hard"
- Colors: easy (#4caf50), medium (#ff9800), hard (#f44336), extrahard (#9c27b0)
