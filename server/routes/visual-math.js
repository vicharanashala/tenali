'use strict';
const router = require('express').Router();

function vmRandInt(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }

function vmPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const VM_EMOJIS = ['ðŸŽ','ðŸŠ','ðŸ‹','ðŸ‡','ðŸ“','â­','ðŸŒ¸','ðŸ¦‹','ðŸ£','ðŸ­','ðŸ§','ðŸŽˆ','ðŸ¦„','ðŸ¬','ðŸ•'];

function vmEmoji() { return vmPick(VM_EMOJIS); }

// Tables by difficulty
function vmTables(difficulty) {
  if (difficulty === 'easy')   return [2,3,4,5];
  if (difficulty === 'medium') return [2,3,4,5,6,7,8,9];
  return [2,3,4,5,6,7,8,9,10,11,12];
}

router.get('/question', (req, res) => {
  const type  = req.query.type  || 'multiply'; // multiply | divide
  const mode  = req.query.mode  || 'array';
  const diff  = req.query.difficulty || 'easy';
  const tables = vmTables(diff);
  const emoji  = vmEmoji();
  const id = `vm-${Date.now()}-${Math.random()}`;

  try {
    /* â”€â”€ MULTIPLICATION MODES â”€â”€ */

    if (type === 'multiply' && mode === 'array') {
      // "Build rows Ã— cols by tapping empty cells"
      const rows = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxCols = diff === 'easy' ? 4 : Math.max(2, Math.floor(30 / rows));
      const cols = vmRandInt(2, Math.min(diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8, maxCols));
      return res.json({ id, type, mode, emoji, rows, cols,
        prompt: `Fill ${rows} rows of ${cols} ${emoji} each. Total = ?`,
        answer: rows * cols, a: rows, b: cols });
    }

    if (type === 'multiply' && mode === 'groups') {
      // "Put M items into each of N buckets"
      const numGroups = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxPerGroup = diff === 'easy' ? 5 : Math.max(2, Math.floor(30 / numGroups));
      const perGroup  = vmRandInt(2, Math.min(diff === 'easy' ? 5 : diff === 'medium' ? 8 : 10, maxPerGroup));
      return res.json({ id, type, mode, emoji, numGroups, perGroup,
        prompt: `Put ${perGroup} ${emoji} into each of ${numGroups} buckets. Total?`,
        answer: numGroups * perGroup, a: numGroups, b: perGroup });
    }

    if (type === 'multiply' && mode === 'skip') {
      // "Hop by step to reach target"
      const step   = vmPick(tables.filter(t => t <= 10));
      const hops   = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 8 : 10);
      const target = step * hops;
      return res.json({ id, type, mode, emoji: 'ðŸ¸', step, hops, target,
        prompt: `Jump by ${step}s. How many jumps to reach ${target}?`,
        answer: hops, a: step, b: hops });
    }

    if (type === 'multiply' && mode === 'product') {
      // Balance scale: left = label "A Ã— B", right = drag weights to match
      const a = vmPick(tables);
      const b = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 9 : 12);
      return res.json({ id, type, mode, emoji, a, b,
        prompt: `${a} Ã— ${b} = ?  Drag weight blocks to balance the right pan!`,
        answer: a * b });
    }

    if (type === 'multiply' && mode === 'mystery') {
      // Balance scale: "? Ã— B = total" â€” drag mystery number weight
      const b     = vmPick(tables.filter(t => t >= 2 && t <= (diff === 'easy' ? 5 : 10)));
      const a     = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 9 : 12);
      const total = a * b;
      return res.json({ id, type, mode, emoji, a, b, total,
        prompt: `? Ã— ${b} = ${total}. What is the mystery factor?`,
        answer: a });
    }

    /* â”€â”€ DIVISION MODES â”€â”€ */

    if (type === 'divide' && mode === 'share') {
      // "Share total items equally among N plates"
      const divisor  = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxQuotient = diff === 'easy' ? 5 : Math.max(2, Math.floor(30 / divisor));
      const quotient = vmRandInt(2, Math.min(diff === 'easy' ? 5 : diff === 'medium' ? 8 : 10, maxQuotient));
      const total    = divisor * quotient;
      return res.json({ id, type, mode, emoji, total, divisor, quotient,
        prompt: `Share ${total} ${emoji} equally among ${divisor} plates. How many on each?`,
        answer: quotient, a: total, b: divisor });
    }

    if (type === 'divide' && mode === 'grouping') {
      // "Put items into groups of size B â€” how many groups?"
      const groupSize = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxGroups = diff === 'easy' ? 5 : Math.max(2, Math.floor(30 / groupSize));
      const numGroups = vmRandInt(2, Math.min(diff === 'easy' ? 5 : diff === 'medium' ? 7 : 10, maxGroups));
      const total     = groupSize * numGroups;
      return res.json({ id, type, mode, emoji, total, groupSize, numGroups,
        prompt: `Put ${total} ${emoji} into groups of ${groupSize}. How many groups?`,
        answer: numGroups, a: total, b: groupSize });
    }

    if (type === 'divide' && mode === 'quotient') {
      // Balance scale: left = total weight shown, right = drag quotient
      const divisor  = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 9);
      const quotient = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 9 : 12);
      const total    = divisor * quotient;
      return res.json({ id, type, mode, emoji, total, divisor, quotient,
        prompt: `${total} Ã· ${divisor} = ?  Drag weight blocks to show the answer!`,
        answer: quotient, a: total, b: divisor });
    }

    if (type === 'divide' && mode === 'remainder') {
      // "A Ã· B = Q remainder R" â€” drag quotient; remainder is shown
      const divisor  = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 9);
      const quotient = vmRandInt(1, diff === 'easy' ? 4 : diff === 'medium' ? 8 : 10);
      const remainder= vmRandInt(1, divisor - 1);
      const total    = divisor * quotient + remainder;
      return res.json({ id, type, mode, emoji, total, divisor, quotient, remainder,
        prompt: `${total} Ã· ${divisor} = ? remainder ${remainder}. What is the quotient?`,
        answer: quotient, a: total, b: divisor });
    }

    // Fallback: simple product
    const a2 = vmPick(tables);
    const b2 = vmRandInt(1, 10);
    res.json({ id, type: 'multiply', mode: 'product', emoji, a: a2, b: b2,
      prompt: `${a2} Ã— ${b2} = ?`, answer: a2 * b2 });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/check', (req, res) => {
  const { answer, correctAnswer } = req.body || {};
  const correct = Number(answer) === Number(correctAnswer);
  res.json({ correct, correctAnswer: Number(correctAnswer),
    message: correct ? 'Correct!' : 'Incorrect' });
});

module.exports = router;
