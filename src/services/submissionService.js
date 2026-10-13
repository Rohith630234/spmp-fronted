import api from './api';

export const submissionService = {
  submitFile: async (milestoneId, file, comments = '') => {
    const formData = new FormData();
    formData.append('milestoneId', milestoneId);
    formData.append('file', file);
    if (comments) formData.append('comments', comments);

    const res = await api.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getByMilestone: async (milestoneId) => {
    const res = await api.get(`/milestones/${milestoneId}/submissions`);
    return res.data;
  },

  getByProject: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/submissions`);
    return res.data;
  },

  reviewSubmission: async (id, status) => {
    const res = await api.patch(`/submissions/${id}/review`, { status });
    return res.data;
  }
};
