import { axiosInstance } from './axiosInstance';

export const sharesApi = {
  create: async (data) => {
    const response = await axiosInstance.post('/shares', data);
    return response.data;
  },
  getSent: async () => {
    const response = await axiosInstance.get('/shares/sent');
    return response.data;
  },
  getIncoming: async () => {
    const response = await axiosInstance.get('/shares/incoming');
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/shares/${id}`);
    return response.data;
  },
  accept: async (id) => {
    const response = await axiosInstance.put(`/shares/${id}/accept`);
    return response.data;
  },
  reject: async (id, reason) => {
    const response = await axiosInstance.put(`/shares/${id}/reject`, { reason });
    return response.data;
  },
  complete: async (id) => {
    const response = await axiosInstance.put(`/shares/${id}/complete`);
    return response.data;
  },
};
