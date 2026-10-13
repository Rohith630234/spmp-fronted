import api from './api';

export const milestoneService = {
  getByProject: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/milestones`);
    return res.data;
  },

  create: async (projectId, data) => {
    const res = await api.post(`/projects/${projectId}/milestones`, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/milestones/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/milestones/${id}/status`, { status });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/milestones/${id}`);
    return res.data;
  }
};
