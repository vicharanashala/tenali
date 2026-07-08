import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Remove the (Change) button
text = re.sub(r'<div style=\{\{ position: \'absolute\', top: \'8px\', left: \'16px\' \}\}>.*?</button>\n\s*</div>', '', text, flags=re.DOTALL)

# Revert filtering logic
filter_regex = r'const classFilteredRegular = userClass === \'All\'.*?const filteredRegular = isSearching \? classFilteredRegular\.filter\(matchFilter\) : classFilteredRegular'
filter_replacement = 'const filteredRegular = isSearching ? regularApps.filter(matchFilter) : regularApps'
text = re.sub(filter_regex, filter_replacement, text, flags=re.DOTALL)

# Remove userClass from Home signature (already did via sed, but just in case)
text = text.replace('function Home({ onSelect, userClass, onResetClass }) {', 'function Home({ onSelect }) {')

# Revert App render logic
app_render = r'''if \(currentApp\) \{
    if \(!diagnosticState\[currentApp\]\) \{
      return \(
        <DiagnosticQuiz 
          topicKey=\{currentApp\} 
          onPass=\{\(score\) => \{
             const newScore = score || 0;
             let initAdapt = 0\.1;
             if \(newScore >= 5\) initAdapt = 0\.8;
             else if \(newScore == 4\) initAdapt = 0\.6;
             else if \(newScore == 3\) initAdapt = 0\.4;
             else if \(newScore == 2\) initAdapt = 0\.2;
             setDiagnosticState\(prev => \(\{\.\.\.prev, \[currentApp\]: \{ passed: true, initialAdaptScore: initAdapt \}\}\)\);
          \}\}
          onFail=\{\(\) => \{
             setDiagnosticState\(prev => \(\{\.\.\.prev, \[currentApp\]: \{ passed: true, initialAdaptScore: 0\.1 \}\}\)\);
          \}\}
          onSkip=\{\(\) => setCurrentApp\(null\)\}
          onNavigate=\{\(\) => setCurrentApp\(null\)\}
        />
      \);
    \}
    const AppComp = appMap\[currentApp\]
    return <AppComp onBack=\{\(\) => setCurrentApp\(null\)\} initialAdaptScore=\{diagnosticState\[currentApp\]\.initialAdaptScore\} />
  \}
  
  if \(!userClass\) \{
    return <ClassSelection onSelect=\{\(c\) => \{ localStorage\.setItem\('userClass', c\); setUserClass\(c\); \}\} />
  \}'''

app_render_replacement = '''if (currentApp) {
    const AppComp = appMap[currentApp]
    return <AppComp onBack={() => setCurrentApp(null)} initialAdaptScore={0.1} />
  }'''

text = re.sub(app_render, app_render_replacement, text)

# Remove userClass state from App
text = re.sub(r'const \[userClass, setUserClass\] = useState\(localStorage\.getItem\(\'userClass\'\) \|\| null\)\n\s*const \[diagnosticState, setDiagnosticState\] = useState\(\{\}\)', '', text)

# Remove userClass from Home call
text = text.replace('<Home onSelect={setCurrentApp} userClass={userClass} onResetClass={() => { localStorage.removeItem("userClass"); setUserClass(null); }} />', '<Home onSelect={setCurrentApp} />')

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Reverted class selection!")
