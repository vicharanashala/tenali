# Extended Euclidean Algorithm — Formal Specification

## 1. Purpose

An interactive visualization of the Extended Euclidean Algorithm. Given two integers a and b, the algorithm computes their greatest common divisor (gcd) and simultaneously finds integers x and y such that ax + by = gcd(a, b). This is essential for cryptography, modular arithmetic, and understanding number theory. The visualization shows each step's division, remainder, and intermediate coefficients in a detailed step table.

## 2. System Architecture

### 2.1 Route

- **Student/Classroom route**: `/extendedeuclid` — Interactive Extended Euclidean Algorithm visualization

### 2.2 Core Functionality

1. **Step-by-step Computation** — Compute gcd and Bezout coefficients iteratively
2. **Division Steps Table** — Display r, s (quotient), t (remainder), q at each step
3. **Interactive Input** — Users enter a and b, algorithm runs or auto-steps
4. **Load Example** — Predefined example (252, 198) for demonstration
5. **Sign Adjustment** — Handle negative inputs by computing for |a| and |b|, then adjusting signs
6. **Verification** — Display ax + by = gcd(a, b) with actual computed values

## 3. Mathematical Background

### 3.1 Extended Euclidean Algorithm

**Input:** Two integers a, b (can be negative, algorithm uses absolute values)

**Output:** gcd(a, b), x, y such that ax + by = gcd(a, b)

**Algorithm (iterative approach):**

```
r0 = a, r1 = b
s0 = 1, s1 = 0
t0 = 0, t1 = 1

while r_i != 0:
  q_i = r_{i-1} DIV r_i       (integer division)
  r_{i+1} = r_{i-1} - q_i * r_i
  s_{i+1} = s_{i-1} - q_i * s_i
  t_{i+1} = t_{i-1} - q_i * t_i
  i += 1

gcd = r_{i-1}  (when loop terminates, last non-zero remainder)
x = s_{i-1}
y = t_{i-1}
```

### 3.2 Example Walkthrough: a=252, b=198

| Step | r | s | t | q | Computation |
|------|---|---|---|----|------------|
| 0 | 252 | 1 | 0 | — | Initial: r₀=252, s₀=1, t₀=0 |
| 1 | 198 | 0 | 1 | — | Initial: r₁=198, s₁=0, t₁=1 |
| 2 | 54 | 1 | -1 | 1 | q₁=252÷198=1, r₂=252−1×198=54, s₂=1−1×0=1, t₂=0−1×1=−1 |
| 3 | 36 | -3 | 4 | 3 | q₂=198÷54=3, r₃=198−3×54=36, s₃=0−3×1=−3, t₃=1−3×(−1)=4 |
| 4 | 18 | 4 | -5 | 1 | q₃=54÷36=1, r₄=54−1×36=18, s₄=1−1×(−3)=4, t₄=−1−1×4=−5 |
| 5 | 0 | -7 | 9 | 2 | q₄=36÷18=2, r₅=36−2×18=0, s₅=−3−2×4=−7, t₅=4−2×(−5)=9 |

**Result:** gcd(252, 198) = 18, x = -7, y = 9
**Verification:** 252 × (-7) + 198 × 9 = -1764 + 1782 = 18 ✓

### 3.3 Handling Negative Inputs

If a < 0 or b < 0:
1. Compute algorithm for |a| and |b|
2. Obtain x₀, y₀ such that |a|×x₀ + |b|×y₀ = gcd(a,b)
3. Adjust signs:
   - If a < 0: x = -x₀
   - If b < 0: y = -y₀
4. Final equation: a×x + b×y = gcd(a,b)

**Example:** a = -252, b = 198
- Compute for 252, 198 → x₀ = -7, y₀ = 9
- Adjust: x = -(-7) = 7, y = 9
- Verify: (-252) × 7 + 198 × 9 = -1764 + 1782 = 18 ✓

## 4. Frontend Component Specification

### 4.1 Component: ExtendedEuclidApp

**Props:** `onBack` (function)

