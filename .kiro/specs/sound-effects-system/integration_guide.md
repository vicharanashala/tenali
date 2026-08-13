# Tenali Sound Effects System - Integration Guide

Welcome to the Sound Effects System! The old Web Audio API implementation (`audioContext.js`) has been deprecated. All sound effects across Tenali are now managed through the Howler.js-based `QuizSoundContext`.

## Getting Started

To add sound effects to your React component, you need to import the `useQuizSound` hook from the central context.

```jsx
import { useQuizSound } from '../context/QuizSoundContext';
```

Inside your functional component, destructure the methods you need:

```jsx
export default function MyMiniApp() {
  const { 
    playCorrect, 
    playWrong, 
    playSubmit, 
    playQuizComplete,
    playClick,
    playMilestone,
    loadCategory
  } = useQuizSound();

  // ...
}
```

## Available Methods

### 1. `playCorrect()`
Plays the standard correct chime (`/sounds/essential/correct.mp3`).
- **Dynamic Pitching**: The context automatically tracks the user's streak. The pitch increases slightly for every consecutive correct answer.
- **Milestones**: If the streak hits a multiple of 3, the milestone sound will play automatically.

### 2. `playWrong()`
Plays the standard wrong buzzer (`/sounds/essential/wrong.mp3`).
- Resets the internal streak counter back to 0.

### 3. `playClick()`
Plays a snappy interface click (`/sounds/essential/click.mp3`).
- **Note**: A `GlobalClickSound` component already catches standard clicks on `<button>` and `<a>` elements across the app. You only need to call this manually for custom canvas/SVG click interactions.

### 4. `playSubmit()`
Plays a distinct interaction sound (`/sounds/essential/submit.wav`). Useful for final form submissions or level transitions.

### 5. `playQuizComplete()`
Plays a celebratory arpeggio (`/sounds/standard/quiz-complete.wav`). Call this when the user finishes a full quiz or level set.

### 6. `loadCategory(categoryName)`
Asynchronously loads non-essential sound categories (like `standard`, `visual-lab`) to save bandwidth.

```jsx
useEffect(() => {
  loadCategory('standard'); // Preloads coin, levelup, streak sounds
}, [loadCategory]);
```

## Example: Adding Sound to an Evaluation Function

```jsx
const handleCheck = (userAnswer, expectedAnswer) => {
  if (userAnswer === expectedAnswer) {
    playCorrect(); // Streak is handled automatically!
    setScore(s => s + 1);
    nextQuestion();
  } else {
    playWrong();
    setLives(l => l - 1);
  }
};
```

## Global UI Muting

The system respects the global mute setting stored in `localStorage` under `tenali-sound-effects`.
Users can toggle this via the `<SoundToggle />` button in the top right of the application. All `useQuizSound()` methods internally check `isMuted` before playing, so you **do not** need to check `isMuted` manually before calling `playCorrect()`.
