# Contributor Onboarding - Tarang Rajvanshi



## 1. What is Tenali?



Tenali is an adaptive mathematics learning platform designed to make math practice more interactive and engaging. It generates questions algorithmically instead of depending only on a fixed question bank, so learners can get a large variety of practice questions.



The platform also supports adaptive difficulty, where the difficulty of questions can change based on the learner's performance. Along with normal practice, Tenali provides features such as multiplayer battles, step-by-step solutions, guided learning, and interactive concept-based learning.



From a technical point of view, the project has a React/Vite frontend and a Node.js/Express backend, with MongoDB support and an in-memory fallback. The backend provides APIs for generating and checking different types of mathematical questions.





## 2. What do you understand by Tenali (as a system)?



I understand Tenali as a client-server based learning system where the frontend provides the learner interface and the backend handles question generation, validation, learning logic, and APIs.



The learner interacts with the React frontend to select a topic or learning mode and answer questions. The frontend communicates with backend APIs to get questions and submit answers. The server contains different route modules for different mathematical topics and generates many questions dynamically instead of relying only on stored questions.



The system also has logic for adaptive difficulty, so the learner's performance can influence the difficulty of subsequent questions. Other parts of the system handle authentication, progress, explanations, multiplayer functionality, and learning features.



For my contribution, I focused on the server-side basic arithmetic lab. In this part of the system, `server/labRoutes.js` generates different types of basic arithmetic questions through an API endpoint. This helped me understand how a generated question moves from backend logic to the API response that the learner receives.



## 3. Current State of Repository



The repository is an active full-stack project with a large number of mathematics topics and learning features. The main codebase is divided into the frontend and backend, with the `server` directory containing the Express backend and API route implementations.



The backend contains separate route files for different mathematical topics and learning features. The repository also contains automated tests using Vitest, Supertest, and Node's testing utilities. This provides a base for verifying backend behavior when making changes.



The basic arithmetic lab is implemented in `server/labRoutes.js`. It exposes an API for generating different basic arithmetic question templates, including missing-number, true/false, matching-expression, fact-family, and greater/smaller questions.



While investigating the repository, I found that the true/false generator had a logical edge case where the generated statement could remain mathematically true even when the returned answer was `False`. I used the existing route and testing structure to reproduce and verify this behavior before making a change.



## 4. Gaps Observed in Code



### Gap 1: True/False question generation could produce an incorrect False question



\*\*File:\*\* `server/labRoutes.js`



\*\*Area:\*\* Basic Arithmetic Lab â†’ `true\_false` question generation.



The generator decides whether a statement should be correct using `isCorrect`. When the statement is intended to be false, the code creates a different value by adding a random offset.



The previous implementation used:



```js

prod + randomInt(-2, 2) || (prod + 1)

```



The problem is that `randomInt(-2, 2)` can return `0`. When that happens, `prod + 0` is still equal to `prod`, so the displayed statement remains mathematically true even though the answer returned by the API is `False`.



For example, if the product is `6` and the random offset is `0`, the generated value becomes `6`. The question can therefore become:



`Is 3 Ã— 2 = 6?`



while the API says the answer is `False`.



This is a correctness issue because the question shown to the learner contradicts the answer supplied by the system.



The same type of random-offset logic was also present in the division branch, so both branches needed to ensure that the false statement actually differs from the correct answer.



### Gap 2: The edge case was not covered by a regression test



\*\*File:\*\* `server/routes/\_\_tests\_\_/`



Before my change, I did not find an existing route-level regression test specifically checking that a question marked `False` by the basic arithmetic generator is mathematically false.



This makes the zero-offset edge case easy to miss during future changes.



A regression test is useful here because it checks the externally visible API behavior rather than only checking an internal implementation detail.



## 5. Ideas for Project



Based on my initial investigation, I think Tenali could benefit from stronger validation and regression coverage for algorithmically generated questions.



### 1. Add invariant-based tests for generated questions



Generated questions should always satisfy basic mathematical invariants. For example, if an API returns `False`, the statement displayed to the learner should actually be false. Similar checks can be added for other generated question types.



### 2. Expand regression tests for edge cases



Randomized question generators can have edge cases that do not appear during normal testing. Tests could specifically cover boundary values, zero offsets, minimum and maximum difficulty values, and other cases where generated values may become invalid.



### 3. Separate question-generation logic from route handling



Some generation logic is currently located directly inside route handlers. Moving reusable generation functions into separate modules could make the code easier to test independently and make future mathematical validation easier.



### 4. Continue auditing generated math questions



The same approach used for TEN-MATH-015 could be applied to other puzzle generators to identify cases where the generated question, expected answer, and actual mathematical result might disagree.



## 6. Your Contribution



I worked on \*\*TEN-MATH-015 - True Statement Can Be Marked as False\*\* in the Basic Arithmetic Lab.



I investigated the true/false generation logic in `server/labRoutes.js` and reproduced the edge case where the random offset could be `0`. Because of this, a question intended to be `False` could contain the correct mathematical result while the API still returned `False`.



I fixed this by introducing a `randomNonZeroInt()` helper so that the offset used to create a false statement can never be zero. I applied the fix to both the multiplication and division true/false generation branches.



I also added a regression test in:



`server/routes/\_\_tests\_\_/labRoutes.test.js`



The test calls the actual Basic Arithmetic Lab API and verifies that questions marked `False` contain mathematically false statements.



I verified the new regression test with Vitest and it passed successfully:



\* Test Files: 1 passed

\* Tests: 1 passed



This contribution helped me understand the backend route structure, generated-question logic, API-level testing, Git workflow, and the importance of testing edge cases in randomized code.