**State:**

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| a | string | '' | First input number |
| b | string | '' | Second input number |
| started | boolean | false | Computation has begun |
| finished | boolean | false | Computation complete |
| steps | array | [] | Array of step objects (r, s, t, q) |
| currentStepIndex | number | -1 | Index of displayed step (-1 = setup, n = step n) |
| isRunning | boolean | false | Play/pause state for auto-step |
| gcd | number/null | null | Result: greatest common divisor |
| x | number/null | null | Result: Bezout coefficient for a |
| y | number/null | null | Result: Bezout coefficient for b |
| originalA | number/null | null | Original a (for sign adjustment display) |
| originalB | number/null | null | Original b (for sign adjustment display) |
| verificationMsg | string | '' | Display ax + by = gcd message |

**refs:**
- `stepsTableRef` — Reference to step table container (for scrolling)
- `playIntervalRef` — ID of current auto-step timer

### 4.2 Step Object Structure

```javascript
{
  index: number,              // Step number (0, 1, 2, ...)
  r: number,                  // Current remainder
  s: number,                  // Current s coefficient
  t: number,                  // Current t coefficient
  q: number | null,           // Quotient (null for initial steps)
  display: string             // Human-readable line (e.g., "Step 2: q=1, r=54, s=1, t=-1")
}
```

### 4.3 User Flow

```
[Show: "Extended Euclidean Algorithm Visualization"]
[Show: "Enter two integers a and b"]
[Input fields: a = [__], b = [__]]
[Show: "Load Example (252, 198)" button]
[Show: "Start Computation" button]
        ↓ (enter a, b and click Start OR Load Example)
[Clear steps array, set currentStepIndex = -1]
[Run algorithm (server-side computation or client-side)]
        ↓
[Populate steps array with all iteration steps]
[Set finished = false, started = true]
[Display step table with all rows]
[Show "Next Step" and "Play" buttons]
        ↓
[User clicks "Next Step" OR "Play"]
        ↓ (Next Step)
[Increment currentStepIndex]
[Highlight current row in table]
[Display current step computation details]
        ↓ (Play)
[Auto-increment currentStepIndex every 800ms]
[Auto-scroll table to current step]
        ↓ (end of steps)
[Set finished = true]
[Display: "Computation complete!"]
[Show result: gcd = 18, x = -7, y = 9]
[Show verification: "252 × (-7) + 198 × 9 = 18"]
[Show "Start Over" button]
```

### 4.4 UI Layout

```
┌──────────────────────────────────────────────────────────┐
│ [← Home]                                                 │
│   Extended Euclidean Algorithm Visualization             │
│   Find gcd(a, b) and solve ax + by = gcd(a, b)          │
│                                                          │
│ ┌─ Input ────────────────────────────────────────────┐  │
│ │ a = [_____________]    b = [_____________]        │  │
│ │ [Load Example: (252, 198)]                         │  │
│ │                    [Start Computation]             │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Division Steps Table ─────────────────────────────┐  │
│ │ Step │  r  │ s  │  t  │  q │ Computation           │  │
│ │ ─────┼─────┼────┼─────┼────┼──────────────────────  │  │
│ │  0   │ 252 │ 1  │  0  │ —  │ r₀=252, s₀=1, t₀=0   │  │
│ │  1   │ 198 │ 0  │  1  │ —  │ r₁=198, s₁=0, t₁=1   │  │
│ │* 2   │  54 │ 1  │ -1  │ 1  │ q=1, r=54, s=1, t=-1 │  │
│ │  3   │  36 │-3  │  4  │ 3  │ q=3, r=36, s=-3, t=4 │  │
│ │  4   │  18 │ 4  │ -5  │ 1  │ q=1, r=18, s=4, t=-5 │  │
│ │  5   │   0 │-7  │  9  │ 2  │ q=2, r=0, s=-7, t=9  │  │
│ └────────────────────────────────────────────────────┘  │
│ * = current step (highlighted)                          │
│                                                          │
│ ┌─ Current Step Details ─────────────────────────────┐  │
│ │ Step 2: Division                                   │  │
│ │ Quotient: q = 252 ÷ 198 = 1                       │  │
│ │ Remainder: r = 252 − 1 × 198 = 54                 │  │
│ │ Update coefficients:                               │  │
│ │   s = 1 − 1 × 0 = 1                               │  │
│ │   t = 0 − 1 × 1 = −1                              │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Controls ─────────────────────────────────────────┐  │
│ │ [Previous Step] [Next Step] [Play ▶] [Pause ||]   │  │
│ │ Current: Step 2 of 5                               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Result ────────────────────────────────────────────┐  │
│ │ GCD: 18                                             │  │
│ │ Bezout Coefficients: x = -7, y = 9                 │  │
│ │ Verification: 252 × (-7) + 198 × 9 = 18 ✓         │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.5 Step Table Specification

**Columns:**

1. **Step** — Iteration number (0, 1, 2, ...)
2. **r** — Current remainder value
3. **s** — Current s coefficient
4. **t** — Current t coefficient
5. **q** — Quotient (integer division result)
6. **Computation** — Human-readable explanation of the step

**Rows:**
- Initial rows (step 0, 1): Show r, s, t with no quotient
- Iteration rows: Show computed q and updated r, s, t
- Final row: Show r = 0 (termination condition)

**Highlighting:**
- Current step row: Highlighted with background color (accent soft)
- Previous steps: Normal background
- Next steps (not yet reached): Faded or disabled styling

**Scrolling:**
- Auto-scroll to keep current step visible
- Smooth scroll on next/previous

### 4.6 Current Step Details Panel

When a step is displayed:
```
Step N: [Description based on step index]

