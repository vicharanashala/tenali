/**
 * EthicsConsent — Mandatory consent modal before proctoring begins.
 *
 * Displays:
 *   - Webcam capture declaration
 *   - Audio monitoring notice
 *   - Data retention policy
 *   - Voluntary participation statement
 *   - Accept/Decline buttons
 */

import { useState } from 'react'

export default function EthicsConsent({ onAccept, onDecline }) {
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = (e) => {
    const el = e.target
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      setScrolled(true)
    }
  }

  return (
    <div className="proctor-modal-overlay">
      <div className="proctor-modal">
        <div className="proctor-modal-header">
          <h2>🔒 Proctoring Consent</h2>
          <p className="proctor-modal-subtitle">Please read and accept before starting</p>
        </div>

        <div className="proctor-modal-body" onScroll={handleScroll}>
          <section className="proctor-consent-section">
            <h3>📸 Webcam Monitoring</h3>
            <p>
              This quiz uses webcam monitoring to ensure academic integrity.
              Your camera will be active during the quiz. Snapshots may be
              captured when anomalies are detected (e.g., no face visible,
              multiple people in frame).
            </p>
          </section>

          <section className="proctor-consent-section">
            <h3>🎤 Audio Monitoring</h3>
            <p>
              Audio levels may be monitored to detect speaking. Audio data is
              <strong> processed locally</strong> and is <strong>not recorded or stored</strong>.
            </p>
          </section>

          <section className="proctor-consent-section">
            <h3>🖥️ Tab Switching</h3>
            <p>
              The system tracks when you switch tabs or windows. Excessive tab
              switching may be flagged as suspicious activity.
            </p>
          </section>

          <section className="proctor-consent-section">
            <h3>📊 Data Usage</h3>
            <p>
              Proctoring data (anomaly events, screenshots) is stored securely
              and is only used for academic integrity review. Data is retained
              for the duration of the course.
            </p>
          </section>

          <section className="proctor-consent-section">
            <h3>✋ Voluntary Participation</h3>
            <p>
              Participation in proctored quizzes is voluntary. You may decline,
              but proctored quizzes may be required for course credit. You can
              withdraw at any time by closing the quiz.
            </p>
          </section>

          <section className="proctor-consent-section">
            <h3>🛡️ Your Rights</h3>
            <p>
              You have the right to review any proctoring data collected about you.
              If you believe an anomaly was flagged in error, please contact your
              instructor.
            </p>
          </section>
        </div>

        <div className="proctor-modal-footer">
          <button className="proctor-btn proctor-btn-decline" onClick={onDecline}>
            Decline & Exit
          </button>
          <button
            className="proctor-btn proctor-btn-accept"
            onClick={onAccept}
            disabled={!scrolled}
            title={!scrolled ? 'Please scroll to the bottom first' : 'Accept and start quiz'}
          >
            {scrolled ? 'I Accept — Start Quiz' : 'Scroll to accept ↓'}
          </button>
        </div>
      </div>
    </div>
  )
}
