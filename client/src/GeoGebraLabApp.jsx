import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GeoGebraLabApp.css';
import { GEOGEBRA_LEVEL_1_QUESTIONS } from './data/geogebraQuestions';
import { inspectGeoGebraCanvas, verifyQuestionConstruction } from './data/geogebraValidator';

/**
 * Shuffles options for each question using the Fisher-Yates algorithm
 * and updates the 'correct' field to point to the new shuffled key ('A', 'B', 'C', or 'D').
 */
function shuffleOptions(options, originalCorrectKey) {
  const originalCorrect = options.find((o) => o.key === originalCorrectKey);
  const correctText = originalCorrect ? originalCorrect.text : '';

  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const KEYS = ['A', 'B', 'C', 'D'];
  let newCorrectKey = 'A';

  const newOptions = shuffled.map((opt, index) => {
    const key = KEYS[index];
    if (opt.text === correctText) {
      newCorrectKey = key;
    }
    return {
      key,
      text: opt.text,
    };
  });

  return { options: newOptions, correct: newCorrectKey };
}

function initializeQuestions() {
  return GEOGEBRA_LEVEL_1_QUESTIONS.map((q) => {
    const { options, correct } = shuffleOptions(q.options, q.correct);
    return {
      ...q,
      options,
      correct,
    };
  });
}

