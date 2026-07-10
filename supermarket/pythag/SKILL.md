# Pythagoras' Theorem — Formal Specification

## 1. Overview

Pythagoras' Theorem quiz covering 2D and 3D applications. Teaches students to:
- Apply the Pythagorean theorem: a² + b² = c² for right-angled triangles
- Find the hypotenuse given two legs
- Find a shorter side given hypotenuse and one leg
- Apply Pythagoras to real-world problems (ladders, distances, etc.)
- Extend to 3D: find space diagonals of cuboids

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `PythagApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: "Pythagoras' Theorem"`
- `subtitle: 'Hypotenuse, legs, 3D'`
- `apiPath: 'pythag-api'`
- `diffLabels: { easy: 'Easy — Find hypotenuse', medium: 'Medium — Find leg', hard: 'Hard — Word problem', extrahard: 'Extra Hard — 3D diagonal' }`

**Answer Format:** Integer or decimal (e.g., `5`, `12`, `13`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Find hypotenuse | Legs 3, 4 → find hypotenuse | Integer, e.g., `5` |
| medium | Find leg | Hyp 13, one leg 5 → find other leg | Integer, e.g., `12` |
| hard | Word problem (ladder) | 15m ladder, 9m from wall → height | Integer, e.g., `12` |
| extrahard | 3D space diagonal | Cuboid 3×4×12 → space diagonal | Integer, e.g., `13` |

---

## 4. API Endpoints

### GET /pythag-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "A right-angled triangle has legs 6 cm and 8 cm. Find the hypotenuse.",
  "answer": 10,
  "display": "10 cm",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "A right-angled triangle has hypotenuse 13 cm and one leg 5 cm. Find the other leg.",
  "answer": 12,
  "display": "12 cm",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "A 15 m ladder leans against a wall. Its base is 9 m from the wall. How high up the wall does it reach?",
  "answer": 12,
  "display": "12 m",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "A cuboid has dimensions 3 cm × 4 cm × 12 cm. Find the length of the space diagonal.",
  "answer": 13,
  "display": "13 cm",
  "difficulty": "extrahard"
}
```

### POST /pythag-api/check

**Request Body:**
```json
{
  "userAnswer": "10 cm",
  "answer": 10,
  "display": "10 cm"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "10 cm",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove units and whitespace)
- Compare: |user_value - server_answer| < 0.5
- Tolerance accommodates minor variations

---

## 5. Question Generation Algorithm

### Pythagorean Triples Array

```javascript
const PYTH_TRIPLES = [
  [3,4,5], [5,12,13], [8,15,17], [7,24,25], [6,8,10],
  [9,12,15], [12,16,20], [15,20,25], [9,40,41], [11,60,61], [20,21,29]
]
```

### Difficulty: Easy (Find Hypotenuse)

**Algorithm:**
```
1. t = random triple from first 6 triples
2. k = random integer from 1 to 3 (scaling factor)
3. a = t[0] * k
4. b = t[1] * k
5. c = t[2] * k (hypotenuse)
6. answer = c
7. display = String(c) + " cm"
8. prompt = "A right-angled triangle has legs {a} cm and {b} cm. Find the hypotenuse."
```

**Example:** t=[3,4,5], k=2 → a=6, b=8, c=10 → answer=10

### Difficulty: Medium (Find Shorter Side)

**Algorithm:**
```
1. t = random triple from first 6 triples
2. k = random integer from 1 to 3
3. a = t[0] * k
4. b = t[1] * k
5. c = t[2] * k
6. pick = random(0, 1)
7. If pick === 0:
     - answer = a
     - display = a + " cm"
     - prompt = "A right-angled triangle has hypotenuse {c} cm and one leg {b} cm. Find the other leg."
   Else:
     - answer = b
     - display = b + " cm"
     - prompt = "A right-angled triangle has hypotenuse {c} cm and one leg {a} cm. Find the other leg."
```

**Example:** t=[3,4,5], k=2, pick=0 → answer=6

### Difficulty: Hard (Word Problem — Ladder)

**Algorithm:**
```
1. t = random triple from first 6 triples
2. k = random integer from 1 to 2
3. base = t[0] * k
4. height = t[1] * k
5. ladder = t[2] * k
6. pick = random(0, 1)
7. If pick === 0:
     - answer = height
     - display = height + " m"
     - prompt = "A {ladder} m ladder leans against a wall. Its base is {base} m from the wall. How high up the wall does it reach?"
   Else:
     - answer = base
     - display = base + " m"
     - prompt = "A {ladder} m ladder reaches {height} m up a wall. How far is the base of the ladder from the wall?"
```

**Example:** t=[5,12,13], k=1 → ladder=13, base=5, height=12 → answer=12

### Difficulty: ExtraHard (3D Space Diagonal)

**Algorithm:**
```
1. Nested combinations for 3D (a, b, c) where √(a²+b²+c²) is an integer
   - Floor diagonal d = √(a²+b²) from first triple
   - Space diagonal = √(d²+c²) from second triple
   - Nested examples: a=3, b=4, c=12, space=13 (since 5² + 12² = 13²)

2. nested = [
     { a: 3, b: 4, c: 12, space: 13 },
     { a: 6, b: 8, c: 24, space: 26 },
     { a: 5, b: 12, c: 84, space: 85 },
     { a: 1, b: 2, c: 2, space: 3 },
     { a: 2, b: 4, c: 4, space: 6 },
     { a: 2, b: 3, c: 6, space: 7 }
   ]

3. pick = nested[randInt(0, nested.length-1)]
4. answer = pick.space
5. display = String(answer) + " cm"
6. prompt = "A cuboid has dimensions {a} cm × {b} cm × {c} cm. Find the length of the space diagonal."
```

**Example:** pick={a:3, b:4, c:12, space:13} → answer=13

---

## 6. Answer Checking Logic

**Parsing:**
- Remove units (cm, m) and whitespace
- Parse as float
- Example: "10 cm" → 10, "12 m" → 12

**Comparison:**
- |user_value - server_answer| < 0.5
- Tolerates minor rounding variations

---

## 7. Registration

**allApps Key:** `pythag`

**modeMap Component Name:** `PythagApp`

**CUSTOM_PUZZLES Registry Entry:** `Pythagoras' Theorem`

**fetchQuestionForType URL:** `/pythag-api/question`

**apiMap Entry:**
```javascript
pythag: {
  fetchQuestion: '/pythag-api/question',
  checkAnswer: '/pythag-api/check'
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

- Pythagorean theorem: a² + b² = c² for right-angled triangles
- All 2D questions use Pythagorean triples scaled by factors 1-3 to ensure integer answers
- 3D questions use nested triples where both floor and space diagonals are perfect squares
- Word problems use realistic scenarios (ladder against wall, etc.)
- Scaling factors ensure reasonable measurements (max ~100 units)
- 3D formula: space diagonal = √(a² + b² + c²)
