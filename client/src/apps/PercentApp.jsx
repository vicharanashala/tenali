import { useState, useEffect } from 'react';
import { playSound } from '../audioContext';
/* ── Percentages App ────────────────────────────────── */

/* ── Percentages App Helpers ─────────────────────────── */
const cleanAndParseNum = (str) => {
  if (!str) return NaN;
  const cleaned = str.trim().replace(/\s+/g, '').replace(/[%₹$,]/g, '').replace(/−/g, '-');
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    return NaN;
  }
  return parseFloat(cleaned);
};



const triggerConfetti = () => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  document.body.appendChild(container);

  const colors = ['#FFC107', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#8BC34A', '#FF4081'];
  for (let i = 0; i < 40; i++) { // More confetti particles!
    const p = document.createElement('div');
    p.className = 'quiz-confetti-particle';
    p.style.left = `${10 + Math.random() * 80}vw`;
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = `${8 + Math.random() * 10}px`;
    p.style.height = `${12 + Math.random() * 10}px`;
    p.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(p);
  }

  setTimeout(() => {
    document.body.removeChild(container);
  }, 3000);
};

const generateFindQuestion = () => {
  const pcts = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90];
  const wholes = [40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000];
  let pct, whole, answer;
  let attempts = 0;
  do {
    pct = pcts[Math.floor(Math.random() * pcts.length)];
    whole = wholes[Math.floor(Math.random() * wholes.length)];
    answer = (pct * whole) / 100;
    attempts++;
  } while (!Number.isInteger(answer) && attempts < 100);

  if (!Number.isInteger(answer)) {
    pct = 20;
    whole = 150;
    answer = 30;
  }

  const decimal = pct / 100;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const d = gcd(pct, 100);
  const simplifiedFrac = `${pct / d}/${100 / d}`;

  const acceptedStep1 = [
    String(decimal),
    decimal.toFixed(2),
    `${pct}/100`,
    simplifiedFrac
  ];
  if (String(decimal).length === 3) {
    acceptedStep1.push(decimal.toFixed(2));

  }

  return {
    id: `find-${Date.now()}-${Math.random()}`,
    level: 'find',
    pct,
    whole,
    prompt: `What is ${pct}% of ${whole}?`,
    answer: String(answer),
    steps: [
      {
        id: 'step1',
        skill: 'convert_percent_to_decimal',
        prompt: `Turn ${pct}% into a decimal! 📝`,
        placeholder: 'e.g., 0.4 or 40/100',
        acceptedAnswers: acceptedStep1,
        method: `${pct}% means ${pct} out of 100.\n\nSo we write it as ${pct} ÷ 100.\n\nThat gives us ✅ ${decimal}!`
      },
      {
        id: 'step2',
        skill: 'multiply_by_whole',
        prompt: `Now multiply that decimal by the whole number: ${decimal} × ${whole} 🚀`,
        placeholder: 'Type the answer',
        acceptedAnswers: [String(answer)],
        method: `We take our decimal ${decimal} and multiply it by ${whole}.\n\nSo ${decimal} × ${whole} = ✅ ${answer}!`
      }
    ],
    explanation: `Let's see how we solved it:\n\n1. Turn the percent into a decimal:\n${pct}% = ${decimal}\n\n2. Multiply the decimal by our whole number:\n${decimal} × ${whole} = ${answer}!`
  };
};

const PERCENT_SKILL_LABELS = {
  convert_percent_to_decimal: 'turning a percent into a decimal',
  multiply_by_whole: 'multiplying by the whole',
};

const PERCENT_SKILL_EXPLANATION_TARGETS = {
  convert_percent_to_decimal: 'convert',
  multiply_by_whole: 'multiply',
};

const PERCENT_COLLECTIBLES = ['Moon Badge', 'Jungle Leaf', 'Rocket Chip', 'Rainbow Tile', 'Treasure Key'];

const makeMistakeRecord = () => ({ questionIds: [], escalatedQuestionIds: [] });

const makePercentMistakeHistory = () => ({
  convert_percent_to_decimal: makeMistakeRecord(),
  multiply_by_whole: makeMistakeRecord(),
});

const makeStepwiseState = (question) => ({
  questionId: question?.id || null,
  currentStepIndex: 0,
  answers: ['', ''],
  checked: [false, false],
  correct: [null, null],
  showRecap: false
});

