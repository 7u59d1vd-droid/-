import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User authentication APIs
export const authAPI = {
  register: (username, email, password) =>
    api.post('/users/register', { username, email, password }),
  
  login: (username, password) =>
    api.post('/users/login', { username, password }),
  
  getCurrentUser: (token) =>
    api.get('/users/me', { params: { token } }),
};

// Monitoring points APIs
export const pointsAPI = {
  getAllPoints: () =>
    api.get('/points/'),
  
  getPointData: (pointId, limit = 50) =>
    api.get(`/points/${pointId}`, { params: { limit } }),
  
  createPoint: (pointData) =>
    api.post('/points/', pointData),
  
  addData: (pointId, data) =>
    api.post(`/points/${pointId}/data`, data),
};

export default api;
