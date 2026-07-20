import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Stage4Guess({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [taps, setTaps] = useState([]);
  const svgRef = useRef();

  // f(x) = sin(x)
  const f = (x) => Math.sin(x);
  const df = (x) => Math.cos(x);

  const xMin = 0;
  const xMax = 4 * Math.PI;
  const yMin = -1.5;
  const yMax = 1.5;

  const mapX = (x) => ((x - xMin) / (xMax - xMin)) * 800;
  const mapY = (y) => 400 - ((y - yMin) / (yMax - yMin)) * 400;

  // Generate curve path
  let path = `M ${mapX(xMin)} ${mapY(f(xMin))}`;
  const step = (xMax - xMin) / 200;
  for (let x = xMin; x <= xMax; x += step) {
    path += ` L ${mapX(x)} ${mapY(f(x))}`;
  }

  const questions = [
    { title: "Find ZERO slope", text: "Tap anywhere on the curve where the derivative (slope) is exactly ZERO.", color: "var(--clr-yellow)" },
    { title: "Find POSITIVE slope", text: "Tap anywhere on the curve where the derivative is POSITIVE (uphill).", color: "var(--clr-green)" },
    { title: "Find NEGATIVE slope", text: "Tap anywhere on the curve where the derivative is NEGATIVE (downhill).", color: "var(--clr-red)" }
  ];

  const handleSvgClick = (e) => {
    if (currentQuestion >= 3) return; // Done
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const clickX = (e.clientX - rect.left) * scaleX;
    
    const mathX = xMin + (clickX / 800) * (xMax - xMin);
    const slope = df(mathX);

    let isCorrect = false;
    if (currentQuestion === 0 && Math.abs(slope) < 0.25) isCorrect = true;
    if (currentQuestion === 1 && slope > 0.25) isCorrect = true;
    if (currentQuestion === 2 && slope < -0.25) isCorrect = true;

    const newTap = {
      id: Date.now(),
      cx: mapX(mathX),
      cy: mapY(f(mathX)),
      isCorrect
    };

    setTaps(prev => [...prev, newTap]);

    if (isCorrect) {
      setTimeout(() => {
        setCurrentQuestion(q => q + 1);
        setTaps([]); // Clear taps for next question
      }, 1500);
    }
  };

  const isCompleted = currentQuestion >= 3;

  return (
    <div className="welcome-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
        Stage 4: AI Derivative Scanner
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', maxWidth: '800px', marginBottom: '2rem' }}>
        Let's test your intuition! We aren't going to look at any algebra. 
        Just look at the shape of the graph and answer the prompts by tapping directly on the curve.
      </p>

      {/* The Socratic Question Box */}
      <motion.div 
        key={currentQuestion}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ 
          background: 'var(--clr-surface)', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          border: `2px solid ${isCompleted ? 'var(--clr-green)' : questions[currentQuestion]?.color}`,
          marginBottom: '2rem',
          textAlign: 'center'
        }}
      >
        {isCompleted ? (
          <div>
            <h3 style={{ color: 'var(--clr-green)', fontSize: '1.5rem', marginBottom: '10px' }}>Amazing!</h3>
            <p>You can identify derivatives perfectly just by looking at a graph!</p>
          </div>
        ) : (
          <div>
            <h3 style={{ color: questions[currentQuestion].color, fontSize: '1.5rem', marginBottom: '10px' }}>
              Mission {currentQuestion + 1}: {questions[currentQuestion].title}
            </h3>
            <p style={{ fontSize: '1.2rem' }}>{questions[currentQuestion].text}</p>
          </div>
        )}
      </motion.div>

      <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
        <svg 
          ref={svgRef}
          viewBox="0 0 800 400" 
          style={{ width: '100%', height: 'auto', display: 'block', cursor: isCompleted ? 'default' : 'crosshair' }}
          onClick={handleSvgClick}
        >
          {/* Grid line (x-axis) */}
          <line x1="0" y1={mapY(0)} x2="800" y2={mapY(0)} stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
          
          {/* The Curve */}
          <path d={path} fill="none" stroke="var(--clr-text-soft)" strokeWidth="6" strokeLinecap="round" />

          {/* Tap Interactions */}
          <AnimatePresence>
            {taps.map(tap => (
              <motion.g key={tap.id} initial={{ scale: 0, opacity: 1 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Expanding ring */}
                <motion.circle 
                  cx={tap.cx} cy={tap.cy} r="20" 
                  fill="none" 
                  stroke={tap.isCorrect ? 'var(--clr-green)' : 'var(--clr-red)'} 
                  strokeWidth="4"
                  animate={{ r: 40, opacity: 0 }}
                  transition={{ duration: 1 }}
                />
                {/* Solid center dot */}
                <circle cx={tap.cx} cy={tap.cy} r="8" fill={tap.isCorrect ? 'var(--clr-green)' : 'var(--clr-red)'} />
                
                {/* Text Label */}
                <motion.text 
                  x={tap.cx} y={tap.cy - 20} 
                  fill={tap.isCorrect ? 'var(--clr-green)' : 'var(--clr-red)'} 
                  fontSize="20" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  initial={{ y: tap.cy - 10, opacity: 0 }}
                  animate={{ y: tap.cy - 30, opacity: 1 }}
                >
                  {tap.isCorrect ? "Correct!" : "Try again"}
                </motion.text>
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>
      </div>

      {isCompleted && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button 
            className="primary-btn pulse" 
            onClick={() => onComplete({ stage4Guess: true })}
            style={{ fontSize: '1.3rem', padding: '1rem 2rem' }}
          >
            I'm a graphing master! Next Stage →
          </button>
        </div>
      )}
    </div>
  );
}
