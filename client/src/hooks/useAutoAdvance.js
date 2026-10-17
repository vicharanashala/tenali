import React, { useEffect } from 'react';
import { CONFIG } from '../config.js';
/**
 * useAutoAdvance Hook
 * Auto-advances to the next question after correct answer is revealed.
 * Only triggers if revealed=true AND isCorrect=true.
 * Calls advanceFnRef.current() after AUTO_ADVANCE_MS delay.
 *
 * @param {boolean} revealed - Whether the answer feedback is shown
 * @param {React.RefObject<Function>} advanceFnRef - Ref to the advance function
 * @param {boolean} isCorrect - Whether the user's answer was correct
 */
function useAutoAdvance(revealed, advanceFnRef, isCorrect, isDisabled=true) {
    useEffect(() => {
        if (isDisabled) return;

        if (revealed && isCorrect) {
            const timer = setTimeout(() => {
                if (advanceFnRef.current) {
                    advanceFnRef.current();
                }
            }, CONFIG.AUTO_ADVANCE_MS);
            return () => clearTimeout(timer);
        }
        
    }, [revealed, isCorrect, advanceFnRef, isDisabled]);
}

export default useAutoAdvance