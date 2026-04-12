const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const getToken = () => localStorage.getItem('bbd_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

export const userApi = {
  async getMe() {
    const res = await fetch(`${API_BASE}/users/me`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  async updateMe(profileData) {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },
};
