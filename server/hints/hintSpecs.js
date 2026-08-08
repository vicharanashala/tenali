/**
 * HINT SPEC REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The single source of truth for hint generation across every concept.
 *
 * HOW TO ADD A NEW CONCEPT:
 *   1. Add an entry to CONCEPTS below.
 *   2. Provide level1, level2, level3 functions (each takes
 *      ({ q: questionData, a: answerData, explanation: level3Text })
 *      and returns a string, or null to fall back to the explanation
 *      engine / generic prompt).
 *   3. Optionally set costTier to one of:
 *        - 'cheap'      5 / 8  / 12 XP  (basic arithmetic, vocab)
 *        - 'standard'   8 / 14 / 20 XP  (most concepts)
 *        - 'expensive' 12 / 22 / 32 XP  (multi-step proofs, simultaneous eqns)
 *
 * RULES OF THUMB:
 *   - Level 1 = DIRECTION: which formula / which strategy / which side of the page.
 *     NEVER give the answer, NEVER reveal a digit that is part of the answer.
 *     Show only structure — use SVG diagrams where possible.
 *   - Level 2 = FIRST STEP: the kid sees HOW to start, must still execute
 *     2–4 more steps on their own. May include one question-input value but
 *     NOT the computed intermediate or final answer.
 *   - Level 3 = WORKED EXAMPLE: usually null (the global explanation engine
 *     already produces this). Override only if your concept needs custom
 *     formatting.
 *
 * SVG HINTS:
 *   Embed a visual diagram by wrapping an <svg> element in <svg-hint>…</svg-hint>.
 *   The client detects this tag and renders the SVG in a sandboxed div.
 *   SVGs must be self-contained (no external references, no scripts).
 *
 * Returning null at level 1/2 falls back to a generic prompt that
 * incorporates the question text; this is intentionally weaker than a real
 * spec so authors are nudged to fill it in.
 */

const H = (strings, ...values) => {
  // Tiny tagged-template helper so we can write
  //   h1`Look for two integers whose product is ${q.a * q.c}.`
  // instead of painful string concatenation.
  let out = '';
  strings.forEach((s, i) => { out += s + (i < values.length ? String(values[i] ?? '') : ''); });
  return out;
};

const GENERIC_L1 = (_q) =>
  `Re-read the question and identify what type of problem it is — then pick the matching strategy before you start calculating.`;

const GENERIC_L2 = (_q) =>
  `List what you know, list what you need to find, then look for the formula or rule that connects them.`;

const GENERIC_L3 = (explanation) =>
  explanation || 'Refer to the step-by-step worked solution.';

// ─── SVG Visual Hint Builders ─────────────────────────────────────────────────
// Each builder returns a self-contained SVG string (no answer values embedded).
// Wrap the returned string in <svg-hint>…</svg-hint> before sending to the client.

