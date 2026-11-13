import React from 'react';
import { useWhisperVoice } from './useWhisperVoice.js';
import { PushToTalkButton } from './PushToTalkButton.js';

export function WhisperVoiceRecognizer({
  onNumberDetected,
  onTextHeard,
  label = 'Click to Speak (Say 1..10)',
  className = ''
}) {
  const whisperState = useWhisperVoice({
    onNumberDetected,
    onTextHeard
  });

  return React.createElement(
    'div',
    { className: `whisper-voice-recognizer-wrapper ${className}` },
    React.createElement(PushToTalkButton, {
      whisperState: whisperState,
      label: label
    })
  );
}

export default WhisperVoiceRecognizer;

