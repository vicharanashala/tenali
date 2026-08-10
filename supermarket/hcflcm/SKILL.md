# HCF & LCM — Formal Specification

## 1. Overview

Highest Common Factor (HCF) and Lowest Common Multiple (LCM) quiz. Teaches students to:
- Find the HCF of two numbers using prime factorization or Euclidean algorithm
- Find the LCM of two numbers using prime factorization or HCF formula
- Find LCM of three or more numbers
- Apply HCF and LCM to real-world problems (scheduling, intervals, etc.)

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `HcfLcmApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'HCF & LCM'`
- `subtitle: 'Highest common factor & lowest common multiple'`
- `apiPath: 'hcflcm-api'`
- `diffLabels: { easy: 'Easy — HCF of two', medium: 'Medium — LCM of two', hard: 'Hard — LCM of three', extrahard: 'Extra Hard — Word problem' }`

**Answer Format:** Integer (e.g., `12`, `24`, `60`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | HCF of two numbers | Find HCF(24, 36) | Integer, e.g., `12` |
| medium | LCM of two numbers | Find LCM(8, 12) | Integer, e.g., `24` |
| hard | LCM of three numbers | Find LCM(4, 6, 10) | Integer, e.g., `60` |
| extrahard | Word problem (interval/scheduling) | Buses every 12 and 18 min — when next together? | Integer, e.g., `36` |

---

## 4. API Endpoints

### GET /hcflcm-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "Find the HCF of 24 and 36.",
  "answer": 12,
  "display": "12",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Find the LCM of 8 and 12.",
  "answer": 24,
  "display": "24",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Find the LCM of 4, 6, and 10.",
  "answer": 60,
  "display": "60",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Bus A departs every 12 minutes and Bus B every 18 minutes. They both leave at 9:00. After how many minutes will they next depart together?",
  "answer": 36,
  "display": "36 minutes",
  "difficulty": "extrahard"
}
```

### POST /hcflcm-api/check

**Request Body:**
```json
{
  "userAnswer": "12",
  "answer": 12,
  "display": "12"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "12",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove all non-numeric characters except decimal point and minus)
- Exact integer match: user_value === server_answer

---

## 5. Question Generation Algorithm

### Helper Functions

**gcd(a, b) — Euclidean Algorithm:**
```
function gcd(a, b):
  while b ≠ 0:
    temp = b
    b = a mod b
    a = temp
  return a
```

**lcm(a, b) — Using HCF:**
```
function lcm(a, b):
  return abs(a * b) / gcd(a, b)
```

### Difficulty: Easy (HCF of Two Numbers)

**Algorithm:**
```
1. g = random integer from 2 to 12 (the HCF)
2. a = g * randInt(2, 7)
3. b = g * randInt(2, 7)
4. answer = gcd(a, b) = g
5. prompt = "Find the HCF of {a} and {b}."
6. display = String(answer)
```

**Example:** g=6, multipliers=4,6 → a=24, b=36, answer=12

### Difficulty: Medium (LCM of Two Numbers)

**Algorithm:**
```
1. a = random integer from 4 to 20
2. b = random integer from 4 to 20
3. answer = lcm(a, b)
4. prompt = "Find the LCM of {a} and {b}."
5. display = String(answer)
```

**Example:** a=8, b=12 → lcm=24

### Difficulty: Hard (LCM of Three Numbers)

**Algorithm:**
```
1. a = random integer from 4 to 15
2. b = random integer from 4 to 15
3. c = random integer from 4 to 15
4. answer = lcm(lcm(a, b), c)
5. prompt = "Find the LCM of {a}, {b}, and {c}."
6. display = String(answer)
```

**Example:** a=4, b=6, c=10 → lcm(4,6)=12, lcm(12,10)=60

### Difficulty: ExtraHard (Word Problem — Scheduling)

**Algorithm:**
```
1. a = random integer from 8 to 20 (interval in minutes for Bus A)
2. b = random integer from 10 to 25 (interval in minutes for Bus B)
3. answer = lcm(a, b) (time when both depart together)
4. display = String(answer) + " minutes"
5. prompt = "Bus A departs every {a} minutes and Bus B every {b} minutes. They both leave at 9:00. After how many minutes will they next depart together?"
```

**Example:** a=12, b=18 → answer=36

---

## 6. Answer Checking Logic

**Parsing:**
- Remove all non-numeric characters except decimal point and minus sign
- Parse result as float
- Example: "36 minutes" → 36

**Comparison:**
- Exact match: user_value === server_answer (both as integers)
- No tolerance for fractional answers (HCF/LCM are always integers)

---

## 7. Registration

**allApps Key:** `hcflcm`

**modeMap Component Name:** `HcfLcmApp`

**CUSTOM_PUZZLES Registry Entry:** `HCF & LCM`

**fetchQuestionForType URL:** `/hcflcm-api/question`

**apiMap Entry:**
```javascript
hcflcm: {
  fetchQuestion: '/hcflcm-api/question',
  checkAnswer: '/hcflcm-api/check'
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

- Helper function `lcm(a, b)` defined at module level as: `function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }`
- For three numbers: compute lcm(lcm(a, b), c)
- Numbers chosen to avoid excessively large LCM values
- Word problems use real-world context (buses, events, etc.) to enhance engagement
