import { useEffect } from 'react';

const MONSTER_AVATARS = {
  'bracketeer': {
    gradId: 'bracketeer-grad',
    stop0: '#73a2ff', stop70: '#3a6fce', stop100: '#214fa3',
    svg: (state) => (
      <>
        {/* Orbiting Brackets */}
        <g className="orbit-bracket">
          <text x="5" y="25" fill="currentColor" fontSize="20" fontWeight="bold" opacity="0.65" className="avatar-symbol">(</text>
          <text x="85" y="85" fill="currentColor" fontSize="20" fontWeight="bold" opacity="0.65" className="avatar-symbol">)</text>
        </g>
        {/* Body */}
        <path
          className="bracketeer-body"
          d="M22,50 C12,25 32,18 50,18 C68,18 88,25 78,50 C88,75 68,82 50,82 C32,82 12,75 22,50 Z"
          fill={state === 'healed' ? 'url(#healed-grad)' : 'url(#bracketeer-grad)'}
        />
        {/* Expressions */}
        {state === 'healed' ? (
          <path className="happy-expression" d="M 28 46 Q 33 40 38 46 M 62 46 Q 67 40 72 46 M 44 56 Q 50 63 56 56" />
        ) : state === 'warning' ? (
          <>
            {/* Suspicious warning eyes */}
            <path d="M26,45 L40,45" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
            <path d="M60,45 L74,45" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="50" cy="58" rx="4" ry="4" fill="#1a1614" />
          </>
        ) : (
          <>
            <g className="eye-left"><circle cx="33" cy="45" r="5" fill="#fff" /><circle cx="33" cy="44" r="2.5" fill="#1a1614" /></g>
            <g className="eye-middle"><circle cx="50" cy="38" r="6" fill="#fff" /><circle cx="50" cy="37" r="3" fill="#1a1614" /></g>
            <g className="eye-right"><circle cx="67" cy="45" r="5" fill="#fff" /><circle cx="67" cy="44" r="2.5" fill="#1a1614" /></g>
            <ellipse cx="50" cy="58" rx="4" ry="6" fill="#1a1614" />
          </>
        )}
      </>
    )
  },
  'sign-swapper': {
    gradId: 'swapper-grad',
    stop0: '#ff7b7b', stop70: '#ce3a3a', stop100: '#9a1d1d',
    svg: (state) => (
      <>
        {/* Floating signs */}
        <g className="float-sign-pos"><text x="15" y="25" fill="currentColor" fontSize="18" fontWeight="bold" className="avatar-symbol">+</text></g>
        <g className="float-sign-neg"><text x="75" y="30" fill="currentColor" fontSize="18" fontWeight="bold" className="avatar-symbol">−</text></g>
        {/* Spiky body */}
        <path
          className="swapper-body"
          d="M50,15 L58,35 L78,30 L68,48 L85,60 L63,65 L70,85 L50,72 L30,85 L37,65 L15,60 L32,48 L22,30 L42,35 Z"
          fill={state === 'healed' ? 'url(#healed-grad)' : 'url(#swapper-grad)'}
        />
        {/* Expressions */}
        {state === 'healed' ? (
          <path className="happy-expression" d="M 33 46 Q 38 41 43 46 M 57 46 Q 62 41 67 46 M 45 58 Q 50 63 55 58" />
        ) : state === 'warning' ? (
          <>
            <path d="M30,48 Q40,46 45,52" fill="none" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
            <path d="M70,48 Q60,46 55,52" fill="none" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
            <path d="M43,60 Q50,62 57,60" fill="none" stroke="#1a1614" strokeWidth="2.5" />
          </>
        ) : (
          <>
            <g className="angry-eye-left"><circle cx="38" cy="47" r="5.5" fill="#fff" /><circle cx="39" cy="47" r="3" fill="#1a1614" /><path d="M28,39 L40,45" stroke="#ff7b7b" strokeWidth="2" /></g>
            <g className="angry-eye-right"><circle cx="62" cy="47" r="5.5" fill="#fff" /><circle cx="61" cy="47" r="3" fill="#1a1614" /><path d="M72,39 L60,45" stroke="#ff7b7b" strokeWidth="2" /></g>
            <path d="M43,58 Q46,62 50,58 T57,58" fill="none" stroke="#1a1614" strokeWidth="2.5" />
          </>
        )}
      </>
    )
  },
  'decimal-drifter': {
    gradId: 'drifter-grad',
    stop0: '#ffbf5b', stop70: '#c78700', stop100: '#936000',
    svg: (state) => (
      <>
        {/* Floating body */}
        <path
          className="drifter-body"
          d="M20,50 C10,25 35,15 50,20 C65,25 90,15 80,50 C90,85 65,75 50,80 C35,85 10,85 20,50 Z"
          fill={state === 'healed' ? 'url(#healed-grad)' : 'url(#drifter-grad)'}
        />
        {/* Expression */}
        {state === 'healed' ? (
          <path className="happy-expression" d="M 43 44 Q 50 38 57 44 M 45 56 Q 50 62 55 56" />
        ) : state === 'warning' ? (
          <>
            <path d="M40,45 Q50,48 60,45" fill="none" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="48" r="2.5" fill="#1a1614" />
            <circle class="drifting-point" cx="50" cy="62" r="3.5" fill="#ffbf5b" />
          </>
        ) : (
          <>
            <g className="cyclops-eye"><circle cx="50" cy="44" r="9" fill="#fff" /><circle cx="50" cy="44" r="4.5" fill="#1a1614" /></g>
            <circle className="drifting-point" cx="50" cy="62" r="3.5" fill="#ffbf5b" />
          </>
        )}
      </>
    )
  },
  'carry-crasher': {
    gradId: 'crasher-grad',
    stop0: '#c98cff', stop70: '#7d3fa0', stop100: '#552170',
    svg: (state) => (
      <>
        {/* Particles */}
        <circle className="crumble-particle" cx="50" cy="50" r="2" fill="#d09eff" style={{ '--dx': '-30px', '--dy': '0px', '--tx': '-10px', animationDelay: '0s' }} />
        <circle className="crumble-particle" cx="50" cy="50" r="1.5" fill="#d09eff" style={{ '--dx': '35px', '--dy': '10px', '--tx': '12px', animationDelay: '0.8s' }} />
        {/* Crater rock body */}
        <path
          className="crasher-body"
          d="M30,22 C42,16 60,18 72,25 C84,32 88,48 82,66 C76,82 58,84 42,80 C26,76 16,60 20,42 C22,28 20,26 30,22 Z"
          fill={state === 'healed' ? 'url(#healed-grad)' : 'url(#crasher-grad)'}
        />
        {/* Expressions */}
        {state === 'healed' ? (
          <path className="happy-expression" d="M 31 46 Q 36 41 41 46 M 59 46 Q 64 41 69 46 M 45 60 Q 50 65 55 60" />
        ) : state === 'warning' ? (
          <>
            <path className="crasher-cracks" d="M35,32 L48,42 L42,55" />
            <path d="M28,45 L40,47" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
            <path d="M72,45 L60,47" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
            <path d="M44,60 Q50,62 56,60" fill="none" stroke="#1a1614" strokeWidth="2.5" />
          </>
        ) : (
          <>
            <path className="crasher-cracks" d="M35,32 L48,42 L42,55 M65,70 L58,58 L68,50" />
            <g className="crasher-eye-l"><circle cx="36" cy="46" r="6" fill="#fff" /><circle cx="36" cy="46" r="3" fill="#1a1614" /></g>
            <g className="crasher-eye-r"><circle cx="64" cy="46" r="6" fill="#fff" /><circle cx="64" cy="46" r="3" fill="#1a1614" /></g>
            <path d="M42,62 L58,62" stroke="#1a1614" strokeWidth="2" />
          </>
        )}
      </>
    )
  }
};

