import re

with open('client/src/App.jsx', 'r') as f:
    content = f.read()

# 1. Replace cappedAdaptiveLevel with adaptiveLevel everywhere
content = re.sub(r'cappedAdaptiveLevel\([^,]+,\s*questionNumber\)', r'adaptiveLevel(adaptScoreRef.current)', content)

# 2. Add MasteryBadge component to the top of the file (after imports)
mastery_badge_code = """
function getMasteryLabel(mastery) {
  if (mastery < 0.25) return { label: 'Needs Practice', color: '#ff4d4f' };
  if (mastery < 0.50) return { label: 'Familiar', color: '#faad14' };
  if (mastery < 0.90) return { label: 'Proficient', color: '#52c41a' };
  return { label: 'Mastered', color: '#13c2c2' };
}

function MasteryBadge({ mastery }) {
  const { label, color } = getMasteryLabel(mastery);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '4px 12px', borderRadius: '16px',
      background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}`,
      color: color, fontSize: '0.9rem', fontWeight: 'bold', margin: '8px 0'
    }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color,
        boxShadow: `0 0 8px ${color}`
      }}></span>
      {label}
    </div>
  );
}
"""
content = re.sub(r'(function App\(\) \{)', mastery_badge_code + r'\n\1', content, count=1)

# 3. Replace all `<div className="score-badge">Concept Mastery: {Math.round(adaptivePct(adaptScore))}%</div>` with MasteryBadge
content = re.sub(
    r'<div className="score-badge">\s*Concept Mastery:\s*\{Math\.round\(adaptivePct\(adaptScore\)\)\}\s*%\s*</div>',
    r'<MasteryBadge mastery={adaptScore} />',
    content
)

# Replace any other variants
content = re.sub(
    r'<div className="score-badge">Concept Mastery:.*?</div>',
    r'<MasteryBadge mastery={adaptScore} />',
    content
)

# 4. Replace Session progress: `<div className="score-badge">Session: {Math.round((score / totalQ) * 100)}%</div>` 
# with Question N of M
content = re.sub(
    r'<div className="score-badge">\s*Session:[^<]*</div>',
    r'<div className="score-badge" style={{ background: "rgba(255,255,255,0.1)", border: "none" }}>Question {Math.min(questionNumber, totalQ)} of {totalQ}</div>',
    content
)

with open('client/src/App.jsx', 'w') as f:
    f.write(content)

print("Applied BKT UI and pacing fixes.")
