import { axiosInstance } from './axiosInstance';

export const needsApi = {
  create: async (data) => {
    const response = await axiosInstance.post('/needs', data);
    return response.data;
  },
  getMyNeeds: async () => {
    const response = await axiosInstance.get('/needs/me');
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/needs/${id}`);
    return response.data;
  },
  recalculateMatches: async (id) => {
    const response = await axiosInstance.post(`/needs/${id}/match`);
    return response.data;
  },
  cancel: async (id) => {
    const response = await axiosInstance.put(`/needs/${id}/cancel`);
    return response.data;
  },
  getCommunityFeed: async (params = {}) => {
    const response = await axiosInstance.get('/needs/community', { params });
    return response.data;
  },
};
