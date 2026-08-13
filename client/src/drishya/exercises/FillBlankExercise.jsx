import React, { useState, useEffect } from 'react';
import useSpeechInput from '../useSpeechInput';

export default function FillBlankExercise({
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
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const speech = useSpeechInput();

  useEffect(() => {
    if (isLevelMode) {
      if (propCurrentItem && propCurrentItem.id !== currentItem?.id) {
        setCurrentItem(propCurrentItem);
        setAnswer('');
        setChecked(false);
        setResult(null);
        speech.setTranscript('');
      }
    } else {
      if (items && items.length > 0 && !currentItem) {
        pickQuestion();
      }
    }
  }, [items, propCurrentItem, isLevelMode, currentItem]);

  useEffect(() => {
    if (speech.transcript) {
      setAnswer(speech.transcript.replace(/[.-]/g, '').trim());
    }
  }, [speech.transcript]);

  const pickQuestion = () => {
    if (!items || items.length === 0) return;

    let item;
    const itemsWithBlank = items.filter(
      i => i.fillBlank && i.fillBlank.sentence && i.category !== 'scenario' && !i.image.startsWith('scenario/')
    );
    if (currentItem) {
      const filtered = itemsWithBlank.filter(i => i.id !== currentItem.id);
      item = filtered[Math.floor(Math.random() * filtered.length)] || itemsWithBlank[0];
    } else {
      item = itemsWithBlank[Math.floor(Math.random() * itemsWithBlank.length)];
    }

    setCurrentItem(item);
    setAnswer('');
    setChecked(false);
    setResult(null);
    speech.setTranscript('');
  };

  const handleSubmit = async () => {
    if (!answer.trim() || checked || loading) return;
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
          exerciseType: 'fillBlank',
          answer: answer.trim()
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
      console.error('Error checking FillBlank answer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentItem) {
    return <div style={{ color: 'var(--clr-text-soft)', textAlign: 'center' }}>Loading question...</div>;
  }

  const sentence = currentItem.fillBlank.sentence || '';
  const parts = sentence.split('___');

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {!isLevelMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--clr-accent)' }}>Fill in the Blank</h2>
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
            alt="Fill in the blank description"
            style={{
              maxWidth: '100%',
              maxHeight: '280px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Sentence Block */}
        <div style={{
          fontSize: '1.15rem',
          fontWeight: '500',
          color: 'var(--clr-text)',
          textAlign: 'center',
          lineHeight: '1.8',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '10px 0'
        }}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < parts.length - 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={checked}
                    placeholder="fill blank"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `2.5px solid ${checked ? (result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)') : 'var(--clr-accent)'}`,
                      color: checked ? (result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)') : 'var(--clr-text)',
                      outline: 'none',
                      padding: '2px 8px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      width: '140px',
                      textAlign: 'center',
                      transition: 'border-color 0.2s'
                    }}
                  />
                  {speech.isSupported && !checked && (
                    <button
                      onClick={speech.isRecording ? speech.stopRecording : speech.startRecording}
                      style={{
                        background: speech.isRecording ? 'var(--clr-incorrect, #ef5350)' : 'var(--clr-accent-bg, rgba(108,206,255,0.15))',
                        border: '1px solid var(--clr-accent)',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginLeft: '8px',
                        transition: 'all 0.2s',
                        color: speech.isRecording ? '#fff' : 'var(--clr-accent)',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}
                      title={speech.isRecording ? 'Listening... click to stop' : 'Use voice input'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                      </svg>
                      <span>{speech.isRecording ? 'Listening...' : 'Speak'}</span>
                    </button>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Action Panel */}
        <div style={{ width: '100%' }}>
          {!checked ? (
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || loading}
              style={{
                width: '100%',
                background: answer.trim() ? 'var(--clr-accent)' : 'var(--clr-border)',
                color: answer.trim() ? '#fff' : 'var(--clr-text-soft)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: answer.trim() ? 'pointer' : 'default',
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
                {!result?.isCorrect && currentItem.fillBlank.blankAnswers && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginLeft: 'auto' }}>
                    Correct: {currentItem.fillBlank.blankAnswers.join(', ')}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (isLevelMode) {
                    if (onNext) onNext(result?.isCorrect, result?.feedback, answer.trim());
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
