import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_KEY || 'http://localhost:8000/';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle errors, especially 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const removeSession = useAuthStore.getState().removeSession;
        removeSession();
        // Redirect to login if not already there
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
