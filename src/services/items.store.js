const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`) + '/api/items';

const getAuthHeaders = () => {
  const token = localStorage.getItem('bbd_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
export const itemStore = {
  async getAllItems() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch items globally');
      return await res.json();
    } catch(err) {
      console.error(err);
      return [];
    }
  },

  async getItemsByType(type) {
    try {
      const res = await fetch(`${API_URL}?type=${type}`);
      if (!res.ok) throw new Error('Failed to fetch specific types');
      return await res.json();
    } catch(err) {
      console.error(err);
      return [];
    }
  },

  async getMyItems() {
    try {
       const res = await fetch(`${API_URL}/my-items`, { headers: getAuthHeaders() });
       if (!res.ok) throw new Error('Failed to fetch your items');
       return await res.json();
    } catch(err) {
      console.error(err);
      throw err;
    }
  },

  async addItem(data) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server rejected the item submission');
      }
      return await res.json();
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('Cannot reach the backend server. Make sure "node server.js" is running in the backend folder.');
      }
      throw err;
    }
  },

  async updateItem(id, updatedData) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error('Failed to update item');
    return await res.json();
  },

  async verifyClaim(id, answer) {
    const res = await fetch(`${API_URL}/${id}/verify-claim`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answer })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Verification failed');
    }
    return await res.json();
  },

  async resolveItem(id) {
    const res = await fetch(`${API_URL}/${id}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark item as resolved');
    return await res.json();
  },

  async deleteItem(id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to permanently delete object');
    return await res.json();
  }
};
