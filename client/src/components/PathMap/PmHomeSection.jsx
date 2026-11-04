import { useState } from 'react';
import { pmNodeById, usePathmapState } from '../../utils/pathMapUtils';
import { PM_STYLES } from './pathCSS';
import PmCongratsModal from './PmCongratsModal';
import PmHomePath from './PmHomePath';

function PmHomeSection({ onSelect, onOpenGoalPicker }) {
    const { goalIds, known, path, clearGoal, toggleKnown, setGoal, pmStatus } = usePathmapState();
    const [showCongrats, setShowCongrats] = useState(false);

    if (pmStatus !== 'ready' || path.length === 0) return null;

    const stepsLeft = path.filter((id) => !known.has(id)).length;
    const goalNode = goalIds.length > 0 ? pmNodeById[goalIds[0]] : null;
    const allDone = path.length > 0 && path.every((id) => known.has(id));

    return (
        <>
        <style>{PM_STYLES}</style>
        <div
            className="pmh-panel"
            style={{
            margin: '22px 0 30px',
            padding: '20px 18px 10px',
            background: 'var(--clr-card)',
            border: '1.5px solid var(--clr-border)',
            borderRadius: 18,
            }}
        >
            <div
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12, marginBottom: 6, paddingBottom: 14,
                borderBottom: '1px solid var(--clr-border)',
            }}
            >
            <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.6px', color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>
                Your path to
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)' }}>
                {goalNode?.label}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{path.length}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)' }}>steps</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#5cb87a' }}>{path.length - stepsLeft}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)' }}>done</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)' }}>{stepsLeft}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)' }}>to go</div>
                </div>
                <button
                onClick={() => clearGoal()}
                title="Clear current goal (known nodes kept)"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-soft)', fontSize: '0.78rem' }}
                >
                ✕ Clear
                </button>
            </div>
            </div>

            {allDone ? (
            <div
                style={{
                margin: '14px 0 8px',
                padding: '14px 16px',
                background: 'rgba(92, 184, 122, 0.12)',
                border: '1.5px solid rgba(92, 184, 122, 0.35)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                }}
            >
                <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#5cb87a', fontFamily: 'var(--font-body)' }}>
                    🎉 All done — path complete!
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: 3, fontFamily: 'var(--font-body)' }}>
                    Every step mastered. Tap below to see what's next.
                </div>
                </div>
                <button
                onClick={() => setShowCongrats(true)}
                style={{
                    background: 'var(--clr-accent, #e8864a)',
                    border: 'none',
                    borderRadius: 20,
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}
                >
                What's next? →
                </button>
            </div>
            ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', margin: '10px 0 4px' }}>
                Tap a stop to practice it. Tap the small check to mark it as already known.
            </p>
            )}

            <PmHomePath
            path={path}
            known={known}
            goalIds={goalIds}
            onToggleKnown={toggleKnown}
            onSelect={onSelect}
            />
        </div>

        {showCongrats && (
            <PmCongratsModal
            goalIds={goalIds}
            path={path}
            onClose={() => setShowCongrats(false)}
            onNewGoal={() => {
                setShowCongrats(false);
                if (onOpenGoalPicker) onOpenGoalPicker();
            }}
            onSetGoal={(ids) => {
                setGoal(ids);
                setShowCongrats(false);
            }}
            />
        )}
        </>
    );
}

export default PmHomeSection;
