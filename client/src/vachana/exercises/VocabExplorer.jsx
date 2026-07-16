import { useState, useEffect, useRef } from 'react';
import { VOCAB_CORPUS } from '../../vocabCorpus';

// Custom SVG Icons to replace emojis in Vocab Explorer
const ShieldsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--clr-accent)' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ShieldsIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const TargetIconLarge = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--clr-accent)' }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const TargetIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const BrainIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5a5.25 5.25 0 0 0 2.22 4.28C6.9 12.26 7 12.8 7 13.1v1.9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.9c0-.3.1-.84.78-1.32A5.25 5.25 0 0 0 20 7.5A5.5 5.5 0 0 0 14.5 2z" />
    <line x1="9" y1="22" x2="15" y2="22" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </svg>
);
const ScaleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <path d="M6 12l-3 6h6l-3-6M18 12l-3 6h6l-3-6" />
  </svg>
);
const RocketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}>
    <path d="M6 18L2 22L6 21L10 17" />
    <path d="M12 2C9 2 6 5 6 9c0 2 1 3 3 5l2 2c2 2 3 3 5 3c4 0 7-3 7-7c0-3-3-6-7-6z" />
    <line x1="17" y1="7" x2="17.01" y2="7" />
  </svg>
);
const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 0-6 6v3.5c0 3 3 5.5 6 5.5s6-2.5 6-5.5V8a6 6 0 0 0-6-6z" />
  </svg>
);
const TrophyIconBig = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', color: 'var(--clr-accent)' }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 0-6 6v3.5c0 3 3 5.5 6 5.5s6-2.5 6-5.5V8a6 6 0 0 0-6-6z" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CurrentIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const BookOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const TermSelectedIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', color: 'var(--clr-accent)' }}>
    <circle cx="12" cy="12" r="6" />
  </svg>
);
const TermUnselectedIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', opacity: 0.4 }}>
    <circle cx="12" cy="12" r="8" />
  </svg>
);
const SwordsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" y1="14" x2="9" y2="18" />
    <line x1="7" y1="17" x2="3" y2="21" />
    <line x1="3" y1="19" x2="5" y2="21" />
  </svg>
);

// Helper to generate a question structure for Vocab Explorer
function generateVocabQuestion(word, type, allWords) {
  const strandWords = allWords.filter(w => w.strand === word.strand && w.id !== word.id);
  const tierWords = allWords.filter(w => w.tier === word.tier && w.id !== word.id);
  const generalPool = allWords.filter(w => w.id !== word.id);
  
  const getDistractors = (pool, n) => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  let distPool = strandWords;
  if (distPool.length < 3) distPool = [...distPool, ...tierWords.filter(w => !distPool.some(d => d.id === w.id))];
  if (distPool.length < 3) distPool = [...distPool, ...generalPool.filter(w => !distPool.some(d => d.id === w.id))];

  const distractors = getDistractors(distPool, 3);

  if (type === 'discrimination' && word.is_confusable) {
    const isMathSentence = Math.random() < 0.5;
    
    const everydaySentences = {
      "equal": "All citizens are born free and equal in dignity and rights.",
      "second": "Hold on, I will be there in just one second!",
      "digit": "The doctor examined the injured digit on my left foot.",
      "difference": "There is a massive difference in quality between these two materials.",
      "measure": "We must take immediate measures to solve this problem.",
      "multiple": "He suffered multiple injuries after falling from the tree.",
      "divide": "A deep disagreement threatened to divide the whole family.",
      "estimate": "The mechanic gave me a written estimate for the car repairs.",
      "sum": "She received a large sum of money from her grandfather's will.",
      "odd": "It felt odd to be sitting in a completely empty classroom.",
      "even": "The table was placed on an uneven lawn, making it hard to keep it even.",
      "face": "She washed her face with cold water to wake up.",
      "row": "The two neighbors had a loud row about the fence line.",
      "product": "Our supermarket sells local dairy products and vegetables.",
      "angle": "She was trying to find a new angle to write the news article.",
      "respectively": "He spoke respectfully to the elderly teacher.",
      "quotient": "Her emotional quotient was very high, helping her relate to others.",
      "each": "Each of the children received a shiny red balloon.",
      "key": "She lost the key to her apartment and had to call a locksmith.",
      "area": "There is a designated play area for toddlers in the park.",
      "remainder": "He spent the remainder of his life traveling across Europe.",
      "volume": "Please turn down the volume of the television set.",
      "grid": "The city layout is designed as a square street grid.",
      "factor": "Hard work is a key factor in achieving personal success.",
      "prime": "This plot of land is a prime location for building a new shop.",
      "composite": "The design is a composite of modern and classical styles.",
      "translation": "He works as a professional translator translating documents.",
      "reflection": "The smooth lake surface showed a perfect reflection of the mountain.",
      "average": "An average person needs around eight hours of sleep per night.",
      "degree": "She earned a university degree in English literature.",
      "edge": "He sat carefully on the edge of the high cliff.",
      "net": "The fisherman mended his fishing net before going out to sea.",
      "proportion": "A large proportion of the city population uses public transport.",
      "mean": "It was mean of him to ignore his friend's birthday party.",
      "justify": "You cannot justify stealing under any circumstances.",
      "variable": "The weather in spring is highly variable and unpredictable.",
      "coefficient": "The two factors act as coefficients in raising productivity.",
      "expression": "A smile is a natural expression of happiness.",
      "constant": "He lived in constant fear of losing his job.",
      "expand": "Water will expand when it freezes into ice."
    };

    const everydaySent = everydaySentences[word.term] || `The term '${word.term}' was used in the discussion yesterday.`;
    const prompt = isMathSentence
      ? `Identify the sense of the word "${word.term}" in this sentence:\n\n"${word.example_sentence}"`
      : `Identify the sense of the word "${word.term}" in this sentence:\n\n"${everydaySent}"`;

    const correctAnswer = isMathSentence ? 'Mathematical meaning' : 'Everyday meaning';
    const explanation = isMathSentence
      ? `In this math context, "${word.term}" means: "${word.definition}"`
      : `In this everyday context, "${word.term}" means: "${word.everyday_meaning}"`;

    return {
      id: `${word.id}_disc_${isMathSentence ? 'math' : 'every'}`,
      wordId: word.id,
      type: 'mcq',
      variant: 'discrimination',
      prompt,
      options: ['Everyday meaning', 'Mathematical meaning'],
      answer: correctAnswer,
      explanation
    };
  }

  if (type === 'application') {
    const regex = new RegExp(`\\b${word.term}\\b`, 'gi');
    const promptText = word.example_sentence.replace(regex, '__________');
    const prompt = `Fill in the blank with the correct mathematical term:\n\n"${promptText}"`;
    
    const ansTerm = word.term.charAt(0).toUpperCase() + word.term.slice(1);
    const correctOption = ansTerm;
    
    const options = [correctOption, ...distractors.map(d => d.term.charAt(0).toUpperCase() + d.term.slice(1))];
    options.sort(() => 0.5 - Math.random());

    return {
      id: `${word.id}_app`,
      wordId: word.id,
      type: 'mcq',
      variant: 'application',
      prompt,
      options,
      answer: correctOption,
      explanation: `"${word.term}" means: "${word.definition}"`
    };
  }

  const isQuestioningDefinition = Math.random() < 0.5;
  if (isQuestioningDefinition) {
    const prompt = `What is the mathematical definition of "${word.term}"?`;
    const correctOption = word.definition;
    const options = [correctOption, ...distractors.map(d => d.definition)];
    options.sort(() => 0.5 - Math.random());

    return {
      id: `${word.id}_rec_def`,
      wordId: word.id,
      type: 'mcq',
      variant: 'recognition',
      prompt,
      options,
      answer: correctOption,
      explanation: `The definition of "${word.term}" is: "${word.definition}"`
    };
  } else {
    const prompt = `Which mathematical term matches this definition?\n\n"${word.definition}"`;
    const correctOption = word.term.charAt(0).toUpperCase() + word.term.slice(1);
    const options = [correctOption, ...distractors.map(d => d.term.charAt(0).toUpperCase() + d.term.slice(1))];
    options.sort(() => 0.5 - Math.random());

    return {
      id: `${word.id}_rec_term`,
      wordId: word.id,
      type: 'mcq',
      variant: 'recognition',
      prompt,
      options,
      answer: correctOption,
      explanation: `"${word.term}" means: "${word.definition}"`
    };
  }
}

