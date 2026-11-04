import { useEffect, useState } from 'react';
import journeyFetch from '../../utils/journeyFetch';

//LearningJourneyTopicView
function LJTopicView({ topicId, onPlayConcept, onStartCheckpoint, onBack }) {
    const [progression, setProgression] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);


    useEffect(() => {
        let isMounted = true;
        const abort = new AbortController()
        const loadProgression = async () => {
            try {
                const res = await journeyFetch('/api/learning-journey/progress', { signal: abort.signal });
                if (!isMounted) return; 
                const topicProg = res.topics.find(t => t && t.topicId === topicId);
                if (!topicProg) throw new Error('Topic progression not found');
                setProgression(topicProg);
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
        
        void loadProgression();

        return () => {
            isMounted = false;
            abort.abort()
        };
    }, [reloadKey, topicId]);

    const handleRetry = () => {
        setLoading(true);
        setError('');
        setReloadKey(k => k + 1);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading topic concepts...</p></div>;
    if (error) return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}><p>{error}</p><button onClick={handleRetry} className="submit-btn" style={{ width: 'auto' }}>Retry</button></div>;
    if (!progression) return null;

    const displayName = topicId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div style={{ padding: '16px' }}>
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button className="back-button" onClick={onBack}>← Back to Journey</button>
            <span style={{ fontWeight: 'bold', color: 'var(--clr-accent)' }}>Topic Path</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ margin: 0 }}>{displayName}</h2>
            <p className="subtitle">Complete each concept sequentially to unlock the Checkpoint gate.</p>
        </div>

        {/* Timeline Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
            {progression.concepts.map((concept, index) => {
            const isCompleted = concept.state === 'completed';
            const isNeedsRevision = concept.state === 'needs_revision';
            const isPlayable = concept.state === 'playable' || isNeedsRevision;
            const isLocked = concept.state === 'locked';

            return (
                <div key={concept.key} style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative' }}>
                {/* Connector line */}
                {index < progression.concepts.length - 1 && (
                    <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '40px',
                    width: '2px',
                    height: 'calc(100% - 20px)',
                    background: isCompleted || isNeedsRevision ? 'var(--clr-correct, #26de81)' : 'var(--clr-border, #444)',
                    zIndex: 1
                    }} />
                )}
                {/* Circle Icon */}
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isCompleted
                    ? 'var(--clr-correct, #26de81)'
                    : (isNeedsRevision ? '#ff9f43' : (isPlayable ? 'var(--clr-accent, #feb47b)' : 'var(--clr-surface, #2c2c2f)')),
                    border: '2px solid ' + (isPlayable || isNeedsRevision ? '#fff' : 'var(--clr-border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: isCompleted || isNeedsRevision || isPlayable ? '#000' : 'var(--clr-text-soft)',
                    zIndex: 2,
                    fontSize: '1.1rem'
                }}>
                    {isCompleted ? '✓' : (isNeedsRevision ? '↻' : (isLocked ? '🔒' : index + 1))}
                </div>

                {/* Card content */}
                <div
                    style={{
                    flex: 1,
                    background: isNeedsRevision
                        ? 'rgba(255, 159, 67, 0.08)'
                        : (isPlayable ? 'var(--clr-hover-strong, rgba(255,255,255,0.06))' : 'var(--clr-surface, #1c1c1f)'),
                    border: isNeedsRevision
                        ? '1.5px dashed #ff9f43'
                        : (isPlayable ? '1.5px solid var(--clr-accent)' : '1px solid var(--clr-border)'),
                    borderRadius: '10px',
                    padding: '12px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isLocked ? 0.6 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'background var(--transition)'
                    }}
                    onClick={() => {
                    if (!isLocked) onPlayConcept(concept.key);
                    }}
                >
                    <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{concept.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: isNeedsRevision ? '#ff9f43' : 'var(--clr-text-soft)' }}>
                        {isNeedsRevision
                        ? '⚠️ Revision Required'
                        : (isCompleted ? 'Completed (Click to revise)' : (isPlayable ? 'Playable Now' : 'Locked'))}
                    </span>
                    </div>
                    {!isLocked && (
                    <span style={{ fontSize: '1.1rem', color: isNeedsRevision ? '#ff9f43' : (isPlayable ? 'var(--clr-accent)' : 'var(--clr-text-soft)') }}>▶</span>
                    )}
                </div>
                </div>
            );
            })}

            {/* Checkpoint Gate node */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '20px' }}>
            <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: progression.completed
                ? 'var(--clr-correct, #26de81)'
                : (progression.checkpointEligible ? 'orange' : 'var(--clr-surface, #2c2c2f)'),
                border: '2px solid var(--clr-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: progression.completed || progression.checkpointEligible ? '#000' : 'var(--clr-text-soft)',
                zIndex: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold'
            }}>
                🏁
            </div>

            <div
                style={{
                flex: 1,
                background: 'var(--clr-surface, #1d1d20)',
                border: progression.completed
                    ? '2px solid var(--clr-correct, #26de81)'
                    : (progression.checkpointEligible ? '2px solid orange' : '1px solid var(--clr-border)'),
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
            >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Topic Checkpoint Quiz</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                15 cumulative questions. Score 80%+ to clear the topic and unlock successor topics.
                </p>

                {progression.completed ? (
                <div style={{ color: 'var(--clr-correct, #26de81)', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    ✓ Cleared (Score: {progression.latestScore}%)
                </div>
                ) : progression.checkpointEligible ? (
                <div>
                    {progression.latestScore !== null && (
                    <div style={{ color: 'red', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
                        Failed Previous Attempt: {progression.latestScore}% (Required: 80%)
                    </div>
                    )}
                    <button
                    className="submit-btn"
                    onClick={onStartCheckpoint}
                    style={{ width: 'auto', padding: '10px 24px', background: 'orange', borderColor: 'orange', color: '#000', fontWeight: 'bold' }}
                    >
                    Start Checkpoint Quiz
                    </button>
                </div>
                ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', fontStyle: 'italic' }}>
                    🔒 Locked (Complete all concepts above to unlock)
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    );
}


//LearningJourneyTopicView
export default LJTopicView
