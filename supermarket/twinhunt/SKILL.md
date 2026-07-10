# Twin Hunt — Formal Specification

## 1. Overview

A visual matching game where two circular emoji panels each contain a configurable number of objects (3–15, default 5) with exactly one emoji in common between them. The player must identify and tap the matching emoji as quickly as possible. Supports configurable rounds (default 10), auto-advance after 1.5 seconds on correct picks, and a running results table. All game logic is client-side with no server dependency.

## 2. Component Specification

**Component:** `TwinHuntApp` (located in `/twinhunt/TwinHuntApp.jsx` or similar)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Files:**
- Component: `TwinHuntApp.jsx`
- No server dependency (fully client-side)

## 3. Constants

```javascript
const TWIN_SYMBOLS = [
  '🍎','🍊','🍋','🍇','🍉','🍓','🍒','🥝','🍌','🍑',
  '🌟','🌙','☀️','⚡','🔥','💧','🌈','❄️','🍀','🌸',
  '🐶','🐱','🐸','🐵','🐔','🐙','🦋','🐝','🐢','🐬',
  '⚽','🏀','🎾','🎯','🎲','🎸','🎨','📚','✏️','🔔',
]
```

**Total:** 40 emoji symbols in the pool. New random selection for each round.

## 4. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `count` | string | '5' | Objects per panel (user input, clamped to 3–15) |
| `numRoundsInput` | string | '10' | Total rounds (user input) |
| `started` | boolean | false | True after game start button clicked |
| `finished` | boolean | false | True after all rounds completed |
| `round` | number | 0 | Current round index (0-based in code, 1-based in display) |
| `totalRounds` | number | 10 | Total rounds to play |
| `score` | number | 0 | Count of correct picks |
| `leftItems` | array | [] | Emoji symbols in left panel |
| `rightItems` | array | [] | Emoji symbols in right panel |
| `leftPositions` | array | [] | `[{x, y}, ...]` positions for left panel items |
| `rightPositions` | array | [] | `[{x, y}, ...]` positions for right panel items |
| `commonSymbol` | string | '' | The matching emoji (answer) |
| `feedback` | string | '' | Feedback message displayed after pick |
| `isCorrect` | boolean\|null | null | Whether last pick was correct |
| `revealed` | boolean | false | True after emoji tapped and checked |
| `results` | array | [] | Array of result objects: `{ question, userAnswer, correctAnswer, correct, time }` |

**Timer:** Uses shared `useTimer()` hook. Starts when round generates. Stops when emoji tapped.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceRef, isCorrect)` hook.

## 5. Configuration

- **Objects per panel:** Text input, range 3–15 (clamped), default 5. Both panels always have the same count.
- **Rounds:** Text input, default 10. Total rounds to play before finishing.

## 6. Round Generation (Client-Side Only)

**No server API is used. All rounds are generated entirely client-side.**

**Algorithm for each round:**
1. Shuffle the full `TWIN_SYMBOLS` array using Fisher-Yates
2. Pick `symbols[0]` as `common` (the correct answer)
3. Pick `symbols[1]` through `symbols[n-1]` as `leftOthers` (n-1 symbols)
4. Pick `symbols[n]` through `symbols[2n-2]` as `rightOthers` (n-1 symbols)
5. Build left panel items: shuffle `[common, ...leftOthers]` → `leftItems`
6. Build right panel items: shuffle `[common, ...rightOthers]` → `rightItems`
7. Generate scatter positions for left panel → `leftPositions`
8. Generate scatter positions for right panel → `rightPositions`

**Pool Size:** 40 emojis available. If n=15, need 1 + 14 + 14 = 29 unique symbols. Always sufficient.

### 6.1 Circular Scatter Positioning Algorithm

Positions are calculated in percentage coordinates (0–100) within a square:

```javascript
const scatterPositions = (n) => {
  const positions = []

  // Center item with small jitter (±6%)
  positions.push({
    x: 50 + (Math.random() - 0.5) * 12,
    y: 50 + (Math.random() - 0.5) * 12,
  })

  // Ring distribution for remaining items
  const remaining = n - 1
  const baseAngleOffset = Math.random() * Math.PI * 2  // Random ring rotation

  for (let i = 0; i < remaining; i++) {
    // Evenly distributed angle with jitter
    const angle = baseAngleOffset + (i / remaining) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    // Radius: 28–38% from center (in % units)
    const radius = 28 + Math.random() * 10
    // Convert polar to Cartesian
    const x = 50 + Math.cos(angle) * radius
    const y = 50 + Math.sin(angle) * radius
    // Clamp to panel bounds (10–90%)
    positions.push({
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    })
  }

  // Shuffle to avoid predictable center position
  return shuffle(positions)  // Fisher-Yates
}
```

**Positioning in JSX:**
```jsx
<button style={{ left: `${position.x}%`, top: `${position.y}%` }} />
```

**CSS:**
```css
.twin-item {
  position: absolute;
  transform: translate(-50%, -50%);  /* Center on computed coordinates */
}
```

## 7. User Flow

```
[Show "Objects per panel" input (default 5, range 3–15)]
[Show "How many rounds?" input (default 10)]
[Show "Start Game" button]
        ↓ (click Start)
