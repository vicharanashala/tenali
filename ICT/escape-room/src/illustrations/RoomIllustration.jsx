import React from 'react';

/**
 * Shared frame helper so every room shares uniform Tenali palette,
 * warm architectural walls, consistent 2px line weight, and Dark/Light adaptation.
 */
function SceneBase({ children, floorY = 264, solved = false }) {
  return (
    <>
      <rect x="0" y="0" width="640" height="360" fill="var(--bg-inset)" />
      {/* Subtle wall paneling */}
      <rect x="0" y="0" width="640" height={floorY} fill="var(--bg-primary)" />
      <line
        x1="0"
        y1={floorY}
        x2="640"
        y2={floorY}
        stroke="var(--border-strong)"
        strokeWidth="2"
      />
      {/* Floor surface */}
      <rect
        x="0"
        y={floorY}
        width="640"
        height={360 - floorY}
        fill="var(--bg-surface)"
      />
      {/* Subtle ambient solved glow */}
      {solved && (
        <rect
          x="12"
          y="12"
          width="616"
          height="336"
          rx="10"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2"
          strokeDasharray="8 6"
          opacity="0.7"
        />
      )}
      {children}
    </>
  );
}

function Padlock({ x, y, solved }) {
  const color = solved ? 'var(--success)' : 'var(--star-gold)';
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d={solved ? 'M8 14 V6 a8 8 0 0 1 16 0 v2' : 'M8 14 V8 a8 8 0 0 1 16 0 v6'}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="14"
        width="24"
        height="20"
        rx="4"
        fill="var(--bg-inset)"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="16" cy="23" r="2.5" fill={color} />
      <line x1="16" y1="25" x2="16" y2="29" stroke={color} strokeWidth="2" />
    </g>
  );
}

/* ==================== EASY SCENES (3) ==================== */

function ClassroomScene({ solved }) {
  return (
    <SceneBase floorY={252} solved={solved}>
      {/* Green chalkboard */}
      <rect x="130" y="34" width="380" height="142" rx="6" fill="#1d3629" stroke="var(--border-strong)" strokeWidth="4" />
      <text x="320" y="84" textAnchor="middle" fill="#a7f3d0" fontFamily="var(--font-mono)" fontSize="16" opacity="0.9">
        B • O • D • M • A • S
      </text>
      <text x="320" y="114" textAnchor="middle" fill="#f5f0eb" fontFamily="var(--font-mono)" fontSize="14" opacity="0.78">
        a + b of c − d × e = ?
      </text>
      <rect x="255" y="168" width="130" height="6" rx="2" fill="var(--border-strong)" />
      {/* Chalk pieces */}
      <rect x="275" y="163" width="24" height="5" rx="2" fill="#f5f0eb" />
      <rect x="308" y="163" width="18" height="5" rx="2" fill="var(--star-gold)" />

      {/* Student wooden desk */}
      <rect x="148" y="218" width="344" height="22" rx="4" fill="var(--bg-surface-elevated)" stroke="var(--border-strong)" strokeWidth="2" />
      <rect x="174" y="240" width="14" height="74" fill="var(--border-subtle)" />
      <rect x="452" y="240" width="14" height="74" fill="var(--border-subtle)" />

      {/* Open notebook */}
      <rect x="242" y="196" width="130" height="24" rx="3" fill="#f5f0eb" stroke="var(--border-strong)" strokeWidth="2" />
      <line x1="307" y1="196" x2="307" y2="220" stroke="var(--border-strong)" strokeWidth="2" />
      {/* Sticky note clue */}
      <rect x="394" y="198" width="42" height="22" rx="3" fill="var(--star-gold)" stroke="var(--accent)" strokeWidth="1.5" />
      <line x1="402" y1="206" x2="428" y2="206" stroke="#1b1816" strokeWidth="2" />
      <line x1="402" y1="213" x2="420" y2="213" stroke="#1b1816" strokeWidth="2" />
      <Padlock x="458" y="176" solved={solved} />
    </SceneBase>
  );
}

