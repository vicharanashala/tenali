import { useEffect, useState } from 'react'
import { CONFIG } from "../config.js"
import { getTopicBadgeLevel, getTopicDisplayName, TOPIC_DISPLAY_NAMES } from '../utils'
import BadgeIcon from './BadgeIcon.jsx'

function AchievementCollections({ completedTopics = [], onSelectTopic }) {
    const [data, setData] = useState(null)
    const [selectedBook, setSelectedBook] = useState(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const controller = new AbortController()
        let isActive = true

        const loadCollections = async () => {
            const token = localStorage.getItem('tenali-auth-token')
            if (!token) {
                if (isActive) setLoading(false)
                return
            }

            try {
                const r = await fetch(`${CONFIG.api}/api/collections/progress`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    signal: controller.signal
                })
                if (!r.ok) {
                    throw new Error(`Request failed: ${r.status}`)
                }

                if (!isActive) return

                const res = await r.json()
                setData(res.collections)
            } catch (e) {
                console.error(e)
            } finally {
                if (isActive || !controller.signal.aborted) setLoading(false)
            }
        }

        void loadCollections()

        return () => {
            isActive = false;
            controller.abort();
        }
    }, [])

    if (loading) {
        return <div className="loading-screen">Opening the Collector Bookshelf...</div>
    }

    return (
        <div className="bookshelf-container">
        <h2 className="bookshelf-title">My Collector Bookshelf</h2>
        <p className="bookshelf-subtitle">Complete all topics in a book to earn a shiny Gold Album Badge!</p>

        <div className="bookshelf-grid">
            {data && data.map(book => {
            const isDone = book.completed;
            return (
                <div key={book.collectionId} className={`book-card ${book.badgeType}-theme ${!isDone ? 'book-locked' : 'book-unlocked'}`} onClick={() => setSelectedBook(book)}>
                {/* Central Large Badge Hero Section */}
                <div className="book-badge-hero">
                    <div className="book-badge-aura" />
                    <div className="book-badge-icon">
                    <BadgeIcon type={book.badgeType} size={180} locked={!isDone} level={isDone ? 'gold' : ''} />
                    </div>
                </div>

                {/* Card Details Section */}
                <div className="book-details-body">
                    <h3 className="book-title">{book.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 12px 0' }}>
                    <span className="book-badge-difficulty">{book.difficulty}</span>
                    </div>
                    <p className="book-desc">
                    {book.description}
                    <span className="book-desc-modules">
                        <br />
                        <strong>Learning Modules:</strong> {book.topics.map(t => TOPIC_DISPLAY_NAMES[t.topicKey] || t.topicKey).join(', ')}
                    </span>
                    </p>

                    <div className="book-progress-wrapper">
                    <div className="book-progress-text">
                        <span>Progress</span>
                        <strong>{book.completedCount} / {book.totalTopics} ({book.percentage}%)</strong>
                    </div>
                    <div className="book-progress-bar-bg">
                        <div className="book-progress-bar-fill" style={{ width: `${book.percentage}%` }}></div>
                    </div>
                    </div>

                    {!isDone && book.nextTopic && (
                    <button className="book-next-btn" onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onSelectTopic === 'function') {
                        onSelectTopic(book.nextTopic);
                        }
                    }}>
                        Play Next: {getTopicDisplayName(book.nextTopic)}
                    </button>
                    )}
                    {isDone && <div className="book-complete-tag">Completed</div>}
                </div>
                </div>
            );
            })}
        </div>

        {selectedBook && (
            <div className="book-modal-overlay" onClick={() => setSelectedBook(null)}>
            <div className="book-modal-content" onClick={e => e.stopPropagation()}>
                <button className="book-modal-close" onClick={() => setSelectedBook(null)} aria-label="Close">✕</button>
                <h2 className="book-modal-title">{selectedBook.name}</h2>
                <p className="book-modal-desc">{selectedBook.description}</p>

                <div className="book-pages">
                <div className="book-page left-page">
                    <h3>Topics Checklist</h3>
                    <div className="topics-list-detailed">
                    {selectedBook.topics.map(topic => {
                        const level = getTopicBadgeLevel(topic.topicKey, completedTopics);
                        const isStartedOrCompleted = level !== 'locked';
                        return (
                        <div key={topic.topicKey} className={`topic-row-check ${topic.completed ? 'completed' : isStartedOrCompleted ? 'completed' : 'locked'}`} onClick={() => {
                            setSelectedBook(null);
                            onSelectTopic(topic.topicKey);
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                            <BadgeIcon type="trophy" level={level} size={32} locked={level === 'locked'} />
                            </div>
                            <div className="topic-text-info">
                            <span className="topic-check-name">{getTopicDisplayName(topic.topicKey)}</span>
                            <span className="topic-check-status">
                                {level === 'gold' ? 'Gold Mastery!' : level === 'silver' ? 'Silver Complete!' : level === 'bronze' ? 'Bronze Complete!' : level === 'blue' ? 'Practice Started!' : 'Click to start practice'}
                            </span>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>

                <div className="book-page right-page">
                    <h3>Collection Badge</h3>
                    <div className="badge-showcase-large">
                    <BadgeIcon type={selectedBook.badgeType} size={150} locked={!selectedBook.completed} level={selectedBook.completed ? 'gold' : ''} />
                    <h4>{selectedBook.completed ? 'Unlocked' : 'Locked'}</h4>
                    <p>{selectedBook.completed ? 'You earned the Gold Album Badge!' : 'Master all topics on the left to unlock!'}</p>
                    {selectedBook.completed && (
                        <div className="gold-ribbon-tag">ALBUM COMPLETED</div>
                    )}
                    </div>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}

export default AchievementCollections
