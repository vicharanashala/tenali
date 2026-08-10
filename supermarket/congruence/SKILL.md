# Congruence — Formal Specification

## 1. Overview

Congruence quiz covering congruent triangle conditions and properties. Teaches students to:
- Recognize SSS (Side-Side-Side) congruence condition
- Recognize SAS (Side-Angle-Side) congruence condition
- Recognize ASA (Angle-Side-Angle) congruence condition
- Recognize RHS (Right-angle-Hypotenuse-Side) congruence condition
- Use congruence to find missing sides and angles in figures

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `CongruenceApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Congruence'`
- `subtitle: 'SSS, SAS, ASA, RHS'`
- `apiPath: 'congruence-api'`
- `diffLabels: { easy: 'Easy — Find missing side', medium: 'Medium — Find missing angle', hard: 'Hard — Identify condition', extrahard: 'Extra Hard — Use congruence' }`

**Answer Format:**
- Numeric: integer or decimal (e.g., `7`, `55`)
- Textual: congruence condition (e.g., `SSS`, `SAS`) — case-insensitive

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Find missing side | △ABC ≅ △PQR, given sides → find AB | Integer, e.g., `7` |
| medium | Find missing angle | △ABC ≅ △PQR, angle P=55° → find angle A | Integer, e.g., `55` |
| hard | Identify condition | Given info about two triangles → which condition? | Text: `SSS`, `SAS`, `ASA`, or `RHS` |
| extrahard | Use congruence in figure | Two triangles sharing a side → find missing side | Integer, e.g., `8` |

---

## 4. API Endpoints

### GET /congruence-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "△ABC ≅ △PQR. AB = 5 cm, BC = 7 cm, and RP = 5 cm. Find CA.",
  "answer": 7,
  "display": "7 cm",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "△ABC ≅ △PQR. Angle Q = 55°. Find angle B.",
  "answer": 55,
  "display": "55°",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Three sides of one triangle equal three sides of another. Which congruence condition is this? (SSS, SAS, ASA, or RHS)",
  "answer": "SSS",
  "display": "SSS",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "In the figure, △ABD ≅ △CBD (by SAS). AB = 8 cm and BD = 6 cm. Find CB.",
  "answer": 8,
  "display": "8 cm",
  "difficulty": "extrahard"
}
```

### POST /congruence-api/check

**Request Body:**
```json
{
  "userAnswer": "7 cm",
  "answer": 7,
  "display": "7 cm"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "7 cm",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Numeric answers: parse as float, compare to server answer
  - For sides: |user_value - answer| < 0.5
  - For angles: |user_value - answer| < 0.5
- Text answers: remove whitespace, convert to uppercase, exact match with "SSS", "SAS", "ASA", or "RHS"
- Hybrid: parse as number first; if fails, compare as uppercase text

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Find Missing Side)

**Algorithm:**
```
1. sides = [randInt(3, 12), randInt(3, 12), randInt(3, 12)] (three random sides)
2. idx = randInt(0, 2) (which side to ask for)
3. answer = sides[idx]
4. known = sides.map((s, i) => i === idx ? '?' : s)
5. labels1 = ['AB', 'BC', 'CA']
6. labels2 = ['PQ', 'QR', 'RP']
7. Create string showing △ABC ≅ △PQR with known sides
8. prompt = "△ABC ≅ △PQR. {shown sides}. Find {labels1[idx]}."
9. display = String(answer) + " cm"
```

**Example:** sides=[5,7,6], idx=1 → answer=7

### Difficulty: Medium (Find Missing Angle)

**Algorithm:**
```
1. a1 = randInt(30, 80)
2. a2 = randInt(30, 130 - a1)
3. a3 = 180 - a1 - a2
4. angles = [a1, a2, a3]
5. idx = randInt(0, 2) (which angle)
6. answer = angles[idx]
7. labels1 = ['A', 'B', 'C']
8. labels2 = ['P', 'Q', 'R']
9. prompt = "△ABC ≅ △PQR. Angle {labels2[idx]} = {answer}°. Find angle {labels1[idx]}."
10. display = String(answer) + "°"
```

**Example:** angles=[45, 60, 75], idx=1 → answer=60

### Difficulty: Hard (Identify Congruence Condition)

**Algorithm:**
```
1. rules = [
     { info: "Three sides of one triangle equal three sides of another", answer: "SSS" },
     { info: "Two sides and the included angle of one triangle equal those of another", answer: "SAS" },
     { info: "Two angles and the included side of one triangle equal those of another", answer: "ASA" },
     { info: "A right angle, the hypotenuse, and one other side are equal in both triangles", answer: "RHS" }
   ]
2. pick = rules[randInt(0, 3)]
3. answer = pick.answer
4. display = answer
5. prompt = "{pick.info}. Which congruence condition is this? (SSS, SAS, ASA, or RHS)"
```

**Example:** pick rule for SSS → answer="SSS"

### Difficulty: ExtraHard (Use Congruence in Figure)

**Algorithm:**
```
1. shared = randInt(4, 10) (length of shared side BD)
2. sideA = randInt(3, 9) (length of AB)
3. sideB = randInt(3, 9) (length of another side)
4. answer = sideA (CB = AB by congruence)
5. display = String(answer) + " cm"
6. prompt = "In the figure, △ABD ≅ △CBD (by SAS). AB = {sideA} cm and BD = {shared} cm. Find CB."
```

**Example:** shared=6, sideA=8, sideB=5 → answer=8

---

## 6. Answer Checking Logic

**For Numeric Answers (Easy, Medium, ExtraHard):**
1. Remove units (cm, °) and whitespace
2. Parse as float
3. Compare: |user_value - server_answer| < 0.5

**For Text Answers (Hard):**
1. Remove whitespace
2. Convert to uppercase
3. Exact match with "SSS", "SAS", "ASA", or "RHS"

**Hybrid Check (Easy Medium, ExtraHard):**
1. First try numeric parse and compare
2. If numeric comparison succeeds, return result
3. Otherwise fall back to float comparison with tolerance

---

## 7. Registration

**allApps Key:** `congruence`

**modeMap Component Name:** `CongruenceApp`

**CUSTOM_PUZZLES Registry Entry:** `Congruence`

**fetchQuestionForType URL:** `/congruence-api/question`

**apiMap Entry:**
```javascript
congruence: {
  fetchQuestion: '/congruence-api/question',
  checkAnswer: '/congruence-api/check'
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

- Congruence conditions:
  - SSS: all three sides equal
  - SAS: two sides and the included angle equal
  - ASA: two angles and the included side equal
  - RHS: right angle, hypotenuse, and one other side equal (for right triangles)
- Corresponding parts: A↔P, B↔Q, C↔R in △ABC ≅ △PQR
- Extra hard mode uses SAS congruence (sides and shared side)
- All side lengths are positive integers between 3 and 12 cm
- All angles are positive integers