function CorridorScene({ solved }) {
  const lockers = [110, 210, 310, 410];
  return (
    <SceneBase floorY={276} solved={solved}>
      {/* Corridor lockers */}
      {lockers.map((lx, idx) => {
        const isTarget = idx === 2;
        return (
          <g key={lx}>
            <rect
              x={lx}
              y="56"
              width="92"
              height="220"
              rx="4"
              fill={isTarget ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)'}
              stroke={isTarget ? 'var(--accent)' : 'var(--border-strong)'}
              strokeWidth={isTarget ? '2.5' : '2'}
            />
            {/* Air vents */}
            <line x1={lx + 20} y1="78" x2={lx + 72} y2="78" stroke="var(--border-strong)" strokeWidth="2" />
            <line x1={lx + 20} y1="88" x2={lx + 72} y2="88" stroke="var(--border-strong)" strokeWidth="2" />
            <line x1={lx + 20} y1="98" x2={lx + 72} y2="98" stroke="var(--border-strong)" strokeWidth="2" />
            {/* Locker handle */}
            <rect x={lx + 72} y="156" width="8" height="26" rx="3" fill="var(--border-strong)" />
            {/* Locker number plate */}
            <rect x={lx + 32} y="114" width="28" height="16" rx="3" fill="var(--bg-inset)" stroke="var(--border-subtle)" strokeWidth="1.5" />
            <text x={lx + 46} y="126" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize="10">
              {12 + idx}
            </text>
          </g>
        );
      })}
      {/* Taped riddle note on Locker 14 */}
      <rect x="328" y="150" width="44" height="52" rx="3" fill="var(--star-gold)" stroke="var(--accent)" strokeWidth="1.5" />
      <line x1="336" y1="166" x2="364" y2="166" stroke="#1b1816" strokeWidth="2" />
      <line x1="336" y1="176" x2="360" y2="176" stroke="#1b1816" strokeWidth="2" />
      <line x1="336" y1="186" x2="354" y2="186" stroke="#1b1816" strokeWidth="2" />
      <Padlock x="372" y="182" solved={solved} />
    </SceneBase>
  );
}

function CanteenScene({ solved }) {
  return (
    <SceneBase floorY={252} solved={solved}>
      {/* Canteen Menu Slate */}
      <rect x="74" y="42" width="166" height="106" rx="6" fill="#1d2b24" stroke="var(--border-strong)" strokeWidth="3" />
      <text x="92" y="72" fill="var(--star-gold)" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
        CANTEEN MENU
      </text>
      <text x="92" y="98" fill="#86efac" fontFamily="var(--font-mono)" fontSize="11">
        SAMOSA ... ₹15
      </text>
      <text x="92" y="120" fill="#86efac" fontFamily="var(--font-mono)" fontSize="11">
        CHAI   ... ₹10
      </text>

      {/* Shelf with jars */}
      <rect x="424" y="114" width="144" height="8" rx="2" fill="var(--border-strong)" />
      <rect x="444" y="74" width="24" height="40" rx="4" fill="var(--accent)" opacity="0.85" />
      <rect x="482" y="66" width="28" height="48" rx="4" fill="var(--star-gold)" opacity="0.85" />
      <rect x="524" y="80" width="24" height="34" rx="4" fill="var(--hint-blue)" opacity="0.8" />

      {/* Counter surface */}
      <rect x="44" y="218" width="552" height="34" rx="4" fill="var(--bg-surface-elevated)" stroke="var(--border-strong)" strokeWidth="2" />

      {/* 3-tier stainless steel Indian tiffin box */}
      <g transform="translate(274, 128)">
        <path d="M18 16 V6 a28 10 0 0 1 56 0 v10" fill="none" stroke="var(--text-muted)" strokeWidth="3" />
        <rect x="14" y="18" width="64" height="24" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
        <rect x="14" y="44" width="64" height="24" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        <rect x="14" y="70" width="64" height="24" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
        {/* Side clamp */}
        <rect x="6" y="22" width="8" height="68" rx="2" fill="#94a3b8" />
        <rect x="78" y="22" width="8" height="68" rx="2" fill="#94a3b8" />
      </g>
      {/* Brass padlock on tiffin */}
      <Padlock x="304" y="178" solved={solved} />

      {/* Clue card on counter */}
      <rect x="446" y="196" width="76" height="30" rx="4" fill="var(--star-gold)" stroke="var(--accent)" strokeWidth="1.5" />
      <text x="484" y="215" textAnchor="middle" fill="#1b1816" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
        CODE: ?
      </text>
    </SceneBase>
  );
}

