// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Restore session on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ─────────────────────────────────────────────────────
  // LOGIN
  // Always returns { success: true } or { success: false, message: '...' }
  // Never throws — so the page can safely show the error
  // ─────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        return { success: true };
      }

      // Server returned success:false with a message
      return { success: false, message: data.message || 'Login failed.' };

    } catch (err) {
      // axios throws for 4xx/5xx — extract the server's message
      const serverMsg = err.response?.data?.message;
      const status    = err.response?.status;

      let message;
      if (serverMsg) {
        // Use the exact message the backend sent
        message = serverMsg;
      } else if (status === 401) {
        message = 'Wrong email or password. Please try again.';
      } else if (status === 400) {
        message = 'Please fill in all fields correctly.';
      } else if (!err.response) {
        message = 'Cannot reach server. Is the backend running?';
      } else {
        message = 'Something went wrong. Please try again.';
      }

      // Return the error — do NOT toast here so the page can show it inline
      return { success: false, message };
    }
  };

  // ─────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        toast.success('Account created! Welcome 🎉');
        return { success: true };
      }

      return { success: false, message: data.message || 'Registration failed.' };

    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const status    = err.response?.status;

      let message;
      if (serverMsg) {
        message = serverMsg;
      } else if (status === 400) {
        message = 'Invalid details. Please check all fields.';
      } else if (status === 409 || (serverMsg || '').toLowerCase().includes('exists')) {
        message = 'This email is already registered. Try logging in instead.';
      } else if (!err.response) {
        message = 'Cannot reach server. Is the backend running?';
      } else {
        message = 'Registration failed. Please try again.';
      }

      return { success: false, message };
    }
  };

  // ─────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, darkMode,
      isAuthenticated: !!token && !!user,
      login, register, logout, updateUser,
      toggleDarkMode: () => setDarkMode(p => !p),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
