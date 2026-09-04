import { useState, useEffect, useRef, useCallback } from 'react'

const API = import.meta.env?.VITE_API_BASE_URL || ''

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', desc: '30–35 blanks', color: '#5cb87a' },
  { key: 'medium', label: 'Medium', desc: '40–45 blanks', color: '#e8b931' },
  { key: 'hard', label: 'Hard', desc: '50–55 blanks', color: '#f7768e' },
  { key: 'extrahard', label: 'Expert', desc: '56–60 blanks', color: '#bb5af5' },
]

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function SudokuApp({ onBack }) {
  const [phase, setPhase] = useState('setup')
  const [difficulty, setDifficulty] = useState('easy')
  const [puzzle, setPuzzle] = useState(null)
  const [solution, setSolution] = useState(null)
  const [grid, setGrid] = useState([])
  const [initial, setInitial] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedNum, setSelectedNum] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [maxMistakes] = useState(5)
  const [hints, setHints] = useState(3)
  const [timer, setTimer] = useState(0)
  const [solved, setSolved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [highlights, setHighlights] = useState({ row: -1, col: -1, num: 0 })
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'playing' && !solved) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, solved])

  const loadPuzzle = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/sudoku-api/question?difficulty=${difficulty}`)
      if (!r.ok) throw new Error(`Server error ${r.status}`)
      const data = await r.json()
      setPuzzle(data.grid)
      setSolution(data.solution)
      setGrid(data.grid.map(r => [...r]))
      setInitial(data.grid.map(r => r.map(v => v !== 0)))
      setSelected(null); setSelectedNum(null)
      setMistakes(0); setHints(3); setTimer(0); setSolved(false)
      setPhase('playing')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }, [difficulty])

  const formatTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleCellClick = (r, c) => {
    if (initial[r][c] || solved) return
    setSelected([r, c])
    setSelectedNum(null)
    updateHighlights(r, c, 0)
  }

  const updateHighlights = (r, c, num) => {
    setHighlights({ row: r, col: c, num: num || grid[r]?.[c] || 0 })
  }

  const placeNumber = (num) => {
    if (!selected || solved) return
    const [r, c] = selected
    if (initial[r][c]) return
    const newGrid = grid.map(row => [...row])
    const prev = newGrid[r][c]
    newGrid[r][c] = num
    setGrid(newGrid)
    if (num !== 0 && solution && num !== solution[r][c]) {
      setMistakes(m => m + 1)
    }
    setSelectedNum(num)
    updateHighlights(r, c, num)
    checkSolved(newGrid)
  }

  const useHint = () => {
    if (hints <= 0 || solved || !solution) return
    const emptyCells = []
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!initial[r][c] && grid[r][c] !== solution[r][c]) emptyCells.push([r, c])
    if (!emptyCells.length) return
    const [r, c] = pickRandom(emptyCells)
    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = solution[r][c]
    setGrid(newGrid)
    setInitial(prev => { const n = prev.map(row => [...row]); n[r][c] = true; return n })
    setHints(h => h - 1)
    checkSolved(newGrid)
  }

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const checkSolved = (g) => {
    if (!solution) return
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (g[r][c] !== solution[r][c]) return
    setSolved(true)
    clearInterval(timerRef.current)
  }

  const getCellClass = (r, c) => {
    const isInitial = initial[r][c]
    const isSelected = selected && selected[0] === r && selected[1] === c
    const sameRow = selected && selected[0] === r
    const sameCol = selected && selected[1] === c
    const sameBox = selected && Math.floor(selected[0] / 3) === Math.floor(r / 3) && Math.floor(selected[1] / 3) === Math.floor(c / 3)
    const sameNum = highlights.num && grid[r][c] === highlights.num && highlights.num !== 0
    const isError = !isInitial && grid[r][c] !== 0 && solution && grid[r][c] !== solution[r][c]
    const thickRight = c % 3 === 2 && c < 8
    const thickBottom = r % 3 === 2 && r < 8
    return {
      background: isSelected ? 'var(--clr-accent)' : isError ? 'rgba(247,118,142,0.25)' : sameNum ? 'rgba(122,162,247,0.2)' : (sameRow || sameCol || sameBox) ? 'rgba(122,162,247,0.1)' : 'var(--clr-surface)',
      color: isInitial ? 'var(--clr-text)' : isError ? '#f7768e' : 'var(--clr-accent)',
      fontWeight: isInitial ? 700 : 400,
      borderRight: thickRight ? '2px solid var(--clr-text)' : '1px solid var(--clr-border)',
      borderBottom: thickBottom ? '2px solid var(--clr-text)' : '1px solid var(--clr-border)',
      cursor: isInitial || solved ? 'default' : 'pointer',
    }
  }

  const countFilled = () => {
    let n = 0
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (grid[r][c] !== 0) n++
    return n
  }

  if (phase === 'setup') return (
    <div className="app-shell">
      <div className="card is-wide" style={{ padding: '28px 24px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <button className="back-button" onClick={onBack}>&#8592; Back</button>
          <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)' }}>&#129518; Sudoku</h1>
          <div style={{ width: 70 }} />
        </div>
        <p style={{ textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '0.85rem', marginTop: 0, marginBottom: 16 }}>
          Fill every row, column &amp; 3&#215;3 box with digits 1–9
        </p>

        {error && <div style={{ background: 'rgba(247,118,142,0.1)', border: '1px solid rgba(247,118,142,0.3)', color: '#f7768e', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem' }}>{error}</div>}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Difficulty</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 5 }}>
            {DIFFICULTIES.map(d => (
              <button key={d.key} onClick={() => setDifficulty(d.key)} style={{
                padding: '10px 8px', borderRadius: 'var(--radius)', border: difficulty === d.key ? `2px solid ${d.color}` : '1px solid var(--clr-border)',
                background: difficulty === d.key ? `${d.color}18` : 'var(--clr-surface)',
                color: 'var(--clr-text)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)' }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={loadPuzzle} disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
          background: loading ? 'var(--clr-border)' : '#1abc9c', color: '#fff', fontWeight: 700,
          fontSize: '0.95rem', cursor: loading ? 'default' : 'pointer',
        }}>{loading ? 'Generating...' : 'New Puzzle'}</button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="card is-wide" style={{ padding: '16px 12px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <button className="back-button" onClick={() => { clearInterval(timerRef.current); setPhase('setup') }} style={{ fontSize: '0.8rem' }}>&#8592; Menu</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
            {DIFFICULTIES.find(d => d.key === difficulty)?.label}
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(timer)}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.78rem' }}>
          <span style={{ color: mistakes >= maxMistakes ? '#f7768e' : 'var(--clr-text-soft)' }}>
            &#10060; {mistakes}/{maxMistakes}
          </span>
          <span style={{ color: 'var(--clr-text-soft)' }}>
            &#128161; {hints} hints
          </span>
          <span style={{ color: 'var(--clr-text-soft)' }}>
            {countFilled()}/81 filled
          </span>
        </div>

        {solved && (
          <div style={{ background: 'rgba(92,184,122,0.12)', border: '1px solid rgba(92,184,122,0.3)', color: '#5cb87a', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
            &#127881; Solved in {formatTime(timer)}! {mistakes === 0 ? 'Perfect!' : `${mistakes} mistake${mistakes > 1 ? 's' : ''}`}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 0, border: '2px solid var(--clr-text)', borderRadius: 4, overflow: 'hidden', marginBottom: 10, aspectRatio: '1' }}>
          {grid.map((row, r) => row.map((val, c) => (
            <div key={`${r}-${c}`} onClick={() => handleCellClick(r, c)} style={{
              ...getCellClass(r, c),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              aspectRatio: '1', fontSize: 'clamp(0.85rem, 2.5vw, 1.3rem)', fontFamily: 'monospace',
            }}>{val !== 0 ? val : ''}</div>
          )))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4, marginBottom: 8 }}>
          {NUMBERS.map(n => {
            const count = grid.flat().filter(v => v === n).length
            return (
              <button key={n} onClick={() => { if (!solved) placeNumber(n) }} style={{
                padding: '8px 0', borderRadius: 'var(--radius)',
                border: selectedNum === n ? '2px solid #1abc9c' : '1px solid var(--clr-border)',
                background: selectedNum === n ? 'rgba(26,188,156,0.15)' : 'var(--clr-surface)',
                color: count >= 9 ? 'var(--clr-border)' : 'var(--clr-text)',
                fontWeight: 700, fontSize: '1rem', cursor: count >= 9 ? 'default' : 'pointer',
                fontFamily: 'monospace',
              }}>{n}</button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => placeNumber(0)} style={{
            flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)',
            background: 'var(--clr-surface)', color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          }}>&#9003; Erase</button>
          <button onClick={useHint} disabled={hints <= 0 || solved} style={{
            flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: 'none',
            background: hints > 0 && !solved ? '#e8b931' : 'var(--clr-border)',
            color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: hints > 0 && !solved ? 'pointer' : 'default',
          }}>&#128161; Hint ({hints})</button>
          {solved && (
            <button onClick={() => { clearInterval(timerRef.current); setPhase('setup') }} style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: 'none',
              background: '#1abc9c', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}>New Puzzle</button>
          )}
        </div>
      </div>
    </div>
  )
}
