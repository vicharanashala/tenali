# Trigonometry — Formal Specification

## 1. Overview

**Trigonometry** teaches fundamental trigonometric concepts and principles for solving problems involving right-angled and general triangles. Students progress from basic Pythagorean theorem through SOH-CAH-TOA ratios to the sine rule, cosine rule, and area calculations using trigonometric functions.

**Target Grade Level:** Secondary/GCSE/A-Level Mathematics (ages 14+)

**Key Concepts Covered:**
- Pythagorean theorem (a² + b² = c²)
- Trigonometric ratios: sine, cosine, tangent (SOH-CAH-TOA)
- Sine rule: a/sinA = b/sinB = c/sinC
- Cosine rule: c² = a² + b² − 2ab·cos(C)
- Triangle area formula: Area = ½ab·sin(C)
- Right-angled and general triangle problem solving

## 2. Component Specification

**Component Name:** `TrigApp`

**Factory:** Created via `makeQuizApp()` factory function with configuration:
```javascript
{
  title: 'Trigonometry',
  subtitle: 'SOH-CAH-TOA, sine/cosine rule',
  apiPath: 'trig-api',
  diffLabels: {
    easy: 'Easy — Pythagoras',
    medium: 'Medium — Find Angle',
    hard: 'Hard — Sine Rule',
    extrahard: 'Extra Hard — Cosine/Area'
  },
  placeholders: 'e.g. 13 or 45.5'
}
```

**Props:**
- `onBack`: Callback function to return to menu

**Features:**
- Fixed or adaptive difficulty modes
- Four difficulty levels: easy, medium, hard, extrahard
- Answer input accepts numeric values with optional decimal places
- Tolerance-based answer checking (±0.5 tolerance for numerical answers)
- Adaptive mode supported: score ranges 0–3, +0.25 for correct, −0.35 for wrong

## 3. Difficulty Levels

| Level | Type | Focus | Example Question | Expected Answer |
|-------|------|-------|-------------------|-----------------|
| **Easy** | Pythagoras | Right-angled triangles, hypotenuse/leg calculation | "Right triangle: legs = 3 and 4. Find the hypotenuse." | 5 |
| **Easy** | Pythagoras | Find missing leg | "Right triangle: hypotenuse = 5, one leg = 3. Find the other leg." | 4 |
| **Medium** | SOH-CAH-TOA | Find angle in right triangle using sine, cosine, or tangent | "Right triangle: opposite = 5, hypotenuse = 10. Find the angle (degrees)." | 30 |
| **Hard** | Sine Rule | General triangle with known angles and one side | "Triangle: a = 10, angle A = 30°, angle B = 45°. Find side b (1 d.p.)." | ~14.1 |
| **Hard** | Sine Rule | Find unknown angle | "Triangle: a = 10, b = 14.1, angle A = 30°. Find angle B (degrees)." | 45 |
| **Extra Hard** | Cosine Rule | Find third side given two sides and included angle | "Triangle: a = 5, b = 6, angle C = 45°. Find side c (1 d.p.)." | ~4.4 |
| **Extra Hard** | Triangle Area | Calculate area from two sides and included angle | "Triangle: a = 8, b = 10, angle C = 60°. Find the area (1 d.p.)." | ~34.6 |

## 4. API Endpoints

### GET /trig-api/question

**Query Parameters:**
- `difficulty`: 'easy' | 'medium' | 'hard' | 'extrahard' (default: 'easy')

**Response:**
```json
{
  "id": 1234567890,
  "difficulty": "easy",
  "type": "pythagoras",
  "prompt": "Right triangle: legs = 3 and 4. Find the hypotenuse.",
  "answer": 5,
  "answerDen": 1
}
```

**Response Fields:**
- `id`: Unique question identifier (timestamp)
- `difficulty`: Question difficulty level
- `type`: Question subtype ('pythagoras', 'find_angle', 'sine_rule', 'cosine_rule', 'area')
- `prompt`: Human-readable question text
- `answer`: Expected numerical answer (float)
- `answerDen`: Denominator for answer (always 1 for trigonometry)

### POST /trig-api/check

**Request Body:**
```json
{
  "id": 1234567890,
  "difficulty": "easy",
  "type": "pythagoras",
  "prompt": "Right triangle: legs = 3 and 4. Find the hypotenuse.",
  "answer": 5,
  "answerDen": 1,
  "userAnswer": "5"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "5",
  "message": "Correct!"
}
```

**Checking Logic:**
- User answer is parsed as a float, removing degree symbols and whitespace
- Correct if: `|userNum - expectedAnswer| < 0.5` (±0.5 tolerance)
- Example: for answer 45°, accepts 44.5–45.5

## 5. Question Generation Algorithm

### Helper Functions
```
function triRand(lo, hi)
  return lo + floor(random() * (hi - lo + 1))

function triPick(arr)
  return arr[floor(random() * arr.length)]

// Pythagorean triples (exact values)
TRIPLES = [
  [3,4,5], [5,12,13], [8,15,17], [7,24,25],
  [6,8,10], [9,12,15], [10,24,26], [20,21,29]
]
```

### Easy — Pythagoras

```
difficulty = 'easy':
  triples = TRIPLES
  [a, b, c] = triPick(triples)
  subtype = triPick(['find_hyp', 'find_leg'])

  if subtype == 'find_hyp':
    prompt = "Right triangle: legs = {a} and {b}. Find the hypotenuse."
    answer = c
    answerDen = 1
  else:
    prompt = "Right triangle: hypotenuse = {c}, one leg = {a}. Find the other leg."
    answer = b
    answerDen = 1
```

