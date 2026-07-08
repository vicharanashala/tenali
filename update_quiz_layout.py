import re

with open('client/src/App.jsx', 'r') as f:
    text = f.read()

# 1. Update QuizLayout signature and render
old_ql = """function QuizLayout({ title, subtitle, onBack, children, timer }) {
  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Home</button>
        {timer && <div className="timer-pill">{timer.elapsed}s</div>}
      </div>
      <h1>{title}</h1>"""

new_ql = """function QuizLayout({ title, subtitle, onBack, children, timer, adaptScore }) {
  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Home</button>
        {timer && <div className="timer-pill">{timer.elapsed}s</div>}
      </div>
      <MasteryProgress adaptScore={adaptScore} />
      <h1>{title}</h1>"""

text = text.replace(old_ql, new_ql)

# 2. Add adaptScore={typeof adaptScore !== 'undefined' ? adaptScore : undefined} to all <QuizLayout usages
text = re.sub(
    r'<QuizLayout\b(?!.*?adaptScore=)', 
    r'<QuizLayout adaptScore={typeof adaptScore !== "undefined" ? adaptScore : undefined} ', 
    text
)

with open('client/src/App.jsx', 'w') as f:
    f.write(text)

print("Updated QuizLayout successfully!")
