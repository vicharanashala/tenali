import React, { useState, useEffect, useRef, useCallback } from 'react'
import ScribbleCanvas from './components/ScribbleCanvas'

const C = {
  bg: '#0b0e14', card: '#141820', surface: '#1c2028',
  accent: '#4dabf7', green: '#51cf66', red: '#ff6b6b',
  text: '#e8e8e8', muted: '#8b949e', border: '#2d333b'
}

const FONT = "'Segoe UI', system-ui, sans-serif"

/* ── Geometry helpers ────────────────────────────────────────────── */
function dist(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

function getAllPoints(elements) {
  const pts = []
  elements.forEach(el => {
    if (el.points) pts.push(...el.points)
  })
  return pts
}

function angleBetween(p1, vertex, p2) {
  const a = dist(p1, vertex)
  const b = dist(p2, vertex)
  const c = dist(p1, p2)
  if (a < 1e-6 || b < 1e-6) return 0
  const cos = (a * a + b * b - c * c) / (2 * a * b)
  return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI)
}

function lineThrough(p1, p2) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  if (Math.abs(dx) < 1e-6) return { slope: Infinity, intercept: p1.x }
  const slope = dy / dx
  return { slope, intercept: p1.y - slope * p1.x }
}

function fitLine(points) {
  const n = points.length
  if (n < 2) return null
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const p of points) { sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y }
  const denom = n * sxx - sx * sx
  if (Math.abs(denom) < 1e-10) return { slope: Infinity, intercept: sx / n }
  const slope = (n * sxy - sx * sy) / denom
  const intercept = (sy - slope * sx) / n
  return { slope, intercept }
}

function isLine(points, threshold = 0.15) {
  if (points.length < 4) return points.length > 1
  const line = fitLine(points)
  if (!line) return false
  if (line.slope === Infinity) {
    const x = line.intercept
    const err = points.reduce((s, p) => s + Math.abs(p.x - x), 0) / points.length
    return err < threshold * (Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)) + 1)
  }
  const err = points.reduce((s, p) => s + Math.abs(p.y - (line.slope * p.x + line.intercept)), 0) / points.length
  const range = Math.sqrt((points[0].x - points[points.length - 1].x) ** 2 + (points[0].y - points[points.length - 1].y) ** 2)
  return err < threshold * (range + 1)
}

function fitCircle(points) {
  const n = points.length
  if (n < 3) return null
  let sx = 0, sy = 0, sx2 = 0, sy2 = 0, sxy = 0, sx3 = 0, sy3 = 0, sx2y = 0, sxy2 = 0
  for (const p of points) {
    const x = p.x, y = p.y
    sx += x; sy += y; sx2 += x * x; sy2 += y * y; sxy += x * y
    sx3 += x * x * x; sy3 += y * y * y; sx2y += x * x * y; sxy2 += x * y * y
  }
  const A = n * sx2 - sx * sx
  const B = n * sxy - sx * sy
  const C2 = n * sx3 + n * sxy2 - (sx2 + sy2) * sx
  const D = n * sxy - sx * sy
  const E = n * sy2 - sy * sy
  const F = n * sy3 + n * sx2y - (sx2 + sy2) * sy
  const det = A * E - B * D
  if (Math.abs(det) < 1e-12) return null
  const cx = (C2 * E - B * F) / det
  const cy = (A * F - C2 * D) / det
  const r = Math.sqrt((sx2 + sy2 - 2 * cx * sx - 2 * cy * sy) / n + cx * cx + cy * cy)
  return { cx, cy, r }
}

function isCircle(points) {
  if (points.length < 10) return false
  const circle = fitCircle(points)
  if (!circle) return false
  const err = points.reduce((s, p) => s + Math.abs(dist(p, { x: circle.cx, y: circle.cy }) - circle.r), 0) / points.length
  return err / (circle.r + 1) < 0.2
}

function isClosed(points, threshold = 30) {
  if (points.length < 4) return false
  return dist(points[0], points[points.length - 1]) < threshold
}

function simplify(points, tolerance = 2) {
  if (points.length <= 2) return points
  const result = [points[0]]
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1]
    const d = dist(points[i], prev)
    if (d > tolerance) result.push(points[i])
  }
  result.push(points[points.length - 1])
  return result
}

