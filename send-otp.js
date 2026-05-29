/**
 * send-otp.js — Vercel serverless function: send OTP via Resend
 *
 * POST /api/send-otp
 * Body: { email: string }
 *
 * Generates a random 6-digit OTP, stores it in otpStore (5-min expiry),
 * and emails it to the user via Resend's API.
 *
 * Note: In-memory otpStore resets on cold start. For a production app,
 * replace with a Redis or database-backed OTP store.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_b8ERV4vB_PckH1dFUdXwovxJuqztCVF18');

/** In-memory OTP storage (per-function-instance). See store.js for expiry constants. */
const otpStore = {};

/** Generate a random 6-digit numeric OTP string. */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export default async function handler(req, res) {
  // Only POST is allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Generate and store OTP with 5-minute expiry
  const otp = generateOTP();
  const expiry = Date.now() + (5 * 60 * 1000);
  otpStore[email] = { otp, expiry };

  try {
    // Send the OTP email via Resend
    await resend.emails.send({
      from: 'Tenali Math <onboarding@resend.dev>',
      to: email,
      subject: 'Your OTP Code',
      html: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;">
        <h2 style="color:#1a1a2e;">Your code</h2>
        <p style="font-size:16px;color:#333;">Use the code below to verify your email:</p>
        <div style="background:#f0f4ff;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#2dd4bf;margin:20px 0;border-radius:8px;">${otp}</div>
        <p style="font-size:12px;color:#888;">This code expires in 5 minutes.</p>
      </div>`,
    });
    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
}