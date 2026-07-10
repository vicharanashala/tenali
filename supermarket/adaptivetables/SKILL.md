# Adaptive Multiplication Tables — Formal Specification

## 1. Purpose

An adaptive multiplication table learning system with independent per-student progress tracking. Students practice multiplication tables with adaptive difficulty: tables they have mastered are hidden, comfortable tables are shown, and new tables are gradually introduced. Progress is saved to localStorage and persists across sessions. The system uses a rolling window algorithm to evaluate speed and accuracy, promoting table advancement only when students demonstrate consistent mastery.

## 2. System Architecture

### 2.1 Routes

- **Teacher route**: `/taittiriya` — Classroom management view (future enhancement, placeholder for now)
- **Student route**: `/tatsavit` — Individual student practice interface

Each route maintains independent progress in localStorage under student-specific keys.

### 2.2 Three-Phase UI Flow

1. **Setup** (`phase === 'setup'`): Student selects starting multiplication table (2–20) and confirms difficulty settings
2. **Playing** (`phase === 'playing'`): Adaptive quiz loop with real-time table visibility based on mastery level
3. **Finished** (`phase === 'finished'`): Summary screen showing all tables mastered, current learning tables, and restart option

## 3. Constants and Configuration

```javascript
const DEFAULT_TOTAL = 20                    // default questions per round
const AUTO_ADVANCE_MS = 1500                // auto-advance delay on correct answer
const WINDOW_SIZE = 8                       // rolling window of recent attempts for evaluation
const ADVANCE_COUNT = 5                     // consecutive mastered questions to trigger advance
const MASTERED_TIME = 3000                  // milliseconds — speed threshold for mastery (avgTime < 3000ms)
const COMFORTABLE_TIME = 6000               // milliseconds — speed threshold for comfortable (avgTime < 6000ms)
const MASTERED_ACCURACY = 0.9               // accuracy threshold for mastery (accuracy >= 0.9)
const COMFORTABLE_ACCURACY = 0.7            // accuracy threshold for comfortable (accuracy >= 0.7)
```

## 4. Mastery Evaluation Algorithm

### 4.1 Rolling Window Evaluation

The system tracks the last `WINDOW_SIZE` (8) attempts for each table. After each submission:

1. Add the latest attempt (with accuracy and time) to the window
2. Keep only the last 8 attempts (FIFO)
3. Compute rolling statistics:
   - `avgTime = sum(times) / count`
   - `accuracy = correctCount / count`
4. Classify the table based on combined metrics

### 4.2 Mastery Levels

| Level | Condition | Display | Behavior |
|-------|-----------|---------|----------|
| **Mastered** | avgTime < 3000ms AND accuracy >= 0.9 | Hidden (✓) | Auto-advance to next table on ADVANCE_COUNT consecutive mastered |
| **Comfortable** | avgTime < 6000ms AND accuracy >= 0.7 | Shown (in quiz) | Continue practicing, eligible for advancement after mastery |
| **Learning** | All other cases | Shown (in quiz) | Focus practice, need more accuracy/speed |

### 4.3 Table Advancement Logic

When a student correctly answers a question:
- If current table is Mastered: increment `masterCount` for that table
- If `masterCount >= ADVANCE_COUNT` (5 consecutive):
  - Mark current table as permanently Mastered
  - Advance to next table (2 → 3 → 4 → ... → 20)
  - Reset `masterCount` to 0
  - Display celebration message
- If advancing from table 20: show "All tables mastered!" and offer restart

## 5. Frontend Component Specification

### 5.1 Component: AdaptiveTablesApp

**Props:** `onBack` (function), `studentId` (string, default 'default')

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| phase | string | 'setup' | Current phase: 'setup', 'playing', or 'finished' |
| selectedTable | number | 2 | Starting table chosen in setup (2–20) |
| currentTable | number | 2 | Currently practicing table |
| windowData | object | {} | Per-table rolling window: `{2: [{acc, time}, ...], 3: [...], ...}` |
| masterCounts | object | {} | Per-table consecutive mastery counter: `{2: 3, 3: 0, ...}` |
| masteredTables | array | [] | Tables marked as permanently mastered (e.g., [2, 3]) |
| question | object/null | null | Current question object |
| answer | string | '' | Player's answer input |
| score | number | 0 | Correct answers in current round |
| questionNumber | number | 0 | Current question in round |
| totalQuestions | number | 20 | Total questions per round |
| feedback | string | '' | Feedback message after submit |
| loading | boolean | false | Fetching question from API |
| revealed | boolean | false | Answer shown |
| results | array | [] | Result objects for results table |
| tableInfo | object | {} | Per-table metadata: `{2: {level: 'mastered', avgTime, accuracy}, ...}` |
| showTableBelow | boolean | true | Whether to show reference table below quiz |
| celebrationMsg | string | '' | Advancement celebration message |

**Timer:** `useTimer()` — per-question timing, resets on new question.

**advanceRef:** `useRef(() => {})` — current advance logic, used by `useAutoAdvance` hook.

