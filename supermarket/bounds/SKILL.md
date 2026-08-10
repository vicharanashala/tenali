# Bounds — Formal Specification

## 1. Overview

Bounds quiz covering error intervals from rounding and bounds of calculations. Teaches students to:
- Find lower and upper bounds from rounded values
- Understand error intervals for measurements rounded to 1 decimal place, nearest 10, etc.
- Calculate maximum/minimum values in arithmetic and division operations
- Apply bounds to real-world rounding scenarios

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `BoundsApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Bounds'`
- `subtitle: 'Upper & lower bounds, error intervals'`
- `apiPath: 'bounds-api'`
- `diffLabels: { easy: 'Easy — Lower bound', medium: 'Medium — Nearest 10', hard: 'Hard — Sum bounds', extrahard: 'Extra Hard — Division bounds' }`

**Answer Format:** Decimal number (e.g., `4.25`, `85`, `6.2`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Lower bound (1 dp) | 4.3 rounded to 1 dp — find lower bound | Decimal number, e.g., `4.25` |
| medium | Upper bound (nearest 10) | 80 cm to nearest 10 — find upper bound | Integer, e.g., `85` |
| hard | Upper bound of sum | a=3.4 (1 dp), b=2.7 (1 dp) — find upper bound of a+b | Decimal, e.g., `6.2` |
| extrahard | Upper bound of division | a=5.3 (1 dp), b=2.1 (1 dp) — find upper bound of a÷b to 3 dp | Decimal to 3 dp, e.g., `2.619` |

---

## 4. API Endpoints

### GET /bounds-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "4.3 is rounded to 1 decimal place. What is the lower bound?",
  "answer": 4.25,
  "display": "4.25",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "A length is 80 cm, rounded to the nearest 10 cm. What is the upper bound?",
  "answer": 85,
  "display": "85",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "a = 3.4 (1 d.p.) and b = 2.7 (1 d.p.). Find the upper bound of a + b.",
  "answer": 3.75,
  "display": "3.75",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "a = 5.3 (1 d.p.) and b = 2.1 (1 d.p.). Find the upper bound of a ÷ b. Give answer to 3 d.p.",
  "answer": 2.619,
  "display": "2.619",
  "difficulty": "extrahard"
}
```

### POST /bounds-api/check

**Request Body:**
```json
{
  "userAnswer": "4.25",
  "answer": 4.25,
  "display": "4.25"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "4.25",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove non-numeric characters except decimal point and minus)
- Compare: |user_value - server_answer| < 0.005
- Tolerance accommodates rounding variations in intermediate calculations

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Lower Bound from 1 dp)

**Algorithm:**
```
1. val = random integer from 10 to 99
2. dp1 = random integer from 1 to 9
3. num = val + dp1/10 (e.g., 45 + 0.3 = 45.3)
4. prompt = "{num} is rounded to 1 decimal place. What is the lower bound?"
5. answer = num - 0.05
6. (For 1 dp, bounds are ±0.05)
```

**Example:** val=45, dp1=3 → num=45.3 → answer=45.25

### Difficulty: Medium (Upper Bound from Nearest 10)

**Algorithm:**
```
1. base = random integer from 3 to 15, multiply by 10
   - base ∈ {30, 40, 50, ..., 150}
2. prompt = "A length is {base} cm, rounded to the nearest 10 cm. What is the upper bound?"
3. answer = base + 5
4. (For nearest 10, bounds are ±5)
```

**Example:** base=80 → answer=85

### Difficulty: Hard (Upper Bound of Sum)

**Algorithm:**
```
1. a = random integer from 20 to 50, divide by 10
   - a ∈ {2.0, 2.1, ..., 5.0}
2. b = random integer from 20 to 50, divide by 10
   - b ∈ {2.0, 2.1, ..., 5.0}
3. Both rounded to 1 dp, so bounds are ±0.05
4. Upper bound of (a + b):
   - a_upper = a + 0.05
   - b_upper = b + 0.05
   - answer = (a + 0.05) + (b + 0.05) = a + b + 0.1
5. Round answer to 2 decimal places
6. prompt = "a = {a} (1 d.p.) and b = {b} (1 d.p.). Find the upper bound of a + b."
```

**Example:** a=3.4, b=2.7 → answer=3.4+0.05+2.7+0.05=6.2

### Difficulty: ExtraHard (Upper Bound of Division)

**Algorithm:**
```
1. a = random integer from 30 to 80, divide by 10
   - a ∈ {3.0, 3.1, ..., 8.0}
2. b = random integer from 20 to 40, divide by 10
   - b ∈ {2.0, 2.1, ..., 4.0}
3. Both rounded to 1 dp, so bounds are ±0.05
4. Upper bound of (a ÷ b):
   - a_upper = a + 0.05
   - b_lower = b - 0.05
   - answer = a_upper / b_lower
5. Round to 3 decimal places: Math.round(answer * 1000) / 1000
6. prompt = "a = {a} (1 d.p.) and b = {b} (1 d.p.). Find the upper bound of a ÷ b. Give answer to 3 d.p."
```

**Example:** a=5.3, b=2.1 → answer=(5.3+0.05)/(2.1-0.05)=5.35/2.05≈2.609

---

## 6. Answer Checking Logic

**Parsing:**
- Remove all whitespace and non-numeric characters except decimal point and minus sign
- Parse result as float
- Example: " 4 . 2 5 " → 4.25

**Comparison:**
- |user_value - server_answer| < 0.005
- Tolerates rounding differences in intermediate calculations

---

## 7. Registration

**allApps Key:** `bounds`

**modeMap Component Name:** `BoundsApp`

**CUSTOM_PUZZLES Registry Entry:** `Bounds`

**fetchQuestionForType URL:** `/bounds-api/question`

**apiMap Entry:**
```javascript
bounds: {
  fetchQuestion: '/bounds-api/question',
  checkAnswer: '/bounds-api/check'
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

- Error interval from rounding to 1 dp: ±0.05
- Error interval from rounding to nearest 10: ±5
- For division upper bound, need maximum dividend and minimum divisor (non-zero)
- Answers rounded to 3 dp for division problems to match expected precision
