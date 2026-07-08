import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

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
    text = text.replace("function Home(", mastery_component + "function Home(")

# Now we find components with adaptScore.
# We will use regex to find `function AppName(...) { ... const [adaptScore ... <h1`
# Because `.*?` might cross components if `adaptScore` is not followed by `<h1`, we'll limit the search to ~3000 chars.

def replacer(match):
    prefix = match.group(1) # Everything from `function` to just before `<h1`
    h1 = match.group(2)     # `<h1`
    
    # Don't inject if it's already there
    if "<MasteryProgress" in prefix:
        return match.group(0)
    
    # Inject it right before `<h1`
    # We grab the indentation of `<h1`
    last_newline = prefix.rfind('\n')
    indent = prefix[last_newline+1:] if last_newline != -1 else ""
    return prefix + f"<MasteryProgress adaptScore={{adaptScore}} />\n{indent}" + h1

# Find functions that declare adaptScore, and have an h1 inside.
# regex: (function [A-Z][a-zA-Z0-9]+App.*?adaptScore.*?)(<h1)
# We need to make sure we don't jump to the next function.
# So we make sure there's no `function [A-Z]` between adaptScore and `<h1`.
pattern = re.compile(r'(function (?:[A-Z][a-zA-Z0-9]+|make[a-zA-Z]+)App\b(?:(?!\bfunction \b).)*?adaptScore(?:(?!\bfunction \b).)*?)(<h1)', re.DOTALL)

new_text = pattern.sub(replacer, text)

# Now, we also need to inject BKT logic into apps that DON'T have it!
# For this, I will run a separate Node script or just focus on the 50 apps that DO have it for now.
# Because injecting full BKT logic via Regex is highly error prone.

with open('client/src/App.jsx', 'w') as f:
    f.write(new_text)

print("Injected MasteryProgress!")
