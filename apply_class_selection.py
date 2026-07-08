import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# 1. Add import for ClassSelection
if 'import ClassSelection' not in text:
    text = re.sub(r'(import .*?\n)', r'\1import ClassSelection from "./lib/ClassSelection";\n', text, count=1)

# 2. Update App component state
app_state_regex = r'(function App\(\) \{\n\s*const \[currentApp, setCurrentApp\] = useState\(null\))'
app_state_replacement = r"\1\n  const [userClass, setUserClass] = useState(localStorage.getItem('userClass') || null)\n  const [diagnosticState, setDiagnosticState] = useState({})"
text = re.sub(app_state_regex, app_state_replacement, text)

# 3. Intercept render in App component to show ClassSelection
# In App(), look for:
#   if (currentApp) {
#     const AppComp = appMap[currentApp]
#     return <AppComp onBack={() => setCurrentApp(null)} />
#   }
#   return <Home onSelect={setCurrentApp} />

app_render_regex = r'(if \(currentApp\) \{\n\s*const AppComp = appMap\[currentApp\]\n\s*return <AppComp onBack=\{\(\) => setCurrentApp\(null\)\} \/>\n\s*\})'
app_render_replacement = """if (currentApp) {
    if (!diagnosticState[currentApp]) {
      return (
        <DiagnosticQuiz 
          targetTopic={currentApp} 
          onComplete={(score) => {
             const newScore = score || 0;
             let initAdapt = 0.1;
             if (newScore >= 5) initAdapt = 0.8;
             else if (newScore == 4) initAdapt = 0.6;
             else if (newScore == 3) initAdapt = 0.4;
             else if (newScore == 2) initAdapt = 0.2;
             setDiagnosticState(prev => ({...prev, [currentApp]: { passed: true, initialAdaptScore: initAdapt }}));
          }} 
          onBack={() => setCurrentApp(null)} 
        />
      );
    }
    const AppComp = appMap[currentApp]
    return <AppComp onBack={() => setCurrentApp(null)} initialAdaptScore={diagnosticState[currentApp].initialAdaptScore} />
  }
  
  if (!userClass) {
    return <ClassSelection onSelect={(c) => { localStorage.setItem('userClass', c); setUserClass(c); }} />
  }
"""
text = re.sub(app_render_regex, app_render_replacement, text)

# 4. Modify Home component to accept userClass and filter by it
home_sig_regex = r'function Home\(\{ onSelect \}\) \{'
text = re.sub(home_sig_regex, 'function Home({ onSelect, userClass, onResetClass }) {', text)

# Update the render of Home in App to pass userClass and onResetClass
text = text.replace('<Home onSelect={setCurrentApp} />', '<Home onSelect={setCurrentApp} userClass={userClass} onResetClass={() => { localStorage.removeItem("userClass"); setUserClass(null); }} />')

# Filter regularApps based on userClass
# Before: const filteredRegular = isSearching ? regularApps.filter(matchFilter) : regularApps
# We'll replace it to filter by class Group too.
filter_regex = r'(const filteredRegular = isSearching \? regularApps\.filter\(matchFilter\) : regularApps)'
filter_replacement = """
  const classFilteredRegular = userClass === 'All' ? regularApps : regularApps.filter(a => (a.classGroup === userClass || (!a.classGroup && userClass === 'Class 9')));
  const filteredRegular = isSearching ? classFilteredRegular.filter(matchFilter) : classFilteredRegular
"""
text = re.sub(filter_regex, filter_replacement, text)

# Also add a "Change Class" button near the top of Home
hamburger_regex = r'(<div ref={menuRef} style={{ position: \'absolute\', top: \'8px\', right: \'0\' }}>)'
change_class_btn = """<div style={{ position: 'absolute', top: '8px', left: '16px' }}>
          <button onClick={onResetClass} style={{ background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-soft)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer' }}>
            {userClass === 'All' ? 'Browsing All' : userClass} (Change)
          </button>
        </div>\n        """
text = re.sub(hamburger_regex, change_class_btn + r'\1', text)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Applied class selection and diagnostic interception!")
