#!/bin/bash
# test.sh — Tests the SuperTables1 sliding window logic with live simulation
# Usage: ./test.sh [table_number]  (default: random 2-50)

set -e
cd "$(dirname "$0")"

TABLE=${1:-0}

node --eval "
const TABLE_ARG = ${TABLE}
const MULS = [2, 3, 4, 5, 6, 7, 8, 9]
const ROUNDS_PER_WINDOW = 10

let store = {}
const recordCorrect = (tbl, mul, ms) => {
  const k = tbl + 'x' + mul
  if (!store[k]) store[k] = { times: [], streak: 0 }
  store[k].times.push(ms)
  if (store[k].times.length > 10) store[k].times = store[k].times.slice(-10)
  store[k].streak = (store[k].streak || 0) + 1
}
const recordWrong = (tbl, mul) => {
  const k = tbl + 'x' + mul
  if (!store[k]) store[k] = { times: [], streak: 0 }
  store[k].streak = 0
}

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

// ── Run simulation ──
const tbl = TABLE_ARG > 0 ? TABLE_ARG : 2 + Math.floor(Math.random() * 49)
const lines = []
let prevWindow = ''

let sequence = buildFullSequence()
let seqIndex = -1

lines.push('Table of ' + tbl + ' — 500 questions (sliding window)')
lines.push('='.repeat(55))
lines.push('')

const muls = []
for (let i = 0; i < 500; i++) {
  seqIndex++
  if (seqIndex >= sequence.length) {
    sequence = buildFullSequence()
    seqIndex = 0
  }
  const entry = sequence[seqIndex]
  const mul = entry.mul
  const answer = tbl * mul
  const windowStr = entry.window.join(', ')

  if (windowStr !== prevWindow) {
    if (prevWindow !== '') lines.push('  WINDOW CHANGE -> focusing on [' + windowStr + ']')
    else lines.push('  Starting window: [' + windowStr + ']')
    prevWindow = windowStr
  }

  const qNum = String(i + 1).padStart(3)
  const r = Math.random()
  let status
  if (r < 0.1) {
    recordWrong(tbl, mul)
    status = '  WRONG'
  } else if (r < 0.3) {
    const ms = 4000 + Math.floor(Math.random() * 3000)
    recordCorrect(tbl, mul, ms)
    status = '  ' + (ms / 1000).toFixed(1) + 's (slow)'
  } else {
    const ms = 1500 + Math.floor(Math.random() * 2000)
    recordCorrect(tbl, mul, ms)
    status = '  ' + (ms / 1000).toFixed(1) + 's'
  }

  lines.push('  Q' + qNum + ':  ' + tbl + ' x ' + mul + ' = ' + answer + status)
  muls.push(mul)
}

// Check for repeats
let repeatCount = 0
let repeatDetails = []
for (let i = 1; i < muls.length; i++) {
  if (muls[i] === muls[i - 1]) {
    repeatCount++
    repeatDetails.push('  Q' + (i + 1) + ': x' + muls[i] + ' repeated')
  }
}

lines.push('')
lines.push('='.repeat(55))
if (repeatCount === 0) {
  lines.push('PASS: 0 consecutive repeats in 500 questions')
} else {
  lines.push('FAIL: ' + repeatCount + ' consecutive repeats found!')
  for (const d of repeatDetails) lines.push(d)
}
lines.push('')

// Output all lines as JSON array for bash to print with delay
console.log(JSON.stringify(lines))
" | node --eval "
const readline = require('readline');
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const lines = JSON.parse(data);
  let i = 0;
  const printNext = () => {
    if (i >= lines.length) return process.exit(0);
    console.log(lines[i++]);
    setTimeout(printNext, 100);
  };
  printNext();
});
"
