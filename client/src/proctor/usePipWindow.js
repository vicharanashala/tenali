/**
 * usePipWindow — Document Picture-in-Picture for proctor video.
 *
 * Shows proctor camera in a persistent floating window that survives tab switches.
 * Adapted from addyosmani/recorder's pictureInPicture.tsx.
 *
 * Progressive enhancement: only works in Chrome/Edge (Document PiP API).
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export default function usePipWindow({ videoRef, enabled = false }) {
  const [pipActive, setPipActive] = useState(false)
  const [pipSupported] = useState(() => 'documentPictureInPicture' in window)
  const pipWindowRef = useRef(null)

  const openPip = useCallback(async () => {
    if (!pipSupported || !videoRef?.current || pipActive) return
    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 280,
        height: 210,
      })

      // Clone all CSS from main document
      const allCSS = [...document.styleSheets]
        .map(s => { try { return [...s.cssRules].map(r => r.cssText).join('') } catch { return '' } })
        .filter(Boolean)
        .join('\n')
      const style = document.createElement('style')
      style.textContent = allCSS
      pipWindow.document.head.appendChild(style)

      // Create video element in PiP window
      const pipVideo = pipWindow.document.createElement('video')
      pipVideo.autoplay = true
      pipVideo.muted = true
      pipVideo.playsInline = true
      pipVideo.style.cssText = 'width:100%;height:100%;object-fit:cover;transform:scaleX(-1);background:#111'

      // Transfer stream to PiP video
      if (videoRef.current.srcObject) {
        pipVideo.srcObject = videoRef.current.srcObject
      }

      pipWindow.document.body.style.cssText = 'margin:0;padding:0;overflow:hidden;background:#111'
      pipWindow.document.body.appendChild(pipVideo)

      pipWindow.onpagehide = () => {
        setPipActive(false)
        pipWindowRef.current = null
      }

      pipWindowRef.current = pipWindow
      setPipActive(true)
    } catch {
      // PiP permission denied or not supported
    }
  }, [videoRef, pipSupported, pipActive])

  const closePip = useCallback(() => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close()
      pipWindowRef.current = null
    }
    setPipActive(false)
  }, [])

  const togglePip = useCallback(() => {
    if (pipActive) closePip()
    else openPip()
  }, [pipActive, openPip, closePip])

  /* eslint-disable react-hooks/set-state-in-effect */
  // Auto-close PiP when proctoring ends
  useEffect(() => {
    if (!enabled && pipActive) void closePip()
  }, [enabled, pipActive, closePip])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sync stream when video source changes
  useEffect(() => {
    if (!pipActive || !pipWindowRef.current || !videoRef?.current) return
    const pipVideo = pipWindowRef.current.document.querySelector('video')
    if (pipVideo && videoRef.current.srcObject) {
      pipVideo.srcObject = videoRef.current.srcObject
    }
  }, [pipActive, videoRef])

  return { pipActive, pipSupported, togglePip, openPip, closePip }
}
