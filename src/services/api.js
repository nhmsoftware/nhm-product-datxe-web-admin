import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to add the bearer token
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('admin_token');
    
    // Magic Bypass cho môi trường test local
    if (!token) {
        token = '16|2p8ugha3DjJQnawavrBIXvDYqQzy3ynknIW79YQF45623d18';
        localStorage.setItem('admin_token', token);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
