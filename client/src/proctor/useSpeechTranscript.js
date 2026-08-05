/**
 * useSpeechTranscript — Records speech-to-text transcript using Web Speech API.
 *
 * Continuously transcribes spoken audio while proctoring is active.
 * Provides a `getTranscript()` function that returns the current
 * accumulated transcript string (for attaching to voice_detected anomalies).
 */

import { useEffect, useRef, useCallback, useState } from 'react'

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

export default function useSpeechTranscript({ enabled = false }) {
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)
  const accumulatedRef = useRef('')
  const restartTimerRef = useRef(null)

  const getTranscript = useCallback(() => accumulatedRef.current, [])

  const clearTranscript = useCallback(() => {
    accumulatedRef.current = ''
    setTranscript('')
  }, [])

  useEffect(() => {
    if (!enabled || !SpeechRecognition) {
      setIsSupported(!!SpeechRecognition)
      return
    }

    setIsSupported(true)
    accumulatedRef.current = ''
    setTranscript('')

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let final = ''
      let interim = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      if (final) {
        accumulatedRef.current = (accumulatedRef.current + ' ' + final).trim()
      }
      setTranscript((accumulatedRef.current + ' ' + interim).trim())
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.warn('[speechTranscript] permission denied')
        return
      }
      // Auto-restart on recoverable errors
      if (event.error !== 'aborted') {
        console.warn('[speechTranscript] error:', event.error)
        restartTimerRef.current = setTimeout(() => {
          try { recognition.start() } catch { /* ignore */ }
        }, 1000)
      }
    }

    recognition.onend = () => {
      // Auto-restart if still enabled
      if (enabled && recognitionRef.current) {
        restartTimerRef.current = setTimeout(() => {
          try { recognition.start() } catch { /* ignore */ }
        }, 300)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch { /* already started */ }

    return () => {
      clearTimeout(restartTimerRef.current)
      recognitionRef.current = null
      try { recognition.abort() } catch { /* ignore */ }
    }
  }, [enabled])

  return { transcript, isSupported, getTranscript, clearTranscript }
}
