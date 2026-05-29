export const theoremIllustrations = {
  'fermats-little': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      <circle cx="60" cy="55" r="35" fill="url(#flGlow)"/>
      <text x="60" y="42" fontFamily="monospace" fontSize="13" fill="#818cf8" textAnchor="middle" fontWeight="bold">a^(p-1)</text>
      <text x="60" y="60" fontFamily="monospace" fontSize="11" fill="#a5b4fc" textAnchor="middle">≡ 1 (mod p)</text>
      <text x="60" y="80" fontFamily="monospace" fontSize="9" fill="#94a3b8" textAnchor="middle">p = prime</text>
      <text x="60" y="92" fontFamily="monospace" fontSize="9" fill="#2dd4bf" textAnchor="middle">p ∤ a</text>
      <text x="60" y="110" fontFamily="monospace" fontSize="7" fill="#f59e0b" textAnchor="middle">Fermat, 1640</text>
    </svg>
  ),

  'handshake': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      {[20,40,60,80,100].map((cx,i) =>
        [20,60,100].map((cy,j) => (
          <circle key={`${i}-${j}`} cx={cx} cy={cy} r="6" fill="#6366f1" stroke="#a5b4fc" strokeWidth="1"/>
        ))
      )}
      <text x="60" y="115" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">n(n-1)/2 handshakes</text>
    </svg>
  ),

  'chinese-remainder': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      <text x="60" y="15" fontFamily="monospace" fontSize="8" fill="#f59e0b" textAnchor="middle">Chinese Remainder Theorem</text>
      {[[3,2],[5,3],[7,2]].map(([mod,rem],i) =>
        [20,60,100].map(x => (
          <text key={`${i}-${x}`} x={x} y={28+i*20} fontFamily="monospace" fontSize="10" fill="#a5b4fc" textAnchor="middle">x ≡ {rem} (mod {mod})</text>
        ))
      )}
      <text x="60" y="95" fontFamily="monospace" fontSize="11" fill="#2dd4bf" textAnchor="middle" fontWeight="bold">x = ?</text>
      <text x="60" y="110" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">Sun Tzu, ~300 AD</text>
    </svg>
  ),

  'coupon-collector': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      <text x="60" y="15" fontFamily="monospace" fontSize="8" fill="#f59e0b" textAnchor="middle">Coupon Collector</text>
      {['A','B','C','D','E'].map((c,i) => (
        <g key={c}>
          <rect x={12+i*21} y="30" width="18" height="24" rx="3" fill="#1e293b" stroke={i<2?'#2dd4bf':'#334155'} strokeWidth="1.5"/>
          <text x={21+i*21} y="46" fontFamily="monospace" fontSize="11" fill={i<2?'#2dd4bf':'#475569'} textAnchor="middle" fontWeight="bold">{c}</text>
          {i<2 && <path d={`M${21+i*21+4},54 Q${21+i*21+4},60 ${21+i*21+4},58`} stroke="#2dd4bf" strokeWidth="2" fill="none"/>}
        </g>
      ))}
      <text x="60" y="75" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">Collect all n coupons</text>
      <text x="60" y="88" fontFamily="monospace" fontSize="9" fill="#a5b4fc" textAnchor="middle">E[n] = n × H_n</text>
      <text x="60" y="102" fontFamily="monospace" fontSize="7" fill="#f59e0b" textAnchor="middle">last coupon takes longest</text>
    </svg>
  ),

  'euclidean-algorithm': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      <text x="60" y="15" fontFamily="monospace" fontSize="8" fill="#f59e0b" textAnchor="middle">Euclidean Algorithm</text>
      <text x="60" y="30" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">gcd(a, b) = gcd(b, a mod b)</text>
      <text x="60" y="55" fontFamily="monospace" fontSize="12" fill="#818cf8" textAnchor="middle" fontWeight="bold">gcd(48, 18)</text>
      <text x="60" y="70" fontFamily="monospace" fontSize="9" fill="#a5b4fc" textAnchor="middle">→ gcd(18, 12)</text>
      <text x="60" y="82" fontFamily="monospace" fontSize="9" fill="#a5b4fc" textAnchor="middle">→ gcd(12, 6)</text>
      <text x="60" y="94" fontFamily="monospace" fontSize="9" fill="#a5b4fc" textAnchor="middle">→ gcd(6, 0)</text>
      <text x="60" y="110" fontFamily="monospace" fontSize="11" fill="#2dd4bf" textAnchor="middle" fontWeight="bold">GCD = 6</text>
    </svg>
  ),

  'modular-inverse': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="miGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      <circle cx="60" cy="50" r="30" fill="url(#miGlow)"/>
      <text x="60" y="38" fontFamily="monospace" fontSize="13" fill="#818cf8" textAnchor="middle" fontWeight="bold">a × x</text>
      <text x="60" y="56" fontFamily="monospace" fontSize="11" fill="#a5b4fc" textAnchor="middle">≡ 1 (mod m)</text>
      <text x="60" y="76" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">inverse exists iff gcd(a,m)=1</text>
      <text x="60" y="95" fontFamily="monospace" fontSize="9" fill="#f59e0b" textAnchor="middle">x = a⁻¹ (mod m)</text>
      <text x="60" y="112" fontFamily="monospace" fontSize="7" fill="#94a3b8" textAnchor="middle">RSA's secret weapon</text>
    </svg>
  ),

  'binary-exponentiation': (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="16" fill="#0f1629"/>
      <text x="60" y="15" fontFamily="monospace" fontSize="8" fill="#f59e0b" textAnchor="middle">Binary Exponentiation</text>
      <text x="60" y="32" fontFamily="monospace" fontSize="9" fill="#818cf8" textAnchor="middle">a^n in O(log n) steps</text>
      <text x="60" y="50" fontFamily="monospace" fontSize="10" fill="#a5b4fc" textAnchor="middle">13 = 1101₂</text>
      <text x="60" y="66" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">a^13 = a^8 × a^4 × a^1</text>
      <text x="60" y="82" fontFamily="monospace" fontSize="8" fill="#94a3b8" textAnchor="middle">compute by repeated squaring</text>
      <text x="60" y="100" fontFamily="monospace" fontSize="9" fill="#2dd4bf" textAnchor="middle">vs. O(n) naively</text>
      <text x="60" y="113" fontFamily="monospace" fontSize="7" fill="#94a3b8" textAnchor="middle">used in every HTTPS connection</text>
    </svg>
  ),
}

export const theoremLabels = {
  'fermats-little': 'a^(p-1) ≡ 1 (mod p)',
  'handshake': 'n(n-1)/2',
  'chinese-remainder': 'x ≡ aᵢ (mod mᵢ)',
  'coupon-collector': 'E[n] = n × H_n',
  'euclidean-algorithm': 'gcd(a,b) = gcd(b, a mod b)',
  'modular-inverse': 'a × a⁻¹ ≡ 1 (mod m)',
  'binary-exponentiation': 'a^n in O(log n)',
}