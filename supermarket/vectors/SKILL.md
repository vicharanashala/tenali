# Vectors — Formal Specification

## 1. Overview

**Vectors** teaches 2D vector operations: addition, scalar multiplication, magnitude calculation, and position vectors. Students work with vectors as displacements and geometric representations.

**Target Grade Level:** A-Level/Secondary Mathematics (ages 15+)

**Key Concepts:**
- Vector addition: component-wise summation
- Scalar multiplication: multiply all components by constant
- Magnitude: |v| = √(x² + y²)
- Position vectors between two points
- Vector notation as (x, y)

## 2. Component Specification

**Component Name:** `VectorsApp`

**Factory:** Created via `makeQuizApp()` with configuration:
```javascript
{
  title: 'Vectors',
  subtitle: 'Add, scale, magnitude',
  apiPath: 'vectors-api',
  diffLabels: { easy: 'Easy — Addition', medium: 'Medium — Scalar ×', hard: 'Hard — Magnitude', extrahard: 'Extra Hard — Position' },
  placeholders: (q, d) => d === 'hard' ? 'e.g. 13' : 'e.g. (3, -2)'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Addition | (2,3) + (1,4) = ? | (3,7) |
| **Medium** | Scalar multiply | 2 × (3,5) = ? | (6,10) |
| **Hard** | Magnitude | Find \|v\| where v=(3,4) | 5 |
| **Extra Hard** | Position vector | Vector AB where A=(1,2), B=(5,8) | (4,6) |

## 4. API Endpoints

### GET /vectors-api/question

**Responses:**

**Easy — Addition:**
```json
{ "type": "add", "prompt": "a = (2, 3), b = (1, 4). Find a + b.", "ansX": 3, "ansY": 7, "display": "(3, 7)" }
```

**Medium — Scalar:**
```json
{ "type": "scalar", "prompt": "a = (3, 5). Find 2a.", "ansX": 6, "ansY": 10, "display": "(6, 10)" }
```

**Hard — Magnitude:**
```json
{ "type": "magnitude", "prompt": "Find |v| where v = (3, 4)", "answer": 5, "display": "5" }
```

**Extra Hard — Position:**
```json
{ "type": "position", "prompt": "A = (1, 2), B = (5, 8). Find vector AB.", "ansX": 4, "ansY": 6, "display": "(4, 6)" }
```

### POST /vectors-api/check

**For magnitude:**
```
userNum = parseFloat(userStr)
correct = |userNum - expected| < 0.5
```

**For vectors (add, scalar, position):**
```
Parse (x, y) format
Correct if both x and y match exactly
```

## 5. Question Generation Algorithm

### Easy — Vector Addition
```
a = [triRand(-8,8), triRand(-8,8)]
b = [triRand(-8,8), triRand(-8,8)]
ans = [a[0]+b[0], a[1]+b[1]]
prompt = "a = ({a[0]}, {a[1]}), b = ({b[0]}, {b[1]}). Find a + b."
ansX = ans[0], ansY = ans[1]
```

### Medium — Scalar Multiplication
```
k = triRand(-3, 5); if k == 0: k = 2
a = [triRand(-6,6), triRand(-6,6)]
ans = [k*a[0], k*a[1]]
prompt = "a = ({a[0]}, {a[1]}). Find {k}a."
ansX = ans[0], ansY = ans[1]
```

### Hard — Magnitude
```
TRIPLES = [[3,4,5], [5,12,13], [8,15,17], [6,8,10]]
[x, y, mag] = triPick(TRIPLES)
sx = triPick([1,-1]), sy = triPick([1,-1])
prompt = "Find |v| where v = ({sx*x}, {sy*y})"
answer = mag
```

### Extra Hard — Position Vector
```
x1 = triRand(-8,8), y1 = triRand(-8,8)
x2 = triRand(-8,8), y2 = triRand(-8,8)
prompt = "A = ({x1}, {y1}), B = ({x2}, {y2}). Find vector AB."
ansX = x2-x1, ansY = y2-y1
```

## 6. Registration

**allApps Key:** `vectors`
**modeMap:** `VectorsApp`
**CUSTOM_PUZZLES:** `{ key: 'vectors', name: 'Vectors' }`
**apiMap:** `vectors: 'vectors-api'`
**Factory (App.jsx 3352–3356):**
```javascript
const VectorsApp = makeQuizApp({
  title: 'Vectors',
  subtitle: 'Add, scale, magnitude',
  apiPath: 'vectors-api',
  diffLabels: { easy: 'Easy — Addition', medium: 'Medium — Scalar ×', hard: 'Hard — Magnitude', extrahard: 'Extra Hard — Position' },
  placeholders: (q, d) => d === 'hard' ? 'e.g. 13' : 'e.g. (3, -2)'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong.

Difficulty transitions: score < 0.75 = easy, 0.75–1.5 = medium, 1.75–2.5 = hard, 2.75+ = extrahard.

**Visual:** Gradient progress bar, real-time level labels and colors (easy #4caf50, medium #ff9800, hard #f44336, extrahard #9c27b0).