/* ==================== MEDIUM SCENES (5) ==================== */

function EntranceScene({ solved }) {
  return (
    <SceneBase floorY={278} solved={solved}>
      {/* Science Wing double doors */}
      <rect x="176" y="48" width="212" height="230" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="3" />
      <line x1="282" y1="48" x2="282" y2="278" stroke="var(--border-strong)" strokeWidth="2" />
      {/* Door glass windows */}
      <rect x="200" y="78" width="60" height="84" rx="4" fill="var(--bg-inset)" stroke="var(--hint-blue)" strokeWidth="2" opacity="0.85" />
      <rect x="304" y="78" width="60" height="84" rx="4" fill="var(--bg-inset)" stroke="var(--hint-blue)" strokeWidth="2" opacity="0.85" />
      {/* Sign above door */}
      <rect x="206" y="20" width="152" height="22" rx="4" fill="var(--accent)" />
      <text x="282" y="35" textAnchor="middle" fill="#ffffff" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
        SCIENCE WING
      </text>
      {/* Wall Keypad */}
      <rect x="424" y="128" width="68" height="92" rx="8" fill="var(--bg-surface-elevated)" stroke={solved ? 'var(--success)' : 'var(--accent)'} strokeWidth="2.5" />
      <rect x="436" y="140" width="44" height="18" rx="3" fill="var(--bg-inset)" />
      <text x="458" y="153" textAnchor="middle" fill={solved ? 'var(--success)' : 'var(--star-gold)'} fontFamily="var(--font-mono)" fontSize="10">
        {solved ? 'OPEN' : 'LOCK'}
      </text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={438 + c * 14}
            y={168 + r * 14}
            width="10"
            height="10"
            rx="2"
            fill="var(--border-strong)"
          />
        ))
      )}
    </SceneBase>
  );
}

