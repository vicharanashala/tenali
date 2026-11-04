import { useMemo, useState } from 'react';
import { pmCatColor, pmNodes } from '../../utils/pathMapUtils';

function PmModuleGrid({ path, goalIds, onSetGoal }) {
    const [filter, setFilter] = useState('');
    const pathIndex = useMemo(() => Object.fromEntries(path.map((id, i) => [id, i + 1])), [path]);
    const sorted = useMemo(() => [...pmNodes].sort((a, b) => a.label.localeCompare(b.label)), []);
    const filtered = filter.trim()
        ? sorted.filter((n) => n.label.toLowerCase().includes(filter.trim().toLowerCase()))
        : sorted;

    function handleCardClick(e, id) {
        if (e.shiftKey || e.metaKey || e.ctrlKey) onSetGoal([id]);
    }

    return (
        <div>
        <div className="pm-grid-heading">
            <div className="pm-section-heading">All topics</div>
            <input className="pm-grid-filter" type="text" placeholder="Filter topics…"
            value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <p className="pm-hint">Click any card to mark it known / not known. Shift-click to set as goal.</p>
        <div className="pm-module-grid">
            {filtered.map((n) => {
            const onPath = pathIndex[n.id] !== undefined;
            const isGoal = goalIds.includes(n.id);
            const dimmed = goalIds.length > 0 && !onPath;
            let badge = null;
            if (isGoal) badge = <span className="pm-card-badge goal">GOAL</span>;
            else if (onPath) badge = <span className="pm-card-badge step">{pathIndex[n.id]}</span>;
            return (
                <button key={n.id} className={`pm-card${dimmed ? ' dimmed' : ''}`}
                style={{ '--dot': pmCatColor[n.cat] }} onClick={(e) => handleCardClick(e, n.id)}>
                {badge}
                <div className="pm-card-label">{n.label}</div>
                <div className="pm-card-sub">{n.sub}</div>
                </button>
            );
            })}
        </div>
        </div>
    );
}

export default PmModuleGrid
