import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

start_marker = "// Close menu when clicking outside"
start_idx = text.find(start_marker)

if start_idx == -1:
    print("Could not find start marker")
    exit(1)

# Find the end of Home which is before function GKApp
end_idx = text.find("function GKApp({", start_idx)
if end_idx == -1:
    print("Could not find GKApp")
    exit(1)

replacement = """// Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Search term for filtering apps
  const [search, setSearch] = useState('')

  // Filtered lists
  const isSearching = search.trim() !== ''
  const matchFilter = (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.subtitle.toLowerCase().includes(search.toLowerCase())
  const filteredFeatured = isSearching ? featuredApps.filter(matchFilter) : featuredApps
  
  const classFilteredRegular = selectedClass ? regularApps.filter(a => a.classGroup === selectedClass) : regularApps;
  const filteredRegular = isSearching ? classFilteredRegular.filter(matchFilter) : classFilteredRegular;

  const apps = isSearching ? allApps.filter(matchFilter) : allApps

  // Grid layout tracking (for responsive display)
  const gridRef = useRef(null)
  // Number of columns currently displayed (responsive)
  const [cols, setCols] = useState(4)

  // Update grid dimensions on resize (for responsive grid calculation)
  useEffect(() => {
    const updateCols = () => {
      if (!gridRef.current) return
      const style = window.getComputedStyle(gridRef.current)
      const columns = style.getPropertyValue('grid-template-columns').split(' ').length
      setCols(columns)
    }
    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [])

  // Calculate number of rows for display (for grid dimension label at bottom)
  const rows = Math.ceil(apps.length / (cols || 1))

  return (
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
                  className={`menu-card card-color-${app.color || 'blue'}`}
                  onClick={() => onSelect(app.key)}
                >
                  <span className="card-tag">{app.classGroup || ''}</span>
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

new_text = text[:start_idx] + replacement + text[end_idx:]

with open('client/src/App.jsx', 'w') as f:
    f.write(new_text)

print("Restored Home component correctly!")
