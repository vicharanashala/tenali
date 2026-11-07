# In-Browser Whisper Voice Recognizer for Numbers 1 to 10

Implements in-browser speech recognition exclusively using:
- **Library:** `@huggingface/transformers`
- **Model:** [`gradient-queen/whisper-tiny-indian-digits-final`](https://huggingface.co/gradient-queen/whisper-tiny-indian-digits-final)
- **Architecture:** [Hugging Face Transformers.js React Tutorial](https://huggingface.co/docs/transformers.js/en/tutorials/react)

---

## Files Overview

| File | Purpose |
|---|---|
| `worker.js` | Dedicated Web Worker loading `@huggingface/transformers` pipeline and executing neural inference off the main thread. |
| `useWhisperVoice.js` | Custom React hook managing the Web Worker lifecycle, downloading progress (0-100%), Web Audio 16kHz capture, and transcription. |
| `PushToTalkButton.jsx` | Kid-friendly tactile Push-to-Talk button with glowing pulse ring, live audio wave animation, and heard digit badge. |
| `PushToTalkButton.css` | Styling for tactile button and animations. |
| `WhisperVoiceRecognizer.jsx` | All-in-one drop-in component combining hook and button for 1-line integration. |
| `phoneticResolver.js` | Multilingual & Indian phonetic regex resolver converting text to digits `1` to `10`. |
| `audioChunkRecorder.js` | Web Audio API 16kHz mono PCM recorder that releases microphone hardware locks cleanly. |

---

## Quick Integration Examples

### 1. In `NumberTracingApp.jsx`

```jsx
import React from 'react';
import { useWhisperVoice, PushToTalkButton } from './WhisperVoiceRecognizer.jsx';
// OR: import WhisperVoiceRecognizer from './WhisperVoiceRecognizer.jsx';

export function NumberTracingApp() {
  const handleVoiceNumber = (num, rawText) => {
    console.log(`Detected number: ${num} from speech: "${rawText}"`);
    // Your number selection / tracing logic:
    // selectNumber(num);
  };

  const whisper = useWhisperVoice({
    onNumberDetected: handleVoiceNumber,
    onTextHeard: (text) => console.log('Raw speech heard:', text)
  });

  return (
    <div className="tracing-app">
      {/* Subheader Voice Control */}
      <div className="voice-bar">
        <PushToTalkButton
          whisperState={whisper}
          label="Hold to Say Number (1-10)"
        />
      </div>

      {/* Rest of Tracing UI */}
    </div>
  );
}
```

---

### 2. In `SpaceMazeAdventure.jsx`

```jsx
import React from 'react';
import { WhisperVoiceRecognizer } from './WhisperVoiceRecognizer.jsx';

export function SpaceMazeAdventure() {
  const handleMazeNumber = (detectedNum, rawText) => {
    console.log(`Space Maze heard number: ${detectedNum}`);
    // Match against current station:
    // if (detectedNum === currentCountingStep) { advanceStation(); }
  };

  return (
    <div className="space-maze-game">
      {/* Counting HUD Voice Pill */}
      <WhisperVoiceRecognizer
        onNumberDetected={handleMazeNumber}
        label="Hold to Say Station Number"
      />
    </div>
  );
}
```

