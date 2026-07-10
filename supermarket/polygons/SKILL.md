# Polygons — Formal Specification

## 1. Overview

Polygons quiz covering angle properties of regular and irregular polygons. Teaches students to:
- Calculate the sum of interior angles: (n-2) × 180°
- Find each interior angle of a regular polygon
- Understand exterior angles: sum is always 360°
- Find the number of sides from an exterior angle
- Calculate the number of diagonals: n(n-3)/2

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `PolygonsApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Polygons'`
- `subtitle: 'Interior & exterior angles'`
- `apiPath: 'polygons-api'`
- `diffLabels: { easy: 'Easy — Interior angle sum', medium: 'Medium — Interior angle of regular', hard: 'Hard — Sides from exterior', extrahard: 'Extra Hard — Number of diagonals' }`

**Answer Format:** Integer (e.g., `720`, `135`, `10`, `14`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Interior angle sum | Hexagon: find sum of interior angles | Integer, e.g., `720` |
| medium | Interior angle of regular polygon | Regular octagon: find each interior angle | Integer or decimal, e.g., `135` |
| hard | Sides from exterior angle | Exterior angle 36° → find number of sides | Integer, e.g., `10` |
| extrahard | Number of diagonals | Heptagon: find number of diagonals | Integer, e.g., `14` |

---

## 4. API Endpoints

### GET /polygons-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "Find the sum of interior angles of a hexagon.",
  "answer": 720,
  "display": "720°",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Find each interior angle of a regular octagon.",
  "answer": 135,
  "display": "135°",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "A regular polygon has each exterior angle equal to 36°. How many sides does it have?",
  "answer": 10,
  "display": "10 sides",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "How many diagonals does a heptagon have?",
  "answer": 14,
  "display": "14",
  "difficulty": "extrahard"
}
```

### POST /polygons-api/check

**Request Body:**
```json
{
  "userAnswer": "720°",
  "answer": 720,
  "display": "720°"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "720°",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove degree symbol, "sides", and whitespace)
- Compare: |user_value - server_answer| < 0.5
- Tolerance accommodates minor rounding variations

---

## 5. Question Generation Algorithm

### Polygon Names Map

```javascript
const POLYGON_NAMES = {
  3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon',
  8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon'
}
```

### Difficulty: Easy (Interior Angle Sum)

**Algorithm:**
```
1. n ∈ {4, 5, 6, 7, 8, 10} (number of sides, randomly chosen)
2. answer = (n - 2) × 180
3. polygonName = POLYGON_NAMES[n]
4. prompt = "Find the sum of interior angles of a {polygonName}."
5. display = String(answer) + "°"
```

**Example:** n=6 → answer=(6-2)×180=720

### Difficulty: Medium (Interior Angle of Regular Polygon)

**Algorithm:**
```
1. n ∈ {3, 4, 5, 6, 8, 9, 10, 12} (number of sides)
2. answer = (n - 2) × 180 / n
3. polygonName = POLYGON_NAMES[n]
4. prompt = "Find each interior angle of a regular {polygonName}."
5. display = String(answer) + "°"
```

**Example:** n=8 → answer=(8-2)×180/8=135

### Difficulty: Hard (Sides from Exterior Angle)

**Algorithm:**
```
1. n ∈ {5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 36} (number of sides)
2. ext = 360 / n (exterior angle for regular n-gon)
3. answer = n (number of sides)
4. display = String(n) + " sides"
5. prompt = "A regular polygon has each exterior angle equal to {ext}°. How many sides does it have?"
```

**Example:** n=10 → ext=36 → answer=10

### Difficulty: ExtraHard (Number of Diagonals)

**Algorithm:**
```
1. n ∈ {5, 6, 7, 8, 9, 10, 12} (number of sides)
2. answer = n × (n - 3) / 2 (diagonal formula)
3. polygonName = POLYGON_NAMES[n]
4. prompt = "How many diagonals does a {polygonName} have?"
5. display = String(answer)
```

**Example:** n=7 → answer=7×(7-3)/2=14

---

## 6. Answer Checking Logic

**Parsing:**
- Remove degree symbol (°), word "sides", and whitespace
- Parse as float
- Example: "720°" → 720, "10 sides" → 10

**Comparison:**
- |user_value - server_answer| < 0.5
- Tolerates minor rounding variations

---

## 7. Registration

**allApps Key:** `polygons`

**modeMap Component Name:** `PolygonsApp`

**CUSTOM_PUZZLES Registry Entry:** `Polygons`

**fetchQuestionForType URL:** `/polygons-api/question`

**apiMap Entry:**
```javascript
polygons: {
  fetchQuestion: '/polygons-api/question',
  checkAnswer: '/polygons-api/check'
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

- Interior angle sum: (n - 2) × 180° for n-sided polygon
- Each interior angle of regular n-gon: (n - 2) × 180° / n
- Exterior angle of regular n-gon: 360° / n
- Sum of exterior angles (any polygon): always 360°
- Number of diagonals: n(n - 3) / 2 (from each vertex, n-3 diagonals; total n(n-3), divide by 2 to avoid double-counting)
- All angle calculations produce integer or simple decimal results
- Polygon names only include common polygons (3-12 sides)
