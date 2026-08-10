/**
 * useFaceDetection — Hook to detect faces using canvas-based analysis.
 *
 * Lightweight approach: captures frames from video, uses edge detection
 * to count faces. For full TensorFlow.js integration, import the
 * face-landmarks-detection model separately.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export default function useFaceDetection({ videoRef, enabled = false, onAnomaly }) {
  const [faceCount, setFaceCount] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const onRef = useRef(null)
  const graceRef = useRef(true)

  useEffect(() => {
    onRef.current = onAnomaly
  })

  // Grace period: don't detect for 10s after enabling
  useEffect(() => {
    if (enabled) {
      graceRef.current = true
      const t = setTimeout(() => { graceRef.current = false; setIsReady(true) }, 10000)
      return () => clearTimeout(t)
    }
  }, [enabled])

  // Simple face detection using brightness analysis
  const detectFaces = useCallback(() => {
    if (!enabled || graceRef.current) return
    const video = videoRef?.current
    if (!video || video.readyState < 2) return

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
      canvasRef.current.width = 160
      canvasRef.current.height = 120
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Simple skin-tone detection for face presence
    let skinPixels = 0
    const totalPixels = data.length / 4
    for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // YCbCr skin-tone range
      const y = 0.299 * r + 0.587 * g + 0.114 * b
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      if (y > 80 && cb > 85 && cb < 135 && cr > 135 && cr < 180) skinPixels++
    }

    const skinRatio = skinPixels / (totalPixels / 4)
    // Heuristic: less than 2% skin = no face, more than 40% = possible multiple faces
    let count = 0
    if (skinRatio < 0.02) count = 0
    else if (skinRatio < 0.40) count = 1
    else count = 2

    setFaceCount(count)

    if (count === 0) {
      onRef.current?.({ type: 'no_face', severity: 1 })
    } else if (count > 1) {
      onRef.current?.({ type: 'multiple_faces', severity: 2 })
    }
  }, [enabled, videoRef])

  useEffect(() => {
    if (!enabled) return
    intervalRef.current = setInterval(detectFaces, 2000) // check every 2s
    return () => clearInterval(intervalRef.current)
  }, [enabled, detectFaces])

  return { faceCount, isReady }
}
