/**
 * useAntiCheat — Hook to block common cheating shortcuts and context menu.
 *
 * Blocks:
 *   - Right-click context menu
 *   - Ctrl+C / Ctrl+V (copy/paste)
 *   - Ctrl+U (view source)
 *   - Ctrl+S (save page)
 *   - F12 / Ctrl+Shift+I (DevTools)
 *   - Ctrl+Shift+J (Console)
 */

import { useEffect, useCallback, useRef } from 'react'

export default function useAntiCheat({ enabled = true, onViolation }) {
  const onRef = useRef(null)

  useEffect(() => {
    onRef.current = onViolation
  })

  const reportViolation = useCallback((type, meta) => {
    onRef.current?.({ type, metadata: meta })
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleContextMenu = (e) => {
      e.preventDefault()
      reportViolation('right_click', { element: e.target.tagName })
    }

    const handleKeyDown = (e) => {
      // Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
        e.preventDefault()
        reportViolation('copy_paste', { action: 'copy' })
        return
      }
      // Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        reportViolation('copy_paste', { action: 'paste' })
        return
      }
      // Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
        reportViolation('copy_paste', { action: 'view_source' })
        return
      }
      // Ctrl+S (save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        reportViolation('copy_paste', { action: 'save' })
        return
      }
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        reportViolation('devtools', { action: 'F12' })
        return
      }
      // Ctrl+Shift+I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        reportViolation('devtools', { action: 'Ctrl+Shift+I' })
        return
      }
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        reportViolation('devtools', { action: 'Ctrl+Shift+J' })
        return
      }
      // Cmd+Option+I (macOS DevTools)
      if (e.metaKey && e.altKey && e.key === 'i') {
        e.preventDefault()
        reportViolation('devtools', { action: 'Cmd+Option+I' })
        return
      }
      // Cmd+Option+J (macOS Console)
      if (e.metaKey && e.altKey && e.key === 'j') {
        e.preventDefault()
        reportViolation('devtools', { action: 'Cmd+Option+J' })
        return
      }
      // Cmd+Option+U (macOS View Source)
      if (e.metaKey && e.altKey && e.key === 'u') {
        e.preventDefault()
        reportViolation('copy_paste', { action: 'Cmd+Option+U' })
        return
      }
      // Ctrl+Shift+C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        reportViolation('devtools', { action: 'Ctrl+Shift+C' })
        return
      }
      // Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        reportViolation('copy_paste', { action: 'print' })
        return
      }
      // Ctrl+T (New Tab)
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        reportViolation('tab_switch', { action: 'new_tab' })
        return
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, reportViolation])
}
