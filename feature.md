# Tenali Mind Reader (Recreational Math Concept Guessing Game)

This document provides a comprehensive technical reference for the **Tenali Mind Reader** feature, an Akinator-style recreational learning game integrated into the Tenali platform. It serves as a living context file (`feature.md`) that documents both backend and frontend architecture, endpoints, database schemas, UI components, states, reward tiers, and the mathematical inference algorithm.

---

## 1. Directory Structure & Key Files

- **Knowledge Base**: [mindReaderKB.js](file:///d:/Projects/Tenali/server/mindReaderKB.js) - Contains the questions (`QUESTIONS`) and mathematical concepts (`CONCEPTS`) dictionary.
- **Backend Endpoints & Logic**: [index.js](file:///d:/Projects/Tenali/server/index.js) (under `TENALI MIND READER (MVP API)`) - Implements Express routes, optional JWT auth, rating calculation, and cheating protection.
- **Database Models & Schema**: [auth.js](file:///d:/Projects/Tenali/server/auth.js) - Integrates the user profile properties and the `MindReaderAnalytic` schema.
- **Frontend App Component**: [App.jsx](file:///d:/Projects/Tenali/client/src/App.jsx) (inside `MindReaderApp` and `TenaliAvatar`) - Handles state management, cabinet reward selection, game loops, API requests, and SVG avatar rendering.
- **Inference Simulations / Tests**: [test_mindreader.js](file:///d:/Projects/Tenali/server/test_mindreader.js) - Simulates game play and verifies the accuracy of the probability computation.

---

## 2. Knowledge Base & Inference Engine

### A. The Core Dictionary ([mindReaderKB.js](file:///d:/Projects/Tenali/server/mindReaderKB.js))
- **Questions (`QUESTIONS`)**: A set of 16 structural binary questions (e.g. `q_geometry`: *"Is it related to geometry...?"*, `q_number`: *"Is it related to basic arithmetic...?"*).
- **Concepts (`CONCEPTS`)**: A list of 15 curriculum topics, including:
  `Prime Number`, `HCF (Highest Common Factor)`, `LCM (Lowest Common Multiple)`, `Square Root`, `Equivalent Fractions`, `Percentage`, `Linear Equation`, `Quadratic Equation`, `Matrix`, `Vector`, `Right Triangle`, `Pythagoras' Theorem`, `Venn Diagram`, `Mean`, `Probability`.
- Each concept maps each question to a truth value:
  - `true`: Concept exhibits the trait.
  - `false`: Concept does not exhibit the trait.
  - `null` (or omission): Trait is unknown/partially applicable.

### B. Mathematical Inference Algorithm
The probability update is triggered on every game turn (next question or guess) by the client calling `POST /api/mindreader/next`:

1. **Candidate Filtering**: Active concepts are initialized, excluding any concepts that were already predicted in the current session but rejected by the user (`incorrectPredictions`).
2. **Probability Scaling**:
   - Each active concept starts with an initial weight of `1.0`.
   - Iterating over the user's answer history (`yes`, `no`, `dontknow`):
     - If the user answered **`yes`**:
       - Expected `true` answers are scaled by `0.98`.
       - Expected `false` answers are set to `0` (eliminated).
       - Null/unspecified values are scaled by `0.5`.
     - If the user answered **`no`**:
       - Expected `true` answers are set to `0` (eliminated).
       - Expected `false` answers are scaled by `0.98`.
       - Null/unspecified values are scaled by `0.5`.
     - **`dontknow`** does not scale weights (multiplier `1.0`).
3. **Normalization**: The remaining concepts are normalized so their probabilities sum to `1.0` and sorted by highest confidence.
4. **Prediction Condition**: If only **one** candidate remains, or the top concept's confidence is **`>= 0.75`**, Tenali returns a **Royal Gamble** prediction payload.
5. **Entropy-Based Question Selection**: If confidence is below `0.75`, the engine decides which question to ask next:
   - For all unasked questions, it calculates the cumulative weighted probability of a `yes` vs. `no` answer among the active concepts.
   - It selects the question that minimizes `|yesWeight - noWeight|` (splitting the remaining concept pool closest to 50/50, maximizing information gain).

---

## 3. Backend Endpoints (API Reference)

### `POST /api/mindreader/next`
Evaluates history and computes either the next question or the final concept prediction.
- **Request Body**:
  ```json
  {
    "history": [{"questionId": "q_geometry", "answer": "yes"}],
    "incorrectPredictions": ["Right Triangle"]
  }
  ```
- **Response (Next Question)**:
  ```json
  {
    "nextQuestion": { "id": "q_triangle", "text": "Does it involve triangles or trigonometric ratios?" },
    "confidence": 0.45,
    "remainingCount": 5,
    "isFinalQuestion": false
  }
  ```
- **Response (Prediction / Royal Gamble)**:
  ```json
  {
    "prediction": {
      "id": "pythagoras_theorem",
      "name": "Pythagoras' Theorem",
      "description": "...",
      "definingCharacteristics": ["...", "..."],
      "recommendations": { "related": [], "prerequisites": [], "exercises": [] }
    },
    "confidence": 0.88,
    "remainingCount": 1
  }
  ```

### `GET /api/mindreader/config`
Retrieves constant threshold parameters for the game client.
- **Response**:
  ```json
  {
    "dailyLimit": 999999,
    "confidenceThreshold": 0.75,
    "startingRoyalChances": 3,
    "maxQuestions": 20
  }
  ```

### `GET /api/mindreader/profile`
Retrieves user stats. Resets the daily game counter if the date changes. Supports optional authenticated user context (via JWT headers).
- **Response**:
  ```json
  {
    "mrr": 1020,
    "mindReaderGamesToday": 2,
    "unlockedSkins": ["Classic Tenali", "Royal Robes"],
    "equippedSkin": "classic",
    "equippedTitle": "Novice Reader",
    "authenticated": true,
    "username": "sudarshan"
  }
  ```

### `POST /api/mindreader/equip`
Sets the equipped avatar skin and user title.
- **Request Body**:
  ```json
  {
    "skin": "royal",
    "title": "Royal Trickster"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "equippedSkin": "royal",
    "equippedTitle": "Royal Trickster"
  }
  ```

### `POST /api/mindreader/end`
Processes game stats, modifies Mind Reader Rating (MRR), saves analytics, and returns curriculum recommendations.
- **Request Body**:
  ```json
  {
    "outcome": "win" | "loss",
    "concept": "Prime Number",
    "questionsCount": 8,
    "predictionsMade": ["Right Triangle", "Prime Number"],
    "scope": "curriculum"
  }
  ```
- **Cheat Detection (Trickery)**:
  If the `predictionsMade` history contains the target `concept` that the player eventually claims they were thinking of, it implies the player falsely answered "No, that is incorrect!" to Tenali's guess earlier but picked it as their victory choice. The engine sets `cheated = true` in response and awards **0 MRR points**.
- **Response**:
  ```json
  {
    "mrr": 1020,
    "mindReaderGamesToday": 3,
    "unlockedSkins": ["Classic Tenali"],
    "equippedSkin": "classic",
    "equippedTitle": "Novice Reader",
    "authenticated": true,
    "cheated": false,
    "recommendations": {
      "related": ["Composite Number", "Prime Factorization"],
      "prerequisites": ["Factors and Multiples"],
      "exercises": ["Chapter 1 Lesson 1 Practice"]
    }
  }
  ```

### `GET /mindreader`
Serves the compiled frontend build catch-all router mapping.

---

## 4. Database Schema ([auth.js](file:///d:/Projects/Tenali/server/auth.js))

### User Properties
Persistent fields tracked under the standard `User` model:
- `mindReaderGamesToday`: `{ type: Number, default: 0 }` (number of matches played today).
- `lastMindReaderGameDate`: `{ type: String, default: "" }` (used to reset daily limit).
- `mrr`: `{ type: Number, default: 1000 }` (Mind Reader Rating rating points).
- `unlockedSkins`: `[{ type: String }]` (default array contains `["Classic Tenali"]`).
- `equippedSkin`: `{ type: String, default: "classic" }`.
- `equippedTitle`: `{ type: String, default: "Novice Reader" }`.

### Analytics Schema (`MindReaderAnalytic`)
Records telemetry data for each game run:
```javascript
const MindReaderAnalyticSchema = new mongoose.Schema({
  outcome: { type: String, required: true }, // 'win' | 'loss'
  concept: { type: String, default: 'Unknown' },
  questionsCount: { type: Number, default: 0 },
  scope: { type: String, default: 'curriculum' },
  predictionsMade: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});
```

---

## 5. Frontend & UI Architecture (`client/src/App.jsx`)

The feature is rendered inside the React component `MindReaderApp`. It uses raw styling defined in CSS with fluid animations.

### A. Game Phases
1. **`setup`**: Initial lobby. Presents the game rules in a storytelling style ("Let's play a little game. Think of one mathematical idea. Don't tell me..."). Displays the concept grid list, current MRR pill, and the **"I've got one."** start button.
2. **`pregame-thinking`**: An intermediate transitional phase triggered when the user starts the game. Renders a closed-eyes Tenali avatar and an animated visual music wave bars container simulating "thinking music" for a duration of 2.5 seconds. Meanwhile, the backend API is fetched in the background to hide server network latency.
3. **`playing`**: Actively questioning. Displays:
   - **Royal Chances (Hearts)**: Starts at 3. Reversing a prediction (saying "No" to a guess) consumes 1 heart.
   - **Risk/Confidence Meter**: A premium glowing slider representation (`○────────────●`) positioned above the thought cloud. The slider dot and label dynamically shift color and intensity based on Tenali's confidence: Calm (0%-15%, blue glow), Curious (16%-35%, green glow), Thinking (36%-55%, yellow glow), Confident (56%-75%, orange glow), and Royal Confidence (76%-100%, pulsing purple glow).
   - **Question Box**: Displays the text of the next question with **Yes**, **No**, and **Don't Know** buttons.
   - **Royal Gamble**: Initiated when Tenali guesses a concept. Prompts the user with a confirmation dialog.
4. **`gameover`**: Displays whether the user won (successfully stumped Tenali) or lost (Tenali guessed it).
   - Shows ratings modifications (+20 for win, -5 for loss).
   - Renders recommendations based on the target concept.
   - Renders a dropdown on victory asking the user to self-declare what concept they actually thought of (triggering cheat verification).

### B. Tenali Avatar Component (`TenaliAvatar`)
Renders an inline dynamic SVG vector character whose clothing and expressions change in response to state and equipment:
- **Skins**:
  - `classic`: Orange turban, dark red robe.
  - `royal`: Gold turban, blue robe, ruby jewel.
  - `scholar`: Silver turban, grey robe, emerald jewel.
- **Expressions**:
  - `thinking`: Eyes narrowed, flat mouth.
  - `confident`: Smirking mouth, raised left eyebrow.
  - `gamble`: Wide eyes with white glints, mouth open in determination.
  - `victory` (player wins): Surprised eyes, gaping mouth, and blue sweat drop element (`sweat-drip-anim`).
  - `loss` (player loses): Sad squinting eyes, open mouth.
  - `cheated`: Wry smirk expression matching the catch-out dialogue.
  - `closed-eyes`: Eyes closed with curved arches, rendering during the pre-game anticipation phase.

### C. Rewards Cabinet Tiers
Unlocked based on user MRR thresholds:

| Item Name | Type | Unlock Threshold | Details |
|---|---|---|---|
| **Novice Reader** | Title | 1000 MRR | Default title |
| **Royal Trickster** | Title | 1100 MRR | Mid-tier rank |
| **Court Genius** | Title | 1250 MRR | High-tier rank |
| **Mind Emperor** | Title | 1400 MRR | Maximum rank |
| **Classic Tenali** | Skin | 1000 MRR | Court orange attire |
| **Royal Robes** | Skin | 1150 MRR | Palace gold & royal blue |
| **Sage Scholar** | Skin | 1300 MRR | Wise silver & emerald details |

### D. Client-Side Fallback (Local Storage)
For unauthenticated guests, or when MongoDB is offline, data persists locally via:
- `tenali-mindreader-mrr`
- `tenali-mindreader-skin`
- `tenali-mindreader-title`
- `tenali-mindreader-games-today`
- `tenali-mindreader-last-date`
