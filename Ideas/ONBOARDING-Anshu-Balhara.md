# Onboarding Document: Anshu Balhara

GitHub: Curious-chemist

Entry number: 2024bbc1004

Topic: Gas Lab: Particles to Probability (Chemistry x Maths simulation)

## 1. What is Tenali?

Tenali is a website that lets school students practise maths. The server makes questions every time, so a student can keep practising without missing questions or seeing the same question again. The difficulty level rises when the learner answers correctly and falls when the learner answers incorrectly. A step‑by‑step solution shows up whenever the learner needs help.

Tenali is made for school-age learners, teachers and student developers who want to join a full‑stack education project. Many online maths sites give a worksheet that says "wrong" and never explains why. Tenali offers practice at the right level and gives explanations when the learner asks.

The name comes from Tenali Raman, a scholar famous for his wit and clear logic.

## 2. What do you understand by Tenali (as a system)?

**Users.** Learners who are guests or logged in, maintainers who review and merge pull requests and contributors who add puzzles, fixes and labs.

** parts.**

- **Puzzle types:** Each type has a web address that gives a question and another address that checks the answer. When the check request includes `solve: the server also returns a worked explanation.

- **Adaptive difficulty:** Each quiz keeps a score that goes up with answers and down with incorrect answers and this score decides how hard the next question will be.

- **Progress and mastery:** Stored in MongoDB. Controlled by the server.

- **Battle Arena:** Two players receive the question through Socket.IO and the first player to answer correctly wins.

- **Code playground, Detective Agency, Concept Playgrounds and the Guided Journey:** These are learning areas.

- **Login:** Uses JWT tokens and passwords hashed with bcrypt.

How a single question moves through the system. The learner clicks a topic tile on the home grid. The React app sends a request to the Express server for a question. Includes the current difficulty. The server builds the question based on that difficulty. The learner submits an answer, the app calls the check route and the server replies with whether the answer was right or wrong, along with an explanation if the learner asked for it. The app then updates the score. Requests the next question.

Deployment. The `main` branch is served at tenali.fun/summership/, while the plain tenali.fun domain is served by a branch called `tenali-root`. Therefore, a merged pull request does not show up on the address right away.

## 3. Current State of the Repository. What Has Been Done So Far

**Tech stack.** Frontend: React 19 and Vite, plus libraries such as framer-motion, Three.js and mafs. Backend: Node.js, Express 5, Mongoose and Socket.IO. Database: MongoDB with a fallback. Authentication: JWT and bcrypt. Testing: Vitest for both the client and the server.

**Implemented features.** Over 90 generated puzzle routes covering arithmetic, algebra, geometry, calculus and statistics. Adaptive difficulty, step‑by‑step explanations, Battle Arena, Detective Agency, Guided Learning Journey, Random Mix and Custom Lesson, Concept Playgrounds, proctoring, coins and badges, internationalization and a multi‑language code playground.

**Organisation.** The server is divided into route files in `server/routes/`. Home‑screen tiles are registered in `client/src/features/tiles.js`. `Client/src/App.jsx` remains a large file. Contribution rules are in CONTRIBUTING.md: each pull request must close an existing issue with `Closes #N`, must not conflict with `main` and must not display hardcoded fallback data as if it were data.

## 4. Gaps Observed in the Code

**Gap 1: `App.jsx` is a merge‑conflict bottleneck.**

- **Where:** `client/src/App.jsx`.

- **What:** Components, `modeMap` and routing for features are all in one huge file. The README calls it than 70,000 lines long and when I tried to open it on GitHub, the page did not load because it was too large.

- Why it matters: CONTRIBUTING.md rejects any PR that has a merge conflict, so a correct change can disappear when many people edit the file. When a file cannot even be seen in the browser, it becomes very hard for anyone to read or review it.

**Gap 2: `modeMap` still lives inside `App.jsx`.**

- Where: In `client/src/App.jsx`, the inline `modeMap` appears as described in the READMEs "Add a New Puzzle" section.

- What: The tiles data already exist in `client/src/features/tiles.js`,. The mapping that links a tile key to its component is still written inline.

- Why it matters: Each new feature requires editing `App.jsx`, which leads to the merge conflicts discussed in Gap 1.

**Gap 3: BKT. Is not wired into mastery and docs overstate it.**

- Where: In `server/lib/bkt.js` and the mastery code (see issues #289 and #292).

- What: The README states that `lib/bkt.js` exists but is not integrated into the session flow and issue #292 notes that the documentation overstates BKT while spaced repetition is not driven by BKT.

- Why it matters: Readers receive a view of how mastery is calculated and behavior that is not wired in cannot be safeguarded by tests.

**Gap 4: proxy entries in the Vite config.**

- Where: In `client/vite.config.js` (see issue #226).

- What: Issue #226 points out that three proxy entries are stale.

- Why it matters: The README instructs contributors to add each API prefix to this list; stale entries therefore make it harder to identify which prefixes are valid.

## 5. Ideas for the Project

**Idea 1: Move `modeMap` into a registry file.**

- What: Place the key-to-component mapping inside a module located next to `tiles.js`.

- Why: New features would no longer modify `App.jsx`, which reduces merge conflicts.

- How: Build a registry module that uses imports, then swap the inline map for a single import, keeping the change minimal as requested in the README.

**Idea 2: Add a test that checks prefixes against server routes.**

- What: A test that compares the `*-api` prefixes listed in `vite.config.js` with the routes defined under `server/routes/`.

- Why: It would automatically detect entries such as those mentioned in Gap 4.

- How: Read both lists within a Vitest test and flag a failure if they differ.

**Idea 3: A Chemistry x Maths "Concept Lab" for probability.**

- What: A lab that lets learners see random particles form a Maxwell-Boltzmann speed curve and compare the resulting pressure with the Ideal Gas Law.

- Why: The `data-chance` category contains interactive labs and this lab visually connects probability, calculus and chemistry.

- How: Create a self-contained React component in its folder, register it via a tile entry in `tiles.js` and add a single line in `modeMap`.

## 6. Your Contribution

I built **Gas Lab: Particles to Probability**, a prototype simulation that bridges chemistry and maths.

- A live 2D ideal-gas simulation featuring sliders for temperature, volume and particle count.

- A speed histogram drawn against the Maxwell-Boltzmann curve, f(v) = (v/kT)·e^(−v²/2kT).

- Pressure measured from wall impacts, compared to the predicted value from P·A =

- Boyles Law recorder, a target-pressure challenge, badges and a short quiz.

- A React version of the simulation (`ChemMathsLab.jsx`) crafted to be self-contained.

Prototype repo: https://github.com/Curious-chemist/Molecule-mischief

Live demo: https://curious-chemist.github.io/Molecule-mischief/

I used AI tools to help build and write this prototype. The next step is to run it inside Tenali, add a tile entry in `tiles.js`, register it in `modeMap` and link an issue so the PR can close it.
