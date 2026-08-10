# Statistics — Formal Specification

## 1. Overview

**Statistics** teaches students to summarize and analyze data using measures of central tendency (mean, median, mode) and spread (range). Students work with raw data lists and frequency tables to identify patterns and compare datasets.

**Target Grade Level:** Secondary/GCSE Mathematics (ages 12+)

**Key Concepts Covered:**
- Mean: average of all values = Σx / n
- Median: middle value when data is ordered
- Mode: most frequently occurring value
- Range: difference between maximum and minimum
- Frequency tables and grouped data
- Decimal and fraction representations

## 2. Component Specification

**Component Name:** `StatsApp`

**Factory:** Created via `makeQuizApp()` factory function with configuration:
```javascript
{
  title: 'Statistics',
  subtitle: 'Mean, median, mode, range',
  apiPath: 'stats-api',
  diffLabels: {
    easy: 'Easy — Mean',
    medium: 'Medium — Median',
    hard: 'Hard — Mode/Range',
    extrahard: 'Extra Hard — Frequency'
  },
  placeholders: 'e.g. 12 or 7/3'
}
```

**Props:**
- `onBack`: Callback function to return to menu

**Features:**
- Four difficulty levels: easy, medium, hard, extrahard
- Supports integer, decimal, and fraction answers
- Automatic fraction simplification
- Adaptive mode supported: score 0–3, +0.25 correct, −0.35 wrong

## 3. Difficulty Levels

| Level | Type | Focus | Example | Expected Answer |
|-------|------|-------|---------|-----------------|
| **Easy** | Mean | Calculate average of 5-8 numbers | "Find mean of: 3, 5, 7, 9, 11" | 7 or 35/5 |
| **Medium** | Median | Find middle value of 5-10 numbers | "Find median of: 2, 7, 5, 1, 9" | 5 |
| **Medium** | Median | Even count (average of two middle) | "Find median of: 1, 3, 5, 7" | 4 |
| **Hard** | Mode | Most frequent value | "Find mode of: 3, 3, 3, 5, 7, 9" | 3 |
| **Hard** | Range | Max − Min | "Find range of: 2, 8, 5, 1, 15" | 14 |
| **Extra Hard** | Frequency table | Mean from frequency distribution | "Table: value 1 (×3), 2 (×5), 3 (×2). Mean?" | 1.7 or 17/10 |

## 4. API Endpoints

### GET /stats-api/question

**Query Parameters:**
- `difficulty`: 'easy' | 'medium' | 'hard' | 'extrahard' (default: 'easy')

**Response (Easy — Mean):**
```json
{
  "id": 1234567890,
  "difficulty": "easy",
  "type": "mean",
  "prompt": "Find the mean of: 3, 5, 7, 9, 11",
  "data": [3, 5, 7, 9, 11],
  "ansNum": 7,
  "ansDen": 1
}
```

**Response (Medium — Median):**
```json
{
  "id": 1234567890,
  "difficulty": "medium",
  "type": "median",
  "prompt": "Find the median of: 2, 7, 5, 1, 9",
  "data": [2, 7, 5, 1, 9],
  "ansNum": 5,
  "ansDen": 1
}
```

**Response (Hard — Mode/Range):**
```json
{
  "id": 1234567890,
  "difficulty": "hard",
  "type": "mode",
  "prompt": "Find the mode of: 3, 3, 3, 5, 7, 9",
  "data": [3, 3, 3, 5, 7, 9],
  "answer": 3,
  "display": "3"
}
```

**Response (Extra Hard — Frequency Table):**
```json
{
  "id": 1234567890,
  "difficulty": "extrahard",
  "type": "freq_mean",
  "prompt": "Frequency table: 1(×3), 2(×5), 3(×2). Find the mean.",
  "ansNum": 17,
  "ansDen": 10
}
```

### POST /stats-api/check

**Request Body:**
```json
{
  "type": "mean",
  "ansNum": 7,
  "ansDen": 1,
  "userAnswer": "7"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "7",
  "message": "Correct!"
}
```

**Checking Logic by Type:**

**mode & range:**
- Parse user answer as integer
- Direct numeric comparison
- Correct if values match

**mean, median, freq_mean:**
- Accept fraction or decimal
- Simplify both answers
- Correct if simplified forms match
- Decimal approximation within 0.01 tolerance

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

### Easy — Mean

```
difficulty = 'easy':
  n = triRand(5, 8)
  data = Array(n).fill(0).map(() => triRand(1, 20))
  sum = data.reduce((s, v) => s + v, 0)
  g = gcd(sum, n)

  prompt = "Find the mean of: {data.join(', ')}"
  ansNum = sum / g
  ansDen = n / g
  type = 'mean'
```

