# Interval Scheduling Visualization — Formal Specification

## 1. Purpose

An interactive greedy algorithm visualization for the interval scheduling problem. Students drag intervals onto a 0–24 timeline, then watch a step-by-step visualization of the greedy algorithm selecting the maximum number of non-overlapping intervals. The algorithm sorts intervals by finish time, then greedily selects intervals that don't overlap with previously selected ones. Features color-coded states (default, considering, selected, rejected, skipped) and an execution log showing each decision.

## 2. System Architecture

### 2.1 Route

- **Student/Classroom route**: `/intervalscheduling` — Interactive algorithm visualization

### 2.2 UI Components

1. **Interval Timeline** — Horizontal 0–24 axis with draggable interval creation
2. **Interval List** — Table showing all created intervals (start, finish, width)
3. **Step-Through Controls** — Play/pause, step forward/back, reset buttons
4. **Execution Log** — Textual log showing algorithm decisions at each step
5. **Solution Summary** — Final result showing selected intervals and their count

### 2.3 Predefined Color Palette (10 colors)

```javascript
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
]
// Cycling assignment to intervals; each interval gets a unique color from this palette
```

## 3. Data Model

### 3.1 Interval Structure

```javascript
{
  id: string,              // unique identifier (e.g., 'interval-1')
  start: number,           // 0–24
  finish: number,          // start < finish, <= 24
  label: string,           // display name (auto or custom)
  colorIndex: number,      // index into COLORS array
  state: string            // 'default', 'considering', 'selected', 'rejected', 'skipped'
}
```

### 3.2 Algorithm State

```javascript
{
  intervals: [],           // all intervals created by user or loaded
  sortedByFinish: [],      // intervals sorted by finish time (ascending)
  selected: [],            // intervals selected by algorithm (final result)
  currentStep: number,     // index in execution log (0 = start, n = end)
  isRunning: boolean,      // play/pause state
  executionLog: []         // array of {step, interval, decision, reason}
}
```

## 4. Greedy Algorithm Specification

### 4.1 Algorithm Steps

**Input:** List of intervals, each with start and finish time.

**Output:** Maximum-size subset of non-overlapping intervals.

```
1. Sort intervals by finish time (ascending)
2. Initialize selected = []
3. For each interval I in sorted order:
   a. If I.start >= lastSelected.finish (or selected is empty):
      - Add I to selected
      - Mark I as 'selected'
   b. Else:
      - Mark I as 'rejected'
4. Return selected
```

### 4.2 Interval Overlap Definition

Two intervals **overlap** if:
```
A.start < B.finish AND B.start < A.finish
```

Two intervals **do not overlap** (can be scheduled together) if:
```
A.finish <= B.start OR B.finish <= A.start
```

**Edge case:** An interval can start exactly when another finishes (e.g., [0,5] and [5,10] do NOT overlap).

### 4.3 Execution Log Entry Format

```javascript
{
  step: number,
  intervalId: string,
  intervalLabel: string,
  decision: 'selected' | 'rejected' | 'sort_complete' | 'start',
  reason: string,
  selectedCount: number
}
```

Example entries:
```
{ step: 0, decision: 'start', reason: 'Sorting intervals by finish time...' }
{ step: 1, intervalId: 'i-2', intervalLabel: 'Meeting B', decision: 'selected', reason: 'First interval; selected.', selectedCount: 1 }
{ step: 2, intervalId: 'i-1', intervalLabel: 'Meeting A', decision: 'rejected', reason: 'Overlaps with Meeting B (3–6 vs 2–7).', selectedCount: 1 }
{ step: 3, intervalId: 'i-3', intervalLabel: 'Lunch', decision: 'selected', reason: 'Starts at 6, last finishes at 6; no overlap.', selectedCount: 2 }
```

## 5. Frontend Component Specification