function ChemistryScene({ solved }) {
  return (
    <SceneBase floorY={224} solved={solved}>
      {/* Periodic table poster */}
      <rect x="52" y="36" width="136" height="84" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="2" />
      <text x="120" y="54" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize="9">
        PERIODIC TABLE
      </text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4, 5].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={64 + c * 19}
            y={64 + r * 16}
            width="14"
            height="12"
            rx="2"
            fill={c === 0 ? 'var(--accent)' : c === 5 ? 'var(--hint-blue)' : 'var(--border-strong)'}
            opacity="0.85"
          />
        ))
      )}

      {/* Chalkboard equation */}
      <rect x="216" y="42" width="134" height="74" rx="6" fill="#1d2f27" stroke="var(--border-strong)" strokeWidth="2" />
      <text x="283" y="76" textAnchor="middle" fill="#86efac" fontFamily="var(--font-mono)" fontSize="11">
        f(ax+b) = c(dx+e)
      </text>
      <text x="283" y="98" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize="10">
        CROSS-MULTIPLY
      </text>

      {/* Chemical shelf with flasks */}
      <rect x="382" y="108" width="206" height="8" rx="2" fill="var(--border-strong)" />
      <polygon points="402,108 418,74 434,108" fill="#2dd4bf" opacity="0.85" />
      <circle cx="468" cy="92" r="16" fill="var(--accent)" opacity="0.85" />
      <rect x="504" y="76" width="22" height="32" rx="3" fill="#a855f7" opacity="0.8" />
      <rect x="540" y="72" width="18" height="36" rx="3" fill="var(--star-gold)" opacity="0.85" />

      {/* Lab bench & locked center cabinet */}
      <rect x="44" y="210" width="552" height="16" rx="3" fill="var(--bg-surface-elevated)" stroke="var(--border-strong)" strokeWidth="2" />
      <rect x="64" y="226" width="150" height="106" rx="4" fill="var(--bg-surface)" stroke="var(--border-subtle)" strokeWidth="2" />
      <rect
        x="232"
        y="226"
        width="176"
        height="106"
        rx="4"
        fill="var(--bg-inset)"
        stroke={solved ? 'var(--success)' : 'var(--accent)'}
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <rect x="426" y="226" width="150" height="106" rx="4" fill="var(--bg-surface)" stroke="var(--border-subtle)" strokeWidth="2" />
      <Padlock x="304" y="262" solved={solved} />

      {/* Test tube rack on bench */}
      <rect x="250" y="196" width="84" height="14" rx="2" fill="var(--border-strong)" />
      <rect x="262" y="168" width="10" height="30" rx="5" fill="#4ade80" />
      <rect x="282" y="164" width="10" height="34" rx="5" fill="var(--accent)" />
      <rect x="302" y="170" width="10" height="28" rx="5" fill="var(--hint-blue)" />
    </SceneBase>
  );
}

function BiologyScene({ solved }) {
  return (
    <SceneBase floorY={250} solved={solved}>
      {/* Botanical chart */}
      <rect x="66" y="42" width="154" height="128" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="2" />
      <circle cx="143" cy="100" r="34" fill="var(--success-bg)" stroke="var(--success)" strokeWidth="2" />
      <circle cx="143" cy="100" r="12" fill="var(--accent)" />
      <text x="143" y="156" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize="9">
        CELL SPECIMEN #03
      </text>

      {/* Lab bench */}
      <rect x="52" y="230" width="536" height="20" rx="4" fill="var(--bg-surface-elevated)" stroke="var(--border-strong)" strokeWidth="2" />

      {/* Compound Microscope */}
      <g transform="translate(274, 102)">
        <rect x="16" y="114" width="76" height="14" rx="4" fill="var(--border-strong)" />
        <path d="M72 114 C94 90, 94 46, 62 32" fill="none" stroke="var(--text-muted)" strokeWidth="8" strokeLinecap="round" />
        <rect x="44" y="16" width="16" height="58" rx="3" transform="rotate(-18 52 45)" fill="var(--hint-blue)" />
        <rect x="24" y="88" width="44" height="6" rx="2" fill="var(--star-gold)" />
      </g>

      {/* Locked specimen case */}
      <rect x="436" y="136" width="128" height="94" rx="6" fill="var(--bg-inset)" stroke={solved ? 'var(--success)' : 'var(--accent)'} strokeWidth="2" />
      <Padlock x="484" y="168" solved={solved} />
    </SceneBase>
  );
}

function PhysicsScene({ solved }) {
  return (
    <SceneBase floorY={250} solved={solved}>
      {/* Circuit board wall display */}
      <rect x="76" y="42" width="230" height="140" rx="8" fill="#172721" stroke="var(--border-strong)" strokeWidth="2.5" />
      <path d="M104 112 H152 L166 94 L180 130 L194 94 L208 112 H276" fill="none" stroke="var(--star-gold)" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="104" cy="112" r="6" fill="var(--accent)" />
      <circle cx="276" cy="112" r="6" fill="var(--success)" />
      <text x="191" y="164" textAnchor="middle" fill="#86efac" fontFamily="var(--font-mono)" fontSize="11">
        10x + y ⇄ 10y + x
      </text>

      {/* Workbench + dial lock drawer */}
      <rect x="52" y="232" width="536" height="18" rx="3" fill="var(--bg-surface-elevated)" stroke="var(--border-strong)" strokeWidth="2" />
      <rect x="356" y="114" width="206" height="118" rx="6" fill="var(--bg-surface)" stroke={solved ? 'var(--success)' : 'var(--accent)'} strokeWidth="2.5" />
      <circle cx="426" cy="173" r="28" fill="var(--bg-inset)" stroke="var(--star-gold)" strokeWidth="3" />
      <line x1="426" y1="173" x2="444" y2="158" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <Padlock x="488" y="156" solved={solved} />
    </SceneBase>
  );
}

