import React, { useState, useEffect, useRef } from 'react';
import { Mafs, Coordinates, Plot, Point, useMovablePoint } from 'mafs';

export default function Stage1bKinematics({ onComplete }) {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const reqRef = useRef();

  // Distance function: d(t) = t^2 (accelerating car)
  const d = (t) => t * t;
  
  // Velocity function: v(t) = d'(t) = 2t
  const v = (t) => 2 * t;

  const currentDist = d(time);
  const currentVel = v(time);

  const animate = () => {
    setTime((prev) => {
      let next = prev + 0.02;
      if (next >= 4) {
        setIsPlaying(false);
        return 4;
      }
      return next;
    });
    reqRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      reqRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying]);

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 2: Real-World Intuition (Kinematics)
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        Why do we care about the "slope of a tangent line"? Let's look at a real-world example: Physics!
        <br/><br/>
        If a graph shows the <strong>distance</strong> a car has traveled over time, then the slope (rate of change) is exactly the car's <strong>velocity (speed)</strong>. The derivative literally tells you what the speedometer reads at any exact instant!
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
          <div style={{ marginBottom: '1rem', textAlign: 'center', background: 'var(--clr-bg)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ position: 'relative', height: '40px', background: '#333', borderRadius: '20px', overflow: 'hidden' }}>
              <div 
                style={{
                  position: 'absolute',
                  left: `${(currentDist / 16) * 90}%`,
                  top: '10px',
                  width: '40px',
                  height: '20px',
                  background: 'var(--clr-blue)',
                  borderRadius: '4px',
                  transition: isPlaying ? 'none' : 'left 0.1s'
                }}
              >
                🚗
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>
              <span>Start (0m)</span>
              <span>Finish (16m)</span>
            </div>
          </div>

          <Mafs viewBox={{ x: [0, 4.5], y: [-2, 18] }} height={250} pan={false} zoom={false}>
            <Coordinates.Cartesian xAxis={{ labels: (x) => `${x}s` }} yAxis={{ labels: (y) => `${y}m` }} />
            <Plot.OfX y={d} color="var(--clr-blue)" />
            <Point x={time} y={currentDist} color="var(--clr-accent)" />
            {time > 0 && (
              <Plot.OfX 
                y={(t) => currentVel * (t - time) + currentDist} 
                color="var(--clr-accent)" 
                style="dashed" 
              />
            )}
          </Mafs>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="secondary-btn" 
              onClick={() => { setTime(0); setIsPlaying(false); }}
            >
              Reset
            </button>
            <button 
              className="primary-btn" 
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 'Pause' : 'Drive'}
            </button>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Time <i>t</i>:</span>
              <strong style={{ color: 'var(--clr-text)' }}>{time.toFixed(2)} s</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Distance <i>d(t) = t²</i>:</span>
              <strong style={{ color: 'var(--clr-blue)' }}>{currentDist.toFixed(2)} m</strong>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Velocity (Derivative) <i>v(t)</i>:</span>
              <div style={{ 
                background: 'var(--clr-bg)', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                border: '2px solid var(--clr-accent)',
                color: 'var(--clr-accent)',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {currentVel.toFixed(2)} m/s
              </div>
            </div>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', marginTop: '1rem', fontStyle: 'italic' }}>
              Watch the dashed tangent line on the graph! As the car speeds up, the slope of the tangent line gets steeper. That steepness IS the velocity!
            </p>
          </div>

          {time >= 4 && (
            <button 
              className="primary-btn pulse"
              onClick={() => onComplete({ stage1bKinematics: { success: true } })}
            >
              Continue to the First Principle &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
