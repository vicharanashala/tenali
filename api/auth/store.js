const crypto = require('crypto');

export const otpStore = {};
export const verifiedTokens = {};
export const OTP_EXPIRY_MS = 5 * 60 * 1000;
export const TOKEN_EXPIRY_MS = 15 * 60 * 1000;