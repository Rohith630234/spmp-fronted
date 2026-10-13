import api from './api';

export const domainService = {
  getAll: async (onlyActive = false) => {
    const res = await api.get('/domains', { params: { onlyActive } });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/domains/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/domains', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/domains/${id}`, data);
    return res.data;
  },

  toggleStatus: async (id) => {
    const res = await api.patch(`/domains/${id}/toggle`);
    return res.data;
  }
};