function computeCorners(points, angleThreshold = 30, minDist = 15) {
  if (points.length < 3) return []
  const corners = [0]
  const simplified = simplify(points, 3)
  let i = 1
  while (i < simplified.length - 1) {
    const p0 = simplified[i - 1], p1 = simplified[i], p2 = simplified[i + 1]
    const d1 = dist(p0, p1), d2 = dist(p1, p2)
    if (d1 < minDist || d2 < minDist) { i++; continue }
    const angle = angleBetween(p0, p1, p2)
    if (angle < 180 - angleThreshold) {
      corners.push(i)
      i += 2
    } else {
      i++
    }
  }
  corners.push(simplified.length - 1)
  return corners
}

function countCorners(points, angleThreshold = 30) {
  if (points.length < 3) return 0
  let count = 0
  const simplified = simplify(points, 3)
  const n = simplified.length
  if (n < 3) return 0
  for (let i = 1; i < n - 1; i++) {
    const p0 = simplified[i - 1], p1 = simplified[i], p2 = simplified[i + 1]
    if (dist(p0, p1) < 10 || dist(p1, p2) < 10) continue
    const angle = angleBetween(p0, p1, p2)
    if (angle < 180 - angleThreshold) count++
  }
  return count
}

function getSideLengths(points, corners) {
  const simplified = simplify(points, 3)
  const idx = corners.length > 0 ? corners : [0, simplified.length - 1]
  const lengths = []
  for (let i = 1; i < idx.length; i++) {
    lengths.push(dist(simplified[idx[i - 1]], simplified[idx[i]]))
  }
  return lengths
}

function areSidesEqual(lengths, tolerance = 0.3) {
  if (lengths.length < 2) return false
  const avg = lengths.reduce((s, v) => s + v, 0) / lengths.length
  return lengths.every(l => Math.abs(l - avg) / (avg + 1) < tolerance)
}

function normalizeAngle(a) {
  return ((a % 360) + 360) % 360
}

function isVertical(points) {
  if (points.length < 2) return false
  const line = fitLine(points)
  if (!line) return false
  return Math.abs(line.slope) > 5
}

function isHorizontal(points) {
  if (points.length < 2) return false
  const line = fitLine(points)
  if (!line) return false
  return Math.abs(line.slope) < 0.2
}

function pathLength(points) {
  let len = 0
  for (let i = 1; i < points.length; i++) len += dist(points[i - 1], points[i])
  return len
}

function arcCoverage(points) {
  if (points.length < 5) return 0
  const circle = fitCircle(points)
  if (!circle) return 0
  const angles = points.map(p => {
    const a = Math.atan2(p.y - circle.cy, p.x - circle.cx) * (180 / Math.PI)
    return normalizeAngle(a)
  })
  const sorted = [...angles].sort((a, b) => a - b)
  let maxGap = 0
  for (let i = 1; i < sorted.length; i++) maxGap = Math.max(maxGap, sorted[i] - sorted[i - 1])
  maxGap = Math.max(maxGap, 360 - sorted[sorted.length - 1] + sorted[0])
  return 1 - maxGap / 360
}

function countIntersections(points) {
  let count = 0
  const simplified = simplify(points, 5)
  for (let i = 1; i < simplified.length - 2; i++) {
    for (let j = i + 2; j < simplified.length - 1; j++) {
      const a1 = simplified[i - 1], a2 = simplified[i]
      const b1 = simplified[j - 1], b2 = simplified[j]
      const denom = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x)
      if (Math.abs(denom) < 1e-8) continue
      const t = ((a1.x - b1.x) * (b1.y - b2.y) - (a1.y - b1.y) * (b1.x - b2.x)) / denom
      const u = -((a1.x - a2.x) * (a1.y - b1.y) - (a1.y - a2.y) * (a1.x - b1.x)) / denom
      if (t > 0 && t < 1 && u > 0 && u < 1) count++
    }
  }
  return count
}