### 5.1 Component: IntervalSchedulingApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| intervals | array | [] | All intervals created or loaded |
| sortedByFinish | array | [] | Copy sorted by finish time |
| selected | array | [] | Intervals selected by algorithm |
| currentStep | number | 0 | Current position in execution log (0 = start) |
| isRunning | boolean | false | Play/pause state |
| executionLog | array | [] | Log entries for each algorithm step |
| dragState | object | null | Current drag-in-progress (mouse pos, tentative interval) |
| hoverInterval | string/null | null | Interval being hovered (for highlighting) |
| editingInterval | string/null | null | Interval being edited in inline form |
| showExample | boolean | false | Whether to show example is available |

**refs:**
- `timelineRef` — reference to timeline canvas/SVG element
- `playIntervalRef` — ID of current play timer (for continuous playback)

### 5.2 User Flow

```
[Show: "Interval Scheduling Visualization"]
[Show: "Create intervals or load example"]
[Display: "Example: 11 sample intervals" button]
[Display: Empty timeline (0–24) with instruction]
        ↓ (drag to create interval OR click Load Example)
[User drags from x1 to x2 on timeline]
        ↓ (release mouse)
[Create interval: start = xMin, finish = xMax]
[Assign color from COLORS cycling]
[Add to intervals array, render on timeline]
[User can create more intervals]
        ↓ (click "Run Algorithm" or Load Example)
[Compute sortedByFinish]
[Generate executionLog]
[Set currentStep = 0, isRunning = false]
[Display first log entry]
        ↓
[User clicks "Next Step" or "Play"]
        ↓ (Next Step)
[Increment currentStep, render step]
[Update interval states and execution log display]
        ↓ (Play)
[Continuously increment currentStep every 1s]
[Stop when currentStep >= executionLog.length]
        ↓ (end of algorithm)
[Show: "Algorithm complete!"]
[Display: "Selected N intervals (maximum possible)"]
[Show results table with selected intervals]
[Display: "Reset" button to clear and start over]
```

### 5.3 Timeline Interaction

**Creating Intervals (Drag & Drop):**

1. User clicks and drags on timeline from time T1 to T2
2. `onMouseDown` at T1, `onMouseMove` shows preview interval
3. `onMouseUp` at T2, create interval with start=min(T1,T2), finish=max(T1,T2)
4. Minimum interval width: 0.5 hours (visual constraint)
5. Snap to nearest 0.5-hour increment (optional enhancement)

**Dragging to Reposition (Optional):**
- Users can click on existing interval and drag to move it (keeping width)
- Coordinates update in real-time

**Deleting:**
- Right-click on interval to delete, or click [×] button on interval label

### 5.4 UI Layout

