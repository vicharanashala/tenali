import React, { useState, useEffect } from 'react';
import useSpeechInput from '../useSpeechInput';

export default function GuidedExercise({
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
  const [inputText, setInputText] = useState('');
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null); // { isCorrect, score, feedback, coreMatched, bonusMatched }
  const [loading, setLoading] = useState(false);

  const speech = useSpeechInput();

  useEffect(() => {
    if (isLevelMode) {
      if (propCurrentItem && propCurrentItem.id !== currentItem?.id) {
        setCurrentItem(propCurrentItem);
        setInputText('');
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
      setInputText(speech.transcript);
    }
  }, [speech.transcript]);

  const pickQuestion = () => {
    if (!items || items.length === 0) return;

    // Pick a random item with guidedDescription
    const available = items.filter(i => i.guidedDescription);
    let item;
    if (currentItem) {
      const filtered = available.filter(i => i.id !== currentItem.id);
      item = filtered[Math.floor(Math.random() * filtered.length)] || available[0];
    } else {
      item = available[Math.floor(Math.random() * available.length)];
    }

    setCurrentItem(item);

    // Clean starter: e.g. replace ___ with ... for guide, but set input placeholder or starter
    // Let's set the initial text to the starter part before the first blank, so they have a prefix,
    // or just let them start typing/speaking.
    const rawStarter = item.guidedDescription.starter || '';
    const initialText = rawStarter.split('___')[0] || '';

    setInputText(initialText.trim() + ' ');
    setChecked(false);
    setResult(null);
    speech.setTranscript('');
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || checked || loading) return;
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
          exerciseType: 'guided',
          answer: inputText.trim()
        })
      });

      const data = await res.json();
      setResult({
        isCorrect: data.isCorrect,
        score: data.score,
        feedback: data.feedback,
        coreMatched: data.coreMatched || [],
        bonusMatched: data.bonusMatched || []
      });
      setChecked(true);
      if (onAnswer) {
        onAnswer(data.isCorrect);
      }
    } catch (err) {
      console.error('Error checking GuidedDescription answer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentItem) {
    return <div style={{ color: 'var(--clr-text-soft)', textAlign: 'center' }}>Loading question...</div>;
  }

  const starterPrompt = currentItem.guidedDescription.starter || '';
  const coreKeywords = currentItem.guidedDescription.keywords?.core || [];
  const bonusKeywords = currentItem.guidedDescription.keywords?.bonus || [];

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      {!isLevelMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--clr-accent)' }}>Guided Description</h2>
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
            alt="Guided description target"
            style={{
              maxWidth: '100%',
              maxHeight: '280px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Starter Guide Box */}
        <div style={{
          width: '100%',
          padding: '14px 16px',
          background: 'var(--clr-accent-bg, rgba(108,206,255,0.05))',
          borderLeft: '4px solid var(--clr-accent)',
          borderRadius: '4px 12px 12px 4px',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Complete the sentence starter:
          </span>
          <span style={{ fontSize: '1.05rem', color: 'var(--clr-text)', fontWeight: '600', fontStyle: 'italic' }}>
            "{starterPrompt.replace(/___/g, '_______')}"
          </span>
        </div>

        {/* Input Text Area and Speech */}
        <div style={{ width: '100%', position: 'relative' }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={checked}
            rows={3}
            placeholder="Type or speak the completed description..."
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.2)',
              border: `1.5px solid ${checked ? (result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)') : 'var(--clr-border)'}`,
              borderRadius: '12px',
              padding: '14px 50px 14px 14px',
              fontSize: '1rem',
              color: 'var(--clr-text)',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontWeight: '500',
              lineHeight: '1.5'
            }}
          />

          {speech.isSupported && !checked && (
            <button
              onClick={speech.isRecording ? speech.stopRecording : speech.startRecording}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: speech.isRecording ? 'var(--clr-incorrect, #ef5350)' : 'var(--clr-accent-bg, rgba(108,206,255,0.15))',
                color: speech.isRecording ? '#fff' : 'var(--clr-accent)',
                border: '1px solid var(--clr-accent)',
                borderRadius: '20px',
                padding: '6px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
              title={speech.isRecording ? 'Listening... click to stop' : 'Speech input'}
            >
              {speech.isRecording ? (
                <>
                  <span className="speech-pulse-dot" style={{
                    width: '8px',
                    height: '8px',
                    background: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite'
                  }} />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                  <span>Speak</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Panel */}
        <div style={{ width: '100%' }}>
          {!checked ? (
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || loading}
              style={{
                width: '100%',
                background: inputText.trim() ? 'var(--clr-accent)' : 'var(--clr-border)',
                color: inputText.trim() ? '#fff' : 'var(--clr-text-soft)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: inputText.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Checking description...' : 'Submit Description'}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

              {/* Score and Feedback Display */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '18px',
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.15)',
                border: `1.5px solid ${result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)'}`,
                boxSizing: 'border-box'
              }}>
                {/* Circular Score representation */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: `4px solid ${result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  color: result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)',
                  flexShrink: 0
                }}>
                  {result?.score}%
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: result?.isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)' }}>
                    {result?.isCorrect ? 'Pass!' : 'Needs Improvement'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text)', lineHeight: '1.4' }}>
                    {result?.feedback}
                  </p>
                </div>
              </div>

              {/* Recommended Vocabulary Section */}
              <div style={{
                width: '100%',
                background: 'rgba(108,206,255,0.05)',
                border: '1px dashed rgba(108,206,255,0.3)',
                borderRadius: '12px',
                padding: '16px',
                boxSizing: 'border-box',
                marginTop: '10px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--clr-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📚</span> Recommended Vocabulary for this Image
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
                  Use these words to describe the details, colors, actions, and features of the image:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Core Words */}
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '6px' }}>
                      Key Features / Core Words:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {coreKeywords.map((kw) => {
                        const matched = result?.coreMatched.includes(kw);
                        return (
                          <span
                            key={kw}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: matched ? 'rgba(46, 160, 67, 0.15)' : 'rgba(255,255,255,0.05)',
                              color: matched ? 'var(--clr-correct, #2ea043)' : 'var(--clr-text-soft)',
                              border: `1.5px solid ${matched ? 'var(--clr-correct, #2ea043)' : 'var(--clr-border)'}`,
                              transition: 'all 0.2s'
                            }}
                          >
                            {matched ? '✓ ' : '○ '}{kw}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bonus Words */}
                  {bonusKeywords.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '6px' }}>
                        Bonus / Action Words:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {bonusKeywords.map((kw) => {
                          const matched = result?.bonusMatched.includes(kw);
                          return (
                            <span
                              key={kw}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                background: matched ? 'rgba(108,206,255,0.15)' : 'rgba(255,255,255,0.03)',
                                color: matched ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                                border: `1.5px solid ${matched ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                                transition: 'all 0.2s'
                              }}
                            >
                              {matched ? '✓ ' : '○ '}{kw}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (isLevelMode) {
                    if (onNext) onNext(result?.isCorrect, result?.feedback, inputText);
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
