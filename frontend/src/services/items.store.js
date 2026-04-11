const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/items';

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

  async getItemsByUserId(userId) {
    try {
       const res = await fetch(`${API_URL}?authorId=${userId}`);
       if (!res.ok) throw new Error('Failed isolating user items');
       return await res.json();
    } catch(err) {
      console.error(err);
      return [];
    }
  },

  async addItem(data) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error('Failed partial modifications against Cloud');
    return await res.json();
  },

  async deleteItem(id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to permanently delete object');
    return await res.json();
  }
};
