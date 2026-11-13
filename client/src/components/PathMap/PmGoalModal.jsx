import { pmNodeById, usePathmapState } from '../../utils/pathMapUtils';
import { PM_STYLES } from './pathCSS';
import PmGoalPicker from './PmGoalPicker';
import PmSnakePath from './PmSnakePath';
import PmStatsBar from './PmStatsBar';

function PmGoalModal({ open, onClose }) {
    const { goalIds, known, path, setGoal, clearGoal, toggleKnown, resetKnown, pmStatus } = usePathmapState();

    if (!open) return null;

    return (
        <div
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '24px 16px', overflowY: 'auto',
        }}
        >
        <div style={{
            background: 'var(--clr-bg)', borderRadius: 16, width: '100%', maxWidth: 660,
            padding: '28px 24px', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}>
            <style>{PM_STYLES}</style>
            <button
            onClick={onClose}
            style={{
                position: 'absolute', top: 14, right: 16, background: 'none', border: 'none',
                fontSize: '1.4rem', cursor: 'pointer', color: 'var(--clr-text-soft)', lineHeight: 1,
            }}
            >
            ✕
            </button>

            <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>
            🗺 Learn by Path
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '0.83rem', color: 'var(--clr-text-soft)' }}>
            Pick a goal topic — we'll build your path below the search bar on the home screen.
            </p>

            {pmStatus !== 'ready' ? (
            <div style={{ padding: '20px 0', color: 'var(--clr-text-soft)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                {pmStatus === 'error' ? "Couldn't load topic data. Please refresh and try again." : 'Loading topics…'}
            </div>
            ) : (
            <PmGoalPicker
                goalIds={goalIds}
                onSetGoal={ids => setGoal(ids)}
                onClear={() => clearGoal()}
            />
            )}

            {pmStatus === 'ready' && path.length > 0 && (
            <>
                <PmStatsBar path={path} known={known} />

                <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', margin: '16px 0 10px' }}>
                Click a chip to mark it as already known — it'll skip ahead on your path.
                </p>
                <PmSnakePath path={path} known={known} goalIds={goalIds} onToggleNode={toggleKnown} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {path.map((id, i) => {
                    const node = pmNodeById[id];
                    const isDone = known.has(id);
                    const isGoal = goalIds.includes(id);
                    return (
                    <button
                        key={id}
                        onClick={() => toggleKnown(id)}
                        title={isDone ? 'Click to unmark' : 'Click to mark as already known'}
                        style={{
                        background: isDone ? '#5cb87a' : isGoal ? 'var(--clr-accent, #e8864a)' : 'var(--clr-card)',
                        border: '1.5px solid var(--clr-border)',
                        borderRadius: 20,
                        color: isDone || isGoal ? '#fff' : 'var(--clr-text)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                        padding: '4px 12px',
                        display: 'flex', alignItems: 'center', gap: 5,
                        transition: 'background 0.15s',
                        }}
                    >
                        <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>{i + 1}.</span>
                        {isDone ? '✓ ' : ''}{node?.label || id}
                        {isGoal ? ' ★' : ''}
                    </button>
                    );
                })}
                </div>

                <button
                onClick={() => {
                    onClose();
                    setTimeout(() => {
                    const el = document.querySelector('.pmh-panel');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                }}
                style={{
                    width: '100%', padding: '11px',
                    background: 'var(--clr-accent, #e8864a)', border: 'none', borderRadius: 10,
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                }}
                >
                Show my path →
                </button>
                {known.size > 0 && (
                <button
                    onClick={() => {
                    if (window.confirm('Reset all progress? This will clear all nodes you marked as known.')) {
                        resetKnown();
                    }
                    }}
                    style={{
                    width: '100%', marginTop: 8, padding: '8px',
                    background: 'none',
                    border: '1px solid var(--clr-border)',
                    borderRadius: 10,
                    color: 'var(--clr-text-soft)',
                    fontSize: '0.78rem', cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    }}
                >
                    Reset progress ({known.size} known)
                </button>
                )}
            </>
            )}
        </div>
        </div>
    );
}

export default PmGoalModal;
