/**
 * ProctorReport — End-of-quiz summary showing anomalies detected.
 *
 * Displays:
 *   - Total penalty score
 *   - List of anomaly events with timestamps
 *   - Tab switch count
 *   - Quiz score alongside proctor data
 */

import { useMemo } from 'react'

const SEVERITY_COLORS = {
  1: '#eab308',
  2: '#f97316',
  3: '#ef4444',
}

const TYPE_LABELS = {
  tab_switch: 'Tab Switch',
  tab_blur: 'Window Blur',
  no_face: 'No Face Detected',
  multiple_faces: 'Multiple Faces',
  face_mismatch: 'Identity Mismatch',
  blur_detected: 'Camera Blurred',
  voice_detected: 'Voice Detected',
  virtual_camera: 'Virtual Camera',
  security_challenge_failed: 'Challenge Failed',
  right_click: 'Right Click Blocked',
  copy_paste: 'Copy/Paste Blocked',
  devtools: 'DevTools Blocked',
}

export default function ProctorReport({ anomalies, penaltyScore, quizScore, totalQ, onDismiss }) {
  const grouped = useMemo(() => {
    const map = {}
    for (const a of anomalies) {
      const label = TYPE_LABELS[a.type] || a.type
      if (!map[label]) map[label] = { count: 0, severity: 0 }
      map[label].count++
      map[label].severity = Math.max(map[label].severity, a.severity || 1)
    }
    return Object.entries(map).sort((a, b) => b[1].severity - a[1].severity)
  }, [anomalies])

  const tabSwitches = anomalies.filter(a => a.type === 'tab_switch' || a.type === 'tab_blur').length

  return (
    <div className="proctor-modal-overlay">
      <div className="proctor-modal proctor-report">
        <div className="proctor-modal-header">
          <h2>📊 Quiz Report</h2>
        </div>

        <div className="proctor-modal-body">
          <div className="proctor-report-scores">
            <div className="proctor-report-score">
              <span className="proctor-report-score-label">Quiz Score</span>
              <span className="proctor-report-score-value">{quizScore}/{totalQ}</span>
            </div>
            <div className="proctor-report-score">
              <span className="proctor-report-score-label">Penalty Points</span>
              <span className={`proctor-report-score-value ${penaltyScore > 0 ? 'warning' : ''}`}>{penaltyScore}</span>
            </div>
            <div className="proctor-report-score">
              <span className="proctor-report-score-label">Tab Switches</span>
              <span className={`proctor-report-score-value ${tabSwitches > 3 ? 'warning' : ''}`}>{tabSwitches}</span>
            </div>
          </div>

          {grouped.length > 0 ? (
            <>
              <h3 style={{ margin: '16px 0 8px', fontSize: '0.95rem' }}>Anomalies Detected</h3>
              <table className="proctor-report-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map(([label, data]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{data.count}</td>
                      <td>
                        <span
                          className="proctor-report-severity"
                          style={{ background: SEVERITY_COLORS[data.severity] || '#888' }}
                        >
                          {data.severity === 1 ? 'Low' : data.severity === 2 ? 'Medium' : 'High'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="proctor-report-clean">
              ✅ No anomalies detected. Clean session!
            </div>
          )}
        </div>

        <div className="proctor-modal-footer">
          <button className="proctor-btn proctor-btn-accept" onClick={onDismiss}>Close Report</button>
        </div>
      </div>
    </div>
  )
}
