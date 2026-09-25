import { axiosInstance } from './axiosInstance';

export const resourcesApi = {
  create: async (data) => {
    const response = await axiosInstance.post('/resources', data);
    return response.data;
  },
  getPublic: async (params = {}) => {
    const response = await axiosInstance.get('/resources/public', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/resources/public/${id}`);
    return response.data;
  },
  getMyResources: async () => {
    const response = await axiosInstance.get('/resources/me');
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/resources/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/resources/${id}`);
    return response.data;
  },
};
