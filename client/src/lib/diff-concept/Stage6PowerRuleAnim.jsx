import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Stage6PowerRuleAnim({ onComplete }) {
  const [step, setStep] = useState(0);

  // step 0: Initial (x^3)
  // step 1: 3 drops down
  // step 2: 3-1 appears in exponent
  // step 3: exponent becomes 2

  const handleNextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };

  const reset = () => setStep(0);

  return (
    <div className="welcome-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
        Stage 6: The Power Rule Animation
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', maxWidth: '800px', marginBottom: '2rem' }}>
        Now that you understand what the derivative is geometrically, let's learn the shortcut to find it mathematically. 
        It's called the <strong>Power Rule</strong>. Watch what happens to the exponent!
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
        
        {/* Animation Display Area */}
        <div style={{ 
          flex: '2', 
          background: 'var(--clr-surface-alt)', 
          borderRadius: '16px', 
          border: '1px solid var(--clr-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          position: 'relative',
          padding: '2rem'
        }}>
          
          <div style={{ fontSize: '4rem', fontWeight: 'bold', display: 'flex', alignItems: 'baseline', fontFamily: 'monospace' }}>
            {/* The function notation */}
            <span style={{ color: 'var(--clr-text-soft)', marginRight: '20px' }}>
              f'(x) = 
            </span>

            {/* The Dropping Coefficient */}
            <motion.span 
              initial={{ opacity: 0, x: 20, y: -40, scale: 0.5 }}
              animate={
                step >= 1 
                ? { opacity: 1, x: 0, y: 0, scale: 1, color: 'var(--clr-accent)' } 
                : { opacity: 0, x: 20, y: -40, scale: 0.5 }
              }
              transition={{ type: 'spring', stiffness: 120, damping: 10 }}
              style={{ display: 'inline-block' }}
            >
              3
            </motion.span>

            {/* The Base 'x' */}
            <span style={{ color: 'var(--clr-text)' }}>x</span>

            {/* The Exponent */}
            <div style={{ position: 'relative', height: '1em' }}>
              <AnimatePresence mode="popLayout">
                {step === 0 && (
                  <motion.sup 
                    key="original-3"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.5 }}
                    style={{ color: 'var(--clr-accent)' }}
                  >
                    3
                  </motion.sup>
                )}
                {step === 1 && (
                  <motion.sup 
                    key="blank"
                  >
                    &nbsp;
                  </motion.sup>
                )}
                {step === 2 && (
                  <motion.sup 
                    key="math"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ color: 'var(--clr-orange)' }}
                  >
                    3 - 1
                  </motion.sup>
                )}
                {step === 3 && (
                  <motion.sup 
                    key="final"
                    initial={{ scale: 1.5, color: 'var(--clr-orange)' }}
                    animate={{ scale: 1, color: 'var(--clr-green)' }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    2
                  </motion.sup>
                )}
              </AnimatePresence>
            </div>
          </div>

          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '3rem',
                background: 'var(--clr-green-soft)',
                color: 'var(--clr-green)',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                border: '1px solid var(--clr-green)'
              }}
            >
              🎉 Perfect! The exponent jumps down, and decreases by 1.
            </motion.div>
          )}

        </div>

        {/* Controls */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
          
          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--clr-border)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Controls</h3>
            
            {step === 0 && (
              <button className="primary-btn" onClick={handleNextStep} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                1. Drop the Exponent
              </button>
            )}
            
            {step === 1 && (
              <button className="primary-btn" onClick={handleNextStep} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                2. Subtract 1
              </button>
            )}

            {step === 2 && (
              <button className="primary-btn" onClick={handleNextStep} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                3. Simplify
              </button>
            )}

            {step === 3 && (
              <button className="secondary-btn" onClick={reset} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                ↺ Replay Animation
              </button>
            )}
          </div>

          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--clr-border)' }}>
             <h3 style={{ color: 'var(--clr-text-soft)', marginBottom: '10px' }}>The Formal Rule</h3>
             <p style={{ fontSize: '1.2rem', fontFamily: 'monospace', textAlign: 'center', margin: '1rem 0' }}>
               d/dx (x<sup>n</sup>) = n &middot; x<sup>n-1</sup>
             </p>
          </div>

          {step === 3 && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="primary-btn pulse"
              onClick={() => onComplete({ stage6PowerRuleAnim: true })}
              style={{ padding: '1rem', fontSize: '1.2rem', marginTop: 'auto' }}
            >
              Got it! Let's solve some →
            </motion.button>
          )}

        </div>
      </div>
    </div>
  );
}
