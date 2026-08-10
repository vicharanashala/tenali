# Probability — Formal Specification

## 1. Overview

**Probability** teaches students to calculate and reason about the likelihood of events using fundamental probability rules. Students progress from simple single events through independent events, combined events, and conditional probability (with and without replacement).

**Target Grade Level:** Secondary/GCSE Mathematics (ages 13+)

**Key Concepts Covered:**
- Simple probability: P(event) = favorable outcomes / total outcomes
- Independent events: P(A and B) = P(A) × P(B)
- Mutually exclusive events: P(A or B) = P(A) + P(B)
- General addition rule: P(A or B) = P(A) + P(B) − P(A and B)
- Conditional probability without replacement
- Fraction simplification and equivalence

## 2. Component Specification

**Component Name:** `ProbApp`

**Factory:** Created via `makeQuizApp()` factory function with configuration:
```javascript
{
  title: 'Probability',
  subtitle: 'Single & combined events',
  apiPath: 'prob-api',
  diffLabels: {
    easy: 'Easy — Simple',
    medium: 'Medium — Independent',
    hard: 'Hard — Or events',
    extrahard: 'Extra Hard — No replacement'
  },
  placeholders: 'e.g. 3/10'
}
```

**Props:**
- `onBack`: Callback function to return to menu

**Features:**
- Four difficulty levels: easy, medium, hard, extrahard
- Fraction and decimal answer acceptance
- Automatic fraction simplification
- Adaptive mode supported: score 0–3, +0.25 correct, −0.35 wrong

## 3. Difficulty Levels

| Level | Type | Focus | Example | Expected Answer |
|-------|------|-------|---------|-----------------|
| **Easy** | Simple probability | Count favorable outcomes | "Bag: 3 red, 4 blue, 2 green. P(red)?" | 3/9 = 1/3 |
| **Medium** | Independent events | Multiply independent probabilities | "P(A)=2/5, P(B)=3/7, independent. P(A and B)?" | 6/35 |
| **Hard** | Mutually exclusive OR | P(A or B) = P(A) + P(B) | "P(A)=2/8, P(B)=3/8, exclusive. P(A or B)?" | 5/8 |
| **Hard** | General OR rule | P(A or B) = P(A) + P(B) − P(A∩B) | "P(A)=3/10, P(B)=4/10, P(A∩B)=1/10. P(A or B)?" | 6/10 = 3/5 |
| **Extra Hard** | Without replacement | Dependent events, two draws | "Bag: 6 red, 5 blue. Two drawn without replacement. P(same color)?" | (6×5 + 5×4)/(11×10) = 50/110 = 5/11 |

## 4. API Endpoints

### GET /prob-api/question

**Query Parameters:**
- `difficulty`: 'easy' | 'medium' | 'hard' | 'extrahard' (default: 'easy')

**Response (Easy — Simple):**
```json
{
  "id": 1234567890,
  "difficulty": "easy",
  "type": "simple",
  "prompt": "A bag has 2 red, 3 blue, 1 green. P(blue)?",
  "ansNum": 1,
  "ansDen": 2
}
```

**Response (Medium — Independent):**
```json
{
  "id": 1234567890,
  "difficulty": "medium",
  "type": "independent",
  "prompt": "P(A) = 2/5, P(B) = 3/8. A and B are independent. Find P(A and B).",
  "ansNum": 3,
  "ansDen": 20
}
```

**Response (Hard — OR Events):**
```json
{
  "id": 1234567890,
  "difficulty": "hard",
  "type": "or_event",
  "prompt": "P(A) = 2/8, P(B) = 3/8. A and B are mutually exclusive. Find P(A or B).",
  "ansNum": 5,
  "ansDen": 8
}
```

**Response (Extra Hard — Without Replacement):**
```json
{
  "id": 1234567890,
  "difficulty": "extrahard",
  "type": "without_replacement",
  "prompt": "A bag has 6 red and 5 blue balls. Two drawn without replacement. P(same colour)?",
  "ansNum": 5,
  "ansDen": 11
}
```

### POST /prob-api/check

**Request Body:**
```json
{
  "ansNum": 1,
  "ansDen": 3,
  "userAnswer": "1/3"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "1/3",
  "message": "Correct!"
}
```

**Checking Logic:**
- Parse user answer as fraction or decimal
- Simplify both answers
- Correct if numerators and denominators match after simplification
- Also accept decimal approximation within 0.01 tolerance

## 5. Question Generation Algorithm

### Helper Functions
```
function triRand(lo, hi)
  return lo + floor(random() * (hi - lo + 1))

function triPick(arr)
  return arr[floor(random() * arr.length)]

function gcd(a, b)
  return b === 0 ? a : gcd(b, a % b)

function simplifyFraction(num, den)
  g = gcd(abs(num), abs(den))
  return { num: num/g, den: den/g }
```

### Easy — Simple Probability

