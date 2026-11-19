import React from 'react';

/**
 * Narrative clue card rendered cleanly beneath the room illustration.
 */
export default function StoryNarrative({
  logHeader = 'CLUE LOG',
  clueCode = '',
  storyText = '',
}) {
  return (
    <aside className="story-narrative" aria-label="Room story clue">
      <div className="story-narrative-header">
        <span className="story-narrative-log">
          <span aria-hidden="true">📜</span>
          <span>{logHeader}</span>
        </span>
        {clueCode && <span className="story-narrative-clue">{clueCode}</span>}
      </div>
      <blockquote className="story-narrative-quote">“{storyText}”</blockquote>
    </aside>
  );
}