import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Add interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network Error: Please check your connection.');
    } else if (error.response.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-role');
      window.location.href = '/login';
    } else if (error.response.status >= 500) {
      toast.error('Server error. Our team has been notified.');
    }
    return Promise.reject(error);
  }
);

export default api;
