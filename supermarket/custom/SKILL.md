# Custom Lesson Puzzle - Comprehensive Specification

## Overview

The Custom Lesson component (`CustomApp`) is a sophisticated mixed-puzzle quiz builder that allows users to select from 14 different puzzle types, configure difficulty and question distribution, and take a unified quiz that randomly or sequentially cycles through the selected puzzle types. This is the most complex puzzle in the system due to its multi-type support, complex state management, and type-specific rendering logic.

The component reuses all existing puzzle APIs without requiring a dedicated backend endpoint. It orchestrates API calls for different puzzle types (arithmetic, multiple choice, polynomial math, simultaneous equations, etc.) and provides type-specific input rendering and validation.

## Component Architecture

### Component Signature

```jsx
function CustomApp({ onBack })
```

**Props:**
- `onBack` (Function): Callback when user clicks "Back to Home" button, returns to main menu

**Returns:** JSX component with three-phase UI (Setup, Quiz, or Finished)

## Three Phases

### Phase 1: Setup (`phase === 'setup'`)

User configures the custom quiz:
1. **Puzzle Selection**: Display grid of checkboxes for all 14 puzzle types
2. **Difficulty Selection**: Radio buttons (easy/medium/hard) applied to all puzzles
3. **Ordering Mode**: Radio pills (random vs. sequential)
4. **Sequential Reordering** (if sequential mode): Up/down arrow buttons to reorder puzzles
5. **Question Count**: Text input (default 20)
6. **Start Button**: Validates selections and transitions to quiz phase

### Phase 2: Quiz (`phase === 'quiz'`)

User answers questions from selected puzzle types:
1. Load first question from first puzzle type in plan
2. Display type-specific question rendering
3. Display type-specific input UI
4. On submit: validate, check against API, show feedback
5. Auto-advance on correct answer (via `useAutoAdvance` hook)
6. Manually advance on incorrect answer
7. Cycle through all questions in plan
8. On final question completion: transition to finished phase

### Phase 3: Finished (`phase === 'finished'`)

Display results:
1. Show final score: `score / totalQ`
2. Display `ResultsTable` with all results
3. "Play Again" button to reset and return to setup

## State Variables (18 total)

### Setup Phase State

```jsx
const [phase, setPhase] = useState('setup')
```
Current phase: `'setup'` | `'quiz'` | `'finished'`

```jsx
const [selected, setSelected] = useState([])
```
Array of selected puzzle keys, e.g., `['basicarith', 'multiply', 'vocab']`

```jsx
const [ordering, setOrdering] = useState('random')
```
Question ordering mode: `'random'` | `'sequential'`

```jsx
const [difficulty, setDifficulty] = useState('easy')
```
Difficulty level applied to all selected puzzles: `'easy'` | `'medium'` | `'hard'`

```jsx
const [numQuestions, setNumQuestions] = useState('20')
```
Total number of questions as string (for input field validation)

### Quiz Phase State

```jsx
const [plan, setPlan] = useState([])
```
Array of puzzle type keys in question order, e.g., `['multiply', 'basicarith', 'multiply', 'vocab']`

```jsx
const [qIndex, setQIndex] = useState(0)
```
Current question index in plan (0-indexed)

```jsx
const [question, setQuestion] = useState(null)
```
Current question object returned from puzzle API (varies by type)

```jsx
const [curType, setCurType] = useState(null)
```
Current puzzle type key from `CUSTOM_PUZZLES`, e.g., `'polymul'`

```jsx
const [score, setScore] = useState(0)
```
Number of correct answers answered so far

```jsx
const [results, setResults] = useState([])
```
Array of result objects: `{ question, userAnswer, correctAnswer, correct, time }`

```jsx
const [feedback, setFeedback] = useState('')
```
Feedback message displayed after answer submission

```jsx
const [isCorrect, setIsCorrect] = useState(null)
```
Last answer correctness: `null` (before submit) | `true` | `false`

