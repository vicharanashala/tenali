import { useState } from 'react';

const createParticles = () => {
        // Restricted to brown, orange, gold, copper, bronze, and cream colors to fit the theme
        const colors = ['#e8864a', '#ff9800', '#ffb300', '#d27c3c', '#a16738', '#ffd54f', '#ede8e3', '#795548', '#b57c50'];
        const shapes = ['50%', '0%']; // circles or squares
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            color: colors[Math.floor(Math.random() * colors.length)],
            radius: shapes[Math.floor(Math.random() * shapes.length)],
            duration: `${2 + Math.random() * 2.5}s`,
            delay: `${Math.random() * 1.5}s`,
            size: `${6 + Math.random() * 8}px`,
            transform: `rotate(${Math.random() * 360}deg)`
        }));
    }

function Confetti() {
    const [particles] = useState(createParticles);

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99, overflow: 'hidden' }}>
            {particles.map(p => (
                <div
                key={p.id}
                className="confetti-particle"
                style={{
                    left: p.left,
                    '--confetti-color': p.color,
                    '--confetti-radius': p.radius,
                    '--confetti-duration': p.duration,
                    backgroundColor: p.color,
                    borderRadius: p.radius,
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                    transform: p.transform,
                    position: 'absolute',
                }}
                />
            ))}
            </div>
        </div>
    );
}

export default Confetti
