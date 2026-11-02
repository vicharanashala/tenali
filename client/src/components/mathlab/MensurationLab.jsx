import GenericLab from "./GenericLab";

//MensurationLabApp
function MensurationLab({ onBack, initialDifficulty, initialNumQuestions, initialStarted }) {
    const renderCustom = (q, ans, setAns, submitAns, revealed) => {

        // ── COUNT SIDES / SHAPE NAME ──────────────────────────────────────────
        if (q.template === 'count_sides' || q.template === 'shape_name') {
        const sides = q.sides;
        const color = q.color || '#FF6B6B';
        const pts = Array.from({ length: sides }).map((_, i) => {
            const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
            return `${50 + 40 * Math.cos(angle)},${50 + 40 * Math.sin(angle)}`;
        }).join(' ');
        return (
            <div className="men-canvas">
            <div className="men-shape-wrapper">
                <svg viewBox="0 0 100 100" className="men-shape-svg">
                <defs>
                    <linearGradient id={`sg${sides}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <polygon points={pts} fill={`url(#sg${sides})`} stroke="white" strokeWidth="3" />
                {Array.from({ length: sides }).map((_, i) => {
                    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
                    return <circle key={i} cx={50 + 40 * Math.cos(angle)} cy={50 + 40 * Math.sin(angle)} r="3.5" fill="white" opacity="0.9" />;
                })}
                </svg>
            </div>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── AREA GRID (interactive tap-to-count) ─────────────────────────────
        if (q.template === 'area_grid') {
        const counted = (typeof ans === 'string' && ans.startsWith('[')) ? JSON.parse(ans) : []; const setCounted = (updater) => { const next = typeof updater === 'function' ? updater(counted) : updater; setAns(JSON.stringify(next)); };

        const allCount = q.w * q.h;
        const handleCellClick = (idx) => {
            if (revealed) return;
            setCounted(prev => {
            const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx];
            if (next.length === allCount) setTimeout(() => setAns(String(allCount)), 100);
            return next;
            });
        };
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '16px' }}>
            <p className="men-canvas-tip">👆 Tap each square to count it!</p>
            <div className="men-grid-wrap" style={{ gridTemplateColumns: `repeat(${q.w}, 1fr)` }}>
                {Array.from({ length: allCount }).map((_, i) => (
                <div key={i}
                    className={`men-grid-cell ${counted.includes(i) ? 'counted' : ''} ${revealed ? 'revealed' : ''}`}
                    onClick={() => handleCellClick(i)}>
                    {(counted.includes(i) || revealed) ? '✓' : ''}
                </div>
                ))}
            </div>
            <div className="men-cell-count-pill">
                {revealed ? `✅ Area = ${q.answer} sq units` : `${counted.length} / ${allCount} counted`}
            </div>
            </div>
        );
        }

        // ── PERIMETER BLOCKS (animated walking dot) ───────────────────────────
        if (q.template === 'perimeter_blocks') {
        const cellPx = 44;
        const svgW = (q.w + 2) * cellPx;
        const svgH = (q.h + 2) * cellPx;
        const ox = cellPx; const oy = cellPx;
        const rw = q.w * cellPx; const rh = q.h * cellPx;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '16px' }}>
            <svg width={svgW} height={svgH} style={{ maxWidth: '100%' }}>
                <defs>
                <pattern id="gridP" width={cellPx} height={cellPx} patternUnits="userSpaceOnUse">
                    <path d={`M ${cellPx} 0 L 0 0 0 ${cellPx}`} fill="none" stroke="#E2E8F0" strokeWidth="1" />
                </pattern>
                </defs>
                <rect x={ox} y={oy} width={rw} height={rh} fill="url(#gridP)" />
                <rect x={ox} y={oy} width={rw} height={rh} fill="rgba(232,134,74,0.08)" stroke="#e8864a" strokeWidth="3" rx="4" />
                <text x={ox + rw / 2} y={oy - 10} textAnchor="middle" fill="#e8864a" fontWeight="bold" fontSize="14">{q.w} units</text>
                <text x={ox + rw + 16} y={oy + rh / 2 + 5} textAnchor="middle" fill="#e8864a" fontWeight="bold" fontSize="14"
                transform={`rotate(90 ${ox + rw + 16} ${oy + rh / 2 + 5})`}>{q.h} units</text>
                {revealed
                ? <rect x={ox} y={oy} width={rw} height={rh} fill="none" stroke="#48BB78" strokeWidth="4" rx="4" strokeDasharray="10 4" />
                : <circle r="7" fill="#FF7E67">
                    <animateMotion dur={`${(q.w + q.h) * 0.4}s`} repeatCount="indefinite"
                    path={`M ${ox},${oy} L ${ox + rw},${oy} L ${ox + rw},${oy + rh} L ${ox},${oy + rh} Z`} />
                </circle>
                }
            </svg>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── COMPARE AREA ──────────────────────────────────────────────────────
        if (q.template === 'compare_area') {
        const scale = 36;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {[q.shape1, q.shape2].map((sh, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{
                    width: `${sh.w * scale}px`, height: `${sh.h * scale}px`,
                    background: sh.color || '#FF7E67', opacity: 0.85, borderRadius: '10px',
                    boxShadow: `0 8px 20px ${sh.color || '#FF7E67'}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Quicksand'
                    }}>{sh.w}×{sh.h}</div>
                    <div style={{ marginTop: '10px', fontWeight: 800, fontSize: '1.4rem', color: sh.color, fontFamily: 'Quicksand' }}>Shape {sh.label}</div>
                    <div style={{ fontSize: '0.95rem', color: '#718096', fontFamily: 'Nunito' }}>
                    {revealed ? `Area = ${sh.w * sh.h}` : `${sh.w} × ${sh.h} = ?`}
                    </div>
                </div>
                ))}
            </div>
            <div className="men-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '440px' }}>
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && opt === q.answer && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── RECT VS SQUARE ────────────────────────────────────────────────────
        if (q.template === 'rect_vs_square') {
        const isSquare = q.w === q.h;
        const scale = Math.min(45, 200 / Math.max(q.w, q.h));
        const rw = q.w * scale; const rh = q.h * scale;
        const ox = (280 - rw) / 2; const oy = (220 - rh) / 2;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width="280" height="220" style={{ overflow: 'visible' }}>
                <defs>
                <linearGradient id="rectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6D365" /><stop offset="100%" stopColor="#FDA085" />
                </linearGradient>
                </defs>
                <rect x={ox} y={oy} width={rw} height={rh} fill="url(#rectGrad)" rx="8" className="men-rect-pulse" />
                <text x={ox + rw / 2} y={oy - 12} textAnchor="middle" fill="#E2E8F0" fontWeight="bold" fontSize="18">{q.w}</text>
                <text x={ox + rw + 16} y={oy + rh / 2 + 6} textAnchor="middle" fill="#E2E8F0" fontWeight="bold" fontSize="18">{q.h}</text>
                {isSquare && [
                `M ${ox + 8} ${oy} L ${ox + 8} ${oy + 8} L ${ox} ${oy + 8}`,
                `M ${ox + rw - 8} ${oy} L ${ox + rw - 8} ${oy + 8} L ${ox + rw} ${oy + 8}`,
                `M ${ox + rw - 8} ${oy + rh} L ${ox + rw - 8} ${oy + rh - 8} L ${ox + rw} ${oy + rh - 8}`,
                `M ${ox + 8} ${oy + rh} L ${ox + 8} ${oy + rh - 8} L ${ox} ${oy + rh - 8}`
                ].map((d, i) => <path key={i} d={d} fill="none" stroke="white" strokeWidth="2" />)}
            </svg>
            <div className="men-options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '340px' }}>
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt === 'Square' ? '⬛' : '▬'} {opt}
                    {revealed && opt === q.answer && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── TRIANGLE AREA ──────────────────────────────────────────────────────
        if (q.template === 'triangle_area') {
        const scale = Math.min(45, 200 / Math.max(q.base, q.height));
        const bPx = q.base * scale; const hPx = q.height * scale;
        const svgW = bPx + 80; const svgH = hPx + 70;
        const ox = 40; const oy = 30;
        const pts = `${ox},${oy + hPx} ${ox + bPx / 2},${oy} ${ox + bPx},${oy + hPx}`;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width={svgW} height={svgH} style={{ maxWidth: '100%', overflow: 'visible' }}>
                <defs>
                <linearGradient id="triGrd" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6D365" /><stop offset="100%" stopColor="#FDA085" />
                </linearGradient>
                </defs>
                <polygon points={pts} fill="url(#triGrd)" stroke="white" strokeWidth="3" className="men-rect-pulse" />
                <line x1={ox + bPx / 2} y1={oy} x2={ox + bPx / 2} y2={oy + hPx} stroke="#2D2520" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.85" />
                <path d={`M ${ox + bPx / 2 - 7} ${oy + hPx} L ${ox + bPx / 2 - 7} ${oy + hPx - 7} L ${ox + bPx / 2} ${oy + hPx - 7}`} fill="none" stroke="#2D2520" strokeWidth="1.5" opacity="0.85" />
                {/* Height Label Pill */}
                <rect x={ox + bPx / 2 + 8} y={oy + hPx / 2 - 12} width="52" height="22" rx="6" fill="#2D2520" stroke="#4A4038" strokeWidth="1.5" />
                <text x={ox + bPx / 2 + 34} y={oy + hPx / 2 + 4} textAnchor="middle" fill="#F4F1ED" fontWeight="bold" fontSize="13">h={q.height}</text>
                {/* Base Label Pill */}
                <rect x={ox + bPx / 2 - 38} y={oy + hPx + 14} width="76" height="22" rx="6" fill="#2D2520" stroke="#4A4038" strokeWidth="1.5" />
                <text x={ox + bPx / 2} y={oy + hPx + 30} textAnchor="middle" fill="#F4F1ED" fontWeight="bold" fontSize="13">base={q.base}</text>
            </svg>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── ANGLE TYPE ─────────────────────────────────────────────────────────
        if (q.template === 'angle_type') {
        const deg = q.degrees;
        const rad = (deg * Math.PI) / 180;
        const r = 90; const cx = 110; const cy = 120;
        const x2 = cx + r * Math.cos(-rad); const y2 = cy + r * Math.sin(-rad);
        const arcR = 50;
        const ax = cx + arcR * Math.cos(-rad); const ay = cy + arcR * Math.sin(-rad);
        const largeArc = deg > 180 ? 1 : 0;
        const arcColor = deg < 90 ? '#48BB78' : deg === 90 ? '#4ECDC4' : '#FF7E67';
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width="220" height="160" style={{ overflow: 'visible' }}>
                <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#988D84" strokeWidth="4.5" strokeLinecap="round" />
                <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#F08C46" strokeWidth="4.5" strokeLinecap="round" />
                <path d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax} ${ay}`} fill="none" stroke={arcColor} strokeWidth="5" />
                <text x={cx + arcR + 20} y={cy - 16} fill={arcColor} fontWeight="bold" fontSize="28">{deg}°</text>
                {deg === 90 && <rect x={cx} y={cy - 20} width="20" height="20" fill="none" stroke="#4ECDC4" strokeWidth="3" />}
                <circle cx={cx} cy={cy} r="5" fill="#2D3748" />
            </svg>
            <div className="men-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '400px' }}>
                {q.options?.map(opt => {
                const icons = { Acute: '🔺', Right: '📐', Obtuse: '🔻' };
                return (
                    <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {icons[opt]} {opt}{revealed && opt === q.answer && <span className="men-correct-tick"> ✓</span>}
                    </button>
                );
                })}
            </div>
            </div>
        );
        }

        // ── CIRCLE ─────────────────────────────────────────────────────────────
        if (q.template === 'circle_q') {
        const r = q.radius;
        const rPx = Math.min(55, 160 / (r * 2 + 4)) * r;
        const cx = 110; const cy = 110;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width="220" height="220" style={{ overflow: 'visible' }}>
                <defs>
                <radialGradient id="circGrd" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#ffaa7b" /><stop offset="100%" stopColor="#e8864a" />
                </radialGradient>
                </defs>
                <circle cx={cx} cy={cy} r={rPx} fill="url(#circGrd)" opacity="0.85" />
                <line x1={cx} y1={cy} x2={cx + rPx} y2={cy} stroke="white" strokeWidth="2.5" strokeDasharray="6 3" />
                <text x={cx + rPx / 2} y={cy - 8} textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">r={r}</text>
                <circle cx={cx} cy={cy} r="5" fill="white" />
                {q.subtype === 'circumference' &&
                <circle cx={cx} cy={cy} r={rPx + 8} fill="none" stroke="#FDA085" strokeWidth="3"
                    strokeDasharray="15 8" className="men-circle-spin" />}
            </svg>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── MISSING SIDE ───────────────────────────────────────────────────────
        if (q.template === 'missing_side') {
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            {q.subtype === 'rect_missing' ? (
                <svg width="180" height="140" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="misGrd" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6D365" /><stop offset="100%" stopColor="#FDA085" />
                    </linearGradient>
                </defs>
                <rect x="20" y="20" width="140" height="100" fill="url(#misGrd)" rx="8" opacity="0.8" />
                <text x="90" y="75" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18">Area={q.area}</text>
                <text x="90" y="12" textAnchor="middle" fill="#FF7E67" fontWeight="bold" fontSize="16">? units</text>
                {/* Rectangle Known Side Label */}
                <text x="172" y="75" textAnchor="middle" fill="#E2E8F0" fontWeight="bold" fontSize="16" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{q.knownSide}</text>
                </svg>
            ) : (
                <svg width="140" height="140" style={{ overflow: 'visible' }}>
                <rect x="20" y="20" width="100" height="100" fill="none" stroke="#e8864a" strokeWidth="3" strokeDasharray="8 4" rx="6" />
                {[['70', '12'], ['133', '75'], ['70', '133'], ['7', '75']].map(([x, y], i) => (
                    <g key={i}>
                    <circle cx={x} cy={parseInt(y) - 4} r="10" fill="#2D2520" stroke="#4A4038" strokeWidth="1" />
                    <text x={x} y={y} textAnchor="middle" fill="#FF7E67" fontWeight="bold" fontSize="13">?</text>
                    </g>
                ))}
                {/* Square Perimeter Label Pill */}
                <rect x="34" y="67" width="72" height="22" rx="6" fill="#2D2520" stroke="#4A4038" strokeWidth="1.5" />
                <text x="70" y="83" textAnchor="middle" fill="#F4F1ED" fontWeight="bold" fontSize="13">P={q.perim}</text>
                </svg>
            )}
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        return null;
    };

    return <GenericLab title="Mensuration" subtitle="Geometry & Shape Puzzles" endpoint="/api/mensuration-lab" onBack={onBack} renderQuestionCustom={renderCustom} initialDifficulty={initialDifficulty} initialNumQuestions={initialNumQuestions} initialStarted={initialStarted} />;
}

export default MensurationLab;
