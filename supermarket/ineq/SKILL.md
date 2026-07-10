# Inequalities — Formal Specification

## 1. Overview

**Inequalities** teaches students to solve linear and quadratic inequalities, represent solutions on number lines, and work with interval notation. Students progress from simple linear inequalities through double inequalities to quadratic inequalities with two solutions.

**Target Grade Level:** Secondary/GCSE Mathematics (ages 13+)

**Key Concepts Covered:**
- Linear inequalities: ax + b > c
- Inequality reversal when dividing by negative numbers
- Double inequalities: a < mx + c < b
- Quadratic inequalities: x² − bx + c ≤ 0
- Integer solutions within intervals
- Interval notation and compound inequalities

## 2. Component Specification

**Component Name:** `IneqApp`

**Factory:** Created via `makeQuizApp()` factory function with configuration:
```javascript
{
  title: 'Inequalities',
  subtitle: 'Linear & quadratic inequalities',
  apiPath: 'ineq-api',
  diffLabels: {
    easy: 'Easy — Linear',
    medium: 'Medium — List integers',
    hard: 'Hard — Quadratic',
    extrahard: 'Extra Hard — Count'
  },
  placeholders: (q, d) => d === 'easy' ? 'e.g. x > 3' : d === 'medium' ? 'e.g. -1, 0, 1, 2' : d === 'hard' ? 'e.g. 1<=x<=5' : 'e.g. 7',
  tip: 'Use >= for ≥ and <= for ≤'
}
```

**Props:**
- `onBack`: Callback function to return to menu

**Features:**
- Four difficulty levels: easy, medium, hard, extrahard
- Dynamic placeholder text based on difficulty
- Accepts various answer formats (symbols, fractions, intervals)
- Type-specific answer checking with normalized string comparison
- Adaptive mode supported: score ranges 0–3, +0.25 for correct, −0.35 for wrong

## 3. Difficulty Levels

| Level | Type | Focus | Example | Expected Answer |
|-------|------|-------|---------|-----------------|
| **Easy** | Linear inequality | Solve ax + b > c (handle negative coefficients) | "Solve: 2x + 3 > 7" | x > 2 |
| **Easy** | Linear inequality | Inequality with subtraction | "Solve: 3x − 5 ≤ 10" | x ≤ 5 |
| **Medium** | Double inequality | List integers in range a < mx + c < b | "List integers: 1 < 2x + 1 < 9" | 1, 2, 3 |
| **Hard** | Quadratic inequality | Solve factored form (x−r₁)(x−r₂) ≤ 0 | "Solve: x² − 3x + 2 ≤ 0" | 1 ≤ x ≤ 2 |
| **Hard** | Quadratic inequality | Solve (x−r₁)(x−r₂) ≥ 0 | "Solve: x² − 5x + 6 ≥ 0" | x ≤ 2 or x ≥ 3 |
| **Extra Hard** | Count integers | Count integer solutions to a ≤ ax + b ≤ c | "How many integers satisfy: −10 ≤ 3x + 2 ≤ 8?" | 6 |

## 4. API Endpoints

### GET /ineq-api/question

**Query Parameters:**
- `difficulty`: 'easy' | 'medium' | 'hard' | 'extrahard' (default: 'easy')

**Response (Easy — Linear):**
```json
{
  "id": 1234567890,
  "difficulty": "easy",
  "type": "linear",
  "prompt": "Solve: 2x + 3 > 7",
  "display": "x > 2",
  "ansNum": 2,
  "ansDen": 1,
  "resultOp": ">"
}
```

**Response (Medium — List Integers):**
```json
{
  "id": 1234567890,
  "difficulty": "medium",
  "type": "list_integers",
  "prompt": "List the integers satisfying: 1 < 2x + 1 < 9",
  "answer": [1, 2, 3],
  "display": "1, 2, 3"
}
```

**Response (Hard — Quadratic):**
```json
{
  "id": 1234567890,
  "difficulty": "hard",
  "type": "quadratic",
  "prompt": "Solve: x² − 3x + 2 ≤ 0",
  "display": "1 ≤ x ≤ 2",
  "r1": 1,
  "r2": 2,
  "op": "<="
}
```

**Response (Extra Hard — Count):**
```json
{
  "id": 1234567890,
  "difficulty": "extrahard",
  "type": "count_integers",
  "prompt": "How many integers satisfy: −10 ≤ 3x + 2 ≤ 8?",
  "answer": 6,
  "display": "6"
}
```

### POST /ineq-api/check

**Request Body:**
```json
{
  "type": "linear",
  "display": "x > 2",
  "ansNum": 2,
  "ansDen": 1,
  "resultOp": ">",
  "userAnswer": "x>2"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "x > 2",
  "message": "Correct!"
}
```

**Checking Logic by Type:**

**linear:**
- Normalize both strings: remove whitespace, replace minus (−) with hyphen, replace >= with ≥, <= with ≤
- Compare normalized display string with user answer
- Accept alternative symbol formats (>= vs ≥, etc.)

**list_integers:**
- Parse user answer as comma-separated integers or "none"
- Sort both arrays
- Correct if arrays match exactly

**quadratic:**
- Normalize: remove whitespace, replace symbols
- Accept variations like "1<=x<=5" or "x<=1 or x>=5"
- Flexible matching for different orderings

**count_integers:**
- Parse user answer as integer
- Correct if matches expected count

## 5. Question Generation Algorithm

### Helper Functions
```
function triRand(lo, hi)
  return lo + floor(random() * (hi - lo + 1))

function triPick(arr)
  return arr[floor(random() * arr.length)]

function gcd(a, b)
  return b === 0 ? a : gcd(b, a % b)
```

