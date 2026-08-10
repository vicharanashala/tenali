# Rounding — Formal Specification

## 1. Overview

Rounding quiz covering decimal places, significant figures, truncation, and estimation. Teaches students to:
- Round to a specified number of decimal places (dp)
- Round to a specified number of significant figures (sf)
- Truncate (not round) a decimal to N places
- Estimate products by rounding each factor to 1 sf

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `RoundingApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Rounding'`
- `subtitle: 'Decimal places, significant figures, estimation'`
- `apiPath: 'rounding-api'`
- `diffLabels: { easy: 'Easy — Decimal places', medium: 'Medium — Significant figures', hard: 'Hard — Truncate', extrahard: 'Extra Hard — Estimate' }`

**Answer Format:** Number (decimal or integer, e.g., `3.46`, `4600`, `1600`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Round to N dp | Round 3.4567 to 2 dp | Decimal, e.g., `3.46` |
| medium | Round to N sf | Round 4567 to 2 sf | Integer, e.g., `4600` |
| hard | Truncate to N dp | Truncate 3.4567 to 2 dp | Decimal, e.g., `3.45` |
| extrahard | Estimate product | Estimate 37 × 42 by rounding to 1 sf | Integer, e.g., `1600` |

---

## 4. API Endpoints

### GET /rounding-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "Round 3.4567 to 2 decimal places.",
  "answer": 3.46,
  "display": "3.46",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Round 4567 to 2 significant figures.",
  "answer": 4600,
  "display": "4600",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Truncate 3.4567 to 2 decimal places.",
  "answer": 3.45,
  "display": "3.45",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Estimate 37 × 42 by rounding each number to 1 significant figure.",
  "answer": 1600,
  "display": "1600",
  "difficulty": "extrahard"
}
```

### POST /rounding-api/check

**Request Body:**
```json
{
  "userAnswer": "3.46",
  "answer": 3.46,
  "display": "3.46"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "3.46",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove whitespace)
- Compare: |user_value - server_answer| < 0.005
- Tolerance accommodates minor floating-point precision issues

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Round to N Decimal Places)

**Algorithm:**
```
1. dp = random integer from 1 to 2 (decimal places to round to)
2. num = random(1000, 9999) / 1000, formatted to 4 decimal places
3. Rounded value = parseFloat(num.toFixed(dp))
4. answer = rounded value
5. display = String(answer.toFixed(dp))
6. prompt = "Round {num} to {dp} decimal place{s}."
```

**Example:** dp=2, num=3.4567 → answer=3.46

### Difficulty: Medium (Round to N Significant Figures)

**Algorithm:**
```
1. sf = random integer from 1 to 3 (significant figures)
2. num = random(1000, 99999) / 10^(random 0 to 2) (creates varied magnitude)
3. rounded = parseFloat(num.toPrecision(sf))
4. answer = rounded
5. display = String(rounded)
6. prompt = "Round {num} to {sf} significant figure{s}."
```

**Example:** sf=2, num=4567 → toPrecision(2)="4.6e3" → rounded=4600

### Difficulty: Hard (Truncate to N Decimal Places)

**Algorithm:**
```
1. dp = random integer from 1 to 3 (decimal places)
2. num = random(10000, 99999) / 10000, formatted to 5 decimal places
3. factor = 10^dp
4. Truncated = Math.trunc(parseFloat(num) * factor) / factor
5. answer = truncated
6. display = answer.toFixed(dp)
7. prompt = "Truncate {num} to {dp} decimal place{s}."
```

**Example:** dp=2, num=3.4567 → trunc(3.4567*100)/100 = 345/100 = 3.45

### Difficulty: ExtraHard (Estimate by Rounding to 1 sf)

**Algorithm:**
```
1. a = random integer from 10 to 99
2. b = random integer from 10 to 99
3. aRound = parseFloat(a.toPrecision(1)) (round a to 1 sf)
4. bRound = parseFloat(b.toPrecision(1)) (round b to 1 sf)
5. answer = aRound * bRound
6. display = String(answer)
7. prompt = "Estimate {a} × {b} by rounding each number to 1 significant figure."
```

**Example:** a=37, b=42 → aRound=40, bRound=40 → answer=1600

---

## 6. Answer Checking Logic

**Parsing:**
- Remove whitespace
- Parse as float
- Example: "3.46" → 3.46, "4600" → 4600

**Comparison:**
- |user_value - server_answer| < 0.005
- Tolerates minor floating-point precision variations

---

## 7. Registration

**allApps Key:** `rounding`

**modeMap Component Name:** `RoundingApp`

**CUSTOM_PUZZLES Registry Entry:** `Rounding`

**fetchQuestionForType URL:** `/rounding-api/question`

**apiMap Entry:**
```javascript
rounding: {
  fetchQuestion: '/rounding-api/question',
  checkAnswer: '/rounding-api/check'
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

- Rounding (all levels except hard): uses standard mathematical rounding
- Truncation: always removes digits without considering the next digit
- Significant figures: JavaScript's `toPrecision()` method used
- Estimation: multiplies rounded values (not the original product rounded)
- Decimal places: numbers displayed with exact precision (using `.toFixed()`)
