import React, { useState, useEffect, useRef } from 'react';
import './OnboardingTour.css';


const tourData = {
  home: [
    {
      id: 'tour-welcome',
      title: 'Welcome to Tenali!',
      message: 'Tenali is an AI-native learning journey that completely flips how you learn. Instead of just reading, you will face real-world scenarios and use your natural reasoning to solve them first. This tour will walk you through the entire experience.',
      mockup: null
    },
    {
      id: 'tour-search-bar',
      title: 'Quick Search',
      message: 'Use the search bar to quickly find specific quizzes or subjects you want to practice.',
      mockup: null
    },
    {
      id: 'tour-home-grid',
      title: 'Adaptive Quizzes',
      message: 'Here you will find our library of interactive quizzes. Click any card to enter a lab.',
      mockup: null
    }
  ],
  'visual-math-lab-redux': [
    {
      title: 'Multiplication and division',
      message: 'Welcome to Multiplication and division! Here you will solve problems by seeing how math actually works.',
      mockup: null
    },
    {
      title: 'Interactive Templates',
      message: 'We have Math Machines, Frog Jumps, Array Sharing, and more. For each question, type your numeric answer in the YOUR ANSWER box.',
      mockup: null
    }
  ],
  'mensuration-lab': [
    {
      title: 'Mensuration Lab',
      message: 'Welcome to the Mensuration Lab. Here you will learn about 2D and 3D shapes!',
      mockup: null
    },
    {
      title: 'Interactive Shapes',
      message: 'You can tap on squares to count area, interact with angles, or count sides. Have fun exploring geometry.',
      mockup: null
    }
  ],
  'basic-arith-lab': [
    {
      title: 'Origin',
      message: 'Sharpen your math skills here! You will get missing number equations, comparisons, and true/false questions.',
      mockup: null
    }
  ],
  default: [
    {
      title: 'Quiz Lab',
      message: 'Welcome to this learning lab! Read the question carefully, interact with any visual elements, and submit your answer.',
      mockup: null
    }
  ]
};


export default function OnboardingTour({ onFinish, mode }) {
  const activeMode = mode || 'home';
  const tourSteps = tourData[activeMode] || tourData.default;

  const [currentStep, setCurrentStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 240, y: window.innerHeight / 2 - 150 });
  const utteranceRef = useRef(null);

  // Speak current step message
  useEffect(() => {
    const step = tourSteps[currentStep];
    if (!step || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (muted) return;

    const utterance = new SpeechSynthesisUtterance(step.message);
    
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = 
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.name.includes('Samantha')) ||
        voices.find(v => v.name.includes('Daniel')) ||
        voices.find(v => v.name.includes('Premium')) ||
        voices.find(v => v.lang.startsWith('en'));
        
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
    } else {
      setVoice();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentStep, muted]);

  // Handle Highlighting and auto-positioning
  useEffect(() => {
    // Cleanup previous highlight
    document.querySelectorAll('.tour-highlighted').forEach(el => el.classList.remove('tour-highlighted'));

    const step = tourSteps[currentStep];
    if (!step) return;

    if (step.id && step.id !== 'tour-welcome' && step.id !== 'tour-mockup') {
      const target = document.getElementById(step.id);
      if (target) {
        target.classList.add('tour-highlighted');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          const rect = target.getBoundingClientRect();
          let x = rect.left + (rect.width / 2) - 240;
          let y = rect.bottom + 24;

          if (x < 20) x = 20;
          if (x + 480 > window.innerWidth - 20) x = window.innerWidth - 500;
          
          if (y + 350 > window.innerHeight) {
            y = rect.top - 360;
          }
          
          if (y < 20) y = 20;
          if (y + 350 > window.innerHeight - 20) y = window.innerHeight - 370;

          setPosition({ x, y });
        }, 500);
      }
    } else {
      setPosition({
        x: window.innerWidth / 2 - 240,
        y: window.innerHeight / 2 - 160
      });
    }

    return () => {
      document.querySelectorAll('.tour-highlighted').forEach(el => el.classList.remove('tour-highlighted'));
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) setCurrentStep(prev => prev + 1);
    else handleFinish();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleFinish = () => {
    window.speechSynthesis.cancel();
    document.querySelectorAll('.tour-highlighted').forEach(el => el.classList.remove('tour-highlighted'));
    if (onFinish) onFinish();
  };

  const step = tourSteps[currentStep];

  return (
    <>
      <div className="tour-overlay" />
      <div 
        className="tour-modal"
        style={{ left: position.x, top: position.y }}
      >
        <div className="tour-header">
          <div className="tour-header-left">
            <h2 className="tour-title">{step.title}</h2>
            <button className="tour-mute-btn" onClick={() => setMuted(!muted)}>
              {muted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </div>
          <span className="tour-step-count">Step {currentStep + 1} of {tourSteps.length}</span>
        </div>
        
        <div className="tour-content">
          <p className="tour-message" style={{ whiteSpace: 'pre-wrap' }}>{step.message}</p>
          {step.mockup && step.mockup}
        </div>

        <div className="tour-footer">
          <button className="tour-skip-btn" onClick={handleFinish}>Skip Tour</button>
          
          <div className="tour-dots">
            {tourSteps.map((_, idx) => (
              <div 
                key={idx} 
                className={`tour-dot ${idx === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(idx)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
          
          <div className="tour-controls">
            {currentStep > 0 && (
              <button className="tour-btn tour-btn-prev" onClick={handlePrev}>
                Previous
              </button>
            )}
            <button className="tour-btn tour-btn-next" onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
