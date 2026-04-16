import axios from 'axios';

const api = axios.create({
  baseURL: 'http://web-production-f7410.up.railway.app/api/',
});

// Add token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expired, try to refresh automatically
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken
        });
        localStorage.setItem('token', res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;