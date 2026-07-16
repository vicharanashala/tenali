import { useState } from 'react';
import { useMastery, getNextQuestion, loadMasteryProgress } from '../VachanaMastery';
import MasteryLevelHeader from '../MasteryLevelHeader';
import { VOCAB_CORPUS } from '../../vocabCorpus';

// ─── Inversion Detector Question Bank ────────────────────────────────────────
const INVERSION_BANK = {
  '1': [
    { id: 'inv1_01', type: 'text', prompt: '"5 less than x"', hint: 'Remember: "less than" means you start with the variable and subtract the number.', answer: 'x-5', explanation: '✅ Correct! "5 less than x" means x − 5.' },
    { id: 'inv1_02', type: 'text', prompt: '"3 less than y"', hint: '"less than" reverses the written order.', answer: 'y-3', explanation: '✅ Correct! "3 less than y" means y − 3.' },
    { id: 'inv1_03', type: 'text', prompt: '"7 less than m"', hint: 'Start with the variable, then subtract.', answer: 'm-7', explanation: '✅ Correct! "7 less than m" means m − 7.' },
    { id: 'inv1_04', type: 'text', prompt: '"12 less than n"', hint: '"less than" = subtract from the variable.', answer: 'n-12', explanation: '✅ Correct! "12 less than n" means n − 12.' },
    { id: 'inv1_05', type: 'text', prompt: '"9 less than k"', hint: 'Write the variable first, then minus the number.', answer: 'k-9', explanation: '✅ Correct! "9 less than k" means k − 9.' }
  ],
  '2': [
    { id: 'inv2_01', type: 'mcq', prompt: 'Which expression correctly translates "8 subtracted from x"?', options: ['8 − x', 'x − 8', 'x + 8', '8 + x'], answer: 'x − 8', explanation: '"Subtracted from" means you start with x and remove 8: x − 8.' },
    { id: 'inv2_02', type: 'mcq', prompt: 'Which expression correctly translates "a decreased by 4"?', options: ['4 − a', 'a − 4', 'a + 4', '4 + a'], answer: 'a − 4', explanation: '"Decreased by" means reduce: a − 4.' },
    { id: 'inv2_03', type: 'mcq', prompt: 'Which expression correctly translates "6 fewer than p"?', options: ['6 − p', 'p − 6', 'p + 6', '6 / p'], answer: 'p − 6', explanation: '"Fewer than" inverts: start with p, subtract 6.' },
    { id: 'inv2_04', type: 'mcq', prompt: 'Which expression correctly translates "subtract 5 from z"?', options: ['5 − z', 'z − 5', 'z + 5', '5z'], answer: 'z − 5', explanation: '"Subtract from z" means z − 5.' },
    { id: 'inv2_05', type: 'mcq', prompt: '"15 taken away from r" translates to:', options: ['15 − r', 'r − 15', 'r × 15', 'r / 15'], answer: 'r − 15', explanation: '"Taken away from r" means r − 15.' }
  ],
  '3': [
    { id: 'inv3_01', type: 'text', prompt: '"10 less than a number y is equal to 30"', answer: 'y-10=30', explanation: '✅ "10 less than y" → y − 10, "is equal to 30" → = 30.' },
    { id: 'inv3_02', type: 'text', prompt: '"7 subtracted from twice x equals 15"', answer: '2x-7=15', altAnswers: ['2*x-7=15'], explanation: '✅ "twice x" → 2x, "7 subtracted from" → − 7, "equals 15" → = 15.' },
    { id: 'inv3_03', type: 'text', prompt: '"4 fewer than a number p gives 20"', answer: 'p-4=20', explanation: '✅ "4 fewer than p" → p − 4, "gives 20" → = 20.' },
    { id: 'inv3_04', type: 'text', prompt: '"When 6 is subtracted from three times n, the result is 12"', answer: '3n-6=12', altAnswers: ['3*n-6=12'], explanation: '✅ "three times n" → 3n, "6 is subtracted from" → − 6, "result is 12" → = 12.' },
    { id: 'inv3_05', type: 'text', prompt: '"8 less than half of w equals 2"', answer: 'w/2-8=2', altAnswers: ['0.5w-8=2', '0.5*w-8=2'], explanation: '✅ "half of w" → w/2, "8 less than" → − 8, "equals 2" → = 2.' }
  ],
  '4': [
    { id: 'inv4_01', type: 'mcq', prompt: 'Classify: "y decreased by 10" — does this invert the written order?', options: ['Yes, it inverts', 'No, it does not invert'], answer: 'No, it does not invert', explanation: '"Decreased by" does not invert — you write y − 10, same order as read.' },
    { id: 'inv4_02', type: 'mcq', prompt: 'Classify: "10 decreased by y" — does this invert the written order?', options: ['Yes, it inverts', 'No, it does not invert'], answer: 'No, it does not invert', explanation: '"10 decreased by y" = 10 − y. No inversion — you write in the order read.' },
    { id: 'inv4_03', type: 'mcq', prompt: 'Classify: "10 less than y" — does this invert the written order?', options: ['Yes, it inverts', 'No, it does not invert'], answer: 'Yes, it inverts', explanation: '"10 less than y" = y − 10. The written order (10, y) is reversed in the expression (y, 10).' },
    { id: 'inv4_04', type: 'mcq', prompt: 'Classify: "subtract 3 from b" — does this invert the written order?', options: ['Yes, it inverts', 'No, it does not invert'], answer: 'Yes, it inverts', explanation: '"Subtract 3 from b" = b − 3. Written order (3, b) is reversed in the expression (b, 3).' },
    { id: 'inv4_05', type: 'mcq', prompt: 'Classify: "m minus 7" — does this invert the written order?', options: ['Yes, it inverts', 'No, it does not invert'], answer: 'No, it does not invert', explanation: '"m minus 7" = m − 7. Written order matches expression order.' }
  ],
  '5': [
    { id: 'inv5_01', type: 'text', prompt: '"A teacher has y pencils. After giving away 8, she has 14 left. Write the equation."', answer: 'y-8=14', explanation: '✅ Start with y pencils, give away 8 → y − 8 = 14.' },
    { id: 'inv5_02', type: 'text', prompt: '"Ravi scored 12 fewer points than Priya. If Ravi scored 35, find Priya\'s score equation using p."', answer: 'p-12=35', explanation: '✅ "12 fewer than Priya (p)" → p − 12 = 35.' },
    { id: 'inv5_03', type: 'text', prompt: '"A rope is cut and 15 cm is removed from its original length L. The remaining piece is 40 cm."', answer: 'L-15=40', altAnswers: ['l-15=40'], explanation: '✅ Original L, remove 15 → L − 15 = 40.' },
    { id: 'inv5_04', type: 'text', prompt: '"After spending $20 from her savings s, Meera has $55 left."', answer: 's-20=55', explanation: '✅ Savings s, spend 20 → s − 20 = 55.' },
    { id: 'inv5_05', type: 'text', prompt: '"The temperature dropped 9 degrees from t and reached 24 degrees."', answer: 't-9=24', explanation: '✅ Started at t, dropped 9 → t − 9 = 24.' }
  ]
};

