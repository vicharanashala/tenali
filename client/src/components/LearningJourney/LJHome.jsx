// LearningJourneyHome

import { useEffect, useState } from 'react';
import journeyFetch from '../../utils/journeyFetch';

function LJHome({ onSelectTopic, onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const abort = new AbortController()
        const loadProgress = async () => {
            try {
                const res = await journeyFetch('/api/learning-journey/progress', { signal: abort.signal });
                if (!isMounted) return;
                setData(res);
                setError('');
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to load progress');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void loadProgress();

        return () => {
            isMounted = false;
            abort.abort()
        };
    }, [reloadKey]);

    const handleRetry = () => {
        setLoading(true);
        setError('');
        setReloadKey(k => k + 1);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading your journey...</p></div>;
    if (error) return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}><p>{error}</p><button onClick={handleRetry} className="submit-btn" style={{ width: 'auto' }}>Retry</button></div>;
    if (!data) return null;

    return (
        <div style={{ padding: '16px' }}>
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button className="back-button" onClick={onBack}>← Main Menu</button>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--clr-accent)' }}>⭐ Learning Journey</span>
        </div>

        <div style={{ background: 'var(--clr-hover-strong, rgba(255,255,255,0.03))', padding: '20px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Overall Progress</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1, height: '12px', background: 'var(--clr-border, #444)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${data.overallProgressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #ff7e5f, #feb47b)', borderRadius: '6px', transition: 'width 0.5s ease-in-out' }} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{data.overallProgressPercent}% Completed</span>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
            Completed {data.completedConcepts.length} concepts across {data.completedTopics.length} topics.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {data.topics.map((t, idx) => {
            if (!t) return null;
            const completedCount = t.concepts.filter(c => c.state === 'completed').length;
            const totalConcepts = t.concepts.length;

            return (
                <div
                key={t.topicId}
                style={{
                    position: 'relative',
                    background: 'var(--clr-surface, #1c1c1f)',
                    border: t.completed
                    ? '1.5px solid var(--clr-correct, #26de81)'
                    : (t.unlocked ? '1.5px solid var(--clr-accent, #feb47b)' : '1px solid var(--clr-border, #444)'),
                    borderRadius: '12px',
                    padding: '20px',
                    opacity: t.unlocked ? 1 : 0.5,
                    cursor: t.unlocked ? 'pointer' : 'not-allowed',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onClick={() => {
                    if (t.unlocked) onSelectTopic(t.topicId);
                }}
                onMouseEnter={e => {
                    if (t.unlocked) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
                    }
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                >
                {!t.unlocked && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '1.2rem' }}>🔒</div>
                )}
                {t.completed && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--clr-correct, #26de81)', fontSize: '1.25rem', fontWeight: 'bold' }}>✓</div>
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    Topic {idx + 1}
                </span>
                <h3 style={{ marginTop: '4px', marginBottom: '8px' }}>{t.topicId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '12px' }}>
                    <span>Concepts</span>
                    <span>{completedCount} / {totalConcepts}</span>
                </div>

                {t.unlocked && (
                    <div style={{ marginTop: '16px', fontSize: '0.85rem' }}>
                    {t.completed ? (
                        <span style={{ color: 'var(--clr-correct, #26de81)', fontWeight: 'bold' }}>Checkpoint Cleared ({t.latestScore}%)</span>
                    ) : t.checkpointEligible ? (
                        <span style={{ color: 'orange', fontWeight: 'bold' }}>Checkpoint Ready</span>
                    ) : (
                        <span style={{ color: 'var(--clr-text-soft)' }}>Progressing ({Math.round((completedCount/totalConcepts)*100)}%)</span>
                    )}
                    </div>
                )}
                </div>
            );
            })}
        </div>
        </div>
    );
}

export default LJHome;