/* ── Challenges ─────────────────────────────────────────────────── */
const CHALLENGES = {
  easy: [
    { id: 'line', label: 'Draw a straight line', hint: 'Draw a straight line from left to right', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 4) return { score: 10, feedback: 'Draw a longer line' }
      if (!isLine(pts, 0.12)) return { score: 30, feedback: 'That looks wobbly! Try to keep it straight' }
      const len = pathLength(pts)
      if (len < 100) return { score: 40, feedback: 'Draw a longer line' }
      return { score: Math.min(100, 60 + Math.round((1 - 0.12) * 400)), feedback: 'Good straight line!' }
    }},
    { id: 'circle', label: 'Draw a circle', hint: 'Draw a round circle', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 10) return { score: 10, feedback: 'Draw a complete circle' }
      if (!isClosed(pts, 40)) return { score: 20, feedback: 'Your circle is not closed' }
      const circle = fitCircle(pts)
      if (!circle) return { score: 15, feedback: 'Could not detect a circle shape' }
      const err = pts.reduce((s, p) => s + Math.abs(dist(p, { x: circle.cx, y: circle.cy }) - circle.r), 0) / pts.length
      const quality = Math.max(0, 1 - err / (circle.r + 1))
      return { score: Math.round(quality * 100), feedback: quality > 0.6 ? 'Great circle!' : 'Not quite round enough' }
    }},
    { id: 'square', label: 'Draw a square', hint: 'Draw 4 equal sides with right angles', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 10) return { score: 5, feedback: 'Draw more' }
      if (!isClosed(pts, 50)) return { score: 10, feedback: 'Close the shape' }
      const corners = computeCorners(pts, 25, 20)
      if (corners.length < 5) return { score: 15, feedback: `Found ${Math.max(0, corners.length - 1)} corners, need 4` }
      const sides = getSideLengths(pts, corners)
      if (sides.length < 4) return { score: 20, feedback: 'Need 4 sides' }
      const equal = areSidesEqual(sides, 0.35)
      const avgSide = sides.reduce((s, v) => s + v, 0) / sides.length
      const sideScore = equal ? 40 : Math.max(0, 40 - Math.round(sides.reduce((s, l) => s + Math.abs(l - avgSide) / (avgSide + 1), 0) / sides.length * 100))
      return { score: Math.min(100, 30 + sideScore), feedback: equal ? 'Good square!' : 'Sides are not equal' }
    }},
    { id: 'triangle', label: 'Draw a triangle', hint: 'Draw a 3-sided closed shape', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 8) return { score: 5, feedback: 'Draw more' }
      if (!isClosed(pts, 50)) return { score: 10, feedback: 'Close the shape' }
      const corners = computeCorners(pts, 25, 15)
      const nCorners = corners.length - 1
      if (nCorners < 2) return { score: 15, feedback: 'Can\'t detect 3 corners' }
      const sides = getSideLengths(pts, corners)
      if (sides.length < 2) return { score: 20, feedback: 'Need 3 sides' }
      const score = Math.min(100, 40 + Math.max(0, 60 - Math.abs(nCorners - 3) * 30))
      return { score, feedback: nCorners === 3 ? 'Good triangle!' : `Found ${nCorners} corners instead of 3` }
    }},
    { id: 'hline', label: 'Draw a horizontal line', hint: 'Draw a line from left to right, flat', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 4) return { score: 10, feedback: 'Draw a longer line' }
      if (!isLine(pts, 0.12)) return { score: 20, feedback: 'Not straight enough' }
      const line = fitLine(pts)
      if (!line) return { score: 10, feedback: 'Could not analyze' }
      const deviation = Math.abs(line.slope)
      if (deviation > 0.3) return { score: 30, feedback: `Line is tilted (${Math.round(Math.atan(deviation) * 180 / Math.PI)}° off)` }
      const quality = Math.max(0, 1 - deviation / 0.5)
      return { score: Math.round(50 + quality * 50), feedback: 'Good horizontal line!' }
    }},
    { id: 'vline', label: 'Draw a vertical line', hint: 'Draw a line from top to bottom, straight up', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 4) return { score: 10, feedback: 'Draw a longer line' }
      if (!isLine(pts, 0.12)) return { score: 20, feedback: 'Not straight enough' }
      const line = fitLine(pts)
      if (!line) return { score: 10, feedback: 'Could not analyze' }
      const deviation = Math.abs(line.slope) < 5 ? Math.abs(line.slope) : 1 / Math.abs(line.slope)
      const slopeVal = Math.abs(line.slope)
      if (slopeVal < 2 && slopeVal > 0.5) return { score: 30, feedback: 'Line is not vertical enough' }
      const quality = Math.max(0, 1 - (slopeVal < 1 ? slopeVal : 1 / slopeVal) / 0.3)
      return { score: Math.round(50 + quality * 50), feedback: 'Good vertical line!' }
    }}
  ],
  medium: [
    { id: 'rightangle', label: 'Draw a right angle', hint: 'Draw two lines meeting at 90°', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 6) return { score: 10, feedback: 'Draw more' }
      const corners = computeCorners(pts, 20, 15)
      const nCorners = corners.length - 1
      if (nCorners < 1) return { score: 15, feedback: 'Can\'t detect a corner' }
      const simplified = simplify(pts, 3)
      let bestDeviation = 90
      for (let i = 1; i < simplified.length - 1; i++) {
        const angle = angleBetween(simplified[i - 1], simplified[i], simplified[i + 1])
        const deviation = Math.abs(angle - 90)
        if (deviation < bestDeviation) bestDeviation = deviation
      }
      const score = Math.max(0, Math.round(100 - bestDeviation * 1.2))
      return { score, feedback: score >= 60 ? `Good right angle! (${Math.round(90 - bestDeviation)}°–${Math.round(90 + bestDeviation)}°)` : `Angle is off by ${Math.round(bestDeviation)}°` }
    }},
    { id: 'parallel', label: 'Draw two parallel lines', hint: 'Draw two lines that run side by side', validate: (el) => {
      const lines = el.filter(e => e.type === 'pen' && (e.points?.length || 0) > 3)
      if (lines.length < 2) return { score: 10, feedback: 'Draw two separate lines' }
      const slopes = lines.map(l => fitLine(l.points))
      if (slopes.some(s => !s)) return { score: 10, feedback: 'Could not analyze lines' }
      const s0 = slopes[0].slope
      const s1 = slopes[1].slope
      const diff = Math.abs(s0 - s1)
      if (s0 === Infinity && s1 === Infinity) {
        const interceptDiff = Math.abs(slopes[0].intercept - slopes[1].intercept)
        if (interceptDiff < 20) return { score: 20, feedback: 'Lines are too close' }
        return { score: 90, feedback: 'Good parallel lines!' }
      }
      const quality = Math.max(0, 1 - diff / 0.5)
      const interceptDiff = Math.abs(slopes[0].intercept - slopes[1].intercept)
      if (interceptDiff < 20) return { score: Math.round(quality * 60), feedback: 'Lines are too close together' }
      return { score: Math.round(quality * 100), feedback: quality > 0.6 ? 'Good parallel lines!' : 'Lines are not parallel enough' }
    }},
    { id: '45angle', label: 'Draw a 45° angle', hint: 'Draw two lines meeting at 45°', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 6) return { score: 10, feedback: 'Draw more' }
      const simplified = simplify(pts, 3)
      let bestDeviation = 45
      for (let i = 1; i < simplified.length - 1; i++) {
        if (dist(simplified[i - 1], simplified[i]) < 10 || dist(simplified[i], simplified[i + 1]) < 10) continue
        const angle = angleBetween(simplified[i - 1], simplified[i], simplified[i + 1])
        const deviation = Math.abs(angle - 45)
        if (deviation < bestDeviation) bestDeviation = deviation
      }
      const score = Math.max(0, Math.round(100 - bestDeviation * 1.5))
      return { score, feedback: score >= 60 ? 'Good 45° angle!' : `Off by ${Math.round(bestDeviation)}°` }
    }},
    { id: 'equilateral', label: 'Draw an equilateral triangle', hint: '3 equal sides, 60° corners', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 10) return { score: 5, feedback: 'Draw more' }
      if (!isClosed(pts, 50)) return { score: 10, feedback: 'Close the shape' }
      const corners = computeCorners(pts, 25, 15)
      const nCorners = corners.length - 1
      if (nCorners < 3) return { score: 15, feedback: 'Need 3 corners' }
      const sides = getSideLengths(pts, corners)
      if (sides.length < 3) return { score: 20, feedback: 'Need 3 sides' }
      const equalScore = areSidesEqual(sides, 0.25) ? 40 : 0
      const avg = sides.reduce((s, v) => s + v, 0) / sides.length
      const sideScore = equalScore > 0 ? 40 : Math.max(0, 40 - Math.round(sides.reduce((s, l) => s + Math.abs(l - avg) / (avg + 1), 0) / 3 * 80))
      const simplified = simplify(pts, 3)
      const idx = corners
      let angleScore = 0
      for (let i = 1; i < idx.length - 1; i++) {
        const angle = angleBetween(simplified[idx[i - 1]], simplified[idx[i]], simplified[idx[i + 1]])
        angleScore += Math.max(0, 60 - Math.abs(angle - 60) * 1.5)
      }
      angleScore = idx.length > 2 ? angleScore / (idx.length - 2) : 0
      const score = Math.min(100, Math.round(20 + sideScore * 0.5 + angleScore * 0.5))
      return { score, feedback: score >= 60 ? 'Good equilateral triangle!' : 'Sides or angles are off' }
    }},
    { id: 'rectangle', label: 'Draw a rectangle', hint: '4 sides, opposite sides equal', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 10) return { score: 5, feedback: 'Draw more' }
      if (!isClosed(pts, 50)) return { score: 10, feedback: 'Close the shape' }
      const corners = computeCorners(pts, 25, 15)
      const nCorners = corners.length - 1
      if (nCorners < 4) return { score: 15, feedback: `Found ${nCorners} corners, need 4` }
      const sides = getSideLengths(pts, corners)
      if (sides.length < 4) return { score: 15, feedback: 'Need 4 sides' }
      const opp1 = Math.abs(sides[0] - sides[2]) / ((sides[0] + sides[2]) / 2 + 1)
      const opp2 = Math.abs(sides[1] - sides[3]) / ((sides[1] + sides[3]) / 2 + 1)
      const oppScore = opp1 < 0.3 && opp2 < 0.3 ? 40 : Math.max(0, 40 - Math.round((opp1 + opp2) * 50))
      const simplified = simplify(pts, 3)
      const idx = corners
      let angleScore = 0
      for (let i = 1; i < idx.length - 1; i++) {
        const angle = angleBetween(simplified[idx[i - 1]], simplified[idx[i]], simplified[idx[i + 1]])
        angleScore += Math.max(0, 30 - Math.abs(angle - 90))
      }
      angleScore = idx.length > 2 ? Math.min(30, angleScore / (idx.length - 2)) : 0
      const score = Math.min(100, Math.round(20 + oppScore + angleScore))
      return { score, feedback: score >= 60 ? 'Good rectangle!' : 'Opposite sides not equal or angles off' }
    }},
    { id: 'perpendicular', label: 'Draw a perpendicular line to the existing line', hint: 'Draw a line that makes a 90° angle', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 4) return { score: 10, feedback: 'Draw a line' }
      const line = fitLine(pts)
      if (!line) return { score: 10, feedback: 'Could not analyze' }
      const angle = Math.atan2(line.slope === Infinity ? 1 : line.slope, 1) * (180 / Math.PI)
      const deviation = Math.abs(normalizeAngle(angle) - 90)
      const score = Math.max(0, Math.round(100 - deviation * 2))
      return { score, feedback: score >= 60 ? 'Good perpendicular!' : `Line is ${Math.round(deviation)}° off from perpendicular` }
    }}
  ],
  hard: [
    { id: 'threequarter', label: 'Draw ¾ of a circle', hint: 'Draw an arc covering 270°', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 10) return { score: 10, feedback: 'Draw a longer arc' }
      const coverage = arcCoverage(pts)
      if (coverage < 0.4) return { score: 15, feedback: 'Arc is too small' }
      const circle = fitCircle(pts)
      if (!circle) return { score: 15, feedback: 'Not circular enough' }
      const err = pts.reduce((s, p) => s + Math.abs(dist(p, { x: circle.cx, y: circle.cy }) - circle.r), 0) / pts.length
      const circularity = Math.max(0, 1 - err / (circle.r + 1))
      const target = 0.75
      const coverageScore = Math.max(0, 100 - Math.abs(coverage - target) * 120)
      const quality = Math.round(coverageScore * 0.6 + circularity * 40)
      return { score: Math.min(100, quality), feedback: quality >= 60 ? 'Good ¾ circle!' : `Covered ${Math.round(coverage * 100)}% instead of 75%` }
    }},
    { id: 'bisectors', label: 'Draw a pair of perpendicular bisectors', hint: 'Two perpendicular lines crossing at midpoints', validate: (el) => {
      const lines = el.filter(e => e.type === 'pen' && (e.points?.length || 0) > 3)
      if (lines.length < 2) return { score: 10, feedback: 'Draw two lines' }
      const s1 = fitLine(lines[0].points)
      const s2 = fitLine(lines[1].points)
      if (!s1 || !s2) return { score: 10, feedback: 'Could not analyze lines' }
      const m1 = s1.slope, m2 = s2.slope
      let angle
      if (m1 === Infinity && m2 === Infinity) angle = 0
      else if (m1 === Infinity) angle = Math.abs(Math.PI / 2 - Math.atan(m2))
      else if (m2 === Infinity) angle = Math.abs(Math.PI / 2 - Math.atan(m1))
      else angle = Math.abs(Math.atan((m2 - m1) / (1 + m1 * m2)))
      const angleDeg = Math.min(angle, Math.PI - angle) * (180 / Math.PI)
      const perpScore = Math.max(0, 100 - Math.abs(angleDeg - 90) * 2)
      const score = Math.min(100, Math.round(perpScore))
      return { score, feedback: score >= 60 ? 'Good perpendicular bisectors!' : `Lines are ${Math.round(angleDeg)}° apart instead of 90°` }
    }},
    { id: 'hexagon', label: 'Draw a hexagon', hint: '6 equal sides, closed shape', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 15) return { score: 5, feedback: 'Draw more' }
      if (!isClosed(pts, 50)) return { score: 10, feedback: 'Close the shape' }
      const corners = computeCorners(pts, 25, 15)
      const nCorners = corners.length - 1
      if (nCorners < 4) return { score: 15, feedback: `Found ${nCorners} corners, need 6` }
      const sides = getSideLengths(pts, corners)
      const equal = areSidesEqual(sides, 0.35)
      const equalScore = equal ? 30 : 0
      const countScore = Math.max(0, 40 - Math.abs(nCorners - 6) * 20)
      const score = Math.min(100, Math.round(20 + countScore + equalScore))
      return { score, feedback: nCorners === 6 ? (equal ? 'Great hexagon!' : '6 sides but not equal') : `Found ${nCorners} sides, need 6` }
    }},
    { id: 'righttriangle', label: 'Draw a right-angled triangle', hint: 'Triangle with one 90° corner', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 10) return { score: 5, feedback: 'Draw more' }
      if (!isClosed(pts, 50)) return { score: 10, feedback: 'Close the shape' }
      const corners = computeCorners(pts, 25, 15)
      const nCorners = corners.length - 1
      if (nCorners < 3) return { score: 15, feedback: 'Need 3 corners' }
      const simplified = simplify(pts, 3)
      const idx = corners
      let minDeviation = 90
      for (let i = 1; i < idx.length - 1; i++) {
        const angle = angleBetween(simplified[idx[i - 1]], simplified[idx[i]], simplified[idx[i + 1]])
        minDeviation = Math.min(minDeviation, Math.abs(angle - 90))
      }
      const angleScore = Math.max(0, 80 - minDeviation * 1.5)
      const score = Math.min(100, Math.round(20 + angleScore))
      return { score, feedback: score >= 60 ? 'Good right triangle!' : `Nearest angle is ${Math.round(90 - minDeviation)}°–${Math.round(90 + minDeviation)}°` }
    }},
    { id: 'concentric', label: 'Draw two concentric circles', hint: 'Two circles sharing the same center', validate: (el) => {
      const circles = el.filter(e => e.type === 'pen' && (e.points?.length || 0) > 8)
      if (circles.length < 2) return { score: 10, feedback: 'Draw two separate circles' }
      const fits = circles.map(c => fitCircle(c.points))
      if (fits.some(f => !f)) return { score: 10, feedback: 'Could not fit circles' }
      const c1 = fits[0], c2 = fits[1]
      const centerDist = dist({ x: c1.cx, y: c1.cy }, { x: c2.cx, y: c2.cy })
      const avgR = (c1.r + c2.r) / 2
      const centerScore = Math.max(0, 100 - centerDist / (avgR + 1) * 100)
      const rDiff = Math.abs(c1.r - c2.r)
      if (rDiff < 20) return { score: Math.round(centerScore * 0.5), feedback: 'Circles are too similar in size' }
      const score = Math.round(centerScore)
      return { score, feedback: score >= 60 ? 'Good concentric circles!' : `Centers are ${Math.round(centerDist)}px apart` }
    }},
    { id: 'pentagon', label: 'Draw a polygon with 5 equal sides', hint: '5-sided shape with equal sides', validate: (el) => {
      const pts = getAllPoints([el])
      if (pts.length < 15) return { score: 5, feedback: 'Draw more' }
      if (!isClosed(pts, 50)) return { score: 10, feedback: 'Close the shape' }
      const corners = computeCorners(pts, 25, 15)
      const nCorners = corners.length - 1
      if (nCorners < 3) return { score: 15, feedback: `Found ${nCorners} corners, need 5` }
      const sides = getSideLengths(pts, corners)
      const equal = areSidesEqual(sides, 0.3)
      const equalScore = equal ? 35 : 0
      const countScore = Math.max(0, 50 - Math.abs(nCorners - 5) * 25)
      const score = Math.min(100, Math.round(15 + countScore + equalScore))
      return { score, feedback: nCorners === 5 ? (equal ? 'Perfect pentagon!' : '5 sides but not equal') : `Found ${nCorners} sides, need 5` }
    }}
  ]
}

