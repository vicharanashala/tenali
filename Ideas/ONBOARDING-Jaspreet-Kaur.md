# Onboarding Document: Jaspreet Kaur
GitHub: Jaspreet-j 
Date: 29-10-2026 
Issue I plan to work on: TwinHuntApp: add a Next Round button so a game can get past round 1 #492

1. What is Tenali?
Tenali is a website where students practise maths. Most questions are made by the server each time they are asked, so a student can keep practising a topic without running out of questions or seeing the same one twice. A few kinds of content are saved files instead, for example the 991 files in chitragupta/questions/ and the riddles in server/riddles/riddles.json. After each answer the difficulty changes: it goes up when the student is doing well and comes down when they are struggling. If a student gets stuck, they can ask for a step-by-step solution to the question they just saw.

It is meant for school-age learners, mostly for topics like arithmetic, algebra, geometry and trigonometry, and it also has games, a multiplayer mode and a few bonus quizzes. The problem it tries to solve is that a lot of online maths practice is either a fixed worksheet or just tells you "wrong" without helping you understand why. Tenali tries to give unlimited practice at a suitable level, with an explanation available whenever it is needed.

The name comes from Tenali Raman, an Indian scholar known for his wit and clever reasoning.

2. What do I understand by Tenali (as a system)?
I think of Tenali as three groups of people and a handful of main parts.

Who uses it

Learners. They can play as a guest or log in. Logging in lets the site save progress, coins and badges.
Maintainers and admins. They review pull requests, decide what gets merged and can see admin-only pages such as the proctoring dashboard.
Contributors. They add puzzle types, fix bugs and improve tooling.
The main parts

Puzzle types. Each puzzle type has two routes on the server: one that returns a question and one that checks an answer. If the check request includes solve: true, the server also returns a worked explanation, which comes from generateExplanation() in server/explanations.js.
Adaptive difficulty. Each quiz keeps a score between 0 and 3. Correct answers raise it, wrong answers lower it, and the score decides which difficulty band (easy, medium, hard, extra hard) the next question uses.
Progress. Progress is saved in MongoDB, and the server controls it. For example, a topic moves from locked to bronze, silver and gold as the learner improves.
Battle Arena. Two players see the same question and the first correct answer wins. This uses Socket.IO for real-time updates.
Code playground. A page where code can be run in many languages.
Login and security. JWT tokens, bcrypt password hashing, rate limiting and a CORS allowlist.
How one question travels through the system

The learner opens a topic on the home grid, and the React app shows the quiz screen for it.
The screen asks the Express server for a question and sends the current difficulty.
The server's route for that topic builds a question, using the difficulty to choose number ranges.
The learner submits an answer, and the screen sends it to the topic's check route.
The server replies with right or wrong, and with an explanation if the learner asked for one.
The screen updates the score and asks for the next question.
Where it runs. tenali.fun is one nginx server in front of several apps. This repository's main branch is served under tenali.fun/summership/, and the bare tenali.fun address is served by a different branch called tenali-root. That means a merged pull request here does not appear on the main address.

3. Current state of the repository: what has been done so far
Tech stack

Frontend: React 19 and Vite, with libraries such as framer-motion, Three.js, mafs and face-api.js.
Backend: Node.js 20 or newer, Express 5, Mongoose and Socket.IO.
Database: MongoDB, with an in-memory fallback if no database is available.
Authentication: JWT with bcrypt.
Testing: the server uses vitest and supertest, and the issue descriptions say its 124 tests run in about 1.5 seconds.
What already works

More than ninety generated puzzle routes across arithmetic, algebra, geometry, calculus, statistics and more.
Adaptive difficulty and solve-for-explanation on the server.
Battle Arena, Detective Agency, Guided Learning Journey, Random Mix and Custom Lesson.
Concept Playgrounds exist as code (conceptPlay.js and conceptSession.js), but according to issue #293 they are not mounted yet, so they do not run in the app today.
Proctoring, coins and badges, language switching and the code playground.
Bonus content: a vocabulary trainer and a general-knowledge quiz bank.
How the code is organised, and what is changing

