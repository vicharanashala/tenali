# Profit & Loss — Formal Specification

## 1. Overview

Profit & Loss quiz covering commercial arithmetic. Teaches students to:
- Calculate profit and loss (Profit = SP - CP)
- Calculate profit percentage (Profit % = Profit/CP × 100)
- Apply single discounts to marked price
- Calculate effects of successive/compound discounts
- Understand cost price (CP), selling price (SP), and marked price (MP)

**Target Grade Level:** Secondary (GCSE equivalent)

---

## 2. Component Specification

**Component Name:** `ProfitLossApp` (factory-generated)

**Factory Function:** `makeQuizApp` with configuration:
- `title: 'Profit & Loss'`
- `subtitle: 'Cost price, selling price, discounts'`
- `apiPath: 'profitloss-api'`
- `diffLabels: { easy: 'Easy — Profit', medium: 'Medium — Profit %', hard: 'Hard — Discount', extrahard: 'Extra Hard — Successive discounts' }`

**Answer Format:** Number (integer or decimal, e.g., `30`, `25`, `400`)

**Adaptive Mode Support:** Yes (float score 0-3, +0.25 correct, -0.35 wrong)

---

## 3. Difficulty Levels

| Level | Type | Example Question | Answer Format |
|-------|------|------------------|----------------|
| easy | Find profit | Bought $100, sold $130 — find profit | Integer, e.g., `30` |
| medium | Find profit % | CP=$200, SP=$250 — find profit % | Integer, e.g., `25` |
| hard | Single discount | Marked $500, 20% off — find selling price | Integer, e.g., `400` |
| extrahard | Successive discounts | $1000, 20% then 10% off — find final price | Integer, e.g., `720` |

---

## 4. API Endpoints

### GET /profitloss-api/question

**Query Parameters:**
- `difficulty` (string): one of `easy`, `medium`, `hard`, `extrahard` (default: `easy`)

**Example Response (Easy):**
```json
{
  "prompt": "An item is bought for $100 and sold for $130. Find the profit.",
  "answer": 30,
  "display": "$30",
  "difficulty": "easy"
}
```

**Example Response (Medium):**
```json
{
  "prompt": "Cost price = $200, selling price = $250. Find the profit percentage.",
  "answer": 25,
  "display": "25%",
  "difficulty": "medium"
}
```

**Example Response (Hard):**
```json
{
  "prompt": "A shirt has a marked price of $500. A 20% discount is applied. Find the selling price.",
  "answer": 400,
  "display": "$400",
  "difficulty": "hard"
}
```

**Example Response (ExtraHard):**
```json
{
  "prompt": "Marked price is $1000. Successive discounts of 20% and 10% are applied. Find the final price.",
  "answer": 720,
  "display": "$720",
  "difficulty": "extrahard"
}
```

### POST /profitloss-api/check

**Request Body:**
```json
{
  "userAnswer": "$30",
  "answer": 30,
  "display": "$30"
}
```

**Response:**
```json
{
  "correct": true,
  "display": "$30",
  "message": "Correct!"
}
```

**Answer Checking Logic:**
- Parse user answer as float (remove $, %, commas, and whitespace)
- Compare: |user_value - server_answer| < 0.05
- Tolerance accommodates rounding variations

---

## 5. Question Generation Algorithm

### Difficulty: Easy (Profit = SP - CP)

**Algorithm:**
```
1. cp = random(20 to 200) * 5 (cost price in dollars, multiples of 5)
2. profit = random(10 to 50) * 5 (profit in dollars, multiples of 5)
3. sp = cp + profit (selling price)
4. answer = profit
5. display = "$" + String(answer)
6. prompt = "An item is bought for ${cp} and sold for ${sp}. Find the profit."
```

**Example:** cp=100, profit=30, sp=130 → answer=30

### Difficulty: Medium (Profit % = (Profit / CP) × 100)

**Algorithm:**
```
1. cp = random(10 to 100) * 10 (cost price, multiples of 10)
2. profitPct = random(5 to 40) (profit percentage)
3. profit = cp * profitPct / 100
4. sp = cp + profit
5. answer = profitPct
6. display = String(answer) + "%"
7. prompt = "Cost price = ${cp}, selling price = ${sp}. Find the profit percentage."
```

**Example:** cp=200, profitPct=25, profit=50, sp=250 → answer=25

### Difficulty: Hard (Single Discount)

**Algorithm:**
```
1. mp = random(20 to 100) * 10 (marked price, multiples of 10)
2. discPct ∈ {10, 15, 20, 25, 30} (discount percentage)
3. sp = mp * (100 - discPct) / 100 (selling price after discount)
4. answer = sp
5. display = "$" + String(answer)
6. prompt = "A shirt has a marked price of ${mp}. A {discPct}% discount is applied. Find the selling price."
```

**Example:** mp=500, discPct=20 → sp=400 → answer=400

### Difficulty: ExtraHard (Successive Discounts)

**Algorithm:**
```
1. mp = random(20 to 100) * 10 (marked price, multiples of 10)
2. d1 ∈ {10, 20, 25} (first discount %)
3. d2 ∈ {10, 15, 20} (second discount %)
4. after1 = mp * (100 - d1) / 100 (price after first discount)
5. after2 = after1 * (100 - d2) / 100 (price after second discount)
6. answer = after2
7. display = "$" + String(answer)
8. prompt = "Marked price is ${mp}. Successive discounts of {d1}% and {d2}% are applied. Find the final price."
```

**Example:** mp=1000, d1=20, d2=10 → after1=800, after2=720 → answer=720

---

## 6. Answer Checking Logic

**Parsing:**
- Remove currency symbols ($), percent signs (%), commas, and whitespace
- Parse result as float
- Example: "$720" → 720, "25%" → 25, "$1,000" → 1000

**Comparison:**
- |user_value - server_answer| < 0.05
- Tolerates minor rounding variations in intermediate calculations

---

## 7. Registration

**allApps Key:** `profitloss`

**modeMap Component Name:** `ProfitLossApp`

**CUSTOM_PUZZLES Registry Entry:** `Profit & Loss`

**fetchQuestionForType URL:** `/profitloss-api/question`

**apiMap Entry:**
```javascript
profitloss: {
  fetchQuestion: '/profitloss-api/question',
  checkAnswer: '/profitloss-api/check'
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

- Formulas: Profit = SP - CP, Profit % = (Profit/CP) × 100, SP = MP × (100-Discount%)/100
- Successive discounts: NOT additive. Apply first discount, then apply second discount to the result
- All monetary amounts rounded to nearest whole dollar
- Discount percentages fixed to common retail values (10%, 15%, 20%, 25%, 30%)
