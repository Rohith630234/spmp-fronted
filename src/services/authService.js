import api from './api';

export const authService = {
  // Login
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  // Register
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  // Current User Profile
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Health check
  checkHealth: async () => {
    const res = await api.get('/auth/health');
    return res.data;
  }
};
