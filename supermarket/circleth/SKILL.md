# Circle Theorems — Formal Specification

## 1. Overview

**Circle Theorems** teaches fundamental geometric properties of circles: angles in semicircles, angles at the centre and circumference, cyclic quadrilaterals, and tangent properties. Students prove and apply these theorems to solve geometric problems.

**Target Grade Level:** GCSE Mathematics (ages 14+)

**Key Concepts:**
- Angle in a semicircle = 90° (Thales' theorem)
- Angle at centre = 2 × angle at circumference (subtended by same arc)
- Angles in the same segment are equal
- Opposite angles in cyclic quadrilateral sum to 180°
- Tangent perpendicular to radius
- Alternate segment theorem: angle between tangent and chord = angle in alternate segment

## 2. Component Specification

**Component Name:** `CircleThApp`

**Factory:** Created via `makeQuizApp()` with:
```javascript
{
  title: 'Circle Theorems',
  subtitle: 'Angles, tangents, cyclic quads',
  apiPath: 'circle-api',
  diffLabels: { easy: 'Easy — Semicircle', medium: 'Medium — Centre/Circum', hard: 'Hard — Cyclic quad', extrahard: 'Extra Hard — Tangent' },
  placeholders: 'e.g. 45'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Angle in semicircle | Triangle inscribed in semicircle, one angle 35°, find other | 55° |
| **Medium** | Centre vs circumference | Angle at circumference 30°, find angle at centre | 60° |
| **Medium** | Circumference vs centre | Angle at centre 80°, find angle at circumference | 40° |
| **Hard** | Cyclic quadrilateral | Angle A = 65°, find opposite angle C | 115° |
| **Extra Hard** | Tangent & radius | Angle between tangent and chord 50°, find angle in alternate segment | 50° |
| **Extra Hard** | Alternate segment | Angle between tangent and chord 40°, angle in alternate segment = ? | 40° |

## 4. API Endpoints

### GET /circle-api/question

**Easy — Semicircle:**
```json
{ "type": "semicircle", "prompt": "Triangle inscribed in semicircle. One angle at circumference = 35°. Find the other angle at circumference.", "answer": 55, "display": "55°" }
```

**Medium — Centre/Circumference:**
```json
{ "type": "centre_circum", "prompt": "Angle at circumference = 30°. Find the angle at the centre subtended by the same arc.", "answer": 60, "display": "60°" }
```

**Hard — Cyclic Quadrilateral:**
```json
{ "type": "cyclic", "prompt": "Cyclic quadrilateral ABCD. Angle A = 65°. Find angle C.", "answer": 115, "display": "115°" }
```

**Extra Hard — Tangent/Alternate Segment:**
```json
{ "type": "tangent", "prompt": "Tangent meets radius at point P. Angle between tangent and chord = 50°. Find the angle between radius and chord.", "answer": 40, "display": "40°" }
```

### POST /circle-api/check

```
userNum = parseFloat(userStr.replace(/[°\s]/g, ''))
correct = |userNum - expected| < 0.5
```

## 5. Question Generation Algorithm

### Easy — Angle in Semicircle
```
a = triRand(20, 70)
b = 90 - a
prompt = "Triangle inscribed in semicircle. One angle at circumference = {a}°. Find the other angle at circumference."
answer = b
display = "{b}°"
type = 'semicircle'
```

### Medium — Angle at Centre vs Circumference
```
circumAngle = triRand(20, 80)
centreAngle = 2 * circumAngle
subtype = triPick(['find_centre', 'find_circum'])

if subtype === 'find_centre':
  prompt = "Angle at circumference = {circumAngle}°. Find the angle at the centre subtended by the same arc."
  answer = centreAngle
else:
  prompt = "Angle at centre = {centreAngle}°. Find the angle at the circumference subtended by the same arc."
  answer = circumAngle

display = "{answer}°"
type = 'centre_circum'
```

### Hard — Cyclic Quadrilateral
```
a = triRand(40, 140)
c = 180 - a
b = triRand(40, 140)
d = 180 - b
subtype = triPick(['find_opp_a', 'find_opp_b'])

if subtype === 'find_opp_a':
  prompt = "Cyclic quadrilateral ABCD. Angle A = {a}°. Find angle C."
  answer = c
else:
  prompt = "Cyclic quadrilateral ABCD. Angle B = {b}°. Find angle D."
  answer = d

display = "{answer}°"
type = 'cyclic'
```

### Extra Hard — Tangent/Alternate Segment
```
subtype = triPick(['tangent_radius', 'alternate_segment'])

if subtype === 'tangent_radius':
  angle = triRand(15, 75)
  answer = 90 - angle
  prompt = "Tangent meets radius at point P. Angle between tangent and chord = {angle}°. Find the angle between radius and chord."
else:
  angle = triRand(20, 80)
  prompt = "Alternate segment theorem: angle between tangent and chord = {angle}°. Find the angle in the alternate segment."
  answer = angle

display = "{answer}°"
type = (subtype === 'tangent_radius') ? 'tangent' : 'alt_segment'
```

## 6. Registration

**allApps Key:** `circleth`
**modeMap:** `CircleThApp`
**CUSTOM_PUZZLES:** `{ key: 'circleth', name: 'Circle Theorems' }`
**apiMap:** `circleth: 'circle-api'`
**Factory (App.jsx 3394–3398):**
```javascript
const CircleThApp = makeQuizApp({
  title: 'Circle Theorems',
  subtitle: 'Angles, tangents, cyclic quads',
  apiPath: 'circle-api',
  diffLabels: { easy: 'Easy — Semicircle', medium: 'Medium — Centre/Circum', hard: 'Hard — Cyclic quad', extrahard: 'Extra Hard — Tangent' },
  placeholders: 'e.g. 45'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong.

Difficulty transitions: score < 0.75 = easy, 0.75–1.5 = medium, 1.75–2.5 = hard, 2.75+ = extrahard.

**Visual Feedback:** Gradient progress bar, real-time level labels and colors (easy #4caf50, medium #ff9800, hard #f44336, extrahard #9c27b0).
