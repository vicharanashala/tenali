# Sets — Formal Specification

## 1. Overview

Sets and Venn diagrams quiz covering the IGCSE syllabus with four difficulty levels. Students master set notation (union, intersection, complement, difference), cardinality, and 2-set and 3-set Venn diagram problems using inclusion-exclusion. All questions generated algorithmically on-the-fly. Features optional adaptive mode that adjusts difficulty based on performance (starting easy, reaching up to extrahard).

**Target Grade Level:** IGCSE (Age 14–16)

## 2. Component Specification

**Component:** `SetsApp` (hand-written, located in `App.jsx` monolith)

**Props:**
- `onBack` (function) — Callback invoked when user navigates away

**Custom Features:**
- Hand-written (not factory-built)
- Adaptive mode via `isAdaptive` state
- Score-based difficulty progression: `adaptScore` (float 0–3), `adaptScoreRef` (ref)
- Gradient progress bar for adaptive mode

**Files:**
- Component: `App.jsx` (monolith, `SetsApp` function, lines 3890–4018)
- CSS: `App.css` (reuses standard quiz classes)
- Server: `/sets-api/` routes in `server/index.js`
- Vite proxy: `/sets-api` entry in `vite.config.js`

## 3. State Variables

| Variable | Type | Initial | Purpose |
|----------|------|---------|---------|
| `difficulty` | string | 'easy' | Selected difficulty: 'easy', 'medium', 'hard', or 'extrahard' |
| `isAdaptive` | boolean | false | True if user selects adaptive mode |
| `adaptScore` | number | 0 | Adaptive score (0–3 range) controlling effective difficulty |
| `adaptScoreRef` | MutableRefObject | 0 | Ref mirror of `adaptScore` for effectiveDiff() function |
| `numQuestions` | string | '20' | User input for total question count |
| `started` | boolean | false | True after quiz start button clicked |
| `finished` | boolean | false | True after last question answered |
| `question` | object\|null | null | Current question from API (see §4 for shapes) |
| `answer` | string | '' | User's text answer input |
| `score` | number | 0 | Count of correct answers |
| `questionNumber` | number | 0 | Current question index (1-based in display) |
| `totalQ` | number | 20 | Parsed and validated total question count |
| `feedback` | string | '' | Feedback message displayed after submission |
| `isCorrect` | boolean\|null | null | Whether last answer was correct (null before submission) |
| `loading` | boolean | false | True while fetching next question |
| `revealed` | boolean | false | True after answer submitted and checked |
| `results` | array | [] | Array of result objects for ResultsTable |

**Timer:** Uses shared `useTimer()` hook.

**AutoAdvance:** Uses `useRef(() => {})` and shared `useAutoAdvance(revealed, advanceFnRef, isCorrect)` hook. Only fires when `isCorrect === true`.

**Enter key after wrong:** A `useEffect` adds a global `keydown` listener for Enter when `revealed && !isCorrect`, calling `advance()`.

## 4. API Endpoints

### 4.1 GET /sets-api/question

**Purpose:** Generate a random sets question at the specified difficulty.

**Query Parameters:**
- `difficulty` (string): 'easy', 'medium', 'hard', or 'extrahard'

**Response (Easy — list elements):**
```json
{
  "id": 1712345678000,
  "difficulty": "easy",
  "type": "list",
  "prompt": "U = {1, 2, ..., 12}, A = {2, 4, 6}, B = {3, 4, 5}. Find A ∩ B",
  "answer": [4]
}
```

**Response (Medium — cardinality):**
```json
{
  "id": 1712345678001,
  "difficulty": "medium",
  "type": "cardinality",
  "subtype": "find_union",
  "prompt": "n(A) = 15, n(B) = 20, n(A ∩ B) = 8. Find n(A ∪ B)",
  "answer": 27
}
```

**Response (Hard — 2-set Venn):**
```json
{
  "id": 1712345678002,
  "difficulty": "hard",
  "type": "venn2",
  "subtype": "find_neither",
  "prompt": "In a group of 50: n(A only) = 12, n(A ∩ B) = 8, n(B only) = 15. How many are in neither A nor B?",
  "answer": 15
}
```

**Response (ExtraHard — 3-set Venn):**
```json
{
  "id": 1712345678003,
  "difficulty": "extrahard",
  "type": "venn3",
  "subtype": "find_abc",
  "prompt": "n(A) = 25, n(B) = 30, n(C) = 28, n(A∩B) = 12, n(A∩C) = 10, n(B∩C) = 14, total in at least one set = 40. Find n(A ∩ B ∩ C).",
  "answer": 3
}
```