[Clamp count to 3–15, parse totalRounds]
[started=true, round=0, score=0, results=[]]
[Generate first round]
        ↓
[Display: two circular panels side by side with scattered emojis]
[Timer starts]
        ↓ (tap an emoji in either panel)
[Check if tapped symbol === commonSymbol]
[Stop timer, record result]
[Show feedback]
[Highlight common emoji green with scale(1.25)]
[Dim all non-matching emojis to opacity 0.25]
[Disable all emoji buttons]
[Auto-advance after 1.5s if correct; click Next if wrong]
        ↓
[If round < totalRounds: increment, generate next round]
[If round >= totalRounds: set finished=true]
        ↓ (finished)
[Show: "Game complete.", "Final score: 8/10"]
[Show ResultsTable with all rounds]
[Show "Play Again" button → restarts game]
```

## 8. Interaction Model

**Round Generation:** `generateRound()`
- Creates left and right item arrays
- Creates scatter position arrays
- Sets all state for display
- Resets answer state: `revealed=false`, `feedback=''`, `isCorrect=null`
- Starts timer

**Picking:** `handlePick(symbol)`
- Only active if `!revealed`
- Checks: `symbol === commonSymbol`
- Stops timer
- Sets `revealed=true`, records time
- Sets `isCorrect` boolean and feedback
- Increments score if correct
- Records result object

**Feedback:**
- Correct: `"Correct! That was the match."`
- Incorrect: `"That's not it. The match was: [emoji]"`

**Visual Feedback:**
- Correct pick: Emoji gets class `.twin-match` (green border, scale 1.25)
- Wrong pick: Tapped emoji unchanged; all others dim
- Non-matching emojis: Get class `.twin-dim` (opacity 0.25)
- All buttons: `disabled={revealed}`

## 9. CSS Structure

```css
.twin-panels {
  display: flex;
  gap: 0;
  align-items: stretch;
  margin: 16px 0 20px;
}

.twin-panel {
  flex: 1;
  position: relative;
  min-height: 280px;
}

.twin-panel::before {
  content: '';
  display: block;
  padding-top: 100%;  /* Square aspect ratio */
}

.twin-circle {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--clr-border);
  background: rgba(255, 255, 255, 0.5);
  overflow: visible;
}

.twin-divider {
  width: 1px;
  background: var(--clr-border);
  flex-shrink: 0;
  margin: 20px 0;
}

.twin-item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 1.5rem;
  border: 1.5px solid var(--clr-border);
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  transform: translate(-50%, -50%);
  /* Inline style sets left and top percentages */
}

.twin-item:hover:not(:disabled) {
  transform: translate(-50%, -50%) scale(1.2);
  border-color: var(--clr-accent);
  z-index: 10;
}

.twin-item.twin-match {
  border-color: var(--clr-correct);
  background: var(--clr-correct-bg);
  transform: translate(-50%, -50%) scale(1.25);
  z-index: 10;
}

.twin-item.twin-dim {
  opacity: 0.25;
}
```

## 10. UI Layout

**Setup Phase:**
```
┌────────────────────────────────────┐
│ [← Home]                           │
│          Twin Hunt                  │
│  Find the common emoji              │
│                                    │
│  Objects per panel (3–15):          │
│  ┌────────────┐                    │
│  │    5       │                    │
│  └────────────┘                    │
│                                    │
│  How many rounds?                   │
│  ┌────────────┐                    │
│  │    10      │                    │
│  └────────────┘                    │
│                                    │
│         [Start Game]               │
└────────────────────────────────────┘
```

**Playing Phase:**
```
┌────────────────────────────────────┐
│ [← Home]                           │
│          Twin Hunt                  │
│                           [Timer] [Score] │
│                                    │
│        Round 3/10                   │
│                                    │
│  ┌─── Left ───┬─── Right ──┐      │
│  │            │             │      │
│  │  🍎       │  🌟         │      │
│  │       🌟   │   🍎   🐶   │      │
│  │  🐶       │             │      │
│  │            │  🎨         │      │
│  │  🎨       │             │      │
│  │            │             │      │
│  └────────────┴─────────────┘      │
│                                    │
│ [Correct! 🌟 is the match]         │
│   (auto-advancing in 1.5s...)      │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ Rd │ Match │ Pick │ ✓/✗│ t   │ ││
│  │ 1  │  🍎  │  🍎  │  ✓  │ 2.3s│ ││
│  │ 2  │  🌟  │  🐶  │  ✗  │ 3.5s│ ││
│  │ 3  │  🌟  │  🌟  │  ✓  │ 1.8s│ ││
│  └─────────────────────────────┘│
└────────────────────────────────────┘
```

**Finished Phase:**
```
┌────────────────────────────────────┐
│        Game complete.               │
│     Final score: 8/10               │
│                                    │
│  ┌─ Results Table ────────────────┐│
│  │ Rd │ Match │ Pick │ ✓/✗│ t   │ ││
│  │...│  ...   │  ...  │ ...│ ...s│ ││
│  │10 │  🎲  │  🎲  │  ✓  │ 1.6s│ ││
│  └─────────────────────────────┘│
│                                    │
│  Total: 27s  ·  Avg: 2.7s          │
│                                    │
│          [Play Again]              │
└────────────────────────────────────┘
```

## 11. CSS Structure

```css
.twin-panels {
  display: flex;
  gap: 0;
  align-items: stretch;
  margin: 16px 0 20px;
}