const SVG = {
  wrap: (svgContent) => `<svg-hint>${svgContent}</svg-hint>`,

  // Addition column diagram — blank boxes stacked vertically, no numbers
  additionColumns: () => SVG.wrap(`<svg width="200" height="130" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 11px sans-serif;fill:#aaa;text-anchor:middle}.box{fill:none;stroke:#555;stroke-width:1.5;rx:4}.val{font:bold 16px monospace;fill:#e0e0e0;text-anchor:middle}.op{font:bold 22px monospace;fill:#7c83fd;text-anchor:middle}</style>
  <!-- Column headers -->
  <text x="80" y="18" class="lbl">Tens</text>
  <text x="140" y="18" class="lbl">Ones</text>
  <!-- Top number row -->
  <rect x="58" y="24" width="44" height="32" class="box" rx="4"/>
  <rect x="118" y="24" width="44" height="32" class="box" rx="4"/>
  <!-- Op symbol -->
  <text x="28" y="48" class="op">+</text>
  <!-- Bottom number row -->
  <rect x="58" y="62" width="44" height="32" class="box" rx="4"/>
  <rect x="118" y="62" width="44" height="32" class="box" rx="4"/>
  <!-- Divider line -->
  <line x1="20" y1="100" x2="180" y2="100" stroke="#555" stroke-width="2"/>
  <!-- Result row -->
  <rect x="58" y="106" width="44" height="20" fill="none" stroke="#7c83fd" stroke-width="1.5" rx="3"/>
  <rect x="118" y="106" width="44" height="20" fill="none" stroke="#7c83fd" stroke-width="1.5" rx="3"/>
  <text x="160" y="92" style="font:10px sans-serif;fill:#f5b041">↑ carry?</text>
</svg>`),

  // Multiplication area model — blank grid
  multiplyGrid: (a, b) => {
    const isSmall = (a < 10) && (b < 10);
    if (isSmall) {
      return SVG.wrap(`<svg width="200" height="130" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 11px sans-serif;fill:#aaa;text-anchor:middle}.box{fill:#1e1e2e;stroke:#555;stroke-width:1.5}.q{font:bold 18px monospace;fill:#f5b041;text-anchor:middle}</style>
  <text x="100" y="20" class="lbl">Groups of __ each</text>
  <!-- 3x3 sample dots grid -->
  ${Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>`<circle cx="${50+c*35}" cy="${45+r*30}" r="8" fill="#7c83fd" opacity="0.5"/>`).join('')).join('')}
  <text x="100" y="118" class="lbl">Count total dots → that is the product</text>
  <text x="170" y="80" style="font:bold 20px sans-serif;fill:#7c83fd;text-anchor:middle">?</text>
</svg>`);
    }
    // Multi-digit: area model
    const tens = Math.floor(Math.max(a,b)/10)*10;
    const ones = Math.max(a,b)%10;
    return SVG.wrap(`<svg width="260" height="140" viewBox="0 0 260 140" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 11px sans-serif;fill:#aaa;text-anchor:middle}.box{fill:#1a1a2e;stroke:#555;stroke-width:1.5}.q{font:bold 14px monospace;fill:#f5b041;text-anchor:middle}</style>
  <!-- Area model boxes -->
  <rect x="60" y="30" width="110" height="70" class="box" rx="3"/>
  <rect x="170" y="30" width="50" height="70" class="box" rx="3"/>
  <!-- Labels -->
  <text x="115" y="20" class="lbl">${tens}</text>
  <text x="195" y="20" class="lbl">${ones}</text>
  <text x="40" y="70" style="font:bold 12px sans-serif;fill:#aaa;text-anchor:end">${Math.min(a,b)}</text>
  <text x="115" y="70" class="q">?</text>
  <text x="195" y="70" class="q">?</text>
  <text x="130" y="118" class="lbl">Add both boxes for total</text>
</svg>`);
  },

  // Number line for decimals — tick marks, missing label
  decimalLine: () => SVG.wrap(`<svg width="300" height="80" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:11px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Axis -->
  <line x1="20" y1="40" x2="280" y2="40" stroke="#555" stroke-width="2"/>
  <polygon points="280,36 290,40 280,44" fill="#555"/>
  <!-- Major ticks -->
  ${[0,1,2,3].map(i=>`<line x1="${40+i*60}" y1="32" x2="${40+i*60}" y2="48" stroke="#7c83fd" stroke-width="2"/>
  <text x="${40+i*60}" y="62" class="lbl">${i}</text>`).join('')}
  <!-- Decimal ticks between 0 and 1 -->
  ${[1,2,3,4,5,6,7,8,9].map(i=>`<line x1="${40+i*6}" y1="36" x2="${40+i*6}" y2="44" stroke="#555" stroke-width="1"/>`).join('')}
  <!-- Unknown marker -->
  <circle cx="94" cy="40" r="6" fill="#f5b041" stroke="none"/>
  <text x="94" y="22" style="font:bold 12px sans-serif;fill:#f5b041;text-anchor:middle">?</text>
  <text x="150" y="80" class="lbl">Line up decimal points ↕</text>
</svg>`),

  // Sqrt number line — two flanking perfect squares with ? between
  sqrtLine: (n) => {
    const lo = Math.floor(Math.sqrt(n));
    const hi = lo + 1;
    return SVG.wrap(`<svg width="300" height="90" viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 12px sans-serif;fill:#e0e0e0;text-anchor:middle}.sub{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <line x1="30" y1="45" x2="270" y2="45" stroke="#555" stroke-width="2"/>
  <polygon points="270,41 280,45 270,49" fill="#555"/>
  <!-- Lo square -->
  <circle cx="70" cy="45" r="14" fill="#1a1a2e" stroke="#7c83fd" stroke-width="2"/>
  <text x="70" y="50" class="lbl">${lo}</text>
  <text x="70" y="72" class="sub">${lo}²=${lo*lo}</text>
  <!-- Unknown -->
  <circle cx="150" cy="45" r="14" fill="#f5b041" opacity="0.9"/>
  <text x="150" y="50" style="font:bold 14px sans-serif;fill:#1a1a2e;text-anchor:middle">?</text>
  <text x="150" y="72" class="sub">√${n}</text>
  <!-- Hi square -->
  <circle cx="230" cy="45" r="14" fill="#1a1a2e" stroke="#7c83fd" stroke-width="2"/>
  <text x="230" y="50" class="lbl">${hi}</text>
  <text x="230" y="72" class="sub">${hi}²=${hi*hi}</text>
</svg>`);
  },

  // Right triangle for Pythagoras — sides labelled a, b, c(=?)
  rightTriangle: (findHyp = true) => SVG.wrap(`<svg width="220" height="160" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 13px sans-serif;fill:#e0e0e0;text-anchor:middle}.form{font:11px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Triangle -->
  <polygon points="30,130 180,130 30,30" fill="#1a1a2e" stroke="#7c83fd" stroke-width="2"/>
  <!-- Right angle box -->
  <rect x="30" y="110" width="18" height="18" fill="none" stroke="#7c83fd" stroke-width="1.5"/>
  <!-- Labels -->
  <text x="100" y="148" class="lbl">a</text>
  <text x="16" y="82" class="lbl">b</text>
  <text x="118" y="72" class="lbl" fill="${findHyp ? '#f5b041' : '#e0e0e0'}">${findHyp ? 'c = ?' : 'c'}</text>
  <!-- Formula reminder -->
  <text x="110" y="18" class="form">a² + b² = c²</text>
</svg>`),

  // SOH-CAH-TOA triangle for trig
  trigTriangle: () => SVG.wrap(`<svg width="240" height="175" viewBox="0 0 240 175" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 12px sans-serif;text-anchor:middle}.sm{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Triangle -->
  <polygon points="30,145 190,145 30,30" fill="#1a1a2e" stroke="#555" stroke-width="2"/>
  <!-- Right angle -->
  <rect x="30" y="127" width="16" height="16" fill="none" stroke="#7c83fd" stroke-width="1.5"/>
  <!-- Angle arc -->
  <path d="M 60,145 A 30,30 0 0,0 30,115" fill="none" stroke="#f5b041" stroke-width="2"/>
  <text x="65" y="135" style="font:11px sans-serif;fill:#f5b041">θ</text>
  <!-- Side labels with colour coding -->
  <text x="110" y="162" class="lbl" fill="#7c83fd">Adjacent</text>
  <text x="16" y="90" class="lbl" fill="#4ecdc4">Opposite</text>
  <text x="126" y="82" class="lbl" fill="#f5b041">Hypotenuse</text>
  <!-- SOH CAH TOA -->
  <text x="120" y="18" style="font:bold 11px monospace;fill:#7c83fd;text-anchor:middle">SOH · CAH · TOA</text>
  <text x="120" y="32" class="sm">sin=Opp/Hyp  cos=Adj/Hyp  tan=Opp/Adj</text>
</svg>`),

  // Percent 10×10 grid — shaded region shown, count to fill
  percentGrid: () => SVG.wrap(`<svg width="180" height="190" viewBox="0 0 180 190" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:11px sans-serif;fill:#aaa;text-anchor:middle}</style>
  ${Array.from({length:100},(_,i)=>{
    const r=Math.floor(i/10), c=i%10;
    const shaded = i < 30;
    return `<rect x="${10+c*16}" y="${10+r*16}" width="14" height="14" fill="${shaded?'#7c83fd':'#1a1a2e'}" stroke="#333" stroke-width="0.5" rx="1"/>`;
  }).join('')}
  <text x="90" y="182" class="lbl">Each small square = 1%   Shaded = part</text>
</svg>`),

  // Ratio bar — two segments labelled a:b with question mark
  ratioBar: (a, b) => {
    const total = a + b;
    const w = 240;
    const aW = Math.round((a / total) * w);
    const bW = w - aW;
    return SVG.wrap(`<svg width="280" height="90" viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 12px sans-serif;fill:#e0e0e0;text-anchor:middle}.sm{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <rect x="20" y="30" width="${aW}" height="30" fill="#7c83fd" rx="4 0 0 4"/>
  <rect x="${20+aW}" y="30" width="${bW}" height="30" fill="#4ecdc4" rx="0 4 4 0"/>
  <text x="${20+aW/2}" y="50" class="lbl">${a}</text>
  <text x="${20+aW+bW/2}" y="50" class="lbl">${b}</text>
  <text x="${20+aW/2}" y="80" class="sm">part A</text>
  <text x="${20+aW+bW/2}" y="80" class="sm">part B</text>
  <text x="140" y="20" class="sm">Ratio ${a} : ${b}   → total = ${total} parts → value of 1 part = ?</text>
</svg>`);
  },

  // Mini coordinate grid — axes only, no values
  coordGrid: () => SVG.wrap(`<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.ax{stroke:#555;stroke-width:1.5}.lbl{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Grid lines -->
  ${[-60,-40,-20,0,20,40,60].map(v=>`<line x1="${90+v}" y1="10" x2="${90+v}" y2="170" class="ax" stroke-dasharray="2,4"/>`).join('')}
  ${[-60,-40,-20,0,20,40,60].map(v=>`<line x1="10" y1="${90+v}" x2="170" y2="${90+v}" class="ax" stroke-dasharray="2,4"/>`).join('')}
  <!-- Axes -->
  <line x1="10" y1="90" x2="170" y2="90" stroke="#7c83fd" stroke-width="2"/>
  <line x1="90" y1="10" x2="90" y2="170" stroke="#7c83fd" stroke-width="2"/>
  <polygon points="170,86 178,90 170,94" fill="#7c83fd"/>
  <polygon points="86,10 90,2 94,10" fill="#7c83fd"/>
  <text x="174" y="94" class="lbl">x</text>
  <text x="90" y="8" class="lbl">y</text>
  <!-- Points placeholder -->
  <circle cx="50" cy="130" r="5" fill="#f5b041"/>
  <circle cx="140" cy="50" r="5" fill="#f5b041"/>
  <line x1="50" y1="130" x2="140" y2="50" stroke="#f5b041" stroke-width="1.5" stroke-dasharray="4,3"/>
</svg>`),

  // Angle diagram — straight line with arc
  angleDiagram: () => SVG.wrap(`<svg width="240" height="130" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:11px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Straight line -->
  <line x1="20" y1="75" x2="220" y2="75" stroke="#555" stroke-width="2"/>
  <!-- Ray from midpoint -->
  <line x1="120" y1="75" x2="180" y2="20" stroke="#7c83fd" stroke-width="2"/>
  <!-- Arc for angle -->
  <path d="M 150,75 A 30,30 0 0,0 120,45" fill="none" stroke="#f5b041" stroke-width="2"/>
  <text x="155" y="62" style="font:11px sans-serif;fill:#f5b041">α</text>
  <!-- 180 arc label -->
  <text x="120" y="110" class="lbl">Straight line = 180°  →  α + β = 180°</text>
  <!-- Second angle arc -->
  <path d="M 90,75 A 30,30 0 0,1 120,45" fill="none" stroke="#4ecdc4" stroke-width="2"/>
  <text x="82" y="58" style="font:11px sans-serif;fill:#4ecdc4">β</text>
</svg>`),

  // Triangle inscribed in a semicircle
  circleDiagram: () => SVG.wrap(`<svg width="240" height="150" viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 12px sans-serif;fill:#e0e0e0;text-anchor:middle}.sm{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Circle -->
  <circle cx="120" cy="80" r="60" fill="#1a1a2e" stroke="#555" stroke-width="2"/>
  <!-- Diameter -->
  <line x1="60" y1="80" x2="180" y2="80" stroke="#4ecdc4" stroke-width="1.5"/>
  <circle cx="120" cy="80" r="3" fill="#4ecdc4"/>
  <text x="120" y="95" class="sm">Diameter</text>
  <!-- Inscribed Triangle -->
  <polygon points="60,80 160,35 180,80" fill="none" stroke="#7c83fd" stroke-width="2"/>
  <!-- Right Angle Box -->
  <rect x="152" y="38" width="10" height="10" fill="none" stroke="#f5b041" stroke-width="1.5" transform="rotate(40 160 35)"/>
  <text x="120" y="15" class="lbl" fill="#f5b041">Angle in a semicircle = 90°</text>
</svg>`),

  // General triangle
  triangleDiagram: () => SVG.wrap(`<svg width="240" height="150" viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:11px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <polygon points="50,110 190,110 100,30" fill="#1a1a2e" stroke="#7c83fd" stroke-width="2"/>
  <path d="M 70,110 A 20,20 0 0,0 85,85" fill="none" stroke="#f5b041" stroke-width="1.5"/>
  <path d="M 170,110 A 20,20 0 0,1 155,85" fill="none" stroke="#f5b041" stroke-width="1.5"/>
  <path d="M 90,45 A 20,20 0 0,1 115,50" fill="none" stroke="#f5b041" stroke-width="1.5"/>
  <text x="120" y="135" class="lbl">Sum of internal angles = 180°</text>
</svg>`),

  // Circular Measure (radians, arc length)
  circularMeasureDiagram: () => SVG.wrap(`<svg width="240" height="150" viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 12px sans-serif;fill:#e0e0e0;text-anchor:middle}.sm{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <path d="M 120,75 L 180,75 A 60,60 0 0,0 150,23 Z" fill="#1a1a2e" stroke="#7c83fd" stroke-width="2"/>
  <path d="M 140,75 A 20,20 0 0,0 130,58" fill="none" stroke="#f5b041" stroke-width="2"/>
  <text x="145" y="70" style="font:11px sans-serif;fill:#f5b041">θ</text>
  <text x="150" y="88" class="sm">r</text>
  <text x="175" y="45" class="sm" fill="#4ecdc4">Arc length = rθ</text>
  <text x="120" y="130" class="sm">π radians = 180°</text>
</svg>`),

  // Number Line (Limits, Inequalities)
  numberLineDiagram: () => SVG.wrap(`<svg width="260" height="80" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <line x1="20" y1="40" x2="240" y2="40" stroke="#555" stroke-width="2"/>
  <polygon points="240,36 248,40 240,44" fill="#555"/>
  <polygon points="20,36 12,40 20,44" fill="#555"/>
  <circle cx="130" cy="40" r="4" fill="#7c83fd"/>
  <text x="130" y="58" class="lbl">a</text>
  <path d="M 80,30 Q 130,10 180,30" fill="none" stroke="#f5b041" stroke-width="1.5" stroke-dasharray="3,3"/>
  <polygon points="175,27 180,30 175,32" fill="#f5b041"/>
  <text x="130" y="15" class="lbl" fill="#f5b041">approach from both sides</text>
</svg>`),

  // Profit and Loss
  financeDiagram: () => SVG.wrap(`<svg width="240" height="120" viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 11px sans-serif;fill:#e0e0e0;text-anchor:middle}.sm{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <rect x="40" y="40" width="100" height="20" fill="#1a1a2e" stroke="#7c83fd" stroke-width="1.5"/>
  <rect x="140" y="40" width="60" height="20" fill="#1a1a2e" stroke="#4ecdc4" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="90" y="54" class="sm">Cost Price (CP)</text>
  <text x="170" y="54" class="sm" fill="#4ecdc4">Profit</text>
  <line x1="40" y1="70" x2="200" y2="70" stroke="#f5b041" stroke-width="2"/>
  <text x="120" y="85" class="lbl" fill="#f5b041">Selling Price (SP) = CP + Profit</text>
</svg>`),

  // Sets Intersection (Generic 2 circles)
  vennDiagram: () => SVG.wrap(`<svg width="200" height="140" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <circle cx="80" cy="70" r="40" fill="none" stroke="#7c83fd" stroke-width="2"/>
  <circle cx="120" cy="70" r="40" fill="none" stroke="#4ecdc4" stroke-width="2"/>
  <path d="M 100,35 A 40,40 0 0,0 100,105 A 40,40 0 0,0 100,35 Z" fill="#f5b041" opacity="0.5"/>
  <text x="50" y="75" style="font:12px sans-serif;fill:#7c83fd">A</text>
  <text x="150" y="75" style="font:12px sans-serif;fill:#4ecdc4">B</text>
  <text x="100" y="130" style="font:10px sans-serif;fill:#aaa;text-anchor:middle">Overlap = Intersection</text>
</svg>`),

  // Sequence dots — visual pattern (up to 4 terms shown as growing dot groups)
  sequenceDots: (terms) => {
    const show = (terms || [1,2,3,4]).slice(0,4);
    const dots = show.map((count, ti) => {
      const safeCount = Math.min(count, 9);
      const circles = Array.from({length: safeCount}, (_, di) =>
        `<circle cx="${30 + ti*65 + (di%3)*14}" cy="${50 + Math.floor(di/3)*14}" r="5" fill="#7c83fd" opacity="0.8"/>`
      ).join('');
      return `${circles}<text x="${30+ti*65+14}" y="${95}" style="font:10px sans-serif;fill:#aaa;text-anchor:middle">${count}</text>`;
    }).join('');
    return SVG.wrap(`<svg width="280" height="110" viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  ${dots}
  <text x="245" y="65" style="font:bold 22px monospace;fill:#f5b041">…</text>
  <text x="140" y="108" style="font:10px sans-serif;fill:#aaa;text-anchor:middle">Spot the pattern between consecutive terms</text>
</svg>`);
  },

  // Venn diagram — two overlapping circles (for HCF/LCM or Sets)
  vennDiagram: (labelA = 'A', labelB = 'B', centerLabel = '∩') => SVG.wrap(`<svg width="280" height="150" viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:bold 12px sans-serif;fill:#e0e0e0;text-anchor:middle}.sm{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <circle cx="100" cy="75" r="60" fill="#7c83fd" opacity="0.25" stroke="#7c83fd" stroke-width="2"/>
  <circle cx="180" cy="75" r="60" fill="#4ecdc4" opacity="0.25" stroke="#4ecdc4" stroke-width="2"/>
  <text x="72" y="78" class="lbl">${labelA}</text>
  <text x="208" y="78" class="lbl">${labelB}</text>
  <text x="140" y="78" style="font:bold 11px sans-serif;fill:#f5b041;text-anchor:middle">${centerLabel}</text>
  <text x="100" y="148" class="sm">unique to A</text>
  <text x="180" y="148" class="sm">unique to B</text>
  <text x="140" y="18" class="sm">overlap = common factors</text>
</svg>`),

  // Vocab word-association web — central word + synonym bubbles
  vocabWeb: (word, associations) => {
    const assocs = (associations || ['?','?','?']).slice(0,3);
    const positions = [{x:140,y:30},{x:255,y:100},{x:55,y:100}];
    const lines = positions.map(p=>`<line x1="140" y1="75" x2="${p.x}" y2="${p.y+20}" stroke="#555" stroke-width="1.5" stroke-dasharray="4,3"/>`).join('');
    const bubbles = positions.map((p,i)=>`
  <ellipse cx="${p.x}" cy="${p.y+20}" rx="44" ry="22" fill="#1a1a2e" stroke="#4ecdc4" stroke-width="1.5"/>
  <text x="${p.x}" y="${p.y+26}" style="font:bold 11px sans-serif;fill:#4ecdc4;text-anchor:middle">${assocs[i]}</text>`).join('');
    return SVG.wrap(`<svg width="310" height="165" viewBox="0 0 310 165" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  ${lines}
  <!-- Centre word -->
  <ellipse cx="140" cy="90" rx="58" ry="28" fill="#1a1a2e" stroke="#7c83fd" stroke-width="2"/>
  <text x="140" y="95" style="font:bold 14px sans-serif;fill:#7c83fd;text-anchor:middle">${(word||'?').toUpperCase()}</text>
  ${bubbles}
  <text x="155" y="158" style="font:10px sans-serif;fill:#aaa;text-anchor:middle">synonyms / related words</text>
</svg>`);
  },

  // Fraction pie — shows shaded portion without revealing exact value
  fractionPie: () => SVG.wrap(`<svg width="160" height="170" viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.lbl{font:11px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Pie background -->
  <circle cx="80" cy="80" r="60" fill="#1a1a2e" stroke="#555" stroke-width="2"/>
  <!-- Shaded sector (roughly 3/8 to illustrate a fraction) -->
  <path d="M80,80 L80,20 A60,60 0 0,1 137,110 Z" fill="#7c83fd" opacity="0.7"/>
  <!-- Dividing lines -->
  <line x1="80" y1="80" x2="80" y2="20" stroke="#fff" stroke-width="1.5" opacity="0.4"/>
  <line x1="80" y1="80" x2="137" y2="110" stroke="#fff" stroke-width="1.5" opacity="0.4"/>
  <line x1="80" y1="80" x2="20" y2="110" stroke="#fff" stroke-width="1.5" opacity="0.4"/>
  <text x="80" y="155" class="lbl">Shaded part ÷ Total parts = fraction</text>
  <text x="80" y="170" class="lbl">Numerator / Denominator</text>
</svg>`),

  // HCF/LCM factor tree skeleton
  factorTree: (n) => {
    const isEven = n % 2 === 0;
    return SVG.wrap(`<svg width="240" height="150" viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto">
  <style>.nd{font:bold 13px monospace;fill:#e0e0e0;text-anchor:middle}.sm{font:10px sans-serif;fill:#aaa;text-anchor:middle}</style>
  <!-- Root -->
  <circle cx="120" cy="20" r="16" fill="#1a1a2e" stroke="#7c83fd" stroke-width="2"/>
  <text x="120" y="25" class="nd">${n}</text>
  <!-- Left branch -->
  <line x1="110" y1="36" x2="70" y2="72" stroke="#555" stroke-width="1.5"/>
  <circle cx="60" cy="82" r="16" fill="#1a1a2e" stroke="${isEven?'#4ecdc4':'#f5b041'}" stroke-width="2"/>
  <text x="60" y="87" class="nd">${isEven ? 2 : '?'}</text>
  <!-- Right branch -->
  <line x1="130" y1="36" x2="170" y2="72" stroke="#555" stroke-width="1.5"/>
  <circle cx="180" cy="82" r="16" fill="#1a1a2e" stroke="#555" stroke-width="2"/>
  <text x="180" y="87" class="nd">?</text>
  <!-- Deeper branches on right -->
  <line x1="172" y1="98" x2="148" y2="128" stroke="#555" stroke-width="1.5"/>
  <circle cx="140" cy="136" r="12" fill="#1a1a2e" stroke="#555" stroke-width="2"/>
  <text x="140" y="140" class="nd" style="font-size:11px">?</text>
  <line x1="188" y1="98" x2="210" y2="128" stroke="#555" stroke-width="1.5"/>
  <circle cx="215" cy="136" r="12" fill="#1a1a2e" stroke="#555" stroke-width="2"/>
  <text x="215" y="140" class="nd" style="font-size:11px">?</text>
  <text x="120" y="148" style="display:none"/>
</svg>`);
  },
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function parseBankingPrompt(prompt, difficulty) {
  if (!prompt) return null;
  const diff = String(difficulty || 'easy').toLowerCase().replace('-', '');

  if (diff === 'easy') {
    const match = prompt.match(/Principal Rs\s*(\d+(?:\.\d+)?),\s*Rate\s*(\d+(?:\.\d+)?)%,\s*Time\s*(\d+(?:\.\d+)?)\s*years/i);
    if (match) {
      return { type: 'SI', P: parseFloat(match[1]), R: parseFloat(match[2]), T: parseFloat(match[3]) };
    }
  } else if (diff === 'medium') {
    const match = prompt.match(/Principal Rs\s*(\d+(?:\.\d+)?),\s*Rate\s*(\d+(?:\.\d+)?)%,\s*Time\s*(\d+(?:\.\d+)?)\s*years/i);
    if (match) {
      return { type: 'CI', P: parseFloat(match[1]), R: parseFloat(match[2]), T: parseFloat(match[3]) };
    }
  } else if (diff === 'hard') {
    const match = prompt.match(/Monthly Rs\s*(\d+(?:\.\d+)?),\s*Rate\s*(\d+(?:\.\d+)?)%,\s*Months\s*(\d+)/i);
    if (match) {
      return { type: 'RD_MV', P: parseFloat(match[1]), r: parseFloat(match[2]), n: parseInt(match[3], 10) };
    }
  } else {
    const match = prompt.match(/maturity Rs\s*(\d+(?:\.\d+)?),\s*Rate\s*(\d+(?:\.\d+)?)%,\s*Months\s*(\d+)/i);
    if (match) {
      return { type: 'RD_P', MV: parseFloat(match[1]), r: parseFloat(match[2]), n: parseInt(match[3], 10) };
    }
  }
  return null;
}

function maskText(text) {
  if (!text) return '';
  return text.split(' ').map(w => {
    const cleanW = w.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanW.length <= 1) return w;
    const maskedPart = cleanW[0] + '_'.repeat(cleanW.length - 1);
    let cleanIdx = 0;
    return w.split('').map(char => {
      if (/[a-zA-Z0-9]/.test(char)) {
        return maskedPart[cleanIdx++];
      }
      return char;
    }).join('');
  }).join(' ');
}