```jsx
const [revealed, setRevealed] = useState(false)
```
Answer revealed flag (prevents further input after submission, locks UI until advance)

```jsx
const [loading, setLoading] = useState(false)
```
API call in progress flag (disables submit button and input during fetch)

```jsx
const timer = useTimer()
```
Timer instance tracking elapsed time per question (used in results)

### Input State (Type-Specific)

```jsx
const [answer, setAnswer] = useState('')
```
Single numeric/text answer for most puzzle types: `'42'`, `'-3.5'`, etc.

```jsx
const [selectedOption, setSelectedOption] = useState('')
```
Selected letter option for multiple choice (GK, Vocab): `'A'` | `'B'` | `'C'` | `'D'`

```jsx
const [userCoeffs, setUserCoeffs] = useState([])
```
Array of coefficient inputs for polynomial multiplication: `['1', '2', '3']`

```jsx
const [inputs, setInputs] = useState({})
```
Object for multi-field inputs:
- `polyfactor`: `{ p: '2', q: '3', r: '1', s: '-4' }`
- `primefactor`: `{ factors: '2, 3, 5' }`
- `qformula`: `{ r1: '2', r2: '-3' }`
- `simul`: `{ x: '1', y: '2', z: '3' }`
- `lineq`: `{ m: '2', c: '1' }`

### Derived State

```jsx
const totalQ = plan.length
```
Total number of questions in quiz

## CUSTOM_PUZZLES Array (14 entries)

Static mapping of puzzle keys to display names used throughout the component:

```jsx
const CUSTOM_PUZZLES = [
  { key: 'basicarith', name: 'Basic Arithmetic' },
  { key: 'addition', name: 'Addition' },
  { key: 'quadratic', name: 'Quadratic' },
  { key: 'multiply', name: 'Multiplication' },
  { key: 'sqrt', name: 'Square Root' },
  { key: 'polymul', name: 'Poly Multiply' },
  { key: 'polyfactor', name: 'Poly Factor' },
  { key: 'primefactor', name: 'Prime Factors' },
  { key: 'qformula', name: 'Quadratic Formula' },
  { key: 'simul', name: 'Simultaneous Eq.' },
  { key: 'funceval', name: 'Functions' },
  { key: 'lineq', name: 'Line Equation' },
  { key: 'gk', name: 'General Knowledge' },
  { key: 'vocab', name: 'Vocab Builder' },
]
```

**Note:** Twin Hunt puzzle is excluded (not in custom selection list).

## Setup Phase Logic

### togglePuzzle(key)

Toggle selection of a puzzle type in the grid:
- If `key` already in `selected`: remove it
- Otherwise: add it

```jsx
const togglePuzzle = (key) => {
  setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
}
```

### movePuzzle(idx, dir)

Move puzzle up/down in sequential order list (only active when `ordering === 'sequential'`):
- `dir`: `-1` for move up, `+1` for move down
- Bounds check: prevent move if at top (dir=-1) or bottom (dir=+1)
- Swaps array elements at positions `idx` and `idx + dir`

```jsx
const movePuzzle = (idx, dir) => {
  const arr = [...selected]
  const swap = idx + dir
  if (swap < 0 || swap >= arr.length) return
  [arr[idx], arr[swap]] = [arr[swap], arr[idx]]
  setSelected(arr)
}
```

### startQuiz()

Build question plan and transition to quiz phase:

1. **Parse Count**: Convert `numQuestions` input to number (default 20 if invalid)
2. **Generate Plan**:
   - **Sequential mode**: Distribute count evenly across selected puzzles
     - Example: 10 questions, 3 selected puzzles → 4, 3, 3 questions per puzzle
     - First `remainder` puzzles get +1 question
     - Result: questions appear in order: `['a', 'a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c']`
   - **Random mode**: Pick random puzzle for each question
     - Result: `['vocab', 'basicarith', 'vocab', 'multiply', ...]`
3. **Reset Quiz State**: `score=0`, `results=[]`, `qIndex=0`
4. **Transition**: `setPhase('quiz')`
5. **Load First Question**: `await loadQuestion(plan[0])`

