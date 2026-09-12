# Developer Guide: Extending Conceptual MCQ Quizzes to New Topics

The **Conceptual MCQ Variants** feature is built with a highly extensible, generic architecture. Adding conceptual checkpoints to any of the other 40+ topics in Tenali requires **zero code changes**. You only need to seed a new JSON question database.

Follow this step-by-step guide to add conceptual questions for a new mathematical topic.

---

## Step 1: Determine the Topic ID
Identify the internal ID of the topic you want to extend. This ID corresponds to the topic's route prefix. You can find the full list of registered topic IDs in the proxy section of:
`client/vite.config.js`

*Examples of Topic IDs:*
- `sets` (Sets)
- `prob` (Probability)
- `stats` (Statistics)
- `vectors` (Vectors)
- `matrix` (Matrices)
- `integration` (Integ)

---

## Step 2: Create the JSON Database File
Create a new JSON file named `<topic_id>.json` inside the conceptual questions directory:
📂 `conceptual/questions/`

### JSON Structure & Schema
Populate the file with an array of question objects following this exact schema:

```json
[
  {
    "id": 2001,
    "topic": "vectors",
    "question": "What is the magnitude of a unit vector?",
    "options": [
      "0",
      "1",
      "Infinity",
      "It depends on the direction"
    ],
    "correctAnswer": "B",
    "correctAnswerText": "1",
    "explanation": "A unit vector is defined as a vector of length/magnitude 1."
  }
]
```

### Schema Requirements:
1. **`id` (integer):** Must be a unique integer across all conceptual questions (recommend starting at `2000` for new topics).
2. **`topic` (string):** Must match the `<topic_id>` exactly.
3. **`question` (string):** The question prompt that will be shown to the user.
4. **`options` (array of strings):** Must contain exactly **4 choices** representing options A, B, C, and D.
5. **`correctAnswer` (string):** Must be one of `"A"`, `"B"`, `"C"`, or `"D"`.
6. **`correctAnswerText` (string):** The plaintext representation of the correct choice (used to construct fallback checkmarks).
7. **`explanation` (string):** A detailed explanation showing the pedagogical steps or definitions. This is displayed if the student answers incorrectly or clicks **Solve**.

---

## Step 3: Restart the Backend Server
The backend loads and indexes all JSON databases into memory at startup. Restart the server by running:

```powershell
node index.js
```

---

## Technical Flow (How it works under the hood)
Once the JSON file is created and the server is restarted:
1. **Startup Indexing:** The server reads `server/index.js`, registers `<topic_id>`, and indexes your questions.
2. **Milestone Detection:** During an adaptive quiz on the client, the `makeQuizApp` builder detects a milestone (e.g. Question 5 or a stage promotion) and hits `/conceptual-api/question?topic=<topic_id>`.
3. **MCQ Render:** The frontend receives the question payload, recognizes the `options` array, and automatically switches the input interface from text boxes to interactive MCQ option cards with keyboard listener bindings.
4. **Automatic Fallback:** If the JSON database is missing or empty, the frontend automatically falls back to requesting a standard calculation question for that milestone, maintaining app stability.
