import React, { useState, useEffect } from 'react';

export default function MatchingExercise({
  items,
  onAnswer,
  onBack,
  masteryState,
  isLevelMode = false,
  puzzleIndex = 1,
  totalPuzzles = 5,
  onNext
}) {
  const [roundItems, setRoundItems] = useState([]); // 4 items for this round
  const [scrambledWords, setScrambledWords] = useState([]); // 4 words scrambled
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState({}); // imageId -> word
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState({}); // imageId -> boolean (correct/incorrect)
  const [loading, setLoading] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  useEffect(() => {
    if (items && items.length > 0 && roundItems.length === 0) {
      pickQuestion();
    }
  }, [items]);

  useEffect(() => {
    if (isLevelMode && roundItems.length > 0) {
      pickQuestion();
    }
  }, [puzzleIndex]);

  const pickQuestion = () => {
    if (!items || items.length === 0) return;

    // Pick 4 random items
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);

    // Prepare matching words
    const words = selected.map(item => item.matching?.word || item.primaryWord);
    const scrambled = [...words].sort(() => Math.random() - 0.5);

    setRoundItems(selected);
    setScrambledWords(scrambled);
    setMatches({});
    setSelectedImageId(null);
    setSelectedWord(null);
    setChecked(false);
    setResults({});
    setAllCorrect(false);
  };

  const handleImageClick = (id) => {
    if (checked) return;
    if (selectedImageId === id) {
      setSelectedImageId(null);
    } else {
      setSelectedImageId(id);
      // If a word was already selected, make the match
      if (selectedWord) {
        makeMatch(id, selectedWord);
      }
    }
  };

  const handleWordClick = (word) => {
    if (checked) return;
    if (selectedWord === word) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
      // If an image was already selected, make the match
      if (selectedImageId) {
        makeMatch(selectedImageId, word);
      }
    }
  };

  const makeMatch = (imageId, word) => {
    // Check if word is already matched to another image, if so, remove it
    const newMatches = { ...matches };
    Object.keys(newMatches).forEach(imgId => {
      if (newMatches[imgId] === word) {
        delete newMatches[imgId];
      }
    });

    newMatches[imageId] = word;
    setMatches(newMatches);
    setSelectedImageId(null);
    setSelectedWord(null);
  };

  const clearMatch = (imageId) => {
    if (checked) return;
    const newMatches = { ...matches };
    delete newMatches[imageId];
    setMatches(newMatches);
  };

  const handleSubmit = async () => {
    if (Object.keys(matches).length < 4 || checked || loading) return;
    setLoading(true);

    // Verify matches locally first
    const resMap = {};
    let correctCount = 0;

    roundItems.forEach(item => {
      const userMatchedWord = matches[item.id];
      const correctWord = item.matching?.word || item.primaryWord;
      const acceptedAnswers = (item.acceptedAnswers || []).map(a => a.toLowerCase().trim());

      const isMatchCorrect = userMatchedWord && (
        userMatchedWord.toLowerCase().trim() === correctWord.toLowerCase().trim() ||
        acceptedAnswers.includes(userMatchedWord.toLowerCase().trim())
      );

      resMap[item.id] = isMatchCorrect;
      if (isMatchCorrect) correctCount++;
    });

    const overallCorrect = correctCount === 4;
    setResults(resMap);
    setAllCorrect(overallCorrect);
    setChecked(true);

    // Submit target item result to the backend to update BKT
    try {
      const targetItem = roundItems[0]; // use first item in list as target item for progress tracking
      const token = localStorage.getItem('tenali-auth-token') || localStorage.getItem('tenali-token');
      const API = import.meta.env.VITE_API_BASE_URL || '';

      await fetch(`${API}/drishya-api/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          itemId: targetItem.id,
          exerciseType: 'matching',
          answer: matches[targetItem.id] // correct or incorrect word matched
        })
      });

      if (onAnswer) {
        onAnswer(overallCorrect);
      }
    } catch (err) {
      console.error('Error submitting matching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const allMatched = Object.keys(matches).length === 4;

  if (roundItems.length === 0) {
    return <div style={{ color: 'var(--clr-text-soft)', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {!isLevelMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--clr-accent)' }}>Word Matching / Pairing</h2>
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
        boxShadow: isLevelMode ? 'none' : 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500', color: 'var(--clr-text)', textAlign: 'center' }}>
          Click an image, then click its matching word to connect them.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '30px',
          alignItems: 'stretch'
        }}>
          {/* Images Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {roundItems.map((item) => {
              const matchedWord = matches[item.id];
              const isSelected = selectedImageId === item.id;

              let cardStyle = {
                display: 'flex',
                alignItems: 'center',
                background: '#0b0b0f',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '12px',
                padding: '8px 12px',
                cursor: 'pointer',
                gap: '12px',
                transition: 'all 0.2s',
                height: '75px'
              };

              if (isSelected) {
                cardStyle.borderColor = 'var(--clr-accent)';
                cardStyle.background = 'var(--clr-accent-bg, rgba(108,206,255,0.06))';
              }

              if (checked) {
                cardStyle.cursor = 'default';
                const isCorrect = results[item.id];
                cardStyle.borderColor = isCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleImageClick(item.id)}
                  style={cardStyle}
                >
                  <div style={{
                    width: '70px',
                    height: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={`/${item.image}`}
                      alt="Match target"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    {matchedWord ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: 'var(--clr-text)' }}>{matchedWord}</span>
                        {!checked && (
                          <button
                            onClick={(e) => { e.stopPropagation(); clearMatch(item.id); }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--clr-text-soft)',
                              cursor: 'pointer',
                              fontSize: '1.1rem',
                              padding: '0 4px'
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        {isSelected ? 'Select matching word...' : 'Click to select'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Words Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
            {scrambledWords.map((word) => {
              const isMatched = Object.values(matches).includes(word);
              const isSelected = selectedWord === word;

              let wordStyle = {
                padding: '16px',
                borderRadius: '12px',
                border: '1.5px solid var(--clr-border)',
                background: 'var(--clr-surface)',
                color: 'var(--clr-text)',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                opacity: isMatched && !checked ? 0.4 : 1
              };

              if (isSelected) {
                wordStyle.borderColor = 'var(--clr-accent)';
                wordStyle.background = 'var(--clr-accent-bg, rgba(108,206,255,0.1))';
              }

              return (
                <div
                  key={word}
                  onClick={() => handleWordClick(word)}
                  style={wordStyle}
                >
                  {word}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ width: '100%', marginTop: '10px' }}>
          {!checked ? (
            <button
              onClick={handleSubmit}
              disabled={!allMatched || loading}
              style={{
                width: '100%',
                background: allMatched ? 'var(--clr-accent)' : 'var(--clr-border)',
                color: allMatched ? '#fff' : 'var(--clr-text-soft)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: allMatched ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Checking...' : 'Submit Matches'}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: allCorrect ? 'rgba(46, 160, 67, 0.1)' : 'rgba(239, 83, 80, 0.1)',
                border: `1px solid ${allCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)'}`,
                color: allCorrect ? 'var(--clr-correct, #2ea043)' : 'var(--clr-incorrect, #ef5350)',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{allCorrect ? '🎉 Perfect Match!' : '❌ Some matches are incorrect. Try again!'}</span>
              </div>
              <button
                onClick={() => {
                  if (isLevelMode) {
                    if (onNext) onNext(allCorrect, allCorrect ? 'All matches are correct!' : 'Some matches were incorrect.', matches);
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
                {isLevelMode && puzzleIndex === totalPuzzles ? 'Complete Level ✓' : 'Next Puzzle →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