```jsx
const startQuiz = async () => {
  const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : 20
  let questionPlan = []
  if (ordering === 'sequential') {
    const perType = Math.floor(count / selected.length)
    const remainder = count % selected.length
    selected.forEach((key, i) => {
      const n = perType + (i < remainder ? 1 : 0)
      for (let j = 0; j < n; j++) questionPlan.push(key)
    })
  } else {
    for (let i = 0; i < count; i++) {
      questionPlan.push(selected[Math.floor(Math.random() * selected.length)])
    }
  }
  setPlan(questionPlan)
  setPhase('quiz')
  setScore(0)
  setResults([])
  setQIndex(0)
  await loadQuestion(questionPlan[0])
}
```

## Quiz Phase Logic

### resetInputs()

Clear all input and feedback state before loading new question:
- Clear answer fields: `answer='', selectedOption='', userCoeffs=[], inputs={}`
- Clear feedback: `feedback='', isCorrect=null, revealed=false`

### loadQuestion(type)

Fetch and set up a question for the given puzzle type:

1. Set `loading=true`
2. Call `resetInputs()`
3. Set `curType=type`
4. Clear stale question: `question=null` (prevents render errors during type transition)
5. Fetch from API: `await fetchQuestionForType(type, difficulty)`
6. On success:
   - Set question object
   - For `polymul`: initialize `userCoeffs` to array of empty strings with length = `resultDegree + 1`
7. On error: leave `question=null`
8. Set `loading=false`
9. Start timer: `timer.start()`

## API Question Fetching (fetchQuestionForType)

Maps each puzzle type to its API endpoint:

```jsx
function fetchQuestionForType(type, difficulty) {
  const diffMap = { easy: 1, medium: 2, hard: 3 }
  const urls = {
    // Arithmetic puzzles
    basicarith: `${API}/basicarith-api/question?difficulty=${difficulty}`,
    addition: `${API}/addition-api/question?digits=${diffMap[difficulty] || 1}`,
    quadratic: `${API}/quadratic-api/question?difficulty=${difficulty}`,
    multiply: `${API}/multiply-api/question?table=${Math.floor(Math.random() * 8) + 2}`,
    sqrt: `${API}/sqrt-api/question?step=${/* randomized by difficulty */}`,
    funceval: `${API}/funceval-api/question?difficulty=${difficulty}`,

    // Polynomial puzzles
    polymul: `${API}/polymul-api/question?difficulty=${difficulty}`,
    polyfactor: `${API}/polyfactor-api/question?difficulty=${difficulty}`,
    primefactor: `${API}/primefactor-api/question?difficulty=${difficulty}`,

    // Equation puzzles
    qformula: `${API}/qformula-api/question?difficulty=${difficulty}`,
    simul: `${API}/simul-api/question?difficulty=${difficulty}`,
    lineq: `${API}/lineq-api/question?difficulty=${difficulty}`,

    // Multiple choice (no difficulty for GK)
    gk: `${API}/gk-api/question`,
    vocab: `${API}/vocab-api/question?difficulty=${difficulty}`,
  }
  return fetch(urls[type]).then(r => r.json())
}
```

**Special Cases:**
- `multiply`: Random table 2-9 selected each question
- `sqrt`: Randomized step parameter based on difficulty:
  - easy: 1-10
  - medium: 11-35
  - hard: 36-60
- `gk`: No difficulty parameter (uses default)
- `addition`: Uses digit count instead of "difficulty"

## Answer Validation (handleSubmit)

Giant switch statement dispatching to 14 type-specific validation flows. All follow the same pattern:

1. Get elapsed time: `timeTaken = timer.stop()`
2. Validate user input (empty string check)
3. POST to type-specific check endpoint
4. Parse response: `{ correct, correctAnswer, ... }`
5. Set feedback message
6. Update results array with `{ question, userAnswer, correctAnswer, correct, time }`
7. Set `revealed=true` (locks further input)
8. Auto-advance triggers if `correct=true` (via `useAutoAdvance` hook)

