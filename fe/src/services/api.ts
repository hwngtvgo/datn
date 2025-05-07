import axios from 'axios';
import { API_URL } from '../config/constants';
import authService from './authService';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Xử lý lỗi 401 Unauthorized - token hết hạn
      if (error.response.status === 401) {
        authService.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 