function injectStyles() {
  if (typeof document === 'undefined' || document.querySelector('[data-monster-avatar-css]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-monster-avatar-css', '');
  style.textContent = `
    .monster-avatar-wrapper { position: relative; display: inline-flex; align-items: center; justify-content: center; }
    
    /* HALO */
    .avatar-halo {
      position: absolute; top: -15%; left: 50%; transform: translateX(-50%) scale(0);
      width: 60%; height: 15%; border: 3px solid #ffd700; border-radius: 50%;
      opacity: 0; filter: drop-shadow(0 0 6px #ffd700);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      animation: float-halo 2s ease-in-out infinite; transform-origin: center;
    }
    .monster-avatar-wrapper.healed .avatar-halo { transform: translateX(-50%) scale(1); opacity: 1; top: -5%; }
    
    /* WARNING SHIVER */
    .monster-avatar-wrapper.warning {
      animation: warning-shiver 0.3s infinite alternate ease-in-out;
      filter: drop-shadow(0 0 4px #e8864a);
    }
    @keyframes warning-shiver {
      0% { transform: translate(-1px, 1px) rotate(-1deg); }
      100% { transform: translate(1px, -1px) rotate(1deg); }
    }

    /* SYMBOLS COLOR */
    .monster-avatar-wrapper.healed .avatar-symbol { color: #ffd700; }
    .monster-avatar-wrapper.warning .avatar-symbol { color: #e8864a; }

    /* CORE SHAPES & TIMINGS */
    .bracketeer-body { transform-origin: center; animation: float-organic 4s ease-in-out infinite; transition: fill 0.5s ease; }
    .orbit-bracket { transform-origin: 50px 50px; animation: spin-bracket 8s linear infinite; }
    .eye-left { transform-origin: 33px 45px; animation: blink-fast 4.5s infinite; }
    .eye-middle { transform-origin: 50px 38px; animation: blink-fast 5.2s infinite 0.5s; }
    .eye-right { transform-origin: 67px 45px; animation: blink-fast 4.8s infinite 0.2s; }

    .swapper-body { transform-origin: center; animation: spike-pulse 3s ease-in-out infinite; transition: fill 0.5s ease; }
    .float-sign-pos { transform-origin: 20px 20px; animation: float-sign 3.2s ease-in-out infinite; }
    .float-sign-neg { transform-origin: 80px 25px; animation: float-sign 3.8s ease-in-out infinite 0.4s; }
    .angry-eye-left { transform-origin: 38px 47px; animation: blink-slanted 5s infinite; }
    .angry-eye-right { transform-origin: 62px 47px; animation: blink-slanted 5s infinite; }

    .drifter-body { transform-origin: center; animation: drifter-wave 5s ease-in-out infinite; transition: fill 0.5s ease; }
    .drifting-point { animation: drift-dot 4.5s ease-in-out infinite; }
    .cyclops-eye { transform-origin: 50px 44px; animation: blink-cyclops 6s infinite; }

    .crasher-body { transform-origin: center; animation: rock-rumble 6s ease-in-out infinite; transition: fill 0.5s ease; }
    .crasher-cracks { stroke: #d09eff; stroke-width: 1.5; stroke-linecap: round; opacity: 0.85; animation: crack-glow 3s ease-in-out infinite; transition: stroke 0.5s ease; }
    .crumble-particle { animation: float-particle 2.5s linear infinite; transform-origin: center; }
    .crasher-eye-l { transform-origin: 36px 46px; animation: blink-scared 4s infinite; }
    .crasher-eye-r { transform-origin: 64px 46px; animation: blink-scared 4s infinite 0.15s; }

    .happy-expression { stroke: #1a1614; stroke-width: 3.5; stroke-linecap: round; fill: none; }

    /* KEYFRAMES */
    @keyframes float-organic {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-6px) scale(1.02, 0.98); }
    }
    @keyframes float-halo {
      0%, 100% { transform: translate(-50%, 0) rotate(-3deg); }
      50% { transform: translate(-50%, -4px) rotate(3deg); }
    }
    @keyframes spin-bracket {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes blink-fast {
      0%, 95%, 100% { transform: scaleY(1); }
      97.5% { transform: scaleY(0); }
    }
    @keyframes spike-pulse {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.05) rotate(3deg); }
    }
    @keyframes float-sign {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
      50% { transform: translateY(-8px) rotate(15deg); opacity: 1; }
    }
    @keyframes blink-slanted {
      0%, 94%, 100% { transform: scaleY(1); }
      97% { transform: scaleY(0.1) skewX(5deg); }
    }
    @keyframes drifter-wave {
      0%, 100% { d: path("M20,50 C10,25 35,15 50,20 C65,25 90,15 80,50 C90,85 65,75 50,80 C35,85 10,85 20,50 Z"); }
      50% { d: path("M20,50 C10,35 35,25 50,15 C65,5 90,35 80,50 C90,75 65,85 50,85 C35,85 10,65 20,50 Z"); }
    }
    @keyframes drift-dot {
      0%, 100% { transform: translateX(-15px); }
      50% { transform: translateX(15px); }
    }
    @keyframes blink-cyclops {
      0%, 92%, 100% { transform: scaleY(1); }
      96% { transform: scaleY(0); }
    }
    @keyframes rock-rumble {
      0%, 100% { transform: translateY(0) rotate(0); }
      25% { transform: translateY(-2px) rotate(-1deg); }
      75% { transform: translateY(1px) rotate(1deg); }
    }
    @keyframes crack-glow {
      0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 1px #d09eff); }
      50% { opacity: 1; filter: drop-shadow(0 0 3px #e0bdff); }
    }
    @keyframes blink-scared {
      0%, 95%, 100% { transform: scaleY(1); }
      97.5% { transform: scaleY(0.05); }
    }
    @keyframes float-particle {
      0% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0.8; }
      100% { transform: translate(calc(var(--dx) + var(--tx)), calc(var(--dy) - 20px)) scale(0.2); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

export function MonsterAvatar({ monsterId, size = 80, state = 'breached', className = '' }) {
  useEffect(() => {
    injectStyles();
  }, []);

  const config = MONSTER_AVATARS[monsterId] || MONSTER_AVATARS['bracketeer'];

  return (
    <div
      className={`monster-avatar-wrapper ${state} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="avatar-halo" />
      <svg viewBox="0 0 100 100">
        <defs>
          <radialGradient id={config.gradId} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={config.stop0} />
            <stop offset="70%" stopColor={config.stop70} />
            <stop offset="100%" stopColor={config.stop100} />
          </radialGradient>
          <radialGradient id="healed-grad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffe66d" />
            <stop offset="100%" stopColor="#e2b100" />
          </radialGradient>
        </defs>
        {config.svg(state)}
      </svg>
    </div>
  );
}

export default MonsterAvatar;
