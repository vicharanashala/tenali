/**
 * EmotionPicker — 5-emoji emotion self-report component.
 *
 * Shown after quiz completion. Students can select an emotion
 * and optionally provide text feedback.
 */

import { useState, useMemo } from 'react'
import { submitEmotion } from './proctorEvents'

const EMOTIONS = [
  { key: 'very_sad', emoji: '😞', label: 'Very Hard', color: '#ef4444' },
  { key: 'sad', emoji: '😕', label: 'Hard', color: '#f97316' },
  { key: 'neutral', emoji: '😐', label: 'Okay', color: '#eab308' },
  { key: 'happy', emoji: '🙂', label: 'Good', color: '#84cc16' },
  { key: 'very_happy', emoji: '😊', label: 'Easy', color: '#22c55e' },
]

const MOOD_COLORS = {
  happy: '#22c55e', surprised: '#a855f7', neutral: '#94a3b8',
  sad: '#3b82f6', angry: '#ef4444', fearful: '#f97316', disgusted: '#84cc16',
}

const MOOD_ICONS = {
  happy: '😄', surprised: '😲', neutral: '😐',
  sad: '😢', angry: '😠', fearful: '😨', disgusted: '🤢',
}

const NEGATIVE = new Set(['sad', 'angry', 'fearful', 'disgusted'])

export default function EmotionPicker({ quizType, onSubmit, onSkip, emotionTimeline = [] }) {
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const timelineSummary = useMemo(() => {
    if (!emotionTimeline || emotionTimeline.length === 0) return null
    const counts = {}
    for (const e of emotionTimeline) {
      counts[e.emotion] = (counts[e.emotion] || 0) + 1
    }
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    const negativeShare = emotionTimeline.filter(e => NEGATIVE.has(e.emotion)).length / emotionTimeline.length
    return { dominant, negativeShare, total: emotionTimeline.length }
  }, [emotionTimeline])

  const handleSubmit = async () => {
    if (!selected) return
    await submitEmotion({ quizType, emotion: selected, feedback })
    setSubmitted(true)
    setTimeout(() => onSubmit?.(), 1500)
  }

  if (submitted) {
    return (
      <div className="proctor-emotion-container">
        <div className="proctor-emotion-thanks">Thanks for your feedback!</div>
      </div>
    )
  }

  return (
    <div className="proctor-emotion-container">
      <h3 className="proctor-emotion-title">How was that quiz?</h3>
      <p className="proctor-emotion-subtitle">Your feedback helps us improve</p>

      {timelineSummary && (
        <div style={{
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 16,
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c7d2fe', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎭</span> Your emotional journey during this quiz
          </div>
          {/* Mood bar — one colored cell per sampled emotion */}
          <div style={{ display: 'flex', gap: 1, height: 14, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            {emotionTimeline.map((e, i) => (
              <div key={i} title={`${MOOD_ICONS[e.emotion] || '?'} ${Math.round((e.timestamp - emotionTimeline[0].timestamp) / 1000)}s`}
                style={{ flex: 1, background: MOOD_COLORS[e.emotion] || '#94a3b8', minWidth: 2 }} />
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#a5b4fc', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>Mostly: {MOOD_ICONS[timelineSummary.dominant]} {timelineSummary.dominant}</span>
            <span>Struggle moments: {Math.round(timelineSummary.negativeShare * 100)}%</span>
            <span>Sampled: {timelineSummary.total}x</span>
          </div>
          {timelineSummary.negativeShare > 0.4 && (
            <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: 6 }}>
              💙 Looks like parts of this were tough. That's completely normal — try a break or a study tip before the next round.
            </div>
          )}
        </div>
      )}

      <div className="proctor-emotion-row">
        {EMOTIONS.map(e => (
          <button
            key={e.key}
            className={`proctor-emotion-btn ${selected === e.key ? 'selected' : ''}`}
            style={selected === e.key ? { borderColor: e.color, background: `${e.color}15` } : {}}
            onClick={() => setSelected(e.key)}
          >
            <span className="proctor-emotion-emoji">{e.emoji}</span>
            <span className="proctor-emotion-label">{e.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <textarea
          className="proctor-emotion-feedback"
          placeholder="Optional: tell us more (max 300 chars)"
          maxLength={300}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={3}
        />
      )}

      <div className="proctor-emotion-actions">
        <button className="proctor-btn proctor-btn-skip" onClick={onSkip}>Skip</button>
        <button
          className="proctor-btn proctor-btn-accept"
          onClick={handleSubmit}
          disabled={!selected}
        >
          Submit Feedback
        </button>
      </div>
    </div>
  )
}
