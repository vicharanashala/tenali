function BadgeIcon({ type, size = 64, locked = false, level = '' }) {
    const colorFilter = locked ? 'grayscale(1) opacity(0.55)' : 'none';

    const badgeMap = {
        'counting-critters': 'dino',
        'arithmetic-basics': 'trophy',
        'fraction-explorer': 'feast',
        'geometry-master': 'wizard',
        'division-detective': 'detective',
        'time-traveler': 'rocket',
        'data-detective': 'chest',
        'algebra-alchemist': 'flask',
        'pythagoras-path': 'shield',
        'trig-treasure': 'crown'
    };

    const mappedType = badgeMap[type] || type;
    const imagePath = mappedType === 'topic'
        ? `/badges/topic_${(level && level !== 'locked') ? level : 'blue'}.png`
        : `/badges/${mappedType}.png`;
    const levelClass = level ? `badge-level-${level}` : '';

    return (
        <div
        className={`badge-icon-container ${locked ? 'badge-locked' : 'badge-unlocked'} ${levelClass}`}
        style={{
            width: size,
            height: size,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: colorFilter,
            position: 'relative'
        }}
        >
        <img
            src={imagePath}
            alt={type}
            style={{
            width: '85%',
            height: '85%',
            objectFit: 'contain',
            display: 'block'
            }}
            onError={(e) => {
            e.target.src = '/badges/trophy.png';
            }}
        />
        </div>
    );
}

export default BadgeIcon
