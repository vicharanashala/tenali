import React, { useEffect, useState } from 'react'
function ExtendedEuclidApp() {
  // ─────── Input State ──────────────────────────────────
  // First integer input (as string for input field)
  const [a, setA] = useState('')
  // Second integer input (as string for input field)
  const [b, setB] = useState('')
  // Computation results: {rows, gcd, x, y, a, b} or null if not computed
  const [steps, setSteps] = useState(null)
  // Theme preference: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('tenali-theme') || 'dark' } catch { return 'dark' }
  })

  // ─────── Theme Persistence ──────────────────────────────────
  // Sync theme to DOM and localStorage when changed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('tenali-theme', theme) } catch { }
  }, [theme])

  // Toggle between dark and light mode
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  /**
   * compute(): Run extended Euclidean algorithm using BigInt
   * Supports arbitrarily large integers (20+ digits)
   * Computes step-by-step table: rows with {r, s, t, q, step} (all as strings for React)
   * Adjusts final x,y for negative inputs
   */
  const compute = () => {
    const strA = a.trim(), strB = b.trim()
    if (!strA || !strB || !/^-?\d+$/.test(strA) || !/^-?\d+$/.test(strB)) return
    let na, nb
    try { na = BigInt(strA); nb = BigInt(strB) } catch { return }
    if (na === 0n && nb === 0n) return

    // ─────── Initialize Algorithm (BigInt for precision)
    const rows = []
    let r0 = na < 0n ? -na : na
    let r1 = nb < 0n ? -nb : nb
    let s0 = 1n, s1 = 0n
    let t0 = 0n, t1 = 1n

    // Record initial rows (convert to strings for React rendering)
    const S = v => String(v)
    rows.push({ r: S(r0), s: S(s0), t: S(t0), q: null, step: 0 })
    rows.push({ r: S(r1), s: S(s1), t: S(t1), q: null, step: 1 })

    // ─────── Main Loop: Euclid's Algorithm
    let i = 2
    while (r1 !== 0n) {
      const q = r0 / r1
      const r2 = r0 - q * r1
      const s2 = s0 - q * s1
      const t2 = t0 - q * t1

      rows.push({ r: S(r2), s: S(s2), t: S(t2), q: S(q), step: i })

      r0 = r1; r1 = r2
      s0 = s1; s1 = s2
      t0 = t1; t1 = t2
      i++
    }

    // ─────── Final Results
    const signA = na >= 0n ? 1n : -1n
    const signB = nb >= 0n ? 1n : -1n
    const gcd = r0
    const x = s0 * signA
    const y = t0 * signB
    const absA = na < 0n ? -na : na
    const absB = nb < 0n ? -nb : nb

    setSteps({
      rows, gcd: S(gcd), x: S(x), y: S(y),
      a: S(na), b: S(nb), absA: S(absA), absB: S(absB),
      verification: S(x * na + y * nb)
    })
  }

  /**
   * loadExample(): Load predefined example (252, 198)
   * gcd(252, 198) = 18
   */
  const loadExample = () => {
    setA('252')
    setB('198')
    setSteps(null)
  }

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="app-shell">
        <div className="card is-wide">
          <h1>Extended Euclidean Algorithm</h1>
          <p className="subtitle">
            Enter two integers to see the step-by-step computation of gcd(a, b) and coefficients x, y such that ax + by = gcd(a, b)
          </p>

          <div className="is-algo-explain">
            <strong>How it works:</strong> The algorithm repeatedly divides the larger number by the smaller and tracks coefficients.
            At each step: r<sub>i</sub> = r<sub>i−2</sub> − q<sub>i</sub> · r<sub>i−1</sub>, and similarly for s<sub>i</sub> and t<sub>i</sub>. When the remainder reaches 0, the previous remainder is the GCD, and the coefficients give the linear combination.
          </div>

          <div className="ee-input-row">
            <div className="ee-field">
              <label className="ee-label">a</label>
              <input
                className="ee-input"
                type="text"
                inputMode="numeric"
                value={a}
                onChange={e => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) { setA(v); setSteps(null) } }}
                placeholder="e.g. 12345678901234567890"
                onKeyDown={e => e.key === 'Enter' && compute()}
              />
            </div>
            <div className="ee-field">
              <label className="ee-label">b</label>
              <input
                className="ee-input"
                type="text"
                inputMode="numeric"
                value={b}
                onChange={e => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) { setB(v); setSteps(null) } }}
                placeholder="e.g. 98765432109876543210"
                onKeyDown={e => e.key === 'Enter' && compute()}
              />
            </div>
          </div>

          <div className="is-controls">
            <button className="is-btn" onClick={loadExample}>Load Example</button>
            <button className="is-btn is-btn-primary" onClick={compute} disabled={!a || !b}>Compute</button>
            <button className="is-btn" onClick={() => { setA(''); setB(''); setSteps(null) }}>Clear</button>
          </div>

          {steps && (
            <>
              {/* Result summary */}
              <div className="is-result" style={{ marginTop: '24px', wordBreak: 'break-all' }}>
                <strong>gcd({steps.a}, {steps.b}) = {steps.gcd}</strong>
                <br />
                <span style={{ fontSize: '1.05rem' }}>
                  ({steps.x}) × {steps.a} + ({steps.y}) × {steps.b} = {steps.gcd}
                </span>
                <br />
                <span className="is-result-note">
                  Verification: {steps.x} × {steps.a} + {steps.y} × {steps.b} = {steps.verification}
                </span>
              </div>

              {/* Step table */}
              <div className="ee-table-wrap">
                <table className="ee-table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>q<sub>i</sub></th>
                      <th>r<sub>i</sub></th>
                      <th>s<sub>i</sub></th>
                      <th>t<sub>i</sub></th>
                      <th>Equation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.rows.map((row, idx) => (
                      <tr key={idx} className={row.r === '0' ? 'ee-row-zero' : idx === steps.rows.length - 2 ? 'ee-row-gcd' : ''}>
                        <td>{row.step}</td>
                        <td>{row.q !== null ? row.q : '—'}</td>
                        <td><strong>{row.r}</strong></td>
                        <td>{row.s}</td>
                        <td>{row.t}</td>
                        <td className="ee-eq">
                          {row.r !== '0' ? (
                            <span>{row.r} = ({row.s}) × {steps.absA} + ({row.t}) × {steps.absB}</span>
                          ) : (
                            <span className="is-result-note">remainder = 0, stop</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Division steps breakdown */}
              <div className="ee-divisions">
                <h3>Division Steps</h3>
                {steps.rows.slice(2).map((row, idx) => {
                  const prev2 = steps.rows[idx]
                  const prev1 = steps.rows[idx + 1]
                  return (
                    <div key={idx} className="ee-division-step">
                      <span className="is-log-step">Step {idx + 1}:</span>
                      {prev2.r} = {row.q} × {prev1.r} + {row.r}
                      {row.r === '0' && <span className="is-result-note"> (done — gcd is {prev1.r})</span>}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
export default ExtendedEuclidApp