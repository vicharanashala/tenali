# Prime Factorization — Formal Specification

## 1. Purpose

A prime factorization puzzle where the player enters prime factors one at a time. After each correct factor is entered, the remaining number shrinks and the chain is displayed live (e.g., "100 = 2 × 50" → "100 = 2 × 2 × 25" → ...). The quiz auto-completes when the remaining number becomes 1, and features a "Give Up" button. Uses a NumPad input and difficulty levels controlling the starting number range.

## 2. Constants

```javascript
const AUTO_ADVANCE_MS = 1500  // auto-advance delay in milliseconds (between factors)
```

## 3. Difficulty Levels

| Level | Number Range | Example |
|-------|-------------|---------|
| Easy | 2–100 | 100 = 2 × 2 × 5 × 5 |
| Medium | 2–300 | 210 = 2 × 3 × 5 × 7 |
| Hard | 2–1000 | 960 = 2 × 2 × 2 × 2 × 2 × 2 × 3 × 5 |

**Server-side implementation:**
The server generates a random composite number in the difficulty range and pre-computes its prime factorization. Each factor is revealed incrementally as the player submits correct factors.

## 4. API Specification

### 4.1 GET /primefactor-api/question

**Query parameters:**
- `difficulty` (string, optional): 'easy', 'medium', or 'hard'. Default: 'easy'.

**Response (200):**
```json
{
  "id": "primefactor-1775067701647-0.857",
  "difficulty": "easy",
  "originalNumber": 100,
  "allFactors": [2, 2, 5, 5],
  "remaining": 100,
  "factorsFound": [],
  "prompt": "Prime factorization of 100"
}
```

The `allFactors` array contains all prime factors in ascending order (including duplicates). The `remaining` is the number still to be factored. The `factorsFound` is initially empty and grows as the player submits factors.

### 4.2 POST /primefactor-api/check

**Request body:**
```json
{
  "originalNumber": 100,
  "factor": 2,
  "currentRemaining": 100
}
```

**Response (200):**
```json
{
  "correct": true,
  "nextRemaining": 50,
  "factorsFound": [2],
  "allFactorsList": [2, 2, 5, 5],
  "isComplete": false,
  "message": "Correct! Remaining: 50"
}
```

**Validation:** Check if `currentRemaining % factor === 0`. If correct, divide to get `nextRemaining`. Return `isComplete: true` when `nextRemaining === 1` or when all factors have been found.

## 5. Frontend Component Specification

### 5.1 Component: PrimefactorApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| difficulty | string | 'easy' | Selected difficulty |
| started | boolean | false | Quiz has begun |
| finished | boolean | false | Puzzle complete (remaining = 1) |
| question | object/null | null | Current puzzle state |
| factor | string | '' | Current factor input |
| score | number | 0 | Count of puzzles solved |
| puzzleNumber | number | 0 | Current puzzle number |
| feedback | string | '' | Feedback from submission |
| loading | boolean | false | Fetching puzzle |
| revealed | boolean | false | Feedback shown |
| results | array | [] | Result objects for each puzzle |
| chainDisplay | string | '' | Live factorization chain |

**Timer:** `useTimer()` — starts on puzzle load, stops on completion.

**advanceRef:** `useRef(() => {})` — updated every render with current advance logic.

### 5.2 User Flow

```
[Show difficulty selector: Easy / Medium / Hard]
[Show "Start Puzzles" button]
        ↓ (click Start)
[Lock difficulty selector]
[Set started=true, puzzleNumber=1, score=0, results=[]]
[fetchPuzzle(difficulty)]
        ↓
[Display: "Puzzle N", "Prime factorization of 100"]
[Display live chain: "100 = 100"]
[Input field: "Enter next prime factor" with NumPad below]
[Timer starts counting]
        ↓ (type factor via NumPad, submit)
[POST /primefactor-api/check]
[Stop timer (but don't reset for next factor)]
        ↓ (correct factor)
[Update chainDisplay: "100 = 2 × 50"]
[Clear input, show feedback: "Correct! Remaining: 50"]
[Auto-advance after 1.5s to next input field for next factor]
[Repeat until isComplete = true]
        ↓ (puzzle complete)
[Show feedback: "Puzzle solved! All factors found."]
[Record result: question, allFactors, time]
[Auto-advance after 1.5s if completed correctly]
        ↓
[fetchPuzzle(difficulty)] → next puzzle, or show "Finished" screen
[Show ResultsTable with all completed puzzles]
[Show "Play Again" button → restarts]
```