### 5.2 localStorage Schema

```javascript
// Key format: `tenali_adaptivetables_{studentId}`
// Value:
{
  selectedTable: 2,              // Starting table chosen by student
  currentTable: 2,               // Currently practicing table
  masteredTables: [2, 3],       // Permanently mastered tables
  windowData: {
    2: [
      { correct: true, time: 2500 },
      { correct: true, time: 2800 },
      { correct: false, time: 3100 },
      ...
    ]
  },
  masterCounts: {
    2: 3,   // consecutive mastery counter for table 2
    3: 0
  },
  tableInfo: {
    2: { level: 'mastered', avgTime: 2650, accuracy: 0.875 },
    3: { level: 'comfortable', avgTime: 4200, accuracy: 0.8 }
  }
}
```

**Loading on mount:**
1. Check localStorage for `tenali_adaptivetables_{studentId}`
2. If exists, restore state; otherwise initialize with defaults
3. Set `phase = 'setup'` to let student confirm starting table

**Saving on change:**
- Persist state to localStorage after every update
- Use `JSON.stringify()` for storage, `JSON.parse()` for retrieval
- Handle gracefully if localStorage is unavailable (fallback to in-memory)

### 5.3 API Integration

**GET /multiply-api/question**

Query parameters:
- `table` (number): multiplication table to practice (2–20)

Example: `/multiply-api/question?table=3` → generates "3 × 4 = ?" or "3 × 7 = ?"

Response:
```json
{
  "id": "multiply-1775067701647-0.857",
  "table": 3,
  "multiplier": 7,
  "prompt": "3 × 7",
  "answer": 21
}
```

**POST /multiply-api/check**

Request body:
```json
{
  "table": 3,
  "multiplier": 7,
  "answer": 21
}
```

Response:
```json
{
  "correct": true,
  "correctAnswer": 21,
  "message": "Correct"
}
```

### 5.4 User Flow — Setup Phase

```
[Show: "Adaptive Multiplication Tables"]
[Show: "Select starting table (2–20):"]
[Radio buttons: 2, 3, 4, ..., 20 (default 2)]
[Show current mastery status if resuming]
[Show "Start Practice" button]
        ↓
[Load student progress from localStorage]
[Set phase = 'playing']
[Fetch first question for selectedTable]
```

### 5.5 User Flow — Playing Phase

```
[Display: "Table N", "Question M/20"]
[Display mastery progress for current table]
[Based on table level, show/hide reference table below quiz]
        ↓
[Fetch question: "a × b = ?"  for current table]
[Timer starts]
        ↓ (student enters answer via keyboard or NumPad)
[POST /multiply-api/check]
[Stop timer, record result]
        ↓
[Show feedback: "Correct! 3 × 7 = 21" or "Incorrect. Answer: 21"]
[Update rolling window data for current table]
[Evaluate mastery level: Mastered / Comfortable / Learning]
[If mastery promotion possible: increment masterCount]
[If masterCount >= ADVANCE_COUNT: ADVANCE to next table]
        ↓ (correct answer)
[Auto-advance after 1.5s if correct]
        ↓ (incorrect answer)
[Player must click Next manually]
        ↓
[If questionNumber < totalQuestions: repeat with next question]
[If questionNumber >= totalQuestions AND advancing: go to new table]
[If questionNumber >= totalQuestions AND no advance: show "Round complete" button]
```

### 5.6 UI Layout — Setup Phase

```
┌─────────────────────────────────────────┐
│ [← Home]                                │
│       Adaptive Multiplication Tables     │
│   Build fluency table by table          │
│                                         │
│  Select starting table (2–20):          │
│  [2] [3] [4] [5] [6] [7] [8] [9] [10]  │
│  [11][12][13][14][15][16][17][18][19]  │
│  [20]                                   │
│                                         │
│  (Resume options if saved progress)     │
│  [✓ Tables 2–3 mastered]               │
│  [→ Currently learning: Table 4]        │
│                                         │
│         [Start Practice]                │
└─────────────────────────────────────────┘
```

### 5.7 UI Layout — Playing Phase

