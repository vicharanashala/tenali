# Similarity — Formal Specification

## 1. Overview

Similarity quiz covering similar figures and scaling relationships. Teaches students to:
- Identify similar figures (same shape, proportional sides)
- Find scale factor from corresponding sides
- Use scale factor to find missing sides
- Apply area ratio = (scale factor)²
- Apply volume ratio = (scale factor)³

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `SimilarityApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Similarity'`
- `subtitle: 'Scale factor, area & volume ratios'`
- `apiPath: 'similarity-api'`
- `diffLabels: { easy: 'Easy — Find missing side', medium: 'Medium — Scale factor', hard: 'Hard — Area ratio', extrahard: 'Extra Hard — Volume ratio' }`

**Answer Format:** Integer or decimal (e.g., `12`, `128`, `270`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Find missing side | k=3, one side 4 → find corresponding side | Integer, e.g., `12` |
| medium | Calculate from scale factor | Sides 6 and 18 (scale 3:1) → find related side | Decimal or integer, e.g., `15` |
| hard | Area ratio = k² | Length ratio 1:4, area 8 → find larger area | Integer, e.g., `128` |
| extrahard | Volume ratio = k³ | Length ratio 1:3, volume 10 → find larger volume | Integer, e.g., `270` |

---

## 4. API Endpoints

### GET /similarity-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "△ABC is similar to △PQR. AB = 4 cm, BC = 5 cm, PQ = 12 cm. Find QR.",
  "answer": 15,
  "display": "15 cm",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Two similar triangles have corresponding sides 6 cm and 18 cm. If another side of the smaller triangle is 4 cm, find the corresponding side of the larger triangle.",
  "answer": 12,
  "display": "12 cm",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "Two similar figures have a length ratio of 1:4. The smaller figure has area 8 cm². Find the area of the larger figure.",
  "answer": 128,
  "display": "128 cm²",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Two similar solids have a length ratio of 1:3. The smaller solid has volume 10 cm³. Find the volume of the larger solid.",
  "answer": 270,
  "display": "270 cm³",
  "difficulty": "extrahard"
}
```

### POST /similarity-api/check

**Request Body:**
```json
{
  "userAnswer": "15 cm",
  "answer": 15,
  "display": "15 cm"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "15 cm",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove units and whitespace)
- Compare: |user_value - server_answer| < 0.5
- Tolerance accommodates minor rounding variations

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Find Missing Side with Direct Ratio)

**Algorithm:**
```
1. k = random integer from 2 to 5 (scale factor)
2. a = random integer from 3 to 10 (side of smaller triangle)
3. b = random integer from 3 to 10 (another side of smaller triangle)
4. answer = b * k (corresponding side in larger triangle)
5. display = String(answer) + " cm"
6. prompt = "△ABC is similar to △PQR. AB = {a} cm, BC = {b} cm, PQ = {a*k} cm. Find QR."
   (Note: QR = answer)
```

**Example:** k=3, a=4, b=5 → answer=15

### Difficulty: Medium (Calculate from Fractional Scale Factor)

**Algorithm:**
```
1. small = random integer from 4 to 10
2. big = small * random(2, 4) (ensure clean scale factor)
3. otherSmall = random integer from 3 to 8
4. Scale factor = big / small
5. answer = otherSmall * big / small = otherSmall * (big/small)
   - ansNum = otherSmall * big
   - ansDen = small
   - Reduce fraction using GCD
   - answer = reduced fraction or decimal
6. Round to 2 decimal places
7. display = String(answer) + " cm"
8. prompt = "Two similar triangles have corresponding sides {small} cm and {big} cm. If another side of the smaller triangle is {otherSmall} cm, find the corresponding side of the larger triangle."
```

**Example:** small=4, big=12, otherSmall=3 → answer=9, but server uses more complex fraction logic

### Difficulty: Hard (Area Ratio = k²)

**Algorithm:**
```
1. k = random integer from 2 to 5 (length scale factor)
2. areaSmall = random integer from 5 to 30 (area of smaller figure)
3. areaLarge = areaSmall * k * k (area scales as square of length)
4. answer = areaLarge
5. display = String(answer) + " cm²"
6. prompt = "Two similar figures have a length ratio of 1:{k}. The smaller figure has area {areaSmall} cm². Find the area of the larger figure."
```

**Example:** k=4, areaSmall=8 → answer=8*16=128

### Difficulty: ExtraHard (Volume Ratio = k³)

**Algorithm:**
```
1. k = random integer from 2 to 4 (length scale factor)
2. volSmall = random integer from 5 to 25 (volume of smaller solid)
3. volLarge = volSmall * k * k * k (volume scales as cube of length)
4. answer = volLarge
5. display = String(answer) + " cm³"
6. prompt = "Two similar solids have a length ratio of 1:{k}. The smaller solid has volume {volSmall} cm³. Find the volume of the larger solid."
```

**Example:** k=3, volSmall=10 → answer=10*27=270

---

## 6. Answer Checking Logic

**Parsing:**
- Remove units (cm, cm², cm³) and whitespace
- Parse as float
- Example: "15 cm" → 15, "128 cm²" → 128

**Comparison:**
- |user_value - server_answer| < 0.5
- Tolerates minor rounding variations

---

## 7. Registration

**allApps Key:** `similarity`

**modeMap Component Name:** `SimilarityApp`

**CUSTOM_PUZZLES Registry Entry:** `Similarity`

**fetchQuestionForType URL:** `/similarity-api/question`

**apiMap Entry:**
```javascript
similarity: {
  fetchQuestion: '/similarity-api/question',
  checkAnswer: '/similarity-api/check'
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

- Similarity definition: same shape, all corresponding angles equal, all corresponding sides proportional
- Scale factor k: ratio of corresponding sides in similar figures
- If linear dimensions scale by k:
  - Areas scale by k²
  - Volumes scale by k³
- Helper function `gcd(a, b)` used for fraction reduction in medium mode
- Easy mode answer = side × scale factor (direct multiplication)
- Medium mode uses fractional scale factors with GCD reduction
- Hard and ExtraHard modes use simple integer multiplications (k² and k³)
- All answers rounded to 2 decimal places maximum
