import React from 'react';

/**
 * SpeechBubble Component
 * Renders Speech / Mind Cloud bubble for Tenali and Student avatars
 */
export default function SpeechBubble({
  text,
  isDetective = false
}) {
  return (
    <div className={`tenali-speech-cloud-wrapper ${isDetective ? 'detective-cloud' : ''}`}>
      <div className="speech-cloud-box">
        <p className="speech-cloud-text">
          {text || "I am thinking of a secret concept..."}
        </p>
      </div>

      {/* Thought circles leading down to avatar head */}
      <div className="thought-circle-top" />
      <div className="thought-circle-bottom" />
    </div>
  );
}
