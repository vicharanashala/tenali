# General Knowledge (Chitragupta) — Formal Specification

## 1. Overview

A multiple-choice general knowledge quiz with 991 curated questions on diverse topics (science, history, geography, etc.). The quiz presents one random question at a time, runs indefinitely with no fixed question count, and accumulates score and results throughout the session. Features instant keyboard selection (1-4 or A-D), auto-advance after 1.5 seconds on correct answers, and a running results table.

## 2. Component Specification

**Component:** `GKApp` (located in `/gk/GKApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user clicks "← Home" button

**Files:**
- Component: `GKApp.jsx`
- Questions data: `chitragupta/questions/NNNN.json` (991 files, IDs 0001–0991)

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `question` | object\|null | null | Current question: `{ id, question, options[], genre }` |
| `selected` | string | '' | Selected option letter: 'A', 'B', 'C', or 'D' |
| `feedback` | string | '' | Displayed message after answer submission |
| `isCorrect` | boolean\|null | null | Whether last submitted answer was correct |
| `loading` | boolean | false | True while fetching question from API |
| `score` | number | 0 | Total correct answers in current session |
| `revealed` | boolean | false | True after answer has been submitted and checked |
| `questionNumber` | number | 0 | Total questions answered so far (0-indexed initially, increment before display) |
| `results` | array | [] | Array of `{ questionNumber, questionText, selected, result, time }` objects |
| `seenIds` | Set\|array | new Set() | Track question IDs to prevent repeats (deduplication) |

**Timer:** Uses shared `useTimer()` hook. Starts when question loads. Stops when answer is submitted.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook to manage auto-advance timing.

## 4. API Endpoints

### 4.1 GET /gk-api/question

**Purpose:** Fetch a single random general knowledge question, excluding previously seen questions.

**Query Parameters:**
- `exclude` (optional, string): Comma-separated list of question IDs to exclude (e.g., `exclude=1,3,5`)

**Request Example:**
```
GET /gk-api/question?exclude=1,3,5,7
```

**Response (200):**
```json
{
  "id": 42,
  "question": "What is the chemical symbol for gold?",
  "options": ["Ag", "Au", "Fe", "Cu"],
  "genre": "science"
}
```

**Response Fields:**
- `id` (integer): Unique question identifier (1–991)
- `question` (string): Question text
- `options` (string[4]): Exactly 4 options in order [A, B, C, D]
- `genre` (string): Topic category (e.g., "science", "history", "geography", "mixed")

**Important:** The response does NOT include `answerOption` or `answerText` to prevent client-side cheating.

**Error Response (500):**
```json
{ "error": "No questions found" }
```
Returned if no questions remain after excluding seen IDs.

### 4.2 POST /gk-api/check

**Purpose:** Validate the player's answer and return the correct answer.

**Request Body:**
```json
{
  "id": 42,
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
  "correctAnswerText": "Au",
  "message": "Correct! 🎉"
}
```

**Response Fields:**
- `correct` (boolean): True if answer matches the correct answer
- `correctAnswer` (string): The correct option letter (A/B/C/D)
- `correctAnswerText` (string): The text of the correct option
- `message` (string): Optional feedback message

**Validation Logic (Server-side):**
```javascript
const correct = String(answerOption).toUpperCase() === String(q.answerOption).toUpperCase()
```

**Error Response (404):**
```json
{ "error": "Question not found" }
```
Returned if the question ID does not exist in the database.

## 5. Server Algorithm

**Question Generation:**
1. Load all 991 question files from `chitragupta/questions/` on server startup
2. Store in memory as array: `questions = [{ id, question, options, answerOption, answerText, genre }, ...]`
3. When GET /gk-api/question is called:
   - Parse `exclude` parameter (comma-separated IDs)
   - Filter questions to exclude provided IDs
   - If no valid questions remain, return 500 error
   - Select one random question using `Math.floor(Math.random() * filteredQuestions.length)`
   - Return question object (without answer fields)

**Randomization:** Uniform random selection from available pool each request.

## 6. Answer Validation

**Format Accepted:** Letters A, B, C, or D (case-insensitive)

**Validation:**
- Server recomputes: `answerOption.toUpperCase() === correctAnswer.toUpperCase()`
- Both client and server sides validate

**Tolerance:** Exact match required (no fuzzy matching)

**Edge Cases:**
- Lowercase letters (a, b, c, d) are converted to uppercase before comparison
- Whitespace is not trimmed; leading/trailing spaces cause mismatch
- Invalid options (E, 1, "maybe") return `correct: false`

## 7. UI Structure

**Setup Phase:** Quiz begins immediately on component mount; no configuration screen.

**Playing Phase:**
```
┌────────────────────────────────────────┐
│ [← Home]                               │
│            General Knowledge            │
│        Random question picker           │
│                           [Timer] [Score] │
│                                        │
│  What is the chemical symbol           │
│  for gold?                             │
│                                        │
│  ○ A) Ag                               │
│  ○ B) Au        ← [selected/highlighted] │
│  ○ C) Fe                               │
│  ○ D) Cu                               │
│                                        │
│  [Correct! The answer is B) Au]        │
│                                        │
│              [Next Question]           │
│                                        │
│  ┌─ Running Results Table ─────────┐  │
│  │ # │ Question  │ Ans │ ✓/✗ │  t  │  │
│  │ 1 │ Chemical… │  B  │  ✓  │ 4.2s│  │
│  │ 2 │ Largest…  │  B  │  ✓  │ 3.1s│  │
│  │ 3 │ Capital…  │  C  │  ✗ (D)│ 6.8s│  │
│  └────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Finished Phase:** Quiz never ends; it continues indefinitely. No finish screen.

