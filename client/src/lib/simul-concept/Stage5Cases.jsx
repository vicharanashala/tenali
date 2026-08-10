import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Theme } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function Stage5Cases({ onComplete }) {
  const [explanation, setExplanation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!explanation.trim()) return;
    
    // Lightweight keyword match
    const keywords = ['parallel', 'never', 'meet', 'intersect', 'cross', 'same slope', 'different'];
    const lowerExp = explanation.toLowerCase();
    const keywordMatch = keywords.some(kw => lowerExp.includes(kw));

    setSubmitted(true);
    
    // We don't block on this, we just pass it to onComplete
    // Wait, onComplete should probably only be called when they click "Finish"
    // So we just store it in state for now, and call onComplete when they click "Finish Module"
  };

  const handleFinish = () => {
    const keywords = ['parallel', 'never', 'meet', 'intersect', 'cross', 'same slope', 'different'];
    const lowerExp = explanation.toLowerCase();
    const keywordMatch = keywords.some(kw => lowerExp.includes(kw));

    onComplete({ 
      stage5Explanation: { 
        text: explanation, 
        keywordMatch 
      } 
    });
  };

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 5: The Three Cases</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--clr-text-soft)' }}>
        A system of two linear equations doesn't always have exactly one solution. Let's look at the three possibilities geometrically.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Case 1: Intersecting */}
        <div style={{ background: 'var(--clr-surface-alt)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>1. Unique Solution</h4>
          <div style={{ height: '200px', borderRadius: '4px', overflow: 'hidden' }}>
            <Mafs viewBox={{ x: [-2, 2], y: [-2, 2] }} pan={false} zoom={false}>
              <Coordinates.Cartesian subdivisions={2} />
              <Plot.OfX y={(x) => x} color={Theme.blue} />
              <Plot.OfX y={(x) => -x + 1} color={Theme.green} />
            </Mafs>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginTop: '0.5rem' }}>
            Lines intersect exactly once.
          </p>
        </div>

        {/* Case 2: Parallel */}
        <div style={{ background: 'var(--clr-surface-alt)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>2. No Solution</h4>
          <div style={{ height: '200px', borderRadius: '4px', overflow: 'hidden' }}>
            <Mafs viewBox={{ x: [-2, 2], y: [-2, 2] }} pan={false} zoom={false}>
              <Coordinates.Cartesian subdivisions={2} />
              <Plot.OfX y={(x) => x + 1} color={Theme.blue} />
              <Plot.OfX y={(x) => x - 1} color={Theme.green} />
            </Mafs>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginTop: '0.5rem' }}>
            Lines are strictly parallel.
          </p>
        </div>

        {/* Case 3: Coincident */}
        <div style={{ background: 'var(--clr-surface-alt)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>3. Infinite Solutions</h4>
          <div style={{ height: '200px', borderRadius: '4px', overflow: 'hidden' }}>
            <Mafs viewBox={{ x: [-2, 2], y: [-2, 2] }} pan={false} zoom={false}>
              <Coordinates.Cartesian subdivisions={2} />
              <Plot.OfX y={(x) => 0.5 * x} color={Theme.blue} weight={6} opacity={0.5} />
              <Plot.OfX y={(x) => 0.5 * x} color={Theme.green} style="dashed" />
            </Mafs>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginTop: '0.5rem' }}>
            Lines are completely overlapping.
          </p>
        </div>

      </div>

      <div style={{ background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Explain it yourself</h3>
        <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem' }}>
          Look at Case 2 (No Solution). In your own words, why does a system of parallel lines have no solution?
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Type your explanation here..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid var(--clr-border)',
                background: 'var(--clr-background)',
                color: 'var(--clr-text)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                marginBottom: '1rem',
                resize: 'vertical'
              }}
              required
            />
            <button type="submit" className="primary-btn">Submit Explanation</button>
          </form>
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', marginBottom: '1rem', borderLeft: `4px solid var(--clr-text-soft)` }}>
              <strong>Your words:</strong> "{explanation}"
            </div>
            
            <div style={{ padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '4px', marginBottom: '1.5rem', borderLeft: `4px solid #4caf50` }}>
              <strong>The Math Translation:</strong><br/>
              A "solution" is a point where the lines touch. Because parallel lines have the same slope but different y-intercepts, they will never touch, intersect, or cross. Zero intersections = Zero solutions!
            </div>

            <button onClick={handleFinish} className="primary-btn" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}>
              Complete Concept Mastery 🎉
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
