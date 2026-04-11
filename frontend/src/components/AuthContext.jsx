import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStore } from '../services/auth.store';
import { toast } from '../services/toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authStore.initMockData();
    const activeSession = authStore.getCurrentUser();
    if (activeSession) {
      setUser(activeSession);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const res = authStore.login(email, password);
    if (res.success) {
      setUser(res.user);
      toast.success('Successfully logged in!');
      return true;
    }
    toast.error(res.message);
    return false;
  };

  const register = (name, email, password) => {
    const res = authStore.register(name, email, password);
    if (res.success) {
      setUser(res.user);
      toast.success('Account created successfully!');
      return true;
    }
    toast.error(res.message);
    return false;
  };

  const logout = () => {
    authStore.logout();
    setUser(null);
    toast.success('Successfully logged out.');
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
