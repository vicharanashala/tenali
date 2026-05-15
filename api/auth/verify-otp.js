import crypto from 'crypto';
import { otpStore, verifiedTokens, TOKEN_EXPIRY_MS } from './store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const record = otpStore[email];
  if (!record || Date.now() > record.expiry || record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  delete otpStore[email];

  const token = crypto.randomUUID();
  verifiedTokens[token] = { email, expiresAt: Date.now() + TOKEN_EXPIRY_MS };

  return res.json({ message: 'OTP verified', token });
}