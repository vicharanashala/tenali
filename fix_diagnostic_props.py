import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# Replace the DiagnosticQuiz usage with correct props
old_code = """<DiagnosticQuiz 
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
        />"""

new_code = """<DiagnosticQuiz 
          topicKey={currentApp} 
          onPass={(score) => {
             const newScore = score || 0;
             let initAdapt = 0.1;
             if (newScore >= 5) initAdapt = 0.8;
             else if (newScore == 4) initAdapt = 0.6;
             else if (newScore == 3) initAdapt = 0.4;
             else if (newScore == 2) initAdapt = 0.2;
             setDiagnosticState(prev => ({...prev, [currentApp]: { passed: true, initialAdaptScore: initAdapt }}));
          }}
          onFail={() => {
             setDiagnosticState(prev => ({...prev, [currentApp]: { passed: true, initialAdaptScore: 0.1 }}));
          }}
          onSkip={() => setCurrentApp(null)}
          onNavigate={() => setCurrentApp(null)}
        />"""

text = text.replace(old_code, new_code)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Fixed DiagnosticQuiz props!")
