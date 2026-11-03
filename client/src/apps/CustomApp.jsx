import React, { useEffect, useState, useRef } from 'react'
import {
  API,
  authGetToken,
  CUSTOM_PUZZLES,
  fetchQuestionForType,
  getApiPathForType,
  getPromptForType,
  getSpeedRunLimit,
  NumPad,
  QuizLayout,
  renderFeedback,
  ResultsTable,
  useAutoAdvance,
  useTimer,
} from '../App.jsx'
import GlossaryText from '../components/GlossaryText'

function CustomApp({ onBack, isGoalMode = false }) {
  // ─────── Setup Phase State ──────────────────────────────────
  // Current phase: 'setup' | 'quiz' | 'finished'
  const [phase, setPhase] = useState('setup')
  // Array of selected puzzle keys (e.g., ['basicarith', 'multiply'])
  const [selected, setSelected] = useState([])
  // Question ordering: 'random' | 'sequential' (affects question plan generation)
  const [ordering, setOrdering] = useState('random')
  // Difficulty level applied to all selected puzzle types: 'easy' | 'medium' | 'hard'
  const [difficulty, setDifficulty] = useState('easy')
  // Total number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState('20')

  // ─────── Quiz Phase State ──────────────────────────────────
  // Array of puzzle type keys ordered for this quiz (e.g., ['multiply', 'basicarith', 'multiply'])
  const [plan, setPlan] = useState([])
  // Current question index in plan (0-indexed)
  const [qIndex, setQIndex] = useState(0)
  // Current question object returned from API
  const [question, setQuestion] = useState(null)
  // Current puzzle type (key from CUSTOM_PUZZLES)
  const [curType, setCurType] = useState(null)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  // ─────── Input State (for different puzzle types) ──────────────────────────────────
  // Single answer for most puzzle types (basicarith, addition, multiply, sqrt, funceval)
  const [answer, setAnswer] = useState('')
  // Selected option letter (A, B, C, D) for multiple choice questions (gk, vocab)
  const [selectedOption, setSelectedOption] = useState('')
  // Array of coefficient inputs for polymul puzzle
  const [userCoeffs, setUserCoeffs] = useState([])
  // Object for storing various inputs: {p, q, r, s} for polyfactor, {factors} for primefactor, {x, y, z} for simul, {m, c} for lineq, etc.
  const [inputs, setInputs] = useState({})
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);

  // ─────── Derived State ──────────────────────────────────
  // Total number of questions in this quiz (length of plan)
  const totalQ = plan.length

  /**
   * togglePuzzle(key): Toggle selection of a puzzle type
   * Adds puzzle if not selected, removes if already selected
   * Updates selected array for UI rendering
   */
  const togglePuzzle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  /**
   * movePuzzle(idx, dir): Move a puzzle up/down in the sequential order list
   * dir: -1 for up, +1 for down
   * Bounds check: don't move if already at top (dir=-1) or bottom (dir=+1)
   * Used only when ordering === 'sequential'
   */
  const movePuzzle = (idx, dir) => {
    const arr = [...selected]
    const swap = idx + dir
    if (swap < 0 || swap >= arr.length) return
      // Swap array elements using destructuring
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    setSelected(arr)
  }

  /**
   * startQuiz(): Build question plan and start quiz
   * Parse numQuestions input
   * Generate question plan based on ordering:
   *   - 'sequential': distribute count evenly across selected puzzles, questions appear in order
   *   - 'random': pick random puzzles from selected, questions appear in random order
   * Transition to 'quiz' phase and load first question
   */

  const handleTimeout = async () => {
    if (revealed) return
    if (phase === 'finished') return
    try { setIsCorrect(false) } catch(_) {}
    try { setRevealed(true) } catch(_) {}
    try { setFeedback("⏰ Time's up!") } catch(_) {}
    const timeTaken = timer.stop ? timer.stop() : 0
    const qPrompt = question ? (question.prompt || question.question || (question.n1 !== undefined ? `${question.n1} ${question.op || '+'} ${question.n2}` : 'Question')) : 'Question'
    try {
      const apiPath = getApiPathForType(curType || 'basicarith')
      const r = await fetch(`${API}/${apiPath}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
        body: JSON.stringify({ ...(typeof question !== 'undefined' ? question : {}), userAnswer: '', answer: '', sessionGoal })
      })
      const d = await r.json()
      const corrAns = d.display || d.correctAnswer || d.answer || '—'
      if (typeof setResults === 'function') {
        setResults(prev => [...prev, { prompt: qPrompt, question: qPrompt, userAnswer: '(timeout)', correctAnswer: corrAns, correct: false, time: timeTaken }])
      }
      if (sessionGoal === 'perfect') {
        try { setPhase('finished'); timer.reset() } catch(_) {}
      }
    } catch(e) {
      console.error('handleTimeout error:', e)
      if (typeof setResults === 'function') {
        setResults(prev => [...prev, { prompt: qPrompt, question: qPrompt, userAnswer: '(timeout)', correctAnswer: '—', correct: false, time: timeTaken }])
      }
    }
  }

const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : 20
    let questionPlan = []
    if (ordering === 'sequential') {
      // Distribute count evenly: if count=10, selected=['a','b','c'], then 4,3,3
      const perType = Math.floor(count / selected.length)
      const remainder = count % selected.length
      selected.forEach((key, i) => {
        // First 'remainder' types get one extra question
        const n = perType + (i < remainder ? 1 : 0)
        for (let j = 0; j < n; j++) questionPlan.push(key)
      })
    } else {
      const perType = Math.floor(count / selected.length)
      const remainder = count % selected.length
      selected.forEach((key, i) => {
        const n = perType + (i < remainder ? 1 : 0)
        for (let j = 0; j < n; j++) questionPlan.push(key)
      })
      // Fisher-Yates shuffle
      for (let i = questionPlan.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionPlan[i], questionPlan[j]] = [questionPlan[j], questionPlan[i]];
      }
    }
    setPlan(questionPlan)
    setPhase('quiz')
    setScore(0)
    setResults([])
    setQIndex(0)
    // Load first question asynchronously
    await loadQuestion(questionPlan[0])
  }

  /**
   * resetInputs(): Clear all input state and feedback
   * Called before loading each new question
   */
  const resetInputs = () => {
    setAnswer(''); setSelectedOption(''); setUserCoeffs([]); setInputs({})
    setFeedback(''); setIsCorrect(null); setRevealed(false)
  }

  /**
   * loadQuestion(type): Fetch and set up question for given puzzle type
   * Fetches from appropriate API endpoint based on puzzle type and difficulty
   * Initializes type-specific input state (e.g., polymul initializes userCoeffs array)
   * Clears stale question object first to prevent render issues during type change
   * Starts timer for this question
   */
  const loadQuestion = async (type) => {
    setLoading(true)
    resetInputs()
    // Clear stale question before changing type to prevent render errors
    setQuestion(null)
    setCurType(type)
    try {
      // Fetch question from type-specific API endpoint
      const data = await fetchQuestionForType(type, difficulty, qIndex)
      if (data && !data.error) {
        setQuestion(data)
        // Initialize type-specific input: polymul needs coefficient array
        if (type === 'polymul') setUserCoeffs(new Array(data.resultDegree + 1).fill(''))
      } else {
        // API returned error object; leave question null
        setQuestion(null)
      }
    } catch (err) {
      console.error('Failed to load question:', err)
      setQuestion(null)
    }
    setLoading(false)
    timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', false))
  }

  /**
   * handleSubmit(overrideOption): Validate and submit answer for current puzzle type
   * Dispatches to type-specific validation logic based on curType
   * All branches: validate user input, POST to type-specific API check endpoint,
   *   update score/feedback/results, set revealed=true
   * overrideOption: allows keyboard shortcut handlers to pass selected option letter
   */
  const handleSubmit = async (overrideOption) => {
    if (!question || revealed) return
    const timeTaken = timer.stop()
    let res, data, correct, correctDisplay, userDisplay
    const optionToUse = overrideOption || selectedOption

    // Dispatch to type-specific submission logic
    switch (curType) {
      // ─────── Basic Arithmetic Puzzle ──────────────────────────────────
      case 'basicarith': {
        if (answer === '') return
        // POST to /basicarith-api/check: validate arithmetic answer
        res = await fetch(`${API}/basicarith-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  a: question.a, b: question.b, op: question.op, answer: Number(answer), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${question.prompt} = ${data.correctAnswer}`.slice(0,-1) + _ci + `Correct! ${question.prompt} = ${data.correctAnswer}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${question.prompt} = ${data.correctAnswer}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${question.prompt} = ${data.correctAnswer}`)
        }
      })()
        break
      }
      // ─────── Addition Puzzle ──────────────────────────────────
      case 'addition': {
        if (answer === '') return
        // POST to /addition-api/check: validate addition answer
        res = await fetch(`${API}/addition-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  a: question.a, b: question.b, answer: Number(answer), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${question.a} + ${question.b} = ${data.correctAnswer}`.slice(0,-1) + _ci + `Correct! ${question.a} + ${question.b} = ${data.correctAnswer}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${question.a} + ${question.b} = ${data.correctAnswer}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${question.a} + ${question.b} = ${data.correctAnswer}`)
        }
      })()
        break
      }
      // ─────── Quadratic Evaluation Puzzle ──────────────────────────────────
      case 'quadratic': {
        if (answer === '') return
        // POST to /quadratic-api/check: evaluate quadratic ax²+bx+c at given x
        res = await fetch(`${API}/quadratic-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  a: question.a, b: question.b, c: question.c, x: question.x, answer: Number(answer), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! y = ${data.correctAnswer}`.slice(0,-1) + _ci + `Correct! y = ${data.correctAnswer}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. y = ${data.correctAnswer}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. y = ${data.correctAnswer}`)
        }
      })()
        break
      }
      // ─────── Multiplication Table Puzzle ──────────────────────────────────
      case 'multiply': {
        if (answer === '') return
        // POST to /multiply-api/check: validate multiplication table answer
        res = await fetch(`${API}/multiply-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  table: question.table, multiplier: question.multiplier, answer: Number(answer), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${question.prompt} = ${data.correctAnswer}`.slice(0,-1) + _ci + `Correct! ${question.prompt} = ${data.correctAnswer}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${question.prompt} = ${data.correctAnswer}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${question.prompt} = ${data.correctAnswer}`)
        }
      })()
        break
      }
      // ─────── Square Root Puzzle ──────────────────────────────────
      case 'sqrt': {
        if (answer === '') return
        // POST to /sqrt-api/check: validate square root floor/ceiling answer
        res = await fetch(`${API}/sqrt-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  q: question.q, answer: Number(answer), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = `⌊${data.sqrtRounded}⌋=${data.floorAnswer} or ⌈${data.sqrtRounded}⌉=${data.ceilAnswer}`; userDisplay = answer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! √${question.q} ≈ ${data.sqrtRounded}`.slice(0,-1) + _ci + `Correct! √${question.q} ≈ ${data.sqrtRounded}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. √${question.q} ≈ ${data.sqrtRounded} → ${data.floorAnswer} or ${data.ceilAnswer}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. √${question.q} ≈ ${data.sqrtRounded} → ${data.floorAnswer} or ${data.ceilAnswer}`)
        }
      })()
        break
      }
      // ─────── Function Evaluation Puzzle ──────────────────────────────────
      case 'funceval': {
        if (answer === '') return
        // POST to /funceval-api/check: evaluate f(x,y,z,...) at given values
        res = await fetch(`${API}/funceval-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  answer: question.answer, userAnswer: Number(answer), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! = ${data.correctAnswer}`.slice(0,-1) + _ci + `Correct! = ${data.correctAnswer}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. = ${data.correctAnswer}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. = ${data.correctAnswer}`)
        }
      })()
        break
      }
      // ─────── Polynomial Multiply Puzzle ──────────────────────────────────
      case 'polymul': {
        if (userCoeffs.some(c => c === '')) return
        // POST to /polymul-api/check: validate polynomial multiplication result coefficients
        res = await fetch(`${API}/polymul-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  p1: question.p1, p2: question.p2, userCoeffs: userCoeffs.map(Number), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.correctDisplay; userDisplay = userCoeffs.join(', ');
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${question.productDisplay}`.slice(0,-1) + _ci + `Correct! ${question.productDisplay}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.correctDisplay}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.correctDisplay}`)
        }
      })()
        break
      }
      // ─────── Polynomial Factorization Puzzle ──────────────────────────────────
      case 'polyfactor': {
        const { p: up, q: uq, r: ur, s: us } = inputs
        if (!up || !uq || !ur || !us) return
        // POST to /polyfactor-api/check: validate polynomial factorization (px+q)(rx+s)
        res = await fetch(`${API}/polyfactor-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  a: question.a, b: question.b, c: question.c, userP: Number(up), userQ: Number(uq), userR: Number(ur), userS: Number(us), sessionGoal }) })
        data = await res.json()
        const f = question.factors
        correct = data.correct; correctDisplay = `(${f.p}x${f.q >= 0 ? '+' : ''}${f.q})(${f.r}x${f.s >= 0 ? '+' : ''}${f.s})`; userDisplay = `(${up}x${Number(uq) >= 0 ? '+' : ''}${uq})(${ur}x${Number(us) >= 0 ? '+' : ''}${us})`
        setFeedback(data.correct ? `Correct! ${correctDisplay}` : `Incorrect. ${correctDisplay}`)
        break
      }
      // ─────── Prime Factorization Puzzle ──────────────────────────────────
      case 'primefactor': {
        const pf = (inputs.factors || '').split(/[,\s]+/).filter(Boolean).map(Number).sort((a, b) => a - b)
        if (pf.length === 0) return
        // POST to /primefactor-api/check: validate prime factorization (sorted list)
        res = await fetch(`${API}/primefactor-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  number: question.number, userFactors: pf, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.correctFactors.join(' × '); userDisplay = pf.join(' × ');
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${question.number} = ${correctDisplay}`.slice(0,-1) + _ci + `Correct! ${question.number} = ${correctDisplay}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${question.number} = ${correctDisplay}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${question.number} = ${correctDisplay}`)
        }
      })()
        break
      }
      // ─────── Quadratic Formula Puzzle ──────────────────────────────────
      case 'qformula': {
        const { r1, r2 } = inputs
        if (question.roots.type === 'real_equal' && !r1) return
        if (question.roots.type !== 'real_equal' && (!r1 || !r2)) return
        // POST to /qformula-api/check: validate quadratic formula roots (type-dependent)
        res = await fetch(`${API}/qformula-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  a: question.a, b: question.b, c: question.c, userR1: Number(r1), userR2: Number(r2 || 0), userType: question.roots.type, sessionGoal }) })
        data = await res.json()
        correct = data.correct
        const rt = data.roots
        // Format display based on root type (real_distinct, real_equal, or complex)
        correctDisplay = rt.type === 'real_distinct' ? `r₁ = ${rt.r1}, r₂ = ${rt.r2}` : rt.type === 'real_equal' ? `r = ${rt.r1}` : `${rt.realPart} ± ${rt.imagPart}i`
        userDisplay = question.roots.type === 'real_equal' ? r1 : `${r1}, ${r2}`;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${correctDisplay}`.slice(0,-1) + _ci + `Correct! ${correctDisplay}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${correctDisplay}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${correctDisplay}`)
        }
      })()
        break
      }
      // ─────── Simultaneous Equations Puzzle ──────────────────────────────────
      case 'simul': {
        const { x: ux, y: uy, z: uz } = inputs
        if (!ux || !uy) return
        if (question.size === 3 && !uz) return
        const body = { eqs: question.eqs, size: question.size, solution: question.solution, userX: Number(ux), userY: Number(uy) }
        if (question.size === 3) body.userZ = Number(uz)
        // POST to /simul-api/check: validate simultaneous equation solution (2×2 or 3×3)
        res = await fetch(`${API}/simul-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...body, sessionGoal }) })
        data = await res.json()
        correct = data.correct
        const s = question.solution
        correctDisplay = question.size === 3 ? `(${s.x}, ${s.y}, ${s.z})` : `(${s.x}, ${s.y})`
        userDisplay = question.size === 3 ? `(${ux}, ${uy}, ${uz})` : `(${ux}, ${uy})`;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${correctDisplay}`.slice(0,-1) + _ci + `Correct! ${correctDisplay}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${correctDisplay}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${correctDisplay}`)
        }
      })()
        break
      }
      // ─────── Line Equation Puzzle ──────────────────────────────────
      case 'lineq': {
        const { m, c } = inputs
        if (!m || !c) return
        // POST to /lineq-api/check: validate line equation y=mx+c from two points
        res = await fetch(`${API}/lineq-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  x1: question.x1, y1: question.y1, x2: question.x2, y2: question.y2, userM: Number(m), userC: Number(c), sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = `m = ${data.m}, c = ${data.c}`; userDisplay = `m = ${m}, c = ${c}`;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${correctDisplay}`.slice(0,-1) + _ci + `Correct! ${correctDisplay}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${correctDisplay}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${correctDisplay}`)
        }
      })()
        break
      }
      // ─────── Fraction Addition Puzzle ──────────────────────────────────
      case 'fractionadd': {
        if (answer === '') return
        // For fraction add in custom mode, accept answer as a single number (simplified result)
        // Build payload matching the standalone component format
        const fracPayload = {
          n1: question.n1, d1: question.d1,
          n2: question.n2, d2: question.d2,
          mixed: question.mixed || false,
        }
        if (question.mixed) {
          fracPayload.w1 = question.w1; fracPayload.w2 = question.w2
          // In custom mode, parse "W N/D" or "N/D" from answer string
          fracPayload.ansWhole = 0; fracPayload.ansNum = Number(answer); fracPayload.ansDen = 1
        } else {
          fracPayload.ansNum = Number(answer); fracPayload.ansDen = 1
        }
        res = await fetch(`${API}/fractionadd-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...fracPayload, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = answer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! = ${data.display}`.slice(0,-1) + _ci + `Correct! = ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. = ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. = ${data.display}`)
        }
      })()
        break
      }
      // ─────── Surds Puzzle ──────────────────────────────────
      case 'surds': {
        if (answer === '') return
        const surdAnswer = answer.replace(/sqrt/gi, '√').trim()
        const surdPayload = { ...question, answer: surdAnswer }
        res = await fetch(`${API}/surds-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...surdPayload, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = surdAnswer;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! = ${data.display}`.slice(0,-1) + _ci + `Correct! = ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. = ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. = ${data.display}`)
        }
      })()
        break
      }
      // ─────── Indices Puzzle ──────────────────────────────────
      case 'indices': {
        if (answer === '') return
        const idxPayload = { ...question, answer: answer.trim() }
        res = await fetch(`${API}/indices-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...idxPayload, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = answer.trim();
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! = ${data.display}`.slice(0,-1) + _ci + `Correct! = ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. = ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. = ${data.display}`)
        }
      })()
        break
      }
      // ─────── Sequences & Series ──────────────────────────────────
      case 'sequences': {
        if (answer === '') return
        const seqPayload = { ...question, answer: answer.trim() }
        res = await fetch(`${API}/sequences-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...seqPayload, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = answer.trim();
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${data.display}`.slice(0,-1) + _ci + `Correct! ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.display}`)
        }
      })()
        break
      }
      // ─────── Ratio & Proportion ──────────────────────────────────
      case 'ratio': {
        if (answer === '') return
        const ratPayload = { ...question, answer: answer.trim() }
        res = await fetch(`${API}/ratio-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...ratPayload, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = answer.trim();
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${data.display}`.slice(0,-1) + _ci + `Correct! ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.display}`)
        }
      })()
        break
      }
      // ─────── Percentages ──────────────────────────────────
      case 'percent': {
        if (answer === '') return
        const pctPayload = { ...question, userAnswer: answer.trim().replace(/[$,]/g, '') }
        res = await fetch(`${API}/percent-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...pctPayload, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = answer.trim();
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${data.display}`.slice(0,-1) + _ci + `Correct! ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.display}`)
        }
      })()
        break
      }
      // ─────── Sets ──────────────────────────────────
      case 'sets': {
        if (answer === '') return
        const setsPayload = { ...question, userAnswer: answer.trim() }
        res = await fetch(`${API}/sets-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...setsPayload, sessionGoal }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = answer.trim();
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${data.display}`.slice(0,-1) + _ci + `Correct! ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.display}`)
        }
      })()
        break
      }
      // ─────── Generic API puzzles ──────────────────────────────────
      case 'trig': case 'ineq': case 'coordgeom': case 'prob': case 'stats':
      case 'matrix': case 'vectors': case 'dotprod': case 'transform': case 'mensur':
      case 'bearings': case 'log': case 'diff': case 'bases': case 'circleth':
      case 'integ': case 'stdform': case 'bounds': case 'sdt': case 'variation':
      case 'hcflcm': case 'profitloss': case 'rounding': case 'binomial': case 'complex':
      case 'angles': case 'triangles': case 'congruence': case 'pythag': case 'polygons': case 'similarity': case 'squaring': case 'tatsavit':
      case 'lineareq': case 'decimals': case 'permcomb': case 'limits': case 'invtrig':
      case 'remfactor': case 'heron': case 'shares': case 'banking': case 'gst':
      case 'section': case 'linprog': case 'circmeasure': case 'conics': case 'diffeq': {
        if (answer === '') return
        const apiMap = { trig: 'trig-api', ineq: 'ineq-api', coordgeom: 'coordgeom-api', prob: 'prob-api', stats: 'stats-api', matrix: 'matrix-api', vectors: 'vectors-api', dotprod: 'dotprod-api', transform: 'transform-api', mensur: 'mensur-api', bearings: 'bearings-api', log: 'log-api', diff: 'diff-api', bases: 'bases-api', circleth: 'circleth-api', integ: 'integ-api', stdform: 'stdform-api', bounds: 'bounds-api', sdt: 'sdt-api', variation: 'variation-api', hcflcm: 'hcflcm-api', profitloss: 'profitloss-api', rounding: 'rounding-api', binomial: 'binomial-api', complex: 'complex-api', angles: 'angles-api', triangles: 'triangles-api', congruence: 'congruence-api', pythag: 'pythag-api', polygons: 'polygons-api', similarity: 'similarity-api', squaring: 'squaring-api', tatsavit: 'tatsavit-api', lineareq: 'lineareq-api', decimals: 'decimals-api', permcomb: 'permcomb-api', limits: 'limits-api', invtrig: 'invtrig-api', remfactor: 'remfactor-api', heron: 'heron-api', shares: 'shares-api', banking: 'banking-api', gst: 'gst-api', section: 'section-api', linprog: 'linprog-api', circmeasure: 'circmeasure-api', conics: 'conics-api', diffeq: 'diffeq-api' }
        const genPayload = { ...question, userAnswer: answer.trim() }
        res = await fetch(`${API}/${apiMap[curType]}/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(genPayload) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.display; userDisplay = answer.trim();
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${data.display}`.slice(0,-1) + _ci + `Correct! ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.display}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.display}`)
        }
      })()
        break
      }
      // ─────── Multiple Choice Puzzles (GK, Vocab) ──────────────────────────────────
      case 'gk': case 'vocab': {
        if (!optionToUse) return
        setSelectedOption(optionToUse)
        const url = curType === 'gk' ? `${API}/gk-api/check` : `${API}/vocab-api/check`
        // POST to type-specific check endpoint: validate multiple choice answer
        res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: question.id, answerOption: optionToUse }) })
        data = await res.json()
        correct = data.correct; correctDisplay = `${data.correctAnswer}: ${data.correctAnswerText}`; userDisplay = optionToUse;
        (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${data.correctAnswerText}`.slice(0,-1) + _ci + `Correct! ${data.correctAnswerText}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${data.correctAnswerText}` + ' ❌ Perfect Solve ended.')
          setPhase('finished'); timer.reset()
        } else {
          setFeedback(`Incorrect. ${data.correctAnswerText}`)
        }
      })()
        break
      }
      default: return
    }

    // Update score, feedback, and results (common for all puzzle types)
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
    // Get puzzle type name for results display
    const typeName = CUSTOM_PUZZLES.find(p => p.key === curType)?.name || curType
    // Add result entry with truncated question display (max 80 chars)
    setResults(prev => [...prev, {
      question: `[${typeName}] ${getPromptForType(curType, question) || '…'}`.slice(0, 80),
      userAnswer: userDisplay,
      correctAnswer: correctDisplay,
      correct,
      time: timeTaken,
    }])
    if (sessionGoal === 'perfect' && !correct) {
      setPhase('finished')
      timer.reset()
      return
    }
    setRevealed(true)
  }

  const handleSolve = async () => {
    if (!question || revealed) return
    setIsCorrect(false)
    setRevealed(true)
    // For most puzzle types, display is available from question object
    const display = question.display || question.answer || '(solution unavailable)'
    setFeedback(`Solution: ${display}`)
  }

  /**
   * advanceRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or transitions to 'finished' phase if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  const advanceRef = useRef(() => { })
  advanceRef.current = async () => {
    if (qIndex + 1 >= totalQ) { setPhase('finished'); timer.reset(); return }
    const next = qIndex + 1
    setQIndex(next)
    await loadQuestion(plan[next])
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

  /**
   * Keyboard shortcut handler: 1-4 or a-d to select+submit for GK/Vocab questions
   * Only active during quiz phase on multiple choice questions
   * Prevents default behavior and triggers handleSubmit with selected letter option
   * Cleanup: removes event listener on unmount or dependency change
   */
  const handleSubmitRefC = useRef(handleSubmit)
  handleSubmitRefC.current = handleSubmit
  useEffect(() => {
    if (phase !== 'quiz') return
    const onKeyDown = (event) => {
      if (revealed || loading) return
      if (curType !== 'gk' && curType !== 'vocab') return
      // Map number keys 1-4 and letter keys a-d to option letters A-D
      const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D' }
      const letter = keyMap[event.key.toLowerCase()]
      if (letter && question && question.options) {
        event.preventDefault()
        handleSubmitRefC.current(letter)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, curType, question, loading, revealed])

  /**
   * valInput(key): Create input change handler for multi-field inputs object
   * Validates input: empty string, minus sign, decimal point, or decimal number format (-?\d*\.?\d*)
   * Returns onChange handler that updates inputs[key]
   * Usage: onChange={valInput('m')} -> setInputs({...inputs, m: newValue})
   */
  const valInput = (key) => (e) => {
    const v = e.target.value
    if (v === '' || v === '-' || v === '.' || /^-?\d*\.?\d*$/.test(v)) setInputs(prev => ({ ...prev, [key]: v }))
  }

  /**
   * sup(n): Convert digit to superscript character
   * Maps: 0→⁰, 1→¹, ..., 9→⁹
   */
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')
  /**
   * formatCoeffLabel(i): Format label for coefficient at degree i
   * Returns: "constant" for i=0, "x" for i=1, "x²" for i=2, etc.
   */
  const formatCoeffLabel = (i) => i === 0 ? 'constant' : i === 1 ? 'x' : `x${sup(i)}`
  /**
   * fmtEq2(eq): Format 2×2 equation for display
   * Input: {a, b, d} (coefficients from ax + by = d)
   * Output: "2x + 3y = 5" or "2x − 3y = 5" (uses minus sign character)
   */
  const fmtEq2 = (eq) => `${eq.a}x ${eq.b >= 0 ? '+' : '−'} ${Math.abs(eq.b)}y = ${eq.d}`
  /**
   * fmtEq3(eq): Format 3×3 equation for display
   * Input: {a, b, c, d} (coefficients from ax + by + cz = d)
   * Output: "2x + 3y − 4z = 5" (uses minus sign character for negatives)
   */
  const fmtEq3 = (eq) => `${eq.a}x ${eq.b >= 0 ? '+' : '−'} ${Math.abs(eq.b)}y ${eq.c >= 0 ? '+' : '−'} ${Math.abs(eq.c)}z = ${eq.d}`

  /**
   * renderInputs(): Return appropriate input UI for current puzzle type
   * Different puzzle types require different input components (text, coefficients, options, etc.)
   * Returns: JSX component or null if type not recognized
   */
  const renderInputs = () => {
    if (!question || !curType) return null
    // Dispatch to type-specific input rendering
    switch (curType) {
      case 'basicarith': case 'addition': case 'quadratic': case 'multiply': case 'sqrt': case 'funceval': case 'fractionadd':
        return <>
          <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d*\.?\d*$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
          <NumPad value={answer} onChange={v => !revealed && setAnswer(v)} disabled={revealed} />
        </>
      case 'surds':
        return <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder="e.g. 6√2 (type sqrt for √)" onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
      case 'indices':
        return <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder={question?.type === 'simplify' ? 'Enter the exponent, e.g. 7' : 'e.g. 8 or 1/4'} onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
      case 'sequences':
        return <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder="e.g. 42 or 3/4" onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
      case 'ratio':
        return <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder={question?.type === 'simplify' ? 'e.g. 3:2' : question?.type?.startsWith('divide') ? 'e.g. 72, 48' : 'Type your answer'} onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
      case 'percent':
        return <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder="Type your answer" onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
      case 'sets':
        return <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder={question?.type === 'list' ? 'e.g. {1, 3, 5}' : 'e.g. 12'} onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
      case 'trig': case 'ineq': case 'coordgeom': case 'prob': case 'stats':
      case 'matrix': case 'vectors': case 'dotprod': case 'transform': case 'mensur':
      case 'bearings': case 'log': case 'diff': case 'bases': case 'circleth':
      case 'integ': case 'stdform': case 'bounds': case 'sdt': case 'variation':
      case 'hcflcm': case 'profitloss': case 'rounding': case 'binomial': case 'complex':
      case 'angles': case 'triangles': case 'congruence': case 'pythag': case 'polygons': case 'similarity': case 'squaring': case 'tatsavit':
      case 'lineareq': case 'decimals': case 'permcomb': case 'limits': case 'invtrig':
      case 'remfactor': case 'heron': case 'shares': case 'banking': case 'gst':
      case 'section': case 'linprog': case 'circmeasure': case 'conics': case 'diffeq':
        return <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder="Type your answer" onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
      case 'gk': case 'vocab':
        if (!question.options) return null
        return <div className="options-grid">
          {question.options.map((opt) => (
            <button key={opt.option} className={`option-card ${selectedOption === opt.option ? 'selected' : ''} ${revealed && opt.option === (question.answerOption || question.correctAnswer) ? 'correct-option' : ''} ${revealed && selectedOption === opt.option && !isCorrect ? 'wrong-option' : ''}`} onClick={() => !revealed && setSelectedOption(opt.option)} disabled={revealed}>
              <strong>{opt.option}.</strong> {opt.text}
            </button>
          ))}
        </div>
      case 'polymul':
        return <div className="coeff-inputs">
          {userCoeffs.map((c, i) => (
            <div key={i} className="coeff-field">
              <label className="coeff-label">{formatCoeffLabel(i)}</label>
              <input className="answer-input coeff-input" type="text" value={c} disabled={revealed}
                onChange={e => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) { const nc = [...userCoeffs]; nc[i] = v; setUserCoeffs(nc) } }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            </div>
          ))}
        </div>
      case 'polyfactor':
        return <div className="factor-inputs">
          {[['p', 'p'], ['q', 'q'], ['r', 'r'], ['s', 's']].map(([key, label]) => (
            <div key={key} className="coeff-field">
              <label className="coeff-label">{label}</label>
              <input className="answer-input coeff-input" type="text" value={inputs[key] || ''} disabled={revealed} onChange={valInput(key)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            </div>
          ))}
          <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>Factor as (px + q)(rx + s)</div>
        </div>
      case 'primefactor':
        return <div className="single-input-row">
          <input className="answer-input" type="text" value={inputs.factors || ''} disabled={revealed} placeholder="e.g. 2, 3, 5" onChange={e => setInputs(prev => ({ ...prev, factors: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>Enter all prime factors separated by commas</div>
        </div>
      case 'qformula':
        return <div className="roots-inputs">
          {question.roots.type === 'complex' ? <>
            <div className="coeff-field"><label className="coeff-label">Real part</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r1 || ''} disabled={revealed} onChange={valInput('r1')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            <div className="coeff-field"><label className="coeff-label">Imag part</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r2 || ''} disabled={revealed} onChange={valInput('r2')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          </> : question.roots.type === 'real_equal' ? <>
            <div className="coeff-field"><label className="coeff-label">Root</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r1 || ''} disabled={revealed} onChange={valInput('r1')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          </> : <>
            <div className="coeff-field"><label className="coeff-label">r₁</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r1 || ''} disabled={revealed} onChange={valInput('r1')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            <div className="coeff-field"><label className="coeff-label">r₂</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r2 || ''} disabled={revealed} onChange={valInput('r2')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          </>}
        </div>
      case 'simul':
        return <div className="roots-inputs">
          <div className="coeff-field"><label className="coeff-label">x =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.x || ''} disabled={revealed} onChange={valInput('x')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          <div className="coeff-field"><label className="coeff-label">y =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.y || ''} disabled={revealed} onChange={valInput('y')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          {question.size === 3 && <div className="coeff-field"><label className="coeff-label">z =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.z || ''} disabled={revealed} onChange={valInput('z')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>}
        </div>
      case 'lineq':
        return <div className="roots-inputs">
          <div className="coeff-field"><label className="coeff-label">m =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.m || ''} disabled={revealed} onChange={valInput('m')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          <div className="coeff-field"><label className="coeff-label">c =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.c || ''} disabled={revealed} onChange={valInput('c')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
        </div>
      default: return null
    }
  }

  /**
   * renderQuestion(): Return appropriate question display for current puzzle type
   * Some puzzle types require custom rendering (polymul, polyfactor, simul)
   * Others use generic prompt display via getPromptForType()
   * Always shows puzzle type badge above question
   * Returns: JSX component with question display
   */
  const renderQuestion = () => {
    if (!question || !curType) return <div className="question-box">Loading…</div>
    const typeName = CUSTOM_PUZZLES.find(p => p.key === curType)?.name || curType

    // Polynomial multiplication: show (p1) × (p2)
    if (curType === 'polymul') {
      return <>
        <div className="custom-type-badge">{typeName}</div>
        <div className="question-box">
          <span className="poly-expr">({question.p1Display})</span> × <span className="poly-expr">({question.p2Display})</span>
        </div>
      </>
    }
    // Polynomial factorization: show "Factor: expression"
    if (curType === 'polyfactor') {
      return <>
        <div className="custom-type-badge">{typeName}</div>
        <div className="question-box">Factor: {question.display}</div>
      </>
    }
    // Simultaneous equations: show system of equations formatted
    if (curType === 'simul') {
      const is3 = question.size === 3
      return <>
        <div className="custom-type-badge">{typeName}</div>
        <div className="question-box equation-system">
          {question.eqs.map((eq, i) => <div key={i}>{is3 ? fmtEq3(eq) : fmtEq2(eq)}</div>)}
        </div>
      </>
    }
    // Default: use generic prompt from getPromptForType()
    return <>
      <div className="custom-type-badge">{typeName}</div>
      <div className="question-box"><GlossaryText text={getPromptForType(curType, question) || ''} /></div>
    </>
  }

  // ─── Setup Phase ─────────────────────────────────────
  if (phase === 'setup') {
    return (
      <QuizLayout title="Custom Lesson" subtitle="Build your own quiz from any combination of puzzles" onBack={onBack}>
        <div className="radio-group">
          {['easy', 'medium', 'hard'].map(d => (
            <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
              <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </label>
          ))}
        </div>

        <div className="custom-section-label">Select puzzles:</div>
        <div className="custom-puzzle-grid">
          {CUSTOM_PUZZLES.map(p => (
            <label key={p.key} className={`custom-puzzle-check ${selected.includes(p.key) ? 'checked' : ''}`}>
              <input type="checkbox" checked={selected.includes(p.key)} onChange={() => togglePuzzle(p.key)} />
              {p.name}
            </label>
          ))}
        </div>

        <div className="custom-section-label">Question order:</div>
        <div className="radio-group">
          <label className={`radio-pill ${ordering === 'random' ? 'active' : ''}`}>
            <input type="radio" checked={ordering === 'random'} onChange={() => setOrdering('random')} /> Random
          </label>
          <label className={`radio-pill ${ordering === 'sequential' ? 'active' : ''}`}>
            <input type="radio" checked={ordering === 'sequential'} onChange={() => setOrdering('sequential')} /> Sequential
          </label>
        </div>

        {ordering === 'sequential' && selected.length > 1 && <>
          <div className="custom-section-label">Drag order (first → last):</div>
          <div className="custom-order-list">
            {selected.map((key, i) => {
              const p = CUSTOM_PUZZLES.find(x => x.key === key)
              return (
                <div key={key} className="custom-order-item">
                  <span className="custom-order-num">{i + 1}.</span>
                  <span className="custom-order-name">{p?.name}</span>
                  <button className="custom-order-btn" onClick={() => movePuzzle(i, -1)} disabled={i === 0}>↑</button>
                  <button className="custom-order-btn" onClick={() => movePuzzle(i, 1)} disabled={i === selected.length - 1}>↓</button>
                </div>
              )
            })}
          </div>
        </>}

        {isGoalMode && (
        <>
          <p className="welcome-text" style={{ marginTop: '14px', fontSize: '0.92rem', fontWeight: 700, marginBottom: '6px' }}>Practice Goal:</p>
                  <div className="checkbox-group" style={{ marginBottom: '8px' }}>
                    {[
                                            { key: 'speed',    label: '⚡ Speed Run' },
                      { key: 'perfect',  label: '🎯 Perfect Solve' },
                      { key: 'revision', label: '🔄 Revision' },
                    ].map(g => (
                      <label key={g.key} className={`checkbox-pill${sessionGoal === g.key ? ' active' : ''}`}
                        style={sessionGoal === g.key ? (
                          g.key === 'speed'    ? { background: 'rgba(255,179,0,0.18)',  borderColor: '#ffb300', color: '#ffb300' } :
                          g.key === 'perfect'  ? { background: 'rgba(244,67,54,0.18)',  borderColor: '#f44336', color: '#f44336' } :
                          g.key === 'revision' ? { background: 'rgba(33,150,243,0.18)', borderColor: '#2196f3', color: '#2196f3' } : {}
                        ) : {}}>
                        <input type="radio" name="customapp-goal" checked={sessionGoal === g.key}
                          onChange={() => setSessionGoal(g.key)} />
                        {g.label}
                      </label>
                    ))}
                  </div>
                  {sessionGoal === 'speed' && (
                    <p style={{ fontSize: '0.82rem', color: '#ffb300', marginBottom: '8px' }}>
                      ⚡ Easy 5s · Medium 10s · Hard 15s · Extra Hard 20s · Adaptive 10s. Double coins for correct!
                    </p>
                  )}
                  {sessionGoal === 'perfect' && (
                    <p style={{ fontSize: '0.82rem', color: '#f44336', marginBottom: '8px' }}>
                      🎯 One wrong answer ends the quiz. No timer shown. Can you go flawless?
                    </p>
                  )}
                  {sessionGoal === 'revision' && (
                    <p style={{ fontSize: '0.82rem', color: '#2196f3', marginBottom: '8px' }}>
                      🔄 Focuses on topics you previously answered incorrectly.
                    </p>
                  )}
        </>
      )}

        <div className="question-count-row">
          <label className="question-count-label">How many questions? (max 100)</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 100)) setNumQuestions(v) }} />
        </div>
        <div className="button-row">
          <button onClick={startQuiz} disabled={selected.length === 0}>Start Custom Quiz</button>
        </div>
      </QuizLayout>
    )
  }

  // ─── Quiz Phase ──────────────────────────────────────
  if (phase === 'quiz') {
    return (
      <QuizLayout title="Custom Lesson" subtitle={`${selected.length} puzzle types · ${difficulty}`} onBack={onBack} timer={sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
        <div className="top-mini-row">
          {!revealed && sessionGoal !== 'perfect' && <div className="timer-pill">{timer.elapsed}s</div>}
          <div className="score-pill">Score: {score}</div>
        </div>
        <div className="progress-pill center">Question {qIndex + 1}/{totalQ}</div>
        {renderQuestion()}
        {renderInputs()}
        {renderFeedback(feedback, isCorrect)}
        <div className="button-row">
          {!revealed && <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>}
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading}>
            {revealed ? (qIndex + 1 >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </QuizLayout>
    )
  }

  // ─── Finished Phase ──────────────────────────────────
  return (
    <QuizLayout title="Custom Lesson" subtitle="Quiz complete!" onBack={onBack} sessionGoal={sessionGoal}>
      <div className="welcome-box">
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => setPhase('setup')}>Play Again</button>
      </div>
    </QuizLayout>
  )
}
export default CustomApp
