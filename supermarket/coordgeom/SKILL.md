# Coordinate Geometry — Formal Specification

## 1. Overview

**Coordinate Geometry** teaches students to analyze points and lines in the Cartesian plane, calculating midpoints, distances, gradients, and equations of perpendicular bisectors. Students develop spatial reasoning and algebraic skills for working with coordinates.

**Target Grade Level:** Secondary/GCSE Mathematics (ages 14+)

**Key Concepts Covered:**
- Cartesian coordinates and the distance formula
- Midpoint calculation: ((x₁+x₂)/2, (y₁+y₂)/2)
- Gradient of a line: m = (y₂−y₁)/(x₂−x₁)
- Perpendicular gradients: m₁ × m₂ = −1
- Perpendicular bisector (line at right angles to segment through midpoint)
- Fraction simplification for gradients

## 2. Component Specification

**Component Name:** `CoordGeomApp`

**Factory:** Created via `makeQuizApp()` factory function with configuration:
```javascript
{
  title: 'Coordinate Geometry',
  subtitle: 'Midpoint, distance, gradient',
  apiPath: 'coordgeom-api',
  diffLabels: {
    easy: 'Easy — Midpoint',
    medium: 'Medium — Distance',
    hard: 'Hard — Gradient',
    extrahard: 'Extra Hard — Perp. Bisector'
  },
  placeholders: (q, d) => d === 'easy' ? 'e.g. (3, 4)' : d === 'hard' || d === 'extrahard' ? 'e.g. 3/4 or 2' : 'e.g. 13'
}
```

**Props:**
- `onBack`: Callback function to return to menu

**Features:**
- Four difficulty levels: easy, medium, hard, extrahard
- Mixed answer types (coordinates, decimals, fractions)
- Adaptive mode supported: score ranges 0–3, +0.25 for correct, −0.35 for wrong

## 3. Difficulty Levels

| Level | Type | Focus | Example | Expected Answer |
|-------|------|-------|---------|-----------------|
| **Easy** | Midpoint | Find midpoint between two points | "Find midpoint of (0, 4) and (6, 10)" | (3, 7) |
| **Medium** | Distance | Distance formula with Pythagorean triples | "Find distance between (0, 0) and (3, 4)" | 5 |
| **Medium** | Distance | With negative coordinates | "Find distance between (−2, 1) and (3, 5)" | √41 ≈ 6.4 |
| **Hard** | Gradient | Simple gradient of line through two points | "Find gradient of line through (0, 0) and (2, 6)" | 3 |
| **Hard** | Gradient | Fractional gradient | "Find gradient through (1, 2) and (4, 3)" | 1/3 |
| **Extra Hard** | Perp. Bisector | Gradient of perpendicular bisector | "Find gradient of perp. bisector of (0, 0) and (4, 4)" | −1 |

## 4. API Endpoints

### GET /coordgeom-api/question

**Query Parameters:**
- `difficulty`: 'easy' | 'medium' | 'hard' | 'extrahard' (default: 'easy')

**Response (Easy — Midpoint):**
```json
{
  "id": 1234567890,
  "difficulty": "easy",
  "type": "midpoint",
  "prompt": "Find the midpoint of (0, 4) and (6, 10)",
  "ansX": 3,
  "ansY": 7,
  "display": "(3, 7)"
}
```

**Response (Medium — Distance):**
```json
{
  "id": 1234567890,
  "difficulty": "medium",
  "type": "distance",
  "prompt": "Find the distance between (0, 0) and (3, 4)",
  "answer": 5,
  "display": "5"
}
```

**Response (Hard — Gradient):**
```json
{
  "id": 1234567890,
  "difficulty": "hard",
  "type": "gradient",
  "prompt": "Find the gradient of the line through (0, 0) and (2, 6)",
  "ansNum": 3,
  "ansDen": 1,
  "display": "3"
}
```

**Response (Extra Hard — Perpendicular Bisector):**
```json
{
  "id": 1234567890,
  "difficulty": "extrahard",
  "type": "perp_bisector",
  "prompt": "Find the gradient of the perpendicular bisector of (0, 0) and (4, 4)",
  "ansNum": -1,
  "ansDen": 1,
  "display": "-1"
}
```

### POST /coordgeom-api/check

**Request Body:**
```json
{
  "type": "gradient",
  "ansNum": 3,
  "ansDen": 1,
  "display": "3",
  "userAnswer": "3"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "3",
  "message": "Correct!"
}
```

**Checking Logic by Type:**

**midpoint:**
- Parse user answer as (x, y) format
- Extract x and y values
- Correct if both match exactly

**distance:**
- Parse as float
- Correct if `|userNum - expected| < 0.5` (tolerance)

**gradient & perp_bisector:**
- Try parsing as fraction "a/b"
- Try parsing as integer
- Simplify both user and expected fractions
- Correct if simplified forms match

## 5. Question Generation Algorithm

### Helper Functions
```
function triRand(lo, hi)
  return lo + floor(random() * (hi - lo + 1))

function triPick(arr)
  return arr[floor(random() * arr.length)]

function gcd(a, b)
  return b === 0 ? a : gcd(b, a % b)

function simplifyFraction(num, den)
  g = gcd(abs(num), abs(den))
  return { num: num/g, den: den/g }
```

### Easy — Midpoint

