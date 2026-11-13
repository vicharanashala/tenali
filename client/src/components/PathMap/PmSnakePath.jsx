import { pmCatColor, pmNodeById, pmStarPoints } from "../../utils/pathMapUtils";

const PM_GAP_Y = 108;
const PM_AMP   = 150;
const PM_WIDTH = 520;
const PM_PAD_TOP = 50;

function PmSnakePath({ path, known, goalIds, onToggleNode }) {
    const centerX = PM_WIDTH / 2;

    const pts = path.map((id, i) => ({
        id,
        x: centerX + PM_AMP * Math.sin(i * 0.9),
        y: PM_PAD_TOP + i * PM_GAP_Y,
    }));
    const height = PM_PAD_TOP * 2 + PM_GAP_Y * Math.max(path.length - 1, 0);
    const currentIdx = path.findIndex((id) => !known.has(id));

    if (!path.length) return null;

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
            viewBox={`0 0 ${PM_WIDTH} ${height}`}
            width="100%"
            height={height}
            style={{ display: 'block' }}
        >
            <defs>
            <filter id="pmGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            </defs>

            {pts.slice(0, -1).map((p, i) => {
            const next = pts[i + 1];
            const bothDone = known.has(p.id) && known.has(next.id);
            const dx = next.x - p.x, dy = next.y - p.y;
            const len = Math.hypot(dx, dy);
            const ux = dx / len, uy = dy / len;
            const x1 = p.x + ux * 26, y1 = p.y + uy * 26;
            const x2 = next.x - ux * 26, y2 = next.y - uy * 26;
            return (
                <line key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={bothDone ? '#5cb87a' : 'rgba(255,255,255,0.22)'}
                strokeWidth={bothDone ? 4 : 3}
                strokeLinecap="round"
                strokeDasharray={bothDone ? undefined : '5 10'}
                />
            );
            })}

            {pts.map((p, i) => {
            const node = pmNodeById[p.id];
            const isGoal = goalIds.includes(p.id);
            const isDone = known.has(p.id);
            const isCurrent = i === currentIdx;
            const color = pmCatColor[node.cat] || pmCatColor.other;
            const fill = isDone ? '#5cb87a' : color;
            const labelSide = p.x >= PM_WIDTH / 2 ? 1 : -1;
            return (
                <g key={p.id}
                transform={`translate(${p.x},${p.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onToggleNode(p.id)}
                >
                {isCurrent && (
                    <circle r={27} fill="none" stroke="var(--clr-accent, #e8864a)" strokeWidth={2.5} opacity={0.8} />
                )}
                <circle r={22} fill={fill} stroke={isDone ? '#fff' : 'rgba(255,255,255,0.2)'} strokeWidth={1.5} />
                {isDone ? (
                    <path d="M -8,0 L -2,7 L 9,-8" stroke="#fff" strokeWidth={3} fill="none"
                    strokeLinecap="round" strokeLinejoin="round" />
                ) : isGoal ? (
                    <polygon points={pmStarPoints(0, 0, 10)} fill="#fff" />
                ) : (
                    <text textAnchor="middle" dy="0.35em" fontSize={13} fontWeight={700} fill="#fff"
                    fontFamily="var(--font-body)">{i + 1}</text>
                )}
                <text x={30 * labelSide} y={5} fontSize={12} fontWeight={600}
                    fill="var(--clr-text, #ede8e3)" textAnchor={labelSide > 0 ? 'start' : 'end'}
                    fontFamily="var(--font-body)">{node.label}</text>
                </g>
            );
            })}
        </svg>
        </div>
    );
}

export default PmSnakePath