The server has been split into route files under server/routes/, and the home-screen tiles are described in client/src/features/tiles.js.
client/src/App.jsx is still one huge file, and it causes most of the merge conflicts (issue #181). Issues #234 to #240 plan to move its components out into their own files.
The home screen is being reorganised into seven cards, and the Linear Algebra lab is being moved to its own branch (issues #224 to #228).
How contributions work. CONTRIBUTING.md says every pull request must close an existing issue with Closes #N, must have no merge conflicts with main, and must never show hardcoded fallback data as if it were real data. New contributors must submit this onboarding document into the Ideas/ folder before their first pull request.

4. Gaps observed in the code
Gap 1: Files from server/node_modules are tracked by git
Where: the server/node_modules/ folder.
What: When I switched branches in my local copy, git listed many files such as server/node_modules/qs/... and server/node_modules/iconv-lite/... as modified. Git only reports changes for files it tracks, so these dependency files appear to have been committed to the repository.
Why it matters: Installed packages normally stay out of the repository because they are rebuilt by npm install. Tracking them makes the repository larger and fills pull requests with changes that have nothing to do with the real work. It can also cause extra merge conflicts, and any pull request that includes them will be rejected.
Gap 2: App.jsx is a merge-conflict bottleneck
Where: client/src/App.jsx.
What: The component definitions, the modeMap and the routing of paths all live in this one very large file, so many contributors edit it at the same time.
Why it matters: CONTRIBUTING.md rejects any pull request that has a merge conflict. So a contributor can lose a correct change because of how the file is organised, not because of anything wrong in their code. The file is also hard to read and review.
Gap 3: Lint errors are not enforced
Where: the client lint setup, eslint-suppressions.json, and issues #263 to #277.
What: CONTRIBUTING.md says client lint is currently non-blocking in CI. The issue list mentions more than a thousand existing lint errors spread across many files.
Why it matters: Because a lint failure cannot stop a pull request, new errors can be added without anyone noticing, and the backlog keeps growing.
Gap 4: Dependencies between issues are hidden in the text
Where: the bodies of issues #209, #224 and #225.
What: These issues say "Depends on: ..." in the last paragraph of the description, but the Relationships field on the issue page says "None yet". Searching for unassigned issues with no linked pull request, which is how I started, still shows blocked issues. For example, #225 depends on #224, which depends on #220, #221 and #222.
Why it matters: A new contributor can pick an issue that cannot be started yet, and only find out after reading the whole description. It wastes the contributor's time and may lead to work that the maintainers cannot merge.
5. Ideas for the project
Idea 1: Stop tracking server/node_modules
What: Add node_modules/ to .gitignore and remove the tracked files from the repository index.
Why: It would make pull requests cleaner and the repository smaller, and it would remove a source of avoidable conflicts.
How: Check that .gitignore covers node_modules, then run git rm -r --cached server/node_modules and commit the result. This should be agreed with a maintainer first, because it touches many files.
Idea 2: Make issue dependencies visible
What: Use GitHub's "blocked by" relationships, or a blocked label, in addition to the text in the description.
Why: A contributor looking for a free issue could filter out blocked ones straight away.
How: For each issue that has a "Depends on" line, set the relationship in the sidebar and add a label. This can be done by the maintainers once, and kept up to date as issues close.
Idea 3: Baseline the lint errors so only new ones fail
What: Record the current lint errors and make CI fail only when a pull request adds new ones.
Why: It stops the problem getting worse without requiring all existing errors to be fixed first (this matches the goal of issue #277).
How: The repository already uses eslint-suppressions.json. Once that file reflects the current state, the lint step in CI can be made blocking.
6. My contribution
Issue: #492, TwinHuntApp: add a Next Round button so a game can get past round 1.

The problem as I understand it. In the Twin Hunt game, a player who answers round 1 gets stuck. The code that was supposed to move the game on automatically (useAutoAdvance in client/src/App.jsx) was switched off on purpose, and Twin Hunt has no button to replace it. So the next round never starts and "Game complete!" can never be reached. The same happens after a round that times out.

What I plan to do

Pull the latest main and create a new branch, for example fix/twinhunt-next-round. App.jsx is the file that causes most merge conflicts, so I will sync with upstream/main right before I start and again before I push.
Open client/src/App.jsx and find TwinHuntApp. The line numbers in the issue may have moved, so I will search for advanceRef and renderFeedback(feedback, isCorrect) and confirm they look the way the issue describes.
Add the button the issue describes just after renderFeedback(feedback, isCorrect). It shows only after the round is revealed and calls the existing advanceRef.current(). The label is "Next Round", and it becomes "Finish" on the last round. I will not change anything else in the file.
How I will check that Twin Hunt now moves past round 1

Start the client with npm run dev, open Twin Hunt and start a game with 3 rounds.
Answer round 1. The button should appear after the answer and should not be visible before it.
Click "Next Round". Round 2 should appear, with the symbols enabled again.
Answer rounds 2 and 3. On the last round the button should say "Finish", and clicking it should show "Game complete!" with the score.
Start another game and let a round run out of time. The button should appear and move the game on in the same way.
Run cd client && npm run lint and npx vite build, and cd server && npm test, to make sure nothing else broke.
Pull request: One small PR, with Closes #492 in the description, a short before and after description of what I saw in the browser, and no other files changed. The issue also notes that useAutoAdvance is switched off in 39 places and only Twin Hunt has been checked. I will mention in the PR that other apps may have the same gap, but I will not change them there, because the issue is only about Twin Hunt.

Where I am now. I have read the README, CONTRIBUTING.md and the descriptions of the issues I looked at, and I have set up my fork and a branch for this document. I have not started the changes for #492. The maintainers said they will assign it to me once this document is updated, and I will begin on a separate branch after that. This onboarding pull request stays as this one file.
