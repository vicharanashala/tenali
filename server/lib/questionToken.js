'use strict';
const crypto = require('crypto');
const auth = require('../auth');

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

function getSecret() {
  return process.env.QUESTION_TOKEN_SECRET || auth.JWT_SECRET || 'tenali-question-token-secret-key';
}

/**
 * Sign a question payload into an opaque token string.
 * @param {Object} payload - Question metadata/operands (e.g. { topic, q, difficulty })
 * @param {number} [ttlSeconds=300] - Expiry TTL in seconds
 * @returns {string} Base64url signed token
 */
function signQuestionToken(payload, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const data = JSON.stringify({ payload, exp });
  const dataB64 = Buffer.from(data).toString('base64url');
  const hmac = crypto.createHmac('sha256', getSecret()).update(dataB64).digest('hex');
  return `${dataB64}.${hmac}`;
}

/**
 * Verify a question token string.
 * @param {string} token - The qToken to verify
 * @returns {{ valid: boolean, payload?: Object, error?: string }} Verification result
 */
function verifyQuestionToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is missing or invalid' };
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token' };
  }
  const [dataB64, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', getSecret()).update(dataB64).digest('hex');

  const bufA = Buffer.from(hmac, 'utf8');
  const bufB = Buffer.from(expectedHmac, 'utf8');
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return { valid: false, error: 'Invalid token signature' };
  }

  try {
    const parsed = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp && now > parsed.exp) {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: true, payload: parsed.payload };
  } catch (err) {
    return { valid: false, error: 'Invalid token payload' };
  }
}

module.exports = {
  signQuestionToken,
  verifyQuestionToken,
};
