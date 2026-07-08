import React from 'react'

export default function ClassSelection({ onSelect }) {
  const classes = [
    'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <img src="/tenali.png" alt="Tenali Raman" style={{ width: '120px', height: 'auto', marginBottom: '20px' }} />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'var(--clr-text)' }}>Welcome to Tenali</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--clr-text-soft)', marginBottom: '40px' }}>What class are you in?</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        {classes.map(c => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            style={{
              padding: '24px 16px',
              fontSize: '1.2rem',
              fontWeight: '600',
              borderRadius: '12px',
              border: '2px solid var(--clr-border)',
              background: 'var(--clr-card)',
              color: 'var(--clr-text)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = 'var(--clr-accent)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = 'var(--clr-border)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '40px' }}>
        <button 
          onClick={() => onSelect('All')}
          style={{ background: 'none', border: 'none', color: 'var(--clr-accent)', cursor: 'pointer', fontSize: '1rem', textDecoration: 'underline' }}
        >
          I'm just browsing (Show All)
        </button>
      </div>
    </div>
  )
}