For iteration steps:
  Quotient: q = r_{i-1} ÷ r_i = [value]
  Remainder: r_{i+1} = r_{i-1} − q × r_i = [value] − [q] × [r_i] = [r_new]

  Coefficients:
    s_{i+1} = s_{i-1} − q × s_i = [s_{i-1}] − [q] × [s_i] = [s_new]
    t_{i+1} = t_{i-1} − q × t_i = [t_{i-1}] − [q] × [t_i] = [t_new]
```

### 4.7 Result Display

After computation completes:
```
┌─ Result ─────────────────────────────┐
│ GCD(252, 198) = 18                   │
│                                      │
│ Bezout Coefficients:                 │
│   x = -7                             │
│   y = 9                              │
│                                      │
│ Verification:                        │
│ 252 × (-7) + 198 × 9 = 18           │
│ = -1764 + 1782                       │
│ = 18 ✓                               │
└──────────────────────────────────────┘
```

**If original inputs were negative:**
```
Original inputs: a = -252, b = 198
Adjusted for computation: |a| = 252, |b| = 198
Coefficient adjustment: x = -(-7) = 7
Final equation: (-252) × 7 + 198 × 9 = 18
```

### 4.8 Keyboard Support

- **Enter key**: Start computation or auto-step next (if focused on input or step area)
- **Space**: Play/Pause auto-step
- **Right Arrow**: Next step
- **Left Arrow**: Previous step
- **R**: Reset and clear all inputs
- **L**: Load example (252, 198)

### 4.9 Load Example Button

Predefined example loads a = 252, b = 198, immediately runs the algorithm, and shows the complete step table. Useful for students new to the algorithm who want to see a worked example.

**Example selection (future enhancement):**
- Dropdown with multiple predefined examples
- Examples of varying difficulty: gcd=1, gcd>1, negative inputs

### 4.10 Auto-Step Timing

- Default interval between steps: 800ms
- Make configurable via speed slider (0.5x, 1x, 2x)
- Pause on manual navigation, resume on Play
- Do not skip steps when playing

## 5. No API Calls

The Extended Euclidean Algorithm is entirely client-side. **No API endpoints needed.** All computation happens in the browser using JavaScript. The algorithm is simple enough for client-side implementation without server round-trips.

**Client-side implementation (pseudocode):**

```javascript
function extendedGCD(a, b) {
  // Handle negative inputs
  const originalA = a, originalB = b
  a = Math.abs(a)
  b = Math.abs(b)

  // Initialize
  const steps = []
  let r0 = a, r1 = b
  let s0 = 1, s1 = 0
  let t0 = 0, t1 = 1

  // Record initial steps
  steps.push({ index: 0, r: r0, s: s0, t: t0, q: null })
  steps.push({ index: 1, r: r1, s: s1, t: t1, q: null })

  // Iterate
  let i = 1
  while (r1 !== 0) {
    const q = Math.floor(r0 / r1)
    const r2 = r0 - q * r1
    const s2 = s0 - q * s1
    const t2 = t0 - q * t1

    steps.push({ index: i + 1, r: r2, s: s2, t: t2, q: q })

    r0 = r1; r1 = r2
    s0 = s1; s1 = s2
    t0 = t1; t1 = t2
    i++
  }

  // Adjust for negative inputs
  let x = s0, y = t0
  if (originalA < 0) x = -x
  if (originalB < 0) y = -y

  return { gcd: r0, x, y, steps }
}
```

## 6. Implementation Notes

### 6.1 Input Validation

- Accept integers (positive, negative, zero)
- Reject both a=0 and b=0 (gcd undefined)
- Allow a=0 or b=0 individually (gcd = non-zero one)
- Parse input carefully: trim whitespace, handle minus sign
- Display error messages clearly

### 6.2 Display Formatting

- Large numbers: Format with thousands separators (optional)
- Negative numbers: Display with minus sign consistently
- Fractions/decimals: Show integer division results as whole numbers
- Equation verification: Show intermediate calculations for clarity

### 6.3 Step Scrolling

- Keep current step visible (center in viewport if possible)
- Smooth scroll transition (CSS `scroll-behavior: smooth`)
- On resize, recenter current step

### 6.4 Responsive Design

- **Mobile (< 768px):** Stack controls vertically, table scrolls horizontally
- **Desktop:** Horizontal layout with table on left, details on right (if space permits)
- **Landscape mobile:** Two-column layout (table + details side-by-side)

### 6.5 Accessibility

- **ARIA labels:** Use `aria-label`, `aria-describedby` for interactive elements
- **Semantic HTML:** Use `<table>` for step table with `<thead>`, `<tbody>`
- **Focus indicators:** Visible outline (3px, accent color) around focused elements
- **Color contrast:** Ensure text readability (WCAG AA minimum)
- **Keyboard navigation:** Full support for Tab, Arrow keys, Enter

### 6.6 CSS Classes

```
.exteuclid-container                Main wrapper
.input-section                      Input area with a, b fields
.input-field                        Individual input field
.button-load-example                Load example button
.button-start                       Start computation button
.step-table-wrapper                 Table container (scrollable)
.step-table                         The actual table
.step-table thead                   Table header
.step-table tbody                   Table body
.step-row                           Individual step row
.step-row.current                   Current step (highlighted)
.step-row.previous                  Previous steps (faded)
.step-row.future                    Future steps (disabled)
.computation-details                Current step explanation
.detail-line                        Single line of computation
.result-section                     Result display area
.result-box                         Individual result box
.verification-box                   Equation verification display
.controls-section                   Play/pause/step buttons
.button-prev-step                   Previous step button
.button-next-step                   Next step button
.button-play                        Play button
.button-pause                       Pause button
.button-reset                       Reset button
.error-message                      Error display (validation)
.success-message                    Success indicator
```

### 6.7 Computation Efficiency

- Algorithm complexity: O(log(min(a, b))) — very efficient
- For typical inputs (< 10,000), computation is instant
- Display all steps without performance penalty
- No need for pagination or lazy loading

### 6.8 Storage (Optional)

Save user input history to localStorage:
```javascript
// Key: 'tenali_exteuclid_history'
// Value: array of { a, b, gcd, x, y, timestamp }
```

Allow user to recall previous computations from history.

## 7. Mathematical Extensions and Future Enhancements

1. **Modular Multiplicative Inverse:** Show how to use Extended GCD to find modular inverses (ax ≡ 1 (mod m))
2. **Linear Diophantine Equations:** Solve ax + by = c for general c (if gcd(a,b) | c)
3. **Step Comparison:** Show efficiency vs. naive GCD algorithm (Euclidean only)
4. **Multiple Algorithms:** Visualize Binary GCD (Stein's algorithm) alongside Extended GCD
5. **Quiz Mode:** Given steps table with missing values, students fill in blanks
6. **Certificate Mode:** Generate downloadable verification certificate (gcd equation)
7. **History Panel:** Keep scrollable list of all previous computations
8. **Cryptography Connection:** Explain RSA key generation use case
9. **Matrix Representation:** Show optional matrix form of the algorithm
10. **Custom Examples:** Teachers create custom examples for students to work through

## 8. Educational Notes

**Learning objectives:**
- Understand the Extended Euclidean Algorithm's mathematical basis
- Recognize how to find Bezout coefficients programmatically
- Apply the algorithm to solve linear Diophantine equations
- Understand the cryptographic importance (modular inverse computation)
- Build intuition for algorithm complexity and step progression

**Typical student interactions:**
1. Load example, step through to see all computed values
2. Try custom input to see algorithm adapt
3. Verify results using the ax + by = gcd equation
4. Apply to modular inverse problems (future enhancement)
