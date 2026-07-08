import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Check if MasteryProgress already exists
if "function MasteryProgress" not in text:
    mastery_component = """
function MasteryProgress({ adaptScore }) {
  if (adaptScore === undefined || adaptScore === null) return null;
  const pct = Math.min(100, Math.max(0, Math.round(adaptScore * 100)));
  const label = pct >= 85 ? 'Mastered' : pct >= 40 ? 'Proficient' : 'Familiar';
  const color = pct >= 85 ? '#9333ea' : pct >= 40 ? '#2563eb' : '#64748b';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem', width: '80px' }}>Mastery:</div>
      <div style={{ flex: 1, background: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', transition: 'width 0.5s ease-out' }} />
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color, minWidth: '100px', textAlign: 'right' }}>
        {pct}% <span style={{fontSize: '0.75rem', opacity: 0.8}}>({label})</span>
      </div>
    </div>
  )
}

"""
    # Insert it right before "function Home("
    text = text.replace("function Home(", mastery_component + "function Home(")
    
with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Added MasteryProgress component.")
