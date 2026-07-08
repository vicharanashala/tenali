import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Revert the groupedApps render to standard menu-grid
grouped_render = r'''\{Object\.entries\(
          filteredRegular\.reduce\(\(acc, app\) => \{
            const group = app\.classGroup \|\| \'Other\';
            if \(\!acc\[group\]\) acc\[group\] = \[\];
            acc\[group\]\.push\(app\);
            return acc;
          \}, \{\}\)
        \)
        \.sort\(\(a, b\) => \{
          const numA = parseInt\(a\[0\]\.replace\(/\[\^0-9\]/g, \'\'\)\) \|\| 99;
          const numB = parseInt\(b\[0\]\.replace\(/\[\^0-9\]/g, \'\'\)\) \|\| 99;
          return numA - numB;
        \}\)
        \.map\(\(\[group, apps\]\) => \(
          <div key=\{group\} style=\{\{ width: \'100%\', marginBottom: \'24px\' \}\}>
            <h2 style=\{\{ width: \'100%\', borderBottom: \'2px solid var\(--clr-border\)\', paddingBottom: \'8px\', marginBottom: \'16px\', color: \'var\(--clr-text\)\', fontSize: \'1\.25rem\' \}\}>
              \{group\}
            </h2>
            <div className="menu-grid">
              \{apps\.map\(app => \(
                <button key=\{app\.key\} className=\{`menu-card \$\{app\.color\}`\} onClick=\{\(\) => onSelect\(app\.key\)\}>
                  <span className="menu-title">\{app\.name\}</span>
                  <span className="menu-subtitle">\{app\.subtitle\}</span>
                </button>
              \)\)\}
            </div>
          </div>
        \)\)\}'''

standard_render = '''<div className="menu-grid">
          {filteredRegular.map(app => (
            <button key={app.key} className={`menu-card ${app.color}`} onClick={() => onSelect(app.key)}>
              <span className="menu-title">{app.name}</span>
              <span className="menu-subtitle">{app.subtitle}</span>
            </button>
          ))}
        </div>'''

text = re.sub(grouped_render, standard_render, text)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Reverted grouping!")
