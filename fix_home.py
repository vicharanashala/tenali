with open('client/src/App.jsx', 'r') as f:
    text = f.read()

import re

# Find "function Home({ onSelect }) {"
home_start_match = re.search(r'function Home\(\{ onSelect \}\) \{', text)
if not home_start_match:
    print("Could not find Home")
    exit(1)

start_idx = home_start_match.start()

# Find the end of Home (the next function)
next_func_match = re.search(r'\nfunction ', text[start_idx+10:])
if next_func_match:
    end_idx = start_idx + 10 + next_func_match.start()
else:
    # Home is the last function
    end_idx = len(text)

home_content = text[start_idx:end_idx]

# We need to replace the return statement inside Home
return_start = home_content.find('return (')
if return_start == -1:
    return_start = home_content.find('return(')

if return_start != -1:
    # replace the return statement and everything after it within Home
    # The return statement goes until the last closing brace of Home, which is `}` at the end of home_content
    # Let's find the last `}`
    last_brace_idx = home_content.rfind('}')
    if last_brace_idx != -1:
        new_return = """return (
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
    </>
  )
}
"""
        new_home_content = home_content[:return_start] + new_return
        
        # Now replace this block in the full text
        new_text = text[:start_idx] + new_home_content + text[end_idx:]
        
        with open('client/src/App.jsx', 'w') as f:
            f.write(new_text)
            print("Successfully replaced Home return statement!")
    else:
        print("Could not find end of Home")
else:
    print("Could not find return statement in Home")

