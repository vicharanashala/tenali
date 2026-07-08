import re

with open('src/lib/DiagnosticQuiz.jsx', 'r') as f:
    content = f.read()

# The Frac and format components
fraction_render_code = """
const Frac = ({ n, d, size }) => {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px', verticalAlign: 'middle', fontSize: size || '1em' }}>
      <span style={{ borderBottom: '1px solid var(--clr-text)', padding: '0 2px' }}>{n}</span>
      <span style={{ padding: '0 2px' }}>{d}</span>
    </span>
  )
}

const formatFraction = (n, d) => <Frac n={n} d={d} size="1.2em" />
const formatMixed = (w, n, d) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.2em' }}>
    <span style={{ marginRight: '4px' }}>{w}</span>
    <Frac n={n} d={d} size="1em" />
  </span>
)

function renderDiagnosticQuestion(type, q) {
  if (!q) return null;
  
  if (type === 'fractionadd') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
        {q.mixed ? (
          <>
            {formatMixed(q.w1, q.n1, q.d1)}
            <span style={{ margin: '0 8px' }}>{q.op || '+'}</span>
            {formatMixed(q.w2, q.n2, q.d2)}
            <span style={{ margin: '0 8px' }}>=</span>
          </>
        ) : (
          <>
            {formatFraction(q.n1, q.d1)}
            <span style={{ margin: '0 8px' }}>{q.op || '+'}</span>
            {formatFraction(q.n2, q.d2)}
            <span style={{ margin: '0 8px' }}>=</span>
          </>
        )}
      </div>
    );
  }
  
  // fallback to string formatting
  return getPromptForType(type, q) || q.prompt || q.question || JSON.stringify(q);
}
"""

# Insert fraction_render_code just before DiagnosticScreen component
content = content.replace("export default function DiagnosticScreen", fraction_render_code + "\nexport default function DiagnosticScreen")

# Replace the old render logic in JSX
# old: {getPromptForType(currentQ?.prereqKey, currentQ?.questionData) || currentQ?.questionData?.prompt || currentQ?.questionData?.question || JSON.stringify(currentQ?.questionData)}
# new: {renderDiagnosticQuestion(currentQ?.prereqKey, currentQ?.questionData)}

old_render = "{getPromptForType(currentQ?.prereqKey, currentQ?.questionData) || currentQ?.questionData?.prompt || currentQ?.questionData?.question || JSON.stringify(currentQ?.questionData)}"
new_render = "{renderDiagnosticQuestion(currentQ?.prereqKey, currentQ?.questionData)}"

content = content.replace(old_render, new_render)

with open('src/lib/DiagnosticQuiz.jsx', 'w') as f:
    f.write(content)

print("Updated DiagnosticQuiz.jsx with beautiful rendering!")