### Type-Specific Check Endpoints and Validation

#### 1. basicarith

**Input:** Single number
**Endpoint:** `POST /basicarith-api/check`
**Body:** `{ a, b, op, answer }`
**Response:** `{ correct, correctAnswer }`
**Feedback:** "Correct! 2+3 = 5" or "Incorrect. 2+3 = 5"

#### 2. addition

**Input:** Single number
**Endpoint:** `POST /addition-api/check`
**Body:** `{ a, b, answer }`
**Response:** `{ correct, correctAnswer }`
**Feedback:** "Correct! 2 + 3 = 5" or "Incorrect. 2 + 3 = 5"

#### 3. quadratic

**Input:** Single number
**Endpoint:** `POST /quadratic-api/check`
**Body:** `{ a, b, c, x, answer }`
**Response:** `{ correct, correctAnswer }`
**Feedback:** "Correct! y = 42" or "Incorrect. y = 42"

#### 4. multiply

**Input:** Single number
**Endpoint:** `POST /multiply-api/check`
**Body:** `{ table, multiplier, answer }`
**Response:** `{ correct, correctAnswer }`
**Feedback:** "Correct! 7 × 8 = 56" or "Incorrect. 7 × 8 = 56"

#### 5. sqrt

**Input:** Single number (floor or ceiling)
**Endpoint:** `POST /sqrt-api/check`
**Body:** `{ q, answer }`
**Response:** `{ correct, sqrtRounded, floorAnswer, ceilAnswer }`
**Feedback:** "Correct! √42 ≈ 6.48" or "Incorrect. √42 ≈ 6.48 → 6 or 7"
**Display:** `⌊6.48⌋=6` or `⌈6.48⌉=7`

#### 6. funceval

**Input:** Single number
**Endpoint:** `POST /funceval-api/check`
**Body:** `{ answer, userAnswer }`
**Response:** `{ correct, correctAnswer }`
**Feedback:** "Correct! = 42" or "Incorrect. = 42"

#### 7. polymul

**Input:** Array of coefficients (userCoeffs)
**Validation:** Check all elements non-empty
**Endpoint:** `POST /polymul-api/check`
**Body:** `{ p1, p2, userCoeffs: [numbers] }`
**Response:** `{ correct, correctDisplay }`
**Feedback:** "Correct! (x+1)(x+1) = x²+2x+1" or "Incorrect. Answer: x²+2x+1"
**Display:** Coefficients as `"1, 2, 1"`

#### 8. polyfactor

**Input:** Four fields p, q, r, s
**Validation:** All fields non-empty
**Endpoint:** `POST /polyfactor-api/check`
**Body:** `{ a, b, c, userP, userQ, userR, userS }`
**Response:** `{ correct }`
**Question:** Factor (px+q)(rx+s) to get ax²+bx+c
**Feedback:** "Correct! (2x+3)(1x-4)" or "Incorrect. (2x+3)(1x-4)"
**Display:** Format with handling for sign: `(2x+3)(-1x+4)` uses minus sign char

#### 9. primefactor

**Input:** Comma/space-separated factors
**Validation:** At least one factor entered
**Processing:** Parse input, filter empties, convert to numbers, sort ascending
**Endpoint:** `POST /primefactor-api/check`
**Body:** `{ number, userFactors: [sorted numbers] }`
**Response:** `{ correct, correctFactors }`
**Feedback:** "Correct! 30 = 2 × 3 × 5" or "Incorrect. 30 = 2 × 3 × 5"

#### 10. qformula

**Input:** One or two root fields (depends on root type)
**Types:**
  - `real_equal`: One root (r1 only)
  - `real_distinct`: Two roots (r1, r2)
  - `complex`: Real and imaginary parts (r1, r2)