function SecretLabScene({ solved }) {
  return (
    <SceneBase floorY={260} solved={solved}>
      {/* Combination Safe */}
      <rect x="194" y="56" width="252" height="204" rx="12" fill="var(--bg-surface)" stroke={solved ? 'var(--success)' : 'var(--accent)'} strokeWidth="3" />
      <rect x="216" y="78" width="208" height="160" rx="8" fill="var(--bg-inset)" stroke="var(--border-strong)" strokeWidth="2" />
      {/* Safe vault wheel */}
      <circle cx="320" cy="158" r="46" fill="var(--bg-surface-elevated)" stroke={solved ? 'var(--success)' : 'var(--star-gold)'} strokeWidth="3.5" />
      <circle cx="320" cy="158" r="14" fill="var(--accent)" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1="320"
          y1="158"
          x2={320 + 36 * Math.cos((deg * Math.PI) / 180)}
          y2={158 + 36 * Math.sin((deg * Math.PI) / 180)}
          stroke="var(--text-muted)"
          strokeWidth="3"
        />
      ))}
      <text x="320" y="226" textAnchor="middle" fill={solved ? 'var(--success)' : 'var(--text-muted)'} fontFamily="var(--font-mono)" fontSize="11">
        {solved ? 'VAULT UNLOCKED' : 'SAFE CODE: NUMERATOR'}
      </text>
    </SceneBase>
  );
}

/* ==================== HARD LIBRARY SCENES (7) ==================== */

function BookshelfBlock({ x, y, width = 128, height = 186 }) {
  const colors = ['var(--accent)', 'var(--hint-blue)', 'var(--success)', 'var(--star-gold)', '#f43f5e'];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="4" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="2" />
      {[0, 1, 2].map((shelf) => (
        <g key={shelf}>
          <line x1={x + 6} y1={y + 54 + shelf * 58} x2={x + width - 6} y2={y + 54 + shelf * 58} stroke="var(--border-strong)" strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((b) => (
            <rect
              key={b}
              x={x + 12 + b * 21}
              y={y + 18 + shelf * 58 + (b % 2) * 6}
              width="16"
              height={34 - (b % 2) * 6}
              rx="2"
              fill={colors[(shelf + b) % colors.length]}
              opacity="0.88"
            />
          ))}
        </g>
      ))}
    </g>
  );
}

function ReferenceScene({ solved }) {
  return (
    <SceneBase floorY={266} solved={solved}>
      <BookshelfBlock x="66" y="76" />
      <BookshelfBlock x="446" y="76" />
      {/* Center display lectern */}
      <rect x="234" y="138" width="172" height="128" rx="8" fill="var(--bg-surface-elevated)" stroke={solved ? 'var(--success)' : 'var(--accent)'} strokeWidth="2.5" />
      <text x="320" y="182" textAnchor="middle" fill="var(--star-gold)" fontFamily="var(--font-mono)" fontSize="15" fontWeight="700">
        x² + bx + c = 0
      </text>
      <Padlock x="304" y="204" solved={solved} />
    </SceneBase>
  );
}

