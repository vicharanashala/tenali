# Differentiation — Formal Specification

## 1. Overview

**Differentiation** teaches calculus derivatives: the power rule, polynomial differentiation, and applications to finding gradients, turning points, and optimization problems. Students find derivatives and apply them to real-world optimization.

**Target Grade Level:** A-Level/IB Mathematics (ages 16+)

**Key Concepts:**
- Power rule: d/dx(ax^n) = anx^(n-1)
- Polynomial differentiation: sum rule applies term-by-term
- Gradient at a point: f'(x₀) = slope of tangent at x₀
- Turning points: f'(x) = 0
- Nature of turning points: f''(x) > 0 = minimum, f''(x) < 0 = maximum
- Optimization: find maximum/minimum values

## 2. Component Specification

**Component Name:** `DiffApp`

**Factory:** Created via `makeQuizApp()` with:
```javascript
{
  title: 'Differentiation',
  subtitle: 'Power rule, turning points',
  apiPath: 'diff-api',
  diffLabels: { easy: 'Easy — Power rule', medium: 'Medium — Polynomial', hard: 'Hard — Turning point x', extrahard: 'Extra Hard — Min/Max value' },
  placeholders: 'e.g. 12 or -3/2'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Power rule | f(x)=3x²,find f'(1) | 6 |
| **Medium** | Polynomial | f(x)=2x²+3x+1,find f'(2) | 11 |
| **Hard** | Turning point x | f(x)=x²−4x+3, f'(x)=0 → x=? | 2 |
| **Extra Hard** | Min/max value | f(x)=x²−4x+3, minimum value=? | -1 |

## 4. API Endpoints

### GET /diff-api/question

**Easy — Power Rule:**
```json
{ "type": "power_rule", "prompt": "f(x) = 3x². Find f'(1).", "answer": 6, "display": "6" }
```

**Medium — Polynomial:**
```json
{ "type": "polynomial", "prompt": "f(x) = 2x² + 3x + 1. Find f'(2).", "answer": 11, "display": "11" }
```

**Hard — Turning Point:**
```json
{ "type": "turning_point", "prompt": "f(x) = x² − 4x + 3. Find x where f'(x) = 0.", "ansNum": 2, "ansDen": 1, "display": "2" }
```

**Extra Hard — Min/Max:**
```json
{ "type": "min_max", "prompt": "f(x) = x² − 4x + 3. Find the minimum value of f(x).", "answer": -1, "display": "-1" }
```

### POST /diff-api/check

**For power_rule, polynomial, min_max:**
```
userNum = parseFloat(userStr)
correct = |userNum - expected| < 0.5
```

**For turning_point (fraction):**
```
Parse fraction or integer
Simplify both and compare
Accept decimal within 0.01 tolerance
```

## 5. Question Generation Algorithm

### Easy — Power Rule
```
a = triRand(1, 6), n = triRand(2, 5)
x = triRand(1, 5)
deriv = a * n * Math.pow(x, n - 1)
prompt = "f(x) = {a}x{sup(n)}. Find f'({x})."
answer = deriv
display = String(deriv)
type = 'power_rule'
```

### Medium — Polynomial
```
a = triRand(-5, 5), b = triRand(-8, 8), c = triRand(-10, 10)
if a === 0: a = 2
x = triRand(-3, 3)
deriv = 2 * a * x + b
bStr = (b >= 0) ? "+ {b}" : "− {Math.abs(b)}"
cStr = (c >= 0) ? "+ {c}" : "− {Math.abs(c)}"
prompt = "f(x) = {a}x² {bStr}x {cStr}. Find f'({x})."
answer = deriv
display = String(deriv)
type = 'polynomial'
```

### Hard — Turning Point
```
a = triRand(1, 4), b = triRand(-10, 10), c = triRand(-10, 10)
// f(x) = ax² + bx + c, f'(x) = 2ax + b = 0 → x = -b/(2a)
g = gcd(Math.abs(b), 2 * a)
ansNum = -b / g
ansDen = (2 * a) / g
bStr = (b >= 0) ? "+ {b}" : "− {Math.abs(b)}"
cStr = (c >= 0) ? "+ {c}" : "− {Math.abs(c)}"
prompt = "f(x) = {a}x² {bStr}x {cStr}. Find x where f'(x) = 0."
display = (ansDen === 1) ? String(ansNum) : "{ansNum}/{ansDen}"
type = 'turning_point'
```

### Extra Hard — Min/Max
```
a = triPick([1, -1, 2, -2, 3])
b = triRand(-8, 8), c = triRand(-10, 10)
xTurn = -b / (2 * a)
yTurn = a * xTurn * xTurn + b * xTurn + c
rounded = round(yTurn * 100) / 100
nature = (a > 0) ? 'minimum' : 'maximum'
bStr = (b >= 0) ? "+ {b}" : "− {Math.abs(b)}"
cStr = (c >= 0) ? "+ {c}" : "− {Math.abs(c)}"
prompt = "f(x) = {a}x² {bStr}x {cStr}. Find the {nature} value of f(x)."
answer = rounded
display = String(rounded)
type = 'min_max'
```

## 6. Registration

**allApps Key:** `diff`
**modeMap:** `DiffApp`
**CUSTOM_PUZZLES:** `{ key: 'diff', name: 'Differentiation' }`
**apiMap:** `diff: 'diff-api'`
**Factory (App.jsx 3382–3386):**
```javascript
const DiffApp = makeQuizApp({
  title: 'Differentiation',
  subtitle: 'Power rule, turning points',
  apiPath: 'diff-api',
  diffLabels: { easy: 'Easy — Power rule', medium: 'Medium — Polynomial', hard: 'Hard — Turning point x', extrahard: 'Extra Hard — Min/Max value' },
  placeholders: 'e.g. 12 or -3/2'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong.
