# Integration — Formal Specification

## 1. Overview

Integration quiz covering reverse differentiation and definite integrals. Teaches students to:
- Apply the power rule for integration (reverse differentiation)
- Evaluate definite integrals of polynomials
- Use substitution techniques
- Calculate areas under curves

**Target Grade Level:** Secondary (GCSE/A-Level equivalent)

---

## 2. Component Specification

**Component Name:** `IntegApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Integration'`
- `subtitle: 'Reverse differentiation & areas'`
- `apiPath: 'integ-api'`
- `diffLabels: { easy: 'Easy — Power rule', medium: 'Medium — Definite integral', hard: 'Hard — Substitution', extrahard: 'Extra Hard — Area under curve' }`

**Answer Format:** Number or fraction (e.g., `3/4`, `27`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Integrate ax^n | ∫3x² dx — find coefficient of x³ | Integer or fraction, e.g., `1` |
| medium | Definite integral of polynomial | ∫₀^2 (2x²+3x+1) dx | Integer or fraction, e.g., `14/3` |
| hard | Substitution-style (ax+b)^n | ∫₀^1 (2x+1)³ dx | Integer or fraction |
| extrahard | Area between curve and x-axis | Area under y=x²−4x between roots | Integer or fraction |

---

## 4. API Endpoints

### GET /integ-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "Integrate 3x² dx.\nGive the coefficient of x³ (as a fraction if needed).",
  "answer": "1",
  "display": "1x^3 + C",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Evaluate ∫₀^2 (2x² + 3x) dx.",
  "answer": "14/3",
  "display": "14/3",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Evaluate ∫₀^1 (2x+1)³ dx.",
  "answer": "65/8",
  "display": "65/8",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Find the area enclosed between y = x² − 4x and the x-axis.",
  "answer": "32/6",
  "display": "32/6",
  "difficulty": "extrahard"
}
```

### POST /integ-api/check

**Request Body:**
```json
{
  "userAnswer": "1",
  "answer": "1",
  "display": "1x^3 + C"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "1x^3 + C",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Exact string match (after removing whitespace)
- Numeric equivalence check: if answers are fractions, evaluate both and compare within tolerance of 0.001
- Examples: `1` matches `1/1`, `3/4` matches `0.75`

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Power Rule Integration)

**Algorithm:**
```
1. a = random integer from 1 to 8
2. n = random integer from 1 to 4
3. Integrate ax^n:
   - New coefficient: a / (n+1), reduced to lowest terms
   - New power: n+1
4. answer = coefficient of x^(n+1) as fraction string
5. display = "{answer}x^{n+1} + C"
6. prompt = "Integrate {a}x{n} dx. Give the coefficient of x^{n+1} (as a fraction if needed)."
```

**Example:** a=3, n=2 → ∫3x² dx = (3/3)x³ + C = x³ + C → answer="1"

### Difficulty: Medium (Definite Polynomial Integral)

**Algorithm:**
```
1. a = random integer from 1 to 4
2. b = random integer from -5 to 5
3. c = random integer from 0 to 6
4. k = random integer from 1 to 4
5. Integrate ax² + bx + c from 0 to k:
   - ∫(ax² + bx + c)dx = (a/3)x³ + (b/2)x² + cx
   - Evaluate at k: (a/3)k³ + (b/2)k² + ck
6. Convert to fraction: numerator = 2a*k³ + 3b*k² + 6c*k, denominator = 6
7. Reduce using GCD
8. answer = fraction string
```

**Example:** a=1, b=1, c=1, k=2 → ∫₀²(x² + x + 1)dx = (1/3)(8) + (1/2)(4) + 2 = 8/3 + 2 + 2 = 32/6 = 16/3

### Difficulty: Hard (Substitution-style)

**Algorithm:**
```
1. a = random integer from 1 to 3
2. b = random integer from -3 to 3
3. n = random integer from 2 to 4
4. lo = 0, hi = random integer from 1 to 3
5. Integrate (ax+b)^n:
   - Antiderivative = (ax+b)^(n+1) / (a(n+1))
   - Evaluate: F(hi) - F(lo)
6. If result is integer, use it; else express as reduced fraction
7. answer = value as integer or fraction string
```

**Example:** a=1, b=1, n=2, hi=1 → ∫₀¹(x+1)³ dx = [(x+1)⁴/4]₀¹ = (2⁴/4) - (1⁴/4) = 4 - 0.25 = 15/4

### Difficulty: ExtraHard (Area Under Curve)

**Algorithm:**
```
1. k = random integer from 2 to 6
2. Question: Find area between y = x² - kx and x-axis
3. Roots: x² - kx = 0 → x(x-k) = 0 → roots at 0 and k
4. Area = |∫₀^k (x² - kx) dx|
   - = |[x³/3 - kx²/2]₀^k|
   - = |k³/3 - k³/2|
   - = |k³(2/6 - 3/6)| = k³/6
5. answer = k³/6 as reduced fraction
```

**Example:** k=4 → area = 64/6 = 32/3

---

## 6. Answer Checking Logic

**Exact Match:**
- Remove all whitespace from user answer and server answer
- Compare strings directly (e.g., "1/2" === "1/2")

**Numeric Equivalence:**
- Parse both strings as fractions:
  - If contains "/", split and evaluate: numerator / denominator
  - Else parse as float
- Compare: |user_value - server_value| < 0.001
- Example: user="0.5" matches server="1/2" because 0.5 ≈ 0.5

---

## 7. Registration

**allApps Key:** `integ`

**modeMap Component Name:** `IntegApp`

**CUSTOM_PUZZLES Registry Entry:** `Integration`

**fetchQuestionForType URL:** `/integ-api/question`

**apiMap Entry:**
```javascript
integ: {
  fetchQuestion: '/integ-api/question',
  checkAnswer: '/integ-api/check'
}
```

---

## 8. Adaptive Mode

Adaptive mode is supported with float-based scoring:
- Score range: 0.0 to 3.0
- Correct answer: +0.25
- Incorrect answer: -0.35
- Score bounds: always 0.0 ≤ score ≤ 3.0

Difficulty progression determined by current score in adaptive session.

---

## 9. Implementation Notes

- Helper function `gcd(a, b)` used for fraction reduction (Euclidean algorithm)
- Fractions always reduced to lowest terms before display
- Negative denominators normalized (e.g., 3/-4 becomes -3/4)
- Polynomial coefficients formatted with appropriate signs (e.g., "2x² - 3x" not "2x² + -3x")
