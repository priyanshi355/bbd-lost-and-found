const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
const getToken = () => localStorage.getItem('bbd_token');
const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

export const adminApi = {
  async getStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    return data;
  },
  async getUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
  async banUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/ban`, { method: 'PUT', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
  async unbanUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/unban`, { method: 'PUT', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
  async getReports() {
    const res = await fetch(`${API_BASE}/admin/reports`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
  async dismissReport(id) {
    const res = await fetch(`${API_BASE}/admin/reports/${id}/dismiss`, { method: 'PUT', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
  async banItem(id) {
    const res = await fetch(`${API_BASE}/admin/items/${id}/ban`, { method: 'PUT', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
  async broadcast(subject, message) {
    const res = await fetch(`${API_BASE}/admin/broadcast`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ subject, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
};

export const itemsApi = {
  async getSimilar(itemId) {
    const res = await fetch(`${API_BASE}/items/${itemId}/similar`);
    if (!res.ok) return [];
    return await res.json();
  },
  async reportItem(itemId, reason, details) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/items/${itemId}/report`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ reason, details, reportedBy: token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to report');
    return data;
  },
};
