const STORE_KEY = 'bbd_lost_found_items';

/**
 * Generates a unique ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Initializes the store if it doesn't exist
 */
const initStore = () => {
  if (!localStorage.getItem(STORE_KEY)) {
    localStorage.setItem(STORE_KEY, JSON.stringify([]));
  }
};

/**
 * Item Store Service (Vanilla JS)
 */
export const itemStore = {
  getAllItems() {
    initStore();
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  },

  getItemsByType(type) {
    const items = this.getAllItems();
    return items.filter(item => item.type === type);
  },

  getItemsByUserId(userId) {
    const items = this.getAllItems();
    return items.filter(item => item.authorId === userId);
  },

  addItem(data) {
    const items = this.getAllItems();
    const newItem = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    items.push(newItem);
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
    return newItem;
  },

  updateItem(id, updatedData) {
    const items = this.getAllItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex > -1) {
      items[itemIndex] = { ...items[itemIndex], ...updatedData };
      localStorage.setItem(STORE_KEY, JSON.stringify(items));
      return items[itemIndex];
    }
    return null;
  },

  deleteItem(id) {
    let items = this.getAllItems();
    const originalLength = items.length;
    items = items.filter(item => item.id !== id);
    
    if (items.length !== originalLength) {
      localStorage.setItem(STORE_KEY, JSON.stringify(items));
      return true;
    }
    return false;
  }
};
