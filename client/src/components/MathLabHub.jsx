
/**
 * MathLabHubApp Component
 * A picker screen for the three visual labs: Visual Math Lab, Mensuration Lab,
 * and Addition (Balance Scale / Counting Apples).
 * Selecting a lab renders it inline; back button returns to this picker.
 */

//MathLabHubApp

import { useMemo, useState } from 'react';

import MixedLab from './concept/MixedLab';

const labs = [
    {
    key: 'visual-math-lab-redux',
    icon: '🎮',
    name: 'Multiplication & division',
    subtitle: 'Multiplication & Division',
    desc: 'Practice multiplication and division through interactive visual puzzles',
    accentVar: 'var(--clr-accent)',
    accentAlpha: 'var(--clr-accent-soft)',
    },
    {
    key: 'mensuration-lab',
    icon: '🔷',
    name: 'Mensuration Lab',
    subtitle: 'Geometry & Shape Puzzles',
    desc: 'Explore area, perimeter and volume through animated shape challenges',
    accentVar: 'var(--clr-correct)',
    accentAlpha: 'var(--clr-correct-bg)',
    },
    {
    key: 'addition',
    icon: '🍎',
    name: 'Addition',
    subtitle: 'Balance Scale & Counting Apples',
    desc: 'Practice addition using visual balance scales and counting objects',
    accentVar: 'var(--clr-accent)',
    accentAlpha: 'var(--clr-accent-soft)',
    },
]

