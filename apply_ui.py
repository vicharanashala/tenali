import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# 1. Update App component with diagnostic logic
app_start_regex = r'const \[mode, setMode\] = useState\(null\)'
app_start_replacement = 'const [mode, setMode] = useState(null)\n  const [diagnosticState, setDiagnosticState] = useState({})'
text = re.sub(app_start_regex, app_start_replacement, text)

app_render_regex = r'''\{!mode \? \(
          <Home onSelect=\{setMode\} />
        \) : ActiveApp \? \(
          <ActiveApp onBack=\{\(\) => setMode\(null\)\} />
        \) : \(
          <Home onSelect=\{setMode\} />
        \)\}'''

app_render_replacement = '''{!mode ? (
          <Home onSelect={setMode} />
        ) : ActiveApp ? (
          !diagnosticState[mode] ? (
            <DiagnosticQuiz
              topicKey={mode}
              onPass={(score) => {
                const newScore = score || 0;
                let initAdapt = 0.1;
                if (newScore >= 5) initAdapt = 0.8;
                else if (newScore == 4) initAdapt = 0.6;
                else if (newScore == 3) initAdapt = 0.4;
                else if (newScore == 2) initAdapt = 0.2;
                setDiagnosticState(prev => ({...prev, [mode]: { passed: true, initialAdaptScore: initAdapt }}));
              }}
              onFail={() => {
                setDiagnosticState(prev => ({...prev, [mode]: { passed: true, initialAdaptScore: 0.1 }}));
              }}
              onSkip={() => setMode(null)}
              onNavigate={() => setMode(null)}
            />
          ) : (
            <ActiveApp onBack={() => setMode(null)} initialAdaptScore={diagnosticState[mode].initialAdaptScore} />
          )
        ) : (
          <Home onSelect={setMode} />
        )}'''

text = re.sub(app_render_regex, app_render_replacement, text)


# 2. Update Home component to have class selection dropdown
home_start_regex = r'function Home\(\{ onSelect \}\) \{'
home_start_replacement = '''function Home({ onSelect }) {
  const [selectedClass, setSelectedClass] = useState(() => {
    try { return localStorage.getItem('tenali-class') || 'All'; } catch { return 'All'; }
  });

  const handleClassChange = (e) => {
    const val = e.target.value;
    setSelectedClass(val);
    try { localStorage.setItem('tenali-class', val); } catch {}
  };'''

text = re.sub(home_start_regex, home_start_replacement, text)

home_filter_regex = r'const filteredRegular = isSearching \? regularApps\.filter\(matchFilter\) : regularApps'
home_filter_replacement = '''const classFilteredRegular = selectedClass === 'All' ? regularApps : regularApps.filter(a => a.classGroup === selectedClass || (!a.classGroup && selectedClass === 'Class 9'));
  const filteredRegular = isSearching ? classFilteredRegular.filter(matchFilter) : classFilteredRegular'''

text = re.sub(home_filter_regex, home_filter_replacement, text)

home_search_row_regex = r'<div className="search-bar-row">\s*<input\s*className="search-bar"'
home_search_row_replacement = '''<div className="search-bar-row" style={{ display: 'flex', gap: '12px' }}>
        <select value={selectedClass} onChange={handleClassChange} style={{
          padding: '12px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--clr-border)',
          background: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: '1rem', flexShrink: 0,
          cursor: 'pointer', outline: 'none', boxShadow: 'var(--shadow-sm)'
        }}>
          <option value="All">All Classes</option>
          <option value="Class 5">Class 5</option>
          <option value="Class 6">Class 6</option>
          <option value="Class 7">Class 7</option>
          <option value="Class 8">Class 8</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11">Class 11</option>
          <option value="Class 12">Class 12</option>
        </select>
        <input
          className="search-bar"
          style={{ flex: 1 }}'''

text = re.sub(home_search_row_regex, home_search_row_replacement, text)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Applied UI fixes!")
