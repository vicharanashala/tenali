const API_BASE_URL = 'http://localhost:5001/api/auth';

export async function sendOTP(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.message || 'Failed to send OTP' };
    return { data };
  } catch (err) {
    return { error: 'Network error. Is the backend server running?' };
  }
}

export async function verifyOTP(email, code) {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: code }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.message || 'Verification failed' };
    return { data }; // data.token is returned here
  } catch (err) {
    return { error: 'Network error. Is the backend server running?' };
  }
}

export async function registerUser({ email, name, password, token }) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, token }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.message || 'Registration failed' };
    return { data };
  } catch (err) {
    return { error: 'Network error. Is the backend server running?' };
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.message || 'Login failed' };
    return { data };
  } catch (err) {
    return { error: 'Network error. Is the backend server running?' };
  }
}

export async function resetPassword({ email, password, token }) {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, token }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.message || 'Password reset failed' };
    return { data };
  } catch (err) {
    return { error: 'Network error. Is the backend server running?' };
  }
}

export function getOTPStatus(email) {
  return { canResend: true, resendCount: 0, secondsLeft: 0 };
}