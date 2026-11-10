# Tenali Onboarding — Sonali Bharti

## 1. What is Tenali?

Tenali is an adaptive mathematics learning platform designed to make learning mathematics more interactive and engaging. It provides students with different types of mathematical puzzles, practice activities, step-by-step explanations, and opportunities to learn through exploration.

The platform aims to move beyond traditional question-and-answer-based learning. Instead of only presenting questions and checking answers, it encourages students to understand mathematical concepts, experiment with problems, and improve through practice.

Tenali also includes features such as adaptive difficulty and real-time multiplayer activities. These features aim to make learning more personalised and engaging for students with different learning levels.

## 2. What do you understand by Tenali (as a system)?

I understand Tenali as a complete learning system consisting of a frontend, backend, database, and communication mechanisms.

The main parts of the system are:

- **Students:** Users who interact with mathematical puzzles, practice activities, and learning features.
- **Frontend:** The React-based interface through which users access the platform, attempt questions, and view results.
- **Backend:** The server handles application requests and provides the APIs required by the frontend.
- **Database:** MongoDB, accessed through Mongoose, stores application data.
- **Real-time communication:** Socket.IO supports real-time communication features such as multiplayer interactions.

A typical learning interaction can be understood as follows:

1. A student opens a learning activity on the frontend.
2. The frontend requests the required question or activity from the backend.
3. The backend processes the request and returns the required data.
4. The student attempts the question and submits an answer.
5. The application processes the answer and displays the relevant result or feedback.
6. The student continues practising and learning through the available activities.

The system combines learning content, interactive components, APIs, and stored data to provide a connected learning experience.

## 3. Current State of the Repository — What Has Been Done So Far

From the repository README, package configuration, and project structure, I understand that Tenali has an established frontend and backend with several learning features.

### Technology stack

**Frontend**
- React 19
- Vite 8
- Axios for HTTP requests
- Socket.IO Client for real-time communication
- Vitest and React Testing Library for testing

**Backend**
- Node.js
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens for authentication
- bcryptjs for password hashing
- Vitest and Supertest for testing

### Existing features

According to the project README, the platform includes:

- 93 puzzle types across 69 topic areas.
- Algorithmically generated mathematical questions.
- Adaptive difficulty.
- Real-time multiplayer learning.
- Step-by-step explanations.
- Interactive learning activities.
- A code playground.
- Authentication-related functionality.

The README also describes a learning approach based on progressive disclosure and learning by playing. The intended flow is to understand a concept, interact with it, discover patterns, practise, and test understanding.

### Development and code quality

The repository includes ESLint for frontend code quality and automated CI workflows.

I contributed to PR #432, which improved the frontend linting workflow by making the lint job blocking in CI and using an ESLint suppression baseline for existing violations.

## 4. Gaps Observed in the Code

While reviewing the repository and running the frontend lint command, I observed the following areas that could be improved.

### 4.1 React Hook dependency warnings

**Where:** `client/src/App.jsx`, along with other frontend files such as `client/src/GeometryApp.jsx`, `client/src/Curiosity.jsx`, and `client/src/components/ScribbleCanvas.jsx`.

**What I observed:**

Running `npm run lint` from the `client` directory reported 121 warnings and 0 errors. Many warnings were related to missing dependencies in React hooks such as `useEffect`, `useCallback`, and `useMemo`.

**Why it matters:**

React hooks depend on values and functions used inside them. Missing dependencies can sometimes cause components to use outdated values or behave unexpectedly when state changes. These warnings should be reviewed carefully rather than ignored.

### 4.2 Large frontend components

**Where:** `client/src/App.jsx` and `client/src/ContrastChallengeApp.jsx`.

**What I observed:**

The lint output showed Babel deoptimisation notices because these files exceed 500 KB. The lint output also reported many hook dependency warnings in `App.jsx`.

**Why it matters:**

Very large components can be difficult to understand, test, debug, and maintain. Changes in one part of a large component may also make it harder to understand the impact on other parts.

### 4.3 Existing lint warnings need gradual improvement

**Where:** `client/eslint-suppressions.json` and the frontend source files.

**What I observed:**

The project uses an ESLint suppression baseline to account for existing lint violations. The current lint command completes with 0 errors, but it still reports 121 warnings.

**Why it matters:**

A suppression baseline helps prevent existing issues from blocking new development, but it should not become a permanent replacement for fixing the underlying code-quality problems. Warnings should be reviewed and reduced gradually.

## 5. Ideas for the Project

Based on the observations above, I would suggest the following improvements.

### 5.1 Gradually reduce React Hook warnings

**What:** Review and fix React Hook dependency warnings in smaller groups of components.

**Why:** Correct hook dependencies help make component behaviour more predictable and improve code maintainability.

**How:** Start with smaller components, review the variables and functions used inside each hook, and add the correct dependencies or restructure the logic where necessary. Test the affected functionality after each change.

### 5.2 Break large components into smaller modules

**What:** Refactor very large components such as `App.jsx` into smaller, reusable components.

**Why:** Smaller components are easier to understand, debug, test, and maintain.

**How:** Identify logically separate sections of the existing component and move them into appropriately named components or modules. Keep the existing behaviour unchanged and validate the application after each refactoring step.

### 5.3 Keep the lint suppression baseline under review

**What:** Regularly review the ESLint suppression baseline and remove suppressions when the corresponding issues are fixed.

**Why:** This will help prevent old code-quality issues from remaining unnoticed.

**How:** Fix existing warnings incrementally, run the lint command, and update the suppression baseline only when necessary. Continue ensuring that newly introduced lint errors are caught by CI.

### 5.4 Improve automated testing of learning activities

**What:** Expand automated tests for important learning interactions, including question submission, answer validation, and progression between questions.

**Why:** These are important parts of the student experience. Automated tests can help detect regressions when features are modified.

**How:** Identify important learning flows, write focused tests for expected behaviour, and run the tests whenever related code changes.

## 6. Your Contribution

My contribution to Tenali includes working on repository code quality and the frontend linting workflow.

### PR #432 — CI: baseline existing client lint errors

**Pull request:** https://github.com/vicharanashala/tenali/pull/432

The purpose of this contribution was to improve how frontend linting is handled in the continuous integration workflow.

The changes included:

- Removed `continue-on-error: true` from the client lint job so that lint failures can block CI.
- Updated the frontend lint script to use the ESLint suppression baseline.
- Updated the contribution guidelines to explain that frontend linting is blocking in CI and contributors should fix new lint errors.
- Refreshed the existing suppression baseline by removing obsolete suppressions.
- Removed duplicate proxy configuration entries from `client/vite.config.js`.

This contribution helped establish a stricter linting workflow while allowing the team to manage existing lint issues without blocking all development.

Through this work, I gained practical experience with Git branches, repository configuration, ESLint, CI workflows, reviewing code changes, and contributing through a pull request.

I also learned that improving an existing codebase requires understanding its current structure and behaviour before making changes.

---

**Conclusion**

Exploring Tenali and contributing to its repository has helped me understand how a real-world learning platform is structured and maintained. I would like to continue contributing by improving code quality, testing, maintainability, and the overall learning experience for students.
