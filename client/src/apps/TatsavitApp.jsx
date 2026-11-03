import React, { useState, useRef } from 'react'
import { Frac } from '../App.jsx'

const ALGEBRA_TOPICS = [
  { name: 'Exponent Rules', levels: 5, startLevel: 1 },
  { name: 'Fractions & Negative Exponents', levels: 4, startLevel: 6 },
  { name: 'Like Terms', levels: 4, startLevel: 10 }
]

const Sup = ({ base, exp }) => (
  <span>{base}<sup style={{ fontSize: '0.7em' }}>{exp}</sup></span>
)

const jsxKey = (node) => {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return '[' + node.map(jsxKey).join('|') + ']'
  if (typeof node === 'object' && node.props) {
    const typeStr = typeof node.type === 'function'
      ? (node.type.displayName || node.type.name || 'fn')
      : (node.type || 'frag')
    const { children, ...rest } = node.props
    const propsStr = Object.keys(rest).sort()
      .map(k => `${k}:${jsxKey(rest[k])}`).join(',')
    return `<${typeStr}|${propsStr}>${jsxKey(children)}`
  }
  return ''
}

const choicesAllUnique = (choices) => {
  const keys = new Set()
  for (const c of choices) {
    const k = jsxKey(c.jsx)
    if (keys.has(k)) return false
    keys.add(k)
  }
  return true
}

