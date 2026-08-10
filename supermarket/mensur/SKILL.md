# Mensuration — Formal Specification

## 1. Overview

**Mensuration** teaches area formulas for 2D shapes and volume/surface area formulas for 3D solids. Students apply geometric formulas and work with π-based calculations.

**Target Grade Level:** GCSE Mathematics (ages 13+)

**Key Concepts:**
- Rectangle area: A = length × width
- Triangle area: A = ½ × base × height
- Parallelogram area: A = base × height
- Circle area: A = πr², circumference: C = 2πr
- Cylinder volume: V = πr²h, surface area: 2πr(r+h)
- Cone volume: V = ⅓πr²h
- Sphere volume: V = ⁴⁄₃πr³, surface area: 4πr²

## 2. Component Specification

**Component Name:** `MensurApp`

**Factory:** Created via `makeQuizApp()` with:
```javascript
{
  title: 'Mensuration',
  subtitle: 'Area, volume, surface area',
  apiPath: 'mensur-api',
  diffLabels: { easy: 'Easy — 2D Area', medium: 'Medium — Circle', hard: 'Hard — Volume', extrahard: 'Extra Hard — Surface Area' },
  placeholders: 'e.g. 150.72'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Rectangle | Area: length 6, width 8 | 48 |
| **Easy** | Triangle | Area: base 10, height 6 | 30 |
| **Medium** | Circle area | πr² where r=5 | ~78.54 |
| **Medium** | Circumference | 2πr where r=3 | ~18.85 |
| **Hard** | Cylinder volume | πr²h, r=2, h=10 | ~125.66 |
| **Hard** | Cone volume | ⅓πr²h, r=3, h=8 | ~75.40 |
| **Extra Hard** | Sphere surface | 4πr² where r=4 | ~201.06 |
| **Extra Hard** | Cylinder surface | 2πr(r+h), r=3, h=5 | ~150.80 |

## 4. API Endpoints

### GET /mensur-api/question

**Easy — 2D Area:**
```json
{ "type": "area_2d", "prompt": "Area of rectangle: length = 6, width = 8", "answer": 48, "display": "48" }
```

**Medium — Circle:**
```json
{ "type": "circle", "prompt": "Area of circle with radius 5 (to 2 d.p., use π = 3.14159...)", "answer": 78.54, "display": "78.54" }
```

**Hard — Volume:**
```json
{ "type": "volume", "prompt": "Volume of cylinder: radius = 2, height = 10 (2 d.p.)", "answer": 125.66, "display": "125.66" }
```

**Extra Hard — Surface Area:**
```json
{ "type": "surface_area", "prompt": "Total surface area of cylinder: radius = 3, height = 5 (2 d.p.)", "answer": 150.80, "display": "150.80" }
```

### POST /mensur-api/check

```
userNum = parseFloat(userStr)
correct = |userNum - expected| < 0.5  (tolerance for rounding errors)
```

## 5. Question Generation Algorithm

### Easy — 2D Area
```
shape = triPick(['rectangle', 'triangle', 'parallelogram'])
a = triRand(3, 15), b = triRand(3, 15)

if shape == 'rectangle':
  answer = a * b
  prompt = "Area of rectangle: length = {a}, width = {b}"
else if shape == 'triangle':
  answer = a * b / 2
  prompt = "Area of triangle: base = {a}, height = {b}"
else:
  answer = a * b
  prompt = "Area of parallelogram: base = {a}, height = {b}"
```

### Medium — Circle
```
r = triRand(2, 12)
subtype = triPick(['area', 'circumference'])

if subtype == 'area':
  answer = round(π * r * r * 100) / 100
  prompt = "Area of circle with radius {r} (to 2 d.p., use π = 3.14159...)"
else:
  answer = round(2 * π * r * 100) / 100
  prompt = "Circumference of circle with radius {r} (to 2 d.p.)"
```

### Hard — Volume
```
shape = triPick(['cylinder', 'cone', 'sphere'])
r = triRand(2, 8)

if shape == 'cylinder':
  h = triRand(3, 12)
  answer = round(π * r * r * h * 100) / 100
  prompt = "Volume of cylinder: radius = {r}, height = {h} (2 d.p.)"
else if shape == 'cone':
  h = triRand(3, 12)
  answer = round(π * r * r * h / 3 * 100) / 100
  prompt = "Volume of cone: radius = {r}, height = {h} (2 d.p.)"
else:
  answer = round(4/3 * π * r * r * r * 100) / 100
  prompt = "Volume of sphere with radius {r} (2 d.p.)"
```

### Extra Hard — Surface Area
```
shape = triPick(['cylinder', 'sphere'])
r = triRand(2, 8)

if shape == 'cylinder':
  h = triRand(3, 12)
  answer = round(2 * π * r * (r + h) * 100) / 100
  prompt = "Total surface area of cylinder: radius = {r}, height = {h} (2 d.p.)"
else:
  answer = round(4 * π * r * r * 100) / 100
  prompt = "Surface area of sphere with radius {r} (2 d.p.)"
```

## 6. Registration

**allApps Key:** `mensur`
**modeMap:** `MensurApp`
**CUSTOM_PUZZLES:** `{ key: 'mensur', name: 'Mensuration' }`
**apiMap:** `mensur: 'mensur-api'`
**Factory (App.jsx 3364–3368):**
```javascript
const MensurApp = makeQuizApp({
  title: 'Mensuration',
  subtitle: 'Area, volume, surface area',
  apiPath: 'mensur-api',
  diffLabels: { easy: 'Easy — 2D Area', medium: 'Medium — Circle', hard: 'Hard — Volume', extrahard: 'Extra Hard — Surface Area' },
  placeholders: 'e.g. 150.72'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong. Threshold: easy < 0.75, medium 0.75–1.5, hard 1.75–2.5, extrahard 2.75+.
