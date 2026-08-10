# Number Bases — Formal Specification

## 1. Overview

**Number Bases** teaches conversion between decimal, binary, and hexadecimal number systems. Students understand place value in different bases and perform base conversions and arithmetic operations.

**Target Grade Level:** GCSE/A-Level Computer Science & Mathematics (ages 14+)

**Key Concepts:**
- Decimal (base 10): digits 0–9
- Binary (base 2): digits 0–1, powers of 2
- Hexadecimal (base 16): digits 0–9 and A–F
- Positional notation and place value
- Base conversion algorithms
- Binary arithmetic and hex arithmetic

## 2. Component Specification

**Component Name:** `BasesApp`

**Factory:** Created via `makeQuizApp()` with:
```javascript
{
  title: 'Number Bases',
  subtitle: 'Binary, decimal, hexadecimal',
  apiPath: 'bases-api',
  diffLabels: { easy: 'Easy — Dec→Bin', medium: 'Medium — Bin→Dec', hard: 'Hard — Dec→Hex', extrahard: 'Extra Hard — Bin add / Hex→Bin' },
  placeholders: (q, d) => d === 'medium' ? 'e.g. 42' : d === 'hard' ? 'e.g. FF' : 'e.g. 101010'
}
```

## 3. Difficulty Levels

| Level | Type | Example | Answer |
|-------|------|---------|--------|
| **Easy** | Decimal→Binary | Convert 10₁₀ to binary | 1010₂ |
| **Easy** | Decimal→Binary | Convert 42₁₀ to binary | 101010₂ |
| **Medium** | Binary→Decimal | Convert 1101₂ to decimal | 13 |
| **Medium** | Binary→Decimal | Convert 11111₂ to decimal | 31 |
| **Hard** | Decimal→Hex | Convert 255₁₀ to hex | FF |
| **Hard** | Decimal→Hex | Convert 42₁₀ to hex | 2A |
| **Extra Hard** | Binary addition | 101₂ + 11₂ = ? | 1000₂ |
| **Extra Hard** | Hex→Binary | Convert FF₁₆ to binary | 11111111₂ |

## 4. API Endpoints

### GET /bases-api/question

**Easy — Dec→Bin:**
```json
{ "type": "dec_to_bin", "prompt": "Convert 10 (decimal) to binary", "answer": "1010", "display": "1010" }
```

**Medium — Bin→Dec:**
```json
{ "type": "bin_to_dec", "prompt": "Convert 1101 (binary) to decimal", "answer": 13, "display": "13" }
```

**Hard — Dec→Hex:**
```json
{ "type": "dec_to_hex", "prompt": "Convert 255 (decimal) to hexadecimal", "answer": "FF", "display": "FF" }
```

**Extra Hard — Bin Add or Hex→Bin:**
```json
{ "type": "bin_add", "prompt": "Add in binary: 101 + 11", "answer": "1000", "display": "1000" }
```

### POST /bases-api/check

```
For bin_to_dec:
  userNum = parseInt(userStr)
  correct = userNum === expected

For others (strings):
  normalized = userStr.replace(/\s+/g, '').toUpperCase().replace(/^0+/, '') || '0'
  expected = String(answer).toUpperCase().replace(/^0+/, '') || '0'
  correct = normalized === expected
```

## 5. Question Generation Algorithm

### Easy — Decimal to Binary
```
n = triRand(5, 63)
prompt = "Convert {n} (decimal) to binary"
answer = n.toString(2)
display = n.toString(2)
type = 'dec_to_bin'
```

### Medium — Binary to Decimal
```
n = triRand(10, 127)
bin = n.toString(2)
prompt = "Convert {bin} (binary) to decimal"
answer = n
display = String(n)
type = 'bin_to_dec'
```

### Hard — Decimal to Hexadecimal
```
n = triRand(16, 255)
prompt = "Convert {n} (decimal) to hexadecimal"
answer = n.toString(16).toUpperCase()
display = n.toString(16).toUpperCase()
type = 'dec_to_hex'
```

### Extra Hard — Binary Add or Hex→Binary
```
subtype = triPick(['bin_add', 'hex_to_bin'])

if subtype === 'bin_add':
  a = triRand(5, 30), b = triRand(5, 30)
  sum = a + b
  prompt = "Add in binary: {a.toString(2)} + {b.toString(2)}"
  answer = sum.toString(2)
  display = sum.toString(2)
  type = 'bin_add'
else:
  n = triRand(16, 255)
  hex = n.toString(16).toUpperCase()
  prompt = "Convert {hex} (hexadecimal) to binary"
  answer = n.toString(2)
  display = n.toString(2)
  type = 'hex_to_bin'
```

## 6. Registration

**allApps Key:** `bases`
**modeMap:** `BasesApp`
**CUSTOM_PUZZLES:** `{ key: 'bases', name: 'Number Bases' }`
**apiMap:** `bases: 'bases-api'`
**Factory (App.jsx 3388–3392):**
```javascript
const BasesApp = makeQuizApp({
  title: 'Number Bases',
  subtitle: 'Binary, decimal, hexadecimal',
  apiPath: 'bases-api',
  diffLabels: { easy: 'Easy — Dec→Bin', medium: 'Medium — Bin→Dec', hard: 'Hard — Dec→Hex', extrahard: 'Extra Hard — Bin add / Hex→Bin' },
  placeholders: (q, d) => d === 'medium' ? 'e.g. 42' : d === 'hard' ? 'e.g. FF' : 'e.g. 101010'
})
```

## 7. Adaptive Mode

**Supported:** Yes. Score 0–3, +0.25 correct, −0.35 wrong.
