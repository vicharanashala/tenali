/**
 * store.js — In-memory OTP and verification token store
 *
 * Since Vercel serverless functions are stateless (each invocation may run on
 * a different container), this module uses regular JS objects as an in-memory
 * store. This is fine for a demo — users won't share instances during a single
 * session, but on cold start the store resets.
 *
 * For production, replace with a Redis or Supabase-backed store.
 *
 * otpStore[email]         → { otp: string, expiry: number (Date.now() + ms) }
 * verifiedTokens[token]   → { email: string, expiresAt: number }
 */

const crypto = require('crypto');

/** OTP code storage: email → { otp, expiry } */
export const otpStore = {};

/** Post-verification token storage: token → { email, expiresAt } */
export const verifiedTokens = {};

/** OTP codes expire after 5 minutes */
export const OTP_EXPIRY_MS = 5 * 60 * 1000;

/** Verification tokens expire after 15 minutes */
export const TOKEN_EXPIRY_MS = 15 * 60 * 1000;