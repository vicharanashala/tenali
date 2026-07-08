import re
import sys

with open('src/App.jsx', 'r') as f:
    content = f.read()

# The MasteryDisplay component
mastery_component = """
function MasteryDisplay({ score }) {
  let label = "Not Started";
  let color = "#888";
  let icon = "⬜";
  if (score >= 0.90) {
    label = "Mastered";
    color = "#FFD700";
    icon = "👑";
  } else if (score >= 0.50) {
    label = "Proficient";
    color = "#A855F7";
    icon = "🟪";
  } else if (score >= 0.15) {
    label = "Familiar";
    color = "#3B82F6";
    icon = "🟦";
  }
  
  const percentage = Math.round(score * 100);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--clr-text-soft)' }}>
        Mastery Level: <span style={{ color }}>{label} {icon}</span>
      </div>
      <div style={{ width: '200px', height: '8px', background: 'var(--clr-border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: color,
          transition: 'width 0.5s ease-out, background-color 0.5s ease-out'
        }} />
      </div>
    </div>
  );
}
"""

if "function MasteryDisplay" not in content:
    # Insert before Home
    content = re.sub(r'function Home\(\{\s*onSelect,\s*studentClass\s*\}\)\s*\{', mastery_component + r'\nfunction Home({ onSelect, studentClass }) {', content)

# Replace the old Concept Mastery text in all apps
# The old text usually looks like: Concept Mastery: {Math.round(adaptScore * 100)}%
# Sometimes wrapped in a div or p tag. We should replace the whole line or just the text.
# Let's replace the whole div that contains it.
# Actually, it's often like: <div style={{...}}>Concept Mastery: {Math.round(adaptScore * 100)}%</div>
# Or it's a span or p.
# Let's use a regex to replace any element containing that exact text.
# E.g. <span style={{...}}>Concept Mastery: {Math.round(adaptScore * 100)}%</span>

pattern = r'<[^>]+>\s*Concept Mastery:\s*\{Math\.round\(adaptScore\s*\*\s*100\)\}%[\s\S]*?</[^>]+>'
replacement = r'<MasteryDisplay score={adaptScore} />'

new_content, count = re.subn(pattern, replacement, content)

print(f"Replaced {count} occurrences of old Concept Mastery.")

with open('src/App.jsx', 'w') as f:
    f.write(new_content)
