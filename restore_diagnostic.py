import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# 1. Add import statement
if 'import DiagnosticQuiz' not in text:
    text = re.sub(r'(import .*?\n)', r'\1import DiagnosticQuiz from "./lib/DiagnosticQuiz";\n', text, count=1)

# 2. Inject into FractionAddApp
diagnostic_state = "  const [hasPassedDiagnostic, setHasPassedDiagnostic] = useState(false)\n"
diagnostic_render = """
  if (!hasPassedDiagnostic) {
    return <DiagnosticQuiz targetTopic="fractionadd" onComplete={() => setHasPassedDiagnostic(true)} onBack={onBack} />
  }

"""

if 'hasPassedDiagnostic' not in text:
    text = re.sub(
        r'(function FractionAddApp\(\{ onBack \}\) \{[\s\S]*?)(const \[difficulty, setDifficulty\] = useState)',
        r'\1' + diagnostic_state + r'\2',
        text
    )
    text = re.sub(
        r'(const curAdaptLevel = adaptiveLevel\(adaptScore\)\n\n  return \()',
        diagnostic_render + r'\1',
        text
    )

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("DiagnosticQuiz restored!")
