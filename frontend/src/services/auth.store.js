const USERS_KEY = 'bbd_lost_found_users';
const SESSION_KEY = 'bbd_lost_found_session';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export const authStore = {
  initMockData() {
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || 'null');
    if (!users) {
      users = [{
        id: 'admin_1',
        name: 'System Admin',
        email: 'admin@bbd.ac.in',
        password: 'admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      }];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  getAllUsers() {
    this.initMockData();
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  },

  register(name, email, password) {
    const users = this.getAllUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists in system' };
    }

    const newUser = {
      id: generateId(),
      name,
      email,
      password, // plaintext for mock simulation only
      role: 'student',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Auto-login
    this.setSession(newUser);
    return { success: true, user: newUser };
  },

  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Invalid credentials detected' };
    }

    this.setSession(user);
    return { success: true, user };
  },

  setSession(user) {
    // Strip password from session object intentionally
    const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    this.initMockData();
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  }
};