export default function GeoGebraLabApp({ onBack }) {
  const [questions, setQuestions] = useState(() => initializeQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answersHistory, setAnswersHistory] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Live GeoGebra Inspection & Verification State
  const [inspection, setInspection] = useState({ connected: false, objects: [], count: 0 });
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [appletReady, setAppletReady] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [showGateNotice, setShowGateNotice] = useState(false);

  // Resizable split-screen state
  const workbenchRef = useRef(null);
  const [leftWidthPercent, setLeftWidthPercent] = useState(48);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for GeoGebra Applet injection and live API
  const mountRef = useRef(null);
  const viewportRef = useRef(null);
  const ggbApiRef = useRef(null);
  const appletInstanceRef = useRef(null);
  const lastPerspectiveRef = useRef(null);

  const startDragging = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleResetSplit = () => {
    setLeftWidthPercent(48);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (!workbenchRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = workbenchRef.current.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const newPercent = (offsetX / rect.width) * 100;

      // Restrict resizing between 25% and 75%
      if (newPercent >= 25 && newPercent <= 75) {
        setLeftWidthPercent(newPercent);
      }
    };

    const handleStop = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleStop);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleStop);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleStop);
    };
  }, [isDragging]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || questions[0] || null;
  const currentPerspective = currentQuestion?.perspective || 'G';

  // Progression Gate: Construction must be verified to go ahead!
  const isConstructionComplete = Boolean(verificationResult?.verified);
  const canGoAhead = isSubmitted && isConstructionComplete;

  const currentQuestionRef = useRef(currentQuestion);
  const currentIndexRef = useRef(currentIndex);
  const isSubmittedRef = useRef(isSubmitted);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
    currentIndexRef.current = currentIndex;
    isSubmittedRef.current = isSubmitted;
  }, [currentQuestion, currentIndex, isSubmitted]);

  // Determine GeoGebra workspace URL based on question perspective (used for external link and fallback)
  const getGeoGebraUrl = () => {
    if (currentQuestion?.perspective === 'T') {
      return 'https://www.geogebra.org/calculator/3d';
    }
    if (currentQuestion?.perspective === 'A') {
      return 'https://www.geogebra.org/calculator/cas';
    }
    return 'https://www.geogebra.org/calculator';
  };

  const currentUrl = getGeoGebraUrl();

  // Helper to run canvas inspection safely
  const runInspection = useCallback(() => {
    if (!ggbApiRef.current) return null;
    const insp = inspectGeoGebraCanvas(ggbApiRef.current);
    setInspection(insp);
    return insp;
  }, []);

  // Initialize or reconfigure GeoGebra Applet via deployggb.js
  const initApplet = useCallback(() => {
    if (!window.GGBApplet || !mountRef.current) {
      return false;
    }

    const appName = currentPerspective === 'T' ? '3d' : currentPerspective === 'A' ? 'cas' : 'suite';
    const appletId = 'ggbAppletLab';

    setAppletReady(false);
    setIframeLoaded(false);

    // Clean container before injecting
    mountRef.current.innerHTML = `<div id="${appletId}-container" style="width:100%;height:100%;"></div>`;

    const width = Math.max(mountRef.current.clientWidth || 800, 400);
    const height = Math.max(mountRef.current.clientHeight || 600, 300);

    const params = {
      id: appletId,
      appName: appName,
      width: width,
      height: height,
      showToolBar: true,
      showAlgebraInput: true,
      showMenuBar: false,
      showResetIcon: false,
      enableLabelDrags: true,
      enableShiftDragZoom: true,
      enableRightClick: true,
      showToolBarHelp: false,
      errorDialogsActive: true,
      useBrowserForJS: false,
      allowStyleBar: true,
      preventFocus: false,
      scaleContainerClass: 'geogebra-viewport',
      appletOnLoad: function (api) {
        const ggbApi = api || window[appletId] || window.ggbApplet;
        ggbApiRef.current = ggbApi;
        setAppletReady(true);
        setIframeLoaded(true);

        // Adjust dimensions to match viewport container
        if (mountRef.current && typeof ggbApi?.setSize === 'function') {
          const w = mountRef.current.clientWidth;
          const h = mountRef.current.clientHeight;
          if (w > 50 && h > 50) {
            ggbApi.setSize(w, h);
          }
        }

        // Attach real-time mutation listeners
        if (ggbApi) {
          const onCanvasChange = () => {
            try {
              const insp = inspectGeoGebraCanvas(ggbApi);
              setInspection(insp);

              // Auto-verify if the user has submitted or has started constructing!
              const q = currentQuestionRef.current;
              const idx = currentIndexRef.current;
              if (q) {
                const liveRes = verifyQuestionConstruction(q, insp);
                if (liveRes.verified) {
                  setVerificationResult(liveRes);
                  setShowGateNotice(false);
                  setAnswersHistory((prev) => {
                    const existing = prev[idx];
                    if (!existing) return prev;
                    return {
                      ...prev,
                      [idx]: {
                        ...existing,
                        verificationResult: liveRes,
                      }
                    };
                  });
                } else if (isSubmittedRef.current) {
                  // If already submitted, keep verification progress updated in real time
                  setVerificationResult(liveRes);
                }
              }
            } catch (err) {
              console.warn('Canvas change inspect error:', err);
            }
          };

          // Throttle drag updates
          let lastTime = 0;
          const throttledUpdate = () => {
            const now = Date.now();
            if (now - lastTime > 180) {
              lastTime = now;
              onCanvasChange();
            }
          };

          const fnAdd = `tenali_ggb_add_${Date.now()}`;
          const fnRemove = `tenali_ggb_rem_${Date.now()}`;
          const fnUpdate = `tenali_ggb_upd_${Date.now()}`;
          const fnClear = `tenali_ggb_clr_${Date.now()}`;

          window[fnAdd] = onCanvasChange;
          window[fnRemove] = onCanvasChange;
          window[fnUpdate] = throttledUpdate;
          window[fnClear] = () => {
            setInspection({ connected: true, objects: [], count: 0 });
            setVerificationResult({
              verified: false,
              status: 'empty',
              message: 'No objects detected on your GeoGebra board yet.',
              suggestion: currentQuestionRef.current?.hint
            });
          };

          try {
            if (typeof ggbApi.registerAddListener === 'function') {
              try { ggbApi.registerAddListener(fnAdd); } catch { ggbApi.registerAddListener(onCanvasChange); }
            }
            if (typeof ggbApi.registerRemoveListener === 'function') {
              try { ggbApi.registerRemoveListener(fnRemove); } catch { ggbApi.registerRemoveListener(onCanvasChange); }
            }
            if (typeof ggbApi.registerUpdateListener === 'function') {
              try { ggbApi.registerUpdateListener(fnUpdate); } catch { ggbApi.registerUpdateListener(throttledUpdate); }
            }
            if (typeof ggbApi.registerClearListener === 'function') {
              try { ggbApi.registerClearListener(fnClear); } catch { ggbApi.registerClearListener(window[fnClear]); }
            }
          } catch (listenerErr) {
            console.warn('GeoGebra listener registration notice:', listenerErr);
          }

          // Initial inspection
          onCanvasChange();
        }
      }
    };

    try {
      const applet = new window.GGBApplet(params, '5.0');
      appletInstanceRef.current = applet;
      applet.inject(`${appletId}-container`);
      lastPerspectiveRef.current = currentPerspective;
      return true;
    } catch (err) {
      console.warn('GeoGebra applet injection failed, falling back to iframe:', err);
      setUseIframeFallback(true);
      return false;
    }
  }, [currentPerspective]);

  // Handle applet initialization or perspective change
  useEffect(() => {
    // If perspective hasn't changed and applet is active, keep existing instance!
    if (lastPerspectiveRef.current === currentPerspective && ggbApiRef.current) {
      runInspection();
      return;
    }

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 50;

    const tryInit = () => {
      if (!isMounted) return;
      if (window.GGBApplet && mountRef.current) {
        initApplet();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryInit, 100);
      } else {
        console.warn('GGBApplet unavailable, falling back to iframe');
        setUseIframeFallback(true);
      }
    };

    tryInit();

    return () => {
      isMounted = false;
    };
  }, [currentPerspective, resetKey, initApplet, runInspection]);

  // Dynamic resizing via ResizeObserver so canvas adjusts smoothly while resizing panes
  useEffect(() => {
    if (!viewportRef.current) return;

    let rafId = null;
    const ro = new ResizeObserver((entries) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 50 && height > 50 && ggbApiRef.current && typeof ggbApiRef.current.setSize === 'function') {
            try {
              ggbApiRef.current.setSize(Math.floor(width), Math.floor(height));
            } catch (err) {
              // ignore transient resize errors
            }
          }
        }
      });
    });

    ro.observe(viewportRef.current);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [appletReady]);

  // Load question state if already answered, and reset/restore verification for current question
  useEffect(() => {
    const prev = answersHistory[currentIndex];
    if (prev) {
      setSelectedOption(prev.selected);
      setIsSubmitted(true);
      setIsCorrect(prev.isCorrect);
      setVerificationResult(prev.verificationResult || null);
      setShowGateNotice(Boolean(prev && !prev.verificationResult?.verified));
    } else {
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsCorrect(null);
      setVerificationResult(null);
      setShowGateNotice(false);
    }
    setShowHint(false);

    if (ggbApiRef.current) {
      runInspection();
    }
  }, [currentIndex, answersHistory, runInspection]);

  const handleSelectOption = (key) => {
    if (isSubmitted) return;
    setSelectedOption(key);
  };

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return;

    const correct = selectedOption === currentQuestion.correct;
    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct && !answersHistory[currentIndex]) {
      setScore((s) => s + 1);
    }

    // Always inspect live GeoGebra canvas and verify construction when person clicks submit!
    let liveVerification = null;
    if (ggbApiRef.current) {
      try {
        const currentInsp = inspectGeoGebraCanvas(ggbApiRef.current);
        setInspection(currentInsp);
        liveVerification = verifyQuestionConstruction(currentQuestion, currentInsp);
        setVerificationResult(liveVerification);
      } catch (err) {
        console.warn('Error verifying construction on submit:', err);
      }
    } else if (useIframeFallback) {
      liveVerification = {
        verified: true,
        status: 'iframe',
        message: 'Submitted in standard frame mode. Make sure your construction matches the prompt instructions!',
        suggestion: currentQuestion.hint
      };
      setVerificationResult(liveVerification);
    }

    if (!liveVerification?.verified) {
      setShowGateNotice(true);
    } else {
      setShowGateNotice(false);
    }

    setAnswersHistory((prev) => ({
      ...prev,
      [currentIndex]: {
        selected: selectedOption,
        isCorrect: correct,
        verificationResult: liveVerification,
      }
    }));
  };

  // Inspect live GeoGebra canvas and check construction against current question
  const handleCheckWork = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (!ggbApiRef.current) {
        if (useIframeFallback) {
          const fallbackRes = {
            verified: true,
            status: 'iframe',
            message: 'Running in standard frame mode. Construction verified!',
            suggestion: currentQuestion.hint
          };
          setVerificationResult(fallbackRes);
          setShowGateNotice(false);
          if (isSubmitted) {
            setAnswersHistory((prev) => ({
              ...prev,
              [currentIndex]: {
                ...prev[currentIndex],
                verificationResult: fallbackRes
              }
            }));
          }
        } else {
          setVerificationResult({
            verified: false,
            status: 'waiting',
            message: 'GeoGebra workspace is connecting. Try again in a moment!'
          });
        }
        return;
      }

      const currentInsp = inspectGeoGebraCanvas(ggbApiRef.current);
      setInspection(currentInsp);
      const res = verifyQuestionConstruction(currentQuestion, currentInsp);
      setVerificationResult(res);

      if (res.verified) {
        setShowGateNotice(false);
      }

      if (isSubmitted) {
        setAnswersHistory((prev) => {
          const existing = prev[currentIndex];
          if (!existing) return prev;
          return {
            ...prev,
            [currentIndex]: {
              ...existing,
              verificationResult: res
            }
          };
        });
      }
    }, 120);
  };

  const handleNext = () => {
    if (!isSubmitted) return;

    // Hard progression gate: construction must be complete to go ahead!
    if (!isConstructionComplete) {
      // Instant check in case student completed the construction right now
      if (ggbApiRef.current) {
        const currentInsp = inspectGeoGebraCanvas(ggbApiRef.current);
        setInspection(currentInsp);
        const res = verifyQuestionConstruction(currentQuestion, currentInsp);
        setVerificationResult(res);

        if (res.verified) {
          setShowGateNotice(false);
          setAnswersHistory((prev) => ({
            ...prev,
            [currentIndex]: {
              ...prev[currentIndex],
              verificationResult: res,
            }
          }));
          if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((idx) => idx + 1);
          } else {
            setIsFinished(true);
          }
          return;
        }
      }

      setShowGateNotice(true);
      return;
    }

    setShowGateNotice(false);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const handleClearCanvas = () => {
    if (ggbApiRef.current && typeof ggbApiRef.current.newConstruction === 'function') {
      try {
        ggbApiRef.current.newConstruction();
        const emptyRes = {
          verified: false,
          status: 'empty',
          message: 'Canvas cleared. Ready for your construction!',
          suggestion: currentQuestion.hint
        };
        setVerificationResult(emptyRes);
        setInspection({ connected: true, objects: [], count: 0 });
        if (isSubmitted) {
          setShowGateNotice(true);
          setAnswersHistory((prev) => {
            const existing = prev[currentIndex];
            if (!existing) return prev;
            return {
              ...prev,
              [currentIndex]: {
                ...existing,
                verificationResult: emptyRes
              }
            };
          });
        }
        return;
      } catch (err) {
        console.warn('Error clearing canvas via API, reloading instead:', err);
      }
    }
    setIframeLoaded(false);
    setResetKey((k) => k + 1);
  };

  const handleRestart = () => {
    setQuestions(initializeQuestions());
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
    setScore(0);
    setAnswersHistory({});
    setIsFinished(false);
    setVerificationResult(null);
    setShowGateNotice(false);
    handleClearCanvas();
  };

  // Completion Screen
  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <div className="geogebra-lab-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 560, width: '90%', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
          <div className="badge badge-accent" style={{ marginBottom: 12 }}>Level 1 Complete</div>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>GeoGebra Explorer Certified</h2>
          <p style={{ color: 'var(--clr-text-soft)', marginBottom: 24 }}>
            You completed all 33 hands-on practical questions covering 2D geometry, functions, vectors, 3D space, and matrix operations.
          </p>

          <div style={{ background: 'var(--clr-surface)', padding: 20, borderRadius: 'var(--radius-sm)', marginBottom: 28 }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--clr-accent)' }}>
              {score} / {totalQuestions}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
              Final Accuracy: {percentage}%
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <button className="geogebra-btn-secondary" style={{ flex: 1 }} onClick={handleRestart}>
              🔄 Retake Level 1
            </button>
            <button className="geogebra-btn-primary" style={{ flex: 1 }} onClick={onBack}>
              🏠 Back to Tenali Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="geogebra-lab-container">
      <div
        className={`geogebra-workbench ${isDragging ? 'is-resizing' : ''}`}
        ref={workbenchRef}
      >
        {/* ─────────────────────────────────────────────────────────────
            LEFT PANEL: QUIZ & INSTRUCTION PANEL (Resizable width)
           ───────────────────────────────────────────────────────────── */}
        <aside
          className="geogebra-quiz-panel"
          style={{ width: `${leftWidthPercent}%` }}
        >
          <div className="geogebra-quiz-header">
            <div className="geogebra-header-top">
              <div className="geogebra-header-left">
                <button className="geogebra-back-btn" onClick={onBack} title="Return to Menu">
                  ← Menu
                </button>
                <span className="geogebra-header-title">📐 GeoGebra Lab</span>
                <span className="geogebra-level-tag">Level 1</span>
              </div>

              <div className="geogebra-header-right">
                <span className="geogebra-counter-pill">
                  Q <strong>{totalQuestions > 0 ? currentIndex + 1 : 0}</strong>/{totalQuestions}
                </span>
                <span className="geogebra-score-pill">
                  Score: <strong>{score}</strong>
                </span>
              </div>
            </div>

            <div className="geogebra-progress-bar-container">
              <div
                className="geogebra-progress-fill"
                style={{ width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="geogebra-quiz-body">
            {!currentQuestion ? (
              <div className="geogebra-empty-state card" style={{ margin: '16px 0', padding: '36px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔬</div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: 'var(--clr-text)' }}>
                  GeoGebra Lab Workspace Ready
                </h3>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 20 }}>
                  Question bank cleared. New interactive, curiosity-driven questions will be loaded here.
                  The live GeoGebra workspace on the right is fully active for free exploration and sandbox testing!
                </p>
                <div style={{ background: 'var(--clr-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: '0.84rem', color: 'var(--clr-text-soft)' }}>
                  📁 Previous 33 questions backed up to <code>Tenali-understanding/backup_questions</code>
                </div>
                <button className="geogebra-btn-secondary" onClick={onBack}>
                  ← Back to Menu
                </button>
              </div>
            ) : (
              <>
                <span className="geogebra-category-badge">{currentQuestion.category}</span>

            <div className="geogebra-prompt-box">
              {currentQuestion.prompt}
            </div>

            <div className="geogebra-action-notice">
              <span>⌨️</span>
              <span>
                <strong>Try it in GeoGebra:</strong> Click the Input Bar on the right, type the command, and press Enter to see what happens!
              </span>
            </div>

            {/* Options */}
            <div className="geogebra-options-list">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                let statusClass = '';

                if (isSubmitted) {
                  if (opt.key === currentQuestion.correct) {
                    statusClass = 'correct';
                  } else if (isSelected && !isCorrect) {
                    statusClass = 'wrong';
                  } else {
                    statusClass = 'disabled';
                  }
                } else if (isSelected) {
                  statusClass = 'selected';
                }

                return (
                  <div
                    key={opt.key}
                    className={`geogebra-option-card ${statusClass}`}
                    onClick={() => handleSelectOption(opt.key)}
                  >
                    <div className="geogebra-option-indicator">{opt.key}</div>
                    <div className="geogebra-option-text">{opt.text}</div>
                  </div>
                );
              })}
            </div>

            {/* Live GeoGebra Inspector & Verification Section */}
            <div className="geogebra-verify-box">
              <div className="geogebra-verify-bar">
                <div className="geogebra-canvas-status" title="Real-time detection of objects plotted on the GeoGebra workspace">
                  <span className={`status-dot ${inspection.connected ? 'active' : 'idle'}`} />
                  <span className="status-label">
                    {!inspection.connected
                      ? 'GeoGebra: Connecting...'
                      : inspection.count === 0
                      ? 'GeoGebra: Canvas Empty'
                      : `GeoGebra: ${inspection.count} object${inspection.count > 1 ? 's' : ''} detected (${inspection.objects.map((o) => o.name).slice(0, 4).join(', ')}${inspection.objects.length > 4 ? '...' : ''})`}
                  </span>
                </div>

                <button
                  type="button"
                  className="geogebra-verify-btn"
                  onClick={handleCheckWork}
                  disabled={isVerifying}
                  title="Inspect your GeoGebra canvas to verify if your plot matches this question"
                >
                  {isVerifying ? '⏳ Analyzing...' : '🔍 Check My GeoGebra Work'}
                </button>
              </div>

              {/* Live Verification Feedback Banner */}
              {verificationResult && (
                <div className={`geogebra-verify-feedback ${verificationResult.verified ? 'verified' : verificationResult.status === 'empty' ? 'empty' : 'partial'}`}>
                  <div className="verify-header">
                    <span className="verify-icon">
                      {verificationResult.verified ? '🎉' : verificationResult.status === 'empty' ? '📍' : '💡'}
                    </span>
                    <span className="verify-title">
                      {verificationResult.verified
                        ? 'Construction Verified!'
                        : verificationResult.status === 'empty'
                        ? 'No Objects on Canvas'
                        : 'Construction Notice'}
                    </span>
                  </div>

                  <div className="verify-message">{verificationResult.message}</div>

                  {verificationResult.detected && (
                    <div className="verify-detected">
                      <span className="detected-label">Detected:</span>
                      <code className="detected-code">{verificationResult.detected}</code>
                    </div>
                  )}

                  {verificationResult.missing && (
                    <div className="verify-missing">
                      <span className="missing-label">Missing:</span>
                      <code className="missing-code">{verificationResult.missing}</code>
                    </div>
                  )}

                  {verificationResult.suggestion && (
                    <div className="verify-suggestion">
                      <strong>Tip:</strong> {verificationResult.suggestion}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="geogebra-actions-bar">
              {!isSubmitted ? (
                <button
                  className="geogebra-btn-primary"
                  disabled={!selectedOption}
                  onClick={handleSubmit}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  className={`geogebra-btn-primary ${!isConstructionComplete ? 'locked' : ''}`}
                  onClick={handleNext}
                  title={
                    !isConstructionComplete
                      ? 'GeoGebra construction required on the right to proceed'
                      : 'Advance to next question'
                  }
                >
                  {isConstructionComplete
                    ? (currentIndex < totalQuestions - 1 ? 'Next Question →' : 'Finish Level 1 🏆')
                    : '🔒 Complete Construction to Advance'}
                </button>
              )}

              <button
                className="geogebra-btn-secondary"
                onClick={() => setShowHint((h) => !h)}
                title="Show syntax hint"
              >
                💡 Hint
              </button>
            </div>

            {/* Construction Gate Notice: Visible when submitted but GeoGebra plot is incomplete */}
            {isSubmitted && !isConstructionComplete && (
              <div className="geogebra-progression-gate-notice">
                <div className="gate-notice-icon">🔒</div>
                <div className="gate-notice-body">
                  <div className="gate-notice-heading">
                    GeoGebra Construction Required to Advance
                  </div>
                  <p className="gate-notice-text">
                    Your option is submitted, but the interactive GeoGebra construction on the right canvas must also be completed to go ahead.
                  </p>
                  {verificationResult?.missing && (
                    <div className="gate-notice-missing">
                      <span className="gate-missing-label">Missing on board:</span>
                      <code className="gate-missing-code">{verificationResult.missing}</code>
                    </div>
                  )}
                  {verificationResult?.suggestion && (
                    <div className="gate-notice-tip">
                      💡 <strong>Tip:</strong> {verificationResult.suggestion}
                    </div>
                  )}
                  <div className="gate-notice-actions">
                    <button
                      type="button"
                      className="gate-verify-cta"
                      onClick={handleCheckWork}
                      disabled={isVerifying}
                    >
                      {isVerifying ? '⏳ Checking Board...' : '🔍 Check My GeoGebra Work'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hint Drawer */}
            {showHint && (
              <div className="geogebra-hint-box">
                <div className="geogebra-hint-title">💡 Syntax Hint</div>
                {currentQuestion.hint}
              </div>
            )}

            {/* Explanation Box */}
            {isSubmitted && (
              <div className={`geogebra-explanation-box ${isCorrect ? 'success' : 'error'}`}>
                <div className="geogebra-explanation-title">
                  {isCorrect ? '✅ Correct Answer!' : '❌ Not Quite'}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Answer: Option {currentQuestion.correct} ({currentQuestion.options.find((o) => o.key === currentQuestion.correct)?.text})</strong>
                </div>

                {/* Construction Verification Status on Submit */}
                {verificationResult && (
                  <div className={`geogebra-submitted-construction-pill ${verificationResult.verified ? 'verified' : 'incomplete'}`}>
                    <span className="construction-pill-icon">
                      {verificationResult.verified ? '🎯' : '⚠️'}
                    </span>
                    <div className="construction-pill-content">
                      <div className="construction-pill-title">
                        {verificationResult.verified
                          ? 'GeoGebra Construction Verified'
                          : 'GeoGebra Construction Incomplete'}
                      </div>
                      <div className="construction-pill-sub">
                        {verificationResult.verified
                          ? (verificationResult.detected || 'All required objects verified on your board!')
                          : (verificationResult.missing
                              ? `Missing: ${verificationResult.missing}`
                              : verificationResult.message)}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 8 }}>{currentQuestion.explanation}</div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="geogebra-nav-controls">
              <button
                className="geogebra-btn-secondary"
                disabled={currentIndex === 0}
                onClick={handlePrev}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', alignSelf: 'center' }}>
                {currentIndex + 1} / {totalQuestions}
              </span>
              <button
                className="geogebra-btn-secondary"
                disabled={currentIndex === totalQuestions - 1 || !canGoAhead}
                onClick={handleNext}
                title={
                  !isSubmitted
                    ? 'Submit your answer first'
                    : !isConstructionComplete
                    ? 'Complete and verify your GeoGebra construction to proceed'
                    : 'Next question'
                }
              >
                Next →
              </button>
            </div>
            </>
            )}
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────────
            RESIZER DIVIDER HANDLE (Draggable, Double-click to reset)
           ───────────────────────────────────────────────────────────── */}
        <div
          className={`geogebra-resizer-handle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={startDragging}
          onTouchStart={startDragging}
          onDoubleClick={handleResetSplit}
          title="Drag to resize panes • Double-click to reset (50/50)"
          role="separator"
          aria-orientation="vertical"
        >
          <div className="geogebra-resizer-line" />
          <div className="geogebra-resizer-thumb">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT PANEL: LIVE GEOGEBRA WORKSPACE (Resizable width)
           ───────────────────────────────────────────────────────────── */}
        <main
          className="geogebra-canvas-panel"
          style={{ width: `${100 - leftWidthPercent}%` }}
        >
          <header className="geogebra-workspace-header">
            <div className="geogebra-workspace-title">
              <span>📐 Live GeoGebra Workspace</span>
              <span className="geogebra-mode-pill">
                {currentQuestion.perspective === 'T'
                  ? '3D View'
                  : currentQuestion.perspective === 'A'
                  ? 'Matrix / CAS'
                  : 'Calculator Suite'}
              </span>
              {inspection.connected && (
                <span className="geogebra-live-connected-badge" title="GeoGebra JavaScript API is active and syncing in real time">
                  ● Live Synced
                </span>
              )}
            </div>

            <div className="geogebra-workspace-tools">
              <button
                className="geogebra-clear-btn"
                onClick={handleClearCanvas}
                title="Reset the GeoGebra workspace to clean slate"
              >
                🗑️ Clear Canvas
              </button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="geogebra-clear-btn"
                style={{ textDecoration: 'none' }}
                title="Open full GeoGebra in a new tab"
              >
                ↗ Open New Tab
              </a>
            </div>
          </header>

          <div className="geogebra-viewport" ref={viewportRef}>
            {(!appletReady && !iframeLoaded) && (
              <div className="geogebra-loading-overlay">
                <div className="geogebra-spinner" />
                <div>Loading Live GeoGebra Workspace...</div>
              </div>
            )}

            {useIframeFallback ? (
              <iframe
                key={`${currentQuestion.perspective}-${resetKey}`}
                src={currentUrl}
                title="GeoGebra Live Workspace"
                className="geogebra-iframe"
                onLoad={() => setIframeLoaded(true)}
                allow="fullscreen; clipboard-read; clipboard-write; autoplay"
              />
            ) : (
              <div
                id="geogebra-mount-target"
                ref={mountRef}
                className="geogebra-applet-mount"
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

