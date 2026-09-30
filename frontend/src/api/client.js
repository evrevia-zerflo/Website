import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Add interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      try {
        const { state } = JSON.parse(authStorageStr);
        if (state && state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error("Failed to parse auth token", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network Error: Please check your connection.');
    } else if (error.response.status >= 500) {
      toast.error('Server error. Our team has been notified.');
    }
    return Promise.reject(error);
  }
);

export default api;
