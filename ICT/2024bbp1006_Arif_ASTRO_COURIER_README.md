# Astro Courier — HB302 ICT in Education Project

**Astro Courier** is an interactive physics and mathematics activity in the Tenali learning platform. Learners help a lunar rover reach a beacon by reasoning about the relationship between **distance, speed, and time**.

## The learning idea

Instead of practising isolated calculations, learners work through short rover missions. Each mission gives two motion values and asks them to find the third:

- **Speed** = distance ÷ time
- **Distance** = speed × time
- **Time** = distance ÷ speed

The five-mission set rotates through all three question types. The values change between missions, so learners practise the underlying relationship rather than memorising one answer.

## What learners can do

1. Read a short lunar delivery mission and work out what is missing.
2. Run or pause the rover animation, or scrub the mission clock with the slider.
3. Watch the rover move along the route toward its beacon.
4. Choose an answer and receive immediate feedback with the calculation and a short explanation.
5. See a score at the end of the five missions and start another set.

The route visualisation gives learners a concrete model of motion. The formula prompt connects that model to the calculation, and the feedback explains why the selected answer is correct.

## Learning objectives

By the end of the activity, a learner should be able to:

- identify which of distance, speed, or time is unknown;
- select the matching relationship between the three quantities;
- calculate the missing value using whole-number examples;
- relate elapsed time to the rover’s progress along a route.

## Design ideas for a course presentation

The activity follows a **predict → explore → calculate → reflect** pattern. To make the learning visible in a demonstration, ask a learner to predict the answer before pressing **Run rover**, then compare the prediction with the animation and the worked feedback.

Possible next steps for a larger version of the project:

- Add a **mission designer** where learners choose speed and time, then predict the distance before launching.
- Add a **compare two rovers** challenge that introduces faster/slower rates using two animated routes.
- Add optional **hint cards** that reveal one step at a time instead of showing the full formula immediately.
- Add an accessible **low-motion mode**, keyboard controls, and a text description of the route animation.
- Add a teacher view that summarises which of the three relationships learners find most difficult.

These are extension ideas; the current activity includes the animated route, play/pause and timeline controls, three question types, feedback, and a five-mission score.

## Where it is in the app

- Home-screen tile registry: `client/src/features/tiles.js`
- Puzzle screen and mode routing: `client/src/App.jsx`
- Puzzle mode key: `astro-courier`
- Open the local app and choose **🚀 Astro Courier** from the puzzles grid, or navigate to `/?view=puzzles` and search for “Astro Courier”.

## Run locally

From the repository root:

```bash
cd client
npm install
npm run dev
```

Open the local Vite URL shown in the terminal and select the Astro Courier tile. Progress submission uses Tenali’s existing authenticated progress hook when a learner is signed in; playing the missions themselves does not require a sign-in.

## Suggested classroom use

Use the activity after introducing the speed–distance–time relationship. Have learners state which value is unknown and name the operation before they choose an answer. After each mission, invite them to explain how the rover’s movement supports their calculation. The activity is intended as practice and formative feedback; it does not replace teacher assessment.
