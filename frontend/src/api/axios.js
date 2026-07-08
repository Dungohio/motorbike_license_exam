import axios from 'axios';

// Instance dùng chung cho toàn app. baseURL '/api' được Vite proxy sang backend.
const api = axios.create({
  baseURL: '/api',
});

// Tự động gắn token vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
