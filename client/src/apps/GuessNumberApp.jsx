import React, { useState } from 'react'

/* ── Guess the Number (Binary Magic) ─────────────────────────────── */
// Classic binary card trick — user thinks of 0–31, we guess it in 5 cards
// Each card holds numbers where a specific bit is set:
//   Card 1 → bit 0 (1, 3, 5, 7, …)
//   Card 2 → bit 1 (2, 3, 6, 7, 10, 11, …)
//   Card 3 → bit 2 (4, 5, 6, 7, 12, 13, 14, 15, …)
//   Card 4 → bit 3 (8–15, 24–31)
//   Card 5 → bit 4 (16–31)
export default function GuessNumberApp({ onBack, backLabel }) {
  const [phase, setPhase] = useState('intro') // intro | playing | done
  const [cardIndex, setCardIndex] = useState(0) // 0–4
  const [guessedTotal, setGuessedTotal] = useState(0)

  const TOTAL_CARDS = 5

  // Build 5 binary cards (each number 0–31 appears in exactly the cards where its bit is set)
  const binaryCards = Array.from({ length: TOTAL_CARDS }, (_, cardIdx) => {
    const bit = cardIdx     // bit 0 → card 0, bit 1 → card 1, …
    const mask = 1 << bit  // 1, 2, 4, 8, 16
    return Array.from({ length: 32 }, (_, n) => n).filter(n => (n & mask) !== 0)
  })

  // Card label colors (rainbow gradient across 5 cards)
  const CARD_COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#74c0fc']
  const CARD_GLOW = ['#ff6b6b55', '#ffa94d55', '#ffd43b55', '#69db7c55', '#74c0fc55']

  const handleYes = () => {
    const newTotal = guessedTotal + (1 << cardIndex)
    setGuessedTotal(newTotal)
    if (cardIndex < TOTAL_CARDS - 1) {
      setCardIndex(c => c + 1)
    } else {
      setPhase('done')
    }
  }

  const handleNo = () => {
    if (cardIndex < TOTAL_CARDS - 1) {
      setCardIndex(c => c + 1)
    } else {
      setPhase('done')
    }
  }

  const handlePlayAgain = () => {
    setPhase('intro')
    setCardIndex(0)
    setGuessedTotal(0)
  }

  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>{backLabel ? (backLabel.startsWith('←') ? backLabel : `← ${backLabel}`) : '← Home'}</button>
      </div>
      <h1>Guess the Number</h1>
      <p className="subtitle">Think of a number from 0 to 31 — I'll find it!</p>

      {phase === 'intro' && (
        <div className="welcome-box">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>🧙‍♂️</div>
            <p className="welcome-text">Think of any number between 0 and 31.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)', marginTop: 6 }}>
              I'll show you 5 cards — just tell me if your number is on each one.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {binaryCards.map((card, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${CARD_COLORS[i]}22, ${CARD_COLORS[i]}44)`,
                border: `2px solid ${CARD_COLORS[i]}`,
                borderRadius: 12,
                padding: '6px 10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: CARD_COLORS[i] }}>Card {i + 1}</div>
                <div style={{ fontSize: '0.7rem', color: '#fff8', marginTop: 2 }}>{card.length} numbers</div>
              </div>
            ))}
          </div>
          <div className="button-row"><button onClick={() => setPhase('playing')}>I'm Ready!</button></div>
        </div>
      )}

      {phase === 'playing' && (
        <div style={{ textAlign: 'center' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: TOTAL_CARDS }, (_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < cardIndex ? '#69db7c' : i === cardIndex ? CARD_COLORS[i] : '#333',
                border: `2px solid ${i < cardIndex ? '#69db7c' : CARD_COLORS[i]}`,
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${CARD_COLORS[cardIndex]}18, ${CARD_COLORS[cardIndex]}30)`,
            border: `2.5px solid ${CARD_COLORS[cardIndex]}`,
            borderRadius: 20,
            padding: '20px 16px',
            marginBottom: 20,
            boxShadow: `0 0 30px ${CARD_GLOW[cardIndex]}, 0 4px 20px rgba(0,0,0,0.3)`,
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: CARD_COLORS[cardIndex], marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
              Card {cardIndex + 1} of {TOTAL_CARDS}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(46px, 1fr))',
              gap: 6,
              maxWidth: 340,
              margin: '0 auto',
            }}>
              {binaryCards[cardIndex].map(num => (
                <div key={num} style={{
                  background: `${CARD_COLORS[cardIndex]}33`,
                  border: `1.5px solid ${CARD_COLORS[cardIndex]}88`,
                  borderRadius: 8,
                  padding: '6px 0',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#fff',
                }}>{num}</div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: 20 }}>
            Is your number on this card?
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button
              onClick={handleNo}
              style={{ background: '#333', color: '#fff', border: '2px solid #555', borderRadius: 12, padding: '12px 32px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.1s' }}
            >
              ✗ No
            </button>
            <button
              onClick={handleYes}
              style={{ background: `linear-gradient(135deg, ${CARD_COLORS[cardIndex]}, ${CARD_COLORS[(cardIndex + 1) % 5]})`, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 15px ${CARD_GLOW[cardIndex]}`, transition: 'transform 0.1s' }}
            >
              ✓ Yes
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="welcome-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>🔮</div>
          <p className="welcome-text">Your number is...</p>
          <div style={{
            fontSize: '5rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ff6b6b, #ffd43b, #69db7c, #74c0fc, #cc5de8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '16px 0',
            textShadow: 'none',
            filter: 'drop-shadow(0 2px 8px rgba(255,107,107,0.4))',
          }}>
            {guessedTotal}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)', marginBottom: 24 }}>
            Was that right? 😄
          </p>
          <button onClick={handlePlayAgain} style={{ fontSize: '1rem', padding: '12px 28px' }}>Play Again ↻</button>
        </div>
      )}
    </>
  )
}

/* ── Random Mix App ─────────────────────────────────── */
// Adaptive cross-topic quiz: random topics, progressive difficulty, skip topics
// Topics that work with a single text-input answer in Random Mix.
// Excluded: simul (needs x,y,z inputs), polymul (needs coefficient array),
// polyfactor (needs 4 factor inputs), primefactor (needs factor chain UI),
// qformula (needs two roots), dotprod (needs matrix grid).
