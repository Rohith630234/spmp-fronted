import api from './api';

export const userService = {
  getGuides: async () => {
    const res = await api.get('/users/guides');
    return res.data;
  },

  getStudents: async () => {
    const res = await api.get('/users/students');
    return res.data;
  }
};
