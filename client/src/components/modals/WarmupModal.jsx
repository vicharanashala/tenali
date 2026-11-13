import React, { useState, useEffect, useRef } from 'react';

export default function WarmupModal({
  isOpen,
  onClose,
  warmupData,
  onWarmupCompleted,
  onSelectTopic,
  apiBase = ''
}) {
  const [questionsQueue, setQuestionsQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctAnswer, explanation }
  const [revealed, setRevealed] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [completionResult, setCompletionResult] = useState(null);
  const [reinforcedTopics, setReinforcedTopics] = useState(new Set());
  const [reinforcementAlert, setReinforcementAlert] = useState(null);
  const inputRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  // Initialize ONLY when the modal transitions from closed to open (prevents infinite loop!)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const initial = Array.isArray(warmupData?.questions) ? [...warmupData.questions] : [];
      setQuestionsQueue(initial);
      setCurrentIndex(0);
      setUserAnswer('');
      setFeedback(null);
      setRevealed(false);
      setIsFinishing(false);
      setSessionHistory([]);
      setCompletionResult(null);
      setReinforcedTopics(new Set());
      setReinforcementAlert(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, warmupData]);

  if (!isOpen) return null;

  const currentQ = questionsQueue[currentIndex];

  // Flexible answer checking
  const checkAnswer = (userRaw, q) => {
    if (!q) return false;
    const trimmedUser = (userRaw || '').trim().toLowerCase();
    const trimmedAns = String(q.answer || '').trim().toLowerCase();
    const acceptable = Array.isArray(q.acceptableAnswers)
      ? q.acceptableAnswers.map(a => String(a).trim().toLowerCase())
      : [];

    if (trimmedUser === trimmedAns || acceptable.includes(trimmedUser)) {
      return true;
    }

    // Strip whitespace inside strings (e.g. '3 / 4' vs '3/4')
    const noSpaceUser = trimmedUser.replace(/\s+/g, '');
    const noSpaceAns = trimmedAns.replace(/\s+/g, '');
    if (noSpaceUser === noSpaceAns || acceptable.some(a => a.replace(/\s+/g, '') === noSpaceUser)) {
      return true;
    }

    // Numerical / float tolerance comparison
    const numUser = parseFloat(trimmedUser);
    const numAns = parseFloat(trimmedAns);
    if (!isNaN(numUser) && !isNaN(numAns) && Math.abs(numUser - numAns) < 1e-4) {
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!userAnswer.trim() || revealed || !currentQ) return;

    const isCorrect = checkAnswer(userAnswer, currentQ);

    setFeedback({
      isCorrect,
      correctAnswer: currentQ.answer,
      explanation: isCorrect ? '🎉 Great job! That is correct.' : `Correct answer: ${currentQ.answer}`
    });
    setRevealed(true);

    // Record in history
    const historyItem = {
      index: currentIndex,
      id: currentQ.id,
      topic: currentQ.topic,
      appKey: currentQ.appKey || currentQ.topic,
      conceptName: currentQ.conceptName || currentQ.topic,
      conceptTip: currentQ.conceptTip || '',
      storyContext: currentQ.storyContext || '',
      prompt: currentQ.prompt,
      userAnswer: userAnswer.trim(),
      correctAnswer: currentQ.answer,
      isCorrect,
      isReinforcement: !!currentQ.isReinforcement
    };
    setSessionHistory(prev => [...prev, historyItem]);

    // If incorrect, dynamically generate 2 more reinforcement questions on this mistaken topic
    if (!isCorrect && !reinforcedTopics.has(currentQ.topic)) {
      const updatedReinforced = new Set(reinforcedTopics);
      updatedReinforced.add(currentQ.topic);
      setReinforcedTopics(updatedReinforced);

      setReinforcementAlert({
        topic: currentQ.topic,
        conceptName: currentQ.conceptName || currentQ.topic,
        message: `🎯 Learning Curve Adjustment: 2 practice questions added on ${currentQ.conceptName || currentQ.topic} to help you master this concept!`
      });

      try {
        const res = await fetch(`${apiBase}/api/review/daily-warmup/reinforce?topic=${encodeURIComponent(currentQ.topic)}&count=2`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.questions)) {
          const taggedQuestions = data.questions.map(q => ({
            ...q,
            isReinforcement: true,
            reinforcementReason: `Reinforcement for ${currentQ.conceptName || currentQ.topic}`
          }));
          setQuestionsQueue(prev => [...prev, ...taggedQuestions]);
        }
      } catch (err) {
        console.error('Failed to fetch reinforcement questions:', err);
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 < questionsQueue.length) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      setRevealed(false);
      setReinforcementAlert(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Completed all questions in the queue -> Submit & show Diagnostic Results
      setIsFinishing(true);
      try {
        const guestHabit = (() => {
          try { return JSON.parse(localStorage.getItem('tenali-weekly-habit') || 'null'); } catch { return null; }
        })();
        const guestLadder = (() => {
          try { return JSON.parse(localStorage.getItem('tenali-spacing-ladder') || '{}'); } catch { return {}; }
        })();

        const token = localStorage.getItem('tenali-token') || '';
        const res = await fetch(`${apiBase}/api/review/daily-warmup/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            guestHabit,
            guestLadder,
            results: sessionHistory.map(h => ({
              topic: h.topic,
              isCorrect: h.isCorrect
            }))
          })
        });

        const data = await res.json();
        if (data && data.success) {
          if (data.weeklyHabit) {
            try {
              localStorage.setItem('tenali-weekly-habit', JSON.stringify(data.weeklyHabit));
            } catch (e) { void e; }
          }
          if (data.spacingLadder) {
            try {
              localStorage.setItem('tenali-spacing-ladder', JSON.stringify(data.spacingLadder));
            } catch (e) { void e; }
          }
          setCompletionResult(data);
          if (onWarmupCompleted) {
            onWarmupCompleted(data.weeklyHabit);
          }
        } else {
          setCompletionResult({ xpAwarded: 15, message: '🎉 Warmup completed!' });
        }
      } catch (err) {
        console.warn('Warmup completion offline fallback:', err?.message || err);
        setCompletionResult({ xpAwarded: 15, message: '🎉 Warmup completed offline!' });
      } finally {
        setIsFinishing(false);
      }
    }
  };

  // Learning curve analysis
  const totalSolved = sessionHistory.length || questionsQueue.length || 3;
  const correctCount = sessionHistory.filter(h => h.isCorrect).length;
  const wrongList = sessionHistory.filter(h => !h.isCorrect);
  const reinforcementCount = sessionHistory.filter(h => h.isReinforcement).length;
  const retentionPercent = Math.round((correctCount / totalSolved) * 100);

  // Suggested topic to practice
  const practiceTopic = wrongList.length > 0 ? wrongList[0] : (sessionHistory[0] || null);

  const habit = completionResult?.weeklyHabit || warmupData?.weeklyHabit || {
    targetDaysPerWeek: 3,
    activeDaysThisWeek: [],
    weeklyStreak: 0,
    daysCompletedThisWeek: 0,
    targetMet: false
  };

  const daysCompleted = habit.daysCompletedThisWeek || habit.activeDaysThisWeek?.length || 1;
  const targetDays = habit.targetDaysPerWeek || 3;
  const weeklyStreak = habit.weeklyStreak || 0;
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        backgroundColor: 'var(--clr-card, #2c2622)',
        color: 'var(--clr-text, #fff)',
        borderRadius: 'var(--radius, 14px)',
        border: '1px solid var(--clr-border, #443c35)',
        width: '100%',
        maxWidth: completionResult ? '640px' : '540px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--clr-text-soft, #aaa)',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 10
          }}
          title="Close warmup"
        >
          ✕
        </button>

        {completionResult ? (
          /* ══════════════════════════════════════════════════════════════════ */
          /* POST-WARMUP DIAGNOSTIC & LEARNING CURVE RESULTS SCREEN             */
          /* ══════════════════════════════════════════════════════════════════ */
          <div>
            {/* Header / Celebration */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
                {wrongList.length === 0 ? '🏆' : (correctCount >= 2 ? '📈' : '💡')}
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                margin: '0 0 0.25rem 0',
                color: wrongList.length === 0 ? 'var(--clr-correct, #4caf50)' : 'var(--clr-text, #fff)'
              }}>
                Daily Warmup Diagnostic Results
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-soft, #bbb)' }}>
                {wrongList.length === 0
                  ? '🌟 Perfect mastery! No mistakes made today.'
                  : 'Spaced recall session evaluated against your memory curve.'}
              </p>
            </div>

            {/* Performance & Retention Score Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: wrongList.length === 0
                ? 'rgba(76, 175, 80, 0.12)'
                : 'rgba(255, 152, 0, 0.12)',
              border: `1px solid ${wrongList.length === 0 ? 'var(--clr-correct, #4caf50)' : 'rgba(255, 152, 0, 0.4)'}`,
              marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: wrongList.length === 0 ? 'var(--clr-correct, #4caf50)' : '#ffb74d'
                }}>
                  {correctCount} / {totalSolved} Correct ({retentionPercent}% Retention)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft, #ccc)' }}>
                  {wrongList.length === 0
                    ? '🎉 100% active recall! All concepts are firmly consolidated in memory.'
                    : (reinforcementCount > 0
                      ? `Targeted reinforcement triggered: 2 extra practice questions completed.`
                      : `Retention gap detected: 1 or more topics need practice.`)}
                </div>
              </div>

              {/* XP Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '16px',
                background: 'rgba(255, 193, 7, 0.2)',
                border: '1px solid #ffc107',
                color: '#ffc107',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}>
                <span>⭐</span> +{completionResult.xpAwarded || 15} XP
              </div>
            </div>

            {/* 1. Question-by-Question Review */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--clr-text-soft, #aaa)',
                marginBottom: '8px'
              }}>
                📋 Question Breakdown & Diagnostic Review
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sessionHistory.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      border: `1px solid ${item.isCorrect ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.5)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {/* Item Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>{item.isCorrect ? '✅' : '❌'}</span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--clr-accent, #e07a5f)'
                        }}>
                          {item.topic.toUpperCase()}
                        </span>
                        {item.isReinforcement && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 152, 0, 0.2)',
                            color: '#ffb74d'
                          }}>
                            Reinforcement
                          </span>
                        )}
                        {item.storyContext && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft, #999)', fontStyle: 'italic' }}>
                            {item.storyContext}
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: item.isCorrect ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #f44336)'
                      }}>
                        {item.isCorrect ? 'Correct' : 'Review Needed'}
                      </span>
                    </div>

                    {/* Prompt */}
                    <div style={{ fontSize: '0.85rem', color: 'var(--clr-text, #ddd)', lineHeight: 1.4 }}>
                      {item.prompt}
                    </div>

                    {/* Comparison */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '0.8rem',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)'
                    }}>
                      <div>
                        <span style={{ color: 'var(--clr-text-soft, #aaa)' }}>Your Answer: </span>
                        <span style={{
                          fontWeight: 'bold',
                          color: item.isCorrect ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #f44336)',
                          textDecoration: item.isCorrect ? 'none' : 'line-through'
                        }}>
                          {item.userAnswer || '(blank)'}
                        </span>
                      </div>
                      {!item.isCorrect && (
                        <div>
                          <span style={{ color: 'var(--clr-text-soft, #aaa)' }}>Correct: </span>
                          <span style={{ fontWeight: 'bold', color: 'var(--clr-correct, #4caf50)' }}>
                            {item.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Concept Rule Takeaway */}
                    {item.conceptTip && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#ffcc80',
                        backgroundColor: 'rgba(255, 152, 0, 0.08)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #ff9800'
                      }}>
                        <strong>💡 Concept Takeaway: </strong>{item.conceptTip}
                      </div>
                    )}

                    {/* Spaced Ladder Status Pill */}
                    {(() => {
                      const ladderUpdate = completionResult?.ladderUpdates?.find(u => u.topic === item.topic);
                      if (!ladderUpdate) return null;
                      return (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: ladderUpdate.wentUp ? 'rgba(76, 175, 80, 0.12)' : 'rgba(255, 152, 0, 0.12)',
                          color: ladderUpdate.wentUp ? 'var(--clr-correct, #4caf50)' : '#ffb74d',
                          border: `1px solid ${ladderUpdate.wentUp ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
                          alignSelf: 'flex-start'
                        }}>
                          <span>🪜</span>
                          <span>
                            {ladderUpdate.wentUp
                              ? `Spaced Repetition Ladder: Advanced to Level ${ladderUpdate.rung + 1} (Next review in ${ladderUpdate.intervalDays} days)`
                              : `Spaced Repetition Ladder: Set to Level ${ladderUpdate.rung + 1} (Review tomorrow: ${ladderUpdate.intervalDays} day)`}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Targeted Practice & Learning Curve Recommendation */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: wrongList.length > 0 ? 'rgba(224, 122, 95, 0.12)' : 'rgba(76, 175, 80, 0.1)',
              border: `1px solid ${wrongList.length > 0 ? 'var(--clr-accent, #e07a5f)' : 'var(--clr-correct, #4caf50)'}`,
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text, #fff)' }}>
                  {wrongList.length > 0 ? 'Targeted Practice Recommendation' : 'Peak Mastery Maintained'}
                </span>
              </div>

              <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--clr-text-soft, #ccc)', lineHeight: 1.4 }}>
                {wrongList.length > 0 ? (
                  <>
                    Based on your learning curve, memory decay was detected in <strong>{wrongList.map(w => w.conceptName || w.topic).join(', ')}</strong>. Practicing this topic now will solidify retention.
                  </>
                ) : (
                  <>
                    Outstanding work! All concepts demonstrated solid active recall with 0 mistakes. Keep your weekly habit momentum going!
                  </>
                )}
              </p>

              {/* Direct Practice Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {wrongList.length > 0 ? (
                  wrongList.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (onSelectTopic && w.appKey) {
                          onSelectTopic(w.appKey);
                          onClose();
                        }
                      }}
                      style={{
                        background: 'var(--clr-accent, #e07a5f)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 'var(--radius, 8px)',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>➔</span> Practice {w.conceptName || w.topic} Now
                    </button>
                  ))
                ) : (
                  practiceTopic?.appKey && (
                    <button
                      onClick={() => {
                        if (onSelectTopic && practiceTopic.appKey) {
                          onSelectTopic(practiceTopic.appKey);
                          onClose();
                        }
                      }}
                      style={{
                        background: 'var(--clr-correct, #4caf50)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 'var(--radius, 8px)',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>➔</span> Explore More Puzzles
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 3. Weekly Habit 7-Day Rhythm */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text, #fff)' }}>
                  Weekly Habit: {daysCompleted} of {targetDays} Days Met
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft, #aaa)' }}>
                  🔥 {weeklyStreak} {weeklyStreak === 1 ? 'Week' : 'Weeks'} Streak Active
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {DAY_LABELS.map((dayLetter, index) => {
                  const isActive = index < daysCompleted;
                  const isToday = index === todayDayIndex;
                  return (
                    <div
                      key={index}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: isActive
                          ? 'var(--clr-correct, #4caf50)'
                          : (isToday ? 'rgba(224, 122, 95, 0.3)' : 'rgba(255,255,255,0.08)'),
                        border: isToday
                          ? '2px solid var(--clr-accent, #e07a5f)'
                          : `1px solid ${isActive ? 'var(--clr-correct, #4caf50)' : 'var(--clr-border, #444)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: isActive ? '#fff' : (isToday ? 'var(--clr-accent, #e07a5f)' : 'var(--clr-text-soft, #777)')
                      }}
                    >
                      {isActive ? '✓' : dayLetter}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close & Return Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  color: 'var(--clr-text, #fff)',
                  border: '1px solid var(--clr-border, #555)',
                  borderRadius: 'var(--radius, 8px)',
                  padding: '8px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close & Return to Puzzles
              </button>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════ */
          /* ACTIVE QUESTION STORYLINE WARMUP FLOW                              */
          /* ══════════════════════════════════════════════════════════════════ */
          <div>
            {currentQ ? (
              <>
                {/* Header & Step progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🧠</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>DAILY WARMUP</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(224, 122, 95, 0.2)',
                      color: 'var(--clr-accent, #e07a5f)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {currentQ.topic?.toUpperCase()}
                    </span>
                    {currentQ.isReinforcement && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        color: '#ffb74d',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 152, 0, 0.5)'
                      }}>
                        🎯 Reinforcement
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft, #aaa)', fontWeight: 500 }}>
                    Question {currentIndex + 1} of {questionsQueue.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'var(--clr-border, #443c35)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${((currentIndex + 1) / questionsQueue.length) * 100}%`,
                    backgroundColor: 'var(--clr-accent, #e07a5f)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                {/* Story Context */}
                {currentQ.storyContext && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--clr-accent, #e07a5f)',
                    fontWeight: 600,
                    marginBottom: '6px'
                  }}>
                    <span>📖</span>
                    <span>{currentQ.storyContext}</span>
                  </div>
                )}

                {/* Narrative Question Prompt */}
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--clr-border, #443c35)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  fontSize: '1.05rem',
                  lineHeight: 1.5,
                  fontWeight: 500,
                  marginBottom: '1rem',
                  color: 'var(--clr-text, #fff)'
                }}>
                  {currentQ.prompt}
                </div>

                {/* Conceptual Strategy Hint (Without Spoilers!) */}
                {currentQ.conceptTip && (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '1.25rem',
                    fontSize: '0.8rem',
                    color: 'var(--clr-text-soft, #bbb)'
                  }}>
                    <span style={{ color: '#ffb74d', fontWeight: 600 }}>💡 Strategy Hint: </span>
                    {currentQ.conceptTip}
                  </div>
                )}

                {/* Input & Form */}
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={e => !revealed && setUserAnswer(e.target.value)}
                      placeholder={currentQ.inputPlaceholder || 'Type your answer...'}
                      disabled={revealed}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        fontSize: '1.05rem',
                        borderRadius: 'var(--radius, 8px)',
                        border: feedback
                          ? (feedback.isCorrect ? '2px solid var(--clr-correct, #4caf50)' : '2px solid var(--clr-wrong, #f44336)')
                          : '1px solid var(--clr-border, #555)',
                        backgroundColor: 'var(--clr-surface, #1e1a17)',
                        color: 'var(--clr-text, #fff)',
                        outline: 'none'
                      }}
                    />
                    {!revealed ? (
                      <button
                        type="submit"
                        disabled={!userAnswer.trim()}
                        style={{
                          background: 'var(--clr-accent, #e07a5f)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius, 8px)',
                          padding: '0.75rem 1.4rem',
                          fontWeight: 700,
                          cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                          opacity: userAnswer.trim() ? 1 : 0.5,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Check
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isFinishing}
                        style={{
                          background: currentIndex + 1 < questionsQueue.length ? 'var(--clr-correct, #4caf50)' : '#ff9800',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius, 8px)',
                          padding: '0.75rem 1.4rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isFinishing
                          ? 'Evaluating...'
                          : (currentIndex + 1 < questionsQueue.length ? 'Next ➔' : 'Finish & View Results 🏆')}
                      </button>
                    )}
                  </div>
                </form>

                {/* Feedback Banner */}
                {feedback && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    backgroundColor: feedback.isCorrect ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                    color: feedback.isCorrect ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #f44336)',
                    border: `1px solid ${feedback.isCorrect ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #f44336)'}`,
                    marginBottom: reinforcementAlert ? '8px' : '0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{feedback.isCorrect ? '✅' : '❌'}</span>
                      <span>{feedback.explanation}</span>
                    </div>
                  </div>
                )}

                {/* Reinforcement Notification Alert */}
                {reinforcementAlert && (
                  <div style={{
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 152, 0, 0.15)',
                    color: '#ffb74d',
                    border: '1px solid rgba(255, 152, 0, 0.4)',
                    marginTop: '8px'
                  }}>
                    {reinforcementAlert.message}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading questions...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