```
difficulty = 'easy':
  items = triPick([
    { desc: 'bag', contents: { red: triRand(2,6), blue: triRand(2,6), green: triRand(1,4) }, ask: 'red' },
    { desc: 'bag', contents: { red: triRand(1,5), blue: triRand(2,7), yellow: triRand(1,3) }, ask: 'blue' },
    { desc: 'box', contents: { apple: triRand(2,5), orange: triRand(3,6), banana: triRand(1,4) }, ask: 'orange' }
  ])

  total = sum(items.contents values)
  favorable = items.contents[items.ask]
  g = gcd(favorable, total)

  ansNum = favorable / g
  ansDen = total / g
  prompt = "A {items.desc} has {contents.join(', ')}. P({items.ask})?"
```

### Medium — Independent Events

```
difficulty = 'medium':
  n1 = triRand(2, 6)
  d1 = triRand(n1 + 1, 10)
  n2 = triRand(2, 6)
  d2 = triRand(n2 + 1, 10)

  // P(A and B) = P(A) × P(B)
  prodN = n1 * n2
  prodD = d1 * d2
  g = gcd(prodN, prodD)

  prompt = "P(A) = {n1}/{d1}, P(B) = {n2}/{d2}. A and B are independent. Find P(A and B)."
  ansNum = prodN / g
  ansDen = prodD / g
```

### Hard — OR Events

```
difficulty = 'hard':
  exclusive = triPick([true, false])

  if exclusive:
    n1 = triRand(1, 4)
    n2 = triRand(1, 4)
    d = triRand(n1 + n2 + 1, 12)
    g = gcd(n1 + n2, d)

    prompt = "P(A) = {n1}/{d}, P(B) = {n2}/{d}. A and B are mutually exclusive. Find P(A or B)."
    ansNum = (n1 + n2) / g
    ansDen = d / g
  else:
    d = triRand(8, 20)
    nA = triRand(3, d - 3)
    nB = triRand(3, d - 3)
    nAB = triRand(1, min(nA, nB) - 1)
    nAuB = nA + nB - nAB
    g = gcd(nAuB, d)

    prompt = "P(A) = {nA}/{d}, P(B) = {nB}/{d}, P(A and B) = {nAB}/{d}. Find P(A or B)."
    ansNum = nAuB / g
    ansDen = d / g
```

### Extra Hard — Without Replacement

```
difficulty = 'extrahard':
  total = triRand(8, 15)
  typeA = triRand(3, total - 3)
  typeB = total - typeA

  // P(both same type) without replacement
  // = P(both A) + P(both B)
  // = [typeA/total × (typeA-1)/(total-1)] + [typeB/total × (typeB-1)/(total-1)]
  // = [typeA(typeA-1) + typeB(typeB-1)] / [total(total-1)]

  pNum = typeA * (typeA - 1) + typeB * (typeB - 1)
  pDen = total * (total - 1)
  g = gcd(pNum, pDen)

  prompt = "A bag has {typeA} red and {typeB} blue balls. Two drawn without replacement. P(same colour)?"
  ansNum = pNum / g
  ansDen = pDen / g
```

## 6. Answer Checking Logic

**String Normalization:**
```
userStr = userAnswer.replace(/\s+/g, '').replace(/−/g, '-')
```

**Fraction/Decimal Parsing:**
```
if userStr matches /^(-?\d+)\/(-?\d+)$/:
  uNum = parseInt(match[1])
  uDen = parseInt(match[2])
else:
  n = parseFloat(userStr)
  if !isNaN(n):
    // Convert to 1000ths for comparison
    uNum = round(n * 1000)
    uDen = 1000
```

**Simplification and Comparison:**
```
us = simplifyFraction(uNum, uDen)
es = simplifyFraction(ansNum, ansDen)
correct = (us.num === es.num && us.den === es.den)

// Display simplified form
display = (es.den === 1) ? String(es.num) : "{es.num}/{es.den}"
```

## 7. Registration

**allApps Key:** `prob`

**modeMap Component:** `ProbApp` (registered in `modeMap` object)

**CUSTOM_PUZZLES Entry:**
```javascript
{ key: 'prob', name: 'Probability' }
```

**fetchQuestionForType URL:**
```
`${API}/prob-api/question?difficulty=${difficulty}`
```

**apiMap Entry:**
```javascript
prob: 'prob-api'
```

**Factory Configuration (App.jsx line 3333–3337):**
```javascript
const ProbApp = makeQuizApp({
  title: 'Probability',
  subtitle: 'Single & combined events',
  apiPath: 'prob-api',
  diffLabels: {
    easy: 'Easy — Simple',
    medium: 'Medium — Independent',
    hard: 'Hard — Or events',
    extrahard: 'Extra Hard — No replacement'
  },
  placeholders: 'e.g. 3/10'
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
- Progress bar with color gradient
- Real-time difficulty label updates
- Colors: easy (#4caf50), medium (#ff9800), hard (#f44336), extrahard (#9c27b0)

**Example Progression:**
1. Start easy (score 0)
2. 2 correct → score 0.5 (still easy)
3. 1 wrong → score 0.15 (still easy)
4. 4 correct → score 1.15 (medium)
5. 3 correct → score 1.9 (approaching hard)
