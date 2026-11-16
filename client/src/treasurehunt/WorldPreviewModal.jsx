import React, { useEffect } from 'react'
import { getTopicIcon, formatTopicName, TOPIC_TINTS } from './topicMetadata'
import './treasurehunt.css'

export default function WorldPreviewModal({ isOpen, world, onClose, onContinue }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !world) return null

  const topics = Array.isArray(world.topics) ? world.topics : []
  const activeCount = topics.filter((t) => t.status === 'active').length
  const totalCount = topics.length

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div
      className="th-htp-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="th-world-preview-title"
    >
      <div className="th-htp-popup th-world-preview-popup">
        <div className="th-world-preview-header">
          <div className="th-world-preview-badge" aria-hidden="true">
            {world.icon || '🗺️'}
          </div>
          <div className="th-world-preview-header-text">
            <h2 id="th-world-preview-title" className="th-htp-title th-world-preview-title">
              {world.name}
            </h2>
            <p className="th-world-topics-heading">
              {activeCount} of {totalCount} topics available
            </p>
          </div>
        </div>

        <div className="th-world-topics-grid">
          {topics.map((t, i) => {
            const Icon = getTopicIcon(t.topic)
            const isActive = t.status === 'active'
            return (
              <div
                key={t.topic || i}
                className={`th-topic-card ${TOPIC_TINTS[i % TOPIC_TINTS.length]}${!isActive ? ' th-topic-soon' : ''}`}
              >
                <span className="th-topic-card-icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <span className="th-topic-card-name">
                  {formatTopicName(t.topic)}
                </span>
                {!isActive && (
                  <span className="th-topic-badge">Soon</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="th-world-preview-actions">
          <button
            type="button"
            className="th-htp-btn"
            onClick={onContinue}
          >
            Continue
          </button>
          <button
            type="button"
            className="th-htp-btn th-world-preview-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