const generateFindDiagnosticQuestion = (skill) => {
  const base = generateFindQuestion();
  const step = base.steps.find(s => s.skill === skill) || base.steps[0];

  if (skill === 'convert_percent_to_decimal') {
    return {
      ...base,
      id: `diagnostic-${skill}-${base.id}`,
      diagnosticSkill: skill,
      prompt: `Turn ${base.pct}% into a decimal! 📝`,
      answer: String(base.pct / 100),
      acceptedAnswers: step.acceptedAnswers,
      explanation: step.method,
    };
  }

  return {
    ...base,
    id: `diagnostic-${skill}-${base.id}`,
    diagnosticSkill: skill,
    prompt: `Multiply ${base.pct / 100} by ${base.whole}. 🚀`,
    answer: base.answer,
    acceptedAnswers: step.acceptedAnswers,
    explanation: step.method,
  };
};

export default function PercentApp({
  QuizLayout,
  onBack,
  onRedirectToExplanation,
  quizSession,
  setQuizSession,
  mistakeHistory = makePercentMistakeHistory(),
  setMistakeHistory,
  pendingEscalationSkill,
  setPendingEscalationSkill,
}) {
  const restored = quizSession || {};
  const [currentQuestion, setCurrentQuestion] = useState(() => restored.currentQuestion || generateFindQuestion());
  const [diagnosticQuestion, setDiagnosticQuestion] = useState(() => (
    restored.diagnosticQuestion || (pendingEscalationSkill ? generateFindDiagnosticQuestion(pendingEscalationSkill) : null)
  ));
  const [userAnswer, setUserAnswer] = useState(restored.userAnswer || '');
  const [mode, setMode] = useState(() => pendingEscalationSkill ? 'escalated_check' : (restored.mode || 'normal'));
  const [correctCount, setCorrectCount] = useState(restored.correctCount || 0);

  const [stepwiseState, setStepwiseState] = useState(() => restored.stepwiseState || makeStepwiseState(restored.currentQuestion));
  const [escalatedStepType, setEscalatedStepType] = useState(null);

  const [soundEnabled, setSoundEnabled] = useState(restored.soundEnabled ?? true);
  const [showSolutionAccordion, setShowSolutionAccordion] = useState(restored.showSolutionAccordion || false);
  const [shake, setShake] = useState(false);
  const [isCorrectFirstTry, setIsCorrectFirstTry] = useState(restored.isCorrectFirstTry ?? null);
  const [submitted, setSubmitted] = useState(restored.submitted || false);
  const [isCheckSuccess, setIsCheckSuccess] = useState(null);
  const [xp, setXp] = useState(restored.xp || 0);
  const [gems, setGems] = useState(restored.gems || 0);
  const [streak, setStreak] = useState(restored.streak || 0);
  const [collection, setCollection] = useState(restored.collection || []);
  const [rewardToast, setRewardToast] = useState(null);

  // New kid-friendly feedback states
  const [starAnimating, setStarAnimating] = useState(null);
  const [mascotExpression, setMascotExpression] = useState('idle');

  const activeQuestion = mode === 'escalated_check' ? diagnosticQuestion : currentQuestion;

  const buildSession = (overrides = {}) => ({
    currentQuestion,
    diagnosticQuestion,
    userAnswer,
    mode,
    correctCount,
    stepwiseState,
    soundEnabled,
    showSolutionAccordion,
    isCorrectFirstTry,
    submitted,
    xp,
    gems,
    streak,
    collection,
    ...overrides,
  });

  useEffect(() => {
    if (!setQuizSession) return;
    setQuizSession(buildSession());
  }, [
    currentQuestion,
    diagnosticQuestion,
    userAnswer,
    mode,
    correctCount,
    stepwiseState,
    soundEnabled,
    showSolutionAccordion,
    isCorrectFirstTry,
    submitted,
    xp,
    gems,
    streak,
    collection,
    setQuizSession,
  ]);


  useEffect(() => {
    if (!pendingEscalationSkill) return;
    setMode('escalated_check');
    setDiagnosticQuestion(generateFindDiagnosticQuestion(pendingEscalationSkill));
    setUserAnswer('');
    setSubmitted(false);
    setIsCheckSuccess(null);
    setShowSolutionAccordion(false);
  }, [pendingEscalationSkill]);

  useEffect(() => {
    if (mode !== 'stepwise' || !currentQuestion) return;
    if (stepwiseState.questionId !== currentQuestion.id) {
      setStepwiseState(makeStepwiseState(currentQuestion));
    }
  }, [mode, currentQuestion, stepwiseState.questionId]);

  const awardReward = (label, amount = 5, collectible = null) => {
    setXp(prev => prev + amount);
    setGems(prev => prev + 1);
    if (collectible) {
      setCollection(prev => prev.includes(collectible) ? prev : [...prev, collectible]);
    }
    setRewardToast({ label, amount, collectible });
    setTimeout(() => setRewardToast(null), 2200);
  };

  const maybeCollectible = (nextCorrectCount) => (
    PERCENT_COLLECTIBLES[(nextCorrectCount - 1) % PERCENT_COLLECTIBLES.length]
  );

  const handleSubmit = () => {
    if (!currentQuestion || submitted) return;
    const userParsed = cleanAndParseNum(userAnswer);
    const expected = parseFloat(currentQuestion.answer);
    if (isNaN(userParsed)) return;

    setSubmitted(true);
    const correct = Math.abs(userParsed - expected) <= 0.01;

    if (correct) {
      setIsCorrectFirstTry(true);
      playSound('correct', soundEnabled);
      triggerConfetti();

      setMascotExpression('cheering');
      setStarAnimating(correctCount);
      setTimeout(() => {
        setMascotExpression('idle');
        setStarAnimating(null);
      }, 2000);

      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      awardReward('Quest star earned!', 12, maybeCollectible(correctCount + 1));
    } else {
      setIsCorrectFirstTry(false);
      playSound('wrong', soundEnabled);
      setShake(true);

      setMascotExpression('sad');
      setTimeout(() => setMascotExpression('idle'), 2000);

      setTimeout(() => setShake(false), 500);
      awardReward('Clue path unlocked!', 4);

      setTimeout(() => {
        setMode('stepwise');
        setStepwiseState(makeStepwiseState(currentQuestion));
      }, 800);
    }
  };

  const recordSkillMistake = (skill, questionId) => {
    const existing = mistakeHistory?.[skill] || makeMistakeRecord();
    const questionIds = existing.questionIds || [];
    const escalatedQuestionIds = existing.escalatedQuestionIds || [];
    const alreadyTrackedForQuestion = questionIds.includes(questionId);
    const alreadyEscalatedForQuestion = escalatedQuestionIds.includes(questionId);
    const nextQuestionIds = alreadyTrackedForQuestion ? questionIds : [...questionIds, questionId];
    const shouldEscalate = !alreadyTrackedForQuestion && nextQuestionIds.length >= 2 && !alreadyEscalatedForQuestion;

    if (setMistakeHistory) {
      setMistakeHistory(prev => {
        const prevRecord = prev?.[skill] || makeMistakeRecord();
        const prevQuestionIds = prevRecord.questionIds || [];
        const prevEscalatedIds = prevRecord.escalatedQuestionIds || [];
        const mergedQuestionIds = prevQuestionIds.includes(questionId)
          ? prevQuestionIds
          : [...prevQuestionIds, questionId];
        const mergedEscalatedIds = shouldEscalate && !prevEscalatedIds.includes(questionId)
          ? [...prevEscalatedIds, questionId]
          : prevEscalatedIds;

        return {
          ...makePercentMistakeHistory(),
          ...prev,
          [skill]: {
            questionIds: mergedQuestionIds,
            escalatedQuestionIds: mergedEscalatedIds,
          },
        };
      });
    }

    return shouldEscalate;
  };

  const handleStepSubmit = (stepIndex) => {
    if (!currentQuestion || stepwiseState.questionId !== currentQuestion.id) return;
    const step = currentQuestion.steps[stepIndex];
    const userVal = stepwiseState.answers[stepIndex];
    const userParsed = cleanAndParseNum(userVal);

    if (isNaN(userParsed)) return;

    const isStepCorrect = step.acceptedAnswers.some(acc => {
      const accParsed = cleanAndParseNum(acc);
      return Math.abs(userParsed - accParsed) <= 0.001;
    });

    const nextCorrect = [...stepwiseState.correct];
    nextCorrect[stepIndex] = isStepCorrect;

    const nextChecked = [...stepwiseState.checked];
    nextChecked[stepIndex] = true;

    if (isStepCorrect) {
      playSound('correct', soundEnabled);
      setStreak(prev => prev + 1);

      setMascotExpression('cheering');
      setTimeout(() => setMascotExpression('idle'), 2000);

      awardReward(stepIndex === 0 ? 'Decoded!' : 'Super Math Power!', 6);
      setStepwiseState(prev => ({
        ...prev,
        correct: nextCorrect,
        checked: nextChecked,
        currentStepIndex: stepIndex === 0 ? 1 : prev.currentStepIndex,
        showRecap: stepIndex === 1 ? true : prev.showRecap
      }));
    } else {
      playSound('wrong', soundEnabled);

      setMascotExpression('sad');
      setTimeout(() => setMascotExpression('idle'), 2000);

      const shouldEscalate = recordSkillMistake(step.skill, currentQuestion.id);
      awardReward(shouldEscalate ? 'Training map opened!' : 'Hint spark found!', shouldEscalate ? 3 : 2);

      if (shouldEscalate) {
        setEscalatedStepType(step.skill);
        setStepwiseState(prev => ({ ...prev, correct: nextCorrect, checked: nextChecked }));
      } else {
        setStepwiseState(prev => ({
          ...prev,
          correct: nextCorrect,
          checked: nextChecked,
          showRecap: stepIndex === 1 ? true : prev.showRecap
        }));

      }
    }
  };


  const handleStepwiseContinue = (stepIndex) => {
    if (stepIndex === 0) {
      setStepwiseState(prev => ({ ...prev, currentStepIndex: 1 }));
    } else {
      setStepwiseState(prev => ({ ...prev, showRecap: true }));
    }
  };

  const handleCheckSubmit = () => {
    if (!diagnosticQuestion || submitted) return;
    const userParsed = cleanAndParseNum(userAnswer);
    if (isNaN(userParsed)) return;

    setSubmitted(true);
    const acceptedAnswers = diagnosticQuestion.acceptedAnswers || [diagnosticQuestion.answer];
    const correct = acceptedAnswers.some(acc => {
      const expected = cleanAndParseNum(acc);
      return Math.abs(userParsed - expected) <= 0.01;
    });

    if (correct) {
      setIsCheckSuccess(true);
      playSound('correct', soundEnabled);
      triggerConfetti();

      setMascotExpression('cheering');
      setTimeout(() => setMascotExpression('idle'), 2000);

      setStreak(prev => prev + 1);
      awardReward('Training badge powered up!', 8);
    } else {
      setIsCheckSuccess(false);
      playSound('wrong', soundEnabled);
      setShake(true);

      setMascotExpression('sad');
      setTimeout(() => setMascotExpression('idle'), 2000);

      setTimeout(() => setShake(false), 500);
      awardReward('Practice clue saved!', 2);
    }
  };

  const handleNextCheckQuestion = () => {
    const clearedSkill = pendingEscalationSkill || diagnosticQuestion?.diagnosticSkill;
    if (clearedSkill && setMistakeHistory) {
      setMistakeHistory(prev => ({
        ...makePercentMistakeHistory(),
        ...prev,
        [clearedSkill]: makeMistakeRecord(),
      }));
    }
    if (setPendingEscalationSkill) setPendingEscalationSkill(null);
    setMode('normal');
    setIsCheckSuccess(null);
    setSubmitted(false);
    setUserAnswer('');
    setIsCorrectFirstTry(null);
    setDiagnosticQuestion(null);
    const nextQuestion = generateFindQuestion();
    setCurrentQuestion(nextQuestion);
    setStepwiseState(makeStepwiseState(nextQuestion));
  };

  const handleReviewCheck = () => {
    const skill = pendingEscalationSkill || diagnosticQuestion?.diagnosticSkill || 'convert_percent_to_decimal';
    if (setPendingEscalationSkill) setPendingEscalationSkill(skill);
    if (setQuizSession) {
      setQuizSession(buildSession({
        diagnosticQuestion: null,
        userAnswer: '',
        submitted: false,
        mode: 'normal',
      }));
    }
    onRedirectToExplanation(PERCENT_SKILL_EXPLANATION_TARGETS[skill] || 'convert');
  };

  const handleNextQuestion = () => {
    const nextQuestion = generateFindQuestion();
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrectFirstTry(null);
    setShowSolutionAccordion(false);
    setDiagnosticQuestion(null);
    setCurrentQuestion(nextQuestion);
    setStepwiseState(makeStepwiseState(nextQuestion));
  };

  const handleNextQuestionStepwise = () => {
    const nextQuestion = generateFindQuestion();
    setMode('normal');
    setSubmitted(false);
    setUserAnswer('');
    setIsCorrectFirstTry(null);
    setDiagnosticQuestion(null);
    setCurrentQuestion(nextQuestion);
    setStepwiseState(makeStepwiseState(nextQuestion));
  };

  const getQuestMascotMessage = () => {
    if (escalatedStepType) {
      return 'Let us take a quick break to practice this concept together!';
    }
    if (mode === 'escalated_check') {
      if (submitted) {
        return isCheckSuccess
          ? 'Fantastic job! You solved it!'
          : 'Let us try a quick practice question to get comfortable.';

      }
      return 'Let us do a fun training game to power up your skills!';
    }
    if (mode === 'stepwise') {
      if (stepwiseState.showRecap) {
        return 'Awesome step-by-step solving! Let us review the recap.';
      }
      const activeStepIdx = stepwiseState.currentStepIndex;
      const stepChecked = stepwiseState.checked[activeStepIdx];
      const stepCorrect = stepwiseState.correct[activeStepIdx];

      if (stepChecked) {
        return stepCorrect
          ? 'Perfect! You nailed this step!'
          : 'Let us check the method below to see how it is done!';
      }
      return activeStepIdx === 0
        ? 'First, let us turn the percentage into a decimal!'
        : 'Awesome! Now multiply that decimal by the whole number!';
    }
    if (submitted) {
      return isCorrectFirstTry
        ? 'Amazing! You got it right on the first try!'
        : 'No worries, let us solve it together using clues!';
    }
    return 'Welcome to Percent Island! Find the parts, collect gems, and earn badges!';
  };

  const renderBadge = (item, idx) => {
    const isUnlocked = collection.includes(item);
    const isNext = !isUnlocked && idx === correctCount;

    let emoji = '❓';
    if (item === 'Moon Badge') emoji = '🌙';
    else if (item === 'Jungle Leaf') emoji = '🌿';
    else if (item === 'Rocket Chip') emoji = '🚀';
    else if (item === 'Rainbow Tile') emoji = '🌈';
    else if (item === 'Treasure Key') emoji = '🔑';

    let cardClass = 'percentages-collection-item locked';
    if (isUnlocked) {
      cardClass = 'percentages-collection-item unlocked';
    } else if (isNext) {
      cardClass = 'percentages-collection-item glowing-next';
    }

    return (
      <div key={item} className={cardClass} title={isUnlocked ? item : 'Mystery Badge'}>
        <span className="badge-emoji">{isUnlocked ? emoji : isNext ? '❓✨' : '❓'}</span>
        <span className="badge-name">{isUnlocked ? item : 'Mystery'}</span>
      </div>
    );
  };

  const mascotEmoji = mascotExpression === 'cheering' ? '🦉🎉' : mascotExpression === 'sad' ? '🦉📖' : '🦉';

  if (correctCount >= 3) {
    return (
      <div className="percentages-app-theme">
        <QuizLayout title="Percentages" subtitle="Find a Percentage" onBack={onBack}>
          <div className="percentages-success-view percentages-pop-in">
            <div className="percentages-success-icon">🏆</div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Level 1 Completed!</h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--clr-text-soft)', marginBottom: '30px' }}>
              Fantastic! You earned 3 stars and mastered finding percentages!
            </p>
            <div className="percentages-finale-panel">
              <div>
                <strong>{xp}</strong>
                <span>Total XP</span>
              </div>
              <div>
                <strong>{gems}</strong>
                <span>Gems Earned</span>
              </div>
              <div>
                <strong>{collection.length}</strong>
                <span>Badges Won</span>
              </div>
            </div>
            <div className="percentages-collection-shelf finale" aria-label="Final collection shelf">
              {PERCENT_COLLECTIBLES.map((item, idx) => renderBadge(item, idx))}
            </div>
            <div className="button-row" style={{ justifyContent: 'center', gap: '20px' }}>
              <button
                className="percentages-btn"
                onClick={() => {
                  const nextQuestion = generateFindQuestion();
                  setCorrectCount(0);
                  setMode('normal');
                  setSubmitted(false);
                  setUserAnswer('');
                  setIsCorrectFirstTry(null);
                  setDiagnosticQuestion(null);
                  setIsCheckSuccess(null);
                  setEscalatedStepType(null);
                  setShowSolutionAccordion(false);
                  setCurrentQuestion(nextQuestion);
                  setStepwiseState(makeStepwiseState(nextQuestion));
                  setXp(0);
                  setGems(0);
                  setStreak(0);
                  setCollection([]);
                  setRewardToast(null);
                  if (setPendingEscalationSkill) setPendingEscalationSkill(null);
                  if (setMistakeHistory) setMistakeHistory(makePercentMistakeHistory());
                }}
              >
                Play Again 🔄
              </button>
              <button
                className="percentages-btn percentages-btn-secondary"
                onClick={onBack}
              >
                Back to Map 🗺️
              </button>
            </div>
          </div>
        </QuizLayout>
      </div>
    );
  }

  return (

    <div className="percentages-app-theme">
      <QuizLayout title="Percentages" subtitle="Find a Percentage" onBack={onBack}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="percentages-mute-btn"
            aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {rewardToast && (
            <div className="percentages-reward-toast">
              <strong>+{rewardToast.amount} XP</strong>
              <span>{rewardToast.label}</span>
              {rewardToast.collectible && <em>New Badge: {rewardToast.collectible}</em>}
            </div>
          )}

          <div className="percentages-quest-shell">
            <div className="percentages-quest-title">
              <span>Percent Island</span>
              <strong>Level 1</strong>
            </div>
            <div className="percentages-quest-path" aria-label="Quest progress">
              {[0, 1, 2].map(i => (
                <div key={i} className={`percentages-path-node ${i < correctCount ? 'complete' : i === correctCount ? 'current' : ''}`}>
                  <span>{i < correctCount ? '✓' : i + 1}</span>
                </div>
              ))}
            </div>
            <div className="percentages-reward-row">
              <span key={`xp-${xp}`} className="percentages-num-bounce">⚡ XP {xp}</span>
              <span key={`gems-${gems}`} className="percentages-num-bounce">💎 Gems {gems}</span>
              <span key={`combo-${streak}`} className="percentages-num-bounce">🔥 Combo {streak}</span>
            </div>
          </div>

          <div className="percentages-collection-shelf" aria-label="Collection shelf">
            {PERCENT_COLLECTIBLES.map((item, idx) => renderBadge(item, idx))}
          </div>

          <div className="percentages-stars-row">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className={`percentages-star ${i < correctCount ? 'active' : ''} ${starAnimating === i ? 'percentages-star-earn' : ''}`}
              >
                ★
              </span>
            ))}
          </div>

          <div key={getQuestMascotMessage()} className="percentages-mascot-container percentages-pop-in">
            <span className={`percentages-mascot-emoji ${mascotExpression === 'cheering' ? 'cheering' : mascotExpression === 'sad' ? 'sad' : ''}`}>
              {mascotEmoji}
            </span>
            <div className="percentages-mascot-bubble">
              {getQuestMascotMessage()}
            </div>
          </div>

          {escalatedStepType ? (
            <div className="percentages-success-view percentages-pop-in" style={{ textAlign: 'center', padding: '30px' }}>
              <div className="percentages-check-badge">Training Stop</div>
              <p style={{ margin: '15px 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
                Let us stop and check how to do this concept together!
              </p>
              <button
                className="percentages-btn"
                onClick={() => {
                  const skill = escalatedStepType;
                  const target = PERCENT_SKILL_EXPLANATION_TARGETS[skill] || 'convert';
                  if (setQuizSession) {
                    setQuizSession(buildSession({
                      mode: 'normal',
                      diagnosticQuestion: null,
                      userAnswer: '',
                      submitted: false,
                      isCorrectFirstTry: null,
                      showSolutionAccordion: false,
                    }));
                  }
                  if (setPendingEscalationSkill) setPendingEscalationSkill(skill);
                  setEscalatedStepType(null);
                  onRedirectToExplanation(target);
                }}
              >
                Enter Training Room 📖
              </button>
            </div>
          ) : mode === 'escalated_check' ? (
            <div className={shake ? 'shake-animation' : ''}>
              <div style={{ textAlign: 'center' }} className="percentages-step-card active">
                <div className="percentages-check-badge">Training Gate</div>
                {activeQuestion && (
                  <div className="question-prompt" style={{ fontSize: '1.6rem', margin: '20px 0', fontWeight: '800' }}>
                    {activeQuestion.prompt}
                  </div>
                )}

                <input
                  className="answer-input"
                  type="text"
                  value={userAnswer}
                  onChange={e => { if (!submitted) setUserAnswer(e.target.value); }}
                  disabled={submitted}
                  placeholder="Type your answer"
                  onKeyDown={e => { if (e.key === 'Enter' && !submitted && userAnswer.trim()) handleCheckSubmit(); }}
                  autoFocus
                  style={{ fontSize: '1.3rem', padding: '12px', borderRadius: '12px', textAlign: 'center' }}
                />
              </div>

              {submitted && (
                <div className={`percentages-celebration-popup percentages-pop-in ${isCheckSuccess ? 'correct' : 'wrong'}`} style={{ borderColor: isCheckSuccess ? 'var(--clr-correct)' : 'var(--clr-wrong)', background: isCheckSuccess ? '#E8F5E9' : '#FBE9E7', marginTop: '20px' }}>
                  <div className="celebration-emoji-burst">{isCheckSuccess ? '🎉 🦉 ⭐' : '🦉 📖'}</div>
                  <h2 style={{ color: isCheckSuccess ? '#2E7D32' : '#C2185B' }}>
                    {isCheckSuccess ? 'Gate Cleared! 🌟' : 'Not Quite Yet!'}
                  </h2>
                  <p style={{ fontSize: '1.2rem' }}>
                    {isCheckSuccess ? 'Super job! You opened the training gate!' : 'Let us check the explanation to practice!'}
                  </p>
                  <div className="button-row" style={{ justifyContent: 'center', marginTop: '15px' }}>
                    {isCheckSuccess ? (
                      <button onClick={handleNextCheckQuestion} className="percentages-btn">
                        Back to the Island ➡️
                      </button>
                    ) : (
                      <button onClick={handleReviewCheck} className="percentages-btn percentages-btn-secondary">
                        Go to Training Room 📖
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!submitted && (
                <div className="button-row" style={{ justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    onClick={handleCheckSubmit}
                    disabled={!userAnswer.trim()}
                    className="percentages-btn"
                  >
                    Check Gate 🔍
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'stepwise' ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span className="percentages-check-badge" style={{ backgroundColor: '#0288D1', boxShadow: '0 3px 0 #01579B' }}>
                    Clue Path 🗺️
                  </span>
                  <span className="percentages-check-badge" style={{ backgroundColor: '#FF9800', boxShadow: '0 3px 0 #F57C00' }}>
                    {stepwiseState.showRecap ? 'Recap 🌟' : `Step ${stepwiseState.currentStepIndex + 1} of 2`}
                  </span>
                </div>
                {currentQuestion && (
                  <p style={{ fontSize: '1.3rem', margin: '5px 0', fontWeight: '800', color: 'var(--clr-text)' }}>
                    Let's solve: {currentQuestion.prompt}
                  </p>
                )}
              </div>

              <div key={stepwiseState.showRecap ? 'recap' : stepwiseState.currentStepIndex} className="percentages-card-transition-wrapper">
                {stepwiseState.showRecap ? (
                  currentQuestion && (
                    <div className="percentages-celebration-popup percentages-pop-in" style={{ marginTop: '25px', background: '#FFF8E1', borderColor: '#FFD54F' }}>
                      <div className="celebration-emoji-burst">🌟 🦉 🌟</div>
                      <h2>Let's see how we solved it!</h2>
                      <div className="percentages-step-formula" style={{ whiteSpace: 'pre-line', textAlign: 'left', marginBottom: '20px' }}>
                        {currentQuestion.explanation}
                      </div>
                      <div className="button-row" style={{ justifyContent: 'center' }}>
                        <button onClick={handleNextQuestionStepwise} className="percentages-btn">
                          Next Question ➡️
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  currentQuestion && stepwiseState.questionId === currentQuestion.id && (
                    (() => {
                      const idx = stepwiseState.currentStepIndex;
                      const step = currentQuestion.steps[idx];
                      if (!step) return null;
                      const isActive = true;
                      const isChecked = stepwiseState.checked[idx];
                      const isCorrect = stepwiseState.correct[idx];
                      const displayClass = isChecked
                        ? (isCorrect ? 'correct' : 'wrong')
                        : 'active';

                      return (
                        <div
                          key={`${currentQuestion.id}-step-${idx}`}
                          className={`percentages-step-card ${displayClass} percentages-pop-in`}
                        >
                          <div className="percentages-step-title">
                            <span>{idx === 0 ? '🎯 Clue 1:' : '🚀 Clue 2:'}</span>
                            <span>{step.prompt}</span>
                            {isChecked && (
                              <span style={{ marginLeft: 'auto', fontWeight: '900', color: isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)' }}>
                                {isCorrect ? '✓ Correct' : '✗ Try this way'}
                              </span>
                            )}
                          </div>

                          {!isChecked && isActive && (
                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                              <input
                                className="answer-input"
                                type="text"
                                value={stepwiseState.answers[idx]}
                                onChange={e => {
                                  const val = e.target.value;
                                  setStepwiseState(prev => {
                                    if (prev.questionId !== currentQuestion.id) return prev;
                                    const nextAnsw = [...prev.answers];
                                    nextAnsw[idx] = val;
                                    return { ...prev, answers: nextAnsw };
                                  });
                                }}
                                placeholder={step.placeholder}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && stepwiseState.answers[idx].trim()) {
                                    handleStepSubmit(idx);
                                  }
                                }}
                                autoFocus
                                style={{ flex: 1, minWidth: '150px' }}
                              />
                              <button
                                onClick={() => handleStepSubmit(idx)}
                                disabled={!stepwiseState.answers[idx].trim()}
                                className="percentages-btn"
                                style={{ fontSize: '1.05rem', padding: '10px 24px' }}
                              >
                                Check Clue 🔍
                              </button>
                            </div>
                          )}

                          {isChecked && !isCorrect && (
                            <div className="percentages-step-formula">
                              <p style={{ fontWeight: '800', margin: '0 0 6px 0' }}>💡 Let us see how:</p>
                              {step.method.split('\n\n').map((line, i) => (
                                <div key={i} style={{ marginBottom: '8px' }}>{line}</div>
                              ))}
                            </div>
                          )}

                          {isChecked && !isCorrect && isActive && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                              <button
                                onClick={() => handleStepwiseContinue(idx)}
                                className="percentages-btn"
                                style={{ fontSize: '1.05rem', padding: '10px 24px' }}
                              >
                                {idx === 0 ? 'Go to Step 2 ➡️' : 'Show Full Answer 🌟'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )
                )}
              </div>
            </div>
          ) : (
            <div className={shake ? 'shake-animation' : ''}>
              {currentQuestion && (
                <div style={{ textAlign: 'center' }} className="percentages-step-card active">
                  <div className="question-prompt" style={{ fontSize: '1.7rem', margin: '20px 0', fontWeight: '900' }}>
                    {currentQuestion.prompt}
                  </div>

                  <input
                    className="answer-input"
                    type="text"
                    value={userAnswer}
                    onChange={e => { if (!submitted) setUserAnswer(e.target.value); }}
                    disabled={submitted}
                    placeholder="Type your answer"
                    onKeyDown={e => { if (e.key === 'Enter' && !submitted && userAnswer.trim()) handleSubmit(); }}
                    autoFocus
                    style={{ fontSize: '1.4rem', padding: '14px', borderRadius: '16px', textAlign: 'center' }}
                  />
                </div>
              )}

              {submitted && currentQuestion && (
                <div style={{ marginTop: '20px' }}>
                  {isCorrectFirstTry ? (
                    <div className="percentages-celebration-popup percentages-pop-in">
                      <div className="celebration-emoji-burst">🎉 🦉 🌟 🦉 🎉</div>
                      <h2>Super Solver!</h2>
                      <p>Awesome! That is correct!</p>

                      <div className="percentages-accordion">
                        <div
                          className="percentages-accordion-header"
                          onClick={() => setShowSolutionAccordion(!showSolutionAccordion)}
                        >
                          <span>💡 Let's see how we solved it</span>
                          <span>{showSolutionAccordion ? '▲' : '▼'}</span>
                        </div>
                        {showSolutionAccordion && (
                          <div className="percentages-accordion-content" style={{ whiteSpace: 'pre-line' }}>
                            {currentQuestion.explanation}
                          </div>
                        )}
                      </div>

                      <div className="button-row" style={{ justifyContent: 'center', marginTop: '20px' }}>
                        <button onClick={handleNextQuestion} className="percentages-btn">
                          Next Question ➡️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="percentages-step-card wrong percentages-pop-in" style={{ textAlign: 'center', padding: '20px' }}>
                      <h3 style={{ color: 'var(--clr-wrong)', margin: '10px 0', fontSize: '1.4rem' }}>❌ Not quite right!</h3>
                      <p style={{ fontSize: '1.15rem' }}>Let's solve this together using clues!</p>
                    </div>
                  )}
                </div>
              )}

              {!submitted && (
                <div className="button-row" style={{ justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                    className="percentages-btn"
                  >
                    Check Answer 🔍
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </QuizLayout>
    </div>
  );
}
