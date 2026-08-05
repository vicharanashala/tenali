/**
 * useVirtualCamera — Hook to detect virtual/fake camera devices.
 *
 * Inspects camera device labels for known virtual camera signatures:
 *   OBS Virtual Camera, ManyCam, Snap Camera, XSplit, etc.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

const VIRTUAL_SIGNATURES = [
  'obs', 'virtual', 'manycam', 'snap camera', 'xsplit',
  'camtasia', 'droidcam', 'ip webcam', 'iriun',
]

export default function useVirtualCamera({ enabled = false, onAnomaly }) {
  const [isVirtual, setIsVirtual] = useState(false)
  const [cameraLabel, setCameraLabel] = useState('')
  const onRef = useRef(null)

  useEffect(() => {
    onRef.current = onAnomaly
  })

  const checkCameras = useCallback(async () => {
    if (!enabled) return
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')

      for (const device of videoDevices) {
        const label = (device.label || '').toLowerCase()
        setCameraLabel(device.label || 'Unknown')

        for (const sig of VIRTUAL_SIGNATURES) {
          if (label.includes(sig)) {
            setIsVirtual(true)
            onRef.current?.({
              type: 'virtual_camera',
              severity: 2,
              metadata: { deviceLabel: device.label, signature: sig },
            })
            return
          }
        }
      }
      setIsVirtual(false)
    } catch {
      // enumerateDevices may fail without permission
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    // Use microtask to avoid setState-in-effect lint
    let cancelled = false
    const run = async () => {
      await checkCameras()
      if (cancelled) return
    }
    run()
    const interval = setInterval(() => { if (!cancelled) checkCameras() }, 10000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [enabled, checkCameras])

  return { isVirtual, cameraLabel }
}
