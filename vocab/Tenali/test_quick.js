// test_quick.js — Tests the deterministic sliding window logic
// Verifies: no consecutive repeats, only valid multipliers, correct window cycling

const MULS = [2, 3, 4, 5, 6, 7, 8, 9]
const ROUNDS_PER_WINDOW = 10

const buildFullSequence = () => {
  const seq = []
  for (let w = 0; w < 20; w++) {
    const startIdx = w % MULS.length
    const window = [
      MULS[startIdx % MULS.length],
      MULS[(startIdx + 1) % MULS.length],
      MULS[(startIdx + 2) % MULS.length],
    ]
    for (let r = 0; r < ROUNDS_PER_WINDOW; r++) {
      seq.push({ mul: window[r % 3], window: [...window] })
    }
  }
  return seq
}

// TEST 1: No consecutive repeats in single pass
console.log('=== TEST 1: No consecutive repeats ===')
const seq = buildFullSequence()
let reps = 0
for (let i = 1; i < seq.length; i++) {
  if (seq[i].mul === seq[i - 1].mul) {
    reps++
    console.log(`  REPEAT at position ${i}: x${seq[i].mul} after x${seq[i - 1].mul}`)
  }
}
console.log(`Result: ${reps} consecutive repeats in ${seq.length} questions`)
console.log(reps === 0 ? 'PASS' : 'FAIL')
console.log()

// TEST 2: Only valid multipliers (2-9)
console.log('=== TEST 2: Only valid multipliers ===')
const invalid = seq.filter(e => MULS.indexOf(e.mul) === -1)
console.log(`Result: ${invalid.length} invalid multipliers`)
console.log(invalid.length === 0 ? 'PASS' : 'FAIL')
console.log()

// TEST 3: Windows slide correctly: [2,3,4] -> [3,4,5] -> ... -> [8,9,2] -> [9,2,3] -> [2,3,4]
console.log('=== TEST 3: Window sliding pattern ===')
let windowChanges = []
let prevWindow = null
for (const entry of seq) {
  const wStr = entry.window.join(',')
  if (wStr !== prevWindow) {
    windowChanges.push(entry.window)
    prevWindow = wStr
  }
}
console.log('Windows encountered:')
for (const w of windowChanges) {
  console.log(`  [${w.join(', ')}]`)
}
// First 8 should be: [2,3,4], [3,4,5], [4,5,6], [5,6,7], [6,7,8], [7,8,9], [8,9,2], [9,2,3]
const expected = [
  [2,3,4], [3,4,5], [4,5,6], [5,6,7], [6,7,8], [7,8,9], [8,9,2], [9,2,3]
]
let windowOk = true
for (let i = 0; i < Math.min(expected.length, windowChanges.length); i++) {
  if (expected[i].join(',') !== windowChanges[i].join(',')) {
    console.log(`  MISMATCH at window ${i}: expected [${expected[i]}] got [${windowChanges[i]}]`)
    windowOk = false
  }
}
console.log(windowOk ? 'PASS' : 'FAIL')
console.log()

// TEST 4: Each window has exactly 10 rounds
console.log('=== TEST 4: 10 rounds per window ===')
let windowCounts = {}
let currentW = null
for (const entry of seq) {
  const wStr = entry.window.join(',')
  if (wStr !== currentW) {
    currentW = wStr
    if (!windowCounts[wStr]) windowCounts[wStr] = 0
  }
  windowCounts[wStr]++
}
let countOk = true
for (const [w, count] of Object.entries(windowCounts)) {
  if (count % ROUNDS_PER_WINDOW !== 0) {
    console.log(`  Window [${w}]: ${count} rounds (not multiple of ${ROUNDS_PER_WINDOW})`)
    countOk = false
  }
}
console.log(countOk ? 'PASS' : 'FAIL')
console.log()

// TEST 5: Cycling pattern within a window is a,b,c,a,b,c,a,b,c,a
console.log('=== TEST 5: Cycling pattern within window ===')
const firstWindow = seq.slice(0, ROUNDS_PER_WINDOW)
const w = firstWindow[0].window
const expectedPattern = []
for (let r = 0; r < ROUNDS_PER_WINDOW; r++) expectedPattern.push(w[r % 3])
const actualPattern = firstWindow.map(e => e.mul)
const patternMatch = expectedPattern.join(',') === actualPattern.join(',')
console.log(`  Expected: ${expectedPattern.join(',')}`)
console.log(`  Actual:   ${actualPattern.join(',')}`)
console.log(patternMatch ? 'PASS' : 'FAIL')
console.log()

// TEST 6: Double-fire simulation — even if advance is called twice, index just skips ahead
console.log('=== TEST 6: Double-fire resilience ===')
let seqRef = buildFullSequence()
let idx = -1
const results = []
for (let i = 0; i < 100; i++) {
  // First fire
  idx++
  if (idx >= seqRef.length) { seqRef = buildFullSequence(); idx = 0 }
  const m1 = seqRef[idx].mul
  // Second fire (double-fire)
  idx++
  if (idx >= seqRef.length) { seqRef = buildFullSequence(); idx = 0 }
  const m2 = seqRef[idx].mul
  // User sees m2 (the second one)
  results.push(m2)
}
let dfReps = 0
for (let i = 1; i < results.length; i++) {
  if (results[i] === results[i - 1]) dfReps++
}
console.log(`Double-fire: ${dfReps} consecutive repeats in ${results.length} questions`)
// With double-fire, some repeats may happen because we skip entries, but it's bounded
console.log(dfReps < 10 ? 'PASS (acceptable)' : 'FAIL (too many repeats)')
