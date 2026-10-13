import api from './api';

export const feedbackService = {
  getByProject: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/feedbacks`);
    return res.data;
  },

  addFeedback: async (projectId, feedbackText) => {
    const res = await api.post(`/projects/${projectId}/feedbacks`, { feedbackText });
    return res.data;
  }
};
