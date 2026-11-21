import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync theme
  useEffect(() => {
    const theme = user?.preferences?.theme || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  // Load user on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
        initSocket(token);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const { token: receivedToken, user: loggedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
      initSocket(receivedToken);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
      return false;
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await authAPI.register(name, email, password, role);
      const { token: receivedToken, user: registeredUser } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(registeredUser);
      initSocket(receivedToken);
      toast.success(`Account created! Welcome, ${registeredUser.name}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    disconnectSocket();
    toast.success('Logged out successfully');
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await authAPI.updatePreferences(newPrefs);
      setUser((prev) => ({
        ...prev,
        preferences: res.data.preferences
      }));
      toast.success('Preferences updated');
      return true;
    } catch (err) {
      toast.error('Failed to update preferences');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
