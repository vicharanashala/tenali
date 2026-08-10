# Standard Form — Formal Specification

## 1. Overview

Standard Form quiz covering scientific notation operations. Teaches students to:
- Convert numbers to and from standard form (scientific notation)
- Multiply numbers in standard form
- Divide numbers in standard form
- Add and subtract numbers in standard form with equal powers

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `StdFormApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Standard Form'`
- `subtitle: 'Scientific notation operations'`
- `apiPath: 'stdform-api'`
- `diffLabels: { easy: 'Easy — Convert', medium: 'Medium — Multiply', hard: 'Hard — Divide', extrahard: 'Extra Hard — Add/subtract' }`

**Answer Format:** Standard form notation (e.g., `3.4 × 10^5` or `3.4e5`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Convert to standard form | Write 340000 in standard form | `a × 10^b` where a is 1.0-9.99, b is integer |
| medium | Multiply standard form | (1.5 × 10^3) × (2.4 × 10^2) | `a × 10^b` normalized |
| hard | Divide standard form | (8.0 × 10^7) ÷ (2.0 × 10^3) | `a × 10^b` normalized |
| extrahard | Add/subtract same power | (1.5 × 10^3) + (2.4 × 10^3) | `a × 10^b` normalized |

---

## 4. API Endpoints

### GET /stdform-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "Write 3400000 in standard form.",
  "answer": "3.4 × 10^6",
  "display": "3.4 × 10^6",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Calculate (2.3 × 10^2) × (3.1 × 10^4). Give answer in standard form.",
  "answer": "7.13 × 10^6",
  "display": "7.13 × 10^6",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Calculate (6.5 × 10^8) ÷ (1.3 × 10^2). Give answer in standard form.",
  "answer": "5 × 10^6",
  "display": "5 × 10^6",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Calculate (2.5 × 10^4) + (3.2 × 10^4). Give answer in standard form.",
  "answer": "5.7 × 10^4",
  "display": "5.7 × 10^4",
  "difficulty": "extrahard"
}
```

### POST /stdform-api/check

**Request Body:**
```json
{
  "userAnswer": "3.4 × 10^6",
  "answer": "3.4 × 10^6",
  "display": "3.4 × 10^6"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "3.4 × 10^6",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Normalize both strings: remove spaces, convert `×10^`, `x10^`, `*10^` to `e` format
- Compare normalized strings for exact match
- Accepts: `3.4 × 10^6`, `3.4x10^6`, `3.4e6`, all equivalent
- Example: `2.5e4` and `2.5 × 10^4` both normalize to `2.5e4`

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Convert to Standard Form)

**Algorithm:**
```
1. sig = random float from 1.1 to 9.9 (1 decimal place)
   - Generated as: randInt(11, 99) / 10
2. exp = random integer from 2 to 7, with 50% chance of negative
   - expVal = randInt(2, 7) * (Math.random() < 0.5 ? 1 : -1)
3. val = sig * 10^exp (actual number)
4. If exp > 0: display as integer (e.g., 3400000)
   If exp < 0: display with decimals to |exp|+1 places (e.g., 0.0034)
5. answer = "{sig} × 10^{exp}"
6. prompt = "Write {val} in standard form."
```

**Example:** sig=3.4, exp=6 → val=3400000 → answer="3.4 × 10^6"

### Difficulty: Medium (Multiply)

**Algorithm:**
```
1. a = random float from 1.1 to 4.9 (1 decimal place)
2. ea = random integer from 2 to 5
3. b = random float from 1.1 to 4.9 (1 decimal place)
4. eb = random integer from 2 to 5
5. product = a * b
6. expR = ea + eb
7. Normalize: if product >= 10, divide by 10 and increment expR
8. Round product to 2 decimal places
9. answer = "{product} × 10^{expR}"
10. prompt = "Calculate ({a} × 10^{ea}) × ({b} × 10^{eb}). Give answer in standard form."
```

**Example:** a=1.5, ea=3, b=2.4, eb=2 → product=3.6, expR=5 → answer="3.6 × 10^5"

### Difficulty: Hard (Divide)

**Algorithm:**
```
1. a = random float from 2.0 to 9.0 (1 decimal place)
2. ea = random integer from 5 to 9
3. b = random float from 1.1 to 4.9 (1 decimal place)
4. eb = random integer from 2 to 4
5. quotient = a / b
6. expR = ea - eb
7. Normalize:
   - If quotient < 1, multiply by 10 and decrement expR
   - If quotient >= 10, divide by 10 and increment expR
8. Round quotient to 2 decimal places
9. answer = "{quotient} × 10^{expR}"
```

**Example:** a=8.0, ea=7, b=2.0, eb=3 → quotient=4.0, expR=4 → answer="4.0 × 10^4"

### Difficulty: ExtraHard (Add/Subtract Same Power)

**Algorithm:**
```
1. exp = random integer from 3 to 7
2. a = random float from 1.1 to 5.0 (1 decimal place)
3. b = random float from 1.1 to 4.0 (1 decimal place)
4. sum = a + b
5. resCoeff = sum
6. resExp = exp
7. Normalize: if resCoeff >= 10, divide by 10 and increment resExp
8. Round resCoeff to 2 decimal places
9. answer = "{resCoeff} × 10^{resExp}"
10. prompt = "Calculate ({a} × 10^{exp}) + ({b} × 10^{exp}). Give answer in standard form."
```

**Example:** exp=4, a=2.5, b=3.2 → sum=5.7 → answer="5.7 × 10^4"

---

## 6. Answer Checking Logic

**Normalization Function:**
```javascript
function normalize(s) {
  return String(s)
    .replace(/\s/g, '')           // Remove whitespace
    .replace(/×10\^/gi, 'e')      // ×10^ → e
    .replace(/x10\^/gi, 'e')      // x10^ → e
    .replace(/\*10\^/gi, 'e')     // *10^ → e
}
```

**Check:**
- Normalize user answer and server answer
- Compare normalized strings for exact match
- Case-insensitive on operators

**Examples:**
- `3.4 × 10^6` → `3.4e6`
- `3.4x10^6` → `3.4e6`
- `3.4e6` → `3.4e6`
- All three match

---

## 7. Registration

**allApps Key:** `stdform`

**modeMap Component Name:** `StdFormApp`

**CUSTOM_PUZZLES Registry Entry:** `Standard Form`

**fetchQuestionForType URL:** `/stdform-api/question`

**apiMap Entry:**
```javascript
stdform: {
  fetchQuestion: '/stdform-api/question',
  checkAnswer: '/stdform-api/check'
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

- Coefficients always 1.0 to 9.99 (normalized form)
- Exponents range from typically -9 to 9 in real questions
- Rounding to 2 decimal places for product/quotient normalization
- Operators: ×, x, * all accepted in user input (case-insensitive)
