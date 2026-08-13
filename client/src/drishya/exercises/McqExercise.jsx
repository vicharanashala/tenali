import React, { useState, useEffect } from 'react';

export default function McqExercise({
  items,
  onAnswer,
  onBack,
  masteryState,
  isLevelMode = false,
  currentItem: propCurrentItem = null,
  puzzleIndex = 1,
  totalPuzzles = 5,
  onNext
}) {
  const [currentItem, setCurrentItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null); // { isCorrect, feedback }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLevelMode) {
      if (propCurrentItem && propCurrentItem.id !== currentItem?.id) {
        setCurrentItem(propCurrentItem);
        setSelected(null);
        setChecked(false);
        setResult(null);
        if (propCurrentItem.mcq) {
          const opts = [propCurrentItem.mcq.correct, ...propCurrentItem.mcq.distractors];
          setOptions(opts.sort(() => Math.random() - 0.5));
        }
      }
    } else {
      if (items && items.length > 0 && !currentItem) {
        pickQuestion();
      }
    }
  }, [items, propCurrentItem, isLevelMode, currentItem]);

  const pickQuestion = () => {
    if (!items || items.length === 0) return;

    // Choose a random item
    let item;
    if (currentItem) {
      const filtered = items.filter(i => i.id !== currentItem.id);
      item = filtered[Math.floor(Math.random() * filtered.length)] || items[0];
    } else {
      item = items[Math.floor(Math.random() * items.length)];
    }

    setCurrentItem(item);
    setSelected(null);
    setChecked(false);
    setResult(null);

    // Prepare and scramble options
    if (item && item.mcq) {
      const opts = [item.mcq.correct, ...item.mcq.distractors];
      // Shuffle array
      setOptions(opts.sort(() => Math.random() - 0.5));
    }
  };

  const handleSelect = (opt) => {
    if (checked) return;
    setSelected(opt);
  };

  const handleSubmit = async () => {
    if (!selected || checked || loading) return;
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
          itemId: currentItem.id,
          exerciseType: 'mcq',
          answer: selected
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
      console.error('Error checking MCQ answer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentItem) {
    return <div style={{ color: 'var(--clr-text-soft)', textAlign: 'center' }}>Loading question...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {!isLevelMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--clr-accent)' }}>Identify the Word</h2>
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
        padding: isLevelMode ? '0' : '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        boxShadow: isLevelMode ? 'none' : 'var(--shadow-card)'
      }}>
        {/* Image Container */}
        <div style={{
          width: '100%',
          maxHeight: '280px',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#000'
        }}>
          <img
            src={`/${currentItem.image}`}
            alt="Describe this"
            style={{
              maxWidth: '100%',
              maxHeight: '280px',
              objectFit: 'contain'
            }}
          />
        </div>

        <p style={{ margin: '5px 0 0', fontSize: '1rem', fontWeight: '500', color: 'var(--clr-text)' }}>
          Which word best describes the image above?
        </p>

        {/* Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          width: '100%'
        }}>
          {options.map((opt, index) => {
            let btnStyle = {
              background: 'var(--clr-surface)',
              border: '1.5px solid var(--clr-border)',
              color: 'var(--clr-text)',
              borderRadius: '10px',
              padding: '14px 10px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            };

            if (selected === opt) {
              btnStyle.borderColor = 'var(--clr-accent)';
              btnStyle.background = 'var(--clr-accent-bg, rgba(108,206,255,0.1))';
            }

            if (checked) {
              btnStyle.cursor = 'default';
              if (opt === currentItem.mcq.correct) {
                btnStyle.borderColor = 'var(--clr-correct, #2ea043)';
                btnStyle.background = 'rgba(46, 160, 67, 0.15)';
                btnStyle.color = 'var(--clr-correct, #2ea043)';
              } else if (selected === opt) {
                btnStyle.borderColor = 'var(--clr-incorrect, #ef5350)';
                btnStyle.background = 'rgba(239, 83, 80, 0.15)';
                btnStyle.color = 'var(--clr-incorrect, #ef5350)';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(opt)}
                style={btnStyle}
                disabled={checked}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Action Panel */}
        <div style={{ width: '100%', marginTop: '10px' }}>
          {!checked ? (
            <button
              onClick={handleSubmit}
              disabled={!selected || loading}
              style={{
                width: '100%',
                background: selected ? 'var(--clr-accent)' : 'var(--clr-border)',
                color: selected ? '#fff' : 'var(--clr-text-soft)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: selected ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Checking...' : 'Submit Answer'}
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
                <span>{result?.isCorrect ? '🎉' : '❌'}</span>
                <span>{result?.feedback}</span>
              </div>
              <button
                onClick={() => {
                  if (isLevelMode) {
                    if (onNext) onNext(result?.isCorrect, result?.feedback, selected);
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
