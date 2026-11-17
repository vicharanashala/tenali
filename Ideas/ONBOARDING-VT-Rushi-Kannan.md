# Tenali Contributor Onboarding Document

**Contributor:** V T Rushi Kannan  
**GitHub:** [Rushikannan2](https://github.com/Rushikannan2)  
**Repository:** [github.com/vicharanashala/tenali](https://github.com/vicharanashala/tenali)  
**Date:** October 2026

---

## 1. What is Tenali?

Tenali is a web-based learning platform focused mainly on mathematics. From going through the project, I found that it is not just a normal question-and-answer website. The learning activities are interactive, and students can practise different types of mathematical problems and move through levels as they improve.

A student can work on mathematical puzzles, answer questions, get immediate feedback and, in several modules, see explanations or continue to the next level. The repository also contains features such as the Battle Arena and a code playground, so learning is not limited to one type of quiz.

What I found interesting is the attempt to make mathematics practice feel more like an activity than a static worksheet. Different modules have their own interaction and progression logic, which also means that different parts of the frontend have different state-management problems to deal with.

---

## 2. What do you understand by Tenali as a system?

I understand Tenali as a web application with a React frontend, a Node backend and MongoDB for persistent data.

The frontend is built with React and Vite. A lot of the main navigation logic is handled in `client/src/App.jsx`, where the application decides which module or screen to show. Other learning experiences are implemented in separate components and exercise files.

A typical learning flow is:

student opens a module → a question is selected or generated → the student interacts with it → the answer is checked → feedback is shown → progress is updated → the student moves to the next question or level.

For the regular question-based modules, the frontend communicates with endpoints such as `/topic-api/question` to get questions and `/topic-api/check` to check answers. Progress is also handled through API calls, while some individual modules keep their own local state and browser storage for things such as level progression.

The backend also contains authentication and persistent user data. I found bcrypt-based password handling, JWT authentication and MongoDB/Mongoose usage.

Different modules have different state and interaction patterns. For example, the Battle Arena uses Socket.IO for multiplayer communication. Schema Classifier has level unlocking and browser navigation. Equation-to-Story has a timer, drag-and-drop interaction and answer feedback. EquationCraftingLab works with equation blocks that the student selects and combines.

While tracing these modules, I noticed that small state-management decisions can affect what a student sees even when the final state eventually becomes correct. That was the main connection between my repository exploration and the issues I chose to investigate.

---

## 3. Current State of the Repository — What Has Been Done So Far

The repository is divided mainly into a `client/` frontend and a `server/` backend.

The frontend uses React and Vite and contains a large number of learning modules. The areas I explored most closely were the Vachana exercises, EquationCraftingLab, Schema Classifier and Equation-to-Story. There are also shared UI components, authentication screens, the Battle Arena and the code playground.

The backend contains the server setup, question and answer-checking APIs, authentication, progress handling and other application routes. MongoDB is used through Mongoose for persistent application data.

The project has different types of user-facing flows. Some are regular question-based quizzes, while others have custom interfaces and their own state transitions. The Vachana modules, for example, have an overview page followed by level-specific exercises.

For development and validation, the client has ESLint and a Vite build setup. The repository also contains Vitest-related configuration and server-side tests. At the moment, the client does not have a normal `test` script in `client/package.json`, so I did not add a new testing framework just for the issues I was investigating.

I also checked the contribution workflow before making changes. New contributors need to submit the onboarding document before their first contribution PR, and the actual code contributions are expected to be tied to existing GitHub issues.

---

## 4. Gaps Observed in the Code

The three main gaps I investigated are existing GitHub issues #263, #262 and #261. I checked the affected source files directly rather than relying only on the older error counts written in the issue titles.

### Issue #263 — `client/src/EquationCraftingLab.jsx`

**Where:** `EquationCraftingLab.jsx`, mainly the crucible update and selection logic around `crucible` and `selectedIds`.

**What:** The original code used a `useEffect` watching `crucible` to automatically select both blocks when exactly two blocks remained. When the crucible reached that state, the browser could briefly render two blocks with no selected block before the effect updated `selectedIds`.

In the browser trace this appeared as a short `2 blocks / 0 selected` state followed by `2 / 2`.

The final state was correct, but the intermediate state can make the interface look inconsistent to the student.

The same file also contained redundant regular-expression escapes in `SAFE_MATH_REGEX` and lint issues related to the affected React code.

**Why it matters:** The issue is not only about making ESLint output cleaner. The `useEffect` behavior can create a visible intermediate state, so changing the state flow needs to preserve the actual interaction of the lab.

### Issue #262 — `client/src/vachana/exercises/EquationToStory.jsx`

**Where:** `EquationToStory.jsx`, mainly the quiz timer lifecycle and the temporary animation ID handling.

**What:** The original implementation stored the timer interval handle in state and then mutated it. When the student left the level and entered it again, another interval could be created while the previous one was still active.

That meant more than one timer could run at the same time. In the original behavior, restarting the level could make the timer run roughly twice as fast.

The file also contained a purity-related use of `Date.now() + Math.random()` for temporary animation IDs.

**Why it matters:** The timer is part of the exercise itself. If two intervals are running, the student can lose time much faster than intended, and timer work can also continue after the student has already left the level.

### Issue #261 — `client/src/vachana/exercises/SchemaClassifier.jsx`

**Where:** `SchemaClassifier.jsx`, mainly the option derivation and level/navigation logic.

**What:** The original implementation updated schema options through an effect, even though the options could be derived from the active level.

The level/navigation logic could also allow a locked level to render briefly before the student was redirected to an allowed level when opening a locked URL directly.

I also found that the option order could change during the first render/update cycle. The options were correct, but the order could briefly change while the page was settling.

**Why it matters:** A locked level should not appear even briefly, and an option list should remain stable after it is displayed. These are small UI behaviors, but they are visible to the student.

---

## 5. Ideas for the Project

### Idea 1 — Reduce state that only mirrors other state

**What:** Derive values directly from existing state where possible instead of keeping another state value and synchronizing it with an effect.

**Why:** Mirrored state creates extra update paths and makes it easier for the UI to briefly show an outdated value. This was visible in the Schema Classifier and EquationCraftingLab issues.

**How:** For values such as options that depend only on `activeLevel`, calculate them during render or with `useMemo`. For crucible selection, update the selection as part of the action that changes the crucible rather than waiting for another render/effect cycle.

### Idea 2 — Treat timer handles as resources with a clear lifecycle

**What:** Keep timer handles separate from normal UI state and give them an explicit start/cleanup lifecycle.

**Why:** A timer handle does not represent something the UI needs to render. Keeping it in state makes restart and cleanup behavior harder to reason about and can allow duplicate intervals.

**How:** Store the interval handle in a ref, start it when the level starts, and clear it when the level ends or the component unmounts. This is the approach I used while preparing the fix for #262.

### Idea 3 — Separate accessibility decisions from URL synchronization

**What:** Keep the decision about whether a level can be opened separate from the code that updates browser history.

**Why:** Mixing these responsibilities can allow an inaccessible level to render for a short time before navigation is corrected.

**How:** Clamp the active level during initialization, then use history replacement only to keep the browser URL synchronized with the already-valid application state.

More generally, I think the larger exercise components would benefit from clearer ownership of state. The issues I found showed that a small effect or mutable value can have consequences that are not obvious when looking only at the final screen.

---

## 6. Your Contribution

During my onboarding, I investigated three existing frontend issues: #263, #262 and #261. I read the affected components, examined the related ESLint suppressions, traced the relevant state and event flows, and reproduced the reported behavior in browser-based checks.

I prepared separate fixes for the three issues so that they can be tested and reviewed independently.

### #263 — EquationCraftingLab

I moved the crucible selection update into the code path that changes the crucible instead of synchronizing it through the previous `useEffect`. I also removed the redundant regular-expression escapes and the obsolete file-specific ESLint suppressions.

I verified the affected file with:

`npx eslint src/EquationCraftingLab.jsx`

and built the client successfully with:

`npm run build`

This is the fix I am submitting as my first issue-linked contribution PR.

### #262 — EquationToStory

I changed the timer handle and temporary float ID counter to refs so that they are treated as mutable resources rather than React state.

I also checked the timer behavior across level restarts and exit/re-entry cases in the browser.

This fix is prepared separately and is intended to be my second issue-linked contribution after #263.

### #261 — SchemaClassifier

I changed the question options to be derived from the active level, moved the locked-level correction into initialization, and separated browser history synchronization from the state-setting logic.

I checked the affected behavior in the browser, including direct navigation to a locked level and the stability of option ordering.

This fix is also prepared separately and is intended to be my third issue-linked contribution.

At this stage, #263 is ready for submission as the first PR. The fixes for #262 and #261 are prepared separately and will be submitted as their own issue-linked PRs so that each issue can be reviewed independently.