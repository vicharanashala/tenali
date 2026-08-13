import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';

const QuizSoundContext = createContext();

export function useQuizSound() {
  const context = useContext(QuizSoundContext);
  if (!context) {
    // Provide a safe fallback if used outside provider
    return {
      isMuted: false,
      toggleMute: () => {},
      playCorrect: () => {},
      playWrong: () => {},
      playSubmit: () => {},
      playQuizComplete: () => {},
      playClick: () => {},
      playMilestone: () => {},
      loadCategory: async () => {},
      streakCount: 0,
      isLoading: false
    };
  }
  return context;
}

export const QuizSoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('tenali-sound-effects') === 'true';
    } catch {
      return false; 
    }
  });

  const [streakCount, setStreakCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState(new Set(['essential']));

  const soundsRef = useRef({
    correct: null,
    wrong: null,
    submit: null,
    quizComplete: null,
    click: null,
    coin: null,
    levelup: null,
    streak: null
  });

  useEffect(() => {
    const getBase = () => (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    
    // Increase pool size to prevent exhaustion when using html5: true
    Howler.html5PoolSize = 100;

    soundsRef.current.correct = new Howl({
      src: [`${getBase()}/sounds/essential/correct.mp3`],
      volume: 0.8,

      onloaderror: (id, err) => console.warn('Failed to load correct sound:', err),
      onplayerror: (id, err) => console.warn('Failed to play correct sound:', err),
    });

    soundsRef.current.wrong = new Howl({
      src: [`${getBase()}/sounds/essential/wrong.mp3`],
      volume: 0.8,

      onloaderror: (id, err) => console.warn('Failed to load wrong sound:', err),
    });

    soundsRef.current.submit = new Howl({
      src: [`${getBase()}/sounds/essential/submit.wav`],
      volume: 0.5,

      onloaderror: (id, err) => console.warn('Failed to load submit sound:', err),
    });
    
    soundsRef.current.quizComplete = new Howl({
      src: [`${getBase()}/sounds/standard/quiz-complete.wav`],
      volume: 1.0,

      onloaderror: (id, err) => console.warn('Failed to load quiz-complete sound:', err),
    });

    soundsRef.current.click = new Howl({
      src: [`${getBase()}/sounds/essential/click.mp3`],
      volume: 0.5,

      onloaderror: (id, err) => console.warn('Failed to load click sound:', err),
    });

  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem('tenali-sound-effects', newVal.toString());
      } catch (e) {
        // ignore storage errors
      }
      return newVal;
    });
  }, []);

  const playCorrect = useCallback((passedStreakCount) => {
    console.log('QuizSoundContext: playCorrect called', { isMuted, streakCount });
    // Increment local streak state
    setStreakCount(prev => prev + 1);
    
    if (isMuted || !soundsRef.current.correct) return;
    try {
      soundsRef.current.correct.play();
    } catch (e) {
      console.warn('Error playing correct sound:', e);
    }
  }, [isMuted, streakCount]);

  const playWrong = useCallback(() => {
    // Reset local streak state
    setStreakCount(0);
    
    if (isMuted || !soundsRef.current.wrong) return;
    try {
      soundsRef.current.wrong.play();
    } catch (e) {
      console.warn('Error playing wrong sound:', e);
    }
  }, [isMuted]);

  const playSubmit = useCallback(() => {
    if (isMuted || !soundsRef.current.submit) return;
    try {
      soundsRef.current.submit.play();
    } catch (e) {
      console.warn('Error playing submit sound:', e);
    }
  }, [isMuted]);

  const playQuizComplete = useCallback(() => {
    if (isMuted || !soundsRef.current.quizComplete) return;
    try {
      soundsRef.current.quizComplete.play();
    } catch (e) {
      console.warn('Error playing quiz-complete sound:', e);
    }
  }, [isMuted]);

  // Expose globally for legacy components that don't have the hook
  useEffect(() => {
    window.playGlobalCorrect = playCorrect;
    window.playGlobalWrong = playWrong;
    window.playGlobalSubmit = playSubmit;
    window.playGlobalQuizComplete = playQuizComplete;
  }, [playCorrect, playWrong, playSubmit, playQuizComplete]);

  const lastClickTimeRef = useRef(0);
  const playClick = useCallback(() => {
    if (isMuted || !soundsRef.current.click) return;
    
    // Debounce to prevent rapid overlapping click sounds
    const now = Date.now();
    if (now - lastClickTimeRef.current < 80) return;
    lastClickTimeRef.current = now;

    try {
      soundsRef.current.click.play();
    } catch (e) {
      console.warn('Error playing click sound:', e);
    }
  }, [isMuted]);

  const playMilestone = useCallback((level = 3) => {
    if (isMuted) return;
    try {
      if (soundsRef.current.streak) {
        soundsRef.current.streak.play();
      } else if (soundsRef.current.correct) {
        // Fallback to high pitch correct sound
        soundsRef.current.correct.play();
      }
    } catch (e) {
      console.warn('Error playing milestone sound:', e);
    }
  }, [isMuted]);

  const SOUND_CATEGORIES = {
    standard: ['coin', 'levelup', 'streak'],
    'visual-lab': [],
    specialized: []
  };

  const loadCategory = useCallback(async (categoryName) => {
    if (loadedCategories.has(categoryName) || !SOUND_CATEGORIES[categoryName]) {
      return;
    }

    setIsLoading(true);
    try {
      const soundsToLoad = SOUND_CATEGORIES[categoryName];
      const promises = soundsToLoad.map(soundName => {
        return new Promise((resolve) => {
          soundsRef.current[soundName] = new Howl({
            src: [`/sounds/${categoryName}/${soundName}.mp3`],
            onload: resolve,
            onloaderror: () => {
              console.warn(`Failed to load ${categoryName}/${soundName} sound`);
              resolve(); // Resolve anyway so Promise.all completes
            }
          });
        });
      });
      await Promise.all(promises);
      setLoadedCategories(prev => {
        const next = new Set(prev);
        next.add(categoryName);
        return next;
      });
    } catch (e) {
      console.warn(`Error loading category ${categoryName}:`, e);
    } finally {
      setIsLoading(false);
    }
  }, [loadedCategories]);

  return (
    <QuizSoundContext.Provider value={{
      isMuted,
      toggleMute,
      playCorrect,
      playWrong,
      playSubmit,
      playQuizComplete,
      playClick,
      playMilestone,
      loadCategory,
      streakCount,
      isLoading
    }}>
      {children}
    </QuizSoundContext.Provider>
  );
};
