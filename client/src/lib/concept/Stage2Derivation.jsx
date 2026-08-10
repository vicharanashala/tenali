import React, { useState } from 'react';

export default function Stage2Derivation({ onComplete }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1);
  };

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 2: Completing the Square (Visually)</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--clr-text-soft)' }}>
        Where does the quadratic formula come from? Centuries ago, mathematician Al-Khwarizmi solved these problems not with algebra, but with <strong>geometry</strong>! Let's literally "complete the square."
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        
        {/* Visualization Panel */}
        <div style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          
          <svg width="300" height="300" viewBox="-50 -50 400 400">
            {/* The x^2 square (Always visible) */}
            <g transform="translate(0,0)">
              <rect x="0" y="0" width="160" height="160" fill="var(--clr-accent)" stroke="var(--clr-background)" strokeWidth="4" />
              <text x="80" y="85" fill="white" fontSize="24" textAnchor="middle" fontWeight="bold">x²</text>
              <text x="80" y="-10" fill="var(--clr-text-soft)" fontSize="16" textAnchor="middle">x</text>
              <text x="-15" y="85" fill="var(--clr-text-soft)" fontSize="16" textAnchor="middle">x</text>
            </g>

            {/* The bx rectangle (Step 0) */}
            {step === 0 && (
              <g transform="translate(180,0)">
                <rect x="0" y="0" width="80" height="160" fill="#4caf50" stroke="var(--clr-background)" strokeWidth="4" />
                <text x="40" y="85" fill="white" fontSize="24" textAnchor="middle" fontWeight="bold">bx</text>
                <text x="40" y="-10" fill="var(--clr-text-soft)" fontSize="16" textAnchor="middle">b</text>
              </g>
            )}

            {/* The cut rectangles (Step 1) */}
            {step === 1 && (
              <g transform="translate(180,0)">
                <rect x="0" y="0" width="40" height="160" fill="#4caf50" stroke="var(--clr-background)" strokeWidth="4" />
                <text x="20" y="85" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">½bx</text>
                
                <rect x="50" y="0" width="40" height="160" fill="#4caf50" stroke="var(--clr-background)" strokeWidth="4" />
                <text x="70" y="85" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">½bx</text>
                <text x="45" y="-10" fill="var(--clr-text-soft)" fontSize="14" textAnchor="middle">b/2   b/2</text>
              </g>
            )}

            {/* Moved rectangles (Step 2, 3, 4) */}
            {step >= 2 && (
              <>
                <g transform="translate(160,0)">
                  <rect x="0" y="0" width="40" height="160" fill="#4caf50" stroke="var(--clr-background)" strokeWidth="4" />
                  <text x="20" y="85" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">½bx</text>
                  <text x="20" y="-10" fill="var(--clr-text-soft)" fontSize="14" textAnchor="middle">b/2</text>
                </g>
                {/* Rotated bottom rectangle */}
                <g transform="translate(0, 160)">
                  <rect x="0" y="0" width="160" height="40" fill="#4caf50" stroke="var(--clr-background)" strokeWidth="4" />
                  <text x="80" y="25" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">½bx</text>
                  <text x="-20" y="25" fill="var(--clr-text-soft)" fontSize="14" textAnchor="middle">b/2</text>
                </g>
              </>
            )}

            {/* The missing piece (Step 3 & 4) */}
            {step >= 3 && (
              <g transform="translate(160, 160)">
                <rect x="0" y="0" width="40" height="40" fill="transparent" stroke="#f44336" strokeWidth="4" strokeDasharray="4" />
                {step === 4 && (
                  <>
                    <rect x="0" y="0" width="40" height="40" fill="#f44336" stroke="var(--clr-background)" strokeWidth="4" />
                    <text x="20" y="25" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">(b/2)²</text>
                  </>
                )}
              </g>
            )}

            {/* Final Big Bracket (Step 4) */}
            {step === 4 && (
              <>
                {/* Top bracket */}
                <path d="M 0 -35 L 0 -45 L 200 -45 L 200 -35" fill="none" stroke="var(--clr-text)" strokeWidth="2" />
                <text x="100" y="-55" fill="var(--clr-text)" fontSize="18" textAnchor="middle" fontWeight="bold">x + b/2</text>
                
                {/* Left bracket */}
                <path d="M -35 0 L -45 0 L -45 200 L -35 200" fill="none" stroke="var(--clr-text)" strokeWidth="2" />
                <text x="-55" y="105" fill="var(--clr-text)" fontSize="18" textAnchor="middle" fontWeight="bold" transform="rotate(-90 -55 105)">x + b/2</text>
              </>
            )}
          </svg>

        </div>

        {/* Text Explanation Panel */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          
          {step === 0 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Start with the terms</h3>
              <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
                Imagine the equation <strong>x² + bx = c</strong> as physical areas. 
                We have a blue square with area <strong>x²</strong> (sides are x and x) 
                and a green rectangle with area <strong>bx</strong> (sides are b and x).
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Split the rectangle</h3>
              <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
                To turn these shapes into a single large square, we first cut the green rectangle in half. 
                Now we have two pieces, each with width <strong>b/2</strong> and height <strong>x</strong>.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Arrange around the square</h3>
              <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
                We attach one piece to the right side, and rotate the other piece to attach it to the bottom. 
                It's starting to look like a bigger square, but there is a chunk missing in the corner!
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Identify the missing piece</h3>
              <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
                What are the dimensions of that empty corner? 
                The piece above it has width <strong>b/2</strong>, and the piece to its left has height <strong>b/2</strong>.
                So the missing square has an area of <strong>(b/2)²</strong>.
              </p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem', color: '#f44336' }}>Complete the Square!</h3>
              <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
                By adding that red piece <strong>(b/2)²</strong>, we have literally "completed the square". 
                The new, large square has side lengths of <strong>(x + b/2)</strong>, so its total area is <strong>(x + b/2)²</strong>.
                <br/><br/>
                This geometric trick is the exact secret behind the algebra of the Quadratic Formula!
              </p>
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            {step > 0 && (
              <button 
                className="secondary-btn" 
                onClick={() => setStep(s => s - 1)}
                style={{ padding: '0.75rem 1.5rem', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--clr-text)' }}
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button 
                className="primary-btn" 
                onClick={handleNext}
                style={{ padding: '0.75rem 1.5rem', background: 'var(--clr-accent)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
              >
                Next Step
              </button>
            ) : (
              <button 
                className="primary-btn" 
                onClick={() => onComplete({ understoodGeometric: true })}
                style={{ padding: '0.75rem 1.5rem', background: '#4caf50', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
              >
                Got It! Next Stage
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
