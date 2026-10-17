const TOPIC_DISPLAY_NAMES = {
    'decimals': 'Decimals',
    'rounding': 'Rounding',
    'addition': 'Addition',
    'basicarith': 'Basic Arithmetic',
    'fractionadd': 'Fraction Addition',
    'ratio': 'Ratios & Proportions',
    'angles': 'Angles',
    'triangles': 'Triangles',
    'multiply': 'Multiplication',
    'hcflcm': 'HCF & LCM',
    'sdt': 'Speed, Distance & Time',
    'variation': 'Variation & Rates',
    'stats': 'Statistics',
    'prob': 'Probability',
    'lineareq': 'Linear Equations',
    'lineq': 'Line Equation',
    'pythag': "Pythagoras' Theorem",
    'polygons': 'Polygons',
    'trig': 'Trigonometry',
    'coordgeom': 'Coordinate Geometry',
    'percent': 'Percentages'
};

const getTopicDisplayName = (key) => {
    if (!key) return '';
    return TOPIC_DISPLAY_NAMES[key] || (key.charAt(0).toUpperCase() + key.slice(1));
};

function getTopicBadgeLevel(topicKey, completedTopics = []) {
    if (!completedTopics || !Array.isArray(completedTopics)) return 'locked';
    if (completedTopics.includes(`${topicKey}-hard`) || completedTopics.includes(`${topicKey}-gold`)) {
        return 'gold';
    }
    if (completedTopics.includes(`${topicKey}-medium`)) {
        return 'silver';
    }
    if (completedTopics.includes(`${topicKey}-easy`)) {
        return 'bronze';
    }
    if (completedTopics.includes(`${topicKey}-started`)) {
        return 'blue';
    }
    return 'locked';
}

export { getTopicBadgeLevel, getTopicDisplayName, TOPIC_DISPLAY_NAMES };

