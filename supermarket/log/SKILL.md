# Logarithms — Formal Specification

## 1. Overview

**Logarithms** teaches logarithmic notation, conversion between exponential and logarithmic form, laws of logarithms, and solving exponential and logarithmic equations. Students understand logarithms as inverse exponentials.

**Target Grade Level:** A-Level Mathematics (ages 16+)

**Key Concepts:**
- Logarithmic notation: log_b(n) = x iff b^x = n
- Laws of logarithms: log(a) + log(b) = log(ab), log(a) - log(b) = log(a/b), k·log(a) = log(a^k)
- Special values: log_b(1) = 0, log_b(b) = 1, log(b^k) = k
- Solving exponential equations: b^x = n → x = log(n) / log(b)
- Solving logarithmic equations: log(x) = n → x = b^n

## 2. Component Specification

**Component Name:** `LogApp`

**Factory:** Created via `makeQuizApp()` with:
```javascript
{
  title: 'Logarithms',
  subtitle: 'Evaluate, simplify, solve',
  apiPath: 'log-api',
  diffLabels: { easy: 'Easy — Evaluate', medium: 'Medium — Laws of logs', hard: 'Hard — Solve bˣ = n', extrahard: 'Extra Hard — Log equations' },
  placeholders: (q, d) => d === 'medium' ? 'e.g. 40 (the argument)' : 'e.g. 3'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Evaluate | log₂(8) = ? | 3 |
| **Easy** | Evaluate | log₃(27) = ? | 3 |
| **Medium** | Simplify logs | log(3) + log(4) = log(?) | 12 |
| **Medium** | Power rule | 2 × log(5) = log(?) | 25 |
| **Hard** | Solve exponential | 2^x = 16 | 4 |
| **Hard** | Solve exponential | 3^x = 27 | 3 |
| **Extra Hard** | Solve log equation | log(x+2) = 1 | 8 |

## 4. API Endpoints

### GET /log-api/question

**Easy — Evaluate:**
```json
{ "type": "evaluate", "prompt": "Evaluate log₂(8)", "answer": 3, "display": "3" }
```

**Medium — Laws of Logs:**
```json
{ "type": "simplify_log", "prompt": "Simplify: log(3) + log(4)", "ansProduct": 12, "base": 10, "display": "log(12)" }
```

**Hard — Solve Exponential:**
```json
{ "type": "solve_exp", "prompt": "Solve: 2ˣ = 16", "answer": 4, "display": "x = 4" }
```

**Extra Hard — Solve Log Equation:**
```json
{ "type": "solve_log", "prompt": "Solve: log(x + 2) = 1", "answer": 8, "display": "x = 8" }
```

### POST /log-api/check

**For evaluate & solve:**
```
userNum = parseFloat(userStr)
correct = |userNum - expected| < 0.01
```

**For simplify_log:**
```
userNum = parseInt(cleaned.replace(/log[subscripts]*/g, '').replace(/[()]/g, ''))
correct = userNum === ansProduct
```

## 5. Question Generation Algorithm

### Easy — Evaluate
```
COMBOS = [
  {b:2, n:4, ans:2}, {b:2, n:8, ans:3}, {b:2, n:16, ans:4}, {b:2, n:32, ans:5},
  {b:2, n:64, ans:6}, {b:3, n:9, ans:2}, {b:3, n:27, ans:3}, {b:3, n:81, ans:4},
  {b:5, n:25, ans:2}, {b:5, n:125, ans:3}, {b:10, n:100, ans:2}, {b:10, n:1000, ans:3},
  {b:4, n:16, ans:2}, {b:4, n:64, ans:3}, {b:7, n:49, ans:2}, {b:6, n:36, ans:2},
  {b:2, n:1, ans:0}, {b:3, n:1, ans:0}, {b:10, n:1, ans:0},
  {b:10, n:10, ans:1}, {b:2, n:2, ans:1}
]
c = triPick(COMBOS)
subStr = (n) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('')
prompt = "Evaluate log{c.b===10 ? '' : subStr(c.b)}({c.n})"
answer = c.ans
display = String(c.ans)
```

### Medium — Laws of Logs
```
base = triPick([2, 3, 10])
subStr = (n) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('')
bStr = (base === 10) ? '' : subStr(base)
subtype = triPick(['add', 'subtract', 'power'])

if subtype === 'add':
  a = triRand(2, 20), b = triRand(2, 20)
  product = a * b
  prompt = "Simplify: log{bStr}({a}) + log{bStr}({b})"
  ansProduct = product
else if subtype === 'subtract':
  b = triRand(2, 8), a = b * triRand(2, 8)
  quotient = a / b
  prompt = "Simplify: log{bStr}({a}) − log{bStr}({b})"
  ansProduct = quotient
else:
  n = triRand(2, 10), k = triRand(2, 4)
  power = Math.pow(n, k)
  prompt = "Simplify: {k} × log{bStr}({n})"
  ansProduct = power

display = "log{bStr}({ansProduct})"
```

### Hard — Solve Exponential
```
COMBOS = [
  {b:2, n:4, x:2}, {b:2, n:8, x:3}, {b:2, n:16, x:4},
  {b:3, n:9, x:2}, {b:3, n:27, x:3}, {b:5, n:25, x:2},
  {b:5, n:125, x:3}, {b:4, n:64, x:3}, {b:10, n:100, x:2},
  {b:2, n:32, x:5}, {b:3, n:81, x:4}
]
c = triPick(COMBOS)
prompt = "Solve: {c.b}ˣ = {c.n}"
answer = c.x
display = "x = {c.x}"
```

### Extra Hard — Solve Log Equation
```
base = triPick([2, 10])
subStr = (n) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('')
bStr = (base === 10) ? '' : subStr(base)
exp = triRand(1, 4)
a = triRand(-10, 10)
val = Math.pow(base, exp)
x = val - a
prompt = "Solve: log{bStr}(x {a>=0 ? '+ ' : '− '}|a|) = {exp}"
answer = x
display = "x = {x}"
```

## 6. Registration

**allApps Key:** `log`
**modeMap:** `LogApp`
**CUSTOM_PUZZLES:** `{ key: 'log', name: 'Logarithms' }`
**apiMap:** `log: 'log-api'`
**Factory (App.jsx 3376–3380):**
```javascript
const LogApp = makeQuizApp({
  title: 'Logarithms',
  subtitle: 'Evaluate, simplify, solve',
  apiPath: 'log-api',
  diffLabels: { easy: 'Easy — Evaluate', medium: 'Medium — Laws of logs', hard: 'Hard — Solve bˣ = n', extrahard: 'Extra Hard — Log equations' },
  placeholders: (q, d) => d === 'medium' ? 'e.g. 40 (the argument)' : 'e.g. 3'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong.