function ArchiveScene({ solved }) {
  return (
    <SceneBase floorY={270} solved={solved}>
      {[120, 260, 400].map((cx, i) => (
        <g key={cx}>
          <rect
            x={cx}
            y="72"
            width="120"
            height="198"
            rx="6"
            fill="var(--bg-surface)"
            stroke={i === 1 ? (solved ? 'var(--success)' : 'var(--accent)') : 'var(--border-strong)'}
            strokeWidth={i === 1 ? '2.5' : '2'}
          />
          {[0, 1, 2].map((drawer) => (
            <g key={drawer}>
              <rect x={cx + 12} y={88 + drawer * 58} width="96" height="46" rx="4" fill="var(--bg-inset)" stroke="var(--border-subtle)" strokeWidth="1.5" />
              <rect x={cx + 44} y={104 + drawer * 58} width="32" height="10" rx="2" fill="var(--border-strong)" />
            </g>
          ))}
        </g>
      ))}
      <Padlock x="304" y="152" solved={solved} />
    </SceneBase>
  );
}

function MezzanineScene({ solved }) {
  return (
    <SceneBase floorY={272} solved={solved}>
      {/* Iron gate bars */}
      <rect x="176" y="54" width="288" height="218" rx="10" fill="var(--bg-inset)" stroke={solved ? 'var(--success)' : 'var(--border-strong)'} strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
        <line key={bar} x1={212 + bar * 36} y1="56" x2={212 + bar * 36} y2="270" stroke="var(--border-strong)" strokeWidth="3" />
      ))}
      {/* Discriminant plaque */}
      <rect x="242" y="124" width="156" height="74" rx="8" fill="var(--bg-surface)" stroke={solved ? 'var(--success)' : 'var(--star-gold)'} strokeWidth="2.5" />
      <text x="320" y="154" textAnchor="middle" fill="var(--star-gold)" fontFamily="var(--font-mono)" fontSize="14" fontWeight="700">
        D = b² − 4ac = 0
      </text>
      <Padlock x="304" y="160" solved={solved} />
    </SceneBase>
  );
}

function MapAlcoveScene({ solved }) {
  return (
    <SceneBase floorY={268} solved={solved}>
      {/* Vintage wall map */}
      <rect x="92" y="48" width="236" height="162" rx="6" fill="#2c241b" stroke="var(--star-gold)" strokeWidth="2.5" />
      <path d="M134 114 Q180 74 224 108 T288 128 Q250 176 196 174 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
      <text x="210" y="196" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize="10">
        GEOMETRY ARCHIVE
      </text>

      {/* Recessed square-tile safe */}
      <rect x="372" y="76" width="176" height="154" rx="8" fill="var(--bg-surface)" stroke={solved ? 'var(--success)' : 'var(--accent)'} strokeWidth="2.5" />
      <rect x="396" y="100" width="54" height="54" fill="var(--hint-blue-bg)" stroke="var(--hint-blue)" strokeWidth="2" />
      <rect x="462" y="114" width="40" height="40" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
      <Padlock x="444" y="172" solved={solved} />
    </SceneBase>
  );
}

function ReadingNookScene({ solved }) {
  return (
    <SceneBase floorY={262} solved={solved}>
      {/* Warm candle lamp */}
      <circle cx="152" cy="112" r="46" fill="var(--star-gold)" opacity="0.14" />
      <rect x="144" y="118" width="16" height="44" rx="3" fill="#f5f0eb" />
      <path d="M152 94 Q162 108 152 118 Q142 108 152 94 Z" fill="var(--star-gold)" />
      <rect x="122" y="162" width="60" height="10" rx="3" fill="var(--border-strong)" />

      {/* Oak railway cipher chest */}
      <rect x="242" y="138" width="270" height="124" rx="10" fill="var(--bg-surface-elevated)" stroke={solved ? 'var(--success)' : 'var(--accent)'} strokeWidth="2.5" />
      <line x1="242" y1="184" x2="512" y2="184" stroke="var(--border-strong)" strokeWidth="3" />
      <text x="377" y="168" textAnchor="middle" fill="var(--star-gold)" fontFamily="var(--font-mono)" fontSize="12">
        DISTANCE ÷ SPEED = TIME
      </text>
      <Padlock x="361" y="196" solved={solved} />
    </SceneBase>
  );
}

