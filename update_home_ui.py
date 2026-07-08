with open('client/src/App.jsx', 'r') as f:
    text = f.read()

import re

# Find the button rendering block
old_button = """            <button
              key={`class-${num}`}
              onClick={() => setSelectedClass(`Class ${num}`)}
              style={{
                padding: '32px 24px',
                fontSize: '1.5rem',
                fontWeight: '700',
                borderRadius: '16px',
                border: 'none',
                background: `linear-gradient(135deg, hsl(${num * 30}, 80%, 60%), hsl(${num * 30 + 30}, 80%, 50%))`,
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 12px 20px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'none';
                e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              }}
            >
              Class {num}
            </button>"""

new_button = """            <button
              key={`class-${num}`}
              onClick={() => setSelectedClass(`Class ${num}`)}
              style={{
                padding: '40px 24px',
                fontSize: '1.4rem',
                fontFamily: 'var(--font-display)',
                fontWeight: '600',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--clr-border)',
                background: 'var(--clr-card)',
                color: 'var(--clr-text)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.borderColor = 'var(--clr-accent)';
                e.target.style.background = 'var(--clr-surface)';
                e.target.style.boxShadow = '0 12px 24px rgba(232, 134, 74, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'none';
                e.target.style.borderColor = 'var(--clr-border)';
                e.target.style.background = 'var(--clr-card)';
                e.target.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              Class {num}
            </button>"""

# Need to escape string replacement if there's any tricky indentation, but replace should work
# if we match spaces correctly. Or we can just use re.sub with regex to replace the button.
# Let's do regex matching to be safe against slight indentation differences.

regex_pattern = r"<button\s+key=\{`class-\$\{num\}`\}\s+onClick=\{\(\) => setSelectedClass\(`Class \$\{num\}`\)\}\s+style=\{\{[\s\S]*?\}\s*>\s*Class \{num\}\s*</button>"

import re
new_text = re.sub(regex_pattern, new_button, text)

with open('client/src/App.jsx', 'w') as f:
    f.write(new_text)

print("Updated Class UI!")
