# Variation — Formal Specification

## 1. Overview

Variation quiz covering direct, inverse, and more complex proportional relationships. Teaches students to:
- Recognize direct proportionality (y = kx)
- Recognize inverse proportionality (y = k/x)
- Recognize direct square variation (y = kx²)
- Recognize inverse square root variation (y = k/√x)
- Find the constant of proportionality and apply it to new values

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `VariationApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Variation'`
- `subtitle: 'Direct & inverse proportion equations'`
- `apiPath: 'variation-api'`
- `diffLabels: { easy: 'Easy — Direct', medium: 'Medium — Inverse', hard: 'Hard — Direct square', extrahard: 'Extra Hard — Inverse root' }`

**Answer Format:** Integer or decimal number (e.g., `20`, `45`, `4`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Direct (y = kx) | y=12 when x=3, find y when x=5 | Integer, e.g., `20` |
| medium | Inverse (y = k/x) | y=6 when x=4, find y when x=3 | Integer, e.g., `8` |
| hard | Direct square (y = kx²) | y=20 when x=2, find y when x=3 | Integer, e.g., `45` |
| extrahard | Inverse root (y = k/√x) | y=6 when x=4, find y when x=9 | Integer, e.g., `4` |

---

## 4. API Endpoints

### GET /variation-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "y is directly proportional to x. When x = 3, y = 12. Find y when x = 5.",
  "answer": 20,
  "display": "20",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "y is inversely proportional to x. When x = 4, y = 6. Find y when x = 3.",
  "answer": 8,
  "display": "8",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "y is directly proportional to x². When x = 2, y = 20. Find y when x = 3.",
  "answer": 45,
  "display": "45",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "y is inversely proportional to √x. When x = 4, y = 6. Find y when x = 9.",
  "answer": 4,
  "display": "4",
  "difficulty": "extrahard"
}
```

### POST /variation-api/check

**Request Body:**
```json
{
  "userAnswer": "20",
  "answer": 20,
  "display": "20"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "20",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove whitespace)
- Compare: |user_value - server_answer| < 0.05
- Tolerance accommodates rounding variations

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Direct Variation y = kx)

**Algorithm:**
```
1. k = random integer from 2 to 9
2. x1 = random integer from 2 to 6
3. y1 = k * x1
4. x2 = random integer from 3 to 8 (different from x1)
5. answer = k * x2
6. prompt = "y is directly proportional to x. When x = {x1}, y = {y1}. Find y when x = {x2}."
7. display = String(answer)
```

**Example:** k=4, x1=3, y1=12, x2=5 → answer=20

### Difficulty: Medium (Inverse Variation y = k/x)

**Algorithm:**
```
1. x1 = random integer from 2 to 6
2. x2 = random integer from 2 to 6
3. kUse = x1 * x2 * randInt(1, 4) (ensure k divisible by both x values)
4. y1 = kUse / x1
5. answer = kUse / x2
6. prompt = "y is inversely proportional to x. When x = {x1}, y = {y1}. Find y when x = {x2}."
7. display = String(answer)
```

**Example:** x1=4, x2=3, kUse=24 → y1=6, answer=8

### Difficulty: Hard (Direct Square Variation y = kx²)

**Algorithm:**
```
1. k = random integer from 1 to 5
2. x1 = random integer from 2 to 5
3. y1 = k * x1²
4. x2 = random integer from 2 to 6 (may equal x1)
5. answer = k * x2²
6. prompt = "y is directly proportional to x². When x = {x1}, y = {y1}. Find y when x = {x2}."
7. display = String(answer)
```

**Example:** k=5, x1=2, y1=20, x2=3 → answer=5*9=45

### Difficulty: ExtraHard (Inverse Square Root Variation y = k/√x)

**Algorithm:**
```
1. x1 ∈ {4, 9, 16, 25} (perfect squares for clean √x)
2. sqrtX1 = √x1
3. k = sqrtX1 * randInt(2, 6)
4. y1 = k / sqrtX1
5. x2 ∈ {4, 9, 16, 25} (different perfect square)
6. sqrtX2 = √x2
7. answer = k / sqrtX2
8. prompt = "y is inversely proportional to √x. When x = {x1}, y = {y1}. Find y when x = {x2}."
9. display = String(answer)
```

**Example:** x1=4, sqrtX1=2, k=12, y1=6, x2=9, sqrtX2=3 → answer=4

---

## 6. Answer Checking Logic

**Parsing:**
- Remove whitespace from user answer
- Parse as float
- Example: " 20 " → 20.0

**Comparison:**
- |user_value - server_answer| < 0.05
- Tolerates minor rounding variations

---

## 7. Registration

**allApps Key:** `variation`

**modeMap Component Name:** `VariationApp`

**CUSTOM_PUZZLES Registry Entry:** `Variation`

**fetchQuestionForType URL:** `/variation-api/question`

**apiMap Entry:**
```javascript
variation: {
  fetchQuestion: '/variation-api/question',
  checkAnswer: '/variation-api/check'
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

- Easy and hard modes always produce integer answers through careful choice of base values
- Medium mode ensures k is divisible by both x values for clean integer answers
- Extra hard mode uses perfect squares {4, 9, 16, 25} to ensure clean square roots
- The constant k varies: small in easy/hard modes (factors), large in medium mode (products)
