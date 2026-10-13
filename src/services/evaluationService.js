import api from './api';

export const evaluationService = {
  submitEvaluation: async (projectId, evalData) => {
    const res = await api.post(`/projects/${projectId}/evaluations`, evalData);
    return res.data;
  },

  getByProject: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/evaluations`);
    return res.data;
  },

  getScorecard: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/scorecard`);
    return res.data;
  }
};
