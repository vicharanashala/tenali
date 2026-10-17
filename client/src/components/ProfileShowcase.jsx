import { useEffect, useMemo, useRef, useState } from 'react'
import { CONFIG } from "../config.js"
import { getTopicBadgeLevel, getTopicDisplayName } from '../utils'
import BadgeIcon from './BadgeIcon.jsx'

function ProfileShowcase({ completedTopics = [], onSelectTopic }) {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [collectionsProgress, setCollectionsProgress] = useState([])
    const [selectedSection, setSelectedSection] = useState('bookshelf')
    const [activeBadgeDetail, setActiveBadgeDetail] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [sectionExpanded, setSectionExpanded] = useState(false)
    const [showcaseExpanded, setShowcaseExpanded] = useState(true)

    const dropdownRef = useRef(null)

    // Dynamically compute the badges in the inventory based on collections progress and completed topics
    const inventory = useMemo(() => {
        const allBadges = [];
        if (!collectionsProgress || collectionsProgress.length === 0) return [];

        // A. Album Badges
        collectionsProgress.forEach(col => {
        allBadges.push({
            badgeId: col.collectionId,
            name: col.name,
            badgeType: col.badgeType,
            type: 'collection',
            locked: !col.completed,
            requirement: `Complete all topics in the "${col.name}" album.`,
            description: col.description
        })
        })

        // B. Topic Badges
        const addedTopics = new Set()
        collectionsProgress.forEach(col => {
        col.topics.forEach(topic => {
            if (!addedTopics.has(topic.topicKey)) {
            addedTopics.add(topic.topicKey)
            const level = getTopicBadgeLevel(topic.topicKey, completedTopics)
            const topicName = getTopicDisplayName(topic.topicKey)
            allBadges.push({
                badgeId: topic.topicKey,
                name: topicName,
                badgeType: 'topic',
                type: 'topic',
                locked: level === 'locked',
                requirement: `Complete Easy difficulty or start practice in the "${topicName}" quiz.`,
                description: `Practice and master the "${topicName}" quiz to upgrade this badge from Blue to Gold!`
            })
            }
        })
        })

        // C. Dynamically add custom topics not part of collections.json (e.g. Percentages)
        if (completedTopics && Array.isArray(completedTopics)) {
        completedTopics.forEach(tKey => {
            const baseTopicKey = tKey.replace(/-(easy|medium|hard|gold|started|adaptive|extrahard)$/, '');
            if (baseTopicKey && !addedTopics.has(baseTopicKey)) {
            addedTopics.add(baseTopicKey);
            const level = getTopicBadgeLevel(baseTopicKey, completedTopics);
            if (level !== 'locked') {
                const topicName = getTopicDisplayName(baseTopicKey);
                allBadges.push({
                badgeId: baseTopicKey,
                name: topicName,
                badgeType: 'topic',
                type: 'topic',
                locked: false,
                requirement: `Complete Easy difficulty or start practice in the "${topicName}" quiz.`,
                description: `Practice and master the "${topicName}" quiz to upgrade this badge from Blue to Gold!`
                });
            }
            }
        });
        }

        // D. Streak Badges
        const userStreak = profile ? profile.streak : 0
        const streaksConfig = [
        { days: 3, id: 'streak_3', name: '3-Day Streak' },
        { days: 7, id: 'streak_7', name: '7-Day Streak' },
        { days: 15, id: 'streak_15', name: '15-Day Streak' },
        { days: 30, id: 'streak_30', name: '30-Day Streak' }
        ]
        streaksConfig.forEach(s => {
        allBadges.push({
            badgeId: s.id,
            name: s.name,
            badgeType: s.id,
            type: 'streak',
            locked: userStreak < s.days,
            requirement: `Maintain a consecutive active practice streak of at least ${s.days} days.`,
            description: `Awarded for logging in and solving quizzes for ${s.days} consecutive days!`
        })
        })

        return allBadges;
    }, [collectionsProgress, completedTopics, profile]);

    // Close dropdown on click outside
    useEffect(() => {
        if (!dropdownOpen) return
        const handleOutsideClick = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setDropdownOpen(false)
        }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [dropdownOpen])


    useEffect(() => {
        let isActive = true;

        const controller = new AbortController();

        const fetchProfileAndBadges = async () => {
            const token = localStorage.getItem('tenali-auth-token');
            if (!token) return;

            try {
                const profileRes = await fetch(`${CONFIG.api}/api/profile/showcase`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    signal: controller.signal
                });

                if (!profileRes.ok) {
                    throw new Error(`Profile request failed: ${profileRes.status}`);
                }
                if (!isActive) return;

                const profileData = await profileRes.json();
                setProfile(profileData);

                const progressRes = await fetch(`${CONFIG.api}/api/collections/progress`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    signal: controller.signal
                });

                if (!progressRes.ok) {
                    throw new Error(`Collections progress request failed: ${progressRes.status}`);
                }

                const progressData = await progressRes.json()
                setCollectionsProgress(progressData.collections || [])


            } catch (e) {
                console.error('Failed to load profile details & badges:', e);
            } finally {
                if (isActive) setLoading(false);
            }
        }
        void fetchProfileAndBadges();

        return () => {
            isActive = false;
            controller.abort();
        }
    }, [])

    const unlockedBadges = useMemo(() => {
        const rawUnlocked = inventory.filter(b => !b.locked);
        const getSortScore = (badge) => {
        if (badge.type === 'collection') return 1;
        if (badge.type === 'topic') {
            const lvl = getTopicBadgeLevel(badge.badgeId, completedTopics);
            if (lvl === 'gold')   return 2;
            if (lvl === 'silver') return 4;
            if (lvl === 'bronze') return 5;
            if (lvl === 'blue')   return 6;
        }
        if (badge.type === 'streak') return 3;
        return 7;
        };
        return [...rawUnlocked].sort((a, b) => {
        const diff = getSortScore(a) - getSortScore(b);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
        });
    }, [inventory, completedTopics]);

    if (loading) {
        return <div className="loading-screen">Opening Profile Showcase...</div>
    }

    const lockedTopics = inventory.filter(b => b.type === 'topic' && (b.locked || getTopicBadgeLevel(b.badgeId, completedTopics) !== 'gold'))
    const lockedStreaks = inventory.filter(b => b.type === 'streak' && b.locked)

    return (
        <div className="profile-container">
        <h2 className="profile-title">{profile ? profile.username.toUpperCase() : 'STUDENT'}'S CORNER</h2>

        {/* Gamified Stats Section */}
        <div className="gamified-stats-section" style={{ marginBottom: '32px' }}>
            {/* Streak Pod */}
            <div className="dashboard-stat-pod streak-pod">
            <div className="fire-flame-wrapper">🔥</div>
            <span className="dashboard-stat-val">{profile ? profile.streak : 0}</span>
            <span className="dashboard-stat-lbl">Day Streak</span>
            </div>

            {/* Topics Mastered Pod */}
            <div className="dashboard-stat-pod mastery-pod">
            <div className="stat-icon-wrapper">👑</div>
            <span className="dashboard-stat-val">{profile ? profile.masteryCount : 0}</span>
            <span className="dashboard-stat-lbl">Topics Mastered</span>
            </div>

            {/* Questions Solved Pod */}
            <div className="dashboard-stat-pod solved-pod">
            <div className="stat-icon-wrapper">⭐</div>
            <span className="dashboard-stat-val">{profile ? profile.totalSolved : 0}</span>
            <span className="dashboard-stat-lbl">Solved Questions</span>
            </div>
        </div>

        {/* My Badges Cabinet Section */}
        <div className="my-badges-section">
            <button
            className={`collapsible-header-btn ${!showcaseExpanded ? 'collapsed' : ''}`}
            onClick={() => setShowcaseExpanded(!showcaseExpanded)}
            type="button"
            >
            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>My Badges Showcase</span>
            <span className="collapsible-chevron" style={{ transform: showcaseExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
            </button>

            {showcaseExpanded && (
            <div style={{ marginTop: '20px' }}>
                {unlockedBadges.length === 0 ? (
                <div className="empty-badges-card">
                    <span style={{ fontSize: '2.5rem' }}>🏆</span>
                    <p>You haven't unlocked any badges yet. Start solving quizzes to earn your first badge!</p>
                </div>
                ) : (
                <div className="unlocked-badges-grid">
                    {unlockedBadges.map(badge => {
                    const itemLevel = badge.type === 'collection'
                        ? 'gold'
                        : badge.type === 'topic'
                        ? getTopicBadgeLevel(badge.badgeId, completedTopics)
                        : '';
                    return (
                        <div
                        key={badge.badgeId}
                        className={`unlocked-badge-card level-${itemLevel}`}
                        title={`${badge.name}: ${badge.description}`}
                        onClick={() => setActiveBadgeDetail({ ...badge, level: itemLevel, isLocked: false })}
                        >
                        <div className="unlocked-badge-aura" />
                        <BadgeIcon
                            type={badge.badgeType}
                            size={64}
                            level={itemLevel}
                        />
                        <span className="unlocked-badge-name">{badge.name}</span>
                        <span className="unlocked-badge-type-tag">{badge.type}</span>
                        </div>
                    )
                    })}
                </div>
                )}
            </div>
            )}
        </div>

        {/* Badges Yet to Receive Collapsible Section */}
        <div className="yet-to-receive-section" style={{ marginTop: '32px' }}>
            <button
            className={`collapsible-header-btn ${!sectionExpanded ? 'collapsed' : ''}`}
            onClick={() => setSectionExpanded(!sectionExpanded)}
            type="button"
            >
            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Badges Yet to Receive</span>
            <span className="collapsible-chevron" style={{ transform: sectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
            </button>

            {sectionExpanded && (
            <div className="collapsible-content-wrapper" style={{ marginTop: '20px' }}>
                {/* Custom Interactive Dropdown Menu */}
                <div className="yet-to-receive-dropdown-container" ref={dropdownRef}>
                <button
                    className={`yet-to-receive-trigger ${dropdownOpen ? 'open' : ''}`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    type="button"
                >
                    <div className="trigger-content">
                    <div className="trigger-text-wrapper">
                        <span className="trigger-lbl">Show Category</span>
                        <span className="trigger-val">
                        {selectedSection === 'bookshelf' && '📚 Collector Bookshelf'}
                        {selectedSection === 'mastery' && '👑 Topic Mastery'}
                        {selectedSection === 'streaks' && '🔥 Daily Check-in'}
                        </span>
                    </div>
                    </div>
                    <span className="trigger-chevron">{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                {dropdownOpen && (
                    <div className="yet-to-receive-dropdown-menu">
                    <button
                        className={`menu-item ${selectedSection === 'bookshelf' ? 'active' : ''}`}
                        onClick={() => { setSelectedSection('bookshelf'); setDropdownOpen(false); }}
                        type="button"
                    >
                        <span className="item-icon">📚</span>
                        <div className="item-text">
                        <strong>Collector Bookshelf</strong>
                        <span>Progress through albums and unlock custom visual books</span>
                        </div>
                    </button>
                    <button
                        className={`menu-item ${selectedSection === 'mastery' ? 'active' : ''}`}
                        onClick={() => { setSelectedSection('mastery'); setDropdownOpen(false); }}
                        type="button"
                    >
                        <span className="item-icon">👑</span>
                        <div className="item-text">
                        <strong>Topic Mastery</strong>
                        <span>Master math topics to upgrade your badges from blue to gold</span>
                        </div>
                    </button>
                    <button
                        className={`menu-item ${selectedSection === 'streaks' ? 'active' : ''}`}
                        onClick={() => { setSelectedSection('streaks'); setDropdownOpen(false); }}
                        type="button"
                    >
                        <span className="item-icon">🔥</span>
                        <div className="item-text">
                        <strong>Daily Check-in</strong>
                        <span>Solve quizzes consecutively to earn streak milestones</span>
                        </div>
                    </button>
                    </div>
                )}
                </div>

                {/* Display Active Shelf Section */}
                {selectedSection === 'bookshelf' ? (
                <AchievementCollections completedTopics={completedTopics} onSelectTopic={onSelectTopic} />
                ) : (
                <div className="unlocked-badges-grid">
                    {selectedSection === 'mastery' && (
                    <>
                        {lockedTopics.length === 0 ? (
                        <div className="empty-section-card" style={{ gridColumn: '1 / -1', width: '100%', textAlign: 'center', padding: '32px' }}>
                            🎉 Awesome! You have unlocked Gold Mastery on all topics!
                        </div>
                        ) : (
                        lockedTopics.map(item => {
                            const itemLevel = getTopicBadgeLevel(item.badgeId, completedTopics);
                            return (
                            <div
                                key={item.badgeId}
                                className={`unlocked-badge-card locked-badge-card level-${itemLevel}`}
                                title={`${item.name}: ${item.requirement}`}
                                onClick={() => setActiveBadgeDetail({ ...item, level: itemLevel, isLocked: true })}
                            >
                                <div className="badge-lock-overlay-icon">🔒</div>
                                <BadgeIcon type={item.badgeType} size={64} level={itemLevel} locked={true} />
                                <span className="unlocked-badge-name">{item.name}</span>
                                <span className="unlocked-badge-type-tag">{item.type}</span>
                            </div>
                            );
                        })
                        )}
                    </>
                    )}

                    {selectedSection === 'streaks' && (
                    <>
                        {lockedStreaks.length === 0 ? (
                        <div className="empty-section-card" style={{ gridColumn: '1 / -1', width: '100%', textAlign: 'center', padding: '32px' }}>
                            🎉 Outstanding! You have unlocked all streak milestone badges!
                        </div>
                        ) : (
                        lockedStreaks.map(item => (
                            <div
                            key={item.badgeId}
                            className="unlocked-badge-card locked-badge-card"
                            title={`${item.name}: ${item.requirement}`}
                            onClick={() => setActiveBadgeDetail({ ...item, level: '', isLocked: true })}
                            >
                            <div className="badge-lock-overlay-icon">🔒</div>
                            <BadgeIcon type={item.badgeType} size={64} locked={true} />
                            <span className="unlocked-badge-name">{item.name}</span>
                            <span className="unlocked-badge-type-tag">{item.type}</span>
                            </div>
                        ))
                        )}
                    </>
                    )}
                </div>
                )}
            </div>
            )}
        </div>

        <div className="profile-timeline-section" style={{ marginTop: '32px' }}>
            <h3>Journey Milestones</h3>
            <div className="timeline-trail">
            {profile && profile.timeline && profile.timeline.map((item, idx) => {
                const dateStr = new Date(item.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
                });
                return (
                <div key={idx} className="timeline-node">
                    <div className="timeline-marker">
                    {item.type === 'system' ? '●' : '★'}
                    </div>
                    <div className="timeline-info">
                    <span className="timeline-date">{dateStr}</span>
                    <strong className="timeline-event">{item.event}</strong>
                    </div>
                </div>
                );
            })}
            </div>
        </div>

        {/* Interactive Badge Detail Overlay */}
        {activeBadgeDetail && (
            <div className="badge-detail-overlay" onClick={() => setActiveBadgeDetail(null)}>
            <div className="badge-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="badge-detail-close" onClick={() => setActiveBadgeDetail(null)} aria-label="Close">✕</button>

                <div className="badge-detail-hero">
                <div className={`badge-detail-aura level-${activeBadgeDetail.level}`} style={{ background: activeBadgeDetail.isLocked ? '#e11d48' : '' }} />
                <BadgeIcon
                    type={activeBadgeDetail.badgeType}
                    size={110}
                    level={activeBadgeDetail.level}
                    locked={activeBadgeDetail.isLocked}
                />
                {activeBadgeDetail.isLocked && (
                    <div style={{ position: 'absolute', fontSize: '2.5rem', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>🔒</div>
                )}
                </div>

                <h2 className="badge-detail-title">{activeBadgeDetail.name}</h2>
                <span className="badge-detail-tag" style={{ background: activeBadgeDetail.isLocked ? 'rgba(225, 29, 72, 0.15)' : '', borderColor: activeBadgeDetail.isLocked ? '#e11d48' : '', color: activeBadgeDetail.isLocked ? '#f43f5e' : '' }}>
                {activeBadgeDetail.isLocked ? 'Locked ' : ''}{activeBadgeDetail.type} Badge
                </span>

                <p className="badge-detail-desc">{activeBadgeDetail.description}</p>

                {activeBadgeDetail.isLocked ? (
                <div className="badge-detail-requirement">
                    <strong>How to Unlock:</strong>
                    <p style={{ marginBottom: activeBadgeDetail.type === 'topic' ? '14px' : '0' }}>{activeBadgeDetail.requirement}</p>
                    {activeBadgeDetail.type === 'topic' && (
                    <button
                        className="book-next-btn"
                        style={{ width: '100%', display: 'block' }}
                        onClick={() => {
                        setActiveBadgeDetail(null);
                        onSelectTopic(activeBadgeDetail.badgeId);
                        }}
                    >
                        Go Practice: {activeBadgeDetail.name}
                    </button>
                    )}
                </div>
                ) : (
                <div className="badge-detail-requirement">
                    <strong>Achievement Requirement:</strong>
                    <p>{activeBadgeDetail.requirement}</p>
                </div>
                )}
            </div>
            </div>
        )}
        </div>
    )
}
export default ProfileShowcase
