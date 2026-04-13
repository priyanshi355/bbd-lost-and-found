const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`) + '/api/auth';

export const authApi = {
  async register(name, email, password, phone) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async verifyEmail(email, otp) {
    const res = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data; // { token, user }
  },

  async resendOtp(email) {
    const res = await fetch(`${API_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data; // { token, user }
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reset OTP');
    return data;
  },

  async resetPassword(email, otp, newPassword) {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed');
    return data;
  },

  getToken() {
    return localStorage.getItem('bbd_token');
  },

  saveSession(token, user) {
    localStorage.setItem('bbd_token', token);
    localStorage.setItem('bbd_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('bbd_token');
    localStorage.removeItem('bbd_user');
  },

  getCurrentUser() {
    const u = localStorage.getItem('bbd_user');
    return u ? JSON.parse(u) : null;
  },
};
