# Vocab Builder — Formal Specification

## 1. Overview

A vocabulary building puzzle with 5 difficulty levels across 3,964 curated words. The player selects a difficulty level, configures the question count (default 20), and solves multiple-choice problems where each question shows a word and the player must select the correct definition from 4 options. Features instant keyboard selection (1-4 or A-D), auto-advance after 1.5 seconds on correct answers, and a running results table displayed during and after gameplay.

## 2. Component Specification

**Component:** `VocabApp` (located in `/vocab/VocabApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `VocabApp.jsx`
- Questions data: `vocab/questions/NNNN.json` (3,964 files across 5 difficulty levels)
- Server: `/vocab-api/` routes

## 3. Data Source

### 3.1 Question Format

Each question is a JSON file stored in `vocab/questions/` named `NNNN.json`:

```json
{
  "id": 1,
  "word": "Brave",
  "question": "Brave",
  "options": [
    "Free from pretence or deceit",
    "Mild and kind in manner",
    "Not afraid of danger",
    "Shiny and smooth on the surface"
  ],
  "answerOption": "C",
  "answerText": "Not afraid of danger",
  "difficulty": "easy"
}
```

**Fields:**
- `id` (integer): Unique question identifier
- `word` (string): The vocabulary word shown to player
- `question` (string): The vocabulary word (same as `word` field)
- `options` (string[4]): Exactly 4 definitions: 1 correct + 3 distractors
- `answerOption` (string): Correct option letter (A/B/C/D)
- `answerText` (string): The text of the correct definition
- `difficulty` (string): One of 'easy', 'medium', 'hard', 'extra-hard', 'hardest'

### 3.2 Difficulty Levels

| Level | ID Range | Count | Example Words |
|-------|----------|-------|---------------|
| easy | 1–999 | 999 | brave, curious, enormous, gentle, hesitate |
| medium | 1000–1997 | 997 | diligent, eloquent, peculiar, reluctant, abundant |
| hard | 1998–2993 | 996 | ambiguous, benevolent, cacophony, ephemeral, gregarious |
| extra-hard | 2994–3965 | 972 | equivocate, iconoclast, laconic, magnanimous, obsequious |

**Total:** 3,964 questions across all levels

### 3.3 Data Loading

Questions are loaded once at server startup by the `loadVocab()` function, which reads all JSON files from `vocab/questions/` into an in-memory array organized by difficulty level.

## 4. API Endpoints

### 4.1 GET /vocab-api/question

**Purpose:** Fetch a random vocabulary question at the specified difficulty, excluding previously seen questions.

**Query Parameters:**
- `difficulty` (string, optional): One of 'easy', 'medium', 'hard', 'extra-hard', 'hardest'. Defaults to 'easy'.
- `exclude` (optional, string): Comma-separated list of question IDs to exclude (deduplication)

**Request Example:**
```
GET /vocab-api/question?difficulty=medium&exclude=5,12,34
```

**Response (200):**
```json
{
  "id": 2045,
  "question": "Ephemeral",
  "options": [
    "Open to more than one interpretation",
    "Lasting for a very short time",
    "A harsh mixture of discordant sounds",
    "Fond of company; sociable"
  ],
  "difficulty": "hard"
}
```

**Response Fields:**
- `id` (integer): Unique question identifier
- `question` (string): The vocabulary word to define
- `options` (string[4]): Exactly 4 definitions in order [A, B, C, D]
- `difficulty` (string): The difficulty level

**Important:** The response does NOT include `answerOption` or `answerText` to prevent client-side cheating.

**Error Response (500):**
```json
{ "error": "No questions found" }
```
Returned if no questions remain in the difficulty level after excluding seen IDs.

### 4.2 POST /vocab-api/check

**Purpose:** Validate the player's answer.

**Request Body:**
```json
{
  "id": 2045,
  "answerOption": "B"
}
```

**Request Fields:**
- `id` (integer): Question ID being answered
- `answerOption` (string): Player's selected option letter (A/B/C/D), case-insensitive

**Response (200):**
```json
{
  "correct": true,
  "correctAnswer": "B",
  "correctAnswerText": "Lasting for a very short time",
  "message": "Correct!"
}
```

**Response Fields:**
- `correct` (boolean): True if answer matches the correct answer
- `correctAnswer` (string): The correct option letter (A/B/C/D)
- `correctAnswerText` (string): The text of the correct definition
- `message` (string): Optional feedback message

**Validation Logic (Server-side):**
```javascript
const correct = String(answerOption).toUpperCase() === String(q.answerOption).toUpperCase()
```

**Error Response (404):**
```json
{ "error": "Question not found" }
```

## 5. Frontend Component Specification

### 5.1 Component: VocabApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `difficulty` | string | 'easy' | Selected difficulty level |
| `numQuestions` | string | '20' | User input for total question count |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `question` | object\|null | null | Current question: `{ id, question, options[], difficulty }` |
| `selected` | string | '' | Selected option letter (A/B/C/D) |
| `feedback` | string | '' | Feedback message displayed after submission |
| `isCorrect` | boolean\|null | null | Whether last answer was correct |
| `revealed` | boolean | false | True after answer submitted and checked |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question index (0-based in code, 1-based in display) |
| `totalQ` | number | 20 | Total questions for this session |
| `results` | array | [] | Array of result objects: `{ question, selected, correct, time }` |
| `seenIds` | Set\|array | new Set() | Track question IDs to prevent repeats |

**Timer:** Uses shared `useTimer()` hook. Starts when question loads. Stops when answer is submitted.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook.

### 5.2 User Flow

```
[Show difficulty selector: Easy / Medium / Hard / Extra Hard / Hardest]
[Show "How many questions?" input (default 20)]
[Show "Start Quiz" button]
        ↓ (click Start)
[Lock difficulty selector, compute totalQ]
[started=true, questionNumber=0, score=0, results=[], seenIds={}]
[fetchQuestion(difficulty)]
        ↓
[Display: "Question N/totalQ"]
[Display: word in large font]
[Display: 4 definition options as radio cards]
[Timer starts]
        ↓ (select option, click Submit OR press 1-4/A-D)
[POST /vocab-api/check {id, answerOption}]
[Stop timer, record result]
[Show feedback with correct definition]
[Auto-advance after 1.5s if correct; click Next if wrong]
        ↓
[If questionNumber < totalQ: increment, fetchQuestion]
[If questionNumber >= totalQ: set finished=true]
        ↓ (finished)
[Show: "Quiz complete.", "Final score: 18/20"]
[Show ResultsTable with all results]
[Show "Play Again" button → restarts quiz]
```

### 5.3 Keyboard Support

| Key | Action | Condition |
|-----|--------|-----------|
| `1` or `A` | Select option A; if revealed, submit | When question loaded |
| `2` or `B` | Select option B; if revealed, submit | When question loaded |
| `3` or `C` | Select option C; if revealed, submit | When question loaded |
| `4` or `D` | Select option D; if revealed, submit | When question loaded |
| `Enter` | Submit answer (if not revealed) OR advance to next (if revealed) | When question loaded |

### 5.4 Display

- **Word:** Source Serif 4 display font, 1.6rem, weight 600 (CSS class `.vocab-word`)
- **Options:** Rendered as radio cards with clickable labels (same style as GK quiz)
- **Feedback:** Shows the correct definition in quotes or bold, highlighting the correct option
- **Results table:** Truncates definitions to 35 characters with "…" ellipsis

### 5.5 UI Layout

```
┌────────────────────────────────────┐
│ [← Home]                           │
│          Vocab Builder              │
│  Pick the correct definition        │
│                           [Timer] [Score] │
│                                    │
│ [Easy] [Medium] [Hard] [Extra H] [Hd] │
│     How many questions? [20]        │
│          [Start Quiz]               │
│                                    │
│        Question 5/20                │
│                                    │
│          Ephemeral                  │
│                                    │
│  ○ A) Open to more than one        │
│       interpretation                │
│  ○ B) Lasting for a very short     │
│       time                         │
│  ○ C) A harsh mixture of           │
│       discordant sounds             │
│  ○ D) Fond of company; sociable    │
│                                    │
│          [Submit]                   │
│                                    │
│ [Correct! "Lasting for a very      │
│  short time"]                      │
│   (auto-advancing in 1.5s...)      │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Word  │ Ans │ ✓/✗│ t   │ ││
│  │ 1 │Brave │  C  │  ✓  │ 2.4s│ ││
│  │ 2 │Curi  │  D  │  ✓  │ 3.1s│ ││
│  └─────────────────────────────┘│
└────────────────────────────────────┘
```

**Finish Screen:**
```
┌────────────────────────────────────┐
│        Quiz complete.               │
│     Final score: 18/20              │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ # │ Word  │ Ans │ ✓/✗│ t   │ ││
│  │...│...    │ ... │ ...│ ...s│ ││
│  │20 │Periph│  A  │  ✓  │ 2.7s│ ││
│  └─────────────────────────────┘│
│                                    │
│  Total: 52s  ·  Avg: 2.6s          │
│                                    │
│          [Play Again]              │
└────────────────────────────────────┘
```

### 5.6 Features

- **Auto-advance:** After correct answer revealed, auto-advances in 1.5s via `useAutoAdvance` hook. On wrong answers, click Next or press Enter manually.
- **Deduplication:** `seenIds` Set tracks answered question IDs; passed to GET as `exclude` param to prevent repeats
- **Running results table:** Displayed during gameplay below quiz area
- **Difficulty lock:** Selector disabled during quiz (`disabled={started && !finished}`)

## 6. Server Algorithm

**Question Selection:**
1. Load all questions for specified difficulty into memory
2. Filter out any IDs in the exclude list (from `seenIds`)
3. If no valid questions remain, return 500 error
4. Select one random question using `Math.floor(Math.random() * filteredQuestions.length)`
5. Return question object (without answer fields)

**Randomization:** Uniform random selection from available pool each request.

## 7. Answer Validation

**Format Accepted:** Letters A, B, C, or D (case-insensitive)

**Validation:**
- Server recomputes: `answerOption.toUpperCase() === correctAnswer.toUpperCase()`
- Both client and server sides validate

**Tolerance:** Exact match required (no fuzzy matching)

**Edge Cases:**
- Lowercase letters (a, b, c, d) converted to uppercase before comparison
- Whitespace not trimmed; leading/trailing spaces cause mismatch
- Invalid options (E, 1, "maybe") return `correct: false`

## 8. CSS Classes & Styling

| Class | Purpose |
|-------|---------|
| `.quiz-container` | Main wrapper |
| `.difficulty-selector` | Radio pill group for difficulty selection |
| `.radio-pill` | Individual difficulty button |
| `.radio-pill.active` | Selected difficulty |
| `.vocab-word` | Word display (large, serif font) |
| `.options-grid` | Radio options grid container |
| `.option-label` | Individual option (clickable label) |
| `.option-label.selected` | Highlighted selection |
| `.option-label:disabled` | After reveal |
| `.feedback-box` | Feedback message container |
| `.feedback-box.correct` | Correct styling (green) |
| `.feedback-box.incorrect` | Incorrect styling (red) |
| `.results-table` | Results display table |
| `.timer-display` | Timer counter |
| `.score-display` | Score counter |

**Fonts:** DM Sans (body/UI), Source Serif 4 (headings and vocab word display)
