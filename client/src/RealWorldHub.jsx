/**
 * REAL-WORLD HUB (Feature CR — Curated Real-World Phenomenon Pathways)
 *
 * A hub screen (Visual Learning Universe style) that presents each real-world
 * phenomenon pathway as its own card. Clicking a card opens that pathway;
 * the pathway's own Back button returns here.
 *
 * EXTENSIBLE BY DESIGN: to add a pathway (GPS, Rockets, …), drop its component
 * file in and add ONE object to the `pathways` array below. No change to
 * App.jsx is needed for new pathways — this file owns the whole hub.
 *
 * Self-contained module: rendered via App.jsx's modeMap under key 'realworld';
 * receives `onBack` (returns to the home grid) and `setMode`, which it forwards
 * to the active pathway so a Road License can open the matching Tenali card.
 */
import { useState } from 'react';
import CarJourneyApp from './CarJourneyApp';

export default function RealWorldHubApp({ onBack, setMode }) {
  const [pathway, setPathway] = useState(null);

  const pathways = [
    {
      key: 'carjourney',
      icon: '🚗',
      name: 'Cars',
      subtitle: 'The Car Journey',
      desc: '16 stops from counting wheels to the equations of the suspension — ages 6–16',
      component: CarJourneyApp,
    },
    // Future pathways are one object each, e.g.
    // { key: 'gps', icon: '📡', name: 'GPS', subtitle: '…', desc: '…', component: GpsJourneyApp },
    // { key: 'rockets', icon: '🚀', name: 'Rockets', subtitle: '…', desc: '…', component: RocketJourneyApp },
  ];

  const active = pathways.find((p) => p.key === pathway);
  if (active) {
    const Pathway = active.component;
    return <Pathway onBack={() => setPathway(null)} setMode={setMode} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px',
            padding: '6px 14px', cursor: 'pointer', color: 'var(--clr-text-soft)',
            fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          }}
          onMouseEnter={(e) => e.currentTarget.style.setProperty('background', 'var(--clr-hover-strong)')}
          onMouseLeave={(e) => e.currentTarget.style.setProperty('background', 'var(--clr-surface)')}
        >
          ← Back
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{
          margin: '0 0 6px', fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)', fontWeight: 700,
          color: 'var(--clr-text)', fontFamily: 'var(--font-display)',
        }}>
          🌍 Real-World
        </h1>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--clr-text-soft)', fontFamily: 'var(--font-body)' }}>
          Math pathways through real phenomena — choose one
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 220px))',
        gap: '16px',
        width: '100%',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        {pathways.map((p) => (
          <button
            key={p.key}
            onClick={() => setPathway(p.key)}
            className="menu-card featured"
            style={{ width: '100%', height: 'auto', minHeight: '128px', padding: '18px 14px', gap: '6px' }}
          >
            <span style={{ fontSize: '2rem' }} aria-hidden="true">{p.icon}</span>
            <span className="menu-title" style={{ fontSize: '1rem' }}>{p.name}</span>
            <span className="menu-subtitle" style={{ color: 'var(--clr-accent)', fontSize: '0.75rem', fontWeight: 600 }}>{p.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
