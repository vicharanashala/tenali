export const theoremIllustrations = {
  'pythagorean': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f"/>
          <stop offset="100%" stopColor="#0f2744"/>
        </linearGradient>
        <linearGradient id="a2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="b2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="c2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {/* Grid pattern */}
      <line x1="0" y1="30" x2="120" y2="30" stroke="#1e3a5f" strokeWidth="0.3" opacity="0.5"/>
      <line x1="0" y1="60" x2="120" y2="60" stroke="#1e3a5f" strokeWidth="0.3" opacity="0.5"/>
      <line x1="0" y1="90" x2="120" y2="90" stroke="#1e3a5f" strokeWidth="0.3" opacity="0.5"/>
      {/* Right triangle */}
      <polygon points="20,95 95,95 95,20" fill="url(#triGrad)" stroke="#2dd4bf" strokeWidth="2.5"/>
      {/* Hypotenuse highlight */}
      <line x1="20" y1="95" x2="95" y2="20" stroke="#2dd4bf" strokeWidth="3" opacity="0.8"/>
      {/* Square on hypotenuse (c²) */}
      <rect x="20" y="20" width="55" height="55" fill="url(#a2Grad)" stroke="#818cf8" strokeWidth="1.5"/>
      <text x="47" y="50" fontFamily="monospace" fontSize="13" fill="#818cf8" textAnchor="middle" fontWeight="bold">c²</text>
      {/* Square on a side (a²) */}
      <rect x="95" y="20" width="25" height="25" fill="url(#c2Grad)" stroke="#2dd4bf" strokeWidth="1.5"/>
      <text x="107" y="35" fontFamily="monospace" fontSize="9" fill="#2dd4bf" textAnchor="middle">a²</text>
      {/* Square on b side (b²) */}
      <rect x="20" y="95" width="55" height="25" fill="url(#b2Grad)" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="47" y="112" fontFamily="monospace" fontSize="9" fill="#f59e0b" textAnchor="middle">b²</text>
      {/* Labels on triangle */}
      <text x="25" y="112" fontFamily="monospace" fontSize="11" fill="#e2e8f0">a</text>
      <text x="100" y="55" fontFamily="monospace" fontSize="11" fill="#e2e8f0">b</text>
      {/* Right angle marker */}
      <rect x="85" y="85" width="8" height="8" fill="none" stroke="#2dd4bf" strokeWidth="1"/>
    </svg>
  ),

  'fermats-last': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glowRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#f87171" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {/* Glow effect */}
      <circle cx="60" cy="55" r="40" fill="url(#glowRed)"/>
      {/* Main equation */}
      <text x="60" y="40" fontFamily="monospace" fontSize="15" fill="#818cf8" textAnchor="middle" fontWeight="bold">xⁿ + yⁿ</text>
      <text x="60" y="58" fontFamily="monospace" fontSize="15" fill="#818cf8" textAnchor="middle" fontWeight="bold">= zⁿ</text>
      <text x="60" y="75" fontFamily="monospace" fontSize="10" fill="#94a3b8" textAnchor="middle">n &gt; 2</text>
      {/* Crossed out circle */}
      <circle cx="60" cy="55" r="28" fill="none" stroke="#f87171" strokeWidth="3"/>
      <line x1="38" y1="77" x2="82" y2="33" stroke="#f87171" strokeWidth="3"/>
      {/* Fermat's quote */}
      <text x="60" y="100" fontFamily="monospace" fontSize="7" fill="#f59e0b" textAnchor="middle">"I have discovered..."</text>
      <text x="60" y="110" fontFamily="monospace" fontSize="7" fill="#94a3b8" textAnchor="middle">proved by Wiles (1994)</text>
    </svg>
  ),

  'euler-formula': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glowPurple" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="spiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {/* Glow */}
      <circle cx="60" cy="45" r="35" fill="url(#glowPurple)"/>
      {/* Unit circle */}
      <circle cx="60" cy="45" r="30" fill="none" stroke="#6366f1" strokeWidth="2"/>
      {/* Spiral */}
      <path d="M60,45 Q75,30 60,15 Q45,30 60,45 Q75,60 90,45" stroke="url(#spiralGrad)" strokeWidth="2" fill="none"/>
      {/* e on circle */}
      <text x="42" y="48" fontFamily="monospace" fontSize="14" fill="#a5b4fc" fontWeight="bold">e</text>
      {/* iπ superscript */}
      <text x="58" y="36" fontFamily="monospace" fontSize="10" fill="#a5b4fc">iπ</text>
      {/* Plus one */}
      <text x="60" y="85" fontFamily="monospace" fontSize="18" fill="#2dd4bf" textAnchor="middle" fontWeight="bold">+ 1</text>
      {/* Equals zero */}
      <text x="60" y="105" fontFamily="monospace" fontSize="22" fill="#f59e0b" textAnchor="middle" fontWeight="bold">= 0</text>
      {/* Labels */}
      <text x="92" y="48" fontFamily="monospace" fontSize="8" fill="#94a3b8">1</text>
      <text x="60" y="12" fontFamily="monospace" fontSize="8" fill="#94a3b8">i</text>
    </svg>
  ),

  'fundamental-theorem': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="curveFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {/* Axis lines */}
      <line x1="10" y1="95" x2="110" y2="95" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="15" y1="100" x2="15" y2="20" stroke="#94a3b8" strokeWidth="1"/>
      {/* Axis labels */}
      <text x="108" y="100" fontFamily="monospace" fontSize="8" fill="#94a3b8">x</text>
      <text x="10" y="22" fontFamily="monospace" fontSize="8" fill="#94a3b8">y</text>
      {/* Area under curve filled */}
      <path d="M15,95 L15,75 Q35,50 55,55 Q75,60 95,35 L95,95 Z" fill="url(#curveFill)"/>
      {/* Curve */}
      <path d="M15,75 Q35,50 55,55 Q75,60 95,35" stroke="#2dd4bf" strokeWidth="2.5" fill="none"/>
      {/* Integral symbol */}
      <text x="22" y="70" fontFamily="serif" fontSize="32" fill="#818cf8" fontStyle="italic" fontWeight="bold">∫</text>
      {/* Bounds */}
      <text x="35" y="108" fontFamily="monospace" fontSize="8" fill="#94a3b8">a</text>
      <text x="88" y="108" fontFamily="monospace" fontSize="8" fill="#94a3b8">b</text>
      {/* F(x) labels */}
      <text x="55" y="108" fontFamily="serif" fontSize="12" fill="#f59e0b" fontStyle="italic">F(x)</text>
      {/* Arrow and result */}
      <path d="M60,20 L60,10 L70,15 L60,20" fill="#f59e0b"/>
      <text x="60" y="8" fontFamily="monospace" fontSize="9" fill="#f59e0b" textAnchor="middle">F(b)-F(a)</text>
      {/* d/dx notation */}
      <text x="100" y="50" fontFamily="serif" fontSize="14" fill="#f59e0b" fontStyle="italic">d/dx</text>
    </svg>
  ),

  'infinite-pi': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="termGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {/* Header */}
      <text x="60" y="18" fontFamily="monospace" fontSize="11" fill="#a5b4fc" textAnchor="middle" fontWeight="bold">Leibniz Formula</text>
      {/* π = */}
      <text x="25" y="40" fontFamily="serif" fontSize="22" fill="#f59e0b" fontWeight="bold">π</text>
      <text x="50" y="40" fontFamily="monospace" fontSize="14" fill="#e2e8f0">=</text>
      {/* Terms stacked */}
      <rect x="55" y="22" width="60" height="18" rx="4" fill="url(#termGrad)" stroke="#2dd4bf" strokeWidth="1"/>
      <text x="85" y="35" fontFamily="monospace" fontSize="11" fill="#2dd4bf" textAnchor="middle">1</text>
      <rect x="55" y="42" width="60" height="18" rx="4" fill="url(#termGrad)" stroke="#818cf8" strokeWidth="1"/>
      <text x="85" y="55" fontFamily="monospace" fontSize="11" fill="#818cf8" textAnchor="middle">-1/3</text>
      <rect x="55" y="62" width="60" height="18" rx="4" fill="url(#termGrad)" stroke="#2dd4bf" strokeWidth="1"/>
      <text x="85" y="75" fontFamily="monospace" fontSize="11" fill="#2dd4bf" textAnchor="middle">+1/5</text>
      <text x="85" y="90" fontFamily="monospace" fontSize="10" fill="#94a3b8" textAnchor="middle">-1/7 + ...</text>
      {/* Convergence arrow */}
      <path d="M115,50 L115,75" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
      <polygon points="115,80 112,72 118,72" fill="#f59e0b"/>
      <text x="115" y="88" fontFamily="monospace" fontSize="7" fill="#f59e0b" textAnchor="middle">π/4</text>
      {/* Result */}
      <text x="60" y="112" fontFamily="serif" fontSize="16" fill="#f59e0b" textAnchor="middle" fontWeight="bold">π ≈ 3.141592653...</text>
    </svg>
  ),

  'goldbach-conjecture': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="primeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {/* Header */}
      <text x="60" y="16" fontFamily="monospace" fontSize="9" fill="#f59e0b" textAnchor="middle">Goldbach's Conjecture</text>
      <text x="60" y="26" fontFamily="monospace" fontSize="7" fill="#94a3b8" textAnchor="middle">every even &gt; 2 = sum of two primes</text>
      {/* Number line */}
      <line x1="10" y1="100" x2="110" y2="100" stroke="#94a3b8" strokeWidth="0.5"/>
      {/* Even numbers with prime pairs */}
      {/* 4 = 2 + 2 */}
      <circle cx="25" cy="45" r="14" fill="url(#primeGlow)" stroke="#2dd4bf" strokeWidth="1.5"/>
      <text x="25" y="48" fontFamily="monospace" fontSize="12" fill="#2dd4bf" textAnchor="middle" fontWeight="bold">2</text>
      <text x="25" y="60" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">4</text>
      <text x="25" y="68" fontFamily="monospace" fontSize="6" fill="#94a3b8" textAnchor="middle">2+2</text>
      {/* 10 = 3 + 7 */}
      <circle cx="55" cy="45" r="14" fill="url(#primeGlow)" stroke="#818cf8" strokeWidth="1.5"/>
      <text x="55" y="46" fontFamily="monospace" fontSize="9" fill="#818cf8" textAnchor="middle" fontWeight="bold">3</text>
      <text x="55" y="58" fontFamily="monospace" fontSize="9" fill="#818cf8" textAnchor="middle">+7</text>
      <text x="55" y="68" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">10</text>
      {/* 28 = 5 + 23 */}
      <circle cx="85" cy="45" r="14" fill="url(#primeGlow)" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="85" y="46" fontFamily="monospace" fontSize="9" fill="#f59e0b" textAnchor="middle" fontWeight="bold">5</text>
      <text x="85" y="58" fontFamily="monospace" fontSize="9" fill="#f59e0b" textAnchor="middle">+23</text>
      <text x="85" y="68" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">28</text>
      {/* Bottom status */}
      <text x="60" y="92" fontFamily="monospace" fontSize="7" fill="#94a3b8" textAnchor="middle">verified for</text>
      <text x="60" y="102" fontFamily="monospace" fontSize="8" fill="#f59e0b" textAnchor="middle" fontWeight="bold">4 × 10¹⁸</text>
    </svg>
  ),

  'banach-tarski': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1"/>
        </radialGradient>
        <radialGradient id="sphere2Grad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {/* Title */}
      <text x="60" y="12" fontFamily="monospace" fontSize="7" fill="#f87171" textAnchor="middle">Banach-Tarski Paradox</text>
      {/* Original sphere */}
      <circle cx="30" cy="55" r="22" fill="url(#sphereGrad)" stroke="#6366f1" strokeWidth="2"/>
      <text x="30" y="58" fontFamily="monospace" fontSize="10" fill="#e2e8f0" textAnchor="middle">1</text>
      {/* Scissors/cut line */}
      <path d="M55,30 L55,80" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2"/>
      <polygon points="55,30 52,38 58,38" fill="#f59e0b"/>
      <polygon points="55,80 52,72 58,72" fill="#f59e0b"/>
      {/* Arrow */}
      <line x1="70" y1="55" x2="85" y2="55" stroke="#f59e0b" strokeWidth="2"/>
      <polygon points="90,55 82,52 82,58" fill="#f59e0b"/>
      {/* Two reassembled spheres */}
      <circle cx="100" cy="38" r="14" fill="url(#sphere2Grad)" stroke="#2dd4bf" strokeWidth="2"/>
      <text x="100" y="41" fontFamily="monospace" fontSize="9" fill="#2dd4bf" textAnchor="middle">1</text>
      <circle cx="100" cy="78" r="14" fill="url(#sphere2Grad)" stroke="#2dd4bf" strokeWidth="2"/>
      <text x="100" y="81" fontFamily="monospace" fontSize="9" fill="#2dd4bf" textAnchor="middle">1</text>
      {/* Labels */}
      <text x="30" y="85" fontFamily="monospace" fontSize="7" fill="#94a3b8" textAnchor="middle">sphere</text>
      <text x="100" y="98" fontFamily="monospace" fontSize="7" fill="#94a3b8" textAnchor="middle">2 identical</text>
      {/* Warning text */}
      <text x="60" y="115" fontFamily="monospace" fontSize="6" fill="#f87171" textAnchor="middle">impossible in physical world</text>
    </svg>
  ),
}

export const theoremLabels = {
  'pythagorean': 'a² + b² = c²',
  'fermats-last': 'xⁿ + yⁿ ≠ zⁿ',
  'euler-formula': 'e^(iπ) + 1 = 0',
  'fundamental-theorem': '∫f(x)dx = F(b)-F(a)',
  'infinite-pi': 'π/4 = Σ(-1)ⁿ/(2n+1)',
  'goldbach-conjecture': 'even = p₁ + p₂',
  'banach-tarski': '1 → 2',
}