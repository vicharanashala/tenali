# Numbers 1 to 10 Component Package

Comprehensive Numbers 1 to 10 module featuring Hopscotch Mat, Learn & Trace, Space Maze, and in-browser ONNX Whisper speech recognition.

---

## Architecture & Files

| File | Purpose |
|---|---|
| `Numbers1To10App.jsx` | Main activity container managing tab navigation, hopscotch gameplay, and universal mic test. |
| `Numbers1To10App.css` | Complete responsive styling, hopscotch mat grid, and celebration animations. |
| `NumberTracingApp.jsx` | Tab 1: Interactive drawing canvas for learning digits 1 to 10 with voice feedback. |
| `SpaceMazeAdventure.jsx` | Tab 3: Space Maze Adventure gamified practice with voice commands. |
| `useWhisperVoice.js` | Module-level shared Web Worker speech recognition hook with late-completion recovery. |
| `PushToTalkButton.jsx` | Push-to-Talk HUD button with dynamic SVG audio wave VU meter and custom prompts. |
| `PushToTalkButton.css` | Styling for push-to-talk button and live audio wave animations. |
| `audioChunkRecorder.js` | Web Audio API 16kHz mono PCM recorder with real-time RMS decibel analytics. |
| `phoneticResolver.js` | Indian English phonetic regex resolver mapping spoken words to numbers `1` to `10`. |
| `numbers1To10Data.js` | Number stroke guides, hints, and counting object configurations. |
| `confettiHelper.js` | Confetti celebration animation utility. |
| `index.js` | Clean barrel export file exporting `Numbers1To10App` as default. |

---

## Runtime Model & Worker Assets
- **Web Worker**: Served directly at `/whisper-worker.js` from `client/public/whisper-worker.js`.
- **Model Weights**: Quantized ONNX weights served directly at `/models/whisper_indian_digits/` from `client/public/models/whisper_indian_digits/`.
