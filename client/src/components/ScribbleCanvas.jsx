import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

const DEFAULT_COLORS = ['#1e1e1e','#e03131','#2f9e44','#1971c2','#e8590c','#9c36b5','#0c8599','#f59f00']
const STROKE_WIDTHS = [1, 2, 3, 5, 8]

const ScribbleCanvas = forwardRef(function ScribbleCanvas(
  { width = 700, height = 460, showGrid = false, readOnly = false, allowedTools, initialData, onExport, style },
  ref
) {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#1e1e1e')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fill, setFill] = useState(false)
  const [gridSnap, setGridSnap] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [elements, setElements] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [currentPath, setCurrentPath] = useState(null)
  const [shapeStart, setShapeStart] = useState(null)
  const [textInput, setTextInput] = useState(null)
  const [textValue, setTextValue] = useState('')
  const textInputRef = useRef(null)
  const gridSize = 20
  const startRef = useRef(null)

  const allTools = ['pen','line','rect','circle','triangle','text','eraser']
  const activeTools = allowedTools || allTools

  const snap = useCallback((v) => gridSnap ? Math.round(v / gridSize) * gridSize : v, [gridSnap])

  const redraw = useCallback((ctx, els) => {
    ctx.clearRect(0, 0, width, height)
    if (showGrid) {
      ctx.save()
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }
      ctx.restore()
    }
    els.forEach(el => drawElement(ctx, el))
  }, [width, height, showGrid, gridSize])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) redraw(ctx, elements)
  }, [elements, redraw])

  const drawElement = (ctx, el) => {
    ctx.save()
    ctx.strokeStyle = el.color || '#1e1e1e'
    ctx.fillStyle = el.color || '#1e1e1e'
    ctx.lineWidth = el.strokeWidth || 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    switch (el.type) {
      case 'pen': {
        if (!el.points || el.points.length < 2) break
        ctx.beginPath()
        ctx.moveTo(el.points[0].x, el.points[0].y)
        for (let i = 1; i < el.points.length; i++) {
          const prev = el.points[i - 1]
          const cur = el.points[i]
          const mx = (prev.x + cur.x) / 2
          const my = (prev.y + cur.y) / 2
          ctx.quadraticCurveTo(prev.x, prev.y, mx, my)
        }
        ctx.stroke()
        break
      }
      case 'line': {
        ctx.beginPath()
        ctx.moveTo(el.x1, el.y1)
        ctx.lineTo(el.x2, el.y2)
        ctx.stroke()
        break
      }
      case 'rect': {
        const w = el.x2 - el.x1, h = el.y2 - el.y1
        if (el.fill) { ctx.fillStyle = el.color + '33'; ctx.fillRect(el.x1, el.y1, w, h) }
        ctx.strokeRect(el.x1, el.y1, w, h)
        break
      }
      case 'circle': {
        const cx = (el.x1 + el.x2) / 2, cy = (el.y1 + el.y2) / 2
        const rx = Math.abs(el.x2 - el.x1) / 2, ry = Math.abs(el.y2 - el.y1) / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        if (el.fill) { ctx.fillStyle = el.color + '33'; ctx.fill() }
        ctx.stroke()
        break
      }
      case 'triangle': {
        const mx = (el.x1 + el.x2) / 2
        ctx.beginPath()
        ctx.moveTo(mx, el.y1)
        ctx.lineTo(el.x2, el.y2)
        ctx.lineTo(el.x1, el.y2)
        ctx.closePath()
        if (el.fill) { ctx.fillStyle = el.color + '33'; ctx.fill() }
        ctx.stroke()
        break
      }
      case 'text': {
        ctx.font = `${el.fontSize || 16}px "Segoe UI", sans-serif`
        ctx.fillStyle = el.color || '#1e1e1e'
        ctx.fillText(el.text || '', el.x, el.y)
        break
      }
      case 'eraser': {
        if (!el.points || el.points.length < 2) break
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.moveTo(el.points[0].x, el.points[0].y)
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y)
        }
        ctx.lineWidth = (el.strokeWidth || 2) * 4
        ctx.stroke()
        ctx.globalCompositeOperation = 'source-over'
        break
      }
    }
    ctx.restore()
  }

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = width / rect.width
    const scaleY = height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }

  const handleStart = useCallback((e) => {
    if (readOnly) return
    e.preventDefault()
    const pos = getPos(e)
    const snapped = { x: snap(pos.x), y: snap(pos.y) }

    if (tool === 'text') {
      setTextInput(snapped)
      setTextValue('')
      setTimeout(() => textInputRef.current?.focus(), 50)
      return
    }

    setDrawing(true)
    startRef.current = snapped
    redoStack.length = 0

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath({ type: tool, points: [snapped], color, strokeWidth })
    } else {
      setShapeStart(snapped)
    }
  }, [readOnly, tool, color, strokeWidth, snap, width, height])

  const handleMove = useCallback((e) => {
    if (!drawing) return
    e.preventDefault()
    const pos = getPos(e)
    const snapped = { x: snap(pos.x), y: snap(pos.y) }

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, snapped] } : null)
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx && currentPath) {
        redraw(ctx, elements)
        drawElement(ctx, { ...currentPath, points: [...currentPath.points, snapped] })
      }
    } else if (shapeStart) {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        redraw(ctx, elements)
        drawElement(ctx, { type: tool, x1: shapeStart.x, y1: shapeStart.y, x2: snapped.x, y2: snapped.y, color, strokeWidth, fill })
      }
    }
  }, [drawing, tool, shapeStart, currentPath, elements, color, strokeWidth, fill, snap, redraw])

  const handleEnd = useCallback((e) => {
    if (!drawing) return
    setDrawing(false)

    if ((tool === 'pen' || tool === 'eraser') && currentPath) {
      if (currentPath.points.length > 1) {
        setElements(prev => [...prev, currentPath])
        setRedoStack([])
      }
      setCurrentPath(null)
    } else if (shapeStart) {
      const pos = e.changedTouches ? { x: 0, y: 0 } : getPos(e)
      const snapped = { x: snap(pos.x), y: snap(pos.y) }
      const el = { type: tool, x1: shapeStart.x, y1: shapeStart.y, x2: snapped.x, y2: snapped.y, color, strokeWidth, fill }
      setElements(prev => [...prev, el])
      setRedoStack([])
      setShapeStart(null)
    }
  }, [drawing, tool, currentPath, shapeStart, color, strokeWidth, fill, snap])

  const handleTextSubmit = () => {
    if (textValue.trim() && textInput) {
      setElements(prev => [...prev, { type: 'text', x: textInput.x, y: textInput.y, text: textValue, color, fontSize: 16 + strokeWidth * 2 }])
      setRedoStack([])
    }
    setTextInput(null)
    setTextValue('')
  }

  const undo = () => {
    if (elements.length === 0) return
    const last = elements[elements.length - 1]
    setElements(prev => prev.slice(0, -1))
    setRedoStack(prev => [...prev, last])
  }

  const redo = () => {
    if (redoStack.length === 0) return
    const last = redoStack[redoStack.length - 1]
    setRedoStack(prev => prev.slice(0, -1))
    setElements(prev => [...prev, last])
  }

  const clearAll = () => { setElements([]); setRedoStack([]) }

  useImperativeHandle(ref, () => ({
    undo, redo, clearAll,
    getDataURL: () => canvasRef.current?.toDataURL('image/png'),
    getElements: () => [...elements],
    loadElements: (els) => { setElements(els); setRedoStack([]) },
    getDrawingBounds: () => {
      if (elements.length === 0) return null
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      elements.forEach(el => {
        if (el.points) {
          el.points.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y) })
        } else {
          minX = Math.min(minX, el.x1, el.x2); minY = Math.min(minY, el.y1, el.y2)
          maxX = Math.max(maxX, el.x1, el.x2); maxY = Math.max(maxY, el.y1, el.y2)
        }
      })
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    }
  }))

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [elements, redoStack])

  useEffect(() => {
    if (initialData) {
      setElements(Array.isArray(initialData) ? initialData : [])
      setRedoStack([])
    }
  }, [])

  useEffect(() => {
    if (onExport) onExport({ getDataURL: () => canvasRef.current?.toDataURL('image/png'), getElements: () => [...elements] })
  }, [elements])

  const toolBtnStyle = (t) => ({
    padding: '4px 10px', borderRadius: 6, border: tool === t ? '2px solid #1971c2' : '1px solid var(--clr-border, #ddd)',
    background: tool === t ? '#e7f5ff' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: tool === t ? 700 : 400,
    color: 'var(--clr-text, #333)', transition: 'all 0.15s'
  })

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, ...style }}>
      {!readOnly && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', padding: '6px 8px', background: 'var(--clr-surface, #fafafa)', borderRadius: 8, border: '1px solid var(--clr-border, #e0e0e0)' }}>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {activeTools.map(t => {
              const icons = { pen: '✏️', line: '╱', rect: '▭', circle: '◯', triangle: '△', text: 'T', eraser: '⌫' }
              return <button key={t} style={toolBtnStyle(t)} onClick={() => setTool(t)} title={t}>{icons[t]} {t}</button>
            })}
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--clr-border, #ddd)', margin: '0 4px' }} />
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {DEFAULT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: color === c ? '2px solid #1971c2' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--clr-border, #ddd)', margin: '0 4px' }} />
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {STROKE_WIDTHS.map(w => (
              <button key={w} onClick={() => setStrokeWidth(w)} style={{ width: 28, height: 28, borderRadius: 6, border: strokeWidth === w ? '2px solid #1971c2' : '1px solid var(--clr-border, #ddd)', background: strokeWidth === w ? '#e7f5ff' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: w + 2, height: w + 2, borderRadius: '50%', background: '#333' }} />
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--clr-border, #ddd)', margin: '0 4px' }} />
          <label style={{ fontSize: 12, display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={fill} onChange={e => setFill(e.target.checked)} /> Fill
          </label>
          <label style={{ fontSize: 12, display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={gridSnap} onChange={e => setGridSnap(e.target.checked)} /> Snap
          </label>
          <div style={{ flex: 1 }} />
          <button onClick={undo} disabled={elements.length === 0} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--clr-border, #ddd)', background: 'transparent', cursor: elements.length === 0 ? 'default' : 'pointer', opacity: elements.length === 0 ? 0.4 : 1, fontSize: 13 }}>↩</button>
          <button onClick={redo} disabled={redoStack.length === 0} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--clr-border, #ddd)', background: 'transparent', cursor: redoStack.length === 0 ? 'default' : 'pointer', opacity: redoStack.length === 0 ? 0.4 : 1, fontSize: 13 }}>↪</button>
          <button onClick={clearAll} disabled={elements.length === 0} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e03131', background: 'transparent', color: '#e03131', cursor: elements.length === 0 ? 'default' : 'pointer', opacity: elements.length === 0 ? 0.4 : 1, fontSize: 13 }}>Clear</button>
        </div>
      )}
      <div style={{ position: 'relative', width, height, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--clr-border, #e0e0e0)', background: '#fff', cursor: tool === 'text' ? 'text' : tool === 'eraser' ? 'crosshair' : 'crosshair' }}>
        <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }}
          onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        />
        {textInput && (
          <input ref={textInputRef} value={textValue} onChange={e => setTextValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') { setTextInput(null); setTextValue('') } }}
            onBlur={handleTextSubmit}
            style={{ position: 'absolute', left: `${(textInput.x / width) * 100}%`, top: `${(textInput.y / height) * 100}%`, fontSize: 16 + strokeWidth * 2, color, border: '1px dashed #1971c2', background: 'rgba(255,255,255,0.9)', padding: '2px 4px', outline: 'none', minWidth: 40, zIndex: 10 }}
          />
        )}
      </div>
    </div>
  )
})

export default ScribbleCanvas
