// src/utils/api.js - Axios API Configuration
import axios from 'axios';

const API_URL = 'https://smartexpensetracker-cs85.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// IMPORTANT FIX:
// Only auto-redirect on 401 for PROTECTED routes.
// Login/Register routes ALSO return 401 for wrong password —
// we must NOT redirect there, or the error never shows in UI.
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    // Only redirect to login if it's a 401 on a PROTECTED route
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Always reject so the calling function can handle the error
    return Promise.reject(error);
  }
);

export default api;
