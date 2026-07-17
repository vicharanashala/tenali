/**
 * glossaryVisuals.jsx ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Inline SVG visual registry for Feature AQ.
 *
 * One small SVG component per curated glossary term. All entries share
 * `viewBox="0 0 120 120"`, the `glossary-visual` className, and stroke-based
 * `currentColor` so the wrapper controls the colour via CSS.
 */
import React from 'react';

const V = {

  // SHAPES (18)
  triangle: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="60,18 102,98 18,98" />
    </svg>
  ),
  quadrilateral: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="22,30 100,25 92,95 30,95" />
    </svg>
  ),
  pentagon: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="60,15 100,45 88,95 32,95 20,45" />
    </svg>
  ),
  hexagon: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="60,15 100,38 100,82 60,105 20,82 20,38" />
    </svg>
  ),
  heptagon: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="60,18 97,36 102,77 78,102 42,102 18,77 23,36" />
    </svg>
  ),
  octagon: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="38,18 82,18 102,38 102,82 82,102 38,102 18,82 18,38" />
    </svg>
  ),
  polygon: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="60,15 95,38 92,75 75,100 35,98 18,70 25,35" />
    </svg>
  ),
  parallelogram: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="25,30 95,30 105,90 35,90" />
    </svg>
  ),
  trapezium: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="20,30 100,30 80,90 40,90" />
    </svg>
  ),
  rectangle: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="20" y="30" width="80" height="60" />
    </svg>
  ),
  square: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="25" y="25" width="70" height="70" />
    </svg>
  ),
  circle: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" />
    </svg>
  ),
  cube: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="22,40 60,22 88,40 50,58" />
      <polygon points="22,40 22,82 50,100 50,58" />
      <polygon points="50,58 88,40 88,82 50,100" />
    </svg>
  ),
  sphere: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" />
      <ellipse cx="60" cy="60" rx="40" ry="14" />
      <ellipse cx="60" cy="60" rx="14" ry="40" />
    </svg>
  ),
  cylinder: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="60" cy="25" rx="30" ry="8" />
      <line x1="30" y1="25" x2="30" y2="95" />
      <line x1="90" y1="25" x2="90" y2="95" />
      <path d="M30 95 Q30 103 60 103 Q90 103 90 95" />
    </svg>
  ),
  cone: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="60" cy="95" rx="30" ry="8" />
      <line x1="32" y1="92" x2="60" y2="18" />
      <line x1="88" y1="92" x2="60" y2="18" />
    </svg>
  ),
  pyramid: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="60,20 20,85 65,95 100,85 60,20" />
      <line x1="60" y1="20" x2="65" y2="95" />
    </svg>
  ),
  prism: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="20,30 35,15 95,15 80,30" />
      <polygon points="20,30 20,85 80,85 80,30" />
      <polygon points="80,30 95,15 95,70 80,85" />
    </svg>
  ),