const VOCAB_HINTS_DB = {
  ambiguous: {
    synonyms: ['unclear', 'vague', 'equivocal', 'double-sided'],
    scenario: 'Imagine reading a map where roads overlap, leaving you unsure which path to take.',
  },
  brave: {
    synonyms: ['courageous', 'valiant', 'fearless', 'bold'],
    scenario: 'Think of a firefighter stepping into a burning building to rescue a trapped pet when everyone else is running away.',
  },
  curious: {
    synonyms: ['inquisitive', 'probing', 'interested', 'nosy'],
    scenario: 'Picture a child at a museum asking "Why?" and "How?" about every single artifact they see.',
  },
  happy: {
    synonyms: ['joyful', 'cheerful', 'elated', 'delighted'],
    scenario: 'Imagine the feeling of winning a championship game after months of hard training.',
  },
  angry: {
    synonyms: ['furious', 'irate', 'wrathful', 'hostile'],
    scenario: 'Think of how you feel when someone intentionally breaks your favourite toy.',
  },
  quiet: {
    synonyms: ['silent', 'noiseless', 'hushed', 'peaceful'],
    scenario: 'Imagine a library study hall during final exam week where you can hear a pin drop.',
  },
  loud: {
    synonyms: ['noisy', 'deafening', 'boisterous', 'thunderous'],
    scenario: 'Think of standing right next to the speakers at a rock concert.',
  },
  ancient: {
    synonyms: ['antique', 'primeval', 'archaic', 'very old'],
    scenario: 'Imagine discovering a dusty stone temple hidden deep inside a tropical rainforest for thousands of years.',
  },
  fast: {
    synonyms: ['rapid', 'swift', 'quick', 'fleet'],
    scenario: 'Think of a cheetah running at full speed across the savanna to catch its prey.',
  },
  vanish: {
    synonyms: ['disappear', 'fade', 'evaporate', 'dissolve'],
    scenario: 'Picture a magician waving a wand and making a rabbit disappear completely from an empty hat.',
  },
  slow: {
    synonyms: ['leisurely', 'sluggish', 'gradual', 'crawling'],
    scenario: 'Think of a snail moving across a sidewalk, or traffic stuck bumper-to-bumper in a storm.',
  },
  sincere: {
    synonyms: ['genuine', 'honest', 'heartfelt', 'truthful'],
    scenario: 'Imagine looking someone in the eye and offering an apology you truly mean from the bottom of your heart.',
  },
  scatter: {
    synonyms: ['disperse', 'spread', 'strew', 'sprinkle'],
    scenario: 'Think of throwing a handful of birdseed in the wind, seeing it fly in all different directions.',
  },
  diligent: {
    synonyms: ['hardworking', 'industrious', 'studious', 'painstaking'],
    scenario: 'Picture a student studying every single night, making flashcards, and reviewing lessons to get a perfect score.',
  },
  ephemeral: {
    synonyms: ['temporary', 'fleeting', 'transient', 'short-lived'],
    scenario: 'Think of cherry blossoms that bloom for only a few days a year, or a soap bubble that pops in seconds.',
  },
  meticulous: {
    synonyms: ['precise', 'detailed', 'painstaking', 'careful'],
    scenario: 'Imagine an artist using a single-hair brush to paint individual threads on a tiny canvas.',
  },
  mean: {
    synonyms: ['unkind', 'nasty', 'spiteful', 'hostile'],
    scenario: 'Think of someone teasing a classmate just to make them cry.',
  },
  rich: {
    synonyms: ['wealthy', 'affluent', 'prosperous', 'well-off'],
    scenario: 'Imagine a successful entrepreneur who has built a multi-million dollar business.',
  },
  poor: {
    synonyms: ['impoverished', 'needy', 'destitute', 'penniless'],
    scenario: 'Think of a family struggling to buy basic food or warm clothes for the winter.',
  },
  candid: {
    synonyms: ['frank', 'honest', 'straightforward', 'outspoken'],
    scenario: 'Imagine an interview where the candidate admits their mistakes completely honestly without trying to hide them.',
  },
  old: {
    synonyms: ['aged', 'ancient', 'elderly', 'antique'],
    scenario: 'Picture a dusty book in a library that was printed hundreds of years ago.',
  },
  serene: {
    synonyms: ['calm', 'peaceful', 'tranquil', 'placid'],
    scenario: 'Imagine sitting by a perfectly still lake at sunrise before anyone else is awake.',
  },
  young: {
    synonyms: ['youthful', 'juvenile', 'immature', 'little'],
    scenario: 'Think of a tiny puppy running around the garden chasing its own tail.',
  },
  soft: {
    synonyms: ['pliable', 'cushioning', 'gentle', 'fluffy'],
    scenario: 'Imagine resting your head on a fresh pillow filled with fluffy feathers.',
  },
  hard: {
    synonyms: ['solid', 'firm', 'difficult', 'tough'],
    scenario: 'Think of stepping on solid stone or trying to dig through frozen ground in winter.',
  },
  prudent: {
    synonyms: ['wise', 'cautious', 'careful', 'sensible'],
    scenario: 'Imagine saving a portion of your money every month in case you have an emergency later.',
  },
  sweet: {
    synonyms: ['sugary', 'honeyed', 'pleasant', 'sweet-tasting'],
    scenario: 'Think of biting into a fresh strawberry topped with whipped cream.',
  },
  sour: {
    synonyms: ['acidic', 'tart', 'sharp', 'acid'],
    scenario: 'Imagine drinking pure lemon juice and feeling your lips pucker.',
  },
  bitter: {
    synonyms: ['sharp', 'acrid', 'pungent', 'unsweetened'],
    scenario: 'Think of drinking strong black coffee without any sugar or milk.',
  },
  hungry: {
    synonyms: ['ravenous', 'starving', 'famished', 'peckish'],
    scenario: 'Imagine the feeling in your stomach after running around outside all afternoon without lunch.',
  },
};

function getAssociations(def) {
  const cleanDef = def
    .replace(/^[A-D]\)\s*/i, '')
    .replace(/^to\s+/i, '')
    .replace(/^a\s+person\s+who\s+/i, '')
    .replace(/^a\s+quality\s+or\s+state\s+of\s+/i, '');
  const stopWords = new Set(['a','an','the','to','of','in','or','and','who','related','state','quality','is','being','having','with','that','which','someone','something','manner','like','as','characteristic']);
  const words = cleanDef.toLowerCase().split(/[\s,;.()]+/);
  const keywords = [];
  for (const w of words) {
    const cleanW = w.trim().replace(/[^a-z-]/g, '');
    if (cleanW.length > 3 && !stopWords.has(cleanW)) {
      keywords.push(cleanW);
    }
  }
  return [...new Set(keywords)].slice(0, 3);
}

// ─── Spec entries ─────────────────────────────────────────────────────────────