### Medium — Median

```
difficulty = 'medium':
  n = triPick([5, 7, 9, 6, 8, 10])
  data = Array(n).fill(0).map(() => triRand(1, 30))
  sorted = [...data].sort((a, b) => a - b)

  if n is odd:
    median = sorted[floor(n / 2)]
    ansNum = median
    ansDen = 1
  else:
    a = sorted[n / 2 - 1]
    b = sorted[n / 2]
    g = gcd(a + b, 2)
    ansNum = (a + b) / g
    ansDen = 2 / g

  prompt = "Find the median of: {data.join(', ')}"
  type = 'median'
```

### Hard — Mode or Range

```
difficulty = 'hard':
  subtype = triPick(['mode', 'range'])
  n = triRand(7, 12)

  if subtype == 'mode':
    modeVal = triRand(1, 20)
    data = [modeVal, modeVal, modeVal]
    while data.length < n:
      v = triRand(1, 25)
      if v !== modeVal or count(data, v) < 2:
        data.push(v)
    shuffle(data)

    prompt = "Find the mode of: {data.join(', ')}"
    answer = modeVal
    display = String(modeVal)
    type = 'mode'
  else:
    data = Array(n).fill(0).map(() => triRand(1, 50))
    range = max(data) - min(data)

    prompt = "Find the range of: {data.join(', ')}"
    answer = range
    display = String(range)
    type = 'range'
```

### Extra Hard — Frequency Table Mean

```
difficulty = 'extrahard':
  values = [1, 2, 3, 4, 5]
  freqs = values.map(() => triRand(1, 10))
  totalF = freqs.reduce((s, v) => s + v, 0)
  totalFx = values.reduce((s, v, i) => s + v * freqs[i], 0)
  g = gcd(totalFx, totalF)

  table = values.map((v, i) => "{v}(×{freqs[i]})").join(', ')
  prompt = "Frequency table: {table}. Find the mean."
  ansNum = totalFx / g
  ansDen = totalF / g
  type = 'freq_mean'
```

## 6. Answer Checking Logic

**String Normalization:**
```
userStr = userAnswer.replace(/\s+/g, '').replace(/−/g, '-')
```

**For mode & range:**
```
userNum = parseFloat(userStr)
correct = !isNaN(userNum) && userNum === expectedAnswer
```

**For mean, median, freq_mean:**
```
// Try fraction
if userStr matches /^(-?\d+)\/(-?\d+)$/:
  uNum = parseInt(match[1])
  uDen = parseInt(match[2])
else:
  // Try integer
  n = parseFloat(userStr)
  if Number.isInteger(n):
    uNum = n
    uDen = 1
  else if !isNaN(n):
    // Convert to decimal for comparison
    uNum = round(n * 100)
    uDen = 100

// Simplify both
us = simplifyFraction(uNum, uDen)
es = simplifyFraction(ansNum, ansDen)
correct = (us.num === es.num && us.den === es.den)

// Also allow decimal approximation
if !correct && !isNaN(parseFloat(userStr)):
  correct = abs(parseFloat(userStr) - es.num / es.den) < 0.01
```

## 7. Registration

**allApps Key:** `stats`

**modeMap Component:** `StatsApp` (registered in `modeMap` object)

**CUSTOM_PUZZLES Entry:**
```javascript
{ key: 'stats', name: 'Statistics' }
```

**fetchQuestionForType URL:**
```
`${API}/stats-api/question?difficulty=${difficulty}`
```

**apiMap Entry:**
```javascript
stats: 'stats-api'
```

**Factory Configuration (App.jsx line 3339–3343):**
```javascript
const StatsApp = makeQuizApp({
  title: 'Statistics',
  subtitle: 'Mean, median, mode, range',
  apiPath: 'stats-api',
  diffLabels: {
    easy: 'Easy — Mean',
    medium: 'Medium — Median',
    hard: 'Hard — Mode/Range',
    extrahard: 'Extra Hard — Frequency'
  },
  placeholders: 'e.g. 12 or 7/3'
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
- Gradient progress bar showing level transitions
- Real-time difficulty label updates
- Colors: easy (#4caf50), medium (#ff9800), hard (#f44336), extrahard (#9c27b0)

**Example Progression:**
1. Start easy (score 0)
2. 3 correct → score 0.75 (entering medium)
3. 2 correct → score 1.25 (solidly medium)
4. 1 wrong → score 0.9 (back to easy)
5. 5 correct → score 2.15 (entering hard)