function getRandomChallenge(difficulty, excludeIds = []) {
  const pool = CHALLENGES[difficulty].filter(c => !excludeIds.includes(c.id))
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

/* ── Screens ─────────────────────────────────────────────────────── */
function SetupScreen({ difficulty, setDifficulty, questionCount, setQuestionCount, onStart }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 32 }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: C.text }}>Scribble Guess</div>
      <div style={{ fontSize: 15, color: C.muted, textAlign: 'center', maxWidth: 360 }}>Draw mathematical shapes and get scored on how well you draw them!</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: C.card, borderRadius: 12, padding: 28, border: `1px solid ${C.border}`, width: 340 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Difficulty</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['easy', 'medium', 'hard'].map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: `2px solid ${difficulty === d ? C.accent : C.border}`,
                background: difficulty === d ? C.accent + '22' : 'transparent', color: difficulty === d ? C.accent : C.muted,
                cursor: 'pointer', fontSize: 13, fontWeight: difficulty === d ? 700 : 400,
                textTransform: 'capitalize', transition: 'all 0.2s'
              }}
            >{d}</button>
          ))}
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8 }}>Questions</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[5, 10, 15, 20].map(n => (
            <button key={n} onClick={() => setQuestionCount(n)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: `2px solid ${questionCount === n ? C.accent : C.border}`,
                background: questionCount === n ? C.accent + '22' : 'transparent', color: questionCount === n ? C.accent : C.muted,
                cursor: 'pointer', fontSize: 13, fontWeight: questionCount === n ? 700 : 400,
                transition: 'all 0.2s'
              }}
            >{n}</button>
          ))}
        </div>

        <button onClick={onStart}
          style={{
            marginTop: 16, padding: '12px 0', borderRadius: 8, border: 'none',
            background: C.accent, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >Start Drawing!</button>
      </div>
    </div>
  )
}