export default function InversionDetector() {
  const inversionMastery = useMastery('order', 5);
  const [invQuestion, setInvQuestion] = useState(() => {
    const progress = loadMasteryProgress();
    const currentLevel = progress['order']?.currentLevel || 1;
    return getNextQuestion(INVERSION_BANK, currentLevel, null);
  });
  const [subInput, setSubInput] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [invMcqSelected, setInvMcqSelected] = useState(null);

  const loadNextInvQuestion = (level) => {
    const next = getNextQuestion(INVERSION_BANK, level, invQuestion?.id || null);
    setInvQuestion(next);
    setSubInput('');
    setSubMsg('');
    setInvMcqSelected(null);
  };

  const handleResetInv = () => {
    inversionMastery.resetExercise();
    loadNextInvQuestion(1);
  };

  const checkSubOrder = () => {
    if (!invQuestion) return;
    let isCorrect = false;

    if (invQuestion.type === 'text') {
      const val = subInput.replace(/\s+/g, '').toLowerCase();
      const correctAnswer = invQuestion.answer.replace(/\s+/g, '').toLowerCase();
      const altAnswers = (invQuestion.altAnswers || []).map(a => a.replace(/\s+/g, '').toLowerCase());
      isCorrect = val === correctAnswer || altAnswers.includes(val);
    } else if (invQuestion.type === 'mcq') {
      isCorrect = invMcqSelected === invQuestion.answer;
    }

    if (isCorrect) {
      setSubMsg(invQuestion.explanation);
    } else {
      if (invQuestion.type === 'text') {
        const val = subInput.replace(/\s+/g, '').toLowerCase();
        const parts = invQuestion.answer.split('-');
        if (parts.length >= 2) {
          const reversed = parts[1].split('=')[0] + '-' + parts[0];
          if (val.startsWith(reversed.toLowerCase())) {
            setSubMsg(`❌ Watch the order! "${invQuestion.prompt}" inverts — start with the variable, then subtract. Correct: ${invQuestion.answer}`);
          } else {
            setSubMsg(`❌ Not quite. The correct expression is: ${invQuestion.answer}. ${invQuestion.explanation.replace('✅ ', '')}`);
          }
        } else {
          setSubMsg(`❌ Not quite. The correct expression is: ${invQuestion.answer}`);
        }
      } else {
        setSubMsg(`❌ Not quite. ${invQuestion.explanation}`);
      }
    }

    const prevLevel = inversionMastery.state.currentLevel;
    inversionMastery.handleAnswer(isCorrect);

    setTimeout(() => {
      const newLevel = loadMasteryProgress()['order']?.currentLevel || prevLevel;
      loadNextInvQuestion(newLevel);
    }, 2200);
  };

  return (
    <div>
      <MasteryLevelHeader
        state={inversionMastery.state}
        maxLevel={5}
        toastMsg={inversionMastery.toastMsg}
        onClearToast={inversionMastery.clearToast}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {invQuestion?.type === 'text' ? '📝 Equation / Expression Translation' : '❔ Multiple Choice Question'}
        </span>
        <button
          onClick={handleResetInv}
          style={{
            background: 'transparent', border: '1px solid rgba(255, 100, 100, 0.3)',
            color: 'rgba(255, 100, 100, 0.8)', cursor: 'pointer',
            padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          Reset Progress
        </button>
      </div>

      {invQuestion?.type === 'text' ? (
        <div>
          <p style={{ fontSize: '1rem', marginBottom: '14px', lineHeight: '1.5' }}>
            Translate the phrase/sentence: <strong>{invQuestion.prompt}</strong>
          </p>
          {invQuestion.hint && (
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginTop: '-8px', marginBottom: '16px', fontStyle: 'italic' }}>
              💡 Hint: {invQuestion.hint}
            </p>
          )}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              className="search-bar"
              style={{ maxWidth: '300px' }}
              type="text"
              placeholder="Type expression/equation, e.g. x-5 or y-10=30"
              value={subInput}
              onChange={e => { setSubInput(e.target.value); setSubMsg(''); }}
              onKeyDown={e => { if (e.key === 'Enter') checkSubOrder(); }}
            />
            <button className="submit-btn" onClick={checkSubOrder}>Validate</button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '1rem', marginBottom: '16px', lineHeight: '1.5' }}>
            <strong>{invQuestion?.prompt}</strong>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {invQuestion?.options?.map((opt, idx) => {
              const isSelected = invMcqSelected === opt;
              return (
                <button
                  key={idx}
                  onClick={() => { setInvMcqSelected(opt); setSubMsg(''); }}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: '10px',
                    border: isSelected ? '1px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                    background: isSelected ? 'rgba(108, 206, 255, 0.08)' : 'var(--clr-surface)',
                    cursor: 'pointer', color: 'var(--clr-text)', fontSize: '0.92rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--clr-text-soft)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--clr-border)'; }}
                >
                  <span style={{ marginRight: '10px', fontWeight: 'bold', color: isSelected ? 'var(--clr-accent)' : 'var(--clr-text-soft)' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          <button
            className="submit-btn"
            disabled={!invMcqSelected}
            onClick={checkSubOrder}
            style={{ opacity: !invMcqSelected ? 0.6 : 1 }}
          >
            Validate
          </button>
        </div>
      )}

      {subMsg && (
        <div style={{
          fontSize: '0.95rem', padding: '14px', borderRadius: '10px', marginTop: '16px',
          background: subMsg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,100,100,0.08)',
          border: subMsg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid rgba(255,100,100,0.3)',
          color: 'var(--clr-text)', lineHeight: '1.4'
        }}>
          {subMsg}
        </div>
      )}
    </div>
  );
}
