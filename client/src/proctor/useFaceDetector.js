/**
 * useFaceDetector — Client-side face detection using face-api.js Tiny Face Detector.
 *
 * Runs entirely in the browser via TensorFlow.js. Zero server load.
 * Detects: face count (0 = no_face, 1 = normal, 2+ = multiple_faces).
 *
 * Model: Tiny Face Detector (~190KB, quantized)
 * CPU cost: ~15-30ms per detection on mid-range laptop.
 */

import { useEffect, useRef, useCallback, useState } from 'react'

const CHECK_INTERVAL_MS = 1000
const GRACE_MS = 12000

let faceapi = null
let modelsLoaded = false
let modelsLoading = false

async function loadModels() {
  if (modelsLoaded || modelsLoading) return modelsLoaded
  modelsLoading = true
  try {
    faceapi = await import('face-api.js')
    const modelUrl = `${window.location.origin}/models`
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
    ])
    modelsLoaded = true
    return true
  } catch (err) {
    console.error('[faceDetector] model load failed:', err)
    modelsLoaded = false
    return false
  } finally {
    modelsLoading = false
  }
}

export default function useFaceDetector({ videoRef, enabled = false, onAnomaly, onFaceCount }) {
  const [faceCount, setFaceCount] = useState(1) // assume 1 until checked
  const [modelsReady, setModelsReady] = useState(false)
  const intervalRef = useRef(null)
  const graceRef = useRef(true)
  const onRef = useRef(null)
  const onFaceCountRef = useRef(null)
  const prevCountRef = useRef(1)

  useEffect(() => { onRef.current = onAnomaly })
  useEffect(() => { onFaceCountRef.current = onFaceCount })

  useEffect(() => {
    if (enabled) {
      graceRef.current = true
      const t = setTimeout(() => { graceRef.current = false }, GRACE_MS)
      return () => clearTimeout(t)
    }
  }, [enabled])

  // Load models on mount
  useEffect(() => {
    if (!enabled) return
    loadModels().then(ok => setModelsReady(ok))
  }, [enabled])

  const detectFaces = useCallback(async () => {
    if (!enabled || graceRef.current || !modelsReady || !faceapi) return

    const video = videoRef?.current
    if (!video || video.readyState < 2) return

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.3,
        }))

      const count = detections.length
      setFaceCount(count)
      onFaceCountRef.current?.(count)

      // Only fire anomaly if count changed from expected (1)
      if (count !== prevCountRef.current) {
        prevCountRef.current = count
        if (count === 0) {
          onRef.current?.({
            type: 'no_face',
            severity: 2,
            metadata: { faceCount: 0 },
          })
        } else if (count >= 2) {
          onRef.current?.({
            type: 'multiple_faces',
            severity: 2,
            metadata: { faceCount: count },
          })
        }
      }
    } catch (err) {
      console.warn('[faceDetector] detection error:', err?.message || err)
    }
  }, [enabled, modelsReady, videoRef])

  useEffect(() => {
    if (!enabled || !modelsReady) return
    intervalRef.current = setInterval(detectFaces, CHECK_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [enabled, modelsReady, detectFaces])

  return { faceCount, modelsReady }
}
