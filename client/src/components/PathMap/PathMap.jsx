import { usePathmapState } from "../../utils/pathMapUtils";
import { PM_STYLES } from "./pathCSS";
import PmGoalPicker from "./PmGoalPicker";
import PmModuleGrid from "./PmModuleGrid";
import PmSnakePath from "./PmSnakePath";
import PmStatsBar from "./PmStatsBar";

function PathMap({ onBack }) {
    const { goalIds, known, path, setGoal, clearGoal, toggleKnown, pmStatus } = usePathmapState();

    if (pmStatus === 'loading') {
        return (
        <div className="pm-shell">
            <div className="pm-topbar">
            <div className="pm-brand">
                {onBack && (
                <button className="pm-icon-btn" onClick={onBack} title="Back" aria-label="Back">←</button>
                )}
                <h1>Your Learning Path</h1>
            </div>
            </div>
            <div className="pm-empty">Loading topics…</div>
        </div>
        );
    }

    if (pmStatus === 'error') {
        return (
        <div className="pm-shell">
            <div className="pm-topbar">
            <div className="pm-brand">
                {onBack && (
                <button className="pm-icon-btn" onClick={onBack} title="Back" aria-label="Back">←</button>
                )}
                <h1>Your Learning Path</h1>
            </div>
            </div>
            <div className="pm-empty">Couldn't load topic data. Please refresh and try again.</div>
        </div>
        );
    }

    return (
        <div className="pm-shell">
        <style>{PM_STYLES}</style>
        <div className="pm-topbar">
            <div className="pm-brand">
            {onBack && (
                <button className="pm-icon-btn" onClick={onBack} title="Back" aria-label="Back">←</button>
            )}
            <h1>Your Learning Path</h1>
            </div>
        </div>
        <div className="pm-intro">
            <p>
            Pick a goal topic and we&rsquo;ll lay out every prerequisite in order. Mark what you
            already know to skip it — the path updates instantly, and stays saved on this device.
            </p>
        </div>
        <PmGoalPicker goalIds={goalIds} onSetGoal={setGoal} onClear={clearGoal} />
        <PmStatsBar path={path} known={known} />
        {path.length === 0 ? (
            <div className="pm-empty">Set a goal above to see your personalised prerequisite path.</div>
        ) : (
            <div className="pm-path-section">
            <div className="pm-section-heading">Your path</div>
            <PmSnakePath path={path} known={known} goalIds={goalIds} onToggleNode={toggleKnown} />
            </div>
        )}
        <PmModuleGrid path={path} goalIds={goalIds} onSetGoal={setGoal} />
        </div>
    );
}

export default PathMap;
