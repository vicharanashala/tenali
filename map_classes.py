import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# We need to map the apps cleanly
# I will find the regularApps and featuredApps array, and replace their classGroup attributes.
# Let's extract them.

featured_apps = ['randommix', 'custom', 'gym']
apps_map = {
    # Class 1
    'addition': 'Class 1',
    'guess': 'Class 1',
    'spot': 'Class 1',
    'vocab': 'Class 1',
    
    # Class 2
    'basicarith': 'Class 2',
    'multiply': 'Class 2',
    'sequences': 'Class 2',
    
    # Class 3
    'fracaddgym': 'Class 3',
    'fractionadd': 'Class 3',
    'decimals': 'Class 3',
    'gymdecimals': 'Class 3',
    
    # Class 4
    'rounding': 'Class 4',
    'tatsavit': 'Class 4',
    'sqrt': 'Class 4',
    
    # Class 5
    'hcflcm': 'Class 5',
    'primefactor': 'Class 5',
    'percent': 'Class 5',
    'ratio': 'Class 5',
    
    # Class 6
    'lineareq': 'Class 6',
    'lineqgym': 'Class 6',
    'angles': 'Class 6',
    'polygons': 'Class 6',
    
    # Class 7
    'triangles': 'Class 7',
    'mensur': 'Class 7',
    'profitloss': 'Class 7',
    'gst': 'Class 7',
    'banking': 'Class 7',
    
    # Class 8
    'stdform': 'Class 8',
    'indices': 'Class 8',
    'indicesgym': 'Class 8',
    'surds': 'Class 8',
    'bases': 'Class 8',
    
    # Class 9
    'polygym': 'Class 9',
    'polyfactor': 'Class 9',
    'polymul': 'Class 9',
    'remfactor': 'Class 9',
    'squaring': 'Class 9',
    'simul': 'Class 9',
    'ineq': 'Class 9',
    
    # Class 10
    'quadratic': 'Class 10',
    'qformula': 'Class 10',
    'lineq': 'Class 10',
    'coordgeom': 'Class 10',
    'section': 'Class 10',
    'pythag': 'Class 10',
    'trig': 'Class 10',
    'invtrig': 'Class 10',
    'circleth': 'Class 10',
    'circmeasure': 'Class 10',
    'congruence': 'Class 10',
    'similarity': 'Class 10',
    'transform': 'Class 10',
    'bearings': 'Class 10',
    
    # Class 11
    'prob': 'Class 11',
    'stats': 'Class 11',
    'sdt': 'Class 11',
    'variation': 'Class 11',
    'sets': 'Class 11',
    'permcomb': 'Class 11',
    'binomial': 'Class 11',
    
    # Class 12
    'complex': 'Class 12',
    'matrix': 'Class 12',
    'vectors': 'Class 12',
    'dotprod': 'Class 12',
    'dotprodgym': 'Class 12',
    'funceval': 'Class 12',
    'funcgym': 'Class 12',
    'limits': 'Class 12',
    'diff': 'Class 12',
    'integ': 'Class 12',
    'diffeq': 'Class 12',
    'conics': 'Class 12',
    'heron': 'Class 12',
    'shares': 'Class 12',
    'linprog': 'Class 12',
    'log': 'Class 12'
}

# Distribute featured apps
apps_map['randommix'] = 'Class 8'
apps_map['custom'] = 'Class 9'
apps_map['gym'] = 'Class 10'

def replace_class_group(match):
    full = match.group(0)
    key = match.group(1)
    if key in apps_map:
        # replace existing classGroup or insert it
        new_class = apps_map[key]
        if "classGroup:" in full:
            full = re.sub(r"classGroup:\s*'[^']+'", f"classGroup: '{new_class}'", full)
        else:
            full = re.sub(r"key:\s*'[^']+',", f"key: '{key}', classGroup: '{new_class}',", full)
    return full

new_text = re.sub(r"\{\s*key:\s*'([^']+)'[^}]+\}", replace_class_group, text)

# Now, implement the Home UI modification.
# We need to change the useState for selectedClass, and the render block.

home_start_regex = r"function Home\(\{ onSelect \}\) \{([\s\S]*?)const \[selectedClass, setSelectedClass\] = useState\(\(\) => \{[\s\S]*?\}\);"
home_start_replacement = r"function Home({ onSelect }) {\1const [selectedClass, setSelectedClass] = useState(null);"

new_text = re.sub(home_start_regex, home_start_replacement, new_text)

# Fix the classFilteredRegular filter
home_filter_regex = r"const classFilteredRegular = [\s\S]*?const filteredRegular = [^\n]*\n"
home_filter_replacement = """const classFilteredRegular = selectedClass ? regularApps.filter(a => a.classGroup === selectedClass) : regularApps;
  const filteredRegular = isSearching ? classFilteredRegular.filter(matchFilter) : classFilteredRegular;\n"""

new_text = re.sub(home_filter_regex, home_filter_replacement, new_text)

# Now replace the return (...) of Home.
home_render_regex = r"return \(\s*<>\s*<div style=\{\{ position: 'relative' \}\}>[\s\S]*?(?=</>\s*\)\s*\}\s*function MasteryProgress)"

home_render_replacement = """return (
    <>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '4px' }}>
          <img src="/tenali.png" alt="Tenali Raman" style={{ width: '80px', height: 'auto', flexShrink: 0 }} />
          <div>
            <h1 style={{ margin: 0 }}>Tenali</h1>
            <p className="subtitle" style={{ margin: 0 }}>{selectedClass ? `${selectedClass} Modules` : 'Choose your Class to begin'}</p>
          </div>
        </div>
      </div>
      
      {!selectedClass ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          padding: '40px 20px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {Array.from({length: 12}, (_, i) => i + 1).map(num => (
            <button
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
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="search-bar-row" style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setSelectedClass(null)}
              style={{
                padding: '12px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--clr-border)',
                background: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: '1rem', flexShrink: 0,
                cursor: 'pointer', outline: 'none', boxShadow: 'var(--shadow-sm)'
              }}
            >
              ← Change Class
            </button>
            <input
              className="search-bar"
              style={{ flex: 1 }}
              type="text"
              placeholder={`Search ${selectedClass} puzzles…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div ref={gridRef} style={{ width: '100%' }}>
            <div className="menu-grid">
              {filteredRegular.map(app => (
                <button
                  key={app.key}
                  className={`menu-card card-color-${app.color}`}
                  onClick={() => onSelect(app.key)}
                >
                  <span className="card-tag">{app.classGroup}</span>
                  <div className="card-content">
                    <h2 className="card-title">{app.name}</h2>
                    <p className="card-desc">{app.subtitle}</p>
                  </div>
                  <div className="card-play-btn">
                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </button>
              ))}
            </div>
            {filteredRegular.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--clr-text-soft)', marginTop: '40px' }}>
                No modules found for {selectedClass}.
              </p>
            )}
            <div className="grid-dimension">{filteredRegular.length} {filteredRegular.length === 1 ? 'module' : 'modules'} • {cols}×{Math.ceil(filteredRegular.length / (cols || 1))} grid</div>
          </div>
        </>
      )}
    """

new_text = re.sub(home_render_regex, home_render_replacement, new_text)

with open('client/src/App.jsx', 'w') as f:
    f.write(new_text)

print("Applied classes mapping and new UI flow!")