```
┌──────────────────────────────────────────┐
│ [← Home]                                 │
│    Table N - Adaptive Practice           │
│   [Level: Comfortable] [Speed: 5200ms]  │
│                   [14s] [Score: 8/10]   │
│                                         │
│         Question 9/20                   │
│                                         │
│              3 × 7 = ?                  │
│                                         │
│         ┌──────────────┐                │
│         │  Type answer  │                │
│         └──────────────┘                │
│      [1] [2] [3]                        │
│      [4] [5] [6]                        │
│      [7] [8] [9]                        │
│      [       0       ]                   │
│   [⌫ ] [ Submit]                        │
│                                         │
│ ┌─ Correct! 3 × 7 = 21 ─────────────┐ │
│ │ (auto-advances in 1.5s)            │ │
│ └────────────────────────────────────┘ │
│                                         │
│ ┌─ Reference Table (Hidden on Mastered)─┐
│ │ 3 × 1 = 3   3 × 2 = 6   3 × 3 = 9  │ │
│ │ 3 × 4 = 12  3 × 5 = 15  3 × 6 = 18 │ │
│ │ 3 × 7 = 21  3 × 8 = 24  3 × 9 = 27 │ │
│ │ 3 × 10= 30  3 × 11= 33  3 × 12= 36 │ │
│ └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 5.8 Reference Table Display

**Mobile Layout (max-height: 180px, 3-column compact grid):**
```
3×1=3   3×2=6   3×3=9
3×4=12  3×5=15  3×6=18
3×7=21  3×8=24  3×9=27
3×10=30 3×11=33 3×12=36
```

**Display Rules:**
- Always shown during "Learning" and "Comfortable" levels
- Hidden (greyed out / opacity 0.3) when table is "Mastered"
- Compact 3-column grid on mobile
- Full table layout on desktop (4 columns with better spacing)

### 5.9 Mastery Status Display

During quiz, display current table status:
```
Table 3 Status:
  Level: Comfortable (avgTime: 4200ms, accuracy: 80%)
  Mastery Progress: [████░░░░░] 4/5 steps to advance
```

After ADVANCE_COUNT consecutive correct:
```
🎉 Table 3 Mastered!
Advancing to Table 4...
(auto-advance in 3s)
```

### 5.10 Keyboard Support

- **Enter key**: submit answer or advance to next question
- **Digits 0–9**: append to answer via physical keyboard
- **Backspace**: delete last character
- **NumPad**: visual alternative input method with ± and ⌫ keys

### 5.11 Auto-Advance

Uses shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook:
- After correct answer revealed: auto-advance to next question after 1.5 seconds
- After incorrect answer: player must click Next manually (two clicks total: Submit + Next)
- Player can press Enter to skip the auto-advance wait on correct answers

### 5.12 Running Results Table

Displayed during gameplay and on round completion:
```
# │ Question │ Table │ Your Answer │ ✓/✗ │ Time
──┼──────────┼───────┼─────────────┼─────┼──────
1 │ 3 × 7    │ 3     │ 21          │ ✓   │ 2.5s
2 │ 3 × 5    │ 3     │ 15          │ ✓   │ 3.1s
...
```

## 6. Implementation Notes

### 6.1 Data Persistence

- **localStorage key format**: `tenali_adaptivetables_{studentId}`
- **Save timing**: After every answer submission and state update
- **Graceful fallback**: If localStorage unavailable, continue with in-memory state
- **Cross-tab sync**: Use `storage` event listener (optional enhancement)

### 6.2 Mastery Computation

- Rolling window maintains FIFO: add new entry, remove oldest when size exceeds WINDOW_SIZE
- Evaluate after every submission
- Allow gradual advancement — no "locked" tables, just different learning stages
- Once mastered, table remains mastered (no regression)

### 6.3 Mobile Considerations

- Reference table uses 3-column compact grid with max-height 180px scrollable
- Quiz input area remains on top, fixed positioning
- NumPad sized for touch: 50px+ tap targets
- Landscape orientation supported with horizontal flex layout

### 6.4 Teacher View Placeholder

`/taittiriya` route initially renders "Coming soon: Class roster and progress tracking" with link to `/tatsavit` for student practice. Future enhancement will add classroom management features.

### 6.5 Student ID Handling

- If `studentId` prop not provided, default to `'default'`
- Each student's progress stored independently in localStorage
- Support for future integration with classroom roster systems

### 6.6 Styling Classes

- `.adaptive-setup-section` — Setup phase container
- `.adaptive-table-selector` — Radio button grid for table selection
- `.adaptive-mastery-badge` — Status badge (Mastered/Comfortable/Learning)
- `.adaptive-progress-bar` — Visual progress toward next table
- `.adaptive-reference-table` — Multiplication table grid below quiz
- `.adaptive-reference-table.hidden` — Opacity reduction when mastered
- `.adaptive-ref-cell` — Individual cell in reference table
- `.adaptive-celebration` — Celebration message animation

### 6.7 Reference Table Generation

Dynamic table grid for table N (e.g., N=3):
```javascript
const cells = Array.from({length: 12}, (_, i) => {
  const multiplier = i + 1
  const product = N * multiplier
  return `${N} × ${multiplier} = ${product}`
})
// Render in 3-column grid (mobile) or 4-column (desktop)
```

## 7. Future Enhancements

1. **Teacher Dashboard** (`/taittiriya`): View class roster, individual student progress, mastery heatmaps
2. **Goal Setting**: Students can set targets (e.g., "master tables 5–8 by Friday")
3. **Spaced Repetition**: Reintroduce previously mastered tables for maintenance drills
4. **Customizable Ranges**: Practice subset of tables (e.g., 6–12) instead of 2–20
5. **Timed Challenges**: Speed-based leaderboards once base mastery achieved
6. **Export Reports**: CSV download of progress data for teachers
7. **Dark Mode**: Adaptive color scheme based on system preference
