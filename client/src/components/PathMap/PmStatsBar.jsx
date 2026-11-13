function PmStatsBar({ path, known }) {
    if (!path.length) return null;
    const doneCount = path.filter((id) => known.has(id)).length;
    const remaining = path.length - doneCount;
    return (
        <div className="pm-stats-bar" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        margin: '16px 0',
        }}>
        <div className="pm-stat" style={{
            background: 'var(--clr-card, rgba(255, 255, 255, 0.05))',
            border: '1px solid var(--clr-border, rgba(255, 255, 255, 0.1))',
            borderRadius: 10,
            padding: 12,
            textAlign: 'center',
        }}>
            <div className="pm-stat-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-text, #fff)' }}>{path.length}</div>
            <div className="pm-stat-label" style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft, #a89e94)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Total steps</div>
        </div>
        <div className="pm-stat" style={{
            background: 'var(--clr-card, rgba(255, 255, 255, 0.05))',
            border: '1px solid var(--clr-border, rgba(255, 255, 255, 0.1))',
            borderRadius: 10,
            padding: 12,
            textAlign: 'center',
        }}>
            <div className="pm-stat-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-correct, #5cb87a)' }}>{doneCount}</div>
            <div className="pm-stat-label" style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft, #a89e94)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Already known</div>
        </div>
        <div className="pm-stat" style={{
            background: 'var(--clr-card, rgba(255, 255, 255, 0.05))',
            border: '1px solid var(--clr-border, rgba(255, 255, 255, 0.1))',
            borderRadius: 10,
            padding: 12,
            textAlign: 'center',
        }}>
            <div className="pm-stat-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)' }}>{remaining}</div>
            <div className="pm-stat-label" style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft, #a89e94)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Steps to go</div>
        </div>
        </div>
    );
}

export default PmStatsBar
