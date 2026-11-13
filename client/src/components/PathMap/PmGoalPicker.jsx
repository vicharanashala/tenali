import { useEffect, useRef, useState } from 'react';
import { pmCatColor, pmNodes } from '../../utils/pathMapUtils';


function PmGoalPicker({ goalIds, onSetGoal, onClear }) {
    const [query, setQuery] = useState('');
    const wrapRef = useRef(null);

    const matches = query.trim().length > 0
        ? pmNodes.filter((n) => n.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
        : [];

    useEffect(() => {
        function handleOutsideClick(e) {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) setQuery('');
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const currentGoal = goalIds.length > 0 ? pmNodes.find(n => n.id === goalIds[0]) : null;

    return (
        <div className="pm-goal-card" style={{
        background: 'var(--clr-card, rgba(255, 255, 255, 0.05))',
        border: '1.5px solid var(--clr-border, rgba(255, 255, 255, 0.12))',
        borderRadius: 12,
        padding: '18px 20px',
        marginBottom: 24,
        }}>
        <div className="pm-goal-label" style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: 12,
            color: 'var(--clr-text, #fff)',
        }}>What do you want to learn?</div>
        <div className="pm-goal-search-wrap" ref={wrapRef}>
            <div style={{ position: 'relative' }}>
            <input
                type="text"
                placeholder="Search a topic, e.g. Differentiation, Trigonometry..."
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && matches.length > 0) {
                    e.preventDefault();
                    onSetGoal([matches[0].id]);
                    setQuery('');
                }
                }}
                style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--clr-border)',
                background: 'var(--clr-card)',
                color: 'var(--clr-text)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                outline: 'none',
                }}
            />
            </div>
            {matches.length > 0 && (
            <div style={{
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginTop: 4,
                border: '1px solid var(--clr-border)',
                background: 'var(--clr-card)',
            }}>
                {matches.map((n, i) => (
                <div
                    key={n.id}
                    className="pm-goal-match-item"
                    data-node-id={n.id}
                    onMouseDown={() => { onSetGoal([n.id]); setQuery(''); }}
                    onClick={() => { onSetGoal([n.id]); setQuery(''); }}
                    style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: i !== matches.length - 1 ? '1px solid var(--clr-border)' : 'none',
                    color: 'var(--clr-text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    }}
                >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: pmCatColor[n.cat] }} />
                    <span>{n.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--clr-text-soft)' }}>{n.sub}</span>
                </div>
                ))}
            </div>
            )}
        </div>
        {currentGoal && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Goal:</span>
            <span style={{ fontWeight: 700, color: 'var(--clr-accent, #e8864a)' }}>{currentGoal.label}</span>
            <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-soft)', fontSize: '0.85rem' }}>✕ Clear</button>
            </div>
        )}
        </div>
    );
}

export default PmGoalPicker
