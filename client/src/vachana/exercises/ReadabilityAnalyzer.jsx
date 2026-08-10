import { useState, useMemo } from 'react';
export default function ReadabilityAnalyzer() {
  const [text, setText] = useState('A train leaves the station traveling at sixty kilometers per hour. A second train leaves four hours later from the same platform in the same direction, traveling at ninety kilometers per hour. How long will it take for the second train to overtake the first train?');
  const metrics = useMemo(() => {
    if (!text.trim()) return { ease: 0, grade: 0, words: 0, sentences: 0, syllables: 0 };
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wc = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
    let syllables = 0;
    words.forEach(w => {
      let word = w.toLowerCase().replace(/[^a-z]/g, '');
      if (word.length <= 3) { syllables += 1; return; }
      word = word.replace(/(?:es|ed|e)$/, '').replace(/^y/, '');
      const v = word.match(/[aeiouy]{1,2}/g);
      syllables += v ? v.length : 1;
    });
    const asl = wc / sentences, asw = syllables / wc;
    return { words: wc, sentences, syllables, ease: Math.round((206.835 - 1.015 * asl - 84.6 * asw) * 10) / 10, grade: Math.round((0.39 * asl + 11.8 * asw - 15.59) * 10) / 10 };
  }, [text]);
  const stat = (label, val, color) => (
    <div style={{ background: 'var(--clr-surface)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--clr-border)' }}>
      <strong style={{ display: 'block', fontSize: '0.78rem', color: color || 'var(--clr-text-soft)' }}>{label}</strong>
      <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{val}</span>
    </div>
  );
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Paste a word problem or paragraph below to calculate its reading difficulty and grade level in real-time.</p>
      <textarea className="search-bar" style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '10px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'inherit', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.45', marginBottom: '16px', resize: 'vertical' }}
        value={text} onChange={e => setText(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        {stat('Words', metrics.words)}
        {stat('Sentences', metrics.sentences)}
        {stat('Syllables', metrics.syllables)}
        {stat('Flesch Ease', metrics.ease, 'var(--clr-accent)')}
        {stat('F-K Grade', metrics.grade, 'var(--clr-correct, #2ea043)')}
      </div>
    </div>
  );
}