### 5.3 Chain Display

The live chain is built from the `factorsFound` array:
```javascript
const chainStr = `${question.originalNumber} = ${
  [...question.factorsFound, question.remaining].join(' × ')
}`;
// Example progression:
// "100 = 100"
// "100 = 2 × 50"
// "100 = 2 × 2 × 25"
// "100 = 2 × 2 × 5 × 5"
```

### 5.4 Feedback Format

Client-side construction:
```javascript
// On correct factor: "Correct! Remaining: 50"
// On incorrect factor: "Incorrect. 50 is not a factor of 100."
// On puzzle complete: "Puzzle solved! Prime factors: 2, 2, 5, 5"
```

### 5.5 Results Record

After each puzzle completion, append to `results`:
```javascript
{
  question: `Prime factorization of ${question.originalNumber}`,
  userAnswer: question.factorsFound.join(', '),
  correctAnswer: question.allFactorsList.join(', '),
  correct: true,
  time: timeTaken
}
```

### 5.6 UI Layout

```
┌─────────────────────────────────┐
│ [← Home]                        │
│     Prime Factorization         │
│  Find all prime factors         │
│       one at a time             │
│                    [14s] [Score]│
│ [Easy] [Medium] [Hard]          │
│                                 │
│       Puzzle 3                  │
│  Prime factorization of 100     │
│      100 = 2 × 2 × 25          │
│                                 │
│  Enter next prime factor:       │
│       ┌──────────────┐           │
│       │  Type answer  │           │
│       └──────────────┘           │
│     [1] [2] [3]                 │
│     [4] [5] [6]                 │
│     [7] [8] [9]                 │
│     [       0       ]            │
│  [⌫ ] [ Submit]  [Give Up]      │
│┌─ Correct! Remaining: 5 ───────┐│
│  (next factor field in 1.5s if correct) ││
│┌── Results Table ──────────────┐│
│ # │ Number │ Factors │ ✓/✗ │ t││
│└──────────────────────────────┘│
└─────────────────────────────────┘
```

### 5.7 Keyboard Support

- Enter key: submit factor or advance to next puzzle
- Digits 0–9: append to input via physical keyboard
- Backspace: delete last character
- NumPad provides visual alternative input method

### 5.8 NumPad

An on-screen numeric keypad with digits 0–9 arranged in a calculator-style grid. Also features:
- A ⌫ key that deletes the last character
- No ± key (factors are always positive)

NumPad key handler:
```javascript
const handleNumPad = (key) => {
  if (key === '⌫') setFactor(prev => prev.slice(0, -1))
  else setFactor(prev => prev + key)
}
```

Input validation (onChange): `if (v === '' || /^\d+$/.test(v)) setFactor(v)`

### 5.9 Give Up Button

The "Give Up" button is always visible. Clicking it:
- Stops the current puzzle
- Marks it as incorrect
- Displays all factors: "The factors are: 2, 2, 5, 5"
- Records the result with `correct: false`
- Auto-advances to the next puzzle after 1.5s

### 5.10 Auto-Advance

Uses the shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook. After a correct factor or puzzle completion is revealed, automatically advances after 1.5 seconds. On wrong factors, the player must submit again. The player can press Enter to skip the wait on correct answers.

### 5.11 Running Results Table

The results table is displayed during gameplay and grows as puzzles are completed.

## 6. Implementation Notes

- Difficulty selector is disabled once quiz starts
- Factors are always positive integers
- Input validation accepts only digits
- Timer continues running across multiple factors within a single puzzle (resets on new puzzle)
- "Give Up" reveals all factors but records the puzzle as incomplete
- Each puzzle can have multiple factors, but time is tracked as total time for the puzzle
- Configurable puzzle count (default similar to other apps: unlimited or until "Back" pressed)
- Results array is reset on "Play Again"
- Uses DM Sans (body/UI) and Source Serif 4 (heading) fonts from Google Fonts
