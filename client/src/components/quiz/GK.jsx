
//GKApp


import { useEffect, useRef, useState } from 'react'
import CONFIG from '../../config'
import useAutoAdvance from '../../hooks/useAutoAdvance'
import useQuizHintsAndXp from '../../hooks/useHints'
import useProgressSubmit from '../../hooks/useProgressSubmit'
import useTimer from '../../hooks/useTimer'
import { authGetToken } from '../../utils/authHelper'
import FeedbackDisplay from '../common/FeedbackDisplay'
import QuizLayout from '../layout/QuizLayout'
import GlossaryText from '../common/GlossaryText'
import ResultsTable from '../common/ResultsTable'
import { HintModal } from '../HintSystem/HintModal'

function GK({ onBack, markTopicCompleted, isGoalMode = false }) {
    // Current question object: {id, question, options: [A, B, C, D], ...}
    const [question, setQuestion] = useState(null)
    // User's selected option: 'A', 'B', 'C', or 'D'
    const [selected, setSelected] = useState('')
    // Feedback message shown after submission
    const [feedback, setFeedback] = useState('')
    // Is the selected answer correct?
    const [isCorrect, setIsCorrect] = useState(null)
    // Is a question being fetched from the API?
    const [loading, setLoading] = useState(false)
    // Total correct answers so far
    const [score, setScore] = useState(0)
    // Has the answer been revealed (showing feedback)?
    const [revealed, setRevealed] = useState(false)
    // Question counter (1, 2, 3, ...)
    const [questionNumber, setQuestionNumber] = useState(0)
    // All result objects from this session
    const [results, setResults] = useState([])
    // Persist seen GK question IDs in localStorage to avoid repeats across sessions
    const GK_SEEN_KEY = 'tenali_gk_seen'
    const loadGKSeen = () => { try { return JSON.parse(localStorage.getItem(GK_SEEN_KEY) || '[]') } catch (err) { console.error(err.stack); return [] } }
    const saveGKSeen = (ids) => { try { localStorage.setItem(GK_SEEN_KEY, JSON.stringify(ids)) } catch (err) { console.error(err.stack) } }
    const [seenIds, setSeenIds] = useState(loadGKSeen)
    // Number of questions to answer (as string for input field)
    const [numQuestions, setNumQuestions] = useState(String(CONFIG.DEFAULT_TOTAL))
    // Total questions to answer
    const [totalQ, setTotalQ] = useState(CONFIG.DEFAULT_TOTAL)
    // Quiz started flag
    const [started, setStarted] = useState(false)
    // Quiz finished flag
    const [finished, setFinished] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState('speed')
    const sessionGoal = isGoalMode ? selectedGoal : 'standard'
    // Timer for tracking response time per question
    const timer = useTimer()
    const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp('gk', finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);
    // Guard ref: prevents double-fetch from React StrictMode concurrent effect invocations
    const fetchingRef = useRef(false)
    // Tracks the in-flight question fetch so unmounting can cancel it — the
    // fetchingRef guard above already stops a second overlapping call from
    // starting, but nothing previously stopped a pending fetch's setState
    // calls from firing after the component unmounts.
    const questionAbortRef = useRef(null)
    useEffect(() => () => questionAbortRef.current?.abort(), [])

    /**
     * loadQuestion(excludeIds?): Fetch next GK question from API
     * Excludes previously seen questions to avoid repetition (persisted in localStorage)
     * Stops if total questions reached
     */
    const loadQuestion = async (excludeIds) => {
        if (fetchingRef.current) return
        fetchingRef.current = true
        if (questionNumber >= totalQ) {
        fetchingRef.current = false
        setFinished(true)
        {
            const pass = score / totalQ >= 0.8
            if (pass && typeof markTopicCompleted === 'function') {
            markTopicCompleted('gk', 'easy')
            }
        }
        timer.reset()
        return
        }
        setLoading(true)
        setSelected('')
        setFeedback('')
        setIsCorrect(null)
        setRevealed(false)
        const controller = new AbortController()
        questionAbortRef.current = controller
        try {
        const ids = excludeIds || seenIds
        const excludeParam = ids.length ? `?exclude=${ids.join(',')}` : ''
        const res = await fetch(`${CONFIG.api}/gk-api/question${excludeParam}`, { signal: controller.signal })
        const data = await res.json()
        setQuestion(data)
        // Track this question ID so we don't ask it again (persist to localStorage)
        const newSeen = [...ids, data.id]
        setSeenIds(newSeen)
        saveGKSeen(newSeen)
        setQuestionNumber((n) => n + 1)
        timer.start()
        } catch (e) {
        if (e.name === 'AbortError') return
        console.error('Failed to load GK question:', e)
        } finally {
        setLoading(false)
        fetchingRef.current = false
        }
    }

    /**
     * startQuiz(): Initialize GK quiz with question count
     * Keeps existing seenIds from localStorage (only resets session state)
     */
    const startQuiz = () => {
        const count = Math.max(1, Math.min(100, Number(numQuestions) || CONFIG.DEFAULT_TOTAL))
        setTotalQ(count)
        setStarted(true)
        setFinished(false)
        setScore(0)
        setQuestionNumber(0)
        loadQuestion(seenIds)
        setResults([])
        fetchingRef.current = false
    }

    /**
     * submitGK(option): Submit selected answer and check correctness with API
     * Receives the feedback (correct answer + explanation) from backend
     */
    const submitGK = async (option) => {
        if (!question || revealed) return
        const timeTaken = timer.stop()
        setSelected(option)
        // POST to backend API to check the answer
        const res = await fetch(`${CONFIG.api}/gk-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  id: question.id, answerOption: option, sessionGoal }) })
        const data = await res.json()
        setIsCorrect(data.correct)
        if (data.correct) setScore((s) => s + 1);
        // Show feedback with explanation
        (() => {
            const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
            if (data.correct) {
            setFeedback(`Correct! The answer is ${data.correctAnswer}) ${data.correctAnswerText}`.slice(0,-1) + _ci + `Correct! The answer is ${data.correctAnswer}) ${data.correctAnswerText}`.slice(-1))
            } else if (sessionGoal === 'perfect') {
            setFeedback(`Incorrect. The correct answer is ${data.correctAnswer}) ${data.correctAnswerText}` + ' ❌ Perfect Solve ended.')
            setFinished(true); timer.reset()
            } else {
            setFeedback(`Incorrect. The correct answer is ${data.correctAnswer}) ${data.correctAnswerText}`)
            }
        })()
        // Record result for display
        setResults((prev) => [...prev, {
        question: question.question.length > 50 ? question.question.slice(0, 50) + '…' : question.question,
        userAnswer: option,
        correctAnswer: `${data.correctAnswer}) ${data.correctAnswerText}`,
        correct: data.correct,
        time: timeTaken,
        }])
        setRevealed(true)
    }

    /**
     * handleSubmitOrNext(): Toggle between submit and next question
     * If not revealed: submit the selected answer
     * If revealed: load the next question
     */
    const handleSubmitOrNext = async () => {
        if (!question) return
        if (!revealed) { if (selected) submitGK(selected); return }
        await loadQuestion()
    }

    /**
     * handleSolve(): Get the solution without submitting an answer
     * Fetches the correct answer from the API with solve: true flag
     */
    const handleSolve = async () => {
        if (revealed) return
        const timeTaken = timer.stop()
        // POST to backend API with solve flag to get the solution
        const res = await fetch(`${CONFIG.api}/gk-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  id: question.id, answerOption: '', solve: true, sessionGoal }) })
        const data = await res.json()
        setIsCorrect(false)
        const display = data.correctAnswer || ''
        const displayText = `${display}) ${data.correctAnswerText || ''}`
        const explanation = data.explanation || ''
        setFeedback(`Solution: ${displayText}${explanation ? '\n' + explanation : ''}`)
        setResults((prev) => [...prev, {
        question: question.question.length > 50 ? question.question.slice(0, 50) + '…' : question.question,
        userAnswer: '—',
        correctAnswer: displayText,
        correct: false,
        time: timeTaken,
        }])
        setRevealed(true)
    }

    // Auto-advance after correct answer
    const advanceRef = useRef(null)
    const submitGKRef = useRef(submitGK)
    const handleNextRef = useRef(handleSubmitOrNext)
    useEffect(
        () => {
            advanceRef.current = loadQuestion
            submitGKRef.current = submitGK
            handleNextRef.current = handleSubmitOrNext
        }
    )
    useAutoAdvance(revealed, advanceRef, isCorrect, false)
    useProgressSubmit(revealed, isCorrect, 'gk', question?.id)

    // Keyboard shortcuts: 1-4 or a-d instantly select and submit answer; Enter for submit/next

    useEffect(() => {
        const onKeyDown = (event) => {
        // Enter: submit or next
        if (event.key === 'Enter') { event.preventDefault(); handleNextRef.current(); return }
        // Only allow number/letter shortcuts when not already revealed, loading, or no question
        if (revealed || loading || !question) return
        // Map 1-4 and a-d to A-D options
        const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D' }
        const letter = keyMap[event.key.toLowerCase()]
        // Only allow if this option exists for this question
        if (letter && question.options.length >= ['A', 'B', 'C', 'D'].indexOf(letter) + 1) {
            event.preventDefault()
            submitGKRef.current(letter)  // Instantly select and submit
        }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [revealed, loading, question])

    return (
        <QuizLayout title="General Knowledge" subtitle="Random question picker" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
        {!started && !finished && <div className="welcome-box">
            <p className="welcome-text">Test your general knowledge with random questions!</p>

            {isGoalMode && (
            <>
            <p className="welcome-text" style={{ marginTop: '14px', fontSize: '0.92rem', fontWeight: 700, marginBottom: '6px' }}>Practice Goal:</p>
                    <div className="checkbox-group" style={{ marginBottom: '12px' }}>
                        {[
                                                { key: 'speed', label: '⚡ Speed Run' },
                        { key: 'perfect', label: '🎯 Perfect Solve' },
                        { key: 'revision', label: '🔄 Revision' }
                        ].map(g => (
                        <label key={g.key} className={`checkbox-pill${sessionGoal === g.key ? ' active' : ''}`}
                            style={sessionGoal === g.key ? (
                            g.key === 'speed' ? { background: 'rgba(255,179,0,0.18)', borderColor: '#ffb300', color: '#ffb300' } :
                            g.key === 'perfect' ? { background: 'rgba(244,67,54,0.18)', borderColor: '#f44336', color: '#f44336' } :
                            g.key === 'revision' ? { background: 'rgba(33,150,243,0.18)', borderColor: '#2196f3', color: '#2196f3' } : {}
                            ) : {}}>
                            <input type="radio" name="gkapp-goal" checked={sessionGoal === g.key} onChange={() => {
                            setSelectedGoal(g.key)
                            
                            }} />
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
            <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
        </div>}
        {started && !finished && <>
            <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
            <div className="question-box">{loading || !question ? 'Loading question…' : <GlossaryText text={question.question} />}</div>
            {question && (
            <div className="options-list">
                {question.options.map((option, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx]
                return (
                    <label key={letter} className={`option-card ${selected === letter ? 'selected' : ''}`}>
                    <input type="radio" name="gk" checked={selected === letter} onChange={() => !revealed && setSelected(letter)} disabled={revealed} />
                    <span><strong>{letter})</strong> {option}</span>
                    </label>
                )
                })}
            </div>
            )}
            <FeedbackDisplay feedback={feedback} isCorrect={isCorrect}/>
            <div className="button-row">
            {!revealed ? <>
                <button onClick={handleSubmitOrNext} disabled={loading || !selected}>Submit</button>
                <button onClick={handleSolve} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
            </> : <button onClick={handleSubmitOrNext}>{questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question'}</button>}
            </div>
            {results.length > 0 && <ResultsTable results={results} />}
        </>}
        {finished && <div className="welcome-box">
            <p className="welcome-text">Quiz complete!</p>
            <p className="final-score">Final score: {score}/{totalQ}</p>
            <ResultsTable results={results} />
            <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
        </div>}
        <HintModal concept={'gk'} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />
    </QuizLayout>
    )
}

export default GK