```
┌──────────────────────────────────────────────────────────┐
│ [← Home]                                                 │
│   Interval Scheduling Visualization                      │
│   Greedy algorithm for maximum non-overlapping intervals │
│                                                          │
│ [Create intervals by dragging below]  [Load Example]    │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│ 0    3    6    9   12   15   18   21   24               │
│ │    │    │    │    │    │    │    │    │               │
│ ┌─────────┐                              (Meeting A)     │
│         ┌──────────────┐                (Meeting B)      │
│                   ┌─────────┐           (Lunch)          │
│             ┌──────┐                    (Break)          │
│ └───────────────────────────────────────────────────────┘
│                                                          │
│ Intervals:                                              │
│ # │ Name      │ Start │ Finish │ Width │ [Color]       │
│ ──┼───────────┼───────┼────────┼───────┼──────         │
│ 1 │ Meeting A │  0.5  │  2.5   │  2.0  │ Red           │
│ 2 │ Meeting B │  2.0  │  3.5   │  1.5  │ Cyan          │
│ ...                                                     │
│                                                          │
│ ┌─ Algorithm Controls ──────────────────────────────┐  │
│ │ [Step Forward] [Play▶] [Pause||] [Reset ⟳]      │  │
│ │ Step 5/12: "Interval C rejected (overlaps...)"   │  │
│ └────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Execution Log ────────────────────────────────────┐  │
│ │ Step 0: Sorting intervals by finish time...       │  │
│ │ Step 1: Meeting A selected (first interval)       │  │
│ │ Step 2: Meeting B rejected (2.0–3.5 overlaps)    │  │
│ │ Step 3: Lunch selected (3.5–4.0, no overlap)     │  │
│ │ Step 4: Break rejected (1.5–2.5, overlaps...)   │  │
│ │ ...                                                │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Solution ────────────────────────────────────────┐  │
│ │ Selected 4 intervals (maximum possible):          │  │
│ │ 1. Meeting A (0.5–2.5)                            │  │
│ │ 2. Lunch (3.5–4.0)                                │  │
│ │ 3. Tea Break (5.0–5.5)                            │  │
│ │ 4. Dinner (7.0–8.5)                               │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 5.5 Interval State Visualization

**Default** (not yet considered):
- Solid color, full opacity (1.0)
- Border: thin, matching color

**Considering** (current step being evaluated):
- Same color, opacity 1.0
- Border: thick (3px), matching color
- Animation: soft pulse (scale 1.0 → 1.05 → 1.0 every 800ms)

**Selected** (added to result set):
- Same color, opacity 1.0
- Border: thick (3px), green (#3a8a5c)
- Checkmark icon (✓) overlay in corner

**Rejected** (overlaps with last selected):
- Same color, opacity 0.5 (faded)
- Border: thin, red (#c24b3a) dashed
- × icon overlay in corner
- Light pulse animation (fade in/out every 600ms)

**Skipped** (passed over, later decision made):
- Same color, opacity 0.2 (very faded)
- Border: thin, gray, dotted

### 5.6 Execution Log Display

**Text rendering:**
- Step number (0-indexed)
- Interval label and ID
- Decision (selected/rejected/start)
- Reason (human-readable explanation)
- Current selected count

**Example:**
```
Step 5: Interval "Coffee Break" (5.0–5.5)
Reason: Starts at 5.0, last selected ends at 4.0. No overlap detected. Selected!
```

**Scrollable container:**
- Max height 200px on mobile, 300px on desktop
- Auto-scroll to current step (center in viewport)
- Click on log entry to jump to that step (rewind/fast-forward)

### 5.7 Load Example Button

**Predefined Example (11 intervals):**

```javascript
const EXAMPLE_INTERVALS = [
  { start: 0.5, finish: 2.5, label: 'Meeting A' },
  { start: 2.0, finish: 3.5, label: 'Meeting B' },
  { start: 3.5, finish: 4.0, label: 'Lunch' },
  { start: 1.5, finish: 2.5, label: 'Break' },
  { start: 5.0, finish: 5.5, label: 'Tea Break' },
  { start: 4.0, finish: 5.0, label: 'Lab Work' },
  { start: 5.5, finish: 7.0, label: 'Project Time' },
  { start: 7.0, finish: 8.5, label: 'Dinner' },
  { start: 6.0, finish: 7.5, label: 'Office Hours' },
  { start: 8.5, finish: 9.5, label: 'Study Group' },
  { start: 9.0, finish: 10.0, label: 'Coding Challenge' }
]
```

Clicking "Load Example":
1. Clear intervals array
2. Populate with EXAMPLE_INTERVALS (assign colors)
3. Update executionLog for this set
4. Display timeline with all intervals in default state
5. Enable "Run Algorithm" button

### 5.8 Keyboard Support

- **Space**: Play/Pause (if focused on timeline)
- **Right Arrow**: Step forward
- **Left Arrow**: Step backward (rewind)
- **R**: Reset and clear
- **D**: Delete selected interval (if one is focused)

### 5.9 Results Table

Displayed after algorithm completes:

```
Selected Intervals (Greedy Solution):
# │ Interval Name │ Start │ Finish │ Duration
──┼───────────────┼───────┼────────┼─────────
1 │ Meeting A     │  0.5  │  2.5   │  2.0
2 │ Lunch         │  3.5  │  4.0   │  0.5
3 │ Tea Break     │  5.0  │  5.5   │  0.5
4 │ Dinner        │  7.0  │  8.5   │  1.5
   Total selected: 4 intervals
   Total duration: 4.5 hours