const generateQuestion = (level) => {
  const gen =
    (level >= 1 && level <= 5) ? () => generateExponentQuestion(level)
      : (level >= 6 && level <= 9) ? () => generateNegativeExponentQuestion(level)
        : (level >= 10 && level <= 13) ? () => generateLikeTermsQuestion(level)
          : () => generateExponentQuestion(1)

  // Retry with fresh random parameters until all four choices are distinct.
  // Collisions are rare for most levels but common for a few specific
  // parameter combinations (e.g. m=n=2 in Level 1 makes a^(m+n) = a^(mÂ·n)).
  let q = gen()
  for (let i = 0; i < 100 && q && !choicesAllUnique(q.choices); i++) {
    q = gen()
  }
  // Last-resort safety net: if we somehow still have duplicates, drop them
  // so the user never sees two identical options.
  if (q && !choicesAllUnique(q.choices)) {
    const seen = new Set()
    q.choices = q.choices.filter(c => {
      const k = jsxKey(c.jsx)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }
  return q
}

const generateExponentQuestion = (level) => {
  const topicName = 'Exponent Rules'

  if (level === 1) {
    // Product rule: a^m Â· a^n = a^(m+n)
    const m = 2 + Math.floor(Math.random() * 4)
    const n = 2 + Math.floor(Math.random() * 4)
    const correct = m + n
    const questionJSX = <span><Sup base="a" exp={m} /> Â· <Sup base="a" exp={n} /> = ?</span>
    const distractors = [
      { jsx: <Sup base="a" exp={m * n} />, isCorrect: false }, // multiply instead of add
      { jsx: <Sup base="a" exp={m - n} />, isCorrect: false }, // subtract
      { jsx: <Sup base="a" exp={m} />, isCorrect: false } // first only
    ]
    const choices = [{ jsx: <Sup base="a" exp={correct} />, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 2) {
    // Quotient rule: a^m / a^n = a^(m-n)
    const m = 5 + Math.floor(Math.random() * 4)
    const n = 2 + Math.floor(Math.random() * 3)
    const correct = m - n
    const questionJSX = <span><Frac n={<Sup base="a" exp={m} />} d={<Sup base="a" exp={n} />} /> = ?</span>
    const distractors = [
      { jsx: <Sup base="a" exp={Math.round(m / n)} />, isCorrect: false },
      { jsx: <Sup base="a" exp={m + n} />, isCorrect: false },
      { jsx: <Sup base="a" exp={n} />, isCorrect: false }
    ]
    const choices = [{ jsx: <Sup base="a" exp={correct} />, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 3) {
    // Power rule: (a^m)^n = a^(mÂ·n)
    const m = 2 + Math.floor(Math.random() * 3)
    const n = 2 + Math.floor(Math.random() * 3)
    const correct = m * n
    const questionJSX = <span>(<Sup base="a" exp={m} /><sup style={{ fontSize: '0.7em' }}>)</sup><sup style={{ fontSize: '0.7em' }}>{n}</sup> = ?</span>
    const distractors = [
      { jsx: <Sup base="a" exp={m + n} />, isCorrect: false },
      { jsx: <Sup base="a" exp={m} />, isCorrect: false },
      { jsx: <Sup base="a" exp={m - n} />, isCorrect: false }
    ]
    const choices = [{ jsx: <Sup base="a" exp={correct} />, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 4) {
    // Coefficients: (2a^3)(3a^2) = 6a^5
    const c1 = 2 + Math.floor(Math.random() * 5)
    const c2 = 2 + Math.floor(Math.random() * 5)
    const e1 = 2 + Math.floor(Math.random() * 3)
    const e2 = 2 + Math.floor(Math.random() * 3)
    const correctCoeff = c1 * c2
    const correctExp = e1 + e2
    const questionJSX = <span>({c1}<Sup base="a" exp={e1} />)({c2}<Sup base="a" exp={e2} />) = ?</span>
    const distractors = [
      { jsx: <span>{c1 + c2}<Sup base="a" exp={correctExp} /></span>, isCorrect: false },
      { jsx: <span>{correctCoeff}<Sup base="a" exp={e1 * e2} /></span>, isCorrect: false },
      { jsx: <span>{correctCoeff}<Sup base="a" exp={e1 + e2 + 1} /></span>, isCorrect: false }
    ]
    const choices = [{ jsx: <span>{correctCoeff}<Sup base="a" exp={correctExp} /></span>, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 5) {
    // Combined: (a^4 Â· a^3) / a^2 = a^5
    const a = 2 + Math.floor(Math.random() * 3)
    const b = 2 + Math.floor(Math.random() * 3)
    const c = 1 + Math.floor(Math.random() * 2)
    const correct = a + b - c
    const questionJSX = <span><Frac n={<span><Sup base="a" exp={a} /> Â· <Sup base="a" exp={b} /></span>} d={<Sup base="a" exp={c} />} /> = ?</span>
    const distractors = [
      { jsx: <Sup base="a" exp={a + b} />, isCorrect: false },
      { jsx: <Sup base="a" exp={a + b + c} />, isCorrect: false },
      { jsx: <Sup base="a" exp={(a + b) * c} />, isCorrect: false }
    ]
    const choices = [{ jsx: <Sup base="a" exp={correct} />, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }
}

const generateNegativeExponentQuestion = (level) => {
  const topicName = 'Fractions & Negative Exponents'

  if (level === 6) {
    // a^-n = 1/a^n
    const n = 2 + Math.floor(Math.random() * 3)
    const questionJSX = <span><Sup base="a" exp={-n} /> = ?</span>
    const distractors = [
      { jsx: <span>-<Sup base="a" exp={n} /></span>, isCorrect: false },
      { jsx: <Sup base="a" exp={n} />, isCorrect: false },
      { jsx: <Frac n={<span>-1</span>} d={<Sup base="a" exp={n} />} />, isCorrect: false }
    ]
    const correct = <Frac n={<span>1</span>} d={<Sup base="a" exp={n} />} />
    const choices = [{ jsx: correct, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 7) {
    // (p/q)^-exp = (q/p)^exp = q^exp / p^exp
    const p = 2 + Math.floor(Math.random() * 4)
    let q = 2 + Math.floor(Math.random() * 4)
    if (q === p) q = p + 1 // avoid p/p
    const exp = 2
    const numResult = Math.pow(q, exp)
    const denResult = Math.pow(p, exp)
    const questionJSX = <span>(<Frac n={p} d={q} />)<sup style={{ fontSize: '0.7em' }}>â»{exp}</sup> = ?</span>
    const distractors = [
      { jsx: <Frac n={Math.pow(p, exp)} d={Math.pow(q, exp)} />, isCorrect: false },
      { jsx: <Frac n={p * exp} d={q * exp} />, isCorrect: false },
      { jsx: <span>-<Frac n={numResult} d={denResult} /></span>, isCorrect: false }
    ]
    const choices = [{ jsx: <Frac n={numResult} d={denResult} />, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 8) {
    // a^-3 Â· a^5 = a^2
    const m = 2 + Math.floor(Math.random() * 3)
    const n = 3 + Math.floor(Math.random() * 4)
    const correct = n - m
    const questionJSX = <span><Sup base="a" exp={-m} /> Â· <Sup base="a" exp={n} /> = ?</span>
    const distractors = [
      { jsx: <Sup base="a" exp={n} />, isCorrect: false },
      { jsx: <Sup base="a" exp={-m} />, isCorrect: false },
      { jsx: <Sup base="a" exp={m + n} />, isCorrect: false }
    ]
    const choices = [{ jsx: <Sup base="a" exp={correct} />, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 9) {
    // (x^-2 y^3)^2 = y^6 / x^4  (equivalently x^-4 y^6 â€” so that form must NOT appear as a distractor)
    const exp = 2
    const questionJSX = <span>(<Sup base="x" exp={-2} /><Sup base="y" exp={3} /><sup style={{ fontSize: '0.7em' }}>)</sup><sup style={{ fontSize: '0.7em' }}>{exp}</sup> = ?</span>
    const distractors = [
      // Common error: applied outer exponent only to y, left x^-2 alone
      { jsx: <span><Sup base="x" exp={-2} /><Sup base="y" exp={6} /></span>, isCorrect: false },
      // Error: forgot to double the x exponent (kept x^2 in the denominator)
      { jsx: <Frac n={<Sup base="y" exp={6} />} d={<Sup base="x" exp={2} />} />, isCorrect: false },
      // Error: flipped the fraction the wrong way
      { jsx: <Frac n={<Sup base="x" exp={4} />} d={<Sup base="y" exp={6} />} />, isCorrect: false }
    ]
    const choices = [{ jsx: <Frac n={<Sup base="y" exp={6} />} d={<Sup base="x" exp={4} />} />, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }
}

const generateLikeTermsQuestion = (level) => {
  const topicName = 'Like Terms'

  if (level === 10) {
    // 3x + 5x = 8x
    const c1 = 2 + Math.floor(Math.random() * 7)
    const c2 = 2 + Math.floor(Math.random() * 7)
    const correct = c1 + c2
    const questionJSX = <span>{c1}x + {c2}x = ?</span>
    const distractors = [
      { jsx: <span>{c1 + c2}x<sup style={{ fontSize: '0.7em' }}>2</sup></span>, isCorrect: false },
      { jsx: <span>{c1 * c2}x</span>, isCorrect: false },
      { jsx: <span>{c1}x</span>, isCorrect: false }
    ]
    const choices = [{ jsx: <span>{correct}x</span>, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 11) {
    // 7a^2 - 3a^2 = 4a^2
    const c1 = 5 + Math.floor(Math.random() * 5)
    const c2 = 2 + Math.floor(Math.random() * Math.min(4, c1 - 1))
    const correct = c1 - c2
    const exp = 2
    const questionJSX = <span>{c1}<Sup base="a" exp={exp} /> - {c2}<Sup base="a" exp={exp} /> = ?</span>
    const distractors = [
      { jsx: <span>{correct}<Sup base="a" exp={exp * 2} /></span>, isCorrect: false },
      { jsx: <span>{c1 - c2}a</span>, isCorrect: false },
      { jsx: <span>{c1}a</span>, isCorrect: false }
    ]
    const choices = [{ jsx: <span>{correct}<Sup base="a" exp={exp} /></span>, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 12) {
    // 2ab + 5ab - ab = 6ab
    const c1 = 1 + Math.floor(Math.random() * 4)
    const c2 = 3 + Math.floor(Math.random() * 5)
    const c3 = 1 + Math.floor(Math.random() * 3)
    const correct = c1 + c2 - c3
    const questionJSX = <span>{c1}ab + {c2}ab - {c3}ab = ?</span>
    const distractors = [
      { jsx: <span>{c1 + c2 + c3}ab</span>, isCorrect: false },
      { jsx: <span>{c1 + c2}ab</span>, isCorrect: false },
      { jsx: <span>{c1 * c2 * c3}ab</span>, isCorrect: false }
    ]
    const choices = [{ jsx: <span>{correct}ab</span>, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }

  if (level === 13) {
    // 3x^2y + 2xy^2 - x^2y = 2x^2y + 2xy^2
    const c1 = 2 + Math.floor(Math.random() * 3)
    const c2 = 1 + Math.floor(Math.random() * 3)
    const c3 = 1 + Math.floor(Math.random() * Math.min(c1, 3))
    const correctC1 = c1 - c3
    const questionJSX = <span>{c1}x<sup style={{ fontSize: '0.7em' }}>2</sup>y + {c2}xy<sup style={{ fontSize: '0.7em' }}>2</sup> - {c3}x<sup style={{ fontSize: '0.7em' }}>2</sup>y = ?</span>
    const distractors = [
      { jsx: <span>{c1 - c3 + c2}xy</span>, isCorrect: false },
      { jsx: <span>{c1 + c2 - c3}x<sup style={{ fontSize: '0.7em' }}>2</sup>y<sup style={{ fontSize: '0.7em' }}>2</sup></span>, isCorrect: false },
      { jsx: <span>{c1}x<sup style={{ fontSize: '0.7em' }}>2</sup>y - {c2}xy<sup style={{ fontSize: '0.7em' }}>2</sup></span>, isCorrect: false }
    ]
    const correctJSX = <span>{correctC1}x<sup style={{ fontSize: '0.7em' }}>2</sup>y + {c2}xy<sup style={{ fontSize: '0.7em' }}>2</sup></span>
    const choices = [{ jsx: correctJSX, isCorrect: true }, ...distractors].sort(() => Math.random() - 0.5)
    return { questionJSX, choices, levelName: `${topicName} - Level ${level}` }
  }
}


export default function TatsavitApp({ onBack }) {
  const [homeScreen, setHomeScreen] = useState(true)
  const [drillingScreen, setDrillingScreen] = useState(false)
  const [summaryScreen, setSummaryScreen] = useState(false)

  const [level, setLevel] = useState(1)
  const [maxLevelReached, setMaxLevelReached] = useState(1)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [questionsAnswered, setQuestionsAnswered] = useState([])
  const [feedback, setFeedback] = useState('')

  const startDrill = () => {
    setHomeScreen(false)
    setDrillingScreen(true)
    setSummaryScreen(false)
    setLevel(1)
levelRef.current = 1
setMaxLevelReached(1)
    setStreak(0); streakRef.current = 0
    setScore(0)
    setQuestionsAnswered([])
    // Generate L1 question directly (level state not yet updated)
    const q = generateQuestion(1)
    setCurrentQuestion(q)
    setRevealed(false)
    setSelectedChoice(null)
    setFeedback('')
  }

  const levelRef = useRef(1)
  const streakRef = useRef(0)

  const handleChoiceClick = (choiceIdx) => {
    if (revealed) return
    const choice = currentQuestion.choices[choiceIdx]
    setSelectedChoice(choiceIdx)
    setRevealed(true)
    if (choice.isCorrect) {
      setScore(s => s + 1)
      streakRef.current += 1
      setStreak(streakRef.current)
      setFeedback('Correct!')
      setQuestionsAnswered(prev => [...prev, { levelName: currentQuestion.levelName, userChoice: choiceIdx, correct: true }])
      if (streakRef.current >= 3 && levelRef.current < 13) {
        setTimeout(() => {
          streakRef.current = 0
          setStreak(0)
         levelRef.current = levelRef.current + 1
setLevel(levelRef.current)
setMaxLevelReached(previous => Math.max(previous, levelRef.current))
          const q = generateQuestion(levelRef.current)
          setCurrentQuestion(q); setRevealed(false); setSelectedChoice(null); setFeedback('')
        }, 1200)
      } else {
        setTimeout(() => {
          const q = generateQuestion(levelRef.current)
          setCurrentQuestion(q); setRevealed(false); setSelectedChoice(null); setFeedback('')
        }, 1200)
      }
    } else {
      setFeedback('Incorrect')
      streakRef.current = 0
      setStreak(0)
      setTimeout(() => {
        if (levelRef.current > 1) {
          levelRef.current = levelRef.current - 1
          setLevel(levelRef.current)
        }
        const q = generateQuestion(levelRef.current)
        setCurrentQuestion(q); setRevealed(false); setSelectedChoice(null); setFeedback('')
      }, 1200)
    }
  }

  const goToSummary = () => {
    setDrillingScreen(false)
    setSummaryScreen(true)
    setHomeScreen(false)
  }

  const goHome = () => {
    setHomeScreen(true)
    setDrillingScreen(false)
    setSummaryScreen(false)
  }



  const baseStyles = {
    container: {
      maxWidth: '620px',
      margin: '0 auto',
      padding: '20px',
      background: 'var(--clr-bg)',
      color: 'var(--clr-text)',
      fontFamily: 'var(--font-body)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    card: {
      background: 'var(--clr-card)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      marginBottom: '16px',
      boxShadow: 'var(--shadow-card)',
      textAlign: 'center'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 600,
      fontFamily: 'var(--font-display)',
      marginBottom: '8px',
      color: 'var(--clr-accent)'
    },
    subtitle: {
      fontSize: '0.95rem',
      color: 'var(--clr-text-soft)',
      marginBottom: '16px',
      lineHeight: 1.5
    },
    button: {
      padding: '12px 24px',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--clr-accent)',
      color: '#fff',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'var(--transition)',
      marginBottom: '8px'
    },
    buttonSecondary: {
      padding: '12px 24px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--clr-accent)',
      background: 'transparent',
      color: 'var(--clr-accent)',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'var(--transition)',
      marginRight: '8px'
    },
    buttonRow: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      marginTop: '20px',
      flexWrap: 'wrap'
    },
    questionBox: {
      background: 'var(--clr-surface)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      marginBottom: '20px',
      fontSize: '1.6rem',
      fontWeight: 600,
      lineHeight: 1.8,
      color: 'var(--clr-text)'
    },
    choiceButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      margin: '8px 0',
      borderRadius: 'var(--radius-sm)',
      border: '2px solid var(--clr-border)',
      background: 'var(--clr-input)',
      fontSize: '1.1rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'var(--transition)',
      minHeight: '56px'
    },
    progressPill: {
      display: 'inline-block',
      padding: '8px 16px',
      borderRadius: '20px',
      background: 'var(--clr-surface)',
      color: 'var(--clr-text)',
      fontSize: '0.9rem',
      fontWeight: 500,
      marginRight: '8px',
      marginBottom: '8px',
      border: '1px solid var(--clr-border)'
    }
  }

  // â”€â”€â”€ Home Screen â”€â”€â”€
  if (homeScreen && !drillingScreen && !summaryScreen) {
    return (
      <div style={baseStyles.container}>
        <button onClick={onBack} style={{ ...baseStyles.buttonSecondary, alignSelf: 'flex-start', marginBottom: '16px' }}>â† Home</button>
        <div style={baseStyles.card}>
          <h1 style={baseStyles.title}>Tatsavit</h1>
          <p style={baseStyles.subtitle}>Algebra Simplification Drill</p>
          <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', marginBottom: '16px', lineHeight: 1.6 }}>
            Master algebra step by step. Starting with exponent rules, moving to fractions and negative exponents, and ending with combining like terms.
          </p>
          <div style={{ textAlign: 'left', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
            <strong style={{ color: 'var(--clr-accent)' }}>How it works:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Start at Level 1</li>
              <li>3 correct answers in a row â†’ advance to next level</li>
              <li>Wrong answer â†’ drop back one level (minimum Level 1)</li>
              <li>13 levels total across 3 topics</li>
            </ul>
          </div>
          <div style={baseStyles.buttonRow}>
            <button onClick={startDrill} style={baseStyles.button}>Start Drill</button>
          </div>
        </div>
      </div>
    )
  }

  // â”€â”€â”€ Drilling Screen â”€â”€â”€
  if (drillingScreen && !homeScreen && !summaryScreen) {
    const levelInfo = (() => {
      if (level >= 1 && level <= 5) return 'Exponent Rules'
      if (level >= 6 && level <= 9) return 'Fractions & Negative Exponents'
      if (level >= 10 && level <= 13) return 'Like Terms'
      return 'Algebra'
    })()

    const choiceLetters = ['A', 'B', 'C', 'D']

    return (
      <div style={baseStyles.container}>
        <button onClick={onBack} style={{ ...baseStyles.buttonSecondary, alignSelf: 'flex-start', marginBottom: '16px' }}>â† Home</button>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={baseStyles.progressPill}>Level {level}</div>
          <div style={baseStyles.progressPill}>{levelInfo}</div>
          <div style={{ ...baseStyles.progressPill, background: 'var(--clr-accent)', color: '#fff', border: 'none' }}>Streak: {streak}</div>
        </div>

        {currentQuestion && (
          <>
            <div style={baseStyles.questionBox}>
              {currentQuestion.questionJSX}
            </div>

            <div>
              {currentQuestion.choices.map((choice, idx) => {
                let choiceStyle = { ...baseStyles.choiceButton }
                if (selectedChoice === idx && revealed) {
                  if (choice.isCorrect) {
                    choiceStyle.background = 'var(--clr-correct-bg)'
                    choiceStyle.borderColor = 'var(--clr-correct)'
                    choiceStyle.color = 'var(--clr-correct)'
                  } else {
                    choiceStyle.background = 'var(--clr-wrong-bg)'
                    choiceStyle.borderColor = 'var(--clr-wrong)'
                    choiceStyle.color = 'var(--clr-wrong)'
                  }
                }
                return (
                  <button
                    key={idx}
                    style={choiceStyle}
                    onClick={() => handleChoiceClick(idx)}
                    disabled={revealed}
                  >
                    <span style={{ marginRight: '12px', fontWeight: 700, fontSize: '1.2rem' }}>{choiceLetters[idx]}:</span>
                    <span>{choice.jsx}</span>
                  </button>
                )
              })}
            </div>

            {revealed && feedback && (
              <div style={{ textAlign: 'center', marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-sm)', background: selectedChoice >= 0 && currentQuestion.choices[selectedChoice].isCorrect ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)', color: selectedChoice >= 0 && currentQuestion.choices[selectedChoice].isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)', fontSize: '1rem', fontWeight: 500 }}>
                {feedback}
              </div>
            )}
          </>
        )}

        <div style={baseStyles.buttonRow}>
          <button onClick={goToSummary} style={{ ...baseStyles.buttonSecondary, marginRight: 0 }}>Finish Drill</button>
        </div>
      </div>
    )
  }

  // â”€â”€â”€ Summary Screen â”€â”€â”€
  if (summaryScreen && !homeScreen && !drillingScreen) {
    return (
      <div style={baseStyles.container}>
        <button onClick={onBack} style={{ ...baseStyles.buttonSecondary, alignSelf: 'flex-start', marginBottom: '16px' }}>â† Home</button>
        <div style={baseStyles.card}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Drill Complete!</h2>
          <p style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--clr-accent)', marginBottom: '8px' }}>Score: {score}</p>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', marginBottom: '16px' }}>
            Highest level reached: <strong style={{ color: 'var(--clr-accent)' }}>Level {maxLevelReached}</strong>
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '20px', lineHeight: 1.6 }}>
            You answered {questionsAnswered.length} question{questionsAnswered.length !== 1 ? 's' : ''}. Keep practicing to master all topics!
          </p>
          <div style={baseStyles.buttonRow}>
            <button onClick={startDrill} style={baseStyles.button}>Try Again</button>
            <button onClick={goHome} style={{ ...baseStyles.button, background: 'var(--clr-text-soft)' }}>Back to Home</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
