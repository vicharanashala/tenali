# Binomial Theorem — Formal Specification

## 1. Overview

Binomial Theorem quiz covering binomial expansions and coefficient extraction. Teaches students to:
- Calculate nCr (n choose r) using the combination formula
- Find coefficients in (1+x)^n expansions
- Find coefficients in (a+bx)^n expansions using the binomial coefficient formula
- Extract specific terms from binomial expansions

**Target Grade Level:** Secondary/A-Level (GCSE/A2 equivalent)

---

## 2. Component Specification

**Component Name:** `BinomialApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Binomial Theorem'`
- `subtitle: 'Expansions, coefficients, nCr'`
- `apiPath: 'binomial-api'`
- `diffLabels: { easy: 'Easy — nCr', medium: 'Medium — Coefficient in (1+x)^n', hard: 'Hard — Coefficient in (a+bx)^n', extrahard: 'Extra Hard — Specific term' }`

**Answer Format:** Integer (e.g., `35`, `56`, `720`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Evaluate nCr | Evaluate 7C3 | Integer, e.g., `35` |
| medium | Coefficient in (1+x)^n | Coefficient of x³ in (1+x)⁸ | Integer, e.g., `56` |
| hard | Coefficient in (a+bx)^n | Coefficient of x² in (2+3x)⁵ | Integer, e.g., `720` |
| extrahard | Specific term in (1+x)^n | 4th term in (1+x)⁹ — coefficient only | Integer, e.g., `84` |

---

## 4. API Endpoints

### GET /binomial-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "Evaluate 7C3 (7 choose 3).",
  "answer": 35,
  "display": "35",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Find the coefficient of x^3 in the expansion of (1 + x)^8.",
  "answer": 56,
  "display": "56",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Find the coefficient of x^2 in (2 + 3x)^5.",
  "answer": 720,
  "display": "720",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Find the 4th term in the expansion of (1 + x)^9. Give the coefficient only.",
  "answer": 84,
  "display": "84x^3",
  "difficulty": "extrahard"
}
```

### POST /binomial-api/check

**Request Body:**
```json
{
  "userAnswer": "35",
  "answer": 35,
  "display": "35"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "35",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove all non-numeric characters except decimal point and minus)
- Exact integer match: user_value === server_answer
- No tolerance for integer answers

---

## 5. Question Generation Algorithm

### Helper Function

**nCr(n, r) — Combination Formula:**
```
function nCr(n, r):
  if r > n or r < 0:
    return 0
  if r === 0 or r === n:
    return 1
  result = 1
  for i = 0 to r-1:
    result = result * (n - i) / (i + 1)
  return Math.round(result)
```

### Difficulty: Easy (Evaluate nCr)

**Algorithm:**
```
1. n = random integer from 4 to 10
2. r = random integer from 1 to min(n-1, 5)
3. answer = nCr(n, r)
4. prompt = "Evaluate {n}C{r} ({n} choose {r})."
5. display = String(answer)
```

**Example:** n=7, r=3 → answer=35

### Difficulty: Medium (Coefficient of x^r in (1+x)^n)

**Algorithm:**
```
1. n = random integer from 4 to 10
2. r = random integer from 2 to min(n-1, 5)
3. answer = nCr(n, r) (coefficient of x^r in binomial expansion)
4. prompt = "Find the coefficient of x^{r} in the expansion of (1 + x)^{n}."
5. display = String(answer)
```

**Example:** n=8, r=3 → answer=nCr(8,3)=56

### Difficulty: Hard (Coefficient in (a+bx)^n)

**Algorithm:**
```
1. a = random integer from 1 to 3
2. b = random integer from 1 to 3
3. n = random integer from 3 to 6
4. r = random integer from 1 to min(n, 4)
5. Binomial term: nCr(n,r) * a^(n-r) * (bx)^r
   - Coefficient = nCr(n,r) * a^(n-r) * b^r
6. answer = nCr(n,r) * a^(n-r) * b^r
7. prompt = "Find the coefficient of x^{r} in ({a} + {b}x)^{n}."
8. display = String(answer)
```

**Example:** a=2, b=3, n=5, r=2 → coefficient = nCr(5,2)*2³*3² = 10*8*9 = 720

### Difficulty: ExtraHard (Specific Term in (1+x)^n)

**Algorithm:**
```
1. n = random integer from 5 to 10
2. termNum = random integer from 2 to min(n, 5) (1-indexed term)
3. r = termNum - 1 (0-indexed power for binomial)
4. answer = nCr(n, r) (coefficient of the x^r term)
5. ordinal = format termNum as ordinal (2nd, 3rd, 4th, etc.)
6. prompt = "Find the {ordinal} term in the expansion of (1 + x)^{n}. Give the coefficient only."
7. display = "{answer}x^{r}"
```

**Example:** n=9, termNum=4, r=3 → answer=nCr(9,3)=84

---

## 6. Answer Checking Logic

**Parsing:**
- Remove all non-numeric characters except decimal point and minus
- Parse as float, then check as integer
- Example: "35" → 35

**Comparison:**
- Exact integer match: user_value === server_answer
- No tolerance; answers must be exact integers

---

## 7. Registration

**allApps Key:** `binomial`

**modeMap Component Name:** `BinomialApp`

**CUSTOM_PUZZLES Registry Entry:** `Binomial Theorem`

**fetchQuestionForType URL:** `/binomial-api/question`

**apiMap Entry:**
```javascript
binomial: {
  fetchQuestion: '/binomial-api/question',
  checkAnswer: '/binomial-api/check'
}
```

---

## 8. Adaptive Mode

Adaptive mode is supported with float-based scoring:
- Score range: 0.0 to 3.0
- Correct answer: +0.25
- Incorrect answer: -0.35
- Score bounds: always 0.0 ≤ score ≤ 3.0

---

## 9. Implementation Notes

- nCr formula: C(n,r) = n! / (r!(n-r)!) = (n × (n-1) × ... × (n-r+1)) / (r!)
- Implementation uses iterative multiplication to avoid large factorial calculations
- Binomial expansion: (a+bx)^n = Σ nCr(n,r) × a^(n-r) × (bx)^r
- Coefficient of x^r term: nCr(n,r) × a^(n-r) × b^r
- All answers are integers (product of integers)
- Parameters chosen to keep coefficients reasonable (< 10000)