**Validation:** Check required fields based on type
**Endpoint:** `POST /qformula-api/check`
**Body:** `{ a, b, c, userR1, userR2, userType }`
**Response:** `{ correct, roots: { type, r1, r2, realPart, imagPart } }`
**Display:**
  - real_distinct: "r₁ = 2, r₂ = -3"
  - real_equal: "r = 2"
  - complex: "2 ± 3i"

#### 11. simul

**Input:** Two or three variable fields (x, y, z)
**Size:** 2×2 or 3×3 system
**Validation:** x and y required, z required if size=3
**Endpoint:** `POST /simul-api/check`
**Body:** `{ eqs, size, solution, userX, userY, userZ? }`
**Response:** `{ correct }`
**Display:** "(1, 2)" or "(1, 2, 3)"
**Feedback:** "Correct! (1, 2)" or "Incorrect. (1, 2)"

#### 12. lineq

**Input:** Two fields (m, c)
**Validation:** Both non-empty
**Endpoint:** `POST /lineq-api/check`
**Body:** `{ x1, y1, x2, y2, userM, userC }`
**Response:** `{ correct, m, c }`
**Feedback:** "Correct! m = 2, c = 1" or "Incorrect. m = 2, c = 1"

#### 13. gk (General Knowledge)

**Input:** Selected option letter (A, B, C, D)
**Validation:** Option selected
**Endpoint:** `POST /gk-api/check`
**Body:** `{ id, answerOption }`
**Response:** `{ correct, correctAnswer, correctAnswerText }`
**Feedback:** "Correct! Paris" or "Incorrect! Paris"
**Display:** "A: Paris"

#### 14. vocab

**Input:** Selected option letter (A, B, C, D)
**Validation:** Option selected
**Endpoint:** `POST /vocab-api/check`
**Body:** `{ id, answerOption }`
**Response:** `{ correct, correctAnswer, correctAnswerText }`
**Feedback:** "Correct! To understand" or "Incorrect! To understand"
**Display:** "B: To understand"

## Question Display (getPromptForType)

Function returns prompt text for each puzzle type:

```jsx
function getPromptForType(type, q) {
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')
  switch (type) {
    case 'basicarith': case 'addition': return `${q.prompt} = ?`
    case 'quadratic': return `${q.prompt}`
    case 'multiply': return `${q.prompt} = ?`
    case 'sqrt': return `${q.prompt} = ?`
    case 'funceval': return `${q.formula}, evaluate at ${Object.entries(q.vars).map(([k,v]) => `${k} = ${v}`).join(', ')}`
    case 'polymul': return null  // special render
    case 'polyfactor': return null  // special render
    case 'primefactor': return `Find all prime factors of ${q.number}`
    case 'qformula': return `Find the roots of ${q.a}x² ${q.b >= 0 ? '+' : '−'} ${Math.abs(q.b)}x ${q.c >= 0 ? '+' : '−'} ${Math.abs(q.c)} = 0`
    case 'simul': return null  // special render
    case 'lineq': return `Find slope (m) and intercept (c) for the line through (${q.x1}, ${q.y1}) and (${q.x2}, ${q.y2})`
    case 'gk': return q.question
    case 'vocab': return `What does "${q.question}" mean?`
    default: return ''
  }
}
```

**Special Renders (return null):**
- `polymul`: Custom polynomial display "(p1) × (p2)"
- `polyfactor`: Custom expression display "Factor: expression"
- `simul`: Custom equation system display

## Input Rendering (renderInputs)

Returns type-specific input UI component.

### Simple Numeric Inputs (basicarith, addition, quadratic, multiply, sqrt, funceval)

```jsx
<>
  <input className="answer-input" type="text" value={answer}
    onChange={e => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d*\.?\d*$/.test(v)) setAnswer(v) }}
    disabled={revealed} placeholder="Type your answer"
    onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
  <NumPad value={answer} onChange={v => !revealed && setAnswer(v)} disabled={revealed} />
</>
```

**Validation regex:** `/^-?\d*\.?\d*$/` allows negative, decimal numbers, partial entry

### Multiple Choice Options (gk, vocab)

