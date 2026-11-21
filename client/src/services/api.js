import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT Bearer token into all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences)
};

export const sessionAPI = {
  getSessions: () => api.get('/sessions'),
  createSession: (title, category) => api.post('/sessions', { title, category }),
  getSessionMessages: (sessionId) => api.get(`/sessions/${sessionId}`),
  updateSession: (sessionId, title) => api.put(`/sessions/${sessionId}`, { title }),
  deleteSession: (sessionId) => api.delete(`/sessions/${sessionId}`)
};

export const chatAPI = {
  sendMessage: (sessionId, prompt, category) => api.post('/chat/message', { sessionId, prompt, category }),
  rateMessage: (messageId, score, feedback) => api.post(`/chat/rate/${messageId}`, { score, feedback })
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics')
};

export default api;
