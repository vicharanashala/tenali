import { pmCatColor, pmNodeById, pmSuccessorMap } from '../../utils/pathMapUtils';


function PmCongratsModal({ goalIds, path, onClose, onNewGoal, onSetGoal }) {
    const goalNode = goalIds.length > 0 ? pmNodeById[goalIds[0]] : null;
    if (!goalNode) return null;

    // Topics that succeed the goal in the graph but are NOT already in the path
    const pathSet = new Set(path);
    const furtherNodes = (pmSuccessorMap[goalIds[0]] || [])
        .filter((id) => !pathSet.has(id))
        .slice(0, 4)
        .map((id) => pmNodeById[id])
        .filter(Boolean);

    return (
        <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.78)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px 16px',
        }}
        >
        <div style={{
            background: 'var(--clr-bg)',
            border: '1.5px solid var(--clr-border)',
            borderRadius: 18,
            width: '100%',
            maxWidth: 400,
            padding: '32px 26px 26px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
        }}>
            <button
            onClick={onClose}
            style={{
                position: 'absolute', top: 14, right: 16,
                background: 'none', border: 'none',
                fontSize: '1.3rem', lineHeight: 1,
                cursor: 'pointer',
                color: 'var(--clr-text-soft)',
            }}
            >✕</button>

            <div style={{ fontSize: 38, marginBottom: 16, letterSpacing: 4 }}>🎉 🏆 🎉</div>

            <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--clr-text)',
            fontFamily: 'var(--font-body)',
            marginBottom: 6,
            }}>
            Path complete!
            </div>

            <div style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--clr-accent, #e8864a)',
            fontFamily: 'var(--font-body)',
            marginBottom: 10,
            }}>
            {goalNode.label}
            </div>

            <p style={{
            fontSize: '0.85rem',
            color: 'var(--clr-text-soft)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            marginBottom: 22,
            }}>
            You've mastered all {path.length} steps on your path. Brilliant work!
            </p>

            <div style={{ borderTop: '1px solid var(--clr-border)', marginBottom: 18 }} />

            {furtherNodes.length > 0 ? (
            <>
                <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.55px',
                textTransform: 'uppercase',
                color: 'var(--clr-text-soft)',
                fontFamily: 'var(--font-body)',
                marginBottom: 12,
                }}>
                What to study next
                </div>

                <div style={{
                display: 'grid',
                gridTemplateColumns: furtherNodes.length === 1 ? '1fr' : '1fr 1fr',
                gap: 8,
                marginBottom: 24,
                }}>
                {furtherNodes.map((n) => (
                    <button
                    key={n.id}
                    onClick={() => { onSetGoal([n.id]); onClose(); }}
                    style={{
                        background: 'var(--clr-card)',
                        border: '1.5px solid var(--clr-border)',
                        borderRadius: 'var(--radius-sm, 10px)',
                        padding: '10px 12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = pmCatColor[n.cat];
                        e.currentTarget.style.background = 'var(--clr-hover-strong, rgba(255,255,255,0.06))';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                        e.currentTarget.style.background = 'var(--clr-card)';
                    }}
                    >
                    <div style={{
                        width: 7, height: 7,
                        borderRadius: '50%',
                        background: pmCatColor[n.cat],
                        marginBottom: 7,
                    }} />
                    <div style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--clr-text)',
                        marginBottom: 3,
                    }}>
                        {n.label}
                    </div>
                    <div style={{
                        fontSize: '0.72rem',
                        color: 'var(--clr-text-soft)',
                        lineHeight: 1.4,
                    }}>
                        {n.sub}
                    </div>
                    </button>
                ))}
                </div>
            </>
            ) : (
            <p style={{
                fontSize: '0.85rem',
                color: 'var(--clr-text-soft)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.6,
                marginBottom: 24,
            }}>
                You've reached the top of this topic's tree. Pick a new goal to keep building!
            </p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
            <button
                onClick={onClose}
                style={{
                flex: 1,
                padding: '10px',
                background: 'none',
                border: '1.5px solid var(--clr-border)',
                borderRadius: 10,
                color: 'var(--clr-text-soft)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                }}
            >
                Close
            </button>
            <button
                onClick={onNewGoal}
                style={{
                flex: 2,
                padding: '10px',
                background: 'var(--clr-accent, #e8864a)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                }}
            >
                Pick a new goal →
            </button>
            </div>
        </div>
        </div>
    );
}

export default PmCongratsModal