```jsx
<div className="options-grid">
  {question.options.map((opt) => (
    <button key={opt.option}
      className={`option-card ${selectedOption === opt.option ? 'selected' : ''}
        ${revealed && opt.option === question.correctAnswer ? 'correct-option' : ''}
        ${revealed && selectedOption === opt.option && !isCorrect ? 'wrong-option' : ''}`}
      onClick={() => !revealed && setSelectedOption(opt.option)} disabled={revealed}>
      <strong>{opt.option}.</strong> {opt.text}
    </button>
  ))}
</div>
```

**Classes:**
- `selected`: Currently selected option
- `correct-option`: Revealed correct answer
- `wrong-option`: User's wrong selection

### Polynomial Multiplication Coefficients (polymul)

```jsx
<div className="coeff-inputs">
  {userCoeffs.map((c, i) => (
    <div key={i} className="coeff-field">
      <label className="coeff-label">{formatCoeffLabel(i)}</label>
      <input className="answer-input coeff-input" type="text" value={c} disabled={revealed}
        onChange={e => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) { const nc = [...userCoeffs]; nc[i] = v; setUserCoeffs(nc) } }}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
    </div>
  ))}
</div>
```

**formatCoeffLabel(i):** Returns "constant" (i=0), "x" (i=1), "x²" (i=2), etc.

### Polynomial Factorization (polyfactor)

```jsx
<div className="factor-inputs">
  {[['p','p'],['q','q'],['r','r'],['s','s']].map(([key, label]) => (
    <div key={key} className="coeff-field">
      <label className="coeff-label">{label}</label>
      <input className="answer-input coeff-input" type="text" value={inputs[key] || ''} disabled={revealed}
        onChange={valInput(key)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
    </div>
  ))}
  <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>Factor as (px + q)(rx + s)</div>
</div>
```

**Helper:** `valInput(key)` creates handler accepting `-?\d*\.?\d*`

### Prime Factorization (primefactor)

```jsx
<div className="single-input-row">
  <input className="answer-input" type="text" value={inputs.factors || ''} disabled={revealed}
    placeholder="e.g. 2, 3, 5" onChange={e => setInputs(prev => ({ ...prev, factors: e.target.value }))}
    onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
  <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>Enter all prime factors separated by commas</div>
</div>
```

### Quadratic Roots (qformula)

Renders conditionally based on `question.roots.type`:

**complex roots:** Real part, Imaginary part inputs
**real_equal:** Single root input
**real_distinct:** Two root inputs (r₁, r₂)

### Simultaneous Equations (simul)

```jsx
<div className="roots-inputs">
  <div className="coeff-field">
    <label className="coeff-label">x =</label>
    <input className="answer-input coeff-input" type="text" value={inputs.x || ''} disabled={revealed}
      onChange={valInput('x')} />
  </div>
  <div className="coeff-field">
    <label className="coeff-label">y =</label>
    <input className="answer-input coeff-input" type="text" value={inputs.y || ''} disabled={revealed}
      onChange={valInput('y')} />
  </div>
  {question.size === 3 && <div className="coeff-field">
    <label className="coeff-label">z =</label>
    <input className="answer-input coeff-input" type="text" value={inputs.z || ''} disabled={revealed}
      onChange={valInput('z')} />
  </div>}
</div>
```

### Line Equation (lineq)

```jsx
<div className="roots-inputs">
  <div className="coeff-field">
    <label className="coeff-label">m =</label>
    <input className="answer-input coeff-input" type="text" value={inputs.m || ''} disabled={revealed}
      onChange={valInput('m')} />
  </div>
  <div className="coeff-field">
    <label className="coeff-label">c =</label>
    <input className="answer-input coeff-input" type="text" value={inputs.c || ''} disabled={revealed}
      onChange={valInput('c')} />
  </div>
</div>
```

## Question Display Rendering (renderQuestion)

Returns type-specific question display with type badge.

### Polynomial Multiplication Special Display