### 4.2 POST /sets-api/check

**Purpose:** Validate user's set answer against the correct result.

**Request Body:** Question fields plus `userAnswer` (string)

**Response:**
```json
{ "correct": true, "display": "{4}", "message": "Correct!" }
```

**Server-side Algorithm:**

1. **List (easy):** Parse user input as set notation (e.g. "{1,3,5}" or "1,3,5" or "empty"), compare to expected array
2. **Cardinality (medium):** Parse user input as integer, compare to expected cardinality
3. **Venn2 (hard):** Parse user input as integer, compare to expected region count
4. **Venn3 (extrahard):** Parse user input as integer, compare to expected region using inclusion-exclusion formula: `n(A∪B∪C) = n(A) + n(B) + n(C) - n(A∩B) - n(A∩C) - n(B∩C) + n(A∩B∩C)`

**Utility Functions (server):**
- `setUnion(a, b)`: Returns sorted union of two arrays
- `setIntersect(a, b)`: Returns sorted intersection
- `setDiff(a, b)`: Returns elements in a but not b (sorted)
- `randomSubset(universe, k)`: Generates k random elements from universe
- `setPick(arr)`: Random element from array
- `setRand(lo, hi)`: Random integer in [lo, hi]

## 5. Difficulty Levels

| Level | Type | Description | Example |
|-------|------|-------------|---------|
| Easy | list | List elements of set operations (union, intersection, complement, difference) | U={1..12}, A={2,4,6}, B={3,4,5}. Find A∩B → {4} |
| Medium | cardinality | Use inclusion-exclusion formula n(A∪B) = n(A) + n(B) − n(A∩B) | n(A)=15, n(B)=20, n(A∩B)=8. Find n(A∪B) → 27 |
| Hard | venn2 | Given 3 of 4 Venn regions, find the missing one | Group of 50: n(A only)=12, n(A∩B)=8, n(B only)=15. Neither? → 15 |
| ExtraHard | venn3 | Full 3-set Venn diagram using 3-set inclusion-exclusion | n(A)=25, n(B)=30, n(C)=28, n(A∩B)=12, n(A∩C)=10, n(B∩C)=14, at least one=40. n(A∩B∩C)? → 3 |

## 6. Question Generation Algorithm

### Easy (List Elements)
```
1. Generate universe U = {1, 2, ..., k} where k ∈ [10, 15]
2. Generate set A = random subset of U (3–6 elements)
3. Generate set B = random subset of U (3–6 elements)
4. Randomly choose operation from: A∪B, A∩B, A−B, B−A, A'(complement)
5. Compute correct answer set
6. Return: { id, difficulty: "easy", type: "list", prompt, answer }
```

### Medium (Cardinality)
```
1. Generate n(A) ∈ [10, 30], n(B) ∈ [10, 30]
2. Generate n(A∩B) ∈ [2, min(n(A), n(B)) − 1]
3. Compute n(A∪B) = n(A) + n(B) − n(A∩B)
4. Randomly choose subtype:
   - find_union: Given n(A), n(B), n(A∩B); find n(A∪B)
   - find_intersect: Given n(A), n(B), n(A∪B); find n(A∩B)
   - find_only_a: Given n(A), n(A∩B); find n(A only) = n(A) − n(A∩B)
5. Return: { id, difficulty: "medium", type: "cardinality", subtype, prompt, answer }
```

### Hard (2-set Venn)
```
1. Generate regions: only_A ∈ [5, 20], both ∈ [3, 15], only_B ∈ [5, 20], neither ∈ [2, 10]
2. Compute total = only_A + both + only_B + neither
3. Randomly choose subtype to hide:
   - find_neither: Hide neither, show total + other three
   - find_both: Hide both, show total + cardinalities n(A), n(B), n(neither)
   - find_only_a: Hide only_A, show total + other three + n(A∩B)
   - find_total: Hide total, show all four regions
4. Return: { id, difficulty: "hard", type: "venn2", subtype, prompt, answer }
```

