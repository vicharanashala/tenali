import React, { useState, useEffect, useRef, useCallback } from 'react';

const SLIDES = [
  {
    id: 'adaptive',
    badgeText: 'CORE ENGINE',
    badgeColor: '#e8864a',
    title: 'Adaptive Practice with Instant Step-by-Step Solvers',
    description: 'Every problem is mathematically generated on the fly. As you answer, Tenali’s dynamic engine calibrates your difficulty band in real time, from Easy to Extra-Hard.',
    highlights: [
      'Self-calibrating score (0.0 to 3.0) adapts per answer',
      'One-tap "Solve" for crystal-clear pedagogical explanations',
      'Never encounter the exact same question twice',
    ],
    imageSrc: '/contrast/simultaneous-accurate.svg',
    fallbackImg: '/contrast/simultaneous.png',
    modeKey: 'simul',
    modeName: 'Try Simultaneous Equations',
  },
  {
    id: 'battle',
    badgeText: 'MULTIPLAYER',
    badgeColor: '#e05a4a',
    title: 'Live 1-on-1 Fastest-Finger Battle Arena',
    description: 'Challenge classmates and fellow thinkers in real-time math duels powered by Socket.IO. Solve questions simultaneously—first correct response takes the point!',
    highlights: [
      'Real-time matchmaking with WebSocket synchronization',
      'Live win streak multiplier and tournament records',
      'High-speed mental math with zero latency',
    ],
    imageSrc: '/contrast/determinants-accurate.svg',
    fallbackImg: '/contrast/determinants.png',
    modeKey: 'battle',
    modeName: 'Enter Battle Arena',
  },
  {
    id: 'detective',
    badgeText: 'STORY PUZZLES',
    badgeColor: '#3b82f6',
    title: 'Math Detective Agency: Crack the Cases',
    description: 'Step into the shoes of an investigative detective. Follow narrative clues, break secret ciphers, and unlock the next chapter through logical deduction.',
    highlights: [
      'Narrative case files paired with mathematical mystery',
      'Chained clue resolution with progressive reveals',
      'Engages deductive reasoning and problem analysis',
    ],
    imageSrc: '/contrast/prime-accurate.svg',
    fallbackImg: '/contrast/prime.png',
    modeKey: 'detective',
    modeName: 'Investigate a Case',
  },
  {
    id: 'visual-lab',
    badgeText: 'INTERACTIVE LABS',
    badgeColor: '#10b981',
    title: 'Visual Math Universe & GeoCraft 3D',
    description: 'Transform abstract equations into tactile geometric models. Experiment with interactive coordinate grids, dynamic angle sliders, and 3D cross-sections.',
    highlights: [
      'Draggable SVG and Three.js 3D spatial manipulatives',
      'Visual proofs for Pythagoras, trigonometry, and areas',
      'Built-in concept grounding before formal assessment',
    ],
    imageSrc: '/contrast/matrix-accurate.svg',
    fallbackImg: '/contrast/matrix.png',
    modeKey: 'math-lab',
    modeName: 'Open Visual Lab',
  },
  {
    id: 'monsters',
    badgeText: 'ERROR RECOVERY',
    badgeColor: '#8b5cf6',
    title: 'Misconception Monsters: Turn Mistakes into Mastery',
    description: 'When you slip up on a common trap, Tenali catches the specific misconception monster and guides you through a personalized cure rather than just marking it wrong.',
    highlights: [
      'Real-time cognitive error classifier targeting known traps',
      'Hall of Silly Mistakes to track and tame common errors',
      'Interactive guided solver step-through for permanent fixes',
    ],
    imageSrc: '/contrast/similarity-accurate.svg',
    fallbackImg: '/contrast/similarity-middle.png',
    modeKey: 'curiosity',
    modeName: 'Explore Curiosity Lab',
  },
  {
    id: 'roadtrip',
    badgeText: 'REAL WORLD',
    badgeColor: '#ec4899',
    title: 'The Car Journey: A 16-Stop Mathematical Odyssey',
    description: 'Embark on an epic road trip across real-world mathematics. From road signs and speedometer rates all the way to fuel-efficiency optimization and curves.',
    highlights: [
      '16 connected milestone stops across practical scenarios',
      'Discover mathematics behind genuine physical phenomena',
      'Earn custom road licenses and collectible travel badges',
    ],
    imageSrc: '/contrast/trigonometry-accurate.svg',
    fallbackImg: '/contrast/trigonometry.png',
    modeKey: 'carjourney',
    modeName: 'Start The Car Journey',
  },
];

export default function ImageSlider({ onSelectTopic = () => { } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goToNext, 5500);
    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) goToNext();
    else if (diff < -40) goToPrev();
    touchStartXRef.current = null;
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section
      id="showcase"
      className="landing-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Platform Feature Showcase"
    >
      <div className="section-header-center">
        <span className="section-tag">🚀 Platform Showcase</span>
        <h2 className="section-title">Engineered for Deep Mathematical Mastery</h2>
        <p className="section-subtitle">
          Explore the breakthrough features that make Tenali more than just another quiz app.
        </p>
      </div>

      {/* Slider Outer Wrapper: Navigation buttons are placed OUTSIDE the card window */}
      <div className="slider-outer-wrapper">
        <button
          type="button"
          className="slider-nav-btn slider-nav-prev"
          onClick={goToPrev}
          aria-label="Previous Slide"
        >
          ‹
        </button>

        <div className="slider-container">
          {/* Slide Content */}
          <div className="slider-wrapper">
            <div className="slider-slide" key={currentSlide.id}>
              {/* Left Description Column */}
              <div className="slider-text-col">
                <span
                  className="slider-badge-pill"
                  style={{
                    background: `${currentSlide.badgeColor}22`,
                    color: currentSlide.badgeColor,
                    border: `1px solid ${currentSlide.badgeColor}44`,
                  }}
                >
                  {currentSlide.badgeText}
                </span>

                <h3 className="slider-slide-title">{currentSlide.title}</h3>
                <p className="slider-slide-desc">{currentSlide.description}</p>

                <div className="slider-highlights">
                  {currentSlide.highlights.map((item, idx) => (
                    <div key={idx} className="slider-highlight-item">
                      <span
                        className="slider-highlight-dot"
                        style={{ background: currentSlide.badgeColor }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="slider-btn-play"
                  onClick={() => onSelectTopic(currentSlide.modeKey)}
                >
                  <span>{currentSlide.modeName}</span>
                  <span aria-hidden="true">➔</span>
                </button>
              </div>

              {/* Right Visual Card Column - Authentic Math Concept Graphic (Without Top-Right Overlay Image) */}
              <div className="slider-visual-col">
                <div className="slider-image-card">
                  <img
                    src={currentSlide.imageSrc}
                    alt={currentSlide.title}
                    className="slider-math-graphic"
                    onError={(e) => {
                      if (currentSlide.fallbackImg) {
                        e.target.src = currentSlide.fallbackImg;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="slider-pagination" role="tablist" aria-label="Slides pagination">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={idx === currentIndex}
                className={`slider-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="slider-nav-btn slider-nav-next"
          onClick={goToNext}
          aria-label="Next Slide"
        >
          ›
        </button>
      </div>
    </section>
  );
}
