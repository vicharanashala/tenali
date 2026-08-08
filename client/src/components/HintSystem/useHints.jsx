import { useState, useEffect, useRef } from 'react';
import { API, setLocalXp } from './hintUtils.js';

export function useQuizHintsAndXp(concept, finished, score, totalQ, wasSolved = false, results = []) {
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [xpBreakdown, setXpBreakdown] = useState(null);
  const completionSubmittedRef = useRef(false);

  const finishedRef = useRef(finished);
  useEffect(() => {
    if (!finished && finishedRef.current) {
      setHintsUsedCount(0);
      setXpBreakdown(null);
      completionSubmittedRef.current = false;
    }
    finishedRef.current = finished;
  }, [finished]);

  useEffect(() => {
    const handleHintUsed = () => setHintsUsedCount(c => c + 1);
    window.addEventListener('tenali-hint-used', handleHintUsed);
    return () => window.removeEventListener('tenali-hint-used', handleHintUsed);
  }, []);

  useEffect(() => {
    if (!finished) return;
    if (completionSubmittedRef.current) return;
    completionSubmittedRef.current = true;

    const submitCompletion = async () => {
      setBonusLoading(true);
      try {
        const token = localStorage.getItem('tenali-auth-token');
        const res = await fetch(`${API}/api/hints/lesson-complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            concept,
            questionsCount: totalQ,
            hintsUsed: hintsUsedCount,
            correctCount: score,
            wasSolved: wasSolved,
            results: results
          })
        });
        if (res.ok) {
          const data = await res.json();
          setXpBreakdown({
            correctXp: data.correctXp || 0,
            perfectScoreBonus: data.perfectScoreBonus || 0,
            bonusAmount: data.bonusAmount || 0,
            totalAward: data.totalAward || 0,
            alreadyCompleted: !!data.alreadyCompleted,
            wasSolved: !!data.wasSolved
          });
          if (data.totalAward > 0) {
            if (data.guest) {
              changeXp(data.totalAward);
            } else if (data.balance !== undefined) {
              setLocalXp(data.balance);
              try {
                window.dispatchEvent(new CustomEvent('tenali-xp-float', { detail: { diff: data.totalAward } }));
              } catch {}
            }
          }
        }
      } catch (e) {
        console.error('[Hints Complete] Failed to award XP bonus:', e);
      } finally {
        setBonusLoading(false);
      }
    };
    submitCompletion();
  }, [finished, totalQ, score, hintsUsedCount, concept, wasSolved, results]);

  return { hintsUsedCount, xpBreakdown, bonusLoading };
}
