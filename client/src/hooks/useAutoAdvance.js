import React, { useEffect } from 'react';
import CONFIG from '../config.js';
/**
 * useAutoAdvance Hook
 * Auto-advances to the next question after correct answer is revealed.
 * Only triggers if revealed=true AND isCorrect=true.
 * Calls advanceFnRef.current() after AUTO_ADVANCE_MS delay.
 *
 * @param {boolean} revealed - Whether the answer feedback is shown
 * @param {React.RefObject<Function>} advanceFnRef - Ref to the advance function
 * @param {boolean} isCorrect - Whether the user's answer was correct
 * @param {boolean} isDisabled=true Whether the auto advance should advance questions or not. Default true
 */
function useAutoAdvance(revealed, advanceFnRef, isCorrect, isDisabled = true, autoAdvanceTime = CONFIG.AUTO_ADVANCE_MS) {
    useEffect(() => {
        if (isDisabled || !revealed || !isCorrect) return;

        const timer = setTimeout(() => {
            advanceFnRef?.current();
        }, autoAdvanceTime);
        return () => clearTimeout(timer);

    }, [revealed, isCorrect, advanceFnRef, isDisabled, autoAdvanceTime]);
}

export default useAutoAdvance