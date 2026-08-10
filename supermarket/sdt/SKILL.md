# Speed, Distance, Time — Formal Specification

## 1. Overview

Speed, Distance, Time quiz covering the fundamental formula S = D/T and its rearrangements. Teaches students to:
- Calculate distance given speed and time (D = S × T)
- Calculate time given distance and speed (T = D / S)
- Find average speed for multi-leg journeys
- Convert between m/s and km/h

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `SDTApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Speed, Distance, Time'`
- `subtitle: 'Rate problems & conversions'`
- `apiPath: 'sdt-api'`
- `diffLabels: { easy: 'Easy — Distance', medium: 'Medium — Time', hard: 'Hard — Average speed', extrahard: 'Extra Hard — Unit conversion' }`

**Answer Format:** Decimal number (e.g., `180`, `4`, `54`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Find distance (D = S × T) | Car at 60 km/h for 3 hours — find distance | Integer, e.g., `180` |
| medium | Find time (T = D / S) | Train covers 240 km at 60 km/h — find time | Number, e.g., `4` |
| hard | Average speed (multi-leg) | Two legs with different speeds — find average | Decimal to 2 dp, e.g., `52.5` |
| extrahard | Unit conversion (m/s to km/h) | Convert 15 m/s to km/h | Decimal to 2 dp, e.g., `54.0` |

---

## 4. API Endpoints

### GET /sdt-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "A car travels at 60 km/h for 3 hours. How far does it travel (in km)?",
  "answer": 180,
  "display": "180 km",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "A train covers 240 km at 60 km/h. How long does the journey take (in hours)?",
  "answer": 4,
  "display": "4 hours",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "A cyclist rides 40 km at 20 km/h then 60 km at 30 km/h. Find the average speed (to 2 d.p. if needed).",
  "answer": 24.0,
  "display": "24.0 km/h",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Convert 15 m/s to km/h.",
  "answer": 54.0,
  "display": "54.0 km/h",
  "difficulty": "extrahard"
}
```

### POST /sdt-api/check

**Request Body:**
```json
{
  "userAnswer": "180",
  "answer": 180,
  "display": "180 km"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "180 km",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove all non-numeric characters except decimal point and minus)
- Compare: |user_value - server_answer| < 0.05
- Tolerance accommodates rounding variations

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Distance = Speed × Time)

**Algorithm:**
```
1. s = random integer from 20 to 80 (km/h)
2. t = random integer from 2 to 6 (hours)
3. answer = s * t (simple multiplication)
4. display = "{answer} km"
5. prompt = "A car travels at {s} km/h for {t} hours. How far does it travel (in km)?"
```

**Example:** s=60, t=3 → answer=180

### Difficulty: Medium (Time = Distance / Speed)

**Algorithm:**
```
1. s = random integer from 30 to 70 (km/h)
2. d = s * randInt(2, 5) (ensure clean divisible distance)
3. answer = d / s
4. display = "{answer} hours"
5. prompt = "A train covers {d} km at {s} km/h. How long does the journey take (in hours)?"
```

**Example:** s=60, random_mult=4 → d=240, answer=4

### Difficulty: Hard (Average Speed for Two-leg Journey)

**Algorithm:**
```
1. d1 = random integer from 30 to 80 (km)
2. s1 = random integer from 20 to 60 (km/h)
3. d2 = random integer from 30 to 80 (km)
4. s2 = random integer from 20 to 60 (km/h)
5. totalD = d1 + d2
6. Time calculation:
   - t1 = d1 / s1
   - t2 = d2 / s2
   - totalT = t1 + t2 = (d1*s2 + d2*s1) / (s1*s2)
7. Average speed:
   - avgSpeed = totalD / totalT
   - = totalD * (s1*s2) / (d1*s2 + d2*s1)
8. Reduce fraction if possible, else round to 2 dp
9. answer = result as integer or decimal to 2 dp
10. display = "{answer} km/h"
```

**Example:** d1=40, s1=20, d2=60, s2=30 → totalD=100, totalT=40/20+60/30=2+2=4, avg=25

### Difficulty: ExtraHard (m/s to km/h Conversion)

**Algorithm:**
```
1. ms = random integer from 5 to 30 (m/s)
2. Conversion factor: 1 m/s = 3.6 km/h
   - answer = ms * 3.6
3. Round to 2 decimal places
4. display = "{answer} km/h"
5. prompt = "Convert {ms} m/s to km/h."
```

**Example:** ms=15 → answer=15*3.6=54.0

---

## 6. Answer Checking Logic

**Parsing:**
- Remove all non-numeric characters except decimal point and minus sign
- Parse result as float
- Example: "180 km" → 180, "54.0 km/h" → 54.0

**Comparison:**
- |user_value - server_answer| < 0.05
- Tolerates rounding variations in intermediate calculations

---

## 7. Registration

**allApps Key:** `sdt`

**modeMap Component Name:** `SDTApp`

**CUSTOM_PUZZLES Registry Entry:** `Speed, Distance, Time`

**fetchQuestionForType URL:** `/sdt-api/question`

**apiMap Entry:**
```javascript
sdt: {
  fetchQuestion: '/sdt-api/question',
  checkAnswer: '/sdt-api/check'
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

- Helper function `gcd(a, b)` used for fraction reduction in hard mode
- Conversion factor: 1 m/s = 3.6 km/h (multiply by 3.6)
- Distances and speeds chosen to avoid overly complex fractions
- Average speed questions may involve non-integer answers rounded to 2 dp