### Medium — SOH-CAH-TOA

```
difficulty = 'medium':
  angle = triRand(15, 75)  // degrees
  rad = angle * π / 180
  side = triRand(5, 20)
  fn = triPick(['sin', 'cos', 'tan'])

  if fn == 'sin':
    hyp = side
    opp = round(hyp * sin(rad) * 10) / 10
    prompt = "Right triangle: opposite = {opp}, hypotenuse = {hyp}. Find the angle (degrees)."
    answer = angle

  else if fn == 'cos':
    hyp = side
    adj = round(hyp * cos(rad) * 10) / 10
    prompt = "Right triangle: adjacent = {adj}, hypotenuse = {hyp}. Find the angle (degrees)."
    answer = angle

  else (fn == 'tan'):
    adj = side
    opp = round(adj * tan(rad) * 10) / 10
    prompt = "Right triangle: opposite = {opp}, adjacent = {adj}. Find the angle (degrees)."
    answer = angle

  answerDen = 1
```

### Hard — Sine Rule

```
difficulty = 'hard':
  A = triRand(30, 80)    // degrees
  B = triRand(30, 150 - A)
  C = 180 - A - B
  radA = A * π / 180
  radB = B * π / 180
  a = triRand(5, 20)
  b = round(a * sin(radB) / sin(radA) * 10) / 10
  subtype = triPick(['find_side', 'find_angle'])

  if subtype == 'find_side':
    prompt = "Triangle: a = {a}, angle A = {A}°, angle B = {B}°. Find side b (1 d.p.)."
    answer = b
  else:
    prompt = "Triangle: a = {a}, b = {b}, angle A = {A}°. Find angle B (degrees)."
    answer = B

  answerDen = 1
```

### Extra Hard — Cosine Rule or Area

```
difficulty = 'extrahard':
  subtype = triPick(['cosine', 'area'])

  if subtype == 'cosine':
    a = triRand(5, 15)
    b = triRand(5, 15)
    C = triRand(30, 120)  // degrees
    radC = C * π / 180
    c² = a² + b² - 2*a*b*cos(radC)
    c = round(√c² * 10) / 10
    prompt = "Triangle: a = {a}, b = {b}, angle C = {C}°. Find side c (1 d.p.)."
    answer = c

  else (subtype == 'area'):
    a = triRand(5, 15)
    b = triRand(5, 15)
    C = triRand(30, 120)  // degrees
    radC = C * π / 180
    area = round(0.5 * a * b * sin(radC) * 10) / 10
    prompt = "Triangle: a = {a}, b = {b}, angle C = {C}°. Find the area (1 d.p.)."
    answer = area

  answerDen = 1
```

## 6. Answer Checking Logic

**Numeric Tolerance Matching:**
- User input is normalized: remove degree symbols (°), trim whitespace
- Parse as floating-point number
- Accept if: `|parsed_value - expected_answer| < 0.5`

**Example Acceptances:**
- Expected 45, accept 44.5–45.4999...
- Expected 13.0, accept 12.5–13.4999...
- Expected 30.5, accept 30.0–31.0

**Rejection Cases:**
- Non-numeric input
- Outside tolerance range
- Invalid formats

## 7. Registration

**allApps Key:** `trig`

**modeMap Component:** `TrigApp` (registered in `modeMap` object in App.jsx)

**CUSTOM_PUZZLES Entry:**
```javascript
{ key: 'trig', name: 'Trigonometry' }
```

**fetchQuestionForType URL:**
```
`${API}/trig-api/question?difficulty=${difficulty}`
```

**apiMap Entry:**
```javascript
trig: 'trig-api'
```

**Factory Configuration (App.jsx line 3314–3318):**
```javascript
const TrigApp = makeQuizApp({
  title: 'Trigonometry',
  subtitle: 'SOH-CAH-TOA, sine/cosine rule',
  apiPath: 'trig-api',
  diffLabels: {
    easy: 'Easy — Pythagoras',
    medium: 'Medium — Find Angle',
    hard: 'Hard — Sine Rule',
    extrahard: 'Extra Hard — Cosine/Area'
  },
  placeholders: 'e.g. 13 or 45.5'
})
```

## 8. Adaptive Mode

**Supported:** Yes, via `makeQuizApp()` factory

**Adaptive Score Range:** 0 to 3
- Score 0.0 → Difficulty: easy
- Score 0.75–1.5 → Difficulty: medium
- Score 1.75–2.5 → Difficulty: hard
- Score 2.75+ → Difficulty: extrahard

**Score Adjustment:**
- Correct answer: +0.25
- Wrong answer: −0.35

**Visual Feedback:**
- Gradient progress bar showing current level
- Difficulty label updates in real-time: "Easy", "Medium", "Hard", "Extra Hard"
- Color codes: easy (#4caf50), medium (#ff9800), hard (#f44336), extrahard (#9c27b0)

**Example Flow:**
1. Start at score 0 (easy)
2. Answer 1 correct → score 0.25 (still easy)
3. Answer 1 wrong → score 0 (still easy)
4. Answer 3 correct → score 1 (crossing into medium)
5. Answer 2 wrong → score 0.3 (back to easy)