**Feedback Messages:**
- Correct: `"Correct! The answer is B) Au"` (where B is correctAnswer, "Au" is correctAnswerText)
- Incorrect: `"Incorrect. The correct answer is B) Au"`

## 8. Keyboard Shortcuts

**Global listeners (active at all times during quiz):**

| Key | Action | Condition |
|-----|--------|-----------|
| `1` or `A` | Select option A; if revealed, submit | When question loaded |
| `2` or `B` | Select option B; if revealed, submit | When question loaded |
| `3` or `C` | Select option C; if revealed, submit | When question loaded |
| `4` or `D` | Select option D; if revealed, submit | When question loaded |
| `Enter` | Submit answer (if not revealed) OR advance to next (if revealed) | When question loaded |

**Implementation:**
- Keydown event listener on window/document
- Numeric keys (1-4) and letter keys (A-D) both trigger selection
- When not revealed, any of these keys selects that option
- When revealed, Enter or repeat key press triggers `loadQuestion()` (next)

## 9. Auto-Advance Behavior

**Trigger:** After a correct answer is revealed (`revealed === true` AND `isCorrect === true`)

**Timing:** 1.5 seconds (constant `AUTO_ADVANCE_MS = 1500`)

**Action:** Calls `loadQuestion()` which resets state and fetches the next question

**Skip:** Pressing Enter before auto-advance fires skips the wait and advances immediately

**Wrong Answers:** Do not auto-advance; player must click "Next Question" or press Enter manually

**Implementation:**
```javascript
const advanceRef = useRef(() => {})
advanceRef.current = () => loadQuestion()
useAutoAdvance(revealed, advanceRef, isCorrect)
```

The `advanceRef` is updated every render to avoid stale closures.

## 10. CSS Classes & Styling

**Key CSS Classes:**

| Class | Purpose | Applied To |
|-------|---------|-----------|
| `.quiz-container` | Main wrapper | Root div |
| `.question-text` | Question display | `<p>` or `<div>` |
| `.options-grid` | Radio options grid | Container of 4 options |
| `.option-label` | Individual option | `<label>` wrapping radio input |
| `.option-label.selected` | Highlighted selection | Active option |
| `.option-label:disabled` | After reveal | All options |
| `.feedback-box` | Feedback message | `<div>` showing correct/incorrect |
| `.feedback-box.correct` | Correct styling | Applied when `isCorrect === true` |
| `.feedback-box.incorrect` | Incorrect styling | Applied when `isCorrect === false` |
| `.results-table` | Results display | `<table>` or list |
| `.timer-display` | Time counter | Shows seconds elapsed |
| `.score-display` | Score counter | Shows correct/total format |

**Key Styles:**
- Radio inputs are visually hidden; styling applied to `<label>` elements
- Selected option: background color change (typically accent color)
- Disabled options: reduced opacity or gray color
- Feedback box: distinct color (green for correct, red for incorrect)
- Results table: monospace font for alignment, striped rows for readability
- Fonts: DM Sans for body/UI, Source Serif 4 for headings

## 11. State Flow Diagram

```
[Mount]
   ↓
[loadQuestion() → GET /gk-api/question?exclude=...] → question, selected='', feedback='', revealed=false
   ↓
[Timer starts] ← [User selects A/B/C/D via keyboard or radio click]
   ↓
[User submits: Enter key, Submit button, or repeat key] → selected→valid
   ↓
[POST /gk-api/check {id, answerOption}] → data: {correct, correctAnswer, correctAnswerText}
   ↓
[Stop timer, set revealed=true, set isCorrect, set feedback] → Record to results[]
   ↓
[If correct: start 1.5s auto-advance timer] ─→ After 1.5s: loadQuestion()
[If incorrect: show "Next Question" button] → User clicks or presses Enter: loadQuestion()
   ↓
[Reset: selected='', feedback='', revealed=false, seenIds.add(id)]
   ↓
[Loop back to loadQuestion()]
```

## 12. Implementation Notes

- **Radio inputs:** `name="gk"` attribute ensures only one option is selected at a time
- **Deduplication:** `seenIds` Set tracks all answered question IDs; passed to GET request as `exclude` param
- **No finish condition:** Quiz loops indefinitely; only ends when user navigates away (onBack)
- **Results truncation:** Question text in results table is truncated to 50 characters with "…" ellipsis
- **Fonts:** Google Fonts — DM Sans (body) and Source Serif 4 (headings)
- **No difficulty selector:** All questions drawn from the same pool
- **Per-question timing:** Each result records elapsed time from question load to submission
