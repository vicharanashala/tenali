Onboarding Document: Jaspreet Kaur

GitHub: Jaspreet-j Date: 22-10-2026 Issue I plan to work on: #228 (Confirm the API contract test still passes after the removal)

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