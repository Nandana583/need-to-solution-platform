import { axiosInstance } from './axiosInstance';

export const providersApi = {
  enableCapability: async () => {
    const response = await axiosInstance.post('/providers/enable-capability');
    return response.data;
  },
  getMyProfile: async () => {
    const response = await axiosInstance.get('/providers/profile/me');
    return response.data;
  },
  updateMyProfile: async (data) => {
    const response = await axiosInstance.put('/providers/profile/me', data);
    return response.data;
  },
  getPublicProviders: async (params = {}) => {
    const response = await axiosInstance.get('/providers/public', { params });
    return response.data;
  },
  getProviderById: async (id) => {
    const response = await axiosInstance.get(`/providers/public/${id}`);
    return response.data;
  },
  createService: async (data) => {
    const response = await axiosInstance.post('/providers/services', data);
    return response.data;
  },
  getMyServices: async () => {
    const response = await axiosInstance.get('/providers/services/me');
    return response.data;
  },
  updateService: async (id, data) => {
    const response = await axiosInstance.put(`/providers/services/${id}`, data);
    return response.data;
  },
  deleteService: async (id) => {
    const response = await axiosInstance.delete(`/providers/services/${id}`);
    return response.data;
  },
};
