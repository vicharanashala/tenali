/* eslint-disable react-hooks/purity, no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { WARMUP_QUESTIONS_V01, getTopicDisplayName, WARMUP_SUPPORTED_TOPICS, getWarmupPrompt } from './constants';

export function useWarmupIntervention({ apiPath, title, started, finished, questionNumber, score, results, API, answer }) {
    // Hesitation Monitor State (Soft Intervention)
    const [hesitationPopupActive, setHesitationPopupActive] = useState(false)
    const hesitationShownRef = useRef(false)
    const hesitationCooldownRef = useRef(0)
    const clearCountRef = useRef(0)
    const idleTimerRef = useRef(null)
    const lastAnswerStrRef = useRef('')
    const triggerHesitationRef = useRef(null)

    // ── Feature P v0.1: Struggle Detection & Warmup State ─────────────────────
    // frozenQuizState: snapshot taken when warmup fires (not used for restore in
    // v0.1 since React state is never mutated during warmup, but kept as a
    // reference for debugging and future v0.2 enhancements).
    const [frozenQuizState, setFrozenQuizState] = useState(null)  // eslint-disable-line no-unused-vars
    // warmupActive: controls visibility of the warmup overlay modal.
    const [warmupActive, setWarmupActive] = useState(false)
    // warmupStep: 0-indexed position in the 3-question warmup sequence.
    const [warmupStep, setWarmupStep] = useState(0)
    // warmupAnswer/Feedback/Revealed: isolated answer-flow state for the
    // warmup overlay (never touches the main quiz answer state).
    const [warmupAnswer, setWarmupAnswer] = useState('')
    const [warmupFeedback, setWarmupFeedback] = useState('')
    const [warmupRevealed, setWarmupRevealed] = useState(false)
    // Feature P v0.2: dynamic warmup questions fetched from prerequisite topic API.
    // Falls back to WARMUP_QUESTIONS_V01 if fetch fails or topic has no prereq.
    const [warmupQuestions, setWarmupQuestions] = useState(WARMUP_QUESTIONS_V01)
    const [warmupPrereqTopic, setWarmupPrereqTopic] = useState(null)
    const [warmupLoading, setWarmupLoading] = useState(false)
    // historyWindowRef: rolling array of last <=4 answer results (true=correct).
    // Stored as a ref so handlers always read the latest value synchronously.
    const historyWindowRef = useRef([])
    // cooldownRef: countdown of questions before the struggle trigger re-enables.
    // Set to 4 after warmup completes to prevent immediate re-trigger loops.
    const cooldownRef = useRef(0)
    // sessionWarmupTopicsRef: tracks which prereq topics have already been
    // shown as warmup during this quiz session, preventing repeat warmups.
    const sessionWarmupTopicsRef = useRef(new Set())
    // prereqCacheRef: caches resolved topic prerequisites to prevent redundant
    // network roundtrips during hierarchical lookup.
    const prereqCacheRef = useRef(new Map())
    // prereqFetchFailedRef: true iff the most recent prereq fetch failed BOTH
    // attempts (Q10a: retry once after 1s, then declare failure). Used by
    // triggerAutoWarmup to choose the v0.1 WARMUP_QUESTIONS_V01 fallback
    // instead of triggering a tier-2 picker on a network error.
    const prereqFetchFailedRef = useRef(false)
    // Feature P v0.3: Student-Controlled Prerequisite Picker State
    const [struggleCount, setStruggleCount] = useState(0) // 0=never, 1=1st, 2=2nd, 3+=learn-rec
    const [pickerActive, setPickerActive] = useState(false)
    const [pickerTopics, setPickerTopics] = useState([])
    const [learnRecActive, setLearnRecActive] = useState(false)
    const [learnRecTopics, setLearnRecTopics] = useState([])
    // ──────────────────────────────────────────────────────────────────────────

    // Reset hesitation state on new question
    useEffect(() => {
      if (questionNumber > 0) {
        setHesitationPopupActive(false)
        hesitationShownRef.current = false
        clearCountRef.current = 0
        lastAnswerStrRef.current = ''
        if (hesitationCooldownRef.current > 0) {
          hesitationCooldownRef.current--
        }
      }
    }, [questionNumber])

    // Hesitation tracking logic
    useEffect(() => {
      if (!started || finished || warmupActive || pickerActive || learnRecActive || hesitationPopupActive) return

      const triggerIntervention = (reason) => {
        setHesitationPopupActive(true)
        hesitationShownRef.current = true
      }
      triggerHesitationRef.current = triggerIntervention

      const resetTimer = () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        if (hesitationShownRef.current || hesitationCooldownRef.current > 0) return
        idleTimerRef.current = setTimeout(() => {
          triggerIntervention('idle_timeout')
        }, 60000)
      }

      const handleInput = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          if (hesitationShownRef.current || hesitationCooldownRef.current > 0) return
          const val = e.target.value
          // Detect clearing of input
          if (val === '' && lastAnswerStrRef.current !== '') {
            clearCountRef.current++
            if (clearCountRef.current >= 2) {
              if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
              triggerIntervention('frequent_clears')
            }
          }
          lastAnswerStrRef.current = val
          resetTimer()
        }
      }

      const handleFocus = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          resetTimer()
        }
      }

      const handleBlur = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        }
      }

      window.addEventListener('input', handleInput)
      window.addEventListener('focus', handleFocus, true)
      window.addEventListener('blur', handleBlur, true)

      return () => {
        window.removeEventListener('input', handleInput)
        window.removeEventListener('focus', handleFocus, true)
        window.removeEventListener('blur', handleBlur, true)
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      }
    }, [started, finished, warmupActive, pickerActive, learnRecActive, hesitationPopupActive])

    // Backup hesitation tracker: watches the `answer` prop directly so NumPad-driven
    // state changes (which don't fire native input events) also count toward clearCountRef.
    useEffect(() => {
      if (!started || finished) return
      if (answer === undefined || answer === null) return
      if (hesitationShownRef.current || hesitationCooldownRef.current > 0) return
      if (answer === '' && lastAnswerStrRef.current !== '') {
        clearCountRef.current++
        if (clearCountRef.current >= 2) {
          triggerHesitationRef.current && triggerHesitationRef.current('frequent_clears')
        }
      }
      lastAnswerStrRef.current = answer
    }, [answer, started, finished])

    // ── Feature P v0.1: Struggle Detection & Warmup Handlers ──────────────────
    //
    // checkStruggle(correct)
    //   Called after every answer submission (including solve/skip).
    //   If in cooldown, decrements cooldown and returns without checking.
    //   Otherwise appends `correct` to the sliding window (capped at 4).
    //   If 3+ of the last 4 are false → fires triggerWarmup().
    const checkStruggle = (correct) => {
      if (cooldownRef.current > 0) {
        cooldownRef.current -= 1
        return
      }
      const next = [...historyWindowRef.current, correct].slice(-4)
      historyWindowRef.current = next
      const wrongs = next.filter(v => !v).length
      if (next.length >= 4 && wrongs >= 3) {
        historyWindowRef.current = []
        cooldownRef.current = 4

        const nextStruggleCount = struggleCount + 1
        setStruggleCount(nextStruggleCount)

        if (nextStruggleCount === 1) triggerAutoWarmup()
        else if (nextStruggleCount === 2) triggerPicker()
        else triggerLearnRec()
      }
    }

    const getRecommendedPrerequisite = (prereqs) => {
      // v0.3 spec fix (option m1): prefer fresh warmups over repeats.
      // 1. First prereq that is supported AND not yet completed this session.
      // 2. Otherwise, any supported prereq (re-recommended if all supported
      //    ones are completed — better than showing nothing).
      // 3. Otherwise null (no Recommended tag — still rendered as regular chips).
      const fresh = prereqs.find(
        t => WARMUP_SUPPORTED_TOPICS.has(t) && !sessionWarmupTopicsRef.current.has(t)
      )
      if (fresh) return fresh
      const anySupported = prereqs.find(t => WARMUP_SUPPORTED_TOPICS.has(t))
      return anySupported ?? null
    }

    // fetchPrereqs(topic)
    //   Resolves the prerequisite list for `topic` from the live
    //   /api/prerequisites/:topic endpoint, with a 1-attempt retry (Q10a).
    //   Returns [] on definitive failure OR on root topic (no prereqs).
    //   Side-effect: prereqFetchFailedRef.current is set true on retry-exhausted
    //   failure so triggerAutoWarmup can pick the v0.1 fallback path.
    const fetchPrereqs = async (topic) => {
      // Strip -api suffix if present (apiPath is 'percent-api', server expects 'percent')
      const lookupTopic = topic.endsWith('-api') ? topic.slice(0, -4) : topic
      if (prereqCacheRef.current.has(lookupTopic)) {
        return prereqCacheRef.current.get(lookupTopic)
      }
      // Q10a: two-attempt fetch with 1s wait between.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(`${API}/api/prerequisites/${lookupTopic}`)
          if (res.ok) {
            const data = await res.json()
            const prereqs = data.prereqTopics || []
            prereqCacheRef.current.set(lookupTopic, prereqs)
            prereqFetchFailedRef.current = false
            return prereqs
          }
        } catch (e) {
          console.error(`Failed to fetch prereqs for ${topic} (attempt ${attempt + 1}):`, e)
        }
        if (attempt === 0) {
          // wait 1s before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      // Both attempts failed.
      prereqFetchFailedRef.current = true
      return []
    }

    const triggerAutoWarmup = async () => {
      setWarmupLoading(true)
      const prereqs = await fetchPrereqs(apiPath)

      // Q10a: if the server is unreachable after retry, fall back to the v0.1
      // hardcoded WARMUP_QUESTIONS_V01. Don't escalate to picker / learn-rec
      // on a network error — that would feel arbitrary to the student.
      if (prereqFetchFailedRef.current) {
        setWarmupLoading(false)
        // Open the warmup overlay directly with the v0.1 fallback questions.
        setWarmupActive(true)
        setWarmupStep(0)
        setWarmupAnswer('')
        setWarmupFeedback('')
        setWarmupRevealed(false)
        setWarmupQuestions(WARMUP_QUESTIONS_V01.map(q => ({ ...q, _source: 'local' })))
        setWarmupPrereqTopic(null)
        setWarmupLoading(false)
        return
      }

      if (prereqs.length === 0) {
        setWarmupLoading(false)
        triggerLearnRec(prereqs)
        return
      }

      const recommended = getRecommendedPrerequisite(prereqs)
      if (recommended) {
        // TODO v1.1: Q10b chain-through-parents — if startWarmupForTopic's
        // /question fetch 500s on `recommended`, try the next supported
        // prereq in order before falling back to v0.1. v1.0 ships with
        // immediate v0.1 fallback (handled inside startWarmupForTopic's
        // catch) because chain-across-modals is UX-awkward.
        await startWarmupForTopic(recommended)
      } else {
        setWarmupLoading(false)
        triggerPicker(prereqs)
      }
    }

    const triggerPicker = async (preloadedPrereqs = null) => {
      const prereqs = preloadedPrereqs || await fetchPrereqs(apiPath)
      const topics = prereqs.slice(0, 3).map(t => ({
        topic: t,
        displayName: getTopicDisplayName(t),
        completed: sessionWarmupTopicsRef.current.has(t),
        supported: WARMUP_SUPPORTED_TOPICS.has(t),
        recommended: t === getRecommendedPrerequisite(prereqs)
      }))

      const actionable = topics.filter(t => t.supported || t.completed)
      if (actionable.length === 0) {
        triggerLearnRec(prereqs)
        return
      }

      setPickerTopics(topics)
      setPickerActive(true)
    }

    const triggerLearnRec = async (preloadedPrereqs = null) => {
      const prereqs = preloadedPrereqs || await fetchPrereqs(apiPath)
      setLearnRecTopics(prereqs.map(getTopicDisplayName))
      setLearnRecActive(true)
    }

    const startWarmupForTopic = async (topic) => {
      setFrozenQuizState({ questionNumber, score, results })
      setWarmupActive(true)
      setWarmupStep(0)
      setWarmupAnswer('')
      setWarmupFeedback('')
      setWarmupRevealed(false)
      setWarmupLoading(true)
      // Add -api suffix if not present (topic is 'ratio', server has 'ratio-api')
      const fetchPath = topic.endsWith('-api') ? topic : `${topic}-api`
      try {
        const seen = new Set()
        const unique = []
        for (let attempt = 0; unique.length < 3 && attempt < 10; attempt++) {
          const ts2 = Date.now()
          const q = await fetch(`${API}/${fetchPath}/question?q=${attempt * 3}&_=${ts2}`).then(r => r.json())
          if (q && typeof q === 'object') {
            const key = JSON.stringify(q)
            if (!seen.has(key)) {
              seen.add(key)
              unique.push(q)
            }
          }
        }
        if (unique.length > 0) {
          const taggedApi = unique.map(q => ({
            ...q,
            prompt: getWarmupPrompt(q),
            _source: 'api',
            _topic: topic,
          }))
          const taggedLocal = WARMUP_QUESTIONS_V01.map(q => ({ ...q, _source: 'local' }))
          const fetches = [...taggedApi, ...taggedLocal].slice(0, 3)
          setWarmupQuestions(fetches)
          setWarmupPrereqTopic(topic)
        } else {
          setWarmupQuestions(WARMUP_QUESTIONS_V01.map(q => ({ ...q, _source: 'local' })))
          setWarmupPrereqTopic(null)
        }
      } catch {
        setWarmupQuestions(WARMUP_QUESTIONS_V01)
        setWarmupPrereqTopic(null)
      }
      setWarmupLoading(false)
    }

    // handleWarmupSubmit()
    //   Feature P v0.2: per-question mixed checker.
    //   Questions tagged _source:'api' are checked against the live prerequisite
    //   topic's /check endpoint (server now always returns a normalised `display`).
    //   Questions tagged _source:'local' (or untagged fallback) use the local
    //   numeric comparator so we never send an addition question to a maths API.
    const handleWarmupSubmit = async () => {
      if (!warmupAnswer.trim() || warmupRevealed) return
      const q = warmupQuestions[warmupStep]
      if (q?._source === 'api' && q?._topic) {
        try {
          // Add -api suffix if not present (q._topic is 'ratio', server has 'ratio-api')
          const checkPath = q._topic.endsWith('-api') ? q._topic : `${q._topic}-api`
          const checkRes = await fetch(`${API}/${checkPath}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...q, userAnswer: warmupAnswer.trim() }),
          })
          const data = await checkRes.json()
          setWarmupRevealed(true)
          // Server always returns display after normalisation middleware
          setWarmupFeedback(
            data.correct
              ? '✅ Correct!'
              : `❌ The answer is ${data.display || '?'}`
          )
        } catch {
          setWarmupRevealed(true)
          setWarmupFeedback('❌ Could not verify answer — try again')
        }
      } else {
        // Local numeric compare for fallback WARMUP_QUESTIONS_V01
        const expected = q?.answer
        const isRight = Number(warmupAnswer.trim()) === expected
        setWarmupRevealed(true)
        setWarmupFeedback(isRight ? '✅ Correct!' : `❌ The answer is ${expected}`)
      }
    }

    // handleWarmupNext()
    //   Advances to the next warmup question, or calls completeWarmup()
    //   after the 3rd question is answered.
    const handleWarmupNext = () => {
      if (warmupStep < 2) {
        setWarmupStep(s => s + 1)
        setWarmupAnswer('')
        setWarmupFeedback('')
        setWarmupRevealed(false)
      } else {
        completeWarmup()
      }
    }

    // completeWarmup()
    //   Closes the warmup overlay, resets the sliding window, and starts
    //   a 4-question cooldown to prevent an immediate re-trigger.
    //   frozenQuizState is NOT restored here — the existing React state
    //   (questionNumber, score, results) was never mutated during warmup,
    //   so the quiz simply resumes from where it paused.
    const completeWarmup = () => {
      setWarmupActive(false)
      setWarmupStep(0)
      setWarmupAnswer('')
      setWarmupFeedback('')
      setWarmupRevealed(false)
      setFrozenQuizState(null)
      setWarmupQuestions(WARMUP_QUESTIONS_V01)  // reset to fallback for next trigger
      setWarmupPrereqTopic(null)
      setWarmupLoading(false)
      historyWindowRef.current = []  // fresh window after warmup
      cooldownRef.current = 4        // suppress trigger for next 4 questions
      hesitationCooldownRef.current = 2 // suppress hesitation monitor for next 2 questions
      if (warmupPrereqTopic) sessionWarmupTopicsRef.current.add(warmupPrereqTopic)  // don't show this warmup again this session
    }
    // ──────────────────────────────────────────────────────────────────────────


  const isActive = warmupActive || pickerActive || learnRecActive || hesitationPopupActive;

  const overlayElement = (
    <>
        {/* ── Feature P v0.3: Prerequisite Overlays ──────────── */}
        {pickerActive && (
          <div className="warmup-overlay-backdrop">
            <div className="warmup-overlay-card">
              <div style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '6px' }}>🧠</div>
              <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 4px' }}>Still finding this tricky?</p>
              <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--clr-dim, #888)', margin: '0 0 20px' }}>
                Choose a prerequisite topic to do a quick warmup:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {pickerTopics.map(pt => {
                  const actionEnabled = pt.supported || pt.completed
                  return (
                    <div key={pt.topic} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', background: 'var(--clr-surface, #f8f9fa)',
                      borderRadius: '8px', border: '1px solid var(--clr-border, #eee)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {pt.completed ? '✓' : !pt.supported ? '⚠' : pt.recommended ? '⭐' : ' '}
                        </span>
                        <span style={{
                          fontWeight: 500,
                          color: !pt.supported && !pt.completed ? 'var(--clr-dim, #888)' : 'inherit'
                        }}>
                          {pt.displayName} {pt.recommended && <span style={{ fontSize: '0.75rem', color: '#ff9800', marginLeft: '4px' }}>(Recommended)</span>}
                        </span>
                      </div>
                      <button
                        onClick={() => { setPickerActive(false); startWarmupForTopic(pt.topic) }}
                        disabled={!actionEnabled}
                        style={{
                          padding: '6px 12px', fontSize: '0.85rem',
                          background: actionEnabled ? 'var(--clr-primary, #4caf50)' : 'var(--clr-input, #eee)',
                          color: actionEnabled ? 'white' : 'var(--clr-text-soft, #888)',
                          border: 'none', borderRadius: '4px', cursor: actionEnabled ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {actionEnabled ? 'Start Warmup' : '[Practice coming soon]'}
                      </button>
                    </div>
                  )
                })}
              </div>
              <button className="warmup-skip-btn" onClick={() => { setPickerActive(false); completeWarmup() }}>
                Continue Quiz
              </button>
            </div>
          </div>
        )}

        {learnRecActive && (
          <div className="warmup-overlay-backdrop">
            <div className="warmup-overlay-card">
              <div style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '6px' }}>📚</div>
              <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 16px' }}>Taking more time on the foundations will help.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-text, #333)', marginBottom: '12px', lineHeight: 1.5 }}>
                You've already tried the available prerequisite warmups. Before continuing, it's worth revisiting these concepts:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px', color: 'var(--clr-text, #333)', lineHeight: 1.6 }}>
                {learnRecTopics.map(name => <li key={name}><strong>{name}</strong></li>)}
              </ul>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim, #888)', marginBottom: '24px', lineHeight: 1.5 }}>
                These topics form the foundation for <strong>{title}</strong>.
              </p>
              <div className="button-row" style={{ justifyContent: 'center' }}>
                <button onClick={() => { setLearnRecActive(false); completeWarmup() }}>
                  Continue Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {hesitationPopupActive && (
          <div style={{
            position: 'absolute', top: '20px', right: '20px', background: 'var(--clr-card, white)', color: 'var(--clr-text, #333)',
            padding: '16px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
            display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideIn 0.3s ease-out', maxWidth: '350px', borderLeft: '4px solid var(--clr-primary, #4caf50)'
          }}>
            <div>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1.05rem' }}>Need a quick refresher?</p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4 }}>You've been on this question for a while. Would you like to review a prerequisite before continuing?</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button 
                onClick={() => setHesitationPopupActive(false)} 
                style={{
                  padding: '6px 12px', fontSize: '0.85rem', background: 'transparent', 
                  border: '1px solid var(--clr-border, #ddd)', color: 'var(--clr-text, #333)', borderRadius: '4px', cursor: 'pointer'
                }}>
                Keep Trying
              </button>
              <button 
                onClick={() => { setHesitationPopupActive(false); triggerPicker(); }} 
                style={{
                  padding: '6px 12px', fontSize: '0.85rem', background: 'var(--clr-primary, #4caf50)', 
                  border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                }}>
                Review Prerequisites
              </button>
            </div>
          </div>
        )}

        {warmupActive && (
          <div className="warmup-overlay-backdrop">
            <div className="warmup-overlay-card">
              <div style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '6px' }}>🧠</div>
              <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 4px' }}>Quick Warmup!</p>
              <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--clr-dim, #888)', margin: '0 0 20px' }}>
                {warmupPrereqTopic
                  ? `Let's refresh some basics in ${getTopicDisplayName(warmupPrereqTopic)} — 3 quick ungraded questions.`
                  : "Let's refresh some basics — 3 quick ungraded questions."}
              </p>
              {warmupLoading
                ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--clr-dim, #888)', fontSize: '0.9rem' }}>Loading warmup questions…</div>
                : <>
                  <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--clr-dim, #888)', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Warmup Question {warmupStep + 1} of 3</div>
                  <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 600, marginBottom: '18px', lineHeight: 1.5 }}>{warmupQuestions[warmupStep]?.prompt ?? warmupQuestions[warmupStep]?.question ?? '…'}</div>
                  <input className="answer-input" type="text" value={warmupAnswer} onChange={e => { if (!warmupRevealed) setWarmupAnswer(e.target.value) }} disabled={warmupRevealed} placeholder="Type your answer" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (!warmupRevealed) handleWarmupSubmit() } }} autoFocus style={{ width: '100%', marginBottom: '10px' }} />
                  {warmupFeedback && <div style={{ textAlign: 'center', marginBottom: '12px', fontWeight: 600, fontSize: '0.95rem', color: warmupFeedback.startsWith('✅') ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #f44336)' }}>{warmupFeedback}</div>}
                  <div className="button-row">
                    {!warmupRevealed
                      ? <button onClick={handleWarmupSubmit} disabled={!warmupAnswer.trim()}>Check Answer</button>
                      : <button onClick={handleWarmupNext}>{warmupStep < 2 ? 'Next →' : '🎉 Back to Quiz!'}</button>
                    }
                  </div>
                </>
              }
              <button className="warmup-skip-btn" onClick={completeWarmup}>
                Skip Warmup & Return to Quiz
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--clr-dim, #888)', marginTop: '14px', marginBottom: 0 }}>This warmup is ungraded — your quiz score and progress are preserved.</p>
            </div>
          </div>
        )}
    </>
  );

  return {
    isActive,
    overlayElement,
    onStartQuiz: () => {
      historyWindowRef.current = []
      cooldownRef.current = 0
      setFrozenQuizState(null)
      setWarmupActive(false)
      setWarmupQuestions(WARMUP_QUESTIONS_V01)
      setWarmupPrereqTopic(null)
      setWarmupLoading(false)
      sessionWarmupTopicsRef.current = new Set()
      setHesitationPopupActive(false)
      hesitationShownRef.current = false
      hesitationCooldownRef.current = 0
      clearCountRef.current = 0
      lastAnswerStrRef.current = ''
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      setStruggleCount(0)
      setPickerActive(false)
      setPickerTopics([])
      setLearnRecActive(false)
      setLearnRecTopics([])
    },
    onAnswer: checkStruggle,
    onSkip: () => checkStruggle(false)
  };
}
