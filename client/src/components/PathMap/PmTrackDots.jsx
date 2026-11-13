import { pmTrackGetStats } from "../../utils/pathMapUtils";

function PmTrackDots({ moduleId }) {
    const stat = pmTrackGetStats(moduleId);
    const streak = stat.correctStreak || [];
    const hasEasy = streak.includes('easy');
    const totalDots = hasEasy ? 5 : 3;
    const filledDots = Math.min(streak.length, totalDots);

    return (
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', marginLeft: 6 }}>
        {Array.from({ length: totalDots }).map((_, idx) => (
            <span
            key={idx}
            style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: idx < filledDots ? '#F08C46' : 'transparent',
                border: idx < filledDots ? '1px solid #F08C46' : '1px solid #8a8078',
                display: 'inline-block',
                transition: 'all 0.2s ease',
            }}
            />
        ))}
        </span>
    );
}

export default PmTrackDots;