function ResultScreen({ score, total, correct, accuracy, bestStreak, time, difficulty, challenges, onRestart, onBack }) {
  const passed = score >= 60
  const pct = Math.round(accuracy)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 28 }}>
      <div style={{ fontSize: 48 }}>{passed ? '🎉' : '💪'}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{passed ? 'Great work!' : 'Keep practicing!'}</div>
      <div style={{ fontSize: 15, color: C.muted }}>You completed {total} questions at {difficulty} difficulty</div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <StatBox label="Score" value={`${score}`} color={passed ? C.green : C.red} />
        <StatBox label="Correct" value={`${correct}/${total}`} color={C.accent} />
        <StatBox label="Accuracy" value={`${pct}%`} color={pct >= 70 ? C.green : C.red} />
        <StatBox label="Best Streak" value={`${bestStreak}`} color={C.accent} />
        <StatBox label="Time" value={formatTime(time)} color={C.muted} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onRestart}
          style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >Play Again</button>
        <button onClick={onBack}
          style={{ padding: '12px 28px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 15, cursor: 'pointer' }}
        >Back</button>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, padding: '16px 24px', border: `1px solid ${C.border}`, textAlign: 'center', minWidth: 100 }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ── Main App ────────────────────────────────────────────────────── */
export default function ScribbleGuessApp({ onBack }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('setup')
  const [difficulty, setDifficulty] = useState('easy')
  const [questionCount, setQuestionCount] = useState(10)

  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [checkedResult, setCheckedResult] = useState(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  const currentChallenge = questions[currentIdx]

  /* Timer */
  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase, startTime])

  function startGame() {
    const qs = []
    const used = []
    for (let i = 0; i < questionCount; i++) {
      const ch = getRandomChallenge(difficulty, used)
      if (ch) { qs.push(ch); used.push(ch.id) }
    }
    setQuestions(qs)
    setCurrentIdx(0)
    setResults([])
    setCheckedResult(null)
    setStreak(0)
    setBestStreak(0)
    setStartTime(Date.now())
    setElapsed(0)
    setPhase('playing')
  }

  function handleCheck() {
    const el = canvasRef.current?.getElements() || []
    const challenge = currentChallenge
    const result = challenge.validate(el)
    setCheckedResult(result)

    const passed = result.score >= 60
    const newStreak = passed ? streak + 1 : 0
    setStreak(newStreak)
    if (newStreak > bestStreak) setBestStreak(newStreak)

    setResults(prev => [...prev, { challenge: challenge.id, score: result.score, passed, feedback: result.feedback }])
  }

  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      setPhase('finished')
      return
    }
    setCurrentIdx(prev => prev + 1)
    setCheckedResult(null)
    canvasRef.current?.clearAll()
  }

  const score = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0
  const correct = results.filter(r => r.passed).length
  const total = results.length
  const accuracy = total > 0 ? (correct / total) * 100 : 0

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: '100vh', color: C.text, padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack}
          style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 13 }}
        >← Back</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, flex: 1 }}>Scribble Guess</div>
        {phase === 'playing' && (
          <>
            <div style={{ fontSize: 13, color: C.muted }}>
              {currentIdx + 1} / {questions.length}
            </div>
            <div style={{ padding: '3px 10px', borderRadius: 6, background: C.surface, color: C.accent, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
              {difficulty}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              ⏱ {formatTime(elapsed)}
            </div>
            <div style={{ fontSize: 13, color: C.green }}>
              🔥 {streak}
            </div>
          </>
        )}
      </div>

      {phase === 'setup' && (
        <SetupScreen
          difficulty={difficulty} setDifficulty={setDifficulty}
          questionCount={questionCount} setQuestionCount={setQuestionCount}
          onStart={startGame}
        />
      )}

      {phase === 'playing' && currentChallenge && (
        <PlayingScreen
          challenge={currentChallenge}
          checkedResult={checkedResult}
          canvasRef={canvasRef}
          onCheck={handleCheck}
          onNext={handleNext}
          currentIdx={currentIdx}
          total={questions.length}
          score={score}
          correct={correct}
          totalAnswered={total}
          difficulty={difficulty}
        />
      )}

      {phase === 'finished' && (
        <ResultScreen
          score={score} total={total} correct={correct}
          accuracy={accuracy} bestStreak={bestStreak} time={elapsed}
          difficulty={difficulty}
          challenges={questions}
          onRestart={startGame}
          onBack={onBack}
        />
      )}
    </div>
  )
}

