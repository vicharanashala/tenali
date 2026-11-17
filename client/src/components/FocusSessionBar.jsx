/**
 * FocusSessionBar.jsx — the slim bar shown inside a quiz while Focus Mode
 * is on.
 *
 * Without it, a student revising three topics has to go back to the board
 * between every one, and nothing on the quiz screen says they are in
 * Focus Mode at all. The bar answers "where am I in my list?", shows the
 * study timer, and moves straight on to the next topic.
 *
 * It sits bottom-centre, clear of the reflection-journal button
 * (bottom-right) and the monster pop-up (bottom-left).
 */

import { getTopicLabel } from '../lib/prerequisiteGraph'
import { useStudyMode } from '../lib/studyMode'
import { useFocusTimer, formatClock } from '../lib/focusTimer'
import { logEvent } from '../lib/masteryClient'
import './StudyMode.css'

export default function FocusSessionBar({ mode, onGo, onBoard }) {
  const { focusTopics } = useStudyMode()
  const { timer, remaining } = useFocusTimer()
  if (!mode || focusTopics.length === 0) return null

  const idx = focusTopics.indexOf(mode)
  const onList = idx >= 0
  // Off the list (say, a basics topic from the ladder) the 🎯 button is the
  // way back, so there is no Next.
  const next = onList ? focusTopics[idx + 1] || null : null
  const isLast = onList && idx === focusTopics.length - 1

  let timerChip = null
  if (timer?.phase === 'focus') timerChip = <span className="focus-bar-timer" aria-label="Focus time left">⏱ {formatClock(remaining)}</span>
  else if (timer?.phase === 'break') timerChip = <span className="focus-bar-timer is-break" aria-label="Break time left">☕ {formatClock(remaining)}</span>
  else if (timer?.phase === 'focus-done') {
    timerChip = <button type="button" className="focus-bar-timer is-due" onClick={onBoard}>⏰ Break time!</button>
  }

  return (
    <div className="focus-bar" role="region" aria-label="Focus session">
      <button type="button" className="focus-bar-board" onClick={onBoard} title="Back to my revision list">
        <span aria-hidden="true">🎯</span> {onList ? `${idx + 1} of ${focusTopics.length}` : 'My list'}
      </button>
      {timerChip}
      {next && (
        <button
          type="button"
          className="focus-bar-next"
          onClick={() => { logEvent('focus_bar_next', next, { from: mode }); onGo(next) }}
        >
          Next<span className="focus-bar-next-label">:&nbsp;{getTopicLabel(next)}</span><span aria-hidden="true">&nbsp;→</span>
        </button>
      )}
      {isLast && <span className="focus-bar-last"><span aria-hidden="true">🏁</span> Last one!</span>}
    </div>
  )
}
