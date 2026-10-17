import React, { useState } from 'react';

function GoalSuccessScorecard({ score, totalQ, sessionGoal, resultsTable, buttons }) {
    const goalDetails = {
        speed: {
        title: 'Speed Run Achieved!',
        badge: '⚡ Speed Run',
        color: 'var(--clr-accent)',
        bgGlow: 'rgba(232, 134, 74, 0.15)',
        bgLight: 'rgba(232, 134, 74, 0.08)',
        },
        perfect: {
        title: 'Perfect Solve Achieved!',
        badge: '🎯 Perfect Solve',
        color: '#ffb300',
        bgGlow: 'rgba(255, 179, 0, 0.15)',
        bgLight: 'rgba(255, 179, 0, 0.08)',
        },
        revision: {
        title: 'Revision Achieved!',
        badge: '🔄 Revision',
        color: '#d27c3c',
        bgGlow: 'rgba(210, 124, 60, 0.15)',
        bgLight: 'rgba(210, 124, 60, 0.08)',
        }
    }[sessionGoal] || {
        title: 'Goal Achieved!',
        badge: '🏆 Goal Completed',
        color: 'var(--clr-accent)',
        bgGlow: 'rgba(232, 134, 74, 0.15)',
        bgLight: 'rgba(232, 134, 74, 0.08)',
    };

    const encouragingTexts = {
        speed: [
        "You have shown extreme talent by choosing this and mastering the speed!",
        "Lightning fast! Your rapid calculations are absolutely elite.",
        "Blazing reflexes! You've shown incredible mental agility under pressure.",
        "Speed demon! You cruised through this challenge with extreme talent!"
        ],
        perfect: [
        "Absolute perfection! You have shown extreme talent by choosing this and getting everything right.",
        "A flawless performance! Your precision and focus are second to none.",
        "Mastery unlocked! Not a single mistake was made. Exceptional talent!",
        "Perfect score! You've demonstrated extreme talent and absolute mastery here."
        ],
        revision: [
        "Outstanding dedication! You have shown extreme talent by choosing to revise and reinforce your skills.",
        "Skill solidified! Dedicated revision is the hallmark of extreme talent.",
        "Consistency is key! You've shown extreme talent by choosing to review your knowledge.",
        "True learning mastery! Re-evaluating and refining your skills shows extreme talent."
        ]
    }[sessionGoal] || [
        "Fantastic work! You have shown extreme talent by choosing this practice goal."
    ];

    const textList = encouragingTexts;
    const [ index ] = useState(() => Math.floor(Math.random() * textList.length));
    const encourageText = textList[index];
    // const randomText = textList[index];
    // const [encourageText, setEncourageText] = useState(randomText);
    // setEncourageText(randomText);

    return (
        <div className="goal-success-card" style={{ border: `2px solid ${goalDetails.bgGlow}`, boxShadow: `0 8px 32px ${goalDetails.bgGlow}, var(--shadow-card)` }}>
        <Confetti />
        
        <div className="success-checkmark-container">
            <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'block',
            strokeWidth: '4',
            stroke: goalDetails.color,
            strokeMiterlimit: '10',
            background: goalDetails.bgLight,
            animation: `checkmarkFill .4s ease-in-out .4s forwards, checkmarkScale .3s ease-in-out .9s both`,
            }}>
            <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none" style={{
                strokeDasharray: '166',
                strokeDashoffset: '166',
                strokeWidth: '4',
                strokeMiterlimit: '10',
                stroke: goalDetails.color,
                animation: 'checkmarkStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards'
            }} />
            <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{
                transformOrigin: '50% 50%',
                strokeDasharray: '48',
                strokeDashoffset: '48',
                animation: 'checkmarkStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards'
            }} />
            </svg>
        </div>

        <div style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#fff',
            backgroundColor: goalDetails.color,
            marginBottom: '1rem',
            boxShadow: `0 4px 12px ${goalDetails.bgGlow}`,
        }}>
            {goalDetails.badge}
        </div>

        <h2 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            color: goalDetails.color,
            fontFamily: 'var(--font-display, Georgia, serif)',
        }}>
            {goalDetails.title}
        </h2>

        <p style={{
            fontSize: '1.05rem',
            fontStyle: 'italic',
            fontWeight: '500',
            color: 'var(--clr-text-soft)',
            margin: '1.2rem auto',
            lineHeight: '1.6',
            maxWidth: '460px',
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            background: 'var(--clr-hover)',
            borderLeft: `4px solid ${goalDetails.color}`,
            textAlign: 'center'
        }}>
            "{encourageText}"
        </p>

        <div style={{
            margin: '2rem 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--clr-text-soft)', opacity: 0.7, marginBottom: '0.5rem' }}>
            Final Score
            </div>
            <div style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            color: 'var(--clr-text)',
            fontFamily: 'var(--font-display, Georgia, serif)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '4px'
            }}>
            <span style={{ color: goalDetails.color }}>{score}</span>
            <span style={{ fontSize: '1.8rem', color: 'var(--clr-text-soft)', opacity: 0.5, fontWeight: '400' }}>/</span>
            <span style={{ fontSize: '1.8rem', color: 'var(--clr-text-soft)', opacity: 0.5, fontWeight: '400' }}>{totalQ}</span>
            </div>
        </div>

        {resultsTable && (
            <div style={{ textAlign: 'left', marginTop: '2rem', maxHeight: '300px', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
            {resultsTable}
            </div>
        )}

        <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '2.5rem',
            flexWrap: 'wrap'
        }}>
            {buttons && buttons.map((btn, idx) => {
            return React.cloneElement(btn, {
                key: idx,
                style: {
                ...(btn.props.style || {}),
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                borderRadius: '30px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: btn.props.style?.border || 'none',
                background: btn.props.style?.background || `linear-gradient(135deg, ${goalDetails.color} 0%, rgba(141,110,99,0.3) 100%)`,
                color: btn.props.style?.color || '#fff',
                boxShadow: `0 4px 12px ${goalDetails.bgGlow}`,
                }
            });
            })}
        </div>
        </div>
    );
}

export default GoalSuccessScorecard