function PlayingScreen({ challenge, checkedResult, canvasRef, onCheck, onNext, currentIdx, total, score, correct, totalAnswered, difficulty }) {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {/* Left: canvas area */}
      <div style={{ flex: '1 1 650px', maxWidth: 700 }}>
        <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>{challenge.label}</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>💡 {challenge.hint}</div>

          <ScribbleCanvas ref={canvasRef} width={600} height={400} showGrid={false}
            style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
            {!checkedResult ? (
              <button onClick={onCheck}
                style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >Check ✨</button>
            ) : (
              <>
                <ResultBadge passed={checkedResult.score >= 60} score={checkedResult.score} feedback={checkedResult.feedback} />
                <button onClick={onNext}
                  style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: checkedResult.score >= 60 ? C.green : C.red, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                >{currentIdx + 1 >= total ? 'Finish' : 'Next →'}</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: stats */}
      <div style={{ flex: '0 0 200px' }}>
        <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Progress</div>
          <ProgressBar value={currentIdx + 1} max={total} color={C.accent} />
          <div style={{ fontSize: 13, color: C.text }}>Question {currentIdx + 1} of {total}</div>

          <div style={{ height: 1, background: C.border }} />

          <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Score</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: score >= 60 ? C.green : C.red }}>{score || '-'}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.muted }}>Correct</span>
            <span style={{ color: C.green }}>{correct}/{totalAnswered}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.muted }}>Accuracy</span>
            <span style={{ color: C.accent }}>{totalAnswered > 0 ? Math.round(correct / totalAnswered * 100) : 0}%</span>
          </div>

          <div style={{ height: 1, background: C.border }} />

          <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Difficulty</div>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: C.surface, color: C.accent, fontSize: 12, fontWeight: 600, textAlign: 'center', textTransform: 'capitalize' }}>{difficulty}</div>
        </div>
      </div>
    </div>
  )
}

function ResultBadge({ passed, score, feedback }) {
  return (
    <div style={{
      padding: '8px 16px', borderRadius: 8,
      background: passed ? C.green + '22' : C.red + '22',
      border: `1px solid ${passed ? C.green : C.red}`,
      color: passed ? C.green : C.red, fontSize: 14, fontWeight: 600
    }}>
      <span>{passed ? '✅' : '❌'} {feedback} (Score: {score})</span>
    </div>
  )
}

function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ width: '100%', height: 6, background: C.surface, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
    </div>
  )
}