### Easy — Linear Inequality

```
difficulty = 'easy':
  a = triPick([1, 2, 3, 4, 5, -1, -2, -3])
  b = triRand(-10, 10)
  c = triRand(-10, 10)
  op = triPick(['>', '<', '>=', '<='])

  // Solve: ax + b > c → x > (c-b)/a
  val = (c - b) / a

  // Flip inequality if a < 0
  resultOp = op
  if a < 0:
    resultOp = flip(op)  // > becomes <, >= becomes <=, etc.

  // Simplify fraction
  g = gcd(|c - b|, |a|)
  ansNum = (c - b) / g
  ansDen = |a| / g
  valStr = (ansDen == 1) ? String(ansNum) : "{ansNum}/{ansDen}"

  display = "x {resultOp} {valStr}"
  prompt = "Solve: {a}x {b>=0 ? '+ ' : '− '}|b| {op} {c}"
```

### Medium — Double Inequality

```
difficulty = 'medium':
  m = triRand(1, 3)
  c = triRand(-5, 5)
  lo = triRand(-8, 2)
  hi = lo + triRand(4, 10)

  // Solve: lo < mx + c < hi
  xLo = (lo - c) / m
  xHi = (hi - c) / m

  integers = []
  for i = ceil(xLo + 0.001) to hi:
    integers.push(i)

  display = integers.join(', ') || 'none'
  prompt = "List the integers satisfying: {lo} < {m}x {c>=0 ? '+ ' : '− '}|c| < {hi}"
```

### Hard — Quadratic Inequality

```
difficulty = 'hard':
  r1 = triRand(-5, 5)
  r2 = triRand(r1 + 1, r1 + 8)

  // (x - r1)(x - r2) = x² - (r1 + r2)x + r1*r2
  B = -(r1 + r2)
  C = r1 * r2
  op = triPick(['<=', '>='])

  prompt = "Solve: x² {B>=0 ? '+ ' : '− '}|B|x {C>=0 ? '+ ' : '− '}|C| {op} 0"

  if op == '<=':
    display = "{r1} ≤ x ≤ {r2}"
  else:
    display = "x ≤ {r1} or x ≥ {r2}"
```

### Extra Hard — Count Integers

```
difficulty = 'extrahard':
  a = triRand(-3, 3)
  if a == 0: a = 1
  b = triRand(-5, 5)
  lo = triRand(-10, 0)
  hi = triRand(1, 10)

  // Solve: lo ≤ ax + b ≤ hi
  xLo = (lo - b) / a
  xHi = (hi - b) / a

  realLo = min(xLo, xHi)
  realHi = max(xLo, xHi)

  count = 0
  for i = ceil(realLo - 0.001) to floor(realHi + 0.001):
    val = a * i + b
    if lo <= val <= hi:
      count++

  prompt = "How many integers satisfy: {lo} ≤ {a===1 ? '' : a}x {b>=0 ? '+ ' : '− '}|b| ≤ {hi}?"
```

## 6. Answer Checking Logic

**String Normalization:**
```
userStr = userAnswer
  .replace(/\s+/g, '')           // Remove whitespace
  .replace(/−/g, '-')             // Normalize minus symbol
  .replace(/>=/g, '≥')            // Normalize >= to ≥
  .replace(/<=/g, '≤')            // Normalize <= to ≤
```

**Type-Specific Matching:**

**linear:**
- Compare normalized display with user answer
- Also accept symbol variants (>= for ≥)
- Case-insensitive x variable

**list_integers:**
- Split by comma, parse each as integer
- Handle "none" or empty input as empty array
- Sort both lists and compare element-wise

**quadratic:**
- Accept variations: "1<=x<=5", "x<=1orx>=5", etc.
- Relaxed matching: compare after normalization
- Allow different orderings (e.g., "5≥x≥1" for "1≤x≤5")

**count_integers:**
- Parse single integer
- Direct numeric comparison

## 7. Registration

**allApps Key:** `ineq`

**modeMap Component:** `IneqApp` (registered in `modeMap` object)

**CUSTOM_PUZZLES Entry:**
```javascript
{ key: 'ineq', name: 'Inequalities' }
```

**fetchQuestionForType URL:**
```
`${API}/ineq-api/question?difficulty=${difficulty}`
```

**apiMap Entry:**
```javascript
ineq: 'ineq-api'
```

**Factory Configuration (App.jsx line 3320–3325):**
```javascript
const IneqApp = makeQuizApp({
  title: 'Inequalities',
  subtitle: 'Linear & quadratic inequalities',
  apiPath: 'ineq-api',
  diffLabels: {
    easy: 'Easy — Linear',
    medium: 'Medium — List integers',
    hard: 'Hard — Quadratic',
    extrahard: 'Extra Hard — Count'
  },
  placeholders: (q, d) => d === 'easy' ? 'e.g. x > 3' : d === 'medium' ? 'e.g. -1, 0, 1, 2' : d === 'hard' ? 'e.g. 1<=x<=5' : 'e.g. 7',
  tip: 'Use >= for ≥ and <= for ≤'
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
- Gradient progress bar showing level transition
- Current level label: "Easy", "Medium", "Hard", "Extra Hard"
- Color-coded: easy (#4caf50), medium (#ff9800), hard (#f44336), extrahard (#9c27b0)

**Example Flow:**
1. Start easy (score 0)
2. Answer 4 correct → score 1 (enters medium territory)
3. Answer 1 wrong → score 0.65 (back to easy)
4. Answer 5 correct → score 1.9 (transitions to hard)
