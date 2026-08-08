import React, { useState, useEffect } from 'react';

export default function OddOneOutExercise({
  items,
  onAnswer,
  onBack,
  masteryState,
  isLevelMode = false,
  currentItem: propCurrentItem = null,
  puzzleIndex = 1,
  totalPuzzles = 5,
  onNext,
  allItems = []
}) {
  const [targetItem, setTargetItem] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLevelMode) {
      if (propCurrentItem && propCurrentItem.id !== targetItem?.id) {
        const target = propCurrentItem;
        const sourceForDistractors = allItems && allItems.length > 0 ? allItems : items;
        const sameCategory = sourceForDistractors.filter(i => i.category === target.category && i.id !== target.id);
        const shuffledDistractors = sameCategory.sort(() => Math.random() - 0.5);
        const distractors = shuffledDistractors.slice(0, 3);
        let choices = [target, ...distractors];
        if (choices.length < 4) {
          const otherCategory = sourceForDistractors.filter(i => i.category !== target.category);
          const extra = otherCategory.sort(() => Math.random() - 0.5).slice(0, 4 - choices.length);
          choices = [...choices, ...extra];
        }
        setTargetItem(target);
        setCandidates(choices.sort(() => Math.random() - 0.5));
        setSelectedId(null);
        setChecked(false);
        setResult(null);
      }
    } else {
      if (items && items.length > 0 && !targetItem) {
        pickQuestion();
      }
    }
  }, [items, propCurrentItem, isLevelMode, allItems, targetItem]);

  const pickQuestion = () => {
    if (!items || items.length === 0) return;

    // Pick a target item
    const target = items[Math.floor(Math.random() * items.length)];

    // Find distractors from the same category
    const sameCategory = items.filter(i => i.category === target.category && i.id !== target.id);

    // Take 2 or 3 distractors
    const shuffledDistractors = sameCategory.sort(() => Math.random() - 0.5);
    const distractors = shuffledDistractors.slice(0, 3); // we want 3 distractors (total 4 choices)

    // If we don't have enough distractors in the same category (e.g. emotions is small - only 5 images total),
    // grab from any other category to make it 4 options.
    let choices = [target, ...distractors];
    if (choices.length < 4) {
      const otherCategory = items.filter(i => i.category !== target.category);
      const extra = otherCategory.sort(() => Math.random() - 0.5).slice(0, 4 - choices.length);
      choices = [...choices, ...extra];
    }

    setTargetItem(target);
    setCandidates(choices.sort(() => Math.random() - 0.5));
    setSelectedId(null);
    setChecked(false);
    setResult(null);
  };

  const handleSelect = (id) => {
    if (checked) return;
    setSelectedId(id);
  };

  const handleSubmit = async () => {
    if (!selectedId || checked || loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('tenali-auth-token') || localStorage.getItem('tenali-token');
      const API = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API}/drishya-api/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          itemId: targetItem.id,
          exerciseType: 'oddOneOut',
          answer: selectedId
        })
      });

      const data = await res.json();
      setResult({
        isCorrect: data.isCorrect,
        feedback: data.feedback
      });
      setChecked(true);
      if (onAnswer) {
        onAnswer(data.isCorrect);
      }
    } catch (err) {
      console.error('Error checking OddOneOut answer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!targetItem) {
    return <div style={{ color: 'var(--clr-text-soft)', textAlign: 'center' }}>Loading question...</div>;
  }

  // Clue is the primaryWord of the target
  const clue = targetItem.primaryWord || targetItem.matching.word;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      {!isLevelMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--clr-accent)' }}>Odd One Out / Best Match</h2>
          </div>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid var(--clr-border)',
              color: 'var(--clr-text-soft)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            ← Dashboard
          </button>
        </div>
      )}

      <div style={{
        background: isLevelMode ? 'transparent' : 'var(--clr-surface)',
        border: isLevelMode ? 'none' : '1px solid var(--clr-border)',
        borderRadius: '16px',
        padding: isLevelMode ? '0' : '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxShadow: isLevelMode ? 'none' : 'var(--shadow-card)'
      }}>
        {/* Clue Panel */}
        <div style={{
          textAlign: 'center',
          background: 'var(--clr-accent-bg, rgba(108,206,255,0.06))',
          border: '1.5px dashed var(--clr-accent)',
          borderRadius: '12px',
          padding: '16px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Find the image that matches the clue:
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--clr-accent)' }}>
            {clue.toUpperCase()}
          </span>
        </div>

        {/* Images Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          width: '100%'
        }}>
          {candidates.map((cand) => {
            let cardStyle = {
              background: '#0b0b0f',
              border: '2px solid var(--clr-border)',
              borderRadius: '14px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '180px',
              overflow: 'hidden',
              transition: 'all 0.2s',
              position: 'relative'
            };

            if (selectedId === cand.id) {
              cardStyle.borderColor = 'var(--clr-accent)';
              cardStyle.boxShadow = '0 0 12px rgba(108, 206, 255, 0.4)';
            }

            if (checked) {
              cardStyle.cursor = 'default';
              if (cand.id === targetItem.id) {
                cardStyle.borderColor = 'var(--clr-correct, #2ea043)';
                cardStyle.boxShadow = '0 0 12px rgba(46, 160, 67, 0.4)';
              } else if (selectedId === cand.id) {
                cardStyle.borderColor = 'var(--clr-incorrect, #ef5350)';
                cardStyle.boxShadow = '0 0 12px rgba(239, 83, 80, 0.4)';
              }
            }

            return (
              <div
                key={cand.id}
                onClick={() => handleSelect(cand.id)}
                style={cardStyle}
              >
                <img
                  src={`/${cand.image}`}
                  alt="Candidate"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />

                {/* Overlay Checkmark/Cross */}
                {checked && cand.id === targetItem.id && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'var(--clr-correct, #2ea043)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    ✓
                  </div>
                )}
                {checked && selectedId === cand.id && cand.id !== targetItem.id && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'var(--clr-incorrect, #ef5350)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    ✗
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div style={{ width: '100%' }}>
          {!checked ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedId || loading}
              style={{
                width: '100%',
                background: selectedId ? 'var(--clr-accent)' : 'var(--clr-border)',
                color: selectedId ? '#fff' : 'var(--clr-text-soft)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: selectedId ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Checking...' : 'Submit Choice'}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: result?.isCorrect ? 'rgba(46, 160, 67, 0.1)' : 'rgba(239, 83, 80, 0.1)',
                border: `1px solid ${result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)'}`,
                color: result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{result?.isCorrect ? '🎉 Correct!' : '❌ Incorrect. Try another one.'}</span>
              </div>
              <button
                onClick={() => {
                  if (isLevelMode) {
                    if (onNext) onNext(result?.isCorrect, result?.feedback, selectedId);
                  } else {
                    pickQuestion();
                  }
                }}
                style={{
                  width: '100%',
                  background: 'var(--clr-accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isLevelMode && puzzleIndex === totalPuzzles ? 'Complete Level ✓' : 'Next Question →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
