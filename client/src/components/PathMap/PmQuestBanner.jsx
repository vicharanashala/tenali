import { useMemo } from 'react';
import usePmGraphData from '../../hooks/usePmGraphData';
import { pmGetCurrentSuggestedModule } from '../../utils/pathMapUtils';
import { QUEST_BANNER_STYLES } from './pathCSS';

function PmQuestBanner({ onSelect }) {
    const graphStatus = usePmGraphData();
    const suggested = useMemo(() => {
        return graphStatus === 'ready' ? pmGetCurrentSuggestedModule() : null;
    }, [graphStatus]);

    if (!suggested) return null;

    return (
        <div className="quest-banner-row">
        <style>{QUEST_BANNER_STYLES}</style>
        <button className="quest-banner-btn" onClick={() => onSelect(suggested.id)}>
            <div className="quest-banner-content">
            <div className="quest-banner-header">
                <span>🚀</span>
                <span className="quest-banner-tag">Today's Quest</span>
            </div>
            <h3 className="quest-banner-title">{suggested.label}</h3>
            <p className="quest-banner-subtitle">{suggested.sub || 'Embark on your next learning step!'}</p>
            </div>
            <div className="quest-banner-arrow">➔</div>
        </button>
        </div>
    );
}

export default PmQuestBanner;
