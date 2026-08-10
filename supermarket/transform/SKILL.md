# Transformations — Formal Specification

## 1. Overview

**Transformations** teaches geometric transformations of 2D points: reflections, translations, rotations, and enlargements. Students identify transformation types and calculate image coordinates.

**Target Grade Level:** GCSE Mathematics (ages 14+)

**Key Concepts:**
- Reflection: mirror images across axes or lines
- Translation: shift by vector
- Rotation: anticlockwise rotations (90°, 180°, 270°) about origin
- Enlargement: scale by factor from center

## 2. Component Specification

**Component Name:** `TransformApp`

**Factory:** Created via `makeQuizApp()` with:
```javascript
{
  title: 'Transformations',
  subtitle: 'Reflect, translate, rotate, enlarge',
  apiPath: 'transform-api',
  diffLabels: { easy: 'Easy — Reflect', medium: 'Medium — Translate', hard: 'Hard — Rotate', extrahard: 'Extra Hard — Enlarge' },
  placeholders: 'e.g. (-3, 4)'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Reflect x-axis | (3, 2) reflected in x-axis | (3, -2) |
| **Easy** | Reflect y-axis | (3, 2) reflected in y-axis | (-3, 2) |
| **Medium** | Translate | (2, 3) translated by (1, -2) | (3, 1) |
| **Hard** | Rotate 90° | (2, 3) rotated 90° anticlockwise | (-3, 2) |
| **Hard** | Rotate 180° | (2, 3) rotated 180° | (-2, -3) |
| **Extra Hard** | Enlarge scale 2 | (3, 2) enlarged by scale factor 2 | (6, 4) |
| **Extra Hard** | Enlarge scale -1 | (3, 2) enlarged by scale factor -1 | (-3, -2) |

## 4. API Endpoints

### GET /transform-api/question

**Easy — Reflection:**
```json
{ "type": "reflect", "prompt": "Reflect (3, 2) in the x-axis", "ansX": 3, "ansY": -2, "display": "(3, -2)" }
```

**Medium — Translation:**
```json
{ "type": "translate", "prompt": "Translate (2, 3) by vector (1, -2)", "ansX": 3, "ansY": 1, "display": "(3, 1)" }
```

**Hard — Rotation:**
```json
{ "type": "rotate", "prompt": "Rotate (2, 3) by 90° anticlockwise about the origin", "ansX": -3, "ansY": 2, "display": "(-3, 2)" }
```

**Extra Hard — Enlargement:**
```json
{ "type": "enlarge", "prompt": "Enlarge (3, 2) by scale factor 2 from the origin", "ansX": 6, "ansY": 4, "display": "(6, 4)" }
```

### POST /transform-api/check

```
Parse (x, y) from user answer
Correct if both coordinates match exactly
```

## 5. Question Generation Algorithm

### Easy — Reflection
```
x = triRand(-8, 8), y = triRand(-8, 8)
axis = triPick(['x-axis', 'y-axis'])
ansX = (axis == 'y-axis') ? -x : x
ansY = (axis == 'x-axis') ? -y : y
prompt = "Reflect ({x}, {y}) in the {axis}"
```

### Medium — Translation
```
x = triRand(-8, 8), y = triRand(-8, 8)
dx = triRand(-6, 6), dy = triRand(-6, 6)
prompt = "Translate ({x}, {y}) by vector ({dx}, {dy})"
ansX = x + dx, ansY = y + dy
```

### Hard — Rotation
```
x = triRand(-8, 8), y = triRand(-8, 8)
angle = triPick([90, 180, 270])
if angle == 90: ansX = -y, ansY = x      // 90° anticlockwise
else if angle == 180: ansX = -x, ansY = -y
else: ansX = y, ansY = -x                // 270° anticlockwise
prompt = "Rotate ({x}, {y}) by {angle}° anticlockwise about the origin"
```

### Extra Hard — Enlargement
```
x = triRand(-8, 8), y = triRand(-8, 8)
sf = triPick([2, 3, -1, -2, 0.5])
ansX = x * sf, ansY = y * sf
sfStr = (sf == 0.5) ? '1/2' : String(sf)
prompt = "Enlarge ({x}, {y}) by scale factor {sfStr} from the origin"
```

## 6. Registration

**allApps Key:** `transform`
**modeMap:** `TransformApp`
**CUSTOM_PUZZLES:** `{ key: 'transform', name: 'Transformations' }`
**apiMap:** `transform: 'transform-api'`
**Factory (App.jsx 3358–3362):**
```javascript
const TransformApp = makeQuizApp({
  title: 'Transformations',
  subtitle: 'Reflect, translate, rotate, enlarge',
  apiPath: 'transform-api',
  diffLabels: { easy: 'Easy — Reflect', medium: 'Medium — Translate', hard: 'Hard — Rotate', extrahard: 'Extra Hard — Enlarge' },
  placeholders: 'e.g. (-3, 4)'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong.

Threshold: easy < 0.75, medium 0.75–1.5, hard 1.75–2.5, extrahard 2.75+.
