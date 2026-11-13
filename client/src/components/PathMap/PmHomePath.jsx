import { pmCatColor, pmNodeById, pmStarPoints } from '../../utils/pathMapUtils';

const PMH_WIDTH   = 620;
const PMH_AMP     = 190;
const PMH_GAP_Y   = 152;
const PMH_PAD_TOP = 64;
const PMH_R       = 34;

function PmHomePath({ path, known, goalIds, onToggleKnown, onSelect }) {
    const centerX = PMH_WIDTH / 2;

    const pts = path.map((id, i) => ({
        id,
        x: centerX + PMH_AMP * Math.sin(i * 0.85),
        y: PMH_PAD_TOP + i * PMH_GAP_Y,
    }));
    const height = PMH_PAD_TOP * 2 + PMH_GAP_Y * Math.max(path.length - 1, 0);
    const currentIdx = path.findIndex((id) => !known.has(id));

    if (!path.length) return null;

    return (
        <div className="pmh-wrap" style={{ width: '100%', overflowX: 'auto' }}>
        <style>{`
            @keyframes pmhPulseRing {
            0%   { r: ${PMH_R + 6}px; opacity: 0.65; }
            70%  { r: ${PMH_R + 20}px; opacity: 0; }
            100% { r: ${PMH_R + 20}px; opacity: 0; }
            }
            .pmh-pulse { animation: pmhPulseRing 1.8s ease-out infinite; transform-origin: center; }
            .pmh-node { transition: opacity 0.2s; }
            .pmh-node:hover { opacity: 0.85; }
        `}</style>
        <svg
            viewBox={`0 0 ${PMH_WIDTH} ${height}`}
            width="100%"
            height={height}
            style={{ display: 'block' }}
        >
            <defs>
            <filter id="pmhGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            </defs>

            {pts.slice(0, -1).map((p, i) => {
            const next = pts[i + 1];
            const bothDone = known.has(p.id) && known.has(next.id);
            const midY = (p.y + next.y) / 2;
            const d = `M ${p.x} ${p.y} C ${p.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
            return (
                <path key={i} d={d} fill="none"
                stroke={bothDone ? '#5cb87a' : 'rgba(255,255,255,0.18)'}
                strokeWidth={bothDone ? 8 : 7}
                strokeLinecap="round"
                strokeDasharray={bothDone ? undefined : '2 16'}
                />
            );
            })}

            {pts.map((p, i) => {
            const node = pmNodeById[p.id];
            const isDone = known.has(p.id);
            const isGoal = goalIds.includes(p.id);
            const isCurrent = i === currentIdx;
            const isFuture = !isDone && !isCurrent && i > currentIdx;
            const color = pmCatColor[node.cat] || pmCatColor.other;
            const fill = isDone ? '#5cb87a' : color;
            const labelSide = p.x >= centerX ? 1 : -1;
            const nodeOpacity = isFuture ? 0.4 : 1;

            return (
                <g key={p.id} transform={`translate(${p.x},${p.y})`}>
                {isCurrent && (
                    <circle className="pmh-pulse" r={PMH_R + 6} fill="none"
                    stroke={color} strokeWidth={3} />
                )}

                <g
                    className="pmh-node"
                    style={{ cursor: 'pointer' }}
                    opacity={nodeOpacity}
                    onClick={() => onSelect(p.id)}
                >
                    <circle r={PMH_R} fill={fill}
                    stroke={isDone ? '#fff' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={2}
                    filter={isCurrent ? 'url(#pmhGlow)' : undefined}
                    />
                    {isDone ? (
                    <path d="M -12,0 L -3,10 L 13,-11" stroke="#fff" strokeWidth={4.5}
                        fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    ) : isGoal ? (
                    <polygon points={pmStarPoints(0, 0, 16)} fill="#fff" />
                    ) : (
                    <text textAnchor="middle" dy="0.35em" fontSize={17} fontWeight={800}
                        fill="#fff" fontFamily="var(--font-body)">{i + 1}</text>
                    )}
                </g>

                {/* small "mark as known" toggle badge */}
                <g
                    transform={`translate(${PMH_R - 8},${-PMH_R + 8})`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onToggleKnown(p.id); }}
                >
                    <circle r={12} fill={isDone ? '#5cb87a' : 'var(--clr-card, #2a2420)'}
                    stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
                    <path d="M -4.5,0 L -1,3.5 L 4.5,-4.5" stroke="#fff" strokeWidth={2.2}
                    fill="none" strokeLinecap="round" strokeLinejoin="round"
                    opacity={isDone ? 1 : 0.55} />
                </g>

                {isCurrent && (
                    <text x={0} y={-PMH_R - 18} textAnchor="middle" fontSize={11.5} fontWeight={800}
                    fill={color} fontFamily="var(--font-body)" letterSpacing="0.6">
                    ▶ START HERE
                    </text>
                )}
                {isGoal && !isCurrent && (
                    <text x={0} y={-PMH_R - 18} textAnchor="middle" fontSize={11} fontWeight={800}
                    fill="var(--clr-accent, #e8864a)" fontFamily="var(--font-body)" letterSpacing="0.6">
                    🏁 GOAL
                    </text>
                )}

                <text x={(PMH_R + 18) * labelSide} y={-6} fontSize={14.5} fontWeight={700}
                    fill="var(--clr-text, #ede8e3)" textAnchor={labelSide > 0 ? 'start' : 'end'}
                    fontFamily="var(--font-body)" opacity={nodeOpacity}>
                    {node.label}
                </text>
                <text x={(PMH_R + 18) * labelSide} y={13} fontSize={11.5}
                    fill="var(--clr-text-soft, #a89e94)" textAnchor={labelSide > 0 ? 'start' : 'end'}
                    fontFamily="var(--font-body)" opacity={nodeOpacity}>
                    {node.sub}
                </text>
                </g>
            );
            })}
        </svg>
        </div>
    );
}
export default PmHomePath
