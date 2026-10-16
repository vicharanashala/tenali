'use strict';

// Remembers the last few questions shown to each learner, so the same question
// is not served again while unused questions are still available.
const MAX_REMEMBERED = 15;
const FORGET_AFTER_MS = 30 * 60 * 1000;
const MAX_TRIES = 25;
const history = new Map();

function learnerKey(req, topic) {
  const ip = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
  return `${ip}|${req.headers['user-agent'] || ''}|${topic}`;
}

// Two questions are "the same" when everything except the id and the order of the options matches.
function sameQuestionKey({ id, options, ...rest }) {
  return JSON.stringify(rest);
}

function nextFresh(req, topic, makeQuestion) {
  const now = Date.now();
  for (const [k, v] of history) if (now - v.last > FORGET_AFTER_MS) history.delete(k);
  const key = learnerKey(req, topic);
  const entry = history.get(key) || { keys: [], last: now };
  let q = makeQuestion();
  for (let i = 1; i < MAX_TRIES && entry.keys.includes(sameQuestionKey(q)); i++) q = makeQuestion();
  entry.keys.push(sameQuestionKey(q));
  if (entry.keys.length > MAX_REMEMBERED) entry.keys.shift();
  entry.last = now;
  history.set(key, entry);
  return q;
}

module.exports = { nextFresh };
