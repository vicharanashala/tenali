# Angles — Formal Specification

## 1. Overview

Angles quiz covering fundamental angle facts. Teaches students to:
- Understand angles on a straight line (sum to 180°)
- Understand angles at a point (sum to 360°)
- Apply vertically opposite angle property (equal angles)
- Understand parallel lines and transversal angle relationships (alternate, corresponding, co-interior)

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `AnglesApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Angles'`
- `subtitle: 'Lines, points, parallel line angles'`
- `apiPath: 'angles-api'`
- `diffLabels: { easy: 'Easy — Angles on a line', medium: 'Medium — Angles at a point', hard: 'Hard — Vertically opposite', extrahard: 'Extra Hard — Parallel lines' }`

**Answer Format:** Integer (degrees, without degree symbol, e.g., `65`, `120`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Angles on a line | 115° and x° on a line → find x | Integer, e.g., `65` |
| medium | Angles at a point | Four angles at a point → find missing | Integer, e.g., `100` |
| hard | Vertically opposite | Two lines cross, one angle given → find another | Integer, e.g., `120` |
| extrahard | Parallel lines + transversal | Alternate/corresponding/co-interior angles | Integer, e.g., `60` |

---

## 4. API Endpoints

### GET /angles-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "Two angles on a straight line are 115° and x°. Find x.",
  "answer": 65,
  "display": "65°",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Four angles meet at a point: 80°, 90°, 110°, and x°. Find x.",
  "answer": 80,
  "display": "80°",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Two straight lines cross. One angle is 120°. Find the adjacent angle.",
  "answer": 60,
  "display": "60°",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Two parallel lines are cut by a transversal. One alternate angle is 72°. Find the other alternate angle.",
  "answer": 72,
  "display": "72°",
  "difficulty": "extrahard"
}
```

### POST /angles-api/check

**Request Body:**
```json
{
  "userAnswer": "65°",
  "answer": 65,
  "display": "65°"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "65°",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove degree symbol and whitespace)
- Compare: |user_value - server_answer| < 0.5
- Tolerance accommodates small rounding variations

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Angles on a Straight Line)

**Algorithm:**
```
1. a = random integer from 25 to 155
2. answer = 180 - a
3. prompt = "Two angles on a straight line are {a}° and x°. Find x."
4. display = String(answer) + "°"
```

**Example:** a=115 → answer=65

### Difficulty: Medium (Angles at a Point)

**Algorithm:**
```
1. a = random integer from 40 to 120
2. b = random integer from 40 to 120
3. c = random integer from 40 to 120
4. answer = 360 - a - b - c
5. If answer < 10:
     - answer += 60 (ensure positive and reasonable)
     - cAdj = 360 - a - b - answer
6. prompt = "Four angles meet at a point: {a}°, {b}°, {cAdj}°, and x°. Find x."
7. display = String(answer) + "°"
```

**Example:** a=80, b=90, c=110 → answer=80

### Difficulty: Hard (Vertically Opposite / Adjacent)

**Algorithm:**
```
1. a = random integer from 30 to 150
2. vertOpp = a (vertically opposite angles are equal)
3. adj = 180 - a (adjacent angles on a line sum to 180)
4. pick = random(0, 1)
5. If pick === 0:
     - prompt = "Two straight lines cross. One angle is {a}°. Find the vertically opposite angle."
     - answer = vertOpp
   Else:
     - prompt = "Two straight lines cross. One angle is {a}°. Find the adjacent angle."
     - answer = adj
6. display = String(answer) + "°"
```

**Example:** a=120, pick=1 → answer=60

### Difficulty: ExtraHard (Parallel Lines + Transversal)

**Algorithm:**
```
1. angle = random integer from 30 to 150
2. type = random(0, 1, 2)
3. If type === 0 (alternate angles):
     - prompt = "Two parallel lines are cut by a transversal. One alternate angle is {angle}°. Find the other alternate angle."
     - answer = angle
   Else if type === 1 (corresponding angles):
     - prompt = "Two parallel lines are cut by a transversal. One corresponding angle is {angle}°. Find the other corresponding angle."
     - answer = angle
   Else (co-interior angles):
     - prompt = "Two parallel lines are cut by a transversal. One co-interior angle is {angle}°. Find the other co-interior angle."
     - answer = 180 - angle
4. display = String(answer) + "°"
```

**Example:** angle=72, type=0 → answer=72 (alternate angles equal)

---

## 6. Answer Checking Logic

**Parsing:**
- Remove degree symbol (°) and whitespace
- Parse as float
- Example: "65°" → 65, " 120 " → 120

**Comparison:**
- |user_value - server_answer| < 0.5
- Tolerates minor variations

---

## 7. Registration

**allApps Key:** `angles`

**modeMap Component Name:** `AnglesApp`

**CUSTOM_PUZZLES Registry Entry:** `Angles`

**fetchQuestionForType URL:** `/angles-api/question`

**apiMap Entry:**
```javascript
angles: {
  fetchQuestion: '/angles-api/question',
  checkAnswer: '/angles-api/check'
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

- Angle facts:
  - Angles on a straight line: sum to 180°
  - Angles at a point: sum to 360°
  - Vertically opposite angles: equal
  - Alternate angles (parallel lines): equal
  - Corresponding angles (parallel lines): equal
  - Co-interior angles (parallel lines): sum to 180°
- All angles generated as positive integers between 10° and 170°
- Medium mode ensures angle sum doesn't produce negative result
