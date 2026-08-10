import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API, getLocalXp, setLocalXp, changeXp } from './hintUtils.js';

export function HintModal({ concept, questionId, questionData, answerData, revealed }) {
  const [unlockedLevels, setUnlockedLevels] = useState({}); // { [level]: hintText }
  const [loadingLevel, setLoadingLevel] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [portalTarget, setPortalTarget] = useState(null);
  const [activeAccordionId, setActiveAccordionId] = useState(null);
  const [confirmingLevel, setConfirmingLevel] = useState(null);
  const currentXp = getLocalXp();
  
  const effectiveQuestionId = questionId || (questionData ? (questionData._id || questionData.id || JSON.stringify(questionData)) : 'unknown');

  useEffect(() => {
    setPortalTarget(document.body);
    setUnlockedLevels({});
    setErrorMsg('');
    setLoadingLevel(null);
    setCooldownRemaining(0);
  }, [effectiveQuestionId]);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => setCooldownRemaining(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  if (!questionData) {
    return null;
  }

  const handleUnlock = async (level) => {
    if (cooldownRemaining > 0) return;

    const clientEstimateCost = level === 1 ? 5 : (level === 2 ? 8 : 10);

    const activeXp = getLocalXp();
    if (activeXp < clientEstimateCost) {
      setErrorMsg("Not enough XP coins! Solve more questions correctly to earn XP.");
      const btn = document.getElementById(`hint-btn-${level}`);
      if (btn) {
        btn.classList.add('wobble-anim');
        setTimeout(() => btn.classList.remove('wobble-anim'), 500);
      }
      return;
    }

    setErrorMsg('');
    setLoadingLevel(level);

    try {
      const token = localStorage.getItem('tenali-auth-token');
      const res = await fetch(`${API}/api/hints/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          concept,
          questionId: effectiveQuestionId,
          level,
          questionData,
          answerData
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'insufficient_xp') {
          if (typeof data.current === 'number') setLocalXp(data.current);
        }
        throw new Error(data.error || 'Failed to unlock');
      }

      const data = await res.json();
      const actualCost = typeof data.cost === 'number' ? data.cost : clientEstimateCost;

      if (data.guest) {
        changeXp(-actualCost);
      } else if (data.balance !== undefined) {
        setLocalXp(data.balance);
        try {
          window.dispatchEvent(new CustomEvent('tenali-xp-float', { detail: { diff: -actualCost } }));
        } catch {}
      }

      setUnlockedLevels(prev => ({ ...prev, [level]: data.hint }));
      setConfirmingLevel(null);
      setConfirmingLevel(null);
      
      if (level < 3) {
        setCooldownRemaining(60);
      }

      try {
        window.dispatchEvent(new CustomEvent('tenali-hint-used', { detail: { level } }));
      } catch {}

    } catch (err) {
      console.error(err);
      if (err.message === 'insufficient_xp') {
        setErrorMsg("Insufficient XP balance!");
      } else if (err.message === 'rate_limited') {
        setErrorMsg("Too many unlocks — take a breath and try again in a few seconds.");
      } else if (err.message === 'per_question_limit' || err.message === 'per_lesson_limit') {
        setErrorMsg("Hint cap reached for this session — try the next question.");
      } else {
        setErrorMsg("Unlock failed. Please try again.");
      }
    } finally {
      setLoadingLevel(null);
    }
  };

  const levels = [
    { id: 1, label: 'Level 1: Nudge',          costHint: '5 XP',   desc: 'A subtle nudge toward the right approach (no spoilers).' },
    { id: 2, label: 'Level 2: Partial Step',   costHint: '8 XP',  desc: 'Reveals the first equation step with one concrete value.' },
    { id: 3, label: 'Level 3: Worked Example', costHint: '10 XP',  desc: 'Step-by-step complete worked solution.' }
  ];

  const getUniqueHintText = (rawText, prevText) => {
    if (!rawText) return '';
    if (!prevText) return rawText;
    
    const normRaw = rawText.replace(/\r\n/g, '\n').trim();
    const normPrev = prevText.replace(/\r\n/g, '\n').trim();
    
    if (normRaw.startsWith(normPrev)) {
      return normRaw.slice(normPrev.length).trim();
    }
    
    if (normRaw.includes(normPrev)) {
      return normRaw.replace(normPrev, '').trim();
    }
    
    const rawSentences = normRaw.split('\n');
    const prevSentences = normPrev.split('\n');
    let matchCount = 0;
    while (matchCount < rawSentences.length && matchCount < prevSentences.length) {
      if (rawSentences[matchCount].trim() === prevSentences[matchCount].trim()) {
        matchCount++;
      } else {
        break;
      }
    }
    if (matchCount > 0) {
      return rawSentences.slice(matchCount).join('\n').trim();
    }
    
    return rawText;
  };

  const renderNudgeHint = (text) => {
    if (!text) return null;

    const strategyWords = [
      'place value', 'carry', 'align', 'decimal', 'inverse', 'factor', 'formula',
      'strategy', 'expand', 'distribute', 'simplify', 'isolate', 'substitute',
      'rearrange', 'multiply', 'divide', 'add', 'subtract', 'fraction', 'ratio',
      'percentage', 'equation', 'variable', 'coefficient', 'exponent', 'root',
      'prime', 'average', 'mean', 'median', 'mode', 'probability', 'symmetry',
      'reflection', 'rotation', 'translation', 'congruent', 'similar', 'parallel',
      'perpendicular', 'gradient', 'intercept', 'vertex', 'discriminant'
    ];

    const highlightKeywords = (str) => {
      const parts = [];
      const pattern = new RegExp(`\\b(${strategyWords.join('|')})\\b`, 'gi');
      let lastIndex = 0;
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(str)) !== null) {
        if (match.index > lastIndex) parts.push(str.slice(lastIndex, match.index));
        parts.push(
          <mark key={match.index} className="nudge-keyword">{match[0]}</mark>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < str.length) parts.push(str.slice(lastIndex));
      return parts.length > 0 ? parts : [str];
    };

    const nudgeIcon = (text) => {
      const t = text.toLowerCase();
      if (t.includes('formula') || t.includes('equation')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          <path d="M6 6h10M6 10h10M6 14h6"/>
        </svg>
      );
      if (t.includes('place value') || t.includes('column') || t.includes('align')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1"/>
          <rect width="7" height="5" x="14" y="3" rx="1"/>
          <rect width="7" height="9" x="14" y="12" rx="1"/>
          <rect width="7" height="5" x="3" y="16" rx="1"/>
        </svg>
      );
      if (t.includes('inverse') || t.includes('reverse') || t.includes('undo')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      );
      if (t.includes('break') || t.includes('split') || t.includes('expand')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/>
          <circle cx="6" cy="18" r="3"/>
          <line x1="9.8" y1="8.2" x2="21" y2="19.4"/>
          <line x1="21" y1="4.6" x2="13.2" y2="12.4"/>
          <line x1="9.8" y1="15.8" x2="6" y2="12"/>
        </svg>
      );
      if (t.includes('count') || t.includes('group') || t.includes('add')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
        </svg>
      );
      if (t.includes('think') || t.includes('recall') || t.includes('remember')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/>
        </svg>
      );
      if (t.includes('re-read') || t.includes('reread') || t.includes('identify')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );
      if (t.includes('strategy') || t.includes('approach') || t.includes('focus')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
      if (t.includes('multiply') || t.includes('product') || t.includes('times')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      );
      if (t.includes('divide') || t.includes('division') || t.includes('quotient')) return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="6" r="2"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
          <circle cx="12" cy="18" r="2"/>
        </svg>
      );
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .4 2.5 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/>
          <path d="M9 18h6"/>
          <path d="M10 22h4"/>
        </svg>
      );
    };

    const segments = splitSvgHints(text);

    return (
      <div className="nudge-hint-visual hint-fade-in" style={{ marginTop: '0' }}>
        {segments.map((seg, si) => {
          if (seg.type === 'svg') return renderSvgBlock(seg.content, `nudge-svg-${si}`);

          const rawChunks = seg.content
            .split(/(?<=[.!?;\\n])\\s+|\\n+/)
            .map(s => s.trim())
            .filter(Boolean);

          const questionRepeat = rawChunks.find(c => c.startsWith('(') && c.endsWith(')'));
          const mainChunks = rawChunks.filter(c => c !== questionRepeat);

          return (
            <div key={`nudge-seg-${si}`} className="nudge-seg-container">
              {mainChunks.length > 0 && (
                <div className="nudge-chips-grid">
                  {mainChunks.map((chunk, i) => (
                    <div key={i} className="nudge-chip" style={{ animationDelay: `${i * 0.08}s` }}>
                      <span className="nudge-chip-icon">{nudgeIcon(chunk)}</span>
                      <span className="nudge-chip-text">{highlightKeywords(chunk)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const splitSvgHints = (text) => {
    if (!text || !text.includes('<svg-hint>')) return [{ type: 'text', content: text }];
    const segments = [];
    let remaining = text;
    while (remaining.length > 0) {
      const start = remaining.indexOf('<svg-hint>');
      if (start === -1) { segments.push({ type: 'text', content: remaining }); break; }
      if (start > 0) segments.push({ type: 'text', content: remaining.slice(0, start) });
      const end = remaining.indexOf('</svg-hint>', start);
      if (end === -1) { segments.push({ type: 'text', content: remaining.slice(start) }); break; }
      segments.push({ type: 'svg', content: remaining.slice(start + 10, end) });
      remaining = remaining.slice(end + 11);
    }
    return segments.filter(s => s.content && s.content.trim());
  };

  const renderSvgBlock = (svgContent, key) => (
    <div
      key={key}
      className="hint-svg-block"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );

  const formatHintText = (text) => {
    if (!text) return null;
    const segments = splitSvgHints(text);
    if (segments.some(s => s.type === 'svg')) {
      return segments.map((seg, si) => {
        if (seg.type === 'svg') return renderSvgBlock(seg.content, `svg-${si}`);
        const subLines = seg.content.split('\\n');
        return subLines.map((line, li) => {
          const t = line.trim();
          if (!t) return <div key={`${si}-${li}`} style={{ height: '6px' }} />;
          return <p key={`${si}-${li}`} style={{ margin: '5px 0', lineHeight: 1.5 }}>{t}</p>;
        });
      });
    }
    const lines = text.split('\\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: '8px' }} />;
      }

      if (trimmed.startsWith('---') && trimmed.endsWith('---')) {
        const innerText = trimmed.replace(/^-+\\s*|\\s*-+$/g, '');
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--clr-text-soft)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--clr-border)' }} />
            {innerText && <span style={{ padding: '0 12px' }}>{innerText}</span>}
            <div style={{ flex: 1, height: '1px', background: 'var(--clr-border)' }} />
          </div>
        );
      }

      const boldPrefixRegex = /^(\\*\\*|__)?(Problem|Rule|Tip|Step \\d+|Step|Example|Note|Formula|Worked Solution|Answer|Solution)(\\*\\*|__)?:\\s*(.*)/i;
      const match = trimmed.match(boldPrefixRegex);

      if (match) {
        const keyword = match[2];
        const rest = match[4].trim();
        const hasEquals = rest.includes('=');
        const isShort = rest.length < 80;
        const isEquation = hasEquals && isShort;

        if (isEquation) {
          return (
            <div key={idx} style={{ margin: '14px 0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f5b041', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                {keyword}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '14px', fontFamily: 'Courier New, monospace', fontSize: '1rem', color: '#fff', textAlign: 'center', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {rest}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: '8px 0', lineHeight: 1.5 }}>
            <strong style={{ color: '#f5b041', textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.05em' }}>{keyword}:</strong> {rest}
          </p>
        );
      }

      return (
        <p key={idx} style={{ margin: '8px 0', lineHeight: 1.5 }}>
          {trimmed}
        </p>
      );
    });
  };

  const renderContent = () => {

    const highestUnlocked = Math.max(0, ...Object.keys(unlockedLevels).map(Number));
    const nextLevel = highestUnlocked + 1;
    const nextLvlData = levels.find(l => l.id === nextLevel);

    const accordionLabels = [
      { id: 1, title: 'Direction and first step', sub: 'Level 1 — direction' },
      { id: 2, title: 'Further steps', sub: 'Level 2 — partial step' },
      { id: 3, title: 'Remaining steps', sub: 'Level 3 — worked solution' }
    ];

    const checkSvg = (
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    );

    const lockSvg = (
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    );

    return (
      <>
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMinimized(true)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 100000,
          }}
        />

        {/* Panel */}
        <div
          className="hint-fade-in"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(460px, calc(100vw - 40px))',
            maxHeight: '85vh',
            overflowY: 'auto',
            background: '#1a1714',
            borderRadius: '16px',
            padding: '22px 20px 20px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            zIndex: 100001,
            border: '1px solid rgba(255,245,230,0.07)',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ede8e3', display: 'flex', alignItems: 'center', gap: '9px' }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e8e2dc' }}>
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .4 2.5 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/>
                <path d="M9 18h6"/>
                <path d="M10 22h4"/>
              </svg>
              Progressive Hints
            </h3>
            <button type="button"
              onClick={() => setIsMinimized(true)}
              style={{ background: 'transparent', border: 'none', color: '#7a7470', cursor: 'pointer', padding: '4px', display: 'flex', lineHeight: 1 }}
              aria-label="Close hints"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {errorMsg && (
            <div style={{
              color: 'var(--clr-wrong)', fontSize: '0.85rem', marginBottom: '12px',
              padding: '8px 12px', borderRadius: '8px', background: 'var(--clr-wrong-bg)',
              border: '1px solid rgba(224, 90, 74, 0.2)', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="hint-accordion-list">
            {accordionLabels.map(item => {
              const isUnlocked = !!unlockedLevels[item.id] || revealed;
              const isAvailableToUnlock = item.id === nextLevel && nextLvlData;
              const isLocked = !isUnlocked && !isAvailableToUnlock;
              const isOpen = activeAccordionId === item.id;
              
              const rawText1 = unlockedLevels[1] || '';
              const rawText2 = unlockedLevels[2] || '';
              const rawText3 = unlockedLevels[3] || '';

              let uniqueText = '';
              if (item.id === 1) {
                uniqueText = rawText1;
              } else if (item.id === 2) {
                uniqueText = getUniqueHintText(rawText2, rawText1);
              } else if (item.id === 3) {
                uniqueText = getUniqueHintText(getUniqueHintText(rawText3, rawText2), rawText1);
              }

              return (
                <div
                  key={item.id}
                  className={`hint-accordion-card ${isUnlocked ? 'unlocked' : 'locked'} ${isOpen ? 'open' : ''} ${isAvailableToUnlock ? 'active' : ''}`}
                >
                  {/* Header Row */}
                  <div
                    className="hint-accordion-header"
                    onClick={() => {
                      if (isUnlocked || isAvailableToUnlock) {
                        setActiveAccordionId(isOpen ? null : item.id);
                      }
                    }}
                  >
                    <div className="hint-header-left">
                      <span className="hint-circle-num">{item.id}</span>
                      <span className="hint-title-text">{item.title}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isUnlocked ? (
                        <span className="hint-status-indicator used">Used</span>
                      ) : isAvailableToUnlock ? (
                        <span className="hint-status-indicator cost">{nextLvlData.costHint}</span>
                      ) : (
                        <span className="hint-status-indicator locked">
                          {item.id === 2 ? '8 XP' : '10 XP'}
                        </span>
                      )}
                      <svg
                        className="hint-chevron"
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: isLocked ? 0.3 : 1 }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Body Content */}
                  {isOpen && (isUnlocked || isAvailableToUnlock) && (
                    <div className="hint-accordion-body">
                      {isUnlocked ? (
                        <div className="hint-inner-content">
                          <div className="hint-sub-badge">{item.sub}</div>
                          {item.id === 1 ? renderNudgeHint(uniqueText) : formatHintText(uniqueText)}
                        </div>
                      ) : (
                        <div className="hint-locked-prompt">
                          <span className="hint-locked-text">Costs {nextLvlData.costHint} to reveal</span>
                          
                          {confirmingLevel === item.id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="button"
                                onClick={() => {
                                  setConfirmingLevel(null);
                                  handleUnlock(item.id);
                                }}
                                disabled={loadingLevel === item.id || cooldownRemaining > 0}
                                className="hint-reveal-btn"
                                style={{ background: 'var(--clr-accent)', borderColor: 'var(--clr-accent)', color: '#fff' }}
                              >
                                Confirm
                              </button>
                              <button type="button"
                                onClick={() => setConfirmingLevel(null)}
                                className="hint-reveal-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button type="button"
                              id={`hint-btn-${item.id}`}
                              onClick={() => setConfirmingLevel(item.id)}
                              disabled={loadingLevel === item.id || cooldownRemaining > 0}
                              className="hint-reveal-btn"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                              <span>{loadingLevel === item.id ? 'Unlocking...' : cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : 'Reveal'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="progressive-hint-toggle"
        title="Open Hints Panel"
        style={{
          background: 'transparent',
          color: 'var(--clr-accent)',
          border: '1.5px solid var(--clr-accent)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 28px',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: 'none',
          zIndex: 10000,
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          lineHeight: '1.4'
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.5 1.5-3.5A5 5 0 0 0 8 8c0 1 .4 2.5 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/>
          <path d="M9 18h6"/>
          <path d="M10 22h4"/>
        </svg>
        <span>Hints</span>
      </button>
      {!isMinimized && portalTarget && createPortal(renderContent(), portalTarget)}
    </>
  );
}

export function GlobalXpPanel() {
  const [xp, setXp] = useState(getLocalXp());
  useEffect(() => {
    const handleStorage = () => setXp(getLocalXp());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => {
      const current = getLocalXp();
      if (current !== xp) setXp(current);
    }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [xp]);
  return (
    <div style={{ position: 'fixed', top: '64px', left: '16px', zIndex: 10000, background: 'var(--clr-surface, #1e1e2f)', padding: '8px 16px', borderRadius: '20px', color: '#f5b041', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid var(--clr-border, #333)', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span>{xp} 🪙</span>
    </div>
  );
}
