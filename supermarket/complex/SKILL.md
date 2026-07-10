# Complex Numbers — Formal Specification

## 1. Overview

Complex Numbers quiz covering addition, multiplication, modulus (absolute value), and squaring. Teaches students to:
- Add and subtract complex numbers (separate real and imaginary parts)
- Multiply complex numbers using FOIL
- Calculate the modulus |z| = √(a² + b²) for z = a + bi
- Square complex numbers using the expansion (a+bi)² = a² - b² + 2abi

**Target Grade Level:** Secondary/A-Level (GCSE/A2 equivalent)

---

## 2. Component Specification

**Component Name:** `ComplexApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Complex Numbers'`
- `subtitle: 'Add, multiply, modulus of complex numbers'`
- `apiPath: 'complex-api'`
- `answerField: 'text'`
- `tip: 'For complex answers give a,b where z = a + bi'`
- `diffLabels: { easy: 'Easy — Addition', medium: 'Medium — Multiplication', hard: 'Hard — Modulus', extrahard: 'Extra Hard — Squaring' }`

**Answer Format:**
- Modulus: plain integer (e.g., `5`)
- Complex: `a,b` format for a + bi (e.g., `4,-2`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Addition z₁ + z₂ | (3+2i) + (1-4i) | `4,-2` for 4-2i |
| medium | Multiplication z₁ × z₂ | (2+3i) × (1-i) | `5,1` for 5+i |
| hard | Modulus |z| | |3+4i| | Integer, e.g., `5` |
| extrahard | Squaring z² | (2+3i)² | `-5,12` for -5+12i |

---

## 4. API Endpoints

### GET /complex-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "If z₁ = 3+2i and z₂ = 1-4i, find z₁ + z₂.\nGive answer as a,b for a + bi.",
  "answer": "4,-2",
  "display": "4−2i",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "If z₁ = 2+3i and z₂ = 1-i, find z₁ × z₂.\nGive answer as a,b for a + bi.",
  "answer": "5,1",
  "display": "5+i",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Find |z| where z = 3+4i.",
  "answer": 5,
  "display": "5",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "If z = 2+3i, find z².\nGive answer as a,b for a + bi.",
  "answer": "-5,12",
  "display": "-5+12i",
  "difficulty": "extrahard"
}
```

### POST /complex-api/check

**Request Body:**
```json
{
  "userAnswer": "4,-2",
  "answer": "4,-2",
  "display": "4−2i"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "4−2i",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Remove all whitespace and the letter 'i' from user answer
- Compare with server answer string (without modifications)
- For modulus questions: parse as float and compare numerically (exact match)
- For complex questions: split by comma, parse as integers, and match exactly
- Example: "4 , -2 i" → "4,-2" → compare with answer "4,-2"

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Addition z₁ + z₂)

**Algorithm:**
```
1. a = random integer from -5 to 5
2. b = random integer from -5 to 5
3. c = random integer from -5 to 5
4. d = random integer from -5 to 5
5. Sum: (a + c) + (b + d)i
6. answer = String(a + c) + ',' + String(b + d)
7. display = formatted as "a±bi"
8. prompt = "If z₁ = {fmt(a,b)} and z₂ = {fmt(c,d)}, find z₁ + z₂. Give answer as a,b for a + bi."
```

**Example:** a=3, b=2, c=1, d=-4 → sum=4, -2 → answer="4,-2"

### Difficulty: Medium (Multiplication z₁ × z₂)

**Algorithm:**
```
1. a = random integer from -4 to 4
2. b = random integer from -4 to 4
3. c = random integer from -4 to 4
4. d = random integer from -4 to 4
5. Product: (a+bi) × (c+di) = (ac-bd) + (ad+bc)i
6. re = a*c - b*d
7. im = a*d + b*c
8. answer = String(re) + ',' + String(im)
9. display = formatted as "a±bi"
10. prompt = "If z₁ = {fmt(a,b)} and z₂ = {fmt(c,d)}, find z₁ × z₂. Give answer as a,b for a + bi."
```

**Example:** a=2, b=3, c=1, d=-1 → re=2+3=5, im=-2+3=1 → answer="5,1"

### Difficulty: Hard (Modulus |z|)

**Algorithm:**
```
1. Use Pythagorean triples: [[3,4,5], [5,12,13], [8,15,17], [6,8,10]]
2. Pick a random triple [a, b, c]
3. signA = random ±1
4. signB = random ±1
5. answer = c (the hypotenuse)
6. display = String(c)
7. prompt = "Find |z| where z = {signA*a}+{signB*b}i."
```

**Example:** triple=[3,4,5], signs=positive → answer=5

### Difficulty: ExtraHard (Squaring z²)

**Algorithm:**
```
1. a = random integer from -4 to 4
2. b = random integer from 1 to 5, with random sign
3. (a + bi)² = a² - b² + 2abi
4. re = a*a - b*b
5. im = 2*a*b
6. answer = String(re) + ',' + String(im)
7. display = formatted as "a±bi"
8. prompt = "If z = {fmt(a,b)}, find z². Give answer as a,b for a + bi."
```

**Example:** a=2, b=3 → re=4-9=-5, im=2*2*3=12 → answer="-5,12"

---

## 6. Answer Checking Logic

**For Complex Answers (Easy, Medium, ExtraHard):**
1. Parse user answer: remove whitespace and letter 'i'
2. Split by comma to get [userRe, userIm]
3. Parse as numbers
4. Compare with server answer parts
5. Both real and imaginary parts must match exactly

**For Modulus (Hard):**
1. Parse user answer as float (remove 'i' and whitespace)
2. Exact numeric match with server answer
3. Example: user="5" matches server=5

**Example Parsing:**
- User: "4 , -2 i" → normalize to "4,-2" → split to [4, -2]
- Server: "4,-2" → split to [4, -2]
- Match!

---

## 7. Registration

**allApps Key:** `complex`

**modeMap Component Name:** `ComplexApp`

**CUSTOM_PUZZLES Registry Entry:** `Complex Numbers`

**fetchQuestionForType URL:** `/complex-api/question`

**apiMap Entry:**
```javascript
complex: {
  fetchQuestion: '/complex-api/question',
  checkAnswer: '/complex-api/check'
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

- Helper function `fmtComplex(re, im)` formats output nicely (e.g., "3+2i", "4-2i", "-i")
- Handles special cases: re=0 → "bi", im=0 → "a", im=1 → "+i", im=-1 → "-i"
- Hard mode uses Pythagorean triples to ensure integer modulus: |a+bi| = √(a²+b²)
- All arithmetic operations produce integer results
- Complex division is NOT required (not in difficulty levels)
