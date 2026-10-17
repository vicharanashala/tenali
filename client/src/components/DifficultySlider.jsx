import { useRef } from 'react'

function DifficultySlider({ pct, onChange, maxWidth = 260 }) {
    const barRef = useRef(null)
    const pctToPos = (p) => Math.min(100, Math.max(0, p))
    const handleInteraction = (clientX) => {
        const bar = barRef.current
        if (!bar) return
        const rect = bar.getBoundingClientRect()
        const newPct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
        onChange(newPct)
    }
    const onPointerDown = (e) => {
        e.preventDefault()
        handleInteraction(e.clientX)
        const onMove = (ev) => handleInteraction(ev.clientX)
        const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
    }
    return (
        <div ref={barRef} onPointerDown={onPointerDown} style={{ maxWidth, margin: '0.3rem auto 0.6rem', height: 20, borderRadius: 10, background: 'var(--color-border, #e0e0e0)', position: 'relative', cursor: 'pointer', touchAction: 'none' }}>
        <div style={{ position: 'absolute', top: 7, left: 0, right: 0, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #4caf50, #ff9800, #f44336, #9c27b0)' }} />
        <div style={{
            position: 'absolute', top: 1, left: `calc(${pctToPos(pct)}% - 9px)`,
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', border: '2.5px solid var(--clr-accent, #e8864a)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            transition: 'left 0.3s ease',
            pointerEvents: 'none'
        }} />
        </div>
    )
}

export default DifficultySlider