// ANGLES & LINES (15)
  angle: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="35" y1="90" x2="105" y2="90" />
      <line x1="35" y1="90" x2="85" y2="40" />
      <path d="M65 90 A30 30 0 0 0 56 69" />
      <text x="72" y="78" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle">θ</text>
    </svg>
  ),
  "right angle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="35,20 35,90 105,90" />
      <rect x="35" y="70" width="20" height="20" />
      <text x="70" y="65" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" textAnchor="middle">90°</text>
    </svg>
  ),
  "acute angle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="35" y1="90" x2="105" y2="90" />
      <line x1="35" y1="90" x2="95" y2="55" />
      <path d="M70 90 A35 35 0 0 0 65 72" />
      <text x="78" y="82" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle">θ</text>
    </svg>
  ),
  "obtuse angle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="75" y1="90" x2="115" y2="90" />
      <line x1="75" y1="90" x2="40" y2="30" />
      <path d="M100 90 A25 25 0 0 0 63 68" />
      <text x="84" y="62" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle">θ</text>
    </svg>
  ),
  "reflex angle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="75" y1="70" x2="115" y2="70" />
      <line x1="75" y1="70" x2="40" y2="35" />
      <path d="M95 70 A20 20 0 1 1 61 56" />
      <text x="75" y="105" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle">θ</text>
    </svg>
  ),
  "interior angle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="25,95 95,95 60,35" />
      <path d="M45 95 A20 20 0 0 0 35 78" />
      <text x="50" y="85" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" textAnchor="middle">θ</text>
    </svg>
  ),
  "exterior angle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20,90 80,90 50,30" />
      <line x1="80" y1="90" x2="110" y2="90" strokeDasharray="3 3" />
      <path d="M100 90 A20 20 0 0 0 71 72" />
      <text x="92" y="70" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" textAnchor="middle">θ</text>
    </svg>
  ),
  parallel: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="15" y1="45" x2="105" y2="45" />
      <line x1="15" y1="75" x2="105" y2="75" />
    </svg>
  ),
  perpendicular: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="60" x2="105" y2="60" />
      <line x1="60" y1="15" x2="60" y2="105" />
      <rect x="60" y="50" width="10" height="10" />
    </svg>
  ),
  "perpendicular bisector": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="60" x2="105" y2="60" />
      <line x1="60" y1="15" x2="60" y2="105" strokeDasharray="4 3" />
      <rect x="60" y="50" width="10" height="10" />
      <path d="M37 55v10 M83 55v10" />
    </svg>
  ),
  midpoint: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="60" x2="105" y2="60" />
      <circle cx="60" cy="60" r="4" fill="currentColor" />
      <path d="M37 55v10 M83 55v10" />
    </svg>
  ),
  vertical: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="60" y1="15" x2="60" y2="105" />
    </svg>
  ),
  horizontal: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="15" y1="60" x2="105" y2="60" />
    </svg>
  ),
  diagonal: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="25" y="25" width="70" height="70" />
      <line x1="25" y1="25" x2="95" y2="95" />
    </svg>
  ),
  bearing: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="60" r="40" />
      <line x1="60" y1="60" x2="60" y2="20" />
      <polygon points="56,24 64,24 60,15" fill="currentColor" />
      <text x="60" y="10" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="600" textAnchor="middle">N</text>
      <line x1="60" y1="60" x2="95" y2="40" strokeWidth="2" />
      <path d="M60 45 A15 15 0 0 1 73 53" strokeWidth="1.5" />
    </svg>
  ),

  // CIRCLE PARTS (9)
  arc: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" strokeWidth="1" strokeDasharray="3 4" />
      <path d="M60 20 A40 40 0 0 1 100 60" strokeWidth="3" />
    </svg>
  ),
  chord: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="52" r="38" />
      <line x1="35" y1="75" x2="85" y2="29" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="35" cy="75" r="3" fill="currentColor" />
      <circle cx="85" cy="29" r="3" fill="currentColor" />
      <text x="60" y="110" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">chord</text>
    </svg>
  ),
  sector: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" strokeWidth="1" strokeDasharray="3 4" />
      <path d="M60 60 L96 75 A40 40 0 0 0 96 45 Z" fill="currentColor" fillOpacity="0.18" />
      <line x1="60" y1="60" x2="96" y2="75" strokeWidth="1.5" />
      <line x1="60" y1="60" x2="96" y2="45" strokeWidth="1.5" />
      <path d="M96 75 A40 40 0 0 0 96 45" strokeWidth="2.5" />
    </svg>
  ),
  segment: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" strokeWidth="1" strokeDasharray="3 4" />
      <line x1="28" y1="82" x2="92" y2="38" />
      <path d="M28 82 A40 40 0 0 0 92 38" fill="currentColor" fillOpacity="0.18" />
    </svg>
  ),
  semicircle: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="20" y1="80" x2="100" y2="80" />
      <path d="M20 80 A40 40 0 0 0 100 80" />
      <line x1="20" y1="75" x2="100" y2="75" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <line x1="60" y1="76" x2="60" y2="80" strokeWidth="1" />
      <text x="62" y="74" fill="currentColor" stroke="none" fontSize="11" fontFamily="serif">diameter</text>
      <text x="60" y="100" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">half of a circle</text>
    </svg>
  ),
  circumference: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="55" r="38" strokeWidth="2.5" />
      <path d="M60 17 A38 38 0 0 1 65 17" strokeWidth="2" marker-end="url(#arrow)" />
      <polygon points="60,12 68,17 60,22" fill="currentColor" stroke="none" />
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">C = 2πr</text>
    </svg>
  ),
  radius: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" />
      <line x1="60" y1="60" x2="100" y2="60" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      <text x="80" y="54" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">r</text>
    </svg>
  ),
  diameter: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" />
      <line x1="20" y1="60" x2="100" y2="60" strokeWidth="2.5" />
      <text x="62" y="48" fill="currentColor" stroke="none" fontSize="16" fontFamily="serif" fontStyle="italic" textAnchor="middle">d</text>
      <line x1="60" y1="56" x2="60" y2="52" strokeWidth="1" />
    </svg>
  ),
  centre: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" />
      <circle cx="60" cy="60" r="4" fill="currentColor" />
    </svg>
  ),

  // TRIANGLES (4)
  "equilateral triangle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="60,25 100,94 20,94" />
      <path d="M36 57 l8 4 M76 61 l8 -4 M56 94 v-8" strokeWidth="1.5" />
    </svg>
  ),
  "isosceles triangle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="60,22 95,94 25,94" />
      <path d="M38 55 l8 4 M74 59 l8 -4" strokeWidth="1.5" />
    </svg>
  ),
  "scalene triangle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,30 100,55 40,98" />
    </svg>
  ),
  "right-angled triangle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" />
      <rect x="85" y="80" width="10" height="10" strokeWidth="1.5" />
    </svg>
  ),

  // TRANSFORMATIONS (10)
  reflection: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="60" y1="15" x2="60" y2="105" strokeWidth="1" strokeDasharray="4 3" />
      <polyline points="22,80 42,55 22,30" />
      <polyline points="98,80 78,55 98,30" />
    </svg>
  ),
  rotation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="35,75 55,40 75,75" />
      <path d="M75 75 A40 40 0 1 1 25 60" strokeDasharray="3 3" />
      <polygon points="22,55 28,55 25,65" fill="currentColor" />
      <circle cx="55" cy="80" r="2.5" fill="currentColor" />
    </svg>
  ),
  translation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15,75 35,40 55,75" />
      <polyline points="65,75 85,40 105,75" />
      <line x1="55" y1="60" x2="65" y2="60" strokeWidth="1.5" />
      <polygon points="62,57 68,60 62,63" fill="currentColor" />
    </svg>
  ),
  enlargement: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="20" cy="100" r="3" fill="currentColor" stroke="none" />
      <line x1="20" y1="100" x2="105" y2="15" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <line x1="20" y1="100" x2="105" y2="58" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <line x1="20" y1="100" x2="62" y2="100" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <rect x="35" y="70" width="20" height="20" />
      <rect x="60" y="30" width="45" height="45" strokeWidth="2.5" />
    </svg>
  ),
  transformation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="15,80 35,40 55,80" />
      <polygon points="65,80 85,40 105,80" />
      <line x1="55" y1="60" x2="65" y2="60" strokeWidth="1.5" />
      <polygon points="62,57 68,60 62,63" fill="currentColor" />
    </svg>
  ),
  "scale factor": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="12" y="50" width="18" height="22" />
      <rect x="48" y="35" width="32" height="52" />
      <rect x="92" y="22" width="18" height="78" />
      <text x="60" y="105" fill="currentColor" stroke="none" fontSize="11" fontFamily="serif" textAnchor="middle" opacity="0.7">&#215;1  &#215;2  &#215;3</text>
    </svg>
  ),
  symmetry: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="60" y1="15" x2="60" y2="105" strokeWidth="1" strokeDasharray="4 3" />
      <polygon points="60,20 95,95 25,95" strokeLinejoin="round" />
    </svg>
  ),
  tessellation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="22,22 60,22 60,60 22,60" />
      <polygon points="60,22 98,22 98,60 60,60" />
      <polygon points="98,22 110,40 110,60 98,60" />
      <polygon points="22,60 60,60 60,98 22,98" />
      <polygon points="60,60 98,60 98,98 60,98" />
      <polygon points="98,60 110,60 110,98 98,98" />
    </svg>
  ),
  net: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <rect x="47" y="15" width="26" height="26" />
      <rect x="21" y="41" width="26" height="26" />
      <rect x="47" y="41" width="26" height="26" />
      <rect x="73" y="41" width="26" height="26" />
      <rect x="47" y="67" width="26" height="26" />
      <rect x="47" y="93" width="26" height="26" />
    </svg>
  ),
  "cross-section": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="60" cy="25" rx="25" ry="10" />
      <line x1="35" y1="25" x2="35" y2="85" />
      <line x1="85" y1="25" x2="85" y2="85" />
      <ellipse cx="60" cy="85" rx="25" ry="10" strokeDasharray="3 3" opacity="0.5" />
      <path d="M35 85 A25 10 0 0 0 85 85" />
      <ellipse cx="60" cy="55" rx="25" ry="10" fill="currentColor" fillOpacity="0.15" strokeWidth="2.5" />
    </svg>
  ),

  // ALGEBRA (22)
  expression: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="24" fontFamily="serif">2x + 3y &#8722; 5</text>
    </svg>
  ),
  term: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <text x="60" y="72" fill="currentColor" stroke="none" textAnchor="middle" fontSize="28" fontFamily="serif">5x</text>
      <circle cx="60" cy="60" r="24" strokeDasharray="3 3" />
    </svg>
  ),
  "like terms": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="32" y="50" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">3x</text>
      <text x="88" y="50" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">5x</text>
      <text x="60" y="55" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">+</text>
      <text x="60" y="95" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">8x</text>
    </svg>
  ),
  equation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">3x + 2 = 11</text>
    </svg>
  ),
  inequality: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">x &gt; 5</text>
    </svg>
  ),
  formula: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">A = &#960;r&#178;</text>
    </svg>
  ),
  function: () => (
    <svg viewBox="0 0 135 120" className="glossary-visual" aria-hidden="true">
      <text x="67" y="72" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">f(x) = 2x + 1</text>
    </svg>
  ),
  linear: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="20" x2="15" y2="100" strokeWidth="1" />
      <line x1="15" y1="100" x2="105" y2="100" strokeWidth="1" />
      <line x1="20" y1="92" x2="100" y2="32" strokeWidth="2" />
    </svg>
  ),
  quadratic: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="60" y1="15" x2="60" y2="105" strokeWidth="1" opacity="0.3" />
      <line x1="15" y1="85" x2="105" y2="85" strokeWidth="1" opacity="0.3" />
      <path d="M22 25 Q60 95 98 25" strokeWidth="2.5" />
      <text x="60" y="110" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">ax² + bx + c</text>
    </svg>
  ),
  cubic: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="20" x2="15" y2="100" strokeWidth="1" />
      <line x1="15" y1="100" x2="105" y2="100" strokeWidth="1" />
      <path d="M18 60 C30 100 50 100 60 50 S90 0 102 60" />
    </svg>
  ),
  expand: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="60" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="15" fontFamily="serif">2(x+3) &#8594; 2x+6</text>
      <text x="60" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">multiply out</text>
    </svg>
  ),
  factorise: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="24" y="66" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">x²+5x</text>
      <line x1="48" y1="60" x2="64" y2="60" strokeWidth="1.5" />
      <polygon points="62,56 70,60 62,64" fill="currentColor" stroke="none" />
      <text x="96" y="66" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">x(x+5)</text>
    </svg>
  ),
  simplify: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="62" x2="48" y2="62" strokeWidth="2.5" />
      <text x="33" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">2</text>
      <text x="33" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">4</text>
      <line x1="56" y1="62" x2="70" y2="62" strokeWidth="1.5" />
      <polygon points="68,58 76,62 68,66" fill="currentColor" stroke="none" />
      <line x1="84" y1="62" x2="114" y2="62" strokeWidth="2.5" />
      <text x="99" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">1</text>
      <text x="99" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">2</text>
    </svg>
  ),
  solve: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="60" y="52" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">2x + 1 = 9</text>
      <text x="60" y="92" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif" fontWeight="700">x = 4</text>
      <line x1="60" y1="62" x2="60" y2="72" strokeWidth="2" />
      <polygon points="56,70 60,76 64,70" fill="currentColor" stroke="none" />
    </svg>
  ),
  root: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">x&#178; = 0</text>
    </svg>
  ),
  solution: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="48" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif" fontWeight="700">x = 5</text>
      <circle cx="94" cy="58" r="12" strokeWidth="2" />
      <polyline points="88,58 92,62 100,52" strokeWidth="2" />
    </svg>
  ),
  "y-intercept": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="60" x2="105" y2="60" strokeLinecap="round" />
      <line x1="60" y1="15" x2="60" y2="105" strokeLinecap="round" />
      <line x1="30" y1="10" x2="100" y2="80" strokeWidth="1" strokeDasharray="3 2" strokeLinecap="round" opacity="0.7" />
      <circle cx="60" cy="40" r="4" fill="currentColor" stroke="none" />
      <text x="76" y="44" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif">y-int</text>
    </svg>
  ),
  "x-intercept": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="60" x2="105" y2="60" strokeLinecap="round" />
      <line x1="60" y1="15" x2="60" y2="105" strokeLinecap="round" />
      <line x1="30" y1="10" x2="100" y2="80" strokeWidth="1" strokeDasharray="3 2" strokeLinecap="round" opacity="0.7" />
      <circle cx="80" cy="60" r="4" fill="currentColor" stroke="none" />
      <text x="80" y="80" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" textAnchor="middle">x-int</text>
    </svg>
  ),
  discriminant: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">b&#178; &#8722; 4ac</text>
    </svg>
  ),
  asymptote: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="60" x2="105" y2="60" strokeWidth="1" strokeDasharray="5 3" />
      <path d="M20 95 Q60 30 100 32" />
    </svg>
  ),
  "turning point": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 95 Q60 10 105 95" />
      <circle cx="60" cy="30" r="4" fill="currentColor" />
    </svg>
  ),
  "stationary point": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 95 C35 30 85 30 100 95" />
      <line x1="35" y1="42" x2="85" y2="42" strokeWidth="1.5" />
      <circle cx="60" cy="42" r="3" fill="currentColor" stroke="none" />
      <text x="60" y="110" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">m = 0</text>
    </svg>
  ),

  // NUMBER & ARITHMETIC (48)
  digit: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="84" fill="currentColor" textAnchor="middle" fontSize="50" fontFamily="monospace" fontWeight="600">18</text>
    </svg>
  ),
  integer: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="55" x2="105" y2="55" />
      <circle cx="25" cy="55" r="2.5" fill="currentColor" />
      <circle cx="40" cy="55" r="2.5" fill="currentColor" />
      <circle cx="55" cy="55" r="2.5" fill="currentColor" />
      <circle cx="70" cy="55" r="2.5" fill="currentColor" />
      <circle cx="85" cy="55" r="2.5" fill="currentColor" />
      <circle cx="100" cy="55" r="2.5" fill="currentColor" />
      <text x="25" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">-2</text>
      <text x="40" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">-1</text>
      <text x="55" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">0</text>
      <text x="70" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">1</text>
      <text x="85" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">2</text>
      <text x="100" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">3</text>
    </svg>
  ),
  fraction: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="35" y1="60" x2="85" y2="60" />
      <text x="60" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="28" fontFamily="serif">3</text>
      <text x="60" y="92" fill="currentColor" stroke="none" textAnchor="middle" fontSize="28" fontFamily="serif">4</text>
    </svg>
  ),
  decimal: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="40" fontFamily="serif">3.142</text>
    </svg>
  ),
  numerator: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="35" y1="62" x2="85" y2="62" />
      <text x="60" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="28" fontFamily="serif" fontWeight="700">3</text>
      <text x="60" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="28" fontFamily="serif" opacity="0.4">4</text>
      <text x="26" y="44" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="sans-serif">→</text>
    </svg>
  ),
  denominator: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="35" y1="62" x2="85" y2="62" />
      <text x="60" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="28" fontFamily="serif" opacity="0.4">3</text>
      <text x="60" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="28" fontFamily="serif" fontWeight="700">4</text>
      <text x="26" y="90" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="sans-serif">→</text>
    </svg>
  ),
  "proper fraction": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="35" y1="62" x2="85" y2="62" />
      <text x="60" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">3</text>
      <text x="60" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">4</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.6">top &lt; bottom</text>
    </svg>
  ),
  "improper fraction": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="35" y1="62" x2="85" y2="62" />
      <text x="60" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">5</text>
      <text x="60" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">4</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.6">top ≥ bottom</text>
    </svg>
  ),
  "mixed number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <text x="32" y="72" fill="currentColor" stroke="none" textAnchor="middle" fontSize="32" fontFamily="serif" fontWeight="600">2</text>
      <line x1="55" y1="62" x2="95" y2="62" />
      <text x="75" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="24" fontFamily="serif">3</text>
      <text x="75" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="24" fontFamily="serif">4</text>
    </svg>
  ),
  "equivalent fraction": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="62" x2="50" y2="62" />
      <text x="34" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">1</text>
      <text x="34" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">2</text>
      <text x="60" y="70" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">=</text>
      <line x1="70" y1="62" x2="102" y2="62" />
      <text x="86" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">2</text>
      <text x="86" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">4</text>
    </svg>
  ),
  "recurring decimal": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="60" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">0.333...</text>
      <line x1="47" y1="42" x2="80" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <text x="60" y="98" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">keeps going forever</text>
    </svg>
  ),
  "terminating decimal": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="32" fontFamily="serif">0.125</text>
    </svg>
  ),
  percent: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="42" fontFamily="serif">50%</text>
    </svg>
  ),
  percentage: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="40" />
      <path d="M60 60 L60 20 A40 40 0 0 1 99 70 Z" fill="currentColor" fillOpacity="0.25" />
    </svg>
  ),
  ratio: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="38" fontFamily="serif">3 : 1</text>
    </svg>
  ),
  proportion: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="62" x2="46" y2="62" strokeWidth="2.5" />
      <text x="32" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">a</text>
      <text x="32" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">b</text>
      <text x="60" y="70" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">=</text>
      <line x1="74" y1="62" x2="102" y2="62" strokeWidth="2.5" />
      <text x="88" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">c</text>
      <text x="88" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">d</text>
    </svg>
  ),

  BODMAS: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="50" fill="currentColor" textAnchor="middle" fontSize="18" fontFamily="serif" fontWeight="600">B &#183; O &#183; D &#183; M &#183; A &#183; S</text>
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">brackets, orders, &#247;, &#215;, +, &#8722;</text>
    </svg>
  ),
  sum: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="24" fontFamily="serif">17 + 18 = 35</text>
    </svg>
  ),
  product: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">6 &#215; 4 = 24</text>
    </svg>
  ),
  quotient: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">20 &#247; 4 = 5</text>
    </svg>
  ),
  difference: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">10 &#8722; 3 = 7</text>
    </svg>
  ),
  inverse: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="28" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="24" fontFamily="serif">+5</text>
      <line x1="48" y1="56" x2="66" y2="56" strokeWidth="1.5" />
      <polygon points="64,52 72,56 64,60" fill="currentColor" stroke="none" />
      <line x1="54" y1="68" x2="72" y2="68" strokeWidth="1.5" />
      <polygon points="56,64 48,68 56,72" fill="currentColor" stroke="none" />
      <text x="92" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="24" fontFamily="serif">−5</text>
    </svg>
  ),
  reciprocal: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">x &#215; &#8531; = 1</text>
    </svg>
  ),
  prime: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <text x="60" y="78" fill="currentColor" stroke="none" textAnchor="middle" fontSize="50" fontFamily="serif" fontWeight="600">7</text>
      <circle cx="60" cy="60" r="34" strokeDasharray="3 3" />
    </svg>
  ),
  "prime number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="58" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">2, 3, 5, 7, 11, 13&#8230;</text>
    </svg>
  ),
  composite: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="48" fontFamily="serif" fontWeight="600">12</text>
      <text x="60" y="98" fill="currentColor" textAnchor="middle" fontSize="14" fontFamily="serif" opacity="0.6">3 &#215; 4</text>
    </svg>
  ),
  divisor: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">12 &#247; 3 = 4</text>
      <text x="60" y="95" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">(3 is the divisor)</text>
    </svg>
  ),
  factor: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="65" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">3 &#215; 4 = 12</text>
      <text x="62" y="93" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">3 & 4 are factors of 12</text>
    </svg>
  ),
  multiple: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="50" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">3, 6, 9, 12, 15&#8230;</text>
      <text x="60" y="85" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">(multiples of 3)</text>
    </svg>
  ),
  approximation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">&#960; &#8776; 3.14</text>
    </svg>
  ),
  round: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">3.7 &#8776; 4</text>
      <text x="60" y="92" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">(to nearest whole)</text>
    </svg>
  ),
  "significant figures": () => (
    <svg viewBox="0 0 160 120" className="glossary-visual" aria-hidden="true">
      <text x="65" y="68" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">0.0523 &#8594; 0.05</text>
      <text x="60" y="92" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">(2 sig figs)</text>
    </svg>
  ),
  "decimal place": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">3.142</text>
      <text x="60" y="92" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">&#8594; 3rd decimal</text>
    </svg>
  ),
  exponent: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <text x="50" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="42" fontFamily="serif" opacity="0.3">2</text>
      <text x="75" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif" fontWeight="700">3</text>
      <text x="94" y="45" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="sans-serif">←</text>
    </svg>
  ),
  power: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="60" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="32" fontFamily="serif">2³ = 8</text>
      <text x="60" y="102" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">repeated multiplication</text>
    </svg>
  ),
  base: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <text x="50" y="75" fill="currentColor" stroke="none" textAnchor="middle" fontSize="42" fontFamily="serif" fontWeight="700">2</text>
      <text x="75" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif" opacity="0.3">4</text>
      <text x="24" y="70" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="sans-serif">→</text>
    </svg>
  ),
  "square root": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 66 h6 l6 20 l10 -42 h26" />
      <text x="52" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">9</text>
      <text x="90" y="66" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">= 3</text>
    </svg>
  ),
  "standard form": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">5.2 &#215; 10&#8308;</text>
    </svg>
  ),
  "scientific notation": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">6.02 &#215; 10&#178;&#179;</text>
    </svg>
  ),
  "natural number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">1, 2, 3, 4&#8230;</text>
    </svg>
  ),
  "whole number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">0, 1, 2, 3&#8230;</text>
    </svg>
  ),
  "rational number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="40" y1="60" x2="80" y2="60" />
      <text x="60" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">p</text>
      <text x="60" y="84" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">q</text>
    </svg>
  ),
  "irrational number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="44" fontFamily="serif">&#8730;2</text>
    </svg>
  ),
  "real number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="60" x2="105" y2="60" />
      <circle cx="20" cy="60" r="2" fill="currentColor" />
      <circle cx="35" cy="60" r="2" fill="currentColor" />
      <circle cx="50" cy="60" r="2" fill="currentColor" />
      <circle cx="70" cy="60" r="2" fill="currentColor" />
      <circle cx="85" cy="60" r="2" fill="currentColor" />
      <circle cx="100" cy="60" r="2" fill="currentColor" />
      <text x="20" y="80" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">-3</text>
      <text x="50" y="80" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">0</text>
      <text x="85" y="80" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">2</text>
      <text x="100" y="76" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">&#960;</text>
      <text x="60" y="100" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.6">all real numbers</text>
    </svg>
  ),
  consecutive: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">7, 8, 9, 10</text>
    </svg>
  ),
  positive: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="80" fill="currentColor" textAnchor="middle" fontSize="48" fontFamily="serif" fontWeight="600">+5</text>
    </svg>
  ),
  negative: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="80" fill="currentColor" textAnchor="middle" fontSize="48" fontFamily="serif" fontWeight="600">&#8722;5</text>
    </svg>
  ),
  "absolute value": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="38" fontFamily="serif">|&#8722;5| = 5</text>
    </svg>
  ),

  // STATISTICS (17)
  mean: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="50" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">x&#772;</text>
      <line x1="35" y1="60" x2="85" y2="60" stroke="currentColor" strokeWidth="2" />
      <text x="60" y="88" fill="currentColor" textAnchor="middle" fontSize="14" fontFamily="serif">sum &#247; count</text>
    </svg>
  ),
  median: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <circle cx="20" cy="80" r="5" fill="currentColor" />
      <circle cx="40" cy="80" r="5" fill="currentColor" />
      <circle cx="60" cy="80" r="9" fill="currentColor" />
      <circle cx="80" cy="80" r="5" fill="currentColor" />
      <circle cx="100" cy="80" r="5" fill="currentColor" />
      <text x="60" y="48" fill="currentColor" textAnchor="middle" fontSize="14" fontFamily="serif" opacity="0.6">middle</text>
    </svg>
  ),
  mode: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <circle cx="22" cy="80" r="5" fill="currentColor" />
      <circle cx="42" cy="80" r="5" fill="currentColor" />
      <circle cx="62" cy="80" r="9" fill="currentColor" />
      <circle cx="82" cy="80" r="5" fill="currentColor" />
      <circle cx="100" cy="55" r="9" fill="currentColor" />
      <circle cx="100" cy="105" r="9" fill="currentColor" />
      <text x="60" y="48" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">most common</text>
    </svg>
  ),
  range: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="60" x2="98" y2="60" />
      <polygon points="22,55 16,60 22,65" fill="currentColor" />
      <polygon points="98,55 104,60 98,65" fill="currentColor" />
      <text x="22" y="85" fill="currentColor" stroke="none" textAnchor="middle" fontSize="13" fontFamily="serif">min</text>
      <text x="98" y="85" fill="currentColor" stroke="none" textAnchor="middle" fontSize="13" fontFamily="serif">max</text>
    </svg>
  ),
  average: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="20" x2="15" y2="100" strokeWidth="1" />
      <line x1="15" y1="100" x2="105" y2="100" strokeWidth="1" />
      <path d="M18 88 Q35 50 60 55 Q85 60 102 28" />
      <circle cx="60" cy="55" r="4" fill="currentColor" />
    </svg>
  ),
  frequency: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="25" y="70" width="14" height="25" fill="currentColor" stroke="none" />
      <rect x="45" y="50" width="14" height="45" fill="currentColor" stroke="none" />
      <rect x="65" y="35" width="14" height="60" fill="currentColor" stroke="none" />
      <rect x="85" y="60" width="14" height="35" fill="currentColor" stroke="none" />
      <line x1="20" y1="95" x2="105" y2="95" />
    </svg>
  ),
  outlier: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <circle cx="22" cy="85" r="4" fill="currentColor" />
      <circle cx="40" cy="80" r="4" fill="currentColor" />
      <circle cx="58" cy="82" r="4" fill="currentColor" />
      <circle cx="76" cy="78" r="4" fill="currentColor" />
      <circle cx="96" cy="28" r="6" fill="currentColor" />
      <text x="96" y="18" fill="currentColor" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">outlier</text>
    </svg>
  ),
  sample: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="45" />
      <circle cx="38" cy="48" r="5" fill="currentColor" stroke="none" />
      <circle cx="68" cy="42" r="5" fill="currentColor" stroke="none" />
      <circle cx="58" cy="72" r="5" fill="currentColor" stroke="none" />
      <circle cx="85" cy="68" r="5" fill="currentColor" stroke="none" />
    </svg>
  ),
  population: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="45" />
      <circle cx="35" cy="42" r="3" fill="currentColor" stroke="none" />
      <circle cx="55" cy="38" r="3" fill="currentColor" stroke="none" />
      <circle cx="75" cy="42" r="3" fill="currentColor" stroke="none" />
      <circle cx="88" cy="58" r="3" fill="currentColor" stroke="none" />
      <circle cx="82" cy="78" r="3" fill="currentColor" stroke="none" />
      <circle cx="62" cy="82" r="3" fill="currentColor" stroke="none" />
      <circle cx="42" cy="76" r="3" fill="currentColor" stroke="none" />
      <circle cx="30" cy="62" r="3" fill="currentColor" stroke="none" />
      <circle cx="60" cy="60" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  correlation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="20" x2="15" y2="100" />
      <line x1="15" y1="100" x2="105" y2="100" />
      <circle cx="25" cy="85" r="3" fill="currentColor" stroke="none" />
      <circle cx="40" cy="75" r="3" fill="currentColor" stroke="none" />
      <circle cx="55" cy="65" r="3" fill="currentColor" stroke="none" />
      <circle cx="70" cy="50" r="3" fill="currentColor" stroke="none" />
      <circle cx="85" cy="40" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  "line of best fit": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="20" x2="15" y2="100" />
      <line x1="15" y1="100" x2="105" y2="100" />
      <circle cx="25" cy="80" r="3" fill="currentColor" stroke="none" />
      <circle cx="40" cy="85" r="3" fill="currentColor" stroke="none" />
      <circle cx="55" cy="65" r="3" fill="currentColor" stroke="none" />
      <circle cx="70" cy="55" r="3" fill="currentColor" stroke="none" />
      <circle cx="85" cy="40" r="3" fill="currentColor" stroke="none" />
      <line x1="22" y1="92" x2="92" y2="32" strokeWidth="2" />
    </svg>
  ),
  histogram: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="22" y="70" width="15" height="25" fill="currentColor" stroke="none" />
      <rect x="37" y="55" width="15" height="40" fill="currentColor" stroke="none" />
      <rect x="52" y="40" width="15" height="55" fill="currentColor" stroke="none" />
      <rect x="67" y="55" width="15" height="40" fill="currentColor" stroke="none" />
      <rect x="82" y="70" width="15" height="25" fill="currentColor" stroke="none" />
      <line x1="15" y1="95" x2="105" y2="95" />
    </svg>
  ),
  "scatter graph": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="20" x2="15" y2="100" />
      <line x1="15" y1="100" x2="105" y2="100" />
      <circle cx="25" cy="82" r="3" fill="currentColor" stroke="none" />
      <circle cx="38" cy="72" r="3" fill="currentColor" stroke="none" />
      <circle cx="50" cy="78" r="3" fill="currentColor" stroke="none" />
      <circle cx="62" cy="55" r="3" fill="currentColor" stroke="none" />
      <circle cx="75" cy="60" r="3" fill="currentColor" stroke="none" />
      <circle cx="85" cy="42" r="3" fill="currentColor" stroke="none" />
      <circle cx="92" cy="50" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  "bar chart": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="25" y="60" width="18" height="35" fill="currentColor" stroke="none" />
      <rect x="53" y="35" width="18" height="60" fill="currentColor" stroke="none" />
      <rect x="81" y="50" width="18" height="45" fill="currentColor" stroke="none" />
      <line x1="18" y1="95" x2="105" y2="95" />
    </svg>
  ),
  "pie chart": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="60" r="40" />
      <path d="M60 60 L60 20 A40 40 0 0 1 99 70 Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M60 60 L99 70 A40 40 0 0 1 35 92 Z" fill="currentColor" fillOpacity="0.6" />
    </svg>
  ),
  "line graph": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="20" x2="15" y2="100" />
      <line x1="15" y1="100" x2="105" y2="100" />
      <polyline points="22,88 38,72 54,55 70,60 86,40 100,28" strokeWidth="2" />
      <circle cx="38" cy="72" r="3" fill="currentColor" stroke="none" />
      <circle cx="54" cy="55" r="3" fill="currentColor" stroke="none" />
      <circle cx="70" cy="60" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  "stem and leaf": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="60" y1="20" x2="60" y2="100" />
      <text x="38" y="42" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">2</text>
      <text x="38" y="62" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">3</text>
      <text x="38" y="82" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">4</text>
      <text x="82" y="42" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">3 5 8</text>
      <text x="82" y="62" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">1 4</text>
      <text x="82" y="82" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">2 7</text>
    </svg>
  ),

  // PROBABILITY (10)
  outcome: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <rect x="35" y="35" width="50" height="50" rx="8" />
      <circle cx="50" cy="50" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="50" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="60" cy="60" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="70" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="70" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  event: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="20" width="80" height="80" rx="6" strokeDasharray="3 3" opacity="0.5" />
      <circle cx="45" cy="45" r="8" />
      <circle cx="75" cy="45" r="8" />
      <circle cx="50" cy="75" r="8" />
      <text x="60" y="114" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">set of outcomes</text>
    </svg>
  ),
  biased: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="90" x2="100" y2="90" />
      <line x1="60" y1="90" x2="60" y2="40" />
      <line x1="30" y1="55" x2="90" y2="25" />
      <circle cx="30" cy="55" r="5" fill="currentColor" stroke="none" />
      <circle cx="90" cy="25" r="10" fill="currentColor" stroke="none" />
    </svg>
  ),
  fair: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="90" x2="100" y2="90" />
      <line x1="60" y1="90" x2="60" y2="40" />
      <line x1="30" y1="40" x2="90" y2="40" />
      <circle cx="30" cy="40" r="6" fill="currentColor" stroke="none" />
      <circle cx="90" cy="40" r="6" fill="currentColor" stroke="none" />
    </svg>
  ),
  "tree diagram": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="18" r="4" fill="currentColor" stroke="none" />
      <line x1="60" y1="22" x2="32" y2="55" />
      <line x1="60" y1="22" x2="88" y2="55" />
      <line x1="32" y1="55" x2="18" y2="95" />
      <line x1="32" y1="55" x2="48" y2="95" />
      <line x1="88" y1="55" x2="72" y2="95" />
      <line x1="88" y1="55" x2="102" y2="95" />
      <circle cx="32" cy="55" r="3" fill="currentColor" stroke="none" />
      <circle cx="88" cy="55" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  "Venn diagram": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="46" cy="60" r="26" fill="currentColor" fillOpacity="0.15" />
      <circle cx="74" cy="60" r="26" fill="currentColor" fillOpacity="0.15" />
      <text x="30" y="32" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="600">A</text>
      <text x="90" y="32" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="600">B</text>
    </svg>
  ),
  "mutually exclusive": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="36" cy="60" r="22" fill="currentColor" fillOpacity="0.1" />
      <circle cx="84" cy="60" r="22" fill="currentColor" fillOpacity="0.1" />
      <text x="36" y="32" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="600">A</text>
      <text x="84" y="32" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="600">B</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">no overlap</text>
    </svg>
  ),
  independent: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="46" cy="55" r="25" />
      <circle cx="74" cy="55" r="25" />
      <text x="32" y="26" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="600">A</text>
      <text x="88" y="26" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="600">B</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">P(A and B) = P(A)×P(B)</text>
    </svg>
  ),
  "relative frequency": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="30" y1="62" x2="90" y2="62" />
      <text x="60" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="24" fontFamily="serif">f</text>
      <text x="60" y="85" fill="currentColor" stroke="none" textAnchor="middle" fontSize="24" fontFamily="serif">n</text>
    </svg>
  ),
  trial: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <text x="60" y="72" fill="currentColor" stroke="none" textAnchor="middle" fontSize="38" fontFamily="serif">1&#215;</text>
      <text x="60" y="100" fill="currentColor" stroke="none" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">one run</text>
    </svg>
  ),

  // TRIG (15)
  trigonometry: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" />
      <rect x="85" y="80" width="10" height="10" strokeWidth="1.5" />
      <path d="M45 90 A20 20 0 0 0 40 77" strokeWidth="1.5" />
      <text x="52" y="84" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif">θ</text>
    </svg>
  ),
  sine: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" opacity="0.2" />
      <line x1="25" y1="90" x2="95" y2="30" strokeWidth="3.5" />
      <line x1="95" y1="30" x2="95" y2="90" strokeWidth="3.5" />
      <text x="104" y="64" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="700">O</text>
      <text x="54" y="50" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="700">H</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">sin θ = O / H</text>
    </svg>
  ),
  cosine: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" opacity="0.2" />
      <line x1="25" y1="90" x2="95" y2="30" strokeWidth="3.5" />
      <line x1="25" y1="90" x2="95" y2="90" strokeWidth="3.5" />
      <text x="60" y="104" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="700">A</text>
      <text x="54" y="50" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="700">H</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">cos θ = A / H</text>
    </svg>
  ),
  "tangent ratio": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" opacity="0.2" />
      <line x1="25" y1="90" x2="95" y2="90" strokeWidth="3.5" />
      <line x1="95" y1="30" x2="95" y2="90" strokeWidth="3.5" />
      <text x="104" y="64" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="700">O</text>
      <text x="60" y="104" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="700">A</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">tan θ = O / A</text>
    </svg>
  ),
  opposite: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" opacity="0.2" />
      <line x1="95" y1="30" x2="95" y2="90" strokeWidth="3.5" />
      <path d="M45 90 A20 20 0 0 0 40 77" strokeWidth="1.5" />
      <text x="52" y="84" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif">θ</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="600">Opposite side</text>
    </svg>
  ),
  adjacent: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" opacity="0.2" />
      <line x1="25" y1="90" x2="95" y2="90" strokeWidth="3.5" />
      <path d="M45 90 A20 20 0 0 0 40 77" strokeWidth="1.5" />
      <text x="52" y="84" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif">θ</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="600">Adjacent side</text>
    </svg>
  ),
  hypotenuse: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="25,90 95,90 95,30" opacity="0.2" />
      <line x1="25" y1="90" x2="95" y2="30" strokeWidth="3.5" />
      <rect x="85" y="80" width="10" height="10" strokeWidth="1.5" />
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" fontWeight="600">Hypotenuse</text>
    </svg>
  ),
  "angle of elevation": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="25" y1="90" x2="105" y2="90" strokeDasharray="3 3" opacity="0.5" />
      <line x1="25" y1="90" x2="95" y2="35" />
      <path d="M55 90 A30 30 0 0 0 51 69" strokeWidth="1.5" />
      <text x="62" y="84" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif">θ</text>
      <text x="96" y="28" fill="currentColor" stroke="none" fontSize="20" fontFamily="sans-serif">↑</text>
    </svg>
  ),
  "angle of depression": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="25" y1="35" x2="105" y2="35" strokeDasharray="3 3" opacity="0.5" />
      <line x1="25" y1="35" x2="95" y2="90" />
      <path d="M55 35 A30 30 0 0 1 51 56" strokeWidth="1.5" />
      <text x="62" y="48" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif">θ</text>
      <text x="96" y="98" fill="currentColor" stroke="none" fontSize="20" fontFamily="sans-serif">↓</text>
    </svg>
  ),
  "sine rule": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="15" y1="62" x2="48" y2="62" strokeWidth="2" />
      <text x="31" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">a</text>
      <text x="31" y="90" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">sin A</text>
      <text x="60" y="70" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">=</text>
      <line x1="72" y1="62" x2="105" y2="62" strokeWidth="2" />
      <text x="88" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">b</text>
      <text x="88" y="90" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">sin B</text>
    </svg>
  ),
  "cosine rule": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="60" y="56" fill="currentColor" stroke="none" textAnchor="middle" fontSize="16" fontFamily="serif">c² = a² + b²</text>
      <text x="60" y="84" fill="currentColor" stroke="none" textAnchor="middle" fontSize="16" fontFamily="serif">− 2ab cos C</text>
    </svg>
  ),
  "inverse sine": () => (
    <svg viewBox="0 0 130 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="65" y="58" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">sin⁻¹(0.5) = 30°</text>
      <text x="60" y="92" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">finds angle from ratio</text>
    </svg>
  ),
  "inverse cosine": () => (
    <svg viewBox="0 0 130 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="65" y="58" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">cos⁻¹(0.5) = 60°</text>
      <text x="60" y="92" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">finds angle from ratio</text>
    </svg>
  ),
  "inverse tangent": () => (
    <svg viewBox="0 0 130 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="65" y="58" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">tan⁻¹(1) = 45°</text>
      <text x="60" y="92" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">finds angle from ratio</text>
    </svg>
  ),

  // CALCULUS (15)
  calculus: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="80" fill="currentColor" textAnchor="middle" fontSize="48" fontFamily="serif">&#8747;</text>
      <text x="60" y="30" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">study of change</text>
    </svg>
  ),
  limit: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="32" fontFamily="serif">lim<tspan fontSize="22" baselineShift="sub">x&#8594;2</tspan></text>
    </svg>
  ),
  differentiation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="58" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">d/dx</text>
      <text x="60" y="86" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">rate of change</text>
    </svg>
  ),
  derivative: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">f &#8242;(x)</text>
    </svg>
  ),
  differentiate: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="20" y="40" width="35" height="40" rx="4" />
      <text x="37" y="64" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" fontStyle="italic">f(x)</text>
      <line x1="60" y1="60" x2="75" y2="60" strokeWidth="1.5" />
      <polygon points="70,55 78,60 70,65" fill="currentColor" stroke="none" />
      <rect x="80" y="40" width="35" height="40" rx="4" />
      <text x="97" y="64" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" fontStyle="italic">f&#8242;(x)</text>
      <text x="97" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif">d/dx</text>
      <text x="60" y="100" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.6">find the derivative</text>
    </svg>
  ),
  "gradient function": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M30 85 C40 35 80 35 90 85" />
      <circle cx="45" cy="58" r="3" fill="currentColor" stroke="none" />
      <line x1="28" y1="78" x2="63" y2="36" strokeWidth="1.5" />
      <text x="60" y="110" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">dy/dx</text>
    </svg>
  ),
  maximum: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 95 Q60 10 105 95" />
      <circle cx="60" cy="28" r="4" fill="currentColor" />
      <text x="60" y="22" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">max</text>
    </svg>
  ),
  minimum: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 30 Q60 110 105 30" />
      <circle cx="60" cy="95" r="4" fill="currentColor" />
      <text x="60" y="108" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">min</text>
    </svg>
  ),
  "point of inflection": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 95 C30 30 50 30 60 60 C70 90 90 90 105 25" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
    </svg>
  ),
  integration: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M40 90 L40 30 C50 10, 70 10, 80 30 L80 90 C70 110, 50 110, 40 90" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
      <path d="M40 90 L80 90 M40 30 L80 30" strokeWidth="1" opacity="0.2" />
      <path d="M45 80 Q60 50, 75 40" strokeWidth="2.5" />
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">area under curve</text>
    </svg>
  ),
  integral: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="35" y="72" fill="currentColor" stroke="none" textAnchor="middle" fontSize="42" fontFamily="serif" fontWeight="300">∫</text>
      <text x="72" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">2x dx</text>
    </svg>
  ),
  integrate: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="24" y="66" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">2x</text>
      <line x1="46" y1="60" x2="64" y2="60" strokeWidth="1.5" />
      <polygon points="62,56 70,60 62,64" fill="currentColor" stroke="none" />
      <text x="96" y="66" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">x² + C</text>
    </svg>
  ),
  "definite integral": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="32" y="72" fill="currentColor" stroke="none" textAnchor="middle" fontSize="42" fontFamily="serif" fontWeight="300">∫</text>
      <text x="44" y="44" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="700">b</text>
      <text x="42" y="82" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="700">a</text>
      <text x="76" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">f(x)dx</text>
    </svg>
  ),
  antiderivative: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="60" y="52" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">F′(x) = f(x)</text>
      <line x1="60" y1="64" x2="60" y2="76" strokeWidth="1.5" />
      <polygon points="56,66 60,60 64,66" fill="currentColor" stroke="none" />
      <text x="60" y="100" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif" fontWeight="700">F(x)</text>
    </svg>
  ),

  // VECTORS & MATRICES (14)
  scalar: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="76" fill="currentColor" textAnchor="middle" fontSize="44" fontFamily="serif">5</text>
      <text x="60" y="100" fill="currentColor" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">(just a number)</text>
    </svg>
  ),
  displacement: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <polygon points="1,1 5,3 1,5" fill="currentColor" stroke="none" />
        </marker>
      </defs>
      <line x1="25" y1="95" x2="90" y2="30" marker-end="url(#arrow)" />
      <circle cx="25" cy="95" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  vector: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <polygon points="1,1 5,3 1,5" fill="currentColor" stroke="none" />
        </marker>
      </defs>
      <line x1="25" y1="95" x2="90" y2="30" marker-end="url(#arrow)" />
    </svg>
  ),
  magnitude: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <polygon points="1,1 5,3 1,5" fill="currentColor" stroke="none" />
        </marker>
      </defs>
      <line x1="25" y1="95" x2="90" y2="30" marker-end="url(#arrow)" />
      <text x="50" y="52" fill="currentColor" stroke="none" font-size="16" font-family="serif" font-weight="bold" text-anchor="middle" transform="rotate(-45 50 52)">|v|</text>
    </svg>
  ),
  "dot product": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="38" fontFamily="serif">a &#183; b</text>
    </svg>
  ),
  "scalar product": () => (
    <svg viewBox="0 0 150 110" className="glossary-visual" aria-hidden="true" fill="currentColor">
      <text x="50%" y="55%" font-family="monospace, sans-serif" font-size="14" font-weight="bold" text-anchor="middle"> a · b = |a||b|cosθ</text>
    </svg>
  ),
  row: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="18" y="48" width="84" height="24" />
      <line x1="32" y1="50" x2="32" y2="70" />
      <line x1="46" y1="50" x2="46" y2="70" />
      <line x1="60" y1="50" x2="60" y2="70" />
      <line x1="74" y1="50" x2="74" y2="70" />
      <line x1="88" y1="50" x2="88" y2="70" />
      <text x="25" y="65" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">3</text>
      <text x="39" y="65" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">1</text>
      <text x="53" y="65" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">7</text>
      <text x="67" y="65" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">5</text>
      <text x="81" y="65" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">2</text>
      <text x="95" y="65" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">9</text>
    </svg>
  ),
  column: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="45" y="18" width="30" height="84" />
      <line x1="47" y1="32" x2="73" y2="32" />
      <line x1="47" y1="46" x2="73" y2="46" />
      <line x1="47" y1="60" x2="73" y2="60" />
      <line x1="47" y1="74" x2="73" y2="74" />
      <line x1="47" y1="88" x2="73" y2="88" />
      <text x="60" y="29" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">a</text>
      <text x="60" y="43" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">b</text>
      <text x="60" y="57" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">c</text>
      <text x="60" y="71" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">d</text>
      <text x="60" y="85" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">e</text>
      <text x="60" y="99" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">f</text>
    </svg>
  ),
  order: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="42" fontFamily="serif">2 &#215; 3</text>
      <text x="60" y="98" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">rows &#215; columns</text>
    </svg>
  ),
  "identity matrix": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="30" y="30" width="60" height="60" />
      <line x1="50" y1="30" x2="50" y2="90" />
      <line x1="70" y1="30" x2="70" y2="90" />
      <line x1="30" y1="50" x2="90" y2="50" />
      <line x1="30" y1="70" x2="90" y2="70" />
      <text x="40" y="48" fill="currentColor" stroke="none" fontSize="18" fontFamily="serif" textAnchor="middle">1</text>
      <text x="60" y="48" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle" opacity="0.3">0</text>
      <text x="80" y="48" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle" opacity="0.3">0</text>
      <text x="40" y="68" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle" opacity="0.3">0</text>
      <text x="60" y="68" fill="currentColor" stroke="none" fontSize="18" fontFamily="serif" textAnchor="middle">1</text>
      <text x="80" y="68" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle" opacity="0.3">0</text>
      <text x="40" y="88" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle" opacity="0.3">0</text>
      <text x="60" y="88" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif" textAnchor="middle" opacity="0.3">0</text>
      <text x="80" y="88" fill="currentColor" stroke="none" fontSize="18" fontFamily="serif" textAnchor="middle">1</text>
    </svg>
  ),
  "inverse matrix": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="40" fontFamily="serif">A<tspan fontSize="28" baselineShift="super">&#8722;1</tspan></text>
    </svg>
  ),
  transpose: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="40" fontFamily="serif">A<tspan fontSize="28" baselineShift="super">T</tspan></text>
    </svg>
  ),
  determinant: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="48" fontFamily="serif">|A|</text>
    </svg>
  ),

  // SETS (8)
  set: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="34" fontFamily="serif">&#123;a, b, c&#125;</text>
    </svg>
  ),
  element: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="36" fontFamily="serif">a &#8712; A</text>
    </svg>
  ),
  subset: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="36" fontFamily="serif">B &#8838; A</text>
    </svg>
  ),
  "empty set": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="80" fill="currentColor" textAnchor="middle" fontSize="56" fontFamily="serif">&#8709;</text>
    </svg>
  ),
  "universal set": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="22" y="25" width="76" height="70" />
      <text x="32" y="48" fill="currentColor" stroke="none" fontSize="18" fontFamily="serif">U</text>
    </svg>
  ),
  union: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="38" fontFamily="serif">A &#8746; B</text>
    </svg>
  ),
  intersection: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="38" fontFamily="serif">A &#8745; B</text>
    </svg>
  ),
  complement: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="38" fontFamily="serif">A<tspan fontSize="22" baselineShift="super">c</tspan></text>
    </svg>
  ),

  // LOGS / EXPONENTIALS (5)
  logarithm: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="60" y="62" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif">log₂ (8) = 3</text>
      <text x="60" y="94" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">because 2³ = 8</text>
    </svg>
  ),
  log: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="60" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif">log(x)</text>
    </svg>
  ),
  exponential: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="20" y1="20" x2="20" y2="100" strokeWidth="1" opacity="0.4" />
      <line x1="20" y1="100" x2="105" y2="100" strokeWidth="1" opacity="0.4" />
      <path d="M22 96 Q55 96 65 75 Q80 40 100 20" strokeWidth="2.5" />
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">y = aˣ</text>
    </svg>
  ),
  "exponential growth": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="20" y1="20" x2="20" y2="100" strokeWidth="1" opacity="0.4" />
      <line x1="20" y1="100" x2="105" y2="100" strokeWidth="1" opacity="0.4" />
      <path d="M22 96 Q55 96 65 75 Q80 40 100 20" strokeWidth="2.5" />
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">rapid increase</text>
    </svg>
  ),
  "exponential decay": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="20" y1="20" x2="20" y2="100" strokeWidth="1" opacity="0.4" />
      <line x1="20" y1="100" x2="105" y2="100" strokeWidth="1" opacity="0.4" />
      <path d="M22 20 Q42 80 55 90 Q75 96 100 96" strokeWidth="2.5" />
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">rapid decrease</text>
    </svg>
  ),

  // MONEY (9)
  profit: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="60" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="38" fontFamily="serif" fontWeight="700">+$50</text>
      <text x="60" y="102" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">revenue &gt; cost</text>
    </svg>
  ),
  loss: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="60" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="38" fontFamily="serif" fontWeight="700">−$30</text>
      <text x="60" y="102" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">cost &gt; revenue</text>
    </svg>
  ),
  revenue: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <text x="60" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="26" fontFamily="serif" fontWeight="600">Total $ In</text>
      <text x="60" y="102" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">before expenses</text>
    </svg>
  ),
  discount: () => (
    <svg viewBox="0 0 150 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="32" fontFamily="serif">$100 &#8594; $80</text>
      <text x="60" y="93" fill="currentColor" textAnchor="middle" fontSize="14" fontFamily="serif" opacity="0.6">20% off</text>
    </svg>
  ),
  interest: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <circle cx="60" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="60" y="55" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif">$</text>
      <text x="60" y="82" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif">interest</text>
      <text x="60" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">paid for borrowing</text>
    </svg>
  ),
  "simple interest": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">I = P &#215; r &#215; t</text>
    </svg>
  ),
  "compound interest": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="20" fontFamily="serif">A = P(1 + r)&#8319;</text>
      <text x="60" y="93" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">interest earns interest</text>
    </svg>
  ),
  principal: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="36" fontFamily="serif">P</text>
      <text x="60" y="92" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">the starting amount</text>
      <line x1="30" y1="68" x2="90" y2="68" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  ),
  depreciation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="100" strokeWidth="1" />
      <line x1="18" y1="100" x2="100" y2="100" strokeWidth="1" />
      <path d="M20 30 C40 38 60 55 80 70 L95 90" strokeWidth="2" />
      <text x="80" y="85" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif">value</text>
    </svg>
  ),

  // MEASUREMENT (5)
  speed: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">60 km/h</text>
      <text x="60" y="94" fill="currentColor" textAnchor="middle" fontSize="13" fontFamily="serif" opacity="0.6">distance &#247; time</text>
    </svg>
  ),
  distance: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="60" x2="98" y2="60" />
      <polygon points="22,55 16,60 22,65" fill="currentColor" />
      <polygon points="98,55 104,60 98,65" fill="currentColor" />
      <text x="60" y="50" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif" textAnchor="middle">d</text>
    </svg>
  ),
  time: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="30" />
      <line x1="60" y1="60" x2="60" y2="42" strokeWidth="1.5" />
      <line x1="60" y1="60" x2="75" y2="60" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="2" fill="currentColor" />
    </svg>
  ),
  rate: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="26" fontFamily="serif">5 per 1</text>
      <text x="60" y="94" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">a comparison</text>
    </svg>
  ),
  unit: () => (
    <svg viewBox="0 0 140 120" className="glossary-visual" aria-hidden="true">
      <text x="67" y="68" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">m, kg, s, &#176;C&#8230;</text>
      <text x="60" y="94" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">standard of measurement</text>
    </svg>
  ),

  // ADDITIONAL CURATED TERMS (15)
  area: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="20" y="30" width="80" height="60" />
      <line x1="40" y1="30" x2="40" y2="90" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="60" y1="30" x2="60" y2="90" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="80" y1="30" x2="80" y2="90" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="20" y1="50" x2="100" y2="50" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="20" y1="70" x2="100" y2="70" strokeWidth="1" strokeDasharray="2 2" />
      <text x="60" y="66" fill="currentColor" stroke="none" fontSize="16" fontFamily="serif" textAnchor="middle" fontWeight="bold">Area</text>
    </svg>
  ),
  coefficient: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="44" fontFamily="serif" fontWeight="700">3x</text>
      <text x="60" y="100" fill="currentColor" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">the 3 multiplies x</text>
    </svg>
  ),
  congruent: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="15,75 50,75 32.5,40" />
      <polygon points="70,75 105,75 87.5,40" />
      <text x="60" y="62" fill="currentColor" stroke="none" textAnchor="middle" fontSize="16" fontFamily="sans-serif" fontWeight="bold">≅</text>
      <text x="60" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">same shape and size</text>
    </svg>
  ),
  gradient: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="20" x2="15" y2="100" strokeWidth="1" />
      <line x1="15" y1="100" x2="105" y2="100" strokeWidth="1" />
      <line x1="22" y1="88" x2="100" y2="32" strokeWidth="2.5" />
      <text x="65" y="50" fill="currentColor" stroke="none" fontSize="15" fontFamily="serif" textAnchor="middle" transform="rotate(-43 65 50)">m</text>
    </svg>
  ),
  matrix: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="30" y="25" width="60" height="70" />
      <line x1="50" y1="25" x2="50" y2="95" />
      <line x1="70" y1="25" x2="70" y2="95" />
      <line x1="30" y1="48" x2="90" y2="48" />
      <line x1="30" y1="72" x2="90" y2="72" />
    </svg>
  ),
  perimeter: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="25" y="25" width="70" height="70" rx="4" />
      <path d="M25 15 H95" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <path d="M25 12 V18 M95 12 V18" strokeWidth="1" opacity="0.4" />
      <text x="60" y="12" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.5">P = sum of all sides</text>
      <path d="M40 25 H80" strokeWidth="4" />
      <path d="M95 40 V80" strokeWidth="4" />
      <path d="M80 95 H40" strokeWidth="4" />
      <path d="M25 80 V40" strokeWidth="4" />
    </svg>
  ),
  polynomial: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">2x&#178; + 3x &#8722; 1</text>
    </svg>
  ),
  probability: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="20" y1="62" x2="100" y2="62" />
      <text x="60" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">favourable</text>
      <text x="60" y="84" fill="currentColor" stroke="none" textAnchor="middle" fontSize="18" fontFamily="serif">total</text>
    </svg>
  ),
  sequence: () => (
    <svg viewBox="0 0 130 120" className="glossary-visual" aria-hidden="true">
      <text x="70" y="72" fill="currentColor" textAnchor="middle" fontSize="22" fontFamily="serif">2, 4, 8, 16, 32&#8230;</text>
      <text x="60" y="98" fill="currentColor" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">in order</text>
    </svg>
  ),
  similar: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="15,75 40,75 27,42" />
      <polygon points="65,90 105,90 85,42" />
    </svg>
  ),
  surd: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="78" fill="currentColor" textAnchor="middle" fontSize="44" fontFamily="serif">&#8730;3</text>
    </svg>
  ),
  "surface area": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="60,15 95,35 60,55 25,35" strokeDasharray="3 3" opacity="0.6" />
      <polygon points="25,35 60,55 60,95 25,75" strokeDasharray="3 3" opacity="0.6" />
      <polygon points="60,55 95,35 95,75 60,95" fill="currentColor" fillOpacity="0.15" strokeWidth="2.5" />
      <text x="60" y="114" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">total area of all faces</text>
    </svg>
  ),
  variable: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="80" fill="currentColor" textAnchor="middle" fontSize="56" fontFamily="serif" fontStyle="italic">x</text>
    </svg>
  ),
  vertex: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="60,18 100,98 20,98" />
      <circle cx="60" cy="18" r="4" fill="currentColor" />
    </svg>
  ),
  volume: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="60,15 95,35 60,55 25,35" />
      <polygon points="25,35 60,55 60,95 25,75" />
      <polygon points="60,55 95,35 95,75 60,95" />
      <text x="34" y="94" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" textAnchor="middle">l</text>
      <text x="84" y="92" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" textAnchor="middle">w</text>
      <text x="52" y="78" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" textAnchor="middle">h</text>
      <text x="60" y="114" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">V = l × w × h</text>
    </svg>
  ),

  // PHASE 2 NEW CURATED TERMS (16)
  ellipse: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="60" cy="60" rx="42" ry="26" />
    </svg>
  ),
  parabola: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 85 Q60 25 100 85" />
      <line x1="60" y1="15" x2="60" y2="100" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <line x1="15" y1="85" x2="105" y2="85" strokeWidth="1" opacity="0.4" />
      <circle cx="60" cy="25" r="3" fill="currentColor" stroke="none" />
      <circle cx="60" cy="42" r="2.5" fill="currentColor" stroke="none" />
      <text x="50" y="46" fill="currentColor" stroke="none" fontSize="11" fontFamily="serif">F</text>
      <text x="60" y="18" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">vertex</text>
    </svg>
  ),
  hyperbola: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="15" y1="60" x2="105" y2="60" strokeWidth="1" opacity="0.4" />
      <line x1="60" y1="20" x2="60" y2="100" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <path d="M20 25 Q50 60 20 95" />
      <path d="M100 25 Q70 60 100 95" />
      <circle cx="28" cy="60" r="2.5" fill="currentColor" stroke="none" />
      <text x="28" y="52" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">F₁</text>
      <circle cx="92" cy="60" r="2.5" fill="currentColor" stroke="none" />
      <text x="92" y="52" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif">F₂</text>
      <circle cx="60" cy="60" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  focus: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="60" cy="60" rx="42" ry="26" />
      <circle cx="60" cy="60" r="3" fill="currentColor" stroke="none" />
      <circle cx="40" cy="60" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  directrix: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M 25 25 Q 60 75 95 25" opacity="0.4" strokeWidth="1.5" />
      <circle cx="60" cy="38" r="3" fill="currentColor" stroke="none" />
      <line x1="15" y1="88" x2="105" y2="88" strokeDasharray="4 3" strokeWidth="2.5" />
      <text x="60" y="106" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.7">directrix line</text>
    </svg>
  ),
  "complex number": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="32" fontFamily="serif">a + bi</text>
    </svg>
  ),
  binomial: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="32" fontFamily="serif">(a + b)</text>
    </svg>
  ),
  share: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="60" r="40" />
      <path d="M60 60 L60 20 A40 40 0 0 1 99 70 Z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
  dividend: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="25" y="25" width="50" height="62" rx="4" />
      <line x1="37" y1="42" x2="63" y2="42" strokeWidth="1.5" opacity="0.4" />
      <line x1="37" y1="54" x2="55" y2="54" strokeWidth="1.5" opacity="0.4" />
      <path d="M60 68 Q82 68 86 82" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx="86" cy="92" r="11" fill="currentColor" fillOpacity="0.15" strokeWidth="2.5" />
      <text x="86" y="96" fill="currentColor" stroke="none" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fontWeight="700">$</text>
    </svg>
  ),
  variation: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="20" x2="15" y2="100" strokeWidth="1" />
      <line x1="15" y1="100" x2="105" y2="100" strokeWidth="1" />
      <path d="M20 92 Q60 50 100 18" strokeWidth="2" />
    </svg>
  ),
  domain: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="15" y1="60" x2="105" y2="60" />
      <line x1="35" y1="55" x2="35" y2="65" />
      <line x1="85" y1="55" x2="85" y2="65" />
      <line x1="35" y1="48" x2="85" y2="48" stroke="currentColor" strokeWidth="3" opacity="0.4" />
      <text x="35" y="85" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif">-3</text>
      <text x="85" y="85" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif">+5</text>
    </svg>
  ),
  input: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="52" y="40" width="48" height="40" rx="4" />
      <line x1="15" y1="60" x2="52" y2="60" strokeWidth="2.5" />
      <polygon points="44,55 52,60 44,65" fill="currentColor" stroke="none" />
      <text x="28" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="600">x</text>
      <text x="76" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" opacity="0.5">f(x)</text>
    </svg>
  ),
  output: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="20" y="40" width="48" height="40" rx="4" />
      <line x1="68" y1="60" x2="105" y2="60" strokeWidth="2.5" />
      <polygon points="97,55 105,60 97,65" fill="currentColor" stroke="none" />
      <text x="44" y="65" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" opacity="0.5">f(x)</text>
      <text x="92" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="600">y</text>
    </svg>
  ),
  // MISSING VISUALS (14) appended to fill gaps in V (cleaned)
  quadrant: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="60" x2="105" y2="60" />
      <line x1="60" y1="15" x2="60" y2="105" />
      <text x="30" y="32" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif">II</text>
      <text x="86" y="32" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif">I</text>
      <text x="30" y="94" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif">III</text>
      <text x="86" y="94" fill="currentColor" stroke="none" fontSize="13" fontFamily="serif">IV</text>
    </svg>
  ),
  remainder: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor">
      <text x="60" y="52" fill="currentColor" stroke="none" textAnchor="middle" fontSize="24" fontFamily="serif">17 ÷ 5 = 3</text>
      <text x="60" y="90" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif" fontWeight="700">R: 2</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">leftover amount</text>
    </svg>
  ),
  tangent: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="35" />
      <line x1="95" y1="20" x2="95" y2="100" />
      <circle cx="95" cy="60" r="2.5" fill="currentColor" />
      <text x="104" y="64" fill="currentColor" stroke="none" fontSize="14" fontFamily="serif">P</text>
    </svg>
  ),
  rhombus: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="60,20 95,60 60,100 25,60" />
    </svg>
  ),
  kite: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="60,20 95,45 60,100 25,45" />
      <line x1="25" y1="45" x2="95" y2="45" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="60" y1="20" x2="60" y2="100" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  ),
  bisector: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 100 L100 100" />
      <path d="M20 100 L80 30" />
      <path d="M20 100 L95 65" strokeDasharray="3 3" />
      <path d="M45 100 A25 25 0 0 0 43 85" strokeWidth="1" />
      <path d="M43 85 A25 25 0 0 0 38 71" strokeWidth="1" />
      <text x="50" y="93" fill="currentColor" stroke="none" fontSize="10">a</text>
      <text x="44" y="78" fill="currentColor" stroke="none" fontSize="10">a</text>
    </svg>
  ),
  edge: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22,40 60,22 88,40 50,58" />
      <polygon points="22,40 22,82 50,100 50,58" />
      <polygon points="50,58 88,40 88,82 50,100" />
      <line x1="35" y1="35" x2="68" y2="30" strokeWidth="2.5" />
    </svg>
  ),
  face: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22,40 60,22 88,40 50,58" />
      <polygon points="22,40 22,82 50,100 50,58" />
      <polygon points="50,58 88,40 88,82 50,100" />
      <text x="55" y="55" fill="currentColor" stroke="none" fontSize="11" fontFamily="serif">face</text>
    </svg>
  ),
  secant: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="30" />
      <line x1="15" y1="60" x2="105" y2="30" strokeWidth="2.5" />
      <circle cx="30" cy="60" r="3" fill="currentColor" />
      <circle cx="80" cy="46" r="3" fill="currentColor" />
    </svg>
  ),
  "line of symmetry": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="60" y1="15" x2="60" y2="105" strokeDasharray="4 3" />
      <path d="M30 50 Q30 25 60 25 Q90 25 90 50 Q90 80 60 95 Q30 80 30 50 Z" />
      <text x="64" y="14" fill="currentColor" stroke="none" fontSize="11" fontFamily="serif">mirror line</text>
    </svg>
  ),
  "rotational symmetry": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="60" cy="60" r="2" fill="currentColor" />
      <polygon points="60,30 70,50 50,50" />
      <polygon points="60,30 70,50 50,50" transform="rotate(72 60 60)" />
      <polygon points="60,30 70,50 50,50" transform="rotate(144 60 60)" />
      <polygon points="60,30 70,50 50,50" transform="rotate(216 60 60)" />
      <polygon points="60,30 70,50 50,50" transform="rotate(288 60 60)" />
    </svg>
  ),
  identity: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="75" fill="currentColor" textAnchor="middle" fontSize="56" fontFamily="serif">1</text>
      <text x="60" y="100" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">multiplicative identity</text>
    </svg>
  ),
  "cube root": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="72" fill="currentColor" textAnchor="middle" fontSize="36" fontFamily="serif">&#8731;27 = 3</text>
    </svg>
  ),
  "indefinite integral": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true">
      <text x="60" y="68" fill="currentColor" textAnchor="middle" fontSize="28" fontFamily="serif">&#8747; x dx = x&#178;/2 + C</text>
      <text x="60" y="98" fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="serif" opacity="0.6">family of antiderivatives</text>
    </svg>
  ),

  subtraction: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="15" y1="60" x2="105" y2="60" />
      <circle cx="30" cy="60" r="4" fill="currentColor" />
      <circle cx="45" cy="60" r="4" fill="currentColor" />
      <circle cx="60" cy="60" r="4" fill="currentColor" />
      <circle cx="75" cy="60" r="4" fill="currentColor" />
      <circle cx="90" cy="60" r="4" fill="currentColor" />
      <line x1="79" y1="50" x2="101" y2="70" stroke="currentColor" strokeWidth="1.5" />
      <line x1="101" y1="50" x2="79" y2="70" stroke="currentColor" strokeWidth="1.5" />
      <text x="60" y="92" fill="currentColor" textAnchor="middle" fontSize="14" fontFamily="serif">5 &#8722; 2 = 3</text>
    </svg>
  ),
  multiplication: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="36" cy="30" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="52" cy="30" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="68" cy="30" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="84" cy="30" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="36" cy="48" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="52" cy="48" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="68" cy="48" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="84" cy="48" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="36" cy="66" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="52" cy="66" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="68" cy="66" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="84" cy="66" r="3.5" fill="currentColor" stroke="none" />
      <rect x="26" y="20" width="68" height="56" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" rx="4" />
      <text x="60" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif">3 × 4 = 12</text>
    </svg>
  ),
  division: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="30" cy="25" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="25" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="25" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="90" cy="25" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="30" cy="50" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="50" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="50" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="90" cy="50" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="30" cy="75" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="75" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="75" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="90" cy="75" r="3.5" fill="currentColor" stroke="none" />
      <line x1="40" y1="15" x2="40" y2="85" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      <line x1="60" y1="15" x2="60" y2="85" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      <line x1="80" y1="15" x2="80" y2="85" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      <text x="60" y="108" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif">12 ÷ 4 = 3</text>
    </svg>
  ),
  addition: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="30" cy="60" r="4" fill="currentColor" />
      <circle cx="45" cy="60" r="4" fill="currentColor" />
      <circle cx="60" cy="60" r="4" fill="currentColor" />
      <text x="45" y="40" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">3</text>
      <text x="60" y="80" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22" fontFamily="serif">+</text>
      <circle cx="75" cy="60" r="4" fill="currentColor" />
      <circle cx="90" cy="60" r="4" fill="currentColor" />
      <text x="82" y="40" fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontFamily="serif">2</text>
      <text x="60" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="14" fontFamily="serif">3 + 2 = 5</text>
    </svg>
  ),

  // BEARING-RELATED ADDITIONS (8 new visuals)
  "bearing angle": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="60" r="40" />
      <line x1="60" y1="20" x2="60" y2="100" />
      <polygon points="55,25 65,25 60,15" fill="currentColor" />
      <text x="64" y="14" fill="currentColor" stroke="none" fontSize="12" fontFamily="serif" fontWeight="600">N</text>
      <line x1="60" y1="60" x2="100" y2="60" strokeWidth="2" />
      <polygon points="95,55 100,60 95,65" fill="currentColor" />
      <path d="M60 45 A15 15 0 0 1 75 60" strokeWidth="1.5" />
      <text x="72" y="48" fill="currentColor" stroke="none" fontSize="11" fontFamily="serif">090°</text>
      <text x="60" y="113" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.6">clockwise from N</text>
    </svg>
  ),
  compass: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="60" r="42" />
      <circle cx="60" cy="60" r="2" fill="currentColor" />
      <polygon points="60,18 65,58 60,53 55,58" fill="currentColor" />
      <polygon points="60,102 55,62 60,67 65,62" fill="currentColor" />
      <text x="60" y="14" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="600">N</text>
    </svg>
  ),
  north: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M60 25 L52 60 L60 53 L68 60 Z" fill="currentColor" />
      <text x="60" y="80" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif" fontWeight="600">N</text>
      <text x="60" y="100" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">top of map</text>
    </svg>
  ),
  south: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M60 90 L52 60 L60 65 L68 60 Z" fill="currentColor" />
      <text x="60" y="45" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif" fontWeight="600">S</text>
      <text x="60" y="28" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">bottom of map</text>
    </svg>
  ),
  east: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M95 60 L60 52 L65 60 L60 68 Z" fill="currentColor" />
      <text x="35" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif" fontWeight="600">E</text>
      <text x="35" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">right of N</text>
    </svg>
  ),
  west: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M25 60 L60 52 L55 60 L60 68 Z" fill="currentColor" />
      <text x="85" y="68" fill="currentColor" stroke="none" textAnchor="middle" fontSize="20" fontFamily="serif" fontWeight="600">W</text>
      <text x="85" y="48" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" opacity="0.6">left of N</text>
    </svg>
  ),
  "compass rose": () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="60" cy="60" r="42" />
      <line x1="60" y1="22" x2="60" y2="98" strokeWidth="2" />
      <line x1="22" y1="60" x2="98" y2="60" strokeWidth="2" />
      <line x1="33" y1="33" x2="87" y2="87" />
      <line x1="33" y1="87" x2="87" y2="33" />
      <text x="60" y="18" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="600">N</text>
      <text x="60" y="112" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="600">S</text>
      <text x="16" y="64" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="600">W</text>
      <text x="104" y="64" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="600">E</text>
    </svg>
  ),


  SSS: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="20,85 50,85 35,50" />
      <line x1="20" y1="85" x2="50" y2="85" strokeWidth="2" />
      <line x1="20" y1="85" x2="35" y2="50" strokeWidth="2" />
      <line x1="50" y1="85" x2="35" y2="50" strokeWidth="2" />
      <polygon points="75,85 105,85 90,50" />
      <line x1="75" y1="85" x2="105" y2="85" strokeWidth="2" />
      <line x1="75" y1="85" x2="90" y2="50" strokeWidth="2" />
      <line x1="105" y1="85" x2="90" y2="50" strokeWidth="2" />
      <text x="35" y="38" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.7">side=side</text>
      <text x="60" y="50" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.7">side=side</text>
      <text x="60" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.7">side=side</text>
    </svg>
  ),
  SAS: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="20,85 50,85 35,50" />
      <line x1="20" y1="85" x2="50" y2="85" strokeWidth="2" />
      <line x1="20" y1="85" x2="35" y2="50" strokeWidth="2" />
      <path d="M30 78 A10 10 0 0 1 40 78" strokeWidth="1" />
      <line x1="50" y1="85" x2="35" y2="50" strokeWidth="2" />
      <polygon points="75,85 105,85 90,50" />
      <line x1="75" y1="85" x2="105" y2="85" strokeWidth="2" />
      <line x1="75" y1="85" x2="90" y2="50" strokeWidth="2" />
      <path d="M85 78 A10 10 0 0 1 95 78" strokeWidth="1" />
      <line x1="105" y1="85" x2="90" y2="50" strokeWidth="2" />
      <text x="38" y="46" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.7">&#952;</text>
      <text x="93" y="46" fill="currentColor" stroke="none" textAnchor="middle" fontSize="10" fontFamily="serif" opacity="0.7">&#952;</text>
    </svg>
  ),
  ASA: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="20,85 50,85 35,50" />
      <line x1="20" y1="85" x2="50" y2="85" strokeWidth="2" />
      <path d="M26 78 A10 10 0 0 1 40 78" strokeWidth="1" />
      <line x1="20" y1="85" x2="35" y2="50" strokeWidth="2" />
      <path d="M28 65 A12 12 0 0 1 40 70" strokeWidth="1" />
      <line x1="50" y1="85" x2="35" y2="50" strokeWidth="2" />
      <polygon points="75,85 105,85 90,50" />
      <line x1="75" y1="85" x2="105" y2="85" strokeWidth="2" />
      <path d="M81 78 A10 10 0 0 1 95 78" strokeWidth="1" />
      <line x1="75" y1="85" x2="90" y2="50" strokeWidth="2" />
      <path d="M83 65 A12 12 0 0 1 95 70" strokeWidth="1" />
      <line x1="105" y1="85" x2="90" y2="50" strokeWidth="2" />
    </svg>
  ),
  RHS: () => (
    <svg viewBox="0 0 120 120" className="glossary-visual" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="20,90 50,90 50,40" />
      <rect x="44" y="84" width="6" height="6" />
      <line x1="20" y1="90" x2="50" y2="90" strokeWidth="2" />
      <line x1="20" y1="90" x2="50" y2="40" strokeWidth="2" />
      <line x1="50" y1="90" x2="50" y2="40" strokeWidth="2" />
      <polygon points="75,90 105,90 105,40" />
      <rect x="99" y="84" width="6" height="6" />
      <line x1="75" y1="90" x2="105" y2="90" strokeWidth="2" />
      <line x1="75" y1="90" x2="105" y2="40" strokeWidth="2" />
      <line x1="105" y1="90" x2="105" y2="40" strokeWidth="2" />
      <text x="35" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="9" fontFamily="serif" opacity="0.7">right + hyp + side</text>
      <text x="90" y="105" fill="currentColor" stroke="none" textAnchor="middle" fontSize="9" fontFamily="serif" opacity="0.7">right + hyp + side</text>
    </svg>
  ),

};


export default function GlossaryVisual({ id }) {
  const Visual = id ? V[id] : null;
  if (!Visual) return null;
  return <Visual />;
}