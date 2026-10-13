import api from './api';

export const projectService = {
  // Paginated and searchable projects list
  getAll: async (params = {}) => {
    const res = await api.get('/projects', { params });
    return res.data;
  },

  // Single project details
  getById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  // Authenticated user's associated projects (Student submissions or Guide assigned)
  getMyProjects: async () => {
    const res = await api.get('/projects/my-projects');
    return res.data;
  },

  // Create new project proposal (Supports JSON or FormData with PDF synopsis)
  create: async (projectData, file = null) => {
    if (file) {
      const formData = new FormData();
      formData.append('project', new Blob([JSON.stringify(projectData)], { type: 'application/json' }));
      formData.append('file', file);
      const res = await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } else {
      const res = await api.post('/projects', projectData);
      return res.data;
    }
  },

  // Update project details
  update: async (id, projectData) => {
    const res = await api.put(`/projects/${id}`, projectData);
    return res.data;
  },

  // Change project status (Guide / Admin)
  updateStatus: async (id, status) => {
    const res = await api.patch(`/projects/${id}/status`, { status });
    return res.data;
  },

  // Allocate faculty guide (Admin)
  assignGuide: async (id, guideId) => {
    const res = await api.patch(`/projects/${id}/assign-guide`, { guideId });
    return res.data;
  },

  // Upload or replace project synopsis document
  uploadDocument: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/projects/${id}/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Delete project (Admin or Owner)
  delete: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  }
};
