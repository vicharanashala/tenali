/**
 * useTabSwitch — Hook to detect tab/window focus loss and return.
 *
 * Tracks:
 *   - Whether the document is currently focused
 *   - Count of tab switches during the session
 *   - Fires onTabSwitch when user leaves, onTabReturn when user comes back
 */

import { useState, useEffect, useRef } from 'react'

export default function useTabSwitch({ onTabSwitch, onTabReturn, enabled = true }) {
  const [isFocused, setIsFocused] = useState(true)
  const [switchCount, setSwitchCount] = useState(0)
  const onSwitchRef = useRef(null)
  const onReturnRef = useRef(null)

  useEffect(() => { onSwitchRef.current = onTabSwitch })
  useEffect(() => { onReturnRef.current = onTabReturn })

  useEffect(() => {
    if (!enabled) return

    const handleVisibility = () => {
      const focused = document.visibilityState === 'visible'
      setIsFocused(focused)
      if (!focused) {
        setSwitchCount(c => c + 1)
        onSwitchRef.current?.({ type: 'tab_switch', timestamp: Date.now() })
      } else {
        onReturnRef.current?.()
      }
    }

    const handleBlur = () => {
      setIsFocused(false)
      setSwitchCount(c => c + 1)
      onSwitchRef.current?.({ type: 'tab_blur', timestamp: Date.now() })
    }

    const handleFocus = () => {
      setIsFocused(true)
      onReturnRef.current?.()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled])

  return { isFocused, switchCount }
}