const getLevelType = (levelIndex) => {
  if (levelIndex === 1 || levelIndex === 3) return 'teach';
  if (levelIndex === 2 || levelIndex === 4) return 'standard';
  if (levelIndex === 5) return 'review';
  if (levelIndex === 6) return 'boss';
  if (levelIndex === 7) return 'final_exam';
  return 'standard';
};

// ── Styled Confirm Modal ──────────────────────────────────────────────────────
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Continue', cancelLabel = 'Cancel', danger = false }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      <div style={{
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: '20px',
        padding: '32px 28px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Icon */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: danger ? 'rgba(239,83,80,0.12)' : 'rgba(232,134,74,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={danger ? '#ef5350' : 'var(--clr-accent)'}
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>
        {/* Title */}
        <h3 style={{
          margin: '0 0 10px', textAlign: 'center',
          fontSize: '1.15rem', fontWeight: '700',
          fontFamily: 'var(--font-display)', color: 'var(--clr-text)'
        }}>{title}</h3>
        {/* Message */}
        <p style={{
          margin: '0 0 28px', textAlign: 'center',
          fontSize: '0.92rem', color: 'var(--clr-text-soft)', lineHeight: '1.55'
        }}>{message}</p>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px 0',
              background: 'transparent',
              border: '1px solid var(--clr-border)',
              borderRadius: '10px', cursor: 'pointer',
              color: 'var(--clr-text-soft)', fontWeight: '600', fontSize: '0.9rem',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}
          >{cancelLabel}</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px 0',
              background: danger ? '#ef5350' : 'var(--clr-accent)',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              color: '#fff', fontWeight: '700', fontSize: '0.9rem',
              boxShadow: danger ? '0 4px 14px rgba(239,83,80,0.3)' : '0 4px 14px rgba(232,134,74,0.3)',
              transition: 'filter 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function VocabExplorer() {
  // --- Vocab Explorer State (Mastery-Driven) ---
  const [vocabState, setVocabState] = useState(() => {
    try {
      const stored = localStorage.getItem('tenali_vocab_progress');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return {
      currentTier: 1,
      currentLevelIndex: 1,
      wordStates: {},
      tierStates: { '1': 'in_progress' },
      placementCompleted: false,
      isPlacing: false,
      placementStep: 0,
      placementTier: 4,
      placementAnswers: [],
      failedLevelIndex: null,
      failedLevelType: null,
      reteachWordIds: []
    };
  });

  const saveVocabState = (newState) => {
    setVocabState(newState);
    try {
      localStorage.setItem('tenali_vocab_progress', JSON.stringify(newState));
    } catch {
      // Ignore
    }
  };

  // Active session variables
  const [selectedTerm, setSelectedTerm] = useState('zero');
  const [vocabSessionActive, setVocabSessionActive] = useState(false);
  const [vocabSessionQuestions, setVocabSessionQuestions] = useState([]);
  const [vocabSessionQIndex, setVocabSessionQIndex] = useState(0);
  const [vocabSessionAnswers, setVocabSessionAnswers] = useState([]);
  const [vocabSessionIncorrectWords, setVocabSessionIncorrectWords] = useState([]);
  const [vocabSelectedMcq, setVocabSelectedMcq] = useState(null);
  const [vocabHasAnswered, setVocabHasAnswered] = useState(false);
  const [vocabSessionFinished, setVocabSessionFinished] = useState(false);
  const [vocabSessionSelections, setVocabSessionSelections] = useState([]);
  const [vocabIsLoadingPlacement, setVocabIsLoadingPlacement] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }
  const autoAdvanceTimeoutRef = useRef(null);
  const clearAutoAdvance = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const startVocabSession = (customType = null, customTier = null) => {
    const targetTier = customTier || vocabState.currentTier;
    const targetLevelIndex = (customTier && customTier !== vocabState.currentTier) ? 1 : vocabState.currentLevelIndex;
    const targetFailedLevelIndex = (customTier && customTier !== vocabState.currentTier) ? null : vocabState.failedLevelIndex;

    const tierWords = VOCAB_CORPUS.filter(w => w.tier === targetTier);
    let levelType = customType || (targetLevelIndex === 7 ? 'final_exam' : getLevelType(targetLevelIndex));
    let targetWords = [];
    let questions = [];

    if (targetFailedLevelIndex !== null) {
      levelType = 'reteach';
    }

    if (customTier && customTier !== vocabState.currentTier) {
      saveVocabState({
        ...vocabState,
        currentTier: customTier,
        currentLevelIndex: 1,
        failedLevelIndex: null
      });
    }

    if (levelType === 'teach') {
      setVocabSessionActive(true);
      setVocabSessionQuestions([]);
      setVocabSessionQIndex(0);
      setVocabSessionAnswers([]);
      setVocabSessionSelections([]);
      setVocabSessionIncorrectWords([]);
      setVocabSessionFinished(false);
      const chunkIndex = targetLevelIndex === 1 ? 0 : 5;
      if (tierWords[chunkIndex]) {
        setSelectedTerm(tierWords[chunkIndex].term);
      }
      return;
    }

    if (levelType === 'standard') {
      const startIdx = targetLevelIndex === 2 ? 0 : 5;
      targetWords = tierWords.slice(startIdx, startIdx + 5);
      
      targetWords.forEach(word => {
        questions.push(generateVocabQuestion(word, 'recognition', VOCAB_CORPUS));
        if (word.is_confusable) {
          questions.push(generateVocabQuestion(word, 'discrimination', VOCAB_CORPUS));
        } else {
          questions.push(generateVocabQuestion(word, 'application', VOCAB_CORPUS));
        }
      });
      questions.sort(() => 0.5 - Math.random());
    } else if (levelType === 'review') {
      const pool = VOCAB_CORPUS.filter(w => w.tier < targetTier || 
        (w.tier === targetTier && tierWords.indexOf(w) < 10));
      
      const sortedPool = [...pool].sort((a, b) => {
        const stateA = vocabState.wordStates[a.id]?.status || 'unseen';
        const stateB = vocabState.wordStates[b.id]?.status || 'unseen';
        const scoreA = stateA === 'mastered' ? 1 : 0;
        const scoreB = stateB === 'mastered' ? 1 : 0;
        return scoreA - scoreB;
      });

      const selectedWords = sortedPool.slice(0, 15);
      selectedWords.forEach(word => {
        const types = ['recognition', 'application'];
        if (word.is_confusable) types.push('discrimination');
        const randType = types[Math.floor(Math.random() * types.length)];
        questions.push(generateVocabQuestion(word, randType, VOCAB_CORPUS));
      });
      questions.sort(() => 0.5 - Math.random());
    } else if (levelType === 'boss') {
      tierWords.forEach(word => {
        questions.push(generateVocabQuestion(word, 'recognition', VOCAB_CORPUS));
        if (word.is_confusable) {
          questions.push(generateVocabQuestion(word, 'discrimination', VOCAB_CORPUS));
        } else {
          questions.push(generateVocabQuestion(word, 'application', VOCAB_CORPUS));
        }
      });
      questions.sort(() => 0.5 - Math.random());
    } else if (levelType === 'reteach') {
      const reteachWords = VOCAB_CORPUS.filter(w => vocabState.reteachWordIds.includes(w.id));
      let count = 0;
      while (questions.length < 8 && reteachWords.length > 0 && count < 3) {
        reteachWords.forEach(word => {
          if (questions.length < 8) {
            const types = ['recognition', 'application'];
            if (word.is_confusable) types.push('discrimination');
            const randType = types[Math.floor(Math.random() * types.length)];
            questions.push(generateVocabQuestion(word, randType, VOCAB_CORPUS));
          }
        });
        count++;
      }
      questions.sort(() => 0.5 - Math.random());
    } else if (levelType === 'final_exam') {
      const sortedPool = [...VOCAB_CORPUS].sort((a, b) => {
        const stateA = vocabState.wordStates[a.id]?.status || 'unseen';
        const stateB = vocabState.wordStates[b.id]?.status || 'unseen';
        const scoreA = stateA === 'mastered' ? 1 : 0;
        const scoreB = stateB === 'mastered' ? 1 : 0;
        return scoreA - scoreB;
      });
      const selectedWords = sortedPool.slice(0, 40);
      selectedWords.forEach(word => {
        const types = ['recognition', 'application'];
        if (word.is_confusable) types.push('discrimination');
        const randType = types[Math.floor(Math.random() * types.length)];
        questions.push(generateVocabQuestion(word, randType, VOCAB_CORPUS));
      });
      questions.sort(() => 0.5 - Math.random());
    }

    setVocabSessionQuestions(questions);
    setVocabSessionQIndex(0);
    setVocabSessionAnswers([]);
    setVocabSessionSelections([]);
    setVocabSessionIncorrectWords([]);
    setVocabSelectedMcq(null);
    setVocabHasAnswered(false);
    setVocabSessionFinished(false);
    clearAutoAdvance();
    setVocabSessionActive(true);
  };

  const startPlacementCheck = () => {
    const startTier = 4;
    const wordPool = VOCAB_CORPUS.filter(w => w.tier === startTier);
    // eslint-disable-next-line react-hooks/purity
    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    const types = ['recognition', 'application'];
    if (randomWord.is_confusable) types.push('discrimination');
    // eslint-disable-next-line react-hooks/purity
    const randType = types[Math.floor(Math.random() * types.length)];
    const question = generateVocabQuestion(randomWord, randType, VOCAB_CORPUS);

    const newState = {
      ...vocabState,
      isPlacing: true,
      placementStep: 1,
      placementTier: startTier,
      placementAnswers: []
    };
    saveVocabState(newState);

    setVocabSessionQuestions([question]);
    setVocabSessionQIndex(0);
    setVocabSessionAnswers([]);
    setVocabSessionSelections([]);
    setVocabSessionIncorrectWords([]);
    setVocabSelectedMcq(null);
    setVocabHasAnswered(false);
    setVocabSessionFinished(false);
    clearAutoAdvance();
    setVocabSessionActive(true);
  };

  const handlePlacementAnswer = (isCorrect) => {
    const currentQ = vocabSessionQuestions[vocabSessionQIndex];
    const newAnswers = [...vocabState.placementAnswers, {
      tier: vocabState.placementTier,
      wordId: currentQ.wordId,
      correct: isCorrect
    }];

    if (vocabState.placementStep < 15) {
      let nextTier = vocabState.placementTier;
      if (isCorrect) {
        nextTier = Math.min(8, nextTier + 1);
      } else {
        nextTier = Math.max(1, nextTier - 1);
      }

      const wordPool = VOCAB_CORPUS.filter(w => w.tier === nextTier);
      const seenWordIds = newAnswers.map(a => a.wordId);
      let availableWords = wordPool.filter(w => !seenWordIds.includes(w.id));
      if (availableWords.length === 0) availableWords = wordPool;
      // eslint-disable-next-line react-hooks/purity
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      
      const types = ['recognition', 'application'];
      if (randomWord.is_confusable) types.push('discrimination');
      // eslint-disable-next-line react-hooks/purity
      const randType = types[Math.floor(Math.random() * types.length)];
      const nextQ = generateVocabQuestion(randomWord, randType, VOCAB_CORPUS);

      const newState = {
        ...vocabState,
        placementStep: vocabState.placementStep + 1,
        placementTier: nextTier,
        placementAnswers: newAnswers
      };
      saveVocabState(newState);

      setVocabSessionQuestions(prev => [...prev, nextQ]);
      setVocabSessionQIndex(prev => prev + 1);
      setVocabSelectedMcq(null);
      setVocabHasAnswered(false);
    } else {
      let placedTier = vocabState.placementTier;
      if (!isCorrect) {
        placedTier = Math.max(1, placedTier - 1);
      }

      const newTierStates = { ...vocabState.tierStates };
      for (let t = 1; t <= placedTier; t++) {
        newTierStates[String(t)] = t === placedTier ? 'in_progress' : 'certified';
      }

      const newWordStates = { ...vocabState.wordStates };
      VOCAB_CORPUS.forEach(word => {
        if (word.tier < placedTier) {
          newWordStates[word.id] = {
            status: 'mastered',
            correctCount: 2,
            seenCount: 2
          };
        }
      });

      const newState = {
        ...vocabState,
        currentTier: placedTier,
        currentLevelIndex: 1,
        tierStates: newTierStates,
        wordStates: newWordStates,
        placementCompleted: true,
        isPlacing: true,
        placementAnswers: newAnswers
      };
      saveVocabState(newState);
      setVocabSessionFinished(true);
    }
  };

  const handleVocabAnswerSubmit = (option) => {
    const selected = (typeof option === 'string') ? option : vocabSelectedMcq;
    if (!selected) return;

    const currentQ = vocabSessionQuestions[vocabSessionQIndex];
    const isCorrect = selected === currentQ.answer;

    setVocabSelectedMcq(selected);
    setVocabHasAnswered(true);

    const newSelections = [...vocabSessionSelections, selected];
    setVocabSessionSelections(newSelections);

    const newAnswers = [...vocabSessionAnswers, isCorrect];
    setVocabSessionAnswers(newAnswers);

    autoAdvanceTimeoutRef.current = setTimeout(handleVocabNextQuestion, 3000);

    if (!vocabState.isPlacing) {
      const wordId = currentQ.wordId;
      const newWordStates = { ...vocabState.wordStates };
      const currentWordState = newWordStates[wordId] || { status: 'unseen', correctCount: 0, seenCount: 0 };
      
      currentWordState.seenCount++;
      if (isCorrect) {
        currentWordState.correctCount++;
        if (currentWordState.status === 'unseen' || currentWordState.status === 'introduced') {
          currentWordState.status = 'practicing';
        } else if (currentWordState.status === 'practicing' && currentWordState.correctCount >= 2) {
          currentWordState.status = 'consolidated';
        } else if (currentWordState.status === 'consolidated' && currentWordState.correctCount >= 4) {
          currentWordState.status = 'mastered';
        }
      } else {
        if (currentWordState.status === 'mastered') {
          currentWordState.status = 'practicing';
        }
        currentWordState.correctCount = Math.max(0, currentWordState.correctCount - 1);
        
        if (!vocabSessionIncorrectWords.includes(wordId)) {
          setVocabSessionIncorrectWords([...vocabSessionIncorrectWords, wordId]);
        }
      }

      newWordStates[wordId] = currentWordState;
      saveVocabState({
        ...vocabState,
        wordStates: newWordStates
      });
    }
  };

  const handleVocabPrevQuestion = () => {
    clearAutoAdvance();
    if (vocabSessionQIndex > 0) {
      setVocabSessionQIndex(vocabSessionQIndex - 1);
    }
  };

  const handleVocabNextQuestion = () => {
    clearAutoAdvance();

    if (vocabSessionQIndex < vocabSessionSelections.length) {
      setVocabSessionQIndex(vocabSessionQIndex + 1);
      if (vocabSessionQIndex + 1 === vocabSessionSelections.length) {
        setVocabSelectedMcq(null);
        setVocabHasAnswered(false);
      }
      return;
    }

    if (vocabState.isPlacing) {
      handlePlacementAnswer(vocabSessionAnswers[vocabSessionAnswers.length - 1]);
      return;
    }

    if (vocabSessionQIndex < vocabSessionQuestions.length - 1) {
      setVocabSessionQIndex(vocabSessionQIndex + 1);
      setVocabSelectedMcq(null);
      setVocabHasAnswered(false);
    } else {
      const correctCount = vocabSessionAnswers.filter(Boolean).length;
      const totalCount = vocabSessionQuestions.length;
      const scorePct = (correctCount / totalCount) * 100;
      
      let levelType = vocabState.failedLevelIndex !== null ? 'reteach' : (vocabState.currentLevelIndex === 7 ? 'final_exam' : getLevelType(vocabState.currentLevelIndex));
      let threshold = (levelType === 'boss' || levelType === 'final_exam') ? 90 : 80;
      const passed = scorePct >= threshold;

      let newState = { ...vocabState };

      if (passed) {
        if (levelType === 'reteach') {
          newState.failedLevelIndex = null;
          newState.failedLevelType = null;
          newState.reteachWordIds = [];
        } else if (levelType === 'boss') {
          newState.tierStates[String(vocabState.currentTier)] = 'certified';
          if (vocabState.currentTier < 8) {
            newState.currentTier++;
            newState.currentLevelIndex = 1;
            newState.tierStates[String(newState.currentTier)] = 'in_progress';
          } else {
            newState.currentLevelIndex = 7;
          }
        } else if (levelType === 'final_exam') {
          newState.mastered = true;
        } else {
          newState.currentLevelIndex++;
        }
      } else {
        if (levelType !== 'reteach') {
          newState.failedLevelIndex = vocabState.currentLevelIndex;
          newState.failedLevelType = levelType;
          newState.reteachWordIds = [...vocabSessionIncorrectWords];
        }
      }

      saveVocabState(newState);
      setVocabSessionFinished(true);
    }
  };

  const handleResetVocab = () => {
    const defaultState = {
      currentTier: 1,
      currentLevelIndex: 1,
      wordStates: {},
      tierStates: { '1': 'in_progress' },
      placementCompleted: false,
      isPlacing: false,
      placementStep: 0,
      placementTier: 4,
      placementAnswers: [],
      failedLevelIndex: null,
      failedLevelType: null,
      reteachWordIds: []
    };
    saveVocabState(defaultState);
    setVocabSessionActive(false);
    setVocabSessionFinished(false);
    setSelectedTerm('zero');
  };



  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!vocabSessionActive || vocabSessionFinished || vocabSessionQuestions.length === 0) return;
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      const currentQ = vocabSessionQuestions[vocabSessionQIndex];
      if (!currentQ) return;
      const key = e.key;

      const isPastQuestion = vocabSessionQIndex < vocabSessionSelections.length;
      const currentQHasAnswered = isPastQuestion ? true : vocabHasAnswered;

      if (!currentQHasAnswered) {
        if ((key === '1' || key === 'numpad1') && currentQ.options.length > 0) {
          e.preventDefault();
          setVocabSelectedMcq(currentQ.options[0]);
        } else if ((key === '2' || key === 'numpad2') && currentQ.options.length > 1) {
          e.preventDefault();
          setVocabSelectedMcq(currentQ.options[1]);
        } else if ((key === '3' || key === 'numpad3') && currentQ.options.length > 2) {
          e.preventDefault();
          setVocabSelectedMcq(currentQ.options[2]);
        } else if ((key === '4' || key === 'numpad4') && currentQ.options.length > 3) {
          e.preventDefault();
          setVocabSelectedMcq(currentQ.options[3]);
        }
      }

      if (key === 'Enter' || key === 'Enter') {
        e.preventDefault();
        if (!currentQHasAnswered) {
          if (vocabSelectedMcq) {
            handleVocabAnswerSubmit();
          }
        } else {
          handleVocabNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vocabSessionActive, vocabSessionFinished, vocabSessionQuestions, vocabSessionQIndex, vocabHasAnswered, vocabSelectedMcq, vocabSessionSelections, handleVocabAnswerSubmit, handleVocabNextQuestion]);

  const handleCompleteTeachLevel = () => {
    const tierWords = VOCAB_CORPUS.filter(w => w.tier === vocabState.currentTier);
    const startIdx = vocabState.currentLevelIndex === 1 ? 0 : 5;
    const chunkWords = tierWords.slice(startIdx, startIdx + 5);

    const newWordStates = { ...vocabState.wordStates };
    chunkWords.forEach(word => {
      if (!newWordStates[word.id]) {
        newWordStates[word.id] = {
          status: 'introduced',
          correctCount: 0,
          seenCount: 0
        };
      }
    });

    const newState = {
      ...vocabState,
      currentLevelIndex: vocabState.currentLevelIndex + 1,
      wordStates: newWordStates
    };
    saveVocabState(newState);
    
    setVocabSessionActive(false);
    setTimeout(() => {
      let targetWords = tierWords.slice(startIdx, startIdx + 5);
      let questions = [];
      targetWords.forEach(word => {
        questions.push(generateVocabQuestion(word, 'recognition', VOCAB_CORPUS));
        if (word.is_confusable) {
          questions.push(generateVocabQuestion(word, 'discrimination', VOCAB_CORPUS));
        } else {
          questions.push(generateVocabQuestion(word, 'application', VOCAB_CORPUS));
        }
      });
      questions.sort(() => 0.5 - Math.random());
      
      setVocabSessionQuestions(questions);
      setVocabSessionQIndex(0);
      setVocabSessionAnswers([]);
      setVocabSessionSelections([]);
      setVocabSessionIncorrectWords([]);
      setVocabSelectedMcq(null);
      setVocabHasAnswered(false);
      setVocabSessionFinished(false);
      setVocabSessionActive(true);
    }, 50);
  };

  const renderTierCard = (tierNum) => {
    const isCurrent = vocabState.currentTier === tierNum;
    const status = vocabState.tierStates[String(tierNum)] || (tierNum === 1 ? 'in_progress' : 'locked');
    const isCertified = status === 'certified';
    const isUnlocked = true; // All tiers are fully unlocked and accessible by default

    let tierLabel = '';
    if (tierNum === 1) tierLabel = 'Reception';
    else if (tierNum === 8) tierLabel = 'Beyond KS3';
    else tierLabel = `Year ${tierNum - 1}`;

    let color = 'rgba(255,255,255,0.35)';
    let bg = 'rgba(255,255,255,0.01)';
    let border = '1px solid rgba(255,255,255,0.04)';
    
    if (isCurrent) {
      color = 'var(--clr-text)';
      bg = 'rgba(232, 134, 74, 0.06)';
      border = '1px solid rgba(232, 134, 74, 0.4)';
    } else if (isCertified) {
      color = 'var(--clr-text)';
      bg = 'rgba(92, 184, 122, 0.04)';
      border = '1px solid rgba(92, 184, 122, 0.25)';
    } else if (isUnlocked) {
      color = 'var(--clr-text)';
      bg = 'rgba(255,255,255,0.03)';
      border = '1px solid rgba(255,255,255,0.08)';
    }

    return (
      <div
        key={tierNum}
        onClick={() => {
          // Click directly starts the session for this tier!
          startVocabSession(null, tierNum);
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '16px',
          borderRadius: '16px',
          background: bg,
          border,
          color,
          cursor: 'pointer',
          boxShadow: isCurrent ? '0 4px 15px rgba(232, 134, 74, 0.15)' : 'none',
          transition: 'all 0.2s ease',
          minHeight: '110px'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          if (!isCurrent) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          if (!isCurrent) e.currentTarget.style.borderColor = isCertified ? 'rgba(92, 184, 122, 0.25)' : 'rgba(255,255,255,0.08)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: isCurrent ? 'var(--clr-accent)' : 'var(--clr-text-soft)' }}>
            LEVEL {tierNum}
          </span>
          {isCertified ? (
            <span style={{ color: 'var(--clr-correct)', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
              <CheckIcon /> Certified
            </span>
          ) : isCurrent ? (
            <span style={{ color: 'var(--clr-accent)', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
              <CurrentIcon /> Current
            </span>
          ) : null}
        </div>
        
        <strong style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--clr-text)' }}>
          {tierLabel}
        </strong>
      </div>
    );
  };

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        danger
        confirmLabel="Yes, Reset"
        cancelLabel="Keep Progress"
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header section */}

      {/* 1.5 ADAPTIVE TEST LOADING SCREEN */}
      {vocabIsLoadingPlacement && (
        <div style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: '24px',
          padding: '40px 28px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          width: '100%',
          margin: '20px auto',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ marginBottom: '16px', transform: 'scale(1.8)' }}><ShieldsIcon /></div>
          <h4 style={{
            fontSize: '1.6rem',
            fontWeight: '700',
            marginBottom: '8px',
            fontFamily: 'var(--font-display)',
            color: 'var(--clr-accent)'
          }}>
            Placement Test: Test Your Might
          </h4>
          <p style={{
            color: 'var(--clr-text-soft)',
            fontSize: '0.98rem',
            lineHeight: '1.6',
            marginBottom: '32px',
            maxWidth: '540px',
            margin: '0 auto 32px'
          }}>
            This adaptive test dynamically adjusts difficulty to calibrate and match your vocabulary tier. You will be tested on the following question types:
          </p>

          {/* Categories Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            textAlign: 'left',
            marginBottom: '36px'
          }}>
            {/* Category 1 */}
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TargetIconLarge />
                <strong style={{ fontSize: '0.9rem', color: '#2ea043', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Mathematical Definition
                </strong>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
                Identify the formal mathematical definition of key vocabulary terms.
              </span>
            </div>

            {/* Category 2 */}
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DocumentIcon />
                <strong style={{ fontSize: '0.9rem', color: '#9c27b0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Term Identification
                </strong>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
                Match terms to their corresponding formal math definitions.
              </span>
            </div>

            {/* Category 3 */}
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainIcon />
                <strong style={{ fontSize: '0.9rem', color: '#2196f3', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Context Application
                </strong>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
                Apply math terms correctly to fill in missing gaps in sentences.
              </span>
            </div>

            {/* Category 4 */}
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ScaleIcon />
                <strong style={{ fontSize: '0.9rem', color: '#e67e22', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Semantic Discrimination
                </strong>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
                Distinguish everyday English senses from formal math meanings.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => setVocabIsLoadingPlacement(false)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text-soft)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setVocabIsLoadingPlacement(false);
                startPlacementCheck();
              }}
              className="submit-btn"
              style={{
                padding: '12px 32px',
                background: 'var(--clr-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                boxShadow: '0 4px 15px rgba(232, 134, 74, 0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Begin Adaptive Test <RocketIcon />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2. PLACEMENT / ACTIVE SESSION QUIZ SCREEN */}
      {vocabSessionActive && !vocabSessionFinished && vocabSessionQuestions.length > 0 && (
        <div style={{ width: '100%', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
          {/* Progress Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize: '0.88rem',
              color: 'var(--clr-text-soft)',
              marginBottom: '10px'
            }}>
              <span style={{ fontWeight: '500' }}>
                {vocabState.isPlacing
                  ? `Placement Test — Question ${vocabState.placementStep} of 15`
                  : vocabState.failedLevelIndex !== null
                    ? `Reteach Micro-Level — Question ${vocabSessionQIndex + 1} of ${vocabSessionQuestions.length}`
                    : vocabState.currentLevelIndex === 7
                      ? `Final Mastery Exam — Question ${vocabSessionQIndex + 1} of ${vocabSessionQuestions.length}`
                      : `Level ${vocabState.currentTier} · Stage ${vocabState.currentLevelIndex} — Question ${vocabSessionQIndex + 1} of ${vocabSessionQuestions.length}`
                }
              </span>
              <span style={{
                fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.06)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                {!vocabState.isPlacing && `Pass Target: ${vocabState.currentLevelIndex === 6 || vocabState.currentLevelIndex === 7 ? '90%' : '80%'}`}
              </span>
            </div>
            {/* Slim progress bar with glowing accent */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                width: `${vocabState.isPlacing
                  ? (vocabState.placementStep / 15) * 100
                  : ((vocabSessionQIndex + (vocabHasAnswered ? 1 : 0)) / vocabSessionQuestions.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--clr-accent) 0%, #ffaa66 100%)',
                boxShadow: '0 0 8px var(--clr-accent)',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>
          </div>

          {/* Main Question Card (Typeform Style) */}
          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Header / Top Badges Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              {/* Strand Label */}
              {!vocabState.isPlacing ? (
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: 'var(--clr-accent)',
                  background: 'rgba(232, 134, 74, 0.1)',
                  border: '1px solid rgba(232, 134, 74, 0.2)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.05em'
                }}>
                  {VOCAB_CORPUS.find(w => w.id === vocabSessionQuestions[vocabSessionQIndex].wordId)?.strand.replace('_', ' ')}
                </div>
              ) : <div />}

              {/* Question Type Badge */}
              {(() => {
                const qId = vocabSessionQuestions[vocabSessionQIndex].id || '';
                let badgeText = '';
                let badgeStyle = {};
                
                if (qId.endsWith('_rec_def')) {
                  badgeText = 'Mathematical Definition';
                  badgeStyle = { color: 'var(--clr-correct, #2ea043)', background: 'rgba(46, 160, 67, 0.1)', border: '1px solid rgba(46, 160, 67, 0.2)' };
                } else if (qId.endsWith('_rec_term')) {
                  badgeText = 'Term Identification';
                  badgeStyle = { color: '#9c27b0', background: 'rgba(156, 39, 176, 0.1)', border: '1px solid rgba(156, 39, 176, 0.2)' };
                } else if (qId.endsWith('_app')) {
                  badgeText = 'Context Application';
                  badgeStyle = { color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.2)' };
                } else if (qId.includes('_disc')) {
                  badgeText = 'Semantic Discrimination';
                  badgeStyle = { color: '#e67e22', background: 'rgba(230, 126, 34, 0.1)', border: '1px solid rgba(230, 126, 34, 0.2)' };
                }

                if (badgeText) {
                  return (
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      letterSpacing: '0.05em',
                      ...badgeStyle
                    }}>
                      {badgeText}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Question Prompt Center-Aligned Layout */}
            {(() => {
              const q = vocabSessionQuestions[vocabSessionQIndex];
              const qId = q.id || '';
              const w = VOCAB_CORPUS.find(x => x.id === q.wordId);
              
              let primaryContent = '';
              let subtitleText = '';
              
              if (qId.endsWith('_rec_def')) {
                primaryContent = w?.term || '';
                subtitleText = 'Select the correct mathematical definition for this term';
              } else if (qId.endsWith('_rec_term')) {
                primaryContent = w ? `"${w.definition}"` : '';
                subtitleText = 'Select the mathematical term that matches this definition';
              } else if (qId.endsWith('_app')) {
                const parts = q.prompt.split('\n\n');
                primaryContent = parts[1] || q.prompt;
                subtitleText = 'Select the correct mathematical term to fill in the blank';
              } else if (qId.includes('_disc')) {
                const parts = q.prompt.split('\n\n');
                primaryContent = parts[1] || q.prompt;
                subtitleText = `Identify the correct sense of the word "${w?.term}" in this sentence`;
              } else {
                return (
                  <div style={{
                    fontSize: '1.28rem',
                    fontWeight: '600',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--clr-text)',
                    lineHeight: '1.5',
                    marginBottom: '28px',
                    letterSpacing: '-0.01em'
                  }}>
                    {q.prompt}
                  </div>
                );
              }

              return (
                <div style={{
                  textAlign: 'center',
                  margin: '20px 0 36px 0'
                }}>
                  <div style={{
                    fontSize: qId.endsWith('_rec_def') ? '2.5rem' : '1.45rem',
                    fontWeight: qId.endsWith('_rec_def') ? '800' : '600',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--clr-text)',
                    lineHeight: '1.5',
                    letterSpacing: '-0.02em',
                    marginBottom: '10px',
                    whiteSpace: 'pre-wrap',
                    padding: '0 20px'
                  }}>
                    {primaryContent}
                  </div>
                  <div style={{
                    fontSize: '0.92rem',
                    color: 'var(--clr-text-soft)',
                    fontWeight: '500'
                  }}>
                    {subtitleText}
                  </div>
                </div>
              );
            })()}

            {/* Option buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {vocabSessionQuestions[vocabSessionQIndex].options.map((opt, idx) => {
                const isPastQuestion = vocabSessionQIndex < vocabSessionSelections.length;
                const currentQSelected = isPastQuestion ? vocabSessionSelections[vocabSessionQIndex] : vocabSelectedMcq;
                const currentQHasAnswered = isPastQuestion ? true : vocabHasAnswered;

                const isSelected = currentQSelected === opt;
                const isCorrectAnswer = opt === vocabSessionQuestions[vocabSessionQIndex].answer;
                
                let optionBorder = '1.5px solid var(--clr-border)';
                let optionBg = 'var(--clr-card)';
                
                if (currentQHasAnswered) {
                  if (isSelected) {
                    if (isCorrectAnswer) {
                      optionBorder = '1.5px solid var(--clr-correct, #2ea043)';
                      optionBg = 'rgba(46, 160, 67, 0.1)';
                    } else {
                      optionBorder = '1.5px solid #f44336';
                      optionBg = 'rgba(244, 67, 54, 0.1)';
                    }
                  } else if (isCorrectAnswer) {
                    optionBorder = '1.5px solid var(--clr-correct, #2ea043)';
                    optionBg = 'rgba(46, 160, 67, 0.05)';
                  }
                } else if (isSelected) {
                  optionBorder = '1.5px solid var(--clr-accent)';
                  optionBg = 'rgba(232, 134, 74, 0.08)';
                }

                const keyLetter = String(idx + 1); // 1, 2, 3, 4
                
                return (
                  <button
                    key={idx}
                    disabled={currentQHasAnswered}
                    onClick={() => { if (!currentQHasAnswered) setVocabSelectedMcq(opt); }}
                    style={{
                      textAlign: 'left',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: optionBorder,
                      background: optionBg,
                      cursor: currentQHasAnswered ? 'not-allowed' : 'pointer',
                      color: 'var(--clr-text)',
                      fontSize: '1rem',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: currentQHasAnswered && !isSelected && !isCorrectAnswer ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected && !currentQHasAnswered) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected && !currentQHasAnswered) {
                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                        e.currentTarget.style.background = 'var(--clr-card)';
                      }
                    }}
                  >
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: currentQHasAnswered
                        ? (isCorrectAnswer ? 'var(--clr-correct, #2ea043)' : (isSelected ? '#f44336' : 'rgba(255, 255, 255, 0.08)'))
                        : (isSelected ? 'var(--clr-accent)' : 'rgba(255, 255, 255, 0.08)'),
                      color: (isSelected || (currentQHasAnswered && isCorrectAnswer)) ? '#fff' : 'var(--clr-text-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      marginRight: '14px',
                      flexShrink: 0
                    }}>
                      {keyLetter}
                    </span>
                    <span style={{ flexGrow: 1 }}>{opt}</span>
                    {!currentQHasAnswered && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.2)',
                        fontWeight: '500',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Press {keyLetter}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px'
            }}>
              {/* Previous Button */}
              {vocabSessionQIndex > 0 ? (
                <button
                  onClick={handleVocabPrevQuestion}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--clr-border)',
                    color: 'var(--clr-text-soft)',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--clr-text-soft)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}
                >
                  ← Previous
                </button>
              ) : <div />}

              {/* Submit or Next Button */}
              {(() => {
                const isPastQuestion = vocabSessionQIndex < vocabSessionSelections.length;
                const currentQHasAnswered = isPastQuestion ? true : vocabHasAnswered;

                if (!currentQHasAnswered) {
                  return (
                    <button
                      className="submit-btn"
                      disabled={!vocabSelectedMcq}
                      onClick={() => handleVocabAnswerSubmit()}
                      style={{
                        padding: '10px 20px',
                        opacity: !vocabSelectedMcq ? 0.6 : 1,
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        background: 'var(--clr-accent)',
                        color: '#fff',
                        border: 'none',
                        cursor: vocabSelectedMcq ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        width: 'auto'
                      }}
                    >
                      <span>Submit</span>
                      {vocabSelectedMcq && (
                        <span style={{
                          fontSize: '0.8rem',
                          opacity: 0.8,
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          Enter
                        </span>
                      )}
                    </button>
                  );
                } else {
                  return (
                    <button
                      className="submit-btn"
                      onClick={handleVocabNextQuestion}
                      style={{
                        padding: '10px 20px',
                        background: 'var(--clr-correct, #5cb87a)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        width: 'auto'
                      }}
                    >
                      <span>
                        {vocabState.isPlacing
                          ? (vocabState.placementStep < 15 ? 'Next →' : 'Finish Session 🏆')
                          : (vocabSessionQIndex < vocabSessionQuestions.length - 1 ? 'Next →' : 'Finish Session 🏆')}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        opacity: 0.8,
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        Enter
                      </span>
                    </button>
                  );
                }
              })()}
            </div>
          </div>

          {/* Feedback Reveal Card */}
          {(() => {
            const isPastQuestion = vocabSessionQIndex < vocabSessionSelections.length;
            const currentQHasAnswered = isPastQuestion ? true : vocabHasAnswered;
            const currentQSelected = isPastQuestion ? vocabSessionSelections[vocabSessionQIndex] : vocabSelectedMcq;
            const currentQ = vocabSessionQuestions[vocabSessionQIndex];
            const isCorrect = currentQSelected === currentQ.answer;

            if (currentQHasAnswered && currentQ.explanation) {
              return (
                <div style={{
                  fontSize: '0.98rem',
                  padding: '24px',
                  borderRadius: '20px',
                  marginTop: '20px',
                  background: isCorrect ? 'rgba(92, 184, 122, 0.08)' : 'rgba(239, 83, 80, 0.08)',
                  border: isCorrect ? '1px solid var(--clr-correct)' : '1px solid #ef5350',
                  color: 'var(--clr-text)',
                  lineHeight: '1.6',
                  animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <div style={{
                    fontWeight: '700',
                    marginBottom: '8px',
                    fontSize: '1.1rem',
                    color: isCorrect ? 'var(--clr-correct)' : '#ef5350',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{isCorrect ? '✓' : '✗'}</span>
                    <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.95)' }}>{currentQ.explanation}</div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* 3. TEACH & TRY INTERACTIVE STUDY SCREEN */}
      {vocabSessionActive && vocabSessionQuestions.length === 0 && (
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--clr-border)',
            paddingBottom: '16px'
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
                Level {vocabState.currentLevelIndex}: Teach & Try <BookOpenIcon />
              </h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                Level {vocabState.currentTier}: Mathematical Vocabulary
              </span>
            </div>
            <span style={{
              fontSize: '0.8rem',
              background: 'rgba(232, 134, 74, 0.1)',
              border: '1px solid rgba(232, 134, 74, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              color: 'var(--clr-accent)',
              fontWeight: '600'
            }}>
              Guided Exploration (No Grading)
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', lineHeight: '1.5', marginBottom: '24px' }}>
            Review the active mathematical terms introduced below. Select each term to study its exact definition, sample usages, and common pitfalls.
          </p>

          {/* Study Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', minHeight: '340px' }}>
            {/* Left Column: Terms List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const tierWords = VOCAB_CORPUS.filter(w => w.tier === vocabState.currentTier);
                const startIdx = vocabState.currentLevelIndex === 1 ? 0 : 5;
                const chunkWords = tierWords.slice(startIdx, startIdx + 5);
                return chunkWords.map(word => {
                  const isSelected = selectedTerm === word.term;
                  return (
                    <button
                      key={word.id}
                      onClick={() => setSelectedTerm(word.term)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: isSelected ? '1.5px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                        background: isSelected ? 'rgba(232, 134, 74, 0.08)' : 'var(--clr-card)',
                        color: 'var(--clr-text)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.95rem',
                        fontWeight: isSelected ? '600' : '400'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--clr-border)';
                      }}
                    >
                      {isSelected ? <TermSelectedIcon /> : <TermUnselectedIcon />}
                      {word.term}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Right Column: Term Details */}
            {(() => {
              const word = VOCAB_CORPUS.find(w => w.term === selectedTerm);
              if (!word) return null;
              return (
                <div style={{
                  background: 'var(--clr-surface)',
                  border: '1px solid var(--clr-border)',
                  padding: '24px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--clr-text)' }}>
                      {word.term}
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      color: 'var(--clr-accent)',
                      background: 'rgba(232, 134, 74, 0.08)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {word.strand.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--clr-correct)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      Mathematical Definition
                    </strong>
                    <div style={{ fontSize: '1.05rem', fontWeight: '500', lineHeight: '1.6', color: 'var(--clr-text)' }}>
                      {word.definition}
                    </div>
                  </div>

                  {word.is_confusable && (
                    <div style={{
                      borderLeft: '4px solid #f5a623',
                      paddingLeft: '16px',
                      background: 'rgba(245, 166, 35, 0.03)',
                      padding: '12px 16px',
                      borderRadius: '0 8px 8px 0',
                      borderLeftWidth: '4px'
                    }}>
                      <strong style={{ display: 'block', fontSize: '0.75rem', color: '#f5a623', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
                        ⚠️ Everyday English Confusion
                      </strong>
                      <div style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', fontStyle: 'italic' }}>
                        "{word.everyday_meaning}"
                      </div>
                    </div>
                  )}

                  <div>
                    <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      Example Context
                    </strong>
                    <div style={{
                      fontSize: '0.98rem',
                      fontStyle: 'italic',
                      color: 'rgba(255, 255, 255, 0.85)',
                      background: 'var(--clr-card)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      "{word.example_sentence}"
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Actions */}
          <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px dashed var(--clr-border)', paddingTop: '20px' }}>
            <button
              onClick={handleCompleteTeachLevel}
              className="submit-btn"
              style={{
                width: 'auto',
                padding: '14px 36px',
                background: 'var(--clr-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(232, 134, 74, 0.3)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              I've reviewed these terms — Let's Practice! 🚀
            </button>
          </div>
        </div>
      )}

      {/* 4. SESSION COMPLETE SCREEN */}
      {vocabSessionActive && vocabSessionFinished && (
        <div style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: '24px',
          padding: '36px 24px',
          textAlign: 'center',
          width: '100%',
          margin: '20px auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {(() => {
            const correctCount = vocabSessionAnswers.filter(Boolean).length;
            const totalCount = vocabSessionQuestions.length;
            const scorePct = (correctCount / totalCount) * 100;
            
            let levelType = vocabState.failedLevelIndex !== null ? 'reteach' : (vocabState.currentLevelIndex === 7 ? 'final_exam' : getLevelType(vocabState.currentLevelIndex));
            let threshold = (levelType === 'boss' || levelType === 'final_exam') ? 90 : 80;
            const passed = scorePct >= threshold;

            return (
              <div>
                {vocabState.isPlacing && !vocabState.placementCompleted ? (
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
                    <h4 style={{
                      fontSize: '1.5rem',
                      color: 'var(--clr-correct)',
                      marginBottom: '12px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: '700'
                    }}>
                      Placement Check Complete!
                    </h4>
                    <p style={{ color: 'var(--clr-text-soft)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
                      We evaluated your vocabulary skills and placed you in:
                    </p>
                    <div style={{
                      display: 'inline-block',
                      padding: '14px 28px',
                      background: 'rgba(232, 134, 74, 0.1)',
                      border: '1.5px solid var(--clr-accent)',
                      borderRadius: '16px',
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: 'var(--clr-accent)',
                      marginBottom: '24px',
                      boxShadow: '0 4px 12px rgba(232, 134, 74, 0.15)'
                    }}>
                      {vocabState.currentTier === 1
                        ? 'Reception (Level 1)'
                        : vocabState.currentTier === 8
                          ? 'Beyond KS3 (Level 8)'
                          : `Year ${vocabState.currentTier - 1} (Level ${vocabState.currentTier})`
                      }
                    </div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--clr-text-soft)', marginBottom: '32px' }}>
                      All foundational vocabulary levels below this have been automatically certified.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                      {passed ? (
                        <TrophyIconBig />
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      )}
                    </div>
                    <h4 style={{
                      fontSize: '1.6rem',
                      color: passed ? 'var(--clr-correct)' : '#ef5350',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: '700'
                    }}>
                      {passed ? 'Level Completed!' : 'Let\'s review and retry'}
                    </h4>
                    <div style={{
                      fontSize: '3rem',
                      fontWeight: '800',
                      margin: '16px 0',
                      color: passed ? 'var(--clr-correct)' : '#ef5350',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {correctCount} / {totalCount}
                    </div>
                    <p style={{
                      color: 'var(--clr-text-soft)',
                      fontSize: '0.98rem',
                      lineHeight: '1.6',
                      marginBottom: '28px',
                      maxWidth: '460px',
                      margin: '0 auto 28px'
                    }}>
                      {passed
                        ? `Superb effort! You scored ${Math.round(scorePct)}%, exceeding the ${threshold}% requirement.`
                        : `You scored ${Math.round(scorePct)}%, which is below the ${threshold}% pass target. Let's do a corrective reteach micro-level to address the missed words.`
                      }
                    </p>

                    {/* Show word updates if any passed */}
                    {passed && vocabSessionQuestions.length > 0 && (
                      <div style={{
                        maxWidth: '440px',
                        margin: '0 auto 32px',
                        textAlign: 'left',
                        background: 'var(--clr-card)',
                        border: '1px solid var(--clr-border)',
                        borderRadius: '16px',
                        padding: '20px'
                      }}>
                        <strong style={{
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          color: 'var(--clr-accent)',
                          display: 'block',
                          marginBottom: '12px',
                          letterSpacing: '0.05em'
                        }}>
                          Word Progress Updates
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Array.from(new Set(vocabSessionQuestions.map(q => q.wordId))).map(wordId => {
                            const word = VOCAB_CORPUS.find(w => w.id === wordId);
                            const state = vocabState.wordStates[wordId];
                            if (!word || !state) return null;
                            
                            let statusColor = 'var(--clr-text-soft)';
                            if (state.status === 'mastered') statusColor = '#f5a623';
                            else if (state.status === 'consolidated') statusColor = 'var(--clr-correct)';
                            else if (state.status === 'practicing') statusColor = 'var(--clr-accent)';

                            return (
                              <div key={wordId} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.92rem',
                                borderBottom: '1px solid rgba(255,255,255,0.02)',
                                paddingBottom: '4px'
                              }}>
                                <span style={{ fontWeight: '500' }}>{word.term}</span>
                                <span style={{
                                  color: statusColor,
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  background: 'rgba(255,255,255,0.03)',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {state.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                  <button
                    onClick={() => {
                      if (vocabState.isPlacing) {
                        saveVocabState({
                          ...vocabState,
                          isPlacing: false
                        });
                      }
                      setVocabSessionActive(false);
                      setVocabSessionFinished(false);
                    }}
                    className="submit-btn"
                    style={{
                      width: '100%',
                      maxWidth: '240px',
                      padding: '14px 28px',
                      background: 'var(--clr-accent)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(232, 134, 74, 0.3)',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    Continue
                  </button>

                  <button
                    onClick={handleResetVocab}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(232, 134, 74, 0.3)',
                      color: 'rgba(232, 134, 74, 0.8)',
                      cursor: 'pointer',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(232, 134, 74, 0.08)';
                      e.currentTarget.style.borderColor = 'var(--clr-accent)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(232, 134, 74, 0.3)';
                    }}
                  >
                    <span>🔄</span> Reset Progress
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 5. TIER DASHBOARD MAP */}
      {!vocabSessionActive && !vocabSessionFinished && !vocabIsLoadingPlacement && (
        <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease-out' }}>
          {/* Header Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: '1px solid var(--clr-border)',
            paddingBottom: '16px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--clr-text)' }}>
              Vocabulary Progression
            </h3>
            <button
              onClick={() => {
                if (vocabState.placementCompleted) {
                    setConfirmModal({
                      title: 'Reset Progress?',
                      message: 'Retaking the placement test will reset your current level progress. This cannot be undone.',
                      onConfirm: () => {
                        setConfirmModal(null);
                        setVocabIsLoadingPlacement(true);
                      }
                    });
                    return;
                  }
                setVocabIsLoadingPlacement(true);
              }}
              style={{
                border: '1px solid var(--clr-accent)',
                color: 'var(--clr-accent)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'rgba(232, 134, 74, 0.03)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(232, 134, 74, 0.08)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(232, 134, 74, 0.03)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Test Your Might <SwordsIcon /></span>
            </button>
          </div>

          {/* Stats Row or Calibration Help Banner */}
          {vocabState.placementCompleted ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--clr-text-soft)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                  letterSpacing: '0.05em'
                }}>
                  Words Mastered
                </span>
                <strong style={{ fontSize: '1.6rem', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)' }}>
                  {Object.values(vocabState.wordStates).filter(ws => ws.status === 'mastered' || ws.status === 'consolidated').length} <span style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', fontWeight: 'normal' }}>/ 80</span>
                </strong>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--clr-text-soft)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                  letterSpacing: '0.05em'
                }}>
                  Estimated Pacing Time
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--clr-text)' }}>
                  {(() => {
                    const remainingCount = 80 - Object.values(vocabState.wordStates).filter(ws => ws.status === 'mastered' || ws.status === 'consolidated').length;
                    const estMinutes = remainingCount * 3.5;
                    if (remainingCount === 0) return '🏆 Certified Complete!';
                    return `~${Math.ceil(estMinutes / 60)} hours left`;
                  })()}
                </span>
              </div>
            </div>
          ) : null}

          {/* Grid Division Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '32px' }}>
            
            {/* Section 1: Reception */}
            <div>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--clr-text-soft)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                letterSpacing: '0.08em'
              }}>
                Reception
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {renderTierCard(1)}
              </div>
            </div>

            {/* Section 2: Year-by-Year */}
            <div>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--clr-text-soft)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                letterSpacing: '0.08em'
              }}>
                Year-by-Year (KS1 & KS2)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {[2, 3, 4, 5, 6, 7].map(tierNum => renderTierCard(tierNum))}
              </div>
            </div>

            {/* Section 3: Beyond */}
            <div>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--clr-text-soft)',
                textTransform: 'uppercase',
                marginBottom: '12px',
                letterSpacing: '0.08em'
              }}>
                Beyond
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {renderTierCard(8)}
              </div>
            </div>
            
          </div>

          {/* Primary Continue Button (Removed per user request — clicking card directly starts session) */}
          <div style={{ textAlign: 'center' }}>
            {vocabState.mastered && (
              <div style={{
                padding: '24px',
                background: 'rgba(92, 184, 122, 0.08)',
                border: '1.5px solid var(--clr-correct)',
                borderRadius: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(92, 184, 122, 0.1)',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <h5 style={{ fontSize: '1.25rem', color: 'var(--clr-correct)', margin: '0 0 8px 0', fontWeight: '700' }}>
                  🏆 Mathematical Vocabulary Master
                </h5>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
                  Congratulations! You have completed the entire math vocabulary checklist and passed the final cumulative exam.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
