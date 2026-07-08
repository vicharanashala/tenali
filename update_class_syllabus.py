import re

with open('client/src/App.jsx', 'r') as f:
    content = f.read()

# 1. Update ClassSelectionScreen
class_selection_new = """
function ClassSelectionScreen({ onSelect }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Welcome to Tenali Math!</h1>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '2rem' }}>Which class are you in?</p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
        gap: '1rem', 
        maxWidth: '600px', 
        margin: '0 auto' 
      }}>
        {[...Array(12)].map((_, i) => (
          <button 
            key={i+1} 
            className="submit-btn" 
            onClick={() => onSelect(i + 1)} 
            style={{ fontSize: '1.2rem', padding: '1rem' }}
          >
            Class {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
"""
content = re.sub(
    r'function ClassSelectionScreen.*?\n}', 
    class_selection_new.strip(), 
    content, 
    flags=re.DOTALL
)

# 2. Add CLASS_SYLLABUS map and filter logic in Home
syllabus_map = """
const CLASS_SYLLABUS = {
  1: ['addition', 'basicarith'],
  2: ['addition', 'basicarith', 'multiply'],
  3: ['addition', 'basicarith', 'multiply', 'fractionadd', 'squaring'],
  4: ['addition', 'basicarith', 'multiply', 'fractionadd', 'decimals', 'hcflcm', 'squaring'],
  5: ['fractionadd', 'decimals', 'percent', 'ratio', 'mensur', 'hcflcm', 'squaring', 'sqrt', 'primefactor'],
  6: ['fractionadd', 'decimals', 'percent', 'ratio', 'mensur', 'lineareq', 'angles', 'tatsavit', 'vocab', 'squaring', 'sqrt', 'primefactor'],
  7: ['percent', 'ratio', 'mensur', 'lineareq', 'angles', 'congruence', 'profitloss', 'sdt', 'vocab', 'squaring', 'sqrt'],
  8: ['percent', 'mensur', 'lineareq', 'profitloss', 'sdt', 'indices', 'sqrt', 'polygons', 'polyfactor', 'vocab', 'squaring'],
  9: ['mensur', 'indices', 'polygons', 'polyfactor', 'heron', 'coordgeom', 'prob', 'stats', 'triangles', 'circleth', 'vocab', 'squaring', 'surds', 'stdform'],
  10: ['polyfactor', 'coordgeom', 'prob', 'stats', 'triangles', 'circleth', 'quadratic', 'qformula', 'simul', 'trig', 'section', 'vocab', 'mensur', 'squaring', 'surds', 'stdform'],
  11: ['prob', 'stats', 'trig', 'sets', 'complex', 'ineq', 'permcomb', 'binomial', 'sequences', 'lineq', 'conics', 'limits', 'vocab'],
  12: ['prob', 'trig', 'lineq', 'matrix', 'diff', 'diffeq', 'integ', 'dotprod', 'linprog', 'invtrig', 'vectors', 'vocab', 'remfactor']
};

function Home({ onSelect, studentClass }) {
"""
content = re.sub(r'function Home\(\{\s*onSelect\s*\}\)\s*\{', syllabus_map.strip(), content)

# Inject studentClass into Home props in App
content = re.sub(r'<Home onSelect=\{handleSelectMode\} />', r'<Home onSelect={handleSelectMode} studentClass={studentClass} />', content)

# 3. Filter regularApps in Home
filter_logic = """
  // Filter apps based on student class syllabus
  const allowedTopics = studentClass ? CLASS_SYLLABUS[studentClass] || [] : [];
  const filteredApps = studentClass ? regularApps.filter(app => allowedTopics.includes(app.key)) : regularApps;

  const filteredFeatures = studentClass ? featuredApps.filter(app => {
    if (studentClass <= 2) return app.key === 'custom';
    return true;
  }) : featuredApps;

  const matchSearch = (app) => app.name.toLowerCase().includes(query.toLowerCase()) || app.subtitle.toLowerCase().includes(query.toLowerCase())

  const displayFeatured = filteredFeatures.filter(matchSearch)
  const displayRegular = filteredApps.filter(matchSearch)
"""
# Replace the existing search logic
content = re.sub(
    r'const displayFeatured = featuredApps\.filter.*?const displayRegular = regularApps\.filter.*?\n',
    filter_logic,
    content,
    flags=re.DOTALL
)

with open('client/src/App.jsx', 'w') as f:
    f.write(content)

print("Added class syllabus filter and grid.")
