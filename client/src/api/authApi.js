import { axiosInstance } from './axiosInstance';

export const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  refreshSession: async () => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/auth/me', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('/auth/me/password', passwordData);
    return response.data;
  },

  enableProviderCapability: async () => {
    const response = await axiosInstance.post('/providers/enable-capability');
    return response.data;
  },

  getAdminUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  getAdminStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },
};
