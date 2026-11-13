import { usePathmapState } from '../../utils/pathMapUtils';


function PmHamburgerItem({ onOpen }) {
    const { goalIds, known, path, pmStatus } = usePathmapState();
    const stepsLeft = path.filter((id) => !known.has(id)).length;

    return (
        <button
        onClick={onOpen}
        disabled={pmStatus !== 'ready'}
        style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
            background: 'none', border: 'none', cursor: pmStatus === 'ready' ? 'pointer' : 'not-allowed',
            opacity: pmStatus === 'ready' ? 1 : 0.6,
            color: 'var(--clr-text)', fontFamily: 'var(--font-body)', fontSize: '0.95rem',
            transition: 'background var(--transition)', borderBottom: '1px solid var(--clr-border)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-hover-strong)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
        <strong style={{ color: 'var(--clr-accent)' }}>
            {pmStatus !== 'ready' ? '📍 Loading…' : goalIds.length > 0 ? `📍 Path (${stepsLeft} left)` : '📍 Level Map'}
        </strong>
        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
            Learn by prerequisite path
        </span>
        </button>
    );
}

function PmHeaderPill(props) {
    return <PmHamburgerItem {...props} />;
}

export { PmHeaderPill };

export default PmHamburgerItem