```jsx
<>
  <div className="custom-type-badge">{typeName}</div>
  <div className="question-box">
    <span className="poly-expr">({question.p1Display})</span> × <span className="poly-expr">({question.p2Display})</span>
  </div>
</>
```

### Polynomial Factorization Special Display

```jsx
<>
  <div className="custom-type-badge">{typeName}</div>
  <div className="question-box">Factor: {question.display}</div>
</>
```

### Simultaneous Equations Special Display

Formats 2×2 or 3×3 system using equation formatting helper:

```jsx
<>
  <div className="custom-type-badge">{typeName}</div>
  <div className="question-box">
    {question.eqs.map((eq, i) => (
      <div key={i}>{is3 ? fmtEq3(eq) : fmtEq2(eq)}</div>
    ))}
  </div>
</>
```

**Helpers:**
- `fmtEq2(eq)`: "2x + 3y = 5" or "2x − 3y = 5"
- `fmtEq3(eq)`: "2x + 3y − 4z = 5"

### Generic Question Display

```jsx
<>
  <div className="custom-type-badge">{typeName}</div>
  <div className="question-box">{getPromptForType(curType, question)}</div>
</>
```

## Keyboard Shortcuts

Active only during quiz phase on multiple choice questions (GK, Vocab).

**Mapping:**
- `1` → `A`
- `2` → `B`
- `3` → `C`
- `4` → `D`
- `a` → `A`
- `b` → `B`
- `c` → `C`
- `d` → `D`

**Behavior:** Prevents default, calls `handleSubmit(letter)` with selected option

**Disabled when:** `revealed=true` or `loading=true` or not GK/Vocab

## Auto-Advance Logic

Uses `useAutoAdvance(revealed, advanceRef, isCorrect)` hook:
- Triggers when `revealed=true` AND `isCorrect=true`
- Waits for 3-second delay (user sees feedback)
- Calls `advanceRef.current()` to load next question or finish

**advanceRef** logic:
- If `qIndex + 1 >= totalQ`: transition to finished phase
- Otherwise: increment `qIndex`, load next question from plan

## Setup Phase UI Structure

```
┌─────────────────────────────────────────┐
│ Setup                                   │
├─────────────────────────────────────────┤
│ Difficulty:  [○ Easy] [○ Medium] [○ Hard] │
│                                         │
│ Select Puzzles:                         │
│ ┌──────────────────────────────────┐   │
│ │ ☐ Basic Arithmetic  ☐ Addition   │   │
│ │ ☐ Quadratic         ☐ Multiply   │   │
│ │ ☐ Square Root       ☐ Poly Mul   │   │
│ │ ... (14 total)                   │   │
│ └──────────────────────────────────┘   │
│                                         │
│ Order Mode: [● Random] [○ Sequential]   │
│                                         │
│ Questions: [20]                         │
│                                         │
│ [Start Quiz]                            │
└─────────────────────────────────────────┘
```

**If Sequential Mode:**
Shows reorder list with up/down arrows for each selected puzzle.

## Quiz Phase UI Structure

```
┌──────────────────────────────────────┐
│ Custom Quiz                          │
│ [← Back]                             │
├──────────────────────────────────────┤
│ Question 3/20                        │
│                                      │
│ [Poly Multiply Badge]                │
│ (x + 1) × (x + 2)                    │
│                                      │
│ Constant:  [_]                       │
│ x:         [_]                       │
│ x²:        [_]                       │
│                                      │
│ [Check Answer]  [Skip]               │
│                                      │
│ Feedback (if revealed):              │
│ "Correct! x² + 3x + 2"               │
└──────────────────────────────────────┘
```

## Finished Phase UI Structure

```
┌──────────────────────────────────────┐
│ Quiz Complete!                       │
├──────────────────────────────────────┤
│ Final score: 18/20                   │
│                                      │
│ [Results Table]                      │
│ │ Question | Your Answer | Correct  │
│ ├──────────────────────────────────┤
│ │ Multiply 7 × 8 | 56 | 56 | ✓      │
│ │ Add: 3 + 2 | 5 | 5 | ✓            │
│ │ ...                              │
│                                      │
│ [Play Again]                         │
└──────────────────────────────────────┘
```

