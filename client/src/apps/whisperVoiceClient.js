/**
 * whisperVoiceClient.js
 *
 * Backward-compatible bridge pointing to the separate voiceRecognizer.js file.
 * All voice recognition and Whisper streaming logic lives in ./numbers1To10/voiceRecognizer.js
 */
export * from './numbers1To10/voiceRecognizer.js';
export { default } from './numbers1To10/voiceRecognizer.js';
