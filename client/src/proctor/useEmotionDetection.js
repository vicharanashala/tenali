/**
 * useEmotionDetection — Real-time facial emotion recognition using face-api.js.
 *
 * Runs alongside the existing face detector. Every 2 seconds, classifies the
 * student's facial expression into one of 7 emotions: neutral, happy, sad,
 * angry, fearful, disgusted, surprised. Emits 'tenali-emotion' DOM events
 * with the latest emotion + confidence + all-scores map.
 *
 * Model: face_expression_model (~330KB quantized)
 * CPU cost: ~30-50ms per detection run.
 *
 * Negatively-flagged emotions (sad/angry/fearful/disgusted) tracked across
 * N consecutive frames expose a `struggling` flag — used to nudge the
 * student with a "Struggling? Need a break?" toast.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

const CHECK_INTERVAL_MS = 2000
const GRACE_MS = 8000
const STRUGGLING_THRESHOLD = 3

const NEGATIVE_EMOTIONS = new Set(['sad', 'angry', 'fearful', 'disgusted'])

let faceapi = null
let modelsLoaded = false
let modelsLoading = false

async function loadEmotionModel() {
  if (modelsLoaded || modelsLoading) return modelsLoaded
  modelsLoading = true
  try {
    faceapi = await import('face-api.js')
    const modelUrl = `${window.location.origin}/models`
    await faceapi.nets.faceExpressionNet.loadFromUri(modelUrl)
    modelsLoaded = true
    return true
  } catch (err) {
    console.warn('[emotionDetection] model load failed:', err?.message || err)
    modelsLoaded = false
    return false
  } finally {
    modelsLoading = false
  }
}

export default function useEmotionDetection({
  videoRef,
  enabled = false,
  onEmotion,
  onStruggling,
}) {
  const [emotion, setEmotion] = useState(null)
  const [confidence, setConfidence] = useState(0)
  const [allEmotions, setAllEmotions] = useState({})
  const [modelsReady, setModelsReady] = useState(false)
  const [struggling, setStruggling] = useState(false)

  const intervalRef = useRef(null)
  const graceRef = useRef(true)
  const negativeStreakRef = useRef(0)
  const lastEmittedEmotionRef = useRef(null)
  const onRef = useRef(null)
  const onStrugglingRef = useRef(null)

  useEffect(() => { onRef.current = onEmotion }, [onEmotion])
  useEffect(() => { onStrugglingRef.current = onStruggling }, [onStruggling])

  useEffect(() => {
    if (enabled) {
      graceRef.current = true
      const t = setTimeout(() => { graceRef.current = false }, GRACE_MS)
      return () => clearTimeout(t)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    loadEmotionModel().then(ok => setModelsReady(ok))
  }, [enabled])

  const detectEmotion = useCallback(async () => {
    if (!enabled || graceRef.current || !modelsReady || !faceapi) return
    const video = videoRef?.current
    if (!video || video.readyState < 2) return

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.5,
        }))
        .withFaceExpressions()

      if (!detection) {
        negativeStreakRef.current = 0
        setEmotion(null)
        setAllEmotions({})
        setConfidence(0)
        return
      }

      const expressions = detection.expressions
      let top = 'neutral'
      let topScore = 0
      for (const [k, v] of Object.entries(expressions)) {
        if (v > topScore) { top = k; topScore = v }
      }

      setEmotion(top)
      setConfidence(topScore)
      setAllEmotions(expressions)

      // Track consecutive negative emotions for struggling detection
      if (NEGATIVE_EMOTIONS.has(top) && topScore > 0.3) {
        negativeStreakRef.current += 1
      } else {
        negativeStreakRef.current = 0
      }

      const isStruggling = negativeStreakRef.current >= STRUGGLING_THRESHOLD
      if (isStruggling !== struggling) {
        setStruggling(isStruggling)
        onStrugglingRef.current?.(isStruggling)
      }

      // Re-emit only when dominant emotion changes (avoid floods)
      if (top !== lastEmittedEmotionRef.current || topScore > 0.6) {
        lastEmittedEmotionRef.current = top
        const payload = {
          emotion: top,
          confidence: topScore,
          allEmotions: expressions,
          isStruggling,
          timestamp: Date.now(),
        }
        window.dispatchEvent(new CustomEvent('tenali-emotion', { detail: payload }))
        onRef.current?.(payload)
      }
    } catch (err) {
      console.warn('[emotionDetection] detection error:', err?.message || err)
    }
  }, [enabled, modelsReady, videoRef, struggling])

  useEffect(() => {
    if (!enabled || !modelsReady) return
    intervalRef.current = setInterval(detectEmotion, CHECK_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [enabled, modelsReady, detectEmotion])

  return { emotion, confidence, allEmotions, struggling, modelsReady }
}
