const API_BASE = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`) + '/api/messages';

const getToken = () => localStorage.getItem('bbd_token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

export const messageApi = {
  async startConversation(itemId, text) {
    const res = await fetch(`${API_BASE}/start`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ itemId, text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  async getConversations() {
    const res = await fetch(`${API_BASE}/conversations`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load inbox');
    return data;
  },

  async getUnreadCount() {
    const res = await fetch(`${API_BASE}/unread-count`, { headers: authHeaders() });
    if (!res.ok) return { count: 0 };
    return await res.json();
  },

  async getMessages(conversationId) {
    const res = await fetch(`${API_BASE}/${conversationId}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load messages');
    return data;
  },

  async sendReply(conversationId, text, imageUrl = null) {
    const res = await fetch(`${API_BASE}/${conversationId}/reply`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reply');
    return data;
  },
};