function LibrarianDeskScene({ solved }) {
  return (
    <SceneBase floorY={264} solved={solved}>
      <BookshelfBlock x="54" y="64" width="136" height="198" />
      {/* Glowing radical portal door */}
      <rect
        x="224"
        y="52"
        width="162"
        height="212"
        rx="8"
        fill="var(--bg-surface-elevated)"
        stroke={solved ? 'var(--success)' : 'var(--star-gold)'}
        strokeWidth="2.5"
        strokeDasharray="6 4"
      />
      <circle cx="305" cy="154" r="32" fill="var(--bg-inset)" stroke={solved ? 'var(--success)' : 'var(--star-gold)'} strokeWidth="2.5" />
      <text x="305" y="162" textAnchor="middle" fill={solved ? 'var(--success)' : 'var(--star-gold)'} fontFamily="var(--font-mono)" fontSize="22" fontWeight="700">
        √x
      </text>

      {/* Librarian desk + lamp */}
      <rect x="418" y="182" width="168" height="82" rx="4" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="2" />
      <path d="M532 182 L532 146 L508 134" fill="none" stroke="var(--star-gold)" strokeWidth="3" strokeLinecap="round" />
      <polygon points="496,136 520,126 524,142" fill="var(--star-gold)" />
      <Padlock x="486" y="206" solved={solved} />
    </SceneBase>
  );
}

function SecretShelfScene({ solved }) {
  return (
    <SceneBase floorY={268} solved={solved}>
      <BookshelfBlock x="52" y="68" width="128" height="198" />
      <BookshelfBlock x="460" y="68" width="128" height="198" />
      {/* Glowing hidden secret shelf vault */}
      <rect
        x="210"
        y="46"
        width="220"
        height="222"
        rx="12"
        fill="var(--bg-surface-elevated)"
        stroke={solved ? 'var(--success)' : 'var(--star-gold)'}
        strokeWidth="3"
      />
      <circle cx="320" cy="134" r="52" fill={solved ? 'var(--success)' : 'var(--accent)'} opacity="0.18" />
      {/* Legendary Grimoire book */}
      <rect x="278" y="96" width="84" height="106" rx="6" fill="var(--accent)" stroke="var(--star-gold)" strokeWidth="2.5" />
      <text x="320" y="142" textAnchor="middle" fill="#ffffff" fontFamily="var(--font-serif)" fontSize="13" fontWeight="700">
        TOPPER’S
      </text>
      <text x="320" y="162" textAnchor="middle" fill="var(--star-gold)" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
        SHORTCUTS
      </text>
      <Padlock x="304" y="212" solved={solved} />
    </SceneBase>
  );
}

const SCENE_MAP = {
  classroom: ClassroomScene,
  corridor: CorridorScene,
  canteen: CanteenScene,
  entrance: EntranceScene,
  chemistry: ChemistryScene,
  biology: BiologyScene,
  physics: PhysicsScene,
  'secret-lab': SecretLabScene,
  reference: ReferenceScene,
  archive: ArchiveScene,
  mezzanine: MezzanineScene,
  'map-alcove': MapAlcoveScene,
  'reading-nook': ReadingNookScene,
  'librarian-desk': LibrarianDeskScene,
  'secret-shelf': SecretShelfScene,
};

/**
 * Unified flat-design SVG scene router for all 15 escape rooms.
 */
export default function RoomIllustration({ scene, solved = false, title = 'Escape room scene' }) {
  const SceneComponent = SCENE_MAP[scene] || ClassroomScene;

  return (
    <svg
      viewBox="0 0 640 360"
      role="img"
      aria-label={`Illustration of ${title}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <SceneComponent solved={solved} />
    </svg>
  );
}