Uses `QuizLayout` wrapper with title, subtitle, back button, and children.

## CSS Classes

**Layout & Structure:**
- `.custom-section-label` — Setup section headers ("Difficulty", "Select Puzzles")
- `.custom-puzzle-grid` — Grid container for puzzle selection checkboxes
- `.custom-puzzle-check` / `.custom-puzzle-check.checked` — Individual puzzle checkbox styling
- `.custom-order-list` — Container for sequential ordering list
- `.custom-order-item` — Single item in reorder list
- `.custom-order-num` — Index number in reorder list
- `.custom-order-name` — Puzzle name in reorder list
- `.custom-order-btn` — Up/down arrow buttons for reordering
- `.custom-type-badge` — Type name badge displayed above question ("Poly Multiply")

**Quiz Phase:**
- `.question-box` — Container for question display
- `.poly-expr` — Polynomial expression display with parentheses
- `.options-grid` — Grid of multiple choice option buttons
- `.option-card` — Individual MC option button
- `.option-card.selected` — Selected option styling
- `.option-card.correct-option` — Correct answer revealed styling
- `.option-card.wrong-option` — User's incorrect selection
- `.coeff-inputs` / `.factor-inputs` — Multi-field input containers
- `.coeff-field` — Single field wrapper
- `.coeff-label` — Field label ("x²", "p", "m")
- `.coeff-input` — Coefficient/field text input
- `.answer-input` — Text input for numeric answers
- `.single-input-row` — Single-line input row with helper text
- `.roots-inputs` — Multi-field root/variable inputs

**Feedback & Results:**
- `.welcome-box` — Finished phase results container
- `.final-score` — "Final score: 18/20" text
- `.is-feedback` / `.is-feedback.correct` / `.is-feedback.wrong` — Feedback styling

## Hooks Used

### useAutoAdvance(revealed, advanceFnRef, isCorrect)

Signature: 3 arguments
- `revealed`: boolean, has answer been submitted?
- `advanceFnRef`: mutable ref to advance function
- `isCorrect`: boolean | null, was answer correct?

**Behavior:** Auto-advances (calls `advanceFnRef.current()`) when answer is revealed AND correct, after 3-second delay.

### useTimer()

Per-question timer:
- `timer.start()`: Begin timing
- `timer.stop()`: End timing, return elapsed milliseconds
- `timer.reset()`: Reset timer state

Used to track time spent on each question in results.

## API Contract

CustomApp does NOT require a dedicated `/custom-api` endpoint. It reuses all existing puzzle APIs:
- `/basicarith-api/question`, `/basicarith-api/check`
- `/addition-api/question`, `/addition-api/check`
- ... (and so on for all 12 other puzzle types)

No proxy entry needed in `vite.config.js`; existing puzzle proxies handle all requests.

## Edge Cases & Notes

1. **Empty Selection**: startQuiz() should validate that at least one puzzle is selected
2. **High Question Count**: If numQuestions > 100, consider pagination or warning
3. **Type Transitions**: When changing curType, question is set to null first to prevent stale data render
4. **Sequential Distribution**: First N%L types get +1 question (ensures even distribution)
5. **Feedback Truncation**: Results question display truncated to 80 characters max
6. **Coefficient Validation**: Polymul uses strict integer validation `/^-?\d+$/`, not decimals
7. **Missing Options**: MC questions checked for `question.options` before rendering
8. **Complex Roots**: Qformula handles three root types with conditional input rendering

## Summary

CustomApp is a 650+ line component providing a sophisticated unified quiz experience across 14 different puzzle types. It manages complex state across three distinct phases, provides type-specific input and output rendering, orchestrates API calls to reuse existing puzzle endpoints, and tracks detailed results with timing data. The component demonstrates advanced React patterns including refs, custom hooks, and conditional rendering based on puzzle type.
