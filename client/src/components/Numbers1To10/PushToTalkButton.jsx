import React from 'react';
import './PushToTalkButton.css';

/**
 * PushToTalkButton (Kid-Friendly Voice HUD Button)
 *
 * Click to Open Mic (Start Listening)
 * Real-time detection auto-resolves when speech is heard.
 * Features live reactive sound wave VU meter responding to user's voice in real time.
 *
 * @param {Object} props
 * @param {Object} props.whisperState - The object returned by useWhisperVoice()
 * @param {string} [props.label="Click to Speak (Say 1..10)"]
 */
export function PushToTalkButton({
  whisperState,
  label = 'Click to Speak (Say 1..10)',
  listeningPrompt = null
}) {
  if (!whisperState) return null;

  const {
    modelStatus,
    loadingProgress,
    isRecording,
    isTranscribing,
    audioLevel = 0,
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

  // Determine if mic is actively receiving sound
  const isHearingSound = isRecording && audioLevel > 0.04;

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
        React.createElement('span', {
          key: 'dot',
          className: 'mic-active-dot',
          style: isHearingSound ? { background: '#4ade80', boxShadow: '0 0 14px #4ade80' } : undefined
        }),
        React.createElement(
          'div',
          { key: 'wave', className: 'ptt-sound-wave' },
          [0, 1, 2, 3, 4].map((i) => {
            const barHeight = isHearingSound
              ? Math.round(5 + Math.min(1, audioLevel * (i % 2 === 0 ? 1.6 : 2.4)) * 14)
              : 6;
            return React.createElement('span', {
              key: `bar-${i}`,
              style: {
                height: `${barHeight}px`,
                backgroundColor: isHearingSound ? '#4ade80' : '#ffffff',
                transition: 'height 0.08s ease, background-color 0.15s ease'
              }
            });
          })
        ),
        React.createElement(
          'span',
          { key: 'rec' },
          listeningPrompt || (isHearingSound ? '🎙️ Hearing voice... Keep talking!' : '🔴 Listening... Say a number from 1 to 10!')
        )
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
    errorMessage && !isRecording && !isTranscribing && React.createElement(
      'span',
      { style: { color: '#fca5a5', fontSize: '0.85rem' } },
      `⚠️ ${errorMessage}`
    )
  );
}

export default PushToTalkButton;
