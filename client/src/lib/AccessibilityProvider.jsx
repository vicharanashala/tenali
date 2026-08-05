import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useI18n, LANGUAGES } from './i18n';

const AccessibilityContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAccessibility() {
  return useContext(AccessibilityContext);
}

// Beautiful language selector component for the accessibility panel
function LanguageSection() {
  const { locale, setLocale, t, LANGUAGES: langs } = useI18n();
  
  return (
    <div className="a11y-section" style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '16px' }}>
      <h3>🌐 {t('language')}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
        {langs.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: locale === lang.code ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)',
              background: locale === lang.code ? 'var(--clr-accent-soft)' : 'var(--clr-card)',
              color: 'var(--clr-text)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              fontWeight: locale === lang.code ? '700' : '400',
            }}
          >
            <span style={{ display: 'block', fontSize: '1rem' }}>{lang.nativeName}</span>
            <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AccessibilityProvider({ children }) {
  const { t } = useI18n();
  const readSavedA11y = () => {
    try {
      return JSON.parse(localStorage.getItem('tenali-a11y')) || {};
    } catch { return {}; }
  };

  const [dyslexiaFont, setDyslexiaFont] = useState(() => readSavedA11y().dyslexiaFont || false);
  const [textSize, setTextSize] = useState(() => readSavedA11y().textSize || 'normal'); // normal, large, xl
  const [letterSpacing, setLetterSpacing] = useState(() => readSavedA11y().letterSpacing || false);
  const [highContrast, setHighContrast] = useState(() => readSavedA11y().highContrast || false);
  const [readingRuler, setReadingRuler] = useState(() => readSavedA11y().readingRuler || false);
  const [colorTint, setColorTint] = useState(() => readSavedA11y().colorTint || 'none'); // none, blue, peach, green (Irlen syndrome)
  const [textToSpeech, setTextToSpeech] = useState(() => readSavedA11y().textToSpeech || false);

  const [mouseY, setMouseY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const openButtonRef = useRef(null);

  // Free Web Speech API Text-to-Speech
  const readAloud = (text) => {
    if (!textToSpeech || !('speechSynthesis' in window)) return;
    
    // Stop any current speech before starting new one
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a clear English/Indian-English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('Google')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.9; // Slightly slower for dyslexic readers
    window.speechSynthesis.speak(utterance);
  };

  // Save to localStorage & apply to document
  useEffect(() => {
    const config = { dyslexiaFont, textSize, letterSpacing, highContrast, readingRuler, colorTint, textToSpeech };
    try {
      localStorage.setItem('tenali-a11y', JSON.stringify(config));
    } catch { // ignored
    }

    const root = document.documentElement;
    root.setAttribute('data-a11y-dyslexia', dyslexiaFont);
    root.setAttribute('data-a11y-size', textSize);
    root.setAttribute('data-a11y-spacing', letterSpacing);
    root.setAttribute('data-a11y-contrast', highContrast ? 'high' : 'normal');
    root.setAttribute('data-a11y-tint', colorTint);
  }, [dyslexiaFont, textSize, letterSpacing, highContrast, readingRuler, colorTint, textToSpeech]);

  // Track mouse for reading ruler
  useEffect(() => {
    if (!readingRuler) return;
    const handleMouseMove = (e) => setMouseY(e.clientY);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingRuler]);

  // Modal a11y: move focus into the panel on open, restore it on close,
  // close on Escape, and trap Tab navigation inside the panel.
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => panel ? Array.from(panel.querySelectorAll(focusableSelector)) : [];

    const first = getFocusable()[0];
    if (first) first.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const triggerButton = openButtonRef.current;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerButton) triggerButton.focus();
    };
  }, [isOpen]);

  return (
    <AccessibilityContext.Provider value={{
      dyslexiaFont, setDyslexiaFont,
      textSize, setTextSize,
      letterSpacing, setLetterSpacing,
      highContrast, setHighContrast,
      readingRuler, setReadingRuler,
      colorTint, setColorTint,
      textToSpeech, setTextToSpeech,
      readAloud,
      setIsOpen
    }}>
      {children}
      
      {/* Global Settings Button - Positioned absolutely so it shows up on every route next to theme toggle */}
      <button
        ref={openButtonRef}
        className="a11y-toggle-btn"
        onClick={() => setIsOpen(true)}
        title="Accessibility Settings"
        aria-label="Open accessibility settings"
        aria-haspopup="dialog"
        style={{ fontSize: '1.2rem', padding: 0 }}
      >
        ⚙️
      </button>

      {/* Irlen Syndrome Color Tint Overlay */}
      {colorTint !== 'none' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: colorTint === 'blue' ? 'rgba(173, 216, 230, 0.12)' :
                           colorTint === 'peach' ? 'rgba(255, 218, 185, 0.12)' :
                           colorTint === 'green' ? 'rgba(144, 238, 144, 0.12)' : 'transparent',
          pointerEvents: 'none', zIndex: 9998
        }} />
      )}

      {/* Reading Ruler Overlay */}
      {readingRuler && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none', zIndex: 9999,
          background: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) ${Math.max(0, mouseY - 45)}px, transparent ${Math.max(0, mouseY - 45)}px, transparent ${mouseY + 45}px, rgba(0,0,0,0.5) ${mouseY + 45}px, rgba(0,0,0,0.5) 100%)`
        }} />
      )}

      {/* Settings Panel */}
      {isOpen && (
        <div className="a11y-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="a11y-panel"
            onClick={e => e.stopPropagation()}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-panel-title"
          >
            <div className="a11y-header">
              <h2 id="a11y-panel-title">⚙️ {t('settings_title')}</h2>
              <button onClick={() => setIsOpen(false)} aria-label="Close accessibility settings">✕</button>
            </div>
            
            <div className="a11y-scroll-content">
              {/* Language Selector Section */}
              <LanguageSection />

              <div className="a11y-section">
                <h3>{t('reading_fluency')}</h3>
                <label className="a11y-toggle">
                  <input type="checkbox" checked={dyslexiaFont} onChange={e => setDyslexiaFont(e.target.checked)} />
                  <span>{t('dyslexia_font')}</span>
                </label>
                <label className="a11y-toggle">
                  <input type="checkbox" checked={letterSpacing} onChange={e => setLetterSpacing(e.target.checked)} />
                  <span>{t('letter_spacing')}</span>
                </label>
                <label className="a11y-toggle">
                  <input type="checkbox" checked={readingRuler} onChange={e => setReadingRuler(e.target.checked)} />
                  <span>{t('reading_ruler')}</span>
                </label>
              </div>

              <div className="a11y-section">
                <h3>{t('vision_contrast')}</h3>
                <label className="a11y-toggle">
                  <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />
                  <span>{t('high_contrast')}</span>
                </label>
                
                <div style={{ marginTop: '16px' }}>
                  <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>{t('text_size')}</span>
                  <div className="a11y-button-group">
                    <button className={textSize === 'normal' ? 'active' : ''} onClick={() => setTextSize('normal')}>{t('text_normal')}</button>
                    <button className={textSize === 'large' ? 'active' : ''} onClick={() => setTextSize('large')}>{t('text_large')}</button>
                    <button className={textSize === 'xl' ? 'active' : ''} onClick={() => setTextSize('xl')}>{t('text_xl')}</button>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>{t('color_tint')}</span>
                  <div className="a11y-button-group">
                    <button className={colorTint === 'none' ? 'active' : ''} onClick={() => setColorTint('none')}>{t('tint_none')}</button>
                    <button className={colorTint === 'blue' ? 'active' : ''} onClick={() => setColorTint('blue')}>{t('tint_blue')}</button>
                    <button className={colorTint === 'peach' ? 'active' : ''} onClick={() => setColorTint('peach')}>{t('tint_peach')}</button>
                    <button className={colorTint === 'green' ? 'active' : ''} onClick={() => setColorTint('green')}>{t('tint_green')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AccessibilityContext.Provider>
  );
}