```

## 6. Implementation Notes

### 6.1 No API Calls

The Interval Scheduling puzzle is entirely client-side. No API endpoints needed. No server communication required. All computation happens in the browser.

### 6.2 Sorting Algorithm

Use stable sort to maintain consistent order when intervals have equal finish times:
```javascript
const sortedByFinish = [...intervals].sort((a, b) => {
  if (a.finish !== b.finish) return a.finish - b.finish
  return a.start - b.start  // secondary sort by start time
})
```

### 6.3 Overlap Detection

Robust overlap check:
```javascript
function overlaps(interval1, interval2) {
  return interval1.start < interval2.finish && interval2.start < interval1.finish
}
```

### 6.4 Color Assignment

Cycle through COLORS array based on interval creation order:
```javascript
const colorIndex = intervals.length % COLORS.length
const colorHex = COLORS[colorIndex]
```

### 6.5 Timeline Rendering

- **SVG approach (recommended):** 1000px wide = 24 hours (≈ 41.67px per hour)
  - Grid lines at 1-hour intervals
  - Intervals rendered as rectangles with labels
  - Mouse events for drag creation and selection

- **Alternative (Canvas):** Faster for many intervals, but more complex interaction handling

### 6.6 Step Timing (Play mode)

- Default interval between steps: 1000ms (1 second)
- Make configurable via speed slider (0.5x, 1x, 2x)
- Pause on manual step, resume on Play (don't skip)

### 6.7 Storage (Optional)

Save user-created intervals to localStorage:
```javascript
// Key: 'tenali_intervalscheduling_userIntervals'
// Value: JSON stringified intervals array
```

Allow user to load previous session's intervals.

### 6.8 Responsive Design

- **Mobile (< 768px):** Timeline spans full width, intervals stack vertically below
- **Desktop:** Timeline centered, intervals table beside or below
- **Landscape mobile:** Horizontal layout with controls at bottom

### 6.9 Accessibility

- **ARIA labels:** Use `aria-label` for interactive regions
- **Keyboard navigation:** Tab through intervals, step controls
- **Color contrast:** Ensure text over colored intervals meets WCAG AA
- **Focus indicators:** Visible outline (3px, accent color) around focused elements

## 7. CSS Classes

```
.interval-scheduling-container       Main wrapper
.timeline-canvas                     0–24 timeline visualization
.timeline-ruler                      Hour markers and grid
.interval-rect                       Individual interval rectangle
.interval-rect.default               Default state styling
.interval-rect.considering           Considering state (pulse animation)
.interval-rect.selected              Selected state (green border, checkmark)
.interval-rect.rejected              Rejected state (red dashed, opacity 0.5)
.interval-rect.skipped               Skipped state (opacity 0.2)
.interval-label                      Text label inside interval
.intervals-table                     List of all intervals
.interval-row                        Individual row in table
.controls-section                    Play/pause/step buttons
.execution-log                       Scrollable log area
.log-entry                           Individual log message
.log-entry.current-step              Highlighted current step
.solution-summary                    Results summary section
.color-palette                       Legend showing COLORS array
.drag-preview                        Preview interval during drag
.button-step-forward                 Step forward button
.button-play                         Play button
.button-pause                        Pause button
.button-reset                        Reset button
.button-load-example                 Load example button
```

## 8. Future Enhancements

1. **Customizable Speed:** Slider to adjust step timing (0.5x, 1x, 2x)
2. **Alternative Algorithms:** Visualize other approaches (earliest start, random) for comparison
3. **Quiz Mode:** Generate random intervals, students predict selected set before showing solution
4. **Export:** Save timeline as PNG/SVG image
5. **Multi-user Collaboration:** Real-time shared whiteboard (WebRTC)
6. **Advanced Features:** Weighted intervals, interval coloring problems
7. **Detailed Explanation:** Popup tooltips explaining each algorithm decision
8. **Dark Mode:** System preference adaptation
