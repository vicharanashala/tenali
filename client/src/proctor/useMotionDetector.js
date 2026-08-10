/**
 * useMotionDetector — Detects significant camera scene changes via pixel-diff.
 *
 * Algorithm: compares consecutive video frames using Sum of Absolute Differences (SAD).
 * If more than 15% of pixels change significantly, it's a scene change (someone left,
 * camera moved, scene swapped).
 *
 * Also detects sudden black/white (camera covered with hand/paper).
 *
 * Zero dependencies — pure canvas pixel math.
 * CPU cost: ~0.5ms per check on 160x120 canvas.
 */

import { useEffect, useRef, useCallback } from 'react'

const MOTION_THRESHOLD = 0.15 // 15% of pixels changed = significant motion
const BRIGHTNESS_LOW = 10    // avg brightness below this = camera covered (black)
const BRIGHTNESS_HIGH = 245  // avg brightness above this = overexposed (white)
const CHECK_INTERVAL_MS = 1000
const CANVAS_W = 160
const CANVAS_H = 120
const GRACE_MS = 10000

export default function useMotionDetector({ videoRef, enabled = false, onAnomaly }) {
  const canvasRef = useRef(null)
  const prevDataRef = useRef(null)
  const intervalRef = useRef(null)
  const graceRef = useRef(true)
  const onRef = useRef(null)

  useEffect(() => { onRef.current = onAnomaly })

  useEffect(() => {
    if (enabled) {
      graceRef.current = true
      const t = setTimeout(() => { graceRef.current = false }, GRACE_MS)
      return () => clearTimeout(t)
    }
  }, [enabled])

  const checkMotion = useCallback(() => {
    if (!enabled || graceRef.current) return

    const video = videoRef?.current
    if (!video || video.readyState < 2) return

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
      canvasRef.current.width = CANVAS_W
      canvasRef.current.height = CANVAS_H
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H)

    const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
    const data = imageData.data
    const pixelCount = CANVAS_W * CANVAS_H

    // Convert to grayscale and compute average brightness
    const gray = new Uint8Array(pixelCount)
    let brightnessSum = 0
    for (let i = 0; i < data.length; i += 4) {
      const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      gray[i / 4] = g
      brightnessSum += g
    }
    const avgBrightness = brightnessSum / pixelCount

    // Detect sudden black (camera covered) or white (overexposed)
    if (prevDataRef.current) {
      if (avgBrightness < BRIGHTNESS_LOW || avgBrightness > BRIGHTNESS_HIGH) {
        onRef.current?.({
          type: avgBrightness < BRIGHTNESS_LOW ? 'camera_covered' : 'camera_overexposed',
          severity: 2,
          metadata: { avgBrightness: Math.round(avgBrightness) },
        })
        prevDataRef.current = gray
        return
      }
    }

    // Compare with previous frame using SAD (Sum of Absolute Differences)
    if (prevDataRef.current) {
      const prev = prevDataRef.current
      let diffCount = 0
      for (let i = 0; i < pixelCount; i++) {
        // Consider pixel changed if difference > 30 (handles noise)
        if (Math.abs(gray[i] - prev[i]) > 30) diffCount++
      }
      const motionRatio = diffCount / pixelCount
      if (motionRatio > MOTION_THRESHOLD) {
        onRef.current?.({
          type: 'motion_detected',
          severity: 1,
          metadata: { motionRatio: Math.round(motionRatio * 100) + '%' },
        })
      }
    }

    prevDataRef.current = gray
  }, [enabled, videoRef])

  useEffect(() => {
    if (!enabled) return
    prevDataRef.current = null
    intervalRef.current = setInterval(checkMotion, CHECK_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [enabled, checkMotion])
}