.twin-panel {
  flex: 1;
  position: relative;
}

.twin-panel::before {
  content: '';
  display: block;
  padding-top: 100%;  /* 1:1 aspect ratio */
}

.twin-circle {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--clr-border);
  background: rgba(255, 255, 255, 0.5);
  overflow: visible;
}

.twin-divider {
  width: 1px;
  background: var(--clr-border);
  flex-shrink: 0;
  margin: 20px 0;
}

.twin-item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 1.5rem;
  border: 1.5px solid var(--clr-border);
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 200ms ease-out;
  z-index: 1;
}

.twin-item:hover:not(:disabled) {
  transform: translate(-50%, -50%) scale(1.2);
  border-color: var(--clr-accent);
  z-index: 10;
}

.twin-item:disabled {
  cursor: not-allowed;
}

.twin-item.twin-match {
  border-color: var(--clr-correct);
  background: var(--clr-correct-bg);
  transform: translate(-50%, -50%) scale(1.25);
  z-index: 10;
}

.twin-item.twin-dim {
  opacity: 0.25;
}
```

## 12. JSX Structure

```jsx
<div className="twin-panels">
  <div className="twin-panel">
    <div className="twin-circle">
      {leftItems.map((sym, i) => (
        <button
          key={i}
          type="button"
          className={`twin-item ${
            revealed && sym === commonSymbol ? 'twin-match' : ''
          } ${revealed && sym !== commonSymbol ? 'twin-dim' : ''}`}
          style={leftPositions[i] ? {
            left: `${leftPositions[i].x}%`,
            top: `${leftPositions[i].y}%`
          } : {}}
          onClick={() => handlePick(sym)}
          disabled={revealed}
        >
          {sym}
        </button>
      ))}
    </div>
  </div>
  <div className="twin-divider"></div>
  <div className="twin-panel">
    <div className="twin-circle">
      {rightItems.map((sym, i) => (
        <button
          key={i}
          type="button"
          className={`twin-item ${
            revealed && sym === commonSymbol ? 'twin-match' : ''
          } ${revealed && sym !== commonSymbol ? 'twin-dim' : ''}`}
          style={rightPositions[i] ? {
            left: `${rightPositions[i].x}%`,
            top: `${rightPositions[i].y}%`
          } : {}}
          onClick={() => handlePick(sym)}
          disabled={revealed}
        >
          {sym}
        </button>
      ))}
    </div>
  </div>
</div>
```

## 13. Results Record

```javascript
{
  question: `Round ${round + 1}`,        // e.g., "Round 3"
  userAnswer: symbol,                  // emoji player tapped
  correctAnswer: commonSymbol,         // correct emoji
  correct: isCorrect,                  // true/false
  time: timeTaken                      // seconds
}
```

## 14. Auto-Advance Behavior

**Trigger:** After correct pick revealed (`revealed === true` AND `isCorrect === true`)

**Timing:** 1.5 seconds (constant `AUTO_ADVANCE_MS = 1500`)

**Action:** Increments `round`, resets state, calls `generateRound()`

**Skip:** Pressing Enter before auto-advance completes immediately triggers advance

**Wrong Picks:** Do not auto-advance; must click Next or press Enter

## 15. Features

- **No server dependency:** Fully client-side game logic; instant round generation and validation
- **Circular scatter:** Items randomly distributed within circular panels using scatter positioning algorithm
- **Auto-advance:** After correct pick, auto-advances in 1.5s via `useAutoAdvance` hook
- **Running results table:** Displayed during gameplay below the panels
- **Visual feedback:** Correct emoji highlighted green, non-matches dimmed
- **Configurable difficulty:** Objects per panel (3–15) controls complexity
- **Configurable length:** Rounds input determines session length