### ExtraHard (3-set Venn)
```
1. Generate all 8 regions (7 non-empty + neither):
   abc, ab_only, ac_only, bc_only, a_only, b_only, c_only, neither ← random values
2. Compute aggregates:
   n(A) = a_only + ab_only + ac_only + abc
   n(B) = b_only + ab_only + bc_only + abc
   n(C) = c_only + ac_only + bc_only + abc
   n(A∩B) = ab_only + abc
   n(A∩C) = ac_only + abc
   n(B∩C) = bc_only + abc
   total = sum of all 8 regions
3. Randomly choose subtype to hide:
   - find_abc: Given n(A), n(B), n(C), n(A∩B), n(A∩C), n(B∩C), total in union; find n(A∩B∩C)
   - find_neither: Given all region counts except neither; find neither
   - find_a_only: Given n(A), n(A∩B), n(A∩C), n(A∩B∩C); find n(A only)
   - find_total: Given all regions; find total
4. Return: { id, difficulty: "extrahard", type: "venn3", subtype, prompt, answer }
```

## 7. Answer Checking Logic

**Easy (list):**
- Parse user input: Remove braces `{}`, split by comma
- Special case: "empty" or "" → empty set
- Sort both expected and user answers, compare element-by-element

**Medium/Hard/ExtraHard (numeric):**
- Parse user input as integer
- Compare `userNum === expectedNum`

## 8. Registration

1. **Home `allApps` array:** `{ key: 'sets', name: 'Sets', subtitle: 'Union, intersection, Venn diagrams', color: 'blue' }`
2. **Home `modeMap` object:** `sets: SetsApp`
3. **`CUSTOM_PUZZLES` array:** `{ key: 'sets', name: 'Sets' }`
4. **`fetchQuestionForType` URL map:** `sets: '${API}/sets-api/question?difficulty=${difficulty}'`
5. **`getPromptForType` switch:** Returns `q.prompt` (pre-built by server)
6. **CustomApp `handleSubmit` switch:** POSTs to `/sets-api/check` with `userAnswer` string
7. **CustomApp `renderInputs` switch:** Text input with placeholder "e.g. {1, 3, 5} or empty"
8. **Vite proxy:** `/sets-api` → `http://127.0.0.1:4000`

## 9. Adaptive Mode

**Enable Adaptive Mode:**
User toggles `isAdaptive` checkbox in setup phase.

**Adaptive Score Mechanics:**
- Initial: `adaptScore = 0`, `adaptScoreRef.current = 0`
- On correct answer: `adaptScore = Math.min(3, adaptScore + 0.25)`
- On wrong answer: `adaptScore = Math.max(0, adaptScore - 0.35)`
- Score always maintained in ref for `effectiveDiff()` to use synchronously

**Difficulty Progression:**
```javascript
const ADAPT_DIFFS = ['easy', 'medium', 'hard', 'extrahard']
function adaptiveLevel(score) {
  return ADAPT_DIFFS[Math.min(Math.max(Math.round(score), 0), 3)]
}
```

Maps adaptScore to difficulty:
- [0.0, 0.5) → easy (round to 0)
- [0.5, 1.5) → medium (round to 1)
- [1.5, 2.5) → hard (round to 2)
- [2.5, 3.0] → extrahard (round to 3)

**Progress Bar UI:**
```javascript
function adaptivePct(score) {
  return Math.min(100, Math.max(0, (score / 3) * 100))
}
```
- Linear gradient bar: 0% (green) → 100% (purple)
- Width updates reactively with adaptScore changes
- Displayed only during playing phase

**effectiveDiff() Function:**
```javascript
const effectiveDiff = () => isAdaptive ? adaptiveLevel(adaptScoreRef.current) : difficulty
```
- Used in `loadQuestion()` to determine API difficulty query parameter

**Level Display:**
- Pill shows current level: "Easy", "Medium", "Hard", "Extra Hard"
- Color matches ADAPT_COLORS gradient
- Only shown if `isAdaptive === true`

**Completion Message:**
- Shows "Reached level: [level name]" in final score screen if adaptive mode used

## 10. State Machine

```
setup ──[Start Quiz]──→ playing ──[Last Q answered]──→ finished
                           │                              │
                           │ ←──[loadQuestion on qNum]────┘ (Play Again resets to setup)
```

## 11. Generation Guarantees

All questions are generated algorithmically on-the-fly:
- **Easy:** 10–15 universe sizes × 3–6 A size × 3–6 B size × 5 operations = 10,000+ unique problems
- **Medium:** 20 n(A) values × 20 n(B) values × 10 n(A∩B) values × 3 subtypes = 12,000+ unique problems
- **Hard:** 16 only_A values × 13 both values × 16 only_B values × 9 neither values × 4 subtypes = 74,880+ unique problems
- **ExtraHard:** 8 base regions × 5 multipliers × 4 subtypes = effectively unlimited