```
difficulty = 'easy':
  // Use even sums for clean midpoints
  x1 = triRand(-10, 10)
  y1 = triRand(-10, 10)
  x2 = x1 + 2 * triRand(-5, 5)
  y2 = y1 + 2 * triRand(-5, 5)

  mx = (x1 + x2) / 2
  my = (y1 + y2) / 2

  prompt = "Find the midpoint of ({x1}, {y1}) and ({x2}, {y2})"
  ansX = mx
  ansY = my
  display = "({mx}, {my})"
  type = 'midpoint'
```

### Medium — Distance

```
difficulty = 'medium':
  // Use Pythagorean triples for clean answers
  TRIPLES = [[3,4,5], [5,12,13], [8,15,17], [6,8,10], [9,12,15]]
  [dx, dy, dist] = triPick(TRIPLES)

  x1 = triRand(-5, 5)
  y1 = triRand(-5, 5)
  sx = triPick([1, -1])
  sy = triPick([1, -1])
  x2 = x1 + sx * dx
  y2 = y1 + sy * dy

  prompt = "Find the distance between ({x1}, {y1}) and ({x2}, {y2})"
  answer = dist
  display = String(dist)
  type = 'distance'
```

### Hard — Gradient

```
difficulty = 'hard':
  x1 = triRand(-8, 8)
  y1 = triRand(-8, 8)
  dx = triRand(1, 6) * triPick([1, -1])
  dy = triRand(-8, 8)
  x2 = x1 + dx
  y2 = y1 + dy

  // Simplify dy/dx
  g = gcd(abs(dy), abs(dx))
  ansNum = dy / g * (dx < 0 ? -1 : 1)
  ansDen = abs(dx) / g

  display = (ansDen == 1) ? String(ansNum) : "{ansNum}/{ansDen}"
  prompt = "Find the gradient of the line through ({x1}, {y1}) and ({x2}, {y2})"
  type = 'gradient'
```

### Extra Hard — Perpendicular Bisector

```
difficulty = 'extrahard':
  x1 = triRand(-6, 6)
  y1 = triRand(-6, 6)
  dx = triRand(1, 4) * triPick([1, -1])
  dy = triRand(1, 4) * triPick([1, -1])
  x2 = x1 + 2 * dx
  y2 = y1 + 2 * dy

  // Midpoint: ((x1+x2)/2, (y1+y2)/2)
  mx = (x1 + x2) / 2
  my = (y1 + y2) / 2

  // Original gradient: dy/dx
  // Perpendicular gradient: -dx/dy
  perpNum = -dx
  perpDen = dy

  g = gcd(abs(perpNum), abs(perpDen))
  mNum = perpNum / g * (perpDen < 0 ? -1 : 1)
  mDen = abs(perpDen) / g

  display = (mDen == 1) ? String(mNum) : "{mNum}/{mDen}"
  prompt = "Find the gradient of the perpendicular bisector of ({x1}, {y1}) and ({x2}, {y2})"
  type = 'perp_bisector'
```

## 6. Answer Checking Logic

**String Normalization:**
```
userStr = userAnswer
  .replace(/\s+/g, '')            // Remove whitespace
  .replace(/−/g, '-')              // Normalize minus symbol
```

**Type-Specific Matching:**

**midpoint:**
- Parse as (x, y) by removing parentheses and splitting on comma
- Correct if both x and y match exactly

**distance:**
- Parse as float
- Tolerance check: `|parsed - expected| < 0.5`

**gradient & perp_bisector:**
- Try regex match for "a/b" fraction
- Try parsing as integer
- If fraction: `simplifyFraction(uNum, uDen)` and `simplifyFraction(expected)`
- Correct if simplified forms match
- Also accept decimal approximation with 0.01 tolerance

## 7. Registration

**allApps Key:** `coordgeom`

**modeMap Component:** `CoordGeomApp` (registered in `modeMap` object)

**CUSTOM_PUZZLES Entry:**
```javascript
{ key: 'coordgeom', name: 'Coord. Geometry' }
```

**fetchQuestionForType URL:**
```
`${API}/coordgeom-api/question?difficulty=${difficulty}`
```

**apiMap Entry:**
```javascript
coordgeom: 'coordgeom-api'
```

**Factory Configuration (App.jsx line 3327–3331):**
```javascript
const CoordGeomApp = makeQuizApp({
  title: 'Coordinate Geometry',
  subtitle: 'Midpoint, distance, gradient',
  apiPath: 'coordgeom-api',
  diffLabels: {
    easy: 'Easy — Midpoint',
    medium: 'Medium — Distance',
    hard: 'Hard — Gradient',
    extrahard: 'Extra Hard — Perp. Bisector'
  },
  placeholders: (q, d) => d === 'easy' ? 'e.g. (3, 4)' : d === 'hard' || d === 'extrahard' ? 'e.g. 3/4 or 2' : 'e.g. 13'
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
- Gradient progress bar showing level transitions
- Real-time level label updates
- Color scheme: easy (#4caf50), medium (#ff9800), hard (#f44336), extrahard (#9c27b0)

**Typical Progression:**
1. Start at easy (score 0)
2. 3 correct answers → score 0.75 (entering medium)
3. 1 wrong → score 0.4 (back to easy)
4. 5 correct → score 1.65 (entering hard)
