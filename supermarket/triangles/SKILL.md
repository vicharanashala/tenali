# Triangles — Formal Specification

## 1. Overview

Triangles quiz covering fundamental triangle properties. Teaches students to:
- Apply the angle sum property (angles in a triangle sum to 180°)
- Use isosceles triangle properties (equal sides have equal opposite angles)
- Apply the exterior angle theorem (exterior angle equals sum of remote interior angles)
- Solve multi-step problems involving equilateral and isosceles triangles

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `TrianglesApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Triangles'`
- `subtitle: 'Angle sum, isosceles, exterior angle'`
- `apiPath: 'triangles-api'`
- `diffLabels: { easy: 'Easy — Angle sum', medium: 'Medium — Isosceles', hard: 'Hard — Exterior angle', extrahard: 'Extra Hard — Equilateral + isosceles' }`

**Answer Format:** Integer (degrees, without degree symbol, e.g., `60`, `70`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Angle sum | Find third angle given two | Integer, e.g., `60` |
| medium | Isosceles triangle | Find base angles given apex angle | Integer, e.g., `70` |
| hard | Exterior angle theorem | Exterior = sum of remote interior | Integer, e.g., `90` |
| extrahard | Multi-step with equilateral | Complex figure with equilateral triangle | Integer, e.g., `60` |

---

## 4. API Endpoints

### GET /triangles-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "A triangle has angles 50° and 70°. Find the third angle.",
  "answer": 60,
  "display": "60°",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "An isosceles triangle has an apex angle of 40°. Find each base angle.",
  "answer": 70,
  "display": "70°",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Two interior angles of a triangle are 35° and 55°. Find the exterior angle at the third vertex.",
  "answer": 90,
  "display": "90°",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "In triangle ABD, angle A = 60° (equilateral triangle ABC shares side AB). If angle ABD = 100°, find angle ADB.",
  "answer": 20,
  "display": "20°",
  "difficulty": "extrahard"
}
```

### POST /triangles-api/check

**Request Body:**
```json
{
  "userAnswer": "60°",
  "answer": 60,
  "display": "60°"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "60°",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove degree symbol and whitespace)
- Compare: |user_value - server_answer| < 0.5
- Tolerance accommodates minor rounding variations

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Angle Sum Property)

**Algorithm:**
```
1. a = random integer from 20 to 80
2. b = random integer from 20 to (140 - a)
3. answer = 180 - a - b
4. prompt = "A triangle has angles {a}° and {b}°. Find the third angle."
5. display = String(answer) + "°"
```

**Example:** a=50, b=70 → answer=60

### Difficulty: Medium (Isosceles Triangle)

**Algorithm:**
```
1. apex = random integer from 20 to 140
2. If (180 - apex) is even:
     - answer = (180 - apex) / 2
   Else:
     - apex += 1 (adjust to make calculation work)
     - answer = (180 - apex) / 2
3. prompt = "An isosceles triangle has an apex angle of {apex}°. Find each base angle."
4. display = String(answer) + "°"
```

**Example:** apex=40 → answer=70

### Difficulty: Hard (Exterior Angle Theorem)

**Algorithm:**
```
1. a = random integer from 25 to 75
2. b = random integer from 25 to 75
3. answer = a + b (exterior = sum of remote interior angles)
4. prompt = "Two interior angles of a triangle are {a}° and {b}°. Find the exterior angle at the third vertex."
5. display = String(answer) + "°"
```

**Example:** a=35, b=55 → answer=90

### Difficulty: ExtraHard (Multi-step with Equilateral)

**Algorithm:**
```
1. extraAngle = random integer from 20 to 70
2. Scenario: Equilateral triangle ABC (all angles 60°) shares side AB with triangle ABD
3. angle ABD = 60 + extraAngle (on the other side of AB)
4. In triangle ABD:
     - angle A = 60° (part of equilateral)
     - angle ABD = 60 + extraAngle
     - angle ADB = 180 - 60 - (60 + extraAngle) = 60 - extraAngle
5. answer = 60 - extraAngle (ensure positive)
6. prompt = "In triangle ABD, angle A = 60° (equilateral triangle ABC shares side AB). If angle ABD = {60 + extraAngle}°, find angle ADB."
7. display = String(answer) + "°"
```

**Example:** extraAngle=40 → angle ABD=100, answer=20

---

## 6. Answer Checking Logic

**Parsing:**
- Remove degree symbol (°) and whitespace
- Parse as float
- Example: "60°" → 60, " 70 " → 70

**Comparison:**
- |user_value - server_answer| < 0.5
- Tolerates minor variations

---

## 7. Registration

**allApps Key:** `triangles`

**modeMap Component Name:** `TrianglesApp`

**CUSTOM_PUZZLES Registry Entry:** `Triangles`

**fetchQuestionForType URL:** `/triangles-api/question`

**apiMap Entry:**
```javascript
triangles: {
  fetchQuestion: '/triangles-api/question',
  checkAnswer: '/triangles-api/check'
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

- Triangle angle sum formula: A + B + C = 180°
- Isosceles triangle: if two sides are equal, their opposite angles are equal
- Equilateral triangle: all angles = 60°
- Exterior angle theorem: exterior angle = sum of two remote interior angles
- Extra hard mode uses equilateral triangle property (60°) in multi-step calculation
- All angles are positive integers between 10° and 170°
