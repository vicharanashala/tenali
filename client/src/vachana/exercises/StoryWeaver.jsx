import { useState } from 'react';
const ORIGINAL = [
  { id: 0, text: 'A farmer walked into his orchard to inspect the crops.', order: 0 },
  { id: 1, text: 'He noticed that the leaves on three orange trees had turned yellow.', order: 1 },
  { id: 2, text: 'The soil beneath those yellow trees was bone dry.', order: 2 },
  { id: 3, text: 'He set up a drip line to supply exactly 4 liters of water per hour to that section.', order: 3 },
  { id: 4, text: 'By the next week, the yellow leaves had greened, and the crop was saved.', order: 4 }
];
export default function StoryWeaver() {
  const [cards, setCards] = useState([ORIGINAL[4], ORIGINAL[1], ORIGINAL[3], ORIGINAL[0], ORIGINAL[2]]);
  const [msg, setMsg] = useState('');
  const move = (idx, dir) => {
    const next = [...cards]; const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]]; setCards(next);
  };
  const check = () => {
    if (cards.every((c, i) => c.order === i)) setMsg('✅ Perfect! The narrative flow is logical: Setup ➔ Problem ➔ Clue ➔ Solution ➔ Result.');
    else setMsg('❌ The sequence is out of order. Make sure you set up the problem before presenting the solution!');
  };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Rearrange the sentences below so that they construct a logically ordered word problem.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {cards.map((card, idx) => (
          <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '10px' }}>
            <span style={{ fontWeight: 700, opacity: 0.6, fontSize: '0.9rem' }}>#{idx + 1}</span>
            <span style={{ fontSize: '0.95rem', flex: 1 }}>{card.text}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'transparent', color: 'inherit', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
              <button onClick={() => move(idx, 1)} disabled={idx === cards.length - 1} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'transparent', color: 'inherit', cursor: 'pointer', opacity: idx === cards.length - 1 ? 0.3 : 1 }}>▼</button>
            </div>
          </div>
        ))}
      </div>
      <button className="submit-btn" onClick={check}>Verify Story Sequence</button>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}
