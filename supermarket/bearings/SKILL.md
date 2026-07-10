# Bearings — Formal Specification

## 1. Overview

**Bearings** teaches three-figure bearing notation, compass directions, back bearings, and bearing calculations using trigonometry. Students work with navigation, bearings from coordinates, and distance components.

**Target Grade Level:** GCSE Mathematics (ages 14+)

**Key Concepts:**
- Three-figure bearings (000° to 359°)
- Compass directions: N (000°), E (090°), S (180°), W (270°)
- Back bearing: reciprocal bearing = (original + 180°) mod 360°
- Bearing from coordinates: bearing = arctan(Δx/Δy) measured clockwise from North
- Distance components: east = distance × sin(bearing), north = distance × cos(bearing)

## 2. Component Specification

**Component Name:** `BearingsApp`

**Factory:** Created via `makeQuizApp()` with:
```javascript
{
  title: 'Bearings',
  subtitle: 'Three-figure bearings',
  apiPath: 'bearings-api',
  diffLabels: { easy: 'Easy — Compass', medium: 'Medium — Back bearing', hard: 'Hard — From coords', extrahard: 'Extra Hard — Components' },
  placeholders: 'e.g. 045 or 270'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Compass | N, E, S, W, NE, SE, SW, NW | 000, 090, 180, 270, 045, 135, 225, 315 |
| **Medium** | Back bearing | Bearing A→B is 120°, find B→A | 300° |
| **Hard** | From coordinates | B is 5 units E, 8 units N of A. Bearing? | 032° |
| **Extra Hard** | Distance component | Walk 50m on bearing 045°. Distance east? (1 d.p.) | 35.4m |

## 4. API Endpoints

### GET /bearings-api/question

**Easy — Compass:**
```json
{ "type": "compass", "prompt": "What is the three-figure bearing of North-East?", "answer": 45, "display": "045" }
```

**Medium — Back Bearing:**
```json
{ "type": "back_bearing", "prompt": "The bearing from A to B is 120°. Find the bearing from B to A.", "answer": 300, "display": "300" }
```

**Hard — From Coordinates:**
```json
{ "type": "from_coords", "prompt": "A is at origin. B is 5 units East and 8 units North. Bearing of B from A?", "answer": 32, "display": "032" }
```

**Extra Hard — Distance Component:**
```json
{ "type": "distance_component", "prompt": "Walking 50m on bearing 045°. How far East? (1 d.p.)", "answer": 35.4, "display": "35.4" }
```

### POST /bearings-api/check

```
userStr = userAnswer.replace(/[°\s]/g, '').replace(/−/g, '-')
userNum = parseFloat(userStr)
correct = |userNum - expected| < 1.0  (±1° tolerance)
```

## 5. Question Generation Algorithm

### Easy — Compass
```
dirs = [
  { name: 'North', bearing: 000 }, { name: 'East', bearing: 090 },
  { name: 'South', bearing: 180 }, { name: 'West', bearing: 270 },
  { name: 'North-East', bearing: 045 }, { name: 'South-East', bearing: 135 },
  { name: 'South-West', bearing: 225 }, { name: 'North-West', bearing: 315 }
]
d = triPick(dirs)
prompt = "What is the three-figure bearing of {d.name}?"
answer = d.bearing
display = String(d.bearing).padStart(3, '0')
```

### Medium — Back Bearing
```
bearing = triRand(0, 359)
back = (bearing + 180) % 360
fmtB = (b) => String(b).padStart(3, '0')
prompt = "The bearing from A to B is {fmtB(bearing)}°. Find the bearing from B to A."
answer = back
display = fmtB(back)
```

### Hard — From Coordinates
```
dx = triRand(-10, 10), dy = triRand(-10, 10)
if dx == 0 && dy == 0: dx = 1

// Bearing = angle measured clockwise from North
angle = atan2(dx, dy) * 180 / π
if angle < 0: angle += 360
bearing = round(angle)

fmtB = (b) => String(b).padStart(3, '0')
prompt = "A is at origin. B is {abs(dx)} units {dx>=0 ? 'East' : 'West'} and {abs(dy)} units {dy>=0 ? 'North' : 'South'}. Bearing of B from A?"
answer = bearing
display = fmtB(bearing)
```

### Extra Hard — Distance Component
```
bearing = triRand(0, 359)
distance = triRand(5, 50)
rad = bearing * π / 180
east = round(distance * sin(rad) * 10) / 10

fmtB = (b) => String(b).padStart(3, '0')
prompt = "Walking {distance}m on bearing {fmtB(bearing)}°. How far East? (1 d.p.)"
answer = east
display = String(east)
```

## 6. Registration

**allApps Key:** `bearings`
**modeMap:** `BearingsApp`
**CUSTOM_PUZZLES:** `{ key: 'bearings', name: 'Bearings' }`
**apiMap:** `bearings: 'bearings-api'`
**Factory (App.jsx 3370–3374):**
```javascript
const BearingsApp = makeQuizApp({
  title: 'Bearings',
  subtitle: 'Three-figure bearings',
  apiPath: 'bearings-api',
  diffLabels: { easy: 'Easy — Compass', medium: 'Medium — Back bearing', hard: 'Hard — From coords', extrahard: 'Extra Hard — Components' },
  placeholders: 'e.g. 045 or 270'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong. Easy < 0.75, medium 0.75–1.5, hard 1.75–2.5, extrahard 2.75+.