const CONCEPTS = {

  // ── Basic arithmetic family ───────────────────────────────────────────────
  basicarith: {
    label: 'Basic Arithmetic',
    costTier: 'cheap',
    hints: {
      1: ({ q }) => {
        const opName = q.op === '+' ? 'addition' : q.op === '−' || q.op === '-' ? 'subtraction' : q.op === '×' ? 'multiplication' : 'division';
        const opTip = q.op === '+' || q.op === '−' || q.op === '-'
          ? 'Line up the digits by place value (ones under ones, tens under tens), then work column by column from right to left.'
          : q.op === '×'
          ? 'Think of multiplication as groups — break the larger number into its tens and ones parts, multiply each part separately.'
          : 'Set up long division: how many times does the divisor fit into the dividend?';
        return `This is a ${opName} problem.\n${opTip}\n${SVG.additionColumns()}`;
      },
      2: ({ q }) => {
        const op = q.op || '+';
        if (op === '+' || op === '−' || op === '-') {
          return `Start from the rightmost (ones) column. If your column total reaches 10 or more, write the ones digit and carry 1 to the next column — like bundling 10 items into a crate.`;
        }
        if (op === '×') {
          return `Multiply one digit at a time, starting from the bottom right. Remember to shift one place left for each row of a multi-digit multiplier.`;
        }
        return `Ask: how many times does the divisor go into the first digit(s) of the dividend? Write that quotient, subtract, then bring down the next digit.`;
      },
      3: null,
    },
  },

  addition: {
    label: 'Addition',
    costTier: 'cheap',
    hints: {
      1: () => {
        return `Align the numbers by place value, then add each column starting from the ones (right side).\nThink of it like stacking boxes — when one column overflows to 10, bundle them and carry one box to the next column.\n${SVG.additionColumns()}`;
      },
      2: () => {
        return `Begin at the ones column (far right). If the sum there is 10 or more, write only the ones digit below and carry 1 above the next column. Repeat for tens, hundreds, and so on.`;
      },
      3: null,
    },
  },

  multiply: {
    label: 'Multiplication',
    hints: {
      1: ({ q }) => {
        const a = q.table ?? q.a ?? 1;
        const b = q.multiplier ?? q.b ?? 1;
        const isReverse = q.isReverse || (q.prompt && q.prompt.includes('?'));

        if (isReverse) {
          return `This is a reverse multiplication problem — you know the product and one factor, and must find the missing factor.\nRemember: division is the inverse of multiplication. Rewrite the problem as a division to find the missing number.`;
        }
        if (a === 10 || a === 100 || b === 10 || b === 100) {
          return `Multiplying by 10 or 100 follows a place-value shortcut — notice how many zeros the power of 10 has. Think about how many columns every digit shifts to the left.\n${SVG.multiplyGrid(a, b)}`;
        }
        if (a < 10 && b < 10) {
          return `Think of multiplication as repeated addition — equal groups of the same size.\nIf you don't recall the fact, build it from a nearby square or double you do know.\n${SVG.multiplyGrid(a, b)}`;
        }
        return `For multi-digit multiplication, split the larger number into its tens and ones parts, then multiply each part separately and add the results (area model).\n${SVG.multiplyGrid(a, b)}`;
      },
      2: ({ q }) => {
        const a = q.table ?? q.a ?? 1;
        const b = q.multiplier ?? q.b ?? 1;
        const isReverse = q.isReverse || (q.prompt && q.prompt.includes('?'));

        if (isReverse) {
          // Don't compute the division — just describe the rewrite
          return H`You know one factor and the product. Rewrite the equation as: missing factor = product ÷ known factor. Set up that division now — do not compute it yet, just write the expression.`;
        }
        if (a === 10 || a === 100 || b === 10 || b === 100) {
          const power = (a === 10 || a === 100) ? a : b;
          const other = (power === a) ? b : a;
          const zeros = power === 10 ? 'one zero' : 'two zeros';
          return H`For ${other} × ${power}: count the zeros in ${power} — there ${power===10?'is':'are'} ${zeros}. Shift every digit of ${other} that many places to the left (or equivalently, append the zeros).`;
        }
        if (a < 10 && b < 10) {
          return H`To find ${a} × ${b}: if you know a nearby fact (like ${a} × ${b>1?b-1:b+1}), add or subtract one group of ${a} to reach the answer. Write out the nearby fact first.`;
        }
        const larger = Math.max(a, b);
        const smaller = Math.min(a, b);
        const tens = Math.floor(larger / 10) * 10;
        const ones = larger % 10;
        return H`Split ${larger} into ${tens} + ${ones}. Now multiply each part by ${smaller} separately: (${tens} × ${smaller}) and (${ones} × ${smaller}). Add the two products at the end.`;
      },
      3: ({ q }) => {
        const a = q.table ?? q.a ?? 1;
        const b = q.multiplier ?? q.b ?? 1;
        const isReverse = q.isReverse || (q.prompt && q.prompt.includes('?'));
        if (isReverse) {
          const product = q.product ?? (a * b);
          return H`Step 1: The equation is ${a} × ? = ${product}.
Step 2: Rewrite as a division: ? = ${product} ÷ ${a}.
Step 3: Compute ${product} ÷ ${a} = ${product / a}.`;
        }
        if (a === 10 || a === 100 || b === 10 || b === 100) {
          const power = (a === 10 || a === 100) ? a : b;
          const other = (power === a) ? b : a;
          const zeros = power === 10 ? 'one zero' : 'two zeros';
          return H`Step 1: Write down ${other}.
Step 2: Since we are multiplying by ${power}, append ${zeros} to the end of ${other}.
Step 3: The final result is ${other * power}.`;
        }
        const MathTable = q.table ?? q.a ?? 1;
        const MathMult = q.multiplier ?? q.b ?? 1;
        const larger = Math.max(MathTable, MathMult);
        const smaller = Math.min(MathTable, MathMult);
        const tens = Math.floor(larger / 10) * 10;
        const ones = larger % 10;
        if (tens > 0) {
          return H`Step 1: Split ${larger} into ${tens} + ${ones}.
Step 2: Multiply each part: (${tens} × ${smaller}) + (${ones} × ${smaller}).
Step 3: Sum the parts: ${tens * smaller} + ${ones * smaller} = ${tens * smaller + ones * smaller}.`;
        }
        return H`Step 1: To solve ${MathTable} × ${MathMult}, use a nearby known fact.
Step 2: ${MathTable} × ${MathMult - 1} = ${MathTable * (MathMult - 1)}.
Step 3: Add one more group of ${MathTable}: ${MathTable * (MathMult - 1)} + ${MathTable} = ${MathTable * MathMult}.`;
      },
    },
  },

  decimals: {
    label: 'Decimals',
    hints: {
      1: ({ q }) => {
        const op = q.op ?? '+';
        if (op === '+' || op === '-' || op === '−') {
          return `When adding or subtracting decimals, the golden rule is to line up the decimal points vertically — every digit must be in its correct place-value column.\n${SVG.decimalLine()}`;
        }
        if (op === '×' || op === '*') {
          return `For decimal multiplication, ignore the decimal points at first and multiply as whole numbers. You will place the decimal point back at the very end based on how many decimal places the inputs have.\n${SVG.decimalLine()}`;
        }
        return `For decimal division, multiply both the dividend and divisor by the same power of 10 to make the divisor a whole number, then divide normally.\n${SVG.decimalLine()}`;
      },
      2: ({ q }) => {
        const op = q.op ?? '+';
        const a = q.a ?? 0;
        const b = q.b ?? q.num2 ?? 0;
        if (op === '+' || op === '-' || op === '−') {
          return H`Write ${a} and ${b} one above the other with their decimal points perfectly aligned. Pad with trailing zeros so both have the same number of decimal places. Then add or subtract column by column, right to left.`;
        }
        if (op === '×' || op === '*') {
          const aPlaces = (String(a).split('.')[1] || '').length;
          const bPlaces = (String(b).split('.')[1] || '').length;
          return H`Step 1: Count the decimal places in each number (${aPlaces} and ${bPlaces} — total = ${aPlaces + bPlaces}).
Step 2: Multiply as if they were whole numbers (ignore the decimal point for now).
Step 3: In the whole-number result, count ${aPlaces + bPlaces} places from the right and insert the decimal point there.`;
        }
        return H`To divide ${a} by ${b}: first, how many decimal places does ${b} have? Multiply both numbers by 10 raised to that power to clear the decimal from the divisor. Then perform the division.`;
      },
      3: ({ q }) => {
        const op = q.op ?? '+';
        const a = q.a ?? 0;
        const b = q.b ?? q.num2 ?? 0;
        if (op === '+' || op === '-' || op === '−') {
          const aStr = String(a);
          const bStr = String(b);
          const aDec = aStr.includes('.') ? aStr.split('.')[1].length : 0;
          const bDec = bStr.includes('.') ? bStr.split('.')[1].length : 0;
          const maxDec = Math.max(aDec, bDec);
          const aPadded = Number(a).toFixed(maxDec);
          const bPadded = Number(b).toFixed(maxDec);
          const result = op === '+' ? (Number(a) + Number(b)) : (Number(a) - Number(b));
          return H`Step 1: Pad both to ${maxDec} decimal place(s): ${aPadded} and ${bPadded}.
Step 2: Align the decimal points vertically.
Step 3: ${aPadded} ${op} ${bPadded} = ${result.toFixed(maxDec)}.`;
        }
        if (op === '×' || op === '*') {
          const aVal = Math.round(a * 100) / 100;
          const bVal = Math.round(b * 100) / 100;
          const aWhole = Number(String(aVal).replace('.', ''));
          const bWhole = Number(String(bVal).replace('.', ''));
          const aPlaces = (String(aVal).split('.')[1] || '').length;
          const bPlaces = (String(bVal).split('.')[1] || '').length;
          const totalPlaces = aPlaces + bPlaces;
          const rawProduct = aWhole * bWhole;
          const finalResult = rawProduct / Math.pow(10, totalPlaces);
          return H`Step 1: Multiply as whole numbers: ${aWhole} × ${bWhole} = ${rawProduct}.
Step 2: Total decimal places: ${aPlaces} + ${bPlaces} = ${totalPlaces}.
Step 3: Insert decimal point ${totalPlaces} place(s) from the right: ${finalResult}.`;
        }
        const result2 = Number(a) / Number(b);
        return H`Step 1: Identify decimal places in divisor ${b}.
Step 2: Multiply both by the appropriate power of 10 to clear the divisor.
Step 3: Divide and simplify: ${a} ÷ ${b} = ${result2}.`;
      },
    },
  },

  // ── Algebra family ───────────────────────────────────────────────────────
  qformula: {
    label: 'Quadratic Formula',
    costTier: 'standard',
    hints: {
      1: () => 'Use the quadratic formula: x = (−b ± √(b² − 4ac)) / 2a.\nFirst, read the equation carefully and identify the values of a, b, and c.',
      2: ({ q }) => H`For this equation, a = ${q.a}, b = ${q.b}, c = ${q.c}.\nStart by computing the discriminant: D = b² − 4ac.\nSubstitute the values and simplify — do not compute the square root yet.`,
      3: null,
    },
  },

  polyfactor: {
    label: 'Polynomial Factorisation',
    hints: {
      1: ({ q }) => {
        const a = q.a ?? 1;
        const b = q.b ?? 0;
        const c = q.c ?? 0;
        const isDifferenceOfSquares = b === 0 && c < 0;
        if (isDifferenceOfSquares) {
          return 'This expression has the form x² − k. That is called a Difference of Two Squares.\nIdentity to use: x² − d² = (x − d)(x + d).\nYour job: find what d is by taking the square root of the constant term.';
        }
        if (a === 1) {
          return 'For a monic quadratic (x² + bx + c), look for two numbers that:\n  • multiply together to give the constant term c\n  • add together to give the middle coefficient b\nOnce found, slot them into (x + p)(x + q).';
        }
        return 'For ax² + bx + c (a ≠ 1), use the AC method:\n  • Find two numbers that multiply to a × c and add to b\n  • Rewrite the middle term using those two numbers\n  • Factor by grouping in pairs';
      },
      2: ({ q }) => {
        const a = q.a ?? 1;
        const b = q.b ?? 0;
        const c = q.c ?? 0;
        const isDifferenceOfSquares = b === 0 && c < 0;
        if (isDifferenceOfSquares) {
          // Only show d if it's a small obvious integer to avoid revealing it when complex
          const d = Math.sqrt(-c);
          const isSimple = Number.isInteger(d) && d <= 9;
          if (isSimple) {
            return H`The constant is −${-c}. Ask yourself: what number, when squared, gives ${-c}? Call that number d.\nThen write the factored form using the identity — but don't fill in the numbers yet, just write the template: (x − d)(x + d).`;
          }
          return `Find the square root of the constant term (ignoring the minus sign). That gives you d.\nTemplate to fill in: (x − d)(x + d). Verify by expanding to check it matches the original.`;
        }
        if (a === 1) {
          return H`You need two numbers p and q where p × q = ${c} and p + q = ${b}.\nList factor pairs of ${c}: which pair adds to ${b}? Once you find them, write (x + p)(x + q) without substituting yet.`;
        }
        return H`You need two numbers where: (number 1) × (number 2) = a × c = ${a * c}, and their sum = b = ${b}.\nList factor pairs of ${Math.abs(a * c)} with the right signs. Which pair adds to ${b}? Then split the middle term and group.`;
      },
      3: ({ q }) => {
        const a = q.a ?? 1;
        const b = q.b ?? 0;
        const c = q.c ?? 0;
        const isDifferenceOfSquares = b === 0 && c < 0;
        if (isDifferenceOfSquares) {
          const d = Math.sqrt(-c);
          return H`Step 1: Recognise x² − ${-c} as a Difference of Squares: x² − ${d}².
Step 2: Apply the identity a² − b² = (a − b)(a + b).
Step 3: The fully factored form is (x − ${d})(x + ${d}).`;
        }
        if (a === 1) {
          let p = null, qFact = null;
          outer: for (let i = -100; i <= 100; i++) {
            for (let j = -100; j <= 100; j++) {
              if (i * j === c && i + j === b) { p = i; qFact = j; break outer; }
            }
          }
          if (p !== null) {
            return H`Step 1: Find two numbers that multiply to ${c} and add to ${b}: they are ${p} and ${qFact}.
Step 2: Slot into the template (x + p)(x + q).
Step 3: Factored form: (x + ${p})(x + ${qFact}).`;
          }
        }
        let p = null, qFact = null;
        outer2: for (let i = -200; i <= 200; i++) {
          for (let j = -200; j <= 200; j++) {
            if (i * j === a * c && i + j === b) { p = i; qFact = j; break outer2; }
          }
        }
        if (p !== null) {
          return H`Step 1: a × c = ${a * c}. Find two numbers that multiply to ${a * c} and add to ${b}: they are ${p} and ${qFact}.
Step 2: Rewrite middle term: ${a}x² + ${p}x + ${qFact}x + ${c}.
Step 3: Group and factor: x(${a}x + ${p}) + ${qFact/a}(${a}x + ${p}) = (${a}x + ${p})(x + ${qFact/a}).`;
        }
        return `Step 1: Identify coefficients a, b, c.\nStep 2: Find two numbers that multiply to a·c and add to b.\nStep 3: Split the middle term and factor by grouping.`;
      },
    },
  },

  primefactor: {
    label: 'Prime Factorisation',
    costTier: 'cheap',
    hints: {
      1: ({ q }) => {
        const n = q.number;
        return `${SVG.factorTree(n || 60)}\nRepeatedly divide by the smallest possible prime: try 2, then 3, then 5, then 7…\nStop when the quotient itself is prime.`;
      },
      2: ({ q }) => {
        const n = q.number || 0;
        if (n % 2 === 0) {
          return H`${n} is even, so it is divisible by 2. Start your factor tree: ${n} ÷ 2 = ?. Then check whether that quotient is prime or can be divided again.`;
        }
        const digitSum = String(n).split('').reduce((acc, d) => acc + Number(d), 0);
        if (digitSum % 3 === 0) {
          return H`${n} is odd. Check divisibility by 3: its digit sum is ${digitSum}, which is divisible by 3, so ${n} ÷ 3 = ?. Continue dividing the quotient.`;
        }
        return H`${n} is not divisible by 2 or 3. Try dividing by 5 (does it end in 0 or 5?), then 7, then 11. Work through primes in order until you find one that divides evenly.`;
      },
      3: null,
    },
  },

  simul: {
    label: 'Simultaneous Equations',
    costTier: 'expensive',
    hints: {
      1: () => 'You have two equations and two unknowns. The two main methods are:\n  • Elimination: make one variable\'s coefficient match, then subtract/add to remove it.\n  • Substitution: express one variable in terms of the other and substitute.\nLook at the coefficients — which method looks cleaner?',
      2: ({ q }) => {
        if (q.eqs && q.eqs.length >= 2) {
          const a1 = q.eqs[0].a, a2 = q.eqs[1].a;
          if (a1 !== undefined && a2 !== undefined) {
            const mult1 = Math.abs(a2);
            const mult2 = Math.abs(a1);
            return `Try multiplying Equation 1 by ${mult1} and Equation 2 by ${mult2}.\nThis gives matching x-coefficients, so you can subtract one equation from the other to eliminate x.\nThen solve the single-variable equation that remains.`;
          }
        }
        return 'Multiply one equation by a suitable number so one variable has the same coefficient in both equations. Then add or subtract the equations to eliminate that variable.';
      },
      3: null,
    },
  },

  lineq: {
    label: 'Line Equations',
    costTier: 'standard',
    hints: {
      1: () => `You need two things to write the equation of a line: the slope m and the y-intercept c.\nForm: y = mx + c\n${SVG.coordGrid()}`,
      2: ({ q }) => H`Slope m = (y₂ − y₁) / (x₂ − x₁). Plug the two given points into this formula first and simplify the fraction — don't skip ahead to the full equation yet.`,
      3: null,
    },
  },

  funceval: {
    label: 'Function Evaluation',
    hints: {
      1: ({ q }) => {
        const formula = q.formula ?? '';
        const isConstant = !formula.includes('x');
        const isQuadratic = formula.includes('x²') || formula.includes('x^2');
        if (isConstant) {
          return 'This is a constant function — notice there is no x in the formula.\nNo matter what input you plug in, the output never changes.';
        }
        if (isQuadratic) {
          return 'To evaluate this function, substitute the x-value into every x in the formula.\nFor a quadratic, remember the order of operations: square first, then multiply by any coefficient, then add or subtract constants.';
        }
        return 'Substitute the input value into the formula by replacing every x with that value.\nWrite out the substituted expression fully before calculating — don\'t skip steps.';
      },
      2: ({ q }) => {
        const formula = q.formula ?? '';
        const xVal = q.x ?? 0;
        const isConstant = !formula.includes('x');
        const isQuadratic = formula.includes('x²') || formula.includes('x^2');
        if (isConstant) {
          return H`The formula "${formula}" has no x in it. Substituting any value leaves the formula completely unchanged — the answer is the constant you can already see.`;
        }
        if (isQuadratic) {
          // Don't compute xVal² here — just guide the first step
          return H`Write the substituted expression: replace every x in the formula with (${xVal}).\nYour first computation is: (${xVal})² = ? — calculate that square, then continue with the rest of the formula.`;
        }
        return H`Replace every x with (${xVal}). Write out the full substituted expression first.\nThen use PEMDAS/BODMAS: brackets → exponents → multiplication/division → addition/subtraction.`;
      },
      3: ({ q }) => {
        const formula = q.formula ?? '';
        const xVal = q.x ?? 0;
        const isConstant = !formula.includes('x');
        const isQuadratic = formula.includes('x²') || formula.includes('x^2');
        if (isConstant) {
          return H`Step 1: Check the formula: ${formula}.
Step 2: There is no variable x to substitute.
Step 3: The output is always the constant shown in the formula.`;
        }
        const substituted = formula.replace(/x/g, '(' + xVal + ')');
        if (isQuadratic) {
          return H`Step 1: Substitute x = ${xVal}: ${substituted}.
Step 2: Calculate (${xVal})² = ${xVal * xVal}.
Step 3: Substitute and simplify the remaining terms to find f(${xVal}).`;
        }
        return H`Step 1: Substitute x = ${xVal} into the formula: ${substituted}.
Step 2: Apply the order of operations to evaluate.
Step 3: The result is f(${xVal}).`;
      },
    },
  },

  quadratic: {
    label: 'Quadratic Evaluation',
    costTier: 'standard',
    hints: {
      1: () => 'Plug x into x² first, then multiply by the coefficient, then add the linear and constant terms.\nFollow the order of operations strictly: exponents before multiplication.',
      2: ({ q }) => H`Start by computing (${q.x})² — write that result down.\nThen multiply by ${q.a}.\nFinally add ${q.b ?? 0}·(${q.x}) and the constant ${q.c} — don't combine everything at once.`,
      3: null,
    },
  },

  polymul: {
    label: 'Polynomial Multiplication',
    costTier: 'standard',
    hints: {
      1: () => 'Use the distributive property: multiply EACH term of the first polynomial by EACH term of the second.\nThen collect and combine like terms.',
      2: ({ q }) => H`Start with the leading term of each polynomial — multiply those first. Then work through the remaining cross-products. Finally, gather all x², x, and constant terms and add them up.`,
      3: null,
    },
  },

  sqrt: {
    label: 'Square Root Approximation',
    costTier: 'standard',
    hints: {
      1: ({ q }) => {
        const n = q.n ?? q.number ?? 50;
        const lo = Math.floor(Math.sqrt(n));
        const hi = lo + 1;
        return `Find the two consecutive whole numbers whose squares sandwich your target.\n${SVG.sqrtLine(n)}\nThe diagram shows where √${n} sits on the number line — it is between ${lo} and ${hi}. Now estimate more precisely.`;
      },
      2: ({ q }) => {
        const n = q.n ?? q.number ?? 50;
        const lo = Math.floor(Math.sqrt(n));
        const hi = lo + 1;
        const loSq = lo * lo;
        const hiSq = hi * hi;
        return H`√${n} is sandwiched between ${lo} (since ${lo}² = ${loSq}) and ${hi} (since ${hi}² = ${hiSq}).\nThe gap between the squares is ${hiSq - loSq}. Your target is ${n - loSq} above ${loSq}.\nEstimate: ${lo} + (${n - loSq} ÷ ${hiSq - loSq}) ≈ ? Try a decimal between ${lo} and ${hi}.`;
      },
      3: null,
    },
  },

  // ── Coordinate / geometry family ──────────────────────────────────────────
  trig: {
    label: 'Trigonometry',
    costTier: 'standard',
    hints: {
      1: ({ q }) => `${SVG.trigTriangle()}\nSOH-CAH-TOA: look at which two sides you know (or need), then pick the matching ratio.\n  sin(θ) = Opposite / Hypotenuse\n  cos(θ) = Adjacent / Hypotenuse\n  tan(θ) = Opposite / Adjacent`,
      2: ({ q }) => `Write the trig ratio as a fraction: (known side) / (known or unknown side).\nRearrange the equation to isolate the unknown — either multiply across or apply the inverse trig function.\nDo not plug in numbers yet, just write the algebraic rearrangement.`,
      3: null,
    },
  },

  ineq: {
    label: 'Inequalities',
    costTier: 'standard',
    hints: {
      1: () => 'Solve an inequality the same way as an equation — but watch out for one key rule:\nIf you multiply or divide BOTH sides by a negative number, the inequality sign FLIPS direction.',
      2: ({ q }) => H`Isolate the variable step by step, just like solving an equation.\nAt each step ask: am I multiplying/dividing by a negative? If yes, flip the sign.\nWrite out each step before doing the arithmetic.`,
      3: null,
    },
  },

  coordgeom: {
    label: 'Coordinate Geometry',
    costTier: 'standard',
    hints: {
      1: ({ q }) => {
        if (q.type === 'midpoint') {
          return `${SVG.coordGrid()}\nMidpoint formula: average the x-coordinates, average the y-coordinates.\nM = ((x₁ + x₂) / 2,  (y₁ + y₂) / 2)`;
        }
        if (q.type === 'distance') {
          return `${SVG.coordGrid()}\nDistance formula = the hypotenuse of a right triangle.\nd = √((x₂ − x₁)² + (y₂ − y₁)²)`;
        }
        if (q.type === 'gradient') {
          return `${SVG.coordGrid()}\nGradient = rise ÷ run = (change in y) ÷ (change in x)\nm = (y₂ − y₁) / (x₂ − x₁)`;
        }
        if (q.type === 'perp_bisector') {
          return `${SVG.coordGrid()}\nPerpendicular lines: their gradients multiply to −1.\nIf the original gradient is m, the perpendicular gradient is −1/m.`;
        }
        return `${SVG.coordGrid()}\nIdentify what is being asked (midpoint, distance, or gradient) and pick the corresponding coordinate formula.`;
      },
      2: ({ q }) => {
        const coords = (q.prompt || '').match(/\(-?\d+,\s*-?\d+\)/g);
        if (coords && coords.length >= 2) {
          const pt1 = coords[0], pt2 = coords[1];
          if (q.type === 'midpoint') {
            return `Plug in: average the x-values from ${pt1} and ${pt2}, then average their y-values separately. Write the averages before simplifying.`;
          }
          if (q.type === 'distance') {
            return `Plug in: find Δx and Δy between ${pt1} and ${pt2} — that is, subtract the coordinates. Write Δx and Δy, then square each one before adding.`;
          }
          if (q.type === 'gradient') {
            return `Plug in: (change in y) between ${pt1} and ${pt2} divided by (change in x). Write the numerator and denominator separately before dividing.`;
          }
          if (q.type === 'perp_bisector') {
            return `Step 1: Find the gradient m of the line through ${pt1} and ${pt2}.\nStep 2: The perpendicular gradient is −1/m — compute that.\nStep 3: Then find the midpoint to locate the bisector.`;
          }
        }
        return 'Plug the x and y coordinates of each point into the formula one variable at a time. Write out the full substituted expression before evaluating.';
      },
      3: null,
    },
  },

  vectors: {
    label: 'Vectors',
    costTier: 'expensive',
    hints: {
      1: () => 'Vectors add component-wise: add the x-components, then add the y-components, independently.\nThe magnitude uses Pythagoras: |v| = √(x² + y²).',
      2: ({ q }) => H`For magnitude: write (x² + y²) first — do not take the square root yet, just substitute the components.\nFor direction (angle): set up tan(θ) = y/x, then apply arctan. Write the ratio before computing.`,
      3: null,
    },
  },

  matrix: {
    label: 'Matrices',
    costTier: 'expensive',
    hints: {
      1: () => 'For a 2×2 matrix: determinant = (top-left × bottom-right) − (top-right × bottom-left) = ad − bc.\nFor the inverse: if det ≠ 0, swap the main diagonal, negate the off-diagonal, then divide every entry by det.',
      2: ({ q }) => H`First compute the determinant — if it equals 0, the matrix has no inverse and you can stop.\nIf det ≠ 0, apply the 2×2 inverse formula: (1/det) × [[d, −b], [−c, a]].`,
      3: null,
    },
  },

  conics: {
    label: 'Conic Sections',
    costTier: 'expensive',
    hints: {
      1: () => 'Identify the conic type by the form of the equation:\n  Circle: x² + y² = r²\n  Ellipse: x²/a² + y²/b² = 1\n  Parabola: y = ax² + bx + c\n  Hyperbola: x²/a² − y²/b² = 1\nComplete the square if the equation is not in standard form.',
      2: ({ q }) => H`Complete the square for both x and y to rewrite in standard form. Once in standard form, read off the centre/vertex and key measurements (radius, focal distance, etc.).`,
      3: null,
    },
  },

  transform: {
    label: 'Transformations',
    costTier: 'standard',
    hints: {
      1: () => 'Apply the transformation rule to each vertex of the shape one at a time.\n  Translation: (x, y) → (x + a, y + b)\n  Reflection: flip across the axis (negate one coordinate)\n  Rotation: use the rotation formula for the given angle\n  Scaling: (x, y) → (kx, ky)',
      2: ({ q }) => H`Write the rule first: e.g. (x, y) → (x + ${q.tx ?? 'a'}, y + ${q.ty ?? 'b'}).\nThen apply it to each vertex of the shape, writing the new coordinates one at a time.`,
      3: null,
    },
  },

  bearings: {
    label: 'Bearings',
    costTier: 'standard',
    hints: {
      1: () => `Bearings are always measured CLOCKWISE from North (up on your page) and always written as three digits — e.g. 045°.\n${SVG.coordGrid()}`,
      2: ({ q }) => H`Draw North pointing straight up. From the starting point, rotate clockwise by the given angle. That direction of rotation is the bearing. Mark it carefully before calculating any distances.`,
      3: null,
    },
  },

  // ── Calculus family ──────────────────────────────────────────────────────
  diff: {
    label: 'Differentiation',
    costTier: 'expensive',
    hints: {
      1: () => 'Differentiate term by term. Apply the correct rule for each term:\n  Power rule: d/dx(xⁿ) = n·xⁿ⁻¹\n  Product rule: (uv)′ = u′v + uv′\n  Chain rule: outer′ × inner′',
      2: ({ q }) => H`Identify the type of each term (power, product, or composition).\nFor power terms, bring the exponent down and subtract 1.\nFor products or composites, write out the full rule formula before substituting anything.`,
      3: null,
    },
  },

  integ: {
    label: 'Integration',
    costTier: 'expensive',
    hints: {
      1: () => 'Integration reverses differentiation. Power rule in reverse:\n  ∫xⁿ dx = xⁿ⁺¹ / (n+1) + C\nFor definite integrals, evaluate the antiderivative at the upper bound, then subtract the value at the lower bound.',
      2: ({ q }) => H`For each term, add 1 to the exponent and divide by the new exponent.\nFor a definite integral, first find the antiderivative F(x), then compute F(upper) − F(lower). Don't skip to the subtraction before finding F(x).`,
      3: null,
    },
  },

  diffeq: {
    label: 'Differential Equations',
    costTier: 'expensive',
    hints: {
      1: () => 'Classify the equation first:\n  Separable: dy/dx = f(x)·g(y) — separate variables to opposite sides\n  Linear first-order: use an integrating factor\n  Each type has its own method.',
      2: ({ q }) => H`If separable: rearrange so all y-terms (with dy) are on one side and all x-terms (with dx) are on the other.\nThen integrate both sides independently. Don't forget the constant of integration.`,
      3: null,
    },
  },

  bounds: {
    label: 'Bounds',
    costTier: 'standard',
    hints: {
      1: () => 'Evaluate the function at the upper bound, then at the lower bound.\nSubtract: F(upper) − F(lower).',
      2: ({ q }) => H`First write F(x) — the antiderivative or the formula with x substituted.\nThen substitute x = upper and x = lower separately.\nWrite both values before doing the subtraction.`,
      3: null,
    },
  },

  sdt: {
    label: 'Stationary Points',
    costTier: 'expensive',
    hints: {
      1: () => 'To find stationary points:\n  1. Differentiate y to get dy/dx\n  2. Set dy/dx = 0 and solve for x\n  3. Find y by substituting x back into the original equation\n  4. Classify using the second derivative: d²y/dx² > 0 → minimum; < 0 → maximum.',
      2: ({ q }) => H`Start by differentiating — write out dy/dx before setting it to zero.\nSolving dy/dx = 0 gives the x-coordinate(s) of stationary points — but don't plug into y yet, just find x first.`,
      3: null,
    },
  },

  // ── Number / arithmetic topics ───────────────────────────────────────────
  hcfLcm: {
    label: 'HCF & LCM',
    costTier: 'standard',
    hints: {
      1: ({ q }) => {
        const nums = q.numbers ?? (q.a && q.b ? [q.a, q.b] : [12, 18]);
        return `${SVG.vennDiagram(`Factors of ${nums[0]}`, `Factors of ${nums[1]}`, 'Common')}\nPrime factorise both numbers first.\n  HCF → take shared primes at LOWEST power\n  LCM → take ALL primes at HIGHEST power`;
      },
      2: ({ q }) => {
        const nums = q.numbers ?? (q.a && q.b ? [q.a, q.b] : null);
        if (nums && nums.length >= 2) {
          return H`Prime-factorise ${nums[0]} and ${nums[1]} by dividing by primes in order (2, 3, 5, 7…).\nList all prime factors with their powers for each number.\nFor HCF: pick each prime that appears in BOTH lists, at its lower power.\nFor LCM: pick every prime that appears in EITHER list, at its higher power.`;
        }
        return 'Prime-factorise both numbers, then for HCF pick the common primes at lowest power; for LCM pick all primes at highest power.';
      },
      3: null,
    },
  },

  rounding: {
    label: 'Rounding',
    costTier: 'cheap',
    hints: {
      1: () => 'Look at the digit IMMEDIATELY to the RIGHT of the place you are rounding to.\n  If that digit is 5 or more → round UP (add 1 to the target digit)\n  If that digit is 4 or less → round DOWN (keep the target digit unchanged)\nAll digits to the right of the target become zeros.',
      2: ({ q }) => H`Identify the target place (${q.dp ?? q.precision ?? 'the required decimal place'}) in ${q.n}.\nCircle the digit immediately to its right — that is the "deciding digit".\nIs it ≥ 5? Round up. Is it ≤ 4? Round down.`,
      3: null,
    },
  },

  profitLoss: {
    label: 'Profit & Loss',
    costTier: 'standard',
    hints: {
      1: () => 'Key formulas:\n  Profit = Selling Price − Cost Price  (when SP > CP)\n  Loss = Cost Price − Selling Price  (when CP > SP)\n  Profit% = (Profit / Cost Price) × 100\n  Loss% = (Loss / Cost Price) × 100\nNote: percentage is always computed on the Cost Price.',
      2: ({ q }) => H`First compute the raw profit or loss: SP − CP (or CP − SP).\nThen express that as a percentage of the Cost Price.\nWrite the fraction clearly before multiplying by 100.`,
      3: null,
    },
  },

  binomial: {
    label: 'Binomial Theorem',
    costTier: 'expensive',
    hints: {
      1: () => 'The Binomial Theorem expands (a + b)ⁿ into a sum of terms.\nEach term looks like: C(n, r) · aⁿ⁻ʳ · bʳ for r = 0, 1, 2, …, n.\nThe coefficients C(n, r) come from Pascal\'s triangle or the formula n! / (r!(n−r)!)',
      2: ({ q }) => H`For (a + b)^${q.n ?? 'n'}: write out each term for r = 0, 1, 2, …, ${q.n ?? 'n'}.\nFor each term: find C(${q.n ?? 'n'}, r), then compute aⁿ⁻ʳ, then bʳ. Multiply all three.\nDo one term at a time — don't jump to the final sum yet.`,
      3: null,
    },
  },

  complex: {
    label: 'Complex Numbers',
    costTier: 'expensive',
    hints: {
      1: () => 'Complex numbers: z = a + bi where i² = −1.\n  Addition/Subtraction: add real parts, add imaginary parts, separately.\n  Multiplication: FOIL the two binomials, replace i² with −1.\n  Division: multiply numerator AND denominator by the conjugate of the denominator.',
      2: ({ q }) => H`Write out the FOIL expansion step by step before combining.\nFor division, the conjugate of (c + di) is (c − di). Multiply top and bottom by it, then simplify.`,
      3: null,
    },
  },

  stdform: {
    label: 'Standard Form',
    costTier: 'standard',
    hints: {
      1: () => 'Standard form: A × 10ⁿ where 1 ≤ A < 10 and n is any integer.\nThe value of n tells you how many places the decimal point moved:\n  Large number → n is positive\n  Small number (< 1) → n is negative',
      2: ({ q }) => H`Take your number and move the decimal point until exactly ONE non-zero digit is to its left.\nCount the number of places you moved — that is |n|.\nIf the original number was > 10, n is positive. If it was < 1, n is negative.`,
      3: null,
    },
  },

  variation: {
    label: 'Variation',
    costTier: 'expensive',
    hints: {
      1: () => 'Two types of variation:\n  Direct (y ∝ x): y = kx — as x doubles, y doubles.\n  Inverse (y ∝ 1/x): y = k/x — as x doubles, y halves.\nFirst identify which type from the problem, then find the constant k.',
      2: ({ q }) => H`Use the given pair of values to find k: substitute x and y into the correct formula (y = kx or y = k/x) and solve for k.\nWrite the equation with k on one side before substituting the known pair.`,
      3: null,
    },
  },

  // ── Geometry topics ──────────────────────────────────────────────────────
  angles: {
    label: 'Angles',
    costTier: 'cheap',
    hints: {
      1: () => `${SVG.angleDiagram()}\nKey angle facts:\n  Straight line: angles add to 180°\n  Full turn: angles add to 360°\n  Triangle: angles add to 180°\n  Vertically opposite angles are equal`,
      2: ({ q }) => H`Identify which angle rule applies from the diagram (e.g. angles on a straight line, angles in a triangle).\nWrite the equation: (known angle) + (unknown angle) = total.\nSolve for the unknown.`,
      3: null,
    },
  },

  triangles: {
    label: 'Triangles',
    costTier: 'standard',
    hints: {
      1: () => `${SVG.rightTriangle(false)}\nThe interior angles of any triangle always add to 180°.\nFor an isosceles triangle: the two base angles are equal.`,
      2: ({ q }) => {
        if ((q.prompt || '').toLowerCase().includes('isosceles')) {
          return 'For an isosceles triangle: subtract the apex angle from 180°, then divide the remainder by 2 to get each base angle. Write the subtraction before dividing.';
        }
        return 'Add the two known angles. Subtract their sum from 180° to find the third angle. Write the addition step before the subtraction step.';
      },
      3: null,
    },
  },

  congruence: {
    label: 'Congruence',
    costTier: 'standard',
    hints: {
      1: () => 'Five congruence rules: SSS, SAS, ASA, AAS, RHS.\nList what is given as equal (sides, angles) and match that list against the five rules.\nYou only need ONE rule to establish congruence.',
      2: ({ q }) => H`Make a checklist: which sides are equal? Which angles are equal?\nNow try each congruence rule in turn — stop when one fits all your given facts.\nState the rule by its three-letter code (SSS, SAS, etc.) and write which elements match it.`,
      3: null,
    },
  },

  pythag: {
    label: 'Pythagoras',
    costTier: 'cheap',
    hints: {
      1: ({ q }) => {
        const findHyp = !(q.prompt && (q.prompt.toLowerCase().includes('leg') || q.prompt.toLowerCase().includes('side a') || q.prompt.toLowerCase().includes('side b')));
        return `${SVG.rightTriangle(findHyp)}\nFor any right triangle: a² + b² = c²\n  c is always the hypotenuse (opposite the right angle — the longest side).\n  a and b are the two legs (shorter sides).`;
      },
      2: ({ q }) => {
        const findHyp = !(q.prompt && (q.prompt.toLowerCase().includes('leg') || q.prompt.toLowerCase().includes('side a') || q.prompt.toLowerCase().includes('side b')));
        if (findHyp) {
          return `Label the two known sides as a and b. Square each one.\nWrite: c² = a² + b². Add the two squared values — that gives you c².\nThen take the square root to find c.`;
        }
        return `You know the hypotenuse c and one leg. Rearrange: a² = c² − b² (or b² = c² − a²).\nSubstitute the two known values — compute c² and the known leg² separately before subtracting.`;
      },
      3: null,
    },
  },

  polygons: {
    label: 'Polygons',
    costTier: 'standard',
    hints: {
      1: () => 'Key polygon angle formulas:\n  Sum of interior angles = (n − 2) × 180°\n  Each interior angle of a REGULAR n-gon = (n − 2) × 180° / n\n  Each exterior angle of a REGULAR n-gon = 360° / n',
      2: ({ q }) => H`Count the number of sides (n).\nSubstitute into (n − 2) × 180° to get the total interior angle sum.\nFor a regular polygon, divide that sum by n to get each individual angle.`,
      3: null,
    },
  },

  circleTh: {
    label: 'Circle Theorems',
    costTier: 'expensive',
    hints: {
      1: ({ q }) => {
        if (q.type === 'semicircle') {
          return 'Theorem: The angle subtended by a diameter at the circumference (inside a semicircle) is always exactly 90°.\nLook for a triangle inscribed in a semicircle — the angle opposite the diameter is the right angle.';
        }
        if (q.type === 'centre_circum') {
          return 'Theorem: The angle at the CENTRE of a circle is exactly TWICE the angle at the CIRCUMFERENCE — both subtended by the same arc.';
        }
        if (q.type === 'cyclic_quad') {
          return 'Theorem: In a cyclic quadrilateral (all four vertices on the circle), opposite angles add to 180°.';
        }
        if (q.type === 'tangent_secant') {
          return 'Theorem: A tangent to a circle meets the radius at exactly 90°. The alternate segment theorem also applies — the angle between a tangent and a chord equals the inscribed angle in the alternate segment.';
        }
        return 'Identify the relevant theorem from the diagram (semicircle angle, angle at centre, cyclic quad, or tangent) before setting up any equation.';
      },
      2: ({ q }) => {
        if (q.type === 'semicircle') {
          return 'Since one angle in the triangle is 90° (the semicircle angle), you have a right triangle.\nWrite: 90° + (known angle) + (unknown angle) = 180°. Solve for the unknown.';
        }
        if (q.type === 'centre_circum') {
          if ((q.prompt || '').toLowerCase().includes('centre =')) {
            return 'The angle at the centre is given. Divide it by 2 to get the angle at the circumference.';
          }
          return 'The angle at the circumference is given. Multiply it by 2 to get the angle at the centre.';
        }
        if (q.type === 'cyclic_quad') {
          return 'Write the equation: (known opposite angle) + (unknown angle) = 180°. Subtract the known angle from 180°.';
        }
        if (q.type === 'tangent_secant') {
          return 'Mark all 90° angles where tangents meet radii. Use those right angles plus the angle sum in any triangles formed to find the unknown.';
        }
        return 'Plug the given numbers into the matching circle theorem equation and solve.';
      },
      3: null,
    },
  },

  mensur: {
    label: 'Mensuration',
    costTier: 'standard',
    hints: {
      1: () => 'Pick the formula that matches the shape:\n  Triangle: Area = ½ × base × height\n  Rectangle: Area = length × width\n  Circle: Area = πr²,  Circumference = 2πr\n  Trapezium: Area = ½(a + b) × h\n  Sphere: Volume = (4/3)πr³\n  Cylinder: Volume = πr²h',
      2: ({ q }) => H`Identify the shape and all given dimensions. Write down the correct formula for that shape.\nSubstitute the known values into the formula — leave unknown dimensions as letters until you've written the full expression.`,
      3: null,
    },
  },

  // ── Algebra extras ────────────────────────────────────────────────────────
  prob: {
    label: 'Probability',
    costTier: 'standard',
    hints: {
      1: () => 'Key probability rules:\n  P(event) = favourable outcomes ÷ total outcomes\n  P(A or B) = P(A) + P(B) − P(A and B)   [or P(A)+P(B) if mutually exclusive]\n  P(A and B) = P(A) × P(B)   [only if independent]',
      2: ({ q }) => H`First, count the favourable outcomes and the total possible outcomes.\nCheck: are the events independent? mutually exclusive? That determines which rule to use.\nSet up the fraction or multiplication before calculating.`,
      3: null,
    },
  },

  stats: {
    label: 'Statistics',
    costTier: 'standard',
    hints: {
      1: () => 'Key measures:\n  Mean = sum of all values ÷ number of values\n  Median = the middle value when data is sorted in order\n  Mode = the value that appears most often\n  Range = largest value − smallest value',
      2: ({ q }) => H`If finding median or mode: sort the data in ascending order first.\nThen apply the matching formula.\nWrite the sorted list before computing anything.`,
      3: null,
    },
  },

  log: {
    label: 'Logarithms',
    costTier: 'expensive',
    hints: {
      1: () => 'Log laws:\n  log(a) + log(b) = log(ab)\n  log(a) − log(b) = log(a/b)\n  n × log(a) = log(aⁿ)\n  log_b(b) = 1   and   log_b(1) = 0\nIdentify which law lets you simplify or combine terms.',
      2: ({ q }) => H`Identify the log law that applies and combine or simplify the terms.\nOnce the equation reads log_b(X) = something, exponentiate both sides: b^(something) = X.\nDon't skip the "apply-the-law" step before exponentiating.`,
      3: null,
    },
  },

  bases: {
    label: 'Bases & Indices',
    costTier: 'standard',
    hints: {
      1: () => 'Index laws:\n  aᵐ × aⁿ = aᵐ⁺ⁿ\n  aᵐ ÷ aⁿ = aᵐ⁻ⁿ\n  (aᵐ)ⁿ = aᵐⁿ\n  a⁰ = 1\n  a⁻ⁿ = 1/aⁿ\n  a^(1/n) = ⁿ√a',
      2: ({ q }) => {
        const expr = q.expression ?? q.prompt ?? '';
        if (expr.includes('×') || expr.includes('*')) {
          return H`The bases look the same — if so, keep the base and ADD the exponents: aᵐ × aⁿ = aᵐ⁺ⁿ.\nWrite out the exponents from the expression and add them before simplifying.`;
        }
        if (expr.includes('÷') || expr.includes('/')) {
          return H`The bases look the same — keep the base and SUBTRACT the exponents: aᵐ ÷ aⁿ = aᵐ⁻ⁿ.\nWrite out both exponents before subtracting.`;
        }
        return 'Write out what each index means (e.g. a³ = a × a × a), then identify which index law applies (add for multiplication, subtract for division, multiply for power-of-a-power).';
      },
      3: null,
    },
  },

  // ── General knowledge & vocab ─────────────────────────────────────────────
  gk: {
    label: 'General Knowledge',
    costTier: 'standard',
    hints: {
      1: ({ q, a }) => {
        const resolvedAns = getAnswerData('gk', q, a);
        const correctLetter = resolvedAns.correctAnswer || '';
        const options = q.options || [];
        const genre = q.genre || 'general knowledge';
        if (!correctLetter || options.length < 2) {
          return `Category: ${genre}. Re-read the question carefully and think about what you know about this topic.`;
        }
        const correctIdx = correctLetter.charCodeAt(0) - 65;
        // Eliminate one wrong answer — pick the one furthest from the correct index
        const incorrectIndices = [];
        for (let i = 0; i < options.length; i++) {
          if (i !== correctIdx) incorrectIndices.push(i);
        }
        const optionLabels = ['A', 'B', 'C', 'D'];
        const eliminatedIdx = incorrectIndices[0];
        const eliminatedOption = `${optionLabels[eliminatedIdx]}) ${options[eliminatedIdx]}`;
        return `Category: ${genre}.\nYou can rule out one option: "${eliminatedOption}".\nNow think carefully about what remains — re-read each option.`;
      },
      2: ({ q, a }) => {
        const resolvedAns = getAnswerData('gk', q, a);
        const correctLetter = resolvedAns.correctAnswer || '';
        const options = q.options || [];
        if (!correctLetter || options.length < 3) {
          return 'Try to eliminate options that seem clearly incorrect. Which options can you rule out with confidence?';
        }
        const correctIdx = correctLetter.charCodeAt(0) - 65;
        const incorrectIndices = [];
        for (let i = 0; i < options.length; i++) {
          if (i !== correctIdx) incorrectIndices.push(i);
        }
        const optionLabels = ['A', 'B', 'C', 'D'];
        // 50/50: keep correct + one wrong
        const keepWrongIdx = incorrectIndices[1] !== undefined ? incorrectIndices[1] : incorrectIndices[0];
        const remaining1 = `${optionLabels[correctIdx]}) ${options[correctIdx]}`;
        const remaining2 = `${optionLabels[keepWrongIdx]}) ${options[keepWrongIdx]}`;
        return `50/50 Clue: The answer is either "${remaining1}" or "${remaining2}".\nThink about which one matches the question more precisely.`;
      },
      3: ({ q, a }) => {
        const resolvedAns = getAnswerData('gk', q, a);
        const correctLetter = resolvedAns.correctAnswer || '';
        const correctText = resolvedAns.correctAnswerText || '';
        if (!correctLetter || !correctText) {
          return 'Study the options carefully to find the best match.';
        }
        return `Solution: The correct answer is ${correctLetter}) ${correctText.replace(/^[A-D]\)\s*/, '')}.`;
      },
    },
  },

  vocab: {
    label: 'Vocabulary',
    costTier: 'cheap',
    hints: {
      1: ({ q, a }) => {
        const word = (q.word || q.question || '').toLowerCase().trim();
        const resolvedAns = getAnswerData('vocab', q, a);
        const fullText = resolvedAns.correctAnswerText || '';
        if (!fullText) return 'Look for synonyms — words with very similar meanings to the given word.';
        const def = fullText.replace(/^[A-D]\)\s*/, '');

        let associations = [];
        if (VOCAB_HINTS_DB[word] && VOCAB_HINTS_DB[word].synonyms) {
          associations = VOCAB_HINTS_DB[word].synonyms;
        } else {
          associations = getAssociations(def);
        }

        if (associations.length === 0) {
          return 'Look for synonyms — words that mean the same or very similar things.';
        }
        return `${SVG.vocabWeb(word, associations.slice(0,3))}\nThe diagram shows words closely related to "${word}".\nThink about which meaning best matches the definition options given.`;
      },
      2: ({ q, a }) => {
        const word = (q.word || q.question || '').toLowerCase().trim();
        const resolvedAns = getAnswerData('vocab', q, a);
        const fullText = resolvedAns.correctAnswerText || '';
        if (!fullText) return 'Think of a situation or scenario where you would use this word — that context often points to the meaning.';
        const def = fullText.replace(/^[A-D]\)\s*/, '');
        const lowerDef = def.charAt(0).toLowerCase() + def.slice(1);

        if (def.toLowerCase().startsWith('to ')) {
          return `Picture a scene where someone is in the act of "${lowerDef.replace(/^to\s+/i, '')}".\nNow look at the options — which definition matches that action?`;
        }
        if (def.toLowerCase().startsWith('a person who ')) {
          return `Imagine a person who "${lowerDef.replace(/^a\s+person\s+who\s+/i, '')}".\nNow look at the options — which definition describes that kind of person?`;
        }
        return `Imagine a real situation where you would describe something as "${lowerDef}".\nNow match that mental image against the definition options.`;
      },
      3: ({ q, a }) => {
        const resolvedAns = getAnswerData('vocab', q, a);
        const correctLetter = resolvedAns.correctAnswer || '';
        const correctText = resolvedAns.correctAnswerText || '';
        if (!correctLetter || !correctText) {
          return 'Study the definition options carefully to find the best match.';
        }
        return `Solution: The correct answer is ${correctLetter}) ${correctText.replace(/^[A-D]\)\s*/, '')}.`;
      },
    },
  },

  // ── Mixed / catch-all ────────────────────────────────────────────────────
  random: {
    label: 'Random Mix',
    costTier: 'standard',
    hints: {
      1: ({ q }) => H`First, identify what type of problem this is (arithmetic, algebra, geometry, etc.).\nOnce you know the category, pick the matching strategy — don't start calculating until you have a plan.`,
      2: () => 'List what is given (the knowns), list what you need to find (the unknown), then look for the relationship or formula that connects them.',
      3: null,
    },
  },

  custom: {
    label: 'Custom Quiz',
    costTier: 'standard',
    hints: {
      1: () => 'Re-read carefully and identify the question type before choosing a method.',
      2: () => 'Break the problem into smaller parts. Solve each part, then combine the results.',
      3: null,
    },
  },

  tatsavit: {
    label: 'Tatsavit Drill',
    costTier: 'cheap',
    hints: {
      1: ({ q }) => H`This is a recall drill. Re-read the question and all four options carefully.\nEliminate any option you are confident is wrong before making a choice.`,
      2: () => 'Eliminate the options you are sure are wrong first. Then carefully compare what remains — read each option word by word.',
      3: null,
    },
  },

  adaptive: {
    label: 'Adaptive Practice',
    costTier: 'standard',
    hints: {
      1: () => 'Difficulty adapts to your recent performance — take your time on each question.',
      2: () => 'List what you know from the question, identify what you are solving for, then write down the formula or rule that connects them before calculating.',
      3: null,
    },
  },

  journey: {
    label: 'Journey / Path',
    costTier: 'cheap',
    hints: {
      1: () => 'On a learning path, focus on the current step — mastery builds gradually.',
      2: () => 'Re-state the question in your own words, identify what information you already have, then find the single calculation that closes the gap.',
      3: null,
    },
  },

  cards: {
    label: 'Guess the Number',
    costTier: 'cheap',
    hints: {
      1: () => 'Think about the range of possible numbers. Each higher/lower clue cuts the range in half — the optimal strategy is always to guess the midpoint of the remaining range.',
      2: ({ q }) => {
        const lo = q.min ?? 1;
        const hi = q.max ?? 100;
        const mid = Math.floor((lo + hi) / 2);
        return H`Current range: ${lo} to ${hi}. Midpoint = ${mid}.\nGuessing ${mid} eliminates half the remaining possibilities regardless of the answer — it is the most efficient guess.`;
      },
      3: null,
    },
  },

  // ── Standalone quiz apps ─────────────────────────────────────────────────
  sets: {
    label: 'Sets',
    costTier: 'standard',
    hints: {
      1: ({ q }) => {
        return `${SVG.vennDiagram('A', 'B', 'A∩B')}\nA SET is a collection of distinct elements.\nIdentify the operation: union (A∪B = all elements), intersection (A∩B = common only), complement (elements NOT in the set), or cardinality (count of elements).`;
      },
      2: () => 'List the elements of each set first. Then apply the operation:\n  Union → combine both lists (no duplicates)\n  Intersection → keep only elements that appear in BOTH lists\n  Complement → elements in the universal set but NOT in the given set',
      3: null,
    },
  },

  sequences: {
    label: 'Sequences & Series',
    costTier: 'standard',
    hints: {
      1: ({ q }) => {
        const terms = q.terms || q.sequence || [];
        const showTerms = Array.isArray(terms) && terms.length >= 3 ? terms.slice(0,4).map(Number) : [1,4,9,16];
        return `${SVG.sequenceDots(showTerms)}\nIdentify the sequence type by looking at consecutive differences:\n  Arithmetic: constant difference (add or subtract the same each time)\n  Geometric: constant ratio (multiply or divide by the same each time)\n  Other: look for a pattern in the differences of the differences.`;
      },
      2: () => 'Find the common difference d (arithmetic) or common ratio r (geometric) between consecutive terms.\nArithmetic: aₙ = a₁ + (n−1)d\nGeometric: aₙ = a₁ × rⁿ⁻¹\nWrite the formula before substituting n.',
      3: null,
    },
  },

  ratio: {
    label: 'Ratio & Proportion',
    costTier: 'standard',
    hints: {
      1: ({ q }) => {
        const parts = (q.ratio || '').toString().split(':').map(Number).filter(n => !isNaN(n) && n > 0);
        const a = parts[0] || 3, b = parts[1] || 2;
        return `${SVG.ratioBar(a, b)}\nA ratio compares two quantities (a : b). Total number of parts = a + b.\nTo find the value of one part: divide the total amount by (a + b).\nThen multiply the value of one part by each share.`;
      },
      2: () => 'Express the ratio in simplest form (divide both numbers by their GCD).\nThen find the value of one part: Total ÷ (sum of ratio parts).\nMultiply by each share to get each amount. Write the "one part = ?" step clearly.',
      3: null,
    },
  },

  percent: {
    label: 'Percentages',
    costTier: 'cheap',
    hints: {
      1: ({ q }) => {
        return `${SVG.percentGrid()}\nPERCENT means "per hundred" — imagine 100 equal squares.\n  Part → Percent: (part ÷ whole) × 100\n  Percent → Amount: whole × (percent ÷ 100)\n  Percentage change: (change ÷ original) × 100`;
      },
      2: () => 'Identify the three elements: the PART, the WHOLE, and the PERCENT.\nDecide which one is unknown, then use: part = whole × (percent ÷ 100).\nWrite the equation with the unknown on one side before substituting numbers.',
      3: null,
    },
  },

  indices: {
    label: 'Indices / Exponents',
    costTier: 'cheap',
    hints: {
      1: ({ q }) => H`INDICES show how many times a base is multiplied by itself.\nKey rules: a⁰ = 1, a¹ = a, a⁻ⁿ = 1/aⁿ, a^(m/n) = ⁿ√(aᵐ).\nCheck whether the index is negative, fractional, or zero — each needs a different rule.`,
      2: () => 'Laws: multiply → add exponents, divide → subtract, power of a power → multiply.\nChoose the matching law and write out the simplified expression step by step.',
      3: null,
    },
  },

  surds: {
    label: 'Surds',
    costTier: 'expensive',
    hints: {
      1: ({ q }) => H`A SURD is an irrational root that cannot be simplified to an exact whole number.\nFirst, identify the operation: simplify, expand (multiply), or rationalise the denominator.\n  Simplify: √(a×b) = √a × √b — look for perfect-square factors\n  Rationalise: multiply top and bottom by the conjugate`,
      2: () => 'To simplify: find the largest perfect-square factor of the number under the root.\n  e.g. √72 = √(36×2) = 6√2\nTo rationalise a denominator (a+√b): multiply by (a−√b)/(a−√b).\nWrite the factorisation step before computing.',
      3: null,
    },
  },

  banking: {
    label: 'Banking (RD)',
    costTier: 'standard',
    hints: {
      1: ({ q }) => {
        const difficulty = q.difficulty || 'easy';
        const diff = String(difficulty).toLowerCase().replace('-', '');
        if (diff === 'easy') {
          return 'Simple Interest (SI) formula:\n  SI = (P × R × T) / 100\n  P = Principal, R = Rate % per year, T = Time in years.\nIdentify which value you are solving for, then rearrange if needed.';
        } else if (diff === 'medium') {
          return 'Compound Interest:\n  Amount A = P × (1 + R/100)ᵀ\n  CI = A − P\nCompute the multiplier (1 + R/100) first, then raise it to the power T.';
        } else if (diff === 'hard') {
          return 'Recurring Deposit — Maturity Value:\n  MV = P×n + Interest\n  Interest = P × [n(n+1) / (2×12)] × (r/100)\nBreak it into two parts: total deposited, then interest earned, then add.';
        } else {
          return 'Recurring Deposit — find the monthly instalment P:\n  MV = P × [n + (n(n+1) × r) / 2400]\nYou know MV, r, and n — rearrange to solve for P.';
        }
      },
      2: ({ q }) => {
        const difficulty = q.difficulty || 'easy';
        const parsed = parseBankingPrompt(q.prompt, difficulty);
        if (!parsed) {
          return 'Identify P (principal), R (rate), and T/n (time/months) from the question. Plug them into the formula and simplify step by step.';
        }
        if (parsed.type === 'SI') {
          return H`Values: P = Rs ${parsed.P}, R = ${parsed.R}%, T = ${parsed.T} years.\nFormula: SI = (P × R × T) / 100.\nStart by multiplying the three values in the numerator — write that product before dividing by 100.`;
        } else if (parsed.type === 'CI') {
          return H`Values: P = Rs ${parsed.P}, R = ${parsed.R}%, T = ${parsed.T} years.\nFirst compute the multiplier: 1 + R/100 = 1 + ${parsed.R}/100.\nWrite that decimal value, then raise it to the power ${parsed.T} — don't skip that step.`;
        } else if (parsed.type === 'RD_MV') {
          return H`Values: Monthly P = Rs ${parsed.P}, r = ${parsed.r}%, n = ${parsed.n} months.\nTotal deposited = P × n = Rs ${parsed.P} × ${parsed.n}.\nNow calculate the interest separately using I = P × [n(n+1)/24] × (r/100), then add both.`;
        } else {
          return H`Values: MV = Rs ${parsed.MV}, r = ${parsed.r}%, n = ${parsed.n} months.\nSimplify the bracket first: n + (n × (n+1) × r) / 2400.\nSubstitute n = ${parsed.n} and r = ${parsed.r} into that expression — compute the bracket value before dividing MV by it.`;
        }
      },
      3: ({ q }) => {
        const difficulty = q.difficulty || 'easy';
        const parsed = parseBankingPrompt(q.prompt, difficulty);
        if (!parsed) {
          return 'Refer to the step-by-step worked solution.';
        }
        if (parsed.type === 'SI') {
          const rawAnswer = (parsed.P * parsed.R * parsed.T) / 100;
          return `Step 1: Formula: SI = (P × R × T) / 100
Step 2: Substitute: SI = (${parsed.P} × ${parsed.R} × ${parsed.T}) / 100
Step 3: Numerator = ${parsed.P * parsed.R * parsed.T}
Step 4: SI = ${parsed.P * parsed.R * parsed.T} / 100 = Rs ${rawAnswer.toFixed(2)}`;
        } else if (parsed.type === 'CI') {
          const factor = 1 + parsed.R / 100;
          const factorPow = Math.pow(factor, parsed.T);
          const amount = parsed.P * factorPow;
          const rawAnswer = amount - parsed.P;
          return `Step 1: Multiplier = 1 + ${parsed.R}/100 = ${factor}
Step 2: A = ${parsed.P} × (${factor})^${parsed.T} = ${parsed.P} × ${factorPow.toFixed(6)} = Rs ${amount.toFixed(2)}
Step 3: CI = A − P = ${amount.toFixed(2)} − ${parsed.P} = Rs ${rawAnswer.toFixed(2)}`;
        } else if (parsed.type === 'RD_MV') {
          const I = (parsed.P * parsed.n * (parsed.n + 1) / 24) * (parsed.r / 100);
          const MV = parsed.P * parsed.n + I;
          return `Step 1: Total deposited = ${parsed.P} × ${parsed.n} = Rs ${parsed.P * parsed.n}
Step 2: Interest = ${parsed.P} × [${parsed.n}×${parsed.n+1}/24] × (${parsed.r}/100) = Rs ${I.toFixed(2)}
Step 3: MV = ${parsed.P * parsed.n} + ${I.toFixed(2)} = Rs ${MV.toFixed(2)}`;
        } else {
          const factor = parsed.n + (parsed.n * (parsed.n + 1) / 24) * (parsed.r / 100);
          const rawAnswer = parsed.MV / factor;
          const mult = parsed.n * (parsed.n + 1);
          const intTerm = (mult / 24) * (parsed.r / 100);
          return `Step 1: MV = P × [n + (n(n+1)r)/2400]
Step 2: Bracket = ${parsed.n} + (${mult} × ${parsed.r})/2400 = ${parsed.n} + ${intTerm.toFixed(4)} = ${factor.toFixed(4)}
Step 3: P = ${parsed.MV} / ${factor.toFixed(4)} = Rs ${rawAnswer.toFixed(2)}`;
        }
      },
    },
  },

  linprog: {
    label: 'Linear Programming',
    hints: {
      1: () => 'Identify the objective function (what you are maximising or minimising) and all the constraints (inequalities).\nWrite each constraint as a linear inequality before doing anything else.',
      2: () => 'Graph each constraint to find the feasible region — the area that satisfies ALL constraints simultaneously.\nThe optimal solution always occurs at a corner point (vertex) of the feasible region.',
      3: null,
    },
  },

  fractionadd: {
    label: 'Fraction Addition/Subtraction',
    costTier: 'cheap',
    hints: {
      1: () => `${SVG.fractionPie()}\nTo add or subtract fractions, both denominators must be equal (a common denominator).\nFind the LCM of the denominators — that becomes your common denominator.\nThen convert each fraction before adding or subtracting numerators.`,
      2: ({ q }) => {
        const a = q.a ?? '1/2', b = q.b ?? '1/3';
        return H`Step 1: Find the LCM of the denominators in ${a} and ${b}.\nStep 2: Convert each fraction to the common denominator — multiply numerator and denominator by the same number.\nStep 3: Add (or subtract) the numerators only — keep the denominator the same. Simplify at the end.`;
      },
      3: null,
    },
  },
};

