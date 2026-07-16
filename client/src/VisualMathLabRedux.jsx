/**
 * VisualMathLabRedux.jsx – High-Performance Visual Math Lab
 * Target: <16ms frame time, <50ms question swap
 *
 * Strategy:
 *  - Double-buffered prefetch: next question fetched while current is displayed
 *  - Stable DOM: templates never unmount between questions; data swaps, DOM doesn't
 *  - No stagger animations during gameplay
 *  - React.memo on every template component
 *  - useCallback / useMemo for all handlers and derived data
 *  - Instant swap via state update only (no AnimatePresence on visuals)
 */
import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const API = '/api';

/* ── Colour tokens ───────────────────────────────────────────────── */
const C = {
  bg: '#181512', card: '#2D2520', border: '#4A4038',
  orange: '#F08C46', orange2: '#F08C46', blue: '#4F8DFF',
  green: '#22C55E', red: '#EF4444', white: '#F4F1ED', muted: '#988D84',
};
const FONT = "'Inter', system-ui, sans-serif";

/* ── Timer ───────────────────────────────────────────────────────── */
function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);
  const start = useCallback(() => {
    setElapsed(0);
    clearInterval(ref.current);
    ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }, []);
  const stop  = useCallback(() => { const v = elapsed; clearInterval(ref.current); return v; }, [elapsed]);
  const reset = useCallback(() => { clearInterval(ref.current); setElapsed(0); }, []);
  useEffect(() => () => clearInterval(ref.current), []);
  return { elapsed, start, stop, reset };
}

/* ── Confetti ────────────────────────────────────────────────────── */
function fireConfetti() {
  const end = Date.now() + 1600;
  const colors = ['#F97316','#FF9A44','#22C55E','#4F8DFF','#F8F7F5'];
  (function frame() {
    confetti({ particleCount: 5, angle: 60,  spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ── Floating BG symbols (stable — never re-renders) ─────────────── */
const BG_SYMS = ['×','÷','+','=','%','π','√','∑','3','5','9'];
const FloatingBg = memo(function FloatingBg() {
  const items = useRef(Array.from({ length: 16 }, (_, i) => ({
    id: i, sym: BG_SYMS[i % BG_SYMS.length],
    x: Math.random() * 100, y: Math.random() * 100,
    size: 11 + Math.random() * 18, delay: Math.random() * 8, dur: 12 + Math.random() * 10,
  }))).current;
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {items.map(s => (
        <motion.div key={s.id}
          style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`, fontSize:s.size, color:'rgba(249,115,22,0.04)', fontFamily:FONT, fontWeight:700, userSelect:'none' }}
          animate={{ y:[0,-28,0], opacity:[0.3,0.8,0.3] }}
          transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:'easeInOut' }}>
          {s.sym}
        </motion.div>
      ))}
    </div>
  );
});

/* ── XP Popup ────────────────────────────────────────────────────── */
const XPPopup = memo(function XPPopup({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y:0, opacity:1, scale:0.8 }} animate={{ y:-90, opacity:0, scale:1.3 }} exit={{ opacity:0 }}
          transition={{ duration:1.3, ease:'easeOut' }}
          style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'1.7rem', fontWeight:900, color:C.orange, textShadow:`0 0 20px rgba(249,115,22,0.9)`, fontFamily:FONT, zIndex:100, pointerEvents:'none', whiteSpace:'nowrap' }}>
          +10 XP ⭐
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/* ── SVG Frog (memoized) ─────────────────────────────────────────── */
const FrogSVG = memo(function FrogSVG({ size = 80, happy, sad }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="62" rx="30" ry="26" fill="#4ADE80"/>
      <ellipse cx="50" cy="60" rx="26" ry="22" fill="#22C55E"/>
      <ellipse cx="50" cy="66" rx="16" ry="14" fill="#BBF7D0" opacity="0.7"/>
      <ellipse cx="34" cy="42" rx="10" ry="11" fill="#4ADE80"/>
      <ellipse cx="34" cy="42" rx="8"  ry="9"  fill="#16A34A"/>
      <circle  cx="34" cy="42" r="5"   fill="white"/>
      <circle  cx={happy?35:33} cy="42" r="3" fill="#1C1815"/>
      <circle  cx="36" cy="40" r="1.2" fill="white"/>
      <ellipse cx="66" cy="42" rx="10" ry="11" fill="#4ADE80"/>
      <ellipse cx="66" cy="42" rx="8"  ry="9"  fill="#16A34A"/>
      <circle  cx="66" cy="42" r="5"   fill="white"/>
      <circle  cx={happy?67:65} cy="42" r="3" fill="#1C1815"/>
      <circle  cx="68" cy="40" r="1.2" fill="white"/>
      {happy ? <path d="M40 70 Q50 80 60 70" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
             : sad ? <path d="M40 76 Q50 68 60 76" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
             : <path d="M42 72 Q50 76 58 72" stroke="#166534" strokeWidth="2" strokeLinecap="round" fill="none"/>}
      <ellipse cx="24" cy="78" rx="10" ry="6" fill="#4ADE80" transform="rotate(-20 24 78)"/>
      <ellipse cx="76" cy="78" rx="10" ry="6" fill="#4ADE80" transform="rotate(20 76 78)"/>
    </svg>
  );
});

/* ── Frog Jump Template ──────────────────────────────────────────── */
export const FrogJumpTemplate = memo(function FrogJumpTemplate({ q, ans, setAns, revealed }) {
  const total  = q.jumps * q.step;
  const maxNum = total + q.step;
  const nums   = useMemo(() => Array.from({ length: maxNum + 1 }, (_, i) => i), [maxNum]);
  const trackRef    = useRef(null);
  const [tw, setTw] = useState(0);
  const [frogPos, setFrogPos]   = useState(0);
  const [ghostPos, setGhostPos] = useState(null);
  const [isDrag, setIsDrag]     = useState(false);
  const [jumps, setJumps]       = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visited, setVisited]   = useState([0]);

  useEffect(() => {
    const m = () => { if (trackRef.current) setTw(trackRef.current.offsetWidth); };
    m(); window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, []);

  useEffect(() => {
    setFrogPos(0); setGhostPos(null); setJumps(0); setAnimating(false); setVisited([0]);
  }, [q.id]);

  const n2x = useCallback(n => tw ? (n / maxNum) * tw : 0, [tw, maxNum]);
  const x2n = useCallback(x => Math.max(0, Math.min(maxNum, Math.round((x / tw) * maxNum))), [tw, maxNum]);

  const animateJumps = useCallback(async () => {
    setAnimating(true);
    const v = [0];
    for (let j = 1; j <= q.jumps; j++) {
      await new Promise(r => setTimeout(r, 450));
      const pos = j * q.step;
      setFrogPos(pos); setJumps(j); v.push(pos); setVisited([...v]);
    }
    setAnimating(false);
  }, [q.jumps, q.step]);

  useEffect(() => {
    if (revealed) {
      setFrogPos(0); setJumps(0); setVisited([0]);
      const t = setTimeout(() => animateJumps(), 400);
      return () => clearTimeout(t);
    }
  }, [revealed, animateJumps]);

  return (
    <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:'18px' }}>
      <div style={{ width:'100%', background:'linear-gradient(180deg,#3D322B 0%,#1D1815 100%)', borderRadius:'20px', padding:'28px 20px 36px', position:'relative', overflow:'hidden', boxShadow:'0 15px 40px rgba(0,0,0,0.5)', border:'2px solid rgba(240,140,70,0.25)' }}>
        {[{l:4,t:4,s:1.1},{l:52,t:6,s:0.8},{l:74,t:3,s:1}].map((c,i)=>(
          <motion.div key={i} style={{position:'absolute',left:`${c.l}%`,top:`${c.t}%`,fontSize:`${c.s*2.2}rem`,opacity:0.3}} animate={{x:[0,18,0]}} transition={{duration:12+i*3,repeat:Infinity,ease:'easeInOut'}}>☁️</motion.div>
        ))}
        <div style={{position:'absolute',top:'6%',right:'4%',fontSize:'2rem',opacity:0.4}}>☀️</div>
        {[8,32,58,84].map((l,i)=>(
          <div key={i} style={{position:'absolute',bottom:'22px',left:`${l}%`,fontSize:'1.1rem',opacity:0.55}}>
            {['🌸','🌼','🌺','🌻'][i]}
          </div>
        ))}
        <div style={{ position:'relative', height:'100px' }}>
          {ghostPos !== null && !animating && (
            <div style={{ position:'absolute', bottom:0, left:0, transform:`translateX(${n2x(ghostPos)-28}px)`, opacity:0.35, pointerEvents:'none' }}>
              <FrogSVG size={56}/>
            </div>
          )}
          <motion.div
            drag={!revealed && !animating ? 'x' : false}
            dragConstraints={trackRef}
            dragElastic={0.05}
            onDragStart={() => setIsDrag(true)}
            onDrag={(_, info) => {
              if (!trackRef.current) return;
              const rect = trackRef.current.getBoundingClientRect();
              setGhostPos(x2n(info.point.x - rect.left));
            }}
            onDragEnd={(_, info) => {
              setIsDrag(false);
              if (!trackRef.current) return;
              const rect = trackRef.current.getBoundingClientRect();
              setGhostPos(null);
              const dropped = x2n(info.point.x - rect.left);
              setFrogPos(dropped);
              setAns(String(dropped));
            }}
            animate={{ x: n2x(frogPos) - 28, y: animating ? [0,-42,0] : 0, rotate: isDrag ? 14 : 0, scale: isDrag ? 1.18 : 1 }}
            transition={{ x: { type:'spring', stiffness:180, damping:18 }, y: { duration:0.38, times:[0,0.45,1] } }}
            style={{ position:'absolute', bottom:0, left:0, cursor: revealed?'default':'grab', userSelect:'none',
              filter: revealed ? 'drop-shadow(0 0 14px rgba(240,140,70,0.9))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.45))' }}>
            <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:2.2, repeat:Infinity, ease:'easeInOut' }}>
              <FrogSVG size={60} happy={revealed && String(frogPos)===String(q.answer)} sad={revealed && String(frogPos)!==String(q.answer)}/>
            </motion.div>
          </motion.div>
        </div>
        <svg style={{ position:'absolute', bottom:'26px', left:'20px', width:'calc(100% - 40px)', height:'80px', overflow:'visible', pointerEvents:'none' }}>
          {Array.from({ length: jumps }).map((_, i) => {
            const x1 = (i * q.step / maxNum) * (tw || 300);
            const x2 = ((i+1)*q.step/maxNum) * (tw || 300);
            const mx = (x1+x2)/2;
            return (
              <motion.path key={i} d={`M${x1},78 Q${mx},10 ${x2},78`}
                fill="none" stroke="#F08C46" strokeWidth="2.5" strokeDasharray="6 4"
                initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:0.75 }}
                transition={{ duration:0.35 }}/>
            );
          })}
        </svg>
        <div ref={trackRef} style={{ position:'relative', width:'100%', height:'38px' }}>
          <div style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', left:0, right:0, height:'4px', background:'#F08C46', borderRadius:'2px', zIndex:1 }}/>
          {nums.map(n => {
            const isV = visited.includes(n);
            const isC = n === frogPos;
            const isT = revealed && n === total;
            return (
              <div key={n} style={{ position:'absolute', left:`${(n/maxNum)*100}%`, top:'50%', transform:'translate(-50%, -50%)', display:'flex', flexDirection:'column', alignItems:'center', zIndex:2 }}>
                <motion.div
                  animate={{ scale: isC?1.35:1, background: isT?C.orange : isV?C.orange:'#2D2520' }}
                  style={{ width:n%2===0?24:16, height:n%2===0?24:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    border: isC?'2px solid #F6D365':isV?'2px solid #F08C46':'2px solid rgba(240,140,70,0.3)',
                    boxShadow: isC?'0 0 14px rgba(246,211,101,0.9)':'none',
                    fontSize:'0.58rem', fontWeight:800, color: isV||isT?'white':'rgba(240,140,70,0.8)' }}
                  transition={{ duration:0.3 }}>
                  {n%2===0 ? n : ''}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}>
        {Array.from({ length: q.jumps }).map((_, i) => (
          <div key={i}
            style={{ padding:'6px 14px', borderRadius:'20px', border:`2px solid ${i<jumps?C.orange:'rgba(255,255,255,0.1)'}`,
              background: i<jumps?'rgba(240,140,70,0.25)':'rgba(255,255,255,0.05)',
              fontSize:'0.88rem', fontWeight:700, color: i<jumps?C.orange:C.muted, fontFamily:FONT }}>
            Jump {i+1}: +{q.step}
          </div>
        ))}
      </div>
      {frogPos === 0 && !revealed && (
        <p style={{ color:C.muted, fontSize:'0.9rem', fontFamily:FONT, textAlign:'center', margin:0 }}>
          🐸 Drag Freddy to where he'll land after {q.jumps} jumps!
        </p>
      )}
      {frogPos > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(34,197,94,0.08)', border:'2px solid rgba(34,197,94,0.25)', borderRadius:'14px', padding:'10px 22px' }}>
          <span style={{ color:C.muted, fontSize:'0.88rem', fontFamily:FONT }}>Freddy is at:</span>
          <span style={{ color:'#4ade80', fontSize:'1.9rem', fontWeight:900, fontFamily:FONT }}>{frogPos}</span>
        </div>
      )}
    </div>
  );
});

/* ── Math Machine Template (memoized, no mount animation) ────────── */
export const MathMachineTemplate = memo(function MathMachineTemplate({ q, revealed }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', padding:'8px 0' }}>
      <div style={{ width:'88px', height:'88px', background:'linear-gradient(135deg,#5B5048,#463B34)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.6rem', fontWeight:900, color:'white', fontFamily:FONT, boxShadow:'0 10px 28px rgba(0,0,0,0.5)', border:'3px solid #F08C46' }}>
        {q.input}
      </div>
      <motion.div animate={{ y:[0,8,0] }} transition={{ duration:1.5, repeat:Infinity }} style={{ color:'#F08C46', fontSize:'1.7rem', lineHeight:1 }}>↓</motion.div>
      <div style={{ background:'#2D2520', border:'4px solid #5B5048', borderRadius:'24px', padding:'18px 30px', display:'flex', alignItems:'center', gap:'14px', boxShadow:'0 0 40px rgba(0,0,0,0.5)', position:'relative' }}>
        <div style={{ position:'absolute', inset:-1, borderRadius:'24px', background:'linear-gradient(135deg,rgba(240,140,70,0.12),transparent)', pointerEvents:'none' }}/>
        <motion.span style={{ fontSize:'2.6rem' }} animate={{ rotate:360 }} transition={{ duration:4, repeat:Infinity, ease:'linear' }}>⚙️</motion.span>
        <div style={{ background:'#181512', border:'2px inset #4A4038', borderRadius:'12px', padding:'8px 18px', textAlign:'center' }}>
          <div style={{ fontSize:'0.65rem', fontFamily:FONT, color:'#A89C93', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Function</div>
          <div style={{ fontSize:'2.1rem', fontWeight:900, fontFamily:FONT, color:'#F08C46', textShadow:'0 0 12px rgba(240,140,70,0.8)' }}>×{q.multiplier}</div>
        </div>
        <motion.span style={{ fontSize:'2.6rem' }} animate={{ rotate:-360 }} transition={{ duration:3, repeat:Infinity, ease:'linear' }}>⚙️</motion.span>
      </div>
      <motion.div animate={{ y:[0,8,0] }} transition={{ duration:1.5, repeat:Infinity, delay:0.3 }} style={{ color:'#F08C46', fontSize:'1.7rem', lineHeight:1 }}>↓</motion.div>
      <div style={{ width:'88px', height:'88px', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.6rem', fontWeight:900, color:'white', fontFamily:FONT,
        background: revealed ? 'linear-gradient(135deg,#F08C46,#D97706)' : '#463B34',
        boxShadow: revealed ? '0 10px 28px rgba(240,140,70,0.5)' : '0 10px 28px rgba(0,0,0,0.4)',
        border: revealed ? '3px solid rgba(255,255,255,0.2)' : '3px dashed #F08C46',
        transition: 'all 0.2s' }}>
        {revealed ? q.answer : '?'}
      </div>
    </div>
  );
});

/* ── Plant Arrays (memoized, no stagger) ─────────────────────────── */
export const PlantArrayTemplate = memo(function PlantArrayTemplate({ q, revealed }) {
  const [planted, setPlanted] = useState([]);
  const total = q.rows * q.cols;

  useEffect(() => setPlanted([]), [q.id]);

  const plant = useCallback(i => {
    setPlanted(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  }, []);

  const cells = useMemo(() => Array.from({ length: total }, (_, i) => i), [total]);

  return (
    <div style={{ background:'linear-gradient(135deg,#3D322B,#1D1815)', borderRadius:'20px', padding:'26px 22px', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', boxShadow:'0 15px 40px rgba(0,0,0,0.5)', border:'2px solid rgba(240,140,70,0.25)' }}>
      <p style={{ color:'#F08C46', fontFamily:FONT, fontWeight:700, margin:0, fontSize:'0.9rem' }}>
        {revealed ? `✅ ${total} plants!` : '👆 Tap each patch to plant a seed!'}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${q.cols},1fr)`, gap:'10px', background:'rgba(0,0,0,0.2)', padding:'14px', borderRadius:'14px' }}>
        {cells.map(i => (
          <div key={i} onClick={revealed ? undefined : () => plant(i)}
            style={{ width:'50px', height:'50px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.7rem', cursor: revealed?'default':'pointer',
              border:'2px solid rgba(240,140,70,0.3)',
              background: (planted.includes(i)||revealed) ? 'rgba(240,140,70,0.3)' : 'rgba(255,255,255,0.05)',
              boxShadow: (planted.includes(i)||revealed) ? '0 0 12px rgba(240,140,70,0.4)' : 'none',
              transition: 'background 0.15s, box-shadow 0.15s' }}>
            {(planted.includes(i)||revealed) ? q.emoji : '🪨'}
          </div>
        ))}
      </div>
    </div>
  );
});

/* ── Candy Sharing (memoized, no stagger on candies) ─────────────── */
export const CandySharingTemplate = memo(function CandySharingTemplate({ q, revealed }) {
  const [shared, setShared] = useState(0);
  useEffect(() => setShared(0), [q.id]);

  const share = useCallback(() => {
    if (revealed) return;
    setShared(s => Math.min(s + 1, q.total));
  }, [revealed, q.total]);

  const boxes = useMemo(() => Array.from({ length: q.boxes }, (_, i) => i), [q.boxes]);

  return (
    <div style={{ background:'linear-gradient(135deg,#451a03,#78350f)', borderRadius:'20px', padding:'26px 22px', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', boxShadow:'0 15px 40px rgba(0,0,0,0.4)' }}>
      <div onClick={share} style={{ fontSize:'3.4rem', cursor:revealed?'default':'pointer', filter:'drop-shadow(0 4px 12px rgba(249,115,22,0.5))', userSelect:'none' }}>
        {shared < q.total ? q.emoji : '✨'}
      </div>
      <p style={{ color:'#fcd34d', fontFamily:FONT, fontWeight:700, margin:0, fontSize:'0.88rem' }}>
        {revealed ? `✅ ${q.total/q.boxes} per basket!` : `Tap to share! (${shared}/${q.total})`}
      </p>
      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', justifyContent:'center' }}>
        {boxes.map(i => {
          const cnt = revealed ? (q.total/q.boxes) : Math.floor(shared/q.boxes)+(shared%q.boxes>i?1:0);
          return (
            <div key={`box-${i}`} style={{ background:'rgba(254,240,138,0.12)', border:'3px solid #eab308', borderRadius:'12px 12px 36px 36px', width:'78px', minHeight:'64px', display:'flex', alignItems:'center', justifyContent:'center', flexWrap:'wrap', gap:'3px', padding:'10px' }}>
              {/* Use a single text span instead of mapping individual elements */}
              {cnt > 0 && (
                <span style={{ fontSize: cnt <= 6 ? '1.25rem' : '0.95rem', lineHeight:'1.4', letterSpacing:'2px' }}>
                  {(q.emoji || '🍬').repeat(cnt)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ── Equal Groups (memoized, CSS-only rendering, no spring stagger) ─ */
export const EqualGroupsTemplate = memo(function EqualGroupsTemplate({ q }) {
  const n = q.itemsPerGroup || 1;
  const circleSize = n <= 4 ? 120 : n <= 6 ? 150 : n <= 9 ? 180 : n <= 12 ? 210 : 240;
  const emojiSize  = n <= 4 ? '1.4rem' : n <= 6 ? '1.25rem' : n <= 9 ? '1.1rem' : '0.95rem';
  const pad  = n <= 4 ? '18px' : n <= 9 ? '14px' : '10px';
  const gapPx = n <= 4 ? '6px' : '4px';

  const groups = useMemo(() => Array.from({ length: q.groups }, (_, i) => i), [q.groups]);
  // Pre-render item string once per question
  const itemsStr = useMemo(() => (q.emoji || '🍪').repeat(n), [q.emoji, n]);

  return (
    <div style={{ background:'linear-gradient(135deg,#3D322B,#1D1815)', borderRadius:'20px', padding:'26px 22px', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', boxShadow:'0 15px 40px rgba(0,0,0,0.5)', border:`2px solid rgba(240,140,70,0.25)` }}>
      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', justifyContent:'center' }}>
        {groups.map(i => (
          <div key={i}
            style={{ background:'rgba(255,255,255,0.04)', border:'3px solid rgba(240,140,70,0.5)', borderRadius:'50%',
              width:`${circleSize}px`, height:`${circleSize}px`, display:'flex', alignItems:'center', justifyContent:'center',
              alignContent:'center', flexWrap:'wrap', gap:gapPx, padding:pad,
              boxShadow:'0 0 20px rgba(240,140,70,0.25)' }}>
            <span style={{ fontSize:emojiSize, lineHeight:'1.3', letterSpacing:'1px', wordBreak:'break-all', textAlign:'center' }}>
              {itemsStr}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ── Picture Multi (memoized, no stagger) ────────────────────────── */
export const PictureMultiTemplate = memo(function PictureMultiTemplate({ q }) {
  const items = useMemo(() => Array.from({ length: q.n }, (_, i) => i), [q.n]);
  return (
    <div style={{ background:'linear-gradient(135deg,#3D322B,#1D1815)', borderRadius:'20px', padding:'30px 22px', display:'flex', flexDirection:'column', alignItems:'center', gap:'18px', boxShadow:'0 15px 40px rgba(0,0,0,0.5)', border:`2px solid rgba(240,140,70,0.25)` }}>
      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', justifyContent:'center', alignItems:'center' }}>
        {items.map(i => (
          <div key={i} style={{ fontSize:'3.8rem', lineHeight:'1.2', display:'flex', alignItems:'center', justifyContent:'center', filter:'drop-shadow(0 8px 20px rgba(240,140,70,0.45))', paddingBottom:'4px' }}>
            {q.icon}
          </div>
        ))}
      </div>
    </div>
  );
});

/* ── Answer Input (memoized) ─────────────────────────────────────── */
export const AnswerInput = memo(function AnswerInput({ ans, setAns, submitAns, revealed, correctAnswer, shake, options }) {
  const rawCorrect = useMemo(() => {
    const s = String(correctAnswer);
    return s.includes('=') ? s.split('=').pop().trim() : s.trim();
  }, [correctAnswer]);
  const isRight = String(ans).trim() === rawCorrect;
  const ref = useRef(null);
  useEffect(() => { if (ref.current && !revealed && (!options || options.length===0)) ref.current.focus(); }, [revealed, options]);

  const handleChange = useCallback(e => { if (!revealed) setAns(e.target.value); }, [revealed, setAns]);
  const handleKey    = useCallback(e => { if (e.key==='Enter' && !revealed && ans) submitAns(); }, [revealed, ans, submitAns]);
  const handleOpt    = useCallback(opt => { if (!revealed) setAns(String(opt)); }, [revealed, setAns]);

  return (
    <motion.div
      animate={shake ? { x:[-14,14,-10,10,-6,6,0] } : { x:0 }}
      transition={{ duration:0.5 }}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', width:'100%', marginTop:'6px' }}>
      <label style={{ fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:C.muted, fontFamily:FONT }}>Your Answer</label>
      {options && options.length > 0 ? (
        <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', justifyContent:'center' }}>
          {options.map((opt, i) => {
            const selected = String(ans) === String(opt);
            const isCorrectOption = String(opt).trim() === rawCorrect;
            let bg = selected ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.05)';
            let borderColor = selected ? C.orange : 'rgba(255,255,255,0.1)';
            let color = selected ? C.orange : C.white;
            let shadow = selected ? '0 0 20px rgba(249,115,22,0.3)' : 'none';
            if (revealed) {
              if (isCorrectOption) { bg='rgba(34,197,94,0.15)'; borderColor=C.green; color=C.green; shadow='0 0 20px rgba(34,197,94,0.35)'; }
              else if (selected)   { bg='rgba(239,68,68,0.15)';  borderColor=C.red;   color=C.red;   shadow='0 0 20px rgba(239,68,68,0.35)'; }
            }
            return (
              <button key={i} onClick={() => handleOpt(opt)} disabled={revealed}
                style={{ width:'80px', height:'64px', borderRadius:'16px', background:bg, border:`2px solid ${borderColor}`, color, fontSize:'1.8rem', fontWeight:900, fontFamily:FONT, cursor:revealed?'default':'pointer', boxShadow:shadow, transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <input ref={ref} type="number" value={ans||''} onChange={handleChange} onKeyDown={handleKey}
            disabled={revealed} placeholder="?"
            style={{ width:'116px', height:'68px', fontSize:'2.4rem', fontWeight:900, textAlign:'center',
              border:`2px solid ${revealed?(isRight?C.green:C.red):'rgba(255,255,255,0.18)'}`,
              borderRadius:'18px', background: revealed?(isRight?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)'):'rgba(255,255,255,0.04)',
              color: revealed?(isRight?C.green:C.red):C.white,
              outline:'none', fontFamily:FONT, transition:'all 0.2s',
              boxShadow: revealed?(isRight?`0 0 24px rgba(34,197,94,0.35)`:`0 0 24px rgba(239,68,68,0.35)`):'none',
              MozAppearance:'textfield' }}/>
          {revealed && (
            <div style={{ fontSize:'2.6rem' }}>{isRight ? '✅' : '❌'}</div>
          )}
        </div>
      )}
    </motion.div>
  );
});

/* ── Results Table (memoized) ────────────────────────────────────── */
const ResultsTable = memo(function ResultsTable({ results }) {
  if (!results.length) return null;
  return (
    <div style={{ width:'100%', marginTop:'14px', overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:FONT, fontSize:'0.8rem' }}>
        <thead>
          <tr style={{ borderBottom:`2px solid ${C.border}` }}>
            {['#','Question','Your Answer','Result','Time'].map(h => (
              <th key={h} style={{ padding:'7px 10px', color:C.muted, fontWeight:700, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.06em', fontSize:'0.7rem' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} style={{ borderBottom:`1px solid rgba(255,255,255,0.04)`, background:i%2===0?'rgba(255,255,255,0.02)':'transparent' }}>
              <td style={{ padding:'7px 10px', color:C.muted }}>{i+1}</td>
              <td style={{ padding:'7px 10px', color:C.white }}>{r.question}</td>
              <td style={{ padding:'7px 10px', color:C.white }}>{r.userAnswer}</td>
              <td style={{ padding:'7px 10px' }}>{r.correct?<span style={{color:C.green}}>✓</span>:<span style={{color:C.red}}>✗</span>}</td>
              <td style={{ padding:'7px 10px', color:C.muted }}>{r.time}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ── Equation formatter ──────────────────────────────────────────── */
function getEquation(qObj, ans) {
  switch (qObj?.template) {
    case 'plant_arrays':  return `${qObj.rows} × ${qObj.cols} = ${ans}`;
    case 'frog_jumps':    return `${qObj.jumps} × ${qObj.step} = ${ans}`;
    case 'candy_sharing': return `${qObj.total} ÷ ${qObj.boxes} = ${ans}`;
    case 'equal_groups':  return `${qObj.groups} × ${qObj.itemsPerGroup} = ${ans}`;
    case 'picture_multi': return `${qObj.n} × ${qObj.count} = ${ans}`;
    case 'math_machine':  return `${qObj.input} × ${qObj.multiplier} = ${ans}`;
    default: return String(ans);
  }
}

/* ── Template renderer (stable function, no AnimatePresence) ─────── */
const RenderVisual = memo(function RenderVisual({ question, answer, setAnswer, submitAns, revealed }) {
  if (!question) return null;
  const props = { q: question, ans: answer, setAns: setAnswer, submitAns, revealed };
  switch (question.template) {
    case 'frog_jumps':    return <FrogJumpTemplate    {...props}/>;
    case 'math_machine':  return <MathMachineTemplate  {...props}/>;
    case 'plant_arrays':  return <PlantArrayTemplate   {...props}/>;
    case 'candy_sharing': return <CandySharingTemplate {...props}/>;
    case 'equal_groups':  return <EqualGroupsTemplate  {...props}/>;
    case 'picture_multi': return <PictureMultiTemplate {...props}/>;
    default: return null;
  }
});

/* ── Template labels ─────────────────────────────────────────────── */
const TEMPLATE_LABELS = {
  plant_arrays:  '🌱 Planting Arrays',
  frog_jumps:    '🐸 Frog Jumps',
  candy_sharing: '🍬 Candy Sharing',
  equal_groups:  '🍪 Equal Groups',
  picture_multi: '🚀 Picture Math',
  math_machine:  '⚙️ Math Machine',
};

/* ── MAIN EXPORT ─────────────────────────────────────────────────── */
export default function VisualMathLabRedux({ onBack, initialDifficulty, initialNumQuestions, initialStarted }) {
  const [difficulty,     setDifficulty]     = useState(initialDifficulty || 'easy');
  const [numQuestions,   setNumQuestions]   = useState(initialNumQuestions || '5');
  const [started,        setStarted]        = useState(initialStarted || false);
  const [finished,       setFinished]       = useState(false);
  const [question,       setQuestion]       = useState(null);
  const [answer,         setAnswer]         = useState('');
  const [score,          setScore]          = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQ,         setTotalQ]         = useState(5);
  const [feedback,       setFeedback]       = useState('');
  const [isCorrect,      setIsCorrect]      = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [revealed,       setRevealed]       = useState(false);
  const [results,        setResults]        = useState([]);
  const [shake,          setShake]          = useState(false);
  const [showXP,         setShowXP]         = useState(false);
  const timer = useTimer();

  // ── Double-buffer: prefetch next question while current is shown ──
  const prefetchRef  = useRef(null);   // holds prefetched question data
  const fetchingRef  = useRef(false);  // guard against concurrent fetches
  const difficultyRef = useRef(difficulty);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);

  const fetchFromServer = useCallback(async (diff, lastTemplate) => {
    const res = await fetch(
      `${API}/visual-math-lab-redux/generate?difficulty=${diff}&lastTemplate=${lastTemplate||''}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  // Kick off prefetch in background immediately
  const prefetchNext = useCallback((lastTemplate) => {
    fetchFromServer(difficultyRef.current, lastTemplate)
      .then(data => { prefetchRef.current = data; })
      .catch(() => {});
  }, [fetchFromServer]);

  const fetchQuestion = useCallback(async (currentTemplate) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setFeedback('');
    setAnswer('');
    setRevealed(false);
    setIsCorrect(null);
    setShake(false);

    try {
      // Use prefetched data if available — zero network wait
      let data = prefetchRef.current;
      prefetchRef.current = null;

      if (!data) {
        // No prefetch ready — fetch now (only happens on first question or cache miss)
        data = await fetchFromServer(difficultyRef.current, currentTemplate || '');
      }

      setQuestion(data);
      setQuestionNumber(n => n + 1);
      setLoading(false);
      timer.start();

      // Immediately prefetch the next question in the background
      prefetchNext(data.template);
    } catch (err) {
      console.error('fetchQuestion error:', err);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, [fetchFromServer, prefetchNext, timer]);

  // qRef holds the current question template for prefetch chaining
  const questionRef = useRef(null);
  useEffect(() => { questionRef.current = question; }, [question]);

  const questionNumberRef = useRef(0);
  useEffect(() => { questionNumberRef.current = questionNumber; }, [questionNumber]);

  const totalQRef = useRef(totalQ);
  useEffect(() => { totalQRef.current = totalQ; }, [totalQ]);

  const startQuiz = useCallback(() => {
    const count = Number(numQuestions) || 5;
    setTotalQ(count);
    setStarted(true);
    setFinished(false);
    setScore(0);
    setQuestionNumber(0);
    setResults([]);
    prefetchRef.current = null;
    fetchingRef.current = false;
  }, [numQuestions]);

  useEffect(() => {
    if (started && !finished && questionNumber === 0) {
      fetchQuestion('');
    }
  }, [started]); // eslint-disable-line

  // Handle finish condition separately to avoid re-triggering fetch
  useEffect(() => {
    if (started && !finished && questionNumber > 0 && questionNumber > totalQ) {
      setFinished(true);
      timer.reset();
    }
  }, [questionNumber, totalQ, started, finished, timer]);

  const submitAns = useCallback(async (optAns) => {
    if (!question || revealed) return;
    const finalAns  = optAns !== undefined ? optAns : answer;
    const timeTaken = timer.stop();
    setAnswer(finalAns);

    const res  = await fetch(`${API}/visual-math-lab-redux/check`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ answerOption: finalAns, expected: question.answer }),
    });
    const data = await res.json();
    setIsCorrect(data.correct);
    if (data.correct) {
      setScore(s => s + 1);
      fireConfetti();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1600);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    const eqn = getEquation(question, data.correctAnswer);
    setFeedback(data.correct ? `Correct! 🎉 ${eqn}` : `Not quite! ${eqn}`);
    setResults(prev => [...prev, { question:question.prompt, userAnswer:finalAns, correctAnswer:eqn, correct:data.correct, time:timeTaken }]);
    setRevealed(true);
  }, [question, revealed, answer, timer]);

  const handleSolve = useCallback(async () => {
    if (revealed || !question) return;
    const timeTaken = timer.stop();
    const res = await fetch(`${API}/visual-math-lab-redux/check`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ answerOption:'', expected: question.answer, solve:true }),
    });
    const data = await res.json();
    setIsCorrect(false);
    const eqn = getEquation(question, data.correctAnswer);
    setFeedback(`The answer is ${eqn}`);
    setResults(prev => [...prev, { question:question.prompt, userAnswer:'—', correctAnswer:eqn, correct:false, time:timeTaken }]);
    setRevealed(true);
  }, [revealed, question, timer]);

  // Next question: instant — uses prefetched data
  const handleNext = useCallback(() => {
    if (questionNumberRef.current >= totalQRef.current) {
      setFinished(true);
      timer.reset();
      return;
    }
    fetchQuestion(questionRef.current?.template);
  }, [fetchQuestion, timer]);

  // Prompt highlighting
  const promptParts = useMemo(() => {
    if (!question) return [];
    return question.prompt.split(/(\d+)/g);
  }, [question?.prompt]);

  const correctAnswerLabel = useMemo(() => question ? getEquation(question, question.answer) : '', [question]);

  return (
    <div style={{ minHeight:'100vh', background:'#181512', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'24px 16px 48px', position:'relative' }}>
      <FloatingBg/>

      {/* ── START ───────────────────────────────────────────────── */}
      {!started && !finished && (
        <div style={{ background:'#2D2520', border:'1.5px solid #4A4038', borderRadius:'28px', boxShadow:'0 20px 40px rgba(0,0,0,.45)', padding:'48px 40px', maxWidth:'720px', width:'100%', textAlign:'center', position:'relative', margin:'auto', zIndex:10 }}>
          <button onClick={onBack} style={{ position:'absolute', top:'24px', left:'24px', background:'transparent', border:'1px solid #5B5048', borderRadius:'6px', padding:'6px 14px', color:'#A89C93', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', zIndex:20 }}>← Home</button>
          <h1 style={{ fontFamily:'Georgia, "Times New Roman", serif', fontWeight:700, fontSize:'48px', color:'#F4F1ED', margin:'0 0 12px', lineHeight:1.1 }}>Multiplication &amp; division</h1>
          <p style={{ color:'#988D84', fontSize:'0.9rem', margin:'0 0 40px', fontFamily:'Inter, sans-serif', fontWeight:400 }}>Practice multiplication and division!</p>
          <div style={{ marginBottom:'24px' }}>
            <h3 style={{ color:'#F4F1ED', fontSize:'0.9rem', margin:'0 0 16px', fontFamily:'Inter, sans-serif', fontWeight:700 }}>Select Difficulty:</h3>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'12px' }}>
              {[['Easy','easy'],['Medium','medium'],['Hard','hard']].map(([lbl,val]) => (
                <button key={val} onClick={() => setDifficulty(val)} style={{ background:difficulty===val?'#F08C46':'transparent', border:difficulty===val?'1px solid #F08C46':'1px solid #5B5048', borderRadius:'50px', padding:'8px 16px', color:difficulty===val?'#FFF':'#988D84', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:'32px', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <label style={{ color:'#988D84', fontSize:'0.85rem', margin:'0 0 12px', fontFamily:'Inter, sans-serif', fontWeight:400 }}>How many questions?</label>
            <input type="text" value={numQuestions} onChange={e => { const v=e.target.value; if(v===''||/^\d+$/.test(v)) setNumQuestions(v); }} style={{ background:'#463B34', border:'1px solid #5B5048', borderRadius:'6px', padding:'10px', color:'#FFF', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:'0.9rem', width:'100px', textAlign:'center', outline:'none' }} placeholder="5"/>
          </div>
          <button onClick={startQuiz} style={{ background:'#F08C46', border:'none', borderRadius:'6px', padding:'10px 24px', color:'#FFF', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>Start Quiz</button>
        </div>
      )}

      {/* ── QUESTION ────────────────────────────────────────────── */}
      {started && !finished && (
        <div style={{ maxWidth:'870px', width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:'28px', padding:'40px 44px', boxShadow:'0 25px 60px rgba(0,0,0,0.65)', position:'relative', marginTop:'4vh', zIndex:1 }}>
          <XPPopup show={showXP}/>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px', flexWrap:'wrap' }}>
            <button onClick={onBack} style={{ background:`linear-gradient(135deg,${C.orange},${C.orange2})`, border:'none', borderRadius:'50px', padding:'10px 20px', color:'white', fontFamily:FONT, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 6px 18px rgba(249,115,22,0.3)', whiteSpace:'nowrap' }}>← Back</button>
            <div style={{ flex:1, minWidth:'100px' }}>
              <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:'99px', height:'9px', overflow:'hidden' }}>
                <motion.div animate={{ width:`${((questionNumber-1)/totalQ)*100}%` }} transition={{ duration:0.4, ease:'easeOut' }}
                  style={{ height:'100%', background:`linear-gradient(90deg,${C.orange},${C.orange2})`, borderRadius:'99px', boxShadow:`0 0 10px rgba(249,115,22,0.5)` }}/>
              </div>
            </div>
            <span style={{ color:C.muted, fontSize:'0.82rem', fontWeight:700, whiteSpace:'nowrap' }}>{questionNumber} / {totalQ}</span>
            <div style={{ border:'2px solid', borderColor: timer.elapsed>=20?'rgba(239,68,68,0.5)':'rgba(255,255,255,0.1)', background: timer.elapsed>=20?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.07)', borderRadius:'50px', padding:'8px 14px', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.82rem', fontWeight:700, fontFamily:FONT, color: timer.elapsed>=20?C.red:C.white }}>
              ⏱️ {timer.elapsed}s
            </div>
          </div>

          {/* Score stars */}
          <div style={{ display:'flex', gap:'3px', marginBottom:'18px' }}>
            {Array.from({ length: totalQ }).map((_, i) => (
              <div key={i} style={{ fontSize:'0.85rem', opacity: i<score?1:0.18 }}>⭐</div>
            ))}
          </div>

          {/* Template label */}
          {question && (
            <div style={{ marginBottom:'8px' }}>
              <span style={{ background:'rgba(249,115,22,0.14)', border:'1px solid rgba(249,115,22,0.28)', borderRadius:'8px', padding:'4px 12px', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:C.orange, fontFamily:FONT }}>
                {TEMPLATE_LABELS[question.template] || '🧮 Math'}
              </span>
            </div>
          )}

          {/* Question text — instant swap, no AnimatePresence */}
          <div style={{ marginBottom:'22px', minHeight:'60px' }}>
            {loading || !question ? (
              <div style={{ color:C.muted, fontSize:'1.5rem', textAlign:'center', padding:'20px' }}>Loading…</div>
            ) : (
              <h2 style={{ fontSize:'1.85rem', fontWeight:800, color:C.white, margin:0, lineHeight:1.35 }}>
                {promptParts.map((part, i) =>
                  /^\d+$/.test(part)
                    ? <span key={i} style={{ color:C.orange, textShadow:`0 0 18px rgba(249,115,22,0.45)` }}>{part}</span>
                    : part
                )}
              </h2>
            )}
          </div>

          {/* Visual — instant swap, stable DOM, no AnimatePresence */}
          <div style={{ minHeight:'160px' }}>
            {question && !loading && (
              <RenderVisual
                question={question}
                answer={answer}
                setAnswer={setAnswer}
                submitAns={submitAns}
                revealed={revealed}
              />
            )}
          </div>

          {/* Answer input */}
          {question && !loading && (
            <div style={{ marginTop:'20px' }}>
              <AnswerInput ans={answer} setAns={setAnswer} submitAns={submitAns}
                revealed={revealed} correctAnswer={correctAnswerLabel} shake={shake} options={question.options}/>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{ marginTop:'14px', padding:'14px 18px', borderRadius:'14px',
              background: isCorrect?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)',
              border:`2px solid ${isCorrect?'rgba(34,197,94,0.35)':'rgba(239,68,68,0.35)'}`,
              fontSize:'0.98rem', fontWeight:700, color: isCorrect?'#86efac':'#fca5a5', fontFamily:FONT, textAlign:'center' }}>
              {isCorrect ? '🎉 ' : '💡 '}{feedback}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display:'flex', gap:'12px', marginTop:'22px', flexWrap:'wrap' }}>
            {!revealed ? (
              <>
                <button onClick={handleSolve}
                  style={{ flex:1, background:`linear-gradient(135deg,${C.orange},${C.orange2})`, border:'none', borderRadius:'16px', padding:'16px 18px', opacity:0.72, color:'white', fontFamily:FONT, fontWeight:700, fontSize:'0.92rem', cursor:'pointer', boxShadow:'0 8px 24px rgba(249,115,22,0.22)' }}>
                  Show Answer
                </button>
                <button onClick={() => submitAns()} disabled={loading||!answer}
                  style={{ flex:1, background: loading||!answer?'rgba(255,255,255,0.07)':`linear-gradient(135deg,${C.orange},${C.orange2})`, border:'none', borderRadius:'16px', padding:'16px 20px', color: loading||!answer?C.muted:'white', fontFamily:FONT, fontWeight:800, fontSize:'1rem', cursor: loading||!answer?'not-allowed':'pointer', boxShadow: loading||!answer?'none':'0 8px 24px rgba(249,115,22,0.32)' }}>
                  Submit ✓
                </button>
              </>
            ) : (
              <button onClick={handleNext}
                style={{ flex:1, background:`linear-gradient(135deg,${C.orange},${C.orange2})`, border:'none', borderRadius:'16px', padding:'18px 22px', color:'white', fontFamily:FONT, fontWeight:800, fontSize:'1.05rem', cursor:'pointer', boxShadow:'0 8px 24px rgba(249,115,22,0.35)' }}>
                {questionNumber >= totalQ ? 'Finish Lab 🏁' : 'Next Question →'}
              </button>
            )}
          </div>

          {/* Mini results */}
          {results.length > 0 && (
            <div style={{ marginTop:'22px', borderTop:`1px solid ${C.border}`, paddingTop:'18px' }}>
              <ResultsTable results={results}/>
            </div>
          )}
        </div>
      )}

      {/* ── FINISH ──────────────────────────────────────────────── */}
      {finished && (
        <div style={{ maxWidth:'870px', width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:'28px', padding:'40px 44px', boxShadow:'0 25px 60px rgba(0,0,0,0.65)', position:'relative', marginTop:'8vh', textAlign:'center', zIndex:1 }}>
          <motion.div animate={{ y:[0,-18,0], rotate:[0,8,-8,0] }} transition={{ duration:1.4, repeat:Infinity }} style={{ fontSize:'5rem', marginBottom:'14px' }}>🏆</motion.div>
          <h1 style={{ fontSize:'2.8rem', fontWeight:900, color:C.white, margin:'0 0 8px' }}>Lab Complete!</h1>
          <p style={{ fontSize:'1.25rem', color:C.muted, margin:'0 0 12px' }}>Final Score: <span style={{ color:C.orange, fontWeight:900 }}>{score} / {totalQ}</span></p>
          <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:'99px', height:'12px', overflow:'hidden', maxWidth:'400px', margin:'0 auto 30px' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${(score/totalQ)*100}%` }} transition={{ duration:1.2, delay:0.3 }}
              style={{ height:'100%', background:`linear-gradient(90deg,${C.orange},${C.green})`, borderRadius:'99px' }}/>
          </div>
          <ResultsTable results={results}/>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', marginTop:'30px', flexWrap:'wrap' }}>
            <button onClick={() => { setStarted(false); setFinished(false); setScore(0); setQuestionNumber(0); setResults([]); prefetchRef.current=null; }}
              style={{ background:`linear-gradient(135deg,${C.orange},${C.orange2})`, border:'none', borderRadius:'16px', padding:'16px 32px', color:'white', fontFamily:FONT, fontWeight:800, fontSize:'1rem', cursor:'pointer', boxShadow:'0 8px 24px rgba(249,115,22,0.35)' }}>
              Play Again 🔄
            </button>
            <button onClick={onBack}
              style={{ background:'rgba(255,255,255,0.05)', border:`2px solid ${C.border}`, borderRadius:'16px', padding:'16px 24px', color:C.muted, fontFamily:FONT, fontWeight:700, fontSize:'1rem', cursor:'pointer' }}>
              ← Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
