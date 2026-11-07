import React from 'react';
import './PushToTalkButton.css';

/**
 * PushToTalkButton (Minimal Kid-Friendly Voice HUD Button)
 *
 * Click to Open Mic (Start Listening)
 * Real-time detection auto-resolves when speech is heard.
 * Click again to manually close and submit.
 *
 * @param {Object} props
 * @param {Object} props.whisperState - The object returned by useWhisperVoice()
 * @param {string} [props.label="Click to Speak (Say 1..10)"]
 */
export function PushToTalkButton({
  whisperState,
  label = 'Click to Speak (Say 1..10)'
}) {
  if (!whisperState) return null;

  const {
    modelStatus,
    loadingProgress,
    isRecording,
    isTranscribing,
    heardText,
    lastDetectedNumber,
    errorMessage,
    toggleRecording
  } = whisperState;

  const handleClick = (e) => {
    e.preventDefault();
    toggleRecording();
  };

  const getButtonClass = () => {
    if (modelStatus === 'loading') return 'whisper-ptt-btn loading';
    if (modelStatus === 'error') return 'whisper-ptt-btn error';
    if (isRecording) return 'whisper-ptt-btn recording';
    if (isTranscribing) return 'whisper-ptt-btn transcribing';
    return 'whisper-ptt-btn muted';
  };

  return React.createElement(
    'div',
    { className: 'whisper-ptt-container' },
    React.createElement(
      'button',
      {
        type: 'button',
        className: getButtonClass(),
        onClick: handleClick,
        disabled: modelStatus === 'loading' || isTranscribing,
        title: isRecording
          ? 'Mic is LISTENING! Speak clearly or click to stop.'
          : 'Click to speak number name'
      },
      modelStatus === 'loading' && [
        React.createElement('span', { key: 'spin', className: 'ptt-spinner' }),
        React.createElement('span', { key: 'txt' }, `Loading Whisper AI (${loadingProgress}%)...`)
      ],
      modelStatus !== 'loading' && isRecording && [
        React.createElement('span', { key: 'dot', className: 'mic-active-dot' }),
        React.createElement(
          'div',
          { key: 'wave', className: 'ptt-sound-wave' },
          React.createElement('span', { key: 'w1' }),
          React.createElement('span', { key: 'w2' }),
          React.createElement('span', { key: 'w3' })
        ),
        React.createElement('span', { key: 'rec' }, '🔴 Listening... Say it aloud!')
      ],
      modelStatus !== 'loading' && isTranscribing && [
        React.createElement('span', { key: 'spin', className: 'ptt-spinner' }),
        React.createElement('span', { key: 'txt' }, 'Processing speech...')
      ],
      modelStatus !== 'loading' && !isRecording && !isTranscribing && [
        React.createElement('span', { key: 'icon', style: { fontSize: '1.15rem' } }, '🎙️'),
        React.createElement('span', { key: 'lbl' }, label)
      ]
    ),
    heardText && !isTranscribing && React.createElement(
      'div',
      { className: 'ptt-heard-badge' },
      React.createElement('span', null, isRecording ? '👂 Hearing: ' : '🗣️ Heard: '),
      React.createElement('em', null, `"${heardText}"`),
      lastDetectedNumber !== null && React.createElement(
        'span',
        { style: { color: '#6ee7b7', marginLeft: '4px' } },
        `➔ ${lastDetectedNumber} ⭐`
      )
    ),
    errorMessage && !isRecording && React.createElement(
      'span',
      { style: { color: '#fca5a5', fontSize: '0.85rem' } },
      `⚠️ ${errorMessage}`
    )
  );
}

export default PushToTalkButton;
