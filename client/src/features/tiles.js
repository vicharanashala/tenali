// Matrix Mystics Home-screen tile registry.
//
// Pure data module defining the 7 interactive discovery studios created for Matrix Mystics.

export const CJ_SHOW_GRID_CARD = false;

export const TILES = [
    { key: 'point-studio', name: '📍 Point Studio', subtitle: 'Visual intuition: From physical spot to pure location', stage: 'Stage 1', concept: 'Dimension 0: The Spot on the Paper', color: 'orange', category: 'linear-algebra' },
    { key: 'line-studio', name: '📏 Line Studio', subtitle: 'Embodied geometry: The straight line rule and steepness', stage: 'Stage 2', concept: 'Dimension 1: Straight Paths & y = ax + b', color: 'teal', category: 'linear-algebra' },
    { key: 'dimension-studio', name: '🌌 Dimension Studio', subtitle: 'Understanding ℝ, ℝ², ℝ³, and ℝⁿ: The worlds where math lives', stage: 'Stage 3', concept: 'Higher Dimensions: Cartesian Products & Coordinates', color: 'orange', category: 'linear-algebra' },
    { key: 'function-studio', name: '⚡ Function Studio', subtitle: 'Rules beyond the line: The one-input-one-output pattern', stage: 'Stage 4', concept: 'Transformations: Rules Beyond the Line & f(x)', color: 'purple', category: 'linear-algebra' },
    { key: 'inverse-studio', name: '🔄 Inverse Studio', subtitle: 'Undoing the rule: Output to input in 1D & 2D', stage: 'Stage 5', concept: 'Reversibility: Finding Inputs & Inverse Rules', color: 'orange', category: 'linear-algebra' },
    { key: 'matrix-studio', name: '📐 Matrix Studio', subtitle: 'From functions to matrices: The simultaneous machine Ax = b', stage: 'Stage 6', concept: 'Linear Systems: Multi-variable Mapping & Matrices', color: 'violet', category: 'linear-algebra' },
    { key: 'kernel', name: '⚖️ The Zero Balance', subtitle: 'Null space & equilibrium discovery in 2D & 3D', stage: 'Stage 7', concept: 'Null Space & Kernel: Finding Equilibrium Ax = 0', color: 'teal', category: 'linear-algebra' },
];

export const FEATURED_TILES = [];

export const MATH_LAB_ENTRY = { key: 'point-studio', name: '📍 Point Studio', subtitle: 'Visual intuition: From physical spot to pure location', color: 'orange' };

export const GEOCRAFT_ENTRY = { key: 'line-studio', name: '📏 Line Studio', subtitle: 'Embodied geometry: The equation of a line', color: 'teal' };

export default TILES;