function MathLabHub({ onBack }) {
    const [selectedActivities, setSelectedActivities] = useState([])
    const [stage, setStage] = useState('choose')
    const [difficulty, setDifficulty] = useState('easy')
    const [numQuestions, setNumQuestions] = useState('5')


    // const selected = labs.find(lab => selectedActivities.includes(lab.key))
    const selectedSet = useMemo(() => new Set(selectedActivities), [selectedActivities])
    const selectedLabels = useMemo(() => selectedActivities
        .map(key => labs.find(lab => lab.key === key)?.name)
        .filter(Boolean), [selectedActivities])

    // const endpointMap = {
    //     'visual-math-lab-redux': '/visual-math-lab-redux',
    //     'mensuration-lab': '/mensuration-lab',
    //     addition: '/addition-api',
    // }

    const chooseLab = (lab) => {
        const labKey = lab.key
        setSelectedActivities(prev => prev.includes(labKey) ? prev.filter((item) => item !== labKey) : [...prev, labKey])
    }

    // const mapAdditionDifficulty = (difficulty) => {
    //     if (difficulty === 'hard') return 3
    //     if (difficulty === 'medium') return 2
    //     return 1
    // }

    // const updateNumQuestions = (value) => {
    //     if (value === '' || /^\d+$/.test(value)) {
    //     setNumQuestions(value)
    //     }
    // }

    if (stage === 'playing' && selectedActivities.length > 0) {
        return (
        <MixedLab
            onBack={() => setStage('config')}
            selectedActivities={selectedActivities}
            initialDifficulty={difficulty}
            initialNumQuestions={numQuestions}
        />
        )
    }

    if (stage === 'config' && selectedActivities.length > 0) {
        const quickCounts = ['5', '10', '15', '20']

        return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '40px 36px',
            width: '100%',
            maxWidth: '500px',
            boxSizing: 'border-box',
            textAlign: 'center',
            }}>
            {/* Back button */}
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <button
                onClick={() => setStage('choose')}
                style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    color: 'var(--clr-text-soft)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                }}
                >← Back</button>
            </div>

            {/* Title */}
            <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)', fontWeight: 700, color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
                Visual Learning Universe
            </h1>
            <p style={{ margin: '0 0 28px', color: 'var(--clr-text-soft)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
                Customize your quiz
            </p>

            {/* Selected Labs pills */}
            <div style={{ marginBottom: '24px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--clr-text-soft)', fontFamily: 'var(--font-body)' }}>
                Selected Labs:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {selectedLabels.map((label) => (
                    <span key={label} style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'var(--clr-accent)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    }}>
                    {label}
                    </span>
                ))}
                </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: '24px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--clr-text-soft)', fontFamily: 'var(--font-body)' }}>
                Select Difficulty:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                    { key: 'easy', label: 'Easy' },
                    { key: 'medium', label: 'Medium' },
                    { key: 'hard', label: 'Hard' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setDifficulty(key)} style={{
                    background: difficulty === key ? 'var(--clr-accent)' : 'transparent',
                    color: difficulty === key ? '#fff' : 'var(--clr-text)',
                    border: `1.5px solid ${difficulty === key ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                    borderRadius: '20px',
                    padding: '8px 20px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    transition: 'all var(--transition)',
                    }}>
                    {label}
                    </button>
                ))}
                </div>
            </div>

            {/* Question count */}
            <div style={{ marginBottom: '28px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--clr-text-soft)', fontFamily: 'var(--font-body)' }}>
                How many questions? (max 20)
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
                {quickCounts.map(count => (
                    <button key={count} onClick={() => setNumQuestions(count)} style={{
                    background: numQuestions === count ? 'var(--clr-accent)' : 'transparent',
                    color: numQuestions === count ? '#fff' : 'var(--clr-text)',
                    border: `1.5px solid ${numQuestions === count ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                    borderRadius: '20px',
                    padding: '8px 18px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    transition: 'all var(--transition)',
                    }}>
                    {count}
                    </button>
                ))}
                </div>
                <input
                type="text"
                value={numQuestions}
                onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }}
                style={{
                    width: '80px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--clr-border)',
                    background: 'var(--clr-surface)',
                    color: 'var(--clr-text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    textAlign: 'center',
                }}
                onFocus={e => e.currentTarget.style.setProperty('border-color', 'var(--clr-accent)')}
                onBlur={e => e.currentTarget.style.setProperty('border-color', 'var(--clr-border)')}
                />
            </div>

            {/* Start button */}
            <button
                onClick={() => setStage('playing')}
                style={{
                background: 'var(--clr-accent)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 40px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-body)',
                transition: 'all var(--transition)',
                }}
                onMouseEnter={e => {
                e.currentTarget.style.setProperty('transform', 'translateY(-2px)');
                e.currentTarget.style.setProperty('box-shadow', '0 8px 20px rgba(240,140,70,0.35)');
                }}
                onMouseLeave={e => {
                e.currentTarget.style.setProperty('transform', 'translateY(0)');
                e.currentTarget.style.setProperty('box-shadow', 'none');
                }}
            >
                Start Quiz
            </button>
            </div>
        </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Back button row */}
        <div style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
            <button
            onClick={onBack}
            style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                color: 'var(--clr-text-soft)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
            }}
            onMouseEnter={e => e.currentTarget.style.setProperty('background', 'var(--clr-hover-strong)')}
            onMouseLeave={e => e.currentTarget.style.setProperty('background', 'var(--clr-surface)')}
            >
            ← Back
            </button>
        </div>

        {/* Centered title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
            margin: '0 0 6px', fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)', fontWeight: 700,
            color: 'var(--clr-text)', fontFamily: 'var(--font-display)',
            }}>
            Visual Learning Universe
            </h1>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--clr-text-soft)', fontFamily: 'var(--font-body)' }}>
            Choose a lab to explore
            </p>
        </div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            width: '100%',
            boxSizing: 'border-box',
        }}>
            {labs.map(lab => (
            <button
                key={lab.key}
                onClick={() => chooseLab(lab)}
                className="menu-card featured"
                style={{
                width: '100%',
                height: 'auto',
                minHeight: '160px',
                borderColor: selectedSet.has(lab.key) ? 'var(--clr-accent)' : 'var(--clr-border)',
                background: selectedSet.has(lab.key) ? 'var(--clr-surface)' : 'var(--clr-card)',
                boxShadow: selectedSet.has(lab.key) ? '0 0 0 2px var(--clr-accent)' : undefined,
                padding: '18px 14px',
                gap: '6px',
                }}
            >
                <span className="menu-title" style={{ fontSize: '0.95rem' }}>{lab.name}</span>
                <span className="menu-subtitle" style={{ color: 'var(--clr-accent)', fontSize: '0.75rem', fontWeight: 600 }}>{lab.subtitle}</span>
                <span className="menu-subtitle" style={{ fontSize: '0.72rem', marginTop: '2px', lineHeight: 1.4 }}>{lab.desc}</span>
                {selectedSet.has(lab.key) && (
                <span style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'var(--clr-accent)', color: '#fff',
                    width: '20px', height: '20px', borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    fontSize: '0.7rem', fontWeight: 'bold',
                }}>✓</span>
                )}
            </button>
            ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
            <button
            onClick={() => selectedActivities.length > 0 && setStage('config')}
            disabled={selectedActivities.length === 0}
            style={{
                background: selectedActivities.length ? 'var(--clr-accent)' : 'var(--clr-card)',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 24px',
                color: selectedActivities.length ? '#fff' : 'var(--clr-text-soft)',
                cursor: selectedActivities.length ? 'pointer' : 'not-allowed',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
            }}
            >
            Continue
            </button>
            <span style={{ color: selectedActivities.length ? 'var(--clr-text-soft)' : '#f85149', fontSize: '0.88rem' }}>
            {selectedActivities.length ? 'Continue with the selected activities.' : 'Please select at least one activity.'}
            </span>
        </div>
        </div>
    )
}

export default MathLabHub
