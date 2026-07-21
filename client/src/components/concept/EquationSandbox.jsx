import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mafs, Coordinates, Plot, Point, Theme } from 'mafs';
import 'mafs/core.css';

// Simple parser for equations like "2x + 3" or "-x^2 + 4"
const parseEquation = (eqStr) => {
  let parsed = eqStr.toLowerCase()
    .replace(/\s+/g, '') // remove spaces
    .replace(/y=/g, '')  // remove "y=" if they typed it
    .replace(/(\d)x/g, '$1*x') // 2x -> 2*x
    .replace(/x\^(\d+)/g, 'Math.pow(x,$1)') // x^2 -> Math.pow(x,2)
    .replace(/x/g, '(x)') // x -> (x) to handle signs safely
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(');

  try {
    const fn = new Function('x', `return ${parsed};`);
    // Test if it works
    fn(0);
    return fn;
  } catch (e) {
    return null;
  }
};

export default function EquationSandbox({ levelConfig, onVictory, onAttempt }) {
  const { startPos, stars: initialStars, allowedFunctions } = levelConfig;
  
  const [equationStr, setEquationStr] = useState('');
  const [fn, setFn] = useState(() => () => 0);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Game State
  const [ball, setBall] = useState({ x: startPos[0], y: startPos[1], vx: 0, vy: 0 });
  const [stars, setStars] = useState(initialStars);
  
  const requestRef = useRef();
  const stateRef = useRef({ ball, stars, isSimulating, fn });
  
  // Update ref whenever state changes so animation loop sees fresh data
  useEffect(() => {
    stateRef.current = { ball, stars, isSimulating, fn };
  }, [ball, stars, isSimulating, fn]);

  // Handle equation input
  const handleEquationChange = (e) => {
    setEquationStr(e.target.value);
    const parsedFn = parseEquation(e.target.value);
    if (parsedFn) {
      setFn(() => parsedFn);
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setBall({ x: startPos[0], y: startPos[1], vx: 0, vy: 0 });
    setStars(initialStars);
  };

  const startSimulation = () => {
    resetSimulation();
    setIsSimulating(true);
    onAttempt(); // track attempt for BKT
  };

  // Main physics loop
  const updatePhysics = useCallback((dt) => {
    const state = stateRef.current;
    if (!state.isSimulating) return;

    let { x, y, vx, vy } = state.ball;
    let currentStars = [...state.stars];
    const { fn } = state;
    
    // Gravity
    vy -= 9.8 * dt;

    // Tentative next position
    let nextX = x + vx * dt;
    let nextY = y + vy * dt;

    const ballRadius = 0.3; // size of ball

    // Collision with math curve y = f(x)
    try {
      const surfaceY = fn(nextX);
      
      if (nextY - ballRadius <= surfaceY) {
        // Collided!
        nextY = surfaceY + ballRadius; // push out
        
        // Calculate normal to curve
        const h = 0.001;
        const slope = (fn(nextX + h) - fn(nextX - h)) / (2 * h);
        
        // Tangent vector
        const tx = 1;
        const ty = slope;
        const tLen = Math.sqrt(tx*tx + ty*ty);
        const tNormX = tx / tLen;
        const tNormY = ty / tLen;

        // Normal vector (pointing up)
        let nx = -tNormY;
        let ny = tNormX;
        if (ny < 0) { nx = -nx; ny = -ny; }

        // Dot product of velocity and normal
        const dot = vx * nx + vy * ny;
        
        if (dot < 0) {
          // Cancel velocity along normal (bounciness = 0.4)
          const restitution = 0.4;
          vx = vx - (1 + restitution) * dot * nx;
          vy = vy - (1 + restitution) * dot * ny;
          
          // Friction: slow down tangent velocity slightly
          const friction = 0.99;
          vx *= friction;
          vy *= friction;
        }
      }
    } catch (e) {
      // Equation might be invalid at this x, ignore collision
    }

    // Check Star Collisions
    let starsChanged = false;
    currentStars = currentStars.map(star => {
      if (star.collected) return star;
      const dist = Math.sqrt(Math.pow(nextX - star.x, 2) + Math.pow(nextY - star.y, 2));
      if (dist < 0.6) {
        starsChanged = true;
        return { ...star, collected: true };
      }
      return star;
    });

    // Check Win Condition
    if (starsChanged) {
      if (currentStars.every(s => s.collected)) {
        setIsSimulating(false);
        setTimeout(() => {
          onVictory(equationStr);
        }, 500);
      }
      setStars(currentStars);
    }

    // Check Out of Bounds (Reset if falls off map)
    if (nextY < -10 || nextX < -15 || nextX > 15) {
      setIsSimulating(false);
    }

    setBall({ x: nextX, y: nextY, vx, vy });
  }, [onVictory, equationStr]);

  // Animation Frame Loop
  useEffect(() => {
    let lastTime;
    const loop = (time) => {
      if (lastTime !== undefined && stateRef.current.isSimulating) {
        const dt = Math.min((time - lastTime) / 1000, 0.05); // cap dt
        updatePhysics(dt);
      }
      lastTime = time;
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updatePhysics]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px', background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Equation Sandbox</div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--clr-bg)', padding: '5px 15px', borderRadius: '20px', border: '1px solid var(--clr-border)' }}>
          <span style={{ fontStyle: 'italic', marginRight: '10px' }}>y = </span>
          <input 
            type="text" 
            value={equationStr} 
            onChange={handleEquationChange}
            placeholder="e.g. 2x - 3"
            style={{ background: 'transparent', border: 'none', color: 'var(--clr-text)', outline: 'none', fontSize: '1.1rem', width: '200px' }}
            disabled={isSimulating}
          />
        </div>
        <button 
          onClick={isSimulating ? resetSimulation : startSimulation}
          style={{ padding: '8px 24px', background: isSimulating ? 'var(--clr-card)' : 'var(--clr-accent)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isSimulating ? 'Reset' : 'Launch!'}
        </button>
        <div style={{ color: 'var(--clr-text-soft)' }}>
          Stars: {stars.filter(s => s.collected).length} / {stars.length}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
        <Mafs viewBox={{ x: [-10, 10], y: [-5, 10] }} pan={true} zoom={true} preserveAspectRatio={true}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
          
          {/* Render Math Function */}
          {fn && (
            <Plot.OfX y={fn} color={Theme.blue} weight={3} />
          )}

          {/* Render Stars */}
          {stars.map((star, i) => !star.collected && (
            <Point key={i} x={star.x} y={star.y} color={Theme.yellow} size={15} />
          ))}

          {/* Render Ball */}
          <Point x={ball.x} y={ball.y} color={Theme.orange} size={25} />

          {/* Render Start Point Ghost */}
          <Point x={startPos[0]} y={startPos[1]} color={Theme.orange} opacity={0.3} size={15} />

        </Mafs>
      </div>
    </div>
  );
}
