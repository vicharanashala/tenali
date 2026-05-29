const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { transporter, generateOTP } = require('../utils/sendOtp');
const { supabase } = require('../utils/supabase');

// In-memory stores (use Redis/DB for production)
const otpStore = {};
const teacherOtpStore = {};
const verifiedTokens = {}; // token -> { email, expiresAt }
const teacherVerifiedTokens = {}; // token -> { email, expiresAt }

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const TOKEN_EXPIRY_MS = 15 * 60 * 1000;

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateOTP();
  const expiry = Date.now() + OTP_EXPIRY_MS;

  otpStore[email] = { otp, expiry };

  try {
    await transporter.sendMail({
      from: `"Tenali App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Your code</h2>
          <p style="font-size: 16px; color: #333;">Use the code below to verify your email:</p>
          <div style="background: #f0f4ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2dd4bf; margin: 20px 0; border-radius: 8px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #888;">This code expires in 5 minutes.</p>
        </div>
      `,
    });
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const record = otpStore[email];
  if (!record || Date.now() > record.expiry || record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  delete otpStore[email];

  const token = crypto.randomUUID();
  verifiedTokens[token] = { email, expiresAt: Date.now() + TOKEN_EXPIRY_MS };

  res.json({ message: 'OTP verified', token });
});

// Register with Password
router.post('/register', async (req, res) => {
  const { email, name, password, token } = req.body;
  
  const tokenRecord = verifiedTokens[token];
  if (!tokenRecord || tokenRecord.email !== email || Date.now() > tokenRecord.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired verification session' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ email, name, password: hashedPassword })
      .select()
      .single();

    if (error) throw error;

    delete verifiedTokens[token];
    res.json({ message: 'Registration successful', user: { id: data.id, email: data.email, name: data.name } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login with Password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: 'Invalid password' });

    res.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, password, token } = req.body;

  const tokenRecord = verifiedTokens[token];
  if (!tokenRecord || tokenRecord.email !== email || Date.now() > tokenRecord.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired verification session' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (error) throw error;

    delete verifiedTokens[token];
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/auth/teacher/send-otp
 *  Sends an OTP to the teacher email and marks the pending role as 'teacher'.
 */
router.post('/teacher/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateOTP();
  const expiry = Date.now() + OTP_EXPIRY_MS;

  teacherOtpStore[email] = { otp, expiry };

  try {
    await transporter.sendMail({
      from: `"Tenali App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Teacher OTP Code',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Your teacher verification code</h2>
          <p style="font-size: 16px; color: #333;">Use the code below to verify your email for Tenali Teacher access:</p>
          <div style="background: #f0f4ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2dd4bf; margin: 20px 0; border-radius: 8px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #888;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
    res.json({ message: 'Teacher OTP sent successfully' });
  } catch (error) {
    console.error('Error sending teacher OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

/** POST /api/auth/teacher/verify-otp
 *  Verifies the teacher OTP and returns a short-lived token.
 */
router.post('/teacher/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const record = teacherOtpStore[email];
  if (!record || Date.now() > record.expiry || record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  delete teacherOtpStore[email];

  const token = crypto.randomUUID();
  teacherVerifiedTokens[token] = { email, expiresAt: Date.now() + TOKEN_EXPIRY_MS };

  res.json({ message: 'Teacher OTP verified', token });
});

/** POST /api/auth/teacher/register
 *  Creates a teacher user record with role='teacher'.
 *  Requires a valid teacher verify-otp token.
 */
router.post('/teacher/register', async (req, res) => {
  const { email, name, token } = req.body;

  const tokenRecord = teacherVerifiedTokens[token];
  if (!tokenRecord || tokenRecord.email !== email || Date.now() > tokenRecord.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired verification session' });
  }

  try {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();


    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ email, full_name: name, role: 'teacher' })
      .select()
      .single();

    if (error) throw error;

    delete teacherVerifiedTokens[token];
    res.json({ message: 'Teacher registration successful', user: { id: data.id, email: data.email, name: data.full_name } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
