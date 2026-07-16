import { useState } from 'react';
const OPTIONS = [
  { text: 'A car accelerates rapidly for 2 minutes to 60 km/h, travels at that constant speed for 3 minutes, and then stops instantly.', correct: true },
  { text: 'A car drives at a constant speed of 60 km/h for 5 minutes, then stops.', correct: false },
  { text: 'A car accelerates for 5 minutes to 60 km/h, then slowly decelerates.', correct: false }
];
export default function VisualToNarrative() {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const check = (opt) => { setSelected(opt.text); setMsg(opt.correct ? '✅ Correct! (0,0) to (2, 60) represents rapid acceleration to 60 km/h over 2 units of time. (2, 60) to (5, 60) represents traveling at a constant speed of 60 for 3 units of time. (5, 60) to (5, 0) is a vertical drop representing an instantaneous stop.' : '❌ Incorrect narrative. Pay attention to the slopes of each line segment (steep climb, flat plateau, vertical drop) and their corresponding time durations.'); };
  return (
    <div>
      <div style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.98rem', fontStyle: 'italic', lineHeight: '1.5' }}>A speed-time coordinate graph starts at (0,0), rises linearly to (2, 60), stays completely flat until (5, 60), and then instantly drops vertically back down to (5, 0).</p>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--clr-text-soft)' }}>Which real-world physical scenario accurately matches the visual representation?</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {OPTIONS.map((opt, idx) => (
          <button key={idx} onClick={() => check(opt)} className="submit-btn" style={{ textAlign: 'left', padding: '12px 16px', background: selected === opt.text ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: selected === opt.text ? '#fff' : 'var(--clr-accent)' }}>{opt.text}</button>
        ))}
      </div>
      {msg && <div style={{ fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}