// --- Public API --------------------------------------------------------------

function getSpec(concept) {
  if (!concept) return null;
  const normalized = concept.toLowerCase().trim();
  const gymMapping = {
    gymdecimals: 'decimals',
    funcgym: 'funceval',
    dotprodgym: 'dotprod',
    fracaddgym: 'fractionadd',
    lineqgym: 'lineq',
    indicesgym: 'indices',
    polygym: 'polymul',
  };
  const mapped = gymMapping[normalized] || normalized;
  const key = Object.keys(CONCEPTS).find(k => k.toLowerCase() === mapped);
  return CONCEPTS[key] || CONCEPTS['_default'] || null;
}


const COSTS = {
  1: 5,
  2: 8,
  3: 10,
};

function costFor(concept, level) {
  return COSTS[level] || null;
}

function buildHints(concept, qData, aData, explanation) {
  const spec = getSpec(concept);
  const ctx = { q: qData || {}, a: aData || {}, explanation };

  if (!spec || !spec.hints) {
    return {
      level1: GENERIC_L1(qData),
      level2: GENERIC_L2(qData),
      level3: GENERIC_L3(explanation),
      tier: 'standard',
    };
  }

  const l1 = spec.hints[1];
  const l2 = spec.hints[2];
  const l3 = spec.hints[3];

  let level1, level2, level3;
  try {
    level1 = typeof l1 === 'function' ? (l1(ctx) || GENERIC_L1(qData)) : GENERIC_L1(qData);
  } catch (e) {
    console.error(`[hintSpecs] level1 failed for ${concept}:`, e.message);
    level1 = GENERIC_L1(qData);
  }
  try {
    level2 = typeof l2 === 'function' ? (l2(ctx) || GENERIC_L2(qData)) : GENERIC_L2(qData);
  } catch (e) {
    console.error(`[hintSpecs] level2 failed for ${concept}:`, e.message);
    level2 = GENERIC_L2(qData);
  }
  try {
    level3 = typeof l3 === 'function' ? (l3(ctx) || GENERIC_L3(explanation)) : GENERIC_L3(explanation);
  } catch (e) {
    console.error(`[hintSpecs] level3 failed for ${concept}:`, e.message);
    level3 = GENERIC_L3(explanation);
  }

  return { level1, level2, level3, tier: spec.costTier || 'standard' };
}

  // === 23 NEW MISSING CONCEPTS ===
  
  CONCEPTS.circmeasure = {
    label: 'Circular Measure',
    hints: {
      1: () => `${SVG.circularMeasureDiagram()}\nRemember the key relationship: 180° is equal to π radians.`,
      2: () => `To convert degrees to radians, multiply by (π / 180). To find arc length, use s = rθ (where θ must be in radians).`
    }
  };
  
  CONCEPTS.circle = {
    label: 'Circle Properties',
    hints: {
      1: () => `${SVG.circleDiagram()}\nIdentify the radius, diameter, or circumference. Use the basic formula: C = 2πr or A = πr².`,
      2: () => `Substitute the known values into the circle formula and solve for the unknown.`
    }
  };

  CONCEPTS.dotprod = {
    label: 'Dot Product',
    hints: {
      1: () => `For two vectors a and b, the dot product is calculated by multiplying corresponding components and adding them.`,
      2: () => `Write out: a·b = (a₁ × b₁) + (a₂ × b₂). If the result is 0, the vectors are perpendicular.`
    }
  };

  CONCEPTS.dotprodgym = {
    label: 'Dot Product Gym',
    hints: {
      1: () => `Multiply the x-components together, then multiply the y-components together.`,
      2: () => `Add the two products to get your final scalar answer.`
    }
  };

  CONCEPTS.similarity = {
    label: 'Similar Shapes',
    hints: {
      1: () => `${SVG.triangleDiagram()}\nSimilar shapes have equal angles and proportional sides. Set up a ratio.`,
      2: () => `Write the proportion: (Side 1 of Shape A) / (Side 1 of Shape B) = (Side 2 of Shape A) / (Side 2 of Shape B). Cross-multiply to solve.`
    }
  };
  
  CONCEPTS.squaring = {
    label: 'Squaring Numbers',
    hints: {
      1: () => `Squaring a number means multiplying it by itself (x² = x × x).`,
      2: () => `Write out the multiplication. If it's a large number, you can break it into tens and ones, e.g., (20 + 3)².`
    }
  };

  CONCEPTS.lineareq = {
    label: 'Linear Equations',
    hints: {
      1: () => `Your goal is to isolate the unknown variable (x) on one side of the equals sign.`,
      2: () => `Perform the inverse operation: if a number is added to x, subtract it from both sides. If x is multiplied, divide both sides.`
    }
  };
  
  CONCEPTS.lineqgym = {
    label: 'Linear Eq Gym',
    hints: {
      1: () => `Move all the x terms to one side and the constant numbers to the other side.`,
      2: () => `Combine like terms, then divide by the coefficient of x to find the final answer.`
    }
  };

  CONCEPTS.polygym = {
    label: 'Polynomials Gym',
    hints: {
      1: () => `When adding or subtracting polynomials, only combine "like terms" (terms with the exact same power of x).`,
      2: () => `Group the x² terms, the x terms, and the constant numbers together before calculating.`
    }
  };

  CONCEPTS.limits = {
    label: 'Limits',
    hints: {
      1: () => `${SVG.numberLineDiagram()}\nTo find the limit as x approaches a value, try direct substitution first.`,
      2: () => `If direct substitution gives 0/0, try factoring the numerator and denominator to cancel out the problematic term.`
    }
  };
  
  CONCEPTS.remfactor = {
    label: 'Remainder & Factor Theorem',
    hints: {
      1: () => `If dividing a polynomial P(x) by (x - a), the remainder is exactly P(a).`,
      2: () => `Substitute x = a into the polynomial. If the result is 0, then (x - a) is a factor!`
    }
  };

  CONCEPTS.funcgym = {
    label: 'Functions Gym',
    hints: {
      1: () => `To evaluate f(x) at a specific number, replace every 'x' in the expression with that number.`,
      2: () => `Carefully apply the order of operations (PEMDAS/BODMAS): calculate exponents first, then multiply, then add/subtract.`
    }
  };

  CONCEPTS.hcflcm = {
    label: 'HCF & LCM',
    hints: {
      1: () => `Write out the prime factorization for both numbers first.`,
      2: () => `For HCF, take the lowest power of common prime factors. For LCM, take the highest power of all prime factors present.`
    }
  };
  
  CONCEPTS.profitloss = {
    label: 'Profit & Loss',
    hints: {
      1: () => `${SVG.financeDiagram()}\nIdentify the Cost Price (CP) and Selling Price (SP). Profit is SP - CP; Loss is CP - SP.`,
      2: () => `To find the percentage, divide the actual profit/loss by the original Cost Price (CP) and multiply by 100.`
    }
  };

  CONCEPTS.shares = {
    label: 'Shares & Dividends',
    hints: {
      1: () => `Identify the Face Value (nominal value), Market Value, and Dividend percentage.`,
      2: () => `Dividend is always calculated on the Face Value of the shares, not the Market Value!`
    }
  };
  
  CONCEPTS.gst = {
    label: 'GST / Tax',
    hints: {
      1: () => `Tax is calculated as a percentage of the listed price or discounted price.`,
      2: () => `Calculate the tax amount = (Tax % / 100) × Price. Then add it to the Price to find the final amount.`
    }
  };

  CONCEPTS.gymdecimals = {
    label: 'Decimals Gym',
    hints: {
      1: () => `When multiplying decimals, first ignore the decimal points and multiply the whole numbers.`,
      2: () => `Count the total number of decimal places in the original question, then place the decimal point that many spots from the right in your answer.`
    }
  };
  
  CONCEPTS.fracaddgym = {
    label: 'Fractions Gym',
    hints: {
      1: () => `Before adding or subtracting fractions, you must find a common denominator.`,
      2: () => `Multiply the top and bottom of each fraction to reach the Lowest Common Multiple (LCM), then add the numerators.`
    }
  };

  CONCEPTS.indicesgym = {
    label: 'Indices Gym',
    hints: {
      1: () => `Recall the rules of indices: when multiplying terms with the same base, add their powers. When dividing, subtract their powers.`,
      2: () => `A negative power means 1 over the positive power (e.g., x⁻² = 1/x²). A power of 0 always equals 1.`
    }
  };

  CONCEPTS.permcomb = {
    label: 'Permutations & Combinations',
    hints: {
      1: () => `Does order matter? If arranging in a line or assigning specific roles, use Permutations (nPr). If just forming a group, use Combinations (nCr).`,
      2: () => `Use the factorial formula: nPr = n! / (n-r)! or nCr = n! / (r!(n-r)!).`
    }
  };
  
  CONCEPTS.invtrig = {
    label: 'Inverse Trigonometry',
    hints: {
      1: () => `Inverse trig functions (like sin⁻¹) ask the question: "What angle gives this ratio?"`,
      2: () => `Consider the principal value ranges (e.g., sin⁻¹ returns values between -90° and 90°).`
    }
  };

  CONCEPTS.heron = {
    label: "Heron's Formula",
    hints: {
      1: () => `To find the area of a triangle with 3 known sides, calculate the semi-perimeter 's' first: s = (a + b + c) / 2.`,
      2: () => `Plug 's' into Heron's formula: Area = √( s(s - a)(s - b)(s - c) ).`
    }
  };

  CONCEPTS.section = {
    label: 'Section Formula',
    hints: {
      1: () => `The section formula finds a point dividing a line segment in ratio m1:m2.`,
      2: () => `Use the coordinates (x₁, y₁) and (x₂, y₂). The new x-coordinate is (m1·x₂ + m2·x₁) / (m1 + m2).`
    }
  };


CONCEPTS['_default'] = {
  label: 'General',
  costTier: 'standard',
  hints: {
    1: () => `Re-read the question and identify what type of problem it is — then pick the matching strategy.`,
    2: () => 'List what you know, list what you need to find, then look for the formula or rule that connects them.',
    3: null,
  },
};

function getAnswerData(concept, q, a) {
  if (a && a.correctAnswer) return a;
  const hintResolvers = require('./hintResolvers');
  const resolved = hintResolvers.resolveAnswer(concept, q);
  return resolved || {};
}

module.exports = {
  CONCEPTS,
  getSpec,
  costFor,
  buildHints,
  COSTS,
};
