import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

old_render = """      <div className="menu-grid" ref={gridRef}>
        {filteredRegular.map((app) => (
          <button key={app.key} className={`menu-card ${app.color}`} onClick={() => onSelect(app.key)}>
            <span className="menu-title">{app.name}</span>
            <span className="menu-subtitle">{app.subtitle}</span>
          </button>
        ))}
      </div>"""

new_render = """      <div ref={gridRef} style={{ width: '100%' }}>
        {Object.entries(
          filteredRegular.reduce((acc, app) => {
            const group = app.classGroup || 'Other';
            if (!acc[group]) acc[group] = [];
            acc[group].push(app);
            return acc;
          }, {})
        )
        .sort((a, b) => {
          const numA = parseInt(a[0].replace(/[^0-9]/g, '')) || 99;
          const numB = parseInt(b[0].replace(/[^0-9]/g, '')) || 99;
          return numA - numB;
        })
        .map(([group, apps]) => (
          <div key={group} style={{ width: '100%', marginBottom: '24px' }}>
            <h2 style={{ width: '100%', borderBottom: '2px solid var(--clr-border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--clr-text)', fontSize: '1.25rem' }}>
              {group}
            </h2>
            <div className="menu-grid">
              {apps.map(app => (
                <button key={app.key} className={`menu-card ${app.color}`} onClick={() => onSelect(app.key)}>
                  <span className="menu-title">{app.name}</span>
                  <span className="menu-subtitle">{app.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>"""

if old_render in text:
    new_text = text.replace(old_render, new_render)
    with open('client/src/App.jsx', 'w') as f:
        f.write(new_text)
    print("Class groups render injected!")
else:
    print("Could not find the target string!")
