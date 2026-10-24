/**
 * StudyModeToggle.jsx — the Explore / Focus switch in the app shell.
 *
 * Sits in the top bar next to the theme toggle and is visible on every
 * screen, including inside a quiz — a student who realises mid-revision
 * that they're being pulled around shouldn't have to navigate home to calm
 * the app down.
 *
 * Flipping to Focus with no topics chosen yet doesn't ask anything here;
 * it just sets the mode, and <FocusHome> shows the picker. That keeps the
 * toggle a toggle rather than something that opens a modal over whatever
 * the student was doing.
 */

import { useStudyMode, EXPLORE, FOCUS } from '../lib/studyMode'
import { logEvent } from '../lib/masteryClient'
import './StudyMode.css'

export default function StudyModeToggle({ inline = false }) {
  const { studyMode, focusTopics, enterFocusMode, exitFocusMode } = useStudyMode()
  const isFocus = studyMode === FOCUS

  const select = (next) => {
    if (next === studyMode) return
    if (next === FOCUS) enterFocusMode()
    else exitFocusMode()
    logEvent('study_mode_changed', null, { to: next, topicCount: focusTopics.length })
  }

  return (
    <div
      className={`study-mode-toggle${isFocus ? ' is-focus' : ''}${inline ? ' is-inline' : ''}`}
      role="radiogroup"
      aria-label="Study mode"
      title={isFocus
        ? 'Focus Mode — extras hidden so you can revise'
        : 'Explore Mode — the full platform'}
    >
      <button
        type="button"
        role="radio"
        aria-checked={!isFocus}
        className={`study-mode-option${!isFocus ? ' is-active' : ''}`}
        onClick={() => select(EXPLORE)}
      >
        <span aria-hidden="true">🧭</span> <span className="study-mode-label">Explore</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={isFocus}
        className={`study-mode-option${isFocus ? ' is-active' : ''}`}
        onClick={() => select(FOCUS)}
      >
        <span aria-hidden="true">🎯</span> <span className="study-mode-label">Focus</span>
      </button>
    </div>
  )
}
