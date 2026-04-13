import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/auth.store';
import { userApi } from '../services/user.api';
import { toast } from '../services/toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authApi.getCurrentUser();
    const token = authApi.getToken();
    if (savedUser && token) {
      setUser(savedUser); // Show immediately from cache
      // Then quietly refresh from server to pick up any profile changes
      userApi.getMe()
        .then(fresh => {
          const merged = { ...savedUser, ...fresh };
          localStorage.setItem('bbd_user', JSON.stringify(merged));
          setUser(merged);
        })
        .catch(() => {}); // Silently fail if backend is unreachable
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password); // throws on error
    authApi.saveSession(data.token, data.user);
    setUser(data.user);
    toast.success('Welcome back, ' + data.user.name + '!');
    return data;
  };

  const register = async (name, email, password, phone) => {
    return await authApi.register(name, email, password, phone); // returns { message, email }
  };

  const verifyOtp = async (email, otp) => {
    const data = await authApi.verifyEmail(email, otp);
    authApi.saveSession(data.token, data.user);
    setUser(data.user);
    toast.success('Email verified! Welcome to BBD Lost & Found 🎉');
    return data;
  };

  const logout = () => {
    authApi.clearSession();
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const updateUser = async (profileData) => {
    const updated = await userApi.updateMe(profileData);
    const stored = authApi.getCurrentUser();
    const merged = { ...stored, ...updated };
    localStorage.setItem('bbd_user', JSON.stringify(merged));
    setUser(merged);
    return updated;
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, verifyOtp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
