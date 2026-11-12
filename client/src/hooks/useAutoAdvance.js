import { useEffect } from 'react'

export function useAutoAdvance(revealed, advanceFnRef, isCorrect) {
  useEffect(() => {
    // Disabled auto-advance so the user manually clicks Next Question.
    return
  }, [revealed, isCorrect])
}
