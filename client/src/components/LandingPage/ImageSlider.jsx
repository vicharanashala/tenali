import React, { useState, useEffect, useRef, useCallback } from 'react';

const SLIDES = [
  {
    id: 'simul',
    badgeText: 'ALGEBRA ENGINE',
    badgeColor: '#e8864a',
    title: 'Simultaneous Equations & Linear Systems',
    description: 'Generate 2×2 and 3×3 systems of equations with guaranteed integer solutions. Practice algebraic substitution, elimination, and step-by-step verification.',
    highlights: [
      'Algorithmic coefficient pairing with exact solutions',
      'Dynamic 2-variable and 3-variable difficulty tiers',
      'Instant step-by-step substitution breakdown',
    ],
    imageSrc: '/contrast/simultaneous-accurate.svg',
    fallbackImg: '/contrast/simultaneous.png',
    modeKey: 'simul',
    modeName: 'Practice Simultaneous Equations',
  },
  {
    id: 'determinants',
    badgeText: 'DETERMINANTS & MATRICES',
    badgeColor: '#e05a4a',
    title: 'Determinants & Matrix Inversion',
    description: 'Master 2×2 and 3×3 determinant calculations with clean visual diagonals (ad − bc). Build intuition for linear transformations and matrix systems.',
    highlights: [
      'Diagonals ad − bc crossing calculation guidance',
      'Full matrix arithmetic: addition, multiplication, determinants',
      'Prepares learners for linear algebra and vectors',
    ],
    imageSrc: '/contrast/determinants-accurate.svg',
    fallbackImg: '/contrast/determinants.png',
    modeKey: 'matrix',
    modeName: 'Practice Matrices & Determinants',
  },
  {
    id: 'primefactor',
    badgeText: 'NUMBER THEORY',
    badgeColor: '#3b82f6',
    title: 'Prime Factor Trees & Multiples',
    description: 'Deconstruct composite numbers into their fundamental prime building blocks. Master prime factor decomposition, HCF, and LCM with visual factor branches.',
    highlights: [
      'Deconstruct integers into prime factor decompositions',
      'Step-by-step prime factor tree visualization',
      'Foundational arithmetic drill for middle schoolers',
    ],
    imageSrc: '/contrast/prime-accurate.svg',
    fallbackImg: '/contrast/prime.png',
    modeKey: 'primefactor',
    modeName: 'Practice Prime Factors',
  },
  {
    id: 'matrix',
    badgeText: 'LINEAR ALGEBRA',
    badgeColor: '#10b981',
    title: 'Matrix Arithmetic & Operations',
    description: 'Perform addition, scalar multiplication, and row-by-column matrix multiplications with full bracket notation and structured intermediate steps.',
    highlights: [
      'Row-by-column dot product multiplication breakdown',
      'Rigorous matrix bracket notation and dimensional checks',
      'Instant error diagnostics for calculation slips',
    ],
    imageSrc: '/contrast/matrix-accurate.svg',
    fallbackImg: '/contrast/matrix.png',
    modeKey: 'matrix',
    modeName: 'Explore Matrix Operations',
  },
  {
    id: 'similarity',
    badgeText: 'GEOMETRY & PROPORTIONS',
    badgeColor: '#8b5cf6',
    title: 'Similar Triangles & Scale Factors',
    description: 'Understand proportional side lengths, scale factor relationships, and area/volume scaling in geometrically similar figures.',
    highlights: [
      'Visual triangles with proportional side labeling (1:2 ratio)',
      'Angle-Angle (AA) similarity condition verification',
      'Prepares students for Cambridge IGCSE geometry',
    ],
    imageSrc: '/contrast/similarity-accurate.svg',
    fallbackImg: '/contrast/similarity-middle.png',
    modeKey: 'similarity',
    modeName: 'Practice Similar Triangles',
  },
  {
    id: 'trig',
    badgeText: 'TRIGONOMETRY',
    badgeColor: '#ec4899',
    title: 'Right-Angled Trigonometry (SOH-CAH-TOA)',
    description: 'Calculate sine, cosine, and tangent ratios for exact angles. Connect right-angled triangle geometry to sine and cosine rules.',
    highlights: [
      'True 30°-60°-90° right-angled triangle geometry',
      'Standardized opposite, adjacent, hypotenuse notation',
      'Interactive angle and ratio problem solver',
    ],
    imageSrc: '/contrast/trigonometry-accurate.svg',
    fallbackImg: '/contrast/trigonometry.png',
    modeKey: 'trig',
    modeName: 'Practice Trigonometric Ratios',
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

              {/* Right Visual Card Column - Authentic Math Concept Graphic */}
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
