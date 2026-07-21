import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import geometryData from './geometry.json';

// Local helper component to avoid circular dependencies
function QuizLayout({ title, subtitle, onBack, children }) {
  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Home</button>
      </div>
      <h1 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)' }}>{title}</h1>
      {children}
    </>
  )
}

/* ── Geometry Learning Game (GeoCraft) ────────────── */
/**
 * GeometryApp Component
 * An interactive geometry construction workspace for kids.
 */
export default function GeometryApp({ onBack }) {
  const [currentChapterId, setCurrentChapterId] = useState(1)
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [completedActivities, setCompletedActivities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tenali-geometry-completed') || '[]')
    } catch {
      return []
    }
  })

  // Canvas Drawing States
  const [points, setPoints] = useState([])
  const [segments, setSegments] = useState([])
  const [lines, setLines] = useState([])
  const [rays, setRays] = useState([])
  const [selectedPoints, setSelectedPoints] = useState([])
  const [activeTool, setActiveTool] = useState('point')
  const [history, setHistory] = useState([])

  const distanceToSegment = (x, y, x1, y1, x2, y2) => {
    const A = x - x1
    const B = y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    if (lenSq !== 0) param = dot / lenSq

    let xx, yy
    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = x - xx
    const dy = y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  const distanceToLine = (x, y, x1, y1, x2, y2) => {
    const num = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1)
    const den = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
    return den === 0 ? Math.sqrt((x - x1) ** 2 + (y - y1) ** 2) : num / den
  }

  const distanceToRay = (x, y, x1, y1, x2, y2) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2)
    const t = ((x - x1) * dx + (y - y1) * dy) / lenSq
    if (t < 0) return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2)
    const px = x1 + t * dx
    const py = y1 + t * dy
    return Math.sqrt((x - px) ** 2 + (y - py) ** 2)
  }

  const chapters = geometryData.chapters
  const currentChapter = chapters.find(ch => ch.chapter_id === currentChapterId) || chapters[0]
  const currentActivity = currentChapter.activities[currentActivityIndex]

  const canvasRef = useRef(null)

  const handleBackToHome = () => {
    if (onBack) onBack()
  }

  // Validation and hint feedback state
  const [validationFeedback, setValidationFeedback] = useState({ status: null, message: '' })
  const [particles, setParticles] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [showHint, setShowHint] = useState(false)

  // Scroll window to top when chapter changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentChapterId])

  // Reset drawing canvas and default the active tool when activity or chapter changes
  useEffect(() => {
    let initialPoints = []
    if (currentActivity) {
      if (currentActivity.activity_id === 'act_3_1') {
        initialPoints = [
          { id: 'A', x: 140, y: 150, color: '#4caf50', isPreplaced: true }, // Green
          { id: 'B', x: 360, y: 150, color: '#f44336', isPreplaced: true }  // Red
        ]
      } else if (currentActivity.activity_id === 'act_4_1') {
        initialPoints = [
          { id: 'A', x: 160, y: 150, color: '#4caf50', isPreplaced: true }, // Green
          { id: 'B', x: 320, y: 150, color: '#ff9800', isPreplaced: true }  // Orange
        ]
      }
    }
    
    setPoints(initialPoints)
    setSegments([])
    setLines([])
    setRays([])
    setSelectedPoints([])
    setHistory([])
    setValidationFeedback({ status: null, message: '' })
    setSelectedOption(null)
    setShowHint(false)
    
    if (currentActivity && currentActivity.allowed_tools && currentActivity.allowed_tools.length > 0) {
      // Filter out eraser from starting default tool if present
      const toolsNoEraser = currentActivity.allowed_tools.filter(t => t !== 'eraser')
      setActiveTool(toolsNoEraser.length > 0 ? toolsNoEraser[0] : 'point')
    } else {
      setActiveTool('point')
    }
  }, [currentChapterId, currentActivityIndex])

  const isChapterCompleted = (chId) => {
    const ch = chapters.find(c => c.chapter_id === chId)
    if (!ch) return false
    return ch.activities.every(act => completedActivities.includes(act.activity_id))
  }

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    
    // Scale factor from physical screen size to logical viewBox size (500 x 300)
    const scaleX = 500 / rect.width
    const scaleY = 300 / rect.height
    
    const logicalX = (e.clientX - rect.left) * scaleX
    const logicalY = (e.clientY - rect.top) * scaleY
    
    // Snap to grid (grid spacing 10px)
    const gridSpacing = 10
    const snapX = Math.round(logicalX / gridSpacing) * gridSpacing
    const snapY = Math.round(logicalY / gridSpacing) * gridSpacing
    
    // Boundary checks (500x300 canvas size)
    const x = Math.max(0, Math.min(500, snapX))
    const y = Math.max(0, Math.min(300, snapY))
    
    const existingPoint = points.find(p => Math.hypot(p.x - logicalX, p.y - logicalY) < 15)
    
    if (activeTool === 'eraser') {
      if (existingPoint) {
        if (existingPoint.isPreplaced) return // Don't delete preplaced points
        
        // Find connections to delete
        const connectedSegments = segments.filter(s => s.p1Id === existingPoint.id || s.p2Id === existingPoint.id)
        const connectedLines = lines.filter(l => l.p1Id === existingPoint.id || l.p2Id === existingPoint.id)
        const connectedRays = rays.filter(r => r.p1Id === existingPoint.id || r.p2Id === existingPoint.id)

        setPoints(prev => prev.filter(p => p.id !== existingPoint.id))
        setSegments(prev => prev.filter(s => s.p1Id !== existingPoint.id && s.p2Id !== existingPoint.id))
        setLines(prev => prev.filter(l => l.p1Id !== existingPoint.id && l.p2Id !== existingPoint.id))
        setRays(prev => prev.filter(r => r.p1Id !== existingPoint.id && r.p2Id !== existingPoint.id))
        setSelectedPoints([])

        setHistory(prev => [...prev, {
          type: 'delete-elements',
          points: [existingPoint],
          segments: connectedSegments,
          lines: connectedLines,
          rays: connectedRays
        }])
      } else {
        // Check if clicked close to a segment
        const clickedSegment = segments.find(s => {
          const p1 = points.find(p => p.id === s.p1Id)
          const p2 = points.find(p => p.id === s.p2Id)
          if (!p1 || !p2) return false
          return distanceToSegment(logicalX, logicalY, p1.x, p1.y, p2.x, p2.y) < 10
        })
        if (clickedSegment) {
          setSegments(prev => prev.filter(s => s.id !== clickedSegment.id))
          setHistory(prev => [...prev, {
            type: 'delete-elements',
            points: [],
            segments: [clickedSegment],
            lines: [],
            rays: []
          }])
          return
        }

        // Check if clicked close to a line
        const clickedLine = lines.find(l => {
          const p1 = points.find(p => p.id === l.p1Id)
          const p2 = points.find(p => p.id === l.p2Id)
          if (!p1 || !p2) return false
          return distanceToLine(logicalX, logicalY, p1.x, p1.y, p2.x, p2.y) < 10
        })
        if (clickedLine) {
          setLines(prev => prev.filter(l => l.id !== clickedLine.id))
          setHistory(prev => [...prev, {
            type: 'delete-elements',
            points: [],
            segments: [],
            lines: [clickedLine],
            rays: []
          }])
          return
        }

        // Check if clicked close to a ray
        const clickedRay = rays.find(r => {
          const p1 = points.find(p => p.id === r.p1Id)
          const p2 = points.find(p => p.id === r.p2Id)
          if (!p1 || !p2) return false
          return distanceToRay(logicalX, logicalY, p1.x, p1.y, p2.x, p2.y) < 10
        })
        if (clickedRay) {
          setRays(prev => prev.filter(ry => ry.id !== clickedRay.id))
          setHistory(prev => [...prev, {
            type: 'delete-elements',
            points: [],
            segments: [],
            lines: [],
            rays: [clickedRay]
          }])
          return
        }
      }
      return
    }

    if (activeTool === 'point') {
      if (!existingPoint) {
        if (points.length >= 26) return // limit to A-Z
        const newLabel = String.fromCharCode(65 + points.length)
        const newPt = { id: newLabel, x, y }
        setPoints([...points, newPt])
        setHistory(prev => [...prev, { type: 'add-point', point: newPt }])
      }
    } else {
      // Connect tools (line, segment, ray)
      if (existingPoint) {
        handlePointSelection(existingPoint.id)
      } else {
        // Auto-create a point if clicked on empty space while drawing lines
        if (points.length >= 26) return
        const newLabel = String.fromCharCode(65 + points.length)
        const newPt = { id: newLabel, x, y }
        setPoints(prev => [...prev, newPt])
        setHistory(prev => [...prev, { type: 'add-point', point: newPt }])
        handlePointSelection(newLabel)
      }
    }
  }

  const handlePointSelection = (ptId) => {
    if (selectedPoints.includes(ptId)) {
      setSelectedPoints([]) // deselect
      return
    }
    
    if (selectedPoints.length === 0) {
      setSelectedPoints([ptId])
    } else {
      const p1Id = selectedPoints[0]
      const p2Id = ptId
      if (p1Id === p2Id) return
      
      const newId = `${p1Id}${p2Id}`
      
      if (activeTool === 'segment') {
        if (!segments.some(s => (s.p1Id === p1Id && s.p2Id === p2Id) || (s.p1Id === p2Id && s.p2Id === p1Id))) {
          const newSeg = { id: newId, p1Id, p2Id }
          setSegments([...segments, newSeg])
          setHistory(prev => [...prev, { type: 'add-segment', segment: newSeg }])
        }
      } else if (activeTool === 'line') {
        if (!lines.some(l => (l.p1Id === p1Id && l.p2Id === p2Id) || (l.p1Id === p2Id && l.p2Id === p1Id))) {
          const newLn = { id: newId, p1Id, p2Id }
          setLines([...lines, newLn])
          setHistory(prev => [...prev, { type: 'add-line', line: newLn }])
        }
      } else if (activeTool === 'ray') {
        if (!rays.some(r => r.p1Id === p1Id && r.p2Id === p2Id)) {
          const newRy = { id: newId, p1Id, p2Id }
          setRays([...rays, newRy])
          setHistory(prev => [...prev, { type: 'add-ray', ray: newRy }])
        }
      }
      setSelectedPoints([])
    }
  }

  const getPt = (id) => points.find(p => p.id === id)

  // Infinite line coordinate calculations
  const getLineCoordinates = (p1, p2) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
    const ux = dx / len
    const uy = dy / len
    return {
      x1: p1.x - ux * 1000,
      y1: p1.y - uy * 1000,
      x2: p2.x + ux * 1000,
      y2: p2.y + uy * 1000
    }
  }

  // Ray coordinate calculation (starts at p1, extends infinitely past p2)
  const getRayCoordinates = (p1, p2) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
    const ux = dx / len
    const uy = dy / len
    return {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x + ux * 1000,
      y2: p2.y + uy * 1000
    }
  }

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const lastAction = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))

    if (lastAction.type === 'add-point') {
      setPoints(prev => prev.filter(p => p.id !== lastAction.point.id))
    } else if (lastAction.type === 'add-segment') {
      setSegments(prev => prev.filter(s => s.id !== lastAction.segment.id))
    } else if (lastAction.type === 'add-line') {
      setLines(prev => prev.filter(l => l.id !== lastAction.line.id))
    } else if (lastAction.type === 'add-ray') {
      setRays(prev => prev.filter(r => r.id !== lastAction.ray.id))
    } else if (lastAction.type === 'delete-elements') {
      if (lastAction.points && lastAction.points.length > 0) {
        setPoints(prev => [...prev, ...lastAction.points])
      }
      if (lastAction.segments && lastAction.segments.length > 0) {
        setSegments(prev => [...prev, ...lastAction.segments])
      }
      if (lastAction.lines && lastAction.lines.length > 0) {
        setLines(prev => [...prev, ...lastAction.lines])
      }
      if (lastAction.rays && lastAction.rays.length > 0) {
        setRays(prev => [...prev, ...lastAction.rays])
      }
    }
  }, [history])

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        handleUndo()
        return
      }

      if (e.key === 'Escape') {
        setSelectedPoints([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentActivity, history, selectedPoints, handleUndo])

  // Particle physics update loop
  useEffect(() => {
    if (particles.length === 0) return
    const frameId = requestAnimationFrame(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15, // gravity/drift pulls back down
          alpha: p.alpha - 0.015 // fade out slightly slower
        }))
        .filter(p => p.alpha > 0)
      )
    })
    return () => cancelAnimationFrame(frameId)
  }, [particles])

  const triggerSuccessAnimation = () => {
    const emojis = ['🎉', '✨', '🌟', '🥳', '👏', '💖', '🚀', '🌈', '🎓', '🔮']
    const newParticles = Array.from({ length: 30 }).map(() => ({
      id: Math.random(),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: 50 + Math.random() * 400,
      y: 300, // Bottom of the 500x300 viewBox
      vx: (Math.random() - 0.5) * 5,
      vy: -5 - Math.random() * 5, // Shoot upwards
      alpha: 1,
      size: 18 + Math.random() * 14
    }))
    setParticles(newParticles)
  }

  const handleCheckDrawing = () => {
    const actId = currentActivity.activity_id
    let feedback = { status: 'error', message: 'Invalid activity validation.' }

    // Closed loop helper for polygons
    const sideCount = segments.length
    const ptIds = Array.from(new Set(segments.flatMap(s => [s.p1Id, s.p2Id])))
    const degMap = {}
    segments.forEach(s => {
      degMap[s.p1Id] = (degMap[s.p1Id] || 0) + 1
      degMap[s.p2Id] = (degMap[s.p2Id] || 0) + 1
    })
    const isClosed = sideCount > 2 && ptIds.length === sideCount && Object.values(degMap).every(d => d === 2)
    
    if (actId === 'act_1_1') {
      if (points.length !== 1) {
        feedback = { status: 'error', message: 'We need exactly one point placed on the target center.' }
      } else {
        const pt = points[0]
        if (Math.hypot(pt.x - 250, pt.y - 150) >= 5) {
          feedback = { status: 'error', message: 'Make sure your point is close to the center of the target screen.' }
        } else {
          feedback = { status: 'success', message: 'Perfect hit! You placed a point right on the target center!' }
        }
      }
    } else if (actId === 'act_1_2') {
      if (points.length !== 3) {
        feedback = { status: 'error', message: 'We need exactly three points on the screen to form corners.' }
      } else {
        const [p1, p2, p3] = points
        const crossProduct = Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y))
        if (crossProduct < 80) {
          feedback = { status: 'error', message: 'Your points are in a straight line. Move them around so they form a triangle shape.' }
        } else {
          feedback = { status: 'success', message: 'Great job! Three non-collinear points form the corners of a triangle!' }
        }
      }
    } else if (actId === 'act_2_1') {
      if (points.length < 2) {
        feedback = { status: 'error', message: 'Please place at least two points on the canvas.' }
      } else if (lines.length !== 1) {
        feedback = { status: 'error', message: 'We need exactly one line drawn through two points.' }
      } else {
        const l = lines[0]
        const p1 = getPt(l.p1Id)
        const p2 = getPt(l.p2Id)
        if (!p1 || !p2) {
          feedback = { status: 'error', message: 'Make sure your line goes straight through both points.' }
        } else {
          feedback = { status: 'success', message: 'Excellent! An endless line passes through both points.' }
        }
      }
    } else if (actId === 'act_2_2') {
      if (lines.length !== 2) {
        feedback = { status: 'error', message: 'Please draw exactly two lines on the canvas.' }
      } else {
        const l1 = lines[0], l2 = lines[1]
        const p1a = getPt(l1.p1Id), p1b = getPt(l1.p2Id)
        const p2a = getPt(l2.p1Id), p2b = getPt(l2.p2Id)
        if (!p1a || !p1b || !p2a || !p2b || p1a.id === p1b.id || p2a.id === p2b.id) {
          feedback = { status: 'error', message: 'Both lines must be valid and pass through two distinct points.' }
        } else {
          const dx1 = p1b.x - p1a.x, dy1 = p1b.y - p1a.y
          const dx2 = p2b.x - p2a.x, dy2 = p2b.y - p2a.y
          const cross = Math.abs(dy1 * dx2 - dy2 * dx1)
          const lenProduct = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2)
          if (cross / lenProduct > 0.05) {
            feedback = { status: 'error', message: 'The two lines must run in the exact same direction and have the same slope so they never intersect.' }
          } else {
            feedback = { status: 'success', message: 'Brilliant! Those two lines are parallel and will never meet!' }
          }
        }
      }
    } else if (actId === 'act_3_1') {
      const seg = segments.find(s => (s.p1Id === 'A' && s.p2Id === 'B') || (s.p1Id === 'B' && s.p2Id === 'A'))
      if (!seg) {
        feedback = { status: 'error', message: 'Draw exactly one segment directly between the green and red points.' }
      } else {
        feedback = { status: 'success', message: 'Awesome bridge! The islands are now connected!' }
      }
    } else if (actId === 'act_3_2') {
      if (segments.length !== 1) {
        feedback = { status: 'error', message: 'Draw exactly one line segment.' }
      } else {
        const s = segments[0]
        const p1 = getPt(s.p1Id), p2 = getPt(s.p2Id)
        if (!p1 || !p2) {
          feedback = { status: 'error', message: 'Draw a valid segment connecting two points.' }
        } else {
          const dx = Math.abs(p1.x - p2.x)
          const dy = Math.abs(p1.y - p2.y)
          if (dy > 2) {
            feedback = { status: 'error', message: 'Your segment must be perfectly horizontal (flat).' }
          } else if (Math.abs(dx - 80) > 4) {
            feedback = { status: 'error', message: 'Your segment length is incorrect. Measure it with the ruler to make it exactly 4 units (80 pixels).' }
          } else {
            feedback = { status: 'success', message: 'Perfect! You drew a horizontal segment exactly 4 units long.' }
          }
        }
      }
    } else if (actId === 'act_4_1') {
      const ray = rays.find(r => r.p1Id === 'A' && r.p2Id === 'B')
      if (!ray) {
        feedback = { status: 'error', message: 'Make sure the ray starts at the green point and points directly through the orange point.' }
      } else {
        feedback = { status: 'success', message: 'Excellent! The ray shines straight through the target!' }
      }
    } else if (actId === 'act_4_2') {
      if (rays.length !== 2) {
        feedback = { status: 'error', message: 'We need exactly two rays on the screen.' }
      } else {
        const r1 = rays[0], r2 = rays[1]
        if (r1.p1Id !== r2.p1Id) {
          feedback = { status: 'error', message: 'Both rays must start from the exact same point in the middle.' }
        } else {
          const pStart = getPt(r1.p1Id)
          const p1 = getPt(r1.p2Id)
          const p2 = getPt(r2.p2Id)
          if (!pStart || !p1 || !p2) {
            feedback = { status: 'error', message: 'Both rays must connect to valid endpoints.' }
          } else {
            const dx1 = p1.x - pStart.x, dy1 = p1.y - pStart.y
            const dx2 = p2.x - pStart.x, dy2 = p2.y - pStart.y
            const dot = dx1 * dx2 + dy1 * dy2
            const cross = Math.abs(dy1 * dx2 - dy2 * dx1)
            const lenProduct = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2)
            if (cross / lenProduct > 0.05 || dot >= 0) {
              feedback = { status: 'error', message: 'The rays must point in opposite directions to form a straight line.' }
            } else {
              feedback = { status: 'success', message: 'Superb! The two opposite rays form a perfect straight line.' }
            }
          }
        }
      }
    } else if (actId === 'act_5_1') {
      if (segments.length !== 2) {
        feedback = { status: 'error', message: 'An angle needs exactly two segments meeting at a vertex point.' }
      } else {
        const s1 = segments[0], s2 = segments[1]
        let vertexId = null, o1 = null, o2 = null
        if (s1.p1Id === s2.p1Id) { vertexId = s1.p1Id; o1 = s1.p2Id; o2 = s2.p2Id; }
        else if (s1.p1Id === s2.p2Id) { vertexId = s1.p1Id; o1 = s1.p2Id; o2 = s2.p1Id; }
        else if (s1.p2Id === s2.p1Id) { vertexId = s1.p2Id; o1 = s1.p1Id; o2 = s2.p2Id; }
        else if (s1.p2Id === s2.p2Id) { vertexId = s1.p2Id; o1 = s1.p1Id; o2 = s2.p1Id; }
        
        if (!vertexId || o1 === o2) {
          feedback = { status: 'error', message: 'An angle needs exactly two segments meeting at a shared vertex point.' }
        } else {
          const v = getPt(vertexId), p1 = getPt(o1), p2 = getPt(o2)
          const dx1 = p1.x - v.x, dy1 = p1.y - v.y
          const dx2 = p2.x - v.x, dy2 = p2.y - v.y
          const lenProduct = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2)
          const dot = dx1 * dx2 + dy1 * dy2
          if (lenProduct === 0) {
            feedback = { status: 'error', message: 'Your segments are invalid.' }
          } else {
            const cosVal = dot / lenProduct
            const angle = Math.acos(Math.max(-1, Math.min(1, cosVal))) * 180 / Math.PI
            if (Math.abs(angle - 90) > 3) {
              feedback = { status: 'error', message: 'Your angle is not 90 degrees. Adjust the segments to make a perfect corner.' }
            } else {
              feedback = { status: 'success', message: 'Perfect 90° right angle! It is a clean square corner.' }
            }
          }
        }
      }
    } else if (actId === 'act_5_2') {
      if (segments.length !== 2) {
        feedback = { status: 'error', message: 'Please draw two connected segments to form an angle.' }
      } else {
        const s1 = segments[0], s2 = segments[1]
        let vertexId = null, o1 = null, o2 = null
        if (s1.p1Id === s2.p1Id) { vertexId = s1.p1Id; o1 = s1.p2Id; o2 = s2.p2Id; }
        else if (s1.p1Id === s2.p2Id) { vertexId = s1.p1Id; o1 = s1.p2Id; o2 = s2.p1Id; }
        else if (s1.p2Id === s2.p1Id) { vertexId = s1.p2Id; o1 = s1.p1Id; o2 = s2.p2Id; }
        else if (s1.p2Id === s2.p2Id) { vertexId = s1.p2Id; o1 = s1.p1Id; o2 = s2.p1Id; }
        
        if (!vertexId || o1 === o2) {
          feedback = { status: 'error', message: 'Please draw two segments sharing a vertex.' }
        } else {
          const v = getPt(vertexId), p1 = getPt(o1), p2 = getPt(o2)
          const dx1 = p1.x - v.x, dy1 = p1.y - v.y
          const dx2 = p2.x - v.x, dy2 = p2.y - v.y
          const lenProduct = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2)
          const dot = dx1 * dx2 + dy1 * dy2
          if (lenProduct === 0) {
            feedback = { status: 'error', message: 'Your segments are invalid.' }
          } else {
            const cosVal = dot / lenProduct
            const angle = Math.acos(Math.max(-1, Math.min(1, cosVal))) * 180 / Math.PI
            if (angle >= 90 || angle < 10) {
              feedback = { status: 'error', message: 'This angle is too wide! An acute angle must be sharp and less than 90 degrees.' }
            } else {
              feedback = { status: 'success', message: `Great! You drew a sharp acute angle of ${Math.round(angle)}°.` }
            }
          }
        }
      }
    } else if (actId === 'act_6_1') {
      if (!isClosed) {
        feedback = { status: 'error', message: 'The shape is open. Connect the last point to the first point to seal it.' }
      } else if (sideCount !== 4) {
        feedback = { status: 'error', message: 'We need a shape with exactly 4 straight sides.' }
      } else {
        feedback = { status: 'success', message: 'Terrific! You drew a closed 4-sided polygon (quadrilateral)!' }
      }
    } else if (actId === 'act_6_2') {
      if (!isClosed) {
        feedback = { status: 'error', message: 'Connect all the points in a loop so no space escapes.' }
      } else if (sideCount !== 5) {
        feedback = { status: 'error', message: 'A pentagon must have exactly 5 sides. Count your segments!' }
      } else {
        feedback = { status: 'success', message: 'Marvelous! You built a 5-sided pentagon!' }
      }
    } else if (actId === 'act_7_1') {
      if (!isClosed || sideCount !== 3) {
        feedback = { status: 'error', message: 'A triangle must have exactly 3 sides connected in a closed loop.' }
      } else {
        const lengths = segments.map(s => {
          const p1 = getPt(s.p1Id), p2 = getPt(s.p2Id)
          return Math.hypot(p2.x - p1.x, p2.y - p1.y)
        })
        const [d1, d2, d3] = lengths
        const isIsosceles = Math.abs(d1 - d2) < 5 || Math.abs(d2 - d3) < 5 || Math.abs(d3 - d1) < 5
        if (!isIsosceles) {
          feedback = { status: 'error', message: 'Two of the sides must be equal. Use the ruler tool to match their lengths.' }
        } else {
          feedback = { status: 'success', message: 'Splendid! You drew a valid isosceles triangle!' }
        }
      }
    } else if (actId === 'act_7_2') {
      if (!isClosed || sideCount !== 3) {
        feedback = { status: 'error', message: 'A triangle must have exactly 3 sides connected in a closed loop.' }
      } else {
        let hasRightAngle = false
        for (let ptId of ptIds) {
          const conns = segments.filter(s => s.p1Id === ptId || s.p2Id === ptId)
          const o1 = conns[0].p1Id === ptId ? conns[0].p2Id : conns[0].p1Id
          const o2 = conns[1].p1Id === ptId ? conns[1].p2Id : conns[1].p1Id
          const v = getPt(ptId), p1 = getPt(o1), p2 = getPt(o2)
          const dx1 = p1.x - v.x, dy1 = p1.y - v.y
          const dx2 = p2.x - v.x, dy2 = p2.y - v.y
          const lenProduct = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2)
          const dot = dx1 * dx2 + dy1 * dy2
          if (lenProduct > 0) {
            const cosVal = dot / lenProduct
            const angle = Math.acos(Math.max(-1, Math.min(1, cosVal))) * 180 / Math.PI
            if (Math.abs(angle - 90) < 4) {
              hasRightAngle = true
              break
            }
          }
        }
        if (!hasRightAngle) {
          feedback = { status: 'error', message: 'Your triangle needs exactly one 90-degree corner. Use the angle tool to check.' }
        } else {
          feedback = { status: 'success', message: 'Wonderful! A right-angled triangle with a perfect 90° corner.' }
        }
      }
    } else if (actId === 'act_8_1') {
      if (!isClosed || sideCount !== 4) {
        feedback = { status: 'error', message: 'A rectangle must have exactly 4 sides connected in a closed loop.' }
      } else {
        let anglesAll90 = true
        for (let ptId of ptIds) {
          const conns = segments.filter(s => s.p1Id === ptId || s.p2Id === ptId)
          const o1 = conns[0].p1Id === ptId ? conns[0].p2Id : conns[0].p1Id
          const o2 = conns[1].p1Id === ptId ? conns[1].p2Id : conns[1].p1Id
          const v = getPt(ptId), p1 = getPt(o1), p2 = getPt(o2)
          const dx1 = p1.x - v.x, dy1 = p1.y - v.y
          const dx2 = p2.x - v.x, dy2 = p2.y - v.y
          const lenProduct = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2)
          const dot = dx1 * dx2 + dy1 * dy2
          if (lenProduct > 0) {
            const angle = Math.acos(Math.max(-1, Math.min(1, dot / lenProduct))) * 180 / Math.PI
            if (Math.abs(angle - 90) > 4) {
              anglesAll90 = false
              break
            }
          } else {
            anglesAll90 = false
            break
          }
        }
        if (!anglesAll90) {
          feedback = { status: 'error', message: 'All 4 corners must be 90-degree right angles and opposite sides must be equal.' }
        } else {
          feedback = { status: 'success', message: 'Magnificent! You drew a perfect rectangle!' }
        }
      }
    } else if (actId === 'act_8_2') {
      if (!isClosed || sideCount !== 4) {
        feedback = { status: 'error', message: 'A square must have exactly 4 sides connected in a closed loop.' }
      } else {
        let anglesAll90 = true
        for (let ptId of ptIds) {
          const conns = segments.filter(s => s.p1Id === ptId || s.p2Id === ptId)
          const o1 = conns[0].p1Id === ptId ? conns[0].p2Id : conns[0].p1Id
          const o2 = conns[1].p1Id === ptId ? conns[1].p2Id : conns[1].p1Id
          const v = getPt(ptId), p1 = getPt(o1), p2 = getPt(o2)
          const dx1 = p1.x - v.x, dy1 = p1.y - v.y
          const dx2 = p2.x - v.x, dy2 = p2.y - v.y
          const lenProduct = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2)
          const dot = dx1 * dx2 + dy1 * dy2
          if (lenProduct > 0) {
            const angle = Math.acos(Math.max(-1, Math.min(1, dot / lenProduct))) * 180 / Math.PI
            if (Math.abs(angle - 90) > 4) {
              anglesAll90 = false
              break
            }
          } else {
            anglesAll90 = false
            break
          }
        }
        if (!anglesAll90) {
          feedback = { status: 'error', message: 'All corners must be 90 degrees.' }
        } else {
          const lengths = segments.map(s => {
            const p1 = getPt(s.p1Id), p2 = getPt(s.p2Id)
            return Math.hypot(p2.x - p1.x, p2.y - p1.y)
          })
          const [d1, d2, d3, d4] = lengths
          const avgLen = (d1 + d2 + d3 + d4) / 4
          const allSidesEqual = lengths.every(l => Math.abs(l - avgLen) < 5)
          if (!allSidesEqual) {
            feedback = { status: 'error', message: 'All 4 sides of a square must be the exact same length, and all corners must be 90 degrees.' }
          } else {
            feedback = { status: 'success', message: 'Superb! You drew a perfect square!' }
          }
        }
      }
    }

    setValidationFeedback(feedback)
    if (feedback.status === 'success') {
      triggerSuccessAnimation()
      if (!completedActivities.includes(actId)) {
        const nextCompleted = [...completedActivities, actId]
        setCompletedActivities(nextCompleted)
        try {
          localStorage.setItem('tenali-geometry-completed', JSON.stringify(nextCompleted))
        } catch {}
      }
    }
  }

  const renderExampleIllustration = (chapterId, type) => {
    const isCorrect = type === 'correct'
    const strokeColor = isCorrect ? 'var(--clr-accent, #4caf50)' : 'var(--clr-error, #f44336)'
    
    return (
      <svg width="100%" height="120" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
        <rect width="100%" height="100%" fill="var(--clr-bg, #0f0f11)" rx="8" stroke="var(--clr-border, #333)" strokeWidth="1" />
        
        {chapterId === 1 && (
          isCorrect ? (
            <circle cx="50" cy="50" r="5" fill={strokeColor} />
          ) : (
            <circle cx="50" cy="50" r="18" fill="none" stroke={strokeColor} strokeWidth="10" strokeLinecap="round" opacity="0.5" />
          )
        )}

        {chapterId === 2 && (
          isCorrect ? (
            <>
              <line x1="15" y1="50" x2="85" y2="50" stroke={strokeColor} strokeWidth="3" />
              <polygon points="15,50 25,45 25,55" fill={strokeColor} />
              <polygon points="85,50 75,45 75,55" fill={strokeColor} />
              <circle cx="35" cy="50" r="3.5" fill={strokeColor} />
              <circle cx="65" cy="50" r="3.5" fill={strokeColor} />
            </>
          ) : (
            <path d="M 15 50 Q 32.5 25, 50 50 T 85 50" fill="none" stroke={strokeColor} strokeWidth="3" />
          )
        )}

        {chapterId === 3 && (
          isCorrect ? (
            <>
              <line x1="25" y1="50" x2="75" y2="50" stroke={strokeColor} strokeWidth="3" />
              <circle cx="25" cy="50" r="5" fill={strokeColor} />
              <circle cx="75" cy="50" r="5" fill={strokeColor} />
            </>
          ) : (
            <>
              <line x1="25" y1="50" x2="75" y2="50" stroke={strokeColor} strokeWidth="3" />
              <circle cx="25" cy="50" r="5" fill={strokeColor} />
              <polygon points="75,50 65,45 65,55" fill={strokeColor} />
            </>
          )
        )}

        {chapterId === 4 && (
          isCorrect ? (
            <>
              <line x1="25" y1="50" x2="75" y2="50" stroke={strokeColor} strokeWidth="3" />
              <circle cx="25" cy="50" r="5" fill={strokeColor} />
              <polygon points="75,50 65,45 65,55" fill={strokeColor} />
            </>
          ) : (
            <>
              <line x1="25" y1="50" x2="75" y2="50" stroke={strokeColor} strokeWidth="3" />
            </>
          )
        )}

        {chapterId === 5 && (
          isCorrect ? (
            <>
              <line x1="35" y1="30" x2="35" y2="70" stroke={strokeColor} strokeWidth="3" />
              <line x1="35" y1="70" x2="75" y2="70" stroke={strokeColor} strokeWidth="3" />
              <rect x="35" y="60" width="10" height="10" fill="none" stroke={strokeColor} strokeWidth="1.5" />
              <circle cx="35" cy="70" r="3.5" fill={strokeColor} />
            </>
          ) : (
            <>
              <line x1="25" y1="40" x2="75" y2="40" stroke={strokeColor} strokeWidth="3" />
              <line x1="25" y1="60" x2="75" y2="60" stroke={strokeColor} strokeWidth="3" />
            </>
          )
        )}

        {chapterId === 6 && (
          isCorrect ? (
            <polygon points="30,70 50,30 70,70" fill="none" stroke={strokeColor} strokeWidth="3" />
          ) : (
            <path d="M 30 70 L 50 30 L 70 70" fill="none" stroke={strokeColor} strokeWidth="3" />
          )
        )}

        {chapterId === 7 && (
          isCorrect ? (
            <polygon points="25,70 50,25 75,70" fill="none" stroke={strokeColor} strokeWidth="3" />
          ) : (
            <polygon points="30,30 70,30 70,70 30,70" fill="none" stroke={strokeColor} strokeWidth="3" />
          )
        )}

        {chapterId === 8 && (
          isCorrect ? (
            <polygon points="20,35 80,35 80,65 20,65" fill="none" stroke={strokeColor} strokeWidth="3" />
          ) : (
            <polygon points="30,70 50,30 70,70" fill="none" stroke={strokeColor} strokeWidth="3" />
          )
        )}
      </svg>
    )
  }

  const completedInChapter = currentChapter.activities.filter(act => completedActivities.includes(act.activity_id)).length
  const totalCompletedAll = chapters.reduce((acc, ch) => acc + ch.activities.filter(act => completedActivities.includes(act.activity_id)).length, 0)
  const totalActivitiesAll = chapters.reduce((acc, ch) => acc + ch.activities.length, 0)

  return (
    <QuizLayout title="GeoCraft" subtitle="Let's learn geometry shape-by-shape!" onBack={handleBackToHome}>
      <div className="geometry-workspace" style={{ fontFamily: 'var(--font-ui, "DM Sans", sans-serif)', color: 'var(--clr-text)', marginTop: '1rem' }}>
        
        {/* Horizontal Navigation Tracker */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginBottom: '2rem', 
          flexWrap: 'wrap',
          background: 'var(--clr-surface)',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid var(--clr-border)'
        }}>
          {chapters.map((ch, idx) => {
            const isCompleted = isChapterCompleted(ch.chapter_id)
            const isActive = ch.chapter_id === currentChapterId
            const isUnlocked = idx === 0 || isChapterCompleted(chapters[idx - 1].chapter_id)
            
            return (
              <Fragment key={ch.chapter_id}>
                {idx > 0 && <span style={{ color: 'var(--clr-border, #444)', fontSize: '1rem', userSelect: 'none' }}>➔</span>}
                <button
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    setCurrentChapterId(ch.chapter_id)
                    setCurrentActivityIndex(0)
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    opacity: isUnlocked ? 1 : 0.4,
                    border: isActive 
                      ? '2px solid var(--clr-accent, #4caf50)' 
                      : (isCompleted ? '1px solid var(--clr-accent, #4caf50)' : '1px solid var(--clr-border, #444)'),
                    background: isCompleted 
                      ? 'var(--clr-accent, #4caf50)' 
                      : (isActive ? 'rgba(76, 175, 80, 0.15)' : 'transparent'),
                    color: isCompleted 
                      ? '#fff' 
                      : (isActive ? 'var(--clr-accent, #4caf50)' : 'var(--clr-text-soft, #aaa)'),
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 0 8px rgba(76, 175, 80, 0.3)' : 'none'
                  }}
                  title={ch.chapter_name}
                >
                  {isCompleted ? '✓' : ch.chapter_id}
                </button>
              </Fragment>
            )
          })}
        </div>

        {/* Syllabus Chapter details */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.35rem', borderBottom: '1px solid var(--clr-border, #444)', paddingBottom: '0.5rem' }}>
            Chapter {currentChapter.chapter_id}: {currentChapter.chapter_name.split(' — ')[0].replace(/"/g, '')}
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.5', color: 'var(--clr-text-soft)', marginTop: '0.75rem' }}>
            {currentChapter.definition}
          </p>

          {/* Example cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            {currentChapter.examples.map(ex => {
              const isCorrect = ex.type === 'correct'
              return (
                <div key={ex.example_id} style={{
                  background: 'var(--clr-surface, #1d1d21)',
                  border: isCorrect ? '1px dashed var(--clr-accent, #4caf50)' : '1px dashed var(--clr-error, #f44336)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <span style={{ 
                    fontSize: '0.78rem', 
                    fontWeight: 'bold', 
                    color: isCorrect ? 'var(--clr-accent, #4caf50)' : 'var(--clr-error, #f44336)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {isCorrect ? '✓ Correct Example' : '✗ Incorrect Example'}
                  </span>
                  
                  {renderExampleIllustration(currentChapter.chapter_id, ex.type)}
                  
                  <strong style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{ex.title}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
                    {ex.description}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Challenge and drawing workspace */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--clr-border, #444)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active Challenge</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', background: 'var(--clr-border, #333)', padding: '2px 8px', borderRadius: '4px', color: 'var(--clr-text-soft)' }}>
                Activity {currentActivityIndex + 1} of {currentChapter.activities.length}
              </span>
              <span style={{ fontSize: '0.82rem', background: 'rgba(76, 175, 80, 0.15)', border: '1px solid var(--clr-accent, #4caf50)', padding: '2px 8px', borderRadius: '4px', color: '#81c784', fontWeight: 'bold' }}>
                {completedInChapter} of {currentChapter.activities.length} done
              </span>
            </div>
          </div>

          <p style={{ fontSize: '1.1rem', color: 'var(--clr-text)', lineHeight: '1.5', margin: '0.5rem 0 1.25rem' }}>
            <strong>Mascot:</strong> "{currentActivity.prompt}"
          </p>

          {/* Side-by-side Canvas & Toolbar Layout */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '16px', 
            alignItems: 'stretch',
            width: '100%', 
            maxWidth: '800px', 
            margin: '0 auto 1.5rem' 
          }}>
            {/* Interactive SVG Canvas */}
            <div style={{ position: 'relative', flex: 1, minWidth: '0' }}>
              <svg
                ref={canvasRef}
                onClick={handleCanvasClick}
                width="100%"
                height="100%"
                viewBox="0 0 500 300"
                style={{
                  background: 'var(--clr-bg, #0f0f11)',
                  border: '1px solid var(--clr-border, #444)',
                  borderRadius: '8px',
                  cursor: 'crosshair',
                  display: 'block',
                  aspectRatio: '5 / 3'
                }}
              >
                <defs>
                  {/* Minor grid lines (every 10px) */}
                  <pattern id="minor-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--clr-accent, #4caf50)" strokeWidth="0.5" opacity="0.12" />
                  </pattern>
                  {/* Major grid lines (every 50px) */}
                  <pattern id="major-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <rect width="50" height="50" fill="url(#minor-grid)" />
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--clr-accent, #4caf50)" strokeWidth="1" opacity="0.3" />
                  </pattern>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--clr-accent, #4caf50)" />
                  </marker>
                </defs>
                
                {/* Grid Background */}
                <rect width="500" height="300" fill="url(#major-grid)" />
                
                {/* Custom background visual aids */}
                {currentActivity && currentActivity.activity_id === 'act_1_1' && (
                  <g opacity="0.3">
                    <circle cx="250" cy="150" r="60" fill="none" stroke="var(--clr-accent, #4caf50)" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="250" cy="150" r="40" fill="none" stroke="var(--clr-accent, #4caf50)" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="250" cy="150" r="20" fill="none" stroke="var(--clr-accent, #4caf50)" strokeWidth="2" />
                    <circle cx="250" cy="150" r="4" fill="var(--clr-accent, #4caf50)" />
                  </g>
                )}
                {currentActivity && currentActivity.activity_id === 'act_3_1' && (
                  <g opacity="0.3">
                    {/* Island A */}
                    <circle cx="140" cy="150" r="40" fill="#4caf50" />
                    {/* Island B */}
                    <circle cx="360" cy="150" r="40" fill="#f44336" />
                    <text x="140" y="90" textAnchor="middle" fill="var(--clr-text)" fontSize="11" fontWeight="bold">Island A</text>
                    <text x="360" y="90" textAnchor="middle" fill="var(--clr-text)" fontSize="11" fontWeight="bold">Island B</text>
                  </g>
                )}
                
                {/* Render Lines */}
                {lines.map(line => {
                  const p1 = getPt(line.p1Id)
                  const p2 = getPt(line.p2Id)
                  if (!p1 || !p2) return null
                  const coords = getLineCoordinates(p1, p2)
                  return (
                    <line
                      key={line.id}
                      x1={coords.x1}
                      y1={coords.y1}
                      x2={coords.x2}
                      y2={coords.y2}
                      stroke="var(--clr-accent, #4caf50)"
                      strokeWidth="2.5"
                      markerEnd="url(#arrow)"
                      markerStart="url(#arrow)"
                    />
                  )
                })}

                {/* Render Rays */}
                {rays.map(ray => {
                  const p1 = getPt(ray.p1Id)
                  const p2 = getPt(ray.p2Id)
                  if (!p1 || !p2) return null
                  const coords = getRayCoordinates(p1, p2)
                  return (
                    <line
                      key={ray.id}
                      x1={coords.x1}
                      y1={coords.y1}
                      x2={coords.x2}
                      y2={coords.y2}
                      stroke="var(--clr-accent, #4caf50)"
                      strokeWidth="2.5"
                      markerEnd="url(#arrow)"
                    />
                  )
                })}

                {/* Render Segments */}
                {segments.map(seg => {
                  const p1 = getPt(seg.p1Id)
                  const p2 = getPt(seg.p2Id)
                  if (!p1 || !p2) return null
                  return (
                    <line
                      key={seg.id}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="var(--clr-accent, #4caf50)"
                      strokeWidth="2.5"
                    />
                  )
                })}

                {/* Render Points */}
                {points.map(pt => {
                  const isSelected = selectedPoints.includes(pt.id)
                  const ptColor = pt.color || 'var(--clr-accent, #4caf50)'
                  return (
                    <g key={pt.id} style={{ cursor: 'pointer' }}>
                      {isSelected && (
                        <circle cx={pt.x} cy={pt.y} r="10" fill={ptColor} opacity="0.3" />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill={ptColor}
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pt.x + 8}
                        y={pt.y - 8}
                        fill="var(--clr-text)"
                        fontSize="12"
                        fontWeight="bold"
                        style={{ userSelect: 'none' }}
                      >
                        {pt.id}
                      </text>
                    </g>
                  )
                })}

                {/* Protractor Overlay (activeTool === 'measure-angle') */}
                {activeTool === 'measure-angle' && points.map(pt => {
                  const conns = []
                  segments.forEach(s => {
                    if (s.p1Id === pt.id) conns.push(s.p2Id)
                    else if (s.p2Id === pt.id) conns.push(s.p1Id)
                  })
                  lines.forEach(l => {
                    if (l.p1Id === pt.id) conns.push(l.p2Id)
                    else if (l.p2Id === pt.id) conns.push(l.p1Id)
                  })
                  rays.forEach(r => {
                    if (r.p1Id === pt.id) conns.push(r.p2Id)
                    else if (r.p2Id === pt.id) conns.push(r.p1Id)
                  })
                  const uniqueConns = Array.from(new Set(conns))
                  
                  if (uniqueConns.length === 2) {
                    const pA = getPt(uniqueConns[0])
                    const pB = getPt(uniqueConns[1])
                    if (pA && pB) {
                      const dxA = pA.x - pt.x
                      const dyA = pA.y - pt.y
                      const dxB = pB.x - pt.x
                      const dyB = pB.y - pt.y
                      const lenA = Math.hypot(dxA, dyA)
                      const lenB = Math.hypot(dxB, dyB)
                      if (lenA > 0 && lenB > 0) {
                        const cosVal = (dxA * dxB + dyA * dyB) / (lenA * lenB)
                        const angle = Math.acos(Math.max(-1, Math.min(1, cosVal))) * 180 / Math.PI
                        
                        const uxA = dxA / lenA, uyA = dyA / lenA
                        const uxB = dxB / lenB, uyB = dyB / lenB
                        let bx = uxA + uxB
                        let by = uyA + uyB
                        let lenBisect = Math.hypot(bx, by)
                        if (lenBisect < 0.01) {
                          bx = -uyA
                          by = uxA
                          lenBisect = 1
                        }
                        const ox = (bx / lenBisect) * 24
                        const oy = (by / lenBisect) * 24
                        
                        return (
                          <g key={`ang-${pt.id}`}>
                            <path
                              d={`M ${pt.x + uxA * 15} ${pt.y + uyA * 15} Q ${pt.x + (bx/lenBisect)*15} ${pt.y + (by/lenBisect)*15} ${pt.x + uxB * 15} ${pt.y + uyB * 15}`}
                              fill="none"
                              stroke="var(--clr-accent, #4caf50)"
                              strokeWidth="1.5"
                              opacity="0.6"
                            />
                            <rect
                              x={pt.x + ox - 18}
                              y={pt.y + oy - 8}
                              width="36"
                              height="16"
                              rx="3"
                              fill="var(--clr-bg, #0f0f11)"
                              stroke="var(--clr-accent, #4caf50)"
                              strokeWidth="1"
                            />
                            <text
                              x={pt.x + ox}
                              y={pt.y + oy + 4}
                              fill="var(--clr-accent, #4caf50)"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                              style={{ userSelect: 'none' }}
                            >
                              {Math.round(angle)}°
                            </text>
                          </g>
                        )
                      }
                    }
                  }
                  return null
                })}

                {/* Ruler Overlay (activeTool === 'measure-length') */}
                {activeTool === 'measure-length' && segments.map(seg => {
                  const p1 = getPt(seg.p1Id)
                  const p2 = getPt(seg.p2Id)
                  if (!p1 || !p2) return null
                  const distPx = Math.hypot(p2.x - p1.x, p2.y - p1.y)
                  const distGrid = distPx / 20
                  const midX = (p1.x + p2.x) / 2
                  const midY = (p1.y + p2.y) / 2
                  const dx = p2.x - p1.x
                  const dy = p2.y - p1.y
                  const len = Math.hypot(dx, dy)
                  let ox = 0, oy = 0
                  if (len > 0) {
                    ox = -(dy / len) * 14
                    oy = (dx / len) * 14
                  }
                  return (
                    <g key={`len-${seg.id}`}>
                      <rect
                        x={midX + ox - 20}
                        y={midY + oy - 9}
                        width="40"
                        height="18"
                        rx="4"
                        fill="var(--clr-bg, #0f0f11)"
                        stroke="var(--clr-accent, #4caf50)"
                        strokeWidth="1"
                      />
                      <text
                        x={midX + ox}
                        y={midY + oy + 4}
                        fill="var(--clr-accent, #4caf50)"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        style={{ userSelect: 'none' }}
                      >
                        {distGrid.toFixed(1)}
                      </text>
                    </g>
                  )
                })}
                {/* Render Celebration Particles */}
                {particles.map(p => (
                  <text
                    key={p.id}
                    x={p.x}
                    y={p.y}
                    fontSize={p.size}
                    opacity={p.alpha}
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {p.emoji}
                  </text>
                ))}
              </svg>
            </div>

            {/* Vertical Toolbar on the Right */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px', 
              background: 'var(--clr-surface, #1d1d21)', 
              padding: '12px 8px', 
              borderRadius: '8px', 
              border: '1px solid var(--clr-border, #444)',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              <style>{`
                .geo-tool-btn {
                  position: relative;
                  width: 44px;
                  height: 44px;
                  border-radius: 8px;
                  border: 1px solid var(--clr-border);
                  background: transparent;
                  color: var(--clr-text);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 1.3rem;
                  transition: all 0.2s ease;
                }
                .geo-tool-btn:hover {
                  background: var(--clr-hover-strong);
                  transform: scale(1.08);
                }
                .geo-tool-btn.active {
                  border-color: var(--clr-accent);
                  background: rgba(76, 175, 80, 0.15);
                  color: var(--clr-accent);
                }
                .geo-tooltip {
                  visibility: hidden;
                  position: absolute;
                  right: 54px;
                  top: 50%;
                  transform: translateY(-50%) translateX(10px);
                  background: var(--clr-card);
                  border: 1px solid var(--clr-border);
                  color: var(--clr-text);
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 0.75rem;
                  white-space: nowrap;
                  opacity: 0;
                  transition: opacity 0.2s, transform 0.2s;
                  pointer-events: none;
                  z-index: 100;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }
                .geo-tool-btn:hover .geo-tooltip {
                  visibility: visible;
                  opacity: 1;
                  transform: translateY(-50%) translateX(0);
                }
              `}</style>
              
              {currentActivity.allowed_tools.filter(t => t !== 'eraser').map(tool => {
                const isActive = activeTool === tool
                let label = tool.toUpperCase()
                let icon = '✏️'
                if (tool === 'point') { icon = '📍'; label = 'Point' }
                else if (tool === 'line') { icon = '↔️'; label = 'Line' }
                else if (tool === 'segment') { icon = '➖'; label = 'Segment' }
                else if (tool === 'ray') { icon = '➡️'; label = 'Ray' }
                else if (tool === 'measure-length') { icon = '📏'; label = 'Ruler' }
                else if (tool === 'measure-angle') { icon = '📐'; label = 'Protractor' }
                
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => {
                      setActiveTool(tool)
                      setSelectedPoints([])
                    }}
                    className={`geo-tool-btn ${isActive ? 'active' : ''}`}
                  >
                    <span>{icon}</span>
                    <span className="geo-tooltip">{label}</span>
                  </button>
                )
              })}
              
              <div style={{ width: '24px', height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />
              
              <button
                type="button"
                disabled={history.length === 0}
                onClick={handleUndo}
                className="geo-tool-btn"
                style={{ opacity: history.length === 0 ? 0.5 : 1, cursor: history.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                <span>↩️</span>
                <span className="geo-tooltip">Undo</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  let initialPoints = []
                  if (currentActivity) {
                    if (currentActivity.activity_id === 'act_3_1') {
                      initialPoints = [
                        { id: 'A', x: 140, y: 150, color: '#4caf50', isPreplaced: true },
                        { id: 'B', x: 360, y: 150, color: '#f44336', isPreplaced: true }
                      ]
                    } else if (currentActivity.activity_id === 'act_4_1') {
                      initialPoints = [
                        { id: 'A', x: 160, y: 150, color: '#4caf50', isPreplaced: true },
                        { id: 'B', x: 320, y: 150, color: '#ff9800', isPreplaced: true }
                      ]
                    }
                  }
                  setPoints(initialPoints)
                  setSegments([])
                  setLines([])
                  setRays([])
                  setSelectedPoints([])
                  setHistory([])
                  setValidationFeedback({ status: null, message: '' })
                }}
                className="geo-tool-btn"
                style={{ color: 'var(--clr-error)' }}
              >
                <span>🧹</span>
                <span className="geo-tooltip">Clear Canvas</span>
              </button>
            </div>
          </div>

          {/* Multiple Choice Question Section */}
          {currentActivity.question && (
            <div style={{
              margin: '0 auto 1.5rem',
              maxWidth: '800px',
              background: 'var(--clr-surface, #1d1d21)',
              border: '1px solid var(--clr-border, #444)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 0.75rem', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--clr-text)' }}>
                ❓ {currentActivity.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {currentActivity.options.map(opt => (
                  <label
                    key={opt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      background: selectedOption === opt ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
                      border: selectedOption === opt ? '1px solid var(--clr-accent, #4caf50)' : '1px solid var(--clr-border, #444)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: 'var(--clr-text)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="activity-quiz"
                      value={opt}
                      checked={selectedOption === opt}
                      onChange={() => setSelectedOption(opt)}
                      style={{ cursor: 'pointer', accentColor: 'var(--clr-accent, #4caf50)' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Challenge hint & validation response message banner */}
          {validationFeedback.message && (
            <div style={{
              margin: '0 auto 1.25rem',
              maxWidth: '800px',
              padding: '0.85rem 1.25rem',
              borderRadius: '6px',
              border: validationFeedback.status === 'success' ? '1px solid #4caf50' : '1px solid #ff9800',
              background: validationFeedback.status === 'success' ? 'rgba(76, 175, 80, 0.12)' : 'rgba(255, 152, 0, 0.1)',
              color: validationFeedback.status === 'success' ? '#81c784' : '#ffb74d',
              fontSize: '0.95rem',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {validationFeedback.message}
            </div>
          )}

          {showHint && currentActivity.hint && (
            <div style={{
              margin: '0 auto 1.25rem',
              maxWidth: '800px',
              padding: '0.85rem 1.25rem',
              borderRadius: '6px',
              border: '1px dashed var(--clr-accent)',
              background: 'rgba(76, 175, 80, 0.05)',
              color: 'var(--clr-text)',
              fontSize: '0.92rem',
              textAlign: 'left',
              lineHeight: '1.4'
            }}>
              💡 <strong>Hint:</strong> {currentActivity.hint}
            </div>
          )}

          {/* Bottom navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCheckDrawing}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--clr-accent, #4caf50)',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Submit Construction
            </button>

            {currentActivity.hint && (
              <button
                type="button"
                onClick={() => setShowHint(prev => !prev)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid var(--clr-border, #444)',
                  background: 'transparent',
                  color: 'var(--clr-text)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            )}
            
            <div style={{ flexBasis: '100%', height: '10px' }} /> {/* Wrap next/prev buttons row */}

            {(() => {
              const isFirstActivity = currentActivityIndex === 0
              const isLastActivity = currentActivityIndex === currentChapter.activities.length - 1
              const currentChapterIdx = chapters.findIndex(c => c.chapter_id === currentChapterId)
              const hasPrevChapter = currentChapterIdx > 0
              const hasNextChapter = currentChapterIdx < chapters.length - 1
              const isCurrentCompleted = completedActivities.includes(currentActivity.activity_id)

              // Previous Button Config
              let prevLabel = "◀ Previous Activity"
              let prevDisabled = isFirstActivity && !hasPrevChapter
              let handlePrev = () => {
                if (isFirstActivity) {
                  if (hasPrevChapter) {
                    const prevCh = chapters[currentChapterIdx - 1]
                    setCurrentChapterId(prevCh.chapter_id)
                    setCurrentActivityIndex(prevCh.activities.length - 1)
                  }
                } else {
                  setCurrentActivityIndex(prev => prev - 1)
                }
              }
              if (isFirstActivity && hasPrevChapter) {
                prevLabel = "◀ Previous Chapter"
              }

              // Next Button Config
              const isLastChapter = currentChapterIdx === chapters.length - 1
              let nextLabel = "Next Activity ▶"
              let nextDisabled = !isCurrentCompleted // default lock until completed
              let handleNext = () => {
                if (isLastActivity) {
                  if (hasNextChapter) {
                    setCurrentChapterId(chapters[currentChapterIdx + 1].chapter_id)
                    setCurrentActivityIndex(0)
                  } else if (isLastChapter && isCurrentCompleted) {
                    handleBackToHome()
                  }
                } else {
                  setCurrentActivityIndex(prev => prev + 1)
                }
              }
              if (isLastActivity) {
                if (hasNextChapter) {
                  nextLabel = "Next Chapter ▶"
                  // If they have completed all activities in the current chapter, allow going to next chapter
                  nextDisabled = !isCurrentCompleted
                } else if (isLastChapter) {
                  nextLabel = "Complete & Go Home 🏡"
                  nextDisabled = !isCurrentCompleted
                } else {
                  nextLabel = "Next Activity ▶"
                  nextDisabled = true // No next activity or chapter available
                }
              }

              return (
                <>
                  <button
                    type="button"
                    disabled={prevDisabled}
                    onClick={handlePrev}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid var(--clr-border, #444)',
                      background: 'transparent',
                      color: prevDisabled ? 'var(--clr-text-soft, #555)' : 'var(--clr-text)',
                      cursor: prevDisabled ? 'not-allowed' : 'pointer',
                      opacity: prevDisabled ? 0.5 : 1,
                      fontSize: '0.85rem'
                    }}
                  >
                    {prevLabel}
                  </button>

                  <button
                    type="button"
                    disabled={nextDisabled}
                    onClick={handleNext}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: nextLabel.includes("Complete") && !nextDisabled ? 'none' : '1px solid var(--clr-border, #444)',
                      background: nextLabel.includes("Complete") && !nextDisabled ? 'var(--clr-accent, #4caf50)' : 'transparent',
                      color: nextLabel.includes("Complete") && !nextDisabled ? '#fff' : (nextDisabled ? 'var(--clr-text-soft, #555)' : 'var(--clr-text)'),
                      cursor: nextDisabled ? 'not-allowed' : 'pointer',
                      opacity: nextDisabled ? 0.5 : 1,
                      fontSize: '0.85rem',
                      fontWeight: nextLabel.includes("Complete") ? 'bold' : 'normal'
                    }}
                  >
                    {nextLabel}
                  </button>
                </>
              )
            })()}
          </div>
        </div>

        {/* Global Progress Overview */}
        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--clr-text)' }}>Your Geometry Journey</h4>
          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
            You have completed <strong>{totalCompletedAll}</strong> out of <strong>{totalActivitiesAll}</strong> activities in total. Keep going!
          </p>
          <div style={{ width: '100%', height: '8px', background: 'var(--clr-border, #333)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${(totalCompletedAll / totalActivitiesAll) * 100}%`,
              height: '100%',
              background: 'var(--clr-accent, #4caf50)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </QuizLayout>
  )